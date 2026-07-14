import { useState, useEffect } from 'react'
import { journalApi } from '../../api/client'
import { useOffline } from '../../contexts/OfflineContext'
import { useTracker } from '../../contexts/ActivityTrackerContext'
import useFeatureDuration from '../../hooks/useFeatureDuration'
import ThemeLoader from '../../components/ThemeLoader'
import FeatureBanner from '../../components/FeatureBanner'

const MOODS = [
  { value: 'happy',   emoji: '😄', label: 'Happy',   color: '#f59e0b', bg: '#fffbeb' },
  { value: 'excited', emoji: '🤩', label: 'Excited',  color: '#ec4899', bg: '#fdf2f8' },
  { value: 'proud',   emoji: '🥰', label: 'Proud',    color: '#10b981', bg: '#ecfdf5' },
  { value: 'curious', emoji: '🤔', label: 'Curious',  color: '#0ea5e9', bg: '#f0f9ff' },
  { value: 'calm',    emoji: '😌', label: 'Calm',     color: '#14b8a6', bg: '#f0fdfa' },
  { value: 'tired',   emoji: '😴', label: 'Tired',    color: '#6366f1', bg: '#eef2ff' },
  { value: 'sad',     emoji: '😢', label: 'Sad',      color: '#64748b', bg: '#f8fafc' },
  { value: 'grumpy',  emoji: '😤', label: 'Grumpy',   color: '#ef4444', bg: '#fef2f2' },
  { value: 'silly',   emoji: '🤪', label: 'Silly',    color: '#8b5cf6', bg: '#f5f3ff' },
]

function moodFor(value) {
  return MOODS.find(m => m.value === value) || MOODS[0]
}

