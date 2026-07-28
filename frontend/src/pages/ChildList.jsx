import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { childApi, userApi } from '../api/client'
import { THEMES } from '../themes'
import QuotaBadge from '../components/QuotaBadge'
import ParentGuideModal from '../components/ParentGuideModal'

const CORAL = THEMES.coral

function calcAge(birthYear) {
  return !birthYear ? null : new Date().getFullYear() - parseInt(birthYear)
}

const FEATURE_META = {
  'story':          { label: 'Stories',        emoji: '📖' },
  'activity':       { label: 'Activities',     emoji: '🎮' },
  'learn-validate': { label: 'Learn to Write', emoji: '✏️' },
  'curiosity':      { label: 'Curiosity',      emoji: '🔍' },
  'draw':           { label: 'Draw',           emoji: '🎨' },
  'draw-animate':   { label: 'Bring to Life',  emoji: '🎬' },
  'draw-guide':     { label: 'Drawing Guide',  emoji: '🖌️' },
  'read-quiz':      { label: 'Read & Quiz',    emoji: '📚' },
  'writing-coach':  { label: 'My Writing',     emoji: '✍️' },
  'memory-flashcards': { label: 'Flashcards',    emoji: '🧠' },
  'memory-match':      { label: 'Memory Match',  emoji: '🃏' },
  'word-of-day':       { label: 'Word of Day',   emoji: '✏️' },
}

/* ── Credit info modal ── */
function CreditInfoModal({ featureConfig, onClose }) {
  const items = featureConfig.filter(f => f.featureName && FEATURE_META[f.featureName])
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 24, padding: '24px 20px', maxWidth: 360, width: '100%', maxHeight: '70vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,0.35)', position: 'relative', boxSizing: 'border-box', animation: 'glm-fadein 0.3s ease both', fontFamily: 'Nunito, sans-serif' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, width: 28, height: 28, minWidth: 28, minHeight: 28, borderRadius: '50%', border: '1.5px solid #eee', background: '#f9f9f9', fontSize: 13, color: '#aaa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 }}>✕</button>
        <div style={{ fontSize: 26, marginBottom: 4 }}>🪙</div>
        <div style={{ fontWeight: 900, fontSize: 16, color: '#333', marginBottom: 3 }}>How AI Credits Work</div>
        <div style={{ fontSize: 12, color: '#aaa', marginBottom: 16, lineHeight: 1.5 }}>Each AI interaction uses a small number of credits. Here's the cost per use:</div>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 7 }}>
          {items.map(f => {
            const meta = FEATURE_META[f.featureName]
            return (
              <div key={f.featureName} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 12px', borderRadius: 12, background: '#fafafa', border: '1.5px solid #f0f0f0', flexShrink: 0 }}>
                <span style={{ fontSize: 18, width: 26, textAlign: 'center' }}>{meta.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 13, color: '#333' }}>{meta.label}</div>
                  {f.description && <div style={{ fontSize: 11, color: '#aaa', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.description}</div>}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 900, fontSize: 14, color: '#ff6b6b' }}>{f.creditCost} cr</div>
                  <div style={{ fontSize: 10, color: '#ccc' }}>per use</div>
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ fontSize: 11, color: '#ccc', textAlign: 'center', marginTop: 14, flexShrink: 0 }}>Credits reset on the 1st of each month</div>
      </div>
    </div>
  )
}

