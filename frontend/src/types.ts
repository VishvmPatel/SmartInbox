// Shared TypeScript models consumed by both UI and API helper layer.
export interface Email {
  id: number
  subject: string
  from_email: string
  from_name: string
  to_email: string
  body: string
  date: string
  read: number
  category?: string | null
  priority?: string | null
  created_at?: string
}

export interface PromptTemplate {
  id: number
  name: string
  description: string | null
  template: string
  type: string
  created_at?: string
  updated_at?: string
}

export interface Draft {
  id: number
  email_id?: number | null
  subject: string
  to_email: string
  body: string
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: number
  role: 'user' | 'assistant'
  content: string
  email_id?: number | null
  created_at: string
}

export interface EmailInsights {
  category?: string
  priority?: string
  summary?: string
  actions?: string
  replyDraft?: string
}









