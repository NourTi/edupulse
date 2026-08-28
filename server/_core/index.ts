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
import { checkDatabaseHealth, checkMigrationHealth } from "../db";
import { exchangeDescopeSession } from "../auth/descope";
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
  const startupMigration = runStartupMigration().then(
    () => true,
    error => {
      console.error("[Database] Startup migration failed:", error instanceof Error ? error.message : "unknown error");
      return false;
    }
  );
  const migrationGate: RequestHandler = async (_req, res, next) => {
    if (!shouldRunStartupMigration()) return next();
    if (await startupMigration) return next();
    res.status(503).json(databaseSetupErrorPayload());
  };
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  app.get("/api/health/database", async (_req, res) => {
    const health = await checkDatabaseHealth();
    res.status(health.reachable ? 200 : 503).json({ service: "database", ...health });
  });
  app.get("/api/health/migrations", async (_req, res) => {
    const health = await checkMigrationHealth();
    const ready = health.reachable && health.migrationsTable === "present";
    res.status(ready ? 200 : 503).json({ service: "migrations", ...health });
  });
  app.post("/api/auth/descope/session", async (req, res) => {
    const authorization = req.headers.authorization;
    const sessionToken = typeof authorization === "string" && authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
    if (!sessionToken) return res.status(401).json({ error: "Missing Descope session." });
    try {
      const result = await exchangeDescopeSession(sessionToken, req);
      setPasswordSessionCookie(res, req, result.rawSessionToken);
      return res.status(200).json({ user: { id: result.user.id, name: result.user.name, email: result.user.email } });
    } catch (error) {
      console.warn("[Auth] Descope session exchange rejected.", error instanceof Error ? error.message : "unknown error");
      return res.status(401).json({ error: "Descope authentication could not be completed." });
    }
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
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
