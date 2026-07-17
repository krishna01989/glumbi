import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { analyticsApi, userApi, childApi } from '../api/client'
import { THEMES } from '../themes'
import Timeline from '../features/timeline/Timeline'

/* ── helpers ── */
const ACTIVITY_FEATURES = {
  stories:     { label: 'Stories',        emoji: '📖' },
  draw:        { label: 'Draw',           emoji: '🎨' },
  journal:     { label: 'Journal',        emoji: '📓' },
  curiosity:   { label: 'Curiosity',      emoji: '🔍' },
  readquiz:    { label: 'Read & Quiz',    emoji: '📚' },
  activities:  { label: 'Activities',     emoji: '🎮' },
  mywriting:   { label: 'My Writing',     emoji: '✍️' },
  riddle:      { label: 'Riddles',        emoji: '🎯' },
  maze:        { label: 'Maze',           emoji: '🌀' },
  learn:       { label: 'Learn to Write', emoji: '✏️' },
  flashcards:  { label: 'Flashcards',     emoji: '📇' },
  wordofday:   { label: 'Word of Day',    emoji: '🌟' },
  memorymatch: { label: 'Memory Match',   emoji: '🧠' },
}

function fmtDuration(sec) {
  if (!sec || sec < 60) return sec > 0 ? `${sec}s` : null
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`
  return `${m}m`
}

/* ══════════════════════════════════════════════
   ACTIVITY TAB
══════════════════════════════════════════════ */
function ActivityTab({ childName, t }) {
  const [data, setData]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [days, setDays]           = useState(30)
  const [featureMode, setFeatureMode] = useState('count')
  const [activeDailyBar, setActiveDailyBar] = useState(null)
  const [activeHourBar, setActiveHourBar]   = useState(null)
  const { id } = useParams()

  useEffect(() => {
    setLoading(true)
    setActiveDailyBar(null)
    setActiveHourBar(null)
    analyticsApi.getChildAnalytics(id, days)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [id, days])

  const totalEvents   = data?.totalEvents ?? 0
  const totalSessions = data?.totalSessions ?? 0
  const recentDays    = data?.dailyActivity?.slice(-days).filter(d => d.count > 0).length ?? 0
  const totalSec      = data?.totalEngagementSeconds ?? 0
  const fmtHour = h => h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`
  const peakHour = data?.hourlyActivity
    ? data.hourlyActivity.reduce((best, v, i) => v > data.hourlyActivity[best] ? i : best, 0)
    : null
  const lastActiveDate = data?.dailyActivity
    ? (() => {
        const last = [...data.dailyActivity].reverse().find(d => d.count > 0)
        if (!last) return null
        const d = new Date(last.date)
        const today = new Date(); today.setHours(0,0,0,0)
        const diff = Math.round((today - d) / 86400000)
        if (diff === 0) return 'today'
        if (diff === 1) return 'yesterday'
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      })()
    : null

  const allFeatures = data
    ? Array.from(new Set([
        ...Object.keys(data.featureBreakdown ?? {}),
        ...Object.keys(data.durationByFeature ?? {}),
      ])).map(f => ({
        feature: f,
        count: data.featureBreakdown?.[f] ?? 0,
        sec:   data.durationByFeature?.[f] ?? 0,
      })).sort((a, b) => featureMode === 'time' ? b.sec - a.sec : b.count - a.count)
    : []
  const featureMax = allFeatures.length > 0
    ? (featureMode === 'time' ? allFeatures[0].sec : allFeatures[0].count)
    : 1

  return (
    <>
      {/* Range pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[7, 30, 90].map(d => (
          <button key={d} onClick={() => setDays(d)}
            style={{ padding: '6px 16px', borderRadius: 50, fontSize: 13, fontWeight: 800, border: 'none', cursor: 'pointer', background: days === d ? t.primary : 'white', color: days === d ? 'white' : '#777', boxShadow: days === d ? `0 4px 12px ${t.primary}44` : '0 1px 4px rgba(0,0,0,0.08)', transition: 'all 0.15s' }}>
            {d === 7 ? 'Last week' : d === 30 ? 'Last month' : 'Last 3 months'}
          </button>
        ))}
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '48px 0', color: '#aaa', fontSize: 14 }}>Loading…</div>}

      {!loading && (!data || totalEvents === 0) && (
        <div style={{ background: 'white', borderRadius: 16, padding: '24px', textAlign: 'center', color: '#bbb', fontSize: 14, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          ✨ No activity recorded in this period.
        </div>
      )}

      {!loading && data && totalEvents > 0 && (
        <div style={{ background: 'white', borderRadius: 20, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>

          {/* 4-stat row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'Active days', value: recentDays,                    icon: '📅', sub: `of ${days}` },
              { label: 'Sessions',    value: totalSessions,                 icon: '⚡', sub: 'play sessions' },
              { label: 'Screen time', value: fmtDuration(totalSec) ?? '—', icon: '⏱️', sub: 'engaged time' },
              { label: 'Streak',      value: `${data.currentStreak ?? 0}d`, icon: '🔥', sub: lastActiveDate ? `last active: ${lastActiveDate}` : `best: ${data.longestStreak ?? 0}d` },
            ].map(s => (
              <div key={s.label} style={{ background: t.primaryLt, borderRadius: 14, padding: '14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>{s.icon}</span>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 20, color: t.primary, lineHeight: 1.1 }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: '#888', marginTop: 1 }}>{s.label}</div>
                  <div style={{ fontSize: 10, color: '#bbb' }}>{s.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Daily chart */}
          {data.dailyActivity?.length > 0 && (() => {
            const recent = data.dailyActivity.slice(-days)
            const maxVal = Math.max(...recent.map(d => d.count), 1)
            return (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#555', marginBottom: 8 }}>Daily sessions</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: days > 30 ? 1 : 2, height: 60, background: '#fafafa', borderRadius: 10, padding: '6px 8px', boxSizing: 'border-box' }}>
                  {recent.map((d, i) => (
                    <div key={i}
                      onClick={() => d.count > 0 && setActiveDailyBar(b => b?.label === d.date ? null : { label: d.date, value: `${d.count} session${d.count !== 1 ? 's' : ''}` })}
                      style={{ flex: 1, background: d.count > 0 ? t.primary : '#e8e8e8', borderRadius: 3, height: `${Math.max(d.count / maxVal * 100, d.count > 0 ? 12 : 4)}%`, opacity: d.count > 0 ? 0.8 + (d.count / maxVal) * 0.2 : 0.3, transition: 'height 0.3s ease', cursor: d.count > 0 ? 'pointer' : 'default' }} />
                  ))}
                </div>
                {activeDailyBar && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, background: t.primaryLt, borderRadius: 8, padding: '6px 10px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: t.primary }}>{activeDailyBar.label} — {activeDailyBar.value}</span>
                    <button onClick={() => setActiveDailyBar(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 13, padding: 0, lineHeight: 1 }}>✕</button>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#ccc', marginTop: 3 }}>
                  <span>{recent[0]?.date?.slice(5)}</span>
                  <span>{recent[recent.length - 1]?.date?.slice(5)}</span>
                </div>
              </div>
            )
          })()}

          {/* Feature breakdown */}
          {allFeatures.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#555' }}>Feature activity</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {['count', 'time'].map(m => (
                    <button key={m} onClick={() => setFeatureMode(m)}
                      style={{ padding: '3px 10px', borderRadius: 50, fontSize: 10, fontWeight: 800, border: 'none', cursor: 'pointer', background: featureMode === m ? t.primary : '#f0f0f0', color: featureMode === m ? 'white' : '#999' }}>
                      {m === 'count' ? '# Sessions' : '⏱ Time'}
                    </button>
                  ))}
                </div>
              </div>
              {allFeatures.map(({ feature, count, sec }) => {
                const meta  = ACTIVITY_FEATURES[feature] || { label: feature, emoji: '🎮' }
                const val   = featureMode === 'time' ? sec : count
                const pct   = Math.round((val / featureMax) * 100)
                const label = featureMode === 'time' ? (fmtDuration(sec) ?? '—') : `${count}×`
                const sub   = featureMode === 'time' ? `${count} sessions` : (fmtDuration(sec) || null)
                const accuracy    = data?.accuracyByFeature?.[feature]
                const completions = data?.completionsByFeature?.[feature]
                const flipEff     = feature === 'memorymatch' && data?.flipEfficiency > 0 ? data.flipEfficiency : null
                const extraChips = []
                if (feature === 'stories' && data?.storiesSimilarViewed > 0)
                  extraChips.push({ key: 'sim', icon: '🔗', text: `${data.storiesSimilarViewed} similar explored`, color: '#0ea5e9', bg: '#f0f9ff' })
                if (feature === 'maze' && (data?.mazeGaveUpCount > 0 || data?.mazeAvgWallHits > 0))
                  extraChips.push({ key: 'maze', icon: '🧱', text: `${data.mazeGaveUpCount ?? 0} gave up · avg ${data.mazeAvgWallHits ?? 0} wall hits`, color: '#f97316', bg: '#fff7ed' })
                if (feature === 'riddle' && data?.riddleHints > 0)
                  extraChips.push({ key: 'hints', icon: '💡', text: `Used ${data.riddleHints} hint${data.riddleHints !== 1 ? 's' : ''}`, color: '#f59e0b', bg: '#fffbeb' })
                if (feature === 'mywriting' && data?.mywritingAvgWordCount > 0)
                  extraChips.push({ key: 'words', icon: '✍️', text: `avg ${data.mywritingAvgWordCount} words/submission`, color: '#10b981', bg: '#f0fdf4' })
                if (feature === 'memorymatch' && data?.topMemoryMatchTheme)
                  extraChips.push({ key: 'theme', icon: '⭐', text: `Fav theme: ${data.topMemoryMatchTheme}`, color: '#8b5cf6', bg: '#faf5ff' })
                if (feature === 'learn' && data?.learnPracticeCount > 0)
                  extraChips.push({ key: 'practice', icon: '✏️', text: `${data.learnPracticeCount} free practice${data.learnPracticeCount !== 1 ? 's' : ''}`, color: '#6366f1', bg: '#eef2ff' })
                if (feature === 'learn' && data?.letterAccuracy?.length > 0) {
                  const worst = data.letterAccuracy[0]
                  extraChips.push({ key: 'letter', icon: '🔤', text: `Hardest letter: "${worst.letter}" (${worst.rate}% pass)`, color: worst.rate < 50 ? '#ef4444' : '#f59e0b', bg: worst.rate < 50 ? '#fef2f2' : '#fffbeb' })
                }
                if (feature === 'learn' && data?.wordAccuracy?.length > 0) {
                  const worst = data.wordAccuracy[0]
                  extraChips.push({ key: 'word', icon: '📝', text: `Hardest word: "${worst.word}" (${worst.rate}% pass)`, color: worst.rate < 50 ? '#ef4444' : '#f59e0b', bg: worst.rate < 50 ? '#fef2f2' : '#fffbeb' })
                }
                if (feature === 'draw' && data?.drawAnimateCount > 0)
                  extraChips.push({ key: 'animate', icon: '🎬', text: `${data.drawAnimateCount} drawing${data.drawAnimateCount !== 1 ? 's' : ''} brought to life`, color: '#9c6ef8', bg: '#faf5ff' })
                return (
                  <div key={feature} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, fontWeight: 700, color: '#555', marginBottom: 5 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ fontSize: 15 }}>{meta.emoji}</span>{meta.label}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 900, color: t.primary }}>{label}</span>
                        {sub && <span style={{ color: '#ccc', fontSize: 10 }}>{sub}</span>}
                      </span>
                    </div>
                    <div style={{ background: '#f0f0f0', borderRadius: 6, height: 7, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, background: t.primary, height: '100%', borderRadius: 6, opacity: 0.75, transition: 'width 0.4s ease' }} />
                    </div>
                    {(accuracy || completions || flipEff || extraChips.length > 0) && (
                      <div style={{ display: 'flex', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
                        {accuracy && (
                          <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 50, padding: '2px 8px', color: accuracy.rate >= 70 ? '#22c55e' : accuracy.rate >= 40 ? '#f59e0b' : '#ef4444', background: accuracy.rate >= 70 ? '#f0fdf4' : accuracy.rate >= 40 ? '#fffbeb' : '#fef2f2' }}>
                            ✓ {accuracy.rate}% accurate
                          </span>
                        )}
                        {completions && count > 0 && feature !== 'memorymatch' && (
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#6366f1', background: '#f0f0ff', borderRadius: 50, padding: '2px 8px' }}>
                            🏁 {completions}/{count} completed
                          </span>
                        )}
                        {feature === 'memorymatch' && completions > 0 && (
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#6366f1', background: '#f0f0ff', borderRadius: 50, padding: '2px 8px' }}>
                            🏁 {completions} games played
                          </span>
                        )}
                        {flipEff && (
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#8b5cf6', background: '#faf5ff', borderRadius: 50, padding: '2px 8px' }}>
                            🃏 avg {flipEff} flips/game
                          </span>
                        )}
                        {extraChips.map(c => (
                          <span key={c.key} style={{ fontSize: 10, fontWeight: 700, color: c.color, background: c.bg, borderRadius: 50, padding: '2px 8px' }}>
                            {c.icon} {c.text}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Hourly chart */}
          {data.hourlyActivity?.length === 24 && totalEvents > 0 && (() => {
            const max = Math.max(...data.hourlyActivity, 1)
            return (
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#555', marginBottom: 8 }}>
                  When is {childName} most active?
                </div>
                <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 44, background: '#fafafa', borderRadius: 10, padding: '4px 6px', boxSizing: 'border-box' }}>
                  {data.hourlyActivity.map((v, h) => (
                    <div key={h}
                      onClick={() => v > 0 && setActiveHourBar(b => b?.label === fmtHour(h) ? null : { label: fmtHour(h), value: `${v} session${v !== 1 ? 's' : ''}` })}
                      style={{ flex: 1, background: v > 0 ? t.primary : '#e8e8e8', borderRadius: 3, height: `${Math.max(v / max * 100, v > 0 ? 12 : 5)}%`, opacity: v > 0 ? 0.6 + (v / max) * 0.4 : 0.3, cursor: v > 0 ? 'pointer' : 'default' }} />
                  ))}
                </div>
                {activeHourBar && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, background: t.primaryLt, borderRadius: 8, padding: '6px 10px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: t.primary }}>{activeHourBar.label} — {activeHourBar.value}</span>
                    <button onClick={() => setActiveHourBar(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 13, padding: 0, lineHeight: 1 }}>✕</button>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#ccc', marginTop: 3 }}>
                  <span>12 AM</span><span>6 AM</span><span>12 PM</span><span>6 PM</span><span>11 PM</span>
                </div>
                {peakHour !== null && (
                  <div style={{ marginTop: 8, fontSize: 11, color: '#888', textAlign: 'center' }}>
                    Peak time: <strong style={{ color: t.primary }}>{fmtHour(peakHour)}</strong>
                  </div>
                )}
              </div>
            )
          })()}
        </div>
      )}
    </>
  )
}

