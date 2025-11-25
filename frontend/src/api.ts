import axios from 'axios'
import { ChatMessage, Draft, Email, EmailInsights, PromptTemplate } from './types'

/**
  * Central Axios instance + typed helper functions so React components
  * only think about data, not URLs or error handling.
  */
// Use environment variable for API URL in production, or proxy in development
const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 second timeout
})

// Add error interceptor for better error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. Please check if the backend server is running.'
    } else if (error.message === 'Network Error') {
      error.message = 'Cannot connect to backend server. Make sure it is running on port 3001.'
    }
    return Promise.reject(error)
  }
)

export async function fetchEmails(): Promise<Email[]> {
  const { data } = await api.get<Email[]>('/emails')
  return data
}

export async function markEmailAsRead(id: number): Promise<void> {
  await api.patch(`/emails/${id}/read`)
}

export async function runEmailAction(
  emailId: number,
  action: keyof EmailInsights | 'reply',
): Promise<string> {
  switch (action) {
    case 'category': {
      const { data } = await api.post<{ category: string }>(`/emails/${emailId}/categorize`)
      return data.category
    }
    case 'actions': {
      const { data } = await api.post<{ actions: string }>(`/emails/${emailId}/actions`)
      return data.actions
    }
    case 'summary': {
      const { data } = await api.post<{ summary: string }>(`/emails/${emailId}/summarize`)
      return data.summary
    }
    case 'priority': {
      const { data } = await api.post<{ priority: string }>(`/emails/${emailId}/priority`)
      return data.priority
    }
    case 'reply': {
      const { data } = await api.post<{ replyBody: string }>(`/emails/${emailId}/reply`)
      return data.replyBody
    }
    default:
      return ''
  }
}

// Prompt templates
export async function fetchPromptTemplates(): Promise<PromptTemplate[]> {
  const { data } = await api.get<PromptTemplate[]>('/prompts')
  return data
}

export async function createPromptTemplate(
  payload: Partial<PromptTemplate>,
): Promise<PromptTemplate> {
  const { data } = await api.post<PromptTemplate>('/prompts', payload)
  return data
}

export async function updatePromptTemplate(
  id: number,
  payload: Partial<PromptTemplate>,
): Promise<PromptTemplate> {
  const { data } = await api.put<PromptTemplate>(`/prompts/${id}`, payload)
  return data
}

export async function deletePromptTemplate(id: number): Promise<void> {
  await api.delete(`/prompts/${id}`)
}

// Drafts
export async function fetchDrafts(): Promise<Draft[]> {
  const { data } = await api.get<Draft[]>('/drafts')
  return data
}

export async function createDraft(payload: Partial<Draft>): Promise<Draft> {
  const { data } = await api.post<Draft>('/drafts', payload)
  return data
}

export async function updateDraft(id: number, payload: Partial<Draft>): Promise<Draft> {
  const { data } = await api.put<Draft>(`/drafts/${id}`, payload)
  return data
}

export async function deleteDraft(id: number): Promise<void> {
  await api.delete(`/drafts/${id}`)
}

// Chat
export async function fetchChatMessages(emailId?: number): Promise<ChatMessage[]> {
  const path = emailId ? `/chat/${emailId}` : '/chat'
  const { data } = await api.get<ChatMessage[]>(path)
  return data
}

export async function sendChatMessage(
  message: string,
  emailId?: number,
): Promise<{ userMessage: ChatMessage; assistantMessage: ChatMessage }> {
  const path = emailId ? `/chat/${emailId}` : '/chat'
  const { data } = await api.post<{ userMessage: ChatMessage; assistantMessage: ChatMessage }>(
    path,
    { message },
  )
  return data
}

export async function clearChat(emailId?: number): Promise<void> {
  const path = emailId ? `/chat/${emailId}` : '/chat'
  await api.delete(path)
}

export default api









