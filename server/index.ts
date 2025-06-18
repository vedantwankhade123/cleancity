import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

// Simple health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "CleanCity API is running" });
});

// Check if dist/public exists
const distPath = path.join(process.cwd(), "dist", "public");
const indexPath = path.join(distPath, "index.html");

app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }
  
  // Check if the dist directory exists
  if (!fs.existsSync(distPath)) {
    console.error(`Dist directory not found: ${distPath}`);
    return res.status(500).json({ 
      message: "Frontend not built. Please check the build process.",
      error: "DIST_DIR_NOT_FOUND"
    });
  }
  
  // Check if index.html exists
  if (!fs.existsSync(indexPath)) {
    console.error(`Index.html not found: ${indexPath}`);
    return res.status(500).json({ 
      message: "Frontend build incomplete. Please check the build process.",
      error: "INDEX_HTML_NOT_FOUND"
    });
  }
  
  next();
});

// Serve static files from the built frontend
app.use(express.static("dist/public"));

// For SPA routing, serve index.html for all non-API routes
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }
  
  try {
    res.sendFile("index.html", { root: "dist/public" });
  } catch (error) {
    console.error("Error serving index.html:", error);
    res.status(500).json({ 
      message: "Error serving frontend",
      error: "SERVE_ERROR"
    });
  }
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });
  console.error("Server error:", err);
});

// Export the app for Vercel
export default app;
