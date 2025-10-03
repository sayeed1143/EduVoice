// OpenRouter API client for Vercel serverless functions
// Supports multiple specialized models for different tasks

export interface OpenRouterConfig {
  apiKey: string;
  baseURL?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: 'json_object' };
  stream?: boolean;
}

// Specialized models for different tasks
export const OPENROUTER_MODELS = {
  // Fast, cost-effective for general chat
  CHAT: 'anthropic/claude-3.5-sonnet',
  
  // Vision model for image analysis
  VISION: 'anthropic/claude-3.5-sonnet',
  
  // Complex reasoning for mind maps and quizzes
  REASONING: 'anthropic/claude-3.5-sonnet',
  
  // Fast model for quick responses
  FAST: 'openai/gpt-4o-mini',
  
  // Advanced reasoning
  ADVANCED: 'openai/o1-mini',
} as const;

export class OpenRouterClient {
  private apiKey: string;
  private baseURL: string;

  constructor(config: OpenRouterConfig) {
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL || 'https://openrouter.ai/api/v1';
  }

  async chat(request: ChatCompletionRequest): Promise<any> {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.VERCEL_URL || 'http://localhost:5000',
        'X-Title': 'EduVoice AI',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async streamChat(request: ChatCompletionRequest): Promise<Response> {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.VERCEL_URL || 'http://localhost:5000',
        'X-Title': 'EduVoice AI',
      },
      body: JSON.stringify({
        ...request,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    return response;
  }
}

// Helper function to create client from environment
export function createOpenRouterClient(): OpenRouterClient {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY environment variable is not set');
  }

  return new OpenRouterClient({ apiKey });
}
