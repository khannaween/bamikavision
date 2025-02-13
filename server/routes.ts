import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertContactSchema } from "@shared/schema";
import nodemailer from "nodemailer";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  // Contact form submission
  app.post("/api/contact", async (req, res) => {
    try {
      // Validate the request body
      const data = insertContactSchema.parse(req.body);

      // Store the message
      const message = await storage.createContactMessage(data);

      // Check if email password is configured
      if (!process.env.EMAIL_PASSWORD) {
        throw new Error("Email configuration is missing");
      }

      // Professional email configuration for Gmail
      const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // Use STARTTLS
        auth: {
          user: "contact@bamikavision.com",
          pass: process.env.EMAIL_PASSWORD
        },
        tls: {
          rejectUnauthorized: false // For development purposes
        }
      });

      // Verify email configuration
      await transporter.verify().catch((err) => {
        console.error("Email verification failed:", err);
        throw new Error("Failed to connect to email service");
      });

      // Send email
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
      }).catch((err) => {
        console.error("Failed to send email:", err);
        throw new Error("Failed to send email: " + err.message);
      });

      res.json(message);
    } catch (error) {
      console.error("Contact form error:", error);

      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          error: "Validation error", 
          details: validationError.message 
        });
      }

      if (error instanceof Error) {
        return res.status(500).json({ 
          error: "Failed to send message",
          details: error.message
        });
      }

      res.status(500).json({ error: "An unexpected error occurred" });
    }
  });

  return httpServer;
}