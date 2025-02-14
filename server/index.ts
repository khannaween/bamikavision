import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS configuration for Vercel deployment
app.use((req, res, next) => {
  const vercelUrl = process.env.VERCEL_URL;
  const allowedDomains = [
    'http://localhost:5000',
    'http://localhost:3000',
    ...(vercelUrl ? [
      `https://${vercelUrl}`,
      `https://*.vercel.app`
    ] : []),
  ];

  const origin = req.headers.origin;
  if (origin) {
    // In production, allow Vercel domains
    if (process.env.NODE_ENV === 'production') {
      if (origin.endsWith('.vercel.app') || origin.includes(vercelUrl || '')) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }
    } else if (allowedDomains.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Add detailed request logging
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
      if (res.statusCode >= 400) {
        console.error(`[Error] ${logLine}`);
      } else {
        console.log(`[API] ${logLine}`);
      }
    }
  });

  next();
});

(async () => {
  const server = registerRoutes(app);

  // Add enhanced error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log error details
    console.error(`[Error] ${status} - ${message}`);
    if (err.stack) console.error(err.stack);

    res.status(status).json({ 
      message: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : message,
      code: err.code
    });
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    await setupVite(app, server);
  }

  const PORT = parseInt(process.env.PORT || "5000", 10);
  server.listen(PORT, "0.0.0.0", () => {
    log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
})();