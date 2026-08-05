import { useLayoutEffect } from 'react'

// ── One-time CSS injection ────────────────────────────────────────────────────
let stylesInjected = false
function injectBgStyles() {
  if (stylesInjected) return
  stylesInjected = true
  const s = document.createElement('style')
  s.textContent = `
    @media (prefers-reduced-motion: reduce) {
      [style*="animation"] { animation: none !important; }
    }

    /* ─── Scene SVG base positioning ─── */
    .bg-scene-svg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }

    /* ─── Float / sway ─── */
    @keyframes bg-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
    @keyframes bg-float-sm{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
    @keyframes bg-float-lg{0%,100%{transform:translateY(0)}50%{transform:translateY(-22px)}}
    @keyframes bg-sway{0%,100%{transform:rotate(-4deg) translateY(0)}50%{transform:rotate(4deg) translateY(-5px)}}
    @keyframes bg-sway-sm{0%,100%{transform:translateX(-4px)}50%{transform:translateX(4px)}}
    @keyframes bg-sway-tree{0%,100%{transform:translateX(-7px)}50%{transform:translateX(7px)}}
    @keyframes bg-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}

    /* ─── Cross-screen elements: apply the 0% keyframe during delay so they start
           off-screen instead of flashing at their drawn SVG coordinates ─── */
    svg *{animation-fill-mode:backwards}

    /* ─── Drift / cross screen ─── */
    @keyframes bg-drift-l{from{transform:translateX(120vw)}to{transform:translateX(-30vw)}}
    @keyframes bg-drift-r{from{transform:translateX(-30vw)}to{transform:translateX(120vw)}}
    @keyframes bg-drift-lr{0%{transform:translateX(120vw) translateY(0)}40%{transform:translateX(50vw) translateY(-20px)}100%{transform:translateX(-25vw) translateY(0)}}
    @keyframes bg-drift-up{0%{transform:translateY(0);opacity:0}8%{opacity:.75}88%{opacity:.5}100%{transform:translateY(-110vh);opacity:0}}
    @keyframes bg-fall{0%{transform:translateY(-40px) rotate(0deg);opacity:0}6%{opacity:.8}90%{opacity:.6}100%{transform:translateY(110vh) rotate(380deg);opacity:0}}
    @keyframes bg-rain{from{transform:translate(0,-80px)}to{transform:translate(-100px,110vh)}}
    @keyframes bg-rain-h{from{transform:translate(0,-80px)}to{transform:translate(-140px,110vh)}}
    @keyframes bg-swim{0%{transform:translateX(120vw) scaleX(-1)}100%{transform:translateX(-25vw) scaleX(-1)}}
    @keyframes bg-swim-r{0%{transform:translateX(-25vw)}100%{transform:translateX(120vw)}}
    @keyframes bg-fly{0%{transform:translateX(120vw) translateY(0)}35%{transform:translateX(50vw) translateY(-40px)}100%{transform:translateX(-25vw) translateY(0)}}
    @keyframes bg-fly-r{0%{transform:translateX(-30vw) translateY(0)}65%{transform:translateX(20vw) translateY(-40px)}100%{transform:translateX(120vw) translateY(0)}}
    @keyframes bg-drone-break{0%{transform:translateY(0) rotate(0deg);opacity:1}12%{transform:translateY(-8px) rotate(0deg);opacity:1}25%{transform:translateY(0) rotate(0deg);opacity:1}38%{transform:translateY(-8px) rotate(0deg);opacity:1}51%{transform:translateY(0) rotate(0deg);opacity:1}62%{transform:translateY(-5px) rotate(0deg);opacity:1}63.5%{transform:translateY(4px) rotate(12deg);opacity:1}65%{transform:translateY(-6px) rotate(-18deg);opacity:1}66%{transform:translateY(6px) rotate(22deg);opacity:0.85}68%{transform:translateY(10px) rotate(30deg);opacity:0.8}78%{transform:translateY(200px) rotate(110deg);opacity:0.45}86%{transform:translateY(420px) rotate(200deg);opacity:0}87%{transform:translateY(0) rotate(0deg);opacity:0}99%{transform:translateY(0) rotate(0deg);opacity:0}100%{transform:translateY(0) rotate(0deg);opacity:1}}
    @keyframes bg-drone-debris-l{0%,63%{transform:translate(0,0) rotate(0deg);opacity:0}64%{transform:translate(0,0) rotate(0deg);opacity:1}80%{transform:translate(-70px,190px) rotate(210deg);opacity:0.55}87%{transform:translate(-90px,390px) rotate(370deg);opacity:0}88%,100%{transform:translate(0,0) rotate(0deg);opacity:0}}
    @keyframes bg-drone-debris-r{0%,63%{transform:translate(0,0) rotate(0deg);opacity:0}64%{transform:translate(0,0) rotate(0deg);opacity:1}80%{transform:translate(60px,180px) rotate(-190deg);opacity:0.55}87%{transform:translate(80px,380px) rotate(-350deg);opacity:0}88%,100%{transform:translate(0,0) rotate(0deg);opacity:0}}
    @keyframes bg-drone-debris-c{0%,63%{transform:translate(0,0) rotate(0deg);opacity:0}64%{transform:translate(0,0) rotate(0deg);opacity:1}80%{transform:translate(-10px,220px) rotate(280deg);opacity:0.45}87%{transform:translate(-15px,430px) rotate(500deg);opacity:0}88%,100%{transform:translate(0,0) rotate(0deg);opacity:0}}
    @keyframes bg-drone-flash{0%,62%{opacity:0;transform:scale(0.2)}63%{opacity:0}64%{opacity:1;transform:scale(1.4)}65.5%{opacity:0.7;transform:scale(1)}67%{opacity:0;transform:scale(0.6)}68%,100%{opacity:0;transform:scale(0.2)}}

    /* ─── Twinkle / glow / pulse ─── */
    @keyframes bg-twinkle{0%,100%{opacity:.07}50%{opacity:.95}}
    @keyframes bg-glow{0%,100%{opacity:.3}50%{opacity:.85}}
    @keyframes bg-glow-fast{0%,100%{opacity:.25}50%{opacity:.9}}
    @keyframes bg-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
    @keyframes bg-pulse-sm{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
    @keyframes bg-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    @keyframes bg-spin-ccw{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
    @keyframes bg-spin-slow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    @keyframes bg-flicker{0%,100%{opacity:.9;transform:scaleX(1) scaleY(1)}25%{opacity:.6;transform:scaleX(.88) scaleY(.93)}55%{opacity:.85;transform:scaleX(1.07) scaleY(1.06)}75%{opacity:.7;transform:scaleX(.94) scaleY(.97)}}
    @keyframes bg-blink{0%,42%,58%,100%{opacity:1}50%{opacity:.04}}

    /* ─── Lightning / flash ─── */
    @keyframes bg-screen-flash{0%,83%,100%{opacity:0}85%{opacity:.55}87%{opacity:.06}89%{opacity:.42}91%{opacity:0}}
    @keyframes bg-screen-flash2{0%,78%,100%{opacity:0}80%{opacity:.45}82%{opacity:.04}84%{opacity:.35}86%{opacity:0}}
    @keyframes bg-lightning-draw{0%{stroke-dashoffset:300;opacity:.95}18%{stroke-dashoffset:0;opacity:.85}35%{stroke-dashoffset:0;opacity:0}36%,100%{stroke-dashoffset:300;opacity:0}}
    @keyframes bg-cricket-delivery{0%,100%{transform:translateY(0);opacity:1}60%{transform:translateY(-200px);opacity:1}75%{transform:translateY(-220px);opacity:0}76%{transform:translateY(0);opacity:0}90%{opacity:0}99%{opacity:1}}
    @keyframes bg-bat-swing{0%,100%{transform:rotate(20deg)}12%{transform:rotate(75deg)}30%{transform:rotate(138deg)}52%{transform:rotate(138deg)}70%{transform:rotate(-118deg)}89%{transform:rotate(-118deg)}}
    @keyframes bg-trunk-lift{0%,100%{transform:rotate(0deg)}40%{transform:rotate(-35deg)}60%{transform:rotate(-35deg)}}
    @keyframes bg-walk-l{0%,100%{transform:rotate(15deg)}50%{transform:rotate(-15deg)}}
    @keyframes bg-fish-swim{0%,100%{transform:translateX(-60px)}50%{transform:translateX(60px)}}
    @keyframes bg-six{0%,55%{opacity:0;transform:scale(0.4) translateY(20px)}60%{opacity:1;transform:scale(1.2) translateY(-10px)}72%{opacity:1;transform:scale(1) translateY(0)}85%{opacity:0;transform:scale(0.8) translateY(-30px)}100%{opacity:0}}
    @keyframes bg-goal{0%,53%{opacity:0;transform:scale(0.3)}61%{opacity:1;transform:scale(1.3)}69%{opacity:1;transform:scale(1)}78%{opacity:1;transform:scale(1)}86%{opacity:0;transform:scale(0.8)}100%{opacity:0}}
    @keyframes bg-fb-ball{0%{transform:translate(0,0) rotate(0deg)}55%{transform:translate(224px,-63px) rotate(380deg)}70%{transform:translate(224px,-63px) rotate(420deg)}78%,100%{transform:translate(0,0) rotate(0deg)}}

    /* ─── Web shooting ─── */
    @keyframes bg-web-shoot{0%{stroke-dashoffset:900;opacity:.8}30%{stroke-dashoffset:0;opacity:.65}60%{stroke-dashoffset:0;opacity:0}61%,100%{stroke-dashoffset:900;opacity:0}}
    @keyframes bg-web-shoot2{0%,15%{stroke-dashoffset:700;opacity:0}18%{opacity:.7}45%{stroke-dashoffset:0;opacity:.55}70%{stroke-dashoffset:0;opacity:0}71%,100%{stroke-dashoffset:700;opacity:0}}

    /* ─── Bat signal ─── */
    @keyframes bg-sweep{0%,100%{transform:rotate(-30deg) translateY(0)}50%{transform:rotate(30deg) translateY(0)}}
    @keyframes bg-signal-blink{0%,13%,100%{opacity:.55}7%{opacity:0}45%,60%{opacity:.82}52%{opacity:.08}}

    /* ─── Bats flying ─── */
    @keyframes bg-bat-cross{0%{transform:translateX(1050px) translateY(0) scaleX(-1)}40%{transform:translateX(500px) translateY(-35px) scaleX(-1)}100%{transform:translateX(-200px) translateY(0) scaleX(-1)}}
    @keyframes bg-launch{from{transform:translateY(130vh)}to{transform:translateY(-30vh)}}
    @keyframes bg-booster{0%,100%{transform:scaleY(1) scaleX(1);opacity:1}30%{transform:scaleY(1.4) scaleX(.8);opacity:.9}60%{transform:scaleY(.7) scaleX(1.2);opacity:.85}80%{transform:scaleY(1.2) scaleX(.9);opacity:1}}
    @keyframes bg-wing-flap{0%,100%{transform:scaleY(1)}50%{transform:scaleY(-0.4)}}

    /* ─── Firework burst ─── */
    @keyframes bg-burst{0%{r:0;opacity:1}65%{opacity:.7}100%{r:60;opacity:0}}
    @keyframes bg-burst-sm{0%{r:0;opacity:1}65%{opacity:.6}100%{r:38;opacity:0}}
    @keyframes bg-spark-fly{0%{stroke-dashoffset:0;opacity:.9}100%{stroke-dashoffset:60;opacity:0}}

    /* ─── Aurora ─── */
    @keyframes bg-aurora{0%,100%{transform:scaleX(1) translateY(0);opacity:.18}50%{transform:scaleX(1.08) translateY(12px);opacity:.48}}
    @keyframes bg-aurora2{0%,100%{transform:scaleX(1) translateY(0);opacity:.12}50%{transform:scaleX(1.05) translateY(18px);opacity:.42}}
    @keyframes aur-sway{0%,100%{transform:translateY(0) scaleX(1)}50%{transform:translateY(12px) scaleX(1.03)}}
    @keyframes aur-sway2{0%,100%{transform:translateY(0) scaleX(1)}50%{transform:translateY(-9px) scaleX(1.05)}}

    /* ─── Ripple / bubble ─── */
    @keyframes bg-ripple{0%{transform:scale(.1);opacity:.7}100%{transform:scale(3.5);opacity:0}}
    @keyframes bg-bubble{0%{transform:translateY(0);opacity:.55}70%{opacity:.4}100%{transform:translateY(-500px);opacity:0}}

    /* ─── Color cycle ─── */
    @keyframes bg-holi-burst{0%{transform:scale(0);opacity:1}60%{opacity:.7}100%{transform:scale(1.8);opacity:0}}
    @keyframes bg-color-cycle{0%{fill:#ff4444}16%{fill:#ff9900}33%{fill:#ffee00}50%{fill:#44ff44}66%{fill:#4488ff}83%{fill:#aa44ff}100%{fill:#ff4444}}

    /* ─── Misc ─── */
    @keyframes bg-steam{0%{transform:translateY(0) translateX(0) scaleX(1);opacity:.6}30%{transform:translateY(-18px) translateX(4px) scaleX(1.2);opacity:.45}60%{transform:translateY(-38px) translateX(-3px) scaleX(.9);opacity:.25}100%{transform:translateY(-65px) translateX(5px) scaleX(1.3);opacity:0}}
    @keyframes bg-wave{0%,100%{d:path("M0,480 Q200,460 400,480 Q600,500 800,480 L800,500 L0,500Z")}50%{d:path("M0,480 Q200,500 400,480 Q600,460 800,480 L800,500 L0,500Z")}}
    @keyframes bg-cloud-drift{0%{transform:translateX(-40px)}100%{transform:translateX(40px)}}
    @keyframes bg-flag-wave{0%{transform:skewX(0deg) scaleX(1)}25%{transform:skewX(6deg) scaleX(.93)}60%{transform:skewX(-4deg) scaleX(.97)}100%{transform:skewX(0deg) scaleX(1)}}
    @keyframes bg-jump{0%,100%{transform:translateY(0)}50%{transform:translateY(-30px)}}
    @keyframes bg-rock{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-4deg)}}
    @keyframes bg-wheel{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    @keyframes bg-car-move{0%{transform:translateX(950px)}100%{transform:translateX(-250px)}}
    @keyframes bg-motion-blur{0%,100%{opacity:1}50%{opacity:.5}}
    @keyframes bg-diya-glow{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:.9;transform:scale(1.15)}}
    @keyframes bg-lantern-rise{0%{transform:translateY(0) rotate(-5deg);opacity:.7}50%{transform:translateY(-200px) rotate(5deg);opacity:.8}100%{transform:translateY(-450px) rotate(-3deg);opacity:0}}
    @keyframes bg-snow-fall{0%{transform:translateY(-20px) translateX(0) rotate(0deg);opacity:.9}25%{transform:translateY(130px) translateX(12px) rotate(90deg)}50%{transform:translateY(270px) translateX(-8px) rotate(180deg)}75%{transform:translateY(410px) translateX(10px) rotate(270deg)}100%{transform:translateY(560px) translateX(0) rotate(360deg);opacity:.4}}
    @keyframes bg-petal-fall{0%{transform:translateY(-20px) rotate(0deg) translateX(0);opacity:.9}100%{transform:translateY(560px) rotate(720deg) translateX(60px);opacity:.3}}
    @keyframes bg-leaf-fall{0%{transform:translateY(-20px) rotate(0deg) translateX(0);opacity:.9}100%{transform:translateY(560px) rotate(540deg) translateX(-50px);opacity:.4}}
    @keyframes bg-confetti{0%{transform:translateY(-30px) rotate(0deg) translateX(0);opacity:1}100%{transform:translateY(560px) rotate(720deg) translateX(var(--cx,30px));opacity:.2}}
    @keyframes bg-volcano{0%{transform:translateY(0) scale(1);opacity:.9}70%{opacity:.6}100%{transform:translateY(-200px) scale(.3);opacity:0}}
    @keyframes bg-shooting-star{0%{stroke-dashoffset:150;opacity:0}10%{opacity:.9}50%{stroke-dashoffset:0;opacity:.7}70%{opacity:0}100%{stroke-dashoffset:150;opacity:0}}
    @keyframes bg-galaxy-spin{from{transform:rotate(0deg) scale(1)}50%{transform:rotate(180deg) scale(1.04)}to{transform:rotate(360deg) scale(1)}}
    @keyframes bg-pixel-blink{0%,100%{opacity:0}50%{opacity:1}}
    @keyframes bg-dragon-fire{0%{transform:scaleX(1) scaleY(1);opacity:.9}30%{transform:scaleX(1.3) scaleY(.85);opacity:.75}60%{transform:scaleX(.8) scaleY(1.2);opacity:.85}100%{transform:scaleX(1) scaleY(1);opacity:.9}}
  `
  document.head.appendChild(s)
}

// ── Shared helpers ─────────────────────────────────────────────────────────────
// Cloud path: flat bottom, smooth two-bump top silhouette, width=150 units
// Usage: <Cloud x={cx} y={bottomY} w={width} fill="..." style={{animation:...}} />
const CloudShape = ({ x = 0, y = 0, w = 150, fill = 'white', opacity = 1, style }) => {
  const s = w / 150
  // Outer <g> carries the CSS animation; inner <g> carries the SVG position transform.
  // Keeping them separate prevents the CSS animation transform from overriding the SVG
  // positioning transform (which causes clouds to jump to 0,0 when the animation fires).
  return (
    <g style={style}>
      <g transform={`translate(${x - w / 2}, ${y}) scale(${s}, ${s})`}>
        <path
          d="M4,58 C4,42 12,30 28,30 C22,6 42,-8 64,4 C68,-12 90,-12 94,4 C114,-8 136,6 130,30 C146,30 154,42 154,58 Z"
          fill={fill}
          opacity={opacity}
        />
      </g>
    </g>
  )
}

const Stars = ({ n = 16, color = 'white' }) => Array.from({ length: n }, (_, i) => {
  const x = (i * 73 + 17) % 800
  const y = (i * 113 + 31) % 300
  const r = i % 3 === 0 ? 1.5 : 0.8
  const dur = 2 + (i % 5) * 0.7
  const del = (i * 0.23) % 3
  return <circle key={i} cx={x} cy={y} r={r} fill={color} style={{ animation: `bg-twinkle ${dur}s ${del}s ease-in-out infinite` }} />
})

const Rain = ({ n = 10, delay = 0, heavy = false }) => Array.from({ length: n }, (_, i) => {
  const x = (i * 47 + 13) % 850 - 25
  const dur = heavy ? (0.5 + (i % 4) * 0.1) : (0.8 + (i % 5) * 0.12)
  const del = delay + (i * 0.09) % 1.5
  const h = heavy ? (12 + (i % 3) * 6) : (8 + (i % 4) * 5)
  const op = heavy ? (0.55 + (i % 3) * 0.12) : (0.3 + (i % 3) * 0.1)
  return <line key={i} x1={x} y1={0} x2={x - (heavy ? 18 : 10)} y2={h} stroke={heavy ? 'rgba(180,200,255,0.7)' : 'rgba(180,210,255,0.5)'} strokeWidth={heavy ? 1.2 : 0.8} style={{ animation: `bg-rain-h ${dur}s ${del}s linear infinite`, opacity: op }} />
})

const Snowflakes = ({ n = 8 }) => Array.from({ length: n }, (_, i) => {
  const x = (i * 53 + 29) % 800
  const size = 4 + (i % 4) * 3
  const dur = 6 + (i % 5) * 1.5
  const del = (i * 0.4) % 5
  return <text key={i} x={x} y={-20} fontSize={size} textAnchor="middle" fill="white" style={{ animation: `bg-snow-fall ${dur}s ${del}s linear infinite`, opacity: 0.7 }}>❄</text>
})

// ── 49 Theme Scenes ────────────────────────────────────────────────────────────

function Scene_coral() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="bg-scene-svg">
      <defs>
        <linearGradient id="c-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff6b6b" />
          <stop offset="50%" stopColor="#ff8e53" />
          <stop offset="100%" stopColor="#ffa07a" />
        </linearGradient>
        <linearGradient id="c-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff7060" />
          <stop offset="100%" stopColor="#cc4444" />
        </linearGradient>
      </defs>
      <rect width={800} height={450} fill="url(#c-sky)" />
      {/* Sun */}
      <circle cx={650} cy={130} r={55} fill="#ffe04a" style={{ animation: 'bg-pulse-sm 4s ease-in-out infinite' }} />
      <circle cx={650} cy={130} r={70} fill="#ffe04a" opacity={0.25} style={{ animation: 'bg-pulse 5s ease-in-out infinite' }} />
      {/* Clouds */}
      <CloudShape x={120} y={98} w={160} fill="rgba(255,255,255,.35)" style={{ animation: 'bg-cloud-drift 8s ease-in-out infinite alternate' }} />
      <CloudShape x={280} y={82} w={120} fill="rgba(255,255,255,.3)" style={{ animation: 'bg-cloud-drift 8s ease-in-out infinite alternate' }} />
      <CloudShape x={490} y={118} w={140} fill="rgba(255,255,255,.25)" style={{ animation: 'bg-cloud-drift 10s ease-in-out infinite alternate-reverse' }} />
      {/* Waves */}
      <ellipse cx={400} cy={380} rx={500} ry={60} fill="rgba(255,100,80,.5)" />
      <ellipse cx={400} cy={420} rx={600} ry={80} fill="rgba(200,60,50,.6)" />
      <rect x={0} y={430} width={800} height={70} fill="url(#c-sea)" />
      {/* Palm trees */}
      <g style={{ animation: 'bg-sway-tree 3.5s ease-in-out infinite' }}>
        <rect x={80} y={260} width={14} height={160} rx={6} fill="#8B6040" />
        <ellipse cx={87} cy={265} rx={48} ry={22} fill="#2d7a2d" transform="rotate(-20,87,265)" />
        <ellipse cx={87} cy={260} rx={52} ry={20} fill="#3a9a3a" transform="rotate(10,87,260)" />
        <ellipse cx={87} cy={270} rx={42} ry={16} fill="#2d7a2d" transform="rotate(-40,87,270)" />
      </g>
      <g style={{ animation: 'bg-sway-tree 4s 0.5s ease-in-out infinite' }}>
        <rect x={690} y={270} width={12} height={150} rx={5} fill="#8B6040" />
        <ellipse cx={696} cy={275} rx={44} ry={20} fill="#2d7a2d" transform="rotate(20,696,275)" />
        <ellipse cx={696} cy={270} rx={48} ry={18} fill="#3a9a3a" transform="rotate(-10,696,270)" />
        <ellipse cx={696} cy={280} rx={38} ry={14} fill="#2d7a2d" transform="rotate(38,696,280)" />
      </g>
      {/* Birds */}
      <g style={{ animation: 'bg-drift-lr 18s ease-in-out infinite' }}>
        <path d="M0,0 Q4,-5 8,0 Q12,-5 16,0" stroke="rgba(80,20,0,.5)" strokeWidth={1.5} fill="none" transform="translate(400,120)" />
        <path d="M0,0 Q4,-5 8,0 Q12,-5 16,0" stroke="rgba(80,20,0,.5)" strokeWidth={1.5} fill="none" transform="translate(425,130)" />
        <path d="M0,0 Q4,-5 8,0 Q12,-5 16,0" stroke="rgba(80,20,0,.5)" strokeWidth={1.5} fill="none" transform="translate(445,118)" />
      </g>
      {/* Sailboat on the sea */}
      <g style={{ animation: 'bg-drift-r 25s 2s linear infinite normal backwards' }}>
        <g transform="translate(0,380)">
          {/* Hull */}
          <path d="M-30,10 Q0,22 30,10 L28,-2 L-28,-2 Z" fill="#c84010" />
          {/* Mast */}
          <rect x={-1} y={-55} width={2} height={55} fill="#6a3a10" />
          {/* Sail */}
          <path d="M1,-52 L26,-10 L1,-10 Z" fill="rgba(255,255,255,.85)" />
          <path d="M-1,-48 L-22,-12 L-1,-12 Z" fill="rgba(255,240,200,.75)" />
        </g>
      </g>
      {/* Seagull gliding */}
      <g style={{ animation: 'bg-drift-l 22s 5s linear infinite normal backwards' }}>
        <path d="M640,170 Q648,164 656,170 Q664,164 672,170" stroke="rgba(80,30,0,.6)" strokeWidth={2} fill="none" />
        <path d="M660,175 Q668,169 676,175 Q684,169 692,175" stroke="rgba(80,30,0,.5)" strokeWidth={1.8} fill="none" />
      </g>
      {/* Starfish on beach */}
      {[{x:200,y:432},{x:580,y:428},{x:700,y:435}].map((s,i)=>(
        <text key={i} x={s.x} y={s.y} fontSize={18} fill="#ff6644" opacity={0.7} style={{ animation: `bg-float-sm ${3+i}s ${i}s ease-in-out infinite` }}>✦</text>
      ))}
      {/* Crab walking sideways */}
      <g transform="translate(-80,0)"><g style={{ animation: 'bg-drift-r 20s linear infinite' }}>
        <ellipse cx={100} cy={436} rx={16} ry={10} fill="#e85020" />
        <line x1={84} y1={434} x2={72} y2={428} stroke="#e85020" strokeWidth={3} strokeLinecap="round" />
        <line x1={84} y1={438} x2={70} y2={442} stroke="#e85020" strokeWidth={3} strokeLinecap="round" />
        <line x1={116} y1={434} x2={128} y2={428} stroke="#e85020" strokeWidth={3} strokeLinecap="round" />
        <line x1={116} y1={438} x2={130} y2={442} stroke="#e85020" strokeWidth={3} strokeLinecap="round" />
        <circle cx={93} cy={430} r={4} fill="#c03010" /><circle cx={107} cy={430} r={4} fill="#c03010" />
        <circle cx={94} cy={430} r={2} fill="#111" /><circle cx={108} cy={430} r={2} fill="#111" />
      </g>
      </g>
    </svg>
  )
}

function Scene_sunshine() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="bg-scene-svg">
      <defs>
        <linearGradient id="s-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#87ceeb" /><stop offset="100%" stopColor="#fffacd" />
        </linearGradient>
      </defs>
      <rect width={800} height={450} fill="url(#s-sky)" />
      {/* Big sun with rays */}
      <circle cx={400} cy={130} r={70} fill="#FFD700" opacity={0.9} style={{ animation: 'bg-pulse 6s ease-in-out infinite' }} />
      <circle cx={400} cy={130} r={95} fill="#FFD700" opacity={0.15} style={{ animation: 'bg-pulse 4s ease-in-out infinite' }} />
      {[0,30,60,90,120,150,180,210,240,270,300,330].map((a,i)=>(
        <line key={i} x1={400} y1={130} x2={400+Math.cos(a*Math.PI/180)*120} y2={130+Math.sin(a*Math.PI/180)*120} stroke="#FFD700" strokeWidth={3} opacity={0.35} style={{ animation: `bg-spin-slow ${8+i%3}s linear infinite`, transformOrigin: '400px 130px' }} />
      ))}
      {/* Rolling hills */}
      <ellipse cx={150} cy={410} rx={220} ry={110} fill="#7ec850" />
      <ellipse cx={500} cy={430} rx={250} ry={100} fill="#6db840" />
      <ellipse cx={760} cy={420} rx={180} ry={90} fill="#8dd860" />
      {/* Sunflowers */}
      {[100,260,420,580,720].map((x,i) => (
        <g key={i} style={{ animation: `bg-sway-sm ${3+i*.3}s ${i*.4}s ease-in-out infinite` }}>
          <rect x={x-3} y={380} width={6} height={80} rx={3} fill="#5a8a20" />
          <circle cx={x} cy={375} r={18} fill="#FFD700" />
          <circle cx={x} cy={375} r={10} fill="#8B4513" />
        </g>
      ))}
      {/* Butterflies */}
      {[{x:220,y:200,d:7},{x:550,y:170,d:9}].map((b,i)=>(
        <g key={i} style={{ animation: `bg-float ${b.d}s ${i}s ease-in-out infinite` }}>
          <ellipse cx={b.x} cy={b.y} rx={12} ry={7} fill="#ff9900" opacity={.7} transform={`rotate(-25,${b.x},${b.y})`} />
          <ellipse cx={b.x+2} cy={b.y} rx={10} ry={6} fill="#ff9900" opacity={.7} transform={`rotate(25,${b.x+2},${b.y})`} />
        </g>
      ))}
      {/* Clouds */}
      <CloudShape x={150} y={108} w={170} fill="rgba(255,255,255,.85)" />
      <CloudShape x={310} y={92} w={140} fill="rgba(255,255,255,.9)" />
      <CloudShape x={620} y={128} w={190} fill="rgba(255,255,255,.8)" />
      {/* Rainbow */}
      {['#ff4444','#ff8800','#ffee00','#44cc44','#4488ff','#8844ff'].map((c,i)=>(
        <path key={i} d={`M ${100+i*8},500 A ${300-i*8} ${200-i*5} 0 0 1 ${700-i*8},500`}
          fill="none" stroke={c} strokeWidth={12} opacity={0.25} />
      ))}
      {/* Kite flying */}
      <g transform="translate(500,150)">
        <g style={{ animation: 'bg-float 4s ease-in-out infinite' }}>
          <polygon points="0,-40 30,0 0,40 -30,0" fill="#ff4040" opacity={0.85} />
          <polygon points="0,-40 30,0 0,0" fill="#ffee40" opacity={0.85} />
          <polygon points="0,0 30,0 0,40" fill="#4080ff" opacity={0.85} />
          <polygon points="0,-40 -30,0 0,0" fill="#40c040" opacity={0.85} />
          {/* Tail */}
          <path d="M0,40 Q10,60 -5,80 Q10,100 0,120" stroke="#ff8800" strokeWidth={2} fill="none" strokeLinecap="round" />
          {/* String */}
          <path d="M0,40 Q20,80 60,140" stroke="rgba(0,0,0,.3)" strokeWidth={1} fill="none" />
        </g>
      </g>
      {/* Bee */}
      <g transform="translate(320,0)"><g style={{ animation: 'bg-float 2.5s ease-in-out infinite' }}>
        <ellipse cx={0} cy={280} rx={10} ry={7} fill="#ffee00" />
        <ellipse cx={0} cy={280} rx={10} ry={7} fill="none" stroke="#333" strokeWidth={1.5} />
        <ellipse cx={-4} cy={275} rx={8} ry={5} fill="rgba(200,220,255,0.5)" transform="rotate(-20,-4,275)" />
        <ellipse cx={4} cy={275} rx={8} ry={5} fill="rgba(200,220,255,0.5)" transform="rotate(20,4,275)" />
        <circle cx={0} cy={273} r={4} fill="#333" />
        <line x1={-2} y1={270} x2={-4} y2={266} stroke="#333" strokeWidth={1} />
        <line x1={2} y1={270} x2={4} y2={266} stroke="#333" strokeWidth={1} />
      </g>
      </g>
    </svg>
  )
}

function Scene_lion() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="bg-scene-svg">
      <defs>
        <linearGradient id="l-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e05c00" /><stop offset="50%" stopColor="#f5a030" /><stop offset="100%" stopColor="#ffd060" />
        </linearGradient>
      </defs>
      <rect width={800} height={450} fill="url(#l-sky)" />
      {/* Sun setting */}
      <circle cx={700} cy={340} r={80} fill="#FFD060" opacity={.9} style={{ animation: 'bg-glow 5s ease-in-out infinite' }} />
      <circle cx={700} cy={340} r={110} fill="#FF9920" opacity={.2} />
      {/* Ground */}
      <rect x={0} y={370} width={800} height={130} fill="#c8760a" />
      <ellipse cx={400} cy={370} rx={600} ry={40} fill="#d48020" />
      {/* Acacia tree */}
      <rect x={160} y={200} width={16} height={175} rx={6} fill="#8B5210" />
      <ellipse cx={168} cy={185} rx={75} ry={28} fill="#4a7a10" style={{ animation: 'bg-sway-sm 4s ease-in-out infinite' }} />
      <ellipse cx={148} cy={195} rx={55} ry={20} fill="#4a7a10" style={{ animation: 'bg-sway-sm 4s 0.4s ease-in-out infinite' }} />
      <ellipse cx={200} cy={192} rx={50} ry={18} fill="#5a8a20" style={{ animation: 'bg-sway-sm 4s 0.8s ease-in-out infinite' }} />
      {/* Lion — Simba-style, proper lion anatomy */}
      <g transform="translate(400,310)"><g style={{ animation: 'bg-float-sm 4s ease-in-out infinite' }}>
        {/* BODY — large rounded lion torso */}
        <ellipse cx={40} cy={60} rx={95} ry={60} fill="#d4903a" />
        {/* Chest lighter */}
        <ellipse cx={10} cy={65} rx={50} ry={40} fill="#e8aa50" opacity={0.5} />
        {/* Front legs */}
        <rect x={-30} y={100} width={28} height={55} rx={12} fill="#c88030" />
        <rect x={20} y={100} width={28} height={55} rx={12} fill="#c88030" />
        {/* Paws */}
        <ellipse cx={-16} cy={155} rx={18} ry={10} fill="#b87020" />
        <ellipse cx={34} cy={155} rx={18} ry={10} fill="#b87020" />
        {/* Tail curving up */}
        <path d="M130,50 C155,20 168,40 160,70 C155,88 142,82 138,70" stroke="#c06800" strokeWidth={10} fill="none" strokeLinecap="round" />
        <ellipse cx={138} cy={74} rx={16} ry={20} fill="#7a3c00" />

        {/* NECK — thick, connects body to head */}
        <ellipse cx={-18} cy={20} rx={32} ry={36} fill="#c88030" />

        {/* MANE — layered flowing tufts, not spiky sunrays */}
        {/* Outer mane — dark brown, irregular organic blobs */}
        <path d="M-72,-30 C-80,-58 -68,-80 -50,-88 C-32,-96 -14,-88 -8,-72" fill="#6b3200" />
        <path d="M-8,-72 C-2,-88 8,-96 22,-92 C36,-88 44,-74 40,-58" fill="#7a3c00" />
        <path d="M40,-58 C50,-72 64,-78 76,-70 C88,-62 88,-44 76,-30" fill="#6b3200" />
        <path d="M76,-30 C88,-14 86,8 74,20 C62,30 46,26 40,14" fill="#7a3c00" />
        <path d="M-72,-30 C-84,-14 -84,10 -72,22 C-60,32 -44,28 -38,14" fill="#6b3200" />
        {/* Inner mane — warmer brown */}
        <path d="M-58,-22 C-64,-46 -52,-66 -36,-70 C-18,-74 -6,-62 -4,-46" fill="#9a5214" />
        <path d="M-4,-46 C2,-60 14,-68 28,-64 C42,-60 48,-46 44,-34" fill="#a05a18" />
        <path d="M44,-34 C56,-46 68,-48 74,-38 C80,-26 74,-8 62,2" fill="#9a5214" />
        <path d="M62,2 C72,14 68,30 56,36 C44,40 32,32 28,20" fill="#a05a18" />
        <path d="M-58,-22 C-68,-8 -66,14 -54,24 C-42,32 -28,26 -24,14" fill="#9a5214" />
        {/* Mane bottom tuft — hangs below chin */}
        <path d="M-30,24 C-38,38 -28,52 -14,52 C0,52 12,40 8,26" fill="#7a3c00" />

        {/* HEAD — proper lion head shape, wider at cheeks */}
        <path d="M-48,-10 C-52,-34 -44,-58 -28,-68 C-12,-78 12,-78 28,-68 C44,-58 52,-34 48,-10 C44,12 30,28 8,34 C-14,38 -36,30 -48,-10 Z" fill="#e09840" />
        {/* Cheek puff left */}
        <ellipse cx={-44} cy={6} rx={18} ry={16} fill="#dda050" />
        {/* Cheek puff right */}
        <ellipse cx={44} cy={6} rx={18} ry={16} fill="#dda050" />
        {/* Forehead highlight */}
        <ellipse cx={0} cy={-30} rx={22} ry={16} fill="#eebb60" opacity={0.45} />

        {/* EARS — pointed, above mane */}
        <path d="M-32,-64 C-36,-84 -20,-96 -12,-88 C-8,-80 -14,-70 -20,-64 Z" fill="#c87c30" />
        <path d="M32,-64 C36,-84 20,-96 12,-88 C8,-80 14,-70 20,-64 Z" fill="#c87c30" />
        <path d="M-28,-68 C-30,-82 -20,-90 -14,-84 C-12,-78 -16,-72 -20,-68 Z" fill="#e06860" opacity={0.7} />
        <path d="M28,-68 C30,-82 20,-90 14,-84 C12,-78 16,-72 20,-68 Z" fill="#e06860" opacity={0.7} />

        {/* BROW ridges — give fierce expression */}
        <path d="M-28,-28 C-22,-36 -12,-38 -6,-34" stroke="#8a4a0c" strokeWidth={3} fill="none" strokeLinecap="round" />
        <path d="M28,-28 C22,-36 12,-38 6,-34" stroke="#8a4a0c" strokeWidth={3} fill="none" strokeLinecap="round" />
        {/* Eyes — large amber, round pupils (Simba style) */}
        <circle cx={-18} cy={-20} r={11} fill="#c88800" />
        <circle cx={18} cy={-20} r={11} fill="#c88800" />
        <circle cx={-18} cy={-20} r={7} fill="#7a5200" />
        <circle cx={18} cy={-20} r={7} fill="#7a5200" />
        <circle cx={-18} cy={-20} r={4} fill="#111" />
        <circle cx={18} cy={-20} r={4} fill="#111" />
        <circle cx={-14} cy={-23} r={2.5} fill="white" opacity={0.75} />
        <circle cx={22} cy={-23} r={2.5} fill="white" opacity={0.75} />

        {/* MUZZLE — wide protruding snout */}
        <ellipse cx={-12} cy={6} rx={16} ry={14} fill="#e8b070" />
        <ellipse cx={12} cy={6} rx={16} ry={14} fill="#e8b070" />
        {/* Nose bridge */}
        <ellipse cx={0} cy={-4} rx={10} ry={8} fill="#dda058" />
        {/* Nose — brown heart shape */}
        <path d="M-8,-2 C-8,-8 -2,-10 0,-6 C2,-10 8,-8 8,-2 C8,4 0,10 0,8 C0,10 -8,4 -8,-2 Z" fill="#c04820" />
        {/* Mouth */}
        <path d="M0,8 L0,14" stroke="#8a3010" strokeWidth={1.8} />
        <path d="M-14,16 Q0,24 14,16" stroke="#8a3010" strokeWidth={2} fill="none" />
        {/* Whisker dots */}
        {[-20,-12,-4,4,12,20].map((x,i)=>(
          <circle key={i} cx={x+(x<0?-12:12)} cy={6} r={1.8} fill="#9a6020" opacity={0.65} />
        ))}
        {/* Whiskers */}
        <line x1={-12} y1={4} x2={-48} y2={0} stroke="#d4a860" strokeWidth={1.2} opacity={0.8} />
        <line x1={-12} y1={10} x2={-48} y2={14} stroke="#d4a860" strokeWidth={1.2} opacity={0.8} />
        <line x1={12} y1={4} x2={48} y2={0} stroke="#d4a860" strokeWidth={1.2} opacity={0.8} />
        <line x1={12} y1={10} x2={48} y2={14} stroke="#d4a860" strokeWidth={1.2} opacity={0.8} />
      </g></g>
      {/* Giraffe neck peeking in from right */}
      <g transform="translate(730,180)">
        <g style={{ animation: 'bg-sway-sm 5s ease-in-out infinite' }}>
          {/* Neck */}
          <rect x={-14} y={0} width={28} height={180} rx={12} fill="#e8a030" />
          {/* Patches */}
          {[[0,20],[5,55],[-4,90],[3,125]].map(([dx,dy],i)=>(
            <ellipse key={i} cx={dx} cy={dy} rx={10} ry={14} fill="#7a4010" opacity={0.5} />
          ))}
          {/* Head */}
          <ellipse cx={0} cy={-15} rx={18} ry={14} fill="#e8a030" />
          {/* Eye */}
          <circle cx={-8} cy={-18} r={5} fill="#1a0c00" />
          <circle cx={-7} cy={-19} r={2} fill="white" opacity={0.6} />
          {/* Ossicones */}
          <rect x={-6} y={-32} width={4} height={14} rx={2} fill="#c07020" />
          <rect x={6} y={-30} width={4} height={12} rx={2} fill="#c07020" />
        </g>
      </g>
      {/* Zebra silhouette in background */}
      <g transform="translate(550,340)" opacity={0.6}>
        <ellipse cx={0} cy={0} rx={40} ry={22} fill="#e0d8d0" />
        <circle cx={-35} cy={-12} r={16} fill="#e0d8d0" />
        {/* Stripes */}
        {[-15,-5,5,15].map((x,i)=>(
          <line key={i} x1={x} y1={-20} x2={x+2} y2={20} stroke="#2a2420" strokeWidth={3} opacity={0.7} />
        ))}
        {/* Legs */}
        <rect x={-28} y={18} width={7} height={22} rx={3} fill="#e0d8d0" />
        <rect x={-12} y={18} width={7} height={22} rx={3} fill="#e0d8d0" />
        <rect x={4} y={18} width={7} height={22} rx={3} fill="#e0d8d0" />
        <rect x={18} y={18} width={7} height={22} rx={3} fill="#e0d8d0" />
      </g>
      {/* Grass blades */}
      {Array.from({length:12},(_,i)=>(
        <line key={i} x1={i*70+20} y1={370} x2={i*70+30} y2={340} stroke="#4a6010" strokeWidth={2} style={{ animation: `bg-sway-sm ${2+i*.2}s ${i*.15}s ease-in-out infinite` }} />
      ))}
    </svg>
  )
}

function Scene_galaxy() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="bg-scene-svg">
      <defs>
        <radialGradient id="gal-g" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#e8b0ff" stopOpacity={0.4} />
          <stop offset="40%" stopColor="#6040c0" stopOpacity={0.2} />
          <stop offset="100%" stopColor="#0a0020" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="gal-bg" cx="50%" cy="40%">
          <stop offset="0%" stopColor="#1a0838" /><stop offset="100%" stopColor="#050010" />
        </radialGradient>
      </defs>
      <rect width={800} height={450} fill="url(#gal-bg)" />
      <Stars n={80} />
      {/* Spiral galaxy */}
      <g style={{ animation: 'bg-galaxy-spin 40s linear infinite', transformOrigin: '400px 230px' }}>
        <ellipse cx={400} cy={230} rx={180} ry={60} fill="url(#gal-g)" />
        <ellipse cx={400} cy={230} rx={120} ry={40} fill="#c090ff" opacity={0.2} />
        <ellipse cx={400} cy={230} rx={50} ry={18} fill="#f0c8ff" opacity={0.4} />
        <circle cx={400} cy={230} r={12} fill="white" opacity={0.7} />
      </g>
      {/* Shooting stars */}
      {[{x1:100,y1:60,x2:220,y2:120},{x1:600,y1:40,x2:700,y2:90},{x1:300,y1:350,x2:430,y2:400}].map((s,i)=>(
        <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke="white" strokeWidth={1.5}
          strokeDasharray="80 80" style={{ animation: `bg-shooting-star ${4+i}s ${i*2.5}s linear infinite` }} />
      ))}
      {/* Nebula clouds */}
      <ellipse cx={150} cy={380} rx={140} ry={70} fill="#4020a0" opacity={0.2} />
      <ellipse cx={680} cy={100} rx={120} ry={60} fill="#a02060" opacity={0.18} />
      <ellipse cx={550} cy={420} rx={130} ry={55} fill="#204080" opacity={0.2} />
      {/* Rocket — launches bottom to top */}
      <g style={{ animation: 'bg-launch 14s 2s linear infinite normal backwards' }}>
        <g transform="translate(380, 0)">
          {/* Body */}
          <rect x={-11} y={-55} width={22} height={66} rx={7} fill="#d8e0f0" />
          {/* Nose cone */}
          <polygon points="-11,-55 0,-86 11,-55" fill="#cc2222" />
          {/* Side fins */}
          <polygon points="-11,6 -28,32 -11,32" fill="#cc2222" />
          <polygon points="11,6 28,32 11,32" fill="#cc2222" />
          {/* Porthole */}
          <circle cx={0} cy={-28} r={8} fill="#80c8ff" opacity={0.85} />
          <circle cx={0} cy={-28} r={5} fill="#c0e8ff" opacity={0.5} />
          {/* Flag stripe */}
          <rect x={-11} y={-18} width={22} height={5} fill="#cc2222" opacity={0.5} />
          {/* Booster — multi-layer flickering flame */}
          <g style={{ animation: 'bg-booster 0.12s ease-in-out infinite' }}>
            <ellipse cx={0} cy={52} rx={14} ry={22} fill="#ffaa00" opacity={0.95} />
            <ellipse cx={0} cy={48} rx={9} ry={15} fill="#ff6600" opacity={1} />
            <ellipse cx={0} cy={45} rx={5} ry={9} fill="#ffee00" opacity={1} />
          </g>
          <g style={{ animation: 'bg-booster 0.19s 0.06s ease-in-out infinite' }}>
            <ellipse cx={0} cy={58} rx={9} ry={16} fill="#ff4400" opacity={0.7} />
          </g>
        </g>
      </g>
      {/* UFO hovering */}
      <g transform="translate(580,260)">
        <g style={{ animation: 'bg-float 4s 1s ease-in-out infinite' }}>
          <ellipse cx={0} cy={0} rx={50} ry={16} fill="#c0c8d8" />
          <ellipse cx={0} cy={-8} rx={28} ry={18} fill="#a0b0c8" />
          <ellipse cx={0} cy={-10} rx={18} ry={12} fill="#80f0ff" opacity={0.5} />
          {/* Lights */}
          {[-25,-12,0,12,25].map((x,i)=>(
            <circle key={i} cx={x} cy={6} r={3} fill={['#ff4040','#ffee40','#40ff80','#40c0ff','#ff80ff'][i]} style={{ animation: `bg-twinkle ${0.8+i*.2}s ${i*.15}s ease-in-out infinite` }} />
          ))}
          {/* Beam */}
          <polygon points="-15,14 15,14 30,60 -30,60" fill="rgba(160,240,255,.12)" />
        </g>
      </g>
    </svg>
  )
}

function Scene_moon() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="bg-scene-svg">
      <defs>
        <radialGradient id="moon-bg" cx="30%" cy="20%"><stop offset="0%" stopColor="#0c1a3a" /><stop offset="100%" stopColor="#020610" /></radialGradient>
        <radialGradient id="earth-g" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#5bbfff"/>
          <stop offset="50%" stopColor="#1a6dcc"/>
          <stop offset="100%" stopColor="#08204a"/>
        </radialGradient>
        <radialGradient id="earth-atm" cx="50%" cy="50%">
          <stop offset="68%" stopColor="rgba(0,0,0,0)"/>
          <stop offset="100%" stopColor="rgba(80,160,255,0.32)"/>
        </radialGradient>
        <clipPath id="earth-clip"><circle cx={680} cy={100} r={63}/></clipPath>
      </defs>
      <rect width={800} height={450} fill="url(#moon-bg)" />
      <Stars n={90} />
      {/* Earth rising — ocean base */}
      <circle cx={680} cy={100} r={65} fill="url(#earth-g)" style={{ animation: 'bg-glow 6s ease-in-out infinite' }} />
      {/* Continents clipped to Earth disk */}
      <g clipPath="url(#earth-clip)">
        {/* Americas */}
        <path d="M636,58 Q626,70 629,86 Q632,102 640,114 Q637,130 634,142 Q638,154 647,157 Q654,153 653,140 Q649,126 652,112 Q658,100 659,86 Q656,70 647,60Z" fill="#3d8c30" opacity={0.88}/>
        {/* Greenland */}
        <ellipse cx={645} cy={50} rx={10} ry={7} fill="#4a9438" opacity={0.75}/>
        {/* Europe */}
        <path d="M681,52 Q690,47 700,55 Q705,64 700,73 Q694,77 687,74 Q682,68 681,58Z" fill="#4a9438" opacity={0.85}/>
        {/* Africa */}
        <path d="M684,80 Q694,76 702,84 Q708,97 705,112 Q707,126 703,140 Q699,154 692,157 Q685,155 682,144 Q680,130 684,118 Q686,105 684,93Z" fill="#5a9e40" opacity={0.85}/>
        {/* Eurasia */}
        <path d="M700,50 Q714,44 726,52 Q732,62 726,70 Q716,74 706,70 Q700,63 700,54Z" fill="#4a9438" opacity={0.78}/>
        <path d="M726,54 Q738,50 744,60 Q742,70 734,72 Q726,70 724,62Z" fill="#4a9438" opacity={0.68}/>
        {/* Australia */}
        <path d="M718,120 Q728,116 735,123 Q737,133 730,138 Q720,138 716,131Z" fill="#5a9e40" opacity={0.72}/>
        {/* Cloud formations — irregular lumpy shapes */}
        <path d="M633,68 Q637,62 643,63 Q645,58 651,60 Q657,58 659,64 Q663,63 664,68 Q663,73 657,73 Q654,76 649,74 Q644,76 640,74 Q635,73 633,68Z" fill="white" opacity={0.58}/>
        <path d="M655,108 Q659,102 665,104 Q668,100 674,101 Q679,99 681,104 Q684,103 685,108 Q684,113 679,113 Q676,116 671,114 Q666,116 661,114 Q656,113 655,108Z" fill="white" opacity={0.48}/>
        <path d="M694,80 Q698,75 703,76 Q705,71 710,73 Q714,71 715,76 Q718,76 718,81 Q717,85 712,85 Q709,88 705,86 Q701,88 697,86 Q694,84 694,80Z" fill="white" opacity={0.42}/>
        <path d="M667,138 Q671,132 677,133 Q680,129 686,131 Q690,130 691,135 Q693,140 689,142 Q685,145 680,143 Q675,145 670,143 Q666,141 667,138Z" fill="white" opacity={0.38}/>
        <path d="M715,105 Q718,101 722,102 Q724,98 728,100 Q731,99 731,104 Q731,108 727,109 Q724,111 720,110 Q716,111 714,108 Q713,105 715,105Z" fill="white" opacity={0.34}/>
      </g>
      {/* Atmosphere halo */}
      <circle cx={680} cy={100} r={65} fill="url(#earth-atm)"/>
      <circle cx={680} cy={100} r={67} fill="none" stroke="#6ab4ff" strokeWidth={3} opacity={0.22}/>
      {/* Lunar ground */}
      <ellipse cx={400} cy={440} rx={550} ry={120} fill="#c8c0b0" />
      <ellipse cx={400} cy={420} rx={500} ry={80} fill="#d8d0c0" />
      {/* Craters */}
      {[{cx:200,cy:450,rx:40,ry:15},{cx:500,cy:460,rx:55,ry:18},{cx:650,cy:445,rx:30,ry:10}].map((c,i)=>(
        <ellipse key={i} {...c} fill="none" stroke="#b8b0a0" strokeWidth={3} opacity={0.6} />
      ))}
      {/* Astronaut */}
      <g transform="translate(390,370)"><g style={{ animation: 'bg-float 5s ease-in-out infinite' }}>
        <ellipse cx={0} cy={-35} rx={28} ry={32} fill="#e0e0e0" /> {/* helmet */}
        <ellipse cx={0} cy={-35} rx={18} ry={20} fill="#aad4ff" opacity={0.5} /> {/* visor */}
        <rect x={-22} y={-10} width={44} height={50} rx={10} fill="#e8e8e8" /> {/* suit */}
        <rect x={-36} y={-5} width={16} height={35} rx={8} fill="#ddd" /> {/* arm L */}
        <rect x={20} y={-5} width={16} height={35} rx={8} fill="#ddd" /> {/* arm R */}
        <rect x={-16} y={38} width={14} height={30} rx={6} fill="#ddd" /> {/* leg L */}
        <rect x={4} y={38} width={14} height={30} rx={6} fill="#ddd" /> {/* leg R */}
        <circle cx={-30} cy={28} r={8} fill="#ccc" /> {/* boot L */}
        <circle cx={30} cy={28} r={8} fill="#ccc" /> {/* boot R */}
      </g>
      </g>
      {/* Neutral space exploration flag — white with globe symbol, no country */}
      <rect x={440} y={335} width={4} height={55} fill="#bbb" />
      <g style={{ animation: 'bg-flag-wave 2s ease-in-out infinite', transformBox: 'fill-box', transformOrigin: 'left center' }}>
        <rect x={444} y={335} width={36} height={24} fill="#f0f0f0" />
        <rect x={444} y={335} width={36} height={3} fill="#4488cc" opacity={0.55}/>
        <rect x={444} y={356} width={36} height={3} fill="#4488cc" opacity={0.55}/>
        {/* Globe icon: circle + latitude + longitude lines */}
        <circle cx={462} cy={347} r={7} fill="none" stroke="#2255aa" strokeWidth={1.4}/>
        <line x1={455} y1={347} x2={469} y2={347} stroke="#2255aa" strokeWidth={1}/>
        <ellipse cx={462} cy={347} rx={4} ry={7} fill="none" stroke="#2255aa" strokeWidth={1}/>
      </g>
      {/* Rocket — launches bottom to top */}
      <g style={{ animation: 'bg-launch 18s 5s linear infinite normal backwards' }}>
        <g transform="translate(400, 0)">
          {/* Body */}
          <rect x={-9} y={-44} width={18} height={54} rx={6} fill="#e8eef8" />
          {/* Nose cone */}
          <polygon points="-9,-44 0,-70 9,-44" fill="#ff4040" />
          {/* Side fins */}
          <polygon points="-9,5 -24,28 -9,28" fill="#ff4040" />
          <polygon points="9,5 24,28 9,28" fill="#ff4040" />
          {/* Porthole */}
          <circle cx={0} cy={-22} r={7} fill="#60c8ff" opacity={0.85} />
          <circle cx={0} cy={-22} r={4} fill="#a0e0ff" opacity={0.5} />
          {/* Booster */}
          <g style={{ animation: 'bg-booster 0.14s ease-in-out infinite' }}>
            <ellipse cx={0} cy={44} rx={11} ry={18} fill="#ffaa00" opacity={0.95} />
            <ellipse cx={0} cy={40} rx={7} ry={12} fill="#ff6600" opacity={1} />
            <ellipse cx={0} cy={38} rx={4} ry={7} fill="#ffee00" opacity={1} />
          </g>
          <g style={{ animation: 'bg-booster 0.21s 0.07s ease-in-out infinite' }}>
            <ellipse cx={0} cy={50} rx={7} ry={13} fill="#ff4400" opacity={0.65} />
          </g>
        </g>
      </g>
    </svg>
  )
}

function Scene_stardust() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="bg-scene-svg">
      <defs>
        <radialGradient id="sd-bg" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#1e0a5a"/>
          <stop offset="55%" stopColor="#0e0430"/>
          <stop offset="100%" stopColor="#020110"/>
        </radialGradient>
        {/* Nebula layers */}
        <radialGradient id="sd-neb1" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#9040ff" stopOpacity="0.28"/>
          <stop offset="100%" stopColor="#9040ff" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="sd-neb2" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#ff3888" stopOpacity="0.22"/>
          <stop offset="100%" stopColor="#ff3888" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="sd-neb3" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#20aaff" stopOpacity="0.2"/>
          <stop offset="100%" stopColor="#20aaff" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="sd-neb4" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#ff9020" stopOpacity="0.18"/>
          <stop offset="100%" stopColor="#ff9020" stopOpacity="0"/>
        </radialGradient>
        {/* Milky way arc gradient */}
        <linearGradient id="sd-mw" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b0a0ff" stopOpacity="0"/>
          <stop offset="30%" stopColor="#d0c8ff" stopOpacity="0.12"/>
          <stop offset="55%" stopColor="#e0d8ff" stopOpacity="0.18"/>
          <stop offset="80%" stopColor="#c0b8ff" stopOpacity="0.1"/>
          <stop offset="100%" stopColor="#b0a0ff" stopOpacity="0"/>
        </linearGradient>
        <filter id="sd-blur"><feGaussianBlur stdDeviation="18"/></filter>
        <filter id="sd-blur-sm"><feGaussianBlur stdDeviation="6"/></filter>
      </defs>
      <rect width={800} height={450} fill="url(#sd-bg)" />

      {/* Milky way band — diagonal arc of soft luminosity */}
      <ellipse cx={400} cy={225} rx={520} ry={90} fill="url(#sd-mw)" transform="rotate(-28,400,225)" filter="url(#sd-blur)"/>
      <ellipse cx={400} cy={225} rx={380} ry={55} fill="url(#sd-mw)" transform="rotate(-28,400,225)" filter="url(#sd-blur)" opacity={0.7}/>

      {/* Nebula clouds — large soft colour washes */}
      <ellipse cx={160} cy={130} rx={220} ry={140} fill="url(#sd-neb1)" filter="url(#sd-blur)" style={{ animation: 'bg-pulse 8s ease-in-out infinite' }}/>
      <ellipse cx={660} cy={320} rx={240} ry={150} fill="url(#sd-neb2)" filter="url(#sd-blur)" style={{ animation: 'bg-pulse 10s 2s ease-in-out infinite' }}/>
      <ellipse cx={420} cy={80} rx={200} ry={110} fill="url(#sd-neb3)" filter="url(#sd-blur)" style={{ animation: 'bg-pulse 7s 1s ease-in-out infinite' }}/>
      <ellipse cx={680} cy={100} rx={160} ry={100} fill="url(#sd-neb4)" filter="url(#sd-blur)" style={{ animation: 'bg-pulse 9s 3s ease-in-out infinite' }}/>

      {/* Dense star field */}
      <Stars n={130} />

      {/* Bright coloured star clusters */}
      {[
        {cx:155,cy:125,r:2.8,c:'#c090ff'},{cx:668,cy:310,r:3.2,c:'#ff80c0'},
        {cx:420,cy:72,r:2.5,c:'#80d0ff'},{cx:290,cy:200,r:2.2,c:'#ffd080'},
        {cx:580,cy:155,r:2.6,c:'#90ffcc'},{cx:740,cy:260,r:2,c:'#ff90a0'},
      ].map((s,i)=>(
        <g key={i}>
          <circle cx={s.cx} cy={s.cy} r={s.r*3} fill={s.c} opacity={0.18} filter="url(#sd-blur-sm)"/>
          <circle cx={s.cx} cy={s.cy} r={s.r} fill={s.c} opacity={0.9} style={{ animation: `bg-twinkle ${2+i*.4}s ${i*.3}s ease-in-out infinite` }}/>
        </g>
      ))}

      {/* Shooting stars — fast diagonal streaks with glow tail */}
      {[
        {x:80, y:60,  dx:180,dy:80,  delay:'0s',  dur:'6s'},
        {x:500,y:30,  dx:160,dy:70,  delay:'3.5s', dur:'7s'},
        {x:650,y:180, dx:120,dy:55,  delay:'1.8s', dur:'9s'},
        {x:200,y:350, dx:140,dy:60,  delay:'5s',   dur:'8s'},
      ].map((s,i)=>(
        <g key={i}>
          <line x1={s.x} y1={s.y} x2={s.x+s.dx} y2={s.y+s.dy}
            stroke="#fff8d0" strokeWidth={2.5} strokeLinecap="round"
            strokeDasharray="100 400"
            style={{ animation: `bg-shooting-star ${s.dur} ${s.delay} linear infinite` }} opacity={0.9}/>
          <line x1={s.x} y1={s.y} x2={s.x+s.dx} y2={s.y+s.dy}
            stroke="#ffe080" strokeWidth={6} strokeLinecap="round"
            strokeDasharray="60 440"
            style={{ animation: `bg-shooting-star ${s.dur} ${s.delay} linear infinite` }} opacity={0.3}/>
        </g>
      ))}

      {/* Comet — large slow-moving with proper ion tail */}
      <g style={{ animation: 'bg-drift-l 40s 2s linear infinite normal backwards' }}>
        <g transform="translate(820,140)">
          {/* Ion tail — long narrow gradient */}
          <path d="M0,0 Q-120,-8 -320,-25 Q-220,-2 -320,20 Q-120,8 0,0Z" fill="#a0e0ff" opacity={0.18}/>
          <path d="M0,0 Q-80,-4 -200,-14 Q-140,-1 -200,12 Q-80,4 0,0Z" fill="#c0eeff" opacity={0.28}/>
          <path d="M0,0 Q-40,-2 -100,-6 Q-70,0 -100,6 Q-40,2 0,0Z" fill="#e0f8ff" opacity={0.4}/>
          {/* Coma glow */}
          <circle cx={0} cy={0} r={18} fill="#d0f0ff" opacity={0.3} filter="url(#sd-blur-sm)"/>
          {/* Nucleus */}
          <circle cx={0} cy={0} r={6} fill="white" opacity={0.95}/>
          <circle cx={-2} cy={-2} r={3} fill="#e0f8ff" opacity={0.7}/>
        </g>
      </g>

      {/* Stardust particle trails — tiny glittering chains */}
      {[
        {x:100,y:180,rot:38, c:'#ffb0ff'},
        {x:480,y:90, rot:-22,c:'#80ffee'},
        {x:640,y:290,rot:55, c:'#ffe8a0'},
        {x:260,y:310,rot:-40,c:'#a0b8ff'},
      ].map((t,i)=>(
        <g key={i} style={{ animation: `bg-drift-l ${14+i*3}s ${i*2.5}s linear infinite normal backwards` }}>
          <g transform={`rotate(${t.rot},${t.x},${t.y})`}>
            {Array.from({length:10},(_,j)=>(
              <circle key={j} cx={t.x+j*14} cy={t.y+(j%3-1)*3} r={Math.max(0.5,2.5-j*.2)}
                fill={t.c} opacity={0.85-j*.08}
                style={{ animation: `bg-twinkle ${1.2+j*.15}s ${j*.08}s ease-in-out infinite` }}/>
            ))}
          </g>
        </g>
      ))}

      {/* Galaxy swirl — top right corner */}
      <g transform="translate(700,80)">
        {Array.from({length:3},(_,arm)=>(
          <g key={arm} transform={`rotate(${arm*120})`}>
            {Array.from({length:14},(_,j)=>{
              const a=j*.25, r=j*9+5;
              return <circle key={j} cx={r*Math.cos(a)} cy={r*Math.sin(a)} r={2.5-j*.12}
                fill={['#c0b0ff','#ffa0cc','#a0d8ff'][arm]} opacity={0.6-j*.04}
                style={{ animation: `bg-twinkle ${2+j*.2}s ${j*.15+arm}s ease-in-out infinite` }}/>;
            })}
          </g>
        ))}
        <circle cx={0} cy={0} r={8} fill="white" opacity={0.7} filter="url(#sd-blur-sm)"/>
        <circle cx={0} cy={0} r={3} fill="white" opacity={0.95}/>
      </g>
    </svg>
  )
}

function Scene_robot() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="bg-scene-svg">
      <defs>
        <linearGradient id="rob-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0a1a2a" /><stop offset="100%" stopColor="#051015" /></linearGradient>
      </defs>
      <rect width={800} height={450} fill="url(#rob-bg)" />
      {/* Circuit board lines */}
      {Array.from({length:10},(_,i)=>(
        <g key={i} stroke="#00ff8820" strokeWidth={1}>
          <line x1={i*80} y1={0} x2={i*80} y2={500} />
          <line x1={0} y1={i*50} x2={800} y2={i*50} />
        </g>
      ))}
      {/* Circuit nodes */}
      {Array.from({length:15},(_,i)=>(
        <circle key={i} cx={(i*113+27)%800} cy={(i*83+41)%500} r={4} fill="#00ff88" style={{ animation: `bg-twinkle ${2+i*.3}s ${i*.2}s ease-in-out infinite` }} />
      ))}
      {/* Binary rain */}
      {Array.from({length:12},(_,i)=>(
        <text key={i} x={(i*67+10)%780} y={0} fill="#00ff88" fontSize={11} opacity={0.3} style={{ animation: `bg-fall ${3+i*.4}s ${i*.3}s linear infinite` }}>{i%2}</text>
      ))}
      {/* Robot — nested groups fix CSS/SVG transform conflict */}
      <g transform="translate(400,260)"><g style={{ animation: 'bg-float 4s ease-in-out infinite' }}>
        {/* Head */}
        <rect x={-40} y={-120} width={80} height={70} rx={8} fill="#4080c0" />
        <rect x={-28} y={-108} width={56} height={35} rx={4} fill="#203060" />
        {/* Eyes */}
        <circle cx={-14} cy={-90} r={10} fill="#00ffff" style={{ animation: 'bg-blink 4s ease-in-out infinite' }} />
        <circle cx={14} cy={-90} r={10} fill="#00ffff" style={{ animation: 'bg-blink 4s 0.1s ease-in-out infinite' }} />
        {/* Laser beams */}
        <line x1={-14} y1={-90} x2={-90} y2={-55} stroke="#00ffff" strokeWidth={2} opacity={0.65} style={{ animation: 'bg-glow-fast 1s ease-in-out infinite' }} />
        <line x1={14} y1={-90} x2={90} y2={-55} stroke="#00ffff" strokeWidth={2} opacity={0.65} style={{ animation: 'bg-glow-fast 1s 0.1s ease-in-out infinite' }} />
        {/* Antenna */}
        <rect x={-3} y={-145} width={6} height={28} fill="#60a0e0" />
        <circle cx={0} cy={-148} r={7} fill="#ff6040" style={{ animation: 'bg-glow-fast 1.5s ease-in-out infinite' }} />
        {/* Body */}
        <rect x={-50} y={-45} width={100} height={90} rx={10} fill="#3060a0" />
        {/* Chest panel */}
        <rect x={-30} y={-30} width={60} height={50} rx={5} fill="#203060" />
        {[[-18,-18],[0,-18],[18,-18],[-18,-5],[0,-5],[18,-5]].map(([dx,dy],i)=>(
          <circle key={i} cx={dx} cy={dy} r={4} fill={['#ff4040','#ffff40','#40ff40'][i%3]} style={{ animation: `bg-glow ${1+i*.3}s ${i*.2}s ease-in-out infinite` }} />
        ))}
        {/* Arms */}
        <rect x={-78} y={-40} width={28} height={68} rx={12} fill="#4080c0" />
        <rect x={50} y={-40} width={28} height={68} rx={12} fill="#4080c0" />
        {/* Hands — both sides */}
        <circle cx={-64} cy={32} r={14} fill="#3570b0" />
        <circle cx={64} cy={32} r={14} fill="#3570b0" />
        {/* Finger joints */}
        {[[-78,-10],[-50,-10]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r={4} fill="#5090d0" opacity={0.6} />
        ))}
        {/* Legs */}
        <rect x={-35} y={48} width={28} height={55} rx={10} fill="#3060a0" />
        <rect x={8} y={48} width={28} height={55} rx={10} fill="#3060a0" />
        <rect x={-40} y={96} width={38} height={18} rx={8} fill="#4080c0" />
        <rect x={3} y={96} width={38} height={18} rx={8} fill="#4080c0" />
      </g></g>
      {/* Small robot sidekick — nested groups */}
      <g transform="translate(580,360)"><g style={{ animation: 'bg-float-sm 3s 1s ease-in-out infinite' }}>
        <rect x={-20} y={-50} width={40} height={30} rx={5} fill="#3060a0" />
        <rect x={-14} y={-44} width={28} height={16} rx={3} fill="#102040" />
        <circle cx={-6} cy={-36} r={5} fill="#00ffff" style={{ animation: 'bg-blink 3s ease-in-out infinite' }} />
        <circle cx={6} cy={-36} r={5} fill="#00ffff" style={{ animation: 'bg-blink 3s 0.15s ease-in-out infinite' }} />
        <rect x={-2} y={-64} width={4} height={16} fill="#50a0d0" />
        <circle cx={0} cy={-65} r={4} fill="#ff6040" style={{ animation: 'bg-glow-fast 2s ease-in-out infinite' }} />
        <rect x={-25} y={-18} width={50} height={40} rx={5} fill="#2050a0" />
        <rect x={-16} y={24} width={12} height={22} rx={4} fill="#2050a0" />
        <rect x={6} y={24} width={12} height={22} rx={4} fill="#2050a0" />
        {/* Right waving arm */}
        <rect x={-35} y={-14} width={12} height={30} rx={6} fill="#3060a0" style={{ animation: 'bg-sway 2s 1s ease-in-out infinite', transformOrigin: '-29px -14px', transformBox: 'fill-box' }} />
        {/* Left waving arm */}
        <rect x={23} y={-14} width={12} height={30} rx={6} fill="#3060a0" style={{ animation: 'bg-sway 2s ease-in-out infinite', transformOrigin: '29px -14px', transformBox: 'fill-box' }} />
      </g></g>
    </svg>
  )
}

function Scene_curiositylab() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="bg-scene-svg">
      <defs>
        <linearGradient id="lab-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0a1a30" /><stop offset="100%" stopColor="#162840" /></linearGradient>
      </defs>
      <rect width={800} height={450} fill="url(#lab-bg)" />
      {/* Spinning atom */}
      <g style={{ animation: 'bg-spin 8s linear infinite', transformOrigin: '400px 200px' }}>
        <ellipse cx={400} cy={200} rx={100} ry={40} fill="none" stroke="#60ccff" strokeWidth={2} opacity={0.6} />
      </g>
      <g style={{ animation: 'bg-spin-ccw 6s linear infinite', transformOrigin: '400px 200px' }}>
        <ellipse cx={400} cy={200} rx={100} ry={40} fill="none" stroke="#ff80ff" strokeWidth={2} opacity={0.6} transform="rotate(60,400,200)" />
      </g>
      <g style={{ animation: 'bg-spin 10s linear infinite', transformOrigin: '400px 200px' }}>
        <ellipse cx={400} cy={200} rx={100} ry={40} fill="none" stroke="#80ffaa" strokeWidth={2} opacity={0.6} transform="rotate(120,400,200)" />
      </g>
      <circle cx={400} cy={200} r={18} fill="#ffffff" opacity={0.9} style={{ animation: 'bg-pulse-sm 2s ease-in-out infinite' }} />
      {/* Flask + bubbles */}
      <g transform="translate(150,280)">
        <path d="M-20,-80 L-20,-10 Q-20,30 0,40 Q20,30 20,-10 L20,-80 Z" fill="#204080" opacity={0.7} />
        <path d="M-20,-80 L-20,-10 Q-20,30 0,40 Q20,30 20,-10 L20,-80 Z" fill="#3060ff" opacity={0.3} />
        <rect x={-25} y={-88} width={50} height={10} rx={4} fill="#406090" />
        {/* bubbles */}
        {[{cy:20,r:5},{cy:-10,r:4},{cy:-30,r:3}].map((b,i)=>(
          <circle key={i} cx={(i-1)*6} cy={b.cy} r={b.r} fill="#80c0ff" opacity={0.6} style={{ animation: `bg-drift-up ${2+i*.5}s ${i*.4}s linear infinite` }} />
        ))}
      </g>
      {/* Test tube */}
      <g transform="translate(650,300)">
        <path d="M-12,-100 L-12,20 Q-12,40 0,45 Q12,40 12,20 L12,-100 Z" fill="#ff8040" opacity={0.5} />
        <rect x={-16} y={-108} width={32} height={10} rx={4} fill="#c06030" opacity={0.7} />
      </g>
      {/* Stars = particles */}
      {Array.from({length:20},(_,i)=>(
        <circle key={i} cx={(i*113+27)%800} cy={(i*73+50)%200+280} r={2} fill={['#60ccff','#ff80ff','#80ffaa'][i%3]} style={{ animation: `bg-twinkle ${1.5+i*.2}s ${i*.15}s ease-in-out infinite` }} />
      ))}
      {/* Bubbles from flask */}
      {Array.from({length:6},(_,i)=>(
        <circle key={i} cx={150+(i%3-1)*20} cy={280} r={4+i%3*2} fill="none" stroke="#80c0ff" strokeWidth={1} opacity={0.5} style={{ animation: `bg-bubble ${3+i*.5}s ${i*.4}s linear infinite` }} />
      ))}
    </svg>
  )
}

function Scene_avengers() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="bg-scene-svg">
      <defs>
        <linearGradient id="av-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0a0a1a" /><stop offset="60%" stopColor="#1a0a30" /><stop offset="100%" stopColor="#0a1020" /></linearGradient>
      </defs>
      <rect width={800} height={450} fill="url(#av-bg)" />
      {/* NYC skyline */}
      {[{x:0,w:60,h:220},{x:55,w:45,h:280},{x:95,w:70,h:200},{x:160,w:50,h:320},{x:205,w:35,h:260},{x:235,w:55,h:180},{x:620,w:55,h:250},{x:670,w:40,h:310},{x:705,w:65,h:220},{x:765,w:40,h:280}].map((b,i)=>(
        <g key={i}>
          <rect key={i} x={b.x} y={500-b.h} width={b.w} height={b.h} fill="#111118" />
          {/* Windows glowing */}
          {Array.from({length:8},(_,j)=>(
            <rect key={j} x={Math.min(b.x+b.w-16, b.x+6+j%3*14)} y={500-b.h+18+Math.floor(j/3)*28} width={10} height={12} rx={1}
              fill={j%3===0?'#ffee80':'#ffe0a0'} opacity={0.35+j%2*0.25} style={{ animation: `bg-twinkle ${3+j*.5}s ${j*.3+i*.2}s ease-in-out infinite` }} />
          ))}
        </g>
      ))}
      {/* Iron Man flying — proper armored suit silhouette */}
      <g style={{ animation: 'bg-fly 12s 1s ease-in-out infinite normal backwards' }}>
        {/* Helmet — angular with faceplate */}
        <path d="
          M400,148 C393,148 385,152 383,160 C381,167 383,175 388,178
          C391,180 393,180 396,180 L404,180
          C407,180 409,180 412,178 C417,175 419,167 417,160
          C415,152 407,148 400,148 Z
        " fill="#c80808" />
        {/* Faceplate visor */}
        <path d="M390,156 C393,152 407,152 410,156 C413,160 413,166 410,168 C407,170 393,170 390,168 C387,166 387,160 390,156 Z" fill="#aaa" />
        <path d="M391,157 C394,154 406,154 409,157 C411,161 411,165 409,167 C406,169 394,169 391,167 C389,165 389,161 391,157 Z" fill="#60b0ff" opacity={0.85} />
        {/* Chest/torso — broader, armored plates */}
        <path d="
          M388,180 C382,182 376,186 375,194
          C374,202 376,212 380,218
          C385,222 395,224 400,224
          C405,224 415,222 420,218
          C424,212 426,202 425,194
          C424,186 418,182 412,180
          C408,178 404,178 400,178 Z
        " fill="#c80808" />
        {/* Arc reactor on chest — glowing circle */}
        <circle cx={400} cy={200} r={9} fill="#112244" />
        <circle cx={400} cy={200} r={6} fill="#60b0ff" opacity={0.9} style={{ animation: 'bg-glow-fast 0.6s ease-in-out infinite' }} />
        <circle cx={400} cy={200} r={3} fill="white" opacity={0.9} />
        {/* Left arm — stretched forward */}
        <path d="M376,188 C368,188 360,192 354,198 C350,202 348,208 350,212 C354,208 358,204 362,202 C368,200 374,200 378,198 Z" fill="#c80808" />
        {/* Right arm — back */}
        <path d="M424,188 C432,188 440,192 446,198 C450,202 452,208 450,212 C446,208 442,204 438,202 C432,200 426,200 422,198 Z" fill="#aa0808" />
        {/* Hand repulsor glow — left */}
        <circle cx={350} cy={214} r={7} fill="#60b0ff" opacity={0.85} style={{ animation: 'bg-glow-fast 0.5s ease-in-out infinite' }} />
        {/* Legs trailing */}
        <path d="M390,222 C388,230 386,238 386,246 C388,248 392,248 394,246 C394,238 394,230 392,224 Z" fill="#c80808" />
        <path d="M410,222 C412,230 414,238 414,246 C412,248 408,248 406,246 C406,238 406,230 408,224 Z" fill="#c80808" />
        {/* Boot repulsors */}
        <ellipse cx={390} cy={248} rx={5} ry={4} fill="#60b0ff" opacity={0.7} style={{ animation: 'bg-glow-fast 0.5s 0.1s ease-in-out infinite' }} />
        <ellipse cx={410} cy={248} rx={5} ry={4} fill="#60b0ff" opacity={0.7} style={{ animation: 'bg-glow-fast 0.5s 0.2s ease-in-out infinite' }} />
        {/* Gold accents on armor */}
        <path d="M388,180 L400,184 L412,180" stroke="#ffaa00" strokeWidth={2} fill="none" opacity={0.8} />
        <path d="M381,196 L388,200 L381,204" stroke="#ffaa00" strokeWidth={1.5} fill="none" opacity={0.6} />
      </g>
      {/* Stars */}
      <Stars n={50} />
      {/* Thor storm clouds — dark purple, crackling */}
      <CloudShape x={60} y={60} w={280} fill="#1a0830" opacity={0.85} style={{ animation: 'bg-cloud-drift 12s ease-in-out infinite alternate' }}/>
      <CloudShape x={500} y={40} w={320} fill="#200838" opacity={0.8} style={{ animation: 'bg-cloud-drift 16s ease-in-out infinite alternate-reverse' }}/>
      {/* Mjolnir (Thor's hammer) spinning across */}
      <g style={{ animation: 'bg-drift-r 18s 2s linear infinite normal backwards' }}>
        <g transform="translate(-60,100)">
          <g style={{ animation: 'bg-spin 1.2s linear infinite', transformBox:'fill-box', transformOrigin:'center center' }}>
            {/* Hammer head */}
            <rect x={-18} y={-12} width={36} height={24} rx={4} fill="#888898"/>
            <rect x={-16} y={-10} width={32} height={8} rx={2} fill="#aaaabc" opacity={0.6}/>
            {/* Handle */}
            <rect x={-4} y={12} width={8} height={30} rx={3} fill="#6a4820"/>
            {/* Strap */}
            <ellipse cx={0} cy={44} rx={5} ry={3} fill="#8a6030"/>
            {/* Lightning glow around it */}
            <ellipse cx={0} cy={0} rx={28} ry={20} fill="#8844ff" opacity={0.15} style={{ animation: 'bg-glow 1s ease-in-out infinite' }}/>
          </g>
          {/* Lightning trail */}
          <path d="M0,0 Q40,10 90,5" stroke="#cc88ff" strokeWidth={2} fill="none" opacity={0.5} strokeLinecap="round"/>
        </g>
      </g>
      {/* Thor lightning bolts — purple-white */}
      <polyline points="140,0 122,55 138,55 120,125" stroke="#cc88ff" strokeWidth={4} strokeLinejoin="round" strokeLinecap="round"
        strokeDasharray="140 300" style={{ animation: 'bg-lightning-draw 5s 1s linear infinite' }} opacity={0.9}/>
      <polyline points="650,0 635,48 650,48 636,110" stroke="#aa66ff" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round"
        strokeDasharray="120 300" style={{ animation: 'bg-lightning-draw 6s 2.5s linear infinite' }} opacity={0.8}/>
      {/* Classic yellow lightning bolt too */}
      <polyline points="430,50 415,110 435,110 420,180" stroke="#ffee00" strokeWidth={4} strokeLinejoin="round" strokeLinecap="round"
        style={{ animation: 'bg-flash 6s 2s ease-in-out infinite' }} />
      <polyline points="580,30 566,90 582,90 568,170" stroke="#ffee00" strokeWidth={5} strokeLinejoin="round" strokeLinecap="round"
        strokeDasharray="150 150" style={{ animation: 'bg-lightning-draw 8s 3.5s linear infinite' }} />
      {/* HULK — massive green fist punching through building on right */}
      <g transform="translate(680,280)">
        {/* Building chunk breaking apart */}
        <rect x={-30} y={-80} width={60} height={100} fill="#111118"/>
        <rect x={-30} y={-80} width={60} height={100} fill="none" stroke="#1a1a24" strokeWidth={2}/>
        {/* Crack lines */}
        <path d="M-10,-80 L-4,-50 L-18,-20 L-6,20" stroke="#080810" strokeWidth={3} fill="none"/>
        <path d="M14,-70 L8,-40 L20,-10" stroke="#080810" strokeWidth={2} fill="none"/>
        {/* Debris chunks flying out */}
        {[[-45,-60,12],[50,-50,8],[-50,-20,10],[55,-30,7],[-40,10,9],[48,5,6]].map(([dx,dy,s],i)=>(
          <rect key={i} x={dx} y={dy} width={s} height={s} rx={1} fill="#181820" transform={`rotate(${i*25})`} opacity={0.85}/>
        ))}
        {/* HULK FIST — massive green knuckles */}
        <path d="M-50,20 Q-60,0 -55,-20 Q-48,-35 -30,-32 Q-10,-30 10,-32 Q28,-34 32,-18 Q35,0 28,18 Q18,28 0,30 Q-20,32 -36,26 Z" fill="#30a030"/>
        {/* Knuckle definition */}
        {[-38,-18,2,20].map((x,i)=>(
          <ellipse key={i} cx={x} cy={-20} rx={9} ry={7} fill="#28882a" opacity={0.7}/>
        ))}
        {/* Thumb */}
        <path d="M28,10 Q42,6 44,-8 Q42,-20 32,-18" fill="#30a030"/>
        {/* Wrist */}
        <path d="M-50,20 Q-52,40 -48,55 Q-30,62 10,60 Q35,58 32,40 Q30,28 28,18Z" fill="#289028"/>
        {/* Vein detail */}
        <path d="M-30,35 Q-10,32 15,36" stroke="#20781e" strokeWidth={2} fill="none" opacity={0.5}/>
        {/* Impact shockwave */}
        <ellipse cx={-10} cy={-10} rx={65} ry={50} fill="none" stroke="#50cc50" strokeWidth={2} opacity={0.2} style={{ animation: 'bg-pulse 0.6s ease-in-out infinite' }}/>
      </g>
      {/* Energy explosion burst — mid-scene */}
      <g transform="translate(320,220)" style={{ animation: 'bg-pulse 1.5s ease-in-out infinite' }}>
        {[0,30,60,90,120,150,180,210,240,270,300,330].map((a,i)=>(
          <line key={i} x1={0} y1={0} x2={Math.cos(a*Math.PI/180)*(25+i%3*8)} y2={Math.sin(a*Math.PI/180)*(25+i%3*8)}
            stroke={i%3===0?'#ff6600':i%3===1?'#ffee00':'#ff2200'} strokeWidth={i%2===0?3:1.5} opacity={0.6} strokeLinecap="round"/>
        ))}
        <circle cx={0} cy={0} r={16} fill="#ff8800" opacity={0.5}/>
        <circle cx={0} cy={0} r={8} fill="#ffee00" opacity={0.7}/>
      </g>
      {/* Shield */}
      <g transform="translate(200,250)"><g style={{ animation: 'bg-drift-l 15s 0.5s linear infinite normal backwards' }}>
        <circle cx={0} cy={0} r={28} fill="#3355cc" />
        <circle cx={0} cy={0} r={21} fill="#cc2222" />
        <circle cx={0} cy={0} r={13} fill="#3355cc" />
        <circle cx={0} cy={0} r={6} fill="#e0e0e0" />
        {/* Star on shield */}
        <path d="M0,-4 L1.2,0 L5,0 L2,2.5 L3.1,6.5 L0,4.2 L-3.1,6.5 L-2,2.5 L-5,0 L-1.2,0Z" fill="white" opacity={0.9}/>
      </g>
      </g>
    </svg>
  )
}

function Scene_superman() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="bg-scene-svg">
      <defs>
        <linearGradient id="sm-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#001840"/>
          <stop offset="40%" stopColor="#003080"/>
          <stop offset="75%" stopColor="#1060c0"/>
          <stop offset="100%" stopColor="#c06000"/>
        </linearGradient>
        <radialGradient id="sm-sun" cx="50%" cy="100%">
          <stop offset="0%" stopColor="#ff9020" stopOpacity="0.7"/>
          <stop offset="60%" stopColor="#ff6000" stopOpacity="0.2"/>
          <stop offset="100%" stopColor="#ff4000" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="sm-boom" cx="50%" cy="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0)"/>
          <stop offset="70%" stopColor="rgba(200,220,255,0.15)"/>
          <stop offset="100%" stopColor="rgba(150,180,255,0)"/>
        </radialGradient>
      </defs>
      <rect width={800} height={450} fill="url(#sm-bg)" />
      {/* Sunrise dramatic glow */}
      <ellipse cx={400} cy={450} rx={500} ry={200} fill="url(#sm-sun)" style={{ animation: 'bg-pulse 8s ease-in-out infinite' }}/>
      {/* Art-deco Metropolis skyline */}
      {[{x:0,w:70,h:280},{x:65,w:40,h:320},{x:100,w:55,h:260},{x:150,w:80,h:350},{x:225,w:35,h:300},{x:255,w:60,h:240},{x:580,w:60,h:300},{x:635,w:45,h:350},{x:675,w:70,h:270},{x:740,w:65,h:310}].map((b,i)=>(
        <g key={i}>
          <rect x={b.x} y={500-b.h} width={b.w} height={b.h} fill="#112244" />
          {/* Windows glowing */}
          {Array.from({length:8},(_,j)=>(
            <rect key={j} x={Math.min(b.x+b.w-16, b.x+6+j%3*14)} y={500-b.h+18+Math.floor(j/3)*28} width={10} height={12} rx={1}
              fill={j%3===0?'#ffee80':'#ffe0a0'} opacity={0.35+j%2*0.25} style={{ animation: `bg-twinkle ${3+j*.5}s ${j*.3+i*.2}s ease-in-out infinite` }} />
          ))}
        </g>
      ))}
      {/* Daily Planet building — distinctive dome top at x~490 area */}
      <rect x={480} y={140} width={64} height={320} fill="#1a2e58"/>
      <polygon points="480,140 512,108 544,140" fill="#152244"/>
      {/* Globe dome */}
      <circle cx={512} cy={108} r={24} fill="#1e3878" stroke="#2a4a90" strokeWidth={2}/>
      <ellipse cx={512} cy={108} rx={24} ry={8} fill="none" stroke="#3a5aaa" strokeWidth={1} opacity={0.6}/>
      <line x1={512} y1={84} x2={512} y2={132} stroke="#3a5aaa" strokeWidth={1} opacity={0.5}/>
      {/* Globe glow */}
      <circle cx={512} cy={108} r={28} fill="#3060ff" opacity={0.08} style={{ animation: 'bg-glow 4s ease-in-out infinite' }}/>
      {/* Lois Lane — journalist on rooftop */}
      <g transform="translate(285,240)">
        {/* Hair */}
        <path d="M-7 -28 Q0 -35 8 -27 L8 -17 Q4 -13 -7 -17 Z" fill="#3b2416"/>
        {/* Face */}
        <circle cx="0" cy="-22" r="6" fill="#f2c6a0"/>
        {/* Neck */}
        <rect x="-2" y="-16" width="4" height="4" fill="#f2c6a0"/>
        {/* Blazer body */}
        <path d="M-8 -13 Q0 -17 8 -13 L10 7 L-10 7 Z" fill="#234b8a"/>
        {/* Shirt */}
        <path d="M-3 -14 L3 -14 L0 -7 Z" fill="#ffffff"/>
        {/* Arms */}
        <line x1="-7" y1="-10" x2="-14" y2="0" stroke="#234b8a" strokeWidth="3" strokeLinecap="round"/>
        <line x1="7" y1="-10" x2="15" y2="-2" stroke="#234b8a" strokeWidth="3" strokeLinecap="round"/>
        {/* Hands */}
        <circle cx="-14" cy="1" r="2" fill="#f2c6a0"/>
        <circle cx="15" cy="-2" r="2" fill="#f2c6a0"/>
        {/* Pants */}
        <path d="M-8 7 L8 7 L6 18 L1 18 L0 10 L-1 18 L-6 18 Z" fill="#101828"/>
        {/* Shoes */}
        <ellipse cx="-5" cy="19" rx="4" ry="2" fill="#05070b"/>
        <ellipse cx="5" cy="19" rx="4" ry="2" fill="#05070b"/>
        {/* Camera */}
        <rect x="15" y="-9" width="9" height="7" rx="1.5" fill="#222"/>
        <circle cx="20" cy="-5.5" r="2" fill="#8bd3ff"/>
        {/* Camera strap */}
        <path d="M-2 -12 Q10 -16 19 -9" fill="none" stroke="#333" strokeWidth="1.2"/>
      </g>
      {/* News helicopter in background */}
      <g style={{ animation: 'bg-drift-l 30s 3s linear infinite normal backwards' }}>
        <g transform="translate(650,180)">
          {/* Fuselage */}
          <ellipse cx={0} cy={0} rx={36} ry={12} fill="#223366"/>
          {/* Tail boom */}
          <rect x={30} y={-3} width={28} height={5} rx={2} fill="#1a2850"/>
          {/* Tail rotor */}
          <ellipse cx={58} cy={-1} rx={1.5} ry={10} fill="#2a3a70" opacity={0.6} style={{ animation: 'bg-spin 0.1s linear infinite' }}/>
          {/* Main rotor disc */}
          <ellipse cx={0} cy={-12} rx={52} ry={4} fill="#2a3a70" opacity={0.4} style={{ animation: 'bg-spin 0.12s linear infinite' }}/>
          {/* Cockpit bubble */}
          <ellipse cx={-14} cy={-2} rx={16} ry={10} fill="#3a6090" opacity={0.7}/>
          {/* Landing skids */}
          <line x1={-18} y1={12} x2={18} y2={12} stroke="#1a2850" strokeWidth={3}/>
          <line x1={-20} y1={10} x2={-20} y2={13} stroke="#1a2850" strokeWidth={2}/>
          <line x1={20} y1={10} x2={20} y2={13} stroke="#1a2850" strokeWidth={2}/>
          {/* Searchlight beam */}
          <path d="M-8,12 L-28,70 L12,70Z" fill="#ffe8a0" opacity={0.15} style={{ animation: 'bg-glow 2s ease-in-out infinite' }}/>
        </g>
      </g>
      {/* Superman flying — proper caped hero pose, arm outstretched */}
      <g style={{ animation: 'bg-fly 10s ease-in-out infinite' }}>
        {/* Sonic boom shockwave ring — ahead of Superman */}
        <ellipse cx={340} cy={180} rx={42} ry={28} fill="none" stroke="rgba(200,220,255,0.4)" strokeWidth={3} style={{ animation: 'bg-pulse 2s ease-in-out infinite' }}/>
        <ellipse cx={340} cy={180} rx={55} ry={36} fill="none" stroke="rgba(200,220,255,0.2)" strokeWidth={2} style={{ animation: 'bg-pulse 2s 0.3s ease-in-out infinite' }}/>
        {/* CAPE — billowing dramatically behind body */}
        <path d="M395,168 C400,178 408,196 412,210 C424,200 438,186 444,170 C440,160 432,158 426,162 C420,166 412,174 408,178 C404,174 400,168 395,168 Z" fill="#cc2222" opacity={0.95} />
        {/* Cape shadow fold */}
        <path d="M408,178 C412,190 416,200 412,210 C420,204 428,194 432,184Z" fill="#aa1818" opacity={0.5}/>
        {/* Head */}
        <circle cx={382} cy={156} r={16} fill="#f0c090" />
        {/* Hair — dark swept back */}
        <path d="M369,150 C372,142 378,138 382,138 C386,138 392,142 396,148 C392,144 386,142 382,142 C378,142 372,146 369,150 Z" fill="#1a0c08" />
        <path d="M380,144 C376,146 374,150 376,152" stroke="#1a0c08" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        {/* Mask */}
        <rect x={371} y={147} width={24} height={9} rx={4} fill="#cc2222" />
        <ellipse cx={376} cy={151} rx={5} ry={4} fill="white" />
        <ellipse cx={389} cy={151} rx={5} ry={4} fill="white" />
        <circle cx={377} cy={152} r={2.5} fill="#111" />
        <circle cx={390} cy={152} r={2.5} fill="#111" />
        {/* HEAT VISION — twin red laser beams from eyes */}
        <line x1={373} y1={151} x2={310} y2={170} stroke="#ff2200" strokeWidth={2.5} opacity={0.85} style={{ animation: 'bg-glow-fast 0.4s ease-in-out infinite' }}/>
        <line x1={386} y1={151} x2={323} y2={170} stroke="#ff2200" strokeWidth={2} opacity={0.75} style={{ animation: 'bg-glow-fast 0.4s 0.05s ease-in-out infinite' }}/>
        <line x1={373} y1={151} x2={310} y2={170} stroke="#ff8060" strokeWidth={5} opacity={0.2} style={{ animation: 'bg-glow-fast 0.4s ease-in-out infinite' }}/>
        {/* Heat vision impact glow */}
        <circle cx={308} cy={171} r={8} fill="#ff4400" opacity={0.35} style={{ animation: 'bg-glow-fast 0.4s ease-in-out infinite' }}/>
        {/* Body */}
        <path d="M372,170 C368,174 366,182 367,192 C368,200 372,208 378,212 C383,214 390,214 395,212 L395,168 C390,166 380,168 372,170 Z" fill="#1040cc" />
        <path d="M395,168 L395,212 C398,214 402,214 406,212 C410,208 412,200 411,192 Z" fill="#0c30a0" opacity={0.7} />
        {/* S shield */}
        <path d="M374,179 L387,179 C391,181 392,185 390,190 C388,195 383,198 381,198 C379,198 374,195 372,190 C370,185 371,181 374,179 Z" fill="#ffee00" />
        <text x="381" y="194" textAnchor="middle" fontSize="14" fontWeight="900" fill="#cc2222" fontFamily="Arial Black, Arial, sans-serif" style={{userSelect:'none'}}>S</text>
        {/* Lead arm outstretched */}
        <path d="M372,176 C362,174 350,170 338,164 C334,162 330,160 326,158" stroke="#1040cc" strokeWidth={13} fill="none" strokeLinecap="round" />
        <circle cx={324} cy={157} r={9} fill="#f0c090" />
        {/* Trailing arm */}
        <path d="M406,186 C412,192 418,200 420,210" stroke="#1040cc" strokeWidth={10} fill="none" strokeLinecap="round" />
        {/* Legs */}
        <path d="M375,212 C372,224 370,238 370,250" stroke="#1040cc" strokeWidth={12} fill="none" strokeLinecap="round" />
        <path d="M393,212 C394,224 396,238 398,250" stroke="#1040cc" strokeWidth={10} fill="none" strokeLinecap="round" />
        {/* Red boots */}
        <path d="M368,250 C366,256 364,260 366,264 C368,266 374,266 376,262 C376,258 374,254 370,251 Z" fill="#cc2222" />
        <path d="M396,250 C396,256 396,260 398,264 C400,266 406,264 408,260 C408,256 406,252 400,251 Z" fill="#cc2222" />
        {/* Speed lines trailing */}
        {[150,160,170,180,190].map((y,i)=>(
          <line key={i} x1={416+i*2} y1={y} x2={460+i*8} y2={y} stroke="rgba(255,255,255,.22)" strokeWidth={2-i*.2} strokeLinecap="round"/>
        ))}
        {/* Speed blur streaks */}
        <path d="M420,165 Q480,168 540,172" stroke="rgba(255,255,255,0.1)" strokeWidth={4} fill="none"/>
        <path d="M422,185 Q475,188 530,193" stroke="rgba(255,255,255,0.08)" strokeWidth={6} fill="none"/>
      </g>
      {/* Kryptonite meteor drifting across */}
      <g style={{ animation: 'bg-drift-l 22s 6s linear infinite normal backwards' }}>
        <g transform="translate(720,100)">
          <polygon points="0,-14 10,-5 8,10 -8,10 -10,-5" fill="#30cc40"/>
          <polygon points="0,-14 6,-8 0,-6 -6,-8" fill="#50ee60" opacity={0.7}/>
          <ellipse cx={0} cy={0} rx={14} ry={14} fill="#20aa30" opacity={0.2} style={{ animation: 'bg-glow 2s ease-in-out infinite' }}/>
          {/* Green glow trail */}
          <path d="M8,5 Q30,15 60,22" stroke="#40dd50" strokeWidth={3} fill="none" opacity={0.4} strokeLinecap="round"/>
          <path d="M10,0 Q40,5 75,8" stroke="#30bb40" strokeWidth={1.5} fill="none" opacity={0.25} strokeLinecap="round"/>
        </g>
      </g>
    </svg>
  )
}

function Scene_forest() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="bg-scene-svg">
      <defs>
        <linearGradient id="for-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#020c08" /><stop offset="100%" stopColor="#041808" /></linearGradient>
      </defs>
      <rect width={800} height={450} fill="url(#for-bg)" />
      {/* Moon */}
      <circle cx={400} cy={90} r={55} fill="#e8e0c0" style={{ animation: 'bg-glow 6s ease-in-out infinite' }} />
      <circle cx={380} cy={80} r={42} fill="#c8c0a0" opacity={0.4} /> {/* crater shadow */}
      {/* Tree silhouettes — back row */}
      {[40,150,280,430,560,680,760].map((x,i)=>(
        <g key={i}>
          <rect x={x+15} y={200+i%3*20} width={10} height={300} fill="#080c08" />
          <polygon points={`${x},${200+i%3*20} ${x+40},${200+i%3*20} ${x+20},${100+i%2*30}`} fill="#060c06" />
          <polygon points={`${x+5},${230+i%3*20} ${x+35},${230+i%3*20} ${x+20},${140+i%2*20}`} fill="#050b05" />
        </g>
      ))}
      {/* Mist on ground */}
      <ellipse cx={400} cy={420} rx={500} ry={50} fill="#144020" opacity={0.3} />
      <ellipse cx={200} cy={410} rx={300} ry={35} fill="#1a5028" opacity={0.2} />
      <ellipse cx={650} cy={415} rx={280} ry={38} fill="#143a18" opacity={0.25} />
      {/* Fireflies */}
      {Array.from({length:22},(_,i)=>(
        <circle key={i} cx={(i*113+50)%800} cy={250+(i%8)*30} r={2.5} fill="#aaff60" style={{ animation: `bg-twinkle ${1.5+i%.5}s ${i*.2}s ease-in-out infinite` }} />
      ))}
      {/* Firefly trails */}
      {Array.from({length:8},(_,i)=>(
        <circle key={i} cx={(i*137+80)%800} cy={280+(i%5)*25} r={4} fill="#80ff30" opacity={0.4} style={{ animation: `bg-float ${3+i*.4}s ${i*.5}s ease-in-out infinite` }} />
      ))}
      {/* Deer silhouette */}
      <g transform="translate(580,390)" opacity={0.7}>
        {/* Body */}
        <ellipse cx={0} cy={0} rx={30} ry={16} fill="#3a1e08" />
        {/* Neck */}
        <rect x={-25} y={-24} width={12} height={24} rx={5} fill="#3a1e08" />
        {/* Head */}
        <ellipse cx={-28} cy={-30} rx={12} ry={10} fill="#3a1e08" />
        {/* Antlers */}
        <path d="M-32,-38 L-36,-56 M-36,-56 L-40,-66 M-36,-56 L-30,-62" stroke="#2a1006" strokeWidth={2.5} fill="none" />
        <path d="M-24,-40 L-20,-58 M-20,-58 L-16,-66 M-20,-58 L-26,-64" stroke="#2a1006" strokeWidth={2} fill="none" />
        {/* Ear */}
        <ellipse cx={-22} cy={-36} rx={6} ry={9} fill="#3a1e08" />
        {/* Eye */}
        <circle cx={-34} cy={-32} r={2.5} fill="#0a0604" />
        {/* Legs */}
        <rect x={-18} y={12} width={5} height={22} rx={2} fill="#3a1e08" />
        <rect x={-6} y={12} width={5} height={22} rx={2} fill="#3a1e08" />
        <rect x={8} y={12} width={5} height={22} rx={2} fill="#3a1e08" />
        <rect x={20} y={12} width={5} height={22} rx={2} fill="#3a1e08" />
        {/* White tail */}
        <ellipse cx={28} cy={-5} rx={8} ry={6} fill="#f0ece0" opacity={0.6} />
      </g>
      {/* Owl on branch */}
      <g transform="translate(200,240)">
        <g style={{ animation: 'bg-float-sm 5s 1s ease-in-out infinite' }}>
          {/* Branch */}
          <rect x={-30} y={20} width={80} height={8} rx={4} fill="#1a0a04" />
          {/* Body */}
          <ellipse cx={0} cy={0} rx={16} ry={20} fill="#3a2808" />
          {/* Head */}
          <circle cx={0} cy={-22} r={14} fill="#4a3410" />
          {/* Ear tufts */}
          <polygon points="-8,-34 -4,-46 0,-34" fill="#3a2808" />
          <polygon points="8,-34 4,-46 0,-34" fill="#3a2808" />
          {/* Eyes */}
          <circle cx={-6} cy={-22} r={6} fill="#f5d848" />
          <circle cx={6} cy={-22} r={6} fill="#f5d848" />
          <circle cx={-6} cy={-22} r={4} fill="#1a0a00" />
          <circle cx={6} cy={-22} r={4} fill="#1a0a00" />
          <circle cx={-5} cy={-23} r={1.5} fill="white" opacity={0.7} />
          <circle cx={7} cy={-23} r={1.5} fill="white" opacity={0.7} />
          {/* Beak */}
          <polygon points="-2,-17 2,-17 0,-12" fill="#c88030" />
          {/* Wing detail */}
          <path d="M-15,0 Q-12,10 -8,16" stroke="#2a1c06" strokeWidth={2} fill="none" opacity={0.6} />
          <path d="M15,0 Q12,10 8,16" stroke="#2a1c06" strokeWidth={2} fill="none" opacity={0.6} />
        </g>
      </g>
    </svg>
  )
}

function Scene_panda() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="bg-scene-svg">
      <defs>
        <linearGradient id="pa-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c8e8e0" /><stop offset="100%" stopColor="#80c8b0" /></linearGradient>
      </defs>
      <rect width={800} height={450} fill="url(#pa-bg)" />
      {/* Misty mountains */}
      <polygon points="0,350 200,150 400,350" fill="#a0c8b8" opacity={0.5} />
      <polygon points="200,350 450,100 700,350" fill="#90b8a8" opacity={0.4} />
      <polygon points="400,350 650,170 800,350" fill="#a8c8b8" opacity={0.45} />
      {/* Mist */}
      <ellipse cx={400} cy={340} rx={500} ry={50} fill="rgba(255,255,255,.4)" />
      <ellipse cx={200} cy={360} rx={350} ry={40} fill="rgba(255,255,255,.3)" />
      {/* Bamboo */}
      {[50,130,200,580,660,740].map((x,i)=>(
        <g key={i} style={{ animation: `bg-sway-sm ${3+i*.3}s ${i*.3}s ease-in-out infinite` }}>
          <rect x={x} y={80} width={14} height={400} rx={5} fill={i%2===0?'#5a9040':'#6aa050'} />
          {Array.from({length:7},(_,j)=>(<rect key={j} x={x-5} y={100+j*55} width={10} height={4} rx={2} fill="#4a7830" />))}
          <ellipse cx={x+7} cy={100} rx={25} ry={12} fill="#6ab058" style={{ animation: `bg-sway-sm ${2.5+i*.2}s ${i*.2}s ease-in-out infinite` }} />
        </g>
      ))}
      {/* Panda */}
      <g transform="translate(400,340)"><g style={{ animation: 'bg-float-sm 4s ease-in-out infinite' }}>
        <ellipse cx={0} cy={10} rx={60} ry={50} fill="white" /> {/* body */}
        <circle cx={0} cy={-48} r={38} fill="white" /> {/* head */}
        <ellipse cx={-26} cy={-62} rx={16} ry={18} fill="#333" /> {/* ear L */}
        <ellipse cx={26} cy={-62} rx={16} ry={18} fill="#333" /> {/* ear R */}
        <ellipse cx={-13} cy={-52} rx={12} ry={10} fill="#222" /> {/* eye patch L */}
        <ellipse cx={13} cy={-52} rx={12} ry={10} fill="#222" /> {/* eye patch R */}
        <circle cx={-12} cy={-52} r={5} fill="white" />
        <circle cx={14} cy={-52} r={5} fill="white" />
        <circle cx={-11} cy={-52} r={3} fill="#111" />
        <circle cx={15} cy={-52} r={3} fill="#111" />
        <ellipse cx={0} cy={-38} rx={9} ry={6} fill="#d0a0a0" /> {/* nose */}
        <path d="M-8,-30 Q0,-24 8,-30" stroke="#888" strokeWidth={1.5} fill="none" />
        <ellipse cx={-48} cy={5} rx={20} ry={15} fill="#333" /> {/* arm L */}
        <ellipse cx={48} cy={5} rx={20} ry={15} fill="#333" /> {/* arm R */}
        {/* Bamboo in hand */}
        <rect x={38} y={-25} width={8} height={55} rx={3} fill="#6aa050" />
        <ellipse cx={42} cy={-22} rx={15} ry={7} fill="#6ab058" />
      </g>
      </g>
      {/* Butterflies floating through bamboo */}
      {[{x:340,y:200,c:'#ff80cc'},{x:480,y:280,c:'#80ccff'}].map((b,i)=>(
        <g key={i} transform={`translate(${b.x},${b.y})`}>
          <g style={{ animation: `bg-float ${5+i}s ${i}s ease-in-out infinite` }}>
            <ellipse cx={-10} cy={0} rx={12} ry={8} fill={b.c} opacity={0.75} transform="rotate(-25,-10,0)" />
            <ellipse cx={10} cy={0} rx={12} ry={8} fill={b.c} opacity={0.75} transform="rotate(25,10,0)" />
            <ellipse cx={-8} cy={4} rx={8} ry={5} fill={b.c} opacity={0.55} transform="rotate(20,-8,4)" />
            <ellipse cx={8} cy={4} rx={8} ry={5} fill={b.c} opacity={0.55} transform="rotate(-20,8,4)" />
            <line x1={0} y1={-10} x2={-4} y2={-18} stroke="#1a0a00" strokeWidth={1} />
            <line x1={0} y1={-10} x2={4} y2={-18} stroke="#1a0a00" strokeWidth={1} />
          </g>
        </g>
      ))}
    </svg>
  )
}

function Scene_frog() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="bg-scene-svg">
      <defs>
        <linearGradient id="fr-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0a2010" /><stop offset="100%" stopColor="#183028" /></linearGradient>
        <radialGradient id="moon-fr" cx="50%" cy="50%"><stop offset="0%" stopColor="#f5f0dc" /><stop offset="100%" stopColor="#e0d8b0" /></radialGradient>
      </defs>
      <rect width={800} height={450} fill="url(#fr-bg)" />
      {/* Moon reflected */}
      <circle cx={400} cy={80} r={50} fill="url(#moon-fr)" style={{ animation: 'bg-glow 7s ease-in-out infinite' }} />
      {/* Pond */}
      <ellipse cx={400} cy={430} rx={380} ry={80} fill="#1a4a38" />
      <ellipse cx={400} cy={435} rx={360} ry={70} fill="#1e5840" />
      {/* Moon reflection in pond */}
      <ellipse cx={400} cy={450} rx={30} ry={20} fill="#f5f0dc" opacity={0.2} style={{ animation: 'bg-pulse-sm 3s ease-in-out infinite' }} />
      {/* Lily pads */}
      {[{cx:220,cy:415,rx:45,ry:25},{cx:500,cy:420,rx:50,ry:28},{cx:650,cy:408,rx:40,ry:22}].map((p,i)=>(
        <g key={i}>
          <ellipse cx={p.cx} cy={p.cy} rx={p.rx} ry={p.ry} fill="#2a7040" />
          <line x1={p.cx} y1={p.cy-p.ry} x2={p.cx} y2={p.cy} stroke="#1a5030" strokeWidth={2} />
          <circle cx={p.cx} cy={p.cy-p.ry-3} r={6} fill="#ff80a0" style={{ animation: `bg-glow ${3+i}s ${i}s ease-in-out infinite` }} />
        </g>
      ))}
      {/* Cattails */}
      {[100,150,680,720].map((x,i)=>(
        <g key={i}>
          <line x1={x} y1={500} x2={x} y2={300} stroke="#4a3010" strokeWidth={4} />
          <ellipse cx={x} cy={300} rx={8} ry={22} fill="#6a4020" />
        </g>
      ))}
      {/* Frog on lily pad — proper anatomy with bulging eyes, wide mouth, webbed feet */}
      <g transform="translate(220,395)"><g style={{ animation: 'bg-jump 3s ease-in-out infinite' }}>
        {/* Body — wide, squatty */}
        <path d="M-32,8 C-32,-6 -20,-18 0,-20 C20,-20 32,-6 32,8 C32,20 20,28 0,28 C-20,28 -32,20 -32,8 Z" fill="#3a8840" />
        {/* Belly — light green */}
        <ellipse cx={0} cy={14} rx={20} ry={12} fill="#8acc60" opacity={0.7} />
        {/* Head blends into body */}
        <path d="M-26,-12 C-26,-28 -16,-38 0,-40 C16,-40 26,-28 26,-12 C26,-4 18,2 0,2 C-18,2 -26,-4 -26,-12 Z" fill="#4a9850" />
        {/* Bulging eye stalks — left */}
        <ellipse cx={-16} cy={-36} rx={12} ry={12} fill="#5aaa60" />
        <circle cx={-16} cy={-36} r={8} fill="#1a1a1a" />
        <circle cx={-14} cy={-38} r={3} fill="white" opacity={0.7} />
        {/* Bulging eye stalks — right */}
        <ellipse cx={16} cy={-36} rx={12} ry={12} fill="#5aaa60" />
        <circle cx={16} cy={-36} r={8} fill="#1a1a1a" />
        <circle cx={18} cy={-38} r={3} fill="white" opacity={0.7} />
        {/* Wide mouth line */}
        <path d="M-18,-12 Q0,-6 18,-12" stroke="#2a6828" strokeWidth={2.5} fill="none" />
        {/* Nostril dots */}
        <circle cx={-5} cy={-20} r={2} fill="#2a6828" />
        <circle cx={5} cy={-20} r={2} fill="#2a6828" />
        {/* Front left leg */}
        <path d="M-30,8 C-38,14 -42,22 -38,26" stroke="#3a7838" strokeWidth={9} fill="none" strokeLinecap="round" />
        {/* Webbed front foot */}
        <path d="M-38,26 C-44,24 -48,22 -50,26 C-46,30 -42,30 -38,30 C-34,30 -32,28 -38,26 Z" fill="#3a7838" />
        {/* Front right leg */}
        <path d="M30,8 C38,14 42,22 38,26" stroke="#3a7838" strokeWidth={9} fill="none" strokeLinecap="round" />
        <path d="M38,26 C44,24 48,22 50,26 C46,30 42,30 38,30 C34,30 32,28 38,26 Z" fill="#3a7838" />
        {/* Back left leg — folded */}
        <path d="M-28,22 C-38,30 -44,40 -40,46 C-34,44 -28,36 -26,28 Z" fill="#3a8840" />
        {/* Back right leg — folded */}
        <path d="M28,22 C38,30 44,40 40,46 C34,44 28,36 26,28 Z" fill="#3a8840" />
      </g>
      </g>
      {/* Fireflies */}
      {Array.from({length:14},(_,i)=>(
        <circle key={i} cx={(i*97+40)%800} cy={200+(i%6)*30} r={2.5} fill="#aaff60" style={{ animation: `bg-twinkle ${1.5+i*.3}s ${i*.2}s ease-in-out infinite` }} />
      ))}
      {/* Ripples on pond */}
      {[{cx:340,cy:430},{cx:480,cy:445}].map((r,i)=>(
        <ellipse key={i} cx={r.cx} cy={r.cy} rx={20} ry={10} fill="none" stroke="#3a8060" strokeWidth={1.5} opacity={0.5} style={{ animation: `bg-ripple ${3+i}s ${i}s ease-out infinite` }} />
      ))}
      {/* Dragonfly */}
      <g transform="translate(550,300)">
        <g style={{ animation: 'bg-float 2.5s ease-in-out infinite' }}>
          {/* Body — segmented */}
          <rect x={-2} y={-18} width={4} height={36} rx={2} fill="#408040" />
          <ellipse cx={0} cy={-22} rx={5} ry={5} fill="#408040" />
          {/* Upper wings */}
          <ellipse cx={-18} cy={-10} rx={20} ry={7} fill="rgba(160,240,200,.6)" transform="rotate(-15,-18,-10)" />
          <ellipse cx={18} cy={-10} rx={20} ry={7} fill="rgba(160,240,200,.6)" transform="rotate(15,18,-10)" />
          {/* Lower wings */}
          <ellipse cx={-16} cy={2} rx={17} ry={6} fill="rgba(160,240,220,.5)" transform="rotate(10,-16,2)" />
          <ellipse cx={16} cy={2} rx={17} ry={6} fill="rgba(160,240,220,.5)" transform="rotate(-10,16,2)" />
          {/* Eyes */}
          <circle cx={-4} cy={-24} r={3} fill="#1a2a00" />
          <circle cx={4} cy={-24} r={3} fill="#1a2a00" />
        </g>
      </g>
    </svg>
  )
}

function Scene_enchanted() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" overflow="hidden" className="bg-scene-svg">
      <defs>
        <radialGradient id="ench-bg" cx="50%" cy="35%"><stop offset="0%" stopColor="#2a0860"/><stop offset="60%" stopColor="#120330"/><stop offset="100%" stopColor="#06010e"/></radialGradient>
        <radialGradient id="ench-portal" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#c060ff" stopOpacity={0.55}/><stop offset="60%" stopColor="#6000cc" stopOpacity={0.2}/><stop offset="100%" stopColor="#6000cc" stopOpacity={0}/></radialGradient>
        <radialGradient id="ench-glow-g" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#60ffcc" stopOpacity={0.4}/><stop offset="100%" stopColor="#60ffcc" stopOpacity={0}/></radialGradient>
      </defs>
      <rect width={800} height={450} fill="url(#ench-bg)" />
      <Stars n={55} color="#d0b8ff" />

      {/* Enchanted twisted trees — left and right frame */}
      {[{x:60,flip:1},{x:740,flip:-1}].map((t,i)=>(
        <g key={i} transform={t.flip===-1?`scale(-1,1) translate(-800,0)`:''}>
          {/* Main trunk */}
          <path d={`M${t.x},450 Q${t.x-18},360 ${t.x+10},270 Q${t.x-25},180 ${t.x+5},100`}
            stroke="#2a1050" strokeWidth={22} fill="none" strokeLinecap="round" />
          {/* Branch 1 */}
          <path d={`M${t.x+8},300 Q${t.x+55},278 ${t.x+80},252`}
            stroke="#2a1050" strokeWidth={12} fill="none" strokeLinecap="round" />
          {/* Branch 2 */}
          <path d={`M${t.x+5},210 Q${t.x+55},188 ${t.x+70},162`}
            stroke="#2a1050" strokeWidth={9} fill="none" strokeLinecap="round" />
          {/* Branch 3 — thin upward */}
          <path d={`M${t.x+6},160 Q${t.x+38},130 ${t.x+42},95`}
            stroke="#2a1050" strokeWidth={6} fill="none" strokeLinecap="round" />
          {/* Glowing leaves clusters */}
          {[{cx:t.x+82,cy:248,r:28,c:'#80ffcc'},{cx:t.x+72,cy:158,r:22,c:'#c060ff'},{cx:t.x+44,cy:90,r:18,c:'#80c0ff'}].map((l,j)=>(
            <g key={j}>
              <circle cx={l.cx} cy={l.cy} r={l.r+8} fill={l.c} opacity={0.12} style={{ animation: `bg-glow ${2.5+j*.6}s ${j*.4}s ease-in-out infinite` }} />
              <circle cx={l.cx} cy={l.cy} r={l.r} fill={l.c} opacity={0.28} style={{ animation: `bg-pulse ${3+j*.5}s ${j*.3}s ease-in-out infinite` }} />
            </g>
          ))}
        </g>
      ))}

      {/* Ground with glowing mist */}
      <ellipse cx={400} cy={445} rx={420} ry={55} fill="#3a0880" opacity={0.35} />
      <ellipse cx={400} cy={440} rx={380} ry={38} fill="#60ffcc" opacity={0.06} style={{ animation: 'bg-pulse 4s ease-in-out infinite' }} />

      {/* Mushroom fairy ring */}
      {[0,45,90,135,180,225,270,315].map((a,i)=>{
        const r=110, cx=400, cy=470
        const x=cx+r*Math.cos(a*Math.PI/180), y=cy+r*0.28*Math.sin(a*Math.PI/180)
        const c=['#ff80ff','#80ffcc','#ffaa40','#80c0ff','#ffd600','#ff6ec7','#60ffaa','#c0a0ff'][i]
        return (
          <g key={i} transform={`translate(${x},${y})`} style={{ animation: `bg-glow ${1.8+i*.3}s ${i*.22}s ease-in-out infinite` }}>
            <rect x={-5} y={-18} width={10} height={20} rx={4} fill="#e8d8c0" />
            <ellipse cx={0} cy={-19} rx={16} ry={10} fill={c} opacity={0.92} />
            <ellipse cx={0} cy={-16} rx={12} ry={5} fill={c} opacity={0.35} />
            {/* Spots */}
            <circle cx={-5} cy={-21} r={2.5} fill="rgba(255,255,255,0.55)" />
            <circle cx={4}  cy={-23} r={2}   fill="rgba(255,255,255,0.45)" />
          </g>
        )
      })}

      {/* Central magic portal */}
      <circle cx={400} cy={230} r={105} fill="url(#ench-portal)" style={{ animation: 'bg-pulse 3s ease-in-out infinite' }} />
      <circle cx={400} cy={230} r={92}  fill="none" stroke="#c060ff" strokeWidth={3} opacity={0.65}
        style={{ animation: 'bg-spin 18s linear infinite', transformOrigin: '400px 230px' }} />
      <circle cx={400} cy={230} r={100} fill="none" stroke="#60ffcc" strokeWidth={1.5} opacity={0.35}
        style={{ animation: 'bg-spin-ccw 12s linear infinite', transformOrigin: '400px 230px' }} />
      {/* Inner glow */}
      <circle cx={400} cy={230} r={60} fill="url(#ench-glow-g)" style={{ animation: 'bg-pulse 2.5s .5s ease-in-out infinite' }} />
      {/* Rune marks on portal ring */}
      {[0,60,120,180,240,300].map((a,i)=>(
        <text key={i} fill="#d0a0ff" fontSize={13} opacity={0.7} fontFamily="serif"
          x={400+98*Math.cos(a*Math.PI/180)-6} y={230+98*Math.sin(a*Math.PI/180)+5}
          style={{ animation: `bg-twinkle ${2+i*.4}s ${i*.3}s ease-in-out infinite` }}>
          {['✦','◈','⬡','✧','◇','⬟'][i]}
        </text>
      ))}

      {/* Castle silhouette inside portal */}
      <g opacity={0.6}>
        {/* Main wall */}
        <rect x={362} y={192} width={76} height={66} fill="#4010a0" />
        {/* Left tower — x:348–370 */}
        <rect x={348} y={180} width={22} height={78} fill="#4a14aa" />
        {/* Left tower cone — base exactly matches tower top (348–370), apex 24px above */}
        <polygon points="348,180 359,156 370,180" fill="#5a1ac0" />
        {/* Right tower — x:432–454 */}
        <rect x={432} y={180} width={22} height={78} fill="#4a14aa" />
        {/* Right tower cone — base exactly matches tower top (432–454), apex 24px above */}
        <polygon points="432,180 443,156 454,180" fill="#5a1ac0" />
        {/* Battlements on main wall */}
        {[366,378,390,402,414,426].map((x,i)=>(
          <rect key={i} x={x} y={188} width={8} height={10} rx={1} fill="#4a14aa" />
        ))}
        {/* Arched door */}
        <rect x={386} y={228} width={28} height={30} rx={14} fill="#6020c0" opacity={0.7} />
        {/* Glowing window left tower */}
        <ellipse cx={359} cy={200} rx={5} ry={7} fill="#ffd600" opacity={0.55} style={{ animation: 'bg-glow 2s ease-in-out infinite' }} />
        {/* Glowing window right tower */}
        <ellipse cx={443} cy={200} rx={5} ry={7} fill="#ffd600" opacity={0.55} style={{ animation: 'bg-glow 2s .4s ease-in-out infinite' }} />
        {/* Main window */}
        <ellipse cx={400} cy={210} rx={8} ry={11} fill="#ffd600" opacity={0.5} style={{ animation: 'bg-glow 2.5s .2s ease-in-out infinite' }} />
      </g>

      {/* Fairies — 3 of them flying at different heights */}
      {[
        {sx:200,sy:170,drift:'bg-drift-r 22s 0s linear infinite',float:'bg-float 2.2s ease-in-out infinite',c:'#ffee40',wc:'#c0e0ff'},
        {sx:-60,sy:310,drift:'bg-drift-r 30s 8s linear infinite',float:'bg-float 3s 1s ease-in-out infinite',c:'#ff80ff',wc:'#ffd0ff'},
        {sx:650,sy:140,drift:'bg-drift-l 26s 3s linear infinite',float:'bg-float 2.8s 0.5s ease-in-out infinite',c:'#80ffcc',wc:'#c0ffee'},
      ].map((f,i)=>(
        <g key={i} style={{ animation: f.drift }}>
          <g transform={`translate(${f.sx},${f.sy})`} style={{ animation: f.float }}>
            {/* Wings */}
            <ellipse cx={-14} cy={-3} rx={14} ry={8}  fill={f.wc} opacity={0.72} transform="rotate(-28,-14,-3)" />
            <ellipse cx={14}  cy={-3} rx={14} ry={8}  fill={f.wc} opacity={0.72} transform="rotate(28,14,-3)" />
            <ellipse cx={-11} cy={7}  rx={10} ry={6}  fill={f.wc} opacity={0.5}  transform="rotate(22,-11,7)" />
            <ellipse cx={11}  cy={7}  rx={10} ry={6}  fill={f.wc} opacity={0.5}  transform="rotate(-22,11,7)" />
            {/* Body */}
            <ellipse cx={0} cy={4} rx={5} ry={8} fill={f.c} opacity={0.9} />
            {/* Head */}
            <circle cx={0} cy={-6} r={7} fill={f.c} opacity={0.95} />
            {/* Glow aura */}
            <circle cx={0} cy={-2} r={14} fill={f.c} opacity={0.12} style={{ animation: 'bg-pulse 1.8s ease-in-out infinite' }} />
            {/* Sparkle trail */}
            {[1,2,3,4].map(j=>(
              <circle key={j} cx={j*9} cy={j*3} r={1.5} fill={f.c} opacity={0.4-j*.08} />
            ))}
          </g>
        </g>
      ))}

      {/* Floating magic sparkles */}
      {Array.from({length:22},(_,i)=>(
        <text key={i} x={(i*113+40)%800} y={100+(i%6)*52} fontSize={8+i%3*4}
          fill={['#ffee40','#ff80ff','#60ffcc','#c0a0ff','#80c8ff'][i%5]}
          style={{ animation: `bg-twinkle ${1+i*.18}s ${i*.15}s ease-in-out infinite` }}>✦</text>
      ))}
    </svg>
  )
}

function Scene_minecraft() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="bg-scene-svg">
      <defs>
        <linearGradient id="mc-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4466cc"/><stop offset="100%" stopColor="#88aaee"/></linearGradient>
      </defs>
      <rect width={800} height={450} fill="url(#mc-sky)" />
      {/* Pixel sun */}
      <rect x={680} y={50} width={64} height={64} fill="#FFE040" style={{ animation: 'bg-pulse-sm 3s ease-in-out infinite' }} />
      {/* Pixel clouds */}
      {[[100,80,5],[300,60,4],[520,90,3]].map(([x,y,n],ci)=>(
        <g key={ci} style={{ animation: `bg-drift-r ${28+ci*8}s ${ci*6}s linear infinite` }}>
          {[...Array(n)].map((_,i)=><rect key={i} x={x+i*32-ci*10} y={y} width={32} height={16} fill="white" opacity={0.9}/>)}
          {[...Array(n-1)].map((_,i)=><rect key={i} x={x+16+i*32-ci*10} y={y-16} width={32} height={16} fill="white" opacity={0.9}/>)}
        </g>
      ))}
      {/* Ground — grass + dirt layers */}
      {Array.from({length:26},(_,i)=><rect key={i} x={i*32} y={400} width={32} height={18} fill={i%2===0?'#4a7830':'#3a6820'} stroke="#222" strokeWidth={0.5}/>)}
      {Array.from({length:26},(_,i)=><rect key={i} x={i*32} y={418} width={32} height={32} fill={i%2===0?'#8b5a32':'#7a4e28'} stroke="#222" strokeWidth={0.5}/>)}
      {/* Diamond block (glinting) */}
      <rect x={500} y={368} width={32} height={32} fill="#40c8d0" stroke="#222" strokeWidth={1}/>
      <rect x={504} y={372} width={10} height={10} fill="#80e8f0" opacity={0.7} style={{ animation: 'bg-twinkle 1.2s ease-in-out infinite' }}/>
      <rect x={518} y={382} width={10} height={10} fill="#80e8f0" opacity={0.6} style={{ animation: 'bg-twinkle 1.2s 0.4s ease-in-out infinite' }}/>
      {/* TNT stack */}
      <rect x={560} y={336} width={32} height={32} fill="#cc3322" stroke="#000" strokeWidth={1}/>
      <rect x={568} y={343} width={16} height={8} fill="#f0e8d0"/>
      <text x={570} y={351} fontSize={7} fill="#cc3322" fontWeight="bold">TNT</text>
      <rect x={560} y={368} width={32} height={32} fill="#cc3322" stroke="#000" strokeWidth={1} style={{ animation: 'bg-pixel-blink 1.5s ease-in-out infinite' }}/>
      <rect x={568} y={375} width={16} height={8} fill="#f0e8d0"/>
      <text x={570} y={383} fontSize={7} fill="#cc3322" fontWeight="bold">TNT</text>
      {/* Fuse spark */}
      <circle cx={576} cy={334} r={4} fill="#ffdd00" style={{ animation: 'bg-glow-fast 0.4s ease-in-out infinite' }}/>
      {/* Tree 1 */}
      <rect x={128} y={304} width={32} height={96} fill="#7a4a28" stroke="#222" strokeWidth={0.5}/>
      <rect x={96} y={240} width={96} height={32} fill="#4a7a30" stroke="#222" strokeWidth={0.5}/>
      <rect x={96} y={208} width={96} height={32} fill="#4a7a30" stroke="#222" strokeWidth={0.5}/>
      <rect x={112} y={176} width={64} height={32} fill="#3a6820" stroke="#222" strokeWidth={0.5}/>
      <rect x={128} y={144} width={32} height={32} fill="#3a6820" stroke="#222" strokeWidth={0.5}/>
      {/* Tree 2 */}
      <rect x={340} y={336} width={32} height={64} fill="#7a4a28" stroke="#222" strokeWidth={0.5}/>
      <rect x={308} y={272} width={96} height={32} fill="#4a7a30" stroke="#222" strokeWidth={0.5}/>
      <rect x={308} y={240} width={96} height={32} fill="#4a7a30" stroke="#222" strokeWidth={0.5}/>
      <rect x={324} y={208} width={64} height={32} fill="#3a6820" stroke="#222" strokeWidth={0.5}/>
      {/* Floating block (being mined) */}
      <g style={{ animation: 'bg-float 2s ease-in-out infinite' }}>
        <rect x={220} y={260} width={32} height={32} fill="#8b7a60" stroke="#222" strokeWidth={1}/>
        <rect x={224} y={264} width={10} height={10} fill="#a08a70" opacity={0.6}/>
      </g>
      {/* Block break particles */}
      {[{x:225,y:250},{x:245,y:242},{x:258,y:255},{x:232,y:238}].map((p,i)=>(
        <rect key={i} x={p.x} y={p.y} width={6} height={6} fill={['#8b7a60','#a08a70','#c0a880'][i%3]}
          style={{ animation: `bg-drift-up ${1.5+i*.3}s ${i*.2}s linear infinite` }}/>
      ))}
      {/* Steve — walks left with pickaxe */}
      <g style={{ animation: 'bg-drift-l 10s 0s linear infinite normal backwards' }}>
        <g transform="translate(420,320)">
          {/* Legs (walking) */}
          <rect x={-8} y={32} width={14} height={22} rx={2} fill="#3a60b0" style={{ animation: 'bg-sway-sm 0.5s ease-in-out infinite', transformBox:'fill-box', transformOrigin:'top center' }}/>
          <rect x={4} y={32} width={14} height={22} rx={2} fill="#3a60b0" style={{ animation: 'bg-sway-sm 0.5s 0.25s ease-in-out infinite', transformBox:'fill-box', transformOrigin:'top center' }}/>
          {/* Body */}
          <rect x={-10} y={8} width={30} height={26} rx={2} fill="#4a8a40"/>
          {/* Head */}
          <rect x={-10} y={-20} width={30} height={30} rx={2} fill="#e8b888"/>
          {/* Eyes */}
          <rect x={-4} y={-14} width={8} height={8} fill="#5a3a8a"/>
          <rect x={8} y={-14} width={8} height={8} fill="#5a3a8a"/>
          <rect x={-2} y={-12} width={4} height={4} fill="white" opacity={0.5}/>
          <rect x={10} y={-12} width={4} height={4} fill="white" opacity={0.5}/>
          {/* Pickaxe arm swinging */}
          <g style={{ animation: 'bg-sway-sm 0.5s ease-in-out infinite', transformBox:'fill-box', transformOrigin:'top left' }}>
            <rect x={-24} y={8} width={14} height={10} rx={2} fill="#e8b888"/>
            {/* Pickaxe */}
            <rect x={-40} y={0} width={22} height={4} rx={2} fill="#7a5a38"/>
            <rect x={-48} y={-6} width={10} height={14} rx={2} fill="#888"/>
          </g>
          <rect x={18} y={8} width={14} height={10} rx={2} fill="#e8b888"/>
        </g>
      </g>
      {/* Creeper — stands still, flashes when close to TNT */}
      <g transform="translate(630,318)">
        <rect x={-20} y={0} width={40} height={32} fill="#3a9a3a" stroke="#222" strokeWidth={1}/>
        <rect x={-20} y={-32} width={40} height={34} fill="#3a9a3a" stroke="#222" strokeWidth={1}/>
        <rect x={-14} y={-26} width={10} height={10} fill="#111"/>
        <rect x={4} y={-26} width={10} height={10} fill="#111"/>
        <rect x={-4} y={-14} width={8} height={6} fill="#111"/>
        <rect x={-12} y={-8} width={8} height={6} fill="#111"/>
        <rect x={4} y={-8} width={8} height={6} fill="#111"/>
        <rect x={-4} y={-8} width={8} height={6} fill="#111"/>
        <rect x={-16} y={32} width={14} height={14} fill="#2a8a2a" stroke="#222" strokeWidth={1}/>
        <rect x={2} y={32} width={14} height={14} fill="#2a8a2a" stroke="#222" strokeWidth={1}/>
        {/* Danger flash */}
        <rect x={-20} y={-32} width={40} height={66} fill="#ffffff" opacity={0} rx={2} style={{ animation: 'bg-pixel-blink 1.8s ease-in-out infinite' }}/>
      </g>
    </svg>
  )
}

function Scene_autumnleaves() {
  const leafColors = ['#cc3810','#e05010','#f07020','#d04418','#e86820','#c83008','#f09030'];
  // Maple-style leaf shape as a path (centered at 0,0)
  const mapleLeaf = "M0,-12 Q3,-8 8,-9 Q6,-4 10,-2 Q7,0 10,4 Q5,2 4,7 Q1,4 0,8 Q-1,4 -4,7 Q-5,2 -10,4 Q-7,0 -10,-2 Q-6,-4 -8,-9 Q-3,-8 0,-12Z";
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="bg-scene-svg">
      <defs>
        {/* Warm sunset sky — golden at horizon, dusty amber above */}
        <linearGradient id="au-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7a3010" />
          <stop offset="40%" stopColor="#c85820" />
          <stop offset="75%" stopColor="#f0a030" />
          <stop offset="100%" stopColor="#f8c840" />
        </linearGradient>
        {/* Ground gradient — dark earth fading to grass */}
        <linearGradient id="au-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5a2a08" />
          <stop offset="100%" stopColor="#3a1808" />
        </linearGradient>
        {/* Sun glow */}
        <radialGradient id="au-sun" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#fff8a0"/>
          <stop offset="40%" stopColor="#ffd040"/>
          <stop offset="100%" stopColor="#ff8820" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width={800} height={450} fill="url(#au-bg)" />
      {/* Sun low on horizon with glow halo */}
      <circle cx={660} cy={340} r={120} fill="url(#au-sun)" opacity={0.55} />
      <circle cx={660} cy={340} r={52} fill="#ffd840" opacity={0.92} style={{ animation: 'bg-glow 6s ease-in-out infinite' }} />
      {/* Distant hills — layered for depth */}
      <path d="M0,340 Q120,290 220,320 Q320,350 400,305 Q500,260 580,310 Q660,340 800,310 L800,450 L0,450Z" fill="#6a2e10" opacity={0.7}/>
      <path d="M0,370 Q100,340 200,360 Q320,380 440,350 Q560,320 680,355 Q740,370 800,350 L800,450 L0,450Z" fill="#4a1e08" opacity={0.9}/>
      {/* Ground */}
      <rect x={0} y={410} width={800} height={40} fill="url(#au-ground)" />
      {/* Fallen leaves carpet on ground */}
      {Array.from({length:18},(_,i)=>(
        <g key={i} transform={`translate(${(i*73+20)%800},${418+i%3*6}) rotate(${i*47})`}>
          <path d={mapleLeaf} fill={leafColors[i%leafColors.length]} opacity={0.75} transform="scale(1.8)"/>
        </g>
      ))}
      {/* Trees — back row, smaller/darker for depth */}
      {[60,190,560,700].map((x,i)=>{
        const h = 180+i%2*30, trunkW=10, col=['#8b2e08','#a03010','#7a2808','#903808'][i];
        return (
          <g key={i}>
            {/* Trunk */}
            <path d={`M${x},410 Q${x-4},${410-h*.4} ${x},${410-h}`} stroke="#3a1408" strokeWidth={trunkW} fill="none" strokeLinecap="round"/>
            {/* Main boughs */}
            <path d={`M${x},${410-h*.55} Q${x-50},${410-h*.7} ${x-70},${410-h*.6}`} stroke="#3a1408" strokeWidth={6} fill="none" strokeLinecap="round"/>
            <path d={`M${x},${410-h*.65} Q${x+40},${410-h*.78} ${x+60},${410-h*.68}`} stroke="#3a1408" strokeWidth={5} fill="none" strokeLinecap="round"/>
            {/* Canopy — 3 overlapping irregular blobs */}
            <ellipse cx={x} cy={410-h} rx={58} ry={48} fill={col} opacity={0.95}/>
            <ellipse cx={x-38} cy={410-h+18} rx={42} ry={36} fill={col} opacity={0.85}/>
            <ellipse cx={x+36} cy={410-h+22} rx={38} ry={32} fill={col} opacity={0.8}/>
            {/* Highlight top */}
            <ellipse cx={x+8} cy={410-h-12} rx={30} ry={20} fill={['#e05818','#f07020','#d04818','#e86820'][i]} opacity={0.6}/>
          </g>
        );
      })}
      {/* Wooden fence across foreground */}
      {Array.from({length:14},(_,i)=>(
        <g key={i} transform={`translate(${i*58+10},390)`}>
          <rect x={0} y={0} width={7} height={42} rx={2} fill="#5a2e10"/>
          <polygon points="-1,0 3,-10 8,0" fill="#4a2208"/>
        </g>
      ))}
      <line x1={10} y1={402} x2={790} y2={402} stroke="#4a2208" strokeWidth={5} strokeLinecap="round"/>
      <line x1={10} y1={416} x2={790} y2={416} stroke="#4a2208" strokeWidth={4} strokeLinecap="round"/>
      {/* Falling maple leaves — varied spin and drift */}
      {Array.from({length:22},(_,i)=>(
        <g key={i} style={{ animation: `bg-leaf-fall ${4.5+i*.35}s ${i*.28}s linear infinite` }}>
          <g transform={`translate(${(i*97+15)%820-20},${-20-i*8}) rotate(${i*55})`}>
            <path d={mapleLeaf} fill={leafColors[i%leafColors.length]} opacity={0.88} transform="scale(2.2)"/>
          </g>
        </g>
      ))}
      {/* Flock of birds silhouettes flying across sunset */}
      <g style={{ animation: 'bg-drift-l 28s 1s linear infinite normal backwards' }}>
        {[{x:760,y:180},{x:790,y:195},{x:820,y:182},{x:848,y:170},{x:875,y:185},{x:855,y:205},{x:830,y:212}].map((b,i)=>(
          <path key={i} d={`M${b.x},${b.y} Q${b.x+8},${b.y-7} ${b.x+16},${b.y} Q${b.x+24},${b.y-7} ${b.x+32},${b.y}`} stroke="#3a1808" strokeWidth={2} fill="none" opacity={0.7}/>
        ))}
      </g>
    </svg>
  )
}

function Scene_dinosaur() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="bg-scene-svg">
      <defs>
        <linearGradient id="di-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4a1800" /><stop offset="50%" stopColor="#aa3800" /><stop offset="100%" stopColor="#c85020" /></linearGradient>
        <radialGradient id="di-lava" cx="50%" cy="50%"><stop offset="0%" stopColor="#ffcc00" /><stop offset="50%" stopColor="#ff4400" /><stop offset="100%" stopColor="#880000" /></radialGradient>
      </defs>
      <rect width={800} height={450} fill="url(#di-bg)" />
      {/* Distant haze / smoke horizon */}
      <ellipse cx={400} cy={390} rx={420} ry={60} fill="rgba(180,60,0,0.25)" />
      {/* Volcano — left background */}
      <polygon points="60,500 180,180 300,500" fill="#2a1006" />
      <polygon points="130,500 180,180 240,500" fill="#1e0c04" />
      {/* Volcano glow at crater */}
      <ellipse cx={180} cy={182} rx={28} ry={14} fill="#ff4400" opacity={0.6} style={{ animation: 'bg-glow 3s ease-in-out infinite' }} />
      {/* Lava drips down sides */}
      <path d="M178,182 C172,220 165,260 168,300" stroke="#ff5500" strokeWidth={5} fill="none" opacity={0.7} />
      <path d="M182,182 C190,228 195,268 192,310" stroke="#ff6600" strokeWidth={4} fill="none" opacity={0.6} />
      {/* Eruption sparks */}
      {Array.from({length:9},(_,i)=>(
        <circle key={i} cx={180+(i%5-2)*18} cy={178} r={3+i%3*2} fill={i%2===0?'#ff4400':'#ffaa00'} style={{ animation: `bg-volcano ${1.8+i*.25}s ${i*.2}s ease-out infinite` }} />
      ))}
      {/* Volcano — right background */}
      <polygon points="560,500 660,220 760,500" fill="#2a1006" />
      <polygon points="610,500 660,220 710,500" fill="#1e0c04" />
      <ellipse cx={660} cy={222} rx={22} ry={11} fill="#ff4400" opacity={0.5} style={{ animation: 'bg-glow 4s 1s ease-in-out infinite' }} />
      {Array.from({length:6},(_,i)=>(
        <circle key={i} cx={660+(i%3-1)*16} cy={218} r={3+i%3} fill={i%2===0?'#ff5500':'#ffbb00'} style={{ animation: `bg-volcano ${2+i*.3}s ${i*.3}s ease-out infinite` }} />
      ))}
      {/* Prehistoric ferns — foreground left */}
      {[620,700,760].map((x,i)=>(
        <g key={i}>
          <rect x={x+4} y={360} width={7} height={130} rx={3} fill="#2a4a10" />
          {[-35,-18,0,18,35].map((a,j)=>(
            <ellipse key={j} cx={x+7} cy={360-j*8} rx={28} ry={10} fill="#3a6818"
              transform={`rotate(${a},${x+7},${360-j*8})`}
              style={{ animation: `bg-sway-sm ${3+j*.2}s ${j*.15}s ease-in-out infinite` }} />
          ))}
        </g>
      ))}
      {/* Ground — cracked dark earth */}
      <rect x={0} y={415} width={800} height={85} fill="#2a1206" />
      <ellipse cx={400} cy={415} rx={440} ry={30} fill="#3a1c08" />
      {/* Lava cracks in ground */}
      {[[100,440],[280,430],[460,445],[600,432]].map(([x,y],i)=>(
        <path key={i} d={`M${x},${y} L${x+30},${y-5} L${x+55},${y+6} L${x+80},${y-4}`} stroke="#ff4400" strokeWidth={2} fill="none" opacity={0.7} />
      ))}
      {/* ── T-REX — stationary, massive, upright, terrifying ── */}
      {/* No drift — Rex stands and ROARS. Float bob only. */}
      <g transform="translate(380,420)"><g style={{ animation: 'bg-float-sm 3.5s ease-in-out infinite' }}>
        {/* TAIL — long sweeping counterbalance to the right */}
        <path d="M55,0 C90,-8 135,-20 175,-30 C210,-38 240,-32 250,-18 C238,-10 210,-14 180,-8 C148,-2 110,8 72,12 Z" fill="#4a7820" />
        {/* Scale ridge on tail */}
        {[90,115,140,165,190,215].map((x,i)=>(
          <polygon key={i} points={`${x},${-8-i*1} ${x+7},${-18-i*1} ${x+14},${-8-i*1}`} fill="#3a6010" />
        ))}
        {/* BODY — large oval torso */}
        <path d="M-55,-10 C-55,-60 -20,-95 30,-100 C80,-105 125,-80 138,-40 C148,-8 138,32 105,48 C72,62 28,64 -10,50 C-42,38 -55,20 -55,-10 Z" fill="#527824" />
        {/* Belly — lighter underside */}
        <path d="M-30,10 C-10,-30 30,-52 75,-50 C108,-48 126,-22 122,14 C118,44 90,58 55,58 C22,58 -14,42 -30,20 Z" fill="#6a9a30" opacity={0.7} />
        {/* Dorsal spine ridge down back */}
        {[-40,-20,0,20,42,62].map((x,i)=>(
          <polygon key={i} points={`${x},-100 ${x+7},-118 ${x+14},-100`} fill="#3a6010" />
        ))}
        {/* NECK — thick, upright */}
        <path d="M-30,-95 C-42,-120 -52,-148 -58,-170" stroke="#4a7820" strokeWidth={42} fill="none" strokeLinecap="round" />
        <path d="M-30,-95 C-42,-120 -52,-148 -58,-170" stroke="#6a9a30" strokeWidth={20} fill="none" strokeLinecap="round" opacity={0.4} />
        {/* HEAD — MASSIVE upper skull */}
        <path d="M-58,-170 C-62,-175 -72,-180 -88,-178 C-115,-174 -145,-162 -162,-148 C-178,-134 -180,-116 -170,-104 C-160,-92 -140,-88 -120,-94 C-100,-100 -82,-114 -70,-132 C-62,-146 -58,-162 -58,-170 Z" fill="#4a7820" />
        {/* Lower jaw — open, wide */}
        <path d="M-120,-96 C-138,-92 -158,-96 -172,-108 C-182,-118 -180,-134 -170,-142 C-158,-130 -140,-122 -118,-120 C-100,-118 -84,-110 -120,-96 Z" fill="#3a6010" />
        {/* TEETH — upper, large jagged */}
        {[[-168,-110],[-158,-108],[-146,-104],[-134,-100],[-124,-98]].map(([x,y],i)=>(
          <polygon key={i} points={`${x-5},${y} ${x},${y-14} ${x+5},${y}`} fill="#eeeadc" />
        ))}
        {/* TEETH — lower, shorter */}
        {[[-164,-110],[-152,-108],[-140,-106],[-128,-104]].map(([x,y],i)=>(
          <polygon key={i} points={`${x-4},${y} ${x},${y+10} ${x+4},${y}`} fill="#eeeadc" />
        ))}
        {/* GUMS — red inside mouth */}
        <path d="M-120,-96 C-134,-100 -148,-104 -162,-110" stroke="#cc2200" strokeWidth={4} fill="none" opacity={0.6} />
        {/* Tongue */}
        <path d="M-148,-104 C-155,-100 -160,-96 -155,-92 C-148,-88 -140,-92 -148,-104 Z" fill="#dd3344" />
        {/* EYE — large, fierce, amber */}
        <circle cx={-100} cy={-148} r={16} fill="#dd7700" />
        <circle cx={-100} cy={-148} r={10} fill="#884400" />
        <ellipse cx={-100} cy={-148} rx={4} ry={9} fill="#111" />
        <circle cx={-96} cy={-153} r={4} fill="white" opacity={0.6} />
        {/* Heavy brow ridge */}
        <path d="M-115,-158 C-106,-164 -90,-162 -82,-155" stroke="#2a4808" strokeWidth={5} fill="none" strokeLinecap="round" />
        {/* Nostril */}
        <ellipse cx={-163} cy={-146} rx={5} ry={4} fill="#2a4808" opacity={0.9} />
        {/* Lip wrinkle */}
        <path d="M-170,-128 C-162,-124 -152,-122 -140,-124" stroke="#2a4808" strokeWidth={2} fill="none" opacity={0.5} />
        {/* Scale texture on body */}
        {[[-30,-60],[10,-75],[50,-65],[85,-40],[95,-10],[70,30],[30,50]].map(([x,y],i)=>(
          <ellipse key={i} cx={x} cy={y} rx={9} ry={5} fill="#3a5e10" opacity={0.45} />
        ))}
        {/* TINY ARMS — vestigial, bent */}
        <path d="M-45,-75 C-35,-60 -26,-50 -22,-40" stroke="#4a7020" strokeWidth={14} fill="none" strokeLinecap="round" />
        <path d="M-22,-40 L-14,-46" stroke="#3a5810" strokeWidth={6} strokeLinecap="round" />
        <path d="M-22,-40 L-16,-34" stroke="#3a5810" strokeWidth={6} strokeLinecap="round" />
        {/* LEGS — massive, powerful. Front leg lifted mid-stride */}
        {/* Front leg — lifted */}
        <path d="M-20,48 C-28,72 -30,96 -22,118" stroke="#3a6010" strokeWidth={30} fill="none" strokeLinecap="round" style={{ animation: 'bg-float-sm 1.2s ease-in-out infinite' }} />
        {/* Front foot */}
        <path d="M-22,118 C-30,124 -36,130 -28,136 C-16,130 -8,122 -22,118 Z" fill="#3a6010" />
        {/* Front claws */}
        {[[-28,136],[-20,138],[-12,136]].map(([x,y],i)=>(
          <line key={i} x1={x} y1={y} x2={x} y2={y+14} stroke="#2a4008" strokeWidth={4} strokeLinecap="round" />
        ))}
        {/* Back leg — grounded */}
        <path d="M30,55 C36,80 38,108 32,130" stroke="#3a6010" strokeWidth={36} fill="none" strokeLinecap="round" style={{ animation: 'bg-float-sm 1.2s 0.6s ease-in-out infinite' }} />
        {/* Back knee bump */}
        <circle cx={38} cy={100} r={16} fill="#3a6010" />
        {/* Back foot — wider, planted */}
        <path d="M32,130 C20,136 10,140 16,148 C28,144 40,138 52,138 C60,134 56,126 32,130 Z" fill="#2a5008" />
        {/* Back claws */}
        {[[16,148],[28,150],[40,148],[52,144]].map(([x,y],i)=>(
          <line key={i} x1={x} y1={y} x2={x} y2={y+12} stroke="#1a3808" strokeWidth={4} strokeLinecap="round" />
        ))}
      </g></g>
      {/* Dust cloud at feet */}
      <ellipse cx={415} cy={418} rx={80} ry={12} fill="rgba(180,100,30,0.3)" style={{ animation: 'bg-pulse-sm 3.5s ease-in-out infinite' }} />
      {/* Pterodactyl flying across */}
      <g style={{ animation: 'bg-drift-l 12s 2s linear infinite normal backwards' }}>
        <g transform="translate(0,130)">
          {/* Body */}
          <ellipse cx={700} cy={0} rx={20} ry={10} fill="#5a3820" />
          {/* Head crest */}
          <path d="M685,-8 L680,-28 L695,-8" fill="#5a3820" />
          {/* Beak */}
          <path d="M685,0 L660,-4 L685,5 Z" fill="#6a4428" />
          {/* Eye */}
          <circle cx={682} cy={-3} r={3} fill="#1a0800" />
          {/* Wings spread */}
          <path d="M700,-5 C720,-20 750,-30 780,-25 C760,-15 730,-5 710,2 Z" fill="#5a3820" />
          <path d="M700,-5 C680,-20 650,-30 620,-25 C640,-15 670,-5 690,2 Z" fill="#5a3820" />
          {/* Tail */}
          <path d="M720,5 C735,0 745,-5 740,-12" stroke="#5a3820" strokeWidth={5} fill="none" strokeLinecap="round" />
          {/* Wing veins */}
          <line x1="700" y1="-4" x2="760" y2="-22" stroke="#4a2c18" strokeWidth={1.5} opacity={0.6} />
          <line x1="700" y1="-4" x2="650" y2="-22" stroke="#4a2c18" strokeWidth={1.5} opacity={0.6} />
        </g>
      </g>
    </svg>
  )
}

function Scene_ocean() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="bg-scene-svg">
      <defs>
        <linearGradient id="oc-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#001840" /><stop offset="100%" stopColor="#004080" /></linearGradient>
      </defs>
      <rect width={800} height={450} fill="url(#oc-bg)" />
      {/* Light rays from surface */}
      {[120,250,400,550,680].map((x,i)=>(
        <polygon key={i} points={`${x-20},0 ${x+20},0 ${x+60},500 ${x-60},500`} fill="#4488ff" opacity={0.05+i%2*.03} style={{ animation: `bg-glow ${4+i}s ${i*.5}s ease-in-out infinite` }} />
      ))}
      {/* Whale — faces LEFT, swims LEFT via bg-drift-l (no flip) */}
      <g style={{ animation: 'bg-drift-l 25s linear infinite' }}>
        {/* Main body — streamlined, tapers toward the tail */}
        <path d="M278,192 C272,172 294,144 342,134 C386,125 455,130 490,150 C510,162 520,176 520,192 C520,208 510,222 490,234 C455,254 386,259 342,250 C294,240 272,212 278,192Z" fill="#2a3060" />
        {/* Belly — lighter ventral patch */}
        <path d="M294,194 C292,210 312,242 350,250 C388,258 458,252 492,234 C512,222 520,208 520,200 C514,212 502,226 482,234 C452,246 386,250 350,242 C316,234 298,214 294,194Z" fill="#c8cce8" opacity={0.45} />
        {/* Pectoral fin — long and curved, like a humpback */}
        <path d="M375,140 C392,100 432,88 448,95 C435,115 408,132 380,148Z" fill="#1e2848" />
        {/* Flukes — proper forked tail */}
        <path d="M519,184 C542,162 568,138 574,126 C564,145 546,166 526,182Z" fill="#243058" />
        <path d="M519,200 C542,222 568,246 574,258 C564,239 546,218 526,202Z" fill="#243058" />
        {/* Peduncle notch between flukes */}
        <ellipse cx={522} cy={192} rx={7} ry={5} fill="#1a2050" />
        {/* Eye */}
        <circle cx={304} cy={170} r={10} fill="#1a2050" />
        <circle cx={306} cy={168} r={4} fill="white" />
        <circle cx={307} cy={167} r={1.5} fill="#000" />
        {/* Mouth line */}
        <path d="M276,192 C272,196 272,200 278,200" stroke="#1a2050" strokeWidth={2} fill="none" opacity={0.6} />
        {/* Blowhole spout — two-stream like a real baleen whale */}
        <path d="M348,133 Q340,100 344,72" stroke="#88ccff" strokeWidth={5} fill="none" opacity={0.65} strokeLinecap="round" style={{ animation: 'bg-glow 3s ease-in-out infinite' }} />
        <path d="M356,131 Q352,98 360,70" stroke="#aaddff" strokeWidth={3.5} fill="none" opacity={0.5} strokeLinecap="round" style={{ animation: 'bg-glow 3s 0.4s ease-in-out infinite' }} />
        <ellipse cx={352} cy={68} rx={18} ry={8} fill="#88ccff" opacity={0.3} />
      </g>
      {/* Coral reef */}
      {[{x:80,c:'#ff6060'},{x:180,c:'#ff9940'},{x:600,c:'#ff4080'},{x:700,c:'#40e090'}].map((r,i)=>(
        <g key={i}>
          <polygon points={`${r.x},460 ${r.x-20},500 ${r.x+20},500`} fill={r.c} />
          <polygon points={`${r.x-12},450 ${r.x-30},500 ${r.x+5},500`} fill={r.c} opacity={0.7} />
          <polygon points={`${r.x+12},455 ${r.x-3},500 ${r.x+28},500`} fill={r.c} opacity={0.8} />
        </g>
      ))}
      {/* Fish schools — outer <g> drives cross-screen animation, inner <g> sets vertical position */}
      {[
        {ty:280,c:'#ffa040',dur:'8s',delay:'0s'},
        {ty:310,c:'#ff7060',dur:'9s',delay:'0.7s'},
        {ty:295,c:'#ffc060',dur:'7.5s',delay:'1.4s'},
        {ty:260,c:'#ffa040',dur:'10s',delay:'0.3s'},
        {ty:320,c:'#ff8050',dur:'8.5s',delay:'1s'},
        {ty:275,c:'#ffb040',dur:'9.5s',delay:'1.8s'},
        {ty:340,c:'#ffa040',dur:'7s',delay:'2s'},
        {ty:305,c:'#ffc040',dur:'11s',delay:'0.5s'},
      ].map((f,i)=>(
        <g key={i} style={{ animation: `bg-drift-l ${f.dur} ${f.delay} linear infinite normal backwards` }}>
          <g transform={`translate(0,${f.ty})`}>
            <ellipse cx={0} cy={0} rx={12} ry={6} fill={f.c} opacity={0.85} />
            <polygon points="12,0 22,-6 22,6" fill={f.c} opacity={0.85} />
            <circle cx={-5} cy={-1} r={2} fill="#553010" opacity={0.7} />
          </g>
        </g>
      ))}
      {/* Bubbles */}
      {Array.from({length:10},(_,i)=>(
        <circle key={i} cx={(i*113+50)%800} cy={480} r={3+i%3} fill="none" stroke="#60aaff" strokeWidth={1} opacity={0.5} style={{ animation: `bg-bubble ${4+i*.4}s ${i*.5}s linear infinite` }} />
      ))}
      {/* Whale tail breaching */}
      <g transform="translate(680,0)"><g style={{ animation: 'bg-float 6s 2s ease-in-out infinite normal backwards' }}>
        <path d="M0,340 Q-20,300 -10,280 Q0,300 10,280 Q20,300 0,340Z" fill="#2a3060" opacity={0.8} />
        <ellipse cx={0} cy={340} rx={18} ry={6} fill="#1a2050" opacity={0.4} />
      </g>
      </g>
      {/* Jellyfish — outer <g> sets x column, inner <g> drives fall animation */}
      {[{x:120,c:'#ff80cc'},{x:350,c:'#80ccff'},{x:620,c:'#ffcc80'}].map((j,i)=>(
        <g key={i} transform={`translate(${j.x},0)`}>
          <g style={{ animation: `bg-fall ${12+i*3}s ${i*4}s linear infinite normal backwards` }}>
            <ellipse cx={0} cy={0} rx={18} ry={12} fill={j.c} opacity={0.5} />
            {[-10,-4,4,10].map((dx,k)=>(
              <path key={k} d={`M${dx},10 Q${dx+3},25 ${dx},40`} stroke={j.c} strokeWidth={1.5} fill="none" opacity={0.4} />
            ))}
          </g>
        </g>
      ))}
      {/* Sea turtle — slow drift left, mid-water */}
      <g style={{ animation: 'bg-drift-l 38s 3s linear infinite normal backwards' }}>
        <g transform="translate(580,300)">
          <path d="M-20,-30 C-32,-52 -56,-58 -64,-48 C-54,-34 -36,-26 -20,-22Z" fill="#4a7a30" />
          <path d="M-20,30 C-32,52 -56,60 -64,50 C-54,36 -36,28 -20,24Z" fill="#4a7a30" />
          <path d="M24,-22 C36,-38 54,-40 56,-30 C48,-20 34,-18 24,-16Z" fill="#4a7a30" />
          <path d="M24,22 C36,40 54,42 56,32 C48,22 34,20 24,18Z" fill="#4a7a30" />
          <ellipse cx={0} cy={0} rx={40} ry={30} fill="#3d6828" />
          <ellipse cx={0} cy={0} rx={28} ry={20} fill="#527a32" />
          <path d="M0,-20 L0,20M-28,0 L28,0M-20,-14 L20,14M20,-14 L-20,14" stroke="#3a6020" strokeWidth={1.5} opacity={0.5} />
          <ellipse cx={-48} cy={0} rx={13} ry={9} fill="#6a9a40" />
          <circle cx={-57} cy={-3} r={3} fill="#1a3008" />
          <circle cx={-56} cy={-4} r={1.2} fill="white" />
        </g>
      </g>
      {/* Seahorse — gentle bob near left coral */}
      <g transform="translate(155,310)"><g style={{ animation: 'bg-float 5s 1s ease-in-out infinite normal backwards' }}>
        <path d="M0,0 C6,14 12,30 6,46 C0,62 -4,76 2,90" stroke="#ff8844" strokeWidth={13} fill="none" strokeLinecap="round" />
        <path d="M0,0 C6,14 12,30 6,46 C0,62 -4,76 2,90" stroke="#ffaa66" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.5} />
        <ellipse cx={0} cy={-10} rx={11} ry={13} fill="#ff8844" />
        <path d="M0,-18 L-20,-26" stroke="#ff8844" strokeWidth={5} strokeLinecap="round" />
        <circle cx={-5} cy={-14} r={4} fill="#2a1000" />
        <circle cx={-4} cy={-15} r={1.5} fill="white" />
        <path d="M-6,-22 L-10,-30 M0,-24 L0,-33 M6,-22 L9,-30" stroke="#ff8844" strokeWidth={2.5} strokeLinecap="round" />
        <path d="M8,5 Q22,-2 20,14 Q8,10 8,6Z" fill="rgba(255,160,90,0.55)" />
      </g></g>
      {/* Octopus — bottom right, animated sway */}
      <g transform="translate(670,340)"><g style={{ animation: 'bg-sway-sm 4s ease-in-out infinite' }}>
        <path d="M-10,28 Q-42,52 -58,82" stroke="#a040b8" strokeWidth={8} fill="none" strokeLinecap="round" />
        <path d="M-4,32 Q-26,60 -30,90" stroke="#a040b8" strokeWidth={8} fill="none" strokeLinecap="round" />
        <path d="M4,34 Q6,62 2,92" stroke="#a040b8" strokeWidth={8} fill="none" strokeLinecap="round" />
        <path d="M12,33 Q28,60 26,90" stroke="#a040b8" strokeWidth={8} fill="none" strokeLinecap="round" />
        <path d="M18,30 Q48,54 52,82" stroke="#a040b8" strokeWidth={8} fill="none" strokeLinecap="round" />
        <path d="M22,25 Q58,44 68,68" stroke="#a040b8" strokeWidth={7} fill="none" strokeLinecap="round" />
        <path d="M-18,24 Q-56,40 -72,62" stroke="#a040b8" strokeWidth={7} fill="none" strokeLinecap="round" />
        <ellipse cx={0} cy={0} rx={34} ry={32} fill="#c050d8" />
        <ellipse cx={0} cy={-18} rx={22} ry={18} fill="#d060e8" />
        <circle cx={-13} cy={-6} r={9} fill="#1a0820" />
        <circle cx={13} cy={-6} r={9} fill="#1a0820" />
        <circle cx={-11} cy={-8} r={3.5} fill="white" />
        <circle cx={15} cy={-8} r={3.5} fill="white" />
        <path d="M-8,8 Q0,14 8,8" stroke="#e080f0" strokeWidth={2} fill="none" />
      </g></g>
      {/* Starfish on sea floor */}
      {[{x:80,y:428,r:18,fill:'#ff6030',rot:.3},{x:280,y:432,r:14,fill:'#ff8820',rot:.9},{x:490,y:430,r:20,fill:'#ff4455',rot:.1},{x:750,y:430,r:15,fill:'#ff7040',rot:.6}].map((s,i)=>{
        const pts = Array.from({length:10},(_,j)=>{const a=j*Math.PI/5-Math.PI/2+s.rot;const r=j%2===0?s.r:s.r*.42;return `${s.x+r*Math.cos(a)},${s.y+r*Math.sin(a)}`}).join(' ')
        return <polygon key={i} points={pts} fill={s.fill} opacity={0.9} />
      })}
      {/* Crab at bottom center */}
      <g transform="translate(390,420)"><g style={{ animation: 'bg-sway-sm 1.8s ease-in-out infinite' }}>
        {[-14,-8,8,14].map((x,i)=>(
          <g key={i}>
            <line x1={x>0?20:-20} y1={-4+i%2*6} x2={x>0?32+i*2:-32-i*2} y2={10+i*3} stroke="#cc3010" strokeWidth={2.5} strokeLinecap="round" />
          </g>
        ))}
        <path d="M-24,-2 C-38,-12 -44,-6 -42,2 C-40,10 -32,10 -24,6Z" fill="#e84020" />
        <path d="M24,-2 C38,-12 44,-6 42,2 C40,10 32,10 24,6Z" fill="#e84020" />
        <ellipse cx={0} cy={0} rx={24} ry={15} fill="#e84020" />
        <ellipse cx={0} cy={-2} rx={16} ry={10} fill="#f05030" opacity={0.5} />
        <line x1={-9} y1={-13} x2={-12} y2={-22} stroke="#e84020" strokeWidth={3} />
        <circle cx={-12} cy={-23} r={4} fill="#1a0800" />
        <circle cx={-11} cy={-24} r={1.5} fill="white" />
        <line x1={9} y1={-13} x2={12} y2={-22} stroke="#e84020" strokeWidth={3} />
        <circle cx={12} cy={-23} r={4} fill="#1a0800" />
        <circle cx={13} cy={-24} r={1.5} fill="white" />
      </g></g>
    </svg>
  )
}

function Scene_shark() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="bg-scene-svg">
      <defs>
        <linearGradient id="sh-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#000818" /><stop offset="100%" stopColor="#001828" /></linearGradient>
      </defs>
      <rect width={800} height={450} fill="url(#sh-bg)" />
      {/* Faint surface light rays */}
      <ellipse cx={400} cy={0} rx={300} ry={80} fill="#2060a0" opacity={0.12} />
      {[200,400,600].map((x,i)=>(
        <polygon key={i} points={`${x-10},0 ${x+10},0 ${x+40},300 ${x-40},300`} fill="#4090c0" opacity={0.03} />
      ))}
      {/* Shark — drawn facing LEFT, swimming LEFT via bg-drift-l (plain translateX, no flip) */}
      {/* Body centered around x=370,y=250 in the 800×500 viewBox */}
      <g style={{ animation: 'bg-drift-l 20s linear infinite' }}>
        {/* Main body — torpedo, snout points LEFT */}
        <path d="M150,250 C160,220 200,208 280,208 C360,208 430,220 480,250 C430,280 360,292 280,292 C200,292 160,280 150,250 Z" fill="#60707a" />
        {/* Belly — lighter underside */}
        <path d="M170,254 C185,234 215,226 280,226 C345,226 405,234 460,254 C405,274 345,280 280,280 C215,280 185,268 170,254 Z" fill="#c8ccd4" opacity={0.75} />
        {/* Snout — tapers to left-pointing tip */}
        <path d="M150,250 C142,240 120,246 104,250 C120,254 142,260 150,250 Z" fill="#60707a" />
        {/* Tail fin — right side, crescent */}
        <path d="M480,250 C502,232 520,212 515,234 C511,250 511,250 515,266 C520,288 502,268 480,250 Z" fill="#505a64" />
        {/* Dorsal fin — top center, swept back toward tail */}
        <path d="M300,210 C310,188 322,158 334,128 C342,144 350,172 356,210 C342,206 316,206 300,210 Z" fill="#505a64" />
        {/* Pectoral fins */}
        <path d="M260,268 C242,284 214,304 196,310 C210,292 240,276 260,268 Z" fill="#505a64" />
        <path d="M360,268 C378,284 402,304 418,310 C404,292 380,276 360,268 Z" fill="#505a64" />
        {/* Lower caudal keel */}
        <path d="M468,266 C487,272 500,282 498,290 C482,285 471,276 468,266 Z" fill="#505a64" />
        {/* Gill slits — 3 curved marks */}
        {[220,236,252].map((x,i)=>(
          <path key={i} d={`M${x},232 C${x+4},242 ${x+4},258 ${x},268`} stroke="#4a5460" strokeWidth={2} fill="none" opacity={0.7} />
        ))}
        {/* Eye — on left (snout) side */}
        <circle cx={148} cy={246} r={10} fill="#111" />
        <circle cx={145} cy={244} r={4} fill="white" opacity={0.5} />
        {/* Teeth at snout — pointing left */}
        {[130,138,146,154,162].map((x,i)=>(
          <polygon key={i} points={`${x},256 ${x+4},264 ${x+8},256`} fill="white" opacity={0.88} />
        ))}
      </g>
      {/* Small fish — each centered on (0,0), positioned by translate, swimming LEFT with bg-drift-l */}
      {[
        {ty:185,c:'#ffe090',dur:'6s',  delay:'-1s'},
        {ty:210,c:'#ff9080',dur:'7s',  delay:'-3s'},
        {ty:220,c:'#90e0ff',dur:'5.5s',delay:'-2s'},
        {ty:165,c:'#a0ff90',dur:'8s',  delay:'-5s'},
        {ty:195,c:'#ffe090',dur:'6.5s',delay:'-4s'},
        {ty:240,c:'#ffb0e0',dur:'7.5s',delay:'-6.5s'},
      ].map((f,i)=>(
        <g key={i} style={{ animation: `bg-drift-l ${f.dur} ${f.delay} linear infinite` }}>
          <g transform={`translate(0,${f.ty})`}>
          {/* Body centered at (0,0), fish faces LEFT — tail on the right */}
          <ellipse cx={0} cy={0} rx={11} ry={5} fill={f.c} opacity={0.85} />
          {/* Tail fin attached to right edge of body (x=+11) */}
          <polygon points="11,0 20,-6 20,6" fill={f.c} opacity={0.85} />
          {/* Eye on left of body */}
          <circle cx={-5} cy={-1} r={2} fill="#333" />
          </g>
        </g>
      ))}
      {/* Bubbles rising */}
      {Array.from({length:10},(_,i)=>(
        <circle key={i} cx={(i*120+40)%800} cy={490} r={2+i%3} fill="none" stroke="#4080a0" strokeWidth={1} opacity={0.4} style={{ animation: `bg-bubble ${5+i*.5}s ${i*.5}s linear infinite` }} />
      ))}
      {/* Seaweed at bottom */}
      {[50,190,640,750].map((x,i)=>(
        <path key={i} d={`M${x},500 Q${x+16},458 ${x},428 Q${x+18},398 ${x},370`} stroke="#104020" strokeWidth={6} fill="none" strokeLinecap="round" style={{ animation: `bg-sway-sm ${3+i*.3}s ease-in-out infinite` }} />
      ))}
      {/* Distant shark fin — moves right to left */}
      <g style={{ animation: 'bg-drift-l 35s 8s linear infinite normal backwards' }}>
        <polygon points="680,160 692,118 704,160" fill="#405060" opacity={0.55} />
      </g>
      {/* Treasure chest on seafloor */}
      <g transform="translate(350,420)">
        <g style={{ animation: 'bg-glow 4s ease-in-out infinite' }}>
          {/* Chest body */}
          <rect x={-28} y={-18} width={56} height={28} rx={3} fill="#6a3a08" />
          {/* Lid */}
          <path d="M-28,-18 Q0,-32 28,-18" fill="#7a4810" />
          {/* Bands */}
          <rect x={-28} y={-8} width={56} height={4} rx={1} fill="#886628" />
          <rect x={-4} y={-18} width={8} height={28} rx={1} fill="#886628" />
          {/* Lock */}
          <rect x={-5} y={-6} width={10} height={8} rx={2} fill="#cc9920" />
          {/* Gold coins spilling out */}
          <ellipse cx={-18} cy={10} rx={10} ry={5} fill="#ddaa10" opacity={0.8} />
          <ellipse cx={20} cy={12} rx={8} ry={4} fill="#ddaa10" opacity={0.7} />
          <circle cx={-30} cy={14} r={5} fill="#ccaa00" opacity={0.7} />
          <circle cx={28} cy={16} r={4} fill="#ccaa00" opacity={0.65} />
        </g>
      </g>
      {/* Shipwreck silhouette */}
      <g transform="translate(100,430)" opacity={0.4}>
        <path d="M-60,40 Q0,0 60,40" fill="#1a1008" />
        <rect x={-5} y={-30} width={8} height={50} rx={2} fill="#1a1008" />
        <path d="M3,-25 L35,5 L3,5 Z" fill="#1a1008" opacity={0.7} />
      </g>
    </svg>
  )
}

function Scene_mermaid() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="bg-scene-svg">
      <defs>
        <linearGradient id="mr-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#001060" /><stop offset="100%" stopColor="#003090" /></linearGradient>
        <radialGradient id="mr-glow" cx="50%" cy="50%"><stop offset="0%" stopColor="#60e0ff" stopOpacity={0.15} /><stop offset="100%" stopColor="#60e0ff" stopOpacity={0} /></radialGradient>
      </defs>
      <rect width={800} height={450} fill="url(#mr-bg)" />
      {/* Light shafts from surface */}
      {[150,300,450,600].map((x,i)=>(
        <polygon key={i} points={`${x-15},0 ${x+15},0 ${x+50},500 ${x-50},500`} fill="#80d0ff" opacity={0.04} style={{ animation: `bg-pulse ${5+i}s ${i*.5}s ease-in-out infinite` }} />
      ))}
      {/* Coral reef floor */}
      {[{x:60,c:'#ff5080'},{x:150,c:'#ff8040'},{x:580,c:'#ff4070'},{x:700,c:'#40e8b0'},{x:280,c:'#ff6090'}].map((r,i)=>(
        <g key={i}>
          <polygon points={`${r.x},460 ${r.x-22},500 ${r.x+22},500`} fill={r.c} opacity={0.8} style={{ animation: `bg-glow ${3+i}s ${i*.4}s ease-in-out infinite` }} />
          <polygon points={`${r.x-14},452 ${r.x-32},500 ${r.x},500`} fill={r.c} opacity={0.6} />
        </g>
      ))}
      {/* Mermaid — elegant redesign, swims LEFT via bg-drift-l */}
      <g style={{ animation: 'bg-drift-l 18s linear infinite' }}>
        {/* ── HAIR BACK LAYERS — drawn BEFORE head so they sit behind it ── */}
        {/* Deep background layer — darkest, longest, furthest right */}
        <path d="M412,148 C436,136 468,126 492,124 C506,128 508,140 496,150 C480,160 456,162 434,162 C420,160 412,156 412,150 Z" fill="#5a2c08" />
        <path d="M414,158 C442,150 474,144 500,148 C510,160 504,176 486,180 C464,184 440,180 418,172 Z" fill="#5a2c08" />
        <path d="M416,170 C444,168 472,170 494,178 C500,192 490,206 470,206 C448,204 428,196 416,184 Z" fill="#5a2c08" />
        {/* Mid layer — rich chestnut waves */}
        <path d="M410,146 C430,136 458,128 480,128 C492,132 494,146 480,154 C462,162 438,162 416,158 Z" fill="#7b3f10" />
        <path d="M412,156 C436,150 464,146 486,150 C494,162 488,178 468,182 C446,186 424,178 412,168 Z" fill="#7b3f10" />
        <path d="M414,168 C438,168 464,172 482,182 C486,196 474,210 454,210 C432,208 416,196 414,182 Z" fill="#7b3f10" opacity={0.9} />
        {/* Lower flowing wave past shoulders */}
        <path d="M416,180 C436,184 458,192 470,206 C466,220 452,226 436,220 C420,212 414,198 416,184 Z" fill="#6a3410" opacity={0.85} />
        <path d="M414,190 C430,198 446,210 452,226 C446,238 430,240 418,230 C410,220 410,204 414,194 Z" fill="#7b3f10" opacity={0.7} />
        {/* Highlight streaks */}
        <path d="M414,148 C434,140 458,134 476,136" stroke="#a06030" strokeWidth={2} fill="none" opacity={0.5} strokeLinecap="round" />
        <path d="M416,162 C440,158 466,158 484,164" stroke="#a06030" strokeWidth={1.5} fill="none" opacity={0.4} strokeLinecap="round" />
        <path d="M416,178 C438,180 458,186 470,196" stroke="#a06030" strokeWidth={1.5} fill="none" opacity={0.35} strokeLinecap="round" />

        {/* ── HEAD — drawn AFTER back hair so head sits on top ── */}
        <ellipse cx={400} cy={154} rx={18} ry={20} fill="#f5c8a0" />

        {/* ── CROWN + FOREHEAD HAIR — drawn AFTER head so they sit on top ── */}
        {/* Scalp cap — covers entire skull top, stops at hairline y≈144 */}
        <path d="M382,144 C381,136 382,124 387,114 C392,105 396,101 400,100 C404,101 408,105 413,114 C418,124 419,136 418,144 Z" fill="#7b3f10" />
        {/* Left side fill — covers left temple, stays above y=148 */}
        <path d="M382,144 C379,138 377,128 379,118 C381,110 386,105 392,104 C387,108 384,116 383,128 C382,136 382,142 384,146 Z" fill="#6a3410" />
        {/* Crown peak — small tuft above top of head */}
        <path d="M396,100 C394,94 395,86 400,82 C405,86 406,94 404,100 C402,103 401,106 400,108 C399,106 398,103 396,100 Z" fill="#8c4a14" />
        {/* Forehead fringe — just above brow line, stops at y=148 */}
        <path d="M412,140 C405,137 396,137 388,140 C384,144 385,148 390,148 C395,148 402,145 406,142 C409,140 411,139 412,140 Z" fill="#7b3f10" opacity={0.9} />

        {/* ── FACE ── */}
        {/* Blush */}
        <circle cx={392} cy={158} r={5} fill="#ff8870" opacity={0.28} />
        <circle cx={408} cy={158} r={5} fill="#ff8870" opacity={0.28} />
        {/* Eyes — almond, expressive */}
        <ellipse cx={393} cy={152} rx={5} ry={5.5} fill="#1a0e04" />
        <ellipse cx={407} cy={152} rx={5} ry={5.5} fill="#1a0e04" />
        <ellipse cx={393} cy={152} rx={3} ry={3.5} fill="#2d6e1a" />
        <ellipse cx={407} cy={152} rx={3} ry={3.5} fill="#2d6e1a" />
        <ellipse cx={393} cy={152} rx={1.8} ry={2.5} fill="#111" />
        <ellipse cx={407} cy={152} rx={1.8} ry={2.5} fill="#111" />
        <circle cx={391} cy={150} r={1.5} fill="white" opacity={0.8} />
        <circle cx={405} cy={150} r={1.5} fill="white" opacity={0.8} />
        {/* Lashes — upper */}
        <path d="M389,148 C390,144 393,143 396,144" stroke="#111" strokeWidth={1} fill="none" />
        <path d="M403,148 C405,144 408,143 411,144" stroke="#111" strokeWidth={1} fill="none" />
        {/* Nose */}
        <path d="M398,157 Q400,159 402,157" stroke="#c08060" strokeWidth={1} fill="none" opacity={0.5} />
        {/* Smile */}
        <path d="M394,162 Q400,167 406,162" stroke="#c06050" strokeWidth={1.5} fill="none" />

        {/* ── NECK ── */}
        <path d="M396,173 C394,177 394,181 396,184 L404,184 C406,181 406,177 404,173 Z" fill="#f0c090" />

        {/* ── TORSO — narrow hourglass ── */}
        {/* Shoulders (wider at top) */}
        <path d="M376,184 C378,180 386,177 400,176 C414,177 422,180 424,184 C422,192 416,198 408,200 L392,200 C384,198 378,192 376,184 Z" fill="#f0c090" />
        {/* Waist (narrower) */}
        <path d="M386,200 C384,206 384,212 386,218 L414,218 C416,212 416,206 414,200 Z" fill="#eabc88" />

        {/* ── SEASHELL BIKINI — properly on the chest ── */}
        {/* Shell LEFT — fan-shaped, upper torso */}
        <path d="M382,196 C380,190 383,185 388,183 C392,185 394,190 392,196 C390,200 384,200 382,196 Z" fill="#ff78a8" />
        {[383,386,389,392].map((x,i)=>(
          <line key={i} x1={x} y1={197} x2={388} y2={183} stroke="#e05090" strokeWidth={0.8} opacity={0.6} />
        ))}
        {/* Shell RIGHT */}
        <path d="M394,196 C394,190 397,185 402,183 C407,185 409,190 407,196 C405,200 396,200 394,196 Z" fill="#ff78a8" />
        {[395,398,402,406].map((x,i)=>(
          <line key={i} x1={x} y1={197} x2={402} y2={183} stroke="#e05090" strokeWidth={0.8} opacity={0.6} />
        ))}

        {/* ── ARMS — long graceful curves ── */}
        {/* Left arm — sweeping forward-down */}
        <path d="M378,188 C368,192 356,198 346,206 C342,210 342,216 346,218 C352,214 362,208 374,202 Z" fill="#f0c090" />
        <ellipse cx={344} cy={214} rx={6} ry={5} fill="#eab888" /> {/* hand */}
        {/* Right arm — trailing gracefully */}
        <path d="M422,188 C432,192 442,194 450,192 C452,198 448,204 440,204 C432,202 424,196 422,192 Z" fill="#eabc88" />
        <ellipse cx={452} cy={196} rx={5} ry={4} fill="#e8b080" />

        {/* ── TAIL — long, slender, elegant S-shape ── */}
        {/* Hip join */}
        <path d="M386,218 C384,224 384,230 386,234 L414,234 C416,230 416,224 414,218 Z" fill="#1acea0" />
        {/* Main tail body tapering to tip */}
        <path d="M386,232 C382,248 380,268 382,290 C384,310 388,326 392,338 C395,346 399,350 402,346 C406,332 410,310 412,290 C414,268 412,248 408,232 Z" fill="#18c898" />
        {/* Scale shimmer */}
        {[[390,244],[398,244],[390,258],[398,258],[390,272],[398,272],[391,286],[398,286],[392,300],[398,300],[393,314],[398,314]].map(([x,y],i)=>(
          <path key={i} d={`M${x},${y} C${x+3},${y-3} ${x+7},${y} ${x+3},${y+4} Z`} fill="#0da878" opacity={0.4} />
        ))}
        {/* Highlight stripe on tail */}
        <path d="M396,234 C394,254 393,276 394,298 C395,316 397,330 399,340" stroke="#40e8c0" strokeWidth={2} fill="none" opacity={0.35} />

        {/* ── TAIL FIN — wide, flowing fan ── */}
        <path d="M392,344 C378,356 360,372 348,388 C362,384 378,370 392,358 L397,384 L402,358 C416,370 432,384 446,388 C434,372 416,356 402,344 C399,348 396,350 394,350 C392,350 392,348 392,344 Z" fill="#10a878" />
        {/* Fin shimmer */}
        <path d="M392,344 C378,356 360,372 348,388 C362,384 378,370 392,358" fill="none" stroke="#50eed0" strokeWidth={2} opacity={0.5} />
        <path d="M402,344 C416,356 434,372 446,388 C432,384 416,370 402,358" fill="none" stroke="#50eed0" strokeWidth={2} opacity={0.5} />

        {/* Sparkle trail from fin */}
        {[[364,374],[350,384],[378,388]].map(([x,y],i)=>(
          <path key={i} d={`M${x},${y} L${x+2},${y-7} L${x},${y-4} L${x-2},${y-7} Z`} fill="#80ffcc" opacity={0.65} style={{ animation: `bg-twinkle ${1.8+i*.4}s ${i*.3}s ease-in-out infinite` }} />
        ))}
      </g>
      {/* Tropical fish — centered on (0,0), face LEFT, swim LEFT via bg-drift-l */}
      {[{ty:200,c:'#ff6040',delay:'-2s'},{ty:310,c:'#40e0b0',delay:'-5s'},{ty:370,c:'#ffcc20',delay:'-3s'},{ty:240,c:'#ff90c0',delay:'-8s'}].map((f,i)=>(
        <g key={i} style={{ animation: `bg-drift-l ${8+i*2}s ${f.delay} linear infinite` }}>
          <g transform={`translate(0,${f.ty})`}>
          {/* Body */}
          <ellipse cx={0} cy={0} rx={14} ry={8} fill={f.c} />
          {/* Tail on the RIGHT (behind for leftward swimmer) */}
          <polygon points="14,0 24,-8 24,8" fill={f.c} />
          {/* Stripe */}
          <line x1={-2} y1={-7} x2={-2} y2={7} stroke="rgba(0,0,0,0.25)" strokeWidth={2} />
          {/* Eye on the LEFT (front) */}
          <circle cx={-6} cy={-2} r={2.5} fill="#111" />
          <circle cx={-7} cy={-3} r={1} fill="white" opacity={0.6} />
          </g>
        </g>
      ))}
      {/* Bubbles */}
      {Array.from({length:12},(_,i)=>(
        <circle key={i} cx={(i*93+60)%800} cy={480} r={2+i%4} fill="none" stroke="#80e0ff" strokeWidth={1} opacity={0.4} style={{ animation: `bg-bubble ${3+i*.4}s ${i*.35}s linear infinite` }} />
      ))}
      {/* Treasure chest on seafloor */}
      <g transform="translate(100,420)"><g style={{ animation: 'bg-glow 4s ease-in-out infinite' }}>
        <rect x={-25} y={-20} width={50} height={30} rx={4} fill="#8B4513" />
        <rect x={-25} y={-20} width={50} height={14} rx={4} fill="#6B3010" />
        <rect x={-5} y={-14} width={10} height={8} rx={2} fill="#FFD700" />
        {/* Coins spilling */}
        {[-35,-28,-40,-20,-42].map((dx,i)=>(
          <ellipse key={i} cx={dx} cy={i%2*6} rx={6} ry={4} fill="#FFD700" opacity={0.8} />
        ))}
        {/* Glow */}
        <ellipse cx={0} cy={0} rx={40} ry={20} fill="#FFD700" opacity={0.08} style={{ animation: 'bg-pulse 3s ease-in-out infinite' }} />
      </g>
      </g>
      {/* Oysters with pearls */}
      {[{x:620,y:425},{x:480,y:430}].map((o,i)=>(
        <g key={i} transform={`translate(${o.x},${o.y})`}>
          <g style={{ animation: `bg-pulse-sm ${4+i}s ${i}s ease-in-out infinite` }}>
            {/* Shell halves */}
            <ellipse cx={0} cy={0} rx={20} ry={12} fill="#b0a090" />
            <path d="M-20,0 Q0,-16 20,0" fill="#c8b8a8" />
            {/* Pearl */}
            <circle cx={0} cy={-3} r={7} fill="#f0eef4" />
            <circle cx={-3} cy={-5} r={2.5} fill="white" opacity={0.7} />
            <ellipse cx={0} cy={-3} rx={7} ry={7} fill="#e8e4f0" opacity={0.3} style={{ animation: `bg-glow ${2+i}s ease-in-out infinite` }} />
          </g>
        </g>
      ))}
    </svg>
  )
}

function Scene_monsoon() {
  return (
    <>
      {/* Full-screen lightning flash overlay */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 10, background: 'rgba(220,235,255,1)', pointerEvents: 'none', animation: 'bg-screen-flash 8s 1s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 9, background: 'rgba(180,210,255,1)', pointerEvents: 'none', animation: 'bg-screen-flash2 7s 4.5s ease-in-out infinite' }} />
      <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 2 }}>
        <defs>
          <linearGradient id="mo-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0a0a18" /><stop offset="100%" stopColor="#101828" /></linearGradient>
        </defs>
        <rect width={800} height={450} fill="url(#mo-bg)" />
        {/* Dark storm clouds — multiple moving layers */}
        <CloudShape x={200} y={155} w={400} fill="#1a1a28" style={{ animation: 'bg-cloud-drift 12s ease-in-out infinite alternate' }} />
        <CloudShape x={300} y={130} w={340} fill="#222230" style={{ animation: 'bg-cloud-drift 10s ease-in-out infinite alternate' }} />
        <CloudShape x={570} y={165} w={440} fill="#181828" style={{ animation: 'bg-cloud-drift 14s ease-in-out infinite alternate-reverse' }} />
        <CloudShape x={660} y={128} w={360} fill="#202030" style={{ animation: 'bg-cloud-drift 9s ease-in-out infinite alternate-reverse' }} />
        <CloudShape x={400} y={185} w={500} fill="#141422" style={{ animation: 'bg-cloud-drift 11s ease-in-out infinite alternate' }} />
        {/* Lightning bolt drawn on screen */}
        <polyline points="450,80 432,145 452,145 434,225" stroke="#c8d8ff" strokeWidth={5} strokeLinejoin="round" strokeLinecap="round"
          strokeDasharray="200 200" style={{ animation: 'bg-lightning-draw 8s 1.2s linear infinite' }} />
        <polyline points="200,60 186,115 202,115 188,190" stroke="#b0c8ff" strokeWidth={4} strokeLinejoin="round" strokeLinecap="round"
          strokeDasharray="160 160" style={{ animation: 'bg-lightning-draw 8s 4.8s linear infinite' }} />
        {/* Heavy rain */}
        <Rain n={36} heavy={true} />
        {/* Tree bending in wind */}
        <g style={{ animation: 'bg-sway 2s ease-in-out infinite', transformOrigin: '100px 500px' }}>
          <rect x={95} y={300} width={10} height={200} rx={4} fill="#1a3010" />
          <ellipse cx={100} cy={300} rx={35} ry={55} fill="#1e3a12" transform="rotate(15,100,300)" />
        </g>
        {/* Ground / puddle ripples */}
        <rect x={0} y={410} width={800} height={40} fill="#0a1020" />
        {[150,350,550,700].map((x,i)=>(
          <ellipse key={i} cx={x} cy={475} rx={25} ry={8} fill="none" stroke="#3060a0" strokeWidth={1.5} opacity={0.5} style={{ animation: `bg-ripple ${1.5+i*.3}s ${i*.3}s ease-out infinite` }} />
        ))}
        {/* Floating boats on flooded street */}
        {[{x:80},{x:500}].map((b,i)=>(
          <g key={i} transform={`translate(${b.x},458)`}>
            <g style={{ animation: `bg-bob ${3+i}s ${i}s ease-in-out infinite` }}>
            <path d="M-22,0 L-18,-10 L18,-10 L22,0Z" fill="#6a3a10" />
            <rect x={-4} y={-18} width={8} height={10} fill="#8a5030" />
            </g>
          </g>
        ))}
        {/* Floating leaf */}
        <g transform="translate(-30,0)"><g style={{ animation: 'bg-drift-r 15s 3s linear infinite normal backwards' }}>
          <ellipse cx={300} cy={417} rx={12} ry={6} fill="#2a5010" opacity={0.7} transform="rotate(-15,300,417)" />
        </g>
        </g>
        {/* Lightning striking ground */}
        <polyline points="350,100 332,160 350,160 325,250 340,250 310,380"
          stroke="#e0e8ff" strokeWidth={4} strokeLinejoin="round" strokeLinecap="round"
          strokeDasharray="300 300" style={{ animation: 'bg-lightning-draw 8s 2.5s linear infinite' }} />
        <ellipse cx={310} cy={382} rx={20} ry={5} fill="#c0d8ff" opacity={0} style={{ animation: 'bg-burst-sm 8s 3.1s ease-out infinite' }} />
      </svg>
    </>
  )
}

function Scene_candy() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="bg-scene-svg">
      <defs>
        <linearGradient id="ca-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff70cc" /><stop offset="100%" stopColor="#ffbbee" /></linearGradient>
        <radialGradient id="lollipop-shine" cx="35%" cy="35%"><stop offset="0%" stopColor="rgba(255,255,255,0.55)" /><stop offset="100%" stopColor="rgba(255,255,255,0)" /></radialGradient>
      </defs>
      <rect width={800} height={450} fill="url(#ca-bg)" />
      {/* Cotton candy clouds */}
      {[{x:120,y:92},{x:420,y:75},{x:690,y:96}].map((c,i)=>(
        <CloudShape key={i} x={c.x} y={c.y} w={170} fill="rgba(255,210,240,0.88)" style={{ animation: `bg-cloud-drift ${9+i*2}s ease-in-out infinite alternate` }} />
      ))}
      {/* Rainbow stripes across ground */}
      {['#ff4040','#ff8800','#ffee00','#40cc40','#4080ff','#8040ff'].map((c,i)=>(
        <ellipse key={i} cx={400} cy={520} rx={420-i*26} ry={290-i*18} fill="none" stroke={c} strokeWidth={14} opacity={0.45} />
      ))}
      {/* Candy cane sticks — clean solid stripes, no dash */}
      {[55,160,580,685].map((x,i)=>(
        <g key={i} style={{ animation: `bg-sway-sm ${3.5+i*.3}s ${i*.4}s ease-in-out infinite` }}>
          {/* Stick — white base */}
          <rect x={x+6} y={240} width={18} height={240} rx={9} fill="white" />
          {/* Red spiral stripes drawn as overlapping rects */}
          {Array.from({length:7},(_,j)=>(
            <rect key={j} x={x+6} y={250+j*34} width={18} height={18} rx={5} fill="#ff2244" />
          ))}
          {/* Hook — solid closed circle at top */}
          <path d={`M${x+6},240 C${x+6},210 ${x+46},210 ${x+46},240`} fill="none" stroke="white" strokeWidth={18} strokeLinecap="round" />
          <path d={`M${x+6},240 C${x+6},210 ${x+46},210 ${x+46},240`} fill="none" stroke="#ff2244" strokeWidth={8} strokeLinecap="round" />
        </g>
      ))}
      {/* Lollipop — left: swirl disc on stick */}
      <g transform="translate(260,310)"><g style={{ animation: 'bg-float-sm 4s ease-in-out infinite' }}>
        <rect x={-5} y={0} width={10} height={140} rx={5} fill="#c8a060" />
        {/* Disc */}
        <circle cx={0} cy={0} r={65} fill="#ff3388" />
        <circle cx={0} cy={0} r={55} fill="#ff6600" />
        <circle cx={0} cy={0} r={44} fill="#ffee00" />
        <circle cx={0} cy={0} r={33} fill="#ff3388" />
        <circle cx={0} cy={0} r={22} fill="#ff6600" />
        <circle cx={0} cy={0} r={11} fill="#ffee00" />
        {/* Swirl lines */}
        <path d="M0,-65 Q26,-55 45,-35 Q60,-10 55,20 Q48,48 25,60" stroke="rgba(255,255,255,0.45)" strokeWidth={4} fill="none" />
        <path d="M0,65 Q-26,55 -45,35 Q-60,10 -55,-20 Q-48,-48 -25,-60" stroke="rgba(255,255,255,0.35)" strokeWidth={3} fill="none" />
        {/* Shine */}
        <circle cx={0} cy={0} r={65} fill="url(#lollipop-shine)" />
      </g></g>
      {/* Lollipop — right: star disc on stick */}
      <g transform="translate(540,290)"><g style={{ animation: 'bg-float-sm 5s 0.8s ease-in-out infinite' }}>
        <rect x={-5} y={10} width={10} height={150} rx={5} fill="#c8a060" />
        {/* Star-shaped disc */}
        <circle cx={0} cy={0} r={60} fill="#c040ff" />
        <circle cx={0} cy={0} r={50} fill="#ff60cc" />
        <circle cx={0} cy={0} r={38} fill="#c040ff" />
        <circle cx={0} cy={0} r={26} fill="#ff60cc" />
        <circle cx={0} cy={0} r={14} fill="#c040ff" />
        <path d="M0,-60 Q22,-50 40,-30 Q55,-8 50,18 Q42,46 20,58" stroke="rgba(255,255,255,0.4)" strokeWidth={4} fill="none" />
        <circle cx={0} cy={0} r={60} fill="url(#lollipop-shine)" />
      </g></g>
      {/* Gingerbread house */}
      <g transform="translate(320,335)">
        <rect x={0} y={0} width={160} height={100} rx={8} fill="#c87830" />
        <polygon points="0,0 80,-80 160,0" fill="#a05520" />
        {/* Roof icing — solid drips */}
        <path d="M0,0 Q10,-4 15,6 Q20,-2 25,8 Q30,-4 35,5 Q40,-6 45,4 Q55,-5 65,6 Q75,-6 80,-3 Q85,-6 95,5 Q105,-5 115,6 Q125,-5 135,4 Q145,-4 155,5 Q158,-2 160,0" fill="white" opacity={0.9} />
        <rect x={55} y={40} width={50} height={60} rx={6} fill="#88441a" />
        <rect x={75} y={40} width={10} height={60} rx={3} fill="#6a3010" />
        {/* Windows */}
        <rect x={10} y={20} width={30} height={25} rx={4} fill="#ffee80" opacity={0.8} />
        <rect x={120} y={20} width={30} height={25} rx={4} fill="#ffee80" opacity={0.8} />
        {/* Candy dots on wall */}
        {[22,38,110,132].map((cx,j)=>(
          <circle key={j} cx={cx} cy={60} r={8} fill={['#ff4080','#40ff80','#ffee40','#4080ff'][j]} />
        ))}
        {/* Chimney */}
        <rect x={110} y={-50} width={18} height={38} rx={3} fill="#c87830" />
        <ellipse cx={119} cy={-53} rx={14} ry={8} fill="#8B5210" />
        <circle cx={119} cy={-55} r={5} fill="#ff6600" opacity={0.7} style={{ animation: 'bg-pulse-sm 2s ease-in-out infinite' }} />
      </g>
      {/* Gummy bears */}
      {[{x:150,y:440,c:'#ff4080'},{x:420,y:455,c:'#40c0ff'},{x:650,y:445,c:'#80ff60'}].map((b,i)=>(
        <g key={i} transform={`translate(${b.x},${b.y})`}>
          <g style={{ animation: `bg-float-sm ${4+i}s ${i*.5}s ease-in-out infinite` }}>
            {/* Body */}
            <ellipse cx={0} cy={0} rx={14} ry={18} fill={b.c} opacity={0.85} />
            {/* Head */}
            <circle cx={0} cy={-20} r={12} fill={b.c} opacity={0.85} />
            {/* Ears */}
            <circle cx={-8} cy={-30} r={6} fill={b.c} opacity={0.85} />
            <circle cx={8} cy={-30} r={6} fill={b.c} opacity={0.85} />
            {/* Eyes */}
            <circle cx={-4} cy={-22} r={2.5} fill="#1a0a10" />
            <circle cx={4} cy={-22} r={2.5} fill="#1a0a10" />
            {/* Nose */}
            <circle cx={0} cy={-17} r={2} fill="#1a0a10" opacity={0.6} />
            {/* Arms */}
            <ellipse cx={-16} cy={-4} rx={7} ry={5} fill={b.c} opacity={0.85} transform="rotate(30,-16,-4)" />
            <ellipse cx={16} cy={-4} rx={7} ry={5} fill={b.c} opacity={0.85} transform="rotate(-30,16,-4)" />
            {/* Shine */}
            <circle cx={-5} cy={-24} r={2} fill="rgba(255,255,255,.5)" />
          </g>
        </g>
      ))}
      {/* Sprinkle rain */}
      {Array.from({length:22},(_,i)=>(
        <rect key={i} x={(i*83+15)%800} y={(i*57)%200-30} width={5} height={12} rx={2.5}
          fill={['#ff4080','#40cc80','#ffee40','#4080ff','#ff8040','#c040ff'][i%6]}
          style={{ animation: `bg-fall ${2.5+i*.35}s ${i*.18}s linear infinite` }}
          transform={`rotate(${i*25},${(i*83+15)%800},${(i*57)%200-30})`} />
      ))}
    </svg>
  )
}

function Scene_bubblegum() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="bg-scene-svg">
      <defs>
        <linearGradient id="bg2-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f0c0e8" /><stop offset="100%" stopColor="#f8e0f5" /></linearGradient>
      </defs>
      <rect width={800} height={450} fill="url(#bg2-bg)" />
      {/* Gumball machine */}
      <g transform="translate(380,230)">
        <ellipse cx={0} cy={0} rx={90} ry={95} fill="rgba(255,100,160,.25)" stroke="#ff60a0" strokeWidth={3} />
        <rect x={-22} y={88} width={44} height={40} rx={6} fill="#cc4080" />
        <rect x={-30} y={125} width={60} height={15} rx={6} fill="#aa2060" />
        {/* Gumballs inside */}
        {[{x:-40,y:-30,c:'#ff4080'},{x:20,y:-50,c:'#40ccff'},{x:-10,y:10,c:'#ffee40'},{x:40,y:-20,c:'#80ff80'},{x:-35,y:30,c:'#ff8040'},{x:30,y:20,c:'#c040ff'},{x:0,y:-20,c:'#ff6080'}].map((g,i)=>(
          <circle key={i} cx={g.x} cy={g.y} r={16} fill={g.c} opacity={0.85} style={{ animation: `bg-pulse-sm ${2+i*.3}s ${i*.2}s ease-in-out infinite` }} />
        ))}
      </g>
      {/* Rising bubbles */}
      {Array.from({length:16},(_,i)=>(
        <g key={i} style={{ animation: `bg-bubble ${4+i*.4}s ${i*.35}s linear infinite` }}>
          <circle cx={(i*113+30)%800} cy={430} r={8+i%5*5} fill="none" stroke={['#ff80c0','#80c0ff','#80ffc0','#ffc080'][i%4]} strokeWidth={2} opacity={0.5} />
          <ellipse cx={(i*113+33)%800-5} cy={424} rx={4} ry={2} fill="white" opacity={0.4} />
        </g>
      ))}
      {/* Cotton candy clouds */}
      {[{x:100,y:88},{x:400,y:78},{x:650,y:92}].map((c,i)=>(
        <CloudShape key={i} x={c.x} y={c.y} w={160} fill="rgba(255,180,220,.7)" style={{ animation: `bg-cloud-drift ${8+i*2}s ease-in-out infinite alternate` }} />
      ))}
      {/* Sprinkles raining down */}
      {Array.from({length:14},(_,i)=>(
        <rect key={i} x={(i*77+15)%800} y={0} width={5} height={12} rx={2.5} fill={['#ff4080','#40c0ff','#ffee40'][i%3]} style={{ animation: `bg-fall ${4+i*.3}s ${i*.25}s linear infinite` }} transform={`rotate(${i*15})`} />
      ))}
    </svg>
  )
}

function Scene_icecream() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="bg-scene-svg">
      <defs>
        <linearGradient id="ic-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fff8e1"/><stop offset="100%" stopColor="#ffe0b2"/></linearGradient>
        <linearGradient id="ic-truck" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ffffff"/><stop offset="100%" stopColor="#f0f0f0"/></linearGradient>
      </defs>
      <rect width={800} height={450} fill="url(#ic-bg)" />
      {/* Rainbow arcs */}
      {['#ff4040','#ff8800','#ffee00','#40cc40','#4080ff','#8040ff'].map((c,i)=>(
        <ellipse key={i} cx={400} cy={450} rx={370-i*22} ry={260-i*16} fill="none" stroke={c} strokeWidth={12} opacity={0.4}/>
      ))}
      {/* Ground */}
      <rect x={0} y={400} width={800} height={50} fill="#a8e6a0" opacity={0.7}/>
      <rect x={0} y={415} width={800} height={35} fill="#88cc80" opacity={0.5}/>
      {/* Ice cream truck — parked right side */}
      <g transform="translate(530,340)">
        {/* Body */}
        <rect x={-110} y={-120} width={220} height={130} rx={10} fill="url(#ic-truck)" stroke="#e0e0e0" strokeWidth={2}/>
        {/* Roof / serving window awning */}
        <rect x={-110} y={-135} width={220} height={20} rx={6} fill="#ff6b9d"/>
        {/* Awning stripes */}
        {[-90,-60,-30,0,30,60].map((x,i)=>(
          <rect key={i} x={x} y={-135} width={15} height={20} fill="#ff4080" opacity={0.5}/>
        ))}
        {/* Serving window */}
        <rect x={-40} y={-110} width={90} height={60} rx={4} fill="#e0f4ff" stroke="#ccc" strokeWidth={1.5}/>
        {/* Vendor in window */}
        <circle cx={20} cy={-90} r={14} fill="#f5c8a0"/>
        <rect x={8} y={-76} width={24} height={20} rx={4} fill="#ff6b9d"/>
        <path d="M6,-96 Q20,-106 34,-96" fill="#8b4513" stroke="#8b4513" strokeWidth={2}/>
        {/* Cone in vendor hand */}
        <polygon points="20,-65 12,-45 28,-45" fill="#f5c87a"/>
        <circle cx={20} cy={-67} r={10} fill="#ff80a0"/>
        {/* Text on truck */}
        <text x={-100} y={-20} fontSize={14} fill="#ff4080" fontWeight="bold" fontFamily="Nunito,sans-serif">ICE CREAM!</text>
        {/* Wheels */}
        <circle cx={-70} cy={15} r={22} fill="#444"/><circle cx={-70} cy={15} r={12} fill="#666"/><circle cx={-70} cy={15} r={4} fill="#888"/>
        <circle cx={70} cy={15} r={22} fill="#444"/><circle cx={70} cy={15} r={12} fill="#666"/><circle cx={70} cy={15} r={4} fill="#888"/>
        {/* Bell / music note */}
        <text x={-105} y={-50} fontSize={18} style={{ animation: 'bg-glow 1.5s ease-in-out infinite' }}>🔔</text>
      </g>
      {/* Kid 1 running toward truck */}
      <g style={{ animation: 'bg-drift-r 8s 0.5s ease-in-out infinite normal backwards' }}>
        <g transform="translate(-60,345)">
          <circle cx={0} cy={-50} r={14} fill="#f5c8a0"/>
          <path d="M-6,-42 Q0,-36 6,-42" stroke="#8b4513" strokeWidth={8} fill="none" strokeLinecap="round"/>
          <rect x={-10} y={-36} width={20} height={24} rx={4} fill="#ff9040"/>
          <path d="M-10,-24 Q-20,-16 -22,-8" stroke="#f5c8a0" strokeWidth={6} fill="none" strokeLinecap="round"/>
          <path d="M10,-24 Q18,-14 16,-6" stroke="#f5c8a0" strokeWidth={6} fill="none" strokeLinecap="round"/>
          <path d="M-6,-12 Q-12,4 -8,20" stroke="#3a7ad0" strokeWidth={7} fill="none" strokeLinecap="round" style={{ animation: 'bg-sway-sm 0.4s ease-in-out infinite', transformBox:'fill-box', transformOrigin:'top center' }}/>
          <path d="M6,-12 Q12,4 8,20" stroke="#3a7ad0" strokeWidth={7} fill="none" strokeLinecap="round" style={{ animation: 'bg-sway-sm 0.4s 0.2s ease-in-out infinite', transformBox:'fill-box', transformOrigin:'top center' }}/>
          <text x={-6} y={-58} fontSize={12}>😊</text>
        </g>
      </g>
      {/* Kid 2 running — slightly faster */}
      <g style={{ animation: 'bg-drift-r 6s 2s ease-in-out infinite normal backwards' }}>
        <g transform="translate(-120,345)">
          <circle cx={0} cy={-50} r={13} fill="#c8a060"/>
          <path d="M-6,-44 Q0,-38 8,-42" stroke="#4a2a08" strokeWidth={7} fill="none" strokeLinecap="round"/>
          <rect x={-9} y={-36} width={18} height={22} rx={4} fill="#60c0a0"/>
          <path d="M-9,-20 Q-18,-12 -20,-4" stroke="#c8a060" strokeWidth={6} fill="none" strokeLinecap="round"/>
          <path d="M9,-20 Q16,-10 14,-2" stroke="#c8a060" strokeWidth={6} fill="none" strokeLinecap="round"/>
          <path d="M-5,-14 Q-10,2 -6,18" stroke="#cc6040" strokeWidth={7} fill="none" strokeLinecap="round" style={{ animation: 'bg-sway-sm 0.35s ease-in-out infinite', transformBox:'fill-box', transformOrigin:'top center' }}/>
          <path d="M5,-14 Q10,2 6,18" stroke="#cc6040" strokeWidth={7} fill="none" strokeLinecap="round" style={{ animation: 'bg-sway-sm 0.35s 0.18s ease-in-out infinite', transformBox:'fill-box', transformOrigin:'top center' }}/>
        </g>
      </g>
      {/* Large cone left — detailed */}
      <g transform="translate(130,280)">
        <polygon points="-55,60 55,60 0,190" fill="#f5c87a"/>
        {[-3,-1,1,3].map(k=>(
          <line key={k} x1={k*14} y1={60} x2={k*5} y2={190} stroke="#e0a040" strokeWidth={1.5} opacity={0.6}/>
        ))}
        {/* Drip */}
        <path d="M30,60 Q36,80 32,95" stroke="#ff80a0" strokeWidth={5} fill="none" strokeLinecap="round" style={{ animation: 'bg-float-sm 2s ease-in-out infinite' }}/>
        <circle cx={32} cy={96} r={5} fill="#ff80a0" style={{ animation: 'bg-float-sm 2s ease-in-out infinite' }}/>
        <circle cx={0} cy={12} r={54} fill="#ff80a0"/>
        <circle cx={0} cy={-46} r={48} fill="#c080ff"/>
        <circle cx={0} cy={-100} r={42} fill="#80c8ff"/>
        <circle cx={0} cy={-100} r={10} fill="#ff3344"/>
        <path d="M0,-112 Q14,-98 8,-108" stroke="#20a020" strokeWidth={2.5} fill="none"/>
      </g>
      {/* Sprinkle rain */}
      {Array.from({length:22},(_,i)=>(
        <rect key={i} x={(i*83+10)%800} y={0} width={5} height={12} rx={2.5}
          fill={['#ff4080','#40c0ff','#ffee40','#80ff80','#ff8040'][i%5]}
          style={{ animation: `bg-fall ${4+i*.35}s ${i*.2}s linear infinite` }} transform={`rotate(${i*20})`}/>
      ))}
      {/* Music notes floating from truck */}
      {['♪','♫','♩'].map((n,i)=>(
        <text key={i} x={560+i*18} y={200} fontSize={18+i*4} fill="#ff6b9d" opacity={0.8}
          style={{ animation: `bg-drift-up ${3+i*.5}s ${i*.7}s ease-in-out infinite` }}>{n}</text>
      ))}
    </svg>
  )
}

function Scene_pizza() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="bg-scene-svg">
      <defs>
        <linearGradient id="pz-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff8800" /><stop offset="100%" stopColor="#cc5500" /></linearGradient>
      </defs>
      <rect width={800} height={450} fill="url(#pz-bg)" />
      {/* Giant pizza slice landscape */}
      <polygon points="400,80 -50,500 850,500" fill="#f5d080" />
      <polygon points="400,80 -50,500 850,500" fill="#cc3300" opacity={0.7} /> {/* sauce layer */}
      <polygon points="400,80 -30,480 830,480" fill="#f5c858" opacity={0.5} /> {/* cheese */}
      {/* Cheese bubbles */}
      {Array.from({length:8},(_,i)=>(
        <circle key={i} cx={(i*120+60)%800} cy={400+i%3*20} r={20+i%3*10} fill="#f5d060" opacity={0.6} style={{ animation: `bg-bubble ${5+i*.5}s ${i*.4}s ease-out infinite` }} />
      ))}
      {/* Pepperoni */}
      {[{x:200,y:350},{x:380,y:280},{x:550,y:360},{x:300,y:430},{x:480,y:430},{x:650,y:400}].map((p,i)=>(
        <circle key={i} cx={p.x} cy={p.y} r={22} fill="#cc2200" opacity={0.8} style={{ animation: `bg-pulse-sm ${3+i*.3}s ease-in-out infinite` }} />
      ))}
      {/* Basil leaves */}
      {[{x:280,y:320},{x:500,y:390}].map((l,i)=>(
        <ellipse key={i} cx={l.x} cy={l.y} rx={18} ry={10} fill="#20a040" opacity={0.7} transform={`rotate(${i*30-15},${l.x},${l.y})`} />
      ))}
      {/* Steam wisps */}
      {[250,400,550].map((x,i)=>(
        <path key={i} d={`M${x},250 Q${x+10},230 ${x},210 Q${x-10},190 ${x},170`} stroke="rgba(255,255,255,.5)" strokeWidth={4} fill="none" strokeLinecap="round" style={{ animation: `bg-steam ${3+i*.5}s ${i*.5}s ease-in-out infinite` }} />
      ))}
      {/* Pizza slices raining from sky */}
      {[{x:80,rot:20},{x:200,rot:-15},{x:600,rot:35},{x:720,rot:-25}].map((p,i)=>(
        <g key={i} style={{ animation: `bg-fall ${5+i*.5}s ${i*.8}s linear infinite` }}>
          <g transform={`translate(${p.x},${-20+i*15}) rotate(${p.rot})`}>
          <polygon points="0,0 -22,44 22,44" fill="#f5c858" />
          <polygon points="0,0 -22,44 22,44" fill="#cc3300" opacity={0.6} />
          <circle cx={0} cy={30} r={6} fill="#cc2200" opacity={0.8} />
          <path d="M-18,38 Q0,44 18,38" fill="white" opacity={0.3} />
          </g>
        </g>
      ))}
      {/* Chef hat floating */}
      <g transform="translate(680,80)">
        <g style={{ animation: 'bg-float 5s ease-in-out infinite' }}>
          {/* Brim */}
          <ellipse cx={0} cy={0} rx={32} ry={8} fill="white" />
          {/* Hat crown */}
          <rect x={-24} y={-45} width={48} height={48} rx={5} fill="white" />
          <ellipse cx={0} cy={-45} rx={28} ry={14} fill="white" />
          {/* Band */}
          <rect x={-24} y={-8} width={48} height={8} rx={2} fill="#e0e0e0" />
        </g>
      </g>
    </svg>
  )
}

function Scene_donut() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="bg-scene-svg">
      <defs>
        <linearGradient id="do-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fff0f8"/><stop offset="100%" stopColor="#ffd6ee"/></linearGradient>
        <clipPath id="do-c0"><rect x={100} y={100} width={100} height={50}/></clipPath>
        <clipPath id="do-c1"><rect x={330} y={110} width={110} height={55}/></clipPath>
        <clipPath id="do-c2"><rect x={595} y={120} width={100} height={50}/></clipPath>
        <clipPath id="do-c3"><rect x={180} y={300} width={96} height={48}/></clipPath>
        <clipPath id="do-c4"><rect x={495} y={295} width={100} height={50}/></clipPath>
      </defs>
      <rect width={800} height={450} fill="url(#do-bg)" />
      {/* Bakery shop counter */}
      <rect x={0} y={370} width={800} height={80} fill="#f5e6d0" stroke="#d4a060" strokeWidth={2}/>
      <rect x={0} y={370} width={800} height={12} fill="#d4a060"/>
      {/* Shop window */}
      <rect x={50} y={220} width={200} height={150} rx={8} fill="#e0f4ff" stroke="#d4a060" strokeWidth={3}/>
      <text x={80} y={248} fontSize={13} fill="#cc4488" fontWeight="bold" fontFamily="Nunito,sans-serif">🍩 DONUT SHOP</text>
      {/* Conveyor belt */}
      <rect x={50} y={340} width={700} height={30} rx={6} fill="#ccc" stroke="#aaa" strokeWidth={1}/>
      <rect x={50} y={340} width={700} height={30} rx={6} fill="none" stroke="#bbb" strokeWidth={1}
        strokeDasharray="20 10" style={{ animation: 'bg-drift-l 2s linear infinite' }}/>
      {/* Donuts on conveyor */}
      {[{x:120,c:'#ff80a0',f:'#f5c090'},{x:280,c:'#80c0ff',f:'#f5e0c0'},{x:440,c:'#c080ff',f:'#f5c8a0'},{x:600,c:'#ffcc40',f:'#f5d0b0'}].map((d,i)=>(
        <g key={i} style={{ animation: `bg-drift-l ${8+i}s ${i*1.5}s linear infinite normal backwards` }}>
          <g transform={`translate(${d.x},355)`}>
            <circle cx={0} cy={0} r={22} fill={d.f}/>
            <circle cx={0} cy={0} r={10} fill="#ffd6ee"/>
            <circle cx={0} cy={0} r={22} fill={d.c} opacity={0.75} clipPath={`url(#do-c${i})`} style={{ clipPath:'none' }}/>
            {/* frosting drip */}
            <path d={`M${i%2===0?12:-12},-16 Q${i%2===0?18:-18},-8 ${i%2===0?14:-14},0`}
              stroke={d.c} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.8}/>
            {[0,1,2].map(j=>(
              <rect key={j} x={-16+j*10} y={-18} width={5} height={9} rx={2.5}
                fill={['#ff4080','#40c0ff','#ffee40'][j]} transform={`rotate(${j*20-10})`} opacity={0.9}/>
            ))}
          </g>
        </g>
      ))}
      {/* Baker character */}
      <g transform="translate(690,330)">
        <g style={{ animation: 'bg-bob 2s ease-in-out infinite' }}>
          {/* Chef hat */}
          <ellipse cx={0} cy={-88} rx={20} ry={8} fill="white" stroke="#ddd" strokeWidth={1}/>
          <rect x={-16} y={-120} width={32} height={36} rx={4} fill="white" stroke="#ddd" strokeWidth={1}/>
          <ellipse cx={0} cy={-120} rx={18} ry={10} fill="white"/>
          {/* Head */}
          <circle cx={0} cy={-70} r={22} fill="#f5c8a0"/>
          {/* Eyes + smile */}
          <circle cx={-7} cy={-73} r={3} fill="#333"/>
          <circle cx={7} cy={-73} r={3} fill="#333"/>
          <path d="M-7,-62 Q0,-57 7,-62" stroke="#333" strokeWidth={1.5} fill="none"/>
          {/* Body / apron */}
          <rect x={-18} y={-48} width={36} height={50} rx={6} fill="#ff80cc"/>
          <rect x={-12} y={-44} width={24} height={42} rx={4} fill="white" opacity={0.6}/>
          {/* Arms — one holding piping bag */}
          <path d="M-18,-36 Q-34,-24 -38,-14" stroke="#f5c8a0" strokeWidth={10} fill="none" strokeLinecap="round"/>
          <rect x={-48} y={-20} width={14} height={22} rx={4} fill="#ff4080" transform="rotate(-20,-41,-9)"/>
          <path d="M18,-36 Q32,-22 30,-10" stroke="#f5c8a0" strokeWidth={10} fill="none" strokeLinecap="round"/>
          {/* Glaze drip from piping bag */}
          <path d="M-44,-6 Q-46,6 -42,16" stroke="#ff80a0" strokeWidth={3} fill="none" strokeLinecap="round"
            style={{ animation: 'bg-float-sm 1.5s ease-in-out infinite' }}/>
          <circle cx={-42} cy={17} r={4} fill="#ff80a0" style={{ animation: 'bg-float-sm 1.5s ease-in-out infinite' }}/>
        </g>
      </g>
      {/* Floating donuts in sky */}
      {[{cx:150,cy:180,c:'#ff80a0',f:'#f5c090'},{cx:400,cy:140,c:'#80c0ff',f:'#f5e0c0'},{cx:610,cy:170,c:'#80d080',f:'#f5d0b0'}].map((d,i)=>(
        <g key={i} style={{ animation: `bg-float ${5+i}s ${i*.8}s ease-in-out infinite` }}>
          <circle cx={d.cx} cy={d.cy} r={42} fill={d.f}/>
          <circle cx={d.cx} cy={d.cy} r={19} fill="#ffd6ee"/>
          <circle cx={d.cx} cy={d.cy} r={42} fill={d.c} opacity={0.72} clipPath={`url(#do-c${i})`} style={{ clipPath:'none' }}/>
          {[0,1,2,3].map(j=>(
            <rect key={j} x={d.cx-14+j*9} y={d.cy-36} width={5} height={9} rx={2.5}
              fill={['#ff4080','#40c0ff','#ffee40','#80ff80'][j]} transform={`rotate(${j*35},${d.cx},${d.cy})`} opacity={0.9}/>
          ))}
        </g>
      ))}
      {/* Sprinkle rain */}
      {Array.from({length:18},(_,i)=>(
        <rect key={i} x={(i*83+20)%800} y={0} width={5} height={12} rx={2.5}
          fill={['#ff4080','#40c0ff','#ffee40','#80ff80'][i%4]}
          style={{ animation: `bg-fall ${4+i*.3}s ${i*.22}s linear infinite` }} transform={`rotate(${i*22})`}/>
      ))}
    </svg>
  )
}

function Scene_unicorn() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" overflow="hidden" className="bg-scene-svg">
      <defs>
        <linearGradient id="un-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c080ff"/><stop offset="50%" stopColor="#ff80cc"/><stop offset="100%" stopColor="#aaddff"/>
        </linearGradient>
      </defs>
      <rect width={800} height={450} fill="url(#un-bg)" />
      {/* Rainbow arcs */}
      {['#ff4040','#ff8800','#ffee00','#40cc40','#4080ff','#8040ff'].map((c,i)=>(
        <ellipse key={i} cx={400} cy={450} rx={400-i*28} ry={300-i*18} fill="none" stroke={c} strokeWidth={14} opacity={0.55} />
      ))}
      {/* Puffy clouds using CloudShape */}
      <CloudShape x={30}  y={48}  w={170} fill="white" opacity={0.92} style={{ animation: 'bg-drift-r 36s linear infinite' }} />
      <CloudShape x={560} y={38}  w={140} fill="white" opacity={0.88} style={{ animation: 'bg-drift-r 44s 10s linear infinite' }} />
      <CloudShape x={260} y={68}  w={120} fill="white" opacity={0.8}  style={{ animation: 'bg-drift-r 50s 20s linear infinite' }} />
      {/* Unicorn drifting gently left-right */}
      <g style={{ animation: 'bg-drift-lr 14s ease-in-out infinite' }}>
        {/* Tail — drawn first so body overlaps it */}
        <path d="M480,274 C500,252 520,244 522,260 C524,276 506,298 498,318" stroke="#ff80cc" strokeWidth={9} fill="none" strokeLinecap="round" />
        <path d="M480,280 C504,260 528,254 528,272 C528,288 510,310 502,332" stroke="#c060ff" strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d="M480,286 C506,268 530,266 530,284 C530,300 512,322 504,344" stroke="#80c0ff" strokeWidth={4} fill="none" strokeLinecap="round" />
        {/* Main body — large horizontal ellipse like a real horse torso */}
        <ellipse cx={400} cy={280} rx={88} ry={48} fill="white" />
        {/* Rump/haunches — slightly higher circle to give the horse-back silhouette */}
        <ellipse cx={458} cy={268} rx={42} ry={38} fill="white" />
        {/* Chest/shoulder swell */}
        <ellipse cx={340} cy={266} rx={38} ry={36} fill="white" />
        {/* Neck — thick curved stroke giving the proud arched neck */}
        <path d="M342,252 C330,232 326,212 332,196" stroke="white" strokeWidth={36} fill="none" strokeLinecap="round" />
        {/* Head — elongated horizontal ellipse like a real horse skull */}
        <ellipse cx={310} cy={188} rx={42} ry={26} fill="white" />
        {/* Muzzle — forward-pointing ellipse */}
        <ellipse cx={272} cy={196} rx={28} ry={18} fill="white" />
        {/* Nostril */}
        <ellipse cx={257} cy={200} rx={5} ry={4} fill="#f0b0d0" opacity={0.85} />
        <ellipse cx={266} cy={202} rx={4} ry={3} fill="#e090c0" />
        {/* Horn — solid tapered triangle then shimmer lines */}
        <polygon points="316,164 326,100 336,164" fill="#c080ff" opacity={0.9} />
        <line x1={326} y1={100} x2={316} y2={152} stroke="#e0a0ff" strokeWidth={2.5} opacity={0.6} />
        <line x1={326} y1={100} x2={336} y2={152} stroke="#a050dd" strokeWidth={2}   opacity={0.5} />
        {[110,124,138,152].map((y,i)=>(
          <line key={i} x1={316+i*0.8} y1={y} x2={336-i*0.8} y2={y} stroke="#dda0ff" strokeWidth={1.5} opacity={0.4} />
        ))}
        {/* Ear */}
        <polygon points="338,168 330,148 346,154" fill="white" />
        <polygon points="338,168 332,152 344,157" fill="#f0c0f0" opacity={0.6} />
        {/* Eye */}
        <ellipse cx={292} cy={186} rx={10} ry={10} fill="#7030bb" />
        <ellipse cx={292} cy={186} rx={6}  ry={6}  fill="#111" />
        <circle  cx={289} cy={183} r={3}             fill="white" opacity={0.85} />
        {/* Lashes */}
        <path d="M283,179 Q287,175 293,175" stroke="#5010a0" strokeWidth={1.5} fill="none" strokeLinecap="round" />
        <line x1={285} y1={178} x2={282} y2={174} stroke="#5010a0" strokeWidth={1.5} strokeLinecap="round" />
        <line x1={291} y1={176} x2={290} y2={172} stroke="#5010a0" strokeWidth={1.5} strokeLinecap="round" />
        {/* Mane — rainbow strands flowing back from neck */}
        <path d="M338,194 C348,180 358,168 362,158 C366,150 366,162 360,174 C368,158 378,148 382,142 C382,154 374,168 368,180" stroke="#ff80cc" strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d="M338,202 C350,188 362,176 370,168 C374,162 374,174 368,186 C376,170 386,160 390,155" stroke="#c060ff" strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d="M340,210 C354,196 366,184 376,178" stroke="#80c0ff" strokeWidth={3} fill="none" strokeLinecap="round" />
        {/* Four legs in galloping pose */}
        <path d="M356,312 C348,330 344,350 342,372" stroke="white" strokeWidth={16} fill="none" strokeLinecap="round" />
        <ellipse cx={342} cy={376} rx={12} ry={7} fill="#eeeeee" />
        <path d="M378,318 C372,336 370,356 372,376" stroke="white" strokeWidth={16} fill="none" strokeLinecap="round" />
        <ellipse cx={372} cy={380} rx={12} ry={7} fill="#eeeeee" />
        <path d="M426,314 C432,332 434,352 428,372" stroke="white" strokeWidth={16} fill="none" strokeLinecap="round" />
        <ellipse cx={428} cy={376} rx={12} ry={7} fill="#eeeeee" />
        <path d="M448,308 C456,326 460,346 456,366" stroke="white" strokeWidth={16} fill="none" strokeLinecap="round" />
        <ellipse cx={456} cy={370} rx={12} ry={7} fill="#eeeeee" />
        {/* Sparkle trail */}
        {[[524,268],[544,290],[558,274],[530,320]].map(([x,y],i)=>(
          <polygon key={i}
            points={`${x},${y-10} ${x+3},${y-3} ${x+10},${y} ${x+3},${y+3} ${x},${y+10} ${x-3},${y+3} ${x-10},${y} ${x-3},${y-3}`}
            fill={['#ffee40','#ff80cc','#c080ff','#80ffee'][i]} opacity={0.85}
            style={{ animation: `bg-glow ${1.2+i*.3}s ${i*.2}s ease-in-out infinite` }} />
        ))}
      </g>
      {/* Sparkle field */}
      {Array.from({length:14},(_,i)=>(
        <text key={i} x={(i*113+28)%800} y={65+(i%5)*56} fontSize={10+i%4*4}
          fill={['#ffee40','#ff80cc','#c080ff','#80ffee','#ffffff'][i%5]}
          style={{ animation: `bg-glow ${1.2+i*.25}s ${i*.18}s ease-in-out infinite` }}>✦</text>
      ))}
    </svg>
  )
}

function Scene_storymagic() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="bg-scene-svg">
      <defs>
        <linearGradient id="sm2-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0a1040" /><stop offset="100%" stopColor="#181858" /></linearGradient>
      </defs>
      <rect width={800} height={450} fill="url(#sm2-bg)" />
      <Stars n={50} color="#d0c8ff" />
      {/* Giant open book */}
      <g transform="translate(400,360)">
        <rect x={-160} y={0} width={160} height={120} rx={4} fill="#e8d8b8" transform="rotate(-5,-80,60)" />
        <rect x={0} y={0} width={160} height={120} rx={4} fill="#f0e0c0" transform="rotate(5,80,60)" />
        <line x1={0} y1={5} x2={0} y2={118} stroke="#c0a870" strokeWidth={4} />
        {/* Lines of text */}
        {[20,35,50,65,80].map((y,i)=>(
          <g key={i}>
            <rect x={-140} y={y} width={118+i%3*10} height={4} rx={2} fill="#c0a870" opacity={0.4} transform="rotate(-5,-80,60)" />
            <rect x={10} y={y} width={122+i%2*8} height={4} rx={2} fill="#c0a870" opacity={0.4} transform="rotate(5,80,60)" />
          </g>
        ))}
        {/* Sparkles rising from book */}
        {Array.from({length:12},(_,i)=>(
          <text key={i} x={(i%5-2)*35} y={-i*25-10} fontSize={12+i%3*4} fill={['#ffee40','#ff80ff','#80ffee','#ff8040'][i%4]} opacity={0.8} style={{ animation: `bg-drift-up ${3+i*.4}s ${i*.35}s ease-out infinite` }}>✦</text>
        ))}
      </g>
      {/* Magic quill */}
      <g transform="translate(580,250)"><g style={{ animation: 'bg-float 4s ease-in-out infinite' }}>
        <path d="M0,0 Q-30,-50 -10,-100 Q20,-60 0,0Z" fill="#e8e0c0" />
        <path d="M0,0 Q-5,-45 5,-90" stroke="#c0a840" strokeWidth={2} fill="none" />
        <rect x={-2} y={-2} width={4} height={30} rx={2} fill="#4a3010" />
      </g>
      </g>
      {/* Flying books */}
      {[{x:150,y:180,d:7},{x:650,y:220,d:9}].map((b,i)=>(
        <g key={i} style={{ animation: `bg-float ${b.d}s ${i*2}s ease-in-out infinite` }}>
          <rect x={b.x-20} y={b.y-15} width={40} height={28} rx={3} fill={['#4050c0','#c04050'][i]} />
          <rect x={b.x-18} y={b.y-13} width={36} height={24} rx={2} fill={['#3040a0','#a03040'][i]} opacity={0.5} />
          <line x1={b.x} y1={b.y-15} x2={b.x} y2={b.y+13} stroke="white" strokeWidth={1} opacity={0.3} />
        </g>
      ))}
      {/* Magic spiral from book */}
      <path d="M400,355 Q450,300 400,260 Q350,220 400,190 Q450,160 400,140" fill="none" stroke="#c080ff" strokeWidth={3} opacity={0.5} style={{ animation: 'bg-spin-slow 20s linear infinite', transformOrigin: '400px 250px' }} />
    </svg>
  )
}

function Scene_wordwizard() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="bg-scene-svg">
      <defs>
        <radialGradient id="ww-bg" cx="50%" cy="50%"><stop offset="0%" stopColor="#1a0860" /><stop offset="100%" stopColor="#060218" /></radialGradient>
      </defs>
      <rect width={800} height={450} fill="url(#ww-bg)" />
      <Stars n={60} color="#d8c8ff" />
      {/* Letter constellations */}
      {[{l:'A',x:120,y:100},{l:'B',x:680,y:130},{l:'Z',x:400,y:80}].map((c,i)=>(
        <text key={i} x={c.x} y={c.y} fontSize={60} fill="#6040c0" opacity={0.2} fontFamily="serif" fontWeight="bold" style={{ animation: `bg-pulse ${5+i}s ease-in-out infinite` }}>{c.l}</text>
      ))}
      {/* Magic wand with sparkle sweep */}
      <g style={{ animation: 'bg-sweep 4s ease-in-out infinite', transformOrigin: '640px 350px' }}>
        <line x1={640} y1={350} x2={500} y2={200} stroke="#d0c0ff" strokeWidth={5} strokeLinecap="round" />
        <circle cx={500} cy={200} r={12} fill="#ffee40" style={{ animation: 'bg-glow-fast 0.5s ease-in-out infinite' }} />
        {/* Sparkle trail */}
        {[{x:520,y:220},{x:540,y:240},{x:560,y:260}].map((s,i)=>(
          <text key={i} x={s.x} y={s.y} fontSize={14} fill="#ffee40" style={{ animation: `bg-twinkle ${0.8+i*.2}s ${i*.15}s ease-in-out infinite` }}>✦</text>
        ))}
      </g>
      {/* Flying books */}
      {[{x:150,y:250,d:6},{x:300,y:180,d:8},{x:600,y:280,d:7}].map((b,i)=>(
        <g key={i} style={{ animation: `bg-float ${b.d}s ${i}s ease-in-out infinite` }}>
          <rect x={b.x-22} y={b.y-16} width={44} height={30} rx={4} fill={['#6040c0','#a04080','#4080c0'][i]} />
          <rect x={b.x-20} y={b.y-14} width={40} height={26} rx={3} fill="rgba(255,255,255,.1)" />
        </g>
      ))}
      {/* Floating letters */}
      {['W','O','R','D','S'].map((l,i)=>(
        <text key={i} x={100+i*140} y={400} fontSize={40} fill="#8060d0" opacity={0.3} fontFamily="serif" fontWeight="bold" style={{ animation: `bg-float ${4+i*.5}s ${i*.4}s ease-in-out infinite` }}>{l}</text>
      ))}
      {/* Wizard character — standing right side */}
      <g transform="translate(680,370)">
        {/* Robe */}
        <path d="M-18,-80 Q-28,0 -22,0 L22,0 Q28,0 18,-80Z" fill="#4020a0"/>
        {/* Belt */}
        <rect x={-18} y={-50} width={36} height={7} rx={3} fill="#6040c0"/>
        {/* Head */}
        <circle cx={0} cy={-92} r={14} fill="#f5c8a8"/>
        {/* Beard */}
        <ellipse cx={0} cy={-82} rx={10} ry={8} fill="white" opacity={0.9}/>
        <path d="M-8,-76 Q0,-64 8,-76" fill="white" opacity={0.9}/>
        {/* Eyes */}
        <circle cx={-5} cy={-96} r={2.5} fill="#212121"/>
        <circle cx={5}  cy={-96} r={2.5} fill="#212121"/>
        {/* Pointed hat */}
        <polygon points="-18,-104 0,-155 18,-104" fill="#2a0880"/>
        <rect x={-22} y={-107} width={44} height={7} rx={3} fill="#3a10a0"/>
        {/* Hat star */}
        <text x={0} y={-118} fontSize={14} textAnchor="middle" fill="#ffee40"
          style={{ animation: 'bg-twinkle 1.2s ease-in-out infinite' }}>★</text>
        {/* Wand arm */}
        <line x1={18} y1={-68} x2={42} y2={-90} stroke="#4020a0" strokeWidth={7} strokeLinecap="round"/>
        <line x1={42} y1={-90} x2={54} y2={-102} stroke="#8b6914" strokeWidth={4} strokeLinecap="round"/>
        <circle cx={56} cy={-104} r={6} fill="#ffee40" style={{ animation: 'bg-glow-fast 0.7s ease-in-out infinite' }}/>
        {/* Sparkle stars from wand */}
        {[{x:62,y:-116},{x:74,y:-106},{x:68,y:-92}].map((s,i)=>(
          <text key={i} x={s.x} y={s.y} fontSize={10} fill="#ffee40" textAnchor="middle"
            style={{ animation: `bg-twinkle ${0.6+i*.2}s ${i*.15}s ease-in-out infinite` }}>✦</text>
        ))}
        {/* Legs/feet */}
        <line x1={-8} y1={0} x2={-10} y2={18} stroke="#2a0880" strokeWidth={8} strokeLinecap="round"/>
        <line x1={8}  y1={0} x2={10}  y2={18} stroke="#2a0880" strokeWidth={8} strokeLinecap="round"/>
      </g>
    </svg>
  )
}

function Scene_goldstar() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="bg-scene-svg">
      <defs>
        <linearGradient id="gs-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a0c00"/><stop offset="100%" stopColor="#3a2000"/></linearGradient>
        <radialGradient id="gs-spot" cx="50%" cy="0%"><stop offset="0%" stopColor="#ffe080" stopOpacity={0.35}/><stop offset="100%" stopColor="#ffe080" stopOpacity={0}/></radialGradient>
      </defs>
      <rect width={800} height={450} fill="url(#gs-bg)" />
      {/* Stage floor */}
      <rect x={0} y={360} width={800} height={90} fill="#2a1800"/>
      <rect x={0} y={360} width={800} height={8} fill="#cc8800" opacity={0.5}/>
      {/* Stage curtains */}
      <path d="M0,0 Q40,80 20,200 Q0,320 30,450 L0,450Z" fill="#8b0020" opacity={0.9}/>
      <path d="M0,0 Q60,100 50,220 Q40,330 60,450 L0,450Z" fill="#aa0028" opacity={0.6}/>
      <path d="M800,0 Q760,80 780,200 Q800,320 770,450 L800,450Z" fill="#8b0020" opacity={0.9}/>
      <path d="M800,0 Q740,100 750,220 Q760,330 740,450 L800,450Z" fill="#aa0028" opacity={0.6}/>
      {/* Curtain valance top */}
      <path d="M0,0 Q100,60 200,20 Q300,60 400,20 Q500,60 600,20 Q700,60 800,20 L800,0Z" fill="#8b0020"/>
      {/* Spotlight beams */}
      {[160,400,640].map((x,i)=>(
        <g key={i}>
          <polygon points={`${x-18},0 ${x+18},0 ${x+90},460 ${x-90},460`} fill="url(#gs-spot)"
            style={{ animation: `bg-sweep ${5+i}s ${i}s ease-in-out infinite`, transformBox:'fill-box', transformOrigin:'top center' }}/>
          <ellipse cx={x} cy={455} rx={85} ry={18} fill="#ffe080" opacity={0.12} style={{ animation: `bg-pulse ${3+i}s ease-in-out infinite` }}/>
          {/* Spotlight lamp at top */}
          <rect x={x-14} y={0} width={28} height={16} rx={4} fill="#444"/>
          <ellipse cx={x} cy={16} rx={14} ry={8} fill="#ffe080" opacity={0.8} style={{ animation: `bg-glow ${2+i*.5}s ease-in-out infinite` }}/>
        </g>
      ))}
      {/* Performer on stage — star singer */}
      <g transform="translate(400,310)">
        <g style={{ animation: 'bg-bob 1.2s ease-in-out infinite' }}>
          {/* Sparkle aura */}
          <circle cx={0} cy={-30} r={55} fill="#ffe080" opacity={0.08} style={{ animation: 'bg-pulse 1s ease-in-out infinite' }}/>
          {/* Cape/dress */}
          <path d="M-28,0 Q-50,40 -40,80 Q0,60 40,80 Q50,40 28,0Z" fill="#cc2288"/>
          <path d="M-28,0 Q-52,50 -44,90 L-38,90Z" fill="#ff40a0" opacity={0.5}/>
          <path d="M28,0 Q52,50 44,90 L38,90Z" fill="#ff40a0" opacity={0.5}/>
          {/* Body */}
          <rect x={-18} y={-42} width={36} height={44} rx={8} fill="#ee2288"/>
          {/* Star on chest */}
          <polygon points="0,-28 3,-20 11,-20 5,-14 7,-6 0,-10 -7,-6 -5,-14 -11,-20 -3,-20" fill="#ffd040"/>
          {/* Head */}
          <circle cx={0} cy={-58} r={22} fill="#f5c8a0"/>
          {/* Hair */}
          <ellipse cx={0} cy={-72} rx={22} ry={12} fill="#8b2252"/>
          <path d="M-22,-64 Q-32,-48 -28,-28" stroke="#8b2252" strokeWidth={10} fill="none" strokeLinecap="round"/>
          <path d="M22,-64 Q32,-48 28,-28" stroke="#8b2252" strokeWidth={10} fill="none" strokeLinecap="round"/>
          {/* Microphone arm up */}
          <path d="M-18,-32 Q-34,-44 -40,-54" stroke="#f5c8a0" strokeWidth={8} fill="none" strokeLinecap="round"/>
          <rect x={-50} y={-64} width={12} height={18} rx={4} fill="#333"/>
          <ellipse cx={-44} cy={-64} rx={8} ry={5} fill="#555"/>
          {/* Other arm out */}
          <path d="M18,-32 Q36,-26 42,-16" stroke="#f5c8a0" strokeWidth={8} fill="none" strokeLinecap="round"/>
          {/* Legs */}
          <path d="M-10,2 Q-14,40 -12,75" stroke="#cc2288" strokeWidth={10} fill="none" strokeLinecap="round"/>
          <path d="M10,2 Q14,40 12,75" stroke="#cc2288" strokeWidth={10} fill="none" strokeLinecap="round"/>
          <ellipse cx={-12} cy={78} rx={10} ry={6} fill="#881848"/>
          <ellipse cx={12} cy={78} rx={10} ry={6} fill="#881848"/>
        </g>
      </g>
      {/* Trophy — left side */}
      <g transform="translate(120,330)">
        <g style={{ animation: 'bg-float 4s ease-in-out infinite' }}>
          <rect x={-16} y={50} width={32} height={14} rx={3} fill="#cc8800"/>
          <rect x={-10} y={38} width={20} height={15} rx={3} fill="#cc8800"/>
          <path d="M-30,-60 Q-42,-36 -30,0 L30,0 Q42,-36 30,-60Z" fill="#ffd040"/>
          <path d="M-30,-60 Q-42,-36 -30,0" stroke="#ffee80" strokeWidth={3} fill="none"/>
          <path d="M30,-60 Q42,-36 30,0" stroke="#ffee80" strokeWidth={3} fill="none"/>
          <circle cx={0} cy={-30} r={14} fill="#ffee80" opacity={0.5} style={{ animation: 'bg-glow 2s ease-in-out infinite' }}/>
          <polygon points="0,-38 2.5,-31 9.5,-31 4,-27 6,-20 0,-24 -6,-20 -4,-27 -9.5,-31 -2.5,-31" fill="#cc6600"/>
        </g>
      </g>
      {/* Crowd silhouettes — arms raised and waving */}
      {Array.from({length:18},(_,i)=>(
        <g key={i} transform={`translate(${i*46+10},420)`}
          style={{ animation: `bg-bob ${1+i*.1}s ${i*.08}s ease-in-out infinite` }}>
          <circle cx={0} cy={-28} r={9} fill={`hsl(${i*20},40%,20%)`}/>
          <rect x={-7} y={-18} width={14} height={20} rx={3} fill={`hsl(${i*20},40%,18%)`}/>
          <line x1={-7} y1={-12} x2={-18} y2={-28} stroke={`hsl(${i*20},40%,20%)`} strokeWidth={5} strokeLinecap="round"/>
          <line x1={7} y1={-12} x2={18} y2={-28} stroke={`hsl(${i*20},40%,20%)`} strokeWidth={5} strokeLinecap="round"/>
          {i%3===0 && <text x={-6} y={-36} fontSize={10} style={{ animation: 'bg-drift-up 3s ease-in-out infinite' }}>📱</text>}
        </g>
      ))}
      {/* Gold stars cascade */}
      {Array.from({length:20},(_,i)=>(
        <text key={i} x={(i*107+10)%800} y={0} fontSize={16+i%4*6}
          fill={i%3===0?'#ffd040':i%3===1?'#ffee80':'#cc8800'}
          style={{ animation: `bg-fall ${3+i*.35}s ${i*.22}s linear infinite` }}>★</text>
      ))}
      {/* Confetti */}
      {Array.from({length:20},(_,i)=>(
        <rect key={i} x={(i*97+30)%800} y={0} width={8} height={12} rx={2}
          fill={['#ff4080','#40c0ff','#ffee40','#80ff80','#ff8040','#c040ff'][i%6]}
          style={{ animation: `bg-fall ${4+i*.4}s ${i*.28}s linear infinite`, transform:`rotate(${i*22}deg)` }}/>
      ))}
    </svg>
  )
}

function Scene_rangoli() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="bg-scene-svg">
      <defs>
        <linearGradient id="ra-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a0a2a" /><stop offset="100%" stopColor="#0a0518" /></linearGradient>
      </defs>
      <rect width={800} height={450} fill="url(#ra-bg)" />
      {/* Central mandala */}
      {[80,70,60,50,40,30,20,10].map((r,i)=>(
        <circle key={i} cx={400} cy={260} r={r*3} fill="none" stroke={['#ff6040','#ff9020','#ffee40','#40c060','#4080ff','#c040ff','#ff80a0','white'][i]} strokeWidth={2} opacity={0.5+i*.05} style={{ animation: `bg-spin-slow ${20+i*3}s ${i%2===0?'':'reverse'} linear infinite`, transformOrigin: '400px 260px' }} />
      ))}
      {/* Petal shapes */}
      {Array.from({length:8},(_,i)=>(
        <ellipse key={i} cx={400} cy={260} rx={15} ry={80} fill="none" stroke={['#ff6040','#ffee40','#40c060','#4080ff'][i%4]} strokeWidth={2} opacity={0.4} transform={`rotate(${i*45},400,260)`} style={{ animation: `bg-spin ${30+i*5}s linear infinite`, transformOrigin: '400px 260px' }} />
      ))}
      {/* Color dots on rim */}
      {Array.from({length:12},(_,i)=>(
        <circle key={i} cx={400+180*Math.cos(i*Math.PI/6)} cy={260+180*Math.sin(i*Math.PI/6)} r={8} fill={['#ff6040','#ff9020','#ffee40','#40c060','#4080ff','#c040ff'][i%6]} style={{ animation: `bg-glow ${2+i*.3}s ${i*.2}s ease-in-out infinite` }} />
      ))}
      {/* Smaller satellite mandalas */}
      {[{cx:130,cy:130},{cx:670,cy:130},{cx:130,cy:400},{cx:670,cy:400}].map((m,i)=>(
        <g key={i}>
          {[3,2,1].map(j=>(
            <circle key={j} cx={m.cx} cy={m.cy} r={j*18} fill="none" stroke={['#ff9020','#ffee40','#c040ff'][j-1]} strokeWidth={1.5} opacity={0.4} style={{ animation: `bg-spin ${10+j*5}s ${j%2===0?'':'reverse'} linear infinite`, transformOrigin: `${m.cx}px ${m.cy}px` }} />
          ))}
        </g>
      ))}
      {/* Color cycling dots throughout */}
      {Array.from({length:15},(_,i)=>(
        <circle key={i} cx={(i*113+40)%800} cy={(i*73+40)%500} r={4} style={{ animation: `bg-color-cycle ${3+i*.3}s ${i*.25}s linear infinite, bg-glow ${2+i*.4}s ease-in-out infinite` }} />
      ))}
      {/* Ground — polished floor */}
      <ellipse cx={400} cy={440} rx={480} ry={55} fill="#180830" opacity={0.9}/>
      {/* Colored powder piles on floor */}
      {[{x:220,c:'#ff4040'},{x:300,c:'#ffcc00'},{x:400,c:'#40c0ff'},{x:500,c:'#ff80c0'},{x:580,c:'#80ff60'}].map((p,i)=>(
        <ellipse key={i} cx={p.x} cy={438} rx={22} ry={9} fill={p.c} opacity={0.55}/>
      ))}
      {/* Static diyas around the central mandala */}
      {[0,60,120,180,240,300].map((a,i)=>(
        <g key={i} transform={`translate(${400+165*Math.cos(a*Math.PI/180)},${260+82*Math.sin(a*Math.PI/180)})`}>
          <path d="M-9,0 Q0,8 9,0 Q7,-5 -7,-5Z" fill="#cc6820"/>
          <ellipse cx={0} cy={-4} rx={7} ry={4} fill="#e88030" opacity={0.6}/>
          <ellipse cx={0} cy={-12} rx={3} ry={6} fill="#ffdd00" opacity={0.9}/>
          <ellipse cx={0} cy={-16} rx={2} ry={4} fill="#ff8800"/>
        </g>
      ))}
      {/* Artist woman sitting and drawing rangoli */}
      <g transform="translate(150,410)">
        <circle cx={0} cy={-62} r={12} fill="#c8956c"/>
        <ellipse cx={0} cy={-68} rx={12} ry={7} fill="#2a0a2a"/>
        <path d="M-14,-52 Q-18,0 -12,24 Q0,16 12,24 Q18,0 14,-52Z" fill="#c040ff" opacity={0.9}/>
        {/* Arm reaching to draw */}
        <path d="M14,-38 Q28,-24 40,-14" stroke="#c8956c" strokeWidth={7} fill="none" strokeLinecap="round"
          style={{ animation: 'bg-sway-sm 2s ease-in-out infinite', transformBox:'fill-box', transformOrigin:'14px -38px' }}/>
        <circle cx={40} cy={-14} r={5} fill="#c8956c"/>
        {/* Powder dot she's drawing */}
        <circle cx={56} cy={-8} r={4} fill="#ffee40" opacity={0.7}/>
        {/* Seated legs */}
        <path d="M-14,22 Q-22,36 -10,40" stroke="#c8956c" strokeWidth={8} fill="none" strokeLinecap="round"/>
        <path d="M14,22 Q22,36 10,40" stroke="#c8956c" strokeWidth={8} fill="none" strokeLinecap="round"/>
      </g>
    </svg>
  )
}

function Scene_kolam() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="bg-scene-svg">
      <defs>
        <linearGradient id="ko-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0e1a0a"/><stop offset="100%" stopColor="#060e04"/></linearGradient>
      </defs>
      <rect width={800} height={450} fill="url(#ko-bg)" />
      {/* Ground */}
      <ellipse cx={400} cy={440} rx={500} ry={50} fill="#0a1408" opacity={0.8}/>
      {/* Dot grid — the foundation of kolam */}
      {Array.from({length:7},(_,row)=>Array.from({length:13},(_,col)=>(
        <circle key={`${row}-${col}`} cx={80+col*56} cy={100+row*50} r={3.5} fill="white"
          opacity={0.45+row%3*.1} style={{ animation: `bg-twinkle ${2+row*.3+col*.1}s ${col*.08+row*.12}s ease-in-out infinite` }}/>
      )))}
      {/* Kolam pattern lines — drawn with stroke-dash animation */}
      <path d="M80,100 Q240,200 400,100 Q560,200 720,100" stroke="#ff9020" strokeWidth={2.5} fill="none" opacity={0.7}
        strokeDasharray="400" strokeDashoffset="400" style={{ animation: 'bg-glow 3s ease-in-out infinite' }}/>
      <path d="M80,150 Q180,250 280,150 Q380,50 480,150 Q580,250 680,150 Q740,200 720,250" stroke="#40c0a0" strokeWidth={2.5} fill="none" opacity={0.6}
        style={{ animation: 'bg-glow 4s 0.5s ease-in-out infinite' }}/>
      <path d="M80,300 Q180,200 280,300 Q380,400 480,300 Q580,200 720,300" stroke="#c040ff" strokeWidth={2.5} fill="none" opacity={0.65}
        style={{ animation: 'bg-glow 5s 1s ease-in-out infinite' }}/>
      <path d="M80,350 Q240,420 400,350 Q560,420 720,350" stroke="#ff4060" strokeWidth={2} fill="none" opacity={0.5}
        style={{ animation: 'bg-glow 4s 0.8s ease-in-out infinite' }}/>
      {/* Central large flower */}
      {[0,45,90,135,180,225,270,315].map((a,j)=>(
        <ellipse key={j} cx={400+36*Math.cos(a*Math.PI/180)} cy={230+36*Math.sin(a*Math.PI/180)}
          rx={20} ry={10} fill={['#ff9020','#40c0a0','#c040ff','#ffee40'][j%4]} opacity={0.55}
          transform={`rotate(${a},${400+36*Math.cos(a*Math.PI/180)},${230+36*Math.sin(a*Math.PI/180)})`}
          style={{ animation: `bg-spin-slow ${25}s linear infinite`, transformOrigin:'400px 230px' }}/>
      ))}
      <circle cx={400} cy={230} r={14} fill="#ffee40" style={{ animation: 'bg-glow 2s ease-in-out infinite' }}/>
      {/* Diyas (oil lamps) — lit */}
      {[{x:120,y:390},{x:240,y:400},{x:360,y:395},{x:480,y:400},{x:600,y:390},{x:680,y:395}].map((d,i)=>(
        <g key={i}>
          {/* Lamp body */}
          <path d={`M${d.x-14},${d.y} Q${d.x},${d.y+12} ${d.x+14},${d.y} Q${d.x+10},${d.y-8} ${d.x-10},${d.y-8}Z`} fill="#cc6820"/>
          <ellipse cx={d.x} cy={d.y-5} rx={12} ry={6} fill="#e88030" opacity={0.6}/>
          {/* Flame — static */}
          <ellipse cx={d.x} cy={d.y-20} rx={5} ry={10} fill="#ffdd00" opacity={0.9}/>
          <ellipse cx={d.x} cy={d.y-26} rx={3} ry={6} fill="#ff8800"/>
          <ellipse cx={d.x} cy={d.y-30} rx={1.5} ry={3} fill="#ffffff" opacity={0.6}/>
          <ellipse cx={d.x} cy={d.y-18} rx={10} ry={8} fill="#ff8800" opacity={0.2}/>
        </g>
      ))}
      {/* Artist (woman) drawing kolam */}
      <g transform="translate(150,360)">
        <g style={{ animation: 'bg-bob 2.5s ease-in-out infinite' }}>
          {/* Sitting figure */}
          <circle cx={0} cy={-72} r={16} fill="#c8956c"/>
          {/* Saree */}
          <path d="M-18,-56 Q-22,0 -15,30 Q0,20 15,30 Q22,0 18,-56Z" fill="#e040fb" opacity={0.9}/>
          <path d="M-18,-30 Q-35,-10 -40,20" stroke="#c040dd" strokeWidth={8} fill="none" strokeLinecap="round"/>
          {/* Arm reaching forward — drawing */}
          <path d="M18,-40 Q36,-30 48,-18" stroke="#c8956c" strokeWidth={8} fill="none" strokeLinecap="round"/>
          <circle cx={52} cy={-15} r={5} fill="#c8956c"/>
          {/* Powder in other hand */}
          <path d="M-18,-40 Q-30,-28 -35,-16" stroke="#c8956c" strokeWidth={8} fill="none" strokeLinecap="round"/>
          <circle cx={-38} cy={-12} r={8} fill="#c040dd" opacity={0.8}/>
          {/* Hair bun */}
          <circle cx={6} cy={-84} r={10} fill="#2a1a08"/>
          <circle cx={12} cy={-88} r={5} fill="#ff4080"/>
          {/* Dot trail she's drawing */}
          {[0,1,2,3].map(j=>(
            <circle key={j} cx={60+j*18} cy={-12+j*6} r={4} fill="#ffee40" opacity={0.8-j*.15}
              style={{ animation: `bg-glow ${1+j*.2}s ${j*.1}s ease-in-out infinite` }}/>
          ))}
        </g>
      </g>
      {/* Flower patterns at intersections */}
      {[{x:200,y:175},{x:600,y:175},{x:280,y:330},{x:520,y:330}].map((f,i)=>(
        <g key={i} style={{ animation: `bg-spin-slow ${18+i*5}s ${i*2}s linear infinite`, transformOrigin:`${f.x}px ${f.y}px` }}>
          {[0,60,120,180,240,300].map((a,j)=>(
            <ellipse key={j} cx={f.x+18*Math.cos(a*Math.PI/180)} cy={f.y+18*Math.sin(a*Math.PI/180)}
              rx={11} ry={6} fill={['#ff9020','#40c0a0','#c040ff'][i%3]} opacity={0.5}
              transform={`rotate(${a},${f.x+18*Math.cos(a*Math.PI/180)},${f.y+18*Math.sin(a*Math.PI/180)})`}/>
          ))}
          <circle cx={f.x} cy={f.y} r={6} fill={['#ffee40','#80ffaa','#ffaa80'][i%3]} opacity={0.8}/>
        </g>
      ))}
    </svg>
  )
}

function Scene_fairygarden() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="bg-scene-svg">
      <defs>
        <linearGradient id="fg-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#b8e8d8"/><stop offset="55%" stopColor="#a0d8c0"/><stop offset="100%" stopColor="#88c8a8"/></linearGradient>
        <radialGradient id="fg-glow" cx="50%" cy="50%"><stop offset="0%" stopColor="#ffffa0" stopOpacity={0.8}/><stop offset="100%" stopColor="#ffffa0" stopOpacity={0}/></radialGradient>
      </defs>
      <rect width={800} height={450} fill="url(#fg-bg)" />
      {/* Sun */}
      <circle cx={660} cy={80} r={45} fill="#fff9c4" style={{ animation: 'bg-glow 5s ease-in-out infinite' }}/>
      {[...Array(8)].map((_,i)=>(
        <line key={i} x1={660+55*Math.cos(i*45*Math.PI/180)} y1={80+55*Math.sin(i*45*Math.PI/180)}
          x2={660+70*Math.cos(i*45*Math.PI/180)} y2={80+70*Math.sin(i*45*Math.PI/180)}
          stroke="#fff176" strokeWidth={3} opacity={0.7}/>
      ))}
      {/* Grass */}
      <ellipse cx={400} cy={440} rx={500} ry={80} fill="#5ab05a"/>
      <rect x={0} y={390} width={800} height={60} fill="#4a9a4a"/>
      {/* Mushroom fairy ring */}
      {[0,60,120,180,240,300].map((a,i)=>(
        <g key={i} transform={`translate(${400+130*Math.cos(a*Math.PI/180)},${310+65*Math.sin(a*Math.PI/180)})`}>
          <rect x={-7} y={-32} width={14} height={38} rx={4} fill="#f5e8d0"/>
          <ellipse cx={0} cy={-32} rx={24} ry={16} fill={i%2===0?'#cc2222':'#e06020'}/>
          <ellipse cx={-6} cy={-37} rx={5} ry={3.5} fill="white" opacity={0.65}/>
          <ellipse cx={7} cy={-30} rx={3.5} ry={2.5} fill="white" opacity={0.55}/>
          {/* Glow on top of mushroom */}
          <ellipse cx={0} cy={-38} rx={12} ry={5} fill="url(#fg-glow)" opacity={0.4}/>
        </g>
      ))}
      {/* Flowers — more varied */}
      {[{x:60,y:395,c:'#ff80a0'},{x:160,y:405,c:'#ff9040'},{x:270,y:400,c:'#ffee40'},{x:530,y:402,c:'#c060ff'},{x:640,y:395,c:'#60c0ff'},{x:740,y:405,c:'#ff80a0'}].map((f,i)=>(
        <g key={i}>
          <rect x={f.x-3} y={f.y-50} width={6} height={55} rx={2} fill="#38883a"
            style={{ animation: `bg-sway-sm ${3+i*.3}s ${i*.3}s ease-in-out infinite` }}/>
          {/* Leaf */}
          <ellipse cx={f.x+12} cy={f.y-25} rx={14} ry={7} fill="#48a848" opacity={0.8} transform={`rotate(-25,${f.x+12},${f.y-25})`}/>
          {[0,72,144,216,288].map((a,j)=>(
            <ellipse key={j} cx={f.x+13*Math.cos(a*Math.PI/180)} cy={f.y-50+13*Math.sin(a*Math.PI/180)}
              rx={9} ry={5.5} fill={f.c} opacity={0.88} transform={`rotate(${a},${f.x},${f.y-50})`}/>
          ))}
          <circle cx={f.x} cy={f.y-50} r={6} fill="#ffee40"/>
        </g>
      ))}
      {/* Fairy 1 — main fairy, drifting left */}
      <g style={{ animation: 'bg-drift-l 20s 0s linear infinite normal backwards' }}>
        <g transform="translate(550,190)">
          <g style={{ animation: 'bg-float 2s ease-in-out infinite' }}>
            <ellipse cx={-16} cy={0} rx={20} ry={11} fill="rgba(200,240,255,.75)" transform="rotate(-35,-16,0)"/>
            <ellipse cx={16} cy={0} rx={20} ry={11} fill="rgba(200,240,255,.75)" transform="rotate(35,16,0)"/>
            <ellipse cx={-14} cy={10} rx={13} ry={7} fill="rgba(200,240,255,.55)" transform="rotate(20,-14,10)"/>
            <ellipse cx={14} cy={10} rx={13} ry={7} fill="rgba(200,240,255,.55)" transform="rotate(-20,14,10)"/>
            <circle cx={0} cy={0} r={9} fill="#f5c8a8"/>
            <rect x={-7} y={8} width={14} height={18} rx={4} fill="#ff80cc"/>
            <ellipse cx={0} cy={-6} rx={9} ry={5} fill="#a05030"/>
            {/* Wand */}
            <line x1={8} y1={6} x2={20} y2={-8} stroke="#d0a040" strokeWidth={2.5}/>
            <polygon points="20,-12 22,-7 27,-7 23,-4 24,0 20,-3 16,0 17,-4 13,-7 18,-7" fill="#ffee40" transform="scale(0.5) translate(20,-8)"
              style={{ animation: 'bg-glow-fast 0.9s ease-in-out infinite' }}/>
            {/* Wand sparkles */}
            {[{x:24,y:-10},{x:29,y:-6},{x:26,y:-2}].map((p,j)=>(
              <circle key={j} cx={p.x} cy={p.y} r={2.5} fill="#ffee40" opacity={0.8}
                style={{ animation: `bg-twinkle ${0.7+j*.2}s ${j*.1}s ease-in-out infinite` }}/>
            ))}
          </g>
        </g>
      </g>
      {/* Fairy 2 — smaller, floats up and down */}
      <g transform="translate(200,240)">
        <g style={{ animation: 'bg-float 3s 1s ease-in-out infinite' }}>
          <ellipse cx={-12} cy={0} rx={15} ry={8} fill="rgba(255,200,240,.7)" transform="rotate(-30,-12,0)"/>
          <ellipse cx={12} cy={0} rx={15} ry={8} fill="rgba(255,200,240,.7)" transform="rotate(30,12,0)"/>
          <circle cx={0} cy={-2} r={7} fill="#f5c8a8"/>
          <rect x={-5} y={5} width={10} height={14} rx={3} fill="#c060ff"/>
          <ellipse cx={0} cy={-7} rx={7} ry={4} fill="#8b4513"/>
          <line x1={-6} y1={4} x2={-16} y2={-6} stroke="#d0a040" strokeWidth={2}/>
          <circle cx={-18} cy={-8} r={4} fill="#ffee40" style={{ animation: 'bg-glow-fast 0.7s ease-in-out infinite' }}/>
          {/* Sparkle trail */}
          {[{x:-20,y:-4},{x:-24,y:2},{x:-18,y:8}].map((p,j)=>(
            <circle key={j} cx={p.x} cy={p.y} r={2} fill="#ffd600" opacity={0.7-j*.2}
              style={{ animation: `bg-twinkle ${0.8+j*.15}s ${j*.1}s ease-in-out infinite` }}/>
          ))}
        </g>
      </g>
      {/* Fairy 3 — near mushroom ring, dancing */}
      <g transform="translate(400,280)">
        <g style={{ animation: 'bg-bob 1.5s 0.5s ease-in-out infinite' }}>
          <ellipse cx={-10} cy={-5} rx={12} ry={7} fill="rgba(200,255,200,.72)" transform="rotate(-40,-10,-5)"/>
          <ellipse cx={10} cy={-5} rx={12} ry={7} fill="rgba(200,255,200,.72)" transform="rotate(40,10,-5)"/>
          <circle cx={0} cy={-6} r={7} fill="#c8a070"/>
          <rect x={-6} y={2} width={12} height={15} rx={3} fill="#60d060"/>
          <ellipse cx={0} cy={-11} rx={7} ry={4} fill="#3a2808"/>
          {/* Arms raised */}
          <line x1={-6} y1={6} x2={-14} y2={-4} stroke="#c8a070" strokeWidth={4} strokeLinecap="round"/>
          <line x1={6} y1={6} x2={14} y2={-4} stroke="#c8a070" strokeWidth={4} strokeLinecap="round"/>
        </g>
      </g>
      {/* Butterflies */}
      {[{x:120,y:160,c:'#ff80c0'},{x:680,y:200,c:'#80c0ff'}].map((b,i)=>(
        <g key={i} style={{ animation: `bg-float ${3+i}s ${i}s ease-in-out infinite` }}>
          <ellipse cx={b.x-14} cy={b.y} rx={18} ry={10} fill={b.c} opacity={0.8} transform={`rotate(-25,${b.x-14},${b.y})`}
            style={{ animation: `bg-sway-sm 0.4s ease-in-out infinite`, transformBox:'fill-box', transformOrigin:'right center' }}/>
          <ellipse cx={b.x+14} cy={b.y} rx={18} ry={10} fill={b.c} opacity={0.8} transform={`rotate(25,${b.x+14},${b.y})`}
            style={{ animation: `bg-sway-sm 0.4s 0.2s ease-in-out infinite`, transformBox:'fill-box', transformOrigin:'left center' }}/>
          <ellipse cx={b.x-10} cy={b.y+10} rx={11} ry={7} fill={b.c} opacity={0.6} transform={`rotate(20,${b.x-10},${b.y+10})`}/>
          <ellipse cx={b.x+10} cy={b.y+10} rx={11} ry={7} fill={b.c} opacity={0.6} transform={`rotate(-20,${b.x+10},${b.y+10})`}/>
          <ellipse cx={b.x} cy={b.y+2} rx={3} ry={10} fill="#3a2808"/>
        </g>
      ))}
      {/* Fireflies at dusk */}
      {Array.from({length:12},(_,i)=>(
        <circle key={i} cx={(i*127+60)%780} cy={250+(i%5)*30} r={3} fill="#ffffa0"
          style={{ animation: `bg-twinkle ${1.5+i*.4}s ${i*.3}s ease-in-out infinite` }}/>
      ))}
      {/* Dewdrops */}
      {Array.from({length:10},(_,i)=>(
        <ellipse key={i} cx={(i*103+40)%780} cy={400+(i%3)*12} rx={4} ry={6}
          fill="rgba(150,230,255,.65)" style={{ animation: `bg-glow ${3+i*.3}s ${i*.25}s ease-in-out infinite` }}/>
      ))}
    </svg>
  )
}

function Scene_cherryblossom() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="bg-scene-svg">
      <defs>
        <linearGradient id="cb-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f0d8e8" /><stop offset="100%" stopColor="#f8e8f0" /></linearGradient>
      </defs>
      <rect width={800} height={450} fill="url(#cb-bg)" />
      {/* Cherry blossom trees */}
      {[{x:120,col:'#f090b0'},{x:680,col:'#f0a0c0'}].map((t,i)=>(
        <g key={i}>
          <path d={`M${t.x},500 Q${t.x+10},400 ${t.x},250 Q${t.x+20},180 ${t.x+15},100`} stroke="#6a3820" strokeWidth={18} fill="none" strokeLinecap="round" style={{ animation: `bg-sway-sm 4s ${i}s ease-in-out infinite` }} />
          <path d={`M${t.x},300 Q${t.x-50},270 ${t.x-60},240`} stroke="#6a3820" strokeWidth={10} fill="none" strokeLinecap="round" />
          <path d={`M${t.x},220 Q${t.x+55},200 ${t.x+65},175`} stroke="#6a3820" strokeWidth={8} fill="none" strokeLinecap="round" />
          {/* Blossom clusters */}
          {[{x:t.x,y:110},{x:t.x-65,y:240},{x:t.x+65,y:175},{x:t.x+30,y:150},{x:t.x-30,y:170}].map((c,j)=>(
            <circle key={j} cx={c.x} cy={c.y} r={35-j*2} fill={t.col} opacity={0.7} style={{ animation: `bg-sway-sm ${3+j*.3}s ${j*.2}s ease-in-out infinite` }} />
          ))}
        </g>
      ))}
      {/* Petals swirling */}
      {Array.from({length:22},(_,i)=>(
        <ellipse key={i} cx={(i*97+10)%800} cy={0} rx={5} ry={8} fill={i%2===0?'#f090b0':'#ffc0d8'} opacity={0.8} style={{ animation: `bg-petal-fall ${6+i*.4}s ${i*.28}s linear infinite` }} />
      ))}
      {/* Koi pond */}
      <defs>
        <clipPath id="cb-pond-clip">
          <ellipse cx={400} cy={382} rx={148} ry={36}/>
        </clipPath>
      </defs>
      <ellipse cx={400} cy={382} rx={148} ry={36} fill="#a0c8e8" opacity={0.85}/>
      <ellipse cx={400} cy={382} rx={145} ry={33} fill="none" stroke="#78a8d0" strokeWidth={2} opacity={0.5}/>
      {[1,2].map(i=>(
        <ellipse key={i} cx={400} cy={382} rx={40*i} ry={9*i} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth={1}
          style={{ animation: `bg-glow ${2+i*.5}s ${i*.3}s ease-in-out infinite` }}/>
      ))}
      {/* Koi fish — clipped inside pond, oscillate left-right */}
      <g clipPath="url(#cb-pond-clip)">
        <g style={{ animation: 'bg-fish-swim 6s 0s ease-in-out infinite' }}>
          <ellipse cx={380} cy={380} rx={18} ry={7} fill="#ff8040" opacity={0.85}/>
          <path d="M362,380 Q355,375 357,380 Q355,385 362,380Z" fill="#ff8040" opacity={0.85}/>
          <circle cx={396} cy={378} r={2} fill="#301808"/>
        </g>
        <g style={{ animation: 'bg-fish-swim 8s 2s ease-in-out infinite' }}>
          <ellipse cx={415} cy={387} rx={13} ry={5} fill="#fff" opacity={0.8}/>
          <path d="M428,387 Q434,383 432,387 Q434,391 428,387Z" fill="#fff" opacity={0.8}/>
          <circle cx={404} cy={386} r={1.5} fill="#301808"/>
        </g>
      </g>
      {/* Bridge over pond */}
      <rect x={340} y={380} width={120} height={12} rx={6} fill="#8b4513"/>
      {[350,364,378,392,406,420,434,448].map((x,i)=>(
        <rect key={i} x={x} y={366} width={3.5} height={18} rx={2} fill="#8b4513"/>
      ))}
      <rect x={346} y={364} width={108} height={5} rx={2.5} fill="#a05020"/>
      {/* Person on bridge with umbrella */}
      <g transform="translate(395,360)">
        <circle cx={0} cy={-28} r={9} fill="#f5c8a8"/>
        <ellipse cx={0} cy={-8} rx={12} ry={14} fill="#cc3366"/>
        <ellipse cx={-14} cy={-8} rx={8} ry={5} fill="#cc3366" transform="rotate(-20,-14,-8)"/>
        <ellipse cx={14} cy={-8} rx={8} ry={5} fill="#cc3366" transform="rotate(20,14,-8)"/>
        <ellipse cx={0} cy={-34} rx={9} ry={6} fill="#1a0808"/>
        <line x1={12} y1={-14} x2={28} y2={-35} stroke="#8b4513" strokeWidth={2.5}/>
        <ellipse cx={32} cy={-42} rx={22} ry={12} fill="#e05080" opacity={0.88}/>
        <ellipse cx={32} cy={-42} rx={20} ry={10} fill="none" stroke="#c03060" strokeWidth={1.5}/>
        <line x1={-4} y1={3} x2={-5} y2={16} stroke="#f5c8a8" strokeWidth={4} strokeLinecap="round"/>
        <line x1={4} y1={3} x2={5} y2={16} stroke="#f5c8a8" strokeWidth={4} strokeLinecap="round"/>
      </g>
      {/* Lantern */}
      <line x1={90} y1={210} x2={160} y2={250} stroke="#6a3820" strokeWidth={3}/>
      <g transform="translate(165,256)" style={{ animation: 'bg-float 3s ease-in-out infinite' }}>
        <rect x={-10} y={0} width={20} height={30} rx={3} fill="#cc2200" opacity={0.9}/>
        <rect x={-12} y={-3} width={24} height={6} rx={2} fill="#883300"/>
        <rect x={-12} y={30} width={24} height={6} rx={2} fill="#883300"/>
        <ellipse cx={0} cy={15} rx={7} ry={12} fill="#ff8840" opacity={0.4}
          style={{ animation: 'bg-flicker 0.5s ease-in-out infinite' }}/>
      </g>
      {/* Ground */}
      <ellipse cx={400} cy={448} rx={520} ry={50} fill="#c8e8b8"/>
      <rect x={0} y={428} width={800} height={22} fill="#b8d8a8"/>
      {/* Ground petals */}
      {Array.from({length:18},(_,i)=>(
        <ellipse key={i} cx={(i*67+20)%800} cy={435+(i%4)*5} rx={5} ry={3.5} fill="#f090b0" opacity={0.55}/>
      ))}
      {/* Petals falling */}
      {Array.from({length:28},(_,i)=>(
        <ellipse key={i} cx={(i*97+10)%800} cy={0} rx={5} ry={8}
          fill={i%3===0?'#f090b0':i%3===1?'#ffc0d8':'#ffd0e8'} opacity={0.85}
          style={{ animation: `bg-petal-fall ${6+i*.35}s ${i*.22}s linear infinite` }}/>
      ))}
    </svg>
  )
}

function Scene_princess() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="bg-scene-svg">
      <defs>
        <linearGradient id="pr-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#180840" /><stop offset="50%" stopColor="#4020a0" /><stop offset="100%" stopColor="#a04080" /></linearGradient>
      </defs>
      <rect width={800} height={450} fill="url(#pr-bg)" />
      <Stars n={50} color="#ffd0ff" />
      {/* Castle */}
      <g>
        {/* Towers */}
        {[180,250,440,510].map((x,i)=>(
          <g key={i}>
            <rect x={x} y={150+i%2*30} width={55} height={350} fill="#2a1060" />
            {/* Battlements */}
            {[0,1,2,3].map(j=>(
              <rect key={j} x={x+j*14} y={140+i%2*30} width={10} height={18} fill="#2a1060" />
            ))}
            {/* Flag */}
            <rect x={x+25} y={100+i%2*30} width={3} height={45} fill="#888" />
            <rect x={x+28} y={100+i%2*30} width={24} height={16} fill="#ff4080" style={{ animation: 'bg-flag-wave 2s ease-in-out infinite', transformOrigin: 'left center', transformBox: 'fill-box' }} />
            {/* Window glowing */}
            <rect x={x+15} y={220+i%2*30} width={25} height={30} rx={12} fill="#ffee80" opacity={0.6} style={{ animation: `bg-glow ${3+i*.5}s ease-in-out infinite` }} />
          </g>
        ))}
        {/* Main wall */}
        <rect x={235} y={250} width={330} height={250} fill="#241058" />
        {/* Gate arch */}
        <path d="M330,500 L330,360 Q400,310 470,360 L470,500Z" fill="#120828" />
        {/* Rose window */}
        <circle cx={400} cy={290} r={30} fill="none" stroke="#ff80cc" strokeWidth={4} opacity={0.5} style={{ animation: 'bg-spin-slow 20s linear infinite', transformOrigin: '400px 290px' }} />
        {/* Lighted windows */}
        {[{x:265,y:280},{x:510,y:300},{x:350,y:330},{x:420,y:330}].map((w,i)=>(
          <rect key={i} x={w.x} y={w.y} width={20} height={25} rx={10} fill="#ffee80" opacity={0.5} style={{ animation: `bg-glow ${2+i*.3}s ease-in-out infinite` }} />
        ))}
      </g>
      {/* Carriage on path */}
      <g style={{ animation: 'bg-drift-l 20s ease-in-out infinite' }}>
        <ellipse cx={680} cy={430} rx={45} ry={32} fill="#cc80ff" stroke="#a060dd" strokeWidth={2} />
        <ellipse cx={680} cy={430} rx={35} ry={24} fill="#d890ff" />
        <circle cx={655} cy={455} r={14} fill="none" stroke="#886030" strokeWidth={4} style={{ animation: 'bg-wheel 2s linear infinite', transformOrigin: '655px 455px' }} />
        <circle cx={705} cy={455} r={14} fill="none" stroke="#886030" strokeWidth={4} style={{ animation: 'bg-wheel 2s linear infinite', transformOrigin: '705px 455px' }} />
        <line x1={635} y1={450} x2={600} y2={438} stroke="#886030" strokeWidth={3} />
        <ellipse cx={580} cy={435} rx={20} ry={8} fill="#f5c080" /> {/* horse head */}
      </g>
      {/* Crown in sky */}
      <g transform="translate(400,120)"><g style={{ animation: 'bg-float 5s ease-in-out infinite' }}>
        <path d="M-35,0 L-35,-30 L-10,-15 L0,-40 L10,-15 L35,-30 L35,0 Z" fill="#ffd040" />
        <rect x={-37} y={0} width={74} height={12} rx={3} fill="#cc9000" />
        {['#ff4080','#4080ff','#40c060'].map((c,i)=>(
          <circle key={i} cx={-22+i*22} cy={-2} r={5} fill={c} style={{ animation: `bg-glow ${2+i*.3}s ease-in-out infinite` }} />
        ))}
      </g>
      </g>
      {/* Fireflies */}
      {Array.from({length:10},(_,i)=>(
        <circle key={i} cx={(i*113+60)%800} cy={350+(i%4)*30} r={2.5} fill="#ffff80" style={{ animation: `bg-twinkle ${2+i*.3}s ${i*.25}s ease-in-out infinite` }} />
      ))}
      {/* Princess */}
      <g transform="translate(588,388)">
        {/* Big flared gown */}
        <path d="M-32,-40 Q-54,0 -58,42 Q-28,54 0,56 Q28,54 58,42 Q54,0 32,-40Z" fill="#c060d0" opacity={0.95} />
        <path d="M-22,-40 Q-38,0 -40,42 Q-16,50 0,52 Q16,50 40,42 Q38,0 22,-40Z" fill="#d488e4" opacity={0.55} />
        {/* Bodice */}
        <rect x={-16} y={-72} width={32} height={34} rx={6} fill="#9040b0" />
        <path d="M-12,-62 Q0,-68 12,-62" stroke="#f0c8ff" strokeWidth={2} fill="none" />
        {/* Head */}
        <circle cx={0} cy={-90} r={18} fill="#f5cba7" />
        {/* Crown */}
        <path d="M-14,-106 L-14,-116 L-7,-110 L0,-120 L7,-110 L14,-116 L14,-106Z" fill="#ffd040" />
        <rect x={-16} y={-108} width={32} height={6} rx={2} fill="#cc9000" />
        <circle cx={-7} cy={-110} r={3} fill="#ff4080" /><circle cx={0} cy={-114} r={3} fill="#ff4080" /><circle cx={7} cy={-110} r={3} fill="#ff4080" />
        {/* Hair */}
        <path d="M-18,-98 Q-2,-112 18,-98 L18,-86 Q8,-82 -18,-86Z" fill="#2c1a6e" />
        <path d="M18,-98 Q28,-82 24,-68" stroke="#2c1a6e" strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d="M-18,-98 Q-28,-82 -24,-68" stroke="#2c1a6e" strokeWidth={6} fill="none" strokeLinecap="round" />
        {/* Eyes */}
        <circle cx={-5} cy={-91} r={2.5} fill="#333" /><circle cx={5} cy={-91} r={2.5} fill="#333" />
        <circle cx={-4} cy={-92} r={1} fill="white" /><circle cx={6} cy={-92} r={1} fill="white" />
        {/* Smile */}
        <path d="M-5,-84 Q0,-80 5,-84" stroke="#a0522d" strokeWidth={1.5} fill="none" />
        {/* Left arm waving */}
        <line x1={-16} y1={-60} x2={-34} y2={-44} stroke="#f5cba7" strokeWidth={7} strokeLinecap="round" />
        {/* Right arm holding wand */}
        <line x1={16} y1={-60} x2={36} y2={-46} stroke="#f5cba7" strokeWidth={7} strokeLinecap="round" />
        <line x1={35} y1={-46} x2={52} y2={-32} stroke="#ffd040" strokeWidth={3} strokeLinecap="round" />
        <circle cx={54} cy={-30} r={6} fill="#ff80ff" style={{ animation: 'bg-glow 2s ease-in-out infinite' }} />
        {[{dx:8,dy:-12},{dx:16,dy:-6},{dx:4,dy:-2}].map((s,i)=>(
          <circle key={i} cx={54+s.dx} cy={-30+s.dy} r={2} fill="#ffee40" style={{ animation: `bg-twinkle ${1+i*.4}s ${i*.3}s ease-in-out infinite` }} />
        ))}
      </g>
    </svg>
  )
}

function Scene_holi() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="bg-scene-svg">
      <defs>
        <linearGradient id="ho-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a1020" /><stop offset="100%" stopColor="#281820" /></linearGradient>
      </defs>
      <rect width={800} height={450} fill="url(#ho-bg)" />
      {/* Color explosion bursts */}
      {[{cx:150,cy:200,c:'#ff4040',d:3},{cx:350,cy:150,c:'#ffcc00',d:5},{cx:550,cy:220,c:'#40c0ff',d:4},{cx:680,cy:160,c:'#ff80a0',d:6},{cx:200,cy:350,c:'#80ff60',d:3.5},{cx:600,cy:380,c:'#c040ff',d:5}].map((b,i)=>(
        <g key={i}>
          <circle cx={b.cx} cy={b.cy} r={0} fill={b.c} opacity={0.7} style={{ animation: `bg-holi-burst ${b.d}s ${i*.4}s ease-out infinite` }} />
          <circle cx={b.cx} cy={b.cy} r={0} fill={b.c} opacity={0.4} style={{ animation: `bg-holi-burst ${b.d}s ${i*.4+b.d*.5}s ease-out infinite` }} />
          {/* Spray lines */}
          {[0,45,90,135,180,225,270,315].map((a,j)=>(
            <line key={j} x1={b.cx} y1={b.cy}
              x2={b.cx+50*Math.cos(a*Math.PI/180)} y2={b.cy+50*Math.sin(a*Math.PI/180)}
              stroke={b.c} strokeWidth={3} opacity={0.5} strokeLinecap="round"
              style={{ animation: `bg-burst-sm ${b.d}s ${i*.4}s ease-out infinite` }} />
          ))}
        </g>
      ))}
      {/* Color powder floating */}
      {Array.from({length:24},(_,i)=>(
        <ellipse key={i} cx={(i*113+20)%800} cy={(i*83+30)%500} rx={8+i%4*5} ry={4+i%3*3} fill={['#ff4040','#ffcc00','#40c0ff','#ff80a0','#80ff60','#c040ff'][i%6]} opacity={0.25+i%3*.1} style={{ animation: `bg-float ${4+i*.3}s ${i*.2}s ease-in-out infinite` }} />
      ))}
      {/* People celebrating with colored powder */}
      {[{x:100,body:'#ff4040',skin:'#c8956c',powder:'#ffcc00'},{x:280,body:'#40c0ff',skin:'#f5c8a8',powder:'#ff80c0'},{x:480,body:'#80ff60',skin:'#c8714a',powder:'#c040ff'},{x:670,body:'#ffcc00',skin:'#e8b090',powder:'#40c0ff'}].map((p,i)=>(
        <g key={i} transform={`translate(${p.x},400)`}>
          <g style={{ animation: `bg-bob ${1.5+i*.2}s ${i*.3}s ease-in-out infinite` }}>
            {/* Face with color smear */}
            <circle cx={0} cy={-60} r={14} fill={p.skin}/>
            <ellipse cx={-4} cy={-62} rx={6} ry={4} fill={p.powder} opacity={0.6}/>
            <ellipse cx={0} cy={-68} rx={14} ry={8} fill="#2a1008"/>
            {/* Colorful kurta */}
            <rect x={-13} y={-46} width={26} height={46} rx={5} fill={p.body}/>
            {/* Color patches on clothes */}
            <ellipse cx={-4} cy={-30} rx={7} ry={5} fill={p.powder} opacity={0.7}/>
            {/* Left arm raised holding powder */}
            <line x1={-13} y1={-36} x2={-32} y2={-58} stroke={p.skin} strokeWidth={9} strokeLinecap="round"/>
            <circle cx={-34} cy={-60} r={7} fill={p.skin}/>
            {/* Powder cloud from hand */}
            {[-48,-38,-54].map((dx,j)=>(
              <ellipse key={j} cx={dx} cy={-68-j*6} rx={8+j*2} ry={5+j} fill={p.powder} opacity={0.5-j*.1}
                style={{ animation: `bg-drift-up ${1+j*.3}s ${j*.15}s ease-in-out infinite` }}/>
            ))}
            {/* Right arm raised */}
            <line x1={13} y1={-36} x2={32} y2={-58} stroke={p.skin} strokeWidth={9} strokeLinecap="round"/>
            <circle cx={34} cy={-60} r={7} fill={p.skin}/>
            {/* Legs */}
            <line x1={-5} y1={0} x2={-7} y2={18} stroke={p.skin} strokeWidth={7} strokeLinecap="round"/>
            <line x1={5}  y1={0} x2={7}  y2={18} stroke={p.skin} strokeWidth={7} strokeLinecap="round"/>
          </g>
        </g>
      ))}
    </svg>
  )
}

function Scene_pirate() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="bg-scene-svg">
      <defs>
        <linearGradient id="pi-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#001830" /><stop offset="50%" stopColor="#0a2a50" /><stop offset="100%" stopColor="#1a3a60" /></linearGradient>
      </defs>
      <rect width={800} height={450} fill="url(#pi-bg)" />
      <Stars n={40} />
      {/* Moon */}
      <circle cx={650} cy={100} r={55} fill="#f5f0e0" style={{ animation: 'bg-glow 7s ease-in-out infinite' }} />
      {/* Ocean waves */}
      <ellipse cx={400} cy={400} rx={600} ry={80} fill="#0a3060" />
      <ellipse cx={400} cy={420} rx={700} ry={90} fill="#082848" />
      <rect x={0} y={440} width={800} height={60} fill="#061830" />
      {/* Treasure island */}
      <ellipse cx={650} cy={420} rx={130} ry={35} fill="#c89840" />
      {/* Palm tree */}
      <rect x={655} y={340} width={8} height={85} rx={3} fill="#6a4010" />
      <ellipse cx={659} cy={342} rx={30} ry={14} fill="#3a6a18" transform="rotate(-15,659,342)" />
      <ellipse cx={659} cy={346} rx={32} ry={12} fill="#4a7820" transform="rotate(10,659,346)" />
      {/* Treasure chest on island */}
      <rect x={620} y={400} width={40} height={26} rx={3} fill="#6a4010" />
      <rect x={620} y={400} width={40} height={13} rx={3} fill="#8a5818" />
      <rect x={636} y={408} width={10} height={10} rx={2} fill="#cc8800" style={{ animation: 'bg-glow 2s ease-in-out infinite' }} />
      {/* Pirate ship rocking on waves */}
      <g style={{ animation: 'bg-rock 4s ease-in-out infinite', transformOrigin: '280px 400px' }}>
        {/* Hull */}
        <path d="M160,380 Q200,420 280,420 Q360,420 400,380Z" fill="#5a2800" />
        <path d="M160,380 L180,350 L380,350 L400,380Z" fill="#6a3010" />
        {/* Masts */}
        <rect x={258} y={220} width={6} height={135} fill="#4a2000" />
        <rect x={308} y={240} width={5} height={115} fill="#4a2000" />
        {/* Sails */}
        <path d="M264,225 Q310,250 320,280 L264,280Z" fill="#e8e0d0" opacity={0.9} style={{ animation: 'bg-flag-wave 2.5s ease-in-out infinite', transformOrigin: 'left center', transformBox: 'fill-box' }} />
        <path d="M313,245 Q355,268 355,300 L313,300Z" fill="#e8e0d0" opacity={0.85} style={{ animation: 'bg-flag-wave 2.5s 0.3s ease-in-out infinite', transformOrigin: 'left center', transformBox: 'fill-box' }} />
        {/* Flag pole + skull flag */}
        <rect x={259} y={210} width={3} height={36} fill="#555" />
        <rect x={262} y={210} width={26} height={20} rx={2} fill="#111"
          style={{ animation: 'bg-flag-wave 2s ease-in-out infinite', transformOrigin: 'left center', transformBox: 'fill-box' }} />
        {/* Skull on flag */}
        <circle cx={277} cy={218} r={5} fill="rgba(255,255,255,0.7)" />
        <line x1={272} y1={223} x2={282} y2={227} stroke="rgba(255,255,255,0.6)" strokeWidth={1} />
        <line x1={282} y1={223} x2={272} y2={227} stroke="rgba(255,255,255,0.6)" strokeWidth={1} />
      </g>
      {/* Cannon flash */}
      <circle cx={400} cy={370} r={8} fill="#ff8800" opacity={0.7} style={{ animation: 'bg-glow-fast 3s 2s ease-in-out infinite' }} />
      {/* Cannon on ship */}
      <rect x={178} y={355} width={44} height={16} rx={5} fill="#3a2010" />
      <circle cx={180} cy={363} r={10} fill="#2a1808" />
      {/* Cannonball flying */}
      <g style={{ animation: 'bg-drift-r 4s 1s ease-in-out infinite normal backwards' }}>
        <circle cx={220} cy={340} r={6} fill="#1a1010" />
      </g>
      {/* Compass rose in corner */}
      <g transform="translate(60,80)">
        <g style={{ animation: 'bg-float-sm 6s ease-in-out infinite' }}>
          <circle cx={0} cy={0} r={26} fill="rgba(20,40,80,.6)" stroke="#886644" strokeWidth={2} />
          {/* N S E W */}
          <polygon points="0,-22 -4,-8 4,-8" fill="#cc2222" />
          <polygon points="0,22 -4,8 4,8" fill="#e8e0d0" />
          <polygon points="-22,0 -8,-4 -8,4" fill="#e8e0d0" />
          <polygon points="22,0 8,-4 8,4" fill="#e8e0d0" />
          <circle cx={0} cy={0} r={4} fill="#886644" />
        </g>
      </g>
    </svg>
  )
}

function Scene_dragonfire() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="bg-scene-svg">
      <defs>
        <linearGradient id="df-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#180000" /><stop offset="100%" stopColor="#300800" /></linearGradient>
        <radialGradient id="lava-g" cx="50%" cy="100%"><stop offset="0%" stopColor="#ff6600" /><stop offset="100%" stopColor="#cc2200" stopOpacity={0} /></radialGradient>
      </defs>
      <rect width={800} height={450} fill="url(#df-bg)" />
      {/* Lava glow at horizon */}
      <ellipse cx={400} cy={500} rx={500} ry={100} fill="url(#lava-g)" opacity={0.6} style={{ animation: 'bg-pulse 3s ease-in-out infinite' }} />
      {/* Mountain peaks */}
      {[{x:0,h:300},{x:150,h:360},{x:300,h:280},{x:450,h:330},{x:600,h:290},{x:720,h:340}].map((m,i)=>(
        <polygon key={i} points={`${m.x},500 ${m.x+100},${500-m.h} ${m.x+200},500`} fill={i%2===0?'#200808':'#180606'} />
      ))}
      {/* Dragon — complete redraw: elongated body, huge wings, flame fire */}
      <g style={{ animation: 'bg-float-sm 5s ease-in-out infinite' }}>
        {/* TAIL — long sweeping curve to the right */}
        <path d="M598,338 C640,318 682,295 714,268 C734,252 745,240 738,255 C730,268 715,278 698,290"
          stroke="#8b2200" strokeWidth={30} fill="none" strokeLinecap="round" />
        <path d="M714,268 C736,250 748,238 742,252 C737,263 726,272 714,278"
          stroke="#7a1e00" strokeWidth={16} fill="none" strokeLinecap="round" />
        <path d="M740,248 C750,238 756,242 750,255" stroke="#5a1400" strokeWidth={8} fill="none" strokeLinecap="round" />
        {/* Tail spines */}
        {[[625,322],[648,306],[670,288],[690,272],[708,258]].map(([x,y],i)=>(
          <polygon key={i} points={`${x-5},${y+15} ${x},${y} ${x+5},${y+15}`} fill="#400e00" />
        ))}

        {/* REAR WING — behind body, partially visible */}
        <path d="M535,278 C558,225 598,158 638,128 C614,155 585,200 560,252 Z" fill="#3e0e00" opacity={0.9} />
        <path d="M535,278 C568,210 618,132 668,102 C636,135 598,190 560,252 Z" fill="#340c00" opacity={0.8} />
        <path d="M535,278 C575,195 635,112 690,80 C650,118 608,178 560,252 Z" fill="#2c0a00" opacity={0.65} />
        <line x1="535" y1="278" x2="638" y2="128" stroke="#7a2c10" strokeWidth={3} opacity={0.7} />
        <line x1="535" y1="278" x2="668" y2="102" stroke="#7a2c10" strokeWidth={2.5} opacity={0.6} />
        <line x1="535" y1="278" x2="690" y2="80" stroke="#7a2c10" strokeWidth={2} opacity={0.5} />
        {/* Rear wing claw tips */}
        <path d="M638,128 C642,113 648,102 642,98" stroke="#380e00" strokeWidth={5} fill="none" strokeLinecap="round" />
        <path d="M668,102 C674,88 680,78 673,74" stroke="#380e00" strokeWidth={5} fill="none" strokeLinecap="round" />
        <path d="M690,80 C697,66 703,56 696,52" stroke="#380e00" strokeWidth={4} fill="none" strokeLinecap="round" />

        {/* FRONT WING — dominant, spread wide upward to the left */}
        <path d="M450,288 C418,242 375,175 335,145 C365,172 408,218 448,258 Z" fill="#5e1600" />
        <path d="M450,288 C408,222 350,138 295,108 C335,140 395,200 448,258 Z" fill="#4e1200" />
        <path d="M450,288 C395,205 325,112 255,82 C308,120 384,192 448,258 Z" fill="#3e0e00" />
        <path d="M450,288 C385,188 295,88 210,58 C274,100 368,186 448,258 Z" fill="#320c00" />
        {/* Front wing finger bones */}
        <line x1="450" y1="288" x2="335" y2="145" stroke="#9a3818" strokeWidth={3.5} opacity={0.85} />
        <line x1="450" y1="288" x2="295" y2="108" stroke="#9a3818" strokeWidth={3} opacity={0.75} />
        <line x1="450" y1="288" x2="255" y2="82" stroke="#9a3818" strokeWidth={2.5} opacity={0.65} />
        <line x1="450" y1="288" x2="210" y2="58" stroke="#9a3818" strokeWidth={2} opacity={0.55} />
        <path d="M448,258 L210,58" stroke="#9a3818" strokeWidth={1.5} opacity={0.4} fill="none" />
        {/* Front wing claw tips */}
        <path d="M335,145 C326,130 322,118 330,114" stroke="#380e00" strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d="M295,108 C286,92 283,80 292,76" stroke="#380e00" strokeWidth={5.5} fill="none" strokeLinecap="round" />
        <path d="M255,82 C246,66 244,54 254,50" stroke="#380e00" strokeWidth={5} fill="none" strokeLinecap="round" />
        <path d="M210,58 C202,42 200,30 210,26" stroke="#380e00" strokeWidth={4.5} fill="none" strokeLinecap="round" />

        {/* BODY — elongated, proper dragon shape */}
        <path d="
          M375,300 C380,268 408,250 448,244
          C490,238 545,240 585,255
          C622,268 648,290 650,318
          C652,344 634,364 600,372
          C564,380 520,378 480,366
          C438,354 400,336 380,318
          C375,312 373,306 375,300 Z
        " fill="#8b2200" />
        {/* Belly — lighter underside */}
        <path d="
          M400,312 C415,292 448,278 492,275
          C534,272 575,280 604,298
          C628,313 636,338 620,356
          C604,372 570,376 530,368
          C488,360 448,342 422,324
          C408,316 400,318 400,312 Z
        " fill="#c84e20" opacity={0.6} />
        {/* Scale pattern */}
        {[[452,262],[482,256],[512,254],[542,258],[570,266],[594,280],[610,298],[596,320],[572,334],[542,342],[510,344],[480,340],[450,328],[425,314],[402,300]].map(([x,y],i)=>(
          <path key={i} d={`M${x},${y} C${x+8},${y-8} ${x+16},${y} ${x+8},${y+8} Z`} fill="#6b1800" opacity={0.4} />
        ))}
        {/* Back spines */}
        {[[415,268],[440,251],[468,243],[496,240],[524,241],[552,246],[578,256],[600,270],[618,287]].map(([x,y],i)=>(
          <polygon key={i} points={`${x-6},${y+18} ${x},${y} ${x+6},${y+18}`} fill="#400e00" />
        ))}

        {/* NECK — thick, curves up-left from body to head, terminates at skull */}
        <path d="M388,302 C368,278 346,256 300,228" stroke="#8b2200" strokeWidth={48} fill="none" strokeLinecap="round" />
        <path d="M388,302 C368,278 346,256 300,228" stroke="#c84e20" strokeWidth={24} fill="none" strokeLinecap="round" opacity={0.28} />

        {/* HEAD — angular skull */}
        <path d="
          M290,222 C283,208 272,196 260,190
          C246,184 228,184 218,194
          C208,204 208,220 218,230
          C228,240 246,242 262,236
          C274,230 285,226 290,222 Z
        " fill="#8b2200" />
        {/* Upper jaw / snout — long angular, points left */}
        <path d="M218,208 C204,204 182,200 160,202 C155,210 164,220 178,222 C194,224 208,218 218,214 Z" fill="#8b2200" />
        {/* Lower jaw — open, angled down */}
        <path d="M218,214 C204,218 182,222 162,218 C160,226 168,234 182,234 C196,234 210,226 218,222 Z" fill="#6b1800" />
        {/* Upper teeth */}
        {[[176,204],[185,202],[194,201],[202,202],[210,204]].map(([x,y],i)=>(
          <polygon key={i} points={`${x-3.5},${y} ${x},${y-10} ${x+3.5},${y}`} fill="#f2ece0" opacity={0.95} />
        ))}
        {/* Lower teeth */}
        {[[175,216],[184,218],[193,218],[202,217],[210,216]].map(([x,y],i)=>(
          <polygon key={i} points={`${x-3},${y} ${x},${y+8} ${x+3},${y}`} fill="#f2ece0" opacity={0.9} />
        ))}
        {/* Horn 1 — main */}
        <path d="M262,188 C256,172 254,152 260,138" stroke="#400e00" strokeWidth={10} fill="none" strokeLinecap="round" />
        {/* Horn 2 — secondary */}
        <path d="M248,187 C244,170 246,152 252,140" stroke="#400e00" strokeWidth={8} fill="none" strokeLinecap="round" />
        {/* Eye ridge */}
        <path d="M222,197 C230,191 242,190 248,196" stroke="#5a1400" strokeWidth={4.5} fill="none" />
        {/* Eye — glowing slit */}
        <circle cx={236} cy={206} r={12} fill="#ff5500" style={{ animation: 'bg-glow-fast 1.2s ease-in-out infinite' }} />
        <circle cx={236} cy={206} r={7.5} fill="#ffaa00" />
        <ellipse cx={236} cy={206} rx={2.5} ry={6} fill="#0d0000" />
        <circle cx={239} cy={203} r={2.5} fill="rgba(255,255,255,0.55)" />
        {/* Nostril */}
        <ellipse cx={164} cy={210} rx={4} ry={3} fill="#4a1000" opacity={0.8} />

        {/* LEGS */}
        {/* Front leg */}
        <path d="M418,362 C416,388 415,414 416,436" stroke="#7a1e00" strokeWidth={24} fill="none" strokeLinecap="round" />
        <path d="M416,436 C410,446 405,450 400,447" stroke="#681800" strokeWidth={14} fill="none" strokeLinecap="round" />
        {[[401,448],[410,452],[419,451],[427,446]].map(([x,y],i)=>(
          <path key={i} d={`M${x},${y} C${x-3},${y+8} ${x-1},${y+18} ${x+2},${y+20}`} stroke="#3a0c00" strokeWidth={5} fill="none" strokeLinecap="round" />
        ))}
        {/* Back leg */}
        <path d="M568,374 C566,398 564,422 563,444" stroke="#7a1e00" strokeWidth={22} fill="none" strokeLinecap="round" />
        {[[556,444],[564,448],[572,447],[580,442]].map(([x,y],i)=>(
          <path key={i} d={`M${x},${y} C${x-3},${y+8} ${x-1},${y+18} ${x+2},${y+20}`} stroke="#3a0c00" strokeWidth={4.5} fill="none" strokeLinecap="round" />
        ))}

        {/* FIRE BREATH — flame tongue shapes, not oval blobs */}
        {/* Outer red flame — widest */}
        <path d="M158,214 C138,204 108,200 76,207 C52,213 32,226 38,244 C44,258 68,262 92,254 C106,248 114,234 126,232 C112,244 108,262 122,270 C136,278 158,266 162,250 C158,262 164,276 176,272 C186,268 186,254 180,242 Z"
          fill="#cc2200" opacity={0.9} style={{ animation: 'bg-dragon-fire 2s ease-in-out infinite' }} />
        {/* Middle orange flame */}
        <path d="M156,216 C136,208 108,206 80,214 C60,220 46,233 52,246 C58,258 78,260 98,252 C110,246 116,234 126,234"
          fill="#ff6600" opacity={0.85} style={{ animation: 'bg-dragon-fire 1.7s 0.25s ease-in-out infinite' }} />
        {/* Inner yellow core */}
        <path d="M154,218 C138,213 116,214 96,222 C80,229 72,242 80,252 C88,260 106,256 118,246 C126,240 128,230 136,230"
          fill="#ffcc00" opacity={0.7} style={{ animation: 'bg-dragon-fire 1.4s 0.12s ease-in-out infinite' }} />
        {/* Bright white-hot tip near mouth */}
        <path d="M154,220 C146,217 136,218 126,224 C118,230 116,240 124,246 C130,250 140,246 146,240 C148,244 150,250 156,248"
          fill="#ffffaa" opacity={0.5} style={{ animation: 'bg-dragon-fire 1.2s 0.05s ease-in-out infinite' }} />
        {/* Fire ember particles — drifting sparks */}
        {[[95,240],[72,232],[55,244],[110,255],[80,252],[45,238]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r={2+i%2} fill={i%2===0?'#ff6600':'#ffcc00'} opacity={0.7}
            style={{ animation: `bg-flicker ${0.8+i*0.2}s ${i*0.15}s ease-in-out infinite` }} />
        ))}
      </g>
      {/* Fire particles rising */}
      {Array.from({length:10},(_,i)=>(
        <circle key={i} cx={(i*130+50)%800} cy={500} r={3+i%3*2} fill={i%2===0?'#ff4400':'#ff8800'} style={{ animation: `bg-volcano ${2+i*.3}s ${i*.25}s ease-out infinite` }} />
      ))}
      {/* Castle silhouette in background */}
      <g transform="translate(650,360)" opacity={0.55}>
        {/* Main tower */}
        <rect x={-22} y={-120} width={44} height={120} fill="#1a0808" />
        {/* Battlements */}
        {[-20,-8,4,16].map((x,i)=>(
          <rect key={i} x={x} y={-132} width={8} height={14} fill="#1a0808" />
        ))}
        {/* Left tower */}
        <rect x={-50} y={-80} width={28} height={80} fill="#180606" />
        {[-48,-40,-32].map((x,i)=>(
          <rect key={i} x={x} y={-90} width={6} height={12} fill="#180606" />
        ))}
        {/* Right tower */}
        <rect x={22} y={-80} width={28} height={80} fill="#180606" />
        {[24,32,40].map((x,i)=>(
          <rect key={i} x={x} y={-90} width={6} height={12} fill="#180606" />
        ))}
        {/* Gate arch */}
        <path d="M-12,0 Q0,-20 12,0" fill="#0a0404" />
        <rect x={-12} y={-20} width={24} height={20} fill="#0a0404" />
        {/* Lava glow on walls */}
        <ellipse cx={0} cy={0} rx={50} ry={15} fill="#ff4400" opacity={0.1} style={{ animation: 'bg-pulse 3s ease-in-out infinite' }} />
      </g>
      {/* Dragon eggs nestled on ground */}
      {[{x:550,y:415,c:'#8b2200'},{x:575,y:410,c:'#5a0e00'},{x:562,y:422,c:'#6b1800'}].map((e,i)=>(
        <g key={i} transform={`translate(${e.x},${e.y})`}>
          <ellipse cx={0} cy={0} rx={16} ry={20} fill={e.c} />
          {/* Scale texture */}
          {[[-5,-8],[5,-8],[-5,0],[5,0],[-5,8],[5,8]].map(([dx,dy],j)=>(
            <path key={j} d={`M${dx},${dy} C${dx+4},${dy-4} ${dx+8},${dy} ${dx+4},${dy+4} Z`} fill="#400e00" opacity={0.5} />
          ))}
          {/* Glow crack — hatching? */}
          <path d="M-2,-12 L0,-5 L3,-10" stroke="#ff6600" strokeWidth={1.5} fill="none" opacity={0.7} style={{ animation: `bg-glow ${1.5+i*.3}s ease-in-out infinite` }} />
        </g>
      ))}
    </svg>
  )
}

function Scene_racecar() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="bg-scene-svg">
      <defs>
        <linearGradient id="rc-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#050508" /><stop offset="100%" stopColor="#0a0a14" /></linearGradient>
      </defs>
      <rect width={800} height={450} fill="url(#rc-bg)" />
      {/* Race track with dotted center line */}
      <rect x={0} y={330} width={800} height={120} fill="#1a1a20" />
      <rect x={0} y={448} width={800} height={8} fill="#555" />
      <rect x={0} y={330} width={800} height={8} fill="#555" />
      {/* Center line dashes */}
      {Array.from({length:16},(_,i)=>(
        <rect key={i} x={i*52} y={386} width={32} height={6} rx={3} fill="#eeee00" opacity={0.7} style={{ animation: `bg-drift-l 1s linear infinite` }} />
      ))}
      {/* Grandstand */}
      <rect x={0} y={150} width={800} height={180} fill="#111118" />
      {/* Stadium lights */}
      {[80,280,480,680].map((x,i)=>(
        <g key={i}>
          <rect x={x} y={60} width={8} height={95} fill="#666" />
          <rect x={x-20} y={50} width={50} height={18} rx={4} fill="#ffee80" style={{ animation: `bg-glow ${3+i}s ease-in-out infinite` }} />
          <ellipse cx={x+5} cy={120} rx={30} ry={80} fill="#ffee80" opacity={0.03} />
        </g>
      ))}
      {/* Crowd silhouettes */}
      {Array.from({length:30},(_,i)=>(
        <circle key={i} cx={i*28+10} cy={190+(i%4)*15} r={8} fill="#222228" />
      ))}
      {/* Checkered flag */}
      <rect x={0} y={330} width={6} height={60} fill="#888" />
      {Array.from({length:12},(_,i)=>(
        <rect key={i} x={(i%4)*8} y={335+(Math.floor(i/4))*8} width={8} height={8} fill={i%2===0&&Math.floor(i/4)%2===0||i%2!==0&&Math.floor(i/4)%2!==0?'white':'black'} />
      ))}
      {/* Car 1 — red — F1 aerodynamic profile */}
      <g style={{ animation: 'bg-car-move 3s linear infinite' }}>
        {/* Main chassis — low wedge shape */}
        <path d="M290,382 C295,370 310,362 330,360 L410,360 C430,360 440,366 445,374 C442,382 432,388 420,388 L300,388 C286,388 285,386 290,382 Z" fill="#cc1122" />
        {/* Nose cone — pointed */}
        <path d="M290,382 C282,380 270,376 258,374 C264,370 276,366 290,366 Z" fill="#dd2233" />
        {/* Cockpit hump — teardrop */}
        <path d="M340,360 C346,350 356,344 366,344 C376,344 386,348 390,356 C388,358 382,360 370,360 Z" fill="#ee3344" />
        {/* Cockpit opening */}
        <path d="M345,358 C350,350 360,346 368,346 C374,346 380,350 382,356 C378,358 368,360 356,360 Z" fill="#66aaff" opacity={0.7} />
        {/* Front wing — low flat aero piece */}
        <path d="M258,374 L268,370 L290,372 L290,378 L268,380 Z" fill="#aa0010" />
        <path d="M260,374 C254,374 246,376 240,378 C246,380 254,380 260,378 Z" fill="#aa0010" />
        {/* Rear wing — vertical blade */}
        <rect x={418} y={352} width={28} height={5} rx={2} fill="#aa0010" />
        <rect x={428} y={352} width={4} height={18} rx={1} fill="#880008" />
        <rect x={418} y={368} width={28} height={5} rx={2} fill="#aa0010" />
        {/* Front wheel — wide F1 tire */}
        <ellipse cx={282} cy={392} rx={18} ry={18} fill="#111" />
        <ellipse cx={282} cy={392} rx={12} ry={12} fill="#333" />
        <ellipse cx={282} cy={392} rx={5} ry={5} fill="#555" />
        {/* Rear wheel */}
        <ellipse cx={420} cy={392} rx={20} ry={20} fill="#111" />
        <ellipse cx={420} cy={392} rx={13} ry={13} fill="#333" />
        <ellipse cx={420} cy={392} rx={5} ry={5} fill="#555" />
        {/* Side pod — aerodynamic intake */}
        <path d="M310,368 C320,364 360,362 380,364 C380,372 360,376 320,376 Z" fill="#bb1020" />
        {/* Number */}
        <text x={358} y={382} fontSize={11} fill="white" fontWeight="bold" fontFamily="monospace" opacity={0.9}>7</text>
        {/* Speed lines */}
        {[375,380,385].map((y,i)=>(
          <line key={i} x1={258} y1={y} x2={220-i*6} y2={y} stroke="rgba(255,80,80,.35)" strokeWidth={2-i*0.3} />
        ))}
      </g>
      {/* Car 2 — blue — F1 aerodynamic profile */}
      <g style={{ animation: 'bg-car-move 4.5s 1.5s linear infinite' }}>
        <path d="M290,420 C295,408 310,400 330,398 L405,398 C425,398 435,404 440,412 C437,420 427,426 415,426 L300,426 C286,426 285,424 290,420 Z" fill="#1144cc" />
        <path d="M290,420 C282,418 270,414 258,412 C264,408 276,404 290,404 Z" fill="#2255dd" />
        <path d="M336,398 C342,388 352,382 362,382 C372,382 380,386 382,394 C380,396 374,398 362,398 Z" fill="#2255dd" />
        <path d="M342,396 C347,388 356,384 364,384 C370,384 376,388 378,394 C374,396 366,398 354,398 Z" fill="#66aaff" opacity={0.6} />
        <path d="M258,412 L268,408 L290,410 L290,416 L268,418 Z" fill="#0033aa" />
        <path d="M260,412 C254,412 246,414 240,416 C246,418 254,418 260,416 Z" fill="#0033aa" />
        <rect x={413} y={390} width={26} height={4} rx={2} fill="#0033aa" />
        <rect x={422} y={390} width={4} height={16} rx={1} fill="#002288" />
        <rect x={413} y={404} width={26} height={4} rx={2} fill="#0033aa" />
        <ellipse cx={280} cy={430} rx={17} ry={17} fill="#111" />
        <ellipse cx={280} cy={430} rx={11} ry={11} fill="#333" />
        <ellipse cx={280} cy={430} rx={5} ry={5} fill="#555" />
        <ellipse cx={416} cy={430} rx={19} ry={19} fill="#111" />
        <ellipse cx={416} cy={430} rx={13} ry={13} fill="#333" />
        <ellipse cx={416} cy={430} rx={5} ry={5} fill="#555" />
        <text x={354} y={420} fontSize={11} fill="white" fontWeight="bold" fontFamily="monospace" opacity={0.9}>3</text>
        {/* Exhaust smoke */}
        {[0,1,2].map(i=>(
          <circle key={i} cx={242-i*12} cy={416+i*2} r={6+i*4} fill="rgba(180,180,200,.18)"
            style={{ animation: `bg-drift-up ${1.5+i*.4}s ${i*.2}s ease-in-out infinite` }}/>
        ))}
      </g>
      {/* Exhaust sparks — car1 */}
      {[0,1,2,3,4].map(i=>(
        <circle key={i} cx={(i*53+220)%280} cy={388+i%3*3} r={2} fill="#ff8800" opacity={0.7}
          style={{ animation: `bg-twinkle ${0.6+i*.15}s ${i*.1}s ease-in-out infinite` }}/>
      ))}
      {/* Tire smoke — car1 front wheel */}
      {[0,1,2].map(i=>(
        <circle key={i} cx={282+i*6} cy={408+i*3} r={8+i*5} fill="rgba(200,200,200,.12)"
          style={{ animation: `bg-drift-up ${2+i*.5}s ${i*.3}s ease-in-out infinite` }}/>
      ))}
      {/* Podium — right side */}
      <rect x={610} y={188} width={60} height={142} rx={4} fill="#ffd700"/>
      <rect x={672} y={218} width={55} height={112} rx={4} fill="#c0c0c0"/>
      <rect x={547} y={238} width={55} height={92} rx={4} fill="#cd7f32"/>
      <text x={635} y={206} fontSize={24} textAnchor="middle" fill="#333" fontWeight="bold">1</text>
      <text x={699} y={234} fontSize={20} textAnchor="middle" fill="#333" fontWeight="bold">2</text>
      <text x={574} y={254} fontSize={20} textAnchor="middle" fill="#333" fontWeight="bold">3</text>
      {/* Winner on podium — celebrating with trophy */}
      <g transform="translate(635,178)">
        <g style={{ animation: 'bg-bob 0.7s ease-in-out infinite' }}>
          {/* Helmet */}
          <ellipse cx={0} cy={-32} rx={12} ry={13} fill="#cc1122"/>
          <ellipse cx={0} cy={-28} rx={10} ry={6} fill="#66aaff" opacity={0.7}/>
          {/* Body */}
          <rect x={-10} y={-20} width={20} height={22} rx={4} fill="#cc1122"/>
          {/* Arms raised */}
          <line x1={-10} y1={-12} x2={-24} y2={-28} stroke="#cc1122" strokeWidth={6} strokeLinecap="round"/>
          <line x1={10} y1={-12} x2={24} y2={-28} stroke="#cc1122" strokeWidth={6} strokeLinecap="round"/>
          {/* Trophy */}
          <rect x={18} y={-38} width={10} height={16} rx={2} fill="#ffd700"/>
          <ellipse cx={23} cy={-39} rx={8} ry={6} fill="#ffd700"/>
          {/* Confetti from trophy */}
          {[0,1,2,3,4].map(i=>(
            <circle key={i} cx={23+(i-2)*6} cy={-50-i*5} r={3} fill={['#ff4040','#40ff40','#4040ff','#ffff40','#ff40ff'][i]}
              style={{ animation: `bg-drift-up ${1+i*.2}s ${i*.1}s ease-in-out infinite` }}/>
          ))}
        </g>
      </g>
      {/* Confetti burst */}
      {Array.from({length:20},(_,i)=>(
        <rect key={i} x={(i*113+550)%250+530} y={(i*77+150)%180+100} width={6} height={9} rx={2}
          fill={['#ff4040','#40ff40','#4040ff','#ffff40','#ff40ff','#ff8800'][i%6]} opacity={0.8}
          style={{ animation: `bg-drift-up ${2+i*.3}s ${i*.15}s ease-in-out infinite` }}/>
      ))}
      {/* Crowd — animate with bobbing */}
      {Array.from({length:38},(_,i)=>(
        <g key={i} style={{ animation: `bg-bob ${0.8+i%4*.2}s ${i*.1}s ease-in-out infinite` }}>
          <circle cx={i*21+5} cy={170+(i%5)*14} r={9} fill={['#cc2200','#0044cc','#00aa44','#cc8800','#880088'][i%5]}/>
          {i%4===0 && <text x={i*21+5} y={165+(i%5)*14} fontSize={10} textAnchor="middle">📱</text>}
        </g>
      ))}
    </svg>
  )
}

function Scene_spiderman() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="bg-scene-svg">
      <defs>
        <linearGradient id="sp-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#020608"/>
          <stop offset="50%" stopColor="#081420"/>
          <stop offset="100%" stopColor="#040810"/>
        </linearGradient>
        <radialGradient id="sp-spot" cx="50%" cy="0%">
          <stop offset="0%" stopColor="#fffce0" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="#fffce0" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width={800} height={450} fill="url(#sp-bg)" />
      <Stars n={30} />
      {/* NYC night skyline */}
      {[{x:0,w:75,h:290},{x:70,w:50,h:340},{x:115,w:65,h:270},{x:175,w:45,h:380},{x:215,w:60,h:310},{x:600,w:70,h:300},{x:665,w:45,h:360},{x:705,w:80,h:280},{x:780,w:50,h:330}].map((b,i)=>(
        <g key={i}>
          <rect x={b.x} y={500-b.h} width={b.w} height={b.h} fill="#0a0a14" />
          {Array.from({length:8},(_,j)=>(
            <rect key={j} x={b.x+6+j%3*20} y={500-b.h+20+Math.floor(j/3)*30} width={12} height={14} rx={1}
              fill="#ffe880" opacity={j%3===0?0.6:0.3} style={{ animation: `bg-twinkle ${3+j*.4}s ${j*.3+i*.2}s ease-in-out infinite` }} />
          ))}
        </g>
      ))}
      {/* Web net between buildings — static decorative web */}
      {/* Anchor points: left building top (~x220,y120) to right building top (~x600,y200) */}
      {[0,1,2,3,4].map(i=>(
        <line key={i} x1={220+i*30} y1={118} x2={600+i*12} y2={200} stroke="#888" strokeWidth={0.8} opacity={0.18}/>
      ))}
      {/* Cross-connectors on the web net */}
      {[0,1,2].map(i=>(
        <path key={i} d={`M${280+i*60},${130+i*10} Q${340+i*40},${150+i*8} ${400+i*50},${140+i*12}`} stroke="#888" strokeWidth={0.7} fill="none" opacity={0.14}/>
      ))}
      {/* Web pattern — bottom-left corner */}
      {[1,2,3,4].map(i=>(
        <circle key={i} cx={0} cy={450} r={i*70} fill="none" stroke="#777" strokeWidth={0.8} opacity={0.18} />
      ))}
      {[15,30,50,70,90,110].map((a,i)=>(
        <line key={i} x1={0} y1={500} x2={300*Math.cos(a*Math.PI/180)} y2={500-300*Math.sin(a*Math.PI/180)} stroke="#777" strokeWidth={0.8} opacity={0.14} />
      ))}
      {/* Web pattern — top-right corner */}
      {[1,2,3].map(i=>(
        <circle key={i} cx={800} cy={0} r={i*60} fill="none" stroke="#666" strokeWidth={0.8} opacity={0.14}/>
      ))}
      {[200,220,240,260,280].map((a,i)=>(
        <line key={i} x1={800} y1={0} x2={800+200*Math.cos(a*Math.PI/180)} y2={200*Math.sin(a*Math.PI/180)} stroke="#666" strokeWidth={0.7} opacity={0.12}/>
      ))}
      {/* WEB SHOOTS across screen */}
      <line x1={0} y1={500} x2={800} y2={0} stroke="#d8d8d8" strokeWidth={2.5} opacity={0.75}
        strokeDasharray="900 900" style={{ animation: 'bg-web-shoot 7s ease-out infinite' }} />
      <line x1={0} y1={400} x2={700} y2={0} stroke="#c8c8c8" strokeWidth={1.8} opacity={0.55}
        strokeDasharray="750 750" style={{ animation: 'bg-web-shoot2 7s 0.4s ease-out infinite' }} />
      <line x1={100} y1={500} x2={800} y2={80} stroke="#c8c8c8" strokeWidth={1.5} opacity={0.45}
        strokeDasharray="730 730" style={{ animation: 'bg-web-shoot2 7s 0.8s ease-out infinite' }} />
      {/* Police helicopter with searchlight */}
      <g style={{ animation: 'bg-drift-lr 20s ease-in-out infinite' }}>
        <g transform="translate(620,80)">
          {/* Spotlight beam */}
          <path d="M0,14 L-35,120 L35,120Z" fill="url(#sp-spot)" style={{ animation: 'bg-sway 3s ease-in-out infinite', transformBox:'fill-box', transformOrigin:'center top' }}/>
          {/* Fuselage */}
          <ellipse cx={0} cy={0} rx={30} ry={10} fill="#1a1a2a"/>
          <rect x={24} y={-3} width={22} height={5} rx={2} fill="#141420"/>
          {/* Tail rotor */}
          <ellipse cx={46} cy={-1} rx={1.5} ry={8} fill="#222232" opacity={0.5} style={{ animation: 'bg-spin 0.1s linear infinite' }}/>
          {/* Main rotor */}
          <ellipse cx={0} cy={-10} rx={44} ry={4} fill="#1a1a2a" opacity={0.45} style={{ animation: 'bg-spin 0.1s linear infinite' }}/>
          {/* Belly light */}
          <circle cx={0} cy={10} r={4} fill="#fffce0" opacity={0.9} style={{ animation: 'bg-glow-fast 1.2s ease-in-out infinite' }}/>
        </g>
      </g>
      {/* Green Goblin on glider — lurking from the right */}
      <g style={{ animation: 'bg-float 5s 1s ease-in-out infinite' }}>
        <g transform="translate(680,260)">
          {/* Glider — bat-wing shaped */}
          <path d="M0,0 C-20,-18 -54,-20 -60,-8 C-54,-4 -28,0 0,0Z" fill="#4a8020"/>
          <path d="M0,0 C20,-18 54,-20 60,-8 C54,-4 28,0 0,0Z" fill="#4a8020"/>
          <ellipse cx={0} cy={-4} rx={14} ry={10} fill="#386018"/>
          {/* Engine glow */}
          <ellipse cx={0} cy={2} rx={10} ry={4} fill="#ff8800" opacity={0.5} style={{ animation: 'bg-glow 1.5s ease-in-out infinite' }}/>
          {/* Goblin figure */}
          <circle cx={0} cy={-18} r={10} fill="#50a030"/>
          {/* Goblin mask — angular eyes */}
          <path d="M-6,-20 L-2,-16 L2,-16 L6,-20" fill="#ff8800" opacity={0.85}/>
          <circle cx={-4} cy={-18} r={2.5} fill="#ffcc00"/>
          <circle cx={4} cy={-18} r={2.5} fill="#ffcc00"/>
          {/* Body */}
          <rect x={-8} y={-8} width={16} height={16} rx={4} fill="#386018"/>
          {/* Pumpkin bomb */}
          <circle cx={18} cy={-12} r={6} fill="#ff8800"/>
          <path d="M16,-18 L18,-14 L20,-18" fill="#50a030"/>
          <circle cx={18} cy={-12} r={3} fill="#ff6600" opacity={0.6} style={{ animation: 'bg-glow-fast 0.8s ease-in-out infinite' }}/>
          {/* Laugh lines */}
          <path d="M-4,-12 Q0,-9 4,-12" stroke="#1a0a00" strokeWidth={1.5} fill="none"/>
        </g>
      </g>
      {/* Bystander silhouette on rooftop */}
      <g transform="translate(250,180)">
        <circle cx={0} cy={-20} r={6} fill="#060810"/>
        <rect x={-4} y={-14} width={8} height={14} rx={2} fill="#060810"/>
        <line x1={-4} y1={-8} x2={-10} y2={-2} stroke="#060810" strokeWidth={2.5} strokeLinecap="round"/>
        <line x1={4} y1={-8} x2={10} y2={-2} stroke="#060810" strokeWidth={2.5} strokeLinecap="round"/>
        <line x1={-2} y1={0} x2={-2} y2={12} stroke="#060810" strokeWidth={2.5} strokeLinecap="round"/>
        <line x1={2} y1={0} x2={2} y2={12} stroke="#060810" strokeWidth={2.5} strokeLinecap="round"/>
        {/* Phone glow — filming the action */}
        <rect x={8} y={-12} width={5} height={8} rx={1} fill="#3a80ff" opacity={0.7} style={{ animation: 'bg-twinkle 2s ease-in-out infinite' }}/>
      </g>
      {/* Spider-Man swinging */}
      <g style={{ animation: 'bg-fly 10s 1.5s ease-in-out infinite normal backwards' }}>
        {/* Spidey sense burst — concentric arcs */}
        {[1,2,3].map(i=>(
          <path key={i} d={`M${384-i*6},${118+i*4} Q${400},${106+i*3} ${416+i*6},${118+i*4}`}
            stroke="#ff4444" strokeWidth={1.5-i*.3} fill="none" opacity={0.5-i*.12}
            style={{ animation: `bg-pulse ${0.8}s ${i*.1}s ease-in-out infinite` }}/>
        ))}
        {/* Web line from hand to anchor */}
        <path d="M348,125 C355,105 370,90 400,80" stroke="#d0d0d0" strokeWidth={1.8} fill="none" opacity={0.7} />
        {/* Head */}
        <circle cx={400} cy={136} r={16} fill="#cc1122" />
        {[[-8,-4],[0,-4],[8,-4],[-8,2],[0,2],[8,2]].map(([dx,dy],i)=>(
          <line key={i} x1={400+dx} y1={136+dy} x2={400+dx+4} y2={136+dy+5} stroke="#990011" strokeWidth={0.7} opacity={0.6} />
        ))}
        <ellipse cx={394} cy={133} rx={8} ry={5} fill="white" opacity={0.9} />
        <ellipse cx={407} cy={133} rx={8} ry={5} fill="white" opacity={0.9} />
        <ellipse cx={394} cy={133} rx={5} ry={3} fill="white" />
        <ellipse cx={407} cy={133} rx={5} ry={3} fill="white" />
        {/* Torso */}
        <path d="M388,150 C384,154 382,164 384,174 C386,180 394,184 400,184 C406,184 414,180 416,174 C418,164 416,154 412,150 C408,148 392,148 388,150 Z" fill="#cc1122" />
        {/* Blue legs */}
        <path d="M385,180 C382,188 378,198 374,208 C378,212 384,212 386,210 C388,202 390,192 392,184 Z" fill="#1122cc" />
        <path d="M415,180 C418,188 422,198 426,208 C422,212 416,212 414,210 C412,202 408,192 408,184 Z" fill="#1122cc" />
        {/* Boots */}
        <path d="M372,208 C370,214 370,220 374,222 C378,224 386,222 387,218 C386,214 382,210 378,208 Z" fill="#cc1122" />
        <path d="M428,208 C430,214 430,220 426,222 C422,224 414,222 413,218 C414,214 418,210 422,208 Z" fill="#cc1122" />
        {/* Web-shooting arm */}
        <path d="M388,156 C380,152 372,148 365,143 C360,140 356,136 352,132" stroke="#1122cc" strokeWidth={8} fill="none" strokeLinecap="round" />
        <circle cx={348} cy={125} r={6} fill="#cc1122" />
        {/* Second web strand from shooter hand */}
        <path d="M348,125 Q290,90 240,110" stroke="#d0d0d0" strokeWidth={1.2} fill="none" opacity={0.5}/>
        {/* Other arm */}
        <path d="M412,158 C420,164 428,172 432,182" stroke="#1122cc" strokeWidth={8} fill="none" strokeLinecap="round" />
        {/* Spider emblem */}
        <path d="M400,158 L396,162 L400,168 L404,162 Z" fill="#111" opacity={0.5} />
        <path d="M396,162 L390,160 L392,164 Z" fill="#111" opacity={0.5} />
        <path d="M404,162 L410,160 L408,164 Z" fill="#111" opacity={0.5} />
      </g>
    </svg>
  )
}

function Scene_batman() {
  return (
    <>
      {/* Periodic bat signal blink — entire sky flash */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 8, background: 'rgba(230,240,255,1)', pointerEvents: 'none', animation: 'bg-screen-flash 12s 2s ease-in-out infinite' }} />
      <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 2 }}>
        <defs>
          <linearGradient id="bat-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#020205" /><stop offset="100%" stopColor="#04080f" />
          </linearGradient>
          <radialGradient id="signal-beam" cx="50%" cy="100%">
            <stop offset="0%" stopColor="#d8e8ff" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#d8e8ff" stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect width={800} height={450} fill="url(#bat-bg)" />
        {/* Gothic Gotham skyline — tall dark towers */}
        {[{x:0,w:80,h:320},{x:75,w:45,h:400},{x:115,w:60,h:360},{x:170,w:40,h:280},{x:205,w:65,h:440},{x:265,w:35,h:310},{x:610,w:70,h:380},{x:675,w:50,h:430},{x:720,w:60,h:360},{x:775,w:40,h:400}].map((b,i)=>(
          <g key={i}>
            <rect x={b.x} y={500-b.h} width={b.w} height={b.h} fill="#05050a" />
            {/* Pointed Gothic spire */}
            <polygon points={`${b.x},${500-b.h} ${b.x+b.w/2},${500-b.h-35} ${b.x+b.w},${500-b.h}`} fill="#030308" />
            {/* Tiny yellow windows glowing faint */}
            {[0,1,2,3].map(j=>(
              <rect key={j} x={Math.min(b.x+b.w-18, b.x+10+j%2*16)} y={500-b.h+28+Math.floor(j/2)*38} width={10} height={12} rx={1}
                fill="#aa8800" opacity={0.25} style={{ animation: `bg-glow ${4+j}s ${j*.5+i*.15}s ease-in-out infinite` }} />
            ))}
          </g>
        ))}
        {/* BAT SIGNAL beam — rotating, blinking */}
        <g style={{ animation: 'bg-sweep 6s ease-in-out infinite', transformOrigin: '400px 500px' }}>
          <polygon points="400,500 340,80 460,80" fill="url(#signal-beam)" style={{ animation: 'bg-signal-blink 6s ease-in-out infinite' }} />
        </g>
        {/* Bat signal circle on clouds */}
        <ellipse cx={400} cy={90} rx={90} ry={48} fill="rgba(200,215,255,.22)" style={{ animation: 'bg-signal-blink 6s ease-in-out infinite' }} />
        <circle cx={400} cy={90} r={56} fill="rgba(200,220,255,0.10)" stroke="rgba(200,215,255,.55)" strokeWidth={4} style={{ animation: 'bg-signal-blink 6s ease-in-out infinite' }} />
        {/* Bat symbol — proper Batman logo silhouette */}
        <g transform="translate(400,92) scale(1.3)"><g style={{ animation: 'bg-signal-blink 6s ease-in-out infinite' }}>
          {/* Single unified Batman logo path — tall ears, dramatic swooping wings, scalloped lower edge */}
          <path d="
            M0,-26
            L-7,-44 L-16,-26
            C-26,-24 -34,-30 -42,-22
            C-50,-14 -54,-4 -50,8
            C-44,18 -30,18 -20,12
            C-13,8 -7,14 0,12
            C7,14 13,8 20,12
            C30,18 44,18 50,8
            C54,-4 50,-14 42,-22
            C34,-30 26,-24 16,-26
            L7,-44 Z
          " fill="#000" />
        </g></g>
        {/* Storm clouds */}
        <CloudShape x={180} y={158} w={320} fill="#0c0c16" style={{ animation: 'bg-cloud-drift 15s ease-in-out infinite alternate' }} />
        <CloudShape x={280} y={130} w={260} fill="#101020" style={{ animation: 'bg-cloud-drift 12s ease-in-out infinite alternate' }} />
        <CloudShape x={580} y={170} w={360} fill="#0a0a14" style={{ animation: 'bg-cloud-drift 18s ease-in-out infinite alternate-reverse' }} />
        <CloudShape x={660} y={140} w={280} fill="#0c0c18" style={{ animation: 'bg-cloud-drift 10s ease-in-out infinite alternate-reverse' }} />
        {/* Rain */}
        <Rain n={28} heavy={true} />
        {/* BATS FLYING across in formation — proper silhouette paths */}
        <g style={{ animation: 'bg-bat-cross 12s ease-in-out infinite' }}>
          {[{dx:0,dy:0,s:1},{dx:55,dy:22,s:.7},{dx:-55,dy:18,s:.7},{dx:110,dy:6,s:.6},{dx:-108,dy:12,s:.6},{dx:28,dy:44,s:.55}].map((bat,i)=>(
            <g key={i} transform={`translate(${400+bat.dx},${220+bat.dy}) scale(${bat.s})`}>
              {/* Unified bat silhouette: body + wings + tiny ears in one path */}
              <path d={`
                M0,-10 L-3,-18 L-7,-10
                C-12,-9 -18,-14 -26,-10
                C-32,-6 -34,0 -30,6
                C-24,10 -16,8 -10,4
                C-6,2 -2,6 0,7
                C2,6 6,2 10,4
                C16,8 24,10 30,6
                C34,0 32,-6 26,-10
                C18,-14 12,-9 7,-10
                L3,-18 Z
              `} fill="#1a1a22" style={{ animation: `bg-wing-flap ${0.55+i*.06}s ${i*.09}s ease-in-out infinite` }} />
            </g>
          ))}
        </g>
      </svg>
    </>
  )
}

function Scene_halloween() {
  return (
    <>
      {/* Periodic full-screen lightning flash */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 10, background: 'rgba(200,200,150,1)', pointerEvents: 'none', animation: 'bg-screen-flash 9s 3s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 9, background: 'rgba(180,160,100,1)', pointerEvents: 'none', animation: 'bg-screen-flash2 7.5s 7s ease-in-out infinite' }} />
      <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 2 }}>
        <defs>
          <radialGradient id="hw-bg" cx="50%" cy="30%"><stop offset="0%" stopColor="#1a0820" /><stop offset="100%" stopColor="#050208" /></radialGradient>
        </defs>
        <rect width={800} height={450} fill="url(#hw-bg)" />
        <Stars n={35} />
        {/* Full orange moon */}
        <circle cx={400} cy={110} r={65} fill="#ff9920" opacity={0.9} style={{ animation: 'bg-glow 5s ease-in-out infinite' }} />
        <circle cx={375} cy={95} r={50} fill="#dd7710" opacity={0.3} />
        {/* Fluffy clouds drifting across moon */}
        <g style={{ animation: 'bg-drift-lr 18s ease-in-out infinite' }}>
          <CloudShape x={340} y={120} w={160} fill="#0d0510" opacity={0.55} />
        </g>
        <g style={{ animation: 'bg-drift-lr 26s 8s ease-in-out infinite' }}>
          <CloudShape x={200} y={100} w={120} fill="#0d0510" opacity={0.4} />
        </g>
        {/* Haunted house on hill */}
        <polygon points="280,500 280,320 400,200 520,320 520,500" fill="#080508" />
        <polygon points="280,320 400,200 520,320" fill="#050305" /> {/* roof */}
        <polygon points="375,200 400,150 425,200" fill="#030203" /> {/* spire */}
        <rect x={372} y={145} width={6} height={60} fill="#040304" />
        {/* Windows glow orange */}
        <rect x={305} y={340} width={40} height={50} rx={20} fill="#ff8800" opacity={0.5} style={{ animation: 'bg-glow 3s ease-in-out infinite' }} />
        <rect x={455} y={340} width={40} height={50} rx={20} fill="#ff8800" opacity={0.5} style={{ animation: 'bg-glow 3s 0.6s ease-in-out infinite' }} />
        <rect x={385} y={280} width={30} height={38} rx={15} fill="#ff6600" opacity={0.45} style={{ animation: 'bg-glow 4s 0.3s ease-in-out infinite' }} />
        {/* Lightning bolt */}
        <polyline points="600,80 582,140 598,140 580,210" stroke="#ffee80" strokeWidth={5} strokeLinejoin="round" strokeLinecap="round"
          strokeDasharray="180 180" style={{ animation: 'bg-lightning-draw 9s 3.2s linear infinite' }} />
        {/* Jack-o-lanterns */}
        {[{x:80,y:440,s:1},{x:720,y:435,s:0.9},{x:180,y:445,s:0.8}].map((p,i)=>(
          <g key={i} transform={`translate(${p.x},${p.y}) scale(${p.s})`}>
            <g style={{ animation: `bg-diya-glow ${2+i*.5}s ${i*.4}s ease-in-out infinite` }}>
            <ellipse cx={0} cy={0} rx={32} ry={28} fill="#cc4400" />
            <rect x={-6} y={-34} width={12} height={10} rx={3} fill="#5a2008" />
            {/* Face */}
            <polygon points="-16,-12 -6,-4 -20,-4" fill="#ff8800" />
            <polygon points="16,-12 6,-4 20,-4" fill="#ff8800" />
            <path d="M-14,8 Q-5,16 0,12 Q5,16 14,8" stroke="#ff8800" strokeWidth={2.5} fill="none" strokeLinecap="round" />
            {/* Glow */}
            <ellipse cx={0} cy={5} rx={20} ry={18} fill="#ff6600" opacity={0.25} style={{ animation: 'bg-flicker 1.2s ease-in-out infinite' }} />
            </g>
          </g>
        ))}
        {/* Ghost floating through */}
        <g style={{ animation: 'bg-drift-l 20s 2s linear infinite normal backwards' }}>
          <ellipse cx={650} cy={260} rx={30} ry={42} fill="rgba(255,255,255,.6)" />
          <path d="M620,295 Q630,310 640,300 Q650,315 660,305 Q668,318 680,305" stroke="rgba(255,255,255,.6)" strokeWidth={15} fill="none" />
          <circle cx={642} cy={252} r={6} fill="#222" opacity={0.7} />
          <circle cx={658} cy={252} r={6} fill="#222" opacity={0.7} />
          <path d="M645,267 Q650,272 655,267" stroke="#222" strokeWidth={1.5} fill="none" opacity={0.7} />
        </g>
        {/* Spooky trees */}
        {[30,750].map((x,i)=>(
          <g key={i}>
            <path d={`M${x+25},500 Q${x+18},400 ${x+25},280 Q${x+10},210 ${x+25},120`} stroke="#0d0508" strokeWidth={18} fill="none" strokeLinecap="round" style={{ animation: 'bg-sway-sm 5s ease-in-out infinite' }} />
            <path d={`M${x+25},280 Q${x-30},255 ${x-40},220`} stroke="#0d0508" strokeWidth={10} fill="none" strokeLinecap="round" />
            <path d={`M${x+25},200 Q${x+70},175 ${x+80},145`} stroke="#0d0508" strokeWidth={8} fill="none" strokeLinecap="round" />
          </g>
        ))}
        {/* Witch on broomstick flying across */}
        <g style={{ animation: 'bg-drift-r 15s 1s linear infinite normal backwards' }}>
          <g transform="translate(0,180)">
            {/* Broom handle */}
            <line x1={-40} y1={10} x2={50} y2={0} stroke="#6a3a08" strokeWidth={4} strokeLinecap="round" />
            {/* Broom bristles */}
            <path d="M50,0 Q60,10 55,20 Q50,10 45,18 Q50,8 40,16 Q48,5 50,0 Z" fill="#8a6020" />
            {/* Witch body */}
            <ellipse cx={10} cy={-10} rx={14} ry={18} fill="#1a1a2a" />
            {/* Head */}
            <circle cx={10} cy={-32} r={12} fill="#a08060" />
            {/* Hat */}
            <path d="M-4,-42 Q10,-68 24,-42" fill="#1a1a2a" />
            <rect x={-8} y={-44} width={36} height={6} rx={3} fill="#1a1a2a" />
            {/* Hat band */}
            <rect x={-4} y={-44} width={28} height={4} rx={1} fill="#884400" opacity={0.7} />
            {/* Hair */}
            <path d="M-2,-28 C-8,-22 -10,-14 -8,-8" stroke="#2a1a00" strokeWidth={3} fill="none" />
            <path d="M22,-28 C28,-22 30,-14 28,-8" stroke="#2a1a00" strokeWidth={3} fill="none" />
            {/* Eyes — tiny glowing */}
            <circle cx={6} cy={-34} r={2.5} fill="#ffee40" style={{ animation: 'bg-glow-fast 1s ease-in-out infinite' }} />
            <circle cx={14} cy={-34} r={2.5} fill="#ffee40" style={{ animation: 'bg-glow-fast 1s 0.2s ease-in-out infinite' }} />
            {/* Cape/arm */}
            <path d="M-4,-15 C-16,-8 -24,4 -20,16" stroke="#1a1a2a" strokeWidth={8} fill="none" strokeLinecap="round" />
          </g>
        </g>
        {/* Spider web in corner */}
        <g transform="translate(720,60)" opacity={0.5}>
          {[0,30,60,90,120,150].map((a,i)=>(
            <line key={i} x1={0} y1={0} x2={70*Math.cos(a*Math.PI/180)} y2={70*Math.sin(a*Math.PI/180)} stroke="#c0c0d0" strokeWidth={1} />
          ))}
          {[20,40,60].map((r,i)=>(
            <path key={i} d={`M${r},0 ${[0,30,60,90,120,150].map(a=>`L${r*Math.cos(a*Math.PI/180)},${r*Math.sin(a*Math.PI/180)}`).join(' ')} Z`} fill="none" stroke="#c0c0d0" strokeWidth={0.8} />
          ))}
          {/* Spider */}
          <circle cx={30} cy={35} r={5} fill="#0a0608" />
          {[-8,-4,4,8].map((dx,i)=>(
            <line key={i} x1={30+dx} y1={35} x2={30+dx*3} y2={35+10} stroke="#0a0608" strokeWidth={1} />
          ))}
        </g>
        {/* Cauldron bubbling */}
        <g transform="translate(400,410)">
          <path d="M-32,-10 Q0,10 32,-10 L28,20 Q0,30 -28,20 Z" fill="#1a1a2a" />
          <ellipse cx={0} cy={-10} rx={32} ry={12} fill="#2a2a3a" />
          <ellipse cx={0} cy={-12} rx={28} ry={9} fill="#204030" style={{ animation: 'bg-pulse-sm 1.5s ease-in-out infinite' }} />
          {/* Bubble puffs */}
          {[-10,0,10].map((x,i)=>(
            <circle key={i} cx={x} cy={-18} r={4+i%2*3} fill="#40ff80" opacity={0.4} style={{ animation: `bg-bubble ${2+i*.3}s ${i*.4}s linear infinite` }} />
          ))}
          {/* Legs */}
          <rect x={-30} y={18} width={6} height={14} rx={2} fill="#1a1a2a" />
          <rect x={-8} y={18} width={6} height={14} rx={2} fill="#1a1a2a" />
          <rect x={14} y={18} width={6} height={14} rx={2} fill="#1a1a2a" />
        </g>
      </svg>
    </>
  )
}

function Scene_diwali() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="bg-scene-svg">
      <defs>
        <radialGradient id="di2-bg" cx="50%" cy="40%"><stop offset="0%" stopColor="#0a0520" /><stop offset="100%" stopColor="#020108" /></radialGradient>
      </defs>
      <rect width={800} height={450} fill="url(#di2-bg)" />
      <Stars n={60} />
      {/* FIREWORKS bursting in sequence */}
      {[{cx:150,cy:130,c1:'#ff4040',c2:'#ffaa40',d:4},{cx:400,cy:90,c1:'#ff80ff',c2:'#ffee40',d:5},{cx:650,cy:140,c1:'#40ffaa',c2:'#40aaff',d:6},{cx:280,cy:200,c1:'#ffee40',c2:'#ff8040',d:4.5},{cx:550,cy:180,c1:'#c040ff',c2:'#ff4080',d:5.5}].map((fw,i)=>(
        <g key={i}>
          {/* Burst ring */}
          <circle cx={fw.cx} cy={fw.cy} r={0} fill={fw.c1} opacity={0.7} style={{ animation: `bg-burst ${fw.d}s ${i*.9}s ease-out infinite` }} />
          {/* Spark lines */}
          {[0,30,60,90,120,150,180,210,240,270,300,330].map((a,j)=>(
            <line key={j}
              x1={fw.cx+8*Math.cos(a*Math.PI/180)} y1={fw.cy+8*Math.sin(a*Math.PI/180)}
              x2={fw.cx+55*Math.cos(a*Math.PI/180)} y2={fw.cy+55*Math.sin(a*Math.PI/180)}
              stroke={j%2===0?fw.c1:fw.c2} strokeWidth={2} strokeLinecap="round"
              strokeDasharray="50 50" style={{ animation: `bg-spark-fly ${fw.d}s ${i*.9}s ease-out infinite` }} />
          ))}
          {/* Center flash */}
          <circle cx={fw.cx} cy={fw.cy} r={12} fill="white" opacity={0} style={{ animation: `bg-burst-sm ${fw.d}s ${i*.9}s ease-out infinite` }} />
        </g>
      ))}
      {/* Diyas (oil lamps) row */}
      {[80,180,280,380,480,580,680].map((x,i)=>(
        <g key={i} transform={`translate(${x},450)`}>
          <g style={{ animation: `bg-diya-glow ${2+i*.2}s ${i*.15}s ease-in-out infinite` }}>
          {/* Diya base */}
          <ellipse cx={0} cy={0} rx={20} ry={10} fill="#cc6620" />
          <path d="M-18,-5 Q0,-18 18,-5 Q18,2 0,8 Q-18,2 -18,-5Z" fill="#dd7730" />
          {/* Flame */}
          <ellipse cx={0} cy={-18} rx={5} ry={10} fill="#ffee40" style={{ animation: 'bg-flicker 0.8s ease-in-out infinite' }} />
          <ellipse cx={0} cy={-22} rx={3} ry={7} fill="#ff8800" style={{ animation: 'bg-flicker 0.8s 0.2s ease-in-out infinite' }} />
          <ellipse cx={0} cy={-25} rx={1.5} ry={4} fill="#ffffff" opacity={0.6} />
          {/* Glow */}
          <ellipse cx={0} cy={-10} rx={15} ry={12} fill="#ff8800" opacity={0.12} style={{ animation: 'bg-pulse 2s ease-in-out infinite' }} />
          </g>
        </g>
      ))}
      {/* Floating lanterns */}
      {[{x:200,y:400,c:'#ff8040'},{x:450,y:380,c:'#ffee40'},{x:680,y:410,c:'#ff4080'}].map((l,i)=>(
        <g key={i} style={{ animation: `bg-lantern-rise ${8+i*2}s ${i*3}s ease-in-out infinite` }}>
          <rect x={l.x-14} y={l.y-22} width={28} height={38} rx={10} fill={l.c} opacity={0.7} />
          <ellipse cx={l.x} cy={l.y-22} rx={14} ry={6} fill={l.c} opacity={0.5} />
          <ellipse cx={l.x} cy={l.y+16} rx={14} ry={6} fill={l.c} opacity={0.5} />
          <circle cx={l.x} cy={l.y-3} r={6} fill="rgba(255,255,200,.6)" />
          <line x1={l.x} y1={l.y-28} x2={l.x} y2={l.y-38} stroke={l.c} strokeWidth={1.5} />
        </g>
      ))}
      {/* Rangoli pattern on ground */}
      <g transform="translate(400,430)" opacity={0.7}>
        {/* Petals */}
        {[0,45,90,135,180,225,270,315].map((a,i)=>(
          <ellipse key={i} cx={30*Math.cos(a*Math.PI/180)} cy={30*Math.sin(a*Math.PI/180)} rx={14} ry={7}
            fill={['#ff4080','#ffee40','#40c0ff','#ff8040','#ff4080','#ffee40','#40c0ff','#ff8040'][i]}
            opacity={0.85} transform={`rotate(${a},${30*Math.cos(a*Math.PI/180)},${30*Math.sin(a*Math.PI/180)})`} />
        ))}
        {/* Inner ring */}
        {[0,60,120,180,240,300].map((a,i)=>(
          <circle key={i} cx={16*Math.cos(a*Math.PI/180)} cy={16*Math.sin(a*Math.PI/180)} r={5}
            fill={['#ff4040','#ffee40','#40ff80','#40c0ff','#c040ff','#ff8040'][i]} opacity={0.9}
            style={{ animation: `bg-glow ${2+i*.3}s ${i*.2}s ease-in-out infinite` }} />
        ))}
        {/* Center */}
        <circle cx={0} cy={0} r={7} fill="#ffee40" style={{ animation: 'bg-pulse 2s ease-in-out infinite' }} />
      </g>
    </svg>
  )
}

function Scene_hotcocoa() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="bg-scene-svg">
      <defs>
        <linearGradient id="hc-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#060410" /><stop offset="100%" stopColor="#0a0818" /></linearGradient>
      </defs>
      <rect width={800} height={450} fill="url(#hc-bg)" />
      <Stars n={40} />
      <Snowflakes n={14} />
      {/* Cozy cabin */}
      <g>
        {/* Body */}
        <rect x={220} y={270} width={360} height={230} rx={6} fill="#3a1c0a" />
        {/* Roof */}
        <polygon points="190,270 400,140 610,270" fill="#2a1008" />
        {/* Snow on roof */}
        <polygon points="190,270 400,140 610,270" fill="white" opacity={0.85} clipPath="url(#snow-cap)" />
        <clipPath id="snow-cap"><rect x={190} y={140} width={420} height={30} /></clipPath>
        <polygon points="190,270 400,140 610,270" fill="white" opacity={0.25} clipPath="url(#snow-cap2)" />
        <clipPath id="snow-cap2"><rect x={190} y={170} width={420} height={20} /></clipPath>
        {/* Chimney */}
        <rect x={480} y={160} width={40} height={85} fill="#2a1008" />
        {/* Chimney smoke — puffs rising straight up */}
        {[0,1,2].map(i=>(
          <ellipse key={i} cx={500} cy={150-i*28} rx={10+i*5} ry={9+i*4} fill="rgba(200,200,220,.38)"
            style={{ animation: `bg-steam ${3+i*.6}s ${i*.5}s ease-in-out infinite` }} />
        ))}
        {/* Glowing window — warm orange light */}
        <rect x={250} y={300} width={120} height={100} rx={6} fill="#ff9920" opacity={0.6} style={{ animation: 'bg-glow 3s ease-in-out infinite' }} />
        <rect x={310} y={300} width={6} height={100} fill="#2a1008" />
        <rect x={250} y={348} width={120} height={6} fill="#2a1008" />
        {/* Visible fireplace glow through window */}
        <rect x={255} y={340} width={108} height={55} rx={3} fill="#ff6600" opacity={0.2} style={{ animation: 'bg-glow 2s ease-in-out infinite' }} />
        {/* Door */}
        <rect x={380} y={380} width={70} height={120} rx={6} fill="#1e0c04" />
        <circle cx={444} cy={440} r={5} fill="#cc8820" />
        {/* Right window */}
        <rect x={430} y={300} width={110} height={90} rx={6} fill="#ff9920" opacity={0.5} style={{ animation: 'bg-glow 3s 0.5s ease-in-out infinite' }} />
      </g>
      {/* Big mug */}
      <g transform="translate(680,380)"><g style={{ animation: 'bg-float-sm 4s ease-in-out infinite' }}>
        <path d="M-30,-40 L-30,30 Q-30,50 0,50 Q30,50 30,30 L30,-40Z" fill="#6a3010" />
        <rect x={-32} y={-42} width={64} height={8} rx={4} fill="#7a3a12" />
        <path d="M32,-15 Q55,-15 55,10 Q55,35 32,35" stroke="#7a3a12" strokeWidth={10} fill="none" strokeLinecap="round" />
        <ellipse cx={0} cy={-40} rx={30} ry={10} fill="#c87a30" opacity={0.8} /> {/* cocoa surface */}
        {/* Whipped cream */}
        <ellipse cx={0} cy={-44} rx={22} ry={12} fill="white" opacity={0.9} />
        <ellipse cx={0} cy={-50} rx={15} ry={9} fill="white" opacity={0.85} />
        <ellipse cx={0} cy={-56} rx={9} ry={6} fill="white" opacity={0.8} />
        {/* Steam */}
        {[-10,0,10].map((dx,i)=>(
          <path key={i} d={`M${dx},-65 Q${dx+6},${-80-i*5} ${dx},${-95-i*5}`} stroke="rgba(255,255,255,.4)" strokeWidth={3} fill="none" strokeLinecap="round" style={{ animation: `bg-steam ${2+i*.4}s ${i*.3}s ease-in-out infinite` }} />
        ))}
        {/* Marshmallow */}
        <rect x={5} y={-52} width={14} height={10} rx={4} fill="white" opacity={0.8} style={{ animation: 'bg-float-sm 3s ease-in-out infinite' }} />
      </g>
      </g>
      {/* Snow on ground */}
      <ellipse cx={400} cy={440} rx={500} ry={45} fill="white" opacity={0.25} />
      <ellipse cx={400} cy={446} rx={600} ry={35} fill="white" opacity={0.15} />
    </svg>
  )
}

function Scene_christmas() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="bg-scene-svg">
      <defs>
        <linearGradient id="ch-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#010310" /><stop offset="100%" stopColor="#041220" /></linearGradient>
        <radialGradient id="ch-moon" cx="50%" cy="50%"><stop offset="0%" stopColor="#fffde8" /><stop offset="100%" stopColor="#e8e0c8" /></radialGradient>
        <radialGradient id="ch-snow" cx="50%" cy="0%"><stop offset="0%" stopColor="#ddeeff" stopOpacity={0.35}/><stop offset="100%" stopColor="#ddeeff" stopOpacity={0}/></radialGradient>
      </defs>
      <rect width={800} height={450} fill="url(#ch-bg)" />
      <Stars n={80} />

      {/* Big full moon */}
      <circle cx={400} cy={130} r={72} fill="url(#ch-moon)" style={{ animation: 'bg-glow 8s ease-in-out infinite' }} />
      <circle cx={400} cy={130} r={72} fill="none" stroke="rgba(255,250,220,0.15)" strokeWidth={10} />

      {/* SANTA SLEIGH + REINDEER flying across the moon */}
      <g transform="translate(0,128)">
      <g style={{ animation: 'bg-drift-lr 18s 1s ease-in-out infinite normal backwards' }}>
        {/* Reindeer (8 + Rudolph) left to right, connected by harness */}
        {[0,1,2,3,4,5,6,7].map(i => {
          const rx = -280 + i * 38
          return (
            <g key={i} transform={`translate(${rx},0)`}>
              {/* Body */}
              <ellipse cx={0} cy={2} rx={14} ry={8} fill="#2a1a08" />
              {/* Head */}
              <circle cx={-11} cy={-6} r={7} fill="#2a1a08" />
              {/* Antler left */}
              <path d="M-16,-10 L-22,-22 M-22,-22 L-26,-28 M-22,-22 L-18,-28" stroke="#2a1a08" strokeWidth={1.5} fill="none" />
              {/* Antler right */}
              <path d="M-9,-11 L-12,-22 M-12,-22 L-15,-28 M-12,-22 L-9,-28" stroke="#2a1a08" strokeWidth={1.5} fill="none" />
              {/* Legs */}
              <line x1={-6} y1={8} x2={-8} y2={18} stroke="#2a1a08" strokeWidth={2} />
              <line x1={2} y1={8} x2={4} y2={18} stroke="#2a1a08" strokeWidth={2} />
              {/* Rudolph nose */}
              {i===0 && <circle cx={-17} cy={-5} r={4} fill="#ff2222" style={{ animation: 'bg-glow-fast 0.9s ease-in-out infinite' }} />}
              {/* Harness line to next */}
              {i < 7 && <line x1={14} y1={0} x2={26} y2={-2} stroke="#886644" strokeWidth={1.5} />}
            </g>
          )
        })}
        {/* Harness from last reindeer to sleigh */}
        <line x1={20} y1={-2} x2={50} y2={-4} stroke="#886644" strokeWidth={1.5} />
        {/* Sleigh body */}
        <path d="M48,-10 Q80,-22 110,-14 Q125,-10 130,2 L120,14 Q90,20 58,12 Z" fill="#cc1111" />
        {/* Sleigh runner */}
        <path d="M58,14 Q90,24 120,16" stroke="#880000" strokeWidth={3} fill="none" />
        <path d="M52,12 Q45,20 55,22" stroke="#880000" strokeWidth={3} fill="none" />
        <path d="M120,14 Q132,8 138,18" stroke="#880000" strokeWidth={3} fill="none" />
        {/* Gold trim */}
        <path d="M48,-10 Q80,-22 110,-14" stroke="#ffcc00" strokeWidth={2} fill="none" opacity={0.8} />
        {/* Gift sack */}
        <ellipse cx={78} cy={-20} rx={18} ry={20} fill="#881111" />
        <path d="M66,-38 Q78,-44 90,-38" stroke="#cc3333" strokeWidth={3} fill="none" />
        {/* Santa body */}
        <ellipse cx={102} cy={-12} rx={14} ry={16} fill="#cc1111" />
        {/* Santa coat white trim */}
        <ellipse cx={102} cy={2} rx={15} ry={5} fill="rgba(255,255,255,0.7)" />
        {/* Santa head */}
        <circle cx={102} cy={-30} r={11} fill="#f5c499" />
        {/* Beard */}
        <ellipse cx={102} cy={-22} rx={10} ry={7} fill="white" opacity={0.9} />
        {/* Hat */}
        <rect x={92} y={-48} width={20} height={18} rx={3} fill="#cc1111" />
        <ellipse cx={102} cy={-44} rx={12} ry={4} fill="white" />
        <ellipse cx={111} cy={-48} rx={4} ry={4} fill="white" />
        {/* Arm waving */}
        <line x1={115} y1={-20} x2={128} y2={-32} stroke="#cc1111" strokeWidth={6} strokeLinecap="round" />
        <circle cx={130} cy={-34} r={5} fill="#f5c499" />
      </g>
      </g>

      {/* Snowy ground */}
      <ellipse cx={400} cy={448} rx={600} ry={60} fill="url(#ch-snow)" />
      <path d="M0,410 Q100,390 200,405 Q300,420 400,400 Q500,380 600,400 Q700,420 800,405 L800,450 L0,450Z" fill="rgba(200,225,255,0.18)" />

      {/* Cozy house with chimney — left side */}
      <g transform="translate(100,380)">
        {/* House body */}
        <rect x={-45} y={-60} width={90} height={70} rx={3} fill="#0d1a2a" />
        {/* Roof */}
        <polygon points="-55,-60 0,-110 55,-60" fill="#081218" />
        {/* Snow on roof */}
        <polygon points="-55,-60 0,-110 55,-60 45,-60 0,-95 -45,-60" fill="rgba(220,235,255,0.35)" />
        {/* Door */}
        <rect x={-10} y={-20} width={20} height={30} rx={3} fill="#ff9944" opacity={0.4} style={{ animation: 'bg-glow 4s ease-in-out infinite' }} />
        {/* Windows glowing warm */}
        <rect x={-38} y={-50} width={22} height={18} rx={3} fill="#ffcc66" opacity={0.5} style={{ animation: 'bg-glow 5s ease-in-out infinite' }} />
        <rect x={18} y={-50} width={22} height={18} rx={3} fill="#ffcc66" opacity={0.5} style={{ animation: 'bg-glow 5s 0.5s ease-in-out infinite' }} />
        {/* Chimney */}
        <rect x={20} y={-130} width={16} height={55} fill="#060e1a" />
        {/* Smoke puffs */}
        {[0,1,2].map(k => (
          <ellipse key={k} cx={28} cy={-138-k*22} rx={8+k*4} ry={7+k*3} fill="rgba(180,190,210,0.35)"
            style={{ animation: `bg-steam ${3+k}s ${k*0.8}s ease-in-out infinite` }} />
        ))}
      </g>

      {/* Big Christmas tree — centre */}
      <g transform="translate(400,380)">
        <polygon points="0,-200 -55,-95 55,-95" fill="#0a5c1e" />
        <polygon points="0,-130 -70,-28 70,-28" fill="#0d7224" />
        <polygon points="0,-55 -88,35 88,35" fill="#0f8228" />
        <rect x={-14} y={35} width={28} height={32} rx={4} fill="#6a3010" />
        {/* Twinkling lights */}
        {[{x:-35,y:-110,c:'#ff4040'},{x:22,y:-88,c:'#ffee40'},{x:-44,y:-48,c:'#4488ff'},{x:35,y:-28,c:'#ff44cc'},{x:-22,y:14,c:'#44ffaa'},{x:52,y:-62,c:'#ff8040'},{x:-55,y:-72,c:'#44eeff'},{x:0,y:-165,c:'#ffee40'},{x:42,y:-105,c:'#ff4040'},{x:-28,y:-20,c:'#ffee40'}].map((l,i)=>(
          <circle key={i} cx={l.x} cy={l.y} r={5.5} fill={l.c} style={{ animation: `bg-twinkle ${0.8+i*.25}s ${i*.18}s ease-in-out infinite` }} />
        ))}
        {/* Star on top */}
        <text x={-13} y={-205} fontSize={26} fill="#ffee40" style={{ animation: 'bg-glow 1.8s ease-in-out infinite' }}>★</text>
      </g>

      {/* SNOWMAN — right side */}
      <g transform="translate(650,340)">
        {/* Base ball */}
        <circle cx={0} cy={60} r={44} fill="rgba(220,238,255,0.75)" />
        {/* Middle ball */}
        <circle cx={0} cy={14} r={32} fill="rgba(225,240,255,0.78)" />
        {/* Head */}
        <circle cx={0} cy={-22} r={22} fill="rgba(230,242,255,0.80)" />
        {/* Eyes */}
        <circle cx={-8} cy={-28} r={3.5} fill="#1a1a2a" />
        <circle cx={8} cy={-28} r={3.5} fill="#1a1a2a" />
        {/* Carrot nose */}
        <polygon points="0,-22 18,-20 0,-18" fill="#ff7722" />
        {/* Coal mouth smile */}
        {[-10,-5,0,5,10].map((dx,i)=>(
          <circle key={i} cx={dx} cy={-13+Math.abs(dx)*0.4} r={2} fill="#1a1a2a" />
        ))}
        {/* Scarf */}
        <path d="M-30,-4 Q0,-10 30,-4 Q32,4 30,8 Q0,2 -30,8 Q-32,4 -30,-4Z" fill="#cc2222" opacity={0.9} />
        <rect x={20} y={-2} width={14} height={22} rx={4} fill="#cc2222" opacity={0.9} />
        {/* Buttons */}
        <circle cx={0} cy={22} r={3} fill="#1a1a2a" />
        <circle cx={0} cy={34} r={3} fill="#1a1a2a" />
        <circle cx={0} cy={46} r={3} fill="#1a1a2a" />
        {/* Stick arms */}
        <line x1={-32} y1={14} x2={-58} y2={-4} stroke="#5a3010" strokeWidth={4} strokeLinecap="round" />
        <line x1={-58} y1={-4} x2={-66} y2={-14} stroke="#5a3010" strokeWidth={2.5} strokeLinecap="round" />
        <line x1={-58} y1={-4} x2={-68} y2={0} stroke="#5a3010" strokeWidth={2.5} strokeLinecap="round" />
        <line x1={32} y1={14} x2={58} y2={-4} stroke="#5a3010" strokeWidth={4} strokeLinecap="round" />
        <line x1={58} y1={-4} x2={66} y2={-14} stroke="#5a3010" strokeWidth={2.5} strokeLinecap="round" />
        <line x1={58} y1={-4} x2={68} y2={0} stroke="#5a3010" strokeWidth={2.5} strokeLinecap="round" />
        {/* Top hat */}
        <rect x={-26} y={-50} width={52} height={8} rx={4} fill="#0d0d18" />
        <rect x={-18} y={-82} width={36} height={34} rx={3} fill="#0d0d18" />
        {/* Hat band */}
        <rect x={-18} y={-54} width={36} height={6} fill="#cc2222" />
      </g>

      <Snowflakes n={22} />
      {/* Gift boxes under tree */}
      {[{x:340,y:420,c:'#cc2222',rc:'#ffee40'},{x:365,y:422,c:'#22aa44',rc:'#ff4080'},{x:388,y:425,c:'#2244cc',rc:'#ffee40'},{x:412,y:423,c:'#cc6622',rc:'#40ccff'}].map((g,i)=>(
        <g key={i} transform={`translate(${g.x},${g.y})`}>
          <g style={{ animation: `bg-glow ${3+i*.5}s ${i*.3}s ease-in-out infinite` }}>
            <rect x={-12} y={-18} width={24} height={22} rx={2} fill={g.c} />
            {/* Ribbon horizontal */}
            <rect x={-12} y={-10} width={24} height={4} fill={g.rc} opacity={0.85} />
            {/* Ribbon vertical */}
            <rect x={-3} y={-18} width={6} height={22} fill={g.rc} opacity={0.85} />
            {/* Bow */}
            <ellipse cx={-5} cy={-19} rx={5} ry={3} fill={g.rc} opacity={0.9} transform="rotate(-30,-5,-19)" />
            <ellipse cx={5} cy={-19} rx={5} ry={3} fill={g.rc} opacity={0.9} transform="rotate(30,5,-19)" />
          </g>
        </g>
      ))}
    </svg>
  )
}

function Scene_frozen() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="bg-scene-svg">
      <defs>
        <linearGradient id="fr2-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#020610" /><stop offset="100%" stopColor="#041018" /></linearGradient>
        <linearGradient id="ice-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#88ccff" stopOpacity={0.4} /><stop offset="100%" stopColor="#88ccff" stopOpacity={0} /></linearGradient>
        <filter id="aur-blur" x="-5%" y="-5%" width="110%" height="115%"><feGaussianBlur stdDeviation="9 4" /></filter>
        <linearGradient id="aur-col" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00ff44" stopOpacity={0} /><stop offset="100%" stopColor="#00ff44" stopOpacity={0.88} /></linearGradient>
        <linearGradient id="aur-pur" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#cc44ff" stopOpacity={0} /><stop offset="100%" stopColor="#cc44ff" stopOpacity={0.55} /></linearGradient>
      </defs>
      <rect width={800} height={450} fill="url(#fr2-bg)" />
      <Stars n={80} color="#c0e0ff" />
      {/* AURORA BOREALIS — blur-blended curtain */}
      {/* Green curtain: blurred overlapping columns → they merge into soft continuous glow */}
      <g filter="url(#aur-blur)" style={{ animation: 'aur-sway 7s ease-in-out infinite' }}>
        {[...Array(24)].map((_,i)=>{
          const x = i * 35;
          const arch = 1 - Math.pow((x - 390) / 430, 2) * 0.5;
          const h = (145 + Math.sin(i*1.1)*42 + Math.cos(i*0.65)*28) * arch;
          const baseY = 235;
          return <rect key={i} x={x-4} y={baseY - Math.max(h,30)} width={36} height={Math.max(h,30)}
            fill="url(#aur-col)" opacity={0.75} />;
        })}
      </g>
      {/* Purple fringe at the crown — separate blurred group offset higher */}
      <g filter="url(#aur-blur)" style={{ animation: 'aur-sway2 9s ease-in-out infinite' }}>
        {[...Array(16)].map((_,i)=>{
          const x = i * 53 + 10;
          const h = 75 + Math.sin(i*1.4)*32 + Math.cos(i*0.9)*18;
          const baseY = 192;
          return <rect key={i} x={x-4} y={baseY - Math.max(h,20)} width={38} height={Math.max(h,20)}
            fill="url(#aur-pur)" opacity={0.6} />;
        })}
      </g>
      {/* Ice palace */}
      <g>
        {/* Main structure */}
        <polygon points="280,500 280,280 400,180 520,280 520,500" fill="#0a2040" opacity={0.9} />
        {/* Central spire */}
        <polygon points="380,280 400,180 420,280" fill="#0a1830" />
        <polygon points="390,195 400,150 410,195" fill="#081224" />
        {/* Side towers */}
        {[{x:280,h:200},{x:520,h:200}].map((t,i)=>(
          <g key={i}>
            <rect x={t.x-20} y={500-t.h} width={40} height={t.h} fill="#081828" />
            <polygon points={`${t.x-22},${500-t.h} ${t.x},${500-t.h-45} ${t.x+22},${500-t.h}`} fill="#060c16" />
          </g>
        ))}
        {/* Icicles hanging */}
        {[295,315,340,360,385,405,425,445,465,490,510].map((x,i)=>(
          <polygon key={i} points={`${x},250 ${x-6},250 ${x-3},${270+i%3*12}`} fill="#88ccff" opacity={0.5} style={{ animation: `bg-twinkle ${3+i*.4}s ${i*.2}s ease-in-out infinite` }} />
        ))}
        {/* Ice windows */}
        {[{x:305,y:320},{x:345,y:320},{x:450,y:320},{x:490,y:320}].map((w,i)=>(
          <rect key={i} x={w.x} y={w.y} width={22} height={30} rx={11} fill="#88ccff" opacity={0.2} style={{ animation: `bg-twinkle ${4+i}s ease-in-out infinite` }} />
        ))}
      </g>
      {/* Snow ground */}
      <ellipse cx={400} cy={445} rx={550} ry={50} fill="white" opacity={0.12} />
      {/* Ice skater */}
      <g transform="translate(195,428)">
        {/* Ice shadow */}
        <ellipse cx={8} cy={0} rx={28} ry={5} fill="rgba(160,210,255,0.22)" />
        {/* Standing leg — foot on ice, goes up to hip */}
        <line x1={6} y1={0} x2={4} y2={-50} stroke="#b0c8e8" strokeWidth={10} strokeLinecap="round" />
        {/* Standing skate boot */}
        <ellipse cx={7} cy={0} rx={13} ry={5} fill="#c4d8f0" />
        <line x1={-4} y1={2} x2={20} y2={2} stroke="#8aaace" strokeWidth={2} strokeLinecap="round" />
        {/* Extended leg — trails behind at an upward angle from the hip */}
        <line x1={4} y1={-50} x2={-34} y2={-22} stroke="#b0c8e8" strokeWidth={9} strokeLinecap="round" />
        {/* Back skate boot */}
        <ellipse cx={-37} cy={-22} rx={12} ry={5} fill="#c4d8f0" />
        <line x1={-48} y1={-20} x2={-26} y2={-20} stroke="#8aaace" strokeWidth={2} strokeLinecap="round" />
        {/* Flowing skirt — sits at hip level covering upper legs */}
        <path d="M-16,-54 Q-34,-42 -36,-22 Q-14,-14 8,-14 Q28,-14 30,-34 Q24,-50 12,-54Z" fill="#7ab8ee" opacity={0.92} />
        {/* Bodice */}
        <rect x={-10} y={-84} width={22} height={32} rx={5} fill="#a0ccf0" />
        {/* Left arm outstretched */}
        <line x1={-10} y1={-74} x2={-40} y2={-60} stroke="#f0d4b4" strokeWidth={7} strokeLinecap="round" />
        {/* Right arm outstretched */}
        <line x1={12} y1={-74} x2={42} y2={-60} stroke="#f0d4b4" strokeWidth={7} strokeLinecap="round" />
        {/* Head */}
        <circle cx={2} cy={-100} r={16} fill="#f0d0b0" />
        {/* Hair streaming back */}
        <path d="M-14,-108 Q2,-120 18,-108 L20,-96 Q10,-100 -12,-100Z" fill="#f0c030" />
        <path d="M18,-108 Q32,-98 28,-86" stroke="#f0c030" strokeWidth={5} fill="none" strokeLinecap="round" />
        {/* Eyes */}
        <circle cx={-3} cy={-101} r={2} fill="#333" /><circle cx={7} cy={-101} r={2} fill="#333" />
        <circle cx={-2} cy={-102} r={1} fill="white" /><circle cx={8} cy={-102} r={1} fill="white" />
        {/* Smile */}
        <path d="M-3,-94 Q2,-90 7,-94" stroke="#a0522d" strokeWidth={1.5} fill="none" />
      </g>
      <Snowflakes n={16} />
    </svg>
  )
}

function Scene_sky() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="bg-scene-svg">
      <defs>
        {/* Sky — deep azure at top, hazy pale blue at horizon */}
        <linearGradient id="sky-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a5ab0"/>
          <stop offset="55%" stopColor="#2e8fd8"/>
          <stop offset="100%" stopColor="#a8d8f8"/>
        </linearGradient>
        {/* Sun radial glow */}
        <radialGradient id="sky-sun" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#fff8c0"/>
          <stop offset="35%" stopColor="#ffe840"/>
          <stop offset="70%" stopColor="#ffcc20" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#ffaa00" stopOpacity="0"/>
        </radialGradient>
        {/* Hazy horizon */}
        <linearGradient id="sky-haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c8e8ff" stopOpacity="0"/>
          <stop offset="100%" stopColor="#d8eeff" stopOpacity="0.55"/>
        </linearGradient>
        {/* Balloon clip paths */}
        <clipPath id="sky-bal0"><ellipse cx={160} cy={200} rx={44} ry={58}/></clipPath>
        <clipPath id="sky-bal1"><ellipse cx={400} cy={160} rx={50} ry={64}/></clipPath>
        <clipPath id="sky-bal2"><ellipse cx={620} cy={230} rx={40} ry={52}/></clipPath>
      </defs>

      <rect width={800} height={450} fill="url(#sky-bg)" />
      {/* Haze at horizon */}
      <rect x={0} y={300} width={800} height={150} fill="url(#sky-haze)"/>

      {/* Rolling green meadow at bottom */}
      <path d="M0,400 Q120,370 240,390 Q360,410 480,378 Q600,346 720,380 Q760,392 800,375 L800,450 L0,450Z" fill="#4a9830"/>
      <path d="M0,420 Q200,400 400,415 Q600,430 800,410 L800,450 L0,450Z" fill="#3a7828"/>

      {/* Sun with realistic glow rays */}
      <circle cx={90} cy={80} r={90} fill="url(#sky-sun)" opacity={0.6}/>
      <circle cx={90} cy={80} r={48} fill="#ffe840" style={{ animation: 'bg-pulse-sm 5s ease-in-out infinite' }}/>
      <circle cx={90} cy={80} r={38} fill="#fff5a0" opacity={0.8}/>
      {/* Sun rays */}
      {Array.from({length:12},(_,i)=>{
        const a=i*30*(Math.PI/180), r1=52, r2=72+i%3*8;
        return <line key={i} x1={90+r1*Math.cos(a)} y1={80+r1*Math.sin(a)} x2={90+r2*Math.cos(a)} y2={80+r2*Math.sin(a)} stroke="#ffe040" strokeWidth={i%2===0?3:1.5} opacity={0.55} strokeLinecap="round"/>;
      })}

      {/* Large background cumulonimbus clouds */}
      <CloudShape x={500} y={60} w={280} fill="white" opacity={0.45} style={{ animation: 'bg-cloud-drift 14s ease-in-out infinite alternate-reverse' }}/>

      {/* Hot air balloon 1 — red & gold */}
      <g style={{ animation: 'bg-float 7s ease-in-out infinite' }}>
        <ellipse cx={160} cy={200} rx={44} ry={58} fill="#e82020"/>
        {/* 6 vertical panels alternating */}
        {[-28,-14,0,14,28].map((dx,j)=>(
          <rect key={j} x={160+dx-7} y={142} width={14} height={116} fill={j%2===0?'#ffe030':'#e82020'} opacity={0.75} clipPath="url(#sky-bal0)"/>
        ))}
        <ellipse cx={160} cy={145} rx={44} ry={14} fill="#cc1810" opacity={0.5}/>
        <ellipse cx={160} cy={254} rx={40} ry={10} fill="#cc1810" opacity={0.4}/>
        {/* Ropes */}
        <line x1={138} y1={256} x2={128} y2={274} stroke="#7a4010" strokeWidth={1.5}/>
        <line x1={182} y1={256} x2={192} y2={274} stroke="#7a4010" strokeWidth={1.5}/>
        <line x1={152} y1={258} x2={148} y2={274} stroke="#7a4010" strokeWidth={1.2}/>
        <line x1={168} y1={258} x2={172} y2={274} stroke="#7a4010" strokeWidth={1.2}/>
        {/* Wicker basket */}
        <rect x={128} y={274} width={64} height={30} rx={6} fill="#a06820"/>
        <line x1={140} y1={274} x2={140} y2={304} stroke="#7a4a10" strokeWidth={1.5} opacity={0.6}/>
        <line x1={155} y1={274} x2={155} y2={304} stroke="#7a4a10" strokeWidth={1.5} opacity={0.6}/>
        <line x1={170} y1={274} x2={170} y2={304} stroke="#7a4a10" strokeWidth={1.5} opacity={0.6}/>
        <line x1={185} y1={274} x2={185} y2={304} stroke="#7a4a10" strokeWidth={1.5} opacity={0.6}/>
        {/* Passenger silhouette */}
        <circle cx={160} cy={272} r={8} fill="#2a1008"/>
        <rect x={153} y={280} width={14} height={10} rx={2} fill="#2a1008"/>
        {/* Burner glow */}
        <ellipse cx={160} cy={260} rx={8} ry={4} fill="#ff8020" opacity={0.7} style={{ animation: 'bg-glow-fast 0.6s ease-in-out infinite' }}/>
      </g>

      {/* Hot air balloon 2 — blue & pink, bigger */}
      <g style={{ animation: 'bg-float 9s 2s ease-in-out infinite' }}>
        <ellipse cx={400} cy={160} rx={50} ry={64} fill="#2060e0"/>
        {[-35,-18,0,18,35].map((dx,j)=>(
          <rect key={j} x={400+dx-9} y={96} width={18} height={128} fill={j%2===0?'#ff60d0':'#2060e0'} opacity={0.7} clipPath="url(#sky-bal1)"/>
        ))}
        <ellipse cx={400} cy={98} rx={50} ry={15} fill="#1848c0" opacity={0.45}/>
        <ellipse cx={400} cy={220} rx={46} ry={12} fill="#1848c0" opacity={0.4}/>
        <line x1={374} y1={222} x2={362} y2={242} stroke="#7a4010" strokeWidth={1.5}/>
        <line x1={426} y1={222} x2={438} y2={242} stroke="#7a4010" strokeWidth={1.5}/>
        <line x1={392} y1={224} x2={388} y2={242} stroke="#7a4010" strokeWidth={1.2}/>
        <line x1={408} y1={224} x2={412} y2={242} stroke="#7a4010" strokeWidth={1.2}/>
        <rect x={362} y={242} width={76} height={34} rx={7} fill="#b07828"/>
        {[374,390,406,422].map((lx,j)=>(
          <line key={j} x1={lx} y1={242} x2={lx} y2={276} stroke="#8a5810" strokeWidth={1.5} opacity={0.6}/>
        ))}
        <circle cx={400} cy={240} r={9} fill="#1a0808"/>
        <rect x={391} y={248} width={18} height={12} rx={2} fill="#1a0808"/>
        <circle cx={416} cy={242} r={7} fill="#1a0808"/>
        <ellipse cx={400} cy={228} rx={9} ry={5} fill="#ff8020" opacity={0.65} style={{ animation: 'bg-glow-fast 0.7s 0.2s ease-in-out infinite' }}/>
      </g>

      {/* Hot air balloon 3 — green & orange */}
      <g style={{ animation: 'bg-float 8s 4s ease-in-out infinite' }}>
        <ellipse cx={620} cy={230} rx={40} ry={52} fill="#20a040"/>
        {[-26,-12,0,12,26].map((dx,j)=>(
          <rect key={j} x={620+dx-7} y={178} width={14} height={104} fill={j%2===0?'#ff7020':'#20a040'} opacity={0.72} clipPath="url(#sky-bal2)"/>
        ))}
        <ellipse cx={620} cy={180} rx={40} ry={12} fill="#188030" opacity={0.45}/>
        <ellipse cx={620} cy={280} rx={36} ry={10} fill="#188030" opacity={0.4}/>
        <line x1={598} y1={282} x2={588} y2={298} stroke="#7a4010" strokeWidth={1.5}/>
        <line x1={642} y1={282} x2={652} y2={298} stroke="#7a4010" strokeWidth={1.5}/>
        <rect x={588} y={298} width={64} height={26} rx={5} fill="#986018"/>
        {[600,614,628,642].map((lx,j)=>(
          <line key={j} x1={lx} y1={298} x2={lx} y2={324} stroke="#785010" strokeWidth={1.4} opacity={0.6}/>
        ))}
        <circle cx={620} cy={296} r={7} fill="#1a0808"/>
        <rect x={613} y={303} width={14} height={9} rx={2} fill="#1a0808"/>
        <ellipse cx={620} cy={286} rx={7} ry={4} fill="#ff8020" opacity={0.65} style={{ animation: 'bg-glow-fast 0.65s 0.4s ease-in-out infinite' }}/>
      </g>

      {/* Foreground fluffy clouds — in front of everything */}
      <CloudShape x={240} y={105} w={210} fill="white" opacity={0.96} style={{ animation: 'bg-cloud-drift 10s ease-in-out infinite alternate' }}/>
      <CloudShape x={560} y={138} w={170} fill="white" opacity={0.88} style={{ animation: 'bg-cloud-drift 13s 1s ease-in-out infinite alternate-reverse' }}/>
      <CloudShape x={50} y={170} w={150} fill="white" opacity={0.82} style={{ animation: 'bg-cloud-drift 11s 2s ease-in-out infinite alternate' }}/>

      {/* Diamond kite with ribbon tail */}
      <g transform="translate(310,290)">
        <g style={{ animation: 'bg-float 5s 1s ease-in-out infinite' }}>
          <polygon points="0,-55 40,0 0,55 -40,0" fill="#ff3030" opacity={0.9}/>
          <polygon points="0,-55 40,0 0,0" fill="#ffe030" opacity={0.9}/>
          <polygon points="0,0 40,0 0,55" fill="#3060ff" opacity={0.9}/>
          <polygon points="0,-55 -40,0 0,0" fill="#30cc40" opacity={0.9}/>
          <line x1={0} y1={-55} x2={0} y2={55} stroke="rgba(0,0,0,.25)" strokeWidth={1.5}/>
          <line x1={-40} y1={0} x2={40} y2={0} stroke="rgba(0,0,0,.25)" strokeWidth={1.5}/>
          {/* Ribbon tail with bows */}
          <path d="M0,55 Q15,80 -5,105 Q10,130 0,158 Q12,180 -4,205" stroke="#ff8800" strokeWidth={2.5} fill="none" strokeLinecap="round"/>
          {[78,130,185].map((ty,j)=>(
            <g key={j} transform={`translate(${j%2===0?2:-4},${ty})`}>
              <ellipse cx={-5} cy={0} rx={7} ry={4} fill={['#ff4040','#40cc40','#4060ff'][j]} opacity={0.8}/>
              <ellipse cx={5} cy={0} rx={7} ry={4} fill={['#ff4040','#40cc40','#4060ff'][j]} opacity={0.8}/>
            </g>
          ))}
          {/* String to ground */}
          <path d="M0,55 Q50,140 90,240" stroke="rgba(0,0,0,.2)" strokeWidth={1} fill="none"/>
        </g>
      </g>

      {/* V-formation of birds soaring high */}
      <g style={{ animation: 'bg-drift-l 22s linear infinite normal backwards' }}>
        {[
          {x:800,y:118},{x:825,y:130},{x:775,y:130},
          {x:850,y:145},{x:750,y:145},{x:875,y:162},{x:725,y:162},
        ].map((b,i)=>(
          <path key={i} d={`M${b.x},${b.y} Q${b.x+9},${b.y-8} ${b.x+18},${b.y} Q${b.x+27},${b.y-8} ${b.x+36},${b.y}`}
            stroke="#0a3870" strokeWidth={i===0?2.5:2} fill="none" opacity={0.75}/>
        ))}
      </g>

      {/* Biplane — proper side view, nose left, drifts right-to-left */}
      <g style={{ animation: 'bg-drift-l 38s 8s linear infinite normal backwards' }}>
        <g transform="translate(0,295)">
          {/* Contrail behind tail (right side) */}
          <path d="M72,2 Q130,8 210,14" stroke="white" strokeWidth={4} fill="none" opacity={0.4} strokeLinecap="round"/>
          <path d="M72,4 Q140,12 230,20" stroke="white" strokeWidth={2} fill="none" opacity={0.2} strokeLinecap="round"/>
          {/* Fuselage — long streamlined body, dominant shape */}
          <path d="M-68,0 Q-52,-12 -10,-9 Q18,-7 52,-3 Q66,0 72,2 Q66,5 52,6 Q18,10 -10,12 Q-52,14 -68,0Z" fill="#e03020"/>
          {/* Upper wing — edge-on = very thin, clearly above fuselage */}
          <rect x={-18} y={-26} width={68} height={4} rx={2} fill="#f04030"/>
          {/* Lower wing — edge-on, below fuselage belly */}
          <rect x={-10} y={12} width={56} height={3} rx={1.5} fill="#f04030"/>
          {/* Vertical struts connecting wings */}
          <line x1={2} y1={-22} x2={2} y2={12} stroke="#c01808" strokeWidth={2.5} strokeLinecap="round"/>
          <line x1={32} y1={-22} x2={32} y2={12} stroke="#c01808" strokeWidth={2.5} strokeLinecap="round"/>
          {/* Tail — vertical fin pointing UP */}
          <path d="M62,0 L74,-28 L76,0Z" fill="#c01808"/>
          {/* Tail horizontal stabilizer — both sides */}
          <rect x={62} y={3} width={20} height={4} rx={2} fill="#c01808"/>
          {/* Engine cowl at nose */}
          <circle cx={-68} cy={0} r={14} fill="#901008"/>
          <circle cx={-68} cy={0} r={8} fill="#6a0808"/>
          {/* Propeller — spinning vertical disc at very nose tip */}
          <ellipse cx={-80} cy={0} rx={2.5} ry={24} fill="#5a2808" opacity={0.5} style={{ animation: 'bg-spin 0.08s linear infinite' }}/>
          {/* Cockpit bubble on TOP of fuselage */}
          <path d="M-2,-9 Q10,-24 28,-20 Q36,-12 28,-9Z" fill="#50b8f0" opacity={0.9}/>
          {/* Pilot head visible inside cockpit */}
          <circle cx={14} cy={-18} r={6} fill="#2a1008"/>
          <circle cx={14} cy={-18} r={3.5} fill="#3a1808"/>
        </g>
      </g>
    </svg>
  )
}

function Scene_rainbow() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="bg-scene-svg">
      <defs>
        <linearGradient id="rb-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#b0d8ff" /><stop offset="100%" stopColor="#e0f0ff" /></linearGradient>
      </defs>
      <rect width={800} height={450} fill="url(#rb-bg)" />
      {/* BOLD rainbow arcs */}
      {['#ff3030','#ff8800','#ffee00','#30c030','#3060ff','#9030ff'].map((c,i)=>(
        <ellipse key={i} cx={400} cy={500} rx={440-i*32} ry={360-i*26} fill="none" stroke={c} strokeWidth={22} opacity={0.65} style={{ animation: `bg-pulse-sm ${4+i*.5}s ${i*.2}s ease-in-out infinite` }} />
      ))}
      {/* Fluffy clouds at ends */}
      <CloudShape x={80}  y={370} w={200} fill="white" opacity={0.9} />
      <CloudShape x={720} y={370} w={200} fill="white" opacity={0.9} />
      {/* Prism shapes */}
      {[{x:200,y:200},{x:550,y:180},{x:380,y:100}].map((p,i)=>(
        <polygon key={i} points={`${p.x},${p.y} ${p.x-20},${p.y+40} ${p.x+20},${p.y+40}`} fill="rgba(255,255,255,.6)" style={{ animation: `bg-twinkle ${2+i}s ${i*.4}s ease-in-out infinite` }} />
      ))}
      {/* Color bubbles */}
      {Array.from({length:14},(_,i)=>(
        <g key={i} style={{ animation: `bg-bubble ${4+i*.35}s ${i*.3}s linear infinite` }}>
          <circle cx={(i*113+50)%800} cy={430} r={10+i%5*6} fill="none" stroke={['#ff4040','#ff8800','#ffee00','#30c030','#3060ff'][i%5]} strokeWidth={2} opacity={0.45} />
          <ellipse cx={(i*113+55)%800-5} cy={480-7} rx={5} ry={3} fill="white" opacity={0.35} />
        </g>
      ))}
      {/* Sun peeking */}
      <circle cx={400} cy={75} r={45} fill="#FFD030" opacity={0.7} style={{ animation: 'bg-pulse 6s ease-in-out infinite' }} />
      {/* Pot of gold at rainbow end */}
      <g transform="translate(80,380)">
        <g style={{ animation: 'bg-glow 3s ease-in-out infinite' }}>
          {/* Pot */}
          <path d="M-28,0 Q-30,30 0,35 Q30,30 28,0 Z" fill="#1a1a2a" />
          <ellipse cx={0} cy={0} rx={28} ry={10} fill="#2a2a3a" />
          {/* Gold coins */}
          {[-14,-7,0,7,14].map((x,i)=>(
            <ellipse key={i} cx={x} cy={-4+i%2*3} rx={7} ry={5} fill="#ddaa10" opacity={0.9} />
          ))}
          {/* Gold shine */}
          <ellipse cx={0} cy={-5} rx={24} ry={8} fill="#ffcc20" opacity={0.15} style={{ animation: 'bg-pulse-sm 2s ease-in-out infinite' }} />
          {/* Handle */}
          <path d="M-22,0 Q0,-20 22,0" fill="none" stroke="#1a1a2a" strokeWidth={6} />
        </g>
      </g>
      {/* Leprechaun hat */}
      <g transform="translate(720,360)">
        <g style={{ animation: 'bg-float-sm 4s ease-in-out infinite' }}>
          <ellipse cx={0} cy={0} rx={30} ry={8} fill="#1a5a20" />
          <rect x={-20} y={-52} width={40} height={54} rx={4} fill="#1a5a20" />
          <rect x={-24} y={-12} width={48} height={10} fill="#c8a020" />
          <rect x={-8} y={-12} width={16} height={10} fill="#1a1a2a" />
          <circle cx={0} cy={-7} r={5} fill="#c8a020" style={{ animation: 'bg-glow 2s ease-in-out infinite' }} />
        </g>
      </g>
    </svg>
  )
}

function Scene_artStudio() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className="bg-scene-svg">
      <defs>
        <linearGradient id="art-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a0a20" /><stop offset="100%" stopColor="#100616" /></linearGradient>
      </defs>
      <rect width={800} height={450} fill="url(#art-bg)" />
      {/* Giant paint splashes */}
      {[{cx:200,cy:150,r:90,c:'#ff4040'},{cx:500,cy:130,r:80,c:'#ffee40'},{cx:650,cy:280,r:95,c:'#4080ff'},{cx:120,cy:350,r:75,c:'#ff80a0'},{cx:680,cy:160,r:60,c:'#40ff80'}].map((s,i)=>(
        <g key={i}>
          <ellipse cx={s.cx} cy={s.cy} rx={s.r} ry={s.r*.6} fill={s.c} opacity={0.2} />
          {/* Splatter droplets */}
          {[0,40,80,130,180,230,280,320].map((a,j)=>(
            <ellipse key={j} cx={s.cx+(s.r*.7+j%3*15)*Math.cos(a*Math.PI/180)} cy={s.cy+(s.r*.5+j%3*10)*Math.sin(a*Math.PI/180)} rx={4+j%3*3} ry={6+j%3*4} fill={s.c} opacity={0.3+j%3*.1} transform={`rotate(${a},${s.cx},${s.cy})`} style={{ animation: `bg-glow ${3+j*.3}s ${j*.2+i*.3}s ease-in-out infinite` }} />
          ))}
        </g>
      ))}
      {/* Palette */}
      <g transform="translate(400,320)"><g style={{ animation: 'bg-float 5s ease-in-out infinite' }}>
        <ellipse cx={0} cy={0} rx={75} ry={60} fill="#f5e0c8" />
        <ellipse cx={-5} cy={5} rx={60} ry={48} fill="#e8d4b8" />
        <circle cx={-28} cy={-3} r={5} fill="#1a1a1a" opacity={0.5} /> {/* thumb hole */}
        {[{x:-35,y:-22,c:'#ff4040'},{x:-10,y:-38,c:'#ffee40'},{x:20,y:-38,c:'#40c060'},{x:44,y:-22,c:'#4080ff'},{x:50,y:8,c:'#ff80ff'},{x:44,y:30,c:'#ff8040'}].map((p,i)=>(
          <circle key={i} cx={p.x} cy={p.y} r={9} fill={p.c} opacity={0.85} style={{ animation: `bg-pulse-sm ${2+i*.3}s ease-in-out infinite` }} />
        ))}
      </g>
      </g>
      {/* Paintbrush sweeping */}
      <g style={{ animation: 'bg-sweep 5s ease-in-out infinite', transformOrigin: '600px 200px' }}>
        <rect x={560} y={100} width={8} height={120} rx={3} fill="#8a5820" transform="rotate(-25,580,200)" />
        <rect x={556} y={100} width={16} height={20} rx={2} fill="#aaa" transform="rotate(-25,580,200)" />
        <ellipse cx={553} cy={220} rx={10} ry={6} fill="#ff4040" opacity={0.8} transform="rotate(-25,580,200)" />
        {/* Paint trail */}
        {[{x:520,y:230},{x:540,y:240},{x:560,y:235}].map((t,i)=>(
          <ellipse key={i} cx={t.x} cy={t.y} rx={6} ry={4} fill="#ff4040" opacity={0.4-i*.1} style={{ animation: `bg-pulse ${1.5+i*.3}s ease-in-out infinite` }} />
        ))}
      </g>
      {/* Floating letters / shapes */}
      {Array.from({length:12},(_,i)=>(
        <text key={i} x={(i*113+30)%800} y={(i*73+40)%400} fontSize={18+i%4*8} fill={['#ff4040','#ffee40','#4080ff','#ff80a0','#40ff80'][i%5]} opacity={0.2} style={{ animation: `bg-float ${4+i*.4}s ${i*.3}s ease-in-out infinite` }}>{'★♦●▲'[i%4]}</text>
      ))}
      {/* Easel */}
      <g transform="translate(258,352)">
        <line x1={0} y1={-148} x2={-28} y2={0} stroke="#8b6914" strokeWidth={4} />
        <line x1={0} y1={-148} x2={28} y2={0} stroke="#8b6914" strokeWidth={4} />
        <line x1={0} y1={-148} x2={0} y2={0} stroke="#8b6914" strokeWidth={3} />
        <line x1={-28} y1={-50} x2={28} y2={-50} stroke="#8b6914" strokeWidth={3} />
        <rect x={-30} y={-146} width={60} height={76} rx={3} fill="#fffde7" stroke="#c8a000" strokeWidth={2} />
        <ellipse cx={0} cy={-115} rx={20} ry={14} fill="#87ceeb" opacity={0.75} />
        <ellipse cx={-10} cy={-100} rx={12} ry={8} fill="#ff9800" opacity={0.75} />
        <ellipse cx={12} cy={-102} rx={9} ry={11} fill="#4caf50" opacity={0.75} />
      </g>
      {/* Child artist on stool */}
      <g transform="translate(182,352)">
        {/* Stool */}
        <rect x={-18} y={0} width={36} height={6} rx={3} fill="#5d4037" />
        <line x1={-12} y1={6} x2={-14} y2={28} stroke="#5d4037" strokeWidth={3} />
        <line x1={12} y1={6} x2={14} y2={28} stroke="#5d4037" strokeWidth={3} />
        {/* Legs */}
        <rect x={-13} y={-28} width={10} height={30} rx={4} fill="#1565c0" />
        <rect x={3} y={-28} width={10} height={30} rx={4} fill="#1565c0" />
        <rect x={-15} y={-5} width={12} height={8} rx={3} fill="#f5cba7" />
        <rect x={3} y={-5} width={12} height={8} rx={3} fill="#f5cba7" />
        {/* Smock */}
        <rect x={-16} y={-70} width={32} height={44} rx={5} fill="#e3f2fd" opacity={0.9} />
        <ellipse cx={-5} cy={-56} rx={5} ry={3} fill="#ff4040" opacity={0.65} />
        <ellipse cx={8} cy={-48} rx={4} ry={2.5} fill="#4080ff" opacity={0.65} />
        {/* Head */}
        <circle cx={0} cy={-84} r={18} fill="#f5cba7" />
        {/* Hair */}
        <ellipse cx={0} cy={-97} rx={19} ry={9} fill="#c1440e" />
        {/* Eyes */}
        <circle cx={-6} cy={-85} r={2.5} fill="#333" /><circle cx={6} cy={-85} r={2.5} fill="#333" />
        <circle cx={-5} cy={-86} r={1} fill="white" /><circle cx={7} cy={-86} r={1} fill="white" />
        {/* Smile */}
        <path d="M-5,-78 Q0,-74 5,-78" stroke="#a0522d" strokeWidth={1.5} fill="none" />
        {/* Right arm toward easel */}
        <line x1={16} y1={-58} x2={42} y2={-76} stroke="#f5cba7" strokeWidth={7} strokeLinecap="round" />
        {/* Paintbrush */}
        <line x1={40} y1={-76} x2={60} y2={-90} stroke="#8b6914" strokeWidth={3} strokeLinecap="round" />
        <ellipse cx={62} cy={-92} rx={5} ry={3} fill="#ffee40" opacity={0.9} />
        {/* Left arm holding palette */}
        <line x1={-16} y1={-62} x2={-28} y2={-44} stroke="#f5cba7" strokeWidth={7} strokeLinecap="round" />
        <ellipse cx={-34} cy={-38} rx={13} ry={10} fill="#f5e0c8" />
        <circle cx={-40} cy={-42} r={3.5} fill="#ff4040" />
        <circle cx={-32} cy={-46} r={3.5} fill="#ffee40" />
        <circle cx={-24} cy={-42} r={3.5} fill="#4080ff" />
      </g>
    </svg>
  )
}

// ── Theme → Scene mapping ─────────────────────────────────────────────────────
// ── Train ─────────────────────────────────────────────────────────────────────
// ── Train ─────────────────────────────────────────────────────────────────────
function Scene_train() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" overflow="hidden" className="bg-scene-svg">
      <defs>
        <linearGradient id="tr-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#87ceeb"/><stop offset="100%" stopColor="#c8e8f8"/></linearGradient>
        <linearGradient id="tr-ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5a8c3c"/><stop offset="100%" stopColor="#3a6b20"/></linearGradient>
      </defs>
      <rect width={800} height={450} fill="url(#tr-bg)" />
      <CloudShape x={60}  y={55}  w={180} fill="white" opacity={0.9} style={{ animation: 'bg-drift-r 30s linear infinite' }} />
      <CloudShape x={450} y={38}  w={140} fill="white" opacity={0.85} style={{ animation: 'bg-drift-r 38s 5s linear infinite' }} />
      <CloudShape x={260} y={75}  w={110} fill="white" opacity={0.8} style={{ animation: 'bg-drift-r 45s 12s linear infinite' }} />
      <rect x={0} y={340} width={800} height={110} fill="url(#tr-ground)" />
      <rect x={0} y={348} width={800} height={7} rx={2} fill="#8b6914" opacity={0.8} />
      <rect x={0} y={362} width={800} height={7} rx={2} fill="#8b6914" opacity={0.8} />
      {[0,1,2,3,4,5,6,7,8,9,10,11].map(i=>(
        <rect key={i} x={i*75-5} y={344} width={18} height={28} rx={3} fill="#6b4e1a" opacity={0.9} />
      ))}
      {[30,620,720].map((x,i)=>(
        <g key={i}>
          <rect x={x} y={285} width={14} height={60} rx={3} fill="#5a3e1a" />
          <ellipse cx={x+7} cy={272} rx={32} ry={36} fill="#2d8a3e" />
          <ellipse cx={x+7} cy={256} rx={22} ry={26} fill="#3aac50" />
        </g>
      ))}
      {/* Train moves left-to-right — engine leads on RIGHT, carriages trail left */}
      <g style={{ animation: 'bg-drift-r 14s linear infinite' }}>
        <g transform="translate(-700,0)">
          {/* Carriage 2 tail */}
          <rect x={0}   y={272} width={110} height={68} rx={8} fill="#e65100" />
          <rect x={12}  y={282} width={28} height={20} rx={3} fill="#81d4fa" opacity={0.85} />
          <rect x={56}  y={282} width={28} height={20} rx={3} fill="#81d4fa" opacity={0.85} />
          <circle cx={22}  cy={342} r={15} fill="#424242" /><circle cx={22}  cy={342} r={8} fill="#757575" />
          <circle cx={90}  cy={342} r={15} fill="#424242" /><circle cx={90}  cy={342} r={8} fill="#757575" />
          <rect x={108} y={305} width={18} height={6} rx={2} fill="#888" />
          {/* Carriage 1 */}
          <rect x={126} y={272} width={110} height={68} rx={8} fill="#1565c0" />
          <rect x={138} y={282} width={28} height={20} rx={3} fill="#81d4fa" opacity={0.85} />
          <rect x={182} y={282} width={28} height={20} rx={3} fill="#81d4fa" opacity={0.85} />
          <circle cx={148} cy={342} r={15} fill="#424242" /><circle cx={148} cy={342} r={8} fill="#757575" />
          <circle cx={216} cy={342} r={15} fill="#424242" /><circle cx={216} cy={342} r={8} fill="#757575" />
          <rect x={234} y={305} width={18} height={6} rx={2} fill="#888" />
          {/* Engine rightmost = leading */}
          <rect x={252} y={262} width={120} height={78} rx={10} fill="#c62828" />
          <rect x={340} y={250} width={42} height={36} rx={6} fill="#b71c1c" />
          <rect x={346} y={255} width={30} height={22} rx={4} fill="#81d4fa" opacity={0.9} />
          <rect x={368} y={272} width={28} height={58} rx={8} fill="#b71c1c" />
          <polygon points="396,310 396,335 412,340 412,305" fill="#9e1010" />
          <rect x={348} y={244} width={14} height={20} rx={3} fill="#8b4513" />
          <ellipse cx={355} cy={237} rx={11} ry={10} fill="rgba(200,200,220,0.65)" style={{ animation: 'bg-steam 2s ease-in-out infinite' }} />
          <ellipse cx={355} cy={220} rx={14} ry={12} fill="rgba(200,200,220,0.4)"  style={{ animation: 'bg-steam 2s 0.4s ease-in-out infinite' }} />
          <circle cx={278} cy={342} r={17} fill="#424242" /><circle cx={278} cy={342} r={9} fill="#757575" /><circle cx={278} cy={342} r={3} fill="#bdbdbd" />
          <circle cx={320} cy={342} r={17} fill="#424242" /><circle cx={320} cy={342} r={9} fill="#757575" /><circle cx={320} cy={342} r={3} fill="#bdbdbd" />
          <circle cx={362} cy={342} r={17} fill="#424242" /><circle cx={362} cy={342} r={9} fill="#757575" /><circle cx={362} cy={342} r={3} fill="#bdbdbd" />
          <rect x={278} y={339} width={84} height={6} rx={3} fill="#616161" opacity={0.8} />
        </g>
      </g>
      <circle cx={700} cy={80} r={52} fill="#ffd600" opacity={0.9} style={{ animation: 'bg-glow 6s ease-in-out infinite' }} />
      {[0,45,90,135,180,225,270,315].map((a,i)=>(
        <line key={i} x1={700+Math.cos(a*Math.PI/180)*60} y1={80+Math.sin(a*Math.PI/180)*60}
          x2={700+Math.cos(a*Math.PI/180)*76} y2={80+Math.sin(a*Math.PI/180)*76}
          stroke="#ffd600" strokeWidth={4} strokeLinecap="round" opacity={0.7} />
      ))}
    </svg>
  )
}

// ── Butterfly Garden ──────────────────────────────────────────────────────────
function Scene_butterfly() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" overflow="hidden" className="bg-scene-svg">
      <defs>
        <linearGradient id="bf-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f3e5f5"/><stop offset="100%" stopColor="#e8f5e9"/></linearGradient>
      </defs>
      <rect width={800} height={450} fill="url(#bf-bg)" />
      {[{x:80,c:'#f48fb1'},{x:200,c:'#ce93d8'},{x:340,c:'#fff176'},{x:480,c:'#f48fb1'},{x:600,c:'#80cbc4'},{x:720,c:'#ffcc80'}].map((f,i)=>(
        <g key={i}>
          <rect x={f.x-3} y={320} width={6} height={110} rx={3} fill="#4caf50" />
          {[1,-1].map((d,j)=>(
            <ellipse key={j} cx={f.x+d*18} cy={360} rx={14} ry={7} fill="#66bb6a" opacity={0.7}
              transform={`rotate(${d*25},${f.x+d*18},360)`} />
          ))}
          {[0,60,120,180,240,300].map((a,j)=>(
            <ellipse key={j}
              cx={f.x+Math.cos(a*Math.PI/180)*18} cy={315+Math.sin(a*Math.PI/180)*18}
              rx={13} ry={9} fill={f.c} opacity={0.9}
              transform={`rotate(${a},${f.x+Math.cos(a*Math.PI/180)*18},${315+Math.sin(a*Math.PI/180)*18})`} />
          ))}
          <circle cx={f.x} cy={315} r={10} fill="#ffd600" />
        </g>
      ))}
      <rect x={0} y={400} width={800} height={50} fill="#66bb6a" opacity={0.35} />
      {[{x:140,y:160,c1:'#ce93d8',c2:'#f48fb1'},{x:380,y:120,c1:'#80deea',c2:'#4dd0e1'},
        {x:580,y:180,c1:'#ffcc80',c2:'#ffa726'},{x:260,y:240,c1:'#f48fb1',c2:'#e91e63'}].map((b,i)=>(
        <g key={i} style={{ animation: `bg-float ${3+i*.7}s ${i*.5}s ease-in-out infinite` }}>
          <g transform={`translate(${b.x},${b.y})`}>
            <ellipse cx={-20} cy={-12} rx={22} ry={15} fill={b.c1} opacity={0.88} transform="rotate(-20)" />
            <ellipse cx={-16} cy={10}  rx={15} ry={10} fill={b.c2} opacity={0.75} transform="rotate(18)" />
            <ellipse cx={20}  cy={-12} rx={22} ry={15} fill={b.c1} opacity={0.88} transform="rotate(20)" />
            <ellipse cx={16}  cy={10}  rx={15} ry={10} fill={b.c2} opacity={0.75} transform="rotate(-18)" />
            <ellipse cx={0} cy={0} rx={4} ry={14} fill="#4a148c" opacity={0.8} />
            <line x1={0} y1={-14} x2={-9} y2={-28} stroke="#4a148c" strokeWidth={1.5} />
            <line x1={0} y1={-14} x2={9}  y2={-28} stroke="#4a148c" strokeWidth={1.5} />
            <circle cx={-9} cy={-28} r={3} fill="#4a148c" />
            <circle cx={9}  cy={-28} r={3} fill="#4a148c" />
          </g>
        </g>
      ))}
      <circle cx={680} cy={80} r={55} fill="#fff9c4" opacity={0.85} style={{ animation: 'bg-glow 7s ease-in-out infinite' }} />
    </svg>
  )
}

// ── Busy Bees ─────────────────────────────────────────────────────────────────
function Scene_bees() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" overflow="hidden" className="bg-scene-svg">
      <defs>
        <linearGradient id="bee-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fffde7"/><stop offset="100%" stopColor="#fff9c4"/></linearGradient>
      </defs>
      <rect width={800} height={450} fill="url(#bee-bg)" />
      {[0,1,2,3,4].map(row=>[0,1,2,3,4,5,6,7].map(col=>{
        const x=col*90+(row%2)*45+30, y=row*68+40
        return <polygon key={`${row}-${col}`}
          points={`${x},${y-28} ${x+24},${y-14} ${x+24},${y+14} ${x},${y+28} ${x-24},${y+14} ${x-24},${y-14}`}
          fill="none" stroke="#f9a825" strokeWidth={1.5} opacity={0.22} />
      }))}
      {[{x:100,y:390},{x:280,y:400},{x:480,y:388},{x:660,y:395}].map((f,i)=>(
        <g key={i}>
          <rect x={f.x-3} y={f.y-70} width={6} height={75} rx={3} fill="#558b2f" />
          {[0,72,144,216,288].map((a,j)=>(
            <ellipse key={j} cx={f.x+Math.cos(a*Math.PI/180)*18} cy={f.y-70+Math.sin(a*Math.PI/180)*18}
              rx={13} ry={8} fill="#f48fb1" opacity={0.9} />
          ))}
          <circle cx={f.x} cy={f.y-70} r={9} fill="#ffd600" />
        </g>
      ))}
      <line x1={400} y1={0} x2={400} y2={50} stroke="#8b6914" strokeWidth={4} />
      <g transform="translate(400,50)">
        {[0,1,2,3].map(row=>{
          const count=4-row
          return [...Array(count)].map((_,col)=>{
            const hx=(col-(count-1)/2)*34, hy=row*28
            return <polygon key={`${row}-${col}`}
              points={`${hx},${hy-12} ${hx+14},${hy-6} ${hx+14},${hy+6} ${hx},${hy+12} ${hx-14},${hy+6} ${hx-14},${hy-6}`}
              fill="#f9a825" stroke="#e65100" strokeWidth={1} opacity={0.92} />
          })
        })}
      </g>
      {[{x:150,y:200},{x:300,y:145},{x:540,y:170},{x:660,y:220},{x:240,y:290}].map((b,i)=>(
        <g key={i} style={{ animation: `bg-float ${2.5+i*.6}s ${i*.4}s ease-in-out infinite` }}>
          <g transform={`translate(${b.x},${b.y})`}>
            <ellipse cx={0} cy={0} rx={22} ry={13} fill="#fdd835" />
            <rect x={-18} y={-13} width={7} height={26} rx={3} fill="#212121" opacity={0.45} />
            <rect x={-8}  y={-13} width={7} height={26} rx={3} fill="#212121" opacity={0.45} />
            <rect x={2}   y={-13} width={7} height={26} rx={3} fill="#212121" opacity={0.45} />
            <ellipse cx={26} cy={0} rx={6} ry={4} fill="#e65100" />
            <circle cx={-24} cy={0} r={11} fill="#fdd835" />
            <circle cx={-28} cy={-3} r={3} fill="#212121" /><circle cx={-27} cy={-4} r={1} fill="white" />
            <circle cx={-20} cy={-3} r={3} fill="#212121" /><circle cx={-19} cy={-4} r={1} fill="white" />
            <path d="M-27,4 Q-24,7 -20,4" stroke="#212121" strokeWidth={1.5} fill="none" strokeLinecap="round" />
            <ellipse cx={-8} cy={-18} rx={16} ry={9} fill="rgba(255,255,255,0.78)" transform="rotate(-15,-8,-18)" />
            <ellipse cx={8}  cy={-18} rx={16} ry={9} fill="rgba(255,255,255,0.78)" transform="rotate(15,8,-18)" />
            <line x1={-24} y1={-11} x2={-30} y2={-22} stroke="#212121" strokeWidth={1.5} />
            <line x1={-20} y1={-11} x2={-14} y2={-22} stroke="#212121" strokeWidth={1.5} />
            <circle cx={-30} cy={-23} r={2.5} fill="#212121" />
            <circle cx={-14} cy={-23} r={2.5} fill="#212121" />
          </g>
        </g>
      ))}
      <rect x={0} y={420} width={800} height={30} fill="#8bc34a" opacity={0.4} />
    </svg>
  )
}

// ── Sunflower Farm ────────────────────────────────────────────────────────────
function Scene_sunflowerfarm() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" overflow="hidden" className="bg-scene-svg">
      <defs>
        <linearGradient id="sf-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#87ceeb"/><stop offset="100%" stopColor="#e0f4ff"/></linearGradient>
        <linearGradient id="sf-soil" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#795548"/><stop offset="100%" stopColor="#5d4037"/></linearGradient>
      </defs>
      <rect width={800} height={450} fill="url(#sf-bg)" />
      <circle cx={90} cy={80} r={55} fill="#fdd835" opacity={0.92} style={{ animation: 'bg-glow 6s ease-in-out infinite' }} />
      <CloudShape x={200} y={55} w={160} fill="white" opacity={0.85} style={{ animation: 'bg-drift-r 35s linear infinite' }} />
      <CloudShape x={520} y={40} w={130} fill="white" opacity={0.8}  style={{ animation: 'bg-drift-r 45s 8s linear infinite' }} />
      <rect x={0} y={370} width={800} height={80} fill="url(#sf-soil)" />
      {[0,1,2,3,4,5,6,7,8,9,10].map(i=>(
        <g key={i}>
          <rect x={i*82+10} y={338} width={10} height={46} rx={3} fill="#8b6914" />
          <polygon points={`${i*82+10},338 ${i*82+15},326 ${i*82+20},338`} fill="#8b6914" />
        </g>
      ))}
      <rect x={0} y={352} width={800} height={7} rx={3} fill="#8b6914" />
      <rect x={0} y={365} width={800} height={7} rx={3} fill="#8b6914" />
      {[{x:70,h:200},{x:170,h:220},{x:270,h:195},{x:370,h:215},{x:470,h:205},{x:570,h:225},{x:760,h:210}].map((f,i)=>(
        <g key={i} style={{ animation: `bg-sway-sm ${3+i*.4}s ${i*.3}s ease-in-out infinite` }}>
          <path d={`M${f.x},370 Q${f.x+12},${370-f.h/2} ${f.x},${370-f.h}`}
            stroke="#388e3c" strokeWidth={9} fill="none" strokeLinecap="round" />
          <ellipse cx={f.x+22} cy={370-f.h*.52} rx={24} ry={11} fill="#4caf50" opacity={0.85}
            transform={`rotate(-28,${f.x+22},${370-f.h*.52})`} />
          <ellipse cx={f.x-22} cy={370-f.h*.65} rx={24} ry={11} fill="#4caf50" opacity={0.85}
            transform={`rotate(28,${f.x-22},${370-f.h*.65})`} />
          {[0,40,80,120,160,200,240,280,320].map((a,j)=>(
            <ellipse key={j}
              cx={f.x+Math.cos(a*Math.PI/180)*30} cy={(370-f.h)+Math.sin(a*Math.PI/180)*30}
              rx={15} ry={8} fill="#fdd835"
              transform={`rotate(${a},${f.x+Math.cos(a*Math.PI/180)*30},${(370-f.h)+Math.sin(a*Math.PI/180)*30})`} />
          ))}
          <circle cx={f.x} cy={370-f.h} r={20} fill="#5d4037" />
          <circle cx={f.x} cy={370-f.h} r={13} fill="#4e342e" />
        </g>
      ))}
      {/* Barn — sits on soil, right side */}
      <rect x={640} y={250} width={120} height={120} fill="#c62828" />
      <polygon points="634,250 700,180 770,250" fill="#b71c1c" />
      <rect x={665} y={312} width={30} height={58} rx={2} fill="#5d4037" />
      <rect x={646} y={264} width={26} height={24} rx={2} fill="#ffcc80" opacity={0.65} />
      <rect x={730} y={264} width={26} height={24} rx={2} fill="#ffcc80" opacity={0.65} />
      {/* Farmer child with watering can */}
      <g transform="translate(610,370)">
        {/* Overalls legs */}
        <rect x={-11} y={-48} width={11} height={49} rx={4} fill="#5c7a9e" />
        <rect x={3} y={-48} width={11} height={49} rx={4} fill="#5c7a9e" />
        {/* Shirt underneath */}
        <rect x={-13} y={-84} width={28} height={40} rx={5} fill="#c8e6c9" />
        {/* Overall bib */}
        <rect x={-10} y={-84} width={22} height={25} rx={3} fill="#5c7a9e" />
        {/* Head */}
        <circle cx={1} cy={-98} r={18} fill="#f5cba7" />
        {/* Straw hat brim */}
        <ellipse cx={1} cy={-112} rx={25} ry={7} fill="#f9a825" />
        {/* Hat crown */}
        <rect x={-13} y={-124} width={28} height={14} rx={4} fill="#f9a825" />
        <ellipse cx={1} cy={-123} rx={14} ry={4} fill="#f57f17" opacity={0.55} />
        {/* Eyes */}
        <circle cx={-5} cy={-99} r={2.2} fill="#333" /><circle cx={7} cy={-99} r={2.2} fill="#333" />
        {/* Smile */}
        <path d="M-4,-91 Q1,-87 6,-91" stroke="#a0522d" strokeWidth={1.5} fill="none" />
        {/* Left arm holding watering can */}
        <line x1={-13} y1={-74} x2={-38} y2={-62} stroke="#f5cba7" strokeWidth={7} strokeLinecap="round" />
        {/* Watering can body */}
        <rect x={-56} y={-72} width={22} height={16} rx={3} fill="#90a4ae" />
        <path d="M-34,-64 Q-25,-59 -20,-70" stroke="#90a4ae" strokeWidth={3} fill="none" strokeLinecap="round" />
        {/* Spout */}
        <line x1={-56} y1={-63} x2={-65} y2={-55} stroke="#90a4ae" strokeWidth={3} strokeLinecap="round" />
        {/* Water drops */}
        <circle cx={-67} cy={-50} r={2} fill="#81d4fa" style={{ animation: 'bg-float-sm 1.5s ease-in-out infinite' }} />
        <circle cx={-70} cy={-43} r={1.5} fill="#81d4fa" style={{ animation: 'bg-float-sm 1.5s 0.3s ease-in-out infinite' }} />
        <circle cx={-64} cy={-40} r={1.5} fill="#81d4fa" style={{ animation: 'bg-float-sm 1.5s 0.6s ease-in-out infinite' }} />
        {/* Right arm relaxed */}
        <line x1={15} y1={-74} x2={24} y2={-56} stroke="#f5cba7" strokeWidth={7} strokeLinecap="round" />
      </g>
    </svg>
  )
}

// ── Cricket ───────────────────────────────────────────────────────────────────
function Scene_cricket() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" overflow="hidden" className="bg-scene-svg">
      <defs>
        <linearGradient id="cr-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#87ceeb"/><stop offset="100%" stopColor="#b0ddf0"/></linearGradient>
        <radialGradient id="cr-oval" cx="50%" cy="70%"><stop offset="0%" stopColor="#8bc34a"/><stop offset="100%" stopColor="#4caf50"/></radialGradient>
      </defs>
      <rect width={800} height={450} fill="url(#cr-bg)" />
      {/* Stadium stands — two sides */}
      <rect x={0} y={40} width={800} height={100} fill="#e3f2fd" opacity={0.6} rx={6} />
      {/* Crowd rows */}
      {[0,1,2].map(row=>[0,1,2,3,4,5,6,7,8,9,10,11,12,13].map((col,ci)=>(
        <circle key={`${row}-${ci}`} cx={col*58+22} cy={58+row*22} r={12}
          fill={['#ef5350','#42a5f5','#66bb6a','#ffa726','#ab47bc','#ffffff','#ffd600'][ci%7]} opacity={0.65} />
      )))}
      {/* Stand structure */}
      <rect x={0} y={138} width={800} height={10} fill="#1565c0" opacity={0.4} />
      {/* Ground oval */}
      <ellipse cx={400} cy={390} rx={400} ry={160} fill="url(#cr-oval)" />
      {/* Outfield stripe */}
      <ellipse cx={400} cy={390} rx={320} ry={128} fill="#9ccc65" opacity={0.5} />
      <ellipse cx={400} cy={390} rx={240} ry={96}  fill="#8bc34a" opacity={0.5} />
      {/* Pitch */}
      <rect x={368} y={220} width={64} height={180} rx={4} fill="#d4a843" opacity={0.7} />
      <line x1={355} y1={258} x2={445} y2={258} stroke="white" strokeWidth={2.5} opacity={0.85} />
      <line x1={355} y1={382} x2={445} y2={382} stroke="white" strokeWidth={2.5} opacity={0.85} />
      {/* Stumps — bowler end top */}
      {[-14,0,14].map((dx,i)=>(
        <g key={i}>
          <rect x={400+dx-3} y={235} width={5} height={28} rx={1} fill="#f5f5f5" />
          <rect x={400+dx-7} y={233} width={13} height={5} rx={1} fill="#f5f5f5" />
        </g>
      ))}
      {/* Stumps — batsman end bottom */}
      {[-14,0,14].map((dx,i)=>(
        <g key={i}>
          <rect x={400+dx-3} y={370} width={5} height={28} rx={1} fill="#f5f5f5" />
          <rect x={400+dx-7} y={368} width={13} height={5} rx={1} fill="#f5f5f5" />
        </g>
      ))}
      {/* Batsman — right of stumps, side-on */}
      <g transform="translate(436,355)">
        <circle cx={0} cy={-66} r={14} fill="#ffcc80" />
        <path d="M-14,-66 Q-14,-86 0,-88 Q14,-86 14,-66" fill="#c62828" />
        <rect x={-13} y={-52} width={26} height={36} rx={5} fill="#1565c0" />
        <rect x={-13} y={-16} width={12} height={32} rx={5} fill="#f5f5f5" opacity={0.9} />
        <rect x={1}   y={-16} width={12} height={32} rx={5} fill="#f5f5f5" opacity={0.9} />
        {/* Bat — pivot at grip (batsman's hands at local 12,-22) */}
        <g transform="translate(12,-22)">
          {/* This inner group rotates around 0,0 = the grip top = batsman's hands */}
          <g style={{
            transformBox: 'fill-box',
            transformOrigin: 'top center',
            animation: 'bg-bat-swing 3s ease-in-out infinite'
          }}>
            {/* Grip cap at top (pivot end) */}
            <rect x={-6} y={0} width={12} height={10} rx={3} fill="#f5c842"/>
            {/* Blade below */}
            <rect x={-5} y={9} width={10} height={46} rx={4} fill="#d4a843"/>
          </g>
        </g>
      </g>
      {/* Bowler running in — left of pitch top */}
      <g transform="translate(350,252)">
        <circle cx={0} cy={-55} r={12} fill="#ffcc80" />
        <rect x={-11} y={-43} width={22} height={30} rx={4} fill="#c62828" />
        {/* Bowling arm — raised high */}
        <path d="M11,-35 Q24,-52 18,-68" stroke="#c62828" strokeWidth={10} fill="none" strokeLinecap="round" />
        <circle cx={18} cy={-68} r={8} fill="#ffcc80" />
        {/* Balance arm — opposite side, low */}
        <path d="M-11,-35 Q-26,-22 -30,-10" stroke="#c62828" strokeWidth={10} fill="none" strokeLinecap="round" />
        <circle cx={-30} cy={-10} r={8} fill="#ffcc80" />
        <rect x={-12} y={-13} width={10} height={28} rx={4} fill="#c62828" />
        <rect x={2}   y={-13} width={10} height={28} rx={4} fill="#c62828" />
      </g>
      {/* Ball flies upward from pitch and disappears — it's a SIX! */}
      <g style={{ animation: 'bg-cricket-delivery 3s ease-in-out infinite' }}>
        <circle cx={406} cy={368} r={13} fill="#c62828" />
        <path d="M399,361 Q406,355 413,361" stroke="white" strokeWidth={2} fill="none" />
        <path d="M399,375 Q406,381 413,375" stroke="white" strokeWidth={2} fill="none" />
      </g>
      {/* SIX!! text that flashes in sync with ball disappearing */}
      <text x={400} y={200} textAnchor="middle"
        fill="#ffd600" fontSize={52} fontWeight="900" fontFamily="Nunito,Arial Black,sans-serif"
        stroke="#ff6f00" strokeWidth={3} paintOrder="stroke"
        style={{ animation: 'bg-six 3s ease-in-out infinite' }}>
        SIX!!
      </text>
      {/* Fielder — far left, both arms outstretched ready to catch */}
      <g transform="translate(200,330)">
        <circle cx={0} cy={-46} r={11} fill="#ffcc80" />
        <rect x={-10} y={-35} width={20} height={28} rx={4} fill="#1565c0" />
        {/* Left arm */}
        <path d="M-10,-28 Q-24,-18 -28,-8" stroke="#1565c0" strokeWidth={9} fill="none" strokeLinecap="round" />
        <circle cx={-28} cy={-8} r={7} fill="#ffcc80" />
        {/* Right arm */}
        <path d="M10,-28 Q24,-18 28,-8" stroke="#1565c0" strokeWidth={9} fill="none" strokeLinecap="round" />
        <circle cx={28} cy={-8} r={7} fill="#ffcc80" />
        <rect x={-10} y={-7} width={9} height={22} rx={4} fill="#1565c0" />
        <rect x={2}   y={-7} width={9} height={22} rx={4} fill="#1565c0" />
      </g>
      {/* Scoreboard top-right */}
      <g transform="translate(688,108)">
        <rect x={-62} y={-40} width={124} height={80} rx={8} fill="#1b5e20" />
        <rect x={-56} y={-34} width={112} height={68} rx={5} fill="#212121" />
        <text x={0} y={-14} textAnchor="middle" fill="#fdd835" fontSize={13} fontWeight="bold" fontFamily="monospace">INDIA</text>
        <text x={0} y={12}  textAnchor="middle" fill="white"  fontSize={22} fontWeight="bold" fontFamily="monospace">248</text>
        <text x={0} y={28}  textAnchor="middle" fill="#aaa"   fontSize={10} fontFamily="monospace">OVR 38.4</text>
      </g>
    </svg>
  )
}

// ── Football (Stadium) ────────────────────────────────────────────────────────
function Scene_football() {
  // Ball arc: starts at kicker (x=470,y=355), curves up and right into goal (x=672,y=290)
  // The keyframe translates from 0,0 → 202,-65 over 60% of cycle, holds briefly, resets
  const W = 'rgba(255,255,255,0.5)'
  const W2 = 'rgba(255,255,255,0.15)'
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" overflow="hidden" className="bg-scene-svg">
      <defs>
        <linearGradient id="fb-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a0e2e"/><stop offset="100%" stopColor="#1a2060"/>
        </linearGradient>
        <linearGradient id="fb-pitch" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2e7d32"/><stop offset="60%" stopColor="#256428"/><stop offset="100%" stopColor="#1b5e20"/>
        </linearGradient>
        <linearGradient id="fb-stand-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e2a7a"/><stop offset="100%" stopColor="#111850"/>
        </linearGradient>
        <radialGradient id="fb-spot-l" cx="20%" cy="15%"><stop offset="0%" stopColor="rgba(255,253,200,0.14)"/><stop offset="100%" stopColor="rgba(255,253,200,0)"/></radialGradient>
        <radialGradient id="fb-spot-r" cx="80%" cy="15%"><stop offset="0%" stopColor="rgba(255,253,200,0.14)"/><stop offset="100%" stopColor="rgba(255,253,200,0)"/></radialGradient>
      </defs>

      {/* Sky */}
      <rect width={800} height={450} fill="url(#fb-sky)" />

      {/* ── Stands ── */}
      {/* Top stand */}
      <rect x={80} y={0} width={640} height={108} fill="url(#fb-stand-bg)" />
      {/* Top crowd — 4 rows of colourful heads */}
      {[0,1,2,3].map(row=>[0,1,2,3,4,5,6,7,8,9,10,11,12].map((col,ci)=>(
        <circle key={`t${row}${ci}`}
          cx={col*48+104} cy={row*24+12} r={10}
          fill={['#ef5350','#42a5f5','#ffd600','#4caf50','#ab47bc','#ffffff','#ff7043','#00bcd4'][ci%8]}
          opacity={0.7} />
      )))}
      <rect x={80} y={100} width={640} height={8} fill="#0d1650" />

      {/* Left side stand */}
      <polygon points="0,0 80,0 80,450 0,450" fill="url(#fb-stand-bg)" />
      {[0,1,2,3,4,5,6,7].map(row=>[0,1,2,3].map((col,ci)=>(
        <circle key={`l${row}${ci}`} cx={col*18+8} cy={row*50+20} r={8}
          fill={['#ef5350','#42a5f5','#ffd600','#ffffff'][ci%4]} opacity={0.65} />
      )))}

      {/* Right side stand */}
      <polygon points="720,0 800,0 800,450 720,450" fill="url(#fb-stand-bg)" />
      {[0,1,2,3,4,5,6,7].map(row=>[0,1,2,3].map((col,ci)=>(
        <circle key={`r${row}${ci}`} cx={col*18+726} cy={row*50+20} r={8}
          fill={['#ffffff','#ef5350','#ab47bc','#ffd600'][ci%4]} opacity={0.65} />
      )))}

      {/* Floodlight towers */}
      {[{x:40,side:0},{x:760,side:1}].map((t,i)=>(
        <g key={i}>
          <rect x={t.x-5} y={100} width={10} height={55} fill="#555" />
          <rect x={t.x-20} y={98} width={40} height={10} rx={3} fill="#777" />
          {[-14,-5,5,14].map((dx,j)=>(
            <ellipse key={j} cx={t.x+dx} cy={98} rx={4} ry={3} fill="#ffe082"
              style={{ animation: `bg-glow ${1.4+j*.18}s ${j*.09}s ease-in-out infinite` }} />
          ))}
          {/* Spotlight cone */}
          <polygon
            points={`${t.x-20},108 ${t.x+20},108 ${t.side===0?200:600},200 ${t.side===0?160:640},200`}
            fill="rgba(255,252,180,0.05)" />
        </g>
      ))}
      {/* Spotlight radial fills on pitch */}
      <rect x={80} y={108} width={640} height={342} fill="url(#fb-spot-l)" />
      <rect x={80} y={108} width={640} height={342} fill="url(#fb-spot-r)" />

      {/* Advertising board */}
      <rect x={80} y={108} width={640} height={24} fill="#0a2a8a" />
      {['GLUMBI','⚽ LIVE','GOAL TIME','FUN','⚽ PLAY'].map((t,i)=>(
        <text key={i} x={140+i*122} y={125} textAnchor="middle"
          fill="#ffd600" fontSize={12} fontWeight="bold" fontFamily="Nunito,sans-serif">{t}</text>
      ))}

      {/* ── Pitch ── */}
      <rect x={80} y={132} width={640} height={318} fill="url(#fb-pitch)" />
      {/* Alternating stripe pattern */}
      {[0,1,2,3,4,5,6,7].map(i=>(
        <rect key={i} x={80+i*80} y={132} width={80} height={318}
          fill={i%2===0?'rgba(0,0,0,0.06)':'transparent'} />
      ))}

      {/* Pitch markings */}
      {/* Boundary */}
      <rect x={96} y={148} width={608} height={286} fill="none" stroke={W} strokeWidth={2} />
      {/* Halfway line */}
      <line x1={400} y1={148} x2={400} y2={434} stroke={W} strokeWidth={2} />
      {/* Centre circle */}
      <circle cx={400} cy={291} r={52} fill="none" stroke={W} strokeWidth={2} />
      <circle cx={400} cy={291} r={3} fill={W} />
      {/* Left penalty box */}
      <rect x={96} y={220} width={88} height={142} fill="none" stroke={W} strokeWidth={2} />
      <rect x={96} y={246} width={42} height={90} fill="none" stroke={W} strokeWidth={1} opacity={0.5} />
      {/* Right penalty box */}
      <rect x={616} y={220} width={88} height={142} fill="none" stroke={W} strokeWidth={2} />
      <rect x={662} y={246} width={42} height={90} fill="none" stroke={W} strokeWidth={1} opacity={0.5} />
      {/* Penalty spots */}
      <circle cx={154} cy={291} r={3} fill={W} />
      <circle cx={646} cy={291} r={3} fill={W} />
      {/* Corner arcs */}
      {[[96,148],[704,148],[96,434],[704,434]].map(([cx,cy],i)=>(
        <path key={i} d={`M${cx+(i%2===0?8:-8)},${cy} A8,8 0 0,${i<2?1:0} ${cx},${cy+(i<2?8:-8)}`}
          stroke={W} strokeWidth={2} fill="none" />
      ))}

      {/* ── Goals ── */}
      {/* Left goal (white posts, net lines) */}
      <rect x={80} y={248} width={18} height={86} fill="none" stroke="white" strokeWidth={3} />
      <rect x={80} y={248} width={18} height={86} fill={W2} />
      {[1,2,3,4,5].map(i=><line key={i} x1={80} y1={248+i*14} x2={98} y2={248+i*14} stroke={W2} strokeWidth={1}/>)}
      {[1].map(i=><line key={i} x1={80+i*9} y1={248} x2={80+i*9} y2={334} stroke={W2} strokeWidth={1}/>)}

      {/* Right goal */}
      <rect x={702} y={248} width={18} height={86} fill="none" stroke="white" strokeWidth={3} />
      <rect x={702} y={248} width={18} height={86} fill={W2} />
      {[1,2,3,4,5].map(i=><line key={i} x1={702} y1={248+i*14} x2={720} y2={248+i*14} stroke={W2} strokeWidth={1}/>)}
      {[1].map(i=><line key={i} x1={702+i*9} y1={248} x2={702+i*9} y2={334} stroke={W2} strokeWidth={1}/>)}

      {/* ── Players ── */}
      {/* Blue player — dribbling left of centre */}
      <g transform="translate(310,300)" style={{ animation: 'bg-sway-sm 1.6s ease-in-out infinite' }}>
        <circle cx={0} cy={-58} r={13} fill="#fdbcb4" />
        {/* Hair */}
        <path d="M-13,-62 Q0,-76 13,-62" fill="#3e2000" />
        {/* Jersey */}
        <rect x={-12} y={-45} width={24} height={32} rx={5} fill="#1565c0" />
        {/* Arms */}
        <path d="M-12,-40 Q-26,-28 -24,-16" stroke="#1565c0" strokeWidth={9} fill="none" strokeLinecap="round"/>
        <circle cx={-24} cy={-16} r={7} fill="#fdbcb4"/>
        <path d="M12,-40 Q26,-28 24,-16" stroke="#1565c0" strokeWidth={9} fill="none" strokeLinecap="round"/>
        <circle cx={24} cy={-16} r={7} fill="#fdbcb4"/>
        {/* Shorts + socks */}
        <rect x={-12} y={-13} width={11} height={28} rx={4} fill="#0d47a1"/>
        <rect x={1}   y={-13} width={11} height={28} rx={4} fill="#0d47a1"/>
        <rect x={-12} y={14} width={11} height={12} rx={3} fill="white" opacity={0.8}/>
        <rect x={1}   y={14} width={11} height={12} rx={3} fill="white" opacity={0.8}/>
      </g>

      {/* Red goalkeeper — arms spread wide */}
      <g transform="translate(674,282)">
        <circle cx={0} cy={-58} r={13} fill="#fdbcb4" />
        <path d="M-13,-62 Q0,-76 13,-62" fill="#880e0e" />
        <rect x={-12} y={-45} width={24} height={32} rx={5} fill="#c62828" />
        <path d="M-12,-38 Q-36,-26 -44,-16" stroke="#c62828" strokeWidth={10} fill="none" strokeLinecap="round"/>
        <circle cx={-44} cy={-16} r={9} fill="#fdbcb4"/>
        <path d="M12,-38 Q36,-26 44,-16"  stroke="#c62828" strokeWidth={10} fill="none" strokeLinecap="round"/>
        <circle cx={44}  cy={-16} r={9} fill="#fdbcb4"/>
        <rect x={-12} y={-13} width={11} height={28} rx={4} fill="#880e0e"/>
        <rect x={1}   y={-13} width={11} height={28} rx={4} fill="#880e0e"/>
        <rect x={-12} y={14} width={11} height={12} rx={3} fill="white" opacity={0.8}/>
        <rect x={1}   y={14} width={11} height={12} rx={3} fill="white" opacity={0.8}/>
      </g>

      {/* Yellow kicker — faces RIGHT, nose shows direction, standing leg centred */}
      <g transform="translate(440,356)">
        {/* Head — right-facing profile */}
        <circle cx={6} cy={-54} r={13} fill="#fdbcb4" />
        {/* Nose bump pointing right = clear facing indicator */}
        <ellipse cx={18} cy={-51} rx={5} ry={3} fill="#fdbcb4" />
        {/* Hair cap */}
        <path d="M-6,-60 Q6,-74 18,-60" fill="#5d3000" />
        {/* Body / jersey */}
        <rect x={-8} y={-41} width={22} height={30} rx={5} fill="#f9a825" />
        {/* Left arm — FORWARD at mid-body height (not drooping down) */}
        <path d="M-8,-35 Q4,-28 14,-24" stroke="#f9a825" strokeWidth={9} fill="none" strokeLinecap="round"/>
        <circle cx={14} cy={-24} r={8} fill="#fdbcb4"/>
        {/* Right arm — BACK swing left and up */}
        <path d="M14,-35 Q0,-46 -8,-40" stroke="#f9a825" strokeWidth={9} fill="none" strokeLinecap="round"/>
        <circle cx={-8} cy={-40} r={8} fill="#fdbcb4"/>
        {/* Standing LEFT leg — slightly left, planted */}
        <rect x={-6} y={-11} width={10} height={30} rx={4} fill="#e65100"/>
        <rect x={-6} y={18}  width={10} height={11} rx={3} fill="white" opacity={0.8}/>
        {/* Kicking RIGHT leg — SVG animateTransform rotates around hip (0,0) in local coords */}
        <g transform="translate(8,-11)">
          <g>
            <animateTransform
              attributeName="transform" type="rotate"
              values="0 0 0; -46 0 0; 90 0 0; 90 0 0; 115 0 0; 115 0 0; 0 0 0"
              keyTimes="0; 0.08; 0.22; 0.48; 0.64; 0.78; 1"
              calcMode="spline"
              keySplines="0.2 0 0.3 1; 0.4 0 0.6 1; 0 0 1 1; 0.4 0 0.6 1; 0 0 1 1; 0.35 0 0.65 1"
              dur="3.5s" repeatCount="indefinite"
            />
            <line x1={0} y1={0} x2={34} y2={6}  stroke="#e65100" strokeWidth={12} strokeLinecap="round"/>
            <circle cx={34} cy={6} r={9} fill="white" opacity={0.9}/>
          </g>
        </g>
      </g>

      {/* ── Ball: at kicker's foot (482,354) → right goal (706,291) ── */}
      <g style={{ animation: 'bg-fb-ball 3.5s ease-in-out infinite', transformOrigin: '482px 354px' }}>
        <circle cx={482} cy={354} r={15} fill="white" stroke="#ddd" strokeWidth={0.8}/>
        <polygon points="482,347 488.7,351.8 486.1,359.7 477.9,359.7 475.3,351.8" fill="#1a1a1a"/>
        <circle cx={489.4} cy={343.9} r={2.8} fill="#1a1a1a"/>
        <circle cx={493.9} cy={357.9} r={2.8} fill="#1a1a1a"/>
        <circle cx={482}   cy={366.5} r={2.8} fill="#1a1a1a"/>
        <circle cx={470.1} cy={357.9} r={2.8} fill="#1a1a1a"/>
        <circle cx={474.6} cy={343.9} r={2.8} fill="#1a1a1a"/>
        <ellipse cx={477} cy={348} rx={4} ry={2.5} fill="white" opacity={0.6}/>
      </g>

      {/* ── Scoreboard ── */}
      <g transform="translate(400,16)">
        <rect x={-78} y={0} width={156} height={36} rx={8} fill="rgba(0,0,0,0.72)" />
        <rect x={-76} y={2} width={152} height={32} rx={7} fill="rgba(30,40,140,0.9)" />
        <text x={-28} y={24} textAnchor="middle" fill="white"   fontSize={20} fontWeight="bold" fontFamily="monospace">2</text>
        <text x={0}   y={22} textAnchor="middle" fill="#ffd600" fontSize={13} fontWeight="bold" fontFamily="monospace">—</text>
        <text x={28}  y={24} textAnchor="middle" fill="white"   fontSize={20} fontWeight="bold" fontFamily="monospace">1</text>
      </g>

      {/* ── GOAL!! flash ── */}
      <text x={706} y={286} textAnchor="middle"
        fill="#ffd600" fontSize={40} fontWeight="900"
        fontFamily="Nunito,Arial Black,sans-serif"
        stroke="#ff3300" strokeWidth={3} paintOrder="stroke"
        style={{ animation: 'bg-goal 3.5s ease-in-out infinite' }}>
        GOAL!!
      </text>
    </svg>
  )
}

// ── Camping ───────────────────────────────────────────────────────────────────
function Scene_camping() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" overflow="hidden" className="bg-scene-svg">
      <defs>
        <linearGradient id="ca-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a1a3a"/><stop offset="100%" stopColor="#0d1b2a"/></linearGradient>
        <radialGradient id="ca-fire" cx="50%" cy="80%"><stop offset="0%" stopColor="#ff8f00"/><stop offset="100%" stopColor="#e65100" stopOpacity={0}/></radialGradient>
      </defs>
      <rect width={800} height={450} fill="url(#ca-bg)" />
      <Stars n={60} />
      {/* Crescent moon — two circles technique */}
      <circle cx={680} cy={70} r={42} fill="#fff9c4" opacity={0.92} />
      <circle cx={702} cy={58} r={38} fill="#1a1a3a" />
      {/* Mountains */}
      <polygon points="0,310 130,130 260,310"   fill="#1b2a1b" />
      <polygon points="90,310 240,105 390,310"  fill="#162416" />
      <polygon points="380,310 540,85 700,310"  fill="#1b2a1b" />
      <polygon points="520,310 670,145 800,310 800,450 0,450 0,310" fill="#0d1a0d" />
      <rect x={0} y={360} width={800} height={90} fill="#1a2e0a" />
      {/* Tent */}
      <g transform="translate(300,230)">
        <polygon points="-90,130 0,-40 90,130" fill="#e65100" />
        <polygon points="-30,130 0,50 30,130" fill="#1a1a0a" />
        <line x1={0} y1={-40} x2={0} y2={130} stroke="#ff6f00" strokeWidth={2} opacity={0.5} />
        <line x1={-90} y1={130} x2={-110} y2={148} stroke="#8b6914" strokeWidth={3} strokeLinecap="round" />
        <line x1={90}  y1={130} x2={110}  y2={148} stroke="#8b6914" strokeWidth={3} strokeLinecap="round" />
        <line x1={0} y1={-40} x2={-110} y2={148} stroke="#8b6914" strokeWidth={1.5} opacity={0.5} />
        <line x1={0} y1={-40} x2={110}  y2={148} stroke="#8b6914" strokeWidth={1.5} opacity={0.5} />
      </g>
      {/* Campfire */}
      <g transform="translate(580,370)">
        <ellipse cx={0} cy={10} rx={38} ry={10} fill="#5d4037" />
        <rect x={-32} y={-2} width={65} height={12} rx={6} fill="#4e342e" transform="rotate(-14)" />
        <rect x={-32} y={-2} width={65} height={12} rx={6} fill="#4e342e" transform="rotate(14)" />
        {[-26,-14,0,14,26].map((x,i)=>(<ellipse key={i} cx={x} cy={14} rx={9} ry={6} fill="#616161" />))}
        <ellipse cx={0} cy={0} rx={44} ry={22} fill="url(#ca-fire)" opacity={0.4} />
        {[{x:-12,h:44,c:'#ff6f00',d:2},{x:0,h:58,c:'#ff8f00',d:2.5},{x:12,h:42,c:'#ffa726',d:1.8}].map((f,i)=>(
          <ellipse key={i} cx={f.x} cy={-f.h/2} rx={11} ry={f.h/2} fill={f.c}
            style={{ animation: `bg-flicker ${f.d}s ${i*.3}s ease-in-out infinite` }} />
        ))}
        {[{x:-6,y:-64},{x:6,y:-72},{x:16,y:-56}].map((s,i)=>(
          <circle key={i} cx={s.x} cy={s.y} r={3} fill="#fdd835"
            style={{ animation: `bg-steam ${1.5+i*.4}s ${i*.3}s ease-in-out infinite` }} />
        ))}
      </g>
      {[50,110,660,720].map((x,i)=>(
        <g key={i}>
          <polygon points={`${x},360 ${x+22},268 ${x+44},360`} fill="#0d2010" />
          <polygon points={`${x+4},320 ${x+22},238 ${x+40},320`} fill="#142818" />
        </g>
      ))}
      <ellipse cx={580} cy={380} rx={130} ry={32} fill="#ff6f00" opacity={0.1} />
      {/* Two campers sitting by the fire */}
      {/* Person 1 — left of fire */}
      <g transform="translate(510,368)">
        <circle cx={0} cy={-38} r={10} fill="#f5c8a8"/>
        <ellipse cx={0} cy={-42} rx={10} ry={6} fill="#3a2010"/>
        <path d="M-10,-28 Q-14,0 -8,8 Q0,4 8,8 Q14,0 10,-28Z" fill="#cc4400"/>
        {/* Arm holding stick over fire */}
        <line x1={10} y1={-22} x2={30} y2={-10} stroke="#f5c8a8" strokeWidth={5} strokeLinecap="round"/>
        <line x1={30} y1={-10} x2={50} y2={-30} stroke="#8b6914" strokeWidth={3} strokeLinecap="round"/>
        <circle cx={52} cy={-32} r={5} fill="#ffcc80"/>
        {/* Sitting legs */}
        <line x1={-6} y1={8} x2={-14} y2={22} stroke="#f5c8a8" strokeWidth={7} strokeLinecap="round"/>
        <line x1={6}  y1={8} x2={14}  y2={22} stroke="#f5c8a8" strokeWidth={7} strokeLinecap="round"/>
      </g>
      {/* Person 2 — right of fire */}
      <g transform="translate(648,368)">
        <circle cx={0} cy={-38} r={10} fill="#c8956c"/>
        <ellipse cx={0} cy={-42} rx={10} ry={6} fill="#1a0808"/>
        <path d="M-10,-28 Q-14,0 -8,8 Q0,4 8,8 Q14,0 10,-28Z" fill="#1565c0"/>
        {/* Arms hugging knees */}
        <line x1={-10} y1={-22} x2={-20} y2={-8} stroke="#c8956c" strokeWidth={5} strokeLinecap="round"/>
        <line x1={10}  y1={-22} x2={20}  y2={-8} stroke="#c8956c" strokeWidth={5} strokeLinecap="round"/>
        <line x1={-6}  y1={8}   x2={-12} y2={22} stroke="#c8956c" strokeWidth={7} strokeLinecap="round"/>
        <line x1={6}   y1={8}   x2={12}  y2={22} stroke="#c8956c" strokeWidth={7} strokeLinecap="round"/>
      </g>
    </svg>
  )
}

// ── Around the World ──────────────────────────────────────────────────────────
function Scene_aroundtheworld() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" overflow="hidden" className="bg-scene-svg">
      <defs>
        <linearGradient id="aw-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c8e8ff"/><stop offset="60%" stopColor="#e3f2fd"/><stop offset="100%" stopColor="#bbdefb"/></linearGradient>
        <radialGradient id="aw-globe" cx="45%" cy="42%"><stop offset="0%" stopColor="#42a5f5"/><stop offset="100%" stopColor="#0d47a1"/></radialGradient>
        <linearGradient id="aw-balloon" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff5722"/><stop offset="100%" stopColor="#ffeb3b"/></linearGradient>
      </defs>
      <rect width={800} height={450} fill="url(#aw-bg)" />
      {/* Clouds */}
      <CloudShape x={30}  y={55}  w={150} fill="white" opacity={0.9} style={{ animation: 'bg-drift-r 32s linear infinite' }} />
      <CloudShape x={580} y={42}  w={120} fill="white" opacity={0.85} style={{ animation: 'bg-drift-r 42s 9s linear infinite' }} />
      <CloudShape x={350} y={80}  w={90}  fill="white" opacity={0.7} style={{ animation: 'bg-drift-r 50s 5s linear infinite' }} />
      {/* Eiffel Tower — left side */}
      <g transform="translate(130,440)">
        {/* Base arch */}
        <path d="M-38,0 Q-36,-30 -24,-35 L24,-35 Q36,-30 38,0Z" fill="#546e7a"/>
        {/* Main legs */}
        <path d="M-38,0 L-18,-120 L18,-120 L38,0Z" fill="#607d8b"/>
        {/* Platform */}
        <rect x={-22} y={-124} width={44} height={8} rx={2} fill="#546e7a"/>
        {/* Mid section */}
        <path d="M-18,-120 L-10,-200 L10,-200 L18,-120Z" fill="#607d8b"/>
        <rect x={-14} y={-204} width={28} height={6} rx={2} fill="#546e7a"/>
        {/* Top section */}
        <path d="M-10,-200 L-4,-260 L4,-260 L10,-200Z" fill="#607d8b"/>
        {/* Spire */}
        <path d="M-3,-260 L0,-300 L3,-260Z" fill="#78909c"/>
        {/* Cross beams */}
        <line x1={-32} y1={-40} x2={32} y2={-40} stroke="#546e7a" strokeWidth={3}/>
        <line x1={-26} y1={-75} x2={26} y2={-75} stroke="#546e7a" strokeWidth={2.5}/>
        <line x1={-16} y1={-155} x2={16} y2={-155} stroke="#546e7a" strokeWidth={2}/>
        {/* Glow from top */}
        <circle cx={0} cy={-300} r={5} fill="#fff9c4" style={{ animation: 'bg-twinkle 1s ease-in-out infinite' }}/>
      </g>
      {/* Taj Mahal — right side */}
      <g transform="translate(650,440)">
        {/* Base platform */}
        <rect x={-70} y={-20} width={140} height={20} rx={2} fill="#f5f0e0"/>
        {/* Main building */}
        <rect x={-48} y={-90} width={96} height={70} rx={4} fill="#fffde7"/>
        {/* Main dome */}
        <ellipse cx={0} cy={-95} rx={32} ry={40} fill="#fafafa"/>
        {/* Top of main dome */}
        <rect x={-3} y={-136} width={6} height={14} rx={2} fill="#e0dcc8"/>
        <circle cx={0} cy={-148} r={5} fill="#e8dfc8"/>
        {/* 4 small towers (minarets) */}
        {[-58,58].map((x,i)=>(
          <g key={i}>
            <rect x={x-8} y={-80} width={16} height={60} rx={4} fill="#fffde7"/>
            <ellipse cx={x} cy={-82} rx={10} ry={16} fill="#fafafa"/>
            <rect x={x-2} y={-100} width={4} height={10} rx={1} fill="#e0dcc8"/>
          </g>
        ))}
        {/* Arched windows */}
        {[-28,0,28].map((x,i)=>(
          <path key={i} d={`M${x-10},-25 L${x-10},-55 Q${x},-68 ${x+10},-55 L${x+10},-25Z`} fill="#b3e5fc" opacity={0.5}/>
        ))}
        {/* Reflecting pool */}
        <rect x={-70} y={-8} width={140} height={8} rx={2} fill="#b3e5fc" opacity={0.5}/>
      </g>
      {/* Globe — centered */}
      <g transform="translate(400,310)">
        <circle cx={0} cy={0} r={110} fill="url(#aw-globe)"/>
        {[-55,0,55].map((y,i)=>(
          <ellipse key={i} cx={0} cy={y} rx={Math.max(8,Math.sqrt(110*110-y*y))} ry={13}
            fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={1}/>
        ))}
        {[0,36,72,108,144].map((a,i)=>(
          <ellipse key={i} cx={0} cy={0} rx={11} ry={110} fill="none"
            stroke="rgba(255,255,255,0.14)" strokeWidth={1} transform={`rotate(${a})`}/>
        ))}
        <ellipse cx={-28} cy={-18} rx={42} ry={30} fill="#4caf50" opacity={0.86}/>
        <ellipse cx={-18} cy={28}  rx={28} ry={22} fill="#4caf50" opacity={0.82}/>
        <ellipse cx={40}  cy={-28} rx={34} ry={26} fill="#4caf50" opacity={0.84}/>
        <ellipse cx={58}  cy={18}  rx={20} ry={16} fill="#4caf50" opacity={0.78}/>
        <ellipse cx={-66} cy={8}   rx={18} ry={26} fill="#4caf50" opacity={0.76}/>
        <ellipse cx={0} cy={0} rx={110} ry={15} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={1.5}/>
        <rect x={-6} y={102} width={12} height={32} rx={3} fill="#1565c0" opacity={0.65}/>
        <ellipse cx={0} cy={134} rx={40} ry={9} fill="#0d47a1" opacity={0.5}/>
      </g>
      {/* Hot air balloon */}
      <g style={{ animation: 'bg-float 5s ease-in-out infinite' }}>
        <g transform="translate(680,180)">
          {/* Balloon envelope */}
          <ellipse cx={0} cy={0} rx={50} ry={65} fill="url(#aw-balloon)"/>
          {/* Vertical stripes */}
          {[-20,0,20].map((x,i)=>(
            <path key={i} d={`M${x},-65 Q${x+10},0 ${x},-65`} fill="rgba(255,255,255,.15)" strokeWidth={0}/>
          ))}
          {/* Horizontal band */}
          <ellipse cx={0} cy={10} rx={50} ry={8} fill="rgba(255,255,255,.2)"/>
          {/* Basket */}
          <rect x={-16} y={62} width={32} height={20} rx={4} fill="#8d6e63"/>
          <line x1={-16} y1={62} x2={-10} y2={50} stroke="#8d6e63" strokeWidth={2}/>
          <line x1={16}  y1={62} x2={10}  y2={50} stroke="#8d6e63" strokeWidth={2}/>
          {/* Traveler in basket */}
          <circle cx={0} cy={57} r={7} fill="#f5c8a8"/>
          <rect x={-6} y={63} width={12} height={10} rx={3} fill="#1565c0"/>
          {/* Flame */}
          <ellipse cx={0} cy={52} rx={6} ry={10} fill="#ff8800" opacity={0.7}
            style={{ animation: 'bg-flicker 0.4s ease-in-out infinite' }}/>
          {/* Rope lines */}
          {[-40,-14,14,40].map((x,i)=>(
            <line key={i} x1={x} y1={48} x2={(x>0?12:-12)} y2={62} stroke="#8d6e63" strokeWidth={1.5} opacity={0.7}/>
          ))}
        </g>
      </g>
      {/* Aeroplane drifting */}
      <g style={{ animation: 'bg-drift-r 22s linear infinite' }}>
        <g transform="translate(-80,120)">
          <ellipse cx={0} cy={0} rx={60} ry={15} fill="white"/>
          <ellipse cx={18} cy={-9} rx={25} ry={9} fill="white"/>
          <polygon points="-60,0 -82,-12 -76,0" fill="white"/>
          <polygon points="-22,0 -34,22 -10,22" fill="white"/>
          {[-12,4,20].map((x,i)=>(
            <ellipse key={i} cx={x} cy={-7} rx={7} ry={4.5} fill="#bbdefb" opacity={0.8}/>
          ))}
          {/* Contrail */}
          <line x1={-82} y1={-6} x2={-130} y2={-6} stroke="rgba(255,255,255,.6)" strokeWidth={3}/>
          <line x1={-82} y1={2} x2={-140} y2={2} stroke="rgba(255,255,255,.4)" strokeWidth={2}/>
        </g>
      </g>
      {/* Travel stamps scattered */}
      {[{x:50,y:310,c:'#e53935',t:'PARIS'},{x:720,y:300,c:'#1565c0',t:'AGRA'}].map((s,i)=>(
        <g key={i} style={{ animation: `bg-float ${4+i}s ${i}s ease-in-out infinite` }}>
          <rect x={s.x-30} y={s.y-18} width={60} height={36} rx={4} fill="none" stroke={s.c} strokeWidth={3} opacity={0.7}/>
          <text x={s.x} y={s.y-2} fontSize={11} textAnchor="middle" fill={s.c} fontWeight="bold" opacity={0.8}>{s.t}</text>
          <ellipse cx={s.x} cy={s.y+8} rx={24} ry={6} fill={s.c} opacity={0.15}/>
        </g>
      ))}
    </svg>
  )
}

// ── Jungle Book ───────────────────────────────────────────────────────────────
function Scene_junglebook() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" overflow="hidden" className="bg-scene-svg">
      <defs>
        <linearGradient id="jb-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1b5e20"/><stop offset="100%" stopColor="#2e7d32"/></linearGradient>
        <radialGradient id="jb-sun" cx="50%" cy="0%" r="60%"><stop offset="0%" stopColor="#fff9c4" stopOpacity={0.7}/><stop offset="100%" stopColor="#fff9c4" stopOpacity={0}/></radialGradient>
      </defs>
      <rect width={800} height={450} fill="url(#jb-bg)" />
      <rect x={0} y={0} width={800} height={220} fill="url(#jb-sun)" />
      {/* Background trees */}
      {[40,170,310,470,610,730].map((x,i)=>(
        <g key={i}>
          <rect x={x} y={120} width={20} height={310} rx={7} fill="#1a3a0a" />
          <ellipse cx={x+10} cy={108}  rx={60} ry={64} fill="#1b5e20" opacity={0.9} />
          <ellipse cx={x+10} cy={88}   rx={44} ry={48} fill="#2e7d32" opacity={0.85} />
          <ellipse cx={x+10} cy={72}   rx={30} ry={35} fill="#388e3c" opacity={0.8} />
        </g>
      ))}
      {/* Vines */}
      {[100,290,500,670].map((x,i)=>(
        <path key={i} d={`M${x},0 Q${x+35},90 ${x-24},180 Q${x+45},270 ${x},360`}
          stroke="#2e7d32" strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.65} />
      ))}
      {/* Ground */}
      <ellipse cx={400} cy={440} rx={440} ry={85} fill="#1a2e0a" />
      {/* Mowgli — boy standing beside elephant */}
      <g transform="translate(300,390)">
        {/* Head */}
        <circle cx={0} cy={-62} r={11} fill="#c8914a"/>
        {/* Hair */}
        <ellipse cx={0} cy={-70} rx={11} ry={6} fill="#2a1006"/>
        {/* Eyes + smile */}
        <circle cx={-4} cy={-64} r={2} fill="#212121"/><circle cx={4} cy={-64} r={2} fill="#212121"/>
        <path d="M-4,-58 Q0,-55 4,-58" stroke="#5d4037" strokeWidth={1.5} fill="none"/>
        {/* Torso */}
        <rect x={-9} y={-52} width={18} height={24} rx={4} fill="#e8c060"/>
        {/* Loincloth */}
        <rect x={-7} y={-30} width={14} height={14} rx={3} fill="#a06020"/>
        {/* Left arm down */}
        <line x1={-9} y1={-44} x2={-18} y2={-28} stroke="#c8914a" strokeWidth={5} strokeLinecap="round"/>
        {/* Right arm waving up */}
        <g style={{ animation: 'bg-sway-sm 1.5s ease-in-out infinite', transformBox:'fill-box', transformOrigin:'9px -44px' }}>
          <line x1={9} y1={-44} x2={22} y2={-60} stroke="#c8914a" strokeWidth={5} strokeLinecap="round"/>
        </g>
        {/* Legs */}
        <line x1={-4} y1={-16} x2={-6} y2={0} stroke="#c8914a" strokeWidth={6} strokeLinecap="round"/>
        <line x1={4}  y1={-16} x2={6}  y2={0} stroke="#c8914a" strokeWidth={6} strokeLinecap="round"/>
      </g>
      {/* Elephant — outer g holds position, inner g holds animation so CSS doesn't clobber the translate */}
      <g transform="translate(490,308)">
      <g style={{ animation: 'bg-sway-sm 3s ease-in-out infinite', transformBox:'fill-box', transformOrigin:'0px 110px' }}>
        {/* Rear legs */}
        <rect x={38}  y={50} width={28} height={55} rx={14} fill="#78909c" />
        <rect x={72}  y={50} width={28} height={55} rx={14} fill="#78909c" />
        {/* Body — large horizontal ellipse */}
        <ellipse cx={28} cy={18} rx={96} ry={62} fill="#78909c" />
        {/* Front legs */}
        <rect x={-52} y={50} width={28} height={58} rx={14} fill="#78909c" />
        <rect x={-18} y={50} width={28} height={58} rx={14} fill="#78909c" />
        {/* Head — overlapping body left */}
        <ellipse cx={-90} cy={-4} rx={54} ry={48} fill="#78909c" />
        {/* Ear */}
        <ellipse cx={-78} cy={-14} rx={34} ry={46} fill="#607d8b" opacity={0.82} />
        <ellipse cx={-78} cy={-14} rx={22} ry={30} fill="#e57373" opacity={0.3} />
        {/* Eye */}
        <circle cx={-108} cy={-20} r={9} fill="#212121" />
        <circle cx={-106} cy={-22} r={3} fill="white" />
        {/* Tusk */}
        <path d="M-128,-6 Q-152,2 -144,28" stroke="#fff9c4" strokeWidth={8} fill="none" strokeLinecap="round" />
        {/* Trunk — animated lift */}
        <path d="M-128,10 Q-158,40 -148,78 Q-140,102 -122,90"
          stroke="#607d8b" strokeWidth={24} fill="none" strokeLinecap="round"
          style={{ animation: 'bg-trunk-lift 4s ease-in-out infinite', transformBox:'fill-box', transformOrigin:'top center' }}/>
        <circle cx={-116} cy={88} r={14} fill="#607d8b"
          style={{ animation: 'bg-trunk-lift 4s ease-in-out infinite', transformBox:'fill-box', transformOrigin:'top center' }}/>
        {/* Tail */}
        <path d="M122,8 Q144,28 136,52" stroke="#607d8b" strokeWidth={8} fill="none" strokeLinecap="round" />
        <ellipse cx={136} cy={54} rx={6} ry={4} fill="#607d8b" />
      </g>
      </g>
      {/* Monkey — in middle vertical band, holding vine */}
      <g style={{ animation: 'bg-drift-lr 12s ease-in-out infinite' }}>
        <g transform="translate(200,155)">
          {/* Vine held */}
          <line x1={18} y1={-32} x2={18} y2={-80} stroke="#5d4037" strokeWidth={5} />
          {/* Body */}
          <ellipse cx={0} cy={12} rx={13} ry={18} fill="#8d6e63" />
          {/* Head */}
          <circle cx={0} cy={-12} r={16} fill="#a1887f" />
          <circle cx={0} cy={-10} r={11} fill="#bcaaa4" />
          {/* Eyes */}
          <circle cx={-5} cy={-14} r={3.5} fill="#212121" /><circle cx={-4} cy={-15} r={1} fill="white" />
          <circle cx={5}  cy={-14} r={3.5} fill="#212121" /><circle cx={6}  cy={-15} r={1} fill="white" />
          {/* Smile */}
          <path d="M-4,-6 Q0,-3 4,-6" stroke="#5d4037" strokeWidth={1.5} fill="none" />
          {/* Ears */}
          <circle cx={-16} cy={-12} r={6} fill="#a1887f" /><circle cx={-16} cy={-12} r={3.5} fill="#bcaaa4" />
          <circle cx={16}  cy={-12} r={6} fill="#a1887f" /><circle cx={16}  cy={-12} r={3.5} fill="#bcaaa4" />
          {/* Right arm holding vine */}
          <path d="M13,0 Q22,-14 18,-32" stroke="#8d6e63" strokeWidth={7} fill="none" strokeLinecap="round" />
          {/* Left arm outstretched */}
          <path d="M-13,0 Q-28,12 -28,24" stroke="#8d6e63" strokeWidth={7} fill="none" strokeLinecap="round" />
          {/* Legs */}
          <path d="M-8,30 Q-14,46 -10,58" stroke="#8d6e63" strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d="M8,30  Q14,46  10,58"  stroke="#8d6e63" strokeWidth={6} fill="none" strokeLinecap="round" />
          {/* Tail */}
          <path d="M0,30 Q18,52 12,68" stroke="#8d6e63" strokeWidth={5} fill="none" strokeLinecap="round" />
          <circle cx={12} cy={68} r={4} fill="#8d6e63" />
        </g>
      </g>
      {/* Tropical birds */}
      {[{x:140,y:205,c:'#e53935'},{x:600,y:185,c:'#1565c0'}].map((b,i)=>(
        <g key={i} style={{ animation: `bg-float ${3+i}s ease-in-out infinite` }}>
          <ellipse cx={b.x}    cy={b.y}    rx={20} ry={10} fill={b.c} />
          <ellipse cx={b.x-16} cy={b.y-7}  rx={18} ry={9}  fill={b.c} opacity={0.85} transform={`rotate(-28,${b.x-16},${b.y-7})`} />
          <ellipse cx={b.x+16} cy={b.y-7}  rx={18} ry={9}  fill={b.c} opacity={0.85} transform={`rotate(28,${b.x+16},${b.y-7})`} />
          <ellipse cx={b.x+18} cy={b.y}    rx={9}  ry={5}  fill="#ffd600" />
        </g>
      ))}
      {/* Foreground leaves */}
      <ellipse cx={40}  cy={425} rx={90} ry={65} fill="#1b5e20" opacity={0.85} />
      <ellipse cx={760} cy={425} rx={90} ry={65} fill="#1b5e20" opacity={0.85} />
    </svg>
  )
}

// ── Music World ───────────────────────────────────────────────────────────────
function Scene_music() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" overflow="hidden" className="bg-scene-svg">
      <defs>
        <linearGradient id="mu-bg" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stopColor="#0d1b2a"/><stop offset="100%" stopColor="#1a0a3a"/></linearGradient>
      </defs>
      <rect width={800} height={450} fill="url(#mu-bg)" />
      {/* Spotlight beams from top */}
      {[{x:180,c:'rgba(156,39,176,0.12)'},{x:400,c:'rgba(0,188,212,0.12)'},{x:620,c:'rgba(233,30,99,0.12)'}].map((s,i)=>(
        <polygon key={i} points={`${s.x},0 ${s.x-100},450 ${s.x+100},450`} fill={s.c} />
      ))}
      {/* Stage floor */}
      <rect x={0} y={360} width={800} height={90} fill="#1a1a2a" />
      <rect x={0} y={355} width={800} height={10} rx={4} fill="#4a148c" />
      {/* Rig bar + lights */}
      <rect x={0} y={0} width={800} height={10} fill="#111" />
      {[100,220,400,580,700].map((x,i)=>(
        <g key={i}>
          <rect x={x-6} y={10} width={12} height={22} rx={3} fill="#212121" />
          <ellipse cx={x} cy={36} rx={14} ry={9}
            fill={['#e91e63','#00bcd4','#ffd600','#4caf50','#7c4dff'][i]} opacity={0.92}
            style={{ animation: `bg-glow ${2+i*.3}s ${i*.2}s ease-in-out infinite` }} />
          {/* Light cone */}
          <polygon points={`${x-14},36 ${x-55},355 ${x+55},355 ${x+14},36`}
            fill={['rgba(233,30,99,0.05)','rgba(0,188,212,0.05)','rgba(255,214,0,0.05)','rgba(76,175,80,0.05)','rgba(124,77,255,0.05)'][i]} />
        </g>
      ))}
      {/* Staff lines in mid-screen */}
      {[175,191,207,223,239].map((y,i)=>(
        <line key={i} x1={50} y1={y} x2={750} y2={y}
          stroke="rgba(255,255,255,0.3)" strokeWidth={1.5}
          style={{ animation: `bg-glow 2s ${i*.15}s ease-in-out infinite` }} />
      ))}
      {/* Floating notes */}
      {[{x:105,y:210,c:'#e91e63'},{x:228,y:162,c:'#ffd600'},{x:368,y:185,c:'#00bcd4'},
        {x:522,y:155,c:'#4caf50'},{x:655,y:198,c:'#e91e63'},{x:748,y:170,c:'#ffd600'}].map((n,i)=>(
        <g key={i} style={{ animation: `bg-float ${3+i*.5}s ${i*.4}s ease-in-out infinite` }}>
          <g transform={`translate(${n.x},${n.y}) scale(1.3)`}>
            {i%3===0 && <>
              <ellipse cx={0} cy={0} rx={11} ry={9} fill={n.c} opacity={0.9} transform="rotate(-20)" />
              <rect x={9} y={-34} width={3} height={34} fill={n.c} opacity={0.9} />
              <rect x={9} y={-34} width={18} height={4} fill={n.c} opacity={0.75} />
            </>}
            {i%3===1 && <>
              <ellipse cx={0}  cy={0} rx={11} ry={9} fill={n.c} opacity={0.9} transform="rotate(-20)" />
              <ellipse cx={18} cy={4} rx={11} ry={9} fill={n.c} opacity={0.9} transform="rotate(-20)" />
              <rect x={9}  y={-32} width={3} height={32} fill={n.c} opacity={0.9} />
              <rect x={27} y={-28} width={3} height={32} fill={n.c} opacity={0.9} />
              <line x1={9} y1={-32} x2={30} y2={-28} stroke={n.c} strokeWidth={3} />
            </>}
            {i%3===2 && <>
              <ellipse cx={0} cy={0} rx={11} ry={9} fill={n.c} opacity={0.9} transform="rotate(-20)" />
              <rect x={9} y={-36} width={3} height={36} fill={n.c} opacity={0.9} />
              <polygon points="9,-36 22,-30 9,-24" fill={n.c} opacity={0.9} />
            </>}
          </g>
        </g>
      ))}
      {/* Piano keys on stage */}
      {[0,1,2,3,4,5,6,7,8,9,10,11,12].map(i=>(
        <rect key={i} x={i*60+10} y={362} width={56} height={36} rx={3} fill="rgba(255,255,255,0.09)" />
      ))}
      {/* Guitar — grounded on stage right */}
      <g transform="translate(620,265)">
        <ellipse cx={0} cy={42}  rx={44} ry={48} fill="#795548" opacity={0.9} />
        <ellipse cx={0} cy={-16} rx={28} ry={34} fill="#795548" opacity={0.9} />
        {/* Neck */}
        <rect x={-7} y={-118} width={14} height={136} rx={5} fill="#5d4037" />
        {/* Headstock */}
        <rect x={-22} y={-124} width={44} height={16} rx={5} fill="#4e342e" />
        {/* Strings */}
        {[0,1,2,3,4,5].map(i=>(
          <line key={i} x1={-6+i*2.5} y1={-116} x2={-6+i*2.5} y2={88}
            stroke="#ffd600" strokeWidth={0.9} opacity={0.55} />
        ))}
        {/* Sound hole */}
        <circle cx={0} cy={42} r={14} fill="none" stroke="#ffd600" strokeWidth={2} opacity={0.5} />
        {/* Frets */}
        {[0,1,2,3].map(i=>(
          <line key={i} x1={-7} y1={-90+i*22} x2={7} y2={-90+i*22} stroke="#9e9e9e" strokeWidth={1.5} opacity={0.5} />
        ))}
      </g>
      {/* Treble clef left side */}
      <g transform="translate(110,255)" opacity={0.5}>
        <path d="M8,0 Q22,8 18,28 Q14,48 0,58 Q-8,64 0,76 Q12,82 18,68"
          stroke="white" strokeWidth={4} fill="none" strokeLinecap="round" />
        <circle cx={2} cy={76} r={7} fill="none" stroke="white" strokeWidth={4} />
        <line x1={-6} y1={55} x2={22} y2={55} stroke="white" strokeWidth={2} opacity={0.5} />
        <line x1={-6} y1={40} x2={22} y2={40} stroke="white" strokeWidth={2} opacity={0.5} />
      </g>
    </svg>
  )
}

// ── Girl Hero ─────────────────────────────────────────────────────────────────
function Scene_girlhero() {
  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" overflow="hidden" className="bg-scene-svg">
      <defs>
        <linearGradient id="gh-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4a148c"/>
          <stop offset="55%" stopColor="#2a0858"/>
          <stop offset="100%" stopColor="#1a0030"/>
        </linearGradient>
        <radialGradient id="gh-glow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#e91e63" stopOpacity={0.35}/>
          <stop offset="100%" stopColor="#e91e63" stopOpacity={0}/>
        </radialGradient>
        <radialGradient id="gh-blast" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#ff80ff" stopOpacity={0.9}/>
          <stop offset="60%" stopColor="#e91e63" stopOpacity={0.4}/>
          <stop offset="100%" stopColor="#e91e63" stopOpacity={0}/>
        </radialGradient>
        <radialGradient id="gh-shield" cx="50%" cy="50%">
          <stop offset="60%" stopColor="rgba(255,100,200,0)"/>
          <stop offset="85%" stopColor="rgba(255,100,200,0.35)"/>
          <stop offset="100%" stopColor="rgba(255,100,200,0)"/>
        </radialGradient>
        <filter id="gh-blur-sm"><feGaussianBlur stdDeviation="4"/></filter>
      </defs>
      <rect width={800} height={450} fill="url(#gh-bg)" />
      <Stars n={40} />

      {/* City skyline */}
      {[{x:0,w:80,h:180},{x:85,w:55,h:240},{x:145,w:85,h:165},{x:235,w:48,h:280},
        {x:570,w:65,h:205},{x:640,w:88,h:158},{x:730,w:62,h:230}].map((b,i)=>(
        <g key={i}>
          <rect x={b.x} y={450-b.h} width={b.w} height={b.h} fill="#1a0a3a" />
          {[...Array(Math.floor(b.h/36))].map((_,j)=>(
            [...Array(Math.floor(b.w/18))].map((_,k)=>(
              <rect key={`${j}-${k}`} x={b.x+k*18+4} y={450-b.h+j*36+8} width={9} height={12} rx={1}
                fill="#ffd600" opacity={(j+k)%3===0?0.55:0.08} />
            ))
          ))}
        </g>
      ))}

      {/* Shadow hero silhouette in background — second girl hero */}
      <g transform="translate(160,200)" opacity={0.35} style={{ animation: 'bg-float 6s 1s ease-in-out infinite' }}>
        <path d="M-14,14 C-18,24 -22,42 -18,58 C-10,48 2,40 8,34 C10,24 8,14 2,8Z" fill="#9c27b0"/>
        <rect x={-2} y={8} width={22} height={34} rx={5} fill="#6a1b9a"/>
        <circle cx={8} cy={-6} r={13} fill="#5d4037"/>
        <path d="M14,8 Q24,14 30,8" stroke="#6a1b9a" strokeWidth={8} fill="none" strokeLinecap="round"/>
        <path d="M-4,8 Q-14,14 -18,10" stroke="#6a1b9a" strokeWidth={7} fill="none" strokeLinecap="round"/>
      </g>

      {/* Civilian on rooftop — building at x=570,w=65,h=205 → top at y=245 */}
      <g transform="translate(602,229)">
        {/* Rooftop ledge */}
        <rect x={-35} y={16} width={70} height={5} rx={2} fill="#2a1040"/>
        {/* Person */}
        <circle cx={0} cy={-20} r={7} fill="#c9a87c"/>
        <rect x={-5} y={-13} width={10} height={16} rx={3} fill="#e040fb"/>
        <line x1={-3} y1={3} x2={-4} y2={16} stroke="#7b1fa2" strokeWidth={3} strokeLinecap="round"/>
        <line x1={3} y1={3} x2={4} y2={16} stroke="#7b1fa2" strokeWidth={3} strokeLinecap="round"/>
        {/* Arms raised in distress */}
        <path d="M-5,-7 Q-18,-14 -16,-22" stroke="#c9a87c" strokeWidth={3} fill="none" strokeLinecap="round"/>
        <path d="M5,-7 Q18,-14 16,-22" stroke="#c9a87c" strokeWidth={3} fill="none" strokeLinecap="round"/>
      </g>

      {/* Villain robot drone — synced to hero 12s cycle: floats 0-63%, breaks+falls 64-86%, resets 87-100% */}
      <g transform="translate(680,120)">
        <g style={{ animation: 'bg-drone-break 12s 1s linear infinite normal backwards' }}>
        
          {/* Body */}
          <rect x={-28} y={-22} width={56} height={44} rx={6} fill="#1a1030"/>
          <rect x={-22} y={-16} width={44} height={32} rx={4} fill="#0e0820"/>
          {/* Evil eye */}
          <circle cx={0} cy={-4} r={12} fill="#200010"/>
          <circle cx={0} cy={-4} r={8} fill="#cc0020" style={{ animation: 'bg-glow-fast 0.8s ease-in-out infinite' }}/>
          <circle cx={0} cy={-4} r={4} fill="#ff2040" opacity={0.9}/>
          {/* Scanner beam */}
          <path d="M0,8 L-20,60 L20,60Z" fill="#cc0020" opacity={0.15} style={{ animation: 'bg-sway 2s ease-in-out infinite', transformBox:'fill-box', transformOrigin:'center top' }}/>
          {/* Wings */}
          <path d="M-28,-8 Q-50,-18 -58,-10 Q-50,0 -28,4Z" fill="#150a28"/>
          <path d="M28,-8 Q50,-18 58,-10 Q50,0 28,4Z" fill="#150a28"/>
          {/* Weapon pods */}
          <circle cx={-52} cy={-8} r={6} fill="#300020"/>
          <circle cx={52} cy={-8} r={6} fill="#300020"/>
          <circle cx={-52} cy={-8} r={3} fill="#cc0020" opacity={0.7} style={{ animation: 'bg-glow-fast 1s 0.3s ease-in-out infinite' }}/>
          <circle cx={52} cy={-8} r={3} fill="#cc0020" opacity={0.7} style={{ animation: 'bg-glow-fast 1s 0.6s ease-in-out infinite' }}/>
          {/* Rotor blur */}
          <ellipse cx={0} cy={-22} rx={32} ry={4} fill="#150a28" opacity={0.4} style={{ animation: 'bg-spin 0.1s linear infinite' }}/>
          {/* Laser toward hero */}
          <line x1={-55} y1={-8} x2={-150} y2={20} stroke="#cc0020" strokeWidth={2} opacity={0.6} style={{ animation: 'bg-glow-fast 0.5s ease-in-out infinite' }}/>
        </g>
      </g>

      {/* Explosion flash at drone position — fires at 64% of 12s cycle */}
      <g transform="translate(680,120)">
        <g style={{ animation: 'bg-drone-flash 12s 1s linear infinite normal backwards' }}>
          {[0,40,80,120,160,200,240,280,320].map((a,i)=>(
            <line key={i} x1={0} y1={0} x2={Math.cos(a*Math.PI/180)*36} y2={Math.sin(a*Math.PI/180)*36}
              stroke={i%3===0?'#ffd600':i%3===1?'#ff80ff':'#ff4000'} strokeWidth={3} strokeLinecap="round"/>
          ))}
          <circle cx={0} cy={0} r={20} fill="#ff8000" opacity={0.7}/>
          <circle cx={0} cy={0} r={10} fill="#ffffa0" opacity={0.9}/>
        </g>
      </g>

      {/* Debris piece — left wing, flies upper-left */}
      <g transform="translate(680,120)">
        <g style={{ animation: 'bg-drone-debris-l 12s 1s linear infinite normal backwards' }}>
          <path d="M0,0 Q-16,-8 -24,-2 Q-16,4 0,4Z" fill="#150a28"/>
          <circle cx={-20} cy={-2} r={4} fill="#300020"/>
        </g>
      </g>
      {/* Debris piece — right wing chunk, flies right */}
      <g transform="translate(680,120)"> 
        <g style={{ animation: 'bg-drone-debris-r 12s 1s linear infinite normal backwards' }}>
          <path d="M0,0 Q16,-8 24,-2 Q16,4 0,4Z" fill="#150a28"/>
          <circle cx={20} cy={-2} r={4} fill="#cc0020"/>
        </g>
      </g>
      {/* Debris piece — body core, falls center */}
      <g transform="translate(680,120)">
        <g style={{ animation: 'bg-drone-debris-c 12s 1s linear infinite normal backwards' }}>
          <rect x={-12} y={-10} width={24} height={20} rx={4} fill="#0e0820"/>
          <circle cx={0} cy={-2} r={5} fill="#cc0020" opacity={0.8}/>
        </g>
      </g>

      {/* Hero glow aura */}
      <ellipse cx={400} cy={220} rx={180} ry={160} fill="url(#gh-glow)" />

      {/* Girl Hero — moves LEFT→RIGHT with bg-fly-r */}
      <g style={{ animation: 'bg-fly-r 12s 1s ease-in-out infinite normal backwards' }}>
        {/* Flight energy trail — behind her (to her LEFT since she flies right) */}
        <path d="M150,218 Q220,210 290,213 Q340,215 370,218" stroke="#e91e63" strokeWidth={7} fill="none" opacity={0.35} strokeLinecap="round"/>
        <path d="M120,224 Q200,216 275,219 Q330,221 368,224" stroke="#ff80c0" strokeWidth={4} fill="none" opacity={0.22} strokeLinecap="round"/>
        <path d="M90,228 Q180,222 260,225 Q320,227 366,230" stroke="#9c27b0" strokeWidth={3} fill="none" opacity={0.15} strokeLinecap="round"/>
        {/* Sparkle trail particles (fade left to right — brightest near her) */}
        {[{x:160,y:214},{x:200,y:218},{x:240,y:212},{x:280,y:216},{x:330,y:214},{x:362,y:217}].map((p,i)=>(
          <circle key={i} cx={p.x} cy={p.y} r={2.5+i*.3} fill="#ff80ff" opacity={0.3+i*.07}
            style={{ animation: `bg-twinkle ${1+i*.2}s ${i*.15}s ease-in-out infinite` }}/>
        ))}
        {/* Speed lines — behind her (to the LEFT) */}
        {[195,207,219,231].map((y,i)=>(
          <line key={i} x1={340-i*6} y1={y} x2={290-i*8} y2={y} stroke="rgba(255,255,255,0.22)" strokeWidth={1.5} />
        ))}

        {/* Energy shield bubble around her fist (right/forward side) */}
        <circle cx={476} cy={192} r={28} fill="url(#gh-shield)" style={{ animation: 'bg-pulse 0.8s ease-in-out infinite' }}/>
        <circle cx={476} cy={192} r={20} fill="none" stroke="#ff80ff" strokeWidth={1.5} opacity={0.5} style={{ animation: 'bg-pulse 0.8s 0.2s ease-in-out infinite' }}/>
        {/* Power blast from fist — cone shooting forward (right) */}
        <path d="M476,192 L560,170 L576,188 L560,206 L476,192Z" fill="#ff80ff" opacity={0.25} style={{ animation: 'bg-glow 0.6s ease-in-out infinite' }}/>
        <path d="M476,192 L548,178 L558,192 L548,206 L476,192Z" fill="#ffd600" opacity={0.2} style={{ animation: 'bg-glow 0.6s 0.1s ease-in-out infinite' }}/>
        {/* Cape billowing behind (to the LEFT since she moves right) */}
        <path d="M388,195 C380,210 372,236 376,262 C388,248 404,238 412,232 C416,218 414,204 406,196 Z" fill="#e91e63" opacity={0.92} />
        {/* Cape shimmer highlight */}
        <path d="M406,196 C410,206 410,218 408,228 C412,222 416,212 414,204Z" fill="#ff80a0" opacity={0.4}/>
        {/* Body */}
        <rect x={390} y={196} width={36} height={50} rx={8} fill="#7b1fa2" />
        {/* Suit detail */}
        <line x1={408} y1={196} x2={408} y2={246} stroke="#6a1b9a" strokeWidth={1.5} opacity={0.5}/>
        <line x1={390} y1={218} x2={426} y2={218} stroke="#6a1b9a" strokeWidth={1} opacity={0.4}/>
        {/* Star emblem */}
        <polygon points="408,206 411,216 421,216 413,222 416,232 408,226 400,232 403,222 395,216 405,216" fill="#ffd600" />
        {/* Head */}
        <circle cx={408} cy={180} r={20} fill="#ffcc80" />
        {/* Hair */}
        <ellipse cx={408} cy={163} rx={20} ry={10} fill="#6d4c41" />
        <path d="M390,170 Q382,188 388,208" stroke="#6d4c41" strokeWidth={9} fill="none" strokeLinecap="round" />
        <path d="M426,170 Q434,188 428,208" stroke="#6d4c41" strokeWidth={9} fill="none" strokeLinecap="round" />
        {/* Hair highlight */}
        <path d="M392,164 Q400,160 410,163" stroke="#8d6c51" strokeWidth={2.5} fill="none" opacity={0.5}/>
        {/* Mask */}
        <rect x={392} y={175} width={32} height={11} rx={5} fill="#e91e63" opacity={0.88} />
        <ellipse cx={400} cy={180} rx={5} ry={3.5} fill="#1a0a3a" />
        <ellipse cx={416} cy={180} rx={5} ry={3.5} fill="#1a0a3a" />
        {/* Eye shine */}
        <circle cx={401} cy={179} r={1.2} fill="white" opacity={0.6}/>
        <circle cx={417} cy={179} r={1.2} fill="white" opacity={0.6}/>
        {/* Lead arm — power fist pointing RIGHT (forward direction) */}
        <path d="M424,210 Q450,202 470,194" stroke="#7b1fa2" strokeWidth={14} fill="none" strokeLinecap="round" />
        <circle cx={474} cy={192} r={11} fill="#ffcc80" />
        {/* Glowing knuckles */}
        <circle cx={474} cy={192} r={14} fill="#ff80ff" opacity={0.3} style={{ animation: 'bg-glow-fast 0.5s ease-in-out infinite' }}/>
        {/* Trailing arm — sweeps back to the LEFT */}
        <path d="M392,210 Q372,218 358,228" stroke="#7b1fa2" strokeWidth={12} fill="none" strokeLinecap="round" />
        <circle cx={354} cy={230} r={10} fill="#ffcc80" />
        {/* Legs angled back */}
        <path d="M396,246 Q390,264 388,280" stroke="#7b1fa2" strokeWidth={12} fill="none" strokeLinecap="round" />
        <path d="M414,246 Q418,264 422,280" stroke="#7b1fa2" strokeWidth={10} fill="none" strokeLinecap="round" />
        {/* Boots */}
        <path d="M386,280 Q382,288 384,294 Q388,296 394,292 Q394,286 390,280 Z" fill="#e91e63" />
        <path d="M420,280 Q420,288 422,294 Q426,296 432,292 Q432,286 424,281 Z" fill="#e91e63" />
      </g>

      {/* Sidekick fairy companion — tiny glowing sprite */}
      <g style={{ animation: 'bg-float 2.5s 0.8s ease-in-out infinite' }}>
        <g transform="translate(340,175)">
          {/* Wing glow */}
          <ellipse cx={-10} cy={0} rx={12} ry={7} fill="#ff80ff" opacity={0.4} transform="rotate(-30,-10,0)"/>
          <ellipse cx={10} cy={0} rx={12} ry={7} fill="#ff80ff" opacity={0.4} transform="rotate(30,10,0)"/>
          {/* Tiny body */}
          <circle cx={0} cy={0} r={5} fill="#ffd6f0"/>
          <circle cx={0} cy={-7} r={4} fill="#ffc0e0"/>
          {/* Wand with star */}
          <line x1={4} y1={2} x2={14} y2={-10} stroke="#ffd600" strokeWidth={1.5}/>
          <polygon points="14,-14 15,-10 19,-10 16,-7 17,-3 14,-6 11,-3 12,-7 9,-10 13,-10" fill="#ffd600" transform="scale(0.6) translate(9,-4)"/>
          {/* Sparkle trail from wand */}
          {[{x:16,y:-12},{x:20,y:-8},{x:24,y:-4}].map((p,i)=>(
            <circle key={i} cx={p.x} cy={p.y} r={2} fill="#ffd600" opacity={0.7-i*.2}
              style={{ animation: `bg-twinkle ${0.8+i*.2}s ${i*.1}s ease-in-out infinite` }}/>
          ))}
          {/* Body glow */}
          <circle cx={0} cy={0} r={9} fill="#ff80ff" opacity={0.2} style={{ animation: 'bg-glow 1.5s ease-in-out infinite' }}/>
        </g>
      </g>

      {/* Floating debris from battle — rocks/chunks */}
      {[{x:200,y:280,r:14},{x:560,y:300,r:10},{x:130,y:320,r:8},{x:650,y:280,r:12}].map((d,i)=>(
        <g key={i} style={{ animation: `bg-float ${3+i*.7}s ${i*.5}s ease-in-out infinite` }}>
          <polygon points={`${d.x},${d.y-d.r} ${d.x+d.r},${d.y-d.r/2} ${d.x+d.r*.8},${d.y+d.r*.6} ${d.x-d.r*.6},${d.y+d.r} ${d.x-d.r},${d.y}`}
            fill="#2a1040" stroke="#3a1858" strokeWidth={1}/>
          {/* Energy crack on debris */}
          <path d={`M${d.x-4},${d.y-4} L${d.x+2},${d.y} L${d.x-2},${d.y+5}`} stroke="#e91e63" strokeWidth={1} fill="none" opacity={0.6}
            style={{ animation: `bg-glow ${1+i*.3}s ease-in-out infinite` }}/>
        </g>
      ))}

      {/* Sparkles — more of them, different sizes */}
      {[{x:240,y:180,s:13},{x:560,y:200,s:10},{x:300,y:310,s:11},{x:500,y:300,s:8},{x:170,y:250,s:9},{x:650,y:340,s:7}].map((s,i)=>(
        <g key={i} style={{ animation: `bg-glow ${2+i*.5}s ${i*.3}s ease-in-out infinite` }}>
          <polygon
            points={`${s.x},${s.y-s.s} ${s.x+3},${s.y-3} ${s.x+s.s},${s.y} ${s.x+3},${s.y+3} ${s.x},${s.y+s.s} ${s.x-3},${s.y+3} ${s.x-s.s},${s.y} ${s.x-3},${s.y-3}`}
            fill={i%2===0?'#ffd600':'#ff80ff'} opacity={0.82} />
        </g>
      ))}
    </svg>
  )
}


const SCENE_MAP = {
  coral:        Scene_coral,
  sunshine:     Scene_sunshine,
  lion:         Scene_lion,
  galaxy:       Scene_galaxy,
  moon:         Scene_moon,
  stardust:     Scene_stardust,
  robot:        Scene_robot,
  curiositylab: Scene_curiositylab,
  avengers:     Scene_avengers,
  superman:     Scene_superman,
  forest:       Scene_forest,
  panda:        Scene_panda,
  frog:         Scene_frog,
  enchanted:    Scene_enchanted,
  minecraft:    Scene_minecraft,
  autumnleaves: Scene_autumnleaves,
  dinosaur:     Scene_dinosaur,
  ocean:        Scene_ocean,
  shark:        Scene_shark,
  mermaid:      Scene_mermaid,
  monsoon:      Scene_monsoon,
  candy:        Scene_candy,
  bubblegum:    Scene_bubblegum,
  icecream:     Scene_icecream,
  pizza:        Scene_pizza,
  donut:        Scene_donut,
  unicorn:      Scene_unicorn,
  storymagic:   Scene_storymagic,
  wordwizard:   Scene_wordwizard,
  goldstar:     Scene_goldstar,
  rangoli:      Scene_rangoli,
  kolam:        Scene_kolam,
  fairygarden:  Scene_fairygarden,
  cherryblossom: Scene_cherryblossom,
  princess:     Scene_princess,
  holi:         Scene_holi,
  pirate:       Scene_pirate,
  dragonfire:   Scene_dragonfire,
  racecar:      Scene_racecar,
  spiderman:    Scene_spiderman,
  batman:       Scene_batman,
  halloween:    Scene_halloween,
  diwali:       Scene_diwali,
  hotcocoa:     Scene_hotcocoa,
  christmas:    Scene_christmas,
  frozen:       Scene_frozen,
  sky:          Scene_sky,
  rainbow:      Scene_rainbow,
  artStudio:      Scene_artStudio,
  train:          Scene_train,
  butterfly:      Scene_butterfly,
  bees:           Scene_bees,
  sunflowerfarm:  Scene_sunflowerfarm,
  cricket:        Scene_cricket,
  football:       Scene_football,
  camping:        Scene_camping,
  aroundtheworld: Scene_aroundtheworld,
  junglebook:     Scene_junglebook,
  music:          Scene_music,
  girlhero:       Scene_girlhero,
}

// ── Public component ──────────────────────────────────────────────────────────
export function ThemeBackground({ themeKey }) {
  useLayoutEffect(() => { injectBgStyles() }, [])

  const Scene = SCENE_MAP[themeKey] || Scene_coral

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 1,
      overflow: 'hidden', pointerEvents: 'none',
      opacity: 0.85,
      willChange: 'transform',
      contain: 'paint layout',
    }}>
      <Scene />
    </div>
  )
}
