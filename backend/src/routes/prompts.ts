import { Router, Request, Response } from 'express';
import { getDatabase } from '../db/database';

export const promptRoutes = Router();

// Get all prompt templates
promptRoutes.get('/', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const prompts = db.prepare('SELECT * FROM prompt_templates ORDER BY name').all();
    res.json(prompts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prompt templates' });
  }
});

// Get single prompt template
promptRoutes.get('/:id', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const prompt = db.prepare('SELECT * FROM prompt_templates WHERE id = ?').get(req.params.id);
    if (!prompt) {
      return res.status(404).json({ error: 'Prompt template not found' });
    }
    res.json(prompt);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prompt template' });
  }
});

// Create new prompt template
promptRoutes.post('/', (req: Request, res: Response) => {
  try {
    const { name, description, template, type } = req.body;
    
    if (!name || !template || !type) {
      return res.status(400).json({ error: 'Name, template, and type are required' });
    }
    
    const db = getDatabase();
    const result = db.prepare(`
      INSERT INTO prompt_templates (name, description, template, type)
      VALUES (?, ?, ?, ?)
    `).run(name, description || null, template, type);
    
    const newPrompt = db.prepare('SELECT * FROM prompt_templates WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newPrompt);
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint')) {
      return res.status(409).json({ error: 'Prompt template with this name already exists' });
    }
    res.status(500).json({ error: 'Failed to create prompt template' });
  }
});

// Update prompt template
promptRoutes.put('/:id', (req: Request, res: Response) => {
  try {
    const { name, description, template, type } = req.body;
    const db = getDatabase();
    
    const existing = db.prepare('SELECT * FROM prompt_templates WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Prompt template not found' });
    }
    
    db.prepare(`
      UPDATE prompt_templates
      SET name = ?, description = ?, template = ?, type = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name || existing.name,
      description !== undefined ? description : existing.description,
      template || existing.template,
      type || existing.type,
      req.params.id
    );
    
    const updated = db.prepare('SELECT * FROM prompt_templates WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint')) {
      return res.status(409).json({ error: 'Prompt template with this name already exists' });
    }
    res.status(500).json({ error: 'Failed to update prompt template' });
  }
});

// Delete prompt template
promptRoutes.delete('/:id', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM prompt_templates WHERE id = ?').run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Prompt template not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete prompt template' });
  }
});












