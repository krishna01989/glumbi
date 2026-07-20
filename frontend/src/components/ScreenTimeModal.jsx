export default function ScreenTimeModal({
  child, theme, snoozeCount, lockMaxSnooze, lockTimeLimit,
  originalLimitRef, onSnooze, onDone, childLocked,
}) {
  const maxSnooze = lockMaxSnooze
  const snoozesLeft = maxSnooze === 0 ? Infinity : Math.max(0, maxSnooze - snoozeCount)
  const original = originalLimitRef.current || lockTimeLimit
  const allOptions = [5, 10, 15, 30, 45, 60].filter(m => m < original)
  const opt1 = allOptions[allOptions.length - 2] ?? allOptions[0]
  const opt2 = allOptions[allOptions.length - 1]
  const showTwo = !!opt1 && opt2 !== opt1

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: 'white', borderRadius: 28, padding: '36px 32px', maxWidth: 380, width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)', textAlign: 'center', fontFamily: 'Nunito, sans-serif',
      }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>⏰</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#333', marginBottom: 8 }}>
          Screen time check!
        </div>
        <div style={{ fontSize: 15, color: '#777', lineHeight: 1.6, marginBottom: 28 }}>
          Great session, {child.name}! Want to keep going or take a quick break?
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {snoozesLeft > 0 && opt1 ? (<>
            <button onClick={() => onSnooze(opt1)}
              style={{
                padding: '14px', borderRadius: 50, border: 'none', cursor: 'pointer',
                background: theme.headerGrad, color: 'white',
                fontSize: 15, fontWeight: 800, boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              }}>
              ✅ {opt1} more minutes!
            </button>
            {showTwo && (
              <button onClick={() => onSnooze(opt2)}
                style={{
                  padding: '14px', borderRadius: 50, border: `2px solid ${theme.primary}`,
                  background: 'white', color: theme.primary, cursor: 'pointer',
                  fontSize: 15, fontWeight: 800,
                }}>
                🕐 {opt2} more minutes
              </button>
            )}
            {maxSnooze > 0 && (
              <div style={{ fontSize: 12, color: '#bbb', textAlign: 'center' }}>
                {snoozesLeft} snooze{snoozesLeft !== 1 ? 's' : ''} left
              </div>
            )}
          </>) : (
            <div style={{ padding: '14px', borderRadius: 16, background: '#fff3cd', color: '#856404', fontSize: 14, fontWeight: 700, textAlign: 'center' }}>
              No more snoozes — time to wrap up! 🌙
            </div>
          )}

          <button onClick={onDone}
            style={{
              padding: '14px', borderRadius: 50, border: 'none',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              color: 'white', cursor: 'pointer',
              fontSize: 14, fontWeight: 700,
            }}>
            {childLocked ? "I'm done — lock 🔒" : "I'm done for now 👋"}
          </button>
        </div>
      </div>
    </div>
  )
}
