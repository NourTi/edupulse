import "dotenv/config";
import express, { type RequestHandler } from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { runStartupMigration, shouldRunStartupMigration } from "./startup";
import { checkDatabaseHealth, checkMigrationHealth, databaseErrorCode } from "../db";
import { setPasswordSessionCookie } from "../auth/session";

export function databaseSetupErrorPayload() {
  return { error: "Database setup failed. Check the Render service logs.", code: "DATABASE_SETUP_FAILED" as const };
}

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  app.set("trust proxy", 1);
  const server = createServer(app);
  let startupMigrationError: unknown = null;
  const startupMigration = runStartupMigration().then(
    () => true,
    error => {
      startupMigrationError = error;
      const message = error instanceof Error ? error.message.slice(0, 600) : "unknown error";
      console.error("[Database] Startup migration failed:", JSON.stringify({ code: databaseErrorCode(error), message }));
      return false;
    }
  );
  const migrationGate: RequestHandler = async (req, res, next) => {
    if (!shouldRunStartupMigration()) return next();
    if (await startupMigration) return next();
    // Degraded mode: permission errors (e.g. sys DB) should not block public reads.
    // Public knowledge queries degrade to platform/conversation/enrollment + Wikipedia,
    // while authenticated writes still need the full schema.
    const code = databaseErrorCode(startupMigrationError);
    const isPermissionFailure = /denied|access|permission/i.test(code) || (startupMigrationError instanceof Error && /system `sys` database/i.test(startupMigrationError.message));
    const path = req.path || req.url || "";
    const isPublicRead = path.includes("askPublic") || path.includes("health") || req.method === "GET";
    if (isPermissionFailure && isPublicRead) {
      console.warn(`[Database] Allowing degraded public read despite migration failure (${code}). Authenticated writes remain blocked until DATABASE_URL is corrected.`);
      return next();
    }
    res.status(503).json(databaseSetupErrorPayload());
  };
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);

  // Direct Document & Research Paper Proxy Route (Scribd & Open Access Papers)
  app.get("/api/academic/file-proxy", async (req, res) => {
    const { handleFileProxy } = await import("../knowledge/documentDownloader");
    await handleFileProxy(req, res);
  });
  app.get("/api/health/database", async (_req, res) => {
    const health = await checkDatabaseHealth();
    res.status(health.reachable ? 200 : 503).json({ service: "database", ...health });
  });
  app.get("/api/health/migrations", async (_req, res) => {
    const health = await checkMigrationHealth();
    const ready = health.reachable && health.migrationsTable === "present";
    res.status(ready ? 200 : 503).json({ service: "migrations", ...health });
  });
  app.get("/api/health/venice", async (_req, res) => {
    const { veniceHealth } = await import("../ai/venice");
    const health = veniceHealth();
    // Never leak the API key — only host/model/configured flags.
    res.status(200).json({ service: "venice", configured: health.configured, model: health.model, baseHost: health.baseHost });
  });
  if (process.env.OAUTH_SERVER_URL?.trim()) {
    const { registerOAuthRoutes } = await import("./oauth");
    registerOAuthRoutes(app);
  } else {
    console.log("[Auth] Password sessions enabled; legacy OAuth routes disabled.");
  }
  app.use("/api/auth", migrationGate);
  app.use("/api/trpc", migrationGate);
  const { registerGoogleRoutes } = await import("../auth/google");
  registerGoogleRoutes(app);
  console.log(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim() ? "[Auth] Google sign-in enabled." : "[Auth] Google sign-in route registered; provider variables are missing.");

  app.get("/api/auth/providers", (_req, res) => {
    res.json({
      google: Boolean(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim()),
      baseUrl: (process.env.APP_BASE_URL || "").trim(),
    });
  });

  // Direct study assessment endpoints: Quiz & Flashcards
  app.post("/api/study/quiz", async (req, res) => {
    try {
      const { text, count, language } = req.body || {};
      if (!text || typeof text !== "string" || !text.trim()) {
        return res.status(400).json({ error: "Text field is required." });
      }
      const { generateQuizFromStudyText } = await import("../ai/studyGenerator");
      const result = await generateQuizFromStudyText(text, { count, language });
      return res.status(200).json(result);
    } catch (err) {
      console.error("[StudyAPI] Quiz generation failed:", err);
      return res.status(500).json({ error: "Failed to generate quiz questions." });
    }
  });

  app.post("/api/study/flashcards", async (req, res) => {
    try {
      const { text, count, language } = req.body || {};
      if (!text || typeof text !== "string" || !text.trim()) {
        return res.status(400).json({ error: "Text field is required." });
      }
      const { generateFlashcardsFromStudyText } = await import("../ai/studyGenerator");
      const result = await generateFlashcardsFromStudyText(text, { count, language });
      return res.status(200).json(result);
    } catch (err) {
      console.error("[StudyAPI] Flashcard generation failed:", err);
      return res.status(500).json({ error: "Failed to generate flashcards." });
    }
  });

  // Mount RBAC, StudentProfile, Evaluation, Venice AI, and Workspace API groups
  const { apiGroupsRouter } = await import("../routes/apiGroups");
  app.use("/api", apiGroupsRouter);

  // Mount Teacher Content Generators, Content Library, and Curriculum Memory
  const { teacherGeneratorsRouter } = await import("../routes/teacherGeneratorsRouter");
  app.use("/api/teacher-generators", teacherGeneratorsRouter);

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Catch-all 404 for unhandled API requests (must always return JSON, never HTML)
  app.all("/api/*", (_req, res) => {
    res.status(404).json({ error: "API endpoint not found", code: "NOT_FOUND" });
  });

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // In this environment, nginx listens on 8080 and proxies traffic to 3000.
  // We must bind to port 3000 (never attempt to bind to 8080 which causes EADDRINUSE).
  const port = 3000;
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}/`);
  });
}

startServer().catch(console.error);
