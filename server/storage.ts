import { contactMessages, type ContactMessage, type InsertContact } from "@shared/schema";
import { users, type User, type InsertUser } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createContactMessage(message: InsertContact): Promise<ContactMessage>;
  getAllContactMessages(): Promise<ContactMessage[]>;
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contactMessages: Map<number, ContactMessage>;
  private currentUserId: number;
  private currentMessageId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.contactMessages = new Map();
    this.currentUserId = 1;
    this.currentMessageId = 1;

    // Configure session store with proper settings for production
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
      ttl: 86400000, // 24 hours
      noDisposeOnSet: true,
      dispose: (sid: string) => {
        console.log(`Session ${sid} has expired`);
      }
    });

    // Create an admin user if it doesn't exist
    this.createInitialAdminUser();
  }

  private async createInitialAdminUser() {
    const adminUsername = "bamika";
    const existingAdmin = await this.getUserByUsername(adminUsername);

    if (!existingAdmin) {
      const adminUser: InsertUser = {
        username: adminUsername,
        password: "8a20f9a2122b9ed172d073f7d4dba87270103da2", // Hashed password
        isAdmin: true
      };
      await this.createUser(adminUser);
      console.log("Admin user created successfully");
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      id,
      ...insertUser,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async createContactMessage(message: InsertContact): Promise<ContactMessage> {
    const id = this.currentMessageId++;
    const contactMessage: ContactMessage = { 
      id, 
      ...message, 
      createdAt: new Date() 
    };
    this.contactMessages.set(id, contactMessage);
    return contactMessage;
  }

  async getAllContactMessages(): Promise<ContactMessage[]> {
    return Array.from(this.contactMessages.values());
  }
}

export const storage = new MemStorage();