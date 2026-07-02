import { useState, useEffect } from 'react'
import { storyApi, journalApi, activityApi, curiosityApi, readQuizApi, writingApi } from '../api/client'

const TYPE_META = {
  story:    { label: '📖 Story',       dot: '#ff6b6b', textColor: '#ff6b6b',  feature: 'stories' },
  journal:  { label: '📝 Journal',     dot: '#6bcb77', textColor: '#27ae60',  feature: 'journal' },
  activity: { label: '🎮 Activity',    dot: '#4d96ff', textColor: '#2980b9',  feature: 'activities' },
  learn:    { label: '✏️ Learn',       dot: '#f97316', textColor: '#ea580c',  feature: 'learn' },
  curiosity:{ label: '🔍 Curiosity',   dot: '#c77dff', textColor: '#8e44ad',  feature: 'curiosity' },
  readquiz: { label: '📚 Read & Quiz', dot: '#f39c12', textColor: '#e67e22',  feature: 'readquiz' },
  writing:  { label: '✍️ My Writing',  dot: '#2ecc71', textColor: '#27ae60',  feature: 'mywriting' },
}

const PAGE_SIZE = 25

const DATE_PRESETS = [
  { key: 'all',       label: '🌈 All time' },
  { key: 'week',      label: 'Last 7 days' },
  { key: 'thisMonth', label: 'This month' },
  { key: 'lastMonth', label: 'Last month' },
  { key: 'thisYear',  label: 'This year' },
  { key: 'lastYear',  label: 'Last year' },
]

function presetToRange(key) {
  const now = new Date()
  const y = now.getFullYear(), m = now.getMonth()
  switch (key) {
    case 'week':
      return { from: new Date(now - 7 * 86400000), to: now }
    case 'thisMonth':
      return { from: new Date(y, m, 1), to: now }
    case 'lastMonth':
      return { from: new Date(y, m - 1, 1), to: new Date(y, m, 0, 23, 59, 59) }
    case 'thisYear':
      return { from: new Date(y, 0, 1), to: now }
    case 'lastYear':
      return { from: new Date(y - 1, 0, 1), to: new Date(y - 1, 11, 31, 23, 59, 59) }
    default:
      return { from: null, to: null }
  }
}

function toIso(d) { return d ? d.toISOString().slice(0, 19) : undefined }

function enabledFeatureSet(child) {
  if (!child?.enabledFeatures) return null
  try { return new Set(JSON.parse(child.enabledFeatures)) } catch { return null }
}

