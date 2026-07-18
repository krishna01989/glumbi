import { useState, useEffect } from 'react'

export default function CreditPop() {
  const [pops, setPops] = useState([])

  useEffect(() => {
    function handler(e) {
      const id = Date.now() + Math.random()
      setPops(prev => [...prev, { id, cost: e.detail.cost }])
      setTimeout(() => setPops(prev => prev.filter(p => p.id !== id)), 2000)
    }
    window.addEventListener('glumbi:credit-used', handler)
    return () => window.removeEventListener('glumbi:credit-used', handler)
  }, [])

  if (!pops.length) return null

  return (
    <>
      <style>{`
        @keyframes creditRise {
          0%   { opacity: 0; transform: translateX(-50%) translateY(0px) scale(0.5); }
          18%  { opacity: 1; transform: translateX(-50%) translateY(-28px) scale(1.18); }
          35%  { transform: translateX(-50%) translateY(-60px) scale(1); }
          80%  { opacity: 1; transform: translateX(-50%) translateY(-72vh) scale(1); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-80vh) scale(0.95); }
        }
        @keyframes coinBounce {
          0%, 100% { transform: scale(1); }
          40%       { transform: scale(1.3); }
        }
      `}</style>

      {pops.map(p => (
        <div key={p.id} style={{
          position: 'fixed',
          bottom: 80,
          left: '50%',
          zIndex: 9999,
          pointerEvents: 'none',
          animation: 'creditRise 2s ease-out forwards',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'var(--primary)',
          borderRadius: 50,
          padding: '10px 20px 10px 12px',
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 900,
          fontSize: 18,
          color: 'white',
          whiteSpace: 'nowrap',
          boxShadow: '0 6px 28px rgba(0,0,0,0.22)',
        }}>
          <span style={{
            display: 'inline-block',
            width: 26, height: 26, borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #ffe97a, #f0a800 60%, #b87200)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.5)',
            flexShrink: 0,
            animation: 'coinBounce 0.5s ease-out',
          }} />
          -{p.cost} credit{p.cost !== 1 ? 's' : ''}
        </div>
      ))}
    </>
  )
}
