import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  plan: text("plan").notNull().default("free"), // free, student_pro, teacher_pro
  language: text("language").notNull().default("en"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const materials = pgTable("materials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  filename: text("filename").notNull(),
  type: text("type").notNull(), // pdf, image, video, youtube, text
  content: text("content"), // extracted text content
  metadata: jsonb("metadata"), // file size, duration, etc.
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").references(() => conversations.id).notNull(),
  role: text("role").notNull(), // user, assistant
  content: text("content").notNull(),
  audioUrl: text("audio_url"), // for voice messages
  materialIds: jsonb("material_ids"), // referenced materials
  timestamp: timestamp("timestamp").defaultNow(),
});

export const mindMaps = pgTable("mind_maps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  nodes: jsonb("nodes").notNull(), // canvas nodes and connections
  materialIds: jsonb("material_ids"), // source materials
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const quizzes = pgTable("quizzes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  questions: jsonb("questions").notNull(), // quiz questions and answers
  materialIds: jsonb("material_ids"), // source materials
  difficulty: text("difficulty").default("medium"), // easy, medium, hard
  createdAt: timestamp("created_at").defaultNow(),
});

export const quizAttempts = pgTable("quiz_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  quizId: varchar("quiz_id").references(() => quizzes.id).notNull(),
  answers: jsonb("answers").notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  language: true,
  plan: true,
});

export const insertMaterialSchema = createInsertSchema(materials).pick({
  filename: true,
  type: true,
  content: true,
  metadata: true,
});

export const insertConversationSchema = createInsertSchema(conversations).pick({
  title: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  conversationId: true,
  role: true,
  content: true,
  audioUrl: true,
  materialIds: true,
});

export const insertMindMapSchema = createInsertSchema(mindMaps).pick({
  title: true,
  nodes: true,
  materialIds: true,
});

export const insertQuizSchema = createInsertSchema(quizzes).pick({
  title: true,
  questions: true,
  materialIds: true,
  difficulty: true,
});

export const insertQuizAttemptSchema = createInsertSchema(quizAttempts).pick({
  quizId: true,
  answers: true,
  score: true,
  totalQuestions: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Material = typeof materials.$inferSelect;
export type InsertMaterial = z.infer<typeof insertMaterialSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type MindMap = typeof mindMaps.$inferSelect;
export type InsertMindMap = z.infer<typeof insertMindMapSchema>;
export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type InsertQuizAttempt = z.infer<typeof insertQuizAttemptSchema>;
