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
      
      // In a real app, set up proper email credentials
      const transporter = nodemailer.createTransport({
        host: "smtp.example.com",
        port: 587,
        secure: false,
        auth: {
          user: "user@example.com",
          pass: "password"
        }
      });

      await transporter.sendMail({
        from: '"Bamika Vision" <contact@bamikavision.com>',
        to: "contact@bamikavision.com",
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
