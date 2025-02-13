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

      const transporter = nodemailer.createTransport({
        host: "smtp.example.com", // Will be updated based on email provider
        port: 587,
        secure: false,
        auth: {
          user: "contact@bamikavision.com",
          pass: process.env.EMAIL_PASSWORD
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