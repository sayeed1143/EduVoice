import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface User extends SelectUser {}
    interface Request {
      userId?: string;
    }
  }
}

const scryptAsync = promisify(scrypt);
const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production';
const USE_JWT_AUTH = process.env.VERCEL || process.env.USE_JWT_AUTH === 'true';

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch (error) {
    return null;
  }
}

export function setupAuth(app: Express) {
  // Only set up session-based auth for non-Vercel environments
  if (!USE_JWT_AUTH) {
    const sessionSettings: session.SessionOptions = {
      secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
      resave: false,
      saveUninitialized: false,
      store: storage.sessionStore,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      },
    };

    app.set("trust proxy", 1);
    app.use(session(sessionSettings));
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(
      new LocalStrategy(async (username, password, done) => {
        try {
          const user = await storage.getUserByUsername(username);
          if (!user || !(await comparePasswords(password, user.password))) {
            return done(null, false, { message: "Invalid credentials" });
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }),
    );

    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id: string, done) => {
      try {
        const user = await storage.getUser(id);
        done(null, user);
      } catch (error) {
        done(error);
      }
    });
  }

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(req.body.email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      const { password, ...userWithoutPassword } = user;

      if (USE_JWT_AUTH) {
        const token = generateToken(user.id);
        res.status(201).json({ ...userWithoutPassword, token });
      } else {
        req.login(user, (err) => {
          if (err) return next(err);
          res.status(201).json(userWithoutPassword);
        });
      }
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", async (req, res, next) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const { password: _, ...userWithoutPassword } = user;

      if (USE_JWT_AUTH) {
        const token = generateToken(user.id);
        res.status(200).json({ ...userWithoutPassword, token });
      } else {
        req.login(user, (err) => {
          if (err) return next(err);
          res.status(200).json(userWithoutPassword);
        });
      }
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/logout", (req, res, next) => {
    if (USE_JWT_AUTH) {
      res.sendStatus(200);
    } else {
      req.logout((err) => {
        if (err) return next(err);
        res.sendStatus(200);
      });
    }
  });

  app.get("/api/user", async (req, res) => {
    if (USE_JWT_AUTH) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.sendStatus(401);
      }

      const token = authHeader.substring(7);
      const payload = verifyToken(token);
      
      if (!payload) {
        return res.sendStatus(401);
      }

      const user = await storage.getUser(payload.userId);
      if (!user) {
        return res.sendStatus(401);
      }

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } else {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const { password, ...userWithoutPassword } = req.user!;
      res.json(userWithoutPassword);
    }
  });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (USE_JWT_AUTH) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    if (!payload) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    req.userId = payload.userId;
    next();
  } else {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    req.userId = req.user!.id;
    next();
  }
}

export function requireRole(role: "student" | "teacher") {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (USE_JWT_AUTH) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const token = authHeader.substring(7);
      const payload = verifyToken(token);
      
      if (!payload) {
        return res.status(401).json({ error: "Invalid or expired token" });
      }

      const user = await storage.getUser(payload.userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      if (user.role !== role) {
        return res.status(403).json({ error: `Access denied. ${role} role required.` });
      }

      req.userId = user.id;
      next();
    } else {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }
      if (req.user!.role !== role) {
        return res.status(403).json({ error: `Access denied. ${role} role required.` });
      }
      req.userId = req.user!.id;
      next();
    }
  };
}
