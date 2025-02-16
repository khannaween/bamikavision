import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  sessionStore: session.Store;

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
}

export const storage = new MemStorage();