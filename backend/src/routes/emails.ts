import { Router, Request, Response } from 'express';
import { getDatabase } from '../db/database';
import { callLLM } from '../services/llmService';

/**
 * Core email REST API. Each endpoint either returns inbox data or proxies a
 * work request to the LLM (categorize, summarize, draft reply, etc.) using
 * the prompt templates stored in SQLite.
 */
export const emailRoutes = Router();

// Get all emails
emailRoutes.get('/', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const emails = db.prepare('SELECT * FROM emails ORDER BY date DESC').all();
    res.json(emails);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
});

// Get single email
emailRoutes.get('/:id', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const email = db.prepare('SELECT * FROM emails WHERE id = ?').get(req.params.id);
    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }
    res.json(email);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch email' });
  }
});

// Mark email as read
emailRoutes.patch('/:id/read', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const result = db.prepare('UPDATE emails SET read = 1 WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Email not found' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update email' });
  }
});

// Categorize email
emailRoutes.post('/:id/categorize', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const email = db.prepare('SELECT * FROM emails WHERE id = ?').get(req.params.id) as any;
    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }
    
    // Get categorization prompt template
    const promptTemplate = db.prepare('SELECT * FROM prompt_templates WHERE type = ?').get('categorization') as any;
    if (!promptTemplate) {
      return res.status(404).json({ error: 'Categorization prompt template not found' });
    }
    
    // Replace placeholders in template
    let prompt = promptTemplate.template;
    prompt = prompt.replace('{subject}', email.subject);
    prompt = prompt.replace('{from_name}', email.from_name);
    prompt = prompt.replace('{from_email}', email.from_email);
    prompt = prompt.replace('{body}', email.body);
    prompt = `${prompt}\n\n[ACTION:CATEGORY]`;
    
    // Call LLM
    const category = await callLLM(prompt);
    
    // Update email with category
    db.prepare('UPDATE emails SET category = ? WHERE id = ?').run(category.trim(), email.id);
    
    res.json({ category: category.trim() });
  } catch (error) {
    console.error('Categorization error:', error);
    res.status(500).json({ error: 'Failed to categorize email' });
  }
});

// Extract actions from email
emailRoutes.post('/:id/actions', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const email = db.prepare('SELECT * FROM emails WHERE id = ?').get(req.params.id) as any;
    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }
    
    const promptTemplate = db.prepare('SELECT * FROM prompt_templates WHERE type = ?').get('action_extraction') as any;
    if (!promptTemplate) {
      return res.status(404).json({ error: 'Action extraction prompt template not found' });
    }
    
    let prompt = promptTemplate.template;
    prompt = prompt.replace('{subject}', email.subject);
    prompt = prompt.replace('{from_name}', email.from_name);
    prompt = prompt.replace('{from_email}', email.from_email);
    prompt = prompt.replace('{body}', email.body);
    prompt = `${prompt}\n\n[ACTION:ACTIONS]`;
    
    const actions = await callLLM(prompt);
    res.json({ actions: actions.trim() });
  } catch (error) {
    console.error('Action extraction error:', error);
    res.status(500).json({ error: 'Failed to extract actions' });
  }
});

// Generate reply draft
emailRoutes.post('/:id/reply', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const email = db.prepare('SELECT * FROM emails WHERE id = ?').get(req.params.id) as any;
    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }
    
    const promptTemplate = db.prepare('SELECT * FROM prompt_templates WHERE type = ?').get('reply_draft') as any;
    if (!promptTemplate) {
      return res.status(404).json({ error: 'Reply draft prompt template not found' });
    }
    
    let prompt = promptTemplate.template;
    prompt = prompt.replace('{subject}', email.subject);
    prompt = prompt.replace('{from_name}', email.from_name);
    prompt = prompt.replace('{from_email}', email.from_email);
    prompt = prompt.replace('{body}', email.body);

    const replyFormattingGuidance = `
Formatting requirements:
- Begin with a friendly greeting that mentions ${email.from_name || 'the sender'} (e.g., "Hi ${email.from_name || 'there'},")
- Provide 1-2 concise paragraphs that acknowledge the message, answer questions, and outline next steps
- Close with a professional sign-off such as "Best regards," followed by a placeholder for the user's name
- Keep the tone helpful, appreciative, and confident
`;

    prompt = `${prompt}\n${replyFormattingGuidance}\n[ACTION:REPLY]`;
    
    const replyBody = await callLLM(prompt);
    res.json({ replyBody: replyBody.trim() });
  } catch (error) {
    console.error('Reply generation error:', error);
    res.status(500).json({ error: 'Failed to generate reply' });
  }
});

// Summarize email
emailRoutes.post('/:id/summarize', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const email = db.prepare('SELECT * FROM emails WHERE id = ?').get(req.params.id) as any;
    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }
    
    const promptTemplate = db.prepare('SELECT * FROM prompt_templates WHERE type = ?').get('summary') as any;
    if (!promptTemplate) {
      return res.status(404).json({ error: 'Summary prompt template not found' });
    }
    
    let prompt = promptTemplate.template;
    prompt = prompt.replace('{subject}', email.subject);
    prompt = prompt.replace('{from_name}', email.from_name);
    prompt = prompt.replace('{from_email}', email.from_email);
    prompt = prompt.replace('{body}', email.body);
    prompt = `${prompt}\n\n[ACTION:SUMMARY]`;
    
    const summary = await callLLM(prompt);
    res.json({ summary: summary.trim() });
  } catch (error) {
    console.error('Summarization error:', error);
    res.status(500).json({ error: 'Failed to summarize email' });
  }
});

// Assess priority
emailRoutes.post('/:id/priority', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const email = db.prepare('SELECT * FROM emails WHERE id = ?').get(req.params.id) as any;
    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }
    
    const promptTemplate = db.prepare('SELECT * FROM prompt_templates WHERE type = ?').get('priority') as any;
    if (!promptTemplate) {
      return res.status(404).json({ error: 'Priority prompt template not found' });
    }
    
    let prompt = promptTemplate.template;
    prompt = prompt.replace('{subject}', email.subject);
    prompt = prompt.replace('{from_name}', email.from_name);
    prompt = prompt.replace('{from_email}', email.from_email);
    prompt = prompt.replace('{body}', email.body);
    prompt = `${prompt}\n\n[ACTION:PRIORITY]`;
    
    const priority = await callLLM(prompt);
    
    // Update email with priority
    db.prepare('UPDATE emails SET priority = ? WHERE id = ?').run(priority.trim(), email.id);
    
    res.json({ priority: priority.trim() });
  } catch (error) {
    console.error('Priority assessment error:', error);
    res.status(500).json({ error: 'Failed to assess priority' });
  }
});




