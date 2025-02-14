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

  // Contact form submission endpoint - made public and independent of session
  app.post("/api/contact", async (req, res) => {
    console.log('Contact form request received:', {
      method: req.method,
      headers: req.headers,
      body: req.body,
      url: req.url
    });

    try {
      if (!req.body || typeof req.body !== 'object') {
        console.error('[Contact Form] Invalid request body:', req.body);
        return res.status(400).json({
          success: false,
          error: 'Invalid request body'
        });
      }

      // Validate the request body
      const data = insertContactSchema.parse(req.body);
      console.log("[Contact Form] Validation passed:", data);

      // Store the message
      const message = await storage.createContactMessage(data);
      console.log("[Contact Form] Message stored:", message);

      // Try to broadcast but don't fail if it doesn't work
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
      const response = {
        success: true,
        message: "Message received successfully",
        data: message
      };
      console.log('[Contact Form] Sending success response:', response);
      return res.status(200).json(response);

    } catch (error) {
      console.error("[Contact Form] Error processing request:", error);

      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        console.error('[Contact Form] Validation error:', validationError);
        return res.status(400).json({
          success: false,
          error: "Validation error",
          details: validationError.message
        });
      }

      // Log the full error details
      console.error('[Contact Form] Unexpected error:', {
        error: error,
        stack: error instanceof Error ? error.stack : undefined,
        message: error instanceof Error ? error.message : String(error)
      });

      return res.status(500).json({
        success: false,
        error: "An unexpected error occurred",
        message: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : String(error)) : 
          'Internal server error'
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
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  return httpServer;
}