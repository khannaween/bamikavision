import { contactMessages, type ContactMessage, type InsertContact } from "@shared/schema";

export interface IStorage {
  createContactMessage(message: InsertContact): Promise<ContactMessage>;
  getAllContactMessages(): Promise<ContactMessage[]>;
}

export class MemStorage implements IStorage {
  private contactMessages: Map<number, ContactMessage>;
  private currentMessageId: number;

  constructor() {
    this.contactMessages = new Map();
    this.currentMessageId = 1;
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