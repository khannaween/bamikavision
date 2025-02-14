import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage.js";
import { insertContactSchema } from "@shared/schema.js";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth } from "./auth.js";

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
  console.log('Registering routes...');
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

  // Contact form submission endpoint with enhanced logging
  app.post("/api/contact", async (req, res) => {
    console.log('Contact form request received:', {
      method: req.method,
      headers: req.headers,
      body: req.body,
      url: req.url
    });

    try {
      // Validate request body exists
      if (!req.body || typeof req.body !== 'object') {
        console.error('[Contact Form] Invalid request body:', req.body);
        return res.status(400).json({
          success: false,
          message: 'Invalid request body'
        });
      }

      // Validate the request body against schema
      const validatedData = insertContactSchema.parse(req.body);
      console.log("[Contact Form] Validation passed:", validatedData);

      // Store the message
      const message = await storage.createContactMessage(validatedData);
      console.log("[Contact Form] Message stored:", message);

      // Notify admin clients via WebSocket
      try {
        broadcastToAdmins({
          type: 'new_message',
          message
        });
      } catch (broadcastError) {
        console.error('[Contact Form] Broadcast error:', broadcastError);
        // Don't fail the request if broadcasting fails
      }

      // Return success response
      res.status(201).json({
        success: true,
        message: "Message received successfully",
        data: message
      });

    } catch (error) {
      console.error("[Contact Form] Error processing request:", {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });

      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({
          success: false,
          message: "Validation error",
          details: validationError.message
        });
      }

      return res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' 
          ? 'An unexpected error occurred' 
          : error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Admin-only endpoint to get all messages
  app.get("/api/contact/messages", requireAdmin, async (_req, res) => {
    try {
      const messages = await storage.getAllContactMessages();
      res.json(messages);
    } catch (error) {
      console.error("[Contact Messages] Error fetching messages:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch messages" 
      });
    }
  });

  return httpServer;
}