import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { setupAuth } from "./auth.js";
import { contactSchema } from "@shared/schema.js";
import { MailService } from '@sendgrid/mail';

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);
  const { requireAuth } = setupAuth(app);

  // Services endpoints
  app.get("/api/services", async (_req: Request, res: Response) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  app.get("/api/services/:id", async (req: Request, res: Response) => {
    try {
      const service = await storage.getService(parseInt(req.params.id));
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      console.error("Error fetching service:", error);
      res.status(500).json({ error: "Failed to fetch service" });
    }
  });

  app.post("/api/services", requireAuth, async (req: Request, res: Response) => {
    try {
      const service = await storage.createService(req.body);
      res.status(201).json(service);
    } catch (error) {
      console.error("Error creating service:", error);
      res.status(500).json({ error: "Failed to create service" });
    }
  });

  app.put("/api/services/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const service = await storage.updateService(parseInt(req.params.id), req.body);
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      console.error("Error updating service:", error);
      res.status(500).json({ error: "Failed to update service" });
    }
  });

  app.delete("/api/services/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const success = await storage.deleteService(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ error: "Service not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting service:", error);
      res.status(500).json({ error: "Failed to delete service" });
    }
  });

  // Company Info endpoints
  app.get("/api/company-info", async (_req: Request, res: Response) => {
    try {
      const info = await storage.getCompanyInfo();
      if (!info) {
        return res.status(404).json({ error: "Company info not found" });
      }
      res.json(info);
    } catch (error) {
      console.error("Error fetching company info:", error);
      res.status(500).json({ error: "Failed to fetch company info" });
    }
  });

  app.put("/api/company-info", requireAuth, async (req: Request, res: Response) => {
    try {
      const info = await storage.updateCompanyInfo(req.body);
      res.json(info);
    } catch (error) {
      console.error("Error updating company info:", error);
      res.status(500).json({ error: "Failed to update company info" });
    }
  });

  // Contact form endpoint with SendGrid
  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      const contactData = contactSchema.parse(req.body);

      if (!process.env.SENDGRID_API_KEY) {
        throw new Error("SENDGRID_API_KEY environment variable is not set");
      }

      const mailService = new MailService();
      mailService.setApiKey(process.env.SENDGRID_API_KEY);

      // Send email using SendGrid
      await mailService.send({
        to: process.env.CONTACT_EMAIL || 'contact@bamikavision.com',
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@bamikavision.com',
        subject: `[${contactData.type}] ${contactData.subject}`,
        text: `
Name: ${contactData.name}
Email: ${contactData.email}
Type: ${contactData.type}
Subject: ${contactData.subject}

Message:
${contactData.message}
        `,
        html: `
<h2>New Contact Form Submission</h2>
<p><strong>Name:</strong> ${contactData.name}</p>
<p><strong>Email:</strong> ${contactData.email}</p>
<p><strong>Type:</strong> ${contactData.type}</p>
<p><strong>Subject:</strong> ${contactData.subject}</p>
<p><strong>Message:</strong></p>
<p>${contactData.message.replace(/\n/g, '<br>')}</p>
        `,
      });

      res.status(200).json({ message: "Message sent successfully" });
    } catch (error) {
      console.error("Error processing contact form:", error);
      res.status(400).json({ error: "Failed to process contact form" });
    }
  });

  return httpServer;
}