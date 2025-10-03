# EduVoice AI - Next-Generation AI Learning Platform

A futuristic, voice-first educational platform with 3D interactive study flows, AI-powered content analysis, and personalized learning experiences.

## Features

- **🎤 Voice-First AI Tutor** - Speak your questions, get AI responses with natural voice
- **🧊 3D Visual Canvas** - Interactive 3D mind maps and study flow visualization
- **📝 Smart Test Generator** - AI creates personalized quizzes from your materials
- **🖼️ Multi-Modal Input** - Upload PDFs, images, handwritten notes, or YouTube links
- **🌐 Multi-Language Support** - Available in 8+ languages
- **📱 Mobile-Friendly** - Responsive design with touch controls for 3D interactions

## Tech Stack

### Frontend
- React 18 with TypeScript
- React Three Fiber for 3D visualization
- TailwindCSS for styling
- Vite for build tooling

### Backend
- Express.js
- OpenRouter API for multi-model AI access
- Vercel Serverless Functions
- PostgreSQL database

### AI Models (via OpenRouter)
- Anthropic Claude 3.5 Sonnet - Advanced reasoning & vision
- OpenAI GPT-4o Mini - Fast responses
- OpenAI o1-mini - Complex reasoning

## Deployment to Vercel

### Prerequisites
1. OpenRouter API key from [openrouter.ai](https://openrouter.ai/keys)
2. Vercel account

### Environment Variables

Set these in your Vercel project settings:

```bash
OPENROUTER_API_KEY=your_api_key_here
SESSION_SECRET=your_secret_here
```

### Deploy

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Set Environment Variables:**
   ```bash
   vercel env add OPENROUTER_API_KEY
   vercel env add SESSION_SECRET
   ```

4. **Production Deploy:**
   ```bash
   vercel --prod
   ```

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## API Routes (Serverless)

- `/api/chat` - AI chat completions
- `/api/mindmap-generate` - Generate 3D mind maps
- `/api/quiz-generate` - Generate quizzes from materials
- `/api/image-analyze` - Analyze images with AI vision

## Architecture

### Serverless Functions
All AI processing happens in Vercel serverless functions, allowing scalable, cost-effective deployment.

### 3D Visualization
React Three Fiber provides WebGL-powered 3D study flows that work across devices.

### Multi-Model AI
OpenRouter provides access to multiple AI models, automatically routing to the best provider for each task.

## Features in Detail

### Voice Integration
- Speech-to-Text using Web Speech API
- Text-to-Speech for AI responses
- Voice commands for hands-free interaction

### 3D Study Canvas
- Interactive node-based learning
- Drag and explore concepts in 3D space
- Animated connections showing relationships
- Mobile touch controls with pinch-to-zoom

### Material Processing
- PDF text extraction
- Image analysis with AI vision
- YouTube transcript processing
- Handwriting recognition

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
