import { useRef, useState, useEffect } from 'react'
import { drawApi } from '../../api/client'
import QuotaBanner from '../../components/QuotaBanner'
import { useOffline } from '../../contexts/OfflineContext'
import ThemeLoader from '../../components/ThemeLoader'

function useIsMobile() {
  const [m, setM] = useState(window.innerWidth < 640)
  useEffect(() => {
    const h = () => setM(window.innerWidth < 640)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return m
}

const PRESET_COLORS = [
  // Blacks & whites
  '#000000','#333333','#666666','#999999','#cccccc','#ffffff',
  // Reds & pinks
  '#ff0000','#ff4757','#ff6b81','#ff69b4','#e91e63','#c2185b',
  // Oranges & yellows
  '#ff6600','#ffa502','#ff9800','#ffd32a','#ffeb3b','#fff176',
  // Greens
  '#00c853','#2ed573','#26de81','#4caf50','#8bc34a','#cddc39',
  // Blues
  '#1e90ff','#2196f3','#03a9f4','#70a1ff','#3f51b5','#1a237e',
  // Purples & violets
  '#9c6ef8','#9c27b0','#673ab7','#7c4dff','#ce93d8','#f48fb1',
  // Browns & skin tones
  '#4e342e','#6d4c41','#8d5524','#c68642','#f1c27d','#ffdbac',
]

const BRUSHES = [
  { size: 3,  label: '·',  title: 'Extra thin' },
  { size: 7,  label: '•',  title: 'Thin' },
  { size: 14, label: '●',  title: 'Medium' },
  { size: 24, label: '⬤', title: 'Thick' },
  { size: 40, label: '⬤', title: 'Extra thick', big: true },
]

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 9, fontWeight: 800, color: '#bbb', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center', width: '100%' }}>
      {children}
    </div>
  )
}

function Divider() {
  return <div style={{ width: '80%', height: 1, background: '#f0f0f0' }} />
}

