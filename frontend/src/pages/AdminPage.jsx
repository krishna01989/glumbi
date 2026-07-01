import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { adminApi } from '../api/client'

function PasswordModal({ user, onClose }) {
  const [pw, setPw]       = useState('')
  const [msg, setMsg]     = useState('')
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
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{ background: 'white', borderRadius: 20, padding: 32, width: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 18 }}>🔑 Reset Password</h3>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: '#888' }}>{user.email}</p>

        <input
          type="password" placeholder="New password" value={pw}
          onChange={e => setPw(e.target.value)}
          style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #ddd', fontSize: 14, boxSizing: 'border-box', marginBottom: 12 }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
          {[
            ['length',    '8+ characters'],
            ['uppercase', 'Uppercase letter (A-Z)'],
            ['number',    'Number (0-9)'],
            ['special',   'Special character (!@#$…)'],
          ].map(([key, label]) => (
            <div key={key} style={{ fontSize: 12, color: checks[key] ? '#27ae60' : '#bbb', display: 'flex', gap: 6 }}>
              <span>{checks[key] ? '✅' : '○'}</span> {label}
            </div>
          ))}
        </div>

        {msg && <div style={{ fontSize: 13, marginBottom: 12, color: msg.startsWith('✅') ? '#27ae60' : '#e74c3c' }}>{msg}</div>}

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1.5px solid #eee', background: '#f5f5f5', cursor: 'pointer', fontWeight: 700 }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={!strong || saving}
            style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: strong ? '#2d3436' : '#ccc', color: 'white', cursor: strong ? 'pointer' : 'not-allowed', fontWeight: 700 }}>
            {saving ? 'Saving…' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminPage({ onBack, onLogout }) {
  const [users, setUsers]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [resetUser, setResetUser] = useState(null)

  useEffect(() => { loadUsers() }, [])

  async function loadUsers() {
    try {
      setLoading(true)
      const data = await adminApi.getUsers()
      setUsers(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(user) {
    if (!window.confirm(`Delete ${user.email} and ALL their children's data? This cannot be undone.`)) return
    try {
      await adminApi.deleteUser(user.id)
      setUsers(prev => prev.filter(u => u.id !== user.id))
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleRoleToggle(user) {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN'
    if (!window.confirm(`Change ${user.email} to ${newRole}?`)) return
    try {
      const updated = await adminApi.changeRole(user.id, newRole)
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: updated.role } : u))
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      {resetUser && <PasswordModal user={resetUser} onClose={() => setResetUser(null)} />}
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg,#2d3436,#636e72)',
        padding: '0 28px', height: 64,
        display: 'flex', alignItems: 'center', gap: 16,
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      }}>
        <span style={{ fontSize: 24 }}>🛡️</span>
        <span style={{ fontFamily: 'Fredoka One, cursive', fontSize: 22, color: 'white' }}>Admin Panel</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          {onBack && (
            <button onClick={onBack}
              style={{ padding: '7px 18px', borderRadius: 50, background: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700, fontSize: 13 }}>
              ← Back to App
            </button>
          )}
          {onLogout && (
            <button onClick={onLogout}
              style={{ padding: '7px 18px', borderRadius: 50, background: 'rgba(255,0,0,0.3)', color: 'white', fontWeight: 700, fontSize: 13 }}>
              Sign Out
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: 32, maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, color: '#2d3436' }}>👥 All Users ({users.length})</h2>
          <button onClick={loadUsers} style={{ padding: '8px 18px', borderRadius: 50, background: '#f0f0f0', fontWeight: 700, fontSize: 13 }}>
            🔄 Refresh
          </button>
        </div>

        {error && (
          <div style={{ background: '#fff0f0', border: '1.5px solid #ffb3b3', borderRadius: 12, padding: '12px 16px', marginBottom: 20, color: '#c0392b', fontWeight: 600 }}>
            🚫 {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#999' }}>Loading users…</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {users.map(user => (
              <div key={user.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: user.role === 'ADMIN' ? 'linear-gradient(135deg,#2d3436,#636e72)' : 'linear-gradient(135deg,#ff6b6b,#ff8e53)',
                  fontSize: 20, flexShrink: 0,
                }}>
                  {user.role === 'ADMIN' ? '🛡️' : '👤'}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: 15, color: '#2d3436' }}>{user.email}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 50,
                      background: user.authMethod === 'google' ? '#e8f0fe' : '#f0fff4',
                      color:      user.authMethod === 'google' ? '#1a73e8' : '#2e7d32',
                    }}>
                      {user.authMethod === 'google' ? '🔵 Google' : '🔒 Password'}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                    Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    &nbsp;·&nbsp; {user.childCount} {user.childCount === 1 ? 'child' : 'children'}
                  </div>
                </div>

                <span style={{
                  padding: '4px 12px', borderRadius: 50, fontSize: 12, fontWeight: 700,
                  background: user.role === 'ADMIN' ? '#2d3436' : '#e8f5e9',
                  color: user.role === 'ADMIN' ? 'white' : '#2e7d32',
                }}>
                  {user.role}
                </span>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleRoleToggle(user)}
                    style={{ padding: '7px 14px', borderRadius: 50, fontSize: 12, fontWeight: 700, background: '#f0f0f0', color: '#555', border: 'none', cursor: 'pointer' }}>
                    {user.role === 'ADMIN' ? '↓ Demote' : '↑ Make Admin'}
                  </button>
                  {user.authMethod === 'password' && (
                    <button onClick={() => setResetUser(user)}
                      style={{ padding: '7px 14px', borderRadius: 50, fontSize: 12, fontWeight: 700, background: '#e8f0fe', color: '#1a73e8', border: 'none', cursor: 'pointer' }}>
                      🔑 Reset PW
                    </button>
                  )}
                  <button onClick={() => handleDelete(user)}
                    className="btn-danger" style={{ padding: '7px 14px', fontSize: 12 }}>
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))}

            {users.length === 0 && (
              <div style={{ textAlign: 'center', padding: 48, color: '#999' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
                <div>No users yet</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