/* ══════════════════════════════════════════════
   CREDITS TAB
══════════════════════════════════════════════ */
function CreditsTab({ t }) {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [month, setMonth]     = useState('')
  const { id } = useParams()

  useEffect(() => {
    setLoading(true)
    userApi.creditBreakdown()
      .then(data => {
        const childRow = data?.children?.find(c => String(c.childId) === String(id))
        setStats(childRow || { features: [], totalCredits: 0 })
        if (data?.month) {
          const [y, m] = data.month.split('-')
          setMonth(new Date(+y, +m - 1).toLocaleString(undefined, { month: 'long', year: 'numeric' }))
        }
      })
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [id])

  const activeCredits = (stats?.features || []).filter(f => f.credits > 0)

  if (loading) return <div style={{ textAlign: 'center', padding: '48px 0', color: '#aaa', fontSize: 14 }}>Loading…</div>

  return (
    <div style={{ background: 'white', borderRadius: 20, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#555' }}>AI usage by feature</div>
        {month && <div style={{ fontSize: 11, color: '#bbb', fontWeight: 700 }}>{month}</div>}
      </div>

      {activeCredits.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#bbb', fontSize: 14, padding: '16px 0' }}>✨ No AI usage this month</div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {activeCredits.map(f => (
              <div key={f.feature} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, background: t.primaryLt }}>
                <span style={{ fontSize: 18 }}>{f.icon}</span>
                <span style={{ flex: 1, fontWeight: 700, fontSize: 14, color: '#444' }}>{f.label}</span>
                <span style={{ fontSize: 12, color: '#bbb' }}>×{f.count}</span>
                <span style={{ fontWeight: 900, fontSize: 14, color: t.primary }}>{f.credits} cr</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', borderTop: '1px solid #f0f0f0' }}>
            <span style={{ fontSize: 13, color: '#888', fontWeight: 700 }}>Total this month</span>
            <span style={{ fontSize: 14, fontWeight: 900, color: t.primary }}>{stats.totalCredits} cr</span>
          </div>
        </>
      )}
      <div style={{ fontSize: 11, color: '#ccc', textAlign: 'center', marginTop: 14 }}>Resets on the 1st of each month</div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function ChildInsightsPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [searchParams, setSearchParams] = useSearchParams()
  const [child, setChild]       = useState(null)
  const [childLoading, setChildLoading] = useState(true)

  const VALID_TABS = ['activity', 'credits', 'timeline']
  const tab = VALID_TABS.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'activity'
  const setTab = (key) => setSearchParams({ tab: key }, { replace: true })

  const t = THEMES[child?.theme] || THEMES.coral

  useEffect(() => {
    setChildLoading(true)
    childApi.getAll()
      .then(list => setChild(list.find(c => String(c.id) === String(id)) || null))
      .catch(() => setChild(null))
      .finally(() => setChildLoading(false))
  }, [id])

  if (childLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Nunito, sans-serif', gap: 12 }}>
      <img src="/icon.svg" alt="Glumbi" style={{ width: 48, height: 48, opacity: 0.5 }} />
      <div style={{ fontSize: 14, color: '#bbb', fontWeight: 700 }}>Loading…</div>
    </div>
  )

  return (
    <div style={{ background: 'white', minHeight: '100vh', fontFamily: 'Nunito, sans-serif', color: '#3d3d3d' }}>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '0 16px', boxSizing: 'border-box' }}>

        {/* Back button */}
        <button
          onClick={() => navigate('/child')}
          onMouseEnter={e => { e.currentTarget.style.background = t.primaryLt; e.currentTarget.style.transform = 'translateX(-2px)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'none' }}
          style={{ background: 'transparent', border: `1.5px solid ${t.primaryLt || '#f0e0ff'}`, color: t.primary, fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: '6px 14px', marginBottom: 20, marginTop: 24, borderRadius: 50, display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'all 0.15s ease' }}>
          ← Back
        </button>

        {/* Hero banner */}
        {child && (
          <div style={{ background: t.headerGrad, borderRadius: 20, padding: '24px 24px 20px', marginBottom: 20, color: 'white', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -16, right: -10, fontSize: 90, opacity: 0.1, lineHeight: 1 }}>{child.avatarEmoji}</div>
            <div style={{ fontSize: 36, marginBottom: 8 }}>{child.avatarEmoji}</div>
            <div style={{ fontWeight: 900, fontSize: 20, marginBottom: 2 }}>{child.name}</div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>Activity, Credits & Timeline</div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[
            { key: 'activity', label: '📈 Activity' },
            { key: 'credits',  label: '🪙 Credits'  },
            { key: 'timeline', label: '🗓️ Timeline' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)}
              style={{ flex: 1, padding: '10px', borderRadius: 50, fontSize: 14, fontWeight: 800, border: 'none', cursor: 'pointer', background: tab === key ? t.primary : 'white', color: tab === key ? 'white' : '#888', boxShadow: tab === key ? `0 4px 12px ${t.primary}44` : '0 1px 4px rgba(0,0,0,0.08)', transition: 'all 0.15s' }}>
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ background: '#f7f8fc', borderRadius: 20, padding: '20px', marginBottom: 32 }}>
          {tab === 'activity' && <ActivityTab childName={child?.name} t={t} />}
          {tab === 'credits'  && <CreditsTab t={t} />}
          {tab === 'timeline' && <Timeline child={child} t={t} />}
        </div>

      </div>
    </div>
  )
}
