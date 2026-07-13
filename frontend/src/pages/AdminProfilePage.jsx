import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userApi } from '../api/client'

function PasswordStrength({ password }) {
  const checks = {
    length:    password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number:    /[0-9]/.test(password),
    special:   /[!@#$%^&*()_+\-=\[\]{}|;':",./<>?]/.test(password),
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 12px', marginTop: 6 }}>
      {[['length','8+ chars'],['uppercase','Uppercase'],['number','Number'],['special','Special char']].map(([k,l]) => (
        <span key={k} style={{ fontSize: 11, fontWeight: 700, color: checks[k] ? '#27ae60' : '#ccc' }}>
          {checks[k] ? '✅' : '○'} {l}
        </span>
      ))}
    </div>
  )
}

export default function AdminProfilePage({ onLogout }) {
  const navigate   = useNavigate()
  const role       = localStorage.getItem('glm_role') || 'ADMIN'
  const isSA       = role === 'SUPER_ADMIN'
  const [email, setEmail] = useState('')

  useEffect(() => {
    userApi.getProfile().then(p => setEmail(p.email)).catch(() => {})
  }, [])

  const [currentPw,  setCurrentPw]  = useState('')
  const [newPw,      setNewPw]      = useState('')
  const [confirmPw,  setConfirmPw]  = useState('')
  const [pwLoading,  setPwLoading]  = useState(false)
  const [pwSuccess,  setPwSuccess]  = useState('')
  const [pwError,    setPwError]    = useState('')

  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError,   setDeleteError]   = useState('')

  async function handleChangePassword(e) {
    e.preventDefault()
    setPwError(''); setPwSuccess('')
    if (!currentPw) { setPwError('Enter your current password'); return }
    if (newPw !== confirmPw) { setPwError('New passwords do not match'); return }
    const checks = {
      length:    newPw.length >= 8,
      uppercase: /[A-Z]/.test(newPw),
      number:    /[0-9]/.test(newPw),
      special:   /[!@#$%^&*()_+\-=\[\]{}|;':",./<>?]/.test(newPw),
    }
    if (!Object.values(checks).every(Boolean)) { setPwError('Password does not meet the strength requirements'); return }
    setPwLoading(true)
    try {
      await userApi.changePassword(currentPw, newPw)
      setPwSuccess('Password updated successfully.')
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    } catch (e) {
      setPwError(e.message)
    } finally {
      setPwLoading(false)
    }
  }

  async function handleDeleteAccount() {
    setDeleteLoading(true); setDeleteError('')
    try {
      await userApi.deleteAccount()
      if (onLogout) onLogout()
      else navigate('/login', { replace: true })
    } catch (e) {
      setDeleteError(e.message)
      setDeleteLoading(false)
    }
  }

  const card = { background: 'white', borderRadius: 16, padding: '24px 28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 20 }
  const label = { display: 'block', fontSize: 12, fontWeight: 800, color: '#888', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }
  const input = { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e0e0e0', fontSize: 14, boxSizing: 'border-box', outline: 'none', fontFamily: 'Nunito, sans-serif' }

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: 'Nunito, sans-serif' }}>

      {/* Top bar */}
      <div style={{ height: 60, background: '#0f172a', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 14 }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: 'white' }}>My Profile</div>
        <div style={{ marginLeft: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 50, background: isSA ? 'rgba(245,158,11,0.25)' : 'rgba(99,102,241,0.25)', color: isSA ? '#fbbf24' : '#818cf8' }}>
            {isSA ? '👑 Super Admin' : '🛡️ Admin'}
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: '24px auto', padding: '0 16px' }}>
        <button onClick={() => navigate(-1)}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.transform = 'translateX(-2px)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'none' }}
          style={{
            background: 'transparent', border: '1.5px solid #c7d2fe', color: '#6366f1',
            fontWeight: 700, fontSize: 13, cursor: 'pointer',
            padding: '6px 14px', marginBottom: 20, borderRadius: 50,
            display: 'inline-flex', alignItems: 'center', gap: 6,
            transition: 'all 0.15s ease',
          }}>
          ← Back
        </button>

        {/* Account info */}
        <div style={card}>
          <div style={{ fontSize: 15, fontWeight: 900, color: '#1a1a2e', marginBottom: 18 }}>👤 Account</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: isSA ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'linear-gradient(135deg,#6366f1,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
              {isSA ? '👑' : '🛡️'}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#1a1a2e' }}>{email || '—'}</div>
              <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{isSA ? 'Super Admin' : 'Admin'} · Password login</div>
            </div>
          </div>
        </div>

        {/* Change password */}
        <div style={card}>
          <div style={{ fontSize: 15, fontWeight: 900, color: '#1a1a2e', marginBottom: 18 }}>🔑 Change Password</div>
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={label}>Current password</label>
              <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} style={input} autoComplete="current-password" />
            </div>
            <div>
              <label style={label}>New password</label>
              <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} style={input} autoComplete="new-password" />
              {newPw.length > 0 && <PasswordStrength password={newPw} />}
            </div>
            <div>
              <label style={label}>Confirm new password</label>
              <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} style={input} autoComplete="new-password" />
            </div>
            {pwError   && <div style={{ fontSize: 13, color: '#e74c3c', fontWeight: 600 }}>{pwError}</div>}
            {pwSuccess && <div style={{ fontSize: 13, color: '#27ae60', fontWeight: 600 }}>{pwSuccess}</div>}
            <button type="submit" disabled={pwLoading}
              style={{ padding: '11px', borderRadius: 50, border: 'none', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: 'white', fontWeight: 800, fontSize: 14, cursor: pwLoading ? 'not-allowed' : 'pointer', opacity: pwLoading ? 0.7 : 1 }}>
              {pwLoading ? 'Saving…' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Delete account */}
        <div style={{ ...card, border: '1.5px solid #fcc', background: '#fff8f8' }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: '#c62828', marginBottom: 8 }}>⚠️ Delete Account</div>
          <div style={{ fontSize: 13, color: '#888', lineHeight: 1.7, marginBottom: 16 }}>
            Permanently deletes your admin account. This cannot be undone.
            {isSA && ' You must have at least one other super admin before you can delete your account.'}
          </div>
          {deleteError && <div style={{ fontSize: 13, color: '#e74c3c', marginBottom: 12, fontWeight: 600 }}>{deleteError}</div>}
          {!deleteConfirm
            ? <button onClick={() => setDeleteConfirm(true)}
                style={{ padding: '10px 24px', borderRadius: 50, border: '1.5px solid #e74c3c', background: 'white', color: '#e74c3c', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
                Delete my account
              </button>
            : <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setDeleteConfirm(false)}
                  style={{ flex: 1, padding: 10, borderRadius: 50, border: '1.5px solid #eee', background: 'white', color: '#aaa', fontWeight: 700, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={handleDeleteAccount} disabled={deleteLoading}
                  style={{ flex: 1, padding: 10, borderRadius: 50, border: 'none', background: '#e74c3c', color: 'white', fontWeight: 800, cursor: deleteLoading ? 'not-allowed' : 'pointer', opacity: deleteLoading ? 0.7 : 1 }}>
                  {deleteLoading ? 'Deleting…' : 'Yes, delete'}
                </button>
              </div>
          }
        </div>

      </div>
    </div>
  )
}
