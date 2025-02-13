import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertContactSchema } from "@shared/schema";
import nodemailer from "nodemailer";

export function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  // Contact form submission
  app.post("/api/contact", async (req, res) => {
    try {
      const data = insertContactSchema.parse(req.body);
      const message = await storage.createContactMessage(data);

      // Configure with your actual email credentials
      const transporter = nodemailer.createTransport({
        host: "smtp.example.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER || "your-email@example.com", 
          pass: process.env.EMAIL_PASSWORD || "your-password" 
        }
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || "Bamika Vision <your-email@example.com>", 
        to: process.env.EMAIL_TO || "your-email@example.com", 
        subject: "New Contact Form Submission",
        text: `Name: ${data.name}\nEmail: ${data.email}\nMessage: ${data.message}`,
      });

      res.json(message);
    } catch (error) {
      res.status(400).json({ error: "Invalid form data" });
    }
  });

  return httpServer;
}