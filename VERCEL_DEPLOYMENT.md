# Vercel Deployment Guide for EduVoice AI

## ✅ What Has Been Fixed

Your project has been migrated to work on Vercel with the following improvements:

### 1. **OpenRouter Integration**
- ✅ All AI features now use OpenRouter API instead of OpenAI
- ✅ Works with `OPENROUTER_API_KEY` environment variable
- ✅ Supports vision models for image analysis
- ✅ Chat, mind maps, and quiz generation all use OpenRouter

### 2. **JWT Authentication for Serverless**
- ✅ Hybrid authentication system: sessions for local dev, JWT tokens for Vercel
- ✅ Automatically detects Vercel environment
- ✅ Secure token-based authentication with 7-day expiration

### 3. **Serverless-Compatible File Handling**
- ✅ File uploads use `/tmp` directory on Vercel
- ✅ Images analyzed and content extracted before cleanup
- ✅ Temporary storage suitable for serverless functions

### 4. **Database Configuration**
- ✅ Already using Neon serverless PostgreSQL
- ✅ WebSocket-based connection pooling
- ✅ Fully compatible with Vercel Edge runtime

## 🚀 Deployment Steps

### 1. **Set Up Environment Variables in Vercel**

In your Vercel project dashboard, add these environment variables:

```
OPENROUTER_API_KEY=your_openrouter_api_key_here
JWT_SECRET=your_secure_random_jwt_secret_here
DATABASE_URL=your_neon_database_url_here
```

**Important:** 
- Generate a strong `JWT_SECRET` (at least 32 random characters)
- Never commit these secrets to GitHub
- The `DATABASE_URL` should be from your Neon/Replit PostgreSQL database

### 2. **Deploy to Vercel**

```bash
# Push your code to GitHub (if not already done)
git add .
git commit -m "Vercel deployment configuration"
git push origin main

# Vercel will automatically build and deploy
```

Or deploy directly:

```bash
npm install -g vercel
vercel --prod
```

### 3. **Verify Build Configuration**

Vercel should automatically detect:
- **Framework:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist/public`
- **Install Command:** `npm install`

## ⚠️ Important Client-Side Update Needed

### JWT Token Handling

The server now returns JWT tokens on login/register. Your client needs to:

1. **Store the token** after login/register:
```javascript
// After successful login/register
const response = await fetch('/api/login', { ... });
const data = await response.json();
localStorage.setItem('token', data.token);
```

2. **Send the token** with every API request:
```javascript
fetch('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
```

3. **Update React Query configuration** to include the token in all requests.

## 📝 API Routes

### Express API (Main Backend)
All routes are available at `/api/*` and handled by the Express server:
- `/api/register` - User registration
- `/api/login` - User login  
- `/api/user` - Get current user
- `/api/materials/*` - Material management
- `/api/conversations/*` - Chat conversations
- `/api/mindmaps/*` - Mind map generation
- `/api/quizzes/*` - Quiz generation
- `/api/voice/*` - Voice transcription (note: handled client-side)

### Standalone Serverless Functions
These serverless functions in `/api` directory work independently:
- `/api/chat.ts` - Simple chat endpoint
- `/api/conversations/messages.ts` - Message handling
- `/api/materials/analyze.ts` - Material analysis
- `/api/mindmaps/generate.ts` - Mind map generation
- `/api/quizzes/generate.ts` - Quiz generation

## 🔒 Security Notes

1. **JWT Secret:** Must be set in Vercel environment variables. Never use the default!
2. **Database URL:** Should use connection pooling (Neon serverless)
3. **API Keys:** OpenRouter API key should have appropriate rate limits set
4. **CORS:** Configured for your Vercel domain automatically

## ⚡ Performance & Limitations

### ✅ What Works
- Authentication with JWT tokens
- AI chat and conversations
- Material upload and analysis (images, text files)
- Mind map generation
- Quiz generation
- Database operations

### ⚠️ Limitations
- **File uploads:** Limited to 50MB, stored temporarily in `/tmp`
- **Voice transcription:** Should use browser Web Speech API (client-side)
- **Text-to-speech:** Should use browser Web Speech API (client-side)
- **PDF processing:** Not yet implemented (TODO)
- **YouTube transcripts:** Not yet implemented (TODO)

### 🔄 Serverless Constraints
- Functions have a 10-second timeout (Hobby plan) or 60-second (Pro plan)
- Maximum response size: 4.5MB
- `/tmp` directory is ephemeral (cleared after function execution)
- No persistent file storage (use object storage service if needed)

## 🧪 Testing Your Deployment

### 1. Test Authentication
```bash
# Register a new user
curl -X POST https://your-app.vercel.app/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"testpass123"}'

# Should return user object with token
```

### 2. Test AI Chat
```bash
# Login and get token first, then:
curl -X POST https://your-app.vercel.app/api/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"title":"Test Conversation"}'
```

### 3. Test OpenRouter Connection
Check Vercel logs to ensure OpenRouter API calls are working.

## 🐛 Troubleshooting

### Build Fails
- Check that all dependencies are in `dependencies` not just `devDependencies`
- Verify `vite` and `typescript` are installed
- Check Vercel build logs for specific errors

### Authentication Not Working
- Verify `JWT_SECRET` is set in Vercel environment variables
- Check client is sending `Authorization: Bearer TOKEN` header
- Inspect network requests in browser DevTools

### OpenRouter API Errors
- Verify `OPENROUTER_API_KEY` is correct
- Check OpenRouter dashboard for rate limits
- Review Vercel function logs for error details

### Database Connection Issues
- Verify `DATABASE_URL` is correct and uses WebSocket protocol
- Check Neon database is active and accessible
- Review connection pooling settings

## 📚 Next Steps

1. **Update client to handle JWT tokens** (see section above)
2. **Test all features** on Vercel preview deployment
3. **Set up custom domain** in Vercel dashboard (optional)
4. **Monitor usage** in OpenRouter and Vercel dashboards
5. **Implement PDF/YouTube processing** if needed

## 🆘 Support

For issues specific to:
- **Vercel deployment:** Check Vercel documentation or support
- **OpenRouter API:** Check OpenRouter documentation
- **Database:** Check Neon/Replit database documentation
- **Code issues:** Review server logs and error messages

---

**Your app is now ready for Vercel deployment!** 🎉

Make sure to add the required environment variables and test thoroughly before going live.
