import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const apiKeys = pgTable("api_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull(),
  accountName: text("account_name"),
  permissions: jsonb("permissions").$type<string[]>(),
  isValid: boolean("is_valid").default(false),
  lastValidated: timestamp("last_validated"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const accounts = pgTable("accounts", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  world: text("world"),
  created: timestamp("created"),
  access: jsonb("access").$type<string[]>(),
  commander: boolean("commander").default(false),
  fractalLevel: integer("fractal_level"),
  dailyAp: integer("daily_ap"),
  monthlyAp: integer("monthly_ap"),
  wvwRank: integer("wvw_rank"),
  pvpRank: integer("pvp_rank"),
  achievementPoints: integer("achievement_points"),
  apiKeyId: varchar("api_key_id").references(() => apiKeys.id),
});

export const characters = pgTable("characters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  race: text("race"),
  gender: text("gender"),
  profession: text("profession"),
  level: integer("level"),
  created: timestamp("created"),
  age: integer("age"),
  deaths: integer("deaths"),
  accountId: varchar("account_id").references(() => accounts.id),
});

export const wallet = pgTable("wallet", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  currencyId: integer("currency_id").notNull(),
  value: integer("value").notNull(),
  accountId: varchar("account_id").references(() => accounts.id),
});

export const bankItems = pgTable("bank_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itemId: integer("item_id"),
  count: integer("count"),
  slot: integer("slot"),
  accountId: varchar("account_id").references(() => accounts.id),
});

export const materials = pgTable("materials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itemId: integer("item_id").notNull(),
  category: integer("category"),
  count: integer("count").notNull(),
  accountId: varchar("account_id").references(() => accounts.id),
});

export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(),
  description: text("description").notNull(),
  timestamp: timestamp("timestamp").default(sql`now()`),
  reward: text("reward"),
  accountId: varchar("account_id").references(() => accounts.id),
});

// Insert schemas
export const insertApiKeySchema = createInsertSchema(apiKeys).pick({
  key: true,
});

export const insertAccountSchema = createInsertSchema(accounts).omit({
  id: true,
  apiKeyId: true,
});

export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true,
  accountId: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  timestamp: true,
  accountId: true,
});

// Types
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Account = typeof accounts.$inferSelect;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type Character = typeof characters.$inferSelect;
export type Wallet = typeof wallet.$inferSelect;
export type BankItem = typeof bankItems.$inferSelect;
export type Material = typeof materials.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

// Combined types for frontend
export type AccountWithDetails = Account & {
  characters: Character[];
  wallet: Wallet[];
  bankItems: BankItem[];
  materials: Material[];
  activities: Activity[];
};
