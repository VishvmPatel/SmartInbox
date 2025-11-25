import { useEffect, useState } from 'react'
import { clearChat, fetchChatMessages, sendChatMessage } from '../api'
import { ChatMessage, Email } from '../types'

// Conversation UI that lets the user interrogate an e-mail. We stream chat
// history from the backend so each thread stays tied to its email id.

type ChatAgentProps = {
  selectedEmail: Email | null
}

const quickPrompts = [
  'Summarize this email',
  'Draft a reply acknowledging receipt',
  'Extract next steps',
  'List potential risks',
]

export function ChatAgent({ selectedEmail }: ChatAgentProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    loadMessages()
  }, [selectedEmail?.id])

  const loadMessages = async () => {
    setLoading(true)
    try {
      const data = await fetchChatMessages(selectedEmail?.id)
      setMessages(data)
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return
    setSending(true)
    const currentInput = input
    setInput('')
    try {
      const { userMessage, assistantMessage } = await sendChatMessage(currentInput, selectedEmail?.id)
      setMessages((prev) => [...prev, userMessage, assistantMessage])
    } finally {
      setSending(false)
    }
  }

  const handleClear = async () => {
    await clearChat(selectedEmail?.id)
    setMessages([])
  }

  return (
    <section
      id="email-agent"
      className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-white/70 dark:border-slate-800 h-full flex flex-col"
    >
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Email Agent</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {selectedEmail ? 'Contextual chat for selected email' : 'General inbox assistant'}
          </p>
        </div>
        <button onClick={handleClear} className="text-xs text-slate-500 dark:text-slate-400 hover:text-red-500">
          Clear
        </button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-slate-50 dark:bg-slate-900">
        {loading && <p className="text-sm text-slate-500 dark:text-slate-400">Loading conversation...</p>}
        {!loading && messages.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">Ask me anything about your inbox.</p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[80%] p-3 rounded-2xl text-sm shadow ${
              msg.role === 'assistant'
                ? 'bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50 text-slate-800 self-start dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 dark:text-slate-100'
                : 'bg-white text-slate-700 self-end dark:bg-slate-800 dark:text-slate-200'
            }`}
          >
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
              {msg.role === 'assistant' ? 'Agent' : 'You'}
            </p>
            <p className="whitespace-pre-line">{msg.content}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-100 dark:border-slate-800 p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => setInput(prompt)}
              className="px-3 py-1.5 text-xs rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {prompt}
            </button>
          ))}
        </div>
        <textarea
          rows={3}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for help drafting replies, summarizing emails, or planning next steps..."
          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        <button
          onClick={handleSend}
          disabled={sending}
          className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm disabled:opacity-50"
        >
          {sending ? 'Thinking...' : 'Send to Agent'}
        </button>
      </div>
    </section>
  )
}

