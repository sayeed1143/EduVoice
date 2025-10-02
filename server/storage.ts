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
  type InsertQuizAttempt
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
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
  private users: Map<string, User>;
  private materials: Map<string, Material>;
  private conversations: Map<string, Conversation>;
  private messages: Map<string, Message>;
  private mindMaps: Map<string, MindMap>;
  private quizzes: Map<string, Quiz>;
  private quizAttempts: Map<string, QuizAttempt>;

  constructor() {
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

export const storage = new MemStorage();
