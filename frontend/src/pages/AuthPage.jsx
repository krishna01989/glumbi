import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../api/client'
import ErrorBox from '../components/ErrorBox'
import PublicHeader from '../components/PublicHeader'
import Footer from '../components/Footer'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

export default function AuthPage({ onAuth }) {
  const navigate = useNavigate()
  const [mode, setMode]       = useState('login')
  const [email, setEmail]     = useState('')
  const [password, setPass]   = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [noticeAgreed, setNoticeAgreed] = useState(false)
  const [signupOpen, setSignupOpen] = useState(true)
  const googleBtnRef          = useRef(null)

  useEffect(() => {
    authApi.signupStatus().then(r => setSignupOpen(r.enabled)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return

    function initGoogle() {
      if (!window.google?.accounts?.id) return false
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
      })
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'outline',
        size: 'large',
        width: googleBtnRef.current?.offsetWidth || 328,
        text: 'continue_with',
        shape: 'rectangular',
      })
      return true
    }

    if (!initGoogle()) {
      // GSI script not yet loaded — wait for it
      const interval = setInterval(() => {
        if (initGoogle()) clearInterval(interval)
      }, 100)
      return () => clearInterval(interval)
    }
  }, [])

  async function handleGoogleCredential(response) {
    setError('')
    if (mode === 'register' && !noticeAgreed) {
      setError('Please confirm you have read the data notice below before continuing with Google.')
      return
    }
    setLoading(true)
    try {
      const { token, role } = await authApi.google(response.credential)
      localStorage.setItem('glm_token', token)
      localStorage.setItem('glm_role', role)
      onAuth(role)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (mode === 'register' && !noticeAgreed) {
      setError('Please confirm you have read the data notice above before creating an account.')
      return
    }
    setLoading(true)
    try {
      const fn = mode === 'login' ? authApi.login : authApi.register
      const { token, role } = await fn({ email, password })
      localStorage.setItem('glm_token', token)
      localStorage.setItem('glm_role', role)
      onAuth(role)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicHeader />
    <div style={{
      flex: 1,
      background: 'linear-gradient(135deg,#ff6b6b,#ff8e53,#ffd93d)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 'clamp(12px, 4vw, 24px)',
    }}>
      <div style={{
        background: 'white', borderRadius: 24,
        padding: 'clamp(24px, 5vw, 40px) clamp(16px, 5vw, 36px)',
        width: '100%', maxWidth: 400,
        boxShadow: '0 20px 60px rgba(255,107,107,0.3)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src="/logo.svg" alt="Glumbi" style={{ width: 220, height: 'auto', marginBottom: 4 }} />
          <button onClick={() => navigate('/about')}
            style={{ marginTop: 10, background: 'none', border: 'none', color: '#ff6b6b', fontSize: 13, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
            What is Glumbi? →
          </button>
        </div>

        {/* Google Sign-In */}
        {GOOGLE_CLIENT_ID && (
          <>
            <div ref={googleBtnRef} style={{ width: '100%', marginBottom: 8 }} />
            <p style={{ fontSize: 11, color: '#aaa', textAlign: 'center', margin: '0 0 4px', lineHeight: 1.5 }}>
              By continuing with Google you agree to our{' '}
              <a href="/terms" target="_blank" rel="noreferrer" style={{ color: '#ff6b6b', textDecoration: 'none', fontWeight: 700 }}>Terms of Service</a>
              {' '}and acknowledge our{' '}
              <a href="/privacy" target="_blank" rel="noreferrer" style={{ color: '#ff6b6b', textDecoration: 'none', fontWeight: 700 }}>Privacy Policy</a>.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
              <div style={{ flex: 1, height: 1, background: '#eee' }} />
              <span style={{ fontSize: 12, color: '#bbb', fontWeight: 700 }}>OR</span>
              <div style={{ flex: 1, height: 1, background: '#eee' }} />
            </div>
          </>
        )}

        {/* Signup paused banner */}
        {mode === 'register' && !signupOpen && (
          <div style={{ background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: 12, padding: '14px 16px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>🌱</span>
            <div style={{ fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>
              <strong>We're pausing new sign-ups for now.</strong> Glumbi is growing fast and we want to make sure every family gets the best experience. Check back soon — we'd love to have you!
            </div>
          </div>
        )}

        {/* Tab switch */}
        <div style={{ display: 'flex', background: '#f5f5f5', borderRadius: 50, padding: 4, marginBottom: 24 }}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError('') }}
              style={{
                flex: 1, padding: '9px 0', borderRadius: 50, fontSize: 14,
                background: mode === m ? 'white' : 'transparent',
                color: mode === m ? '#ff6b6b' : '#999',
                fontWeight: 700,
                boxShadow: mode === m ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
              }}>
              {m === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: '#555', display: 'block', marginBottom: 6 }}>Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" required
              style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '2px solid #eee', fontSize: 15, boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: '#555', display: 'block', marginBottom: 6 }}>Password</label>
            <input
              type="password" value={password} onChange={e => setPass(e.target.value)}
              placeholder={mode === 'register' ? 'Min 8 chars, uppercase, number, special' : '••••••••'} required
              style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '2px solid #eee', fontSize: 15, boxSizing: 'border-box' }}
            />
            {mode === 'register' && password.length > 0 && (() => {
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
            })()}
          </div>

          {mode === 'login' && (
            <div style={{ textAlign: 'right', marginTop: -4, marginBottom: 4 }}>
              <Link to="/forgot-password" style={{ fontSize: 12, color: '#888', textDecoration: 'none', fontWeight: 600 }}>
                Forgot password?
              </Link>
            </div>
          )}

          <ErrorBox msg={error} />

          <button type="submit" className="btn-primary" disabled={loading}
            style={{ padding: '14px', fontSize: 16, marginTop: 4 }}>
            {loading
              ? <><span className="spinner" />&nbsp;{mode === 'login' ? 'Signing in…' : 'Creating account…'}</>
              : mode === 'login' ? '✨ Sign In' : '🌟 Create Account'}
          </button>

          {mode === 'register' && (
            <div style={{ marginTop: 4 }}>
              <div style={{ background: '#fef9f0', border: '1.5px solid #fde68a', borderRadius: 12, padding: '12px 14px', marginBottom: 10, fontSize: 12, color: '#78350f', lineHeight: 1.7 }}>
                <strong>📋 Data Notice (DPDP Act 2023 / COPPA)</strong><br />
                Glumbi collects your <strong>email address</strong> to create your account. When you add a child profile, we collect their <strong>name and birth year</strong> to personalise learning. We also store learning activity data (stories, drawings, journal entries) linked to each child profile. No data is sold or shared with third parties. Data is stored on servers in the United States. You may delete all data at any time from your Profile.
              </div>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 13, color: '#444', lineHeight: 1.5 }}>
                <input type="checkbox" checked={noticeAgreed} onChange={e => setNoticeAgreed(e.target.checked)}
                  style={{ marginTop: 2, flexShrink: 0, accentColor: '#ff6b6b', width: 16, height: 16 }} />
                <span>
                  I am a parent or guardian and I have read the data notice above. I agree to the{' '}
                  <a href="/terms" target="_blank" rel="noreferrer" style={{ color: '#ff6b6b', textDecoration: 'none', fontWeight: 700 }}>Terms of Service</a>
                  {' '}and{' '}
                  <a href="/privacy" target="_blank" rel="noreferrer" style={{ color: '#ff6b6b', textDecoration: 'none', fontWeight: 700 }}>Privacy Policy</a>.
                </span>
              </label>
            </div>
          )}
        </form>
      </div>
    </div>
      <Footer />
    </div>
  )
}
