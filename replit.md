# EduVoice AI - Voice-First Educational Platform

## Overview

EduVoice AI is a next-generation Progressive Web App (PWA) designed as a voice-first educational assistant with interactive 3D visualizations. The platform enables students to upload study materials (PDFs, images, videos, YouTube links), interact with an AI tutor through voice or text, generate visual mind maps in 3D space, and create personalized quizzes. The application emphasizes multi-modal learning with natural voice interactions, visual concept mapping, and adaptive testing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Core Framework**: React 18 with TypeScript, built using Vite for fast development and optimized production builds.

**3D Visualization**: The application uses React Three Fiber (R3F) with @react-three/drei for rendering interactive 3D mind maps and study canvases. This provides an immersive visual learning experience where concepts are represented as 3D nodes with spatial relationships. The 3D canvas supports touch controls for mobile devices, zoom/pan interactions, and real-time updates as the AI generates concept maps.

**UI Component System**: Built on Radix UI primitives with a custom design system using TailwindCSS. The component library follows the shadcn/ui pattern with extensive customization through CSS variables for theming (light/dark mode support). Components are organized in `client/src/components/ui/` with variants for different use cases.

**State Management**: React Query (@tanstack/react-query) handles server state, caching, and API interactions. Local component state is managed with React hooks. The query client is configured with infinite stale time and disabled automatic refetching to optimize performance.

**Internationalization**: i18next provides multi-language support (8+ languages) with translation files loaded dynamically. Language switching is seamlessly integrated into the UI.

**Routing**: Wouter provides lightweight client-side routing with two main routes: landing page (`/`) and platform interface (`/platform`).

### Backend Architecture

**Server Framework**: Express.js running on Node.js with TypeScript. The server handles authentication, file uploads, database operations, and proxies requests to AI services.

**Authentication System**: Passport.js with local strategy for username/password authentication. Passwords are hashed using scrypt with salt. Sessions are managed with express-session and stored in PostgreSQL via connect-pg-simple for production persistence.

**File Upload Handling**: Multer middleware processes multi-modal file uploads (PDFs, images, videos) with a 50MB file size limit. Uploaded files are stored temporarily in the `uploads/` directory for processing.

**API Architecture**: RESTful API endpoints organized by feature:
- `/api/auth/*` - User authentication (register, login, logout)
- `/api/materials/*` - Material upload and management
- `/api/conversations/*` - Chat conversations and messages
- `/api/mindmaps/*` - Mind map generation
- `/api/quizzes/*` - Quiz generation and attempts

**Serverless Functions**: Vercel serverless functions in the `/api` directory handle AI-powered features independently, allowing for better scalability and separation of concerns.

### Data Storage

**Database**: PostgreSQL via Neon serverless database with WebSocket support for edge deployments. Connection pooling is managed through @neondatabase/serverless.

**ORM**: Drizzle ORM provides type-safe database operations with schema defined in `shared/schema.ts`. The schema includes:
- **users**: Authentication and profile data (username, email, role, plan, language preferences)
- **materials**: Uploaded content with extracted text, metadata, and type classification
- **conversations**: Chat conversation threads
- **messages**: Individual messages with role (user/assistant), content, and optional audio URLs
- **mindMaps**: Saved 3D mind map structures with nodes and connections as JSON
- **quizzes**: Generated quizzes with questions, difficulty, and source materials
- **quizAttempts**: User quiz attempts with scores and answers

**Session Storage**: PostgreSQL-backed session store for production, in-memory for development. Sessions persist for 7 days with secure cookies in production.

### External Dependencies

**AI Services**: OpenRouter API serves as the unified gateway for multiple AI models:
- **Anthropic Claude 3.5 Sonnet**: Primary model for chat, reasoning, and vision tasks (image analysis, PDF content extraction)
- **OpenAI GPT-4o Mini**: Fast responses for simple queries
- **OpenAI o1-mini**: Complex reasoning for mind map generation and quiz creation

The OpenRouter client (`lib/openrouter.ts`) abstracts model selection based on task requirements. Vision models process images/PDFs to extract educational content, reasoning models generate structured JSON for mind maps and quizzes, and chat models provide conversational interactions.

**Speech Services**: Browser Web Speech API for speech-to-text (voice input via MediaRecorder API with audio/webm encoding). Text-to-speech capabilities are planned for AI response playback.

**Deployment Platform**: Vercel hosts the application with:
- Static site generation for the React frontend
- Serverless functions for API endpoints
- Edge network for global CDN
- Environment variables for API keys and secrets

**Build Tools**:
- Vite: Frontend bundling and dev server
- esbuild: Server-side code bundling for production
- TypeScript: Type safety across the entire stack
- PostCSS with Autoprefixer: CSS processing

**UI Libraries**:
- Radix UI: Accessible component primitives
- Lucide React: Icon system
- Konva: 2D canvas alternative for interactive drawing
- Three.js ecosystem: 3D rendering and controls

**Development Tools**:
- Replit plugins: Runtime error overlay, cartographer for code mapping, dev banner
- Drizzle Kit: Database migrations and schema management