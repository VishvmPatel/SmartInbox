import { Router, Request, Response } from 'express';
import { getDatabase } from '../db/database';

type DraftRecord = {
  subject: string;
  to_email: string;
  body: string;
};

/**
 * CRUD endpoints for saved reply drafts. The UI relies on these routes to
 * persist edits even though final sending happens outside this project.
 */

export const draftRoutes = Router();

// Get all drafts
draftRoutes.get('/', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const drafts = db.prepare('SELECT * FROM drafts ORDER BY updated_at DESC').all();
    res.json(drafts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch drafts' });
  }
});

// Get single draft
draftRoutes.get('/:id', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const draft = db.prepare('SELECT * FROM drafts WHERE id = ?').get(req.params.id);
    if (!draft) {
      return res.status(404).json({ error: 'Draft not found' });
    }
    res.json(draft);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch draft' });
  }
});

// Create new draft
draftRoutes.post('/', (req: Request, res: Response) => {
  try {
    const { email_id, subject, to_email, body } = req.body;
    
    if (!subject || !to_email || !body) {
      return res.status(400).json({ error: 'Subject, to_email, and body are required' });
    }
    
    const db = getDatabase();
    const result = db.prepare(`
      INSERT INTO drafts (email_id, subject, to_email, body)
      VALUES (?, ?, ?, ?)
    `).run(email_id || null, subject, to_email, body);
    
    const newDraft = db.prepare('SELECT * FROM drafts WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newDraft);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create draft' });
  }
});

// Update draft
draftRoutes.put('/:id', (req: Request, res: Response) => {
  try {
    const { subject, to_email, body } = req.body;
    const db = getDatabase();
    
    const existing = db
      .prepare('SELECT * FROM drafts WHERE id = ?')
      .get(req.params.id) as DraftRecord | undefined;
    if (!existing) {
      return res.status(404).json({ error: 'Draft not found' });
    }
    
    db.prepare(`
      UPDATE drafts
      SET subject = ?, to_email = ?, body = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      subject || existing.subject,
      to_email || existing.to_email,
      body || existing.body,
      req.params.id
    );
    
    const updated = db.prepare('SELECT * FROM drafts WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update draft' });
  }
});

// Delete draft
draftRoutes.delete('/:id', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM drafts WHERE id = ?').run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Draft not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete draft' });
  }
});












