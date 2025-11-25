import { getDatabase } from '../db/database';

/**
 * Seeds a sensible set of prompt templates so new environments immediately
 * get usable LLM instructions. Templates can be edited in-app later.
 */
const defaultPrompts = [
    {
      name: "Email Categorization",
      description: "Categorize emails into predefined categories",
      template: `Analyze the following email and categorize it into one of these categories:
- urgent: Requires immediate attention
- work: Work-related tasks and communications
- personal: Personal messages
- newsletter: Newsletters and subscriptions
- spam: Unwanted or suspicious emails
- finance: Bills, invoices, and financial matters
- social: Social invitations and casual messages

Email:
Subject: {subject}
From: {from_name} <{from_email}>
Body: {body}

Respond with only the category name.`,
      type: "categorization"
    },
    {
      name: "Action Extraction",
      description: "Extract actionable items from emails",
      template: `Analyze the following email and extract any actionable items or tasks mentioned.

Email:
Subject: {subject}
From: {from_name} <{from_email}>
Body: {body}

List all actionable items in a clear, concise format. If there are no actions, respond with "No actions required."`,
      type: "action_extraction"
    },
    {
      name: "Auto Reply Draft",
      description: "Generate a polite, context-aware reply draft that the user can review and edit before sending",
      template: `You are an assistant that writes professional email replies on behalf of the user.

When drafting the reply:
- Start with a friendly greeting that references the sender's name (e.g., "Hi {from_name},")
- Use short paragraphs (blank line between them) that acknowledge the original message, address questions, and provide next steps
- Thank the sender when appropriate and keep a professional, helpful tone
- End with a professional closing such as "Best regards," followed by a placeholder for the user's name
- Never promise to send emails automatically; the user will review and send manually

Original Email:
Subject: {subject}
From: {from_name} <{from_email}>
Body: {body}

Draft a reply email body only (no subject line).`,
      type: "reply_draft"
    },
    {
      name: "Email Summary",
      description: "Create a concise summary of the email",
      template: `Summarize the following email in 2-3 sentences, highlighting:
- Main purpose or topic
- Key points or requests
- Any deadlines or important dates

Email:
Subject: {subject}
From: {from_name} <{from_email}>
Body: {body}

Provide a concise summary.`,
      type: "summary"
    },
    {
      name: "Priority Assessment",
      description: "Assess the priority level of an email",
      template: `Analyze the following email and determine its priority level:
- high: Urgent, requires immediate attention, has deadlines
- medium: Important but not urgent, should be addressed soon
- low: Can be handled later, informational only

Email:
Subject: {subject}
From: {from_name} <{from_email}>
Body: {body}

Respond with only the priority level (high, medium, or low).`,
      type: "priority"
    }
  ];

export function initDefaultPrompts(): void {
  const db = getDatabase();
  const insert = db.prepare(`
    INSERT INTO prompt_templates (name, description, template, type, updated_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);
  const existsStmt = db.prepare(`SELECT COUNT(*) as count FROM prompt_templates WHERE name = ?`);

  const upsertDefaults = db.transaction(() => {
    for (const prompt of defaultPrompts) {
      const exists = existsStmt.get(prompt.name) as { count: number };
      if (exists.count === 0) {
        insert.run(prompt.name, prompt.description, prompt.template, prompt.type);
      }
    }
  });

  upsertDefaults();
  console.log("✅ Ensured default prompt templates are present");
}




