import { useRef, useState, useEffect, useCallback } from 'react'
import { traceApi } from '../../api/client'
import { useOffline } from '../../contexts/OfflineContext'
import ThemeLoader from '../../components/ThemeLoader'
import FeatureBanner from '../../components/FeatureBanner'
import QuotaBanner from '../../components/QuotaBanner'
import { useTracker } from '../../contexts/ActivityTrackerContext'
import useFeatureDuration from '../../hooks/useFeatureDuration'

function useBreakpoint() {
  const get = () => window.innerWidth < 640 ? 'mobile' : 'desktop'
  const [bp, setBp] = useState(get)
  useEffect(() => {
    const h = () => setBp(get()); window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return bp
}

const MAZES = [
  {
    character: '🦔', bg: 'linear-gradient(135deg,#e8f5e9,#f1f8e9)',
    paths: [
      { id:1, d:'M 60,200 C 120,120 80,60 180,60 C 260,60 240,140 340,120 C 420,100 460,60 540,80',   end:[540,80],  destEmoji:'🏠', destLabel:'Home'   },
      { id:2, d:'M 60,200 C 100,260 60,320 160,320 C 240,320 260,240 360,260 C 440,275 480,340 540,320', end:[540,320], destEmoji:'🌳', destLabel:'Forest' },
      { id:3, d:'M 60,200 C 140,200 160,160 240,180 C 320,200 300,280 400,260 C 460,248 500,200 540,200', end:[540,200], destEmoji:'🌻', destLabel:'Garden' },
    ],
  },
  {
    character: '🐝', bg: 'linear-gradient(135deg,#fff8e1,#fff3e0)',
    paths: [
      { id:1, d:'M 60,200 C 80,100 160,80 200,140 C 240,200 320,80 400,100 C 460,115 500,60 540,80',   end:[540,80],  destEmoji:'🌸', destLabel:'Flower' },
      { id:2, d:'M 60,200 C 120,240 100,300 200,300 C 300,300 340,200 420,240 C 470,265 510,320 540,320', end:[540,320], destEmoji:'🍯', destLabel:'Hive'   },
      { id:3, d:'M 60,200 C 160,180 180,220 280,200 C 360,184 380,240 480,220 C 510,212 530,200 540,200', end:[540,200], destEmoji:'🌼', destLabel:'Meadow' },
    ],
  },
  {
    character: '🚀', bg: 'linear-gradient(135deg,#e8eaf6,#e3f2fd)',
    paths: [
      { id:1, d:'M 60,200 C 100,120 140,60 220,80 C 300,100 320,60 400,40 C 460,25 500,60 540,80',    end:[540,80],  destEmoji:'🌙', destLabel:'Moon'   },
      { id:2, d:'M 60,200 C 80,280 140,340 220,320 C 300,300 320,360 420,340 C 480,328 510,340 540,320', end:[540,320], destEmoji:'⭐', destLabel:'Star'   },
      { id:3, d:'M 60,200 C 140,200 180,160 260,180 C 340,200 360,200 440,180 C 490,168 520,200 540,200', end:[540,200], destEmoji:'🪐', destLabel:'Planet' },
    ],
  },
  {
    character: '🐟', bg: 'linear-gradient(135deg,#e0f7fa,#e0f2f1)',
    paths: [
      { id:1, d:'M 60,200 C 100,100 180,80 240,120 C 300,160 360,80 440,80 C 490,80 520,80 540,80',   end:[540,80],  destEmoji:'🏝️', destLabel:'Island' },
      { id:2, d:'M 60,200 C 120,280 160,340 260,320 C 340,304 360,360 460,340 C 500,330 520,330 540,320', end:[540,320], destEmoji:'🌊', destLabel:'Ocean'  },
      { id:3, d:'M 60,200 C 160,200 200,140 300,160 C 380,176 400,240 480,220 C 510,212 530,200 540,200', end:[540,200], destEmoji:'🐚', destLabel:'Shell'  },
    ],
  },
]

// Sample SVG path into points for proximity check
function samplePathPoints(pathStr, n = 60) {
  try {
    const svgEl = document.createElementNS('http://www.w3.org/2000/svg','svg')
    svgEl.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none'
    document.body.appendChild(svgEl)
    const p = document.createElementNS('http://www.w3.org/2000/svg','path')
    p.setAttribute('d', pathStr); svgEl.appendChild(p)
    const len = p.getTotalLength()
    const pts = Array.from({length: n+1}, (_,i) => { const pt = p.getPointAtLength(i/n*len); return [pt.x, pt.y] })
    document.body.removeChild(svgEl)
    return pts
  } catch { return [] }
}

function dist(ax, ay, bx, by) { return Math.sqrt((ax-bx)**2+(ay-by)**2) }

function nearestDist(x, y, pts) {
  let min = Infinity
  for (const [px,py] of pts) { const d = dist(x,y,px,py); if (d < min) min = d }
  return min
}

function Confetti({ count=32 }) {
  const pieces = Array.from({length:count},(_,i)=>({
    key:i, left:Math.random()*100,
    color:['#ff6b6b','#ffd32a','#6bcb77','#4facfe','#f093fb','#ff9800'][i%6],
    delay:Math.random()*0.8, size:8+Math.random()*10, dur:1.5+Math.random()
  }))
  return (
    <div style={{position:'fixed',inset:0,pointerEvents:'none',overflow:'hidden',zIndex:999}}>
      {pieces.map(p=>(
        <div key={p.key} style={{position:'absolute',left:`${p.left}%`,top:'-20px',
          width:p.size,height:p.size,background:p.color,
          borderRadius:Math.random()>.5?'50%':2,
          animation:`cfFall ${p.dur}s ${p.delay}s ease-in forwards`}}/>
      ))}
      <style>{`@keyframes cfFall{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}`}</style>
    </div>
  )
}

function StarBurst({ x, y }) {
  return (
    <g>
      {[0,45,90,135,180,225,270,315].map(angle=>(
        <line key={angle}
          x1={x} y1={y}
          x2={x+Math.cos(angle*Math.PI/180)*28}
          y2={y+Math.sin(angle*Math.PI/180)*28}
          stroke="#ffd32a" strokeWidth="3" strokeLinecap="round">
          <animate attributeName="opacity" values="1;0" dur="0.6s" fill="freeze"/>
          <animateTransform attributeName="transform" type="translate"
            values="0 0;0 0" dur="0.6s"/>
        </line>
      ))}
      <circle cx={x} cy={y} r="8" fill="#ffd32a" opacity="0.9">
        <animate attributeName="r" values="4;16;0" dur="0.5s" fill="freeze"/>
        <animate attributeName="opacity" values="1;1;0" dur="0.5s" fill="freeze"/>
      </circle>
    </g>
  )
}

export default function Trace({ child, quota, featureConfig }) {
  const offline = useOffline()
  const { track } = useTracker()
  useFeatureDuration('trace', track)
  const isMobile = useBreakpoint() === 'mobile'
  const svgRef = useRef(null)
  const pathSamplesRef = useRef({})

  const [mazeIdx, setMazeIdx]         = useState(0)
  const [activeId, setActiveId]       = useState(1)
  const [completedIds, setCompleted]  = useState([])
  const [drawing, setDrawing]         = useState(false)
  const [drawnPts, setDrawnPts]       = useState([])
  const [onTrack, setOnTrack]         = useState(true)
  const [burst, setBurst]             = useState(null)
  const [confetti, setConfetti]       = useState(false)
  const [allDone, setAllDone]         = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [aiTheme, setAiTheme]         = useState(null)
  const [charBounce, setCharBounce]   = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  function toggleFullscreen() {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen()
    else document.exitFullscreen()
  }

  const childAge = child?.birthYear ? new Date().getFullYear()-child.birthYear : 5
  const difficulty = childAge<=4?'easy':childAge<=7?'medium':'hard'

  const aiEnabled = (() => {
    if (!featureConfig) return true
    const fc = featureConfig.find(f=>f.featureName==='trace')
    return !fc || fc.enabled!==false
  })()
  const canGenerate = aiEnabled && !offline && quota && quota.used < quota.limit

  const maze = MAZES[mazeIdx % MAZES.length]
  const activePath = maze.paths.find(p=>p.id===activeId)

  // Pre-sample path points for proximity detection
  useEffect(() => {
    pathSamplesRef.current = {}
    maze.paths.forEach(p => {
      pathSamplesRef.current[p.id] = samplePathPoints(p.d)
    })
  }, [mazeIdx])

  function svgCoords(clientX, clientY) {
    const svg = svgRef.current; if (!svg) return [0,0]
    try {
      const pt = svg.createSVGPoint()
      pt.x = clientX; pt.y = clientY
      const svgPt = pt.matrixTransform(svg.getScreenCTM().inverse())
      return [svgPt.x, svgPt.y]
    } catch {
      const rect = svg.getBoundingClientRect()
      return [(clientX - rect.left) * 600 / rect.width, (clientY - rect.top) * 400 / rect.height]
    }
  }

  // Use refs so the imperative listeners always see latest state
  const drawingRef = useRef(false)
  const activeIdRef = useRef(activeId)
  const completedIdsRef = useRef(completedIds)
  const allDoneRef = useRef(allDone)
  useEffect(() => { activeIdRef.current = activeId }, [activeId])
  useEffect(() => { completedIdsRef.current = completedIds }, [completedIds])
  useEffect(() => {
    allDoneRef.current = allDone
    if (allDone) track('trace', 'complete', { metadata: { mazeIdx } })
  }, [allDone]) // eslint-disable-line react-hooks/exhaustive-deps

  const drawnPtsRef = useRef([])
  useEffect(() => { drawnPtsRef.current = [] }, [mazeIdx, activeId])

  const handleTouchStart = useCallback((e) => {
    if (allDoneRef.current || completedIdsRef.current.includes(activeIdRef.current)) return
    const svg = svgRef.current; if (!svg) return
    const t = e.touches[0]
    const [x, y] = svgCoords(t.clientX, t.clientY)
    const lastPt = drawnPtsRef.current[drawnPtsRef.current.length - 1]
    const nearOrigin = dist(x, y, 60, 200) < 60
    const nearLastPt = lastPt && dist(x, y, lastPt[0], lastPt[1]) < 60
    if (!nearOrigin && !nearLastPt) return
    e.preventDefault()
    drawingRef.current = true
    setDrawing(true); setOnTrack(true)
    if (nearOrigin && !nearLastPt) {
      drawnPtsRef.current = [[x, y]]
      setDrawnPts([[x, y]])
    }
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (!drawingRef.current) return
    e.preventDefault()
    const t = e.touches[0]
    const [x, y] = svgCoords(t.clientX, t.clientY)
    drawnPtsRef.current = [...drawnPtsRef.current, [x, y]]
    setDrawnPts([...drawnPtsRef.current])
    const samples = pathSamplesRef.current[activeIdRef.current] || []
    setOnTrack(nearestDist(x,y,samples) < 60)
    // Check destination — read maze from closure via ref
    const maze = MAZES[mazeIdxRef.current % MAZES.length]
    const activePath = maze.paths.find(p=>p.id===activeIdRef.current)
    if (!activePath) return
    const [ex,ey] = activePath.end
    if (dist(x,y,ex,ey) < 52) {
      drawingRef.current = false
      setDrawing(false); setOnTrack(true)
      setBurst({x:ex,y:ey}); setTimeout(()=>setBurst(null),700)
      const newDone = [...completedIdsRef.current, activeIdRef.current]
      setCompleted(newDone); setDrawnPts([])
      setCharBounce(true); setTimeout(()=>setCharBounce(false),600)
      if (newDone.length === maze.paths.length) {
        setTimeout(()=>{setAllDone(true); setConfetti(true); setTimeout(()=>setConfetti(false),2500)},300)
      } else {
        const nextId = maze.paths.find(p=>!newDone.includes(p.id))?.id
        if (nextId) setTimeout(()=>setActiveId(nextId),400)
      }
    }
  }, [])

  const handleTouchEnd = useCallback((e) => {
    drawingRef.current = false
    setDrawing(false); setOnTrack(true)
  }, [])

  // Register touch events with passive:false so preventDefault works in fullscreen
  useEffect(() => {
    const svg = svgRef.current; if (!svg) return
    svg.addEventListener('touchstart', handleTouchStart, { passive: false })
    svg.addEventListener('touchmove',  handleTouchMove,  { passive: false })
    svg.addEventListener('touchend',   handleTouchEnd,   { passive: false })
    return () => {
      svg.removeEventListener('touchstart', handleTouchStart)
      svg.removeEventListener('touchmove',  handleTouchMove)
      svg.removeEventListener('touchend',   handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  const mazeIdxRef = useRef(mazeIdx)
  useEffect(() => { mazeIdxRef.current = mazeIdx }, [mazeIdx])

  function onPointerDown(e) {
    if (e.touches) return
    if (allDone || completedIds.includes(activeId)) return
    const [x,y] = svgCoords(e.clientX, e.clientY)
    const lastPt = drawnPtsRef.current[drawnPtsRef.current.length - 1]
    const nearOrigin = dist(x,y,60,200) < 60
    const nearLastPt = lastPt && dist(x,y,lastPt[0],lastPt[1]) < 60
    if (!nearOrigin && !nearLastPt) return
    setDrawing(true); setOnTrack(true)
    if (nearOrigin && !nearLastPt) {
      drawnPtsRef.current = [[x,y]]
      setDrawnPts([[x,y]])
    }
  }

  function onPointerMove(e) {
    if (e.touches) return
    if (!drawing) return
    const [x,y] = svgCoords(e.clientX, e.clientY)
    drawnPtsRef.current = [...drawnPtsRef.current, [x,y]]
    setDrawnPts([...drawnPtsRef.current])
    const samples = pathSamplesRef.current[activeId] || []
    setOnTrack(nearestDist(x,y,samples) < 60)
    const [ex,ey] = activePath.end
    if (dist(x,y,ex,ey) < 52) {
      setDrawing(false); setOnTrack(true)
      setBurst({x:ex,y:ey}); setTimeout(()=>setBurst(null),700)
      const newDone = [...completedIds, activeId]
      setCompleted(newDone); setDrawnPts([])
      setCharBounce(true); setTimeout(()=>setCharBounce(false),600)
      if (newDone.length === maze.paths.length) {
        setTimeout(()=>{setAllDone(true); setConfetti(true); setTimeout(()=>setConfetti(false),2500)},300)
      } else {
        const nextId = maze.paths.find(p=>!newDone.includes(p.id))?.id
        if (nextId) setTimeout(()=>setActiveId(nextId),400)
      }
    }
  }

  function onPointerUp() { setDrawing(false); setOnTrack(true) }

  function resetMaze(idx) {
    drawnPtsRef.current = []; drawingRef.current = false
    setMazeIdx(idx); setActiveId(1); setCompleted([]); setDrawnPts([])
    setAllDone(false); setDrawing(false); setOnTrack(true); setBurst(null); setError('')
  }

  async function handleGenerate() {
    if (!canGenerate) return
    setLoading(true); setError('')
    try {
      const result = await traceApi.generate(child.id, child.name, childAge, difficulty)
      window.__glumbiRefreshQuota?.('trace')
      setAiTheme(result)
      resetMaze(mazeIdx+1)
    } catch(err) { setError(err.message||'Could not generate. Try again!') }
    finally { setLoading(false) }
  }

  const drawnPath = drawnPts.length>1 ? `M ${drawnPts.map(p=>p.join(',')).join(' L ')}` : ''
  const trailColor = onTrack ? 'var(--primary,#ff6b6b)' : '#ff9800'
  const characterEmoji = aiTheme?.character || maze.character

  const fsStyle = isFullscreen ? {
    background: maze.bg, display: 'flex', flexDirection: 'column',
    height: '100dvh', width: '100dvw', overflow: 'hidden',
    padding: isMobile ? '8px 12px' : '12px 24px', boxSizing: 'border-box',
  } : {}

  return (
    <div ref={containerRef} style={{padding:isMobile?'12px 12px 40px':'16px 24px 40px',fontFamily:'Nunito,sans-serif',...fsStyle}}>
      {!isFullscreen && <FeatureBanner feature="trace" child={child} isMobile={isMobile}/>}
      {!isFullscreen && <QuotaBanner quota={quota} isMobile={isMobile}/>}
      {loading && <ThemeLoader theme={child?.theme} label="Generating level..."/>}
      {confetti && <Confetti/>}

      {error && (
        <div style={{background:'#fff0f0',border:'1.5px solid #ffb3b3',borderRadius:12,padding:'10px 16px',color:'#c0392b',fontSize:14,marginBottom:12}}>
          {error}
        </div>
      )}

      {/* Header row */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
        <div>
          <div style={{fontSize:15,fontWeight:900,color:'var(--primary)'}}>
            {allDone ? '🎉 All paths done!' : `Trace path ${activeId}`}
          </div>
          {!allDone && activePath && (
            <div style={{fontSize:12,color:'#888',fontWeight:700,marginTop:2}}>
              Help {characterEmoji} reach {activePath.destEmoji} {activePath.destLabel}
            </div>
          )}
        </div>
        {/* Path chips */}
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          {maze.paths.map(p=>{
            const done = completedIds.includes(p.id)
            const active = p.id===activeId && !allDone
            return (
              <button key={p.id}
                onClick={()=>{if(!allDone&&!done){setActiveId(p.id);setDrawnPts([])}}}
                style={{
                  width:36,height:36,borderRadius:'50%',border:'none',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontWeight:900,fontSize:15,cursor:done?'default':'pointer',
                  background:done?'#6bcb77':active?'var(--primary)':'var(--primary-lt)',
                  color:done||active?'white':'var(--primary)',
                  boxShadow:active?'0 3px 10px var(--primary,#ff6b6b)44':done?'0 2px 6px #6bcb7744':'none',
                  transition:'all 0.2s',transform:active?'scale(1.1)':'scale(1)',
                  flexShrink:0,
                }}>
                {done?'✓':p.id}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main SVG canvas */}
      <div style={{
        background: isFullscreen ? 'transparent' : maze.bg,
        borderRadius: isFullscreen ? 0 : 24,
        boxShadow: isFullscreen ? 'none' : '0 4px 24px rgba(0,0,0,0.08)',
        overflow:'hidden', touchAction:'none', userSelect:'none',
        border: isFullscreen ? 'none' : '2px solid rgba(255,255,255,0.8)',
        flex: isFullscreen ? 1 : undefined,
        display: 'flex', flexDirection: 'column',
        position: 'relative',
      }}>
        {/* Fullscreen toggle — top-right corner of canvas */}
        <button onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit fullscreen' : 'Play fullscreen'}
          style={{
            position:'absolute', top:10, right:10, zIndex:10,
            width:32, height:32, minWidth:32, borderRadius:8, padding:0,
            border:'none', background:'rgba(255,255,255,0.7)', backdropFilter:'blur(4px)',
            color:'#888', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            transition:'all 0.15s',
          }}
          onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.95)';e.currentTarget.style.color='#333'}}
          onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.7)';e.currentTarget.style.color='#888'}}>
          {isFullscreen
            ? <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4"/></svg>
            : <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4"/></svg>}
        </button>
        <svg ref={svgRef} viewBox="0 0 600 400" style={{width:'100%',display:'block',cursor:drawing?'crosshair':'grab',flex:isFullscreen?1:undefined,height:isFullscreen?'100%':undefined}}
          onMouseDown={onPointerDown} onMouseMove={onPointerMove} onMouseUp={onPointerUp}
          onTouchStart={onPointerDown} onTouchMove={onPointerMove} onTouchEnd={onPointerUp}>

          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="softglow">
              <feGaussianBlur stdDeviation="6" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* All guide paths */}
          {maze.paths.map(p=>{
            const done = completedIds.includes(p.id)
            const active = p.id===activeId && !allDone
            return (
              <g key={p.id}>
                {/* Soft glow under active path */}
                {active && <path d={p.d} fill="none" stroke="var(--primary,#ff6b6b)" strokeWidth="10" opacity="0.1" strokeLinecap="round"/>}
                {/* Main dashed path */}
                <path d={p.d} fill="none"
                  stroke={done?'#6bcb77':active?'var(--primary,#ff6b6b)':'#ccc'}
                  strokeWidth={active?5:3}
                  strokeDasharray={active?'14 8':'10 7'}
                  strokeLinecap="round"
                  opacity={done?0.6:active?0.8:0.35}
                />
              </g>
            )
          })}

          {/* User's drawn trail */}
          {drawnPath && (
            <>
              <path d={drawnPath} fill="none" stroke={trailColor} strokeWidth="14"
                strokeLinecap="round" strokeLinejoin="round" opacity="0.15"/>
              <path d={drawnPath} fill="none" stroke={trailColor} strokeWidth="7"
                strokeLinecap="round" strokeLinejoin="round" opacity="0.95"/>
            </>
          )}

          {/* Destinations */}
          {maze.paths.map((p,idx)=>{
            const done = completedIds.includes(p.id)
            const dest = aiTheme?.destinations?.[idx] || {emoji:p.destEmoji,label:p.destLabel}
            const active = p.id===activeId && !allDone
            return (
              <g key={p.id}>
                {/* Destination backing circle */}
                <circle cx={p.end[0]} cy={p.end[1]} r="34"
                  fill={done?'rgba(107,203,119,0.2)':active?'rgba(255,255,255,0.95)':'rgba(255,255,255,0.6)'}
                  stroke={done?'#6bcb77':active?'var(--primary,#ff6b6b)':'#e0e0e0'}
                  strokeWidth={active?3:2}
                  filter={active&&!done?'url(#glow)':undefined}
                />
                {active && !done && (
                  <circle cx={p.end[0]} cy={p.end[1]} r="34" fill="none"
                    stroke="var(--primary,#ff6b6b)" strokeWidth="2" opacity="0.4">
                    <animate attributeName="r" values="34;44;34" dur="1.5s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.4;0;0.4" dur="1.5s" repeatCount="indefinite"/>
                  </circle>
                )}
                <text x={p.end[0]} y={p.end[1]+11} textAnchor="middle" fontSize="28">{dest.emoji}</text>
                <text x={p.end[0]} y={p.end[1]+52} textAnchor="middle" fontSize="11"
                  fontFamily="Nunito,sans-serif" fontWeight="800"
                  fill={done?'#6bcb77':active?'var(--primary,#ff6b6b)':'#aaa'}>
                  {dest.label}
                </text>
                {/* Done badge */}
                {done && (
                  <g>
                    <circle cx={p.end[0]+24} cy={p.end[1]-24} r="13" fill="#6bcb77"/>
                    <text x={p.end[0]+24} y={p.end[1]-19} textAnchor="middle" fontSize="14">✓</text>
                  </g>
                )}
              </g>
            )
          })}

          {/* Star burst at completion */}
          {burst && <StarBurst x={burst.x} y={burst.y}/>}

          {/* Origin character */}
          <circle cx={60} cy={200} r="40" fill="white"
            stroke="var(--primary,#ff6b6b)" strokeWidth="3"
            filter="url(#glow)"
          />
          <text x={60} y={215} textAnchor="middle" fontSize="36"
            style={{transform:charBounce?'translateY(-6px)':'translateY(0)',transition:'transform 0.15s ease'}}>
            {characterEmoji}
          </text>

          {/* Path number badges near origin */}
          {[[-30,-32],[-42,0],[-30,32]].map(([ox,oy],idx)=>{
            const p = maze.paths[idx]; if(!p) return null
            const done = completedIds.includes(p.id)
            const active = p.id===activeId && !allDone
            return (
              <g key={p.id}>
                <circle cx={60+ox} cy={200+oy} r="14"
                  fill={done?'#6bcb77':active?'var(--primary,#ff6b6b)':'rgba(255,255,255,0.9)'}
                  stroke={done?'none':active?'none':'#ddd'} strokeWidth="1.5"/>
                <text x={60+ox} y={200+oy+5} textAnchor="middle" fontSize="12"
                  fontFamily="Nunito,sans-serif" fontWeight="900"
                  fill={done||active?'white':'#bbb'}>
                  {done?'✓':p.id}
                </text>
              </g>
            )
          })}

          {/* All done overlay */}
          {allDone && (
            <g>
              <rect x="140" y="150" width="320" height="100" rx="20"
                fill="white" opacity="0.95" filter="url(#softglow)"/>
              <text x="300" y="193" textAnchor="middle" fontSize="28">🎉</text>
              <text x="300" y="225" textAnchor="middle" fontSize="15"
                fontFamily="Nunito,sans-serif" fontWeight="900" fill="var(--primary,#ff6b6b)">
                Amazing! All paths found!
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Proximity hint pill */}
      {drawing && (
        <div style={{textAlign:'center',marginTop:8}}>
          <span style={{
            display:'inline-block',padding:'4px 14px',borderRadius:50,fontSize:12,fontWeight:800,
            background:onTrack?'#e8f5e9':'#fff3e0',
            color:onTrack?'#2e7d32':'#e65100',
            border:`1.5px solid ${onTrack?'#6bcb77':'#ffa726'}`,
          }}>
            {onTrack?'✅ On track!':'⚠️ A bit off — follow the dotted line'}
          </span>
        </div>
      )}

      {/* Action buttons */}
      <div style={{display:'flex',gap:10,marginTop:16,alignItems:'center'}}>
        <button onClick={()=>resetMaze(Math.max(0, mazeIdx-1))} disabled={mazeIdx===0}
          style={{
            flex:1,padding:'12px 8px',borderRadius:50,
            border:`2px solid ${mazeIdx===0?'#e0e0e0':'var(--primary)'}`,
            background:'var(--primary-lt)',color:mazeIdx===0?'#ccc':'var(--primary)',
            fontWeight:800,fontSize:14,cursor:mazeIdx===0?'default':'pointer',fontFamily:'Nunito,sans-serif',
            opacity:mazeIdx===0?0.5:1,
          }}>
          ‹ Previous
        </button>

        <button onClick={()=>resetMaze(mazeIdx)}
          style={{
            flex:1,padding:'12px 8px',borderRadius:50,
            border:'2px solid var(--primary)',background:'var(--primary-lt)',
            color:'var(--primary)',fontWeight:800,fontSize:14,cursor:'pointer',fontFamily:'Nunito,sans-serif',
          }}>
          ↺ Replay
        </button>

        <button onClick={()=>resetMaze(mazeIdx+1)}
          style={{
            flex:1,padding:'12px 8px',borderRadius:50,border:'none',
            background:'linear-gradient(135deg,var(--primary),var(--accent))',color:'white',
            fontWeight:800,fontSize:14,cursor:'pointer',fontFamily:'Nunito,sans-serif',
            boxShadow:'0 4px 16px var(--primary,#ff6b6b)33',
          }}>
          Next ›
        </button>

        {canGenerate && (
          <button onClick={handleGenerate} disabled={loading} style={{
            flex:1,padding:'12px 8px',borderRadius:50,border:'none',
            background:loading?'#eee':'linear-gradient(135deg,var(--primary),var(--accent))',
            color:loading?'#aaa':'white',opacity:loading?0.6:1,
            fontWeight:800,fontSize:14,cursor:loading?'not-allowed':'pointer',fontFamily:'Nunito,sans-serif',
            boxShadow:loading?'none':'0 4px 16px var(--primary,#ff6b6b)33',
          }}>
            ✨ AI Level
          </button>
        )}
      </div>
    </div>
  )
}
