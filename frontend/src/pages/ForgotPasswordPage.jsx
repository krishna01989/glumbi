import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../api/client'
import PublicHeader from '../components/PublicHeader'
import Footer from '../components/Footer'

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [status, setStatus]   = useState('idle') // idle | loading | sent | error
  const [errMsg, setErrMsg]   = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    try {
      await authApi.forgotPassword(email.trim())
      setStatus('sent')
    } catch {
      setStatus('error')
      setErrMsg('Something went wrong. Please try again.')
    }
  }

  const btnStyle = {
    display: 'block', textAlign: 'center', padding: '12px',
    borderRadius: 50, background: 'linear-gradient(135deg,#ff6b6b,#ff8e53)',
    color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: 14,
    boxShadow: '0 4px 14px rgba(255,107,107,0.3)',
  }

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
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🔐</div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#1a1a2e' }}>Forgot password?</h1>
          <p style={{ margin: '8px 0 0', fontSize: 14, color: '#888', lineHeight: 1.5 }}>
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        {status === 'sent' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
            <p style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>Check your inbox</p>
            <p style={{ margin: '0 0 24px', fontSize: 13, color: '#888', lineHeight: 1.6 }}>
              If <strong>{email}</strong> is registered, you'll get a reset link shortly.
              The link expires in 1 hour.
            </p>
            <Link to="/login" style={btnStyle}>Back to login</Link>
          </div>
        )}

        {(status === 'idle' || status === 'loading' || status === 'error') && (
          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#555', marginBottom: 6 }}>
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 12,
                border: '1.5px solid #ddd', fontSize: 15, outline: 'none',
                boxSizing: 'border-box', marginBottom: 8,
                fontFamily: 'inherit',
              }}
            />

            {status === 'error' && (
              <p style={{ margin: '0 0 12px', fontSize: 13, color: '#e74c3c' }}>{errMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading' || !email.trim()}
              style={{
                width: '100%', padding: '13px', borderRadius: 50, border: 'none',
                background: email.trim() ? 'linear-gradient(135deg,#ff6b6b,#ff8e53)' : '#e0e0e0',
                color: 'white', fontWeight: 800, fontSize: 15, cursor: email.trim() ? 'pointer' : 'not-allowed',
                marginTop: 8, fontFamily: 'inherit',
              }}
            >
              {status === 'loading' ? 'Sending…' : 'Send reset link'}
            </button>

            <Link to="/login" style={{
              display: 'block', textAlign: 'center', marginTop: 20,
              fontSize: 13, color: '#ff6b6b', textDecoration: 'none', fontWeight: 600,
            }}>
              ← Back to login
            </Link>
          </form>
        )}
      </div>
      </div>
      <Footer />
    </div>
  )
}
