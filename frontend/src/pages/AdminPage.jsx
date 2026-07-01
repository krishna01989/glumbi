import { useState, useEffect, useCallback } from 'react'
import { adminApi } from '../api/client'
import ConfirmDialog from '../components/ConfirmDialog'

// ─── Sidebar nav items ───────────────────────────────────────────────────────
const NAV = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'users',     icon: '👥', label: 'Users'     },
  { id: 'agents',    icon: '🤖', label: 'AI Agents' },
]

// ─── Password reset modal ─────────────────────────────────────────────────────
function PasswordModal({ user, onClose }) {
  const [pw, setPw]         = useState('')
  const [msg, setMsg]       = useState('')
  const [saving, setSaving] = useState(false)

  const checks = {
    length:    pw.length >= 8,
    uppercase: /[A-Z]/.test(pw),
    number:    /[0-9]/.test(pw),
    special:   /[!@#$%^&*()_+\-=\[\]{}|;':",./<>?]/.test(pw),
  }
  const strong = Object.values(checks).every(Boolean)

  async function handleSave() {
    if (!strong) return
    setSaving(true); setMsg('')
    try {
      await adminApi.resetPassword(user.id, pw)
      setMsg('✅ Password updated!')
      setTimeout(onClose, 1200)
    } catch (e) {
      setMsg('❌ ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
      <div style={{ background: 'white', borderRadius: 20, padding: 32, width: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 18 }}>🔑 Reset Password</h3>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: '#888' }}>{user.email}</p>
        <input type="password" placeholder="New password" value={pw} onChange={e => setPw(e.target.value)}
          style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #ddd', fontSize: 14, boxSizing: 'border-box', marginBottom: 12 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
          {[['length','8+ characters'],['uppercase','Uppercase letter'],['number','Number (0-9)'],['special','Special character']].map(([k, l]) => (
            <div key={k} style={{ fontSize: 12, color: checks[k] ? '#27ae60' : '#bbb', display: 'flex', gap: 6 }}>
              <span>{checks[k] ? '✅' : '○'}</span>{l}
            </div>
          ))}
        </div>
        {msg && <div style={{ fontSize: 13, marginBottom: 12, color: msg.startsWith('✅') ? '#27ae60' : '#e74c3c' }}>{msg}</div>}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 10, borderRadius: 10, border: '1.5px solid #eee', background: '#f5f5f5', cursor: 'pointer', fontWeight: 700 }}>Cancel</button>
          <button onClick={handleSave} disabled={!strong || saving}
            style={{ flex: 1, padding: 10, borderRadius: 10, border: 'none', background: strong ? '#2d3436' : '#ccc', color: 'white', cursor: strong ? 'pointer' : 'not-allowed', fontWeight: 700 }}>
            {saving ? 'Saving…' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Hold modal ───────────────────────────────────────────────────────────────
function HoldModal({ user, onClose, onConfirm }) {
  const [reason, setReason] = useState('')
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
      <div style={{ background: 'white', borderRadius: 20, padding: 32, width: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 18 }}>🔒 Put Account on Hold</h3>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: '#888' }}>{user.email}</p>
        <textarea
          placeholder="Internal reason for hold (not shown to user)…"
          value={reason} onChange={e => setReason(e.target.value)} rows={3}
          style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #ddd', fontSize: 14, boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit', marginBottom: 16 }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 10, borderRadius: 10, border: '1.5px solid #eee', background: '#f5f5f5', cursor: 'pointer', fontWeight: 700 }}>Cancel</button>
          <button onClick={() => onConfirm(reason)} disabled={!reason.trim()}
            style={{ flex: 1, padding: 10, borderRadius: 10, border: 'none', background: reason.trim() ? '#e74c3c' : '#ccc', color: 'white', cursor: reason.trim() ? 'pointer' : 'not-allowed', fontWeight: 700 }}>
            Hold Account
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color }) {
  return (
    <div style={{
      background: 'white', borderRadius: 16, padding: '20px 24px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)', flex: '1 1 160px',
      borderTop: `4px solid ${color}`,
    }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 900, color: '#1a1a2e', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#555', marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

// ─── Bar chart (pure CSS) ─────────────────────────────────────────────────────
function BarChart({ data, color = '#667eea' }) {
  const entries = Object.entries(data)
  const max = Math.max(...entries.map(([, v]) => v), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80, padding: '0 4px' }}>
      {entries.map(([label, value]) => (
        <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ fontSize: 10, color: '#888', fontWeight: 700 }}>{value || ''}</div>
          <div style={{
            width: '100%', background: value > 0 ? color : '#f0f0f0',
            borderRadius: '4px 4px 0 0',
            height: `${Math.max((value / max) * 56, value > 0 ? 6 : 2)}px`,
            transition: 'height 0.3s ease',
          }} />
          <div style={{ fontSize: 9, color: '#bbb', textAlign: 'center', whiteSpace: 'nowrap' }}>{label}</div>
        </div>
      ))}
    </div>
  )
}

// ─── Horizontal bar (feature usage / engagement) ─────────────────────────────
function HBar({ label, value, max, color, total }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  const share = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: '#555', marginBottom: 5 }}>
        <span>{label}</span>
        <span style={{ color: '#999' }}>{value.toLocaleString()}{total != null ? ` (${share}%)` : ''}</span>
      </div>
      <div style={{ background: '#f0f0f0', borderRadius: 6, height: 10, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, background: color, height: '100%', borderRadius: 6, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  )
}

const RANGES = [
  { value: '7d',  label: '7 Days'   },
  { value: '30d', label: '30 Days'  },
  { value: '90d', label: '90 Days'  },
  { value: 'all', label: 'All Time' },
]

// ─── Dashboard section ────────────────────────────────────────────────────────
function Dashboard() {
  const [range, setRange]     = useState('7d')
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    adminApi.getStats(range)
      .then(setStats)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [range])

  const rangeLabel = RANGES.find(r => r.value === range)?.label || '7 Days'

  if (error) return <div style={{ padding: 24, color: '#e74c3c' }}>❌ {error}</div>

  const alertStyle = {
    warn:    { bg: '#fff8e1', border: '#ffd54f', icon: '⚠️',  text: '#f57f17' },
    info:    { bg: '#e3f2fd', border: '#90caf9', icon: 'ℹ️',  text: '#1565c0' },
    success: { bg: '#e8f5e9', border: '#a5d6a7', icon: '✅',  text: '#2e7d32' },
  }

  const featureColors  = ['#4facfe', '#43e97b', '#fa709a', '#f093fb']
  const scoreColors    = ['#ff6b6b', '#ffa726', '#43e97b']
  const engageColors   = ['#ff6b6b', '#ffa726', '#4facfe', '#43e97b']
  const ageColor       = '#a78bfa'

  const featureEntries = Object.entries(stats?.featureUsage || {})
  const featureMax     = Math.max(...featureEntries.map(([, v]) => v), 1)
  const featureTotal   = featureEntries.reduce((s, [, v]) => s + v, 0)

  const engageEntries  = Object.entries(stats?.engagementBuckets || {})
  const engageMax      = Math.max(...engageEntries.map(([, v]) => v), 1)

  const scoreEntries   = Object.entries(stats?.quizScoreDistribution || {})
  const scoreMax       = Math.max(...scoreEntries.map(([, v]) => v), 1)
  const scoreTotal     = scoreEntries.reduce((s, [, v]) => s + v, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Range selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#999', marginRight: 4 }}>RANGE</span>
        {RANGES.map(r => (
          <button key={r.value} onClick={() => setRange(r.value)} disabled={loading}
            style={{
              padding: '6px 16px', borderRadius: 50, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
              background: range === r.value ? '#1a1a2e' : '#f0f0f0',
              color:      range === r.value ? 'white'    : '#666',
              transition: 'all 0.15s',
              opacity: loading ? 0.6 : 1,
            }}>
            {r.label}
          </button>
        ))}
        {loading && <span style={{ fontSize: 12, color: '#aaa', marginLeft: 8 }}>Refreshing…</span>}
      </div>

      {!stats && loading && <div style={{ padding: 48, textAlign: 'center', color: '#aaa' }}>Loading dashboard…</div>}

      {/* Alerts */}
      {stats?.alerts?.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {stats.alerts.map((a, i) => {
            const s = alertStyle[a.level] || alertStyle.info
            return (
              <div key={i} style={{ background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: 12, padding: '10px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
                <span>{s.icon}</span>
                <span style={{ fontSize: 13, color: s.text, fontWeight: 600 }}>{a.msg}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Stat cards */}
      {stats && (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        <StatCard icon="👤" label="Total Users"    value={stats.totalUsers}      sub={`+${stats.newUsersInRange} in ${rangeLabel.toLowerCase()}`}    color="#667eea" />
        <StatCard icon="🧒" label="Total Children" value={stats.totalChildren}   sub={`+${stats.newChildrenInRange} in ${rangeLabel.toLowerCase()}`}  color="#f093fb" />
        <StatCard icon="📖" label="Stories"        value={stats.totalStories}    sub={`+${stats.newStoriesInRange} in ${rangeLabel.toLowerCase()}`}   color="#4facfe" />
        <StatCard icon="🎯" label="Quizzes"        value={stats.totalQuizzes}    sub="all time"                                                        color="#43e97b" />
        <StatCard icon="✍️" label="Writings"       value={stats.totalWritings}   sub="all time"                                                        color="#fa709a" />
        <StatCard icon="🎨" label="Activities"     value={stats.totalActivities} sub="all time"                                                        color="#f093fb" />
      </div>
      )}

      {/* Two trend charts side by side */}
      {stats && <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ background: 'white', borderRadius: 16, padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', flex: '1 1 280px' }}>
          <div style={{ fontWeight: 800, fontSize: 13, color: '#333', marginBottom: 16 }}>👤 New Signups — {rangeLabel}</div>
          <BarChart data={stats.signupsByDay} color="#667eea" />
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', flex: '1 1 280px' }}>
          <div style={{ fontWeight: 800, fontSize: 13, color: '#333', marginBottom: 16 }}>📖 Stories Created — {rangeLabel}</div>
          <BarChart data={stats.contentByDay} color="#4facfe" />
        </div>
      </div>}

      {/* Feature usage + Quiz scores side by side */}
      {stats && <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ background: 'white', borderRadius: 16, padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', flex: '1 1 280px' }}>
          <div style={{ fontWeight: 800, fontSize: 13, color: '#333', marginBottom: 4 }}>🧩 Feature Usage — {rangeLabel}</div>
          <div style={{ fontSize: 11, color: '#aaa', marginBottom: 16 }}>{featureTotal.toLocaleString()} total interactions</div>
          {featureEntries.map(([label, value], i) => (
            <HBar key={label} label={label} value={value} max={featureMax} color={featureColors[i % featureColors.length]} total={featureTotal} />
          ))}
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', flex: '1 1 280px' }}>
          <div style={{ fontWeight: 800, fontSize: 13, color: '#333', marginBottom: 4 }}>🎯 Quiz Score Distribution — {rangeLabel}</div>
          <div style={{ fontSize: 11, color: '#aaa', marginBottom: 16 }}>{scoreTotal.toLocaleString()} completed quizzes</div>
          {scoreEntries.map(([label, value], i) => (
            <HBar key={label} label={label} value={value} max={scoreMax} color={scoreColors[i % scoreColors.length]} total={scoreTotal} />
          ))}
          {scoreTotal === 0 && <div style={{ color: '#aaa', fontSize: 13 }}>No completed quizzes yet.</div>}
          {scoreTotal > 0 && (
            <div style={{ marginTop: 12, padding: '8px 12px', background: '#f8f9fa', borderRadius: 8, fontSize: 12 }}>
              <span style={{ color: '#43e97b', fontWeight: 700 }}>
                {Math.round((stats.quizScoreDistribution['3/3'] || 0) / scoreTotal * 100)}%
              </span>
              <span style={{ color: '#777' }}> perfect scores · avg {
                scoreEntries.length > 0
                  ? (scoreEntries.reduce((s, [k, v]) => s + parseInt(k) * v, 0) / scoreTotal).toFixed(1)
                  : '—'
              }/3</span>
            </div>
          )}
        </div>
      </div>}

      {/* Engagement depth + Age distribution — always all-time */}
      {stats && <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ background: 'white', borderRadius: 16, padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', flex: '1 1 280px' }}>
          <div style={{ fontWeight: 800, fontSize: 13, color: '#333', marginBottom: 2 }}>📊 Engagement Depth</div>
          <div style={{ fontSize: 11, color: '#aaa', marginBottom: 16 }}>All-time stories per child</div>
          {engageEntries.map(([label, value], i) => (
            <HBar key={label} label={label} value={value} max={engageMax} color={engageColors[i % engageColors.length]} total={null} />
          ))}
          {stats.totalChildren > 0 && (
            <div style={{ marginTop: 12, padding: '8px 12px', background: '#f8f9fa', borderRadius: 8, fontSize: 12, color: '#777' }}>
              <span style={{ color: '#4facfe', fontWeight: 700 }}>
                {Math.round(((stats.engagementBuckets['6–15'] || 0) + (stats.engagementBuckets['15+'] || 0)) / stats.totalChildren * 100)}%
              </span> of children are regular users (6+ stories)
            </div>
          )}
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', flex: '1 1 280px' }}>
          <div style={{ fontWeight: 800, fontSize: 13, color: '#333', marginBottom: 2 }}>🧒 Children Age Distribution</div>
          <div style={{ fontSize: 11, color: '#aaa', marginBottom: 16 }}>{stats.totalChildren} total children · all-time</div>
          <BarChart data={stats.ageDistribution} color={ageColor} />
        </div>
      </div>}

      {/* Recent activity */}
      {stats && <div style={{ background: 'white', borderRadius: 16, padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div style={{ fontWeight: 800, fontSize: 13, color: '#333', marginBottom: 16 }}>🕐 Recent Activity</div>
        {stats.recentActivity.length === 0
          ? <div style={{ color: '#aaa', fontSize: 13 }}>No activity yet.</div>
          : stats.recentActivity.map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < stats.recentActivity.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
              <span style={{ fontSize: 20 }}>{a.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: '#333', fontWeight: 600 }}>{a.label}</div>
                {a.childName && <div style={{ fontSize: 11, color: '#aaa' }}>for {a.childName}</div>}
              </div>
              <div style={{ fontSize: 11, color: '#bbb' }}>
                {new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))
        }
      </div>}
    </div>
  )
}

// ─── Users section ────────────────────────────────────────────────────────────
function Users() {
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [search, setSearch]     = useState('')
  const [resetUser, setResetUser] = useState(null)
  const [holdUser, setHoldUser]   = useState(null)
  const [confirm, setConfirm]     = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    adminApi.getUsers()
      .then(setUsers)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  async function handleDelete(user) {
    setConfirm({
      title: 'Delete User',
      message: `Delete ${user.email} and ALL their children's data? This cannot be undone.`,
      confirmLabel: 'Delete',
      onConfirm: async () => {
        setConfirm(null)
        try {
          await adminApi.deleteUser(user.id)
          setUsers(prev => prev.filter(u => u.id !== user.id))
        } catch (e) { setError(e.message) }
      }
    })
  }

  async function handleHold(user, reason) {
    setHoldUser(null)
    try {
      await adminApi.holdUser(user.id, reason)
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, onHold: true, holdReason: reason } : u))
    } catch (e) { setError(e.message) }
  }

  async function handleRelease(user) {
    try {
      await adminApi.releaseUser(user.id)
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, onHold: false, holdReason: null } : u))
    } catch (e) { setError(e.message) }
  }

  async function handleRoleToggle(user) {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN'
    setConfirm({
      title: 'Change Role',
      message: `Change ${user.email} to ${newRole}?`,
      confirmLabel: 'Confirm',
      confirmColor: '#667eea',
      onConfirm: async () => {
        setConfirm(null)
        try {
          const updated = await adminApi.changeRole(user.id, newRole)
          setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: updated.role } : u))
        } catch (e) { setError(e.message) }
      }
    })
  }

  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {holdUser && <HoldModal user={holdUser} onClose={() => setHoldUser(null)} onConfirm={reason => handleHold(holdUser, reason)} />}
      {resetUser && <PasswordModal user={resetUser} onClose={() => setResetUser(null)} />}
      <ConfirmDialog
        open={!!confirm} title={confirm?.title} message={confirm?.message}
        confirmLabel={confirm?.confirmLabel} confirmColor={confirm?.confirmColor}
        onConfirm={confirm?.onConfirm} onCancel={() => setConfirm(null)}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 20, color: '#1a1a2e' }}>👥 Users</div>
          <div style={{ fontSize: 13, color: '#aaa', marginTop: 2 }}>{users.length} total</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            placeholder="Search by email…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ padding: '8px 14px', borderRadius: 50, border: '1.5px solid #eee', fontSize: 13, width: 220, outline: 'none' }}
          />
          <button onClick={load} style={{ padding: '8px 18px', borderRadius: 50, background: '#f0f0f0', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {error && <div style={{ background: '#fff0f0', border: '1.5px solid #ffb3b3', borderRadius: 12, padding: '12px 16px', marginBottom: 16, color: '#c0392b', fontWeight: 600 }}>🚫 {error}</div>}

      {loading
        ? <div style={{ textAlign: 'center', padding: 48, color: '#aaa' }}>Loading…</div>
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(user => (
              <div key={user.id} style={{ background: user.onHold ? '#fff8f8' : 'white', borderRadius: 14, padding: '14px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', borderLeft: user.onHold ? '4px solid #e74c3c' : '4px solid transparent' }}>
                <div style={{
                  width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                  background: user.onHold ? 'linear-gradient(135deg,#e74c3c,#c0392b)' : user.role === 'ADMIN' ? 'linear-gradient(135deg,#2d3436,#636e72)' : 'linear-gradient(135deg,#667eea,#764ba2)',
                }}>
                  {user.onHold ? '🔒' : user.role === 'ADMIN' ? '🛡️' : '👤'}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, fontSize: 14, color: '#1a1a2e' }}>{user.email}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 50, background: user.authMethod === 'google' ? '#e8f0fe' : '#f0fff4', color: user.authMethod === 'google' ? '#1a73e8' : '#2e7d32' }}>
                      {user.authMethod === 'google' ? '🔵 Google' : '🔒 Password'}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 50, background: user.role === 'ADMIN' ? '#2d3436' : '#e8f5e9', color: user.role === 'ADMIN' ? 'white' : '#2e7d32' }}>
                      {user.role}
                    </span>
                    {user.onHold && (
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 50, background: '#fff0f0', color: '#e74c3c', border: '1px solid #fcc' }}>
                        🔒 On Hold
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#aaa', marginTop: 3 }}>
                    Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    &nbsp;·&nbsp;{user.childCount} {user.childCount === 1 ? 'child' : 'children'}
                  </div>
                  {user.onHold && user.holdReason && (
                    <div style={{ fontSize: 11, color: '#e74c3c', marginTop: 4, fontStyle: 'italic' }}>
                      Reason: {user.holdReason}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                  <button onClick={() => handleRoleToggle(user)}
                    style={{ padding: '6px 14px', borderRadius: 50, fontSize: 12, fontWeight: 700, background: '#f0f0f0', color: '#555', border: 'none', cursor: 'pointer' }}>
                    {user.role === 'ADMIN' ? '↓ Demote' : '↑ Make Admin'}
                  </button>
                  {user.authMethod === 'password' && (
                    <button onClick={() => setResetUser(user)}
                      style={{ padding: '6px 14px', borderRadius: 50, fontSize: 12, fontWeight: 700, background: '#e8f0fe', color: '#1a73e8', border: 'none', cursor: 'pointer' }}>
                      🔑 Reset PW
                    </button>
                  )}
                  {user.onHold ? (
                    <button onClick={() => handleRelease(user)}
                      style={{ padding: '6px 14px', borderRadius: 50, fontSize: 12, fontWeight: 700, background: '#e8f5e9', color: '#2e7d32', border: 'none', cursor: 'pointer' }}>
                      ✅ Release
                    </button>
                  ) : (
                    <button onClick={() => setHoldUser(user)}
                      style={{ padding: '6px 14px', borderRadius: 50, fontSize: 12, fontWeight: 700, background: '#fff3f3', color: '#e74c3c', border: '1.5px solid #fcc', cursor: 'pointer' }}>
                      🔒 Hold
                    </button>
                  )}
                  <button onClick={() => handleDelete(user)}
                    style={{ padding: '6px 14px', borderRadius: 50, fontSize: 12, fontWeight: 700, background: '#fff0f0', color: '#e74c3c', border: '1.5px solid #fcc', cursor: 'pointer' }}>
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: 48, color: '#aaa' }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
                <div>{search ? `No users matching "${search}"` : 'No users yet'}</div>
              </div>
            )}
          </div>
        )
      }
    </div>
  )
}

// ─── AI Agents section ────────────────────────────────────────────────────────
function Agents() {
  const [running, setRunning] = useState(false)
  const [msg, setMsg]         = useState('')

  async function handleRun() {
    setRunning(true); setMsg('')
    try {
      await adminApi.runNotifications()
      setMsg('✅ All agents ran successfully! Notifications generated for active children.')
    } catch (e) {
      setMsg('❌ ' + e.message)
    } finally {
      setRunning(false)
    }
  }

  const agents = [
    { icon: '📊', name: 'Progress Report Agent',       desc: 'Analyses weekly stories, quizzes, and writing — generates a warm summary for each parent.',    color: '#4facfe' },
    { icon: '🏆', name: 'Milestone Agent',              desc: 'Detects when a child hits story/quiz/writing milestones and writes a celebratory message.',      color: '#43e97b' },
    { icon: '✨', name: 'Story Recommendation Agent',   desc: 'Looks at recent story topics and suggests 3 fresh ideas the child would enjoy.',                 color: '#f093fb' },
    { icon: '💡', name: 'Learning Insight Agent',       desc: 'Reviews quiz scores and writing feedback over 2 weeks — gives one actionable tip to the parent.', color: '#fa709a' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Run card */}
      <div style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', borderRadius: 16, padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: 'white', fontWeight: 900, fontSize: 18 }}>🤖 Run All Agents Now</div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 }}>
            Auto-runs every Sunday 8AM UTC · Skips children with no activity that week
          </div>
          {msg && <div style={{ marginTop: 10, fontSize: 13, fontWeight: 700, color: 'white' }}>{msg}</div>}
        </div>
        <button onClick={handleRun} disabled={running}
          style={{ padding: '12px 28px', borderRadius: 50, border: 'none', fontWeight: 800, fontSize: 14,
            background: running ? 'rgba(255,255,255,0.25)' : 'white',
            color: running ? 'rgba(255,255,255,0.6)' : '#764ba2',
            cursor: running ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
          {running ? '⏳ Running…' : '▶ Run Now'}
        </button>
      </div>

      {/* Agent cards */}
      <div style={{ fontWeight: 800, fontSize: 15, color: '#333' }}>Active Agents</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {agents.map(a => (
          <div key={a.name} style={{ background: 'white', borderRadius: 14, padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', gap: 14, alignItems: 'flex-start', borderLeft: `4px solid ${a.color}` }}>
            <span style={{ fontSize: 26, flexShrink: 0 }}>{a.icon}</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#1a1a2e' }}>{a.name}</div>
              <div style={{ fontSize: 13, color: '#777', marginTop: 4, lineHeight: 1.5 }}>{a.desc}</div>
            </div>
            <span style={{ marginLeft: 'auto', flexShrink: 0, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 50, background: '#e8f5e9', color: '#2e7d32' }}>Active</span>
          </div>
        ))}
      </div>

      {/* Schedule info */}
      <div style={{ background: '#f8f9fa', borderRadius: 14, padding: '16px 20px', fontSize: 13, color: '#666', lineHeight: 1.7 }}>
        <div style={{ fontWeight: 700, color: '#333', marginBottom: 6 }}>⏰ Schedule</div>
        <div>• Runs automatically every <strong>Sunday at 8:00 AM UTC</strong></div>
        <div>• Only generates notifications for children who had activity in the past 7 days</div>
        <div>• Learning Insight uses a 14-day window for better trend detection</div>
        <div>• Cost: ~$0.50/month on Claude Haiku for 50 active children</div>
      </div>
    </div>
  )
}

// ─── Main AdminPage ───────────────────────────────────────────────────────────
export default function AdminPage({ onBack, onLogout }) {
  const [active, setActive]     = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = window.innerWidth < 640

  const section = { dashboard: <Dashboard />, users: <Users />, agents: <Agents /> }
  const current = NAV.find(n => n.id === active)

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f4f5f7', overflow: 'hidden' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: isMobile ? (sidebarOpen ? 220 : 0) : 220,
        minWidth: isMobile ? (sidebarOpen ? 220 : 0) : 220,
        background: '#1a1a2e', display: 'flex', flexDirection: 'column',
        transition: 'width 0.2s, min-width 0.2s', overflow: 'hidden',
        position: isMobile ? 'fixed' : 'relative',
        zIndex: isMobile ? 1000 : 'auto',
        height: '100vh', top: 0, left: 0,
        boxShadow: isMobile && sidebarOpen ? '4px 0 24px rgba(0,0,0,0.3)' : 'none',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>🛡️</span>
            <div>
              <div style={{ fontFamily: 'Fredoka One, cursive', fontSize: 16, color: 'white', lineHeight: 1.2 }}>Glumbi</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase' }}>Admin Panel</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV.map(item => (
            <button key={item.id} onClick={() => { setActive(item.id); setSidebarOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: active === item.id ? 'rgba(102,126,234,0.25)' : 'transparent',
                color: active === item.id ? '#a78bfa' : 'rgba(255,255,255,0.6)',
                fontWeight: active === item.id ? 700 : 500, fontSize: 14,
                textAlign: 'left', width: '100%',
                borderLeft: active === item.id ? '3px solid #a78bfa' : '3px solid transparent',
                transition: 'all 0.15s',
              }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {onBack && (
            <button onClick={onBack}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600, textAlign: 'left' }}>
              ← Back to App
            </button>
          )}
          {onLogout && (
            <button onClick={onLogout}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'rgba(231,76,60,0.15)', color: '#ff6b6b', fontSize: 13, fontWeight: 600, textAlign: 'left' }}>
              🚪 Sign Out
            </button>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999 }} />
      )}

      {/* ── Main content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top bar */}
        <div style={{
          height: 60, background: 'white', borderBottom: '1px solid #eee',
          display: 'flex', alignItems: 'center', padding: '0 24px', gap: 14,
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)', flexShrink: 0,
        }}>
          {isMobile && (
            <button onClick={() => setSidebarOpen(o => !o)}
              style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', padding: 4 }}>
              ☰
            </button>
          )}
          <div>
            <div style={{ fontWeight: 900, fontSize: 16, color: '#1a1a2e' }}>
              {current?.icon} {current?.label}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 12, color: '#aaa' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {section[active]}
        </div>
      </div>
    </div>
  )
}
