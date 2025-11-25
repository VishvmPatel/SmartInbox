import { useState } from 'react'
import { runEmailAction } from '../api'
import { Email, EmailInsights } from '../types'

// Button cluster that triggers categorization/summarization/etc. against the backend.

type EmailActionsProps = {
  email: Email
  insights: EmailInsights
  onInsightsChange: (payload: Partial<EmailInsights>) => void
  refreshEmails: () => void
}

const buttons = [
  { label: 'Categorize', key: 'category' as const, icon: '🏷️' },
  { label: 'Priority', key: 'priority' as const, icon: '⚡' },
  { label: 'Summarize', key: 'summary' as const, icon: '🧠' },
  { label: 'Extract Actions', key: 'actions' as const, icon: '🗂️' },
  { label: 'Draft Reply', key: 'reply' as const, icon: '✉️' },
]

export function EmailActions({ email, insights, onInsightsChange, refreshEmails }: EmailActionsProps) {
  const [loadingKey, setLoadingKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAction = async (key: (typeof buttons)[number]['key']) => {
    setError(null)
    setLoadingKey(key)
    try {
      const result = await runEmailAction(email.id, key)
      if (key === 'reply') {
        onInsightsChange({ replyDraft: result })
      } else {
        onInsightsChange({ [key]: result })
      }
      if (key === 'category' || key === 'priority') {
        await refreshEmails()
      }
    } catch (err) {
      setError('Failed to run action. Please try again.')
    } finally {
      setLoadingKey(null)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-white/70 dark:border-slate-800 p-6 space-y-5">
      <div className="flex flex-wrap gap-3">
        {buttons.map((btn) => (
          <button
            key={btn.key}
            onClick={() => handleAction(btn.key)}
            disabled={loadingKey !== null}
            className="px-4 py-2 text-sm rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2"
          >
            <span>{btn.icon}</span>
            {loadingKey === btn.key ? 'Working...' : btn.label}
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {insights.category && <InfoCard title="Category" value={insights.category} />}
        {insights.priority && <InfoCard title="Priority" value={insights.priority} />}
      </div>
      {insights.summary && <InfoCard title="Summary" value={insights.summary} highlight />}
      {insights.actions && <InfoCard title="Action Items" value={insights.actions} />}
      {insights.replyDraft && <InfoCard title="Reply Draft" value={insights.replyDraft} highlight />}
    </div>
  )
}

function InfoCard({ title, value, highlight }: { title: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`border border-slate-100 rounded-xl p-4 ${
        highlight
          ? 'bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800'
          : 'bg-slate-50 dark:bg-slate-900'
      }`}
    >
      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">{title}</p>
      <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-line">{value}</p>
    </div>
  )
}

