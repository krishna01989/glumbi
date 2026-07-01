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
    <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
      {[['length','8+ chars'],['uppercase','A-Z'],['number','0-9'],['special','!@#…']].map(([k,l]) => (
        <span key={k} style={{ fontSize: 11, fontWeight: 700, color: checks[k] ? '#27ae60' : '#bbb' }}>
          {checks[k] ? '✅' : '○'} {l}
        </span>
      ))}
    </div>
  )
}

export default function ProfilePage({ onLogout }) {
  const navigate = useNavigate()
  const [profile, setProfile]       = useState(null)
  const [loading, setLoading]       = useState(true)

  // password change state
  const [currentPw, setCurrentPw]   = useState('')
  const [newPw, setNewPw]           = useState('')
  const [confirmPw, setConfirmPw]   = useState('')
  const [pwLoading, setPwLoading]   = useState(false)
  const [pwError, setPwError]       = useState('')
  const [pwSuccess, setPwSuccess]   = useState(false)

  // delete state
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError]     = useState('')
  const [showDelete, setShowDelete]       = useState(false)

  useEffect(() => {
    userApi.getProfile()
      .then(setProfile)
      .finally(() => setLoading(false))
  }, [])

  async function handlePasswordChange(e) {
    e.preventDefault()
    setPwError(''); setPwSuccess(false)
    if (newPw !== confirmPw) { setPwError('New passwords do not match'); return }
    setPwLoading(true)
    try {
      await userApi.changePassword(currentPw, newPw)
      setPwSuccess(true)
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    } catch (err) {
      setPwError(err.message)
    } finally {
      setPwLoading(false)
    }
  }

  async function handleDeleteAccount() {
    setDeleteError('')
    setDeleteLoading(true)
    try {
      await userApi.deleteAccount()
      onLogout()
    } catch (err) {
      setDeleteError(err.message)
      setDeleteLoading(false)
    }
  }

  const card = {
    background: 'white', borderRadius: 16,
    border: '1.5px solid #f0f0f0',
    padding: '28px 32px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    marginBottom: 24,
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
      <span className="spinner" style={{ width: 36, height: 36, borderWidth: 4 }} />
    </div>
  )

  const isGoogle = profile?.authMethod === 'google'
  const joinedDate = profile?.joinedAt
    ? new Date(profile.joinedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—'

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', fontFamily: 'Nunito, sans-serif' }}>
      <button onClick={() => navigate(-1)}
        style={{ background: 'none', border: 'none', fontSize: 13, fontWeight: 700, color: '#999', cursor: 'pointer', padding: '0 0 16px', display: 'flex', alignItems: 'center', gap: 4 }}>
        ← Back
      </button>
      <h2 style={{ fontFamily: 'Fredoka One, cursive', fontSize: 26, color: '#2d2d2d', marginBottom: 24 }}>
        My Account
      </h2>

      {/* Profile info */}
      <div style={card}>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 20px' }}>
          Account Info
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Row label="Email" value={profile?.email} />
          <Row label="Sign-in method" value={isGoogle ? '🔵 Google' : '🔑 Email & password'} />
          <Row label="Member since" value={joinedDate} />
        </div>
      </div>

      {/* Change password — password accounts only */}
      {!isGoogle && (
        <div style={card}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 20px' }}>
            Change Password
          </h3>
          <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Current password">
              <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)}
                placeholder="••••••••" required style={inputStyle} />
            </Field>
            <Field label="New password">
              <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
                placeholder="••••••••" required style={inputStyle} />
              {newPw.length > 0 && <PasswordStrength password={newPw} />}
            </Field>
            <Field label="Confirm new password">
              <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                placeholder="••••••••" required style={inputStyle} />
            </Field>

            {pwError && (
              <div style={{ background: '#fff0f0', border: '1.5px solid #ffb3b3', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#c0392b', fontWeight: 600 }}>
                🚫 {pwError}
              </div>
            )}
            {pwSuccess && (
              <div style={{ background: '#f0fff4', border: '1.5px solid #6bcb77', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#1e6b3c', fontWeight: 600 }}>
                ✅ Password updated successfully
              </div>
            )}

            <button type="submit" disabled={pwLoading}
              style={{ alignSelf: 'flex-start', padding: '10px 24px', borderRadius: 50, fontSize: 14, fontWeight: 800, background: 'linear-gradient(135deg,#ff6b6b,#ff8e53)', color: 'white', border: 'none', cursor: pwLoading ? 'not-allowed' : 'pointer', opacity: pwLoading ? 0.7 : 1 }}>
              {pwLoading ? 'Saving…' : 'Update Password'}
            </button>
          </form>
        </div>
      )}

      {/* Delete account */}
      <div style={{ ...card, border: '1.5px solid #ffe0e0' }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: '#e74c3c', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 12px' }}>
          Delete Account
        </h3>
        <p style={{ fontSize: 13, color: '#888', margin: '0 0 16px', lineHeight: 1.6 }}>
          Permanently deletes your account and all your children's stories, activities, and data. This cannot be undone.
        </p>
        {!showDelete ? (
          <button onClick={() => setShowDelete(true)}
            style={{ padding: '9px 20px', borderRadius: 50, fontSize: 13, fontWeight: 800, background: '#fff0f0', color: '#e74c3c', border: '1.5px solid #fcc', cursor: 'pointer' }}>
            Delete my account
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 13, color: '#c0392b', fontWeight: 700, margin: 0 }}>
              Type <strong>DELETE</strong> to confirm:
            </p>
            <input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)}
              placeholder="DELETE" style={{ ...inputStyle, borderColor: '#fcc' }} />
            {deleteError && (
              <div style={{ background: '#fff0f0', border: '1.5px solid #ffb3b3', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#c0392b', fontWeight: 600 }}>
                🚫 {deleteError}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleDeleteAccount}
                disabled={deleteConfirm !== 'DELETE' || deleteLoading}
                style={{ padding: '9px 20px', borderRadius: 50, fontSize: 13, fontWeight: 800, background: deleteConfirm === 'DELETE' ? '#e74c3c' : '#ccc', color: 'white', border: 'none', cursor: deleteConfirm === 'DELETE' ? 'pointer' : 'not-allowed' }}>
                {deleteLoading ? 'Deleting…' : 'Permanently delete'}
              </button>
              <button onClick={() => { setShowDelete(false); setDeleteConfirm('') }}
                style={{ padding: '9px 20px', borderRadius: 50, fontSize: 13, fontWeight: 700, background: '#f5f5f5', color: '#555', border: 'none', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14 }}>
      <span style={{ color: '#999', fontWeight: 700 }}>{label}</span>
      <span style={{ color: '#2d2d2d', fontWeight: 600 }}>{value}</span>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 700, color: '#555', display: 'block', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '11px 14px', borderRadius: 12,
  border: '1.5px solid #eee', fontSize: 14, boxSizing: 'border-box',
  fontFamily: 'Nunito, sans-serif',
}
