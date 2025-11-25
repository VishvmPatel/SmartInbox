import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { initMockInbox } from '../data/mockInbox';
import { initDefaultPrompts } from '../data/defaultPrompts';

/**
 * Thin wrapper around better-sqlite3 that handles bootstrapping the
 * local database file, creating our tables, and seeding mock data so
 * developers always spin up a working inbox.
 */

let db: Database.Database | null = null;
let initPromise: Promise<void> | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call ensureDatabase() first.');
  }
  return db;
}

/**
 * Ensures database is initialized. Safe to call multiple times.
 * In serverless environments, uses /tmp for the database file.
 */
export async function ensureDatabase(): Promise<void> {
  if (db) {
    return; // Already initialized
  }
  
  if (initPromise) {
    return initPromise; // Initialization in progress
  }
  
  initPromise = _initDatabase();
  await initPromise;
}

async function _initDatabase(): Promise<void> {
  // In serverless (Vercel), use /tmp directory (only writable location)
  // In local development, use the data directory
  const isServerless = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME;
  const dataDir = isServerless 
    ? '/tmp' 
    : path.join(__dirname, '../../data');
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const dbPath = path.join(dataDir, 'email_agent.db');
  db = new Database(dbPath);
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON');
  
  // Create tables
  createTables();
  
  // Initialize with mock data if tables are empty
  const emailCount = db.prepare('SELECT COUNT(*) as count FROM emails').get() as { count: number };
  if (emailCount.count === 0) {
    initMockInbox();
  }
  
  const promptCount = db.prepare('SELECT COUNT(*) as count FROM prompt_templates').get() as { count: number };
  if (promptCount.count === 0) {
    initDefaultPrompts();
  }
  
  console.log('✅ Database initialized successfully');
}

// Export initDatabase for backward compatibility
export async function initDatabase(): Promise<void> {
  await ensureDatabase();
}

function createTables(): void {
  // Define every table up-front so migrations stay centralized.
  db!.exec(`
    CREATE TABLE IF NOT EXISTS emails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject TEXT NOT NULL,
      from_email TEXT NOT NULL,
      from_name TEXT NOT NULL,
      to_email TEXT NOT NULL,
      body TEXT NOT NULL,
      date TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      category TEXT,
      priority TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Prompt templates table
  db!.exec(`
    CREATE TABLE IF NOT EXISTS prompt_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      template TEXT NOT NULL,
      type TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Drafts table
  db!.exec(`
    CREATE TABLE IF NOT EXISTS drafts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email_id INTEGER,
      subject TEXT NOT NULL,
      to_email TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE SET NULL
    )
  `);
  
  // Chat messages table (for Email Agent chat UI)
  db!.exec(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      email_id INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE SET NULL
    )
  `);
}