export default function Timeline({ child }) {
  const [items, setItems]       = useState([])
  const [loading, setLoading]   = useState(false)
  const [typeFilter, setTypeFilter] = useState('all')
  const [datePreset, setDatePreset] = useState('all')
  const [visible, setVisible]   = useState(PAGE_SIZE)

  const enabled = enabledFeatureSet(child)
  const visibleTypes = Object.entries(TYPE_META)
    .filter(([, m]) => !enabled || enabled.has(m.feature))
    .map(([type]) => type)

  useEffect(() => {
    setVisible(PAGE_SIZE)
    loadAll()
  }, [child.id, datePreset])

  async function loadAll() {
    setLoading(true)
    const { from, to } = presetToRange(datePreset)
    const params = { from: toIso(from), to: toIso(to) }

    const fetches = []
    if (!enabled || enabled.has('stories'))    fetches.push(storyApi.getByChild(child.id, params).then(r => r.map(s => ({ ...s, type: 'story' }))))
    if (!enabled || enabled.has('journal'))    fetches.push(journalApi.getByChild(child.id, params).then(r => r.map(j => ({ ...j, type: 'journal' }))))
    if (!enabled || enabled.has('activities') || enabled.has('learn')) fetches.push(activityApi.getByChild(child.id, { ...params, includeLearn: true }).then(r => r.filter(a => {
        if (a.category === 'learn') return !enabled || enabled.has('learn')
        return !enabled || enabled.has('activities')
      }).map(a => ({ ...a, type: a.category === 'learn' ? 'learn' : 'activity' }))))

    if (!enabled || enabled.has('curiosity'))  fetches.push(curiosityApi.getByChild(child.id, params).then(r => r.map(c => ({ ...c, type: 'curiosity' }))))
    if (!enabled || enabled.has('readquiz'))   fetches.push(readQuizApi.getByChild(child.id, params).then(r => r.map(q => ({ ...q, type: 'readquiz' }))))
    if (!enabled || enabled.has('mywriting'))  fetches.push(writingApi.getByChild(child.id, params).then(r => r.map(w => ({ ...w, type: 'writing' }))))

    const results = await Promise.allSettled(fetches)
    const merged = results
      .flatMap(r => r.status === 'fulfilled' ? r.value : [])
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    setItems(merged)
    setLoading(false)
  }

  const activeType = typeFilter === 'all' || visibleTypes.includes(typeFilter) ? typeFilter : 'all'
  const filtered = activeType === 'all' ? items : items.filter(i => i.type === activeType)
  const paged    = filtered.slice(0, visible)

  const grouped = paged.reduce((acc, item) => {
    const key = new Date(item.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  function renderItem(item) {
    switch (item.type) {
      case 'story':
        return <>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{item.title}</div>
          <p style={{ color: '#888', fontSize: 13, lineHeight: 1.6 }}>{item.content?.slice(0, 140)}…</p>
          {item.favorite && <span style={{ fontSize: 12 }}>⭐ Favorite</span>}
        </>
      case 'journal':
        return <>
          {item.milestone && <span className="tag" style={{ marginBottom: 8, display: 'inline-block' }}>🏆 {item.milestone}</span>}
          <p style={{ color: '#444', fontSize: 14, lineHeight: 1.6 }}>{item.content}</p>
          {item.mood && <div style={{ fontSize: 13, marginTop: 6, color: 'var(--muted)' }}>Mood: {item.mood}</div>}
        </>
      case 'activity':
        return <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 24 }}>{item.emoji}</span>
            <span style={{ fontWeight: 700 }}>{item.title}</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>
            {item.completed ? '✅ Completed' : '⏳ Pending'} · {item.duration}
            {item.rating && ' · ' + '⭐'.repeat(item.rating)}
          </div>
        </>
      case 'learn':
        return <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 24 }}>{item.emoji}</span>
            <span style={{ fontWeight: 700 }}>{item.title}</span>
          </div>
          {item.description && <p style={{ color: '#888', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{item.description}</p>}
        </>
      case 'curiosity':
        return <>
          <div style={{ fontWeight: 700, color: '#8e44ad', marginBottom: 4 }}>{item.sticker} {item.question}</div>
          <p style={{ color: '#888', fontSize: 13, lineHeight: 1.6 }}>{item.funFact1?.slice(0, 120)}…</p>
        </>
      case 'readquiz':
        return <>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{item.title}</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <span>📖 {item.topic}</span>
            <span>⏱ {item.readingTime}</span>
            {item.completed
              ? <span style={{ fontWeight: 800, color: item.score === 3 ? '#27ae60' : item.score >= 2 ? '#f39c12' : '#e74c3c' }}>
                  {item.score}/3 {item.score === 3 ? '🏆' : item.score >= 2 ? '⭐' : '💪'}
                </span>
              : <span style={{ color: '#bbb' }}>Quiz not attempted</span>}
          </div>
          {item.lesson && <div style={{ marginTop: 6, fontSize: 12, color: '#e67e22', fontWeight: 700 }}>🌟 {item.lesson}</div>}
        </>
      case 'writing':
        return <>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{item.title || 'Untitled story'}</div>
          <p style={{ color: '#888', fontSize: 13, lineHeight: 1.6 }}>{item.content?.slice(0, 140)}{item.content?.length > 140 ? '…' : ''}</p>
          {item.feedbackReceived && item.badge && (
            <div style={{ fontSize: 12, marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ background: '#e8f8f0', color: '#27ae60', padding: '2px 10px', borderRadius: 50, fontWeight: 700 }}>{item.badge}</span>
              {item.starWord && <span style={{ color: '#888' }}>⭐ Star word: <em>{item.starWord}</em></span>}
            </div>
          )}
        </>
      default: return null
    }
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>

      {/* Date preset filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {DATE_PRESETS.map(p => (
          <button key={p.key} onClick={() => setDatePreset(p.key)}
            style={{
              padding: '6px 14px', borderRadius: 50, fontSize: 12, fontWeight: 700,
              border: 'none', cursor: 'pointer',
              background: datePreset === p.key ? '#333' : '#f0f0f0',
              color: datePreset === p.key ? 'white' : '#666',
            }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Type filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {['all', ...visibleTypes].map(f => (
          <button key={f} onClick={() => { setTypeFilter(f); setVisible(PAGE_SIZE) }}
            style={{
              padding: '6px 16px', borderRadius: 50, fontSize: 13, fontWeight: 700,
              border: 'none', cursor: 'pointer',
              background: activeType === f ? 'var(--primary)' : '#f0ebe6',
              color: activeType === f ? 'white' : '#777',
            }}>
            {f === 'all' ? '🌈 All' : TYPE_META[f].label}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--muted)', alignSelf: 'center' }}>
          {loading ? '…' : `${filtered.length} moments`}
        </span>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
          <div style={{ fontWeight: 700 }}>Loading your moments…</div>
        </div>
      )}

      {!loading && Object.keys(grouped).length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 60 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🌈</div>
          <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: 20 }}>Nothing here yet!</div>
          <div style={{ fontSize: 14, marginTop: 8 }}>
            {datePreset !== 'all'
              ? 'No moments in this time period. Try a different date range.'
              : 'Start adding stories, activities and journal entries'}
          </div>
        </div>
      )}

      {!loading && Object.entries(grouped).map(([month, monthItems]) => (
        <div key={month} style={{ marginBottom: 36 }}>
          <h3 style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 16 }}>
            {month} · {monthItems.length} moments
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingLeft: 24, borderLeft: '3px solid #f0ebe6' }}>
            {monthItems.map(item => {
              const meta = TYPE_META[item.type]
              return (
                <div key={`${item.type}-${item.id}`} className="card" style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute', left: -35, top: 20,
                    width: 16, height: 16, borderRadius: '50%',
                    background: meta.dot, border: '3px solid white',
                    boxShadow: `0 0 0 2px ${meta.dot}`,
                  }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: meta.textColor }}>{meta.label}</span>
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                      {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  {renderItem(item)}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Load more */}
      {!loading && filtered.length > visible && (
        <div style={{ textAlign: 'center', paddingBottom: 32 }}>
          <button onClick={() => setVisible(v => v + PAGE_SIZE)}
            style={{
              padding: '12px 32px', borderRadius: 50, fontWeight: 800, fontSize: 14,
              background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            }}>
            Load {Math.min(PAGE_SIZE, filtered.length - visible)} more moments
          </button>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
            Showing {visible} of {filtered.length}
          </div>
        </div>
      )}
    </div>
  )
}
