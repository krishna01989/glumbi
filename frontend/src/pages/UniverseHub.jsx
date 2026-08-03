import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { getWorld } from './hubWorlds'
import { ThemedZoneVisual, ThemedPlanetVisual } from './themeVisuals'
import { ThemeBackground } from './hubThemeBackgrounds'

// ── Data ──────────────────────────────────────────────────────────────────────
const UNIVERSE = [
  {
    id: 'stories', name: 'Story World', emoji: '🌌', color: '#9d8fff', coreColor: '#c8b8ff',
    desc: 'Create stories, read books and grow as a writer!',
    planets: [
      { id: 'stories',   name: 'Stories',       emoji: '📖', path: 'stories',           featureKey: 'story',            desc: 'Create AI stories and listen to them come alive!',      hi: '#e8deff', mid: '#7c6fcd', lo: '#120a40', hasRing: false },
      { id: 'readquiz',  name: 'Read & Quiz',   emoji: '📚', path: 'readquiz',          featureKey: 'read-quiz',        desc: 'Read books and test your knowledge with quizzes!',      hi: '#d0c0ff', mid: '#5a4aad', lo: '#0e0838', hasRing: true  },
      { id: 'mywriting', name: 'My Writing',    emoji: '✍️', path: 'mywriting',         featureKey: 'writing-coach',    desc: 'Write stories with AI coaching and feedback!',          hi: '#b8a8f5', mid: '#4830b8', lo: '#09062e', hasRing: false },
      { id: 'journal',   name: 'Journal',       emoji: '📝', path: 'journal',           featureKey: null,               desc: 'Keep a diary of your thoughts every single day!',       hi: '#a090e8', mid: '#3820a8', lo: '#060420', hasRing: false },
    ],
  },
  {
    id: 'curiosity', name: 'Curiosity Corner', emoji: '🔭', color: '#2dd4a0', coreColor: '#80ffcc',
    desc: 'Ask questions, solve riddles and explore adventures!',
    planets: [
      { id: 'curiosity',  name: 'Curiosity',   emoji: '🔍', path: 'curiosity',          featureKey: 'curiosity',        desc: 'Ask anything and get a smart fun answer instantly!',    hi: '#aeffdd', mid: '#2cb67d', lo: '#083828', hasRing: false },
      { id: 'activities', name: 'Activities',  emoji: '🎯', path: 'activities',         featureKey: 'activity',         desc: 'Fun learning activities made just for you!',            hi: '#80ffc0', mid: '#1a9060', lo: '#042818', hasRing: true  },
      { id: 'riddle',     name: 'Riddles',     emoji: '🧩', path: 'riddle',             featureKey: 'riddle',           desc: 'Solve tricky riddles and brain-busting teasers!',       hi: '#60e8a8', mid: '#147050', lo: '#021810', hasRing: false },
      { id: 'maze',       name: 'Maze',        emoji: '🌀', path: 'maze',               featureKey: 'maze',             desc: 'Navigate exciting mazes and challenge your mind!',      hi: '#40d898', mid: '#0e5840', lo: '#010e08', hasRing: false },
    ],
  },
  {
    id: 'play', name: 'Play Zone', emoji: '🎮', color: '#f06aab', coreColor: '#ffb0d8',
    desc: 'Memory games, flashcards and words of the day!',
    planets: [
      { id: 'match',      name: 'Memory Match', emoji: '🎴', path: 'memory/match',      featureKey: 'memory-flashcards', desc: 'Flip cards and match pairs to train your memory!',      hi: '#ffddf0', mid: '#e05d9a', lo: '#580830', hasRing: true  },
      { id: 'flashcards', name: 'Flashcards',   emoji: '📇', path: 'memory/flashcards', featureKey: 'memory-flashcards', desc: 'Study words and facts with interactive flashcards!',    hi: '#ffaacc', mid: '#c03878', lo: '#400620', hasRing: false },
      { id: 'wordofday',  name: 'Word of Day',  emoji: '🧠', path: 'memory/wordofday',  featureKey: 'memory-flashcards', desc: 'Discover a brand new exciting word every day!',         hi: '#ff88bb', mid: '#a02060', lo: '#280412', hasRing: false },
    ],
  },
  {
    id: 'studio', name: 'Art Studio', emoji: '🎨', color: '#f4a261', coreColor: '#ffd08a',
    desc: 'Draw, animate and create anything you imagine!',
    planets: [
      { id: 'draw',     name: 'Draw',           emoji: '🎨', path: 'draw',              featureKey: 'draw',              desc: 'Create amazing digital artwork with every colour!',      hi: '#ffecc0', mid: '#f4a261', lo: '#6a2c00', hasRing: false },
      { id: 'flipbook', name: 'Flipbook',        emoji: '🖼️', path: 'flipbook',          featureKey: 'flipbook',          desc: 'Bring drawings to life with frame-by-frame animation!', hi: '#ffe090', mid: '#d4820a', lo: '#4a2000', hasRing: true  },
      { id: 'learn',    name: 'Learn to Write',  emoji: '✏️', path: 'learn',             featureKey: 'learn-validate',    desc: 'Practice writing letters and words perfectly!',         hi: '#ffc860', mid: '#b46000', lo: '#301000', hasRing: false },
    ],
  },
]

const RECENT_KEY = 'glm_recent_hub_'
const RECENT_LIMIT = 5

// ── Styles ────────────────────────────────────────────────────────────────────
let stylesInjected = false
function injectStyles() {
  if (stylesInjected) return
  stylesInjected = true
  const s = document.createElement('style')
  s.textContent = `
    @keyframes hub-twinkle      { 0%,100%{opacity:.06} 50%{opacity:.8} }
    @keyframes hub-nebula       { 0%,100%{transform:scale(1) rotate(0deg);opacity:.15} 50%{transform:scale(1.1) rotate(8deg);opacity:.23} }
    @keyframes hub-glow-pulse   { 0%,100%{opacity:.45} 50%{opacity:.82} }
    @keyframes hub-arm-spin     { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    @keyframes hub-view-in      { from{opacity:0;transform:scale(.97)} to{opacity:1;transform:scale(1)} }
    @keyframes hub-label-in     { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
    @keyframes hub-recent-in    { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
    @keyframes hub-sun-pulse    { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
    @keyframes hub-bob-planet   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
    @keyframes hub-rise         { 0%{transform:translateY(0);opacity:0} 8%{opacity:.85} 85%{opacity:.65} 100%{transform:translateY(-108vh);opacity:0} }
    @keyframes hub-fall         { 0%{transform:translateY(-4vh) rotate(0deg);opacity:0} 8%{opacity:.8} 88%{opacity:.55} 100%{transform:translateY(110vh) rotate(360deg);opacity:0} }
    @keyframes hub-fall-straight{ 0%{transform:translateY(-4vh);opacity:0} 8%{opacity:.7} 88%{opacity:.45} 100%{transform:translateY(110vh);opacity:0} }
    @keyframes hub-drift        { 0%{transform:translateX(-15%);opacity:0} 8%{opacity:.6} 88%{opacity:.4} 100%{transform:translateX(115%);opacity:0} }
    @keyframes hub-firefly      { 0%,100%{transform:translate(0,0)} 25%{transform:translate(10px,-14px)} 50%{transform:translate(-8px,10px)} 75%{transform:translate(12px,6px)} }
  `
  document.head.appendChild(s)
}

// ── World Particles ───────────────────────────────────────────────────────────
function WorldParticles({ world, count }) {
  const { type, colors } = world.particles
  const items = Array.from({ length: count }, (_, i) => ({
    x:   (i * 1373 + 7)  % 100,
    y:   (i * 2741 + 13) % 100,
    s:   i % 14 === 0 ? 2.4 : i % 5 === 0 ? 1.6 : 1,
    d:   (i * 0.21) % 7,
    dur: 1.8 + (i % 5) * 0.7,
    col: colors[i % colors.length],
    r:   (i * 47) % 360,
  }))

  const wrap = (children) => (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {children}
    </div>
  )

  if (type === 'star') return wrap(items.map((s, i) => (
    <div key={i} style={{
      position: 'absolute', left: `${s.x}%`, top: `${s.y}%`,
      width: s.s, height: s.s, borderRadius: '50%', background: 'white',
      animation: `hub-twinkle ${s.dur}s ${s.d}s ease-in-out infinite`,
    }} />
  )))

  if (type === 'ember') return wrap(items.map((s, i) => (
    <div key={i} style={{
      position: 'absolute', left: `${s.x}%`, bottom: `${s.y * 0.4}%`,
      width: s.s * 1.6, height: s.s * 1.6, borderRadius: '50%',
      background: s.col, boxShadow: `0 0 ${s.s * 3}px ${s.col}`,
      animation: `hub-rise ${3 + (i % 5) * 1.5}s ${s.d}s ease-in infinite`,
    }} />
  )))

  if (type === 'firefly') return wrap(items.map((s, i) => (
    <div key={i} style={{
      position: 'absolute', left: `${s.x}%`, top: `${s.y}%`,
      width: s.s * 2.2, height: s.s * 2.2, borderRadius: '50%',
      background: s.col, boxShadow: `0 0 ${s.s * 5}px ${s.col}`,
      animation: `hub-firefly ${4 + (i%4)*2}s ${s.d}s ease-in-out infinite, hub-twinkle ${s.dur * 1.4}s ${s.d}s ease-in-out infinite`,
    }} />
  )))

  if (type === 'bubble') {
    return wrap(items.map((s, i) => {
      const sz = 4 + (i % 5) * 3
      return (
        <div key={i} style={{
          position: 'absolute', left: `${s.x}%`, bottom: `${s.y * 0.5}%`,
          width: sz, height: sz, borderRadius: '50%',
          border: `1.5px solid ${s.col}`,
          background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.22) 0%, transparent 60%)',
          animation: `hub-rise ${4 + (i%6)*2}s ${s.d}s ease-in infinite`,
        }} />
      )
    }))
  }

  if (type === 'leaf') return wrap(items.map((s, i) => (
    <div key={i} style={{
      position: 'absolute', left: `${s.x}%`, top: `-3%`,
      width: 8 + (i%3)*4, height: 4 + (i%2)*2, borderRadius: '50%',
      background: s.col, transform: `rotate(${s.r}deg)`,
      animation: `hub-fall ${5 + (i%5)*2}s ${s.d}s ease-in infinite`,
    }} />
  )))

  if (type === 'sprinkle') return wrap(items.map((s, i) => (
    <div key={i} style={{
      position: 'absolute', left: `${s.x}%`, top: `-3%`,
      width: 2 + (i%2), height: 7 + (i%3)*2, borderRadius: 2,
      background: s.col, transform: `rotate(${s.r}deg)`,
      animation: `hub-fall ${3 + (i%4)*1.5}s ${s.d}s ease-in infinite`,
    }} />
  )))

  if (type === 'petal') return wrap(items.map((s, i) => (
    <div key={i} style={{
      position: 'absolute', left: `${s.x}%`, top: `-3%`,
      width: 6 + (i%3)*3, height: 4 + (i%2)*2, borderRadius: '50%',
      background: s.col, opacity: 0.65 + (i%3)*0.12,
      animation: `hub-fall ${5 + (i%5)*2}s ${s.d}s ease-in-out infinite`,
    }} />
  )))

  if (type === 'snowflake') return wrap(items.map((s, i) => {
    const sz = 2 + (i%4)*1.5
    return (
      <div key={i} style={{
        position: 'absolute', left: `${s.x}%`, top: `-3%`,
        width: sz, height: sz, borderRadius: '50%', background: s.col,
        animation: `hub-fall-straight ${6 + (i%5)*2}s ${s.d}s linear infinite`,
      }} />
    )
  }))

  if (type === 'spark') return wrap(items.map((s, i) => (
    <div key={i} style={{
      position: 'absolute', left: `${s.x}%`, bottom: `${s.y * 0.55}%`,
      width: s.s * 1.6, height: s.s * 1.6, borderRadius: '50%',
      background: s.col, boxShadow: `0 0 ${s.s * 4}px ${s.col}`,
      animation: `hub-rise ${2 + (i%4)*1.2}s ${s.d}s ease-out infinite, hub-twinkle ${s.dur}s ${s.d*0.5}s ease-in-out infinite`,
    }} />
  )))

  if (type === 'cloud') return wrap(items.map((s, i) => (
    <div key={i} style={{
      position: 'absolute', left: `-10%`, top: `${s.y}%`,
      width: 40 + (i%5)*28, height: 18 + (i%4)*10, borderRadius: 30,
      background: s.col, filter: 'blur(5px)',
      animation: `hub-drift ${22 + (i%5)*8}s ${s.d * 2}s linear infinite`,
    }} />
  )))

  if (type === 'geometric') return wrap(items.map((s, i) => (
    <div key={i} style={{
      position: 'absolute', left: `${s.x}%`, top: `-3%`,
      width: 5 + (i%4)*3, height: 5 + (i%4)*3,
      borderRadius: i%3===0 ? '50%' : i%3===1 ? '0' : '2px',
      background: s.col, opacity: 0.55 + (i%3)*.15,
      animation: `hub-fall ${4 + (i%5)*2}s ${s.d}s ease-in infinite`,
    }} />
  )))

  if (type === 'raindrop') return wrap(items.map((s, i) => (
    <div key={i} style={{
      position: 'absolute', left: `${s.x}%`, top: `-5%`,
      width: 1, height: 8 + (i%4)*3, borderRadius: 1,
      background: s.col, transform: `rotate(${5 + (i%3)*5}deg)`,
      animation: `hub-fall-straight ${0.4 + (i%4)*0.25}s ${s.d * 0.3}s linear infinite`,
    }} />
  )))

  if (type === 'pixel') return wrap(items.map((s, i) => {
    const sz = 2 + (i%4)
    return (
      <div key={i} style={{
        position: 'absolute', left: `${s.x}%`, top: `${s.y}%`,
        width: sz, height: sz,
        background: s.col,
        animation: `hub-twinkle ${s.dur}s ${s.d}s ease-in-out infinite`,
      }} />
    )
  }))

  // fallback: stars
  return wrap(items.map((s, i) => (
    <div key={i} style={{
      position: 'absolute', left: `${s.x}%`, top: `${s.y}%`,
      width: s.s, height: s.s, borderRadius: '50%', background: 'white',
      animation: `hub-twinkle ${s.dur}s ${s.d}s ease-in-out infinite`,
    }} />
  )))
}

