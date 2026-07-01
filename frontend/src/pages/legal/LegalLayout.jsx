import { useNavigate } from 'react-router-dom'
import PublicHeader from '../../components/PublicHeader'
import Footer from '../../components/Footer'

export default function LegalLayout({ title, updated, children }) {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', fontFamily: 'Nunito, sans-serif', color: '#3d3d3d', display: 'flex', flexDirection: 'column' }}>
      <PublicHeader />

      <div style={{ maxWidth: 760, margin: '0 auto', width: '100%', flex: 1, padding: 'clamp(32px,5vw,56px) clamp(16px,4vw,24px)', boxSizing: 'border-box' }}>
        <button onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', color: '#ff6b6b', fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: '0 0 20px', display: 'flex', alignItems: 'center', gap: 4 }}>
          ← Back
        </button>
        <h1 style={{ fontFamily: 'Fredoka One, cursive', fontSize: 'clamp(26px,4vw,38px)', color: '#ff6b6b', marginBottom: 6 }}>
          {title}
        </h1>
        {updated && (
          <p style={{ fontSize: 12, color: '#bbb', marginBottom: 32, fontWeight: 700 }}>Last updated: {updated}</p>
        )}
        <div style={proseStyle} data-prose="">
          {children}
        </div>
      </div>

      <Footer />
    </div>
  )
}

const proseStyle = {
  lineHeight: 1.9,
  fontSize: 'clamp(14px,2vw,16px)',
}

// Inject global prose styles once
const style = document.createElement('style')
style.textContent = `
  .legal-prose h2 { font-family: 'Fredoka One', cursive; font-size: 20px; color: #333; margin: 32px 0 10px; }
  .legal-prose h3 { font-size: 15px; font-weight: 800; color: #555; margin: 20px 0 6px; }
  .legal-prose p  { margin: 0 0 14px; }
  .legal-prose ul { padding-left: 20px; margin: 0 0 14px; }
  .legal-prose li { margin-bottom: 6px; }
  .legal-prose a  { color: #ff6b6b; }
  .legal-prose code { background: #f5f5f5; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
`

// Apply prose styles via a wrapper div approach using inline style injection
const proseInjectStyle = `
  div[data-prose] h2 { font-family: 'Fredoka One', cursive; font-size: 22px; color: #333; margin: 32px 0 10px; border-bottom: 2px solid #fff0f0; padding-bottom: 6px; }
  div[data-prose] h3 { font-size: 15px; font-weight: 800; color: #555; margin: 20px 0 6px; }
  div[data-prose] p  { margin: 0 0 14px; }
  div[data-prose] ul { padding-left: 22px; margin: 0 0 14px; }
  div[data-prose] li { margin-bottom: 6px; }
  div[data-prose] a  { color: #ff6b6b; text-decoration: underline; }
  div[data-prose] code { background: #f5f5f5; padding: 2px 6px; border-radius: 4px; font-size: 13px; font-family: monospace; }
  div[data-prose] strong { color: #333; }
`
if (!document.getElementById('glumbi-prose-style')) {
  const el = document.createElement('style')
  el.id = 'glumbi-prose-style'
  el.textContent = proseInjectStyle
  document.head.appendChild(el)
}
