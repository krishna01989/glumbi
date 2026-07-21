import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { authApi } from '../api/client'
import PublicHeader from '../components/PublicHeader'
import Footer from '../components/Footer'

const CHECKS = {
  length:    { label: 'At least 8 characters',         test: p => p.length >= 8 },
  uppercase: { label: 'One uppercase letter',           test: p => /[A-Z]/.test(p) },
  number:    { label: 'One number',                     test: p => /[0-9]/.test(p) },
  special:   { label: 'One special character',          test: p => /[!@#$%^&*()_+\-=\[\]{}|;':",./<>?]/.test(p) },
}

export default function ResetPasswordPage() {
  const [searchParams]        = useSearchParams()
  const navigate              = useNavigate()
  const token                 = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [status,   setStatus]   = useState('validating') // validating | idle | loading | success | error | invalid
  const [errMsg,   setErrMsg]   = useState('')

  // Validate token against backend on mount
  useEffect(() => {
    if (!token) { setErrMsg('This reset link is missing or malformed.'); setStatus('invalid'); return }
    authApi.validateResetToken(token)
      .then(() => setStatus('idle'))
      .catch(err => {
        setErrMsg(err?.response?.data?.error || 'This reset link is invalid.')
        setStatus('invalid')
      })
  }, [token])

  const checks  = Object.fromEntries(Object.entries(CHECKS).map(([k, v]) => [k, v.test(password)]))
  const strong   = Object.values(checks).every(Boolean)
  const matching = password === confirm && confirm.length > 0

  async function handleSubmit(e) {
    e.preventDefault()
    if (!strong || !matching) return
    setStatus('loading')
    try {
      await authApi.resetPassword(token, password)
      setStatus('success')
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      const msg = err?.response?.data?.error || 'Something went wrong. Please try again.'
      setErrMsg(msg)
      // Treat token-related errors as invalid state so the user sees a clear message with a re-request link
      const isTokenError = msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('used')
      setStatus(isTokenError ? 'invalid' : 'error')
    }
  }

  if (status === 'validating') return (
    <PageShell>
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ fontSize: 36, marginBottom: 16 }}>🔗</div>
        <p style={{ margin: 0, fontSize: 14, color: '#888' }}>Verifying your reset link…</p>
      </div>
    </PageShell>
  )

  if (status === 'invalid') return (
    <PageShell>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
        <p style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>Link unavailable</p>
        <p style={{ margin: '0 0 24px', fontSize: 13, color: '#888' }}>
          {errMsg || 'This reset link is missing or malformed.'}
        </p>
        <Link to="/forgot-password" style={linkBtnStyle('linear-gradient(135deg,#ff6b6b,#ff8e53)')}>Request a new link</Link>
      </div>
    </PageShell>
  )

  if (status === 'success') return (
    <PageShell>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <p style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>Password updated!</p>
        <p style={{ margin: '0 0 24px', fontSize: 13, color: '#888' }}>
          Redirecting you to login…
        </p>
        <Link to="/login" style={linkBtnStyle('linear-gradient(135deg,#ff6b6b,#ff8e53)')}>Go to login</Link>
      </div>
    </PageShell>
  )

  return (
    <PageShell>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>🔑</div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#1a1a2e' }}>Set new password</h1>
        <p style={{ margin: '8px 0 0', fontSize: 14, color: '#888' }}>Choose a strong password for your account.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>New password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="New password"
          required
          autoFocus
          style={inputStyle}
        />

        {/* Strength checklist */}
        {password.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            {Object.entries(CHECKS).map(([k, v]) => (
              <div key={k} style={{ fontSize: 12, color: checks[k] ? '#27ae60' : '#bbb', display: 'flex', gap: 6, marginBottom: 3 }}>
                <span>{checks[k] ? '✓' : '○'}</span><span>{v.label}</span>
              </div>
            ))}
          </div>
        )}

        <label style={labelStyle}>Confirm password</label>
        <input
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          placeholder="Confirm password"
          required
          style={{
            ...inputStyle,
            borderColor: confirm.length > 0 ? (matching ? '#27ae60' : '#e74c3c') : '#ddd',
            marginBottom: 4,
          }}
        />
        {confirm.length > 0 && !matching && (
          <p style={{ margin: '0 0 12px', fontSize: 12, color: '#e74c3c' }}>Passwords don't match</p>
        )}

        {status === 'error' && (
          <div style={{ background: '#fff0f0', borderRadius: 10, padding: '10px 14px', marginBottom: 12 }}>
            <p style={{ margin: 0, fontSize: 13, color: '#e74c3c' }}>{errMsg}</p>
            {errMsg.toLowerCase().includes('expired') && (
              <Link to="/forgot-password" style={{ fontSize: 12, color: '#ff6b6b', fontWeight: 700 }}>
                Request a new link →
              </Link>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={!strong || !matching || status === 'loading'}
          style={{
            width: '100%', padding: '13px', borderRadius: 50, border: 'none',
            background: strong && matching ? 'linear-gradient(135deg,#ff6b6b,#ff8e53)' : '#e0e0e0',
            color: 'white', fontWeight: 800, fontSize: 15,
            cursor: strong && matching ? 'pointer' : 'not-allowed',
            marginTop: 8, fontFamily: 'inherit',
          }}
        >
          {status === 'loading' ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </PageShell>
  )
}

function PageShell({ children }) {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <PublicHeader />
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg,#ff6b6b,#ff8e53,#ffd93d)',
        padding: '24px',
      }}>
        <div style={{
          background: 'white', borderRadius: 24, padding: '40px 36px',
          width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(255,107,107,0.3)',
        }}>
          {children}
        </div>
      </div>
      <Footer />
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: 13, fontWeight: 700, color: '#555', marginBottom: 6 }
const inputStyle = {
  width: '100%', padding: '12px 16px', borderRadius: 12,
  border: '1.5px solid #ddd', fontSize: 15, outline: 'none',
  boxSizing: 'border-box', marginBottom: 16, fontFamily: 'inherit',
}
function linkBtnStyle(bg) {
  return {
    display: 'block', textAlign: 'center', padding: '12px 24px',
    borderRadius: 50, background: bg, color: 'white',
    textDecoration: 'none', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 14px rgba(255,107,107,0.3)',
  }
}