// ── World Ambient ─────────────────────────────────────────────────────────────
function WorldAmbient({ world, showSilhouette = true }) {
  const [c0, c1, c2] = world.ambient.colors || ['#9d8fff55', '#40c4ff44', '#9d8fff44']
  const blobs = [
    { x: 4,  y: 5,  w: 400, h: 260, c: c0, d: 0,  t: 20 },
    { x: 65, y: 2,  w: 310, h: 210, c: c1, d: 5,  t: 24 },
    { x: 0,  y: 60, w: 280, h: 230, c: c2, d: 9,  t: 18 },
    { x: 70, y: 62, w: 330, h: 220, c: c1, d: 3,  t: 26 },
  ]
  const atype = world.ambient.type
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {blobs.map((b, i) => (
        <div key={i} style={{
          position: 'absolute', left: `${b.x}%`, top: `${b.y}%`,
          width: b.w, height: b.h, borderRadius: '50%',
          background: b.c, filter: 'blur(72px)', opacity: 0,
          animation: `hub-nebula ${b.t}s ${b.d}s ease-in-out infinite`,
        }} />
      ))}
      {showSilhouette && atype === 'trees' && (
        <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '22%', opacity: 0.7 }}
          viewBox="0 0 1000 180" preserveAspectRatio="none">
          {Array.from({ length: 18 }, (_, i) => {
            const x = (i / 18) * 980 + (i%3)*10
            const ht = 70 + (i%4)*35
            const w  = 38 + (i%3)*18
            return <polygon key={i} points={`${x},180 ${x+w/2},${180-ht} ${x+w},180`} fill="#07150a" />
          })}
        </svg>
      )}
      {showSilhouette && atype === 'hills' && (
        <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '20%', opacity: 0.75 }}
          viewBox="0 0 1000 140" preserveAspectRatio="none">
          <path d="M0 140 Q200 18 400 72 Q600 130 800 35 Q900 8 1000 55 L1000 140 Z" fill="#150600" />
          <path d="M0 140 Q150 55 300 90 Q500 140 700 72 Q850 38 1000 82 L1000 140 Z" fill="#250c00" />
        </svg>
      )}
      {showSilhouette && atype === 'seabed' && (
        <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '20%', opacity: 0.75 }}
          viewBox="0 0 1000 140" preserveAspectRatio="none">
          <path d="M0 140 Q100 85 200 105 Q350 125 450 72 Q550 35 700 96 Q850 132 1000 65 L1000 140 Z" fill="#01101e" />
          {[90,240,400,560,720,870].map((x, i) => (
            <ellipse key={i} cx={x} cy={90+(i%3)*12} rx={14+(i%3)*7} ry={22+(i%4)*9} fill="#022a48" />
          ))}
        </svg>
      )}
      {showSilhouette && atype === 'dramatic' && (
        <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '28%', opacity: 0.8 }}
          viewBox="0 0 1000 200" preserveAspectRatio="none">
          {[
            {x:0,w:60,h:120},{x:70,w:40,h:155},{x:120,w:80,h:95},{x:210,w:50,h:175},
            {x:270,w:70,h:125},{x:350,w:45,h:185},{x:405,w:90,h:105},{x:505,w:55,h:165},
            {x:570,w:65,h:135},{x:645,w:40,h:155},{x:695,w:85,h:115},{x:790,w:50,h:170},
            {x:850,w:70,h:130},{x:930,w:60,h:150},
          ].map((b, i) => (
            <rect key={i} x={b.x} y={200-b.h} width={b.w} height={b.h} fill="#060000" />
          ))}
        </svg>
      )}
    </div>
  )
}

// ── Galaxy SVG (kept for space world) ─────────────────────────────────────────
function GalaxyVisual({ color, coreColor, size = 110 }) {
  const id = `g${color.replace('#', '')}`
  const h = size / 2
  return (
    <div style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}>
      <div style={{
        position: 'absolute', inset: -size * .2, borderRadius: '50%',
        background: `radial-gradient(circle, ${color}35 0%, transparent 66%)`,
        animation: 'hub-glow-pulse 3.5s ease-in-out infinite',
      }} />
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
        style={{ position: 'relative', zIndex: 1, overflow: 'visible' }}>
        <defs>
          <radialGradient id={`${id}-h`} cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor={color}     stopOpacity=".52" />
            <stop offset="100%" stopColor={color}     stopOpacity="0"   />
          </radialGradient>
          <radialGradient id={`${id}-c`} cx="37%" cy="33%" r="66%">
            <stop offset="0%"   stopColor="white"     stopOpacity="1"   />
            <stop offset="28%"  stopColor={coreColor} stopOpacity="1"   />
            <stop offset="100%" stopColor={color}     stopOpacity=".3"  />
          </radialGradient>
          <filter id={`${id}-b1`}><feGaussianBlur stdDeviation="5"  /></filter>
          <filter id={`${id}-b2`}><feGaussianBlur stdDeviation="2.5"/></filter>
          <filter id={`${id}-b3`}><feGaussianBlur stdDeviation="9"  /></filter>
          <filter id={`${id}-gw`}>
            <feGaussianBlur stdDeviation="3.5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <ellipse cx={h} cy={h} rx={h*.87} ry={h*.29} fill={`url(#${id}-h)`} filter={`url(#${id}-b3)`} />
        <g style={{ transformOrigin:`${h}px ${h}px`, animation:'hub-arm-spin 60s linear infinite' }}>
          <ellipse cx={h} cy={h} rx={h*.81} ry={h*.18} fill={color} opacity=".38" filter={`url(#${id}-b1)`} />
          <ellipse cx={h} cy={h} rx={h*.69} ry={h*.15} fill={color} opacity=".28" transform={`rotate(58 ${h} ${h})`}  filter={`url(#${id}-b1)`} />
          <ellipse cx={h} cy={h} rx={h*.55} ry={h*.13} fill={color} opacity=".20" transform={`rotate(116 ${h} ${h})`} filter={`url(#${id}-b2)`} />
          <ellipse cx={h} cy={h} rx={h*.40} ry={h*.10} fill={coreColor} opacity=".17" transform={`rotate(174 ${h} ${h})`} filter={`url(#${id}-b2)`} />
          {Array.from({ length: 18 }, (_, i) => {
            const a = (i * 99.1) * Math.PI / 180
            const r = (.2 + (i % 5) * .08) * h
            return <circle key={i} cx={h + Math.cos(a)*r} cy={h + Math.sin(a)*r*.35}
              r={i%5===0?1.2:.65} fill="white" opacity={.18+(i%4)*.14} />
          })}
        </g>
        <ellipse cx={h} cy={h} rx={h*.25} ry={h*.09} fill={coreColor} opacity=".6"  filter={`url(#${id}-b2)`} />
        <circle  cx={h} cy={h} r={h*.12}  fill={`url(#${id}-c)`}  filter={`url(#${id}-gw)`} />
        <circle  cx={h} cy={h} r={h*.05}  fill="white" opacity=".97" />
      </svg>
    </div>
  )
}

