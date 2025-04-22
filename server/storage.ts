import { 
  users, type User, type InsertUser,
  candidates, type Candidate, type InsertCandidate,
  states, type State, type InsertState,
  benefits, type Benefit, type InsertBenefit
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Candidate operations
  getCandidate(id: number): Promise<Candidate | undefined>;
  getCandidateByEmail(email: string): Promise<Candidate | undefined>;
  createCandidate(candidate: InsertCandidate): Promise<Candidate>;
  getAllCandidates(): Promise<Candidate[]>;
  
  // State operations
  getState(code: string): Promise<State | undefined>;
  getAllStates(): Promise<State[]>;
  getStatesWithVacancies(): Promise<State[]>;
  createState(state: InsertState): Promise<State>;
  
  // Benefit operations
  getBenefit(id: number): Promise<Benefit | undefined>;
  getAllBenefits(): Promise<Benefit[]>;
  createBenefit(benefit: InsertBenefit): Promise<Benefit>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Candidate operations
  async getCandidate(id: number): Promise<Candidate | undefined> {
    const [candidate] = await db.select().from(candidates).where(eq(candidates.id, id));
    return candidate || undefined;
  }
  
  async getCandidateByEmail(email: string): Promise<Candidate | undefined> {
    const [candidate] = await db.select().from(candidates).where(eq(candidates.email, email));
    return candidate || undefined;
  }
  
  async createCandidate(insertCandidate: InsertCandidate): Promise<Candidate> {
    const [candidate] = await db
      .insert(candidates)
      .values(insertCandidate)
      .returning();
    return candidate;
  }
  
  async getAllCandidates(): Promise<Candidate[]> {
    return await db.select().from(candidates);
  }
  
  // State operations
  async getState(code: string): Promise<State | undefined> {
    const [state] = await db.select().from(states).where(eq(states.code, code));
    return state || undefined;
  }
  
  async getAllStates(): Promise<State[]> {
    return await db.select().from(states);
  }
  
  async getStatesWithVacancies(): Promise<State[]> {
    return await db.select().from(states).where(eq(states.hasVacancies, true));
  }
  
  async createState(insertState: InsertState): Promise<State> {
    const [state] = await db
      .insert(states)
      .values(insertState)
      .returning();
    return state;
  }
  
  // Benefit operations
  async getBenefit(id: number): Promise<Benefit | undefined> {
    const [benefit] = await db.select().from(benefits).where(eq(benefits.id, id));
    return benefit || undefined;
  }
  
  async getAllBenefits(): Promise<Benefit[]> {
    return await db.select().from(benefits);
  }
  
  async createBenefit(insertBenefit: InsertBenefit): Promise<Benefit> {
    const [benefit] = await db
      .insert(benefits)
      .values(insertBenefit)
      .returning();
    return benefit;
  }
}

export const storage = new DatabaseStorage();
