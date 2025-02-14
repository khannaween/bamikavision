import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add proper CORS headers for Vercel deployment
app.use((req, res, next) => {
  // Allow requests from Vercel domains and local development
  const vercelUrl = process.env.VERCEL_URL;
  const allowedDomains = [
    'http://localhost:5000',
    'http://localhost:3000',
    ...(vercelUrl ? [`https://${vercelUrl}`] : []),
  ];

  const origin = req.headers.origin;
  if (origin && allowedDomains.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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
  const server = registerRoutes(app);

  // Enhanced error handling middleware for Vercel deployment
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log error details
    console.error(`[Error] ${status} - ${message}`);
    if (err.stack) console.error(err.stack);

    // Handle specific Vercel error cases
    switch (status) {
      case 502:
        res.status(502).json({ 
          message: "Bad Gateway - Service temporarily unavailable",
          code: "FUNCTION_INVOCATION_FAILED"
        });
        break;
      case 504:
        res.status(504).json({ 
          message: "Gateway Timeout - Service took too long to respond",
          code: "FUNCTION_INVOCATION_TIMEOUT"
        });
        break;
      default:
        res.status(status).json({ message, code: err.code });
    }
  });

  // Handle production vs development environments
  if (process.env.NODE_ENV === "production") {
    // In production, serve static files directly
    serveStatic(app);
  } else {
    // In development, use Vite's dev server
    await setupVite(app, server);
  }

  // Use PORT from environment variable for Vercel or default to 5000
  const PORT = parseInt(process.env.PORT || "5000", 10);
  server.listen(PORT, "0.0.0.0", () => {
    log(`serving on port ${PORT}`);
  });
})();