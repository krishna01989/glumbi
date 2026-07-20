import { useState, useEffect } from 'react'
import { journalApi } from '../../api/client'
import { useOffline } from '../../contexts/OfflineContext'
import { useTracker } from '../../contexts/ActivityTrackerContext'
import useFeatureDuration from '../../hooks/useFeatureDuration'
import ThemeLoader from '../../components/ThemeLoader'
import FeatureBanner from '../../components/FeatureBanner'
import QuotaBanner from '../../components/QuotaBanner'
import HistoryDrawer, { fmtDate } from '../../components/HistoryDrawer'
import { MOODS, moodFor } from '../../constants/moods'

export default function Journal({ child, featureConfig, quota }) {
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
      window.__glumbiRefreshQuota?.('journal-ai')
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
    <QuotaBanner quota={quota} />
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
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {MOODS.map(m => {
                const selected = mood === m.value
                return (
                  <button key={m.value} type="button" onClick={() => setMood(selected ? '' : m.value)}
                    title={m.label}
                    style={{ display: 'flex', alignItems: 'center', gap: selected ? 4 : 0,
                      padding: selected ? '5px 12px' : '5px 8px', borderRadius: 50,
                      border: `2px solid ${selected ? m.color : '#e8e8e8'}`,
                      background: selected ? m.bg : 'white',
                      cursor: 'pointer', fontSize: selected ? 13 : 18, fontWeight: 700,
                      color: selected ? m.color : '#888', transition: 'all 0.15s' }}>
                    {m.emoji}{selected && <span style={{ fontSize: 13 }}>{m.label}</span>}
                  </button>
                )
              })}
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
                {aiLoading ? <><span className="spinner" /> Generating…</> : offline ? '✈️ ✨ Write with AI' : '✨ Write with AI'}
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

      {entries.length === 0 && (
        <div style={{ textAlign: 'center', color: '#bbb', padding: 40, fontSize: 14 }}>
          No entries yet — start capturing memories! 🌸
        </div>
      )}

      <HistoryDrawer icon="📝" title="Past Entries" count={entries.length}>
        {() => entries.map(entry => {
          const m = moodFor(entry.mood) || MOODS[0]
          return (
            <div key={entry.id} style={{ display: 'flex', gap: 0, background: 'white', borderRadius: 16, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
              <div style={{ width: 6, flexShrink: 0, background: entry.mood ? m.color : 'var(--primary-lt)' }} />
              <div style={{ flex: 1, padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {entry.mood && (
                      <span style={{ fontSize: 13, fontWeight: 700, color: m.color, background: m.bg, padding: '2px 10px', borderRadius: 50 }}>
                        {m.emoji} {m.label}
                      </span>
                    )}
                    {entry.milestone && (
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', background: '#fffbeb', padding: '2px 10px', borderRadius: 50 }}>
                        🏆 {entry.milestone}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: 11, color: '#bbb', whiteSpace: 'nowrap' }}>
                      {fmtDate(entry.createdAt)}
                    </span>
                    <button onClick={() => handleDelete(entry.id)}
                      className="btn-danger" style={{ width: 28, height: 28, minWidth: 28, minHeight: 28, borderRadius: '50%', padding: 0, fontSize: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                  </div>
                </div>
                <p style={{ lineHeight: 1.7, color: '#444', fontSize: 14, margin: 0 }}>{entry.content}</p>
              </div>
            </div>
          )
        })}
      </HistoryDrawer>
    </div>
    </>
  )
}