export default function Draw({ child, quota }) {
  const offline = useOffline()
  const canvasRef  = useRef(null)
  const colorInput = useRef(null)
  const drawing    = useRef(false)
  const lastPos    = useRef(null)

  const [color, setColor]         = useState('#000000')
  const [brush, setBrush]         = useState(14)
  const [eraser, setEraser]       = useState(false)
  const [aiReply, setAiReply]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [isEmpty, setIsEmpty]     = useState(true)
  const [showDemo, setShowDemo]   = useState(() => !localStorage.getItem('glm_draw_seen'))
  const [showPalette, setShowPalette] = useState(false)
  const [palettePos, setPalettePos]   = useState({ x: 0, y: 0 })
  const [recentColors, setRecentColors] = useState([])
  const swatchRef = useRef(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  // Attach touch listeners as non-passive so preventDefault() works on mobile
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const onTouchStart = e => startDraw(e)
    const onTouchMove  = e => draw(e)
    canvas.addEventListener('touchstart', onTouchStart, { passive: false })
    canvas.addEventListener('touchmove',  onTouchMove,  { passive: false })
    return () => {
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove',  onTouchMove)
    }
  })

  // Close palette on outside click
  useEffect(() => {
    if (!showPalette) return
    const handler = (e) => {
      if (!e.target.closest('.palette-popup') && !e.target.closest('.palette-trigger')) {
        setShowPalette(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showPalette])

  function pickColor(c) {
    setColor(c)
    setEraser(false)
    setRecentColors(prev => [c, ...prev.filter(x => x !== c)].slice(0, 8))
  }

  function getPos(e, canvas) {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width  / rect.width
    const scaleY = canvas.height / rect.height
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top)  * scaleY,
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top)  * scaleY,
    }
  }

  function startDraw(e) {
    e.preventDefault()
    drawing.current = true
    lastPos.current = getPos(e, canvasRef.current)
  }

  function draw(e) {
    e.preventDefault()
    if (!drawing.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e, canvas)
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = eraser ? '#ffffff' : color
    ctx.lineWidth   = eraser ? brush * 2 : brush
    ctx.lineCap     = 'round'
    ctx.lineJoin    = 'round'
    ctx.stroke()
    lastPos.current = pos
    setIsEmpty(false)
  }

  function stopDraw() {
    drawing.current = false
    lastPos.current = null
  }

  function clearCanvas() {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setAiReply('')
    setIsEmpty(true)
  }

  async function handleIdentify() {
    const imageData = canvasRef.current.toDataURL('image/png').split(',')[1]
    const age = child?.birthYear ? new Date().getFullYear() - child.birthYear : 4
    setLoading(true)
    setAiReply('')
    try {
      const { response } = await drawApi.identify(imageData, child?.name || 'you', age)
      setAiReply(response)
    } catch {
      setAiReply('Wow, what an amazing drawing! 🌟')
    } finally {
      setLoading(false)
    }
  }

  function downloadDrawing() {
    const link = document.createElement('a')
    link.download = `${child?.name || 'glumbi'}-drawing.png`
    link.href = canvasRef.current.toDataURL()
    link.click()
  }

  const toolbarStyle = {
    width: isMobile ? '100%' : 96,
    flexShrink: 0,
    display: 'flex',
    flexDirection: isMobile ? 'row' : 'column',
    flexWrap: isMobile ? 'wrap' : undefined,
    gap: isMobile ? 8 : 12,
    background: 'white',
    borderRadius: 20,
    padding: isMobile ? '12px 16px' : '16px 10px',
    boxShadow: 'var(--shadow)',
    alignItems: 'center',
    justifyContent: isMobile ? 'space-between' : 'flex-start',
    overflowY: isMobile ? undefined : 'auto',
    position: 'relative',
  }

  return (
    <>
    {loading && <ThemeLoader theme={child.theme} label="Guessing your drawing…" />}
    <div style={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? 12 : 20,
      height: isMobile ? 'auto' : 'calc(100vh - 160px)',
    }}>

      {/* ── Toolbar ── */}
      <div style={toolbarStyle}>

        {/* ── COLOUR section ── */}
        {!isMobile && <SectionLabel>Colour</SectionLabel>}

        {/* Active color swatch + palette trigger */}
        <div style={{ position: 'relative' }}>
          <button ref={swatchRef} className="palette-trigger"
            onClick={() => {
              const rect = swatchRef.current.getBoundingClientRect()
              setPalettePos(isMobile
                ? { x: rect.left, y: rect.bottom + 8 }
                : { x: rect.right + 10, y: rect.top }
              )
              setShowPalette(p => !p)
            }}
            title="Open colour palette"
            style={{
              width: 44, height: 44, borderRadius: 12, border: 'none', cursor: 'pointer', padding: 0,
              background: eraser ? '#f5f5f5' : color,
              boxShadow: `0 0 0 3px white, 0 0 0 5px ${eraser ? '#ccc' : color}`,
              transition: 'all 0.15s',
              position: 'relative', overflow: 'hidden',
            }}>
            {eraser && <span style={{ fontSize: 20 }}>🧹</span>}
          </button>

          {/* Palette popup — rendered fixed so toolbar overflow doesn't clip it */}
          {showPalette && (
            <div className="palette-popup" style={{
              position: 'fixed',
              left: palettePos.x,
              top: palettePos.y,
              zIndex: 1000,
              background: 'white',
              borderRadius: 20,
              padding: 16,
              boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
              width: 240,
              border: '1px solid #f0f0f0',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#bbb', marginBottom: 10, letterSpacing: 1 }}>PRESET COLOURS</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, marginBottom: 14 }}>
                {PRESET_COLORS.map(c => (
                  <button key={c} onClick={() => { pickColor(c); setShowPalette(false) }}
                    style={{
                      width: 28, height: 28, borderRadius: 8, background: c,
                      border: color === c && !eraser ? `3px solid #333` : c === '#ffffff' ? '1px solid #ddd' : '2px solid transparent',
                      cursor: 'pointer', padding: 0,
                      transform: color === c && !eraser ? 'scale(1.15)' : 'scale(1)',
                      transition: 'all 0.12s',
                    }} />
                ))}
              </div>

              {recentColors.length > 0 && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#bbb', marginBottom: 8, letterSpacing: 1 }}>RECENTLY USED</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                    {recentColors.map((c, i) => (
                      <button key={i} onClick={() => { pickColor(c); setShowPalette(false) }}
                        style={{
                          width: 28, height: 28, borderRadius: 8, background: c,
                          border: color === c ? '3px solid #333' : c === '#ffffff' ? '1px solid #ddd' : '2px solid transparent',
                          cursor: 'pointer', padding: 0,
                        }} />
                    ))}
                  </div>
                </>
              )}

              <div style={{ fontSize: 11, fontWeight: 800, color: '#bbb', marginBottom: 8, letterSpacing: 1 }}>CUSTOM COLOUR</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: color, border: '1px solid #eee', flexShrink: 0 }} />
                <input
                  ref={colorInput}
                  type="color"
                  value={eraser ? '#000000' : color}
                  onChange={e => pickColor(e.target.value)}
                  style={{ flex: 1, height: 36, borderRadius: 8, border: '1px solid #eee', cursor: 'pointer', padding: 2 }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Quick colour row (most used) */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center', maxWidth: 76 }}>
          {['#000000','#ffffff','#ff4757','#ffa502','#2ed573','#1e90ff','#9c6ef8','#ff69b4'].map(c => (
            <button key={c} onClick={() => pickColor(c)}
              style={{
                width: 22, height: 22, borderRadius: 6, background: c, border: 'none',
                cursor: 'pointer', padding: 0,
                boxShadow: color === c && !eraser ? `0 0 0 2px white, 0 0 0 4px ${c}` : c === '#ffffff' ? '0 0 0 1px #ddd' : 'none',
                transform: color === c && !eraser ? 'scale(1.2)' : 'scale(1)',
                transition: 'all 0.12s',
              }} />
          ))}
        </div>

        {!isMobile && <Divider />}

        {/* ── SIZE section ── */}
        {!isMobile && <SectionLabel>Size</SectionLabel>}

        <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: 5, alignItems: 'center' }}>
          {BRUSHES.map(b => (
            <button key={b.size} onClick={() => setBrush(b.size)} title={b.title}
              style={{
                width: isMobile ? 34 : 72, height: isMobile ? 32 : 28,
                borderRadius: 8, border: 'none', cursor: 'pointer',
                background: brush === b.size ? 'var(--primary-lt)' : '#f5f5f5',
                outline: brush === b.size ? '2px solid var(--primary)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 6, padding: '0 6px',
              }}>
              <div style={{
                width: Math.min(b.size, 20), height: Math.min(b.size, 20),
                borderRadius: '50%',
                background: brush === b.size ? 'var(--primary)' : '#aaa',
                flexShrink: 0,
              }} />
              {!isMobile && <span style={{ fontSize: 10, fontWeight: 700, color: brush === b.size ? 'var(--primary)' : '#aaa' }}>{b.title}</span>}
            </button>
          ))}
        </div>

        {!isMobile && <Divider />}

        {/* ── TOOLS section ── */}
        {!isMobile && <SectionLabel>Tools</SectionLabel>}

        <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: 5, alignItems: 'center' }}>
          <button onClick={() => setEraser(e => !e)} title="Eraser"
            style={{
              width: isMobile ? 40 : 72, height: isMobile ? 38 : 32,
              borderRadius: 8, border: 'none', cursor: 'pointer',
              background: eraser ? '#fff0f0' : '#f5f5f5',
              outline: eraser ? '2px solid var(--primary)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
            <span style={{ fontSize: 16 }}>🧹</span>
            {!isMobile && <span style={{ fontSize: 10, fontWeight: 700, color: eraser ? 'var(--primary)' : '#aaa' }}>Eraser</span>}
          </button>

          <button onClick={clearCanvas} title="Clear canvas"
            style={{
              width: isMobile ? 40 : 72, height: isMobile ? 38 : 32,
              borderRadius: 8, border: 'none', cursor: 'pointer', background: '#f5f5f5',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
            <span style={{ fontSize: 16 }}>🗑️</span>
            {!isMobile && <span style={{ fontSize: 10, fontWeight: 700, color: '#aaa' }}>Clear</span>}
          </button>

          <button onClick={downloadDrawing} title="Save drawing"
            style={{
              width: isMobile ? 40 : 72, height: isMobile ? 38 : 32,
              borderRadius: 8, border: 'none', cursor: 'pointer', background: '#f5f5f5',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
            <span style={{ fontSize: 16 }}>💾</span>
            {!isMobile && <span style={{ fontSize: 10, fontWeight: 700, color: '#aaa' }}>Save</span>}
          </button>
        </div>
      </div>

      {/* ── Canvas area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>

        <div style={{
          flex: 1, borderRadius: 20, overflow: 'hidden',
          boxShadow: 'var(--shadow)', position: 'relative',
          cursor: eraser ? 'cell' : 'crosshair',
          background: 'white',
          minHeight: isMobile ? 320 : undefined,
        }}>
          <canvas
            ref={canvasRef}
            width={1200}
            height={800}
            style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchEnd={stopDraw}
          />
          {isEmpty && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
            }}>
              <div style={{ fontSize: 64, opacity: 0.1 }}>✏️</div>
              <div style={{ fontSize: 16, color: '#ccc', fontWeight: 700, marginTop: 8 }}>Start drawing!</div>
            </div>
          )}
        </div>

        <QuotaBanner quota={quota} />
        {/* AI section */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={handleIdentify} disabled={loading || isEmpty || quota?.used >= quota?.limit || offline}
            style={{
              padding: '14px 28px', borderRadius: 50, fontSize: 15, fontWeight: 800,
              background: 'linear-gradient(135deg,var(--primary),var(--accent))',
              color: 'white', border: 'none', cursor: (isEmpty || offline) ? 'not-allowed' : 'pointer',
              opacity: (isEmpty || offline) ? 0.5 : 1,
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              whiteSpace: 'nowrap',
            }}>
            {loading ? '🤔 Thinking…' : offline ? '✈️ AI is off' : '✨ What did I draw?'}
          </button>
          {aiReply && (
            <div style={{
              flex: 1, background: 'var(--primary-lt)',
              borderRadius: 16, padding: '14px 20px',
              border: '2px solid var(--primary-lt)', fontSize: 15, fontWeight: 600, color: '#444',
              animation: 'fadeIn 0.4s ease',
            }}>
              {aiReply}
            </div>
          )}
        </div>
      </div>

      {/* ── First-visit demo popup ── */}
      {showDemo && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, animation: 'fadeIn 0.3s ease',
        }}>
          <div style={{
            background: 'white', borderRadius: 28, padding: '40px 44px',
            maxWidth: 480, width: '90%', textAlign: 'center',
            boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
          }}>
            <div style={{ fontSize: 56 }}>🎨</div>
            <h2 style={{ fontFamily: 'Nunito, sans-serif', fontSize: 26, margin: '12px 0 6px', color: 'var(--primary)' }}>
              Drawing Studio
            </h2>
            <p style={{ color: '#666', fontSize: 15, lineHeight: 1.6, margin: '0 0 28px' }}>
              Your very own digital art canvas! Here's how it works:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left', marginBottom: 30 }}>
              {[
                { icon: '🖌️', step: '1. Pick a color', desc: 'Tap the colour swatch to open the full palette — or pick any custom colour!' },
                { icon: '✏️', step: '2. Draw anything!', desc: 'Use your mouse or finger to draw on the big white canvas' },
                { icon: '✨', step: '3. Ask the AI!', desc: 'Hit "What did I draw?" — AI will guess with excitement!' },
              ].map(({ icon, step, desc }) => (
                <div key={step} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 28, flexShrink: 0 }}>{icon}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: '#333' }}>{step}</div>
                    <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => { localStorage.setItem('glm_draw_seen', '1'); setShowDemo(false) }}
              style={{
                padding: '14px 40px', borderRadius: 50, fontSize: 16, fontWeight: 800,
                background: 'linear-gradient(135deg,var(--primary),var(--accent))',
                color: 'white', border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              }}>
              Let's Draw! 🚀
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
    </>
  )
}
