import { Router, Request, Response } from 'express';
import { getDatabase } from '../db/database';
import { callLLM, type LLMMessage } from '../services/llmService';

/**
 * Manages the chat experience shown alongside each email. Conversations are
 * stored per-email, and every request we send to the LLM is augmented with
 * the relevant email metadata so replies stay grounded in the selected mail.
 */
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
    
    // Build prompt for assistant - improved structure for better Gemini responses
    const lowerMessage = message.toLowerCase();
    const messages: LLMMessage[] = [
      {
        role: 'system',
        content: `You are an Email Productivity Assistant. Follow these rules strictly:
- Always answer ONLY the question that the user asked.
- If the user asks for a summary, provide a concise summary. Do NOT draft a reply unless explicitly asked.
- If the user asks "what is this email about", describe the email content; do not write a reply email.
- If the user asks for action items, list actionable next steps.
- If the user asks for a reply, draft one professional reply.
- If the user asks something else, respond helpfully, referencing the email when provided.`,
      },
    ];
    
    if (emailContext) {
      messages.push({
        role: 'system',
        content: `Email Context:\n${emailContext}`,
      });
    }

    // Determine user intent for additional instructions
    const wantsSummary =
      lowerMessage.includes('what is this email') ||
      lowerMessage.includes("what's this email") ||
      lowerMessage.includes('summarize') ||
      lowerMessage.includes('summarise') ||
      lowerMessage.includes('what is the email about') ||
      lowerMessage.includes('tell me about this email') ||
      lowerMessage.includes('explain this email') ||
      lowerMessage.includes('what does this email say');

    const wantsReply =
      lowerMessage.includes('draft a reply') ||
      lowerMessage.includes('write a reply') ||
      lowerMessage.includes('reply to this') ||
      (lowerMessage.includes('reply') && lowerMessage.includes('draft'));

    const wantsActions =
      lowerMessage.includes('what should i do') ||
      lowerMessage.includes('next steps') ||
      lowerMessage.includes('action items') ||
      lowerMessage.includes('what to do') ||
      lowerMessage.includes('what are the actions');

    if (wantsSummary) {
      messages.push({
        role: 'system',
        content: 'The user requested a SUMMARY. Provide only a summary of the email. Do NOT draft a reply.',
      });
    } else if (wantsReply) {
      messages.push({
        role: 'system',
        content: 'The user requested a REPLY. Draft a professional reply email body. Do not include subject line.',
      });
    } else if (wantsActions) {
      messages.push({
        role: 'system',
        content: 'The user requested ACTION ITEMS. Provide clear, concise next steps based on the email.',
      });
    } else if (emailContext) {
      messages.push({
        role: 'system',
        content: 'Use the email context to answer the user question accurately.',
      });
    }

    messages.push({
      role: 'user',
      content: message,
    });
    
    // Get assistant response from LLM
    const assistantResponse = await callLLM(messages);
    
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












