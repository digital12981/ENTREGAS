import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Tabela de usuários para autenticação
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Tabela de candidatos (delivery partners)
export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: varchar("phone", { length: 20 }).notNull(),
  state: varchar("state", { length: 2 }).notNull(),
  city: text("city").notNull(),
  vehicleType: text("vehicle_type").notNull(),
  hasExperience: boolean("has_experience").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const candidatesRelations = relations(candidates, ({ one }) => ({
  state: one(states, {
    fields: [candidates.state],
    references: [states.code],
  }),
}));

// Tabela de estados brasileiros
export const states = pgTable("states", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 2 }).notNull().unique(),
  name: text("name").notNull(),
  hasVacancies: boolean("has_vacancies").default(false).notNull(),
  vacancyCount: integer("vacancy_count").default(0).notNull(),
});

export const statesRelations = relations(states, ({ many }) => ({
  candidates: many(candidates),
}));

// Tabela de benefícios
export const benefits = pgTable("benefits", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  iconName: text("icon_name").notNull(),
});

// Definição dos schemas de inserção
export const insertCandidateSchema = createInsertSchema(candidates).pick({
  name: true,
  email: true,
  phone: true,
  state: true,
  city: true,
  vehicleType: true,
  hasExperience: true,
});

export const insertStateSchema = createInsertSchema(states).pick({
  code: true,
  name: true,
  hasVacancies: true,
  vacancyCount: true,
});

export const insertBenefitSchema = createInsertSchema(benefits).pick({
  title: true,
  description: true,
  iconName: true,
});

// Definição dos tipos
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type Candidate = typeof candidates.$inferSelect;

export type InsertState = z.infer<typeof insertStateSchema>;
export type State = typeof states.$inferSelect;

export type InsertBenefit = z.infer<typeof insertBenefitSchema>;
export type Benefit = typeof benefits.$inferSelect;
