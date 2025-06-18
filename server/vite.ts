import express, { type Express } from "express";
import { log } from "./index";

export async function setupVite(app: Express, server: any) {
  // In development, we'll use Vite dev server
  // In production on Vercel, we'll serve static files
  if (process.env.NODE_ENV === "development") {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (error) {
      log("Vite setup failed:", error);
    }
  }
}

export function serveStatic(app: Express) {
  // Serve static files from the built frontend
  app.use(express.static("dist/public"));
  
  // For SPA routing, serve index.html for all non-API routes
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile("index.html", { root: "dist/public" });
  });
}
