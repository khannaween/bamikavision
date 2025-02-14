import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertContactSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth } from "./auth";

// Store connected admin clients
const adminClients = new Set<WebSocket>();

// Broadcast to all connected admin clients
function broadcastToAdmins(message: any) {
  adminClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

export function registerRoutes(app: Express): Server {
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

  // Contact form submission with enhanced error handling and logging
  app.post("/api/contact", async (req, res) => {
    try {
      console.log("[Contact Form] Request headers:", req.headers);
      console.log("[Contact Form] Request body:", req.body);

      // Validate the request body
      const data = insertContactSchema.parse(req.body);
      console.log("[Contact Form] Validation passed:", data);

      // Store the message locally
      const message = await storage.createContactMessage(data);
      console.log("[Contact Form] Message stored:", message);

      // Broadcast the new message to all connected admin clients
      broadcastToAdmins({
        type: 'new_message',
        message
      });

      // Return success response
      res.json({ 
        success: true,
        message: "Message received successfully",
        data: message 
      });
    } catch (error) {
      console.error("[Contact Form] Error:", error);

      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          success: false,
          error: "Validation error", 
          details: validationError.message 
        });
      }

      res.status(500).json({ 
        success: false,
        error: "An unexpected error occurred",
        message: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error'
      });
    }
  });

  // Get all contact messages (admin endpoint)
  app.get("/api/contact/messages", requireAdmin, async (_req, res) => {
    try {
      const messages = await storage.getAllContactMessages();
      res.json(messages);
    } catch (error) {
      console.error("[Contact Messages] Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  return httpServer;
}