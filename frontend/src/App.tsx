import { useEffect, useMemo, useState } from 'react'
import { fetchEmails, markEmailAsRead } from './api'
import { Email, EmailInsights } from './types'
import { InboxList } from './components/InboxList'
import { EmailDetail } from './components/EmailDetail'
import { EmailActions } from './components/EmailActions'
import { PromptBrain } from './components/PromptBrain'
import { DraftManager } from './components/DraftManager'
import { ChatAgent } from './components/ChatAgent'
import { SidebarNav } from './components/SidebarNav'

type EmailStatus = {
  pinned?: boolean
  archived?: boolean
}

/**
 * Top-level page shell. Manages global e-mail state, dark mode, and the
 * orchestration between inbox, detail pane, prompts, drafts, and the chat agent.
 */
function App() {
  const [emails, setEmails] = useState<Email[]>([])
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [emailInsights, setEmailInsights] = useState<EmailInsights>({})
  const [loadingEmails, setLoadingEmails] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('pd-email-dark') === 'true'
  })
  const [emailStatuses, setEmailStatuses] = useState<Record<number, EmailStatus>>({})
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    loadEmails()
  }, [])

  const loadEmails = async () => {
    setLoadingEmails(true)
    try {
      const data = await fetchEmails()
      setEmails(data)
      if (selectedEmail) {
        const refreshed = data.find((email) => email.id === selectedEmail.id) || null
        setSelectedEmail(refreshed)
      }
    } finally {
      setLoadingEmails(false)
    }
  }

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('pd-email-dark', String(isDarkMode))
  }, [isDarkMode])

  const handleSelectEmail = async (email: Email) => {
    setSelectedEmail(email)
    setEmailInsights({})
    if (!email.read) {
      await markEmailAsRead(email.id)
      await loadEmails()
    }
  }

  const handleEmailToolbarAction = (email: Email, action: 'pin' | 'archive') => {
    let nextMessage = ''
    setEmailStatuses((prev) => {
      const current = prev[email.id] || {}
      const updated: EmailStatus = { ...current }
      switch (action) {
        case 'pin':
          updated.pinned = !current.pinned
          nextMessage = updated.pinned ? 'Pinned this email.' : 'Unpinned this email.'
          break
        case 'archive':
          updated.archived = !current.archived
          nextMessage = updated.archived ? 'Archived email.' : 'Restored email from archive.'
          if (updated.archived && selectedEmail?.id === email.id) {
            setSelectedEmail(null)
          }
          break
      }
      return { ...prev, [email.id]: updated }
    })

    if (nextMessage) {
      setToastMessage(nextMessage)
      setTimeout(() => setToastMessage(null), 2500)
    }
  }

  const sortedEmails = useMemo(() => {
    const order = new Map<number, number>()
    emails.forEach((mail, index) => order.set(mail.id, index))
    return emails
      .filter((mail) => !emailStatuses[mail.id]?.archived)
      .sort((a, b) => {
        const aPinned = emailStatuses[a.id]?.pinned ? 1 : 0
        const bPinned = emailStatuses[b.id]?.pinned ? 1 : 0
        if (aPinned !== bPinned) {
          return bPinned - aPinned
        }
        const orderA = order.get(a.id) ?? 0
        const orderB = order.get(b.id) ?? 0
        return orderA - orderB
      })
  }, [emails, emailStatuses])

  const archivedEmails = useMemo(
    () => emails.filter((mail) => emailStatuses[mail.id]?.archived),
    [emails, emailStatuses],
  )

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex text-slate-900 dark:text-slate-100 transition-colors">
      <SidebarNav />

      <div className="flex-1 flex flex-col">
        <header className="bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400 text-white shadow dark:from-slate-800 dark:via-slate-800 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/70">Inbox Intelligence</p>
            <h1 className="text-3xl font-semibold">Prompt-Driven Email Productivity Agent</h1>
            <p className="text-base text-white/80 mt-1">
              Manage a mock inbox, curate prompt templates, run AI workflows, and keep replies in draft mode.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 flex-1 min-w-[180px]">
              <p className="text-white/60 text-xs uppercase tracking-wide">Inbox Health</p>
              <p className="text-white text-xl font-semibold">{sortedEmails.length} emails</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 flex-1 min-w-[180px]">
              <p className="text-white/60 text-xs uppercase tracking-wide">Prompt Brain</p>
              <p className="text-white text-xl font-semibold">Customizable templates</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 flex-1 min-w-[180px]">
              <p className="text-white/60 text-xs uppercase tracking-wide">Draft Safety</p>
              <p className="text-white text-xl font-semibold">Never auto-send</p>
            </div>
            <button
              onClick={() => setIsDarkMode((prev) => !prev)}
              className="px-4 py-3 rounded-xl border border-white/40 text-white text-sm font-semibold"
            >
              {isDarkMode ? 'Switch to Light' : 'Switch to Dark'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1 h-[640px]">
            <InboxList
              emails={sortedEmails}
              selectedEmailId={selectedEmail?.id}
              onSelect={handleSelectEmail}
              refresh={loadEmails}
              loading={loadingEmails}
              statuses={emailStatuses}
            />
          </div>
          <div className="lg:col-span-3 space-y-4">
            <EmailDetail
              email={selectedEmail}
              status={selectedEmail ? emailStatuses[selectedEmail.id] : undefined}
              onToolbarAction={
                selectedEmail ? (action: 'pin' | 'archive') => handleEmailToolbarAction(selectedEmail, action) : undefined
              }
            />
            {selectedEmail && (
              <EmailActions
                email={selectedEmail}
                insights={emailInsights}
                onInsightsChange={(payload) =>
                  setEmailInsights((prev) => ({ ...prev, ...payload }))
                }
                refreshEmails={loadEmails}
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PromptBrain />
          <DraftManager selectedEmail={selectedEmail} replyDraft={emailInsights.replyDraft} />
          <ChatAgent selectedEmail={selectedEmail} />
        </div>
        <div className="grid grid-cols-1">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-white/70 dark:border-slate-800 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Archived Emails</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {archivedEmails.length === 0
                    ? 'No emails are archived.'
                    : 'Restore archived emails back to the inbox.'}
                </p>
              </div>
            </div>
            {archivedEmails.length > 0 && (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {archivedEmails.map((mail) => (
                  <div
                    key={mail.id}
                    className="flex items-center justify-between gap-3 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-800 text-sm"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{mail.subject}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {mail.from_name} • {new Date(mail.date).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleEmailToolbarAction(mail, 'archive')}
                      className="text-xs px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl text-sm text-slate-700 dark:text-slate-200">
          {toastMessage}
        </div>
      )}
      </div>
      </div>
    </div>
  )
}

export default App

