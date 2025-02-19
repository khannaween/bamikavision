import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { setupVite, log } from "./vite.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamically import routes to ensure proper ESM resolution
const { registerRoutes } = await import('./routes.js');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Trust proxy settings for Vercel
app.set('trust proxy', 1);

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  log(`${req.method} ${req.url}`, 'request');
  next();
});

// Enhanced CORS configuration with proper headers for mobile Safari
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:5000',
    'https://localhost:5000',
    'https://bamikavision.com',
    'https://www.bamikavision.com',
    'https://bamika-vision.vercel.app'
  ];

  const origin = req.headers.origin;
  if (origin && (process.env.NODE_ENV !== 'production' || allowedOrigins.includes(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    log(`CORS allowed for origin: ${origin}`, 'cors');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With, Cache-Control');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  if (req.method === 'OPTIONS') {
    log('Responding to CORS preflight request', 'cors');
    return res.status(200).end();
  }

  next();
});

(async () => {
  try {
    log('Starting server initialization...', 'startup');
    const server = registerRoutes(app);

    // Global error handler with enhanced logging
    app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
      const errorDetails = {
        message: err.message,
        stack: err.stack,
        status: err.status || err.statusCode || 500,
        path: req.path,
        method: req.method,
        query: req.query,
        body: req.body,
        headers: req.headers,
      };

      console.error('Server Error:', JSON.stringify(errorDetails, null, 2));

      res.status(errorDetails.status).json({
        success: false,
        message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
        code: err.code
      });
    });

    if (process.env.NODE_ENV === "production") {
      log('Setting up production static file serving...', 'startup');
      const publicDir = path.join(__dirname, '../public');

      // Serve static files with cache control
      app.use(express.static(publicDir, {
        maxAge: '1y',
        index: false // Don't automatically serve index.html
      }));

      // Handle all non-API routes by serving index.html
      app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api/')) {
          return next();
        }

        const indexPath = path.join(publicDir, 'index.html');
        if (require('fs').existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          log(`Error: index.html not found at ${indexPath}`, 'error');
          res.status(404).send('Not found');
        }
      });
    } else {
      log('Setting up Vite development middleware...', 'startup');
      await setupVite(app, server);
    }

    const PORT = parseInt(process.env.PORT || "5000", 10);
    server.listen(PORT, "0.0.0.0", () => {
      log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`, 'startup');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();