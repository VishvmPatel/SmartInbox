import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { emailRoutes } from './routes/emails';
import { promptRoutes } from './routes/prompts';
import { draftRoutes } from './routes/drafts';
import { chatRoutes } from './routes/chat';
import { initDatabase } from './db/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration for production
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*', // Allow all in dev, specific URL in production
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/emails', emailRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/drafts', draftRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/api/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'ok', message: 'Email Agent API is running' });
});

// Initialize database and start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}).catch((error) => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
});




