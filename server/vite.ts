import express, { type Express } from "express";

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

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
      log("Vite setup failed:", error as string);
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