// ── World Zone Visual ─────────────────────────────────────────────────────────
function WorldZoneVisual({ zone, world, size = 110 }) {
  const { zoneStyle } = world
  const { color, coreColor } = zone
  const h = size / 2
  const gid = `wz${zone.id}`

  if (zoneStyle === 'galaxy') {
    return <GalaxyVisual color={color} coreColor={coreColor} size={size} />
  }

  const glowStyle = (glowColor) => ({
    position: 'absolute', inset: -size * 0.2, borderRadius: '50%',
    background: `radial-gradient(circle, ${glowColor}38 0%, transparent 66%)`,
    animation: 'hub-glow-pulse 3.5s ease-in-out infinite',
  })

  // ── Forest clearing ────────────────────────────────────────────────────────
  if (zoneStyle === 'clearing') {
    return (
      <div style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}>
        <div style={glowStyle('#4caf50')} />
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
          style={{ position: 'relative', zIndex: 1, overflow: 'visible' }}>
          <defs>
            <radialGradient id={`${gid}-bg`} cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#c8e6a0" stopOpacity=".95" />
              <stop offset="40%"  stopColor="#6abf69" stopOpacity=".9"  />
              <stop offset="75%"  stopColor="#2d7a3a" stopOpacity=".95" />
              <stop offset="100%" stopColor="#0a1e0e" stopOpacity="1"   />
            </radialGradient>
            <radialGradient id={`${gid}-sun`} cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="white"   stopOpacity=".95" />
              <stop offset="40%"  stopColor="#fff9c4" stopOpacity=".8"  />
              <stop offset="100%" stopColor="#c8e6a0" stopOpacity="0"   />
            </radialGradient>
            <filter id={`${gid}-b`}><feGaussianBlur stdDeviation="3"/></filter>
          </defs>
          <circle cx={h} cy={h} r={h-1} fill={`url(#${gid}-bg)`} />
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2
            const r = h * 0.62
            const cx2 = h + Math.cos(a) * r, cy2 = h + Math.sin(a) * r
            const tw = h * 0.09, th = h * 0.17
            return (
              <polygon key={i}
                points={`${cx2},${cy2-th} ${cx2-tw},${cy2+th*.3} ${cx2+tw},${cy2+th*.3}`}
                fill="#1a4820" opacity=".95"
                transform={`rotate(${(i/8)*360} ${cx2} ${cy2})`}
              />
            )
          })}
          <circle cx={h} cy={h} r={h*.24} fill={`url(#${gid}-sun)`} filter={`url(#${gid}-b)`} />
          <circle cx={h} cy={h} r={h*.07} fill="white" opacity=".92" />
        </svg>
      </div>
    )
  }

  // ── Ocean reef ─────────────────────────────────────────────────────────────
  if (zoneStyle === 'reef') {
    return (
      <div style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}>
        <div style={glowStyle(color)} />
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
          style={{ position: 'relative', zIndex: 1, overflow: 'visible' }}>
          <defs>
            <radialGradient id={`${gid}-bg`} cx="50%" cy="70%" r="65%">
              <stop offset="0%"   stopColor="#0096c7" stopOpacity=".55" />
              <stop offset="100%" stopColor="#023e8a" stopOpacity=".98" />
            </radialGradient>
            <filter id={`${gid}-b`}><feGaussianBlur stdDeviation="2.5"/></filter>
          </defs>
          <circle cx={h} cy={h} r={h-1} fill={`url(#${gid}-bg)`} />
          <ellipse cx={h} cy={h*1.58} rx={h*.68} ry={h*.22} fill="#ffe082" opacity=".28" filter={`url(#${gid}-b)`} />
          {/* Fan corals */}
          <path d={`M ${h*.42} ${h*1.38} Q ${h*.02} ${h*.32} ${h*.52} ${h*.14}`}
            stroke="#ff80ab" strokeWidth={h*.056} fill="none" opacity=".88" strokeLinecap="round"/>
          <path d={`M ${h*.42} ${h*1.38} Q ${h*.22} ${h*.62} ${h*.72} ${h*.3}`}
            stroke="#f48fb1" strokeWidth={h*.038} fill="none" opacity=".72" strokeLinecap="round"/>
          <path d={`M ${h*1.58} ${h*1.38} Q ${h*1.98} ${h*.32} ${h*1.48} ${h*.14}`}
            stroke="#4dd0e1" strokeWidth={h*.056} fill="none" opacity=".88" strokeLinecap="round"/>
          <path d={`M ${h*1.58} ${h*1.38} Q ${h*1.78} ${h*.62} ${h*1.28} ${h*.3}`}
            stroke="#80deea" strokeWidth={h*.038} fill="none" opacity=".72" strokeLinecap="round"/>
          {/* Center tube coral */}
          <rect x={h*.9} y={h*.48} width={h*.16} height={h*.9} rx={h*.08} fill={coreColor} opacity=".82"/>
          <circle cx={h} cy={h*.48} r={h*.1} fill={coreColor} opacity=".92"/>
          {/* Branch coral */}
          <path d={`M ${h} ${h*1.28} L ${h} ${h*.88} L ${h*.8} ${h*.54} M ${h} ${h*.88} L ${h*1.2} ${h*.54}`}
            stroke="#ffe57f" strokeWidth={h*.032} fill="none" opacity=".78" strokeLinecap="round"/>
          {/* Bubbles */}
          {[.32,.58,.74,.9,1.18,1.44,1.68].map((bx, i) => (
            <circle key={i} cx={h*bx} cy={h*(0.26+i*.17)} r={h*.026}
              stroke="rgba(180,240,255,0.72)" strokeWidth={h*.018} fill="none" opacity=".62"/>
          ))}
          <circle cx={h} cy={h*.46} r={h*.08} fill="white" opacity=".55" filter={`url(#${gid}-b)`}/>
        </svg>
      </div>
    )
  }

  // ── Candy island ───────────────────────────────────────────────────────────
  if (zoneStyle === 'island') {
    return (
      <div style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}>
        <div style={glowStyle(color)} />
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
          style={{ position: 'relative', zIndex: 1, overflow: 'visible' }}>
          <defs>
            <radialGradient id={`${gid}-bg`} cx="38%" cy="28%" r="72%">
              <stop offset="0%"   stopColor="#ff80d8" />
              <stop offset="48%"  stopColor={color}   />
              <stop offset="100%" stopColor="#5c0080"  />
            </radialGradient>
            <radialGradient id={`${gid}-top`} cx="34%" cy="28%" r="68%">
              <stop offset="0%"  stopColor="white" stopOpacity=".58" />
              <stop offset="100%" stopColor="white" stopOpacity="0"  />
            </radialGradient>
            <filter id={`${gid}-b`}><feGaussianBlur stdDeviation="2"/></filter>
          </defs>
          <circle cx={h} cy={h} r={h-1} fill={`url(#${gid}-bg)`} />
          <circle cx={h} cy={h} r={h-1} fill={`url(#${gid}-top)`} />
          {[0,60,120,180,240,300].map((angle, i) => (
            <line key={i}
              x1={h + Math.cos(angle*Math.PI/180)*h*.2} y1={h + Math.sin(angle*Math.PI/180)*h*.2}
              x2={h + Math.cos(angle*Math.PI/180)*h*.88} y2={h + Math.sin(angle*Math.PI/180)*h*.88}
              stroke="rgba(255,255,255,0.16)" strokeWidth={h*.09}
            />
          ))}
          {[{x:.36,y:.26,c:'#ffd600'},{x:.72,y:.32,c:'#00e5ff'},{x:.56,y:.68,c:'#ff6b6b'},
            {x:.25,y:.58,c:'#b967ff'},{x:.76,y:.72,c:'#ffd600'},{x:.46,y:.82,c:'#00e5ff'}].map((d, i) => (
            <rect key={i} x={h*d.x*2-h*.04} y={h*d.y*2-h*.015} width={h*.09} height={h*.032}
              rx={h*.016} fill={d.c} opacity=".92"
              transform={`rotate(${i*37} ${h*d.x*2} ${h*d.y*2})`} />
          ))}
          {/* Lollipop */}
          <line x1={h*1.56} y1={h*.87} x2={h*1.72} y2={h*1.42} stroke="#ff6ec7" strokeWidth={h*.042} strokeLinecap="round"/>
          <circle cx={h*1.5} cy={h*.8} r={h*.14} fill="#ff6ec7"/>
          <circle cx={h*1.5} cy={h*.8} r={h*.08} fill="white" opacity=".48"/>
          <circle cx={h*.72} cy={h*.54} r={h*.08} fill="white" opacity=".48" filter={`url(#${gid}-b)`}/>
        </svg>
      </div>
    )
  }

  // ── Warm meadow ───────────────────────────────────────────────────────────
  if (zoneStyle === 'meadow') {
    return (
      <div style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}>
        <div style={glowStyle(color)} />
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
          style={{ position: 'relative', zIndex: 1, overflow: 'visible' }}>
          <defs>
            <radialGradient id={`${gid}-sky`} cx="50%" cy="28%" r="72%">
              <stop offset="0%"   stopColor="#ffa040" />
              <stop offset="55%"  stopColor={color}   />
              <stop offset="100%" stopColor="#3d0800"  />
            </radialGradient>
            <radialGradient id={`${gid}-sun`} cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#fff9c4" stopOpacity=".92" />
              <stop offset="100%" stopColor="#ffa040"  stopOpacity="0"  />
            </radialGradient>
            <clipPath id={`${gid}-clip`}><circle cx={h} cy={h} r={h-1}/></clipPath>
            <filter id={`${gid}-b`}><feGaussianBlur stdDeviation="3.5"/></filter>
          </defs>
          <circle cx={h} cy={h} r={h-1} fill={`url(#${gid}-sky)`} />
          <circle cx={h} cy={h*.55} r={h*.34} fill={`url(#${gid}-sun)`} filter={`url(#${gid}-b)`}/>
          <circle cx={h} cy={h*.55} r={h*.1} fill="white" opacity=".92"/>
          <path d={`M 0 ${h*1.52} Q ${h*.5} ${h*.72} ${h} ${h*.96} Q ${h*1.5} ${h*1.22} ${size} ${h*.82} L ${size} ${size*2} L 0 ${size*2} Z`}
            fill="#1a4d10" clipPath={`url(#${gid}-clip)`}/>
          <path d={`M 0 ${h*1.72} Q ${h*.6} ${h*1.14} ${h} ${h*1.34} Q ${h*1.4} ${h*1.52} ${size} ${h*1.12} L ${size} ${size*2} L 0 ${size*2} Z`}
            fill="#2d6e18" clipPath={`url(#${gid}-clip)`}/>
          <path d={`M 0 ${h*1.88} Q ${h*.5} ${h*1.52} ${h} ${h*1.68} Q ${h*1.5} ${h*1.82} ${size} ${h*1.52} L ${size} ${size*2} L 0 ${size*2} Z`}
            fill="#4a9428" clipPath={`url(#${gid}-clip)`}/>
          <polygon points={`${h*.26},${h*.9} ${h*.14},${h*1.28} ${h*.38},${h*1.28}`} fill="#0a2010" opacity=".82" clipPath={`url(#${gid}-clip)`}/>
          <polygon points={`${h*1.76},${h*.77} ${h*1.62},${h*1.18} ${h*1.9},${h*1.18}`} fill="#0a2010" opacity=".82" clipPath={`url(#${gid}-clip)`}/>
        </svg>
      </div>
    )
  }

  // ── Magical realm ──────────────────────────────────────────────────────────
  if (zoneStyle === 'realm') {
    return (
      <div style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}>
        <div style={glowStyle(color)} />
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
          style={{ position: 'relative', zIndex: 1, overflow: 'visible' }}>
          <defs>
            <radialGradient id={`${gid}-bg`} cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#e040fb" stopOpacity=".62" />
              <stop offset="55%"  stopColor={color}   stopOpacity=".5"  />
              <stop offset="100%" stopColor="#1a0030"  stopOpacity="1"   />
            </radialGradient>
            <radialGradient id={`${gid}-core`} cx="35%" cy="32%" r="68%">
              <stop offset="0%"   stopColor="white"    stopOpacity="1"  />
              <stop offset="30%"  stopColor={coreColor} stopOpacity="1"  />
              <stop offset="100%" stopColor={color}    stopOpacity=".4"  />
            </radialGradient>
            <filter id={`${gid}-gw`}>
              <feGaussianBlur stdDeviation="2.5" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <circle cx={h} cy={h} r={h-1} fill={`url(#${gid}-bg)`} />
          <g style={{ transformOrigin:`${h}px ${h}px`, animation:'hub-arm-spin 20s linear infinite' }}>
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i/8)*Math.PI*2
              const r1 = h*.72, r2 = h*.88
              const x1 = h+Math.cos(a)*r1, y1 = h+Math.sin(a)*r1
              const x2 = h+Math.cos(a)*r2, y2 = h+Math.sin(a)*r2
              const a2 = a + Math.PI/8
              const mx = h+Math.cos(a2)*r1*.88, my = h+Math.sin(a2)*r1*.88
              return <path key={i} d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
                stroke={color} strokeWidth={h*.052} fill="none" opacity=".58" strokeLinecap="round"/>
            })}
          </g>
          <g style={{ transformOrigin:`${h}px ${h}px`, animation:'hub-arm-spin 14s linear infinite reverse' }}>
            {Array.from({ length: 6 }, (_, i) => {
              const a = (i/6)*Math.PI*2
              return <line key={i}
                x1={h+Math.cos(a)*h*.38} y1={h+Math.sin(a)*h*.38}
                x2={h+Math.cos(a)*h*.56} y2={h+Math.sin(a)*h*.56}
                stroke={coreColor} strokeWidth={h*.036} opacity=".68" strokeLinecap="round"/>
            })}
          </g>
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i/8)*Math.PI*2
            return <circle key={i}
              cx={h+Math.cos(a)*h*.92} cy={h+Math.sin(a)*h*.92}
              r={h*.04} fill={coreColor} opacity=".82" filter={`url(#${gid}-gw)`}/>
          })}
          <circle cx={h} cy={h} r={h*.22} fill={`url(#${gid}-core)`} filter={`url(#${gid}-gw)`}/>
          <circle cx={h} cy={h} r={h*.07} fill="white" opacity=".96"/>
        </svg>
      </div>
    )
  }

  // ── Adventure fortress ─────────────────────────────────────────────────────
  if (zoneStyle === 'fortress') {
    return (
      <div style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}>
        <div style={glowStyle(color)} />
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
          style={{ position: 'relative', zIndex: 1, overflow: 'visible' }}>
          <defs>
            <radialGradient id={`${gid}-bg`} cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor={color}    stopOpacity=".38" />
              <stop offset="62%"  stopColor="#2d0600"  stopOpacity=".82" />
              <stop offset="100%" stopColor="#0d0000"   stopOpacity="1"   />
            </radialGradient>
            <radialGradient id={`${gid}-glow`} cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor={color}     stopOpacity=".78" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
            <filter id={`${gid}-b`}><feGaussianBlur stdDeviation="4"/></filter>
            <clipPath id={`${gid}-clip`}><circle cx={h} cy={h} r={h-1}/></clipPath>
          </defs>
          <circle cx={h} cy={h} r={h-1} fill={`url(#${gid}-bg)`} />
          <circle cx={h} cy={h*.58} r={h*.42} fill={`url(#${gid}-glow)`} filter={`url(#${gid}-b)`} opacity=".72"/>
          {/* Main tower */}
          <rect x={h*.72} y={h*.34} width={h*.56} height={h*1.32} fill="#0a0000" clipPath={`url(#${gid}-clip)`}/>
          {[.72,.86,1.0,1.14].map((bx, i) => (
            <rect key={i} x={h*bx} y={h*.18} width={h*.1} height={h*.19} fill="#0a0000" clipPath={`url(#${gid}-clip)`}/>
          ))}
          {/* Side towers */}
          <rect x={h*.34} y={h*.5} width={h*.36} height={h*1.12} fill="#0a0000" clipPath={`url(#${gid}-clip)`}/>
          <rect x={h*1.3} y={h*.5} width={h*.36} height={h*1.12} fill="#0a0000" clipPath={`url(#${gid}-clip)`}/>
          {[.34,.48].map((bx, i) => <rect key={i} x={h*bx} y={h*.34} width={h*.1} height={h*.18} fill="#0a0000" clipPath={`url(#${gid}-clip)`}/>)}
          {[1.3,1.44].map((bx, i) => <rect key={i} x={h*bx} y={h*.34} width={h*.1} height={h*.18} fill="#0a0000" clipPath={`url(#${gid}-clip)`}/>)}
          {/* Gate arch */}
          <path d={`M ${h*.86} ${h*1.66} L ${h*.86} ${h*1.1} Q ${h} ${h*.9} ${h*1.14} ${h*1.1} L ${h*1.14} ${h*1.66} Z`}
            fill={color} opacity=".58" clipPath={`url(#${gid}-clip)`}/>
          {/* Window glow */}
          <circle cx={h} cy={h*.64} r={h*.06} fill={color} opacity=".82" filter={`url(#${gid}-b)`}/>
        </svg>
      </div>
    )
  }

  // ── Cozy nook ──────────────────────────────────────────────────────────────
  if (zoneStyle === 'nook') {
    return (
      <div style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}>
        <div style={glowStyle(color)} />
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
          style={{ position: 'relative', zIndex: 1, overflow: 'visible' }}>
          <defs>
            <radialGradient id={`${gid}-bg`} cx="50%" cy="50%" r="50%">
              <stop offset="0%"  stopColor="#fff9e6" stopOpacity=".22" />
              <stop offset="62%" stopColor="#3d1a00" stopOpacity=".72"  />
              <stop offset="100%" stopColor="#0d0700" stopOpacity="1"   />
            </radialGradient>
            <radialGradient id={`${gid}-glow`} cx="50%" cy="62%" r="50%">
              <stop offset="0%"   stopColor="#ffcc80" stopOpacity=".92"  />
              <stop offset="100%" stopColor="#ff8a65"  stopOpacity="0"   />
            </radialGradient>
            <clipPath id={`${gid}-clip`}><circle cx={h} cy={h} r={h-1}/></clipPath>
            <filter id={`${gid}-b`}><feGaussianBlur stdDeviation="4"/></filter>
            <filter id={`${gid}-b2`}><feGaussianBlur stdDeviation="2"/></filter>
          </defs>
          <circle cx={h} cy={h} r={h-1} fill={`url(#${gid}-bg)`}/>
          <circle cx={h} cy={h*.72} r={h*.46} fill={`url(#${gid}-glow)`} filter={`url(#${gid}-b)`}/>
          <circle cx={h} cy={h*.85} r={h*.66} fill="none" stroke="rgba(255,220,150,0.16)" strokeWidth={h*.032}/>
          {/* Roof */}
          <polygon points={`${h*.2},${h*.92} ${h},${h*.28} ${h*1.8},${h*.92}`} fill="#5d3a1a" clipPath={`url(#${gid}-clip)`}/>
          {/* Chimney */}
          <rect x={h*1.22} y={h*.22} width={h*.2} height={h*.32} rx={h*.032} fill="#4a2c12" clipPath={`url(#${gid}-clip)`}/>
          <circle cx={h*1.32} cy={h*.14} r={h*.06} fill="#aaa" opacity=".28" filter={`url(#${gid}-b2)`}/>
          <circle cx={h*1.38} cy={h*.07} r={h*.04} fill="#aaa" opacity=".18" filter={`url(#${gid}-b2)`}/>
          {/* Walls */}
          <rect x={h*.38} y={h*.9} width={h*1.24} height={h*.76} rx={h*.04} fill="#8b5e3c" clipPath={`url(#${gid}-clip)`}/>
          {/* Window */}
          <rect x={h*.76} y={h*1.0} width={h*.5} height={h*.38} rx={h*.05} fill="#ffcc80" opacity=".92" clipPath={`url(#${gid}-clip)`}/>
          <rect x={h*.98} y={h*1.0} width={h*.06} height={h*.38} fill="#8b5e3c" opacity=".38" clipPath={`url(#${gid}-clip)`}/>
          <rect x={h*.76} y={h*1.17} width={h*.5} height={h*.05} fill="#8b5e3c" opacity=".38" clipPath={`url(#${gid}-clip)`}/>
          {/* Door */}
          <path d={`M ${h*.52} ${h*1.66} L ${h*.52} ${h*1.1} Q ${h*.66} ${h*.95} ${h*.8} ${h*1.1} L ${h*.8} ${h*1.66} Z`}
            fill="#4a2c12" clipPath={`url(#${gid}-clip)`}/>
          {/* Snow on roof */}
          <path d={`M ${h*.2} ${h*.92} Q ${h*.4} ${h*.84} ${h*.6} ${h*.8} Q ${h*.8} ${h*.76} ${h} ${h*.28} Q ${h*1.2} ${h*.76} ${h*1.4} ${h*.8} Q ${h*1.6} ${h*.84} ${h*1.8} ${h*.92}`}
            fill="rgba(255,255,255,0.72)" clipPath={`url(#${gid}-clip)`}/>
          {[{x:.38,y:.36},{x:.64,y:.56},{x:.28,y:.62},{x:.7,y:.26},{x:.54,y:.44}].map((d,i)=>(
            <circle key={i} cx={h*d.x*2} cy={h*d.y*2} r={h*.022} fill="white" opacity=".48"/>
          ))}
        </svg>
      </div>
    )
  }

  // ── Sky cloud island ───────────────────────────────────────────────────────
  if (zoneStyle === 'cloudisland') {
    return (
      <div style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}>
        <div style={glowStyle(color)} />
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
          style={{ position: 'relative', zIndex: 1, overflow: 'visible' }}>
          <defs>
            <radialGradient id={`${gid}-bg`} cx="50%" cy="38%" r="62%">
              <stop offset="0%"   stopColor="#81d4fa" stopOpacity=".52"  />
              <stop offset="62%"  stopColor="#0277bd" stopOpacity=".72"  />
              <stop offset="100%" stopColor="#01579b"  stopOpacity="1"   />
            </radialGradient>
            <radialGradient id={`${gid}-cloud`} cx="38%" cy="28%" r="72%">
              <stop offset="0%"  stopColor="white" stopOpacity=".97" />
              <stop offset="100%" stopColor="#e1f5fe" stopOpacity=".9" />
            </radialGradient>
            <filter id={`${gid}-b`}><feGaussianBlur stdDeviation="2.5"/></filter>
          </defs>
          <circle cx={h} cy={h} r={h-1} fill={`url(#${gid}-bg)`}/>
          {/* Sun rays */}
          {Array.from({length:6},(_,i)=>{
            const a = (i/6)*Math.PI*2-Math.PI/2
            return <line key={i} x1={h+Math.cos(a)*h*.18} y1={h*.44+Math.sin(a)*h*.18}
              x2={h+Math.cos(a)*h*.46} y2={h*.44+Math.sin(a)*h*.46}
              stroke="#fff9c4" strokeWidth={h*.032} opacity=".58" strokeLinecap="round"/>
          })}
          <circle cx={h} cy={h*.44} r={h*.16} fill="#fff9c4" opacity=".9"/>
          {/* Cloud puffs */}
          <circle cx={h*.62} cy={h}     r={h*.28} fill={`url(#${gid}-cloud)`} />
          <circle cx={h}     cy={h*.82} r={h*.32} fill={`url(#${gid}-cloud)`} />
          <circle cx={h*1.38} cy={h}    r={h*.28} fill={`url(#${gid}-cloud)`} />
          <circle cx={h*.76} cy={h*1.08} r={h*.24} fill={`url(#${gid}-cloud)`} />
          <circle cx={h*1.24} cy={h*1.08} r={h*.24} fill={`url(#${gid}-cloud)`} />
          {/* Island base */}
          <ellipse cx={h} cy={h*1.42} rx={h*.42} ry={h*.11} fill="#4caf50" opacity=".82"/>
          <ellipse cx={h} cy={h*1.39} rx={h*.38} ry={h*.07} fill="#66bb6a" opacity=".92"/>
          <circle cx={h*.92} cy={h*.78} r={h*.09} fill="white" opacity=".58" filter={`url(#${gid}-b)`}/>
        </svg>
      </div>
    )
  }

  // ── Abstract burst ─────────────────────────────────────────────────────────
  if (zoneStyle === 'burst') {
    return (
      <div style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}>
        <div style={glowStyle(color)} />
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
          style={{ position: 'relative', zIndex: 1, overflow: 'visible' }}>
          <defs>
            <radialGradient id={`${gid}-bg`} cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#e91e63" stopOpacity=".62" />
              <stop offset="52%"  stopColor="#7c4dff" stopOpacity=".52" />
              <stop offset="100%" stopColor="#0a0010"  stopOpacity="1"  />
            </radialGradient>
            <filter id={`${gid}-b`}><feGaussianBlur stdDeviation="2"/></filter>
          </defs>
          <circle cx={h} cy={h} r={h-1} fill={`url(#${gid}-bg)`}/>
          <g style={{ transformOrigin:`${h}px ${h}px`, animation:'hub-arm-spin 12s linear infinite' }}>
            {['#ff6ec7','#ffd600','#00e5ff','#ff6b6b','#b967ff','#00ff9f','#ff9f00','#00e5ff'].map((c, i) => {
              const a = (i/8)*Math.PI*2
              const spread = Math.PI/16
              const x1 = h+Math.cos(a)*h*.22, y1 = h+Math.sin(a)*h*.22
              const x2 = h+Math.cos(a-spread)*h*.88, y2 = h+Math.sin(a-spread)*h*.88
              const x3 = h+Math.cos(a+spread)*h*.88, y3 = h+Math.sin(a+spread)*h*.88
              return <polygon key={i} points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`} fill={c} opacity=".62"/>
            })}
          </g>
          <g style={{ transformOrigin:`${h}px ${h}px`, animation:'hub-arm-spin 8s linear infinite reverse' }}>
            {['#fff','#ffd600','#fff','#ff6ec7','#fff','#00e5ff'].map((c, i) => {
              const a = (i/6)*Math.PI*2
              const spread = Math.PI/20
              const x1 = h+Math.cos(a)*h*.08, y1 = h+Math.sin(a)*h*.08
              const x2 = h+Math.cos(a-spread)*h*.46, y2 = h+Math.sin(a-spread)*h*.46
              const x3 = h+Math.cos(a+spread)*h*.46, y3 = h+Math.sin(a+spread)*h*.46
              return <polygon key={i} points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`} fill={c} opacity=".72"/>
            })}
          </g>
          <circle cx={h} cy={h} r={h*.12} fill="white" opacity=".96" filter={`url(#${gid}-b)`}/>
          <circle cx={h} cy={h} r={h*.05} fill="white" opacity="1"/>
        </svg>
      </div>
    )
  }

  // Fallback: galaxy
  return <GalaxyVisual color={color} coreColor={coreColor} size={size} />
}

