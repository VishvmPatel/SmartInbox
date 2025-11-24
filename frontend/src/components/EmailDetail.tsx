import { Email } from '../types'

type EmailStatus = {
  pinned?: boolean
  archived?: boolean
}

type EmailDetailProps = {
  email: Email | null
  status?: EmailStatus
  onToolbarAction?: (action: 'save' | 'pin' | 'archive' | 'share') => void
}

const toolbarActions = [
  { label: 'Pin', icon: '📌', action: 'pin' as const },
  { label: 'Archive', icon: '📥', action: 'archive' as const },
]

export function EmailDetail({ email, status, onToolbarAction }: EmailDetailProps) {
  if (!email) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-white/70 dark:border-slate-800 p-8 text-center text-slate-500 dark:text-slate-400">
        Select an email to view details.
      </div>
    )
  }

  return (
    <section
      id="inbox"
      className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-white/70 dark:border-slate-800 p-6 space-y-4"
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Subject</p>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{email.subject}</h2>
          <div className="flex gap-2 mt-2 text-xs">
            {status?.pinned && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Pinned</span>
            )}
            {status?.archived && (
              <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">Archived</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          {toolbarActions.map((action) => (
            <button
              key={action.label}
              onClick={() => onToolbarAction?.(action.action)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs"
            >
              <span>{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>
      </div>
      <div className="text-sm text-slate-600 dark:text-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <p>
          <span className="text-slate-500 dark:text-slate-400">From:</span>{' '}
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {email.from_name} &lt;{email.from_email}&gt;
          </span>
        </p>
        <p>
          <span className="text-slate-500 dark:text-slate-400">To:</span>{' '}
          <span className="font-medium text-slate-900 dark:text-slate-100">{email.to_email}</span>
        </p>
        <p>
          <span className="text-slate-500 dark:text-slate-400">Date:</span>{' '}
          <span className="text-slate-900 dark:text-slate-100">{new Date(email.date).toLocaleString()}</span>
        </p>
      </div>
      <div className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-line bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 min-h-[220px]">
        {email.body}
      </div>
    </section>
  )
}

