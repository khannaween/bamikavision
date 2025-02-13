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

      // Professional email configuration for Gmail
      const transporter = nodemailer.createTransport({
        service: "gmail",
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
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Message:</strong></p>
          <p>${data.message}</p>
        `
      });

      res.json(message);
    } catch (error) {
      res.status(400).json({ error: "Invalid form data" });
    }
  });

  return httpServer;
}