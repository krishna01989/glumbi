import { useState, useEffect } from 'react'
import { activityApi } from '../../api/client'
import ThemeLoader from '../../components/ThemeLoader'
import ErrorBox from '../../components/ErrorBox'
import FeatureBanner from '../../components/FeatureBanner'
import QuotaBanner from '../../components/QuotaBanner'
import HistoryDrawer, { fmtDate } from '../../components/HistoryDrawer'
import { useOffline } from '../../contexts/OfflineContext'
import { useTracker } from '../../contexts/ActivityTrackerContext'
import useFeatureDuration from '../../hooks/useFeatureDuration'

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

export default function Activities({ child, quota }) {
  const { track } = useTracker()
  useFeatureDuration('activities', track)
  const offline = useOffline()
  const [activities, setActivities] = useState([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [substituting, setSubstituting] = useState(null) // id being substituted
  const [timeOfDay, setTimeOfDay]   = useState(getTimeOfDay())
  const [weather, setWeather]       = useState('sunny')
  const [similarMap, setSimilarMap] = useState({}) // activityId -> similar[]

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
    setError('')
    setActivities(prev => prev.filter(a => a.completed))
    try {
      await activityApi.deletePending(child.id)
      const newOnes = await activityApi.generate({ childId: child.id, timeOfDay, weather, count: 3 })
      track('activities', 'generate')
      setActivities(prev => [...newOnes, ...prev])
      window.__glumbiRefreshQuota?.('activity')
    } catch (e) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  async function handleRefresh() {
    setLoading(true)
    setError('')
    setActivities(prev => prev.filter(a => a.completed))
    try {
      await activityApi.deletePending(child.id)
      const newOnes = await activityApi.generate({ childId: child.id, timeOfDay, weather, count: 3 })
      track('activities', 'generate')
      setActivities(prev => [...newOnes, ...prev])
      window.__glumbiRefreshQuota?.('activity')
    } catch (e) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  async function handleRemove(id) {
    await activityApi.delete(id)
    setActivities(prev => prev.filter(a => a.id !== id))
  }

  async function handleSimilar(id) {
    if (similarMap[id]) {
      setSimilarMap(m => { const n = { ...m }; delete n[id]; return n })
      return
    }
    track('activities', 'similar')
    try {
      const similar = await activityApi.getSimilar(id)
      setSimilarMap(m => ({ ...m, [id]: similar }))
    } catch { /* silent */ }
  }

  async function handleClearAll() {
    setActivities(prev => prev.filter(a => a.completed))
    await activityApi.deletePending(child.id)
  }

  async function handleComplete(id) {
    const updated = await activityApi.markComplete(id, null)
    track('activities', 'complete')
    setActivities(prev => prev.map(a => a.id === id ? updated : a))
  }

  async function handleRate(id, rating) {
    const updated = await activityApi.markComplete(id, rating)
    track('activities', 'complete', { metadata: { rating } })
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
        window.__glumbiRefreshQuota?.('activity')
      } catch { /* silent — no substitute if quota/rate hit */ }
      finally { setSubstituting(null) }
    }
  }

  const pending   = activities.filter(a => !a.completed)
  const completed = activities.filter(a => a.completed)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <FeatureBanner feature="activities" child={child} isMobile={window.innerWidth < 1024} />

      {/* Generator */}
      <div className="card" style={{ background: 'var(--primary-lt)', border: '2px dashed var(--primary-lt)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 28 }}>🎮</span>
          <h3 style={{ fontSize: 18, color: 'var(--primary)' }}>What shall we do today?</h3>
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, display: 'block', marginBottom: 8 }}>TIME OF DAY</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {TIMES.map(t => (
                <button key={t.value} type="button" onClick={() => setTimeOfDay(t.value)}
                  style={{ flex: 1, padding: '8px 4px', fontSize: 12, borderRadius: 10,
                    background: timeOfDay === t.value ? 'var(--primary)' : '#f0f0f0',
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
                    background: weather === w.value ? 'var(--primary)' : '#f0f0f0',
                    color: weather === w.value ? 'white' : '#555' }}>
                  {w.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <QuotaBanner quota={quota} />
        {error && <div style={{ marginTop: 12 }}><ErrorBox msg={error} /></div>}
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <button className="btn-primary" onClick={handleGenerate} disabled={loading || !!substituting || quota?.used >= quota?.limit || offline} style={{ flex: 1, fontSize: 16 }}>
            {loading ? <><span className="spinner" />&nbsp;Finding fun ideas…</> : offline ? '✈️ 🎲 Suggest 3 Activities' : '🎲 Suggest 3 Activities'}
          </button>
          {pending.length > 0 && (
            <button onClick={handleRefresh} disabled={loading || !!substituting || offline || quota?.used >= quota?.limit}
              title="Replace all pending activities with a fresh set"
              style={{
                padding: '12px 16px', borderRadius: 50, fontSize: 14, fontWeight: 800,
                background: 'var(--primary-lt)', color: 'var(--primary)', border: '2px solid rgba(255,107,107,0.3)',
                cursor: (loading || offline || quota?.used >= quota?.limit) ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
                opacity: (offline || quota?.used >= quota?.limit) ? 0.4 : 1,
              }}>
              {offline ? '✈️ ' : ''}🔄 Refresh
            </button>
          )}
        </div>
      </div>

      {loading && <ThemeLoader theme={child.theme} />}

      {/* Pending activities */}
      {!loading && pending.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ fontSize: 18, color: 'var(--primary)', margin: 0 }}>
              🌟 Today's Activities
            </h3>
            <button onClick={handleClearAll}
              style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-lt)', border: '1.5px solid rgba(255,107,107,0.3)', borderRadius: 20, padding: '5px 14px', cursor: 'pointer' }}>
              🗑 Clear all
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px,1fr))', gap: 16 }}>
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
                  <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 15, fontWeight: 800, color: 'var(--text)', lineHeight: 1.4 }}>{a.title}</div>
                  <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6, flex: 1 }}>{a.description}</p>
                  <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>⏱ {a.duration}</div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    {/* Done — solid fill, most prominent */}
                    <button className="btn-primary" style={{ flex: 1, padding: '8px 4px', fontSize: 12, textAlign: 'center' }}
                      onClick={() => handleComplete(a.id)}>✓ Done!</button>
                    {/* Swap — outlined, secondary */}
                    <button disabled={!!substituting || offline || quota?.used >= quota?.limit}
                      onClick={() => handleDelete(a.id)}
                      title="Remove and get a replacement"
                      style={{ flex: 1, padding: '8px 4px', fontSize: 12, fontWeight: 800, fontFamily: 'Nunito,sans-serif', borderRadius: 50, border: '2px solid var(--primary)', background: 'transparent', color: 'var(--primary)', cursor: (substituting || offline || quota?.used >= quota?.limit) ? 'not-allowed' : 'pointer', opacity: (substituting && substituting !== a.id) || offline || quota?.used >= quota?.limit ? 0.4 : 1, textAlign: 'center' }}>
                      {substituting === a.id ? '…' : offline ? '✈️ ↻ Swap' : '↻ Swap'}
                    </button>
                    {/* Similar — accent-tinted, tertiary */}
                    <button onClick={() => handleSimilar(a.id)}
                      title="Find similar activities"
                      style={{ flex: 1, padding: '8px 4px', fontSize: 12, fontWeight: 800, fontFamily: 'Nunito,sans-serif', borderRadius: 50, border: '1.5px solid var(--accent, #a29bfe)', background: similarMap[a.id] ? 'var(--accent, #a29bfe)' : 'rgba(162,155,254,0.12)', color: similarMap[a.id] ? '#fff' : 'var(--accent, #7c6ff0)', cursor: 'pointer', textAlign: 'center' }}>
                      {similarMap[a.id] ? '✦ Hide' : '✦ Similar'}
                    </button>
                    {/* Delete — soft red, destructive */}
                    <button onClick={() => handleRemove(a.id)}
                      title="Remove activity"
                      style={{ flex: 1, padding: '8px 4px', fontSize: 12, fontWeight: 800, fontFamily: 'Nunito,sans-serif', borderRadius: 50, border: '1.5px solid #ffb3b3', background: '#fff0f0', color: '#e05555', cursor: 'pointer', textAlign: 'center' }}>
                      ✕ Delete
                    </button>
                  </div>

                  {/* Similar activities panel */}
                  {similarMap[a.id]?.length > 0 && (
                    <div style={{ borderTop: '1px solid #f0ebe6', paddingTop: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        ✦ Similar activities you've done
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {similarMap[a.id].map(s => (
                          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--primary-lt)', borderRadius: 8, padding: '6px 10px' }}>
                            <span style={{ fontSize: 18 }}>{s.emoji}</span>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', flex: 1 }}>{s.title}</div>
                            {s.rating && <div style={{ fontSize: 11 }}>{'⭐'.repeat(s.rating)}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {similarMap[a.id]?.length === 0 && (
                    <div style={{ fontSize: 12, color: 'var(--muted)', paddingTop: 6 }}>No similar activities yet — do more to unlock suggestions!</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <HistoryDrawer title="Completed Activities" count={completed.length}>
        {completed.map(a => (
          <div key={a.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: 0.85 }}>
            <span style={{ fontSize: 28 }}>{a.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{a.title}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>
                {fmtDate(a.createdAt)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{a.rating ? 'Rated:' : 'Rate it:'}</span>
                <StarRating value={a.rating || 0} onChange={v => handleRate(a.id, v)} />
              </div>
            </div>
            <button className="btn-danger" style={{ width: 28, height: 28, minWidth: 28, minHeight: 28, borderRadius: '50%', padding: 0, fontSize: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => handleDelete(a.id)}>✕</button>
          </div>
        ))}
      </HistoryDrawer>

      {activities.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎈</div>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 16, fontWeight: 800 }}>No activities yet!</div>
          <div style={{ fontSize: 14, marginTop: 8 }}>Hit the button above to get ideas for {child.name} 🎉</div>
        </div>
      )}
    </div>
  )
}
