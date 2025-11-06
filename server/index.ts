import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import './env'; // Load environment variables

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Enable CORS for deployed frontend if configured
if (process.env.FRONTEND_ORIGIN) {
  const origins = process.env.FRONTEND_ORIGIN.split(",").map((s) => s.trim());
  app.use(
    cors({
      origin: origins,
      credentials: true,
    })
  );
}

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

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Prefer PORT env, fallback to 5000; if in use, try subsequent ports
  const preferredPort = Number(process.env.PORT || 5000);

  const tryListen = (portToTry: number, attemptsLeft: number) => {
    server.listen({
      port: portToTry,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${portToTry}`);
    }).on("error", (err: any) => {
      if (err && err.code === "EADDRINUSE" && attemptsLeft > 0) {
        const nextPort = portToTry + 1;
        log(`port ${portToTry} in use, trying ${nextPort}...`);
        tryListen(nextPort, attemptsLeft - 1);
      } else {
        throw err;
      }
    });
  };

  tryListen(preferredPort, 10);
})();
