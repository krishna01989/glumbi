import { useState, useEffect } from 'react'
import { activityApi } from '../api/client'
import ThemeLoader from '../components/ThemeLoader'

const TIMES   = [{ value: 'morning', label: '🌅 Morning' }, { value: 'afternoon', label: '☀️ Afternoon' }, { value: 'evening', label: '🌙 Evening' }]
const WEATHERS = [{ value: 'sunny', label: '☀️ Sunny' }, { value: 'cloudy', label: '⛅ Cloudy' }, { value: 'rainy', label: '🌧️ Rainy' }, { value: 'windy', label: '💨 Windy' }, { value: 'snowy', label: '❄️ Snowy' }]

const CATEGORY_COLORS = {
  indoor:   { bg: '#e8f4fd', color: '#2980b9', icon: '🏠' },
  outdoor:  { bg: '#e8f8e8', color: '#27ae60', icon: '🌳' },
  creative: { bg: '#fef0f8', color: '#8e44ad', icon: '🎨' },
  learning: { bg: '#fef9e0', color: '#d68910', icon: '📚' },
}

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1,2,3,4,5].map(n => (
        <span key={n} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          style={{ fontSize: 22, cursor: 'pointer', opacity: n <= (hover || value) ? 1 : 0.3, transition: 'opacity 0.1s' }}>
          ⭐
        </span>
      ))}
    </div>
  )
}

