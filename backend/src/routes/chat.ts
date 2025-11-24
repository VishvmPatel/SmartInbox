import { Router, Request, Response } from 'express';
import { getDatabase } from '../db/database';
import { callLLM } from '../services/llmService';

export const chatRoutes = Router();

// Get chat messages for an email (or general chat)
chatRoutes.get('/:emailId?', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const emailId = req.params.emailId || null;
    
    let messages;
    if (emailId) {
      messages = db.prepare('SELECT * FROM chat_messages WHERE email_id = ? ORDER BY created_at ASC').all(emailId);
    } else {
      messages = db.prepare('SELECT * FROM chat_messages WHERE email_id IS NULL ORDER BY created_at ASC').all();
    }
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chat messages' });
  }
});

// Send a message in the Email Agent chat
chatRoutes.post('/:emailId?', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    const emailId = req.params.emailId || null;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const db = getDatabase();
    
    // Save user message
    const userMsgResult = db.prepare(`
      INSERT INTO chat_messages (role, content, email_id)
      VALUES (?, ?, ?)
    `).run('user', message, emailId);
    
    // Get email context if emailId is provided
    let emailContext = '';
    if (emailId) {
      const email = db.prepare('SELECT * FROM emails WHERE id = ?').get(emailId) as any;
      if (email) {
        emailContext = `\n\nEmail Context:\nSubject: ${email.subject}\nFrom: ${email.from_name} <${email.from_email}>\nBody: ${email.body}`;
      }
    }
    
    // Build prompt for assistant
    const systemPrompt = `You are an Email Productivity Assistant. Help the user manage their emails effectively.${emailContext}\n\nUser's question: ${message}\n\nProvide a helpful, concise response.`;
    
    // Get assistant response from LLM
    const assistantResponse = await callLLM(systemPrompt);
    
    // Save assistant message
    const assistantMsgResult = db.prepare(`
      INSERT INTO chat_messages (role, content, email_id)
      VALUES (?, ?, ?)
    `).run('assistant', assistantResponse, emailId);
    
    // Return both messages
    const userMsg = db.prepare('SELECT * FROM chat_messages WHERE id = ?').get(userMsgResult.lastInsertRowid);
    const assistantMsg = db.prepare('SELECT * FROM chat_messages WHERE id = ?').get(assistantMsgResult.lastInsertRowid);
    
    res.status(201).json({
      userMessage: userMsg,
      assistantMessage: assistantMsg
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// Clear chat history
chatRoutes.delete('/:emailId?', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const emailId = req.params.emailId || null;
    
    if (emailId) {
      db.prepare('DELETE FROM chat_messages WHERE email_id = ?').run(emailId);
    } else {
      db.prepare('DELETE FROM chat_messages WHERE email_id IS NULL').run();
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear chat history' });
  }
});












