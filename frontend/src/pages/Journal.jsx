import { useState, useEffect } from 'react'
import { journalApi } from '../api/client'

const MOODS = [
  { value: 'happy',   label: '😄 Happy' },
  { value: 'excited', label: '🤩 Excited' },
  { value: 'tired',   label: '😴 Tired' },
  { value: 'grumpy',  label: '😤 Grumpy' },
  { value: 'silly',   label: '🤪 Silly' },
]

export default function Journal({ child }) {
  const [entries, setEntries] = useState([])
  const [form, setForm] = useState({ content: '', mood: '', milestone: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => { loadEntries() }, [child.id])

  async function loadEntries() {
    const data = await journalApi.getByChild(child.id)
    setEntries(data)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.content.trim()) return
    setLoading(true)
    try {
      const entry = await journalApi.create({ childId: child.id, ...form })
      setEntries(prev => [entry, ...prev])
      setForm({ content: '', mood: '', milestone: '' })
    } finally { setLoading(false) }
  }

  async function handleDelete(id) {
    await journalApi.delete(id)
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* New entry form */}
      <form className="card" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <h3 style={{ color: 'var(--primary)', fontSize: 15, fontFamily: 'Nunito, sans-serif', fontWeight: 800 }}>📝 New Journal Entry</h3>
        <textarea
          placeholder={`What happened today with ${child.name}?`}
          value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
          rows={3} style={{ resize: 'vertical' }} required />

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 6 }}>Mood</label>
            <select value={form.mood} onChange={e => setForm(f => ({ ...f, mood: e.target.value }))}>
              <option value="">— Select mood —</option>
              {MOODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 6 }}>Milestone tag (optional)</label>
            <input placeholder="e.g. first sentence, new word"
              value={form.milestone} onChange={e => setForm(f => ({ ...f, milestone: e.target.value }))} />
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading || !form.content.trim()}>
          {loading ? <><span className="spinner" />&nbsp;Saving…</> : '💾 Save Entry'}
        </button>
      </form>

      {/* Entries list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {entries.map(entry => (
          <div key={entry.id} className="card" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {entry.mood && (
                  <span style={{ fontSize: 20 }}>
                    {MOODS.find(m => m.value === entry.mood)?.label.split(' ')[0]}
                  </span>
                )}
                {entry.milestone && <span className="tag">🏆 {entry.milestone}</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: '#bbb' }}>
                  {new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <button className="btn-danger" style={{ padding: '4px 10px', fontSize: 12 }}
                  onClick={() => handleDelete(entry.id)}>✕</button>
              </div>
            </div>
            <p style={{ lineHeight: 1.7, color: '#444' }}>{entry.content}</p>
          </div>
        ))}
        {entries.length === 0 && (
          <div style={{ textAlign: 'center', color: '#bbb', padding: 40, fontSize: 14 }}>
            No journal entries yet. Start capturing memories! 🌸
          </div>
        )}
      </div>
    </div>
  )
}
