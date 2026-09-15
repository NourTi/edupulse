import type { Express } from "express";
import fs from "fs";
import path from "path";
import { ENV } from "./env";

export function registerStorageProxy(app: Express) {
  const handler = async (req: any, res: any) => {
    const key = (req.params as Record<string, string>)[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }

    // Check local fallback files first
    const possiblePaths = [
      path.join(process.cwd(), "client", "public", key),
      path.join(process.cwd(), "docs", "edupulse-profile", "main.pdf"),
      path.join(process.cwd(), "client", "public", "edupulse-platform-profile.pdf"),
    ];

    if (key.includes("main_8a3b9e44") || key.endsWith(".pdf")) {
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader("Content-Disposition", 'inline; filename="EduPulse_Platform_Profile_Nour_Mohammed_Abdessmed.pdf"');
          return fs.createReadStream(p).pipe(res);
        }
      }
    }

    // Direct local public file check
    const clientPublicPath = path.join(process.cwd(), "client", "public", key);
    if (fs.existsSync(clientPublicPath)) {
      return res.sendFile(clientPublicPath);
    }

    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      // If requested file is any PDF or profile request, fallback to the profile PDF
      const fallbackPdf = path.join(process.cwd(), "docs", "edupulse-profile", "main.pdf");
      if (fs.existsSync(fallbackPdf)) {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", 'inline; filename="EduPulse_Platform_Profile_Nour_Mohammed_Abdessmed.pdf"');
        return fs.createReadStream(fallbackPdf).pipe(res);
      }
      res.status(500).send("Storage proxy not configured");
      return;
    }

    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/",
      );
      forgeUrl.searchParams.set("path", key);

      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` },
      });

      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }

      const { url } = (await forgeResp.json()) as { url: string };
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }

      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  };

  app.get("/storage/*", handler);
  app.get("/edupulse-storage/*", handler);
  app.get("/manus-storage/*", handler);
}
