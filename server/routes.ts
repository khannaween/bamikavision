import type { Express } from "express";
import { createServer, type Server } from "http";
import { contactSchema } from "@shared/schema.js";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import nodemailer from "nodemailer";

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);

  // Contact form submission endpoint
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = contactSchema.parse(req.body);

      // Send email using nodemailer
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'contact@bamikavision.com',
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: 'contact@bamikavision.com',
        to: 'info@bamikavision.com',
        subject: `New Contact Form Submission from ${validatedData.name}`,
        text: `Name: ${validatedData.name}\nEmail: ${validatedData.email}\nMessage: ${validatedData.message}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${validatedData.name}</p>
          <p><strong>Email:</strong> ${validatedData.email}</p>
          <p><strong>Message:</strong></p>
          <p>${validatedData.message}</p>
        `,
      });

      res.status(200).json({
        success: true,
        message: "Message sent successfully",
      });

    } catch (error) {
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

  return httpServer;
}