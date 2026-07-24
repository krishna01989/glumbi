const SECTIONS = [
  {
    emoji: '📖', title: 'Stories', color: '#f97316',
    items: ['AI-generated stories tailored to your child', 'Read & Quiz to test comprehension', 'My Writing for their own stories', 'Journal to capture memories'],
  },
  {
    emoji: '🔍', title: 'Curiosity', color: '#8b5cf6',
    items: ['Ask Anything — kids ask, AI explains', 'Riddle for brain-teasing fun'],
  },
  {
    emoji: '🎮', title: 'Play', color: '#22c55e',
    items: ['Memory — flashcards, match games & word of the day', 'Maze with AI-generated levels', 'Learn to Write for handwriting practice', 'Activities for real-world ideas'],
  },
  {
    emoji: '🎬', title: 'Studio', color: '#ec4899',
    items: ['Draw — canvas drawing with AI animations', 'Flipbook Studio — frame-by-frame animation'],
  },
]

const TIPS = [
  { emoji: '🔒', title: 'Set a PIN for your child', desc: 'When adding or editing a child profile, set a PIN so only you can exit kid mode or change settings.' },
  { emoji: '📊', title: 'Check Insights', desc: 'Tap any child card to see their activity, accuracy, streaks and favourite topics.' },
  { emoji: '🎤', title: 'Add your voice to stories', desc: 'Go to your profile to record voices — add "Dad", "Mom" or any name. Stories will be read aloud in that voice.' },
  { emoji: '✅', title: 'Enable Features', desc: 'Not all features suit every age. Edit a child profile to turn features on or off individually.' },
  { emoji: '💳', title: 'AI Credits', desc: 'AI features like stories and curiosity use credits from your monthly allowance. You can see how many you\'ve used on the home screen — tap the credit badge for a full breakdown by feature.' },
]

export default function ParentGuideModal({ onClose }) {
  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        zIndex: 1000, backdropFilter: 'blur(3px)',
      }} />

      {/* Sheet */}
      <div style={{
        position: 'fixed', left: '50%', top: '50%',
        transform: 'translate(-50%,-50%)',
        width: 'min(560px, 94vw)', maxHeight: '88vh',
        background: 'white', borderRadius: 28,
        boxShadow: '0 24px 80px rgba(0,0,0,0.22)',
        display: 'flex', flexDirection: 'column',
        zIndex: 1001, overflow: 'hidden',
        fontFamily: 'Nunito, sans-serif',
      }}>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg,#ff6b6b,#ffa502)',
          padding: '28px 28px 24px', flexShrink: 0,
        }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>👋</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: 'white', lineHeight: 1.2 }}>Welcome to Glumbi!</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 6, fontWeight: 600 }}>
            Here's a quick guide to get the most out of the app.
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', padding: '24px 24px 8px', flex: 1 }}>

          {/* Feature map */}
          <div style={{ fontSize: 11, fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>What's inside</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
            {SECTIONS.map(s => (
              <div key={s.title} style={{
                borderRadius: 16, padding: '14px 16px',
                background: s.color + '12', border: `1.5px solid ${s.color}30`,
              }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{s.emoji}</div>
                <div style={{ fontSize: 13, fontWeight: 900, color: s.color, marginBottom: 6 }}>{s.title}</div>
                <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {s.items.map(item => (
                    <li key={item} style={{ fontSize: 12, color: '#555', fontWeight: 600, lineHeight: 1.4 }}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div style={{ fontSize: 11, fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Good to know</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {TIPS.map(t => (
              <div key={t.title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', background: '#fafafa', borderRadius: 14, padding: '12px 16px' }}>
                <span style={{ fontSize: 26, flexShrink: 0, marginTop: 2 }}>{t.emoji}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#333', marginBottom: 3 }}>{t.title}</div>
                  <div style={{ fontSize: 13, color: '#666', fontWeight: 600, lineHeight: 1.5 }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px 24px', flexShrink: 0, borderTop: '1px solid #f0f0f0' }}>
          <button onClick={onClose} style={{
            width: '100%', padding: '14px', borderRadius: 50, border: 'none',
            background: 'linear-gradient(135deg,#ff6b6b,#ffa502)',
            color: 'white', fontSize: 16, fontWeight: 900,
            cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
          }}>
            Got it, let's go! 🚀
          </button>
          <div style={{ textAlign: 'center', fontSize: 12, color: '#bbb', marginTop: 10, fontWeight: 600 }}>
            You can always find help in the menu → Help
          </div>
        </div>
      </div>
    </>
  )
}
