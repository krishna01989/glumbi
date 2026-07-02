import { useNavigate } from 'react-router-dom'

export default function AppFooter() {
  const navigate = useNavigate()
  return (
    <footer className="app-footer" style={{
      borderTop: '1px solid #f0f0f0',
      padding: '14px clamp(16px,3vw,32px)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 8,
      fontSize: 11, color: '#ccc',
      fontFamily: 'Nunito, sans-serif',
      background: 'white', flexShrink: 0,
    }}>
      <span>© {new Date().getFullYear()} <strong style={{ color: '#ff6b6b' }}>Glumbi</strong> · Where little stories grow ✨</span>
      <div style={{ display: 'flex', gap: 16 }}>
        {[['Help', '/help'], ['Privacy', '/privacy'], ['Terms', '/terms'], ['Contact', '/contact']].map(([l, p]) => (
          <button key={p} onClick={() => navigate(p)}
            style={{ background: 'none', border: 'none', color: '#ccc', fontSize: 11, cursor: 'pointer', padding: 0, fontFamily: 'Nunito, sans-serif' }}
            onMouseEnter={e => e.currentTarget.style.color = '#ff6b6b'}
            onMouseLeave={e => e.currentTarget.style.color = '#ccc'}>
            {l}
          </button>
        ))}
      </div>
    </footer>
  )
}
