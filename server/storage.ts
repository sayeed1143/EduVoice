import { 
  type User, 
  type InsertUser,
  type Material,
  type InsertMaterial,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type MindMap,
  type InsertMindMap,
  type Quiz,
  type InsertQuiz,
  type QuizAttempt,
  type InsertQuizAttempt,
  users,
  materials,
  conversations,
  messages,
  mindMaps,
  quizzes,
  quizAttempts
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, asc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.Store;
  
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Material methods
  getMaterial(id: string): Promise<Material | undefined>;
  getMaterialsByUser(userId: string): Promise<Material[]>;
  createMaterial(material: InsertMaterial & { userId: string }): Promise<Material>;
  deleteMaterial(id: string): Promise<boolean>;

  // Conversation methods
  getConversation(id: string): Promise<Conversation | undefined>;
  getConversationsByUser(userId: string): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation & { userId: string }): Promise<Conversation>;
  deleteConversation(id: string): Promise<boolean>;

  // Message methods
  getMessage(id: string): Promise<Message | undefined>;
  getMessagesByConversation(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // MindMap methods
  getMindMap(id: string): Promise<MindMap | undefined>;
  getMindMapsByUser(userId: string): Promise<MindMap[]>;
  createMindMap(mindMap: InsertMindMap & { userId: string }): Promise<MindMap>;
  updateMindMap(id: string, updates: Partial<MindMap>): Promise<MindMap | undefined>;
  deleteMindMap(id: string): Promise<boolean>;

  // Quiz methods
  getQuiz(id: string): Promise<Quiz | undefined>;
  getQuizzesByUser(userId: string): Promise<Quiz[]>;
  createQuiz(quiz: InsertQuiz & { userId: string }): Promise<Quiz>;
  deleteQuiz(id: string): Promise<boolean>;

  // QuizAttempt methods
  getQuizAttempt(id: string): Promise<QuizAttempt | undefined>;
  getQuizAttemptsByUser(userId: string): Promise<QuizAttempt[]>;
  createQuizAttempt(attempt: InsertQuizAttempt & { userId: string }): Promise<QuizAttempt>;
}

export class MemStorage implements IStorage {
  public sessionStore: session.Store;
  private users: Map<string, User>;
  private materials: Map<string, Material>;
  private conversations: Map<string, Conversation>;
  private messages: Map<string, Message>;
  private mindMaps: Map<string, MindMap>;
  private quizzes: Map<string, Quiz>;
  private quizAttempts: Map<string, QuizAttempt>;

