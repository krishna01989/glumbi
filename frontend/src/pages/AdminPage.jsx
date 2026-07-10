import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { adminApi } from '../api/client'
import ConfirmDialog from '../components/ConfirmDialog'
import ErrorBox from '../components/ErrorBox'

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 640)
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < 640)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return mobile
}

// ─── Sidebar nav items ───────────────────────────────────────────────────────
const NAV = [
  { id: 'dashboard',  icon: '📊', label: 'Dashboard'      },
  { id: 'users',      icon: '👥', label: 'Users'          },
  { id: 'credits',    icon: '💰', label: 'Feature Credits' },
  { id: 'agents',     icon: '🤖', label: 'AI Agents'      },
  { id: 'schedulers', icon: '⏰', label: 'Schedulers'     },
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

// ─── Set quota modal ──────────────────────────────────────────────────────────
function SetQuotaModal({ user, onClose, onSave }) {
  const [value, setValue] = useState(String(user.quotaLimit ?? 100))
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const num = parseInt(value, 10)
  const valid = !isNaN(num) && num >= 0 && num <= 10000

  async function handleSave() {
    if (!valid) return
    setSaving(true); setError('')
    try { await onSave(num) }
    catch (e) { setError(e.message); setSaving(false) }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000 }}>
      <div style={{ background:'white', borderRadius:20, padding:32, width:380, boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
        <h3 style={{ margin:'0 0 4px', fontSize:18 }}>🔢 Set Quota Limit</h3>
        <p style={{ margin:'0 0 6px', fontSize:13, color:'#888' }}>{user.email}</p>
        <p style={{ margin:'0 0 20px', fontSize:12, color:'#e67e22', fontWeight:700, background:'#fff8f0', borderRadius:8, padding:'8px 12px' }}>
          ⚠️ Changing the limit resets usage to 0. The user starts fresh with the new limit.
        </p>
        <div style={{ marginBottom:8, fontSize:13, fontWeight:700, color:'#555' }}>
          Current: <span style={{ color:'#6366f1' }}>{user.quotaUsed ?? 0}/{user.quotaLimit ?? 100} used</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
          <input
            type="number" min="0" max="10000" value={value}
            onChange={e => setValue(e.target.value)}
            style={{ flex:1, padding:'10px 14px', borderRadius:10, border:`1.5px solid ${valid ? '#ddd' : '#e74c3c'}`, fontSize:16, fontWeight:800, textAlign:'center', outline:'none' }}
          />
          <span style={{ fontSize:13, color:'#aaa', fontWeight:700 }}>credits / month</span>
        </div>
        <div style={{ display:'flex', gap:6, marginBottom:16, flexWrap:'wrap' }}>
          {[25, 50, 100, 200].map(v => (
            <button key={v} onClick={() => setValue(String(v))}
              style={{ padding:'5px 14px', borderRadius:50, fontSize:12, fontWeight:800, border:'none', cursor:'pointer', background: num === v ? '#6366f1' : '#f0f0f0', color: num === v ? 'white' : '#555' }}>
              {v}
            </button>
          ))}
          <button onClick={() => setValue('0')}
            style={{ padding:'5px 14px', borderRadius:50, fontSize:12, fontWeight:800, border:'none', cursor:'pointer', background: num === 0 ? '#e74c3c' : '#fff0f0', color: num === 0 ? 'white' : '#e74c3c' }}>
            Block (0)
          </button>
        </div>
        <ErrorBox msg={error} />
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={onClose} style={{ flex:1, padding:10, borderRadius:10, border:'1.5px solid #eee', background:'#f5f5f5', cursor:'pointer', fontWeight:700 }}>Cancel</button>
          <button onClick={handleSave} disabled={!valid || saving}
            style={{ flex:1, padding:10, borderRadius:10, border:'none', background: valid ? '#6366f1' : '#ccc', color:'white', cursor: valid ? 'pointer' : 'not-allowed', fontWeight:700 }}>
            {saving ? 'Saving…' : `Set to ${valid ? num : '?'}`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Feature Access modal ─────────────────────────────────────────────────────
const FEATURE_DISPLAY_MAP = {
  'story':          { label: 'Stories',        icon: '📖' },
  'activity':       { label: 'Activities',     icon: '🎮' },
  'curiosity':      { label: 'Curiosity',      icon: '🔍' },
  'read-quiz':      { label: 'Read & Quiz',    icon: '📚' },
  'writing-coach':  { label: 'Writing Coach',  icon: '✍️'  },
  'translation':    { label: 'Translation',    icon: '🌐' },
  'draw':           { label: 'Drawing',        icon: '🎨' },
  'learn-validate': { label: 'Letter Validate',icon: '🔤' },
  'learn-word':     { label: 'Learn Word',     icon: '✏️'  },
  'story-listen':        { label: 'Story Audio',    icon: '🔊' },
  'memory':              { label: 'Memory Play',     icon: '🧠' },
  'memory-flashcards':   { label: 'Flashcards',      icon: '📇' },
  'word-of-day':         { label: 'Word of the Day', icon: '📘' },
  'memory-match':        { label: 'Memory Match',    icon: '🃏' },
  'journal-ai':          { label: 'Journal AI',      icon: '📝' },
  'draw-guide':          { label: 'Drawing Guide',   icon: '🎨' },
  'trace':               { label: 'Trace',           icon: '🐾' },
  'riddle':              { label: 'Riddle',          icon: '🧩' },
}

function FeatureAccessModal({ user, onClose }) {
  const [data, setData]     = useState(null)
  const [saving, setSaving] = useState(null)
  const [msg, setMsg]       = useState('')

  useEffect(() => {
    adminApi.getUserFeatureOverrides(user.id)
      .then(setData)
      .catch(() => setMsg('Failed to load'))
  }, [user.id])

  async function handleToggle(featureName, globallyEnabled, currentEffective) {
    if (!globallyEnabled) return // can't override a globally disabled feature
    const next = !currentEffective
    setSaving(featureName); setMsg('')
    try {
      await adminApi.setUserFeatureOverride(user.id, featureName, next)
      setData(prev => {
        const overrides = prev.overrides.filter(o => o.featureName !== featureName)
        overrides.push({ featureName, enabled: next })
        return { ...prev, overrides }
      })
    } catch (e) {
      setMsg('❌ ' + e.message)
    } finally {
      setSaving(null)
    }
  }

  async function handleReset(featureName) {
    setSaving(featureName + '_reset'); setMsg('')
    try {
      await adminApi.resetUserFeatureOverride(user.id, featureName)
      setData(prev => ({
        ...prev,
        overrides: prev.overrides.filter(o => o.featureName !== featureName)
      }))
    } catch (e) {
      setMsg('❌ ' + e.message)
    } finally {
      setSaving(null)
    }
  }

  const overrideMap = Object.fromEntries((data?.overrides ?? []).map(o => [o.featureName, o.enabled]))

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000 }}>
      <div style={{ background:'white', borderRadius:20, padding:28, width:480, maxHeight:'80vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
        <h3 style={{ margin:'0 0 4px', fontSize:18 }}>🔧 Feature Access</h3>
        <p style={{ margin:'0 0 4px', fontSize:13, color:'#888' }}>{user.email}</p>
        <p style={{ margin:'0 0 18px', fontSize:12, color:'#777', lineHeight:1.6, background:'#f8f9ff', borderRadius:8, padding:'8px 12px' }}>
          Toggle individual features on or off for this user. If a feature is globally disabled (shown in grey), you cannot override it here — it must be re-enabled globally first in the Feature Credits tab.
        </p>

        {!data && <div style={{ textAlign:'center', color:'#aaa', padding:24 }}>Loading…</div>}
        {msg && <div style={{ fontSize:12, color:'#e74c3c', marginBottom:12 }}>{msg}</div>}

        {data && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {data.features.map(fc => {
              const display = FEATURE_DISPLAY_MAP[fc.featureName] || { label: fc.featureName, icon: '⚙️' }
              const hasOverride = fc.featureName in overrideMap
              const effectiveEnabled = fc.globallyEnabled && (hasOverride ? overrideMap[fc.featureName] : true)
              const isSaving = saving === fc.featureName

              return (
                <div key={fc.featureName} style={{
                  display:'flex', alignItems:'center', gap:12, padding:'10px 14px',
                  borderRadius:12, background: !fc.globallyEnabled ? '#f8f8f8' : effectiveEnabled ? '#f0fff4' : '#fff8f8',
                  border:`1.5px solid ${!fc.globallyEnabled ? '#eee' : effectiveEnabled ? '#c3e6cb' : '#f5c6cb'}`,
                  opacity: !fc.globallyEnabled ? 0.6 : 1,
                }}>
                  <span style={{ fontSize:20 }}>{display.icon}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:13, color:'#333' }}>{display.label}</div>
                    <div style={{ fontSize:11, color:'#aaa' }}>
                      {!fc.globallyEnabled
                        ? '🌐 Globally disabled — cannot override'
                        : hasOverride
                          ? `Override set: ${overrideMap[fc.featureName] ? 'enabled' : 'disabled'} for this user`
                          : 'Following global setting'}
                    </div>
                  </div>
                  {hasOverride && fc.globallyEnabled && (
                    <button onClick={() => handleReset(fc.featureName)}
                      disabled={saving === fc.featureName + '_reset'}
                      title="Remove override — revert to global setting"
                      style={{ fontSize:11, color:'#aaa', background:'none', border:'1px solid #ddd', borderRadius:6, padding:'2px 8px', cursor:'pointer' }}>
                      Reset
                    </button>
                  )}
                  <button
                    onClick={() => handleToggle(fc.featureName, fc.globallyEnabled, effectiveEnabled)}
                    disabled={!fc.globallyEnabled || isSaving}
                    style={{
                      width:44, height:24, borderRadius:12, border:'none',
                      cursor: !fc.globallyEnabled ? 'not-allowed' : 'pointer',
                      position:'relative', flexShrink:0,
                      background: !fc.globallyEnabled ? '#e0e0e0' : effectiveEnabled ? '#27ae60' : '#e0e0e0',
                      transition:'background 0.2s',
                    }}>
                    <span style={{
                      position:'absolute', top:3, width:18, height:18, borderRadius:9, background:'white',
                      transition:'left 0.2s', left: effectiveEnabled ? 23 : 3,
                      boxShadow:'0 1px 3px rgba(0,0,0,0.2)',
                    }} />
                  </button>
                </div>
              )
            })}
          </div>
        )}

        <button onClick={onClose} style={{ marginTop:20, width:'100%', padding:10, borderRadius:10, border:'1.5px solid #eee', background:'#f5f5f5', cursor:'pointer', fontWeight:700 }}>Close</button>
      </div>
    </div>
  )
}

