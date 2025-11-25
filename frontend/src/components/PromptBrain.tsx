import { useEffect, useState } from 'react'
import {
  createPromptTemplate,
  deletePromptTemplate,
  fetchPromptTemplates,
  updatePromptTemplate,
} from '../api'
import { PromptTemplate } from '../types'

// UI for editing the prompt templates driving all LLM calls.
export function PromptBrain() {
  const [prompts, setPrompts] = useState<PromptTemplate[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    template: '',
    type: 'custom',
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPrompts()
  }, [])

  const loadPrompts = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchPromptTemplates()
      setPrompts(data)
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].id)
        setForm({
          name: data[0].name,
          description: data[0].description || '',
          template: data[0].template,
          type: data[0].type,
        })
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load prompts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedId) {
      const prompt = prompts.find((p) => p.id === selectedId)
      if (prompt) {
        setForm({
          name: prompt.name,
          description: prompt.description || '',
          template: prompt.template,
          type: prompt.type,
        })
      }
    } else {
      setForm({
        name: '',
        description: '',
        template: '',
        type: 'custom',
      })
    }
  }, [selectedId, prompts])

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleSelect = (id: number) => {
    setSelectedId(id)
    setError(null)
  }

  const handleNew = () => {
    setSelectedId(null)
    setForm({
      name: '',
      description: '',
      template: '',
      type: 'custom',
    })
    setError(null)
  }

  const handleSave = async () => {
    if (!form.name || !form.template || !form.type) {
      setError('Name, template, and type are required')
      return
    }

    setSaving(true)
    setError(null)
    try {
      if (selectedId) {
        await updatePromptTemplate(selectedId, form)
        await loadPrompts()
      } else {
        const newPrompt = await createPromptTemplate(form)
        await loadPrompts()
        setSelectedId(newPrompt.id)
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save prompt')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedId) return
    if (!confirm(`Delete "${form.name}"?`)) return

    try {
      await deletePromptTemplate(selectedId)
      await loadPrompts()
      setSelectedId(null)
      setForm({
        name: '',
        description: '',
        template: '',
        type: 'custom',
      })
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete prompt')
    }
  }

  const selectedPrompt = prompts.find((p) => p.id === selectedId)

  return (
    <section
      id="prompt-brain"
      className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-white/70 dark:border-slate-800 overflow-hidden flex flex-col h-full"
    >
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-slate-800">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Prompt Brain</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Manage prompt templates for LLM operations
        </p>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Prompt List */}
        <div className="w-1/3 border-r border-slate-100 dark:border-slate-800 flex flex-col">
          <div className="p-3 border-b border-slate-100 dark:border-slate-800">
            <button
              onClick={handleNew}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              + New Template
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">Loading...</div>
            ) : prompts.length === 0 ? (
              <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">
                No templates yet
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {prompts.map((prompt) => (
                  <button
                    key={prompt.id}
                    onClick={() => handleSelect(prompt.id)}
                    className={`w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition ${
                      selectedId === prompt.id
                        ? 'bg-indigo-50 dark:bg-slate-800 border-l-4 border-indigo-600'
                        : ''
                    }`}
                  >
                    <div className="font-medium text-slate-900 dark:text-white">{prompt.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {prompt.type}
                    </div>
                    {prompt.description && (
                      <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                        {prompt.description}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {error && (
            <div className="mx-4 mt-4 px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleInput}
                placeholder="e.g., Categorization Prompt"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Type *
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleInput}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="categorization">Categorization</option>
                <option value="action_extraction">Action Extraction</option>
                <option value="auto_reply">Auto Reply</option>
                <option value="summarization">Summarization</option>
                <option value="priority">Priority Assessment</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <input
                type="text"
                name="description"
                value={form.description}
                onChange={handleInput}
                placeholder="Optional description"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex-1 flex flex-col min-h-[300px]">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Template *
              </label>
              <textarea
                name="template"
                value={form.template}
                onChange={handleInput}
                placeholder="Enter your prompt template here..."
                className="flex-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono resize-none"
              />
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {saving ? 'Saving...' : selectedId ? 'Update' : 'Create'}
            </button>
            {selectedId && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