  constructor() {
    const createMemoryStore = require("memorystore");
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({ checkPeriod: 86400000 });
    this.users = new Map();
    this.materials = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.mindMaps = new Map();
    this.quizzes = new Map();
    this.quizAttempts = new Map();
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      role: insertUser.role || "student",
      plan: insertUser.plan || "free",
      language: insertUser.language || "en",
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Material methods
  async getMaterial(id: string): Promise<Material | undefined> {
    return this.materials.get(id);
  }

  async getMaterialsByUser(userId: string): Promise<Material[]> {
    return Array.from(this.materials.values()).filter(material => material.userId === userId);
  }

  async createMaterial(material: InsertMaterial & { userId: string }): Promise<Material> {
    const id = randomUUID();
    const newMaterial: Material = { 
      ...material,
      id,
      content: material.content || null,
      metadata: material.metadata || null,
      uploadedAt: new Date() 
    };
    this.materials.set(id, newMaterial);
    return newMaterial;
  }

  async deleteMaterial(id: string): Promise<boolean> {
    return this.materials.delete(id);
  }

  // Conversation methods
  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async getConversationsByUser(userId: string): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).filter(conv => conv.userId === userId);
  }

  async createConversation(conversation: InsertConversation & { userId: string }): Promise<Conversation> {
    const id = randomUUID();
    const newConversation: Conversation = { 
      ...conversation,
      title: conversation.title || null,
      id,
      createdAt: new Date() 
    };
    this.conversations.set(id, newConversation);
    return newConversation;
  }

  async deleteConversation(id: string): Promise<boolean> {
    // Also delete related messages
    const messages = Array.from(this.messages.entries())
      .filter(([_, message]) => message.conversationId === id);
    messages.forEach(([messageId]) => this.messages.delete(messageId));
    
    return this.conversations.delete(id);
  }

  // Message methods
  async getMessage(id: string): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.conversationId === conversationId)
      .sort((a, b) => a.timestamp!.getTime() - b.timestamp!.getTime());
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const newMessage: Message = { 
      ...message,
      audioUrl: message.audioUrl || null,
      materialIds: message.materialIds || null,
      id,
      timestamp: new Date() 
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  // MindMap methods
  async getMindMap(id: string): Promise<MindMap | undefined> {
    return this.mindMaps.get(id);
  }

  async getMindMapsByUser(userId: string): Promise<MindMap[]> {
    return Array.from(this.mindMaps.values()).filter(mindMap => mindMap.userId === userId);
  }

  async createMindMap(mindMap: InsertMindMap & { userId: string }): Promise<MindMap> {
    const id = randomUUID();
    const newMindMap: MindMap = { 
      ...mindMap,
      materialIds: mindMap.materialIds || null,
      id,
      createdAt: new Date(),
      updatedAt: new Date() 
    };
    this.mindMaps.set(id, newMindMap);
    return newMindMap;
  }

  async updateMindMap(id: string, updates: Partial<MindMap>): Promise<MindMap | undefined> {
    const mindMap = this.mindMaps.get(id);
    if (!mindMap) return undefined;
    
    const updatedMindMap = { ...mindMap, ...updates, updatedAt: new Date() };
    this.mindMaps.set(id, updatedMindMap);
    return updatedMindMap;
  }

  async deleteMindMap(id: string): Promise<boolean> {
    return this.mindMaps.delete(id);
  }

  // Quiz methods
  async getQuiz(id: string): Promise<Quiz | undefined> {
    return this.quizzes.get(id);
  }

  async getQuizzesByUser(userId: string): Promise<Quiz[]> {
    return Array.from(this.quizzes.values()).filter(quiz => quiz.userId === userId);
  }

  async createQuiz(quiz: InsertQuiz & { userId: string }): Promise<Quiz> {
    const id = randomUUID();
    const newQuiz: Quiz = { 
      ...quiz,
      materialIds: quiz.materialIds || null,
      id,
      difficulty: quiz.difficulty || "medium",
      createdAt: new Date() 
    };
    this.quizzes.set(id, newQuiz);
    return newQuiz;
  }

  async deleteQuiz(id: string): Promise<boolean> {
    return this.quizzes.delete(id);
  }

  // QuizAttempt methods
  async getQuizAttempt(id: string): Promise<QuizAttempt | undefined> {
    return this.quizAttempts.get(id);
  }

  async getQuizAttemptsByUser(userId: string): Promise<QuizAttempt[]> {
    return Array.from(this.quizAttempts.values()).filter(attempt => attempt.userId === userId);
  }

  async createQuizAttempt(attempt: InsertQuizAttempt & { userId: string }): Promise<QuizAttempt> {
    const id = randomUUID();
    const newAttempt: QuizAttempt = { 
      ...attempt, 
      id,
      completedAt: new Date() 
    };
    this.quizAttempts.set(id, newAttempt);
    return newAttempt;
  }
}

