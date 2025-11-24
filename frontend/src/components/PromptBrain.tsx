import { useEffect, useState } from 'react'
import {
  createPromptTemplate,
  deletePromptTemplate,
  fetchPromptTemplates,
  updatePromptTemplate,
} from '../api'
import { PromptTemplate } from '../types'

const blankPrompt = {
  name: '',
  description: '',
  template: '',
  type: 'custom',
}

export function PromptBrain() {
  const [prompts, setPrompts] = useState<PromptTemplate[]>([])
  const [selected, setSelected] = useState<PromptTemplate | null>(null)
  const [form, setForm] = useState(blankPrompt)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    refresh()
  }, [])

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchPromptTemplates()
      setPrompts(data)
      if (selected) {
        const updated = data.find((p) => p.id === selected.id)
        setSelected(updated || null)
        if (updated) {
          setForm({
            name: updated.name,
            description: updated.description ?? '',
            template: updated.template,
            type: updated.type,
          })
        }
      }
    } catch (err: any) {
      console.error('Failed to load prompts:', err)
      const errorMessage = err?.response?.data?.error || err?.message || 'Failed to load prompts. Make sure the backend server is running.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (prompt: PromptTemplate) => {
    setSelected(prompt)
    setForm({
      name: prompt.name,
      description: prompt.description ?? '',
      template: prompt.template,
      type: prompt.type,
    })
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      if (selected) {
        const updated = await updatePromptTemplate(selected.id, form)
        setSelected(updated)
      } else {
        await createPromptTemplate(form)
      }
      setForm(blankPrompt)
      setSelected(null)
      await refresh()
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to save prompt')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selected) return
    setSaving(true)
    try {
      await deletePromptTemplate(selected.id)
      setSelected(null)
      setForm(blankPrompt)
      await refresh()
    } catch (err) {
      setError('Failed to delete prompt')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section
      id="prompt-brain"
      className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-white/70 dark:border-slate-800 h-full flex flex-col"
    >
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Prompt Brain</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Manage templates that drive email intelligence</p>
        </div>
        <button
          onClick={() => {
            setSelected(null)
            setForm(blankPrompt)
          }}
          className="text-xs px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          New Prompt
        </button>
      </div>
      {error && <p className="px-4 py-2 text-sm text-red-500">{error}</p>}
      <div className="flex flex-1 overflow-hidden divide-x divide-slate-100 dark:divide-slate-800">
        <div className="w-1/2 overflow-y-auto">
          {loading && <p className="p-4 text-sm text-slate-500 dark:text-slate-400">Loading prompts...</p>}
          {!loading &&
            prompts.map((prompt) => (
              <button
                key={prompt.id}
                onClick={() => handleSelect(prompt)}
                className={`w-full text-left px-5 py-4 flex flex-col gap-1 border-b border-slate-50 hover:bg-slate-50 dark:hover:bg-slate-800 ${
                  selected?.id === prompt.id ? 'bg-indigo-50 dark:bg-slate-800' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{prompt.name}</p>
                  <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300">
                    {prompt.type}
                  </span>
                </div>
                {prompt.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{prompt.description}</p>
                )}
              </button>
            ))}
        </div>
        <div className="w-1/2 p-5 overflow-y-auto bg-slate-50 dark:bg-slate-900">
          <div className="space-y-3 text-sm">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleInput}
                placeholder="Auto Reply Draft"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Description
              </label>
              <input
                name="description"
                value={form.description}
                onChange={handleInput}
                placeholder="Explain what this prompt does"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Type</label>
              <input
                name="type"
                value={form.type}
                onChange={handleInput}
                placeholder="categorization / reply / custom"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Template</label>
              <textarea
                name="template"
                value={form.template}
                onChange={handleInput}
                rows={10}
                placeholder="Prompt instructions with {placeholders}"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-200 font-mono"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving || !form.name || !form.template || !form.type}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50"
              >
                {saving ? 'Saving...' : selected ? 'Update Prompt' : 'Create Prompt'}
              </button>
              {selected && (
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="px-4 py-2 border border-red-200 dark:border-red-400 text-red-600 dark:text-red-300 rounded-lg text-sm"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

