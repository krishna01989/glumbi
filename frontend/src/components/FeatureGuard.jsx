const FEATURE_DISPLAY = {
  'story':             { label: 'Story',         icon: '📖' },
  'activity':          { label: 'Activity',      icon: '🎮' },
  'curiosity':         { label: 'Curiosity',     icon: '🔍' },
  'read-quiz':         { label: 'Read & Quiz',   icon: '📚' },
  'writing-coach':     { label: 'Writing Coach', icon: '✍️'  },
  'translation':       { label: 'Translation',   icon: '🌐' },
  'draw':              { label: 'Drawing',       icon: '🎨' },
  'learn-validate':    { label: 'Letter Check',  icon: '🔤' },
  'learn-word':        { label: 'Learn Word',    icon: '✏️'  },
  'memory-flashcards': { label: 'Memory Play',   icon: '🧠' },
  'maze':              { label: 'Maze',          icon: '🌀' },
  'riddle':            { label: 'Riddle',        icon: '🧩' },
}

export default function FeatureGuard({ featureName, featureConfig, children }) {
  const fc = featureConfig.find(f => f.featureName === featureName)
  if (!fc || fc.enabled !== false) return children
  const display = FEATURE_DISPLAY[featureName] || { label: featureName, icon: '⚙️' }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, padding: 40, textAlign: 'center' }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🚫</div>
      <div style={{ fontWeight: 900, fontSize: 22, color: '#333', marginBottom: 8 }}>{display.icon} {display.label} is unavailable</div>
      <div style={{ fontSize: 15, color: '#888', maxWidth: 360, lineHeight: 1.7 }}>
        This feature has been temporarily disabled. Please check back later or contact your administrator.
      </div>
    </div>
  )
}