export default function Activities({ child }) {
  const [activities, setActivities] = useState([])
  const [loading, setLoading]       = useState(false)
  const [substituting, setSubstituting] = useState(null) // id being substituted
  const [timeOfDay, setTimeOfDay]   = useState(getTimeOfDay())
  const [weather, setWeather]       = useState('sunny')
  const [ratings, setRatings]       = useState({})

  useEffect(() => { loadActivities() }, [child.id])

  function getTimeOfDay() {
    const h = new Date().getHours()
    if (h < 12) return 'morning'
    if (h < 17) return 'afternoon'
    return 'evening'
  }

  async function loadActivities() {
    const data = await activityApi.getByChild(child.id)
    setActivities(data)
  }

  async function handleGenerate() {
    setLoading(true)
    setActivities(prev => prev.filter(a => a.completed))
    try {
      await activityApi.deletePending(child.id)
      const newOnes = await activityApi.generate({ childId: child.id, timeOfDay, weather, count: 3 })
      setActivities(prev => [...newOnes, ...prev])
      window.__glumbiRefreshQuota?.()
    } finally { setLoading(false) }
  }

  async function handleRefresh() {
    setLoading(true)
    setActivities(prev => prev.filter(a => a.completed))
    try {
      await activityApi.deletePending(child.id)
      const newOnes = await activityApi.generate({ childId: child.id, timeOfDay, weather, count: 3 })
      setActivities(prev => [...newOnes, ...prev])
      window.__glumbiRefreshQuota?.()
    } finally { setLoading(false) }
  }

  async function handleRemove(id) {
    await activityApi.delete(id)
    setActivities(prev => prev.filter(a => a.id !== id))
  }

  async function handleClearAll() {
    setActivities(prev => prev.filter(a => a.completed))
    await activityApi.deletePending(child.id)
  }

  async function handleComplete(id) {
    const rating = ratings[id] || null
    const updated = await activityApi.markComplete(id, rating)
    setActivities(prev => prev.map(a => a.id === id ? updated : a))
  }

  async function handleDelete(id) {
    const wasActivity = activities.find(a => a.id === id)
    await activityApi.delete(id)
    setActivities(prev => prev.filter(a => a.id !== id))
    // auto-substitute if it was a pending activity
    if (wasActivity && !wasActivity.completed) {
      setSubstituting(id)
      try {
        const [replacement] = await activityApi.generate({ childId: child.id, timeOfDay, weather, count: 1 })
        setActivities(prev => [replacement, ...prev])
        window.__glumbiRefreshQuota?.()
      } catch { /* silent — no substitute if quota/rate hit */ }
      finally { setSubstituting(null) }
    }
  }

  const pending   = activities.filter(a => !a.completed)
  const completed = activities.filter(a => a.completed)

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Generator */}
      <div className="card" style={{ background: 'linear-gradient(135deg,#fff9f0,#f0fff0)', border: '2px dashed #b8e0c8' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 28 }}>🎮</span>
          <h3 style={{ fontSize: 18, color: '#27ae60', fontFamily: 'Fredoka One, cursive' }}>What shall we do today?</h3>
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, display: 'block', marginBottom: 8 }}>TIME OF DAY</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {TIMES.map(t => (
                <button key={t.value} type="button" onClick={() => setTimeOfDay(t.value)}
                  style={{ flex: 1, padding: '8px 4px', fontSize: 12, borderRadius: 10,
                    background: timeOfDay === t.value ? '#27ae60' : '#f0f0f0',
                    color: timeOfDay === t.value ? 'white' : '#555' }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, display: 'block', marginBottom: 8 }}>WEATHER</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {WEATHERS.map(w => (
                <button key={w.value} type="button" onClick={() => setWeather(w.value)}
                  style={{ flex: 1, padding: '8px 4px', fontSize: 12, borderRadius: 10,
                    background: weather === w.value ? '#4d96ff' : '#f0f0f0',
                    color: weather === w.value ? 'white' : '#555' }}>
                  {w.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-green" onClick={handleGenerate} disabled={loading || !!substituting} style={{ flex: 1, fontSize: 16 }}>
            {loading ? <><span className="spinner" />&nbsp;Finding fun ideas…</> : '🎲 Suggest 3 Activities'}
          </button>
          {pending.length > 0 && (
            <button onClick={handleRefresh} disabled={loading || !!substituting}
              title="Replace all pending activities with a fresh set"
              style={{
                padding: '12px 16px', borderRadius: 50, fontSize: 14, fontWeight: 800,
                background: '#f0f9f4', color: '#27ae60', border: '2px solid #b8e0c8',
                cursor: loading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
              }}>
              🔄 Refresh
            </button>
          )}
        </div>
      </div>

      {loading && <ThemeLoader theme={child.theme} />}

      {/* Pending activities */}
      {!loading && pending.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ fontFamily: 'Fredoka One, cursive', fontSize: 18, color: 'var(--text)', margin: 0 }}>
              🌟 Today's Activities
            </h3>
            <button onClick={handleClearAll}
              style={{ fontSize: 12, fontWeight: 700, color: '#e53935', background: '#fff0f0', border: '1.5px solid #ffcdd2', borderRadius: 20, padding: '5px 14px', cursor: 'pointer' }}>
              🗑 Clear all
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px,1fr))', gap: 16 }}>
            {pending.map(a => {
              const cat = CATEGORY_COLORS[a.category] || CATEGORY_COLORS.indoor
              return (
                <div key={a.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 36 }}>{a.emoji}</span>
                    <span style={{ background: cat.bg, color: cat.color, padding: '3px 10px', borderRadius: 50, fontSize: 11, fontWeight: 700 }}>
                      {cat.icon} {a.category}
                    </span>
                  </div>
                  <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: 17 }}>{a.title}</div>
                  <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6, flex: 1 }}>{a.description}</p>
                  <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>⏱ {a.duration}</div>

                  <div style={{ borderTop: '1px solid #f0ebe6', paddingTop: 12 }}>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Rate before completing:</div>
                    <StarRating value={ratings[a.id] || 0} onChange={v => setRatings(r => ({ ...r, [a.id]: v }))} />
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-green" style={{ flex: 1, padding: '8px', fontSize: 13 }}
                      onClick={() => handleComplete(a.id)}>✓ Done!</button>
                    <button className="btn-danger" style={{ padding: '8px 12px', fontSize: 13 }}
                      disabled={!!substituting}
                      onClick={() => handleDelete(a.id)}
                      title="Remove and get a replacement">
                      {substituting === a.id ? '…' : '↻ Swap'}
                    </button>
                    <button onClick={() => handleRemove(a.id)}
                      title="Remove activity"
                      style={{ padding: '8px 10px', fontSize: 13, background: '#f5f5f5', border: '1.5px solid #e0e0e0', borderRadius: 10, cursor: 'pointer', color: '#999', fontWeight: 700 }}>
                      ✕
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div>
          <h3 style={{ fontFamily: 'Fredoka One, cursive', fontSize: 18, color: 'var(--muted)', marginBottom: 12 }}>
            ✅ Completed Activities
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {completed.map(a => (
              <div key={a.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: 0.8 }}>
                <span style={{ fontSize: 28 }}>{a.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{a.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {new Date(a.createdAt).toLocaleDateString()}
                  </div>
                </div>
                {a.rating && <div>{'⭐'.repeat(a.rating)}</div>}
                <button className="btn-danger" style={{ padding: '6px 10px', fontSize: 12 }}
                  onClick={() => handleDelete(a.id)}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activities.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎈</div>
          <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: 20 }}>No activities yet!</div>
          <div style={{ fontSize: 14, marginTop: 8 }}>Hit the button above to get ideas for {child.name} 🎉</div>
        </div>
      )}
    </div>
  )
}
