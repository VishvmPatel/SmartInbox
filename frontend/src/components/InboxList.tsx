import { Email } from '../types'

// Sidebar list that mirrors the inbox hierarchy plus pin badges.
type InboxListProps = {
  emails: Email[]
  selectedEmailId?: number | null
  onSelect: (email: Email) => void
  refresh: () => void
  loading?: boolean
  statuses?: Record<number, { pinned?: boolean }>
}

const badgeColor = {
  urgent: 'bg-rose-100 text-rose-600',
  work: 'bg-indigo-100 text-indigo-600',
  finance: 'bg-amber-100 text-amber-600',
  personal: 'bg-emerald-100 text-emerald-600',
  newsletter: 'bg-slate-100 text-slate-600',
}

function nameInitial(name: string) {
  return name.charAt(0).toUpperCase()
}

export function InboxList({
  emails,
  selectedEmailId,
  onSelect,
  refresh,
  loading,
  statuses,
}: InboxListProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-white/70 dark:border-slate-800 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900">
        <div>
          <p className="text-base font-semibold text-slate-900 dark:text-white">Inbox</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{emails.length} messages</p>
        </div>
        <button
          onClick={refresh}
          className="text-xs px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition"
        >
          Refresh
        </button>
      </div>
      <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800">
        {loading && <div className="p-6 text-sm text-slate-500 dark:text-slate-400">Loading emails...</div>}
        {!loading && emails.length === 0 && (
          <div className="p-6 text-sm text-slate-500 dark:text-slate-400">No emails available.</div>
        )}
        {!loading &&
          emails.map((email) => {
            const isSelected = email.id === selectedEmailId
            const categoryClass =
              (email.category && badgeColor[email.category as keyof typeof badgeColor]) ||
              'bg-slate-100 text-slate-600'
            const status = statuses?.[email.id]
            return (
              <button
                key={email.id}
                onClick={() => onSelect(email)}
                className={`w-full text-left px-5 py-4 flex gap-3 transition ${
                  isSelected
                    ? 'bg-indigo-50/80 dark:bg-slate-800 border-l-4 border-indigo-500 dark:border-indigo-400'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold">
                  {nameInitial(email.from_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {status?.pinned && <span className="text-xs text-amber-500">★</span>}
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {email.from_name}
                      </p>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(email.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 truncate">{email.subject}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 overflow-hidden text-ellipsis h-10">
                    {email.body}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    {email.category && (
                      <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${categoryClass}`}>
                        {email.category}
                      </span>
                    )}
                    {email.priority && (
                      <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200">
                        {email.priority}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
      </div>
    </div>
  )
}

