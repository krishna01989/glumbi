import { applyTheme } from '../themes'

const TIME_OPTS = [
  { label: '15m', value: 15 },
  { label: '30m', value: 30 },
  { label: '45m', value: 45 },
  { label: '1h',  value: 60 },
  { label: '90m', value: 90 },
  { label: 'Custom', value: -1 },
]
const EXT_OPTS = [
  { label: 'None', value: 0 },
  { label: '1',    value: 1 },
  { label: '2',    value: 2 },
  { label: '3',    value: 3 },
]

export default function LockModal({
  lockModal,
  activeChild,
  lockGrad,
  lockPin, setLockPin,
  lockPinError, setLockPinError,
  showPin, setShowPin,
  lockTimeLimit, setLockTimeLimit,
  lockMaxSnooze, setLockMaxSnooze,
  lockModalForced,
  onSetup, onVerify, onUnlock, onCancel,
}) {
  if (!lockModal) return null

  const chipStyle = (active) => ({
    padding: '6px 12px', borderRadius: 50, fontSize: 12, fontWeight: 700, cursor: 'pointer',
    border: active ? '2px solid var(--primary)' : '2px solid #eee',
    background: active ? 'var(--primary)' : 'white',
    color: active ? 'white' : '#aaa',
  })

  const isCustom = !TIME_OPTS.slice(0, -1).some(o => o.value === lockTimeLimit)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: 'white', borderRadius: 28, padding: '36px 32px', maxWidth: 340, width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)', textAlign: 'center', fontFamily: 'Nunito, sans-serif',
      }}>

        {/* ── Setup / Lock-verify ── */}
        {(lockModal === 'setup' || lockModal === 'lock-verify') && (() => {
          const isSetup = lockModal === 'setup'
          return <>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#333', marginBottom: 4 }}>
              {isSetup ? 'Set a Parent PIN' : `Lock for ${activeChild?.name}`}
            </div>
            <div style={{ fontSize: 13, color: '#777', marginBottom: 20, lineHeight: 1.5 }}>
              {isSetup
                ? `Choose a PIN and session settings for ${activeChild?.name}.`
                : `Enter your PIN to hand the device to ${activeChild?.name}.`}
            </div>

            <div style={{ textAlign: 'left', marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#aaa', letterSpacing: 1, marginBottom: 8 }}>SESSION TIME</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {TIME_OPTS.map(o => (
                  <button key={o.value}
                    style={chipStyle(o.value === -1 ? isCustom : lockTimeLimit === o.value)}
                    onClick={() => { if (o.value === -1) setLockTimeLimit(0); else setLockTimeLimit(o.value) }}>
                    {o.label}
                  </button>
                ))}
              </div>
              {isCustom && (
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="number" inputMode="numeric" min={1} max={480} placeholder="Minutes"
                    value={lockTimeLimit > 0 ? lockTimeLimit : ''}
                    onChange={e => {
                      const v = parseInt(e.target.value)
                      if (!isNaN(v) && v > 0) setLockTimeLimit(Math.min(v, 480))
                      else setLockTimeLimit(0)
                    }}
                    style={{ width: 90, padding: '6px 10px', borderRadius: 10, border: '2px solid var(--primary)', fontSize: 14, fontWeight: 700, textAlign: 'center', outline: 'none' }}
                  />
                  <span style={{ fontSize: 13, color: '#888' }}>minutes</span>
                </div>
              )}
            </div>

            {lockTimeLimit > 0 && (
              <div style={{ textAlign: 'left', marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#aaa', letterSpacing: 1, marginBottom: 8 }}>EXTENSIONS ALLOWED</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {EXT_OPTS.map(o => (
                    <button key={o.value} style={chipStyle(lockMaxSnooze === o.value)} onClick={() => setLockMaxSnooze(o.value)}>{o.label}</button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={e => { e.preventDefault(); if (isSetup) onSetup(); else onVerify() }} autoComplete="off">
              <div style={{ position: 'relative', marginBottom: 8 }}>
                <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={4}
                  placeholder="• • • •" autoComplete="off" data-form-type="other"
                  className="pin-input"
                  value={lockPin}
                  onChange={e => { setLockPin(e.target.value.replace(/\D/g, '').slice(0, 4)); setLockPinError('') }}
                  autoFocus
                  style={{
                    width: '100%', textAlign: 'center', fontSize: 28, fontWeight: 900,
                    border: `2px solid ${lockPinError ? '#cc0033' : '#eee'}`, borderRadius: 12,
                    padding: '12px 48px 12px 12px', boxSizing: 'border-box',
                    letterSpacing: showPin ? 12 : 20, WebkitTextSecurity: showPin ? 'none' : 'disc',
                  }} />
                <button type="button" onClick={() => setShowPin(p => !p)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 4, color: '#aaa' }}>
                  {showPin ? '🙈' : '👁️'}
                </button>
              </div>
              {lockPinError && <div style={{ color: '#cc0033', fontSize: 12, marginBottom: 8 }}>{lockPinError}</div>}
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button type="button" onClick={onCancel}
                  style={{ flex: 1, padding: '12px', borderRadius: 50, border: '1.5px solid #eee', background: 'white', color: '#aaa', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                  Cancel
                </button>
                <button type="submit" disabled={lockTimeLimit <= 0}
                  style={{ flex: 1, padding: '12px', borderRadius: 50, border: 'none', background: lockGrad, color: 'white', fontWeight: 800, cursor: lockTimeLimit <= 0 ? 'not-allowed' : 'pointer', fontSize: 14, opacity: lockTimeLimit <= 0 ? 0.5 : 1 }}>
                  Lock App 🔒
                </button>
              </div>
            </form>
          </>
        })()}

        {/* ── Unlock ── */}
        {lockModal === 'unlock' && <>
          <div style={{ fontSize: 48, marginBottom: 12 }}>{lockModalForced ? '⏰' : '🔓'}</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#333', marginBottom: 8 }}>
            {lockModalForced ? "Time's up!" : 'Parent unlock'}
          </div>
          <div style={{ fontSize: 14, color: '#777', marginBottom: 24, lineHeight: 1.5 }}>
            {lockModalForced
              ? `Great session, ${activeChild?.name}! 🌟 Ask a parent to enter the PIN to continue.`
              : 'Enter your 4-digit PIN to unlock'}
          </div>
          <form onSubmit={e => { e.preventDefault(); onUnlock() }} autoComplete="off">
            <div style={{ position: 'relative', marginBottom: 8 }}>
              <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={4}
                placeholder="••••" autoComplete="off" data-form-type="other"
                value={lockPin}
                onChange={e => { setLockPin(e.target.value.replace(/\D/g, '').slice(0, 4)); setLockPinError('') }}
                autoFocus
                style={{
                  width: '100%', textAlign: 'center', fontSize: 28, fontWeight: 900,
                  border: `2px solid ${lockPinError ? '#cc0033' : '#eee'}`, borderRadius: 12,
                  padding: '12px 48px 12px 12px', boxSizing: 'border-box',
                  letterSpacing: showPin ? 12 : 10, WebkitTextSecurity: showPin ? 'none' : 'disc',
                }} />
              <button type="button" onClick={() => setShowPin(p => !p)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 4, color: '#aaa' }}>
                {showPin ? '🙈' : '👁️'}
              </button>
            </div>
            {lockPinError && <div style={{ color: '#cc0033', fontSize: 12, marginBottom: 8 }}>{lockPinError}</div>}
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              {!lockModalForced && (
                <button type="button" onClick={() => { onCancel() }}
                  style={{ flex: 1, padding: '12px', borderRadius: 50, border: '1.5px solid #eee', background: 'white', color: '#aaa', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                  Cancel
                </button>
              )}
              <button type="submit"
                style={{ flex: 1, padding: '12px', borderRadius: 50, border: 'none', background: lockGrad, color: 'white', fontWeight: 800, cursor: 'pointer', fontSize: 14 }}>
                Unlock 🔓
              </button>
            </div>
          </form>
        </>}

      </div>
    </div>
  )
}