export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;
  private readonly db: NonNullable<typeof db>;
  private readonly pool: NonNullable<typeof pool>;

  constructor() {
    if (!db || !pool) {
      throw new Error("DATABASE_URL must be set to use DatabaseStorage.");
    }

    this.db = db;
    this.pool = pool;

    // Only use PostgreSQL session store for non-Vercel environments
    // On Vercel, we use JWT tokens instead of sessions
    if (process.env.VERCEL || process.env.USE_JWT_AUTH === 'true') {
      const createMemoryStore = require("memorystore");
      const MemoryStore = createMemoryStore(session);
      this.sessionStore = new MemoryStore({ checkPeriod: 86400000 });
    } else {
      this.sessionStore = new PostgresSessionStore({ pool: this.pool, createTableIfMissing: true });
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    const db = this.db;
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const db = this.db;
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const db = this.db;
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const db = this.db;
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const db = this.db;
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  async getMaterial(id: string): Promise<Material | undefined> {
    const db = this.db;
    const result = await db.select().from(materials).where(eq(materials.id, id));
    return result[0];
  }

  async getMaterialsByUser(userId: string): Promise<Material[]> {
    const db = this.db;
    return await db.select().from(materials).where(eq(materials.userId, userId));
  }

  async createMaterial(material: InsertMaterial & { userId: string }): Promise<Material> {
    const db = this.db;
    const result = await db.insert(materials).values(material).returning();
    return result[0];
  }

  async deleteMaterial(id: string): Promise<boolean> {
    const db = this.db;
    const result = await db.delete(materials).where(eq(materials.id, id)).returning();
    return result.length > 0;
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const db = this.db;
    const result = await db.select().from(conversations).where(eq(conversations.id, id));
    return result[0];
  }

  async getConversationsByUser(userId: string): Promise<Conversation[]> {
    const db = this.db;
    return await db.select().from(conversations).where(eq(conversations.userId, userId));
  }

  async createConversation(conversation: InsertConversation & { userId: string }): Promise<Conversation> {
    const db = this.db;
    const result = await db.insert(conversations).values(conversation).returning();
    return result[0];
  }

  async deleteConversation(id: string): Promise<boolean> {
    const db = this.db;
    await db.delete(messages).where(eq(messages.conversationId, id));
    const result = await db.delete(conversations).where(eq(conversations.id, id)).returning();
    return result.length > 0;
  }

  async getMessage(id: string): Promise<Message | undefined> {
    const db = this.db;
    const result = await db.select().from(messages).where(eq(messages.id, id));
    return result[0];
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    const db = this.db;
    return await db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(asc(messages.timestamp));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const db = this.db;
    const result = await db.insert(messages).values(message).returning();
    return result[0];
  }

  async getMindMap(id: string): Promise<MindMap | undefined> {
    const db = this.db;
    const result = await db.select().from(mindMaps).where(eq(mindMaps.id, id));
    return result[0];
  }

  async getMindMapsByUser(userId: string): Promise<MindMap[]> {
    const db = this.db;
    return await db.select().from(mindMaps).where(eq(mindMaps.userId, userId));
  }

  async createMindMap(mindMap: InsertMindMap & { userId: string }): Promise<MindMap> {
    const db = this.db;
    const result = await db.insert(mindMaps).values(mindMap).returning();
    return result[0];
  }

  async updateMindMap(id: string, updates: Partial<MindMap>): Promise<MindMap | undefined> {
    const db = this.db;
    const result = await db.update(mindMaps).set({ ...updates, updatedAt: new Date() }).where(eq(mindMaps.id, id)).returning();
    return result[0];
  }

  async deleteMindMap(id: string): Promise<boolean> {
    const db = this.db;
    const result = await db.delete(mindMaps).where(eq(mindMaps.id, id)).returning();
    return result.length > 0;
  }

  async getQuiz(id: string): Promise<Quiz | undefined> {
    const db = this.db;
    const result = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return result[0];
  }

  async getQuizzesByUser(userId: string): Promise<Quiz[]> {
    const db = this.db;
    return await db.select().from(quizzes).where(eq(quizzes.userId, userId));
  }

  async createQuiz(quiz: InsertQuiz & { userId: string }): Promise<Quiz> {
    const db = this.db;
    const result = await db.insert(quizzes).values(quiz).returning();
    return result[0];
  }

  async deleteQuiz(id: string): Promise<boolean> {
    const db = this.db;
    const result = await db.delete(quizzes).where(eq(quizzes.id, id)).returning();
    return result.length > 0;
  }

  async getQuizAttempt(id: string): Promise<QuizAttempt | undefined> {
    const db = this.db;
    const result = await db.select().from(quizAttempts).where(eq(quizAttempts.id, id));
    return result[0];
  }

  async getQuizAttemptsByUser(userId: string): Promise<QuizAttempt[]> {
    const db = this.db;
    return await db.select().from(quizAttempts).where(eq(quizAttempts.userId, userId));
  }

  async createQuizAttempt(attempt: InsertQuizAttempt & { userId: string }): Promise<QuizAttempt> {
    const db = this.db;
    const result = await db.insert(quizAttempts).values(attempt).returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();
