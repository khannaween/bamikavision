import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertContactSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  // Contact form submission
  app.post("/api/contact", async (req, res) => {
    try {
      // Validate the request body
      const data = insertContactSchema.parse(req.body);

      // Store the message locally
      const message = await storage.createContactMessage(data);

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

  return httpServer;
}