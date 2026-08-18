import FEATURE_META from '../constants/featureMeta'

export default function CreditInfoModal({ featureConfig, onClose }) {
  const items = (featureConfig || []).filter(f => f.featureName && FEATURE_META[f.featureName])
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
      backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 3000, padding: 16,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'white', borderRadius: 24, padding: '24px 20px',
        maxWidth: 360, width: '100%', maxHeight: '70vh', display: 'flex',
        flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
        position: 'relative', boxSizing: 'border-box',
        animation: 'glm-fadein 0.3s ease both', fontFamily: 'Nunito, sans-serif',
      }}>
        <style>{`
          @keyframes glm-fadein {
            from { opacity: 0; transform: translateY(24px) scale(0.95) }
            to   { opacity: 1; transform: translateY(0) scale(1) }
          }
        `}</style>
        <button onClick={onClose} style={{
          position: 'absolute', top: 14, right: 14,
          width: 28, height: 28, minWidth: 28, minHeight: 28,
          borderRadius: '50%', border: '1.5px solid #eee', background: '#f9f9f9',
          fontSize: 13, color: '#aaa', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0,
        }}>✕</button>
        <div style={{ fontSize: 26, marginBottom: 4 }}>🪙</div>
        <div style={{ fontWeight: 900, fontSize: 16, color: '#333', marginBottom: 3 }}>How AI Credits Work</div>
        <div style={{ fontSize: 12, color: '#aaa', marginBottom: 16, lineHeight: 1.5 }}>
          Each AI interaction uses a small number of credits. Here's the cost per use:
        </div>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 7 }}>
          {items.map(f => {
            const meta = FEATURE_META[f.featureName]
            return (
              <div key={f.featureName} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '9px 12px', borderRadius: 12,
                background: '#fafafa', border: '1.5px solid #f0f0f0', flexShrink: 0,
              }}>
                <span style={{ fontSize: 18, width: 26, textAlign: 'center' }}>{meta.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 13, color: '#333' }}>{meta.label}</div>
                  {f.description && (
                    <div style={{ fontSize: 11, color: '#aaa', marginTop: 1, lineHeight: 1.5 }}>{f.description}</div>
                  )}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 900, fontSize: 14, color: '#ff6b6b' }}>{f.creditCost} cr</div>
                  <div style={{ fontSize: 10, color: '#ccc' }}>per use</div>
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ fontSize: 11, color: '#ccc', textAlign: 'center', marginTop: 14, flexShrink: 0 }}>
          Monthly credits reset on the 1st of each month
        </div>
      </div>
    </div>
  )
}
