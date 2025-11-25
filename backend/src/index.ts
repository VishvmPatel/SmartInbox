import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { emailRoutes } from './routes/emails';
import { promptRoutes } from './routes/prompts';
import { draftRoutes } from './routes/drafts';
import { chatRoutes } from './routes/chat';
import { initDatabase } from './db/database';

/**
 * Entry point for the backend API. This file wires together middleware,
 * feature routes, health checks, and helper endpoints that verify our
 * Gemini integration. Keeping this setup lean makes it easy to reason
 * about the infrastructure plumbing while the heavy lifting happens in
 * the dedicated route modules.
 */
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Apply a strict-but-configurable CORS policy so production deployments
// can lock traffic to the UI origin while local development stays open.
// For Vercel, we allow all Vercel preview URLs since they change on each deployment.
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // Always allow Vercel preview URLs (they change on each deployment)
    if (/^https:\/\/.*\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }
    
    // Allow localhost for development
    if (/^http:\/\/localhost:\d+$/.test(origin)) {
      return callback(null, true);
    }
    
    // If FRONTEND_URL is set, check for exact match
    if (process.env.FRONTEND_URL) {
      if (origin === process.env.FRONTEND_URL) {
        return callback(null, true);
      }
    } else {
      // If FRONTEND_URL is not set, allow all (development mode)
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check (no database needed)
app.get('/api/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'ok', message: 'Email Agent API is running' });
});

// LLM status check (no database needed)
app.get('/api/llm/status', (req: express.Request, res: express.Response) => {
  const useMockLLM = process.env.USE_MOCK_LLM === 'true' || !process.env.GEMINI_API_KEY;
  const hasApiKey = !!process.env.GEMINI_API_KEY;
  const apiKeyPrefix = process.env.GEMINI_API_KEY?.substring(0, 7) || 'none';
  
  res.json({
    status: 'ok',
    llmProvider: useMockLLM ? 'mock' : 'gemini',
    hasApiKey,
    apiKeyConfigured: hasApiKey && !useMockLLM,
    apiKeyPrefix: hasApiKey ? `${apiKeyPrefix}...` : 'not set',
    model: process.env.GEMINI_MODEL || 'gemini-pro',
    message: useMockLLM 
      ? 'Using mock LLM service (set GEMINI_API_KEY to use Google Gemini)' 
      : 'Google Gemini API is configured and ready'
  });
});

// Middleware to ensure database is initialized on each request (for serverless)
// Skip database init for OPTIONS requests (CORS preflight) and health checks
app.use(async (req, res, next) => {
  // Skip database initialization for OPTIONS requests (CORS preflight)
  if (req.method === 'OPTIONS') {
    return next();
  }
  
  // Skip for health check endpoints
  if (req.path === '/api/health' || req.path === '/api/llm/status') {
    return next();
  }
  
  try {
    const { ensureDatabase } = await import('./db/database');
    await ensureDatabase();
    next();
  } catch (error: any) {
    console.error('Database initialization error:', error);
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      code: error?.code
    });
    res.status(500).json({ 
      error: 'Database initialization failed',
      message: error?.message || 'Unknown error'
    });
  }
});

// Routes (require database)
app.use('/api/emails', emailRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/drafts', draftRoutes);
app.use('/api/chat', chatRoutes);

// Test LLM endpoint (for testing Gemini integration)
app.post('/api/llm/test', async (req: express.Request, res: express.Response) => {
  try {
    const { prompt } = req.body;
    const testPrompt = prompt || 'Say "Hello, Gemini integration is working!" if you are an AI, or "Hello, Mock LLM is working!" if you are a mock service.';
    
    const { callLLM } = await import('./services/llmService');
    const response = await callLLM(testPrompt);
    
    const useMockLLM = process.env.USE_MOCK_LLM === 'true' || !process.env.GEMINI_API_KEY;
    
    res.json({
      success: true,
      provider: useMockLLM ? 'mock' : 'gemini',
      prompt: testPrompt,
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('LLM test error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to test LLM',
      provider: 'unknown'
    });
  }
});

// Initialize database and start server (only for non-serverless environments)
if (process.env.VERCEL !== '1' && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  initDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  }).catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });
}

// Export app for serverless (Vercel)
export default app;




