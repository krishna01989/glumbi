import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

const PAGE_META = {
  'Privacy Policy':    { emoji: '🔒', grad: 'linear-gradient(135deg,#667eea,#764ba2)' },
  'Terms of Service':  { emoji: '⚖️', grad: 'linear-gradient(135deg,#f093fb,#f5576c)' },
  'Contact Us':        { emoji: '📬', grad: 'linear-gradient(135deg,#4facfe,#00f2fe)' },
}

export default function LegalLayout({ title, updated, children, inApp = false }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => { window.scrollTo(0, 0) }, [pathname])

  useEffect(() => {
    if (!document.getElementById('glumbi-prose-style')) {
      const el = document.createElement('style')
      el.id = 'glumbi-prose-style'
      el.textContent = PROSE_CSS
      document.head.appendChild(el)
    }
  }, [])

  const accent       = inApp ? 'var(--primary)'    : '#ff6b6b'
  const accentLight  = inApp ? 'var(--primary-lt)' : '#fff0f0'
  const accentBorder = inApp ? 'var(--primary-lt)' : '#ffcdb8'
  const meta         = PAGE_META[title] || { emoji: '📄', grad: 'linear-gradient(135deg,#ff6b6b,#f4845f)' }

  return (
    <div style={{ background: 'white', minHeight: '100vh', overflow: 'hidden', fontFamily: 'Nunito, sans-serif', color: '#3d3d3d' }}>
      <div style={{ maxWidth: 520, margin: `${inApp ? '0' : '24px'} auto`, padding: '0 16px', boxSizing: 'border-box' }}>

        {/* Back button */}
        <button onClick={() => navigate(-1)}
          onMouseEnter={e => { e.currentTarget.style.background = accentLight; e.currentTarget.style.transform = 'translateX(-2px)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'none' }}
          style={{
            background: 'transparent', border: `1.5px solid ${accentBorder}`, color: accent,
            fontWeight: 700, fontSize: 13, cursor: 'pointer',
            padding: '6px 14px', marginBottom: 20, borderRadius: 50,
            display: 'inline-flex', alignItems: 'center', gap: 6,
            transition: 'all 0.15s ease',
          }}>
          ← Back
        </button>

        {/* Hero banner */}
        <div style={{
          background: meta.grad, borderRadius: 20, padding: '24px 24px 20px',
          marginBottom: 20, color: 'white', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -16, right: -10, fontSize: 90, opacity: 0.1, lineHeight: 1 }}>{meta.emoji}</div>
          <div style={{ fontSize: 36, marginBottom: 8 }}>{meta.emoji}</div>
          <div style={{ fontWeight: 900, fontSize: 20, marginBottom: updated ? 4 : 0 }}>{title}</div>
          {updated && (
            <div style={{ fontSize: 12, opacity: 0.75 }}>Last updated: {updated}</div>
          )}
        </div>

        {/* Content */}
        <div style={proseStyle} data-prose="">
          {children}
        </div>

        <div style={{ height: 32 }} />
      </div>
    </div>
  )
}

const proseStyle = {
  lineHeight: 1.9,
  fontSize: 15,
}

const PROSE_CSS = `
  div[data-prose] h2 { font-family: Nunito, cursive; font-size: 18px; color: #333; margin: 28px 0 8px; border-bottom: 2px solid #f0f0f0; padding-bottom: 6px; }
  div[data-prose] h3 { font-size: 14px; font-weight: 800; color: #555; margin: 18px 0 6px; }
  div[data-prose] p  { margin: 0 0 14px; }
  div[data-prose] ul { padding-left: 22px; margin: 0 0 14px; }
  div[data-prose] li { margin-bottom: 6px; }
  div[data-prose] a  { color: #ff6b6b; text-decoration: underline; }
  div[data-prose] code { background: #f5f5f5; padding: 2px 6px; border-radius: 4px; font-size: 13px; font-family: monospace; }
  div[data-prose] strong { color: #333; }
`
