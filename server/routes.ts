import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, requireAuth, requireRole } from "./auth";
import multer from "multer";
import fs from "fs";
import { z } from "zod";
import {
  insertUserSchema,
  insertMaterialSchema,
  insertConversationSchema,
  insertMessageSchema,
  insertMindMapSchema,
  insertQuizSchema,
  insertQuizAttemptSchema
} from "@shared/schema";
import { createOpenRouterClient, OPENROUTER_MODELS } from "../lib/openrouter";

// Configure multer for file uploads
// Use /tmp for Vercel serverless environment, uploads/ for local development
const uploadDir = process.env.VERCEL ? '/tmp' : 'uploads/';
const upload = multer({ 
  dest: uploadDir,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Setup authentication (handles /api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/api/users/profile", requireAuth, async (req, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User ID missing' });
      }
      const user = await storage.getUser(req.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });

  app.put("/api/users/profile", requireAuth, async (req, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User ID missing' });
      }
      const updates = z.object({
        language: z.string().optional(),
        plan: z.string().optional()
      }).parse(req.body);
      
      const user = await storage.updateUser(req.userId, updates);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Update failed' });
    }
  });

  // Materials routes
  app.get("/api/materials", requireAuth, async (req, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User ID missing' });
      }
      const materials = await storage.getMaterialsByUser(req.userId);
      res.json({ materials });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch materials' });
    }
  });

  app.post("/api/materials/upload", requireAuth, upload.single('file'), async (req, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User ID missing' });
      }
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { originalname, mimetype, size, path } = req.file;
      
      // Extract content based on file type
      let content = "";
      let type = "file";
      
      if (mimetype.startsWith('text/')) {
        content = fs.readFileSync(path, 'utf8');
        type = "text";
      } else if (mimetype === 'application/pdf') {
        // TODO: Implement PDF text extraction
        type = "pdf";
      } else if (mimetype.startsWith('image/')) {
        // Use OpenRouter Vision for image analysis
        const base64Image = fs.readFileSync(path, 'base64');
        const openrouterClient = createOpenRouterClient();
        const visionResponse = await openrouterClient.chat({
          model: OPENROUTER_MODELS.VISION,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze this image and extract any text, equations, diagrams, or educational content. Describe what you see in detail."
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimetype};base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: 2048
        });
        content = visionResponse.choices[0].message.content || "";
        type = "image";
      }

      const materialData = {
        filename: originalname,
        type,
        content,
        metadata: { size, mimetype },
        userId: req.userId
      };

      const material = await storage.createMaterial(materialData);
      
      // Clean up uploaded file
      fs.unlinkSync(path);
      
      res.json({ material });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Upload failed' });
    }
  });

  app.post("/api/materials/youtube", requireAuth, async (req, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User ID missing' });
      }
      const { url } = z.object({ url: z.string().url() }).parse(req.body);
      
      // Extract video ID from YouTube URL
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
      if (!videoId) {
        return res.status(400).json({ error: 'Invalid YouTube URL' });
      }

      // TODO: Implement YouTube transcript extraction
      const content = `YouTube video: ${url}\nVideo ID: ${videoId}\nTranscript extraction would be implemented here.`;
      
      const materialData = {
        filename: `YouTube Video - ${videoId}`,
        type: "youtube",
        content,
        metadata: { url, videoId },
        userId: req.userId
      };

      const material = await storage.createMaterial(materialData);
      res.json({ material });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'YouTube processing failed' });
    }
  });

  app.delete("/api/materials/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const material = await storage.getMaterial(id);
      
      if (!material || material.userId !== req.userId) {
        return res.status(404).json({ error: 'Material not found' });
      }

      await storage.deleteMaterial(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete material' });
    }
  });

  // Chat/Conversation routes
  app.get("/api/conversations", requireAuth, async (req, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User ID missing' });
      }
      const conversations = await storage.getConversationsByUser(req.userId);
      res.json({ conversations });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  });

  app.post("/api/conversations", requireAuth, async (req, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User ID missing' });
      }
      const { title } = z.object({ title: z.string().optional() }).parse(req.body);
      
      const conversationData = {
        title: title || "New Conversation",
        userId: req.userId
      };

      const conversation = await storage.createConversation(conversationData);
      res.json({ conversation });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to create conversation' });
    }
  });

  app.get("/api/conversations/:id/messages", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const conversation = await storage.getConversation(id);
      
      if (!conversation || conversation.userId !== req.userId) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      const messages = await storage.getMessagesByConversation(id);
      res.json({ messages });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  app.post("/api/conversations/:id/messages", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { content, materialIds } = z.object({
        content: z.string(),
        materialIds: z.array(z.string()).optional()
      }).parse(req.body);

      const conversation = await storage.getConversation(id);
      if (!conversation || conversation.userId !== req.userId) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      // Create user message
      const userMessage = await storage.createMessage({
        conversationId: id,
        role: "user",
        content,
        materialIds: materialIds || null
      });

      // Get context from materials if provided
      let context = "";
      if (materialIds && materialIds.length > 0) {
        const materials = await Promise.all(
          materialIds.map(id => storage.getMaterial(id))
        );
        context = materials
          .filter(Boolean)
          .map(m => `${m!.filename}: ${m!.content}`)
          .join("\n\n");
      }

      // Generate AI response
      const systemPrompt = `You are EduVoice AI, a helpful educational assistant. You explain concepts clearly and can create visual mind maps. Always respond in a educational and supportive manner.
      
      ${context ? `Context from uploaded materials:\n${context}\n\n` : ''}
      
      Respond with helpful educational content. If the user asks about creating a mind map or visual representation, mention that you can help visualize the concepts on the canvas.`;

      const openrouterClient = createOpenRouterClient();
      const aiResponse = await openrouterClient.chat({
        model: OPENROUTER_MODELS.CHAT,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content }
        ],
        max_tokens: 2048
      });

      const assistantMessage = await storage.createMessage({
        conversationId: id,
        role: "assistant",
        content: aiResponse.choices[0].message.content || "I apologize, but I couldn't generate a response.",
        materialIds: materialIds || null
      });

      res.json({ 
        userMessage, 
        assistantMessage 
      });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to send message' });
    }
  });

  // Voice transcription - Note: Whisper API not available via OpenRouter
  // Using browser Web Speech API instead (handled client-side)
  app.post("/api/voice/transcribe", requireAuth, upload.single('audio'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No audio file provided' });
      }

      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      // Return message that transcription should be handled client-side
      res.status(501).json({ 
        error: 'Server-side transcription not available. Please use browser Web Speech API for voice input.'
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Transcription failed' });
    }
  });

  // Text-to-speech - Note: TTS not available via OpenRouter
  // Using browser Web Speech API instead (handled client-side)
  app.post("/api/voice/speak", requireAuth, async (req, res) => {
    try {
      res.status(501).json({
        error: 'Server-side TTS not available. Please use browser Web Speech API for voice output.'
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Text-to-speech failed' });
    }
  });

  // Mind map routes
  app.get("/api/mindmaps", requireAuth, async (req, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User ID missing' });
      }
      const mindMaps = await storage.getMindMapsByUser(req.userId);
      res.json({ mindMaps });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch mind maps' });
    }
  });

  app.post("/api/mindmaps", requireAuth, async (req, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User ID missing' });
      }
      const mindMapData = insertMindMapSchema.extend({
        userId: z.string()
      }).parse({ ...req.body, userId: req.userId });

      const mindMap = await storage.createMindMap(mindMapData);
      res.json({ mindMap });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to create mind map' });
    }
  });

  app.post("/api/mindmaps/generate", requireAuth, async (req, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User ID missing' });
      }
      const { materialIds, topic } = z.object({
        materialIds: z.array(z.string()),
        topic: z.string()
      }).parse(req.body);

      // Get content from materials
      const materials = await Promise.all(
        materialIds.map(id => storage.getMaterial(id))
      );
      
      const content = materials
        .filter(Boolean)
        .map(m => `${m!.filename}: ${m!.content}`)
        .join("\n\n");

      // Generate mind map structure using AI
      const prompt = `Create a mind map structure for the topic "${topic}" based on the following content. Return a JSON object with nodes and connections suitable for visualization.

      Content:
      ${content}

      Return the response in this JSON format:
      {
        "nodes": [
          {
            "id": "unique_id",
            "label": "Node Label",
            "x": number,
            "y": number,
            "type": "central|branch|leaf",
            "color": "hex_color"
          }
        ],
        "connections": [
          {
            "from": "node_id",
            "to": "node_id",
            "label": "optional_connection_label"
          }
        ]
      }`;

      const openrouterClient = createOpenRouterClient();
      const aiResponse = await openrouterClient.chat({
        model: OPENROUTER_MODELS.REASONING,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 2048
      });

      const mindMapStructure = JSON.parse(aiResponse.choices[0].message.content || "{}");

      const mindMap = await storage.createMindMap({
        title: `${topic} - Mind Map`,
        nodes: mindMapStructure,
        materialIds: materialIds,
        userId: req.userId
      });

      res.json({ mindMap });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to generate mind map' });
    }
  });

  app.put("/api/mindmaps/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = z.object({
        title: z.string().optional(),
        nodes: z.any().optional()
      }).parse(req.body);

      const mindMap = await storage.getMindMap(id);
      if (!mindMap || mindMap.userId !== req.userId) {
        return res.status(404).json({ error: 'Mind map not found' });
      }

      const updatedMindMap = await storage.updateMindMap(id, updates);
      res.json({ mindMap: updatedMindMap });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to update mind map' });
    }
  });

  // Quiz routes
  app.get("/api/quizzes", requireAuth, async (req, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User ID missing' });
      }
      const quizzes = await storage.getQuizzesByUser(req.userId);
      res.json({ quizzes });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch quizzes' });
    }
  });

  app.post("/api/quizzes/generate", requireAuth, async (req, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User ID missing' });
      }
      const { materialIds, topic, difficulty, numQuestions } = z.object({
        materialIds: z.array(z.string()),
        topic: z.string(),
        difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
        numQuestions: z.number().min(1).max(50).default(10)
      }).parse(req.body);

      // Get content from materials
      const materials = await Promise.all(
        materialIds.map(id => storage.getMaterial(id))
      );
      
      const content = materials
        .filter(Boolean)
        .map(m => `${m!.filename}: ${m!.content}`)
        .join("\n\n");

      const prompt = `Generate ${numQuestions} ${difficulty} level quiz questions about "${topic}" based on the provided content. 

      Content:
      ${content}

      Return a JSON object with this structure:
      {
        "questions": [
          {
            "id": "unique_id",
            "type": "multiple_choice",
            "question": "Question text",
            "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
            "correctAnswer": "A",
            "explanation": "Detailed explanation of why this is correct"
          }
        ]
      }

      Make sure questions are educational, accurate, and test understanding of key concepts.`;

      const openrouterClient = createOpenRouterClient();
      const aiResponse = await openrouterClient.chat({
        model: OPENROUTER_MODELS.REASONING,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 2048
      });

      const quizData = JSON.parse(aiResponse.choices[0].message.content || "{}");

      const quiz = await storage.createQuiz({
        title: `${topic} - Quiz`,
        questions: quizData.questions || [],
        materialIds: materialIds,
        difficulty,
        userId: req.userId
      });

      res.json({ quiz });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to generate quiz' });
    }
  });

  app.post("/api/quizzes/:id/attempt", requireAuth, async (req, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'User ID missing' });
      }
      const { id } = req.params;
      const { answers } = z.object({
        answers: z.record(z.string()) // questionId -> selectedAnswer
      }).parse(req.body);

      const quiz = await storage.getQuiz(id);
      if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
      }

      // Calculate score
      const questions = quiz.questions as any[];
      let correct = 0;
      const results = questions.map(q => {
        const userAnswer = answers[q.id];
        const isCorrect = userAnswer === q.correctAnswer;
        if (isCorrect) correct++;
        
        return {
          questionId: q.id,
          userAnswer,
          correctAnswer: q.correctAnswer,
          isCorrect,
          explanation: q.explanation
        };
      });

      const attempt = await storage.createQuizAttempt({
        quizId: id,
        answers: results,
        score: correct,
        totalQuestions: questions.length,
        userId: req.userId
      });

      res.json({ attempt, results });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to submit quiz attempt' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
