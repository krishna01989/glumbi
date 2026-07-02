import { useNavigate } from 'react-router-dom'

const LINKS = [
  { label: 'About',   path: '/about' },
  { label: 'Privacy', path: '/privacy' },
  { label: 'Terms',   path: '/terms' },
  { label: 'Contact', path: '/contact' },
]

export default function Footer() {
  const navigate = useNavigate()
  return (
    <footer style={{
      background: '#1a1a2e', color: '#aaa',
      padding: 'clamp(40px,5vw,64px) clamp(20px,5vw,80px) 28px',
      fontFamily: 'Nunito, sans-serif',
    }}>
      <style>{css}</style>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 64, marginBottom: 48 }}>

          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <img src="/icon.svg" alt="Glumbi" style={{ width: 36, height: 36 }} />
              <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 22, color: 'white' }}>Glumbi</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.8, color: '#888', maxWidth: 220 }}>
              Glumbi — the little friend who lives<br />
              inside every child's imagination ✨
            </p>
          </div>

          {/* Company */}
          <div>
            <div style={headStyle}>Company</div>
            {[
              { label: 'About Glumbi', path: '/about'   },
              { label: 'Contact Us',   path: '/contact' },
            ].map(l => <FooterLink key={l.label} {...l} navigate={navigate} />)}
          </div>

          {/* Legal */}
          <div>
            <div style={headStyle}>Legal</div>
            {[
              { label: 'Privacy Policy', path: '/privacy' },
              { label: 'Terms of Service', path: '/terms' },
            ].map(l => <FooterLink key={l.label} {...l} navigate={navigate} />)}
            <div style={{ marginTop: 16, fontSize: 12, color: '#555', lineHeight: 1.7 }}>
              🔒 No cookies used<br />
              🛡️ No third-party tracking<br />
              👧 COPPA compliant
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #2a2a3e', paddingTop: 24, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 12, color: '#555' }}>© {new Date().getFullYear()} Glumbi. All rights reserved.</span>
          <div style={{ display: 'flex', gap: 20 }}>
            {LINKS.map(l => (
              <button key={l.path} onClick={() => navigate(l.path)}
                style={{ background: 'none', border: 'none', color: '#555', fontSize: 12, cursor: 'pointer', padding: 0 }}>
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ label, path, navigate }) {
  return (
    <button onClick={() => navigate(path)}
      style={{ display: 'block', background: 'none', border: 'none', color: '#888', fontSize: 13, cursor: 'pointer', padding: '3px 0', textAlign: 'left', transition: 'color 0.15s' }}
      onMouseEnter={e => e.target.style.color = '#ff6b6b'}
      onMouseLeave={e => e.target.style.color = '#888'}>
      {label}
    </button>
  )
}

const headStyle = { fontSize: 11, fontWeight: 800, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }

const css = `
  @media (max-width: 600px) {
    .footer-grid { grid-template-columns: 1fr !important; gap: 36px !important; }
  }
`
