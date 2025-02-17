import session from "express-session";
import createMemoryStore from "memorystore";
import type { InsertUser, User, Service, InsertService, CompanyInfo, InsertCompanyInfo } from "@shared/schema.js";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  sessionStore: session.Store;

  // User methods
  getUser(id: number): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | null>;
  createUser(user: InsertUser): Promise<User>;

  // Service methods
  getServices(): Promise<Service[]>;
  getService(id: number): Promise<Service | null>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service | null>;
  deleteService(id: number): Promise<boolean>;

  // Company Info methods
  getCompanyInfo(): Promise<CompanyInfo | null>;
  updateCompanyInfo(info: InsertCompanyInfo): Promise<CompanyInfo>;
}

export class MemStorage implements IStorage {
  sessionStore: session.Store;
  private users: User[] = [];
  private services: Service[] = [];
  private companyInfo: CompanyInfo | null = null;
  private nextUserId = 1;
  private nextServiceId = 1;
  private nextCompanyInfoId = 1;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
      ttl: 86400000, // 24 hours
      noDisposeOnSet: true,
      dispose: (sid: string) => {
        console.log(`Session ${sid} has expired`);
      }
    });
  }

  // User methods
  async getUser(id: number): Promise<User | null> {
    return this.users.find(u => u.id === id) || null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return this.users.find(u => u.username === username) || null;
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: this.nextUserId++,
      createdAt: new Date(),
      ...user,
    };
    this.users.push(newUser);
    return newUser;
  }

  // Service methods
  async getServices(): Promise<Service[]> {
    return this.services;
  }

  async getService(id: number): Promise<Service | null> {
    return this.services.find(s => s.id === id) || null;
  }

  async createService(service: InsertService): Promise<Service> {
    const newService: Service = {
      id: this.nextServiceId++,
      ...service,
    };
    this.services.push(newService);
    return newService;
  }

  async updateService(id: number, service: Partial<InsertService>): Promise<Service | null> {
    const index = this.services.findIndex(s => s.id === id);
    if (index === -1) return null;

    this.services[index] = {
      ...this.services[index],
      ...service,
    };
    return this.services[index];
  }

  async deleteService(id: number): Promise<boolean> {
    const index = this.services.findIndex(s => s.id === id);
    if (index === -1) return false;

    this.services.splice(index, 1);
    return true;
  }

  // Company Info methods
  async getCompanyInfo(): Promise<CompanyInfo | null> {
    return this.companyInfo;
  }

  async updateCompanyInfo(info: InsertCompanyInfo): Promise<CompanyInfo> {
    if (!this.companyInfo) {
      this.companyInfo = {
        id: this.nextCompanyInfoId++,
        ...info,
      };
    } else {
      this.companyInfo = {
        ...this.companyInfo,
        ...info,
      };
    }
    return this.companyInfo;
  }
}

export const storage = new MemStorage();