/* ── Quota pill ── */
function QuotaPill({ quota, onInfo }) {
  if (!quota) return null
  const overLimit = quota.used > quota.limit
  const pct = Math.min(quota.used / quota.limit, 1)
  const barColor   = pct >= 1 ? '#ff4444' : pct >= 0.8 ? '#ffd93d' : '#6bcb77'
  const textColor  = pct >= 1 ? '#ff4444' : pct >= 0.8 ? '#ffd93d' : 'white'
  const borderColor = pct >= 1 ? 'rgba(255,68,68,0.5)' : pct >= 0.8 ? 'rgba(255,217,61,0.5)' : 'rgba(255,255,255,0.3)'
  const label = overLimit ? '⛔ Over limit' : pct >= 1 ? '🚫 Limit reached' : pct >= 0.8 ? '⚠️ Almost full' : null
  return (
    <div className="quota-pill-desktop" style={{ position: 'absolute', top: 20, right: 20, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)', border: `1px solid ${borderColor}`, borderRadius: 50, padding: '6px 14px', animation: 'glm-fadein 0.5s ease both', zIndex: 10 }}>
      <div style={{ width: 48, height: 5, background: 'rgba(255,255,255,0.25)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct * 100}%`, background: barColor, borderRadius: 10, transition: 'width 0.6s ease' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: textColor, lineHeight: 1.2 }}>
          {label ? `${label} · ${quota.used}/${quota.limit}` : `${Math.round(pct * 100)}% · ${quota.used}/${quota.limit} cr`}
        </span>
        <span style={{ fontSize: 10, fontWeight: 600, color: textColor, opacity: 0.7, lineHeight: 1.2 }}>
          {quota.usedActual ?? quota.used} used this month
        </span>
      </div>
      <button onClick={e => { e.stopPropagation(); onInfo() }} title="How credits work"
        style={{ width: 20, height: 20, minWidth: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', border: 'none', color: 'white', fontSize: 11, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, flexShrink: 0, padding: 0 }}>
        i
      </button>
    </div>
  )
}

/* ── Hand to child modal (merged: AI + PIN mgmt + time limit + PIN entry + lock) ── */
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
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
]

function UnlockModal({ child, offline, onClose, onLockConfirmed, onToggleOffline }) {
  const pt = THEMES[child.theme] || THEMES.coral

  const [phase, setPhase]             = useState(null) // null | 'sleeping' | 'waking'
  const [timeLimit, setTimeLimit]     = useState(30)
  const [customTimeStr, setCustomTimeStr] = useState('')
  const [maxSnooze, setMaxSnooze]     = useState(1)
  const [lockPin, setLockPin]         = useState('')
  const [lockPinError, setLockPinError] = useState('')
  const [locking, setLocking]         = useState(false)

  const isNight = phase === 'sleeping' || (phase === null && offline)

  function handleAiToggle() {
    if (phase) return
    setPhase(offline ? 'waking' : 'sleeping')
    setTimeout(() => { onToggleOffline(); setPhase(null) }, 1350)
  }

  const isCustomTime = !TIME_OPTS.slice(0, -1).some(o => o.value === timeLimit)

  const chipStyle = (active) => ({
    padding: '5px 11px', borderRadius: 50, fontSize: 12, fontWeight: 700, cursor: 'pointer',
    border: `2px solid ${active ? pt.primary : '#eee'}`,
    background: active ? pt.primary : 'white',
    color: active ? 'white' : '#aaa',
    fontFamily: 'Nunito, sans-serif',
  })

  async function handleLock(e) {
    e.preventDefault()
    if (lockPin.length !== 4) { setLockPinError('Enter your 4-digit PIN'); return }
    setLocking(true)
    try {
      const result = await childApi.verifyPin(child.id, lockPin)
      if (!result.ok) { setLockPinError('Wrong PIN, try again'); return }
      onLockConfirmed(child, timeLimit, maxSnooze)
    } catch { setLockPinError('Something went wrong') } finally { setLocking(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 16, overflowY: 'auto' }}>
      <div style={{ background: 'white', borderRadius: 24, padding: '28px 24px', maxWidth: 380, width: '100%', textAlign: 'center', boxShadow: '0 24px 80px rgba(0,0,0,0.4)', position: 'relative', boxSizing: 'border-box', animation: 'glm-fadein 0.3s ease both', margin: 'auto' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, width: 30, height: 30, minWidth: 30, minHeight: 30, borderRadius: '50%', border: '1.5px solid #eee', background: '#f9f9f9', fontSize: 14, color: '#aaa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0 }}>✕</button>

        <div style={{ fontSize: 44, marginBottom: 6 }}>{child.avatarEmoji}</div>
        <div style={{ fontWeight: 900, fontSize: 17, color: pt.primary, marginBottom: 16, fontFamily: 'Nunito, sans-serif' }}>Hand to {child.name}</div>

        {/* AI toggle — bedroom scene */}
        <div onClick={handleAiToggle} style={{
          position: 'relative', height: 108, overflow: 'hidden', borderRadius: 14, marginBottom: 12,
          cursor: phase ? 'default' : 'pointer', userSelect: 'none',
          border: `2px solid ${isNight ? '#3b2a7a' : pt.primary}`,
          transition: 'border-color 0.9s ease',
        }}>
          {/* Day background */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #cce9ff 0%, #e8f6ff 55%, #f5faff 100%)', opacity: isNight ? 0 : 1, transition: 'opacity 0.9s ease' }} />
          {/* Night sky */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #0d0b2b 0%, #1e1460 55%, #2d1b69 100%)', opacity: isNight ? 1 : 0, transition: 'opacity 0.9s ease' }} />

          {/* Stars */}
          {[{r:108,t:9,s:4,d:'0s'},{r:68,t:17,s:3,d:'0.5s'},{r:148,t:13,s:5,d:'1.1s'},{r:88,t:8,s:3,d:'0.2s'}].map((x,i) => (
            <div key={i} style={{
              position:'absolute', right:x.r, top:x.t, width:x.s, height:x.s, borderRadius:'50%', background:'white',
              opacity: isNight ? 1 : 0, transition:'opacity 0.9s ease',
              animation: isNight ? `star-twinkle 2.2s ${x.d} ease-in-out infinite` : 'none',
            }} />
          ))}

          {/* Moon / Sun */}
          <span style={{ position:'absolute', right:62, top:7, fontSize:13, opacity: isNight ? 1 : 0, transition:'opacity 0.7s ease', zIndex:1 }}>🌙</span>
          <span style={{ position:'absolute', right:62, top:7, fontSize:13, opacity: isNight ? 0 : 1, transition:'opacity 0.7s ease', zIndex:1 }}>☀️</span>

          {/* Floor */}
          <div style={{
            position:'absolute', bottom:28, left:0, right:0, height:2,
            background: isNight
              ? `linear-gradient(to right, #3b2a7a 45%, ${pt.primary}99 45%)`
              : `linear-gradient(to right, #b8d8f0 45%, ${pt.primary}66 45%)`,
            transition:'background 0.9s ease',
          }} />

          {/* Bed — headboard */}
          <div style={{ position:'absolute', right:10, bottom:28, width:10, height:34, background:pt.primary, borderRadius:'3px 3px 0 0', zIndex:3, transition:'background 0.9s ease' }} />
          {/* Bed base */}
          <div style={{ position:'absolute', right:10, bottom:28, width:80, height:22, background:pt.primary, borderRadius:'0 0 4px 4px', zIndex:2 }} />
          {/* Mattress — inset so the base frame shows around it */}
          <div style={{ position:'absolute', right:14, bottom:33, width:68, height:14, background:pt.primaryLt, borderRadius:3, zIndex:3 }} />
          {/* Blanket — covers body/legs, head peeks out on right */}
          <div style={{
            position:'absolute', right:34, bottom:46, height:20,
            background:`linear-gradient(to left, ${pt.primary}cc, ${pt.primary}ee)`,
            borderRadius:'4px 0 0 4px', zIndex:5,
            animation: phase==='sleeping' ? 'blanket-cover 0.45s 0.9s ease forwards'
                     : phase==='waking'   ? 'blanket-uncover 0.25s ease forwards'
                     : 'none',
            width: phase==='sleeping' ? 0 : phase==='waking' ? 54 : (offline ? 54 : 0),
          }} />

          {/* Zzz — starts after bot lies down (~1.2s), loops while sleeping */}
          {(phase === 'sleeping' || (phase === null && offline)) && (
            <span style={{ position:'absolute', right:10, bottom:62, zIndex:7, pointerEvents:'none' }}>
              {[
                { char:'z', size:10, delay: phase==='sleeping' ? '1.3s' : '0s',   right:18, duration:'2.4s' },
                { char:'Z', size:13, delay: phase==='sleeping' ? '2.1s' : '0.8s', right:10, duration:'2.4s' },
                { char:'Z', size:16, delay: phase==='sleeping' ? '2.9s' : '1.6s', right:2,  duration:'2.4s' },
              ].map((z, i) => (
                <span key={i} style={{
                  position:'absolute', bottom:0, right:z.right,
                  fontSize:z.size, fontWeight:900, color:'#7c9cbf', lineHeight:1,
                  animation: `zzz-float ${z.duration} ${z.delay} ease-in-out infinite`,
                  opacity: 0,
                  display:'inline-block',
                }}>{z.char}</span>
              ))}
            </span>
          )}
          {phase === 'waking' && (
            <span style={{
              position:'absolute', right:16, bottom:66, fontSize:14, lineHeight:1, display:'inline-block', zIndex:7,
              animation: 'zzz-poof 0.3s ease forwards', opacity:1, transform:'translateY(-12px)',
            }}>💤</span>
          )}

          {/* Standing / walking robot */}
          {(() => {
            const walking = phase === 'sleeping' || phase === 'waking'
            const wakeDelay = phase === 'waking' ? '0.36s' : '0s'
            const limbAnim = (kf) => walking ? `${kf} 0.42s ${wakeDelay} ease-in-out infinite` : 'none'
            const R = '#b8cce4', RD = '#7a9ec0', RE = '#1a2a42', RL = '#5577dd'
            return (
              <div style={{
                position:'absolute', left:14, bottom:30, width:30, height:50,
                zIndex:4,
                animation: phase==='sleeping' ? 'robot-to-bed 1.05s ease forwards'
                         : phase==='waking'   ? 'robot-from-bed 0.9s 0.28s both'
                         : 'none',
                transform: (!phase && offline) ? 'translateX(212px)' : undefined,
                opacity: (!phase && offline) ? 0 : undefined,
              }}>
                <div style={{
                  position:'relative', width:'100%', height:'100%',
                  animation: walking ? `rlk-bob 0.42s ${wakeDelay} ease-in-out infinite`
                           : !offline ? 'rlk-idle 1.9s ease-in-out infinite' : 'none',
                }}>
                  <div style={{ position:'absolute', left:14, top:1, width:2, height:7, background:RD, borderRadius:1 }} />
                  <div style={{ position:'absolute', left:11, top:-2, width:8, height:8, borderRadius:'50%', background:RL, boxShadow:`0 0 4px ${RL}88` }} />
                  <div style={{ position:'absolute', left:4, top:8, width:22, height:16, background:R, borderRadius:5, border:`1.5px solid ${RD}`, boxSizing:'border-box' }}>
                    <div style={{ position:'absolute', left:3, top:4, width:4, height:4, borderRadius:'50%', background:RE, animation: !offline ? 'bot-blink 2s ease-in-out infinite' : 'none' }} />
                    <div style={{ position:'absolute', left:13, top:4, width:4, height:4, borderRadius:'50%', background:RE, animation: !offline ? 'bot-blink 2s ease-in-out infinite' : 'none' }} />
                    <div style={{ position:'absolute', left:5, top:10, width:10, height:2, borderRadius:1, background:RD }} />
                  </div>
                  <div style={{ position:'absolute', left:13, top:24, width:4, height:2, background:RD }} />
                  <div style={{ position:'absolute', left:6, top:26, width:18, height:13, background:R, borderRadius:4, border:`1.5px solid ${RD}`, boxSizing:'border-box' }}>
                    <div style={{ position:'absolute', left:7, top:4, width:4, height:4, borderRadius:'50%', background:RL, boxShadow:`0 0 5px ${RL}` }} />
                  </div>
                  <div style={{ position:'absolute', left:1, top:26, width:5, height:11, background:R, borderRadius:'2px 2px 3px 3px', border:`1px solid ${RD}`, boxSizing:'border-box', transformOrigin:'top center', animation: limbAnim('rlk-arm-l') }} />
                  <div style={{ position:'absolute', left:24, top:26, width:5, height:11, background:R, borderRadius:'2px 2px 3px 3px', border:`1px solid ${RD}`, boxSizing:'border-box', transformOrigin:'top center', animation: limbAnim('rlk-arm-r') }} />
                  <div style={{ position:'absolute', left:8, top:39, width:6, height:11, background:RD, borderRadius:'2px 2px 4px 4px', boxSizing:'border-box', transformOrigin:'top center', animation: limbAnim('rlk-leg-l') }} />
                  <div style={{ position:'absolute', left:16, top:39, width:6, height:11, background:RD, borderRadius:'2px 2px 4px 4px', boxSizing:'border-box', transformOrigin:'top center', animation: limbAnim('rlk-leg-r') }} />
                </div>
              </div>
            )
          })()}

          {/* Sleeping robot — just head peeking out, body under blanket */}
          {(() => {
            const R = '#b8cce4', RD = '#7a9ec0', RE = '#1a2a42', RL = '#5577dd'
            const lyingOpacity = phase ? (phase === 'sleeping' ? 0 : 1) : (offline ? 1 : 0)
            return (
              <div style={{
                position:'absolute', right:14, bottom:48, width:20, height:20,
                zIndex:6,
                animation: phase==='sleeping' ? 'lying-appear 0.35s 0.82s ease forwards'
                         : phase==='waking'   ? 'lying-disappear 0.22s ease forwards'
                         : 'none',
                opacity: lyingOpacity,
              }}>
                {/* antenna stick */}
                <div style={{ position:'absolute', left:8, top:-6, width:2, height:6, background:RD, borderRadius:1 }} />
                {/* antenna ball */}
                <div style={{ position:'absolute', left:5, top:-13, width:8, height:8, borderRadius:'50%', background:RL, boxShadow:`0 0 5px ${RL}99` }} />
                {/* head */}
                <div style={{ position:'absolute', left:0, top:0, width:20, height:18, background:R, borderRadius:6, border:`1.5px solid ${RD}`, boxSizing:'border-box' }}>
                  {/* closed eyes */}
                  <div style={{ position:'absolute', left:2, top:7, width:6, height:2, borderRadius:1, background:RE }} />
                  <div style={{ position:'absolute', right:2, top:7, width:6, height:2, borderRadius:1, background:RE }} />
                </div>
              </div>
            )
          })()}

          {/* Text row */}
          <div style={{ position:'absolute', bottom:6, left:14, right:14, display:'flex', alignItems:'center', justifyContent:'space-between', zIndex:8 }}>
            <div style={{ fontWeight:900, fontSize:13, fontFamily:'Nunito, sans-serif', color: isNight ? 'rgba(255,255,255,0.88)' : pt.primary, textShadow: isNight ? '0 1px 3px rgba(0,0,0,0.6)' : 'none', transition:'color 0.8s, text-shadow 0.8s' }}>
              {offline ? 'Glumbi Bot is dreaming… 💤' : 'Glumbi Bot is awake! ✨'}
            </div>
            <div style={{ fontSize:11, fontWeight:700, fontFamily:'Nunito, sans-serif', color: isNight ? 'rgba(200,190,255,0.75)' : pt.primary, transition:'color 0.8s' }}>
              {offline ? 'wake it up! ☀️' : 'let it nap 🌙'}
            </div>
          </div>
        </div>

        {/* AI toggle hint */}
        <div style={{ fontSize: 11, color: '#aaa', fontFamily: 'Nunito, sans-serif', textAlign: 'left', marginBottom: 10, lineHeight: 1.5 }}>
          {offline
            ? '💡 Glumbi Bot is off — your child uses saved content only, no new AI responses.'
            : '💡 Tap the scene above to put Glumbi Bot to sleep and limit AI responses.'}
        </div>

        {/* PIN note */}
        {!child.hasPinSet && (
          <div style={{ background: '#fff8e1', border: '1.5px solid #ffe082', borderRadius: 12, padding: '10px 14px', marginBottom: 12, fontSize: 12, color: '#888', fontFamily: 'Nunito, sans-serif', textAlign: 'left' }}>
            🔐 No lock PIN set — go to <strong>✏️ Edit</strong> to add one before locking.
          </div>
        )}

        {/* Session time */}
        <div style={{ textAlign: 'left', marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#aaa', letterSpacing: 1, marginBottom: 6 }}>SESSION TIME</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {TIME_OPTS.map(o => (
              <button key={o.value} style={chipStyle(o.value === -1 ? isCustomTime : timeLimit === o.value)}
                onClick={() => { if (o.value === -1) { setTimeLimit(0); setCustomTimeStr('') } else { setTimeLimit(o.value); setCustomTimeStr('') } }}>
                {o.label}
              </button>
            ))}
          </div>
          {isCustomTime && (
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="number" inputMode="numeric" min={1} max={480} placeholder="Minutes"
                value={customTimeStr}
                onChange={e => setCustomTimeStr(e.target.value)}
                onBlur={e => {
                  const v = parseInt(e.target.value)
                  if (!isNaN(v) && v > 0) { const clamped = Math.min(v, 480); setTimeLimit(clamped); setCustomTimeStr(String(clamped)) }
                  else { setCustomTimeStr(''); setTimeLimit(0) }
                }}
                style={{ width: 80, padding: '6px 10px', borderRadius: 10, border: `2px solid ${pt.primary}`, fontSize: 14, fontWeight: 700, textAlign: 'center', outline: 'none' }} />
              <span style={{ fontSize: 13, color: '#888', fontFamily: 'Nunito, sans-serif' }}>minutes</span>
            </div>
          )}
        </div>

        {/* Extensions */}
        {timeLimit > 0 && (
          <div style={{ textAlign: 'left', marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#aaa', letterSpacing: 1, marginBottom: 6 }}>EXTENSIONS ALLOWED</div>
            <div style={{ display: 'flex', gap: 5, marginBottom: maxSnooze > 0 ? 8 : 0 }}>
              {EXT_OPTS.map(o => (
                <button key={o.value} style={chipStyle(maxSnooze === o.value)} onClick={() => setMaxSnooze(o.value)}>{o.label}</button>
              ))}
            </div>
            {maxSnooze > 0 && (() => {
              const opts = [5, 10, 15, 30, 45, 60].filter(m => m < timeLimit)
              const max = opts[opts.length - 1]
              return (
                <div style={{ fontSize: 11, color: '#888', lineHeight: 1.6, background: '#f8f8f8', borderRadius: 8, padding: '8px 10px' }}>
                  💡 When time is up, your child can request up to <strong>{maxSnooze}</strong> extension{maxSnooze > 1 ? 's' : ''}.{' '}
                  {max
                    ? <>Each extension adds extra time — up to <strong>{max} min</strong>.</>
                    : <>The session is very short, so extensions will only add a couple of minutes.</>
                  }
                  {maxSnooze > 1 && <> Every extension offers the same options.</>}
                </div>
              )
            })()}
          </div>
        )}

        {/* PIN entry to lock */}
        <form onSubmit={handleLock} autoComplete="off">
          <div style={{ fontSize: 11, fontWeight: 800, color: '#aaa', letterSpacing: 1, marginBottom: 6, textAlign: 'left' }}>CONFIRM IT'S YOU</div>
          <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={4}
            placeholder="• • • •" autoComplete="off" data-form-type="other"
            value={lockPin}
            onChange={e => { setLockPin(e.target.value.replace(/\D/g, '').slice(0, 4)); setLockPinError('') }}
            style={{
              width: '100%', textAlign: 'center', fontSize: 26, fontWeight: 900, boxSizing: 'border-box',
              border: `2px solid ${lockPinError ? '#cc0033' : '#eee'}`, borderRadius: 12,
              padding: '10px 12px', letterSpacing: 18, WebkitTextSecurity: 'disc', outline: 'none',
              fontFamily: 'Nunito, sans-serif', marginBottom: 6,
            }} />
          {lockPinError && <div style={{ color: '#cc0033', fontSize: 12, marginBottom: 6, fontFamily: 'Nunito, sans-serif' }}>{lockPinError}</div>}
          <button type="submit" disabled={locking || timeLimit <= 0}
            style={{ width: '100%', marginTop: 6, background: (locking || timeLimit <= 0) ? '#eee' : pt.headerGrad, color: (locking || timeLimit <= 0) ? '#aaa' : 'white', border: 'none', borderRadius: 50, padding: '13px 20px', fontWeight: 800, fontSize: 14, cursor: (locking || timeLimit <= 0) ? 'not-allowed' : 'pointer', fontFamily: 'Nunito, sans-serif', boxShadow: (locking || timeLimit <= 0) ? 'none' : `0 6px 20px ${pt.primary}44` }}>
            {locking ? 'Locking…' : '🔒 Lock & hand to ' + child.name}
          </button>
        </form>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   CHILD CAROUSEL CARD — the big focused card
══════════════════════════════════════════════════════ */
function ChildCard({ c, t, onSelect, onEdit, onInsights, animDir }) {
  const age = calcAge(c.birthYear)
  const isHibernated = !!c.graduated

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      animation: animDir > 0 ? 'globe-in-right 0.5s cubic-bezier(0.22,1,0.36,1) both'
                             : 'globe-in-left 0.5s cubic-bezier(0.22,1,0.36,1) both',
      opacity: isHibernated ? 0.5 : 1,
      filter: isHibernated ? 'grayscale(0.7)' : 'none',
      transition: 'opacity 0.3s, filter 0.3s',
    }}>
      {/* ── Avatar ── */}
      <div
        onClick={() => !isHibernated && onSelect(c)}
        style={{
          width: 'clamp(140px, 22vw, 180px)',
          height: 'clamp(140px, 22vw, 180px)',
          borderRadius: '50%',
          background: t.headerGrad,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 'clamp(58px, 9vw, 76px)',
          cursor: isHibernated ? 'not-allowed' : 'pointer',
          boxShadow: `0 0 0 6px rgba(255,255,255,0.2), 0 0 0 12px rgba(255,255,255,0.08), 0 24px 64px ${t.primary}55`,
          transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
          position: 'relative',
          userSelect: 'none',
        }}
        onMouseEnter={e => { if (!isHibernated) e.currentTarget.style.transform='scale(1.07) translateY(-4px)' }}
        onMouseLeave={e => e.currentTarget.style.transform='scale(1) translateY(0)'}
      >
        <span style={{ lineHeight: 1 }}>{c.avatarEmoji}</span>
        {isHibernated && (
          <span style={{
            position: 'absolute', bottom: 6, right: 6,
            fontSize: 22, lineHeight: 1,
            background: 'rgba(0,0,0,0.35)', borderRadius: '50%', padding: 4,
          }}>🎓</span>
        )}
      </div>

      {/* ── Name & age ── */}
      <div style={{ textAlign: 'center', marginTop: 24, marginBottom: 8 }}>
        <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 'clamp(22px,4vw,30px)', color: 'white', textShadow: '0 2px 12px rgba(0,0,0,0.35)', letterSpacing: -0.3 }}>
          {c.name}
        </div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', marginTop: 5 }}>
          {c.gender === 'girl' ? '👧' : '👦'} &nbsp;
          {age ? `${age} year${age !== 1 ? 's' : ''} old` : 'Little one'}
          {c.theme && (
            <span style={{ marginLeft: 10, opacity: 0.7 }}>{THEMES[c.theme]?.emoji || '🌈'}</span>
          )}
        </div>
      </div>

      {/* ── Graduated badge or PIN status ── */}
      {isHibernated
        ? <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.9)', background: 'rgba(0,0,0,0.25)', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 50, padding: '3px 12px', marginBottom: 14 }}>🎓 Graduated</div>
        : c.hasPinSet
          ? <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 50, padding: '3px 12px', marginBottom: 14 }}>🔐 Lock PIN set</div>
          : <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.08)', border: '1.5px dashed rgba(255,255,255,0.2)', borderRadius: 50, padding: '3px 12px', marginBottom: 14 }}>○ No lock PIN</div>
      }

      {/* ── Hint ── */}
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 20, fontStyle: 'italic' }}>
        {isHibernated ? 'edit profile to re-enrol' : 'tap avatar to open'}
      </div>

      {/* ── Action buttons ── */}
      <div style={{ display: 'flex', gap: 10 }}>
        {[
          { icon: '✏️', label: 'Edit',     action: e => { e.stopPropagation(); onEdit(c) } },
          { icon: '📊', label: 'Insights', action: e => { e.stopPropagation(); onInsights(c) } },
        ].map(btn => (
          <button
            key={btn.label}
            onClick={btn.action}
            style={{
              background: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              border: '1.5px solid rgba(255,255,255,0.25)',
              padding: '8px 20px',
              borderRadius: 50,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'Nunito, sans-serif',
              display: 'flex', alignItems: 'center', gap: 5,
              transition: 'background 0.15s, transform 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.28)'; e.currentTarget.style.transform='translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.18)'; e.currentTarget.style.transform='translateY(0)' }}
          >
            <span>{btn.icon}</span>
            <span>{btn.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── Add child slide ── */
function AddChildSlide({ onAdd, animDir, activeCount }) {
  const [hovered, setHovered] = useState(false)
  const atLimit = activeCount >= 3
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      animation: animDir > 0 ? 'globe-in-right 0.5s cubic-bezier(0.22,1,0.36,1) both'
                             : 'globe-in-left 0.5s cubic-bezier(0.22,1,0.36,1) both',
    }}>
      <div
        onClick={atLimit ? undefined : onAdd}
        onMouseEnter={() => { if (!atLimit) setHovered(true) }}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: 'clamp(140px, 22vw, 180px)',
          height: 'clamp(140px, 22vw, 180px)',
          borderRadius: '50%',
          border: `3px dashed ${atLimit ? 'rgba(255,255,255,0.15)' : hovered ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)'}`,
          background: atLimit ? 'rgba(255,255,255,0.03)' : hovered ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: atLimit ? 'not-allowed' : 'pointer',
          transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
          transform: hovered ? 'scale(1.07) translateY(-4px)' : 'scale(1)',
          boxShadow: hovered ? '0 24px 64px rgba(255,255,255,0.12)' : 'none',
        }}
      >
        <span style={{ fontSize: 52, color: atLimit ? 'rgba(255,255,255,0.15)' : hovered ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)', transition: 'color 0.2s', lineHeight: 1 }}>+</span>
      </div>

      <div style={{ textAlign: 'center', marginTop: 24, marginBottom: 8 }}>
        <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 'clamp(20px,3.5vw,26px)', color: atLimit ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.7)' }}>
          Add a child
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 5 }}>
          {atLimit ? '3 profiles — graduate one to add more' : `${3 - activeCount} slot${3 - activeCount !== 1 ? 's' : ''} remaining`}
        </div>
      </div>

    </div>
  )
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
export default function ChildList({ onChildSelected, onLogout, onLockConfirmed, onToggleOffline, quota, featureConfig }) {
  const [children, setChildren]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [offlineModes, setOfflineModes] = useState({})
  const [pendingChild, setPendingChild] = useState(null)
  const [showCreditInfo, setShowCreditInfo] = useState(false)
  const [showParentGuide, setShowParentGuide] = useState(() => !localStorage.getItem('glm_parent_guide_seen'))
  const [dismissedGrownUp, setDismissedGrownUp] = useState(() => {
    try { return JSON.parse(localStorage.getItem('glm_grownup_dismissed') || '[]') } catch { return [] }
  })
  // Carousel state
  const [activeIdx, setActiveIdx] = useState(0)
  const [animDir, setAnimDir]     = useState(1)
  const [animKey, setAnimKey]     = useState(0)
  const touchStartX = useRef(null)
  const touchStartY = useRef(null)

  const navigate = useNavigate()

  // Children who have aged past 10 and haven't been dismissed (and aren't already graduated)
  const grownUpChildren = children.filter(c => calcAge(c.birthYear) > 10 && !dismissedGrownUp.includes(c.id) && !c.graduated)
  const activeCount = children.filter(c => !c.graduated).length

  function dismissGrownUp(childId) {
    const next = [...dismissedGrownUp, childId]
    setDismissedGrownUp(next)
    localStorage.setItem('glm_grownup_dismissed', JSON.stringify(next))
  }

  // Total slides = children + 1 (add new)
  const totalSlides = children.length + 1

  const goTo = useCallback((idx, dir) => {
    setAnimDir(dir)
    setActiveIdx(idx)
    setAnimKey(k => k + 1)
  }, [])

  const prev = useCallback(() => {
    goTo((activeIdx - 1 + totalSlides) % totalSlides, -1)
  }, [activeIdx, totalSlides, goTo])

  const next = useCallback(() => {
    goTo((activeIdx + 1) % totalSlides, 1)
  }, [activeIdx, totalSlides, goTo])

  // Keyboard navigation
  useEffect(() => {
    const handler = e => {
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [prev, next])

  // Load data on mount ([] = runs once per mount; React Router unmounts ChildList on navigation
  // so this naturally re-runs each time the user returns to the child list)
  useEffect(() => {
    childApi.getAll().then(data => {
      setChildren(data)
      const modes = {}
      data.forEach(c => { modes[c.id] = localStorage.getItem(`glm_offline_${c.id}`) === '1' })
      setOfflineModes(modes)
      setLoading(false)
    }).catch(() => setLoading(false))

    // Refresh the quota pill in the header too
    window.__glumbiRefreshQuota?.()

    const openInfo = () => setShowCreditInfo(true)
    window.addEventListener('glumbi:credit-info', openInfo)
    return () => window.removeEventListener('glumbi:credit-info', openInfo)
  }, [])

  function handleToggleOffline(e, c) {
    if (e) e.stopPropagation()
    const next = !offlineModes[c.id]
    localStorage.setItem(`glm_offline_${c.id}`, next ? '1' : '0')
    setOfflineModes(prev => ({ ...prev, [c.id]: next }))
  }

  // Touch swipe
  function onTouchStart(e) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }
  function onTouchEnd(e) {
    if (touchStartX.current === null) return
    const dx = touchStartX.current - e.changedTouches[0].clientX
    const dy = touchStartY.current - e.changedTouches[0].clientY
    touchStartX.current = null
    touchStartY.current = null
    if (Math.abs(dy) > Math.abs(dx)) return
    if (dx > 48)  next()
    if (dx < -48) prev()
  }

  // Background — morph between child themes as you slide
  const activeChild = activeIdx < children.length ? children[activeIdx] : null
  const activeTheme = activeChild ? (THEMES[activeChild.theme] || THEMES.coral) : THEMES.coral
  const bgGrad = activeChild ? activeTheme.headerGrad : 'linear-gradient(135deg,#667eea,#764ba2)'

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.6)', fontFamily: 'Nunito, sans-serif', fontSize: 18, background: CORAL.headerGrad }}>
      ✨ Loading…
    </div>
  )

  return (
    <>
      <style>{`
        @keyframes glm-fadein {
          from { opacity: 0; transform: translateY(24px) scale(0.95) }
          to   { opacity: 1; transform: translateY(0) scale(1) }
        }
        @keyframes robot-to-bed {
          0%   { transform: translateX(0);     opacity:1; }
          68%  { transform: translateX(192px); opacity:1; }
          82%  { transform: translateX(208px); opacity:0.2; }
          100% { transform: translateX(212px); opacity:0; }
        }
        @keyframes robot-from-bed {
          0%   { transform: translateX(212px) translateY(0);    opacity:0; }
          18%  { transform: translateX(212px) translateY(-10px); opacity:1; }
          30%  { transform: translateX(212px) translateY(0);    opacity:1; }
          100% { transform: translateX(0)     translateY(0);    opacity:1; }
        }
        @keyframes lying-appear {
          from { opacity:0; transform:scaleX(0.6); }
          to   { opacity:1; transform:scaleX(1); }
        }
        @keyframes lying-disappear {
          from { opacity:1; }
          to   { opacity:0; }
        }
        @keyframes rlk-idle {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-4px); }
        }
        @keyframes rlk-leg-l {
          0%, 100% { transform: rotate(-32deg); }
          50%      { transform: rotate(32deg); }
        }
        @keyframes rlk-leg-r {
          0%, 100% { transform: rotate(32deg); }
          50%      { transform: rotate(-32deg); }
        }
        @keyframes rlk-arm-l {
          0%, 100% { transform: rotate(28deg); }
          50%      { transform: rotate(-28deg); }
        }
        @keyframes rlk-arm-r {
          0%, 100% { transform: rotate(-28deg); }
          50%      { transform: rotate(28deg); }
        }
        @keyframes rlk-bob {
          0%, 50%, 100% { transform: translateY(3px); }
          25%, 75%      { transform: translateY(-1px); }
        }
        @keyframes blanket-cover {
          from { width: 0; }
          to   { width: 54px; }
        }
        @keyframes blanket-uncover {
          from { width: 54px; }
          to   { width: 0; }
        }
        @keyframes zzz-float {
          0%   { opacity: 0; transform: translateY(0px) rotate(-10deg); }
          20%  { opacity: 1; }
          80%  { opacity: 0.7; }
          100% { opacity: 0; transform: translateY(-32px) rotate(10deg); }
        }
        @keyframes bot-blink {
          0%, 90%, 100% { transform: scaleY(1); }
          93%            { transform: scaleY(0.15); }
        }
        @keyframes zzz-poof {
          from { opacity: 1; transform: translateY(-12px) scale(1); }
          to   { opacity: 0; transform: translateY(-24px) scale(1.8); }
        }
        @keyframes star-twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.4); }
        }
        @keyframes globe-in-right {
          from { opacity: 0; transform: perspective(700px) rotateY(35deg) translateX(80px) scale(0.88); }
          to   { opacity: 1; transform: perspective(700px) rotateY(0deg) translateX(0) scale(1); }
        }
        @keyframes globe-in-left {
          from { opacity: 0; transform: perspective(700px) rotateY(-35deg) translateX(-80px) scale(0.88); }
          to   { opacity: 1; transform: perspective(700px) rotateY(0deg) translateX(0) scale(1); }
        }
        .nav-arrow:hover { background: rgba(255,255,255,0.25) !important; transform: scale(1.1); }
        .nav-dot:hover { transform: scale(1.3); }
      `}</style>

      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{
          minHeight: 'calc(100vh - 60px)',
          background: bgGrad,
          transition: 'background 0.7s ease',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '48px 24px',
          fontFamily: 'Nunito, sans-serif',
          position: 'relative', overflow: 'hidden',
        }}>

        {/* Background blobs */}
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.12), transparent 70%)', top: -150, left: -150, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.08), transparent 70%)', bottom: -120, right: -100, pointerEvents: 'none' }} />

        {/* Quota pill */}
        <QuotaPill quota={quota} onInfo={() => setShowCreditInfo(true)} />

        {children.length === 0 ? (
          /* ── Empty state ── */
          <div style={{ textAlign: 'center', color: 'white', animation: 'glm-fadein 0.5s ease both' }}>
            <div style={{ fontSize: 72, marginBottom: 20 }}>🌟</div>
            <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 10 }}>No adventurers yet!</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, marginBottom: 32 }}>Add your little one to get started with stories and adventures!</p>
            <button onClick={() => navigate('/child/new')}
              style={{ background: 'white', color: '#ff6b6b', border: 'none', borderRadius: 50, padding: '14px 36px', fontSize: 16, fontWeight: 900, cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
              + Add Your Child
            </button>
          </div>
        ) : (
          <>
            {/* ── Grown-up nudge banners ── */}
            {grownUpChildren.map(c => (
              <div key={c.id} style={{ width: '100%', maxWidth: 480, marginBottom: 16, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 12, animation: 'glm-fadein 0.4s ease both' }}>
                <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>🎓</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 10px', color: 'white', fontSize: 13, lineHeight: 1.5 }}>
                    🎉 <strong>{c.name}</strong> has graduated from Glumbi University! They've turned {calcAge(c.birthYear)} — our adventures are built for ages 1–10. Congrats, superstar! 🌟
                  </p>
                  <button
                    onClick={() => navigate(`/child/${c.id}/edit`)}
                    style={{ background: 'rgba(255,255,255,0.25)', border: '1.5px solid rgba(255,255,255,0.4)', color: 'white', borderRadius: 50, padding: '5px 14px', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>
                    🎓 Graduate profile
                  </button>
                </div>
                <button onClick={() => dismissGrownUp(c.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 18, cursor: 'pointer', padding: '0 4px', flexShrink: 0, lineHeight: 1 }}>✕</button>
              </div>
            ))}

            {/* ── Header ── */}
            <div style={{ textAlign: 'center', marginBottom: 40, animation: 'glm-fadein 0.4s ease both' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 8 }}>Glumbi</div>
              <h1 style={{ fontSize: 'clamp(22px, 4.5vw, 34px)', fontWeight: 900, color: 'white', margin: 0, letterSpacing: -0.5 }}>
                Who's playing today? 🎮
              </h1>
            </div>

            {/* ── Carousel row ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px,3vw,36px)', width: '100%', maxWidth: 560, justifyContent: 'center' }}>

              {/* Left arrow */}
              <button
                className="nav-arrow"
                onClick={prev}
                style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.18)',
                  border: '1.5px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  fontSize: 20, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s ease', flexShrink: 0,
                  backdropFilter: 'blur(8px)',
                }}>
                ←
              </button>

              {/* Active slide */}
              <div key={animKey} style={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: 0 }}>
                {activeIdx < children.length ? (
                  <ChildCard
                    c={children[activeIdx]}
                    t={THEMES[children[activeIdx].theme] || THEMES.coral}
                    onSelect={c => {
                      localStorage.setItem(`glm_offline_${c.id}`, '0')
                      setOfflineModes(prev => ({ ...prev, [c.id]: false }))
                      setPendingChild(c)
                    }}
                    onEdit={c => navigate(`/child/${c.id}/edit`)}
                    onInsights={c => navigate(`/child/${c.id}/insights`)}
                    animDir={animDir}
                  />
                ) : (
                  <AddChildSlide onAdd={() => navigate('/child/new')} animDir={animDir} activeCount={children.length} />
                )}
              </div>

              {/* Right arrow */}
              <button
                className="nav-arrow"
                onClick={next}
                style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.18)',
                  border: '1.5px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  fontSize: 20, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s ease', flexShrink: 0,
                  backdropFilter: 'blur(8px)',
                }}>
                →
              </button>
            </div>

            {/* ── Dots ── */}
            <div style={{ display: 'flex', gap: 8, marginTop: 36, alignItems: 'center' }}>
              {Array.from({ length: totalSlides }).map((_, i) => {
                const isAdd = i === children.length
                return (
                  <button
                    key={i}
                    className="nav-dot"
                    onClick={() => goTo(i, i > activeIdx ? 1 : -1)}
                    title={isAdd ? 'Add child' : children[i]?.name}
                    style={{
                      width: i === activeIdx ? 28 : 10,
                      height: 10,
                      borderRadius: 50,
                      border: 'none',
                      cursor: 'pointer',
                      background: i === activeIdx
                        ? 'white'
                        : isAdd
                          ? 'rgba(255,255,255,0.25)'
                          : 'rgba(255,255,255,0.35)',
                      transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                      padding: 0,
                    }}
                  />
                )
              })}
            </div>

            {/* ── Swipe hint (mobile) ── */}
            <div style={{ marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
              {totalSlides > 1 ? 'swipe or use ← → keys' : ''}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {showCreditInfo && (
        <CreditInfoModal featureConfig={featureConfig} onClose={() => setShowCreditInfo(false)} />
      )}
      {showParentGuide && (
        <ParentGuideModal onClose={() => { setShowParentGuide(false); localStorage.setItem('glm_parent_guide_seen', '1') }} />
      )}
      {pendingChild && (
        <UnlockModal
          child={pendingChild}
          offline={!!offlineModes[pendingChild.id]}
          onClose={() => setPendingChild(null)}
          onLockConfirmed={(c, timeLimit, maxSnooze) => { setPendingChild(null); onLockConfirmed(c, timeLimit, maxSnooze) }}
          onToggleOffline={() => handleToggleOffline(null, pendingChild)}
        />
      )}
    </>
  )
}
