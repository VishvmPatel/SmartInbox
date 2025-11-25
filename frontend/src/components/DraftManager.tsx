import { useEffect, useState } from 'react'
import { createDraft, deleteDraft, fetchDrafts, updateDraft } from '../api'
import { Draft, Email } from '../types'

// Handles persistence for reply drafts. Keeps the editor in sync with
// whatever the LLM just generated as well as manual user edits.

type DraftManagerProps = {
  selectedEmail: Email | null
  replyDraft?: string
}

const emptyDraft = {
  subject: '',
  to_email: '',
  body: '',
}

export function DraftManager({ selectedEmail, replyDraft }: DraftManagerProps) {
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyDraft)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    loadDrafts()
  }, [])

  useEffect(() => {
    if (selectedEmail) {
      setForm((prev) => ({
        ...prev,
        subject: prev.subject || `Re: ${selectedEmail.subject}`,
        to_email: prev.to_email || selectedEmail.from_email,
      }))
    }
  }, [selectedEmail])

  useEffect(() => {
    if (replyDraft) {
      setForm((prev) => ({
        ...prev,
        body: replyDraft,
      }))
      setMessage('Loaded reply draft into editor.')
    }
  }, [replyDraft])

  const loadDrafts = async () => {
    setLoading(true)
    try {
      const data = await fetchDrafts()
      setDrafts(data)
    } finally {
      setLoading(false)
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEdit = (draft: Draft) => {
    setEditingId(draft.id)
    setForm({
      subject: draft.subject,
      to_email: draft.to_email,
      body: draft.body,
    })
  }

  const resetForm = () => {
    setEditingId(null)
    setForm(emptyDraft)
  }

  const handleSave = async () => {
    if (!form.subject || !form.to_email || !form.body) {
      setMessage('All fields are required.')
      return
    }
    setSaving(true)
    try {
      if (editingId) {
        await updateDraft(editingId, form)
        setMessage('Draft updated.')
      } else {
        await createDraft({
          ...form,
          email_id: selectedEmail?.id ?? null,
        })
        setMessage('Draft saved.')
      }
      resetForm()
      await loadDrafts()
    } catch (err) {
      setMessage('Failed to save draft.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    await deleteDraft(id)
    if (editingId === id) {
      resetForm()
    }
    await loadDrafts()
  }

  return (
    <section
      id="drafts"
      className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-white/70 dark:border-slate-800 h-full flex flex-col"
    >
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Drafts</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Save and edit drafts (never sent automatically)</p>
        </div>
        {selectedEmail && (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Replying to <span className="font-medium text-slate-900 dark:text-white">{selectedEmail.subject}</span>
          </span>
        )}
      </div>
      <div className="flex flex-col gap-4 p-4">
        {message && <p className="text-xs text-slate-500">{message}</p>}
        <div className="space-y-2">
          <input
            name="subject"
            value={form.subject}
            onChange={handleInput}
            placeholder="Subject"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100"
          />
          <input
            name="to_email"
            value={form.to_email}
            onChange={handleInput}
            placeholder="Recipient"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100"
          />
          <textarea
            name="body"
            value={form.body}
            onChange={handleInput}
            rows={5}
            placeholder="Draft body"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingId ? 'Update Draft' : 'Save Draft'}
            </button>
            {editingId && (
              <button onClick={resetForm} className="px-4 py-2 border border-slate-200 rounded-lg text-sm">
                Cancel
              </button>
            )}
          </div>
        </div>
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {loading && <p className="p-3 text-sm text-slate-500 dark:text-slate-400">Loading drafts...</p>}
          {!loading && drafts.length === 0 && (
            <p className="p-3 text-sm text-slate-500 dark:text-slate-400">No drafts saved yet.</p>
          )}
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="border border-slate-100 dark:border-slate-800 rounded-xl p-3 bg-slate-50 dark:bg-slate-800 text-sm space-y-1"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900 dark:text-white truncate">{draft.subject}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <button onClick={() => handleEdit(draft)} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(draft.id)} className="hover:text-red-600 dark:hover:text-red-400">
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 overflow-hidden text-ellipsis h-10">{draft.body}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Updated {new Date(draft.updated_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

