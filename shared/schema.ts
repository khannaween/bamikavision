import { z } from "zod";
import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// User table schema without admin functionality
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users, {
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
}).omit({ 
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Services schema
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(), // Lucide icon name
  features: jsonb("features").notNull().$type<string[]>(), // Array of feature points
});

export const insertServiceSchema = createInsertSchema(services, {
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  icon: z.string().min(1, "Icon is required"),
  features: z.array(z.string()).min(1, "At least one feature is required"),
}).omit({
  id: true,
});

export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;

// Company info schema for About section
export const companyInfo = pgTable("company_info", {
  id: serial("id").primaryKey(),
  mission: text("mission").notNull(),
  vision: text("vision").notNull(),
  about: text("about").notNull(),
  teamMembers: jsonb("team_members").notNull().$type<{
    name: string;
    role: string;
    bio: string;
    image?: string;
  }[]>(),
});

export const insertCompanyInfoSchema = createInsertSchema(companyInfo, {
  mission: z.string().min(1, "Mission statement is required"),
  vision: z.string().min(1, "Vision statement is required"),
  about: z.string().min(1, "About description is required"),
  teamMembers: z.array(z.object({
    name: z.string().min(1, "Team member name is required"),
    role: z.string().min(1, "Team member role is required"),
    bio: z.string().min(1, "Team member bio is required"),
    image: z.string().optional(),
  })).min(1, "At least one team member is required"),
}).omit({
  id: true,
});

export type InsertCompanyInfo = z.infer<typeof insertCompanyInfoSchema>;
export type CompanyInfo = typeof companyInfo.$inferSelect;

// Enhanced contact form schema
export const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  type: z.enum(["general", "partnership", "investor", "support"], {
    required_error: "Please select a contact type",
  }),
});

export type ContactFormData = z.infer<typeof contactSchema>;