// ── Planet visual ─────────────────────────────────────────────────────────────
function WorldPlanetVisual({ planet, size, world }) {
  const { hi, mid, lo, hasRing } = planet
  const id = `p${planet.id}`
  const c = size / 2
  const zoneStyle = world?.zoneStyle || 'galaxy'

  // Glow wrapper shared by all styles
  const glow = (
    <div style={{
      position: 'absolute', inset: -size * .26, borderRadius: '50%',
      background: `radial-gradient(circle, ${mid}58 0%, ${mid}18 44%, transparent 66%)`,
      filter: 'blur(10px)',
      animation: 'hub-glow-pulse 4s ease-in-out infinite', zIndex: 0,
    }} />
  )

  // ── Space: classic planet sphere (unchanged) ─────────────────────────────
  if (zoneStyle === 'galaxy') {
    return (
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        {glow}
        {hasRing && (
          <div style={{
            position: 'absolute', zIndex: 1,
            width: size * 1.9, height: size * .35,
            left: size * -.45, top: size * .32,
            borderRadius: '50%',
            background: `linear-gradient(90deg, transparent 0%, ${mid}28 15%, ${hi}88 50%, ${mid}28 85%, transparent 100%)`,
            transform: 'rotateX(70deg)',
          }} />
        )}
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
          style={{ position: 'relative', zIndex: 2, overflow: 'visible' }}>
          <defs>
            <radialGradient id={`${id}-s`} cx="34%" cy="27%" r="76%">
              <stop offset="0%"   stopColor={hi}  />
              <stop offset="38%"  stopColor={mid} />
              <stop offset="100%" stopColor={lo}  />
            </radialGradient>
            <radialGradient id={`${id}-sh`} cx="68%" cy="62%" r="50%">
              <stop offset="0%"   stopColor="black" stopOpacity=".46" />
              <stop offset="100%" stopColor="black" stopOpacity="0"   />
            </radialGradient>
            <clipPath id={`${id}-c`}><circle cx={c} cy={c} r={c-1} /></clipPath>
          </defs>
          <circle cx={c} cy={c} r={c-1} fill={`url(#${id}-s)`} />
          <g clipPath={`url(#${id}-c)`}>
            <rect x={0} y={size*.27} width={size} height={size*.07} fill="rgba(255,255,255,.12)" />
            <rect x={0} y={size*.43} width={size} height={size*.04} fill="rgba(0,0,0,.20)"       />
            <rect x={0} y={size*.57} width={size} height={size*.08} fill="rgba(255,255,255,.08)" />
            <rect x={0} y={size*.72} width={size} height={size*.04} fill="rgba(0,0,0,.16)"       />
          </g>
          <circle cx={c} cy={c} r={c-1} fill={`url(#${id}-sh)`} clipPath={`url(#${id}-c)`} />
          <ellipse cx={c*.7} cy={c*.56} rx={c*.25} ry={c*.17} fill="rgba(255,255,255,.25)" clipPath={`url(#${id}-c)`} />
          <circle  cx={c*.64} cy={c*.50} r={c*.08} fill="rgba(255,255,255,.50)"            clipPath={`url(#${id}-c)`} />
        </svg>
      </div>
    )
  }

  // ── Forest: floating island with tree ────────────────────────────────────
  if (zoneStyle === 'clearing') {
    return (
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        {glow}
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
          style={{ position: 'relative', zIndex: 2, overflow: 'visible' }}>
          <defs>
            <radialGradient id={`${id}-sky`} cx="50%" cy="30%" r="70%">
              <stop offset="0%"   stopColor={hi}  />
              <stop offset="100%" stopColor={lo}   />
            </radialGradient>
            <radialGradient id={`${id}-top`} cx="38%" cy="28%" r="68%">
              <stop offset="0%"  stopColor="rgba(255,255,255,.38)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
            <filter id={`${id}-b`}><feGaussianBlur stdDeviation="2"/></filter>
          </defs>
          {/* Sky backdrop */}
          <circle cx={c} cy={c} r={c-1} fill={`url(#${id}-sky)`} />
          <circle cx={c} cy={c} r={c-1} fill={`url(#${id}-top)`} />
          {/* Ground island */}
          <ellipse cx={c} cy={size*.72} rx={c*.72} ry={c*.22} fill="#4a7c3a" />
          <ellipse cx={c} cy={size*.68} rx={c*.64} ry={c*.16} fill="#5d9c48" />
          {/* Soil underside */}
          <ellipse cx={c} cy={size*.74} rx={c*.68} ry={c*.14} fill="#3d2b1a" />
          {/* Main tree trunk */}
          <rect x={c-c*.07} y={size*.3} width={c*.15} height={size*.4} rx={c*.04} fill="#5d3a1a" />
          {/* Tree canopy layers */}
          <ellipse cx={c} cy={size*.35} rx={c*.38} ry={c*.26} fill={mid} />
          <ellipse cx={c} cy={size*.24} rx={c*.26} ry={c*.20} fill={hi}  />
          <ellipse cx={c} cy={size*.15} rx={c*.14} ry={c*.12} fill="rgba(255,255,255,.6)" filter={`url(#${id}-b)`} />
          {/* Grass details */}
          {[-.3,-.1,.12,.28].map((dx,i)=>(
            <polygon key={i} points={`${c+c*dx},${size*.7} ${c+c*(dx+.04)},${size*.56} ${c+c*(dx+.08)},${size*.7}`} fill="#7bc54e" />
          ))}
        </svg>
      </div>
    )
  }

  // ── Ocean: jellyfish ─────────────────────────────────────────────────────
  if (zoneStyle === 'reef') {
    return (
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        {glow}
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
          style={{ position: 'relative', zIndex: 2, overflow: 'visible',
            animation: 'hub-bob-planet 3s ease-in-out infinite' }}>
          <defs>
            <radialGradient id={`${id}-bell`} cx="38%" cy="30%" r="72%">
              <stop offset="0%"  stopColor={hi}  stopOpacity=".9" />
              <stop offset="60%" stopColor={mid} stopOpacity=".75" />
              <stop offset="100%" stopColor={lo}  stopOpacity=".95" />
            </radialGradient>
            <radialGradient id={`${id}-inner`} cx="38%" cy="32%" r="60%">
              <stop offset="0%"  stopColor="rgba(255,255,255,.55)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)"  />
            </radialGradient>
            <filter id={`${id}-b`}><feGaussianBlur stdDeviation="1.5"/></filter>
          </defs>
          {/* Tentacles */}
          {[-.28,-.14,0,.14,.28].map((dx, i)=>(
            <path key={i}
              d={`M ${c+c*dx} ${size*.62} Q ${c+c*(dx+(i%2?.06:-.06))} ${size*.75} ${c+c*(dx+(i%2?.03:-.02))} ${size*.9}`}
              stroke={mid} strokeWidth={c*.06} fill="none" strokeLinecap="round" opacity=".72"
            />
          ))}
          {/* Bell dome */}
          <path d={`M ${c-c*.62} ${size*.55} Q ${c-c*.62} ${size*.1} ${c} ${size*.1} Q ${c+c*.62} ${size*.1} ${c+c*.62} ${size*.55} Z`}
            fill={`url(#${id}-bell)`} />
          <path d={`M ${c-c*.62} ${size*.55} Q ${c-c*.62} ${size*.1} ${c} ${size*.1} Q ${c+c*.62} ${size*.1} ${c+c*.62} ${size*.55} Z`}
            fill={`url(#${id}-inner)`} />
          {/* Inner ring */}
          <ellipse cx={c} cy={size*.5} rx={c*.38} ry={c*.08} fill={mid} opacity=".42" filter={`url(#${id}-b)`} />
          {/* Spots */}
          {[{x:.2,y:.28},{x:-.18,y:.22},{x:.3,y:.42},{x:-.28,y:.4},{x:.04,y:.32}].map((d,i)=>(
            <circle key={i} cx={c+c*d.x} cy={size*d.y} r={c*.06} fill={hi} opacity=".72" />
          ))}
        </svg>
      </div>
    )
  }

  // ── Candy: cupcake ───────────────────────────────────────────────────────
  if (zoneStyle === 'island') {
    return (
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        {glow}
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
          style={{ position: 'relative', zIndex: 2, overflow: 'visible' }}>
          <defs>
            <radialGradient id={`${id}-icing`} cx="38%" cy="25%" r="72%">
              <stop offset="0%"   stopColor={hi}  />
              <stop offset="100%" stopColor={mid}  />
            </radialGradient>
            <filter id={`${id}-b`}><feGaussianBlur stdDeviation="2"/></filter>
          </defs>
          {/* Cup / wrapper */}
          <path d={`M ${c-c*.46} ${size*.62} L ${c-c*.38} ${size*.88} L ${c+c*.38} ${size*.88} L ${c+c*.46} ${size*.62} Z`}
            fill={lo} />
          {/* Wrapper stripes */}
          {[-.26,-.08,.1,.28].map((dx,i)=>(
            <line key={i}
              x1={c+c*dx} y1={size*.62} x2={c+c*(dx+.01)} y2={size*.88}
              stroke="rgba(255,255,255,.25)" strokeWidth={c*.06}
            />
          ))}
          {/* Icing base */}
          <ellipse cx={c} cy={size*.58} rx={c*.5} ry={c*.16} fill={`url(#${id}-icing)`} />
          {/* Icing swirl */}
          <ellipse cx={c} cy={size*.46} rx={c*.38} ry={c*.24} fill={`url(#${id}-icing)`} />
          <ellipse cx={c} cy={size*.34} rx={c*.24} ry={c*.18} fill={hi} />
          <ellipse cx={c} cy={size*.25} rx={c*.12} ry={c*.10} fill="rgba(255,255,255,.72)" filter={`url(#${id}-b)`} />
          {/* Cherry on top */}
          <circle cx={c} cy={size*.17} r={c*.1} fill="#ff1744" />
          <circle cx={c-c*.03} cy={size*.14} r={c*.035} fill="rgba(255,255,255,.72)" />
          {/* Sprinkles */}
          {[{x:-.2,y:.38,r:30},{x:.22,y:.42,r:-45},{x:-.08,y:.3,r:70},{x:.14,y:.52,r:20}].map((d,i)=>(
            <rect key={i} x={c+c*d.x} y={size*d.y} width={c*.14} height={c*.04} rx={c*.02}
              fill={['#ffd600','#00e5ff','#ff6b6b','#b967ff'][i]}
              transform={`rotate(${d.r} ${c+c*d.x} ${size*d.y})`} />
          ))}
        </svg>
      </div>
    )
  }

  // ── Warm sky: hot air balloon ────────────────────────────────────────────
  if (zoneStyle === 'meadow') {
    return (
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        {glow}
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
          style={{ position: 'relative', zIndex: 2, overflow: 'visible',
            animation: 'hub-bob-planet 4s ease-in-out infinite' }}>
          <defs>
            <radialGradient id={`${id}-ball`} cx="38%" cy="25%" r="72%">
              <stop offset="0%"   stopColor={hi}  />
              <stop offset="55%"  stopColor={mid}  />
              <stop offset="100%" stopColor={lo}   />
            </radialGradient>
            <filter id={`${id}-b`}><feGaussianBlur stdDeviation="2.5"/></filter>
          </defs>
          {/* Balloon envelope */}
          <ellipse cx={c} cy={size*.4} rx={c*.58} ry={c*.52} fill={`url(#${id}-ball)`} />
          {/* Vertical stripes */}
          {[-.3,-.1,.1,.3].map((dx,i)=>(
            <ellipse key={i} cx={c+c*dx} cy={size*.4} rx={c*.09} ry={c*.52}
              fill="rgba(255,255,255,.14)" />
          ))}
          {/* Horizontal band */}
          <rect x={c-c*.58} y={size*.35} width={c*1.16} height={size*.11}
            fill="rgba(255,255,255,.18)" rx={1}/>
          {/* Shine */}
          <ellipse cx={c-c*.2} cy={size*.24} rx={c*.16} ry={c*.10}
            fill="rgba(255,255,255,.55)" filter={`url(#${id}-b)`} />
          {/* Ropes */}
          {[-.3,-.1,.1,.3].map((dx,i)=>(
            <line key={i}
              x1={c+c*dx} y1={size*.82}
              x2={c+c*(i<2?-.16:.16)} y2={size*.92}
              stroke={mid} strokeWidth={c*.03} opacity=".78"
            />
          ))}
          {/* Basket */}
          <rect x={c-c*.22} y={size*.82} width={c*.44} height={c*.24} rx={c*.06} fill="#a0522d" />
          <rect x={c-c*.22} y={size*.82} width={c*.44} height={c*.06} rx={c*.03} fill="#8b4513" />
        </svg>
      </div>
    )
  }

  // ── Magical: crystal ball ────────────────────────────────────────────────
  if (zoneStyle === 'realm') {
    return (
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        {glow}
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
          style={{ position: 'relative', zIndex: 2, overflow: 'visible' }}>
          <defs>
            <radialGradient id={`${id}-orb`} cx="36%" cy="28%" r="72%">
              <stop offset="0%"   stopColor={hi}  stopOpacity=".92" />
              <stop offset="50%"  stopColor={mid}  stopOpacity=".78" />
              <stop offset="100%" stopColor={lo}   stopOpacity=".95" />
            </radialGradient>
            <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor={mid}  stopOpacity=".55" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <filter id={`${id}-b`}><feGaussianBlur stdDeviation="2.5"/></filter>
          </defs>
          {/* Outer glow */}
          <circle cx={c} cy={c*.9} r={c*.72} fill={`url(#${id}-glow)`} filter={`url(#${id}-b)`} />
          {/* Crystal orb */}
          <circle cx={c} cy={c*.82} r={c*.65} fill={`url(#${id}-orb)`} />
          {/* Stars inside */}
          {[{x:.12,y:.5},{x:-.2,y:.72},{x:.28,y:.8},{x:-.06,y:.95},{x:.18,y:1.02}].map((d,i)=>(
            <polygon key={i}
              points={`${c+c*d.x},${size*d.y-c*.1} ${c+c*d.x+c*.04},${size*d.y} ${c+c*d.x},${size*d.y+c*.1} ${c+c*d.x-c*.04},${size*d.y}`}
              fill={hi} opacity={.55+i*.08}
            />
          ))}
          {/* Main shine */}
          <ellipse cx={c-c*.18} cy={c*.52} rx={c*.2} ry={c*.13} fill="rgba(255,255,255,.65)" filter={`url(#${id}-b)`} />
          {/* Base */}
          <ellipse cx={c} cy={size*.88} rx={c*.48} ry={c*.1}  fill={lo}  />
          <ellipse cx={c} cy={size*.88} rx={c*.36} ry={c*.07} fill={mid} />
          <rect x={c-c*.2} y={size*.86} width={c*.4} height={size*.1} rx={c*.08} fill={lo} />
          <ellipse cx={c} cy={size*.97} rx={c*.3}  ry={c*.05} fill={mid} opacity=".82" />
        </svg>
      </div>
    )
  }

  // ── Adventure: treasure chest ────────────────────────────────────────────
  if (zoneStyle === 'fortress') {
    return (
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        {glow}
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
          style={{ position: 'relative', zIndex: 2, overflow: 'visible' }}>
          <defs>
            <radialGradient id={`${id}-top`} cx="38%" cy="28%" r="68%">
              <stop offset="0%"  stopColor={hi}  />
              <stop offset="100%" stopColor={mid}  />
            </radialGradient>
            <filter id={`${id}-b`}><feGaussianBlur stdDeviation="2"/></filter>
          </defs>
          {/* Chest body */}
          <rect x={c-c*.54} y={size*.52} width={c*1.08} height={size*.4} rx={c*.08} fill={lo} />
          <rect x={c-c*.54} y={size*.52} width={c*1.08} height={size*.08} fill={mid} rx={c*.04} />
          {/* Chest lid (domed top) */}
          <path d={`M ${c-c*.54} ${size*.52} Q ${c-c*.54} ${size*.2} ${c} ${size*.2} Q ${c+c*.54} ${size*.2} ${c+c*.54} ${size*.52} Z`}
            fill={`url(#${id}-top)`} />
          {/* Lid band */}
          <path d={`M ${c-c*.54} ${size*.42} Q ${c} ${size*.32} ${c+c*.54} ${size*.42}`}
            stroke={mid} strokeWidth={c*.06} fill="none" />
          {/* Lock */}
          <rect x={c-c*.12} y={size*.52} width={c*.24} height={size*.16} rx={c*.04} fill="#c8860a" />
          <circle cx={c} cy={size*.52} r={c*.1} fill="#c8860a" />
          <circle cx={c} cy={size*.52} r={c*.05} fill={lo} />
          {/* Corner studs */}
          {[{x:-.42,y:.56},{x:.42,y:.56},{x:-.42,y:.74},{x:.42,y:.74}].map((d,i)=>(
            <circle key={i} cx={c+c*d.x} cy={size*d.y} r={c*.06} fill="#c8860a" />
          ))}
          {/* Shine on lid */}
          <ellipse cx={c-c*.14} cy={size*.3} rx={c*.14} ry={c*.07}
            fill="rgba(255,255,255,.42)" filter={`url(#${id}-b)`} />
          {/* Coins spilling */}
          {[{x:-.18,y:.46},{x:.06,y:.44},{x:.22,y:.48},{x:-.04,y:.48}].map((d,i)=>(
            <ellipse key={i} cx={c+c*d.x} cy={size*d.y} rx={c*.09} ry={c*.045}
              fill="#ffd600" opacity={.82-i*.06} />
          ))}
        </svg>
      </div>
    )
  }

  // ── Cozy: snow globe ────────────────────────────────────────────────────
  if (zoneStyle === 'nook') {
    return (
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        {glow}
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
          style={{ position: 'relative', zIndex: 2, overflow: 'visible' }}>
          <defs>
            <radialGradient id={`${id}-globe`} cx="36%" cy="28%" r="72%">
              <stop offset="0%"   stopColor={hi}   stopOpacity=".55" />
              <stop offset="60%"  stopColor={mid}   stopOpacity=".45" />
              <stop offset="100%" stopColor={lo}    stopOpacity=".82" />
            </radialGradient>
            <radialGradient id={`${id}-bg`} cx="50%" cy="70%" r="55%">
              <stop offset="0%"   stopColor="#ddeeff" stopOpacity=".72" />
              <stop offset="100%" stopColor="#0d2444"  stopOpacity=".9"  />
            </radialGradient>
            <clipPath id={`${id}-clip`}><circle cx={c} cy={c*.82} r={c*.64} /></clipPath>
            <filter id={`${id}-b`}><feGaussianBlur stdDeviation="2"/></filter>
          </defs>
          {/* Globe fill (sky) */}
          <circle cx={c} cy={c*.82} r={c*.64} fill={`url(#${id}-bg)`} />
          {/* Snow ground */}
          <ellipse cx={c} cy={size*.72} rx={c*.56} ry={c*.12} fill="white" clipPath={`url(#${id}-clip)`} />
          {/* Tiny house */}
          <rect x={c-c*.22} y={size*.46} width={c*.44} height={size*.28} rx={c*.03} fill="#8b5e3c" clipPath={`url(#${id}-clip)`} />
          <polygon points={`${c-c*.28},${size*.47} ${c},${size*.28} ${c+c*.28},${size*.47}`}
            fill="#c0392b" clipPath={`url(#${id}-clip)`} />
          <rect x={c-c*.07} y={size*.59} width={c*.14} height={size*.15} rx={c*.02} fill="#3d1a00" clipPath={`url(#${id}-clip)`} />
          {/* Window */}
          <rect x={c-c*.18} y={size*.49} width={c*.13} height={size*.12} rx={c*.02} fill="#ffcc80" opacity=".92" clipPath={`url(#${id}-clip)`} />
          {/* Snow flakes inside */}
          {[{x:-.35,y:.38},{x:.3,y:.34},{x:-.18,y:.28},{x:.16,y:.44},{x:-.44,y:.48},{x:.44,y:.44}].map((d,i)=>(
            <circle key={i} cx={c+c*d.x} cy={size*d.y} r={c*.04}
              fill="white" opacity=".82" clipPath={`url(#${id}-clip)`} />
          ))}
          {/* Glass globe outline */}
          <circle cx={c} cy={c*.82} r={c*.64} fill={`url(#${id}-globe)`} />
          {/* Shine */}
          <ellipse cx={c-c*.24} cy={size*.24} rx={c*.18} ry={c*.11}
            fill="rgba(255,255,255,.72)" filter={`url(#${id}-b)`} />
          {/* Base */}
          <ellipse cx={c} cy={size*.88} rx={c*.52} ry={c*.1}  fill={lo}  />
          <rect x={c-c*.38} y={size*.84} width={c*.76} height={size*.1} rx={c*.06} fill={lo} />
          <ellipse cx={c} cy={size*.95} rx={c*.44} ry={c*.06} fill={mid} opacity=".82" />
        </svg>
      </div>
    )
  }

  // ── Sky: kite ─────────────────────────────────────────────────────────────
  if (zoneStyle === 'cloudisland') {
    return (
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        {glow}
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
          style={{ position: 'relative', zIndex: 2, overflow: 'visible',
            animation: 'hub-bob-planet 3.5s ease-in-out infinite' }}>
          <defs>
            <radialGradient id={`${id}-k1`} cx="38%" cy="28%" r="72%">
              <stop offset="0%"  stopColor={hi}  />
              <stop offset="100%" stopColor={mid}  />
            </radialGradient>
            <filter id={`${id}-b`}><feGaussianBlur stdDeviation="2"/></filter>
          </defs>
          {/* Kite diamond — 4 quarters with alternating colors */}
          <polygon points={`${c},${size*.08} ${c+c*.52},${size*.48} ${c},${size*.82} ${c-c*.52},${size*.48}`}
            fill={`url(#${id}-k1)`} />
          <polygon points={`${c},${size*.08} ${c+c*.52},${size*.48} ${c},${size*.48}`}
            fill="rgba(255,255,255,.28)" />
          <polygon points={`${c},${size*.82} ${c-c*.52},${size*.48} ${c},${size*.48}`}
            fill="rgba(0,0,0,.14)" />
          {/* Cross spars */}
          <line x1={c-c*.52} y1={size*.48} x2={c+c*.52} y2={size*.48} stroke="rgba(255,255,255,.38)" strokeWidth={c*.04} />
          <line x1={c} y1={size*.08} x2={c} y2={size*.82} stroke="rgba(255,255,255,.38)" strokeWidth={c*.04} />
          {/* Shine */}
          <ellipse cx={c-c*.1} cy={size*.26} rx={c*.12} ry={c*.07}
            fill="rgba(255,255,255,.58)" filter={`url(#${id}-b)`} />
          {/* Tail */}
          <path d={`M ${c} ${size*.82} Q ${c+c*.22} ${size*.9} ${c+c*.1} ${size*.98}`}
            stroke={mid} strokeWidth={c*.03} fill="none" strokeLinecap="round" />
          {/* Tail bows */}
          {[{t:.86,c:hi},{t:.92,c:lo},{t:.98,c:mid}].map((d,i)=>(
            <ellipse key={i}
              cx={c+c*(.22-i*.06)} cy={size*d.t}
              rx={c*.08} ry={c*.04} fill={d.c} opacity=".82"
              transform={`rotate(${-30+i*10} ${c+c*(.22-i*.06)} ${size*d.t})`}
            />
          ))}
          {/* String going off screen */}
          <line x1={c+c*.1} y1={size*.98} x2={c+c*.4} y2={size*1.1}
            stroke="rgba(255,255,255,.28)" strokeWidth={c*.025} strokeLinecap="round" />
        </svg>
      </div>
    )
  }

  // ── Sports: Trophy ─────────────────────────────────────────────────────────
  if (zoneStyle === 'sportspark') {
    return (
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        {glow}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{
            position: 'relative',
            zIndex: 2,
            overflow: 'visible',
            animation: 'hub-bob-planet 3.2s ease-in-out infinite'
          }}
        >
          <defs>
            <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFE082" />
              <stop offset="45%" stopColor={hi} />
              <stop offset="100%" stopColor={mid} />
            </linearGradient>

            <filter id={`${id}-blur`}>
              <feGaussianBlur stdDeviation="2" />
            </filter>
          </defs>

          {/* Cup */}
          <path
            d={`
              M ${size*0.30} ${size*0.18}
              Q ${c} ${size*0.08} ${size*0.70} ${size*0.18}
              L ${size*0.63} ${size*0.48}
              Q ${c} ${size*0.62} ${size*0.37} ${size*0.48}
              Z
            `}
            fill={`url(#${id}-gold)`}
          />

          {/* Handles */}
          <path
            d={`
              M ${size*0.30} ${size*0.22}
              Q ${size*0.12} ${size*0.28} ${size*0.24} ${size*0.44}
            `}
            stroke={mid}
            strokeWidth={c*0.06}
            fill="none"
            strokeLinecap="round"
          />

          <path
            d={`
              M ${size*0.70} ${size*0.22}
              Q ${size*0.88} ${size*0.28} ${size*0.76} ${size*0.44}
            `}
            stroke={mid}
            strokeWidth={c*0.06}
            fill="none"
            strokeLinecap="round"
          />

          {/* Stem */}
          <rect
            x={size*0.46}
            y={size*0.48}
            width={size*0.08}
            height={size*0.16}
            rx={size*0.02}
            fill={mid}
          />

          {/* Base */}
          <rect
            x={size*0.35}
            y={size*0.64}
            width={size*0.30}
            height={size*0.08}
            rx={size*0.03}
            fill={lo}
          />

          <rect
            x={size*0.28}
            y={size*0.73}
            width={size*0.44}
            height={size*0.08}
            rx={size*0.03}
            fill={mid}
          />

          {/* Shine */}
          <ellipse
            cx={size*0.42}
            cy={size*0.24}
            rx={size*0.08}
            ry={size*0.04}
            fill="rgba(255,255,255,.6)"
            filter={`url(#${id}-blur)`}
          />

          {/* Star */}
          <text
            x={c}
            y={size*0.36}
            textAnchor="middle"
            fontSize={size*0.11}
            fill="white"
            opacity="0.85"
          >
            ★
          </text>
        </svg>
      </div>
    );
  }

  // ── Abstract: gemstone / crystal ─────────────────────────────────────────
  if (zoneStyle === 'burst') {
    return (
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        {glow}
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
          style={{ position: 'relative', zIndex: 2, overflow: 'visible' }}>
          <defs>
            <linearGradient id={`${id}-g1`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor={hi}  />
              <stop offset="100%" stopColor={mid}  />
            </linearGradient>
            <linearGradient id={`${id}-g2`} x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor={mid}  />
              <stop offset="100%" stopColor={lo}   />
            </linearGradient>
            <filter id={`${id}-b`}><feGaussianBlur stdDeviation="2"/></filter>
          </defs>
          {/* Gem facets — top crown */}
          <polygon points={`${c},${size*.12} ${c+c*.52},${size*.38} ${c},${size*.52} ${c-c*.52},${size*.38}`}
            fill={`url(#${id}-g1)`} opacity=".95" />
          {/* Gem facets — bottom pavilion */}
          <polygon points={`${c-c*.52},${size*.38} ${c},${size*.52} ${c},${size*.9}`}
            fill={lo} opacity=".9" />
          <polygon points={`${c+c*.52},${size*.38} ${c},${size*.52} ${c},${size*.9}`}
            fill={`url(#${id}-g2)`} opacity=".85" />
          {/* Girdle line */}
          <line x1={c-c*.52} y1={size*.38} x2={c+c*.52} y2={size*.38}
            stroke="rgba(255,255,255,.28)" strokeWidth={c*.025} />
          {/* Inner facet lines */}
          <line x1={c} y1={size*.12} x2={c} y2={size*.52}
            stroke="rgba(255,255,255,.22)" strokeWidth={c*.025} />
          <line x1={c} y1={size*.52} x2={c+c*.52} y2={size*.38}
            stroke="rgba(0,0,0,.15)" strokeWidth={c*.02} />
          <line x1={c} y1={size*.52} x2={c-c*.52} y2={size*.38}
            stroke="rgba(255,255,255,.12)" strokeWidth={c*.02} />
          {/* Top sparkle */}
          <ellipse cx={c-c*.14} cy={size*.22} rx={c*.12} ry={c*.07}
            fill="rgba(255,255,255,.72)" filter={`url(#${id}-b)`} />
          <circle cx={c-c*.14} cy={size*.22} r={c*.04} fill="white" opacity=".92" />
          {/* Corner flare sparkles */}
          {[{x:.48,y:.34},{x:-.44,y:.36}].map((d,i)=>(
            <circle key={i} cx={c+c*d.x} cy={size*d.y} r={c*.025}
              fill="white" opacity=".82" filter={`url(#${id}-b)`} />
          ))}
        </svg>
      </div>
    )
  }

  // Fallback: planet sphere
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {glow}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
        style={{ position: 'relative', zIndex: 2, overflow: 'visible' }}>
        <defs>
          <radialGradient id={`${id}-s`} cx="34%" cy="27%" r="76%">
            <stop offset="0%" stopColor={hi} />
            <stop offset="38%" stopColor={mid} />
            <stop offset="100%" stopColor={lo} />
          </radialGradient>
        </defs>
        <circle cx={c} cy={c} r={c-1} fill={`url(#${id}-s)`} />
      </svg>
    </div>
  )
}