export default function Journal({ child, featureConfig }) {
  const { track } = useTracker()
  useFeatureDuration('journal', track)
  const offline = useOffline()
  const [entries, setEntries]     = useState([])
  const [content, setContent]     = useState('')
  const [mood, setMood]           = useState('')
  const [milestone, setMilestone] = useState('')
  const [saving, setSaving]       = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError]     = useState('')

  const journalAiEnabled = (() => {
    if (!featureConfig) return true
    const fc = featureConfig.find(f => f.featureName === 'journal-ai')
    return !fc || fc.enabled !== false
  })()

  useEffect(() => {
    journalApi.getByChild(child.id).then(setEntries).catch(() => {})
  }, [child.id])

  async function handleSave(e) {
    e.preventDefault()
    if (!content.trim()) return
    setSaving(true)
    try {
      const entry = await journalApi.create({ childId: child.id, content, mood, milestone })
      track('journal', 'save')
      setEntries(prev => [entry, ...prev])
      setContent(''); setMood(''); setMilestone('')
    } finally { setSaving(false) }
  }

  async function handleAi() {
    if (offline || !journalAiEnabled) return
    setAiLoading(true); setAiError('')
    try {
      const result = await journalApi.generateAiEntry(child.id)
      track('journal', 'ai_generate')
      setContent(result.content || '')
      if (result.mood)      setMood(result.mood)
      if (result.milestone) setMilestone(result.milestone)
      window.__glumbiRefreshQuota?.()
    } catch {
      setAiError('Could not generate entry. Try again.')
    } finally { setAiLoading(false) }
  }

  async function handleDelete(id) {
    await journalApi.delete(id)
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  return (
    <>
    <FeatureBanner feature="journal" child={child} isMobile={window.innerWidth < 1024} />
    <div style={{ maxWidth: 920, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 24, paddingTop: 16 }}>
      {aiLoading && <ThemeLoader theme={child.theme} />}

      {/* Compose area */}
      <div style={{ background: 'white', borderRadius: 20, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
        {/* Diary header strip */}
        <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ color: 'white', fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 15 }}>
            📖 {child.name}'s Journal
          </div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 600 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>

        <form onSubmit={handleSave} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Textarea */}
          <textarea
            placeholder={journalAiEnabled && !offline
              ? `What happened today with ${child.name}? Or hit "Write with AI" ✨`
              : `What happened today with ${child.name}?`}
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={5}
            style={{ resize: 'vertical', border: 'none', outline: 'none', fontSize: 15, lineHeight: 1.8,
              fontFamily: 'Nunito, sans-serif', color: '#333', background: '#fafafa',
              borderRadius: 12, padding: '14px 16px', width: '100%', boxSizing: 'border-box' }}
            required
          />

          {/* Mood pills */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#aaa', marginBottom: 8, letterSpacing: 0.5 }}>TODAY'S MOOD</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {MOODS.map(m => (
                <button key={m.value} type="button" onClick={() => setMood(mood === m.value ? '' : m.value)}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 50,
                    border: `2px solid ${mood === m.value ? m.color : '#e8e8e8'}`,
                    background: mood === m.value ? m.bg : 'white',
                    cursor: 'pointer', fontSize: 13, fontWeight: 700,
                    color: mood === m.value ? m.color : '#888', transition: 'all 0.15s' }}>
                  {m.emoji} {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Milestone */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fafafa', borderRadius: 10, padding: '10px 14px' }}>
            <span style={{ fontSize: 16 }}>🏆</span>
            <input
              placeholder="Milestone tag (optional) — e.g. first match game, new word learned"
              value={milestone}
              onChange={e => setMilestone(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1,
                fontSize: 13, fontFamily: 'Nunito, sans-serif', color: '#555', fontWeight: 600 }}
            />
          </div>

          {aiError && (
            <div style={{ fontSize: 13, color: '#e74c3c', background: '#fdecea', padding: '8px 12px', borderRadius: 8 }}>{aiError}</div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10 }}>
            {journalAiEnabled && (
              <button type="button" onClick={handleAi} disabled={offline || aiLoading}
                style={{ flex: 1, padding: '11px', fontSize: 14, fontWeight: 700, borderRadius: 50, border: '2px solid var(--primary)',
                  background: 'white', color: offline ? '#aaa' : 'var(--primary)',
                  cursor: offline ? 'not-allowed' : 'pointer', borderColor: offline ? '#ddd' : 'var(--primary)' }}>
                {aiLoading ? <><span className="spinner" /> Generating…</> : offline ? '✈️ AI is off' : '✨ Write with AI'}
              </button>
            )}
            <button type="submit" disabled={saving || !content.trim()}
              style={{ flex: 1, padding: '11px', fontSize: 14, fontWeight: 700, borderRadius: 50, border: 'none',
                background: content.trim() ? 'linear-gradient(135deg, var(--primary), var(--accent))' : '#eee',
                color: content.trim() ? 'white' : '#aaa', cursor: content.trim() ? 'pointer' : 'not-allowed' }}>
              {saving ? <><span className="spinner" /> Saving…</> : '📌 Pin This Moment'}
            </button>
          </div>
        </form>
      </div>

      {/* Timeline */}
      {entries.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#aaa', letterSpacing: 0.5 }}>PAST ENTRIES</div>
          {entries.map(entry => {
            const m = moodFor(entry.mood)
            return (
              <div key={entry.id} style={{ display: 'flex', gap: 0, background: 'white', borderRadius: 16, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
                {/* Mood colour bar */}
                <div style={{ width: 6, flexShrink: 0, background: entry.mood ? m.color : 'var(--primary-lt)' }} />
                <div style={{ flex: 1, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      {entry.mood && (
                        <span style={{ fontSize: 13, fontWeight: 700, color: m.color, background: m.bg,
                          padding: '2px 10px', borderRadius: 50 }}>
                          {m.emoji} {m.label}
                        </span>
                      )}
                      {entry.milestone && (
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', background: '#fffbeb',
                          padding: '2px 10px', borderRadius: 50 }}>
                          🏆 {entry.milestone}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <span style={{ fontSize: 11, color: '#bbb', whiteSpace: 'nowrap' }}>
                        {new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <button onClick={() => handleDelete(entry.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ddd', fontSize: 16, lineHeight: 1, padding: 0 }}>✕</button>
                    </div>
                  </div>
                  <p style={{ lineHeight: 1.7, color: '#444', fontSize: 14, margin: 0 }}>{entry.content}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {entries.length === 0 && (
        <div style={{ textAlign: 'center', color: '#bbb', padding: 40, fontSize: 14 }}>
          No entries yet — start capturing memories! 🌸
        </div>
      )}
    </div>
    </>
  )
}
