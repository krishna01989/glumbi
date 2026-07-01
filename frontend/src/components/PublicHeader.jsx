import { useNavigate } from 'react-router-dom'

export default function PublicHeader({ transparent = false }) {
  const navigate = useNavigate()
  const isLoggedIn = !!localStorage.getItem('glm_token')

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: transparent ? 'rgba(255,255,255,0.92)' : 'white',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #f0f0f0',
      padding: '0 clamp(16px,4vw,40px)', height: 60,
      display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      fontFamily: 'Nunito, sans-serif',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => navigate('/')}>
        <img src="/icon.svg" alt="Glumbi" style={{ width: 32, height: 32 }} />
        <span style={{ fontFamily: 'Fredoka One, cursive', fontSize: 20, color: '#ff6b6b' }}>Glumbi</span>
      </div>

      {/* Nav links (desktop) */}
      <nav style={{ display: 'flex', gap: 4, marginLeft: 16, flex: 1 }} className="pub-nav">
        {[
          { label: 'About',   path: '/about'   },
          { label: 'Demo',    path: '/demo'    },
          { label: 'Contact', path: '/contact' },
        ].map(l => (
          <button key={l.path} onClick={() => navigate(l.path)}
            style={{ background: 'none', border: 'none', fontSize: 13, fontWeight: 700, color: '#666', cursor: 'pointer', padding: '6px 12px', borderRadius: 8 }}
            onMouseEnter={e => e.currentTarget.style.color = '#ff6b6b'}
            onMouseLeave={e => e.currentTarget.style.color = '#666'}>
            {l.label}
          </button>
        ))}
      </nav>

      {/* CTA buttons */}
      <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
        {isLoggedIn ? (
          <button onClick={() => navigate('/child')}
            style={{ padding: '8px 20px', borderRadius: 50, fontSize: 13, fontWeight: 800, background: 'linear-gradient(135deg,#ff6b6b,#ff8e53)', color: 'white', border: 'none', cursor: 'pointer' }}>
            Open App →
          </button>
        ) : (
          <>
            <button onClick={() => navigate('/login')}
              style={{ padding: '8px 18px', borderRadius: 50, fontSize: 13, fontWeight: 700, background: 'transparent', color: '#ff6b6b', border: '2px solid #ff6b6b', cursor: 'pointer' }}>
              Sign In
            </button>
            <button onClick={() => navigate('/login')}
              style={{ padding: '8px 20px', borderRadius: 50, fontSize: 13, fontWeight: 800, background: 'linear-gradient(135deg,#ff6b6b,#ff8e53)', color: 'white', border: 'none', cursor: 'pointer' }}>
              Sign Up Free
            </button>
          </>
        )}
      </div>

      <style>{`
        @media (max-width: 520px) { .pub-nav { display: none !important; } }
      `}</style>
    </header>
  )
}