// ── Galaxy swiper ─────────────────────────────────────────────────────────────
function GalaxySwiper({ galaxies, onSelect, isMobile, primary, initialPos = 0, world, themeKey }) {
  const N = galaxies.length
  const spacing    = isMobile ? 220 : 290
  const galaxySize = 148

  const posRef  = useRef(initialPos)
  const [pos, setPos] = useState(initialPos)
  const snapRef = useRef(null)
  const dragRef = useRef({ active: false, x0: 0, pos0: 0, dist: 0 })
  const rafRef  = useRef(null)

  function wmod(v) { return ((v % N) + N) % N }
  function focusOf(p) { return Math.round(wmod(p)) % N }

  useEffect(() => {
    const AUTO = 0.0008, K = 0.11
    const tick = () => {
      if (!dragRef.current.active) {
        if (snapRef.current !== null) {
          const d = snapRef.current - posRef.current
          if (Math.abs(d) < .004) { posRef.current = snapRef.current; snapRef.current = null }
          else posRef.current += d * K
        } else {
          posRef.current += AUTO
        }
        setPos(posRef.current)
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  function cx(e) { return e.touches ? e.touches[0].clientX : e.clientX }

  function onDown(e) { dragRef.current = { active: true, x0: cx(e), pos0: posRef.current, dist: 0 }; snapRef.current = null }
  function onMove(e) {
    if (!dragRef.current.active) return
    const dx = cx(e) - dragRef.current.x0
    dragRef.current.dist = Math.abs(dx)
    posRef.current = dragRef.current.pos0 - dx / spacing
    setPos(posRef.current)
  }
  function onUp() {
    if (!dragRef.current.active) return
    dragRef.current.active = false
    snapRef.current = Math.round(posRef.current)
  }

  const focusIdx = focusOf(pos)
  const focused  = galaxies[focusIdx]

  return (
    <div id="tour-hub-swiper"
      style={{ flex: 1, minHeight: 320, display: 'flex', flexDirection: 'column',
        position: 'relative', userSelect: 'none', touchAction: 'pan-y', overflow: 'visible' }}
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>

      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        {galaxies.map((g, i) => {
          let d = i - wmod(pos)
          if (d >  N / 2) d -= N
          if (d < -N / 2) d += N
          const offset  = d * spacing
          const dist    = Math.abs(d)
          const scale   = Math.max(.35, 1 - dist * .38)
          const opacity = Math.max(.12, 1 - dist * .52)
          const isFocus = i === focusIdx

          return (
            <div key={g.id}
              style={{
                position: 'absolute', left: '50%', top: '50%',
                transform: `translate(calc(${offset}px - 50%), -50%) scale(${scale})`,
                opacity,
                transition: dragRef.current.active ? 'none' : 'transform .32s cubic-bezier(.25,.1,.25,1), opacity .32s ease',
                cursor: 'pointer', zIndex: isFocus ? 10 : 5,
              }}
              onClick={e => {
                e.stopPropagation()
                if (dragRef.current.dist > 8) return
                if (isFocus) onSelect(g)
                else {
                  let target = Math.round(posRef.current) + d
                  snapRef.current = target
                }
              }}>
              <ThemedZoneVisual zone={g} themeKey={themeKey} size={galaxySize} />
              {isFocus && (
                <div style={{
                  position: 'absolute', inset: -(galaxySize * .16), borderRadius: '50%',
                  border: `1.5px solid ${g.color}55`, boxShadow: `0 0 22px ${g.color}40`,
                  pointerEvents: 'none',
                }} />
              )}
            </div>
          )
        })}


        <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 6, pointerEvents: 'none', zIndex: 20 }}>
          {galaxies.map((g, i) => (
            <div key={i} style={{
              width: i === focusIdx ? 18 : 6, height: 6, borderRadius: 3,
              background: i === focusIdx ? g.color : 'rgba(255,255,255,0.2)',
              transition: 'width .3s ease, background .3s ease',
            }} />
          ))}
        </div>
      </div>

      {/* Focus label */}
      <div key={focused.id}
        style={{ flexShrink: 0, textAlign: 'center', padding: '0 24px 28px',
          position: 'relative', zIndex: 30, animation: 'hub-label-in .28s ease both' }}
        onPointerDown={e => e.stopPropagation()}>
        <div style={{ fontSize: isMobile ? 17 : 20, fontWeight: 900, color: 'white',
          textShadow: `0 0 20px ${focused.color}` }}>{focused.name}</div>
        <div style={{ fontSize: isMobile ? 11 : 12, color: focused.color, fontWeight: 700,
          marginTop: 4, lineHeight: 1.55, maxWidth: 290, margin: '4px auto 0' }}>{focused.desc}</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginTop: 10 }}>
          {focused.planets.slice(0, 4).map(p => (
            <span key={p.id} style={{ fontSize: isMobile ? 15 : 17 }}>{p.emoji}</span>
          ))}
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.22)', marginTop: 8, letterSpacing: .7 }}>
          {world.subLabel}
        </div>
        <div
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
            marginTop: 12, padding: '9px 24px', borderRadius: 50,
            background: `${focused.color}20`, border: `1px solid ${focused.color}55`,
            color: 'white', fontSize: 12, fontWeight: 800, letterSpacing: .5, cursor: 'pointer' }}
          onClick={e => { e.stopPropagation(); onSelect(focused) }}>
          {world.zoneAction}
        </div>
      </div>
    </div>
  )
}

