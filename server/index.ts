import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { setupVite, serveStatic, log } from "./vite.js";

// Add debug logging for module resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting server initialization...', {
  currentDir: __dirname,
  nodeEnv: process.env.NODE_ENV,
  cwd: process.cwd(),
  files: path.join(__dirname, '*')
});

// Dynamically import routes to ensure proper ESM resolution
const { registerRoutes } = await import('./routes.js');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enhanced CORS configuration 
app.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    path: req.path,
    origin: req.headers.origin,
    host: req.headers.host,
    body: req.method === 'POST' ? req.body : undefined
  });

  // Allow all origins in development
  if (process.env.NODE_ENV !== 'production') {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  } else {
    // In production, check for Vercel domains
    const origin = req.headers.origin;
    if (origin) {
      if (origin.includes('vercel.app') || 
          origin.includes('.bamikavision.com') || 
          origin === 'https://bamikavision.com') {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }
    }
  }

  // Enhanced CORS headers
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    return res.status(200).end();
  }

  next();
});

// Request logging middleware with enhanced error tracking
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    console.log(`Response JSON for ${path}:`, bodyJson);
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
  try {
    console.log('Server initialization:', {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      moduleDir: __dirname,
      routes: await import('./routes.js').catch(e => ({ error: e.message }))
    });

    const server = registerRoutes(app);

    // Enhanced error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error('Server error:', {
        status: err.status || err.statusCode || 500,
        message: err.message,
        stack: err.stack,
        code: err.code,
        type: err.type,
        path: err.path
      });

      res.status(err.status || err.statusCode || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
        code: err.code
      });
    });

    if (process.env.NODE_ENV === "production") {
      console.log('Running in production mode, serving static files...');
      serveStatic(app);
    } else {
      console.log('Running in development mode, setting up Vite...');
      await setupVite(app, server);
    }

    const PORT = parseInt(process.env.PORT || "5000", 10);
    server.listen(PORT, "0.0.0.0", () => {
      log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  } catch (error) {
    console.error('Failed to start server:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    process.exit(1);
  }
})();