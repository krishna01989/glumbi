export default function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', confirmColor = '#e74c3c', onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16, animation: 'fadeIn 0.15s ease',
    }} onMouseDown={onCancel}>
      <div style={{
        background: 'white', borderRadius: 20, padding: '28px 24px',
        maxWidth: 340, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        animation: 'popIn 0.2s cubic-bezier(0.34,1.56,0.64,1)',
      }} onMouseDown={e => e.stopPropagation()}>
        <div style={{ fontSize: 40, textAlign: 'center', marginBottom: 12 }}>🗑️</div>
        <h3 style={{ textAlign: 'center', fontSize: 18, fontWeight: 800, color: '#333', margin: '0 0 8px' }}>{title}</h3>
        {message && <p style={{ textAlign: 'center', fontSize: 14, color: '#888', margin: '0 0 24px', lineHeight: 1.5 }}>{message}</p>}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel}
            style={{ flex: 1, padding: '12px', borderRadius: 50, border: 'none', background: '#f5f5f5', color: '#555', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={onConfirm}
            style={{ flex: 1, padding: '12px', borderRadius: 50, border: 'none', background: confirmColor, color: 'white', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
            {confirmLabel}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes popIn { from { opacity:0; transform:scale(0.85) } to { opacity:1; transform:scale(1) } }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
      `}</style>
    </div>
  )
}