// ── Planet orbital ─────────────────────────────────────────────────────────────
function PlanetOrbital({ galaxy, planets, goTo, onBack, isMobile, initialRot = Math.PI / 2, world, themeKey }) {
  const N = planets.length
  const rX = isMobile ? 150 : 208
  const rY = isMobile ? 58  : 74

  const rotRef  = useRef(initialRot)
  const [rot, setRot] = useState(initialRot)
  const snapRef = useRef(null)
  const dragRef = useRef({ active: false, x0: 0, rot0: 0, dist: 0 })
  const rafRef  = useRef(null)

  function snapToNearest(r) {
    let bi = 0, bs = -Infinity
    for (let i = 0; i < N; i++) {
      const s = Math.sin((2 * Math.PI / N) * i + r)
      if (s > bs) { bs = s; bi = i }
    }
    const raw = Math.PI / 2 - (2 * Math.PI / N) * bi
    let t = raw
    while (t - r >  Math.PI) t -= 2 * Math.PI
    while (r - t >  Math.PI) t += 2 * Math.PI
    return t
  }

  function snapToIdx(i) {
    const raw = Math.PI / 2 - (2 * Math.PI / N) * i
    let t = raw
    while (t - rotRef.current >  Math.PI) t -= 2 * Math.PI
    while (rotRef.current - t >  Math.PI) t += 2 * Math.PI
    snapRef.current = t
  }

  useEffect(() => {
    const AUTO = .003, K = .09
    const tick = () => {
      if (!dragRef.current.active) {
        const snap = snapRef.current
        if (snap !== null) {
          const d = snap - rotRef.current
          if (Math.abs(d) < .005) { rotRef.current = snap; snapRef.current = null }
          else rotRef.current += d * K
        } else {
          rotRef.current += AUTO
        }
        setRot(rotRef.current)
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  function cx(e) { return e.touches ? e.touches[0].clientX : e.clientX }

  function onDown(e) { dragRef.current = { active: true, x0: cx(e), rot0: rotRef.current, dist: 0 }; snapRef.current = null }
  function onMove(e) {
    if (!dragRef.current.active) return
    const dx = cx(e) - dragRef.current.x0
    dragRef.current.dist = Math.abs(dx)
    rotRef.current = dragRef.current.rot0 - dx / (rX * 1.4)
    setRot(rotRef.current)
  }
  function onUp() {
    if (!dragRef.current.active) return
    dragRef.current.active = false
    if (dragRef.current.dist > 8) snapRef.current = snapToNearest(rotRef.current)
  }

  const pdata = planets.map((p, i) => {
    const angle = (2 * Math.PI / N) * i + rot
    const depth = (Math.sin(angle) + 1) / 2
    return { ...p, i, depth, px: Math.cos(angle) * rX, py: Math.sin(angle) * rY }
  })
  const focus  = pdata.reduce((b, p) => p.depth > b.depth ? p : b, pdata[0])
  const sorted = [...pdata].sort((a, b) => a.depth - b.depth)
  const sunSz  = isMobile ? 26 : 40
  const gc     = galaxy.color
  const BASE   = 148

  return (
    <div
      style={{ flex: 1, minHeight: 520, display: 'flex', flexDirection: 'column',
        position: 'relative', userSelect: 'none', touchAction: 'pan-y', overflow: 'visible',
        animation: 'hub-view-in .35s ease both' }}
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>

      {/* Back */}
      <div style={{ position: 'relative', zIndex: 30, display: 'flex', alignItems: 'center',
        gap: 12, padding: '16px 20px 0', flexShrink: 0 }}
        onPointerDown={e => e.stopPropagation()}>
        <button onClick={e => { e.stopPropagation(); onBack() }} 
          style={{ width: 56, height: 56, minWidth: 56, borderRadius: '50%', padding: 0, 
            background: `radial-gradient(circle at 40% 35%, ${gc}55 0%, ${gc}22 60%, transparent 100%)`, 
            border: `2px solid ${gc}cc`, 
            boxShadow: `0 0 12px ${gc}88, 0 0 28px ${gc}44`, 
            color: 'white', cursor: 'pointer', flexShrink: 0, 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            animation: 'hub-sun-pulse 2.5s ease-in-out infinite' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 6L9 12L15 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: 'white', textShadow: `0 0 18px ${gc}, 0 0 36px ${gc}66` }}>{galaxy.name}</div>
          <div style={{ fontSize: 12, color: gc, fontWeight: 800, marginTop: 2, letterSpacing: .8, textShadow: `0 0 10px ${gc}88` }}>{world.orbitLabel}</div>
        </div>
      </div>

      {/* Orbit */}
      <div style={{ flex: 1, position: 'relative', display: 'flex',
        alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>

        <svg style={{ position: 'absolute', width: rX*2+80, height: rY*2+80,
          overflow: 'visible', pointerEvents: 'none', zIndex: 1 }}>
          <ellipse cx={rX+40} cy={rY+40} rx={rX} ry={rY}
            fill="none" stroke={gc} strokeOpacity=".11" strokeWidth="1" strokeDasharray="4 12" />
        </svg>

        {/* Sun */}
        <div style={{
          position: 'absolute', width: sunSz, height: sunSz, borderRadius: '50%', zIndex: 1,
          background: `radial-gradient(circle at 36% 32%, white 0%, ${galaxy.coreColor} 35%, ${gc} 80%)`,
          boxShadow: `0 0 ${sunSz}px ${gc}, 0 0 ${sunSz*2}px ${gc}88, 0 0 ${sunSz*4}px ${gc}33`,
          animation: 'hub-sun-pulse 3s ease-in-out infinite',
          pointerEvents: 'none',
        }} />

        {/* Planets */}
        {sorted.map(p => {
          const isFocus = p.id === focus.id
          const scale   = isMobile ? .36 + p.depth * .48 : .44 + p.depth * .56
          const opacity = .28 + p.depth * .72
          return (
            <div key={p.id}
              style={{
                position: 'absolute',
                transform: `translate(${p.px}px,${p.py}px) scale(${scale})`,
                zIndex: Math.round(p.depth * 48) + 1,
                opacity,
                cursor: 'pointer',
              }}
              onClick={e => {
                e.stopPropagation()
                if (dragRef.current.dist > 8) return
                if (isFocus) goTo(p.path)
                else snapToIdx(p.i)
              }}>
              <ThemedPlanetVisual planet={p} size={BASE} themeKey={themeKey} planetIndex={p.i} />
              {isFocus && (
                <div style={{
                  position: 'absolute', inset: -(BASE * .14), borderRadius: '50%',
                  border: `1.5px solid ${gc}62`, boxShadow: `0 0 16px ${gc}48`,
                  pointerEvents: 'none',
                }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Focus label */}
      <div key={focus.id}
        style={{ flexShrink: 0, textAlign: 'center', padding: '0 24px 26px',
          position: 'relative', zIndex: 30, animation: 'hub-label-in .28s ease both' }}
        onPointerDown={e => e.stopPropagation()}>
        <div style={{ fontSize: 26, lineHeight: 1, marginBottom: 6 }}>{focus.emoji}</div>
        <div style={{ fontSize: isMobile ? 17 : 21, fontWeight: 900, color: 'white',
          textShadow: `0 0 20px ${gc}` }}>{focus.name}</div>
        <div style={{ fontSize: isMobile ? 11 : 12, color: gc, fontWeight: 700,
          marginTop: 5, lineHeight: 1.55, maxWidth: 290, margin: '5px auto 0' }}>{focus.desc}</div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.22)', marginTop: 8, letterSpacing: .7 }}>
          {world.orbitLabel}
        </div>
        <div
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
            marginTop: 12, padding: '9px 24px', borderRadius: 50,
            background: `${gc}20`, border: `1px solid ${gc}55`,
            color: 'white', fontSize: 12, fontWeight: 800, letterSpacing: .5, cursor: 'pointer' }}
          onClick={e => { e.stopPropagation(); goTo(focus.path) }}>
          {world.planetAction}
        </div>
      </div>
    </div>
  )
}

// ── WotD ──────────────────────────────────────────────────────────────────────
// Inline bar — always in flow, never fixed-positioned, so it never overlaps other content.
function WotdBar({ wotd, goTo, isMobile }) {
  if (!wotd) return null
  return (
    <div style={{
      position: 'relative', zIndex: 5, flexShrink: 0,
      margin: isMobile ? '8px 14px 0' : 0,
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 14, padding: '8px 12px',
    }}>
      <span style={{ fontSize: isMobile ? 18 : 20, flexShrink: 0 }}>{wotd.emoji}</span>
      <button onClick={() => goTo('memory/wordofday')}
        style={{ flex: 1, minWidth: 0, background: 'none', border: 'none',
          cursor: 'pointer', textAlign: 'left', color: 'white', padding: 0 }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase', letterSpacing: 1, marginBottom: 1 }}>🧠 Word of the Day</div>
        <div style={{ fontSize: 13, fontWeight: 900, lineHeight: 1.2 }}>{wotd.word}</div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.42)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{wotd.meaning}</div>
      </button>
      <button onClick={() => goTo('memory/flashcards')}
        style={{ padding: '5px 9px', borderRadius: 8, background: 'rgba(255,255,255,0.12)',
          border: 'none', color: 'white', fontSize: 11, fontWeight: 800,
          cursor: 'pointer', flexShrink: 0 }}>📇</button>
      <button onClick={() => goTo('memory/match')}
        style={{ padding: '5px 9px', borderRadius: 8, background: 'rgba(255,255,255,0.12)',
          border: 'none', color: 'white', fontSize: 11, fontWeight: 800,
          cursor: 'pointer', flexShrink: 0 }}>🎴</button>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function UniverseHub({ child, featureConfig, wotd }) {
  const theme    = useTheme()
  const navigate = useNavigate()
  const cid        = child?.id || 'anon'
  const GALAXY_KEY = 'glm_hub_galaxy_' + cid
  const SWIPER_KEY = 'glm_hub_swiper_' + cid

  const [selectedGalaxy, setSelectedGalaxy] = useState(null)
  const [recentPaths, setRecentPaths] = useState([])
  const [isMobile,    setIsMobile]    = useState(() => window.innerWidth < 640)

  const primary = theme?.primary || '#9d8fff'
  const storageKey = RECENT_KEY + cid

  // Derive world from child's theme — default to coral (warmsky) if unset
  const themeKey = child?.theme || 'coral'
  const world = getWorld(themeKey)

  useEffect(() => { injectStyles() }, [])

  useLayoutEffect(() => {
    try {
      const galaxyId = sessionStorage.getItem(GALAXY_KEY)
      if (galaxyId) {
        const g = UNIVERSE.find(g => g.id === galaxyId)
        if (g) setSelectedGalaxy(g)
      }
    } catch {}
  }, [GALAXY_KEY])

  useEffect(() => {
    if (selectedGalaxy) {
      try {
        sessionStorage.setItem(GALAXY_KEY, selectedGalaxy.id)
        sessionStorage.setItem(SWIPER_KEY, selectedGalaxy.id)
      } catch {}
    } else {
      try { sessionStorage.removeItem(GALAXY_KEY) } catch {}
    }
  }, [selectedGalaxy, GALAXY_KEY, SWIPER_KEY])

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  useEffect(() => {
    try { setRecentPaths(JSON.parse(localStorage.getItem(storageKey) || '[]')) } catch {}
  }, [storageKey])

  let enabledKeys = null
  try { if (child?.enabledFeatures) enabledKeys = JSON.parse(child.enabledFeatures) } catch {}

  function planetEnabled(p) {
    if (p.featureKey) {
      const fc = featureConfig?.find(f => f.featureName === p.featureKey)
      if (fc && fc.enabled === false) return false
    }
    if (!enabledKeys) return true
    return enabledKeys.includes(p.path.split('/')[0])
  }

  function goTo(path) {
    try {
      const cur = JSON.parse(localStorage.getItem(storageKey) || '[]')
      localStorage.setItem(storageKey, JSON.stringify([path, ...cur.filter(x => x !== path)].slice(0, RECENT_LIMIT)))
    } catch {}
    navigate(`/child/${child?.id}/${path}`)
  }

  function selectGalaxy(g)  { setSelectedGalaxy(g) }
  function backToGalaxies() { setSelectedGalaxy(null) }

  const recentPlanets = recentPaths.map(path => {
    for (const g of UNIVERSE) {
      const p = g.planets.find(pl => pl.path === path)
      if (p) return { ...p, galaxyColor: g.color }
    }
    return null
  }).filter(Boolean).slice(0, RECENT_LIMIT)

  const visibleGalaxies = UNIVERSE.filter(g => g.planets.some(planetEnabled))

  // ── Planet view ─────────────────────────────────────────────────────────────
  if (selectedGalaxy) {
    const planets = selectedGalaxy.planets.filter(planetEnabled)
    const storedRecent = (() => { try { return JSON.parse(localStorage.getItem(storageKey) || '[]') } catch { return [] } })()
    const lastPlanetPath = storedRecent.find(rp => planets.some(pl => pl.path === rp))
    const lastPlanetIdx  = lastPlanetPath ? planets.findIndex(p => p.path === lastPlanetPath) : 0
    const initialRot = Math.PI / 2 - (2 * Math.PI / planets.length) * lastPlanetIdx
    return (
      <div style={{ flex: 1, minHeight: 520, display: 'flex', flexDirection: 'column',
        background: world.bg, fontFamily: 'Nunito, sans-serif', position: 'relative' }}>
        <ThemeBackground themeKey={themeKey} />
        <WorldParticles world={world} count={55} />
        <div style={{ flex: 1, minHeight: 0, position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column' }}>
          <PlanetOrbital
            galaxy={selectedGalaxy}
            planets={planets}
            goTo={goTo}
            onBack={backToGalaxies}
            isMobile={isMobile}
            initialRot={initialRot}
            world={world}
            themeKey={themeKey}
          />
        </div>
      </div>
    )
  }

  // ── Universe view ────────────────────────────────────────────────────────────
  return (
    <div style={{ flex: 1, minHeight: 520, display: 'flex', flexDirection: 'column',
      background: world.bg, fontFamily: 'Nunito, sans-serif', position: 'relative',
      animation: 'hub-view-in .35s ease both' }}>
      <ThemeBackground themeKey={themeKey} />
      <WorldParticles world={world} count={world.particles.count} />

      {/* Header */}
      <div id="tour-hub-header" style={{ position: 'relative', zIndex: 5, textAlign: 'center',
        padding: isMobile ? '18px 14px 0' : '22px 44px 0', flexShrink: 0 }}>
        <div style={{ fontSize: isMobile ? 18 : 24, fontWeight: 900, color: 'white',
          textShadow: `0 0 26px ${primary}88`, letterSpacing: .3 }}>
          {child?.name ? `${child.name}'s ${world.worldTitle}` : `My ${world.worldTitle}`}
        </div>
      </div>

      {/* Recent pills + WOTD row — same container on desktop so they share the same line */}
      <div style={{ position: 'relative', zIndex: 5, flexShrink: 0,
        padding: isMobile ? '10px 14px 0' : '12px 44px 0',
        display: 'flex', alignItems: 'center', gap: 10,
        justifyContent: 'space-between',
      }}>
        {/* Recently visited pills */}
        {recentPlanets.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, flex: 1, minWidth: 0 }}>
            {recentPlanets.map((p, i) => (
              <button key={i} onClick={() => goTo(p.path)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 50,
                background: `${p.galaxyColor}18`, border: `1px solid ${p.galaxyColor}42`,
                color: 'white', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                whiteSpace: 'nowrap', animation: `hub-recent-in .3s ease ${i * .06}s both`,
                transition: 'background .2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = `${p.galaxyColor}30`}
                onMouseLeave={e => e.currentTarget.style.background = `${p.galaxyColor}18`}>
                <span style={{ fontSize: 12 }}>{p.emoji}</span>{p.name}
              </button>
            ))}
          </div>
        )}
        {/* Word of the Day — right side on desktop, own row on mobile */}
        {isMobile
          ? null
          : <div id="tour-hub-wotd" style={{ flexShrink: 0, maxWidth: 400 }}>
              <WotdBar wotd={wotd} goTo={goTo} isMobile={false} />
            </div>
        }
      </div>
      {/* Word of the Day — own row on mobile */}
      {isMobile && (
        <div id="tour-hub-wotd">
          <WotdBar wotd={wotd} goTo={goTo} isMobile={true} />
        </div>
      )}

      {/* Galaxy swiper */}
      {(() => {
        let savedId = ''
        try { savedId = sessionStorage.getItem(SWIPER_KEY) || '' } catch {}
        const initPos = Math.max(0, visibleGalaxies.findIndex(g => g.id === savedId))
        return (
          <GalaxySwiper
            galaxies={visibleGalaxies}
            onSelect={selectGalaxy}
            isMobile={isMobile}
            primary={primary}
            initialPos={initPos}
            world={world}
            themeKey={themeKey}
          />
        )
      })()}
    </div>
  )
}
