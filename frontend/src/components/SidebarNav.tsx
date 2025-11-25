// Static navigation column linking to each major dashboard section.
const navItems = [
  { label: 'Inbox', href: '#inbox' },
  { label: 'Prompt Brain', href: '#prompt-brain' },
  { label: 'Drafts', href: '#drafts' },
  { label: 'Email Agent', href: '#email-agent' },
]

export function SidebarNav() {
  return (
    <aside className="hidden lg:flex flex-col w-60 bg-white dark:bg-slate-900 shadow-xl border-r border-slate-100 dark:border-slate-800">
      <div className="px-6 py-6 border-b border-slate-100 dark:border-slate-800">
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">Navigation</p>
        <p className="text-lg font-semibold text-slate-900 dark:text-white">Email Assistant</p>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="block px-4 py-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-800 dark:hover:text-white transition"
          >
            {item.label}
          </a>
        ))}
      </nav>
      <div className="px-4 py-6 border-t border-slate-100 dark:border-slate-800">
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-sm text-slate-600 dark:text-slate-300">
          <p className="font-semibold text-slate-900 dark:text-white mb-1">Need ideas?</p>
          <p>Ask the Email Agent to summarize, plan next steps, or draft responses.</p>
        </div>
      </div>
    </aside>
  )
}

