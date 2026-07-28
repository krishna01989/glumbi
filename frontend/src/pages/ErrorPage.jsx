import { useNavigate } from 'react-router-dom'
import PublicHeader from '../components/PublicHeader'
import Footer from '../components/Footer'

const ERRORS = {
  401: {
    emoji: '🔒',
    title: "You're not signed in",
    desc: "This page needs you to be logged in. Sign in and we'll take you right back.",
    bg: 'linear-gradient(135deg,#667eea,#764ba2)',
    primary: '#764ba2',
    cta: 'Sign In',
    ctaPath: '/login',
  },
  403: {
    emoji: '🚫',
    title: "Access denied",
    desc: "You don't have permission to view this page. If you think this is a mistake, contact support.",
    bg: 'linear-gradient(135deg,#f7971e,#ffd200)',
    primary: '#f7971e',
    cta: 'Sign Out & Continue',
    ctaPath: null,
  },
  404: {
    emoji: '🗺️',
    title: "Page not found",
    desc: "Hmm, we looked everywhere but couldn't find this page. Maybe it moved, or maybe it never existed!",
    bg: 'linear-gradient(135deg,#ff6b6b,#ff8e53)',
    primary: '#ff6b6b',
    cta: 'Take Me Home',
    ctaPath: '/',
  },
  429: {
    emoji: '⏳',
    title: "Slow down a little!",
    desc: "You're going too fast. Take a breath and try again in a moment.",
    bg: 'linear-gradient(135deg,#4facfe,#00f2fe)',
    primary: '#4facfe',
    cta: 'Try Again',
    ctaPath: null,
  },
  500: {
    emoji: '💥',
    title: "Something broke on our end",
    desc: "Our servers hit a snag. We've been notified and are working on it — please try again shortly.",
    bg: 'linear-gradient(135deg,#fc5c7d,#6a3093)',
    primary: '#fc5c7d',
    cta: 'Try Again',
    ctaPath: null,
  },
  502: {
    emoji: '📡',
    title: "Server is unreachable",
    desc: "We can't reach our backend right now. It might be restarting or under maintenance. Try again in a moment.",
    bg: 'linear-gradient(135deg,#373b44,#4286f4)',
    primary: '#4286f4',
    cta: 'Retry',
    ctaPath: null,
  },
  503: {
    emoji: '🛠️',
    title: "Under maintenance",
    desc: "Glumbi is getting a tune-up! We'll be back very soon. Thanks for your patience.",
    bg: 'linear-gradient(135deg,#134e5e,#71b280)',
    primary: '#71b280',
    cta: 'Refresh',
    ctaPath: null,
  },
}

const DEFAULT = {
  emoji: '😵',
  title: "Something went wrong",
  desc: "An unexpected error occurred. Try going back or refreshing the page.",
  bg: 'linear-gradient(135deg,#bdc3c7,#2c3e50)',
  primary: '#2c3e50',
  cta: 'Go Home',
  ctaPath: '/',
}

export default function ErrorPage({ code, message }) {
  const navigate = useNavigate()
  const status   = parseInt(code) || 0
  const info     = ERRORS[status] || DEFAULT

  function clearSession() {
    localStorage.removeItem('glm_token')
    localStorage.removeItem('glm_role')
    localStorage.removeItem('glm_child_locked')
    localStorage.removeItem('glm_locked_child_id')
    Object.keys(localStorage)
      .filter(k =>
        k.startsWith('glm_session_start_') ||
        k.startsWith('glm_snooze_count_') ||
        k.startsWith('glm_session_limit_') ||
        k.startsWith('glm_session_max_snooze_') ||
        k.startsWith('glm_offline_')
      )
      .forEach(k => localStorage.removeItem(k))
  }

  function handleCta() {
    if (status === 403) {
      // Clear session before navigating — otherwise the app re-mounts,
      // fires API calls with the same forbidden token, and loops back here
      clearSession()
      window.location.href = '/login'
    } else if (info.ctaPath) {
      navigate(info.ctaPath)
    } else {
      window.history.go(-1)
      setTimeout(() => window.location.reload(), 100)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f9', fontFamily: 'Nunito, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* Coloured top band */}
      <div style={{ background: info.bg, height: 6, flexShrink: 0 }} />
      <PublicHeader />

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(32px,6vw,80px) clamp(16px,4vw,24px)' }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>

          {/* Illustration circle */}
          <div style={{
            width: 140, height: 140, borderRadius: '50%',
            background: info.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 32px',
            boxShadow: `0 16px 48px ${info.primary}40`,
          }}>
            <span style={{ fontSize: 64 }}>{info.emoji}</span>
          </div>

          {/* Error code badge */}
          {status > 0 && (
            <div style={{
              display: 'inline-block', background: `${info.primary}18`,
              color: info.primary, borderRadius: 50,
              padding: '4px 16px', fontSize: 12, fontWeight: 800,
              letterSpacing: 1, marginBottom: 16, textTransform: 'uppercase',
            }}>
              Error {status}
            </div>
          )}

          <h1 style={{ fontFamily: 'Nunito, sans-serif', fontSize: 'clamp(24px,4vw,36px)', color: '#2d2d2d', marginBottom: 14, lineHeight: 1.2 }}>
            {info.title}
          </h1>

          <p style={{ fontSize: 'clamp(14px,2vw,16px)', color: '#777', lineHeight: 1.8, marginBottom: 12 }}>
            {info.desc}
          </p>

          {/* Custom message from caller */}
          {message && (
            <div style={{ background: '#f5f5f5', borderRadius: 10, padding: '10px 16px', fontSize: 13, color: '#999', marginBottom: 24, fontFamily: 'monospace' }}>
              {message}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 28 }}>
            <button onClick={handleCta}
              style={{
                padding: '13px 32px', borderRadius: 50, fontSize: 15, fontWeight: 800,
                background: info.bg, color: 'white', border: 'none', cursor: 'pointer',
                boxShadow: `0 6px 24px ${info.primary}40`,
              }}>
              {info.cta}
            </button>
            {status !== 403 &&
              <button onClick={() => navigate(-1)}
                style={{ padding: '13px 28px', borderRadius: 50, fontSize: 15, fontWeight: 700, background: '#f0f0f0', color: '#555', border: 'none', cursor: 'pointer' }}>
                ← Go Back
              </button>
            }
          </div>

          {/* Fun footer note */}
          <p style={{ marginTop: 40, fontSize: 12, color: '#ccc' }}>
            If this keeps happening, write to us at{' '}
            <a href="mailto:hello@glumbi.com" style={{ color: '#bbb', textDecoration: 'underline' }}>hello@glumbi.com</a>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
