// Shared intro/narration screen used by both Maze Chase and Story Run.
// Parent provides the full-screen container; this renders the content + close button.
export default function GameIntroScreen({ emoji, title, description, tips, col, onPlay, onBack, playLabel = 'Play!' }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      {/* Close → back to game picker */}
      <button
        onClick={onBack}
        style={{
          position: 'sticky', top: 14, alignSelf: 'flex-end', marginRight: 14, zIndex: 1,
          width: 36, height: 36, minWidth: 36, minHeight: 36,
          padding: 0, margin: '14px 14px 0 auto', boxSizing: 'border-box',
          borderRadius: '50%', border: 'none', flexShrink: 0,
          background: 'rgba(255,255,255,0.18)', color: '#fff',
          fontSize: 16, lineHeight: '36px', textAlign: 'center',
          cursor: 'pointer',
        }}
      >✕</button>

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '8px 24px 32px', gap: 18, minHeight: 'max-content',
      }}>
        <div style={{ fontSize: 54 }}>{emoji}</div>

        <div style={{ color: '#fff', fontSize: 20, fontWeight: 900, textAlign: 'center' }}>{title}</div>

        {description && (
          <div style={{
            background: 'rgba(255,255,255,0.10)', borderRadius: 20,
            padding: '18px 26px', maxWidth: 340, textAlign: 'center',
            color: '#fff', fontSize: 15, lineHeight: 1.75,
          }}>{description}</div>
        )}

        {tips && tips.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 320 }}>
            {tips.map((tip, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: '9px 14px',
              }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{tip.icon}</span>
                <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 1.4 }}>{tip.text}</span>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onPlay}
          style={{
            background: col, color: '#fff', border: 'none', borderRadius: 50,
            padding: '14px 44px', fontSize: 18, fontWeight: 800, cursor: 'pointer',
            marginTop: 4,
          }}
        >{playLabel}</button>
      </div>
    </div>
  )
}
