import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage.js";
import { User as SelectUser } from "@shared/schema.js";
import { log } from "./vite.js";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is not set!");
  }

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: app.get("env") === "production",
      sameSite: app.get("env") === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      path: '/',
      domain: app.get("env") === "production" ? ".bamikavision.com" : undefined
    },
    store: storage.sessionStore,
    name: 'bamika.sid'
  };

  log('Initializing session middleware...', 'auth');
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        log(`Attempting authentication for user: ${username}`, 'auth');
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          log(`Authentication failed for user: ${username}`, 'auth');
          return done(null, false);
        } else {
          log(`Authentication successful for user: ${username}`, 'auth');
          return done(null, user);
        }
      } catch (error) {
        console.error("Authentication error:", error);
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    log(`Serializing user: ${user.id}`, 'auth');
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      log(`Deserializing user: ${id}`, 'auth');
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      console.error(`Error deserializing user ${id}:`, error);
      done(error, null);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      log(`Registration attempt for username: ${req.body.username}`, 'auth');
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        log(`Registration failed - username already exists: ${req.body.username}`, 'auth');
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      log(`User registered successfully: ${user.username}`, 'auth');
      req.login(user, (err) => {
        if (err) {
          log(`Login error after registration: ${err.message}`, 'auth');
          return next(err);
        }
        res.status(201).json(user);
      });
    } catch (error) {
      console.error("Registration error:", error);
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    log(`Login attempt for username: ${req.body.username}`, 'auth');
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        log(`Login error: ${err.message}`, 'auth');
        return next(err);
      }
      if (!user) {
        log(`Login failed for username: ${req.body.username}`, 'auth');
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      req.login(user, (err) => {
        if (err) {
          log(`Session creation error: ${err.message}`, 'auth');
          return next(err);
        }
        log(`Login successful for user: ${user.username}`, 'auth');
        res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    const username = req.user?.username;
    log(`Logout attempt for user: ${username}`, 'auth');
    req.logout((err) => {
      if (err) {
        log(`Logout error for user ${username}: ${err.message}`, 'auth');
        return next(err);
      }
      log(`Logout successful for user: ${username}`, 'auth');
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      log('Unauthenticated user session check', 'auth');
      return res.sendStatus(401);
    }
    log(`Session check successful for user: ${req.user.username}`, 'auth');
    res.json(req.user);
  });

  return {
    requireAuth: (req: Request, res: Response, next: NextFunction) => {
      if (!req.isAuthenticated()) {
        log(`Unauthorized access attempt to ${req.path}`, 'auth');
        return res.status(401).json({ message: "Not authenticated" });
      }
      log(`Authorized access to ${req.path} by user: ${req.user.username}`, 'auth');
      next();
    }
  };
}