// ─── Add Admin / Super Admin modal ───────────────────────────────────────────
function AddAdminModal({ onClose, onCreated, asSuperAdmin = false }) {
  const [email, setEmail]   = useState('')
  const [pw, setPw]         = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const checks = {
    length:    pw.length >= 8,
    uppercase: /[A-Z]/.test(pw),
    number:    /[0-9]/.test(pw),
    special:   /[!@#$%^&*()_+\-=\[\]{}|;':",./<>?]/.test(pw),
  }
  const strong = Object.values(checks).every(Boolean)
  const valid  = email.includes('@') && strong
  const accent = asSuperAdmin ? '#f59e0b' : '#6366f1'

  async function handleSave() {
    if (!valid) return
    setSaving(true); setError('')
    try {
      const result = asSuperAdmin
        ? await adminApi.createSuperAdmin(email, pw)
        : await adminApi.createAdmin(email, pw)
      onCreated(result)
      onClose()
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
      <div style={{ background: 'white', borderRadius: 20, padding: 32, width: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 18 }}>{asSuperAdmin ? '👑 Add Super Admin' : '🛡️ Add Admin'}</h3>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: '#888' }}>
          {asSuperAdmin ? 'Create a new super admin with full privileges.' : 'Create a new admin account with password login.'}
        </p>
        <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)}
          style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #ddd', fontSize: 14, boxSizing: 'border-box', marginBottom: 12 }} />
        <input type="password" placeholder="Password" value={pw} onChange={e => setPw(e.target.value)}
          style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #ddd', fontSize: 14, boxSizing: 'border-box', marginBottom: 12 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
          {[['length','8+ characters'],['uppercase','Uppercase letter'],['number','Number (0-9)'],['special','Special character']].map(([k, l]) => (
            <div key={k} style={{ fontSize: 12, color: checks[k] ? '#27ae60' : '#bbb', display: 'flex', gap: 6 }}>
              <span>{checks[k] ? '✅' : '○'}</span>{l}
            </div>
          ))}
        </div>
        {error && <div style={{ fontSize: 13, color: '#e74c3c', marginBottom: 12 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 10, borderRadius: 10, border: '1.5px solid #eee', background: '#f5f5f5', cursor: 'pointer', fontWeight: 700 }}>Cancel</button>
          <button onClick={handleSave} disabled={!valid || saving}
            style={{ flex: 1, padding: 10, borderRadius: 10, border: 'none', background: valid ? accent : '#ccc', color: 'white', cursor: valid ? 'pointer' : 'not-allowed', fontWeight: 700 }}>
            {saving ? 'Creating…' : asSuperAdmin ? 'Create Super Admin' : 'Create Admin'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── User actions kebab menu ──────────────────────────────────────────────────
function UserActions({ user, callerRole, onResetPw, onResetQuota, onSetQuota, onHold, onRelease, onDelete, onFeatureAccess, onPromote, onDemote }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos]   = useState({ top: 0, right: 0 })
  const btnRef = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    function handler(e) {
      if (btnRef.current && !btnRef.current.contains(e.target) &&
          menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleOpen() {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      const menuHeight = items.length * 38 + 12
      const spaceBelow = window.innerHeight - r.bottom
      const openUp = spaceBelow < menuHeight + 8
      setPos(openUp
        ? { bottom: window.innerHeight - r.top + 4, right: window.innerWidth - r.right, top: 'auto' }
        : { top: r.bottom + 4, right: window.innerWidth - r.right, bottom: 'auto' }
      )
    }
    setOpen(o => !o)
  }

  function act(fn) { setOpen(false); fn() }

  const isCaller_SA = callerRole === 'SUPER_ADMIN'
  const isUser      = user.role === 'USER'
  const isAdmin     = user.role === 'ADMIN'
  const isSA        = user.role === 'SUPER_ADMIN'

  const items = [
    // Password reset: SA can reset anyone; ADMIN only resets regular users
    (isCaller_SA || isUser) && user.authMethod === 'password' && { label: 'Reset Password', icon: '🔑', color: '#1a73e8', bg: '#e8f0fe', fn: onResetPw },
    // Quota / features: only for app users
    isUser && { label: 'Set Quota Limit', icon: '🔢', color: '#0288d1', bg: '#e1f5fe', fn: onSetQuota },
    isUser && (user.quotaUsed ?? 0) > 0 && { label: 'Reset AI Quota', icon: '🔄', color: '#7c3aed', bg: '#f3e8ff', fn: onResetQuota },
    isUser && { label: 'Feature Access', icon: '🔧', color: '#e67e22', bg: '#fff3e0', fn: onFeatureAccess },
    // Hold/release: SA can hold anyone except other SA; ADMIN can only hold users
    isUser && (user.onHold
      ? { label: 'Release Account', icon: '✅', color: '#2e7d32', bg: '#e8f5e9', fn: onRelease }
      : { label: 'Put on Hold', icon: '🔒', color: '#e74c3c', bg: '#fff3f3', fn: onHold }),
    // Promote/demote: only SA can do this, and not on themselves
    isCaller_SA && isAdmin && { label: 'Promote to Super Admin', icon: '👑', color: '#d97706', bg: '#fef3c7', fn: onPromote },
    isCaller_SA && isSA    && { label: 'Demote to Admin', icon: '↓', color: '#555', bg: '#f0f0f0', fn: onDemote },
    // Delete: SA can delete admins; ADMIN can only delete users; nobody can delete SA
    !isSA && (isCaller_SA || isUser) && { label: 'Delete User', icon: '🗑', color: '#e74c3c', bg: '#fff0f0', fn: onDelete, danger: true },
  ].filter(Boolean)

  if (items.length === 0) return null

  return (
    <div style={{ flexShrink: 0 }}>
      <button ref={btnRef} onClick={handleOpen}
        style={{
          width: 34, height: 34, borderRadius: 8, border: '1.5px solid #eee',
          background: open ? '#f0f0f0' : 'white', cursor: 'pointer',
          fontSize: 18, fontWeight: 900, color: '#555',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          lineHeight: 1,
        }}>
        ⋮
      </button>
      {open && (
        <div ref={menuRef} style={{
          position: 'fixed', top: pos.top, bottom: pos.bottom, right: pos.right, zIndex: 9999,
          background: 'white', borderRadius: 12, padding: '6px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
          border: '1px solid #eee', minWidth: 180,
        }}>
          {items.map((item, i) => (
            <button key={i} onClick={() => act(item.fn)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '9px 12px', borderRadius: 8, border: 'none',
                background: 'none', cursor: 'pointer', textAlign: 'left',
                fontSize: 13, fontWeight: 700, color: item.color,
                borderTop: item.danger && items.length > 1 ? '1px solid #f5f5f5' : 'none',
                marginTop: item.danger ? 4 : 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = item.bg }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none' }}>
              <span style={{ fontSize: 15, width: 20, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}
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
function BarChart({ data, color = '#6366f1' }) {
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

const AUTO_REFRESH_OPTIONS = [
  { label: 'Off',    value: 0      },
  { label: '1 min',  value: 60000  },
  { label: '5 min',  value: 300000 },
  { label: '15 min', value: 900000 },
  { label: '30 min', value: 1800000},
]

// ─── Dashboard section ────────────────────────────────────────────────────────
function Dashboard() {
  const [range, setRange]         = useState('7d')
  const [stats, setStats]         = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [autoInterval, setAutoInterval] = useState(0)
  const timerRef = useRef(null)

  const fetchStats = useCallback((r) => {
    setLoading(true)
    setError('')
    adminApi.getStats(r || range)
      .then(setStats)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [range])

  useEffect(() => { fetchStats(range) }, [range]) // eslint-disable-line

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (autoInterval > 0) {
      timerRef.current = setInterval(() => fetchStats(range), autoInterval)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [autoInterval, range]) // eslint-disable-line

  const rangeLabel = RANGES.find(r => r.value === range)?.label || '7 Days'

  if (error) return <div style={{ padding: 24 }}><ErrorBox msg={error} /></div>

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

      {/* Range selector + refresh controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', rowGap: 8 }}>
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
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => fetchStats(range)} disabled={loading} title="Refresh now"
            style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #e0e0e0', background: '#fafafa', fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: loading ? 0.5 : 1 }}>
            {loading ? '…' : '🔄'}
          </button>
          <select
            value={autoInterval}
            onChange={e => setAutoInterval(Number(e.target.value))}
            title="Auto-refresh interval"
            style={{ fontSize: 12, fontWeight: 600, color: autoInterval > 0 ? '#6366f1' : '#999', border: '1.5px solid #e0e0e0', borderRadius: 8, padding: '4px 8px', background: autoInterval > 0 ? '#f0f0ff' : '#fafafa', cursor: 'pointer' }}>
            {AUTO_REFRESH_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.value === 0 ? '↺ Off' : `↺ ${o.label}`}</option>)}
          </select>
        </div>
        {loading && <span style={{ fontSize: 12, color: '#aaa', marginLeft: 4 }}>Refreshing…</span>}
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
        <StatCard icon="👤" label="Total Users"    value={stats.totalUsers}      sub={`+${stats.newUsersInRange} in ${rangeLabel.toLowerCase()}`}    color="#6366f1" />
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
          <BarChart data={stats.signupsByDay} color="#6366f1" />
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

      {/* Quota overview */}
      {stats && (
        <div style={{ background: 'white', borderRadius: 16, padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: '#333' }}>🤖 AI Credits — This Month</div>
            <span style={{ fontSize: 11, fontWeight: 700, background: '#f0f0ff', color: '#6366f1', borderRadius: 50, padding: '2px 10px' }}>
              Default: {stats.defaultMonthlyCredits ?? 100} credits/user
            </span>
          </div>
          <div style={{ fontSize: 11, color: '#aaa', marginBottom: 16 }}>
            Credits deducted vary by feature (1–5 per use) · per-user overrides apply · resets on the 1st
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 140px', background: '#f8f9fa', borderRadius: 12, padding: '14px 18px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#6366f1' }}>{(stats.totalQuotaCalls ?? 0).toLocaleString()}</div>
              <div style={{ fontSize: 12, color: '#888', fontWeight: 700, marginTop: 4 }}>Credits spent this month</div>
              <div style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>across all users</div>
            </div>
            <div style={{ flex: '1 1 140px', background: (stats.usersAtLimit ?? 0) > 0 ? '#fff0f0' : '#f8f9fa', borderRadius: 12, padding: '14px 18px', textAlign: 'center', border: (stats.usersAtLimit ?? 0) > 0 ? '1.5px solid #fcc' : 'none' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: (stats.usersAtLimit ?? 0) > 0 ? '#e74c3c' : '#aaa' }}>{stats.usersAtLimit ?? 0}</div>
              <div style={{ fontSize: 12, color: '#888', fontWeight: 700, marginTop: 4 }}>Users out of credits</div>
              <div style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>hit their monthly limit</div>
            </div>
            <div style={{ flex: '1 1 140px', background: (stats.usersNearLimit ?? 0) > 0 ? '#fff8e1' : '#f8f9fa', borderRadius: 12, padding: '14px 18px', textAlign: 'center', border: (stats.usersNearLimit ?? 0) > 0 ? '1.5px solid #ffd54f' : 'none' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: (stats.usersNearLimit ?? 0) > 0 ? '#f57f17' : '#aaa' }}>{stats.usersNearLimit ?? 0}</div>
              <div style={{ fontSize: 12, color: '#888', fontWeight: 700, marginTop: 4 }}>Users running low</div>
              <div style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>used ≥80% of credits</div>
            </div>
          </div>
        </div>
      )}

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
function UserRow({ user, callerRole, onResetPw, onResetQuota, onSetQuota, onHold, onRelease, onDelete, onFeatureAccess, onPromote, onDemote }) {
  const avatarBg = user.onHold
    ? 'linear-gradient(135deg,#e74c3c,#c0392b)'
    : user.role === 'SUPER_ADMIN' ? 'linear-gradient(135deg,#f59e0b,#d97706)'
    : user.role === 'ADMIN' ? 'linear-gradient(135deg,#6366f1,#4f46e5)'
    : 'linear-gradient(135deg,#64748b,#475569)'
  const avatarIcon = user.onHold ? '🔒' : user.role === 'SUPER_ADMIN' ? '👑' : user.role === 'ADMIN' ? '🛡️' : '👤'
  const borderColor = user.onHold ? '#e74c3c' : user.role === 'SUPER_ADMIN' ? '#f59e0b' : user.role === 'ADMIN' ? '#6366f1' : 'transparent'
  const isPrivileged = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'

  return (
    <div style={{ background: user.onHold ? '#fff8f8' : 'white', borderRadius: 14, padding: '14px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', borderLeft: `4px solid ${borderColor}` }}>
      <div style={{
        width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
        background: avatarBg,
      }}>
        {avatarIcon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 800, fontSize: 14, color: '#1a1a2e' }}>{user.email}</span>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 50, background: user.authMethod === 'google' ? '#e8f0fe' : '#f0fff4', color: user.authMethod === 'google' ? '#1a73e8' : '#2e7d32' }}>
            {user.authMethod === 'google' ? '🔵 Google' : '🔒 Password'}
          </span>
          {user.onHold && (
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 50, background: '#fff0f0', color: '#e74c3c', border: '1px solid #fcc' }}>
              🔒 On Hold
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: '#aaa', marginTop: 3 }}>
          Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          {!isPrivileged && <>&nbsp;·&nbsp;{user.childCount} {user.childCount === 1 ? 'child' : 'children'}</>}
        </div>
        {!isPrivileged && (() => {
          const pct = Math.min((user.quotaUsed ?? 0) / (user.quotaLimit ?? 100), 1)
          const color = pct >= 1 ? '#ff4444' : pct >= 0.8 ? '#f59e0b' : pct >= 0.5 ? '#3b82f6' : '#6bcb77'
          const textColor = pct >= 1 ? '#cc0033' : pct >= 0.8 ? '#b45309' : pct >= 0.5 ? '#1d4ed8' : '#15803d'
          return (
            <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, height: 5, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${pct * 100}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.3s' }} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 800, color: textColor, whiteSpace: 'nowrap' }}>
                {user.quotaUsed ?? 0}/{user.quotaLimit ?? 100} AI credits
              </span>
            </div>
          )
        })()}
      </div>
      <UserActions
        user={user}
        callerRole={callerRole}
        onResetPw={onResetPw}
        onResetQuota={onResetQuota}
        onSetQuota={onSetQuota}
        onHold={onHold}
        onRelease={onRelease}
        onDelete={onDelete}
        onFeatureAccess={onFeatureAccess}
        onPromote={onPromote}
        onDemote={onDemote}
      />
    </div>
  )
}

function Users({ callerRole }) {
  const isSuperAdmin = callerRole === 'SUPER_ADMIN'

  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [search, setSearch]     = useState('')
  const [showAddAdmin, setShowAddAdmin] = useState(false)
  const [resetUser, setResetUser]                 = useState(null)
  const [holdUser, setHoldUser]                   = useState(null)
  const [quotaUser, setQuotaUser]                 = useState(null)
  const [featureAccessUser, setFeatureAccessUser] = useState(null)
  const [confirm, setConfirm]                     = useState(null)

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

  async function handlePromote(user) {
    setConfirm({
      title: 'Promote to Super Admin',
      message: `Promote ${user.email} to Super Admin? They will be able to manage other admins and super admins.`,
      confirmLabel: 'Promote',
      confirmColor: '#f59e0b',
      onConfirm: async () => {
        setConfirm(null)
        try {
          await adminApi.promoteToSuperAdmin(user.id)
          setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: 'SUPER_ADMIN' } : u))
        } catch (e) { setError(e.message) }
      }
    })
  }

  async function handleDemote(user) {
    setConfirm({
      title: 'Demote to Admin',
      message: `Demote ${user.email} from Super Admin to Admin? They will lose super admin privileges.`,
      confirmLabel: 'Demote',
      confirmColor: '#ef4444',
      onConfirm: async () => {
        setConfirm(null)
        try {
          await adminApi.demoteToAdmin(user.id)
          setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: 'ADMIN' } : u))
        } catch (e) { setError(e.message) }
      }
    })
  }

  async function handleResetQuota(user) {
    setConfirm({
      title: 'Reset Quota',
      message: `Reset AI quota for ${user.email}? Usage resets to 0 and they get the full ${user.quotaLimit ?? 100} credits immediately.`,
      confirmLabel: 'Reset',
      confirmColor: '#6366f1',
      onConfirm: async () => {
        setConfirm(null)
        try {
          const updated = await adminApi.resetQuota(user.id)
          setUsers(prev => prev.map(u => u.id === user.id ? { ...u, quotaUsed: updated.quotaUsed, quotaLimit: updated.quotaLimit } : u))
        } catch (e) { setError(e.message) }
      }
    })
  }

  async function handleSetQuota(user, newLimit) {
    try {
      const updated = await adminApi.setQuota(user.id, newLimit)
      setUsers(prev => prev.map(u => u.id === user.id
        ? { ...u, quotaUsed: updated.quotaUsed, quotaLimit: updated.quotaLimit }
        : u
      ))
      setQuotaUser(null)
    } catch (e) { throw e }
  }

  const q = search.toLowerCase()
  const superAdmins = users.filter(u => u.role === 'SUPER_ADMIN' && u.email.toLowerCase().includes(q))
  const admins      = users.filter(u => u.role === 'ADMIN'       && u.email.toLowerCase().includes(q))
  const appUsers    = users.filter(u => u.role === 'USER'        && u.email.toLowerCase().includes(q))

  const rowProps = (user) => ({
    user,
    callerRole,
    onResetPw:       () => setResetUser(user),
    onResetQuota:    () => handleResetQuota(user),
    onSetQuota:      () => setQuotaUser(user),
    onHold:          () => setHoldUser(user),
    onRelease:       () => handleRelease(user),
    onDelete:        () => handleDelete(user),
    onFeatureAccess: () => setFeatureAccessUser(user),
    onPromote:       () => handlePromote(user),
    onDemote:        () => handleDemote(user),
  })

  return (
    <div>
      {showAddAdmin && <AddAdminModal onClose={() => setShowAddAdmin(false)} onCreated={u => setUsers(prev => [{ ...u, role: 'ADMIN', authMethod: 'password', createdAt: new Date().toISOString(), childCount: 0 }, ...prev])} />}
      {holdUser && <HoldModal user={holdUser} onClose={() => setHoldUser(null)} onConfirm={reason => handleHold(holdUser, reason)} />}
      {resetUser && <PasswordModal user={resetUser} onClose={() => setResetUser(null)} />}
      {quotaUser && <SetQuotaModal user={quotaUser} onClose={() => setQuotaUser(null)} onSave={limit => handleSetQuota(quotaUser, limit)} />}
      {featureAccessUser && <FeatureAccessModal user={featureAccessUser} onClose={() => setFeatureAccessUser(null)} />}
      <ConfirmDialog
        open={!!confirm} title={confirm?.title} message={confirm?.message}
        confirmLabel={confirm?.confirmLabel} confirmColor={confirm?.confirmColor}
        onConfirm={confirm?.onConfirm} onCancel={() => setConfirm(null)}
      />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 20, color: '#1a1a2e' }}>👥 Users</div>
          <div style={{ fontSize: 13, color: '#aaa', marginTop: 2 }}>
            {users.filter(u => u.role === 'SUPER_ADMIN').length} super admins · {users.filter(u => u.role === 'ADMIN').length} admins · {users.filter(u => u.role === 'USER').length} app users
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            placeholder="Search by email…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ padding: '8px 14px', borderRadius: 50, border: '1.5px solid #eee', fontSize: 13, width: 180, outline: 'none' }}
          />
          <button onClick={() => setShowAddAdmin(true)}
            style={{ padding: '8px 16px', borderRadius: 50, border: 'none', background: '#6366f1', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            + Add Admin
          </button>
          <button onClick={load} disabled={loading} title="Refresh users"
            style={{ width: 34, height: 34, borderRadius: 8, border: '1.5px solid #e0e0e0', background: '#fafafa', fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: loading ? 0.5 : 1 }}>
            {loading ? '…' : '🔄'}
          </button>
        </div>
      </div>

      <ErrorBox msg={error} />

      {loading
        ? <div style={{ textAlign: 'center', padding: 48, color: '#aaa' }}>Loading…</div>
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Super Admins section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: 1 }}>👑 Super Admins</span>
                <span style={{ fontSize: 11, color: '#aaa', fontWeight: 600 }}>{superAdmins.length}</span>
              </div>
              {superAdmins.length === 0
                ? <div style={{ padding: '16px 20px', background: '#fffbeb', borderRadius: 12, fontSize: 13, color: '#aaa' }}>{search ? 'No super admins match your search.' : 'No super admins yet.'}</div>
                : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {superAdmins.map(u => <UserRow key={u.id} {...rowProps(u)} />)}
                  </div>
              }
            </div>

            <div style={{ borderTop: '1.5px solid #f0f0f0' }} />

            {/* Admins section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: 1 }}>🛡️ Administrators</span>
                <span style={{ fontSize: 11, color: '#aaa', fontWeight: 600 }}>{admins.length}</span>
              </div>
              {admins.length === 0
                ? <div style={{ padding: '16px 20px', background: '#f8f9ff', borderRadius: 12, fontSize: 13, color: '#aaa' }}>No admins match your search.</div>
                : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {admins.map(u => <UserRow key={u.id} {...rowProps(u)} />)}
                  </div>
              }
            </div>

            {/* Divider */}
            <div style={{ borderTop: '1.5px solid #f0f0f0' }} />

            {/* App users section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#555', textTransform: 'uppercase', letterSpacing: 1 }}>👤 App Users</span>
                <span style={{ fontSize: 11, color: '#aaa', fontWeight: 600 }}>{appUsers.length}</span>
              </div>
              {appUsers.length === 0
                ? <div style={{ padding: '16px 20px', background: '#f8f9fa', borderRadius: 12, fontSize: 13, color: '#aaa' }}>
                    {search ? `No users matching "${search}"` : 'No app users yet.'}
                  </div>
                : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {appUsers.map(u => <UserRow key={u.id} {...rowProps(u)} />)}
                  </div>
              }
            </div>
          </div>
        )
      }
    </div>
  )
}

// ─── AI Agents section ────────────────────────────────────────────────────────
const AGENT_ICONS = {
  'progress-report':      '📊',
  'milestone':            '🏆',
  'story-recommendation': '✨',
  'learning-insight':     '💡',
  'learn-to-write':       '✏️',
}

function Agents() {
  const [agents, setAgents]   = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(null) // agentId being toggled
  const [msg, setMsg]         = useState('')

  useEffect(() => {
    adminApi.listAgents()
      .then(setAgents)
      .catch(() => setMsg('Failed to load agents'))
      .finally(() => setLoading(false))
  }, [])

  async function handleToggle(agent) {
    const next = !agent.enabled
    setSaving(agent.id); setMsg('')
    try {
      await adminApi.setAgentEnabled(agent.id, next)
      setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, enabled: next } : a))
    } catch (e) {
      setMsg('❌ ' + e.message)
    } finally {
      setSaving(null)
    }
  }

  const enabledCount = agents.filter(a => a.enabled).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', borderRadius: 16, padding: '24px 28px' }}>
        <div style={{ color: 'white', fontWeight: 900, fontSize: 18, marginBottom: 6 }}>🤖 AI Agents</div>
        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 1.7 }}>
          These agents run automatically every <strong style={{ color: 'white' }}>Sunday at 8:00 AM UTC</strong> as part of the Weekly Notifications scheduler.
          Toggle individual agents on or off. Disabled agents are skipped when the scheduler runs — and a log entry is recorded showing which were skipped.
        </div>
        {!loading && (
          <div style={{ marginTop: 12, display: 'inline-block', background: 'rgba(255,255,255,0.15)', borderRadius: 50, padding: '4px 14px', fontSize: 13, color: 'white', fontWeight: 700 }}>
            {enabledCount} of {agents.length} agents enabled
          </div>
        )}
      </div>

      {msg && <div style={{ padding: '10px 16px', background: '#fff3cd', borderRadius: 10, fontSize: 13, color: '#856404' }}>{msg}</div>}

      {loading && <div style={{ textAlign: 'center', padding: 48, color: '#aaa' }}>Loading agents…</div>}

      {/* Agent toggle cards */}
      {!loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {agents.map(a => {
            const icon     = AGENT_ICONS[a.id] || '🤖'
            const toggling = saving === a.id
            return (
              <div key={a.id} style={{
                background: 'white', borderRadius: 14, padding: '18px 22px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', gap: 14, alignItems: 'center',
                borderLeft: `4px solid ${a.enabled ? '#27ae60' : '#ddd'}`,
                opacity: a.enabled ? 1 : 0.65,
                transition: 'opacity 0.2s, border-color 0.2s',
              }}>
                <span style={{ fontSize: 28, flexShrink: 0 }}>{icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: '#1a1a2e' }}>{a.label}</div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 3, lineHeight: 1.6 }}>{a.description}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <button
                    onClick={() => handleToggle(a)}
                    disabled={toggling}
                    style={{
                      width: 48, height: 26, borderRadius: 13, border: 'none',
                      cursor: toggling ? 'wait' : 'pointer', position: 'relative',
                      background: a.enabled ? '#27ae60' : '#e0e0e0',
                      transition: 'background 0.2s',
                      opacity: toggling ? 0.6 : 1,
                    }}>
                    <span style={{
                      position: 'absolute', top: 3, width: 20, height: 20, borderRadius: 10, background: 'white',
                      transition: 'left 0.2s', left: a.enabled ? 25 : 3,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }} />
                  </button>
                  <span style={{ fontSize: 10, fontWeight: 800, color: a.enabled ? '#27ae60' : '#aaa' }}>
                    {toggling ? '…' : a.enabled ? 'ENABLED' : 'DISABLED'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Info */}
      <div style={{ background: '#f8f9fa', borderRadius: 14, padding: '16px 20px', fontSize: 13, color: '#666', lineHeight: 1.7 }}>
        <div style={{ fontWeight: 700, color: '#333', marginBottom: 6 }}>ℹ️ How agents work</div>
        <div>• Each agent generates a different type of notification for parents (progress, milestones, story ideas, learning tips).</div>
        <div>• Agents only run for children who had activity in the past 7 days (14 days for Learning Insight).</div>
        <div>• To manually trigger all enabled agents, go to the <strong>Schedulers</strong> tab and click <em>Run Now</em> on the Weekly Notifications job.</div>
        <div>• When a disabled agent is skipped, a note is recorded in the scheduler's last-run log so you can see exactly what ran.</div>
      </div>
    </div>
  )
}

// ─── Feature Credits section ──────────────────────────────────────────────────

// Token complexity derived from application.yml max-tokens values.
// Used as a reference guide — higher output tokens → heavier AI workload → should cost more.
const FEATURE_META = {
  'story':          { label: 'Story',           icon: '📖', desc: 'Generate a bedtime story',              maxTokens: 512,  suggestedCost: 2 },
  'activity':       { label: 'Activity',        icon: '🎮', desc: 'Generate a personalised activity',      maxTokens: 1024, suggestedCost: 2 },
  'curiosity':      { label: 'Curiosity',       icon: '🔍', desc: "Answer a child's curiosity question",   maxTokens: 512,  suggestedCost: 1 },
  'read-quiz':      { label: 'Read & Quiz',     icon: '📚', desc: 'Generate a read & quiz session',        maxTokens: 1024, suggestedCost: 3 },
  'writing-coach':  { label: 'Writing Coach',   icon: '✍️',  desc: 'Writing coach feedback',               maxTokens: 300,  suggestedCost: 1 },
  'translation':    { label: 'Translation',     icon: '🌐', desc: 'Translate a passage',                   maxTokens: 2048, suggestedCost: 5 },
  'draw':           { label: 'Drawing',         icon: '🎨', desc: "React to a child's drawing with AI praise (guesses or gives contextual feedback when a guide is active)", maxTokens: 256,  suggestedCost: 1 },
  'learn-validate': { label: 'Letter Validate', icon: '🔤', desc: 'Validate a letter drawing',             maxTokens: 200,  suggestedCost: 1 },
  'learn-word':     { label: 'Learn Word',      icon: '✏️',  desc: 'Identify a written word',              maxTokens: 400,  suggestedCost: 2 },
  'story-listen':        { label: 'Story Audio',     icon: '🔊', desc: 'First-time TTS synthesis (cache miss)',  maxTokens: 0,   suggestedCost: 1 },
  'memory':              { label: 'Memory Play',     icon: '🧠', desc: 'Parent gate — enables all Memory Play sub-features', maxTokens: 0, suggestedCost: 0 },
  'memory-flashcards':   { label: 'Flashcards',      icon: '📇', desc: 'Generate a flashcard set',               maxTokens: 512, suggestedCost: 1 },
  'word-of-day':         { label: 'Word of the Day', icon: '📘', desc: 'Generate word of the day',               maxTokens: 300, suggestedCost: 1 },
  'memory-match':        { label: 'Memory Match',    icon: '🃏', desc: 'Generate a memory match game',           maxTokens: 300, suggestedCost: 1 },
  'journal-ai':          { label: 'Journal AI',      icon: '📝', desc: "AI-generated journal entry from child's daily activity", maxTokens: 400, suggestedCost: 2 },
  'draw-guide':          { label: 'Drawing Guide',   icon: '🎨', desc: 'Step-by-step AI drawing guide for a chosen subject',     maxTokens: 300, suggestedCost: 1 },
  'trace':               { label: 'Trace',           icon: '🐾', desc: 'Generate a themed trace game level',                      maxTokens: 300, suggestedCost: 1 },
  'riddle':              { label: 'Riddle',          icon: '🧩', desc: 'Generate a set of 5 age-appropriate riddles',             maxTokens: 400, suggestedCost: 1 },
}

const MAX_TOKENS_OVERALL = 2048  // translation is the ceiling

function complexityLabel(maxTokens) {
  if (maxTokens >= 1024) return { label: 'High',   color: '#e74c3c', bg: '#fdecea' }
  if (maxTokens >= 400)  return { label: 'Medium', color: '#e67e22', bg: '#fff3e0' }
  return                        { label: 'Low',    color: '#27ae60', bg: '#e8f5e9' }
}

// Budget simulator default usage mix (uses per month per feature)
const DEFAULT_MIX = {
  'story': 3, 'activity': 3, 'curiosity': 5, 'read-quiz': 2,
  'writing-coach': 3, 'translation': 1, 'draw': 3, 'learn-validate': 5, 'learn-word': 3, 'story-listen': 2,
  'memory-flashcards': 2, 'word-of-day': 5, 'memory-match': 2, 'journal-ai': 3, 'draw-guide': 4,
  'trace': 3, 'riddle': 3,
}

function FeatureCredits() {
  const isMobile = useIsMobile()
  const [features, setFeatures]         = useState([])
  const [defaults, setDefaults]         = useState(null)
  const [editing, setEditing]           = useState(null)
  const [editVal, setEditVal]           = useState('')
  const [saving, setSaving]             = useState(false)
  const [msg, setMsg]                   = useState('')
  const [mix, setMix]                   = useState(DEFAULT_MIX)
  const [editingDefault, setEditingDefault] = useState(false)
  const [defaultVal, setDefaultVal]     = useState('')
  const [savingDefault, setSavingDefault] = useState(false)

  useEffect(() => {
    Promise.all([adminApi.listFeatureConfigs(), adminApi.getQuotaDefaults()])
      .then(([fc, def]) => { setFeatures(fc); setDefaults(def) })
      .catch(() => setMsg('Failed to load feature credits'))
  }, [])

  async function handleToggleGlobal(featureName, currentEnabled) {
    const next = !currentEnabled
    try {
      await adminApi.setFeatureEnabled(featureName, next)
      setFeatures(prev => prev.map(f => f.featureName === featureName ? { ...f, enabled: next } : f))
      const label = FEATURE_META[featureName]?.label || FEATURE_DISPLAY_MAP[featureName]?.label || featureName
      setMsg(next ? `✅ ${label} enabled globally` : `🔒 ${label} disabled globally`)
    } catch (e) {
      setMsg('❌ ' + e.message)
    }
  }

  async function handleSaveDefault() {
    const val = parseInt(defaultVal, 10)
    if (!val || val < 10 || val > 10000) { setMsg('Default must be between 10 and 10000'); return }
    setSavingDefault(true); setMsg('')
    try {
      const updated = await adminApi.updateQuotaDefault(val)
      setDefaults(updated)
      setEditingDefault(false)
    } catch (e) {
      setMsg('❌ ' + e.message)
    } finally {
      setSavingDefault(false)
    }
  }

  async function handleSave(featureName, directCost) {
    const cost = directCost ?? parseInt(editVal, 10)
    if (!cost || cost < 1 || cost > 100) { setMsg('Credit cost must be 1–100'); return }
    setSaving(true); setMsg('')
    try {
      const updated = await adminApi.updateFeatureConfig(featureName, cost)
      setFeatures(prev => prev.map(f => f.featureName === featureName ? { ...f, creditCost: updated.creditCost } : f))
      setEditing(null)
    } catch (e) {
      setMsg('❌ ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  const budget = defaults?.defaultMonthlyCredits ?? 100

  // Total credits consumed by the simulator mix
  const costMap = Object.fromEntries(features.map(f => [f.featureName, f.creditCost]))
  const simTotal = Object.entries(mix).reduce((sum, [feat, uses]) => sum + uses * (costMap[feat] ?? 1), 0)
  const simPct   = Math.min(simTotal / budget, 1)
  const simColor = simTotal > budget ? '#e74c3c' : simTotal > budget * 0.8 ? '#e67e22' : '#27ae60'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', borderRadius: 16, padding: '24px 28px' }}>
        <div style={{ color: 'white', fontWeight: 900, fontSize: 18, marginBottom: 8 }}>💰 Feature Credit Costs</div>
        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
          Control how many credits each AI feature costs per use.
          Complexity badges are based on the AI output token limit — a useful guide for setting fair weights.
        </div>

        {/* Global default credit editor */}
        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 14 }}>🎁 Default monthly credits per user</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 }}>
              New users and users with no override get this many credits each month. Per-user overrides (in Users section) always take precedence.
            </div>
          </div>
          {editingDefault ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="number" min="10" max="10000" value={defaultVal}
                onChange={e => setDefaultVal(e.target.value)}
                style={{ width: 80, padding: '6px 10px', borderRadius: 8, border: '2px solid rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.9)', fontSize: 15, fontWeight: 800, textAlign: 'center', outline: 'none' }}
                onKeyDown={e => { if (e.key === 'Enter') handleSaveDefault(); if (e.key === 'Escape') setEditingDefault(false) }}
                autoFocus
              />
              <button onClick={handleSaveDefault} disabled={savingDefault}
                style={{ padding: '6px 16px', borderRadius: 8, border: 'none', background: '#ffd93d', color: '#333', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
                {savingDefault ? '…' : 'Save'}
              </button>
              <button onClick={() => setEditingDefault(false)}
                style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.4)', background: 'transparent', color: 'white', fontSize: 13, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 28, color: '#ffd93d', fontWeight: 900 }}>
                {defaults ? defaults.defaultMonthlyCredits : '…'}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>credits/month</span>
              <button
                onClick={() => { setEditingDefault(true); setDefaultVal(String(defaults?.defaultMonthlyCredits ?? 100)) }}
                style={{ padding: '5px 14px', borderRadius: 8, border: '1.5px solid rgba(255,255,255,0.5)', background: 'transparent', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                Change
              </button>
            </div>
          )}
        </div>
      </div>

      {msg && <div style={{ padding: '10px 16px', background: '#fff3cd', borderRadius: 10, fontSize: 13, color: '#856404' }}>{msg}</div>}

      {/* Feature table */}
      <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

        {!isMobile && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 100px 120px 130px 90px', gap: 0, padding: '10px 20px 8px', borderBottom: '2px solid #f0f0f0', background: '#fafafa' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5 }}>Feature</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>Complexity</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>Suggested</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>Current Cost</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>Uses / {budget} credits</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>Global</div>
          </div>
        )}

        {features.length === 0 && <div style={{ padding: 32, textAlign: 'center', color: '#aaa' }}>Loading…</div>}

        {features.map((fc, i) => {
          const meta    = FEATURE_META[fc.featureName] || { label: fc.featureName, icon: '⚙️', desc: fc.description || '', maxTokens: 256, suggestedCost: 1 }
          const cx      = complexityLabel(meta.maxTokens)
          const usesMax = Math.floor(budget / fc.creditCost)
          const isOffSuggestion = fc.creditCost !== meta.suggestedCost

          const stepper = (
            <div style={{ display: 'inline-flex', alignItems: 'center', background: '#f0f0f0', borderRadius: 10, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
              <button onClick={() => handleSave(fc.featureName, Math.max(1, fc.creditCost - 1))} disabled={saving || fc.creditCost <= 1}
                style={{ width: 32, height: 34, border: 'none', background: 'transparent', color: fc.creditCost <= 1 ? '#ccc' : '#6366f1', fontWeight: 900, fontSize: 16, cursor: fc.creditCost <= 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                −
              </button>
              <span style={{ fontWeight: 800, fontSize: 14, minWidth: 30, height: 34, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', borderLeft: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0', color: fc.creditCost >= 4 ? '#c62828' : fc.creditCost >= 2 ? '#0277bd' : '#2e7d32' }}>
                {fc.creditCost}
              </span>
              <button onClick={() => handleSave(fc.featureName, Math.min(100, fc.creditCost + 1))} disabled={saving || fc.creditCost >= 100}
                style={{ width: 32, height: 34, border: 'none', background: 'transparent', color: fc.creditCost >= 100 ? '#ccc' : '#6366f1', fontWeight: 900, fontSize: 16, cursor: fc.creditCost >= 100 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                +
              </button>
            </div>
          )

          const toggle = (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <button onClick={() => handleToggleGlobal(fc.featureName, fc.enabled !== false)}
                style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', position: 'relative', background: fc.enabled !== false ? '#27ae60' : '#e0e0e0', transition: 'background 0.2s' }}>
                <span style={{ position: 'absolute', top: 3, width: 18, height: 18, borderRadius: 9, background: 'white', transition: 'left 0.2s', left: fc.enabled !== false ? 23 : 3, boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
              </button>
              <div style={{ fontSize: 10, color: fc.enabled !== false ? '#27ae60' : '#e74c3c', fontWeight: 700 }}>{fc.enabled !== false ? 'ON' : 'OFF'}</div>
            </div>
          )

          if (isMobile) {
            return (
              <div key={fc.featureName} style={{ padding: '14px 16px', borderBottom: i < features.length - 1 ? '1px solid #f5f5f5' : 'none', background: fc.enabled === false ? '#fff8f8' : 'white', opacity: fc.enabled === false ? 0.75 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 22 }}>{meta.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#1a1a2e' }}>{meta.label}</div>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 50, background: cx.bg, color: cx.color }}>{cx.label} AI load</span>
                    </div>
                  </div>
                  {toggle}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    {stepper}
                    <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>
                      Suggested: <strong>{meta.suggestedCost}</strong>
                      {isOffSuggestion && <span style={{ color: '#e67e22', marginLeft: 4 }}>⚠ differs</span>}
                      &nbsp;·&nbsp;{usesMax}× uses/month
                    </div>
                  </div>
                </div>
              </div>
            )
          }

          return (
            <div key={fc.featureName} style={{
              display: 'grid', gridTemplateColumns: '1fr 90px 100px 120px 130px 90px',
              alignItems: 'center', padding: '13px 20px',
              borderBottom: i < features.length - 1 ? '1px solid #f5f5f5' : 'none',
              background: fc.enabled === false ? '#fff8f8' : 'white',
              transition: 'background 0.15s',
              opacity: fc.enabled === false ? 0.75 : 1,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{meta.icon}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#1a1a2e' }}>{meta.label}</div>
                  <div style={{ fontSize: 11, color: '#bbb', marginTop: 1 }}>{meta.desc}</div>
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 50, background: cx.bg, color: cx.color }}>{cx.label} AI load</span>
                  <span style={{ fontSize: 10, color: '#bbb', maxWidth: 80, textAlign: 'center', lineHeight: 1.3 }}>
                    {cx.label === 'High' ? 'generates a lot of content' : cx.label === 'Medium' ? 'moderate content output' : 'short, quick response'}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 700, padding: '3px 10px', borderRadius: 50, background: '#f0f0f0', color: '#888', border: isOffSuggestion ? '1.5px dashed #e67e22' : 'none' }}
                  title={isOffSuggestion ? `Suggested: ${meta.suggestedCost} — currently differs` : 'Matches suggestion'}>
                  {meta.suggestedCost}{isOffSuggestion && <span style={{ marginLeft: 4, color: '#e67e22' }}>⚠</span>}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>{stepper}</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: usesMax >= 50 ? '#27ae60' : usesMax >= 20 ? '#e67e22' : '#e74c3c' }}>{usesMax}×</div>
                <div style={{ fontSize: 10, color: '#bbb', marginTop: 1 }}>uses/month</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>{toggle}</div>
            </div>
          )
        })}
      </div>

      {/* Budget Simulator */}
      <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '20px 24px' }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: '#1a1a2e', marginBottom: 6 }}>🧮 Budget Simulator</div>

        {/* Explanation */}
        <div style={{ background: '#f8f9ff', border: '1px solid #e0e4ff', borderRadius: 10, padding: '12px 16px', marginBottom: 18, fontSize: 13, color: '#555', lineHeight: 1.8 }}>
          <div style={{ fontWeight: 700, color: '#333', marginBottom: 4 }}>How to use this simulator</div>
          <div>Each row represents one feature. In the <strong>Uses/month</strong> box, enter how many times you think a typical child uses that feature in a month. The simulator then multiplies that by the feature's credit cost to show how many credits that feature alone would consume.</div>
          <div style={{ marginTop: 6 }}>For example: if a child listens to <strong>3 stories</strong> per month and each story costs <strong>2 credits</strong>, that's <strong>3 × 2 = 6 credits</strong> just for stories. Add up all features to see the total monthly spend and check whether it fits within the {budget}-credit budget.</div>
          <div style={{ marginTop: 6, color: '#888' }}>Adjust the numbers to match your users' actual behaviour. If the total exceeds the budget, either raise the default credit limit or reduce some feature costs above.</div>
        </div>

        {!isMobile && (
          <div style={{ display: 'grid', gridTemplateColumns: '140px 160px 1fr 100px', gap: 12, padding: '6px 0 8px', borderBottom: '1.5px solid #f0f0f0', marginBottom: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5 }}>Feature</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5 }}>Uses / month × cost</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5 }}>Share of budget</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'right' }}>Credits</div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 14 : 10 }}>
          {features.map(fc => {
            const meta   = FEATURE_META[fc.featureName] || { label: fc.featureName, icon: '⚙️' }
            const uses   = mix[fc.featureName] ?? 0
            const spend  = uses * fc.creditCost
            const spendPct = Math.min(spend / budget * 100, 100)
            const barColor = spend > budget * 0.4 ? '#e67e22' : '#6366f1'

            if (isMobile) {
              return (
                <div key={fc.featureName} style={{ background: '#f8f9ff', borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#333', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{meta.icon}</span>{meta.label}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: barColor }}>{spend} credits</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <input type="number" min="0" max="200" value={uses}
                      onChange={e => setMix(m => ({ ...m, [fc.featureName]: Math.max(0, parseInt(e.target.value) || 0) }))}
                      style={{ width: 52, padding: '5px 6px', borderRadius: 8, border: '1.5px solid #e0e0e0', fontSize: 14, fontWeight: 700, textAlign: 'center', outline: 'none' }}
                    />
                    <span style={{ fontSize: 12, color: '#888' }}>uses × {fc.creditCost} {fc.creditCost === 1 ? 'credit' : 'credits'}</span>
                  </div>
                  <div style={{ height: 6, background: '#e0e4ff', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${spendPct}%`, background: barColor, borderRadius: 10, transition: 'width 0.3s ease' }} />
                  </div>
                  <div style={{ fontSize: 10, color: '#aaa', marginTop: 3 }}>{Math.round(spendPct)}% of {budget}-credit budget</div>
                </div>
              )
            }

            return (
              <div key={fc.featureName} style={{ display: 'grid', gridTemplateColumns: '140px 160px 1fr 100px', gap: 12, alignItems: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#333', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>{meta.icon}</span> {meta.label}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input type="number" min="0" max="200" value={uses}
                    onChange={e => setMix(m => ({ ...m, [fc.featureName]: Math.max(0, parseInt(e.target.value) || 0) }))}
                    style={{ width: 48, padding: '4px 6px', borderRadius: 8, border: '1.5px solid #e0e0e0', fontSize: 13, fontWeight: 700, textAlign: 'center', outline: 'none' }}
                  />
                  <span style={{ fontSize: 12, color: '#aaa' }}>× {fc.creditCost} {fc.creditCost === 1 ? 'credit' : 'credits'} = <strong style={{ color: barColor }}>{spend}</strong></span>
                </div>
                <div style={{ height: 8, background: '#f0f0f0', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${spendPct}%`, background: barColor, borderRadius: 10, transition: 'width 0.3s ease' }} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: barColor, textAlign: 'right' }}>
                  {spend} / {budget}
                  <div style={{ fontSize: 10, color: '#bbb', fontWeight: 400 }}>{Math.round(spendPct)}%</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Total bar */}
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1.5px solid #f0f0f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#333' }}>Total credits consumed</div>
            <div style={{ fontWeight: 900, fontSize: 18, color: simColor }}>
              {simTotal} / {budget}
              <span style={{ fontWeight: 500, fontSize: 13, color: '#aaa', marginLeft: 6 }}>
                ({Math.round(simPct * 100)}%)
              </span>
            </div>
          </div>
          <div style={{ height: 12, background: '#f0f0f0', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${simPct * 100}%`, background: simColor, borderRadius: 10, transition: 'width 0.3s ease' }} />
          </div>
          {simTotal > budget && (
            <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700, color: '#e74c3c' }}>
              ⚠️ This usage mix would exceed the monthly budget by {simTotal - budget} credits. Consider raising the budget or reducing some feature costs.
            </div>
          )}
          {simTotal <= budget && simTotal > 0 && (
            <div style={{ marginTop: 8, fontSize: 13, color: '#888' }}>
              ✅ This mix fits within the budget with {budget - simTotal} credits to spare.
            </div>
          )}
        </div>

        <button onClick={() => setMix(DEFAULT_MIX)}
          style={{ marginTop: 12, padding: '6px 16px', borderRadius: 8, border: '1px solid #ddd', background: '#f8f8f8', fontSize: 12, cursor: 'pointer', color: '#666' }}>
          Reset to default mix
        </button>
      </div>

      {/* Info box */}
      <div style={{ background: '#f8f9fa', borderRadius: 14, padding: '16px 20px', fontSize: 13, color: '#666', lineHeight: 1.8 }}>
        <div style={{ fontWeight: 700, color: '#333', marginBottom: 8 }}>ℹ️ Guide to setting credit costs</div>
        <div>• <strong>AI Load (Complexity):</strong> This tells you how much work the AI has to do for each feature. Features with <span style={{ color: '#e74c3c', fontWeight: 700 }}>High</span> AI load generate a lot of content (like a full story or a multi-question quiz) and cost the most. <span style={{ color: '#e67e22', fontWeight: 700 }}>Medium</span> features produce moderate output, and <span style={{ color: '#27ae60', fontWeight: 700 }}>Low</span> features give short, quick responses. Higher AI load = higher running cost for the platform = should cost users more credits.</div>
        <div>• <strong>Suggested cost:</strong> The recommended credit value based on how much AI work each feature requires. A ⚠ icon appears if you have set a cost that differs from the suggestion — this is just a reminder, not an error. You are free to override it.</div>
        <div>• <strong>Uses / {budget} credits column:</strong> If a user spent ALL their monthly credits on just this one feature, this is how many times they could use it. It helps you sense-check whether a feature feels too cheap or too expensive.</div>
        <div>• <strong>Budget Simulator:</strong> Use this to test a realistic mix of feature usage before changing any costs. Enter how many times a typical child might use each feature in a month, and see whether the total fits within the monthly credit allowance.</div>
        <div>• <strong>Changes take effect immediately</strong> — as soon as you click + or −, the new cost is saved and applied to all users from their next use.</div>
        <div>• <strong>Individual user overrides:</strong> You can give a specific user more or fewer credits than the global default. Go to the Users section, find the user, and click <em>Set Quota Limit</em>. Their personal limit will always override the global default.</div>
      </div>
    </div>
  )
}

// ─── Scheduler run history popup ─────────────────────────────────────────────
function SchedulerHistoryModal({ scheduler, onClose }) {
  const [history, setHistory] = useState(null)
  const [error, setError]     = useState('')

  useEffect(() => {
    adminApi.schedulerHistory(scheduler.id)
      .then(d => setHistory(d.history ?? []))
      .catch(e => setError(e.message))
  }, [scheduler.id])

  const isNotifications = scheduler.id === 'weekly-notifications'

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 16 }}>
      <div style={{ background: 'white', borderRadius: 20, padding: 28, width: '100%', maxWidth: 600, maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.22)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <h3 style={{ margin: 0, fontSize: 17 }}>📋 Run History — {scheduler.label}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#aaa', lineHeight: 1 }}>✕</button>
        </div>
        <p style={{ margin: '0 0 16px', fontSize: 12, color: '#aaa' }}>Showing up to 50 most recent runs, newest first.</p>

        {error && <div style={{ color: '#e74c3c', fontSize: 13, marginBottom: 12 }}>{error}</div>}
        {!history && !error && <div style={{ textAlign: 'center', color: '#aaa', padding: 40 }}>Loading…</div>}

        {history && history.length === 0 && (
          <div style={{ textAlign: 'center', color: '#aaa', padding: 40 }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
            <div>No runs recorded yet. Trigger the scheduler manually or wait for it to run on schedule.</div>
          </div>
        )}

        {history && history.length > 0 && (
          <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {history.map((run, i) => {
              const status  = run.status ?? (run.success !== false ? 'SUCCESS' : 'FAILED')
              const running = status === 'RUNNING'
              const ok      = status === 'SUCCESS'
              const ran     = run.agentsRan     ?? []
              const skipped = run.agentsSkipped ?? []
              const errors  = run.errors        ?? []
              return (
                <div key={i} style={{
                  borderRadius: 12,
                  border: `1.5px solid ${running ? '#bee3f8' : ok ? '#c3e6cb' : '#f5c6cb'}`,
                  background: running ? '#ebf8ff' : ok ? '#f0fff4' : '#fff5f5',
                  padding: '12px 16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 16 }}>{running ? '⏳' : ok ? '✅' : '❌'}</span>
                    <span style={{ fontWeight: 800, fontSize: 13, color: running ? '#2b6cb0' : ok ? '#2e7d32' : '#c62828' }}>
                      {running ? 'Running…' : ok ? 'Success' : 'Failed'}
                    </span>
                    <span style={{ flex: 1 }} />
                    <span style={{ fontSize: 11, color: '#888', fontWeight: 700 }}>{new Date(run.startedAt).toLocaleString()}</span>
                  </div>

                  {/* Duration */}
                  {run.finishedAt && run.startedAt && (() => {
                    try {
                      const diff = Math.round((new Date(run.finishedAt) - new Date(run.startedAt)) / 1000)
                      return diff > 0
                        ? <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>Duration: {diff < 60 ? diff + 's' : Math.round(diff / 60) + 'm ' + (diff % 60) + 's'}</div>
                        : null
                    } catch { return null }
                  })()}

                  {/* Notifications-specific detail */}
                  {isNotifications && (
                    <div style={{ fontSize: 12, color: '#555', display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {run.childrenProcessed != null && (
                        <div><span style={{ fontWeight: 700 }}>Children:</span> {run.childrenProcessed} processed</div>
                      )}
                      {ran.length > 0 && (
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, color: '#2e7d32' }}>Ran:</span>
                          {ran.map(n => <span key={n} style={{ background: '#e8f5e9', color: '#2e7d32', borderRadius: 50, padding: '1px 8px', fontSize: 11, fontWeight: 700 }}>{n}</span>)}
                        </div>
                      )}
                      {skipped.length > 0 && (
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, color: '#e67e22' }}>Skipped:</span>
                          {skipped.map(n => <span key={n} style={{ background: '#fff3e0', color: '#e67e22', borderRadius: 50, padding: '1px 8px', fontSize: 11, fontWeight: 700 }}>{n}</span>)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Credit reset-specific detail */}
                  {!isNotifications && run.usersReset != null && (
                    <div style={{ fontSize: 12, color: '#555' }}>
                      <span style={{ fontWeight: 700 }}>Users reset:</span> {run.usersReset}
                    </div>
                  )}

                  {/* Errors */}
                  {errors.length > 0 && (
                    <div style={{ marginTop: 6 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#c62828', marginBottom: 3 }}>Errors ({errors.length}):</div>
                      <div style={{ fontSize: 11, color: '#c62828', background: 'rgba(231,76,60,0.06)', borderRadius: 6, padding: '4px 8px', fontFamily: 'monospace', lineHeight: 1.6, maxHeight: 80, overflowY: 'auto' }}>
                        {errors.slice(0, 3).map((e, j) => <div key={j}>{e}</div>)}
                        {errors.length > 3 && <div style={{ color: '#aaa' }}>…and {errors.length - 3} more</div>}
                      </div>
                    </div>
                  )}

                  {run.error && (
                    <div style={{ marginTop: 6, fontSize: 11, color: '#c62828', fontFamily: 'monospace', background: 'rgba(231,76,60,0.06)', borderRadius: 6, padding: '4px 8px' }}>{run.error}</div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <button onClick={onClose} style={{ marginTop: 16, padding: '10px', borderRadius: 10, border: '1.5px solid #eee', background: '#f5f5f5', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
          Close
        </button>
      </div>
    </div>
  )
}

// ─── Schedulers section ───────────────────────────────────────────────────────
function LastRunLog({ log }) {
  if (!log || !log.startedAt) return null
  const ran     = log.agentsRan     ?? []
  const skipped = log.agentsSkipped ?? []
  const errors  = log.errors        ?? []
  return (
    <div style={{ marginTop: 16, background: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: 10, padding: '14px 18px', fontSize: 13 }}>
      <div style={{ fontWeight: 700, color: '#333', marginBottom: 8 }}>📋 Last Run Log</div>
      <div style={{ color: '#555', marginBottom: 6 }}>
        <span style={{ fontWeight: 700 }}>Started:</span> {log.startedAt}
        {log.finishedAt && <span> &nbsp;→&nbsp; <span style={{ fontWeight: 700 }}>Finished:</span> {log.finishedAt}</span>}
      </div>
      {log.childrenProcessed != null && (
        <div style={{ color: '#555', marginBottom: 8 }}>
          <span style={{ fontWeight: 700 }}>Children processed:</span> {log.childrenProcessed}
        </div>
      )}
      {ran.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          <span style={{ fontWeight: 700, color: '#27ae60' }}>✅ Agents ran:</span>{' '}
          {ran.map(n => <span key={n} style={{ display: 'inline-block', background: '#e8f5e9', color: '#2e7d32', borderRadius: 50, padding: '1px 10px', marginRight: 4, fontSize: 12, fontWeight: 700 }}>{n}</span>)}
        </div>
      )}
      {skipped.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          <span style={{ fontWeight: 700, color: '#e67e22' }}>⏭️ Agents skipped (disabled):</span>{' '}
          {skipped.map(n => <span key={n} style={{ display: 'inline-block', background: '#fff3e0', color: '#e67e22', borderRadius: 50, padding: '1px 10px', marginRight: 4, fontSize: 12, fontWeight: 700 }}>{n}</span>)}
        </div>
      )}
      {errors.length > 0 && (
        <div>
          <span style={{ fontWeight: 700, color: '#e74c3c' }}>❌ Errors ({errors.length}):</span>
          <div style={{ marginTop: 4, fontSize: 12, color: '#c0392b', background: '#fff5f5', borderRadius: 6, padding: '6px 10px', fontFamily: 'monospace', lineHeight: 1.6 }}>
            {errors.slice(0, 5).map((e, i) => <div key={i}>{e}</div>)}
            {errors.length > 5 && <div style={{ color: '#aaa' }}>…and {errors.length - 5} more</div>}
          </div>
        </div>
      )}
    </div>
  )
}

function Schedulers() {
  const [schedulers, setSchedulers]       = useState([])
  const [triggered, setTriggered]         = useState({}) // id → triggeredAt string
  const [historyScheduler, setHistorySch] = useState(null)
  const [msg, setMsg]                     = useState('')

  const loadStatus = useCallback(() => {
    adminApi.schedulerStatus()
      .then(data => setSchedulers(data.schedulers ?? []))
      .catch(() => setMsg('Failed to load scheduler info'))
  }, [])

  useEffect(() => { loadStatus() }, [loadStatus])

  function handleRun(scheduler) {
    // Fire and forget — backend runs async, we don't wait
    if (scheduler.id === 'weekly-notifications') {
      adminApi.runNotifications().catch(() => {})
    } else {
      adminApi.runScheduler(scheduler.id).catch(() => {})
    }
    setTriggered(prev => ({ ...prev, [scheduler.id]: new Date().toLocaleString() }))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {historyScheduler && <SchedulerHistoryModal scheduler={historyScheduler} onClose={() => setHistorySch(null)} />}

      <div>
        <div style={{ fontWeight: 900, fontSize: 20, color: '#1a1a2e', marginBottom: 4 }}>⏰ Schedulers</div>
        <div style={{ fontSize: 13, color: '#aaa' }}>Manually trigger background jobs that normally run on a schedule. Useful when the server was asleep and missed a scheduled run.</div>
      </div>

      {msg && <div style={{ fontSize: 13, color: '#e74c3c', background: '#fff5f5', borderRadius: 10, padding: '10px 14px' }}>{msg}</div>}

      <div style={{ background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#795548', lineHeight: 1.7 }}>
        <strong>⚠️ Important:</strong> These jobs run immediately and affect all users. For example, triggering <em>Monthly Credit Reset</em> will reset every user's usage counter to 0 right now — even if it's mid-month. Only run these if the automatic schedule was missed.
      </div>

      {schedulers.map(s => {
        const triggeredAt = triggered[s.id]
        const lastRun = s.lastRun
        const lastRunOk = lastRun?.startedAt ? lastRun.success !== false : null
        return (
          <div key={s.id} style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#1a1a2e' }}>{s.label}</div>
                  {lastRunOk !== null && (
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 50,
                      background: lastRunOk ? '#e8f5e9' : '#fff0f0',
                      color: lastRunOk ? '#2e7d32' : '#c62828',
                    }}>
                      {lastRunOk ? '✅ Last run OK' : '❌ Last run failed'}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: '#666', lineHeight: 1.7, marginBottom: 8 }}>{s.description}</div>
                <div style={{ fontSize: 12, color: '#aaa' }}>
                  <span style={{ fontWeight: 700, color: '#888' }}>Normal schedule: </span>{s.schedule}
                </div>
                {lastRun?.startedAt && (
                  <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>
                    Last run: {lastRun.startedAt}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', flexShrink: 0 }}>
                <button
                  onClick={() => handleRun(s)}
                  style={{
                    padding: '10px 22px', borderRadius: 10, border: 'none', fontWeight: 800, fontSize: 13,
                    cursor: 'pointer',
                    background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
                    color: 'white',
                  }}>
                  ▶ Run Now
                </button>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={loadStatus}
                    style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid #e0e0e0', background: '#f8f8f8', fontSize: 12, cursor: 'pointer', color: '#777', fontWeight: 700 }}>
                    🔄 Refresh
                  </button>
                  <button onClick={() => setHistorySch(s)}
                    style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid #d0d4ff', background: '#f0f2ff', fontSize: 12, cursor: 'pointer', color: '#6366f1', fontWeight: 700 }}>
                    📋 History
                  </button>
                </div>
              </div>
            </div>

            {triggeredAt && (
              <div style={{ marginTop: 16, background: '#f0fff4', border: '1px solid #c3e6cb', borderRadius: 10, padding: '12px 16px', fontSize: 13 }}>
                <div style={{ fontWeight: 700, color: '#2e7d32', marginBottom: 4 }}>✅ Triggered at {triggeredAt}</div>
                <div style={{ color: '#555' }}>
                  The job is running in the background. Click <strong>Refresh</strong> after a minute, then <strong>History</strong> to see the full run log.
                </div>
              </div>
            )}

            <LastRunLog log={lastRun} />
          </div>
        )
      })}
    </div>
  )
}

// ─── Main AdminPage ───────────────────────────────────────────────────────────
export default function AdminPage({ onBack, onLogout }) {
  const navigate     = useNavigate()
  const location     = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = useIsMobile()

  // Derive active section from URL: /admin/users → 'users', /admin → 'dashboard'
  const pathSegment = location.pathname.split('/').filter(Boolean)[1] // segment after 'admin'
  const active = NAV.find(n => n.id === pathSegment) ? pathSegment : 'dashboard'

  const callerRole = localStorage.getItem('glm_role') || 'ADMIN'
  const section = { dashboard: <Dashboard />, users: <Users callerRole={callerRole} />, agents: <Agents />, credits: <FeatureCredits />, schedulers: <Schedulers /> }
  const current = NAV.find(n => n.id === active)

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f1f5f9', overflow: 'hidden' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: isMobile ? (sidebarOpen ? 220 : 0) : 220,
        minWidth: isMobile ? (sidebarOpen ? 220 : 0) : 220,
        background: '#0f172a', display: 'flex', flexDirection: 'column',
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
              <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 16, color: 'white', lineHeight: 1.2 }}>Glumbi</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase' }}>Admin Panel</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV.map(item => (
            <button key={item.id} onClick={() => { navigate(`/admin/${item.id}`); setSidebarOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: active === item.id ? 'rgba(99,102,241,0.2)' : 'transparent',
                color: active === item.id ? '#818cf8' : 'rgba(255,255,255,0.55)',
                fontWeight: active === item.id ? 700 : 500, fontSize: 14,
                textAlign: 'left', width: '100%',
                borderLeft: active === item.id ? '3px solid #818cf8' : '3px solid transparent',
                transition: 'all 0.15s',
              }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button onClick={() => { navigate('/admin/profile'); setSidebarOpen(false) }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'transparent', color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: 600, textAlign: 'left' }}>
            👤 My Profile
          </button>
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
          {!isMobile && (
            <div style={{ marginLeft: 'auto', fontSize: 12, color: '#aaa' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          )}
        </div>

        {/* Page content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? 16 : 24 }}>
          {section[active]}
        </div>
      </div>
    </div>
  )
}
