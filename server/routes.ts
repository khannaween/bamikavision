import type { Express } from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertContactSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth } from "./auth";
import passport from 'passport';

// Store connected admin clients
const adminClients = new Set<WebSocket>();

export function registerRoutes(app: Express) {
  const httpServer = createServer(app);
  const { requireAuth, requireAdmin } = setupAuth(app);

  // Setup WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('New WebSocket connection');
    adminClients.add(ws);

    ws.on('close', () => {
      adminClients.delete(ws);
    });
  });

  // Broadcast to all connected admin clients
  function broadcastToAdmins(message: any) {
    adminClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  // Authentication routes
  app.post("/api/login", (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      req.logIn(user, (err) => {
        if (err) return next(err);
        res.json({ message: "Logged in successfully", user });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  // Contact form submission
  app.post("/api/contact", async (req, res) => {
    try {
      console.log("Received contact form submission:", req.body);

      // Validate the request body
      const data = insertContactSchema.parse(req.body);

      // Store the message locally
      const message = await storage.createContactMessage(data);
      console.log("Stored message successfully:", message);

      // Broadcast the new message to all connected admin clients
      broadcastToAdmins({
        type: 'new_message',
        message
      });

      // Return success response
      res.json({ 
        message: "Message received successfully",
        data: message 
      });
    } catch (error) {
      console.error("Contact form error:", error);

      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          error: "Validation error", 
          details: validationError.message 
        });
      }

      res.status(500).json({ error: "An unexpected error occurred" });
    }
  });

  // Get all contact messages (admin endpoint)
  app.get("/api/contact/messages", requireAdmin, async (_req, res) => {
    try {
      const messages = await storage.getAllContactMessages();
      console.log("Fetching all messages:", messages);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Get current user
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.user);
  });

  return httpServer;
}