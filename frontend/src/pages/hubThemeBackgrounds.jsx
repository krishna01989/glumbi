import { useEffect } from 'react'

// ── One-time CSS injection ────────────────────────────────────────────────────
let stylesInjected = false
function injectBgStyles() {
  if (stylesInjected) return
  stylesInjected = true
  const s = document.createElement('style')
  s.textContent = `
    /* ─── Float / sway ─── */
    @keyframes bg-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
    @keyframes bg-float-sm{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
    @keyframes bg-float-lg{0%,100%{transform:translateY(0)}50%{transform:translateY(-22px)}}
    @keyframes bg-sway{0%,100%{transform:rotate(-4deg) translateY(0)}50%{transform:rotate(4deg) translateY(-5px)}}
    @keyframes bg-sway-sm{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
    @keyframes bg-sway-tree{0%,100%{transform-origin:bottom center;transform:rotate(-3deg)}50%{transform-origin:bottom center;transform:rotate(3deg)}}
    @keyframes bg-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}

    /* ─── Drift / cross screen ─── */
    @keyframes bg-drift-l{from{transform:translateX(950px)}to{transform:translateX(-300px)}}
    @keyframes bg-drift-r{from{transform:translateX(-300px)}to{transform:translateX(950px)}}
    @keyframes bg-drift-lr{0%{transform:translateX(1050px) translateY(0)}40%{transform:translateX(525px) translateY(-20px)}100%{transform:translateX(-200px) translateY(0)}}
    @keyframes bg-drift-up{0%{transform:translateY(0);opacity:0}8%{opacity:.75}88%{opacity:.5}100%{transform:translateY(-560px);opacity:0}}
    @keyframes bg-fall{0%{transform:translateY(-40px) rotate(0deg);opacity:0}6%{opacity:.8}90%{opacity:.6}100%{transform:translateY(560px) rotate(380deg);opacity:0}}
    @keyframes bg-rain{from{transform:translate(0,-80px)}to{transform:translate(-100px,600px)}}
    @keyframes bg-rain-h{from{transform:translate(0,-80px)}to{transform:translate(-140px,600px)}}
    @keyframes bg-swim{0%{transform:translateX(950px) scaleX(-1)}100%{transform:translateX(-200px) scaleX(-1)}}
    @keyframes bg-swim-r{0%{transform:translateX(-200px)}100%{transform:translateX(950px)}}
    @keyframes bg-fly{0%{transform:translateX(1050px) translateY(0)}35%{transform:translateX(525px) translateY(-40px)}100%{transform:translateX(-200px) translateY(0)}}

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

    /* ─── Web shooting ─── */
    @keyframes bg-web-shoot{0%{stroke-dashoffset:900;opacity:.8}30%{stroke-dashoffset:0;opacity:.65}60%{stroke-dashoffset:0;opacity:0}61%,100%{stroke-dashoffset:900;opacity:0}}
    @keyframes bg-web-shoot2{0%,15%{stroke-dashoffset:700;opacity:0}18%{opacity:.7}45%{stroke-dashoffset:0;opacity:.55}70%{stroke-dashoffset:0;opacity:0}71%,100%{stroke-dashoffset:700;opacity:0}}

    /* ─── Bat signal ─── */
    @keyframes bg-sweep{0%,100%{transform:rotate(-30deg) translateY(0)}50%{transform:rotate(30deg) translateY(0)}}
    @keyframes bg-signal-blink{0%,13%,100%{opacity:.55}7%{opacity:0}45%,60%{opacity:.82}52%{opacity:.08}}

    /* ─── Bats flying ─── */
    @keyframes bg-bat-cross{0%{transform:translateX(1050px) translateY(0) scaleX(-1)}40%{transform:translateX(500px) translateY(-35px) scaleX(-1)}100%{transform:translateX(-200px) translateY(0) scaleX(-1)}}
    @keyframes bg-wing-flap{0%,100%{transform:scaleY(1)}50%{transform:scaleY(-0.4)}}

    /* ─── Firework burst ─── */
    @keyframes bg-burst{0%{r:0;opacity:1}65%{opacity:.7}100%{r:60;opacity:0}}
    @keyframes bg-burst-sm{0%{r:0;opacity:1}65%{opacity:.6}100%{r:38;opacity:0}}
    @keyframes bg-spark-fly{0%{stroke-dashoffset:0;opacity:.9}100%{stroke-dashoffset:60;opacity:0}}

    /* ─── Aurora ─── */
    @keyframes bg-aurora{0%,100%{transform:scaleX(1) translateY(0);opacity:.18}50%{transform:scaleX(1.08) translateY(12px);opacity:.48}}
    @keyframes bg-aurora2{0%,100%{transform:scaleX(1) translateY(0);opacity:.12}50%{transform:scaleX(1.05) translateY(18px);opacity:.42}}

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
    @keyframes bg-flag-wave{0%,100%{transform:skewY(0deg) scaleX(1)}25%{transform:skewY(-3deg) scaleX(.96)}75%{transform:skewY(3deg) scaleX(.96)}}
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
const Stars = ({ n = 40, color = 'white' }) => Array.from({ length: n }, (_, i) => {
  const x = (i * 73 + 17) % 800
  const y = (i * 113 + 31) % 300
  const r = i % 3 === 0 ? 1.5 : 0.8
  const dur = 2 + (i % 5) * 0.7
  const del = (i * 0.23) % 3
  return <circle key={i} cx={x} cy={y} r={r} fill={color} style={{ animation: `bg-twinkle ${dur}s ${del}s ease-in-out infinite` }} />
})

const Rain = ({ n = 22, delay = 0, heavy = false }) => Array.from({ length: n }, (_, i) => {
  const x = (i * 47 + 13) % 850 - 25
  const dur = heavy ? (0.5 + (i % 4) * 0.1) : (0.8 + (i % 5) * 0.12)
  const del = delay + (i * 0.09) % 1.5
  const h = heavy ? (12 + (i % 3) * 6) : (8 + (i % 4) * 5)
  const op = heavy ? (0.55 + (i % 3) * 0.12) : (0.3 + (i % 3) * 0.1)
  return <line key={i} x1={x} y1={0} x2={x - (heavy ? 18 : 10)} y2={h} stroke={heavy ? 'rgba(180,200,255,0.7)' : 'rgba(180,210,255,0.5)'} strokeWidth={heavy ? 1.2 : 0.8} style={{ animation: `bg-rain-h ${dur}s ${del}s linear infinite`, opacity: op }} />
})

const Snowflakes = ({ n = 18 }) => Array.from({ length: n }, (_, i) => {
  const x = (i * 53 + 29) % 800
  const size = 4 + (i % 4) * 3
  const dur = 6 + (i % 5) * 1.5
  const del = (i * 0.4) % 5
  return <text key={i} x={x} y={-20} fontSize={size} textAnchor="middle" fill="white" style={{ animation: `bg-snow-fall ${dur}s ${del}s linear infinite`, opacity: 0.7 }}>❄</text>
})

// ── 49 Theme Scenes ────────────────────────────────────────────────────────────

function Scene_coral() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
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
      <rect width={800} height={500} fill="url(#c-sky)" />
      {/* Sun */}
      <circle cx={650} cy={130} r={55} fill="#ffe04a" style={{ animation: 'bg-pulse-sm 4s ease-in-out infinite' }} />
      <circle cx={650} cy={130} r={70} fill="#ffe04a" opacity={0.25} style={{ animation: 'bg-pulse 5s ease-in-out infinite' }} />
      {/* Clouds */}
      <ellipse cx={120} cy={80} rx={80} ry={30} fill="rgba(255,255,255,.35)" style={{ animation: 'bg-cloud-drift 8s ease-in-out infinite alternate' }} />
      <ellipse cx={180} cy={65} rx={60} ry={25} fill="rgba(255,255,255,.3)" style={{ animation: 'bg-cloud-drift 8s ease-in-out infinite alternate' }} />
      <ellipse cx={340} cy={110} rx={70} ry={28} fill="rgba(255,255,255,.25)" style={{ animation: 'bg-cloud-drift 10s ease-in-out infinite alternate-reverse' }} />
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
    </svg>
  )
}

function Scene_sunshine() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="s-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#87ceeb" /><stop offset="100%" stopColor="#fffacd" />
        </linearGradient>
      </defs>
      <rect width={800} height={500} fill="url(#s-sky)" />
      {/* Big sun with rays */}
      <circle cx={400} cy={130} r={70} fill="#FFD700" opacity={0.9} style={{ animation: 'bg-pulse 6s ease-in-out infinite' }} />
      <circle cx={400} cy={130} r={95} fill="#FFD700" opacity={0.15} style={{ animation: 'bg-pulse 4s ease-in-out infinite' }} />
      {[0,30,60,90,120,150,180,210,240,270,300,330].map((a,i)=>(
        <line key={i} x1={400} y1={130} x2={400+Math.cos(a*Math.PI/180)*120} y2={130+Math.sin(a*Math.PI/180)*120} stroke="#FFD700" strokeWidth={3} opacity={0.35} style={{ animation: `bg-spin-slow ${8+i%3}s linear infinite`, transformOrigin: '400px 130px' }} />
      ))}
      {/* Rolling hills */}
      <ellipse cx={150} cy={460} rx={220} ry={110} fill="#7ec850" />
      <ellipse cx={500} cy={480} rx={250} ry={100} fill="#6db840" />
      <ellipse cx={760} cy={470} rx={180} ry={90} fill="#8dd860" />
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
      <ellipse cx={150} cy={90} rx={80} ry={32} fill="rgba(255,255,255,.85)" />
      <ellipse cx={200} cy={76} rx={65} ry={28} fill="rgba(255,255,255,.9)" />
      <ellipse cx={620} cy={110} rx={90} ry={35} fill="rgba(255,255,255,.8)" />
    </svg>
  )
}

function Scene_lion() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="l-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e05c00" /><stop offset="50%" stopColor="#f5a030" /><stop offset="100%" stopColor="#ffd060" />
        </linearGradient>
      </defs>
      <rect width={800} height={500} fill="url(#l-sky)" />
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
      {/* Lion silhouette */}
      <g transform="translate(430,310)" style={{ animation: 'bg-float-sm 4s ease-in-out infinite' }}>
        {/* Mane */}
        <circle cx={0} cy={0} r={55} fill="#c86c00" />
        {/* Face */}
        <circle cx={0} cy={0} r={42} fill="#e8a040" />
        {/* Eyes */}
        <circle cx={-14} cy={-5} r={6} fill="#60a000" /><circle cx={14} cy={-5} r={6} fill="#60a000" />
        <circle cx={-12} cy={-5} r={3} fill="#111" /><circle cx={16} cy={-5} r={3} fill="#111" />
        {/* Nose + mouth */}
        <ellipse cx={0} cy={10} rx={6} ry={4} fill="#c06020" />
        <path d="M-10,18 Q0,26 10,18" stroke="#8B4010" strokeWidth={2} fill="none" />
        {/* Ears */}
        <polygon points="-40,-38 -26,-50 -12,-34" fill="#c86c00" />
        <polygon points="40,-38 26,-50 12,-34" fill="#c86c00" />
        {/* Body */}
        <ellipse cx={60} cy={35} rx={70} ry={36} fill="#e8a040" />
        <ellipse cx={-60} cy={35} rx={50} ry={30} fill="#e8a040" />
        {/* Tail */}
        <path d="M130,40 Q160,10 155,40 Q160,70 145,60" stroke="#c86c00" strokeWidth={8} fill="none" strokeLinecap="round" />
        <ellipse cx={148} cy={62} rx={12} ry={16} fill="#8B5210" />
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
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
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
      <rect width={800} height={500} fill="url(#gal-bg)" />
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
    </svg>
  )
}

function Scene_moon() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <radialGradient id="moon-bg" cx="30%" cy="20%"><stop offset="0%" stopColor="#0c1a3a" /><stop offset="100%" stopColor="#020610" /></radialGradient>
        <radialGradient id="earth-g" cx="40%" cy="35%"><stop offset="0%" stopColor="#4080ff" /><stop offset="60%" stopColor="#2060c0" /><stop offset="100%" stopColor="#0a2060" /></radialGradient>
      </defs>
      <rect width={800} height={500} fill="url(#moon-bg)" />
      <Stars n={90} />
      {/* Earth rising */}
      <circle cx={680} cy={100} r={65} fill="url(#earth-g)" style={{ animation: 'bg-glow 6s ease-in-out infinite' }} />
      <ellipse cx={668} cy={82} rx={28} ry={16} fill="#50c050" opacity={0.7} />
      <ellipse cx={692} cy={105} rx={20} ry={12} fill="#50c050" opacity={0.6} />
      <ellipse cx={680} cy={100} rx={65} ry={65} fill="white" opacity={0.05} />
      {/* Lunar ground */}
      <ellipse cx={400} cy={490} rx={550} ry={120} fill="#c8c0b0" />
      <ellipse cx={400} cy={470} rx={500} ry={80} fill="#d8d0c0" />
      {/* Craters */}
      {[{cx:200,cy:450,rx:40,ry:15},{cx:500,cy:460,rx:55,ry:18},{cx:650,cy:445,rx:30,ry:10}].map((c,i)=>(
        <ellipse key={i} {...c} fill="none" stroke="#b8b0a0" strokeWidth={3} opacity={0.6} />
      ))}
      {/* Astronaut */}
      <g transform="translate(390,370)" style={{ animation: 'bg-float 5s ease-in-out infinite' }}>
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
      {/* Flag */}
      <rect x={440} y={335} width={4} height={55} fill="#ccc" />
      <rect x={444} y={335} width={32} height={20} fill="#ff4444" style={{ animation: 'bg-flag-wave 2s ease-in-out infinite' }} />
    </svg>
  )
}

function Scene_stardust() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <radialGradient id="sd-bg" cx="50%" cy="50%"><stop offset="0%" stopColor="#1a0850" /><stop offset="100%" stopColor="#060218" /></radialGradient>
      </defs>
      <rect width={800} height={500} fill="url(#sd-bg)" />
      <Stars n={100} />
      {/* Colorful nebula blobs */}
      {[{cx:200,cy:150,rx:180,ry:100,c:'#8040ff',o:.18},{cx:600,cy:350,rx:200,ry:120,c:'#ff4080',o:.16},{cx:400,cy:250,rx:220,ry:130,c:'#40a0ff',o:.15}].map((n,i)=>(
        <ellipse key={i} cx={n.cx} cy={n.cy} rx={n.rx} ry={n.ry} fill={n.c} opacity={n.o} style={{ animation: `bg-pulse ${5+i}s ${i}s ease-in-out infinite` }} />
      ))}
      {/* Stardust trails */}
      {[{x:100,y:200,rot:45},{x:500,y:100,rot:-30},{x:650,y:320,rot:60}].map((t,i)=>(
        <g key={i} transform={`rotate(${t.rot},${t.x},${t.y})`} style={{ animation: `bg-drift-l ${12+i*3}s ${i*2}s linear infinite` }}>
          {Array.from({length:8},(_,j)=>(
            <circle key={j} cx={t.x+j*18} cy={t.y} r={3-j*0.3} fill={['#ff80ff','#80ffff','#ffe080'][i%3]} opacity={0.8-j*0.1} style={{ animation: `bg-twinkle ${1.5+j*.2}s ${j*.1}s ease-in-out infinite` }} />
          ))}
        </g>
      ))}
      {/* Shooting stars */}
      {[{x1:50,y1:80,x2:200,y2:140},{x1:600,y1:50,x2:740,y2:100},{x1:300,y1:400,x2:450,y2:440}].map((s,i)=>(
        <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke="#ffe080" strokeWidth={2}
          strokeDasharray="80 80" style={{ animation: `bg-shooting-star ${5+i}s ${i*3}s linear infinite` }} />
      ))}
    </svg>
  )
}

function Scene_robot() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="rob-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0a1a2a" /><stop offset="100%" stopColor="#051015" /></linearGradient>
      </defs>
      <rect width={800} height={500} fill="url(#rob-bg)" />
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
      {/* Robot */}
      <g transform="translate(400,260)" style={{ animation: 'bg-float 4s ease-in-out infinite' }}>
        {/* Head */}
        <rect x={-40} y={-120} width={80} height={70} rx={8} fill="#4080c0" />
        <rect x={-28} y={-108} width={56} height={35} rx={4} fill="#203060" />
        {/* Eyes */}
        <circle cx={-14} cy={-90} r={10} fill="#00ffff" style={{ animation: 'bg-blink 4s ease-in-out infinite' }} />
        <circle cx={14} cy={-90} r={10} fill="#00ffff" style={{ animation: 'bg-blink 4s 0.1s ease-in-out infinite' }} />
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
        <rect x={-75} y={-40} width={26} height={65} rx={12} fill="#4080c0" />
        <rect x={49} y={-40} width={26} height={65} rx={12} fill="#4080c0" />
        {/* Legs */}
        <rect x={-35} y={48} width={28} height={55} rx={10} fill="#3060a0" />
        <rect x={8} y={48} width={28} height={55} rx={10} fill="#3060a0" />
        <rect x={-40} y={96} width={38} height={18} rx={8} fill="#4080c0" />
        <rect x={3} y={96} width={38} height={18} rx={8} fill="#4080c0" />
      </g>
    </svg>
  )
}

function Scene_curiositylab() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="lab-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0a1a30" /><stop offset="100%" stopColor="#162840" /></linearGradient>
      </defs>
      <rect width={800} height={500} fill="url(#lab-bg)" />
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
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="av-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0a0a1a" /><stop offset="60%" stopColor="#1a0a30" /><stop offset="100%" stopColor="#0a1020" /></linearGradient>
      </defs>
      <rect width={800} height={500} fill="url(#av-bg)" />
      {/* NYC skyline silhouette */}
      {[{x:0,w:60,h:220},{x:55,w:45,h:280},{x:95,w:70,h:200},{x:160,w:50,h:320},{x:205,w:35,h:260},{x:235,w:55,h:180},{x:620,w:55,h:250},{x:670,w:40,h:310},{x:705,w:65,h:220},{x:765,w:40,h:280}].map((b,i)=>(
        <rect key={i} x={b.x} y={500-b.h} width={b.w} height={b.h} fill="#111118" />
      ))}
      {/* Iron Man flying */}
      <g style={{ animation: 'bg-fly 12s 1s ease-in-out infinite' }}>
        <ellipse cx={400} cy={180} rx={16} ry={22} fill="#cc1010" />
        <ellipse cx={400} cy={170} rx={14} ry={14} fill="#cc1010" />
        <ellipse cx={400} cy={163} rx={12} ry={10} fill="#aaa" />
        <ellipse cx={400} cy={163} rx={8} ry={7} fill="#60b0ff" opacity={0.7} />
        {/* Repulsor glow */}
        <circle cx={400} cy={185} r={8} fill="#60b0ff" opacity={0.8} style={{ animation: 'bg-glow-fast 0.5s ease-in-out infinite' }} />
        {/* Wings */}
        <path d="M388,175 L360,195 L375,178Z" fill="#aa0808" />
        <path d="M412,175 L440,195 L425,178Z" fill="#aa0808" />
      </g>
      {/* Lightning bolt */}
      <polyline points="430,50 415,110 435,110 420,180" stroke="#ffee00" strokeWidth={4} strokeLinejoin="round" strokeLinecap="round"
        style={{ animation: 'bg-flash 6s 2s ease-in-out infinite' }} />
      {/* Shield */}
      <g transform="translate(200,250)" style={{ animation: 'bg-drift-l 15s 0.5s linear infinite' }}>
        <circle cx={0} cy={0} r={28} fill="#3355cc" />
        <circle cx={0} cy={0} r={21} fill="#cc2222" />
        <circle cx={0} cy={0} r={13} fill="#3355cc" />
        <circle cx={0} cy={0} r={6} fill="#e0e0e0" />
      </g>
      {/* Stars */}
      <Stars n={50} />
      {/* Lightning flash */}
      <polyline points="580,30 566,90 582,90 568,170" stroke="#ffee00" strokeWidth={5} strokeLinejoin="round" strokeLinecap="round"
        strokeDasharray="150 150" style={{ animation: 'bg-lightning-draw 8s 3.5s linear infinite' }} />
    </svg>
  )
}

function Scene_superman() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="sm-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#003080" /><stop offset="50%" stopColor="#1060c0" /><stop offset="100%" stopColor="#c06000" /></linearGradient>
      </defs>
      <rect width={800} height={500} fill="url(#sm-bg)" />
      {/* Art-deco Metropolis skyline */}
      {[{x:0,w:70,h:280},{x:65,w:40,h:320},{x:100,w:55,h:260},{x:150,w:80,h:350},{x:225,w:35,h:300},{x:255,w:60,h:240},{x:580,w:60,h:300},{x:635,w:45,h:350},{x:675,w:70,h:270},{x:740,w:65,h:310}].map((b,i)=>(
        <g key={i}>
          <rect x={b.x} y={500-b.h} width={b.w} height={b.h} fill="#112244" />
          {/* Windows glowing */}
          {Array.from({length:6},(_,j)=>(
            <rect key={j} x={b.x+8+j%3*14} y={500-b.h+20+Math.floor(j/3)*25} width={8} height={10} rx={1}
              fill="#ffee80" opacity={0.4+j%2*0.3} style={{ animation: `bg-twinkle ${3+j*.5}s ${j*.3+i*.2}s ease-in-out infinite` }} />
          ))}
        </g>
      ))}
      {/* Superman flying */}
      <g style={{ animation: 'bg-fly 10s ease-in-out infinite' }}>
        {/* Cape */}
        <path d="M370,200 Q390,220 410,200 Q430,180 420,160 L390,170 Z" fill="#cc2222" />
        {/* Body */}
        <ellipse cx={390} cy={185} rx={20} ry={28} fill="#1040cc" />
        {/* S shield */}
        <ellipse cx={390} cy={188} rx={9} ry={11} fill="#ffee00" opacity={0.9} />
        <text x={386} y={193} fontSize={10} fill="#cc2222" fontWeight="bold">S</text>
        {/* Head + hair */}
        <circle cx={390} cy={158} r={15} fill="#f5c899" />
        <ellipse cx={390} cy={149} rx={16} ry={10} fill="#1a0808" />
        {/* Arm out front */}
        <line x1={390} y1={175} x2={350} y2={155} stroke="#1040cc" strokeWidth={12} strokeLinecap="round" />
        {/* Legs trailing */}
        <line x1={385} y1={213} x2={380} y2={245} stroke="#1040cc" strokeWidth={10} strokeLinecap="round" />
        <line x1={395} y1={213} x2={400} y2={245} stroke="#1040cc" strokeWidth={10} strokeLinecap="round" />
        {/* Speed lines */}
        {[155,165,175].map((y,i)=>(
          <line key={i} x1={415} y1={y} x2={445+i*5} y2={y} stroke="rgba(255,255,255,.3)" strokeWidth={1.5} />
        ))}
      </g>
      {/* Sunrise */}
      <circle cx={400} cy={500} r={200} fill="rgba(255,150,0,.2)" style={{ animation: 'bg-pulse 8s ease-in-out infinite' }} />
    </svg>
  )
}

function Scene_forest() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="for-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#020c08" /><stop offset="100%" stopColor="#041808" /></linearGradient>
      </defs>
      <rect width={800} height={500} fill="url(#for-bg)" />
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
      <ellipse cx={400} cy={470} rx={500} ry={50} fill="#144020" opacity={0.3} />
      <ellipse cx={200} cy={460} rx={300} ry={35} fill="#1a5028" opacity={0.2} />
      <ellipse cx={650} cy={465} rx={280} ry={38} fill="#143a18" opacity={0.25} />
      {/* Fireflies */}
      {Array.from({length:22},(_,i)=>(
        <circle key={i} cx={(i*113+50)%800} cy={250+(i%8)*30} r={2.5} fill="#aaff60" style={{ animation: `bg-twinkle ${1.5+i%.5}s ${i*.2}s ease-in-out infinite` }} />
      ))}
      {/* Firefly trails */}
      {Array.from({length:8},(_,i)=>(
        <circle key={i} cx={(i*137+80)%800} cy={280+(i%5)*25} r={4} fill="#80ff30" opacity={0.4} style={{ animation: `bg-float ${3+i*.4}s ${i*.5}s ease-in-out infinite` }} />
      ))}
    </svg>
  )
}

function Scene_panda() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="pa-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c8e8e0" /><stop offset="100%" stopColor="#80c8b0" /></linearGradient>
      </defs>
      <rect width={800} height={500} fill="url(#pa-bg)" />
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
      <g transform="translate(400,340)" style={{ animation: 'bg-float-sm 4s ease-in-out infinite' }}>
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
    </svg>
  )
}

function Scene_frog() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="fr-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0a2010" /><stop offset="100%" stopColor="#183028" /></linearGradient>
        <radialGradient id="moon-fr" cx="50%" cy="50%"><stop offset="0%" stopColor="#f5f0dc" /><stop offset="100%" stopColor="#e0d8b0" /></radialGradient>
      </defs>
      <rect width={800} height={500} fill="url(#fr-bg)" />
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
      {/* Frog on lily pad */}
      <g transform="translate(220,395)" style={{ animation: 'bg-jump 3s ease-in-out infinite' }}>
        <ellipse cx={0} cy={5} rx={30} ry={20} fill="#3a8840" /> {/* body */}
        <circle cx={0} cy={-14} r={20} fill="#4a9850" /> {/* head */}
        <circle cx={-10} cy={-22} r={8} fill="#5aa860" /> {/* eye L */}
        <circle cx={10} cy={-22} r={8} fill="#5aa860" /> {/* eye R */}
        <circle cx={-9} cy={-22} r={4} fill="#111" />
        <circle cx={11} cy={-22} r={4} fill="#111" />
        <path d="M-10,-4 Q0,2 10,-4" stroke="#2a6830" strokeWidth={2} fill="none" />
        {/* Legs */}
        <path d="M-25,10 Q-40,25 -30,30" stroke="#3a8840" strokeWidth={7} fill="none" strokeLinecap="round" />
        <path d="M25,10 Q40,25 30,30" stroke="#3a8840" strokeWidth={7} fill="none" strokeLinecap="round" />
      </g>
      {/* Fireflies */}
      {Array.from({length:14},(_,i)=>(
        <circle key={i} cx={(i*97+40)%800} cy={200+(i%6)*30} r={2.5} fill="#aaff60" style={{ animation: `bg-twinkle ${1.5+i*.3}s ${i*.2}s ease-in-out infinite` }} />
      ))}
      {/* Ripples on pond */}
      {[{cx:340,cy:430},{cx:480,cy:445}].map((r,i)=>(
        <ellipse key={i} cx={r.cx} cy={r.cy} rx={20} ry={10} fill="none" stroke="#3a8060" strokeWidth={1.5} opacity={0.5} style={{ animation: `bg-ripple ${3+i}s ${i}s ease-out infinite` }} />
      ))}
    </svg>
  )
}

function Scene_enchanted() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <radialGradient id="ench-bg" cx="50%" cy="40%"><stop offset="0%" stopColor="#1a0840" /><stop offset="100%" stopColor="#060215" /></radialGradient>
      </defs>
      <rect width={800} height={500} fill="url(#ench-bg)" />
      <Stars n={40} color="#d0c0ff" />
      {/* Magical portal ring */}
      <circle cx={400} cy={240} r={90} fill="none" stroke="#a040ff" strokeWidth={4} opacity={0.6} style={{ animation: 'bg-pulse 3s ease-in-out infinite' }} />
      <circle cx={400} cy={240} r={82} fill="rgba(160,60,255,.08)" />
      <circle cx={400} cy={240} r={95} fill="none" stroke="#60ffcc" strokeWidth={2} opacity={0.3} style={{ animation: 'bg-spin 15s linear infinite', transformOrigin: '400px 240px' }} />
      {/* Glowing mushrooms */}
      {[{x:120,y:420,c:'#ff80ff',h:40},{x:200,y:435,c:'#80ffcc',h:32},{x:600,y:415,c:'#ffaa40',h:45},{x:680,y:430,c:'#80c0ff',h:35}].map((m,i)=>(
        <g key={i} style={{ animation: `bg-glow ${2+i*.5}s ${i*.3}s ease-in-out infinite` }}>
          <rect x={m.x-6} y={m.y-m.h} width={12} height={m.h+15} rx={4} fill="#f5e8d0" />
          <ellipse cx={m.x} cy={m.y-m.h} rx={25} ry={15} fill={m.c} opacity={0.8} />
          <ellipse cx={m.x} cy={m.y-m.h+3} rx={22} ry={10} fill={m.c} opacity={0.4} />
          <ellipse cx={m.x} cy={m.y-m.h} rx={25} ry={15} fill={m.c} opacity={0.2} style={{ animation: 'bg-pulse 2s ease-in-out infinite', filter: 'blur(4px)' }} />
        </g>
      ))}
      {/* Fairy flying figure-8 */}
      <g style={{ animation: 'bg-float 2.5s ease-in-out infinite, bg-drift-l 20s linear infinite' }}>
        <circle cx={300} cy={200} r={6} fill="#ffee40" opacity={0.9} />
        {/* Wings */}
        <ellipse cx={291} cy={196} rx={12} ry={7} fill="#c0e0ff" opacity={0.7} transform="rotate(-30,291,196)" />
        <ellipse cx={309} cy={196} rx={12} ry={7} fill="#c0e0ff" opacity={0.7} transform="rotate(30,309,196)" />
        <ellipse cx={290} cy={204} rx={9} ry={5} fill="#c0e0ff" opacity={0.5} transform="rotate(20,290,204)" />
        <ellipse cx={310} cy={204} rx={9} ry={5} fill="#c0e0ff" opacity={0.5} transform="rotate(-20,310,204)" />
        {/* Sparkle trail */}
        {[1,2,3].map(j=>(
          <circle key={j} cx={300+j*12} cy={200+j*4} r={2} fill="#ffee40" opacity={0.5-j*.15} />
        ))}
      </g>
      {/* Twisted trees */}
      {[50,700].map((x,i)=>(
        <g key={i}>
          <path d={`M${x+25},500 Q${x+20},400 ${x+30},300 Q${x+15},200 ${x+25},100`} stroke="#3a2460" strokeWidth={18} fill="none" strokeLinecap="round" />
          <path d={`M${x+25},300 Q${x-20},270 ${x-30},240`} stroke="#3a2460" strokeWidth={10} fill="none" strokeLinecap="round" />
          <path d={`M${x+25},220 Q${x+65},195 ${x+75},170`} stroke="#3a2460" strokeWidth={8} fill="none" strokeLinecap="round" />
        </g>
      ))}
      {/* Magic sparkles */}
      {Array.from({length:18},(_,i)=>(
        <text key={i} x={(i*97+80)%800} y={150+(i%5)*60} fontSize={10} fill={['#ffee40','#ff80ff','#60ffcc'][i%3]} style={{ animation: `bg-twinkle ${1+i*.2}s ${i*.18}s ease-in-out infinite` }}>✦</text>
      ))}
    </svg>
  )
}

function Scene_minecraft() {
  const BLOCK = 32
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="mc-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4466cc" /><stop offset="100%" stopColor="#88aaee" /></linearGradient>
      </defs>
      <rect width={800} height={500} fill="url(#mc-sky)" />
      {/* Pixelated sun */}
      <rect x={680} y={60} width={BLOCK*2} height={BLOCK*2} fill="#FFE040" style={{ animation: 'bg-pulse-sm 3s ease-in-out infinite' }} />
      {/* Ground blocks */}
      {Array.from({length:26},(_,i)=>(<rect key={i} x={i*32} y={400} width={32} height={100} fill={i%3===0?'#567d46':i%3===1?'#6b5a3e':'#567d46'} stroke="#000" strokeWidth={0.5} />))}
      {Array.from({length:26},(_,i)=>(<rect key={i} x={i*32} y={432} width={32} height={68} fill="#8b6040" stroke="#000" strokeWidth={0.5} />))}
      {/* Tree blocks */}
      <rect x={128} y={300} width={32} height={104} fill="#8b6040" stroke="#000" strokeWidth={0.5} />
      <rect x={96} y={236} width={96} height={64} fill="#4a7a30" stroke="#000" strokeWidth={0.5} />
      <rect x={112} y={204} width={64} height={36} fill="#3a6a20" stroke="#000" strokeWidth={0.5} />
      {/* Creeper */}
      <g style={{ animation: 'bg-drift-l 16s ease-in-out infinite' }}>
        <rect x={380} y={316} width={40} height={84} fill="#44aa44" stroke="#000" strokeWidth={1} />
        <rect x={380} y={284} width={40} height={34} fill="#44aa44" stroke="#000" strokeWidth={1} />
        {/* Eyes */}
        <rect x={386} y={290} width={10} height={10} fill="#111" />
        <rect x={404} y={290} width={10} height={10} fill="#111" />
        {/* Mouth */}
        <rect x={390} y={305} width={6} height={6} fill="#111" />
        <rect x={384} y={311} width={6} height={6} fill="#111" />
        <rect x={404} y={311} width={6} height={6} fill="#111" />
        <rect x={390} y={311} width={20} height={6} fill="#111" />
        {/* Feet */}
        <rect x={382} y={400} width={16} height={16} fill="#3a9040" stroke="#000" strokeWidth={1} />
        <rect x={402} y={400} width={16} height={16} fill="#3a9040" stroke="#000" strokeWidth={1} />
      </g>
      {/* Pixel block blink (TNT) */}
      <rect x={600} y={368} width={32} height={32} fill="#cc3322" stroke="#000" strokeWidth={1} style={{ animation: 'bg-pixel-blink 2s ease-in-out infinite' }} />
      <rect x={608} y={375} width={16} height={8} fill="#f0e8d0" />
      <text x={610} y={383} fontSize={7} fill="#cc3322" fontWeight="bold">TNT</text>
    </svg>
  )
}

function Scene_autumnleaves() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="au-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#cc6620" /><stop offset="50%" stopColor="#e88030" /><stop offset="100%" stopColor="#a04010" /></linearGradient>
      </defs>
      <rect width={800} height={500} fill="url(#au-bg)" />
      {/* Setting sun */}
      <circle cx={680} cy={350} r={70} fill="#FFD040" opacity={0.85} style={{ animation: 'bg-glow 6s ease-in-out infinite' }} />
      {/* Rolling hills */}
      <ellipse cx={200} cy={480} rx={300} ry={100} fill="#4a2008" />
      <ellipse cx={600} cy={490} rx={320} ry={110} fill="#3a1808" />
      {/* Tree silhouettes */}
      {[100,250,500,680].map((x,i)=>(
        <g key={i}>
          <rect x={x+15} y={260+i%2*20} width={12} height={240} rx={4} fill="#3a1808" />
          <ellipse cx={x+21} cy={260+i%2*20} rx={55} ry={55} fill={['#cc4420','#dd6010','#bb3010','#ee7020'][i]} />
          <ellipse cx={x+10} cy={290+i%2*20} rx={45} ry={40} fill={['#aa3010','#cc5010','#993010','#dd6020'][i]} />
        </g>
      ))}
      {/* Falling leaves */}
      {Array.from({length:20},(_,i)=>(
        <ellipse key={i} cx={(i*113+30)%800} cy={0} rx={6} ry={9} fill={['#cc4420','#dd6010','#ee8020','#bb3010','#ff6030'][i%5]} style={{ animation: `bg-leaf-fall ${5+i*.4}s ${i*.3}s linear infinite` }} transform={`rotate(${i*30})`} />
      ))}
      {/* Ground leaves */}
      {Array.from({length:10},(_,i)=>(
        <ellipse key={i} cx={(i*87+40)%800} cy={450+i%3*10} rx={8} ry={5} fill={['#cc4420','#dd6010','#ee8020'][i%3]} opacity={0.7} />
      ))}
    </svg>
  )
}

function Scene_dinosaur() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="di-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6a2000" /><stop offset="50%" stopColor="#c84000" /><stop offset="100%" stopColor="#d86020" /></linearGradient>
      </defs>
      <rect width={800} height={500} fill="url(#di-bg)" />
      {/* Volcano */}
      <polygon points="600,500 680,200 760,500" fill="#3a1808" />
      <polygon points="650,500 680,200 720,500" fill="#2a1006" />
      {/* Lava flow */}
      <ellipse cx={680} cy={500} rx={60} ry={20} fill="#ff4400" opacity={0.7} />
      {/* Volcano eruption particles */}
      {Array.from({length:8},(_,i)=>(
        <circle key={i} cx={680+(i%4-2)*15} cy={200} r={4+i%3*2} fill={i%2===0?'#ff4400':'#ff8800'} style={{ animation: `bg-volcano ${2+i*.3}s ${i*.25}s ease-out infinite` }} />
      ))}
      {/* Prehistoric plants - giant ferns */}
      {[30,120,220].map((x,i)=>(
        <g key={i}>
          <rect x={x+10} y={350} width={8} height={150} rx={3} fill="#2a4a10" />
          {[-40,-20,0,20,40].map((a,j)=>(
            <ellipse key={j} cx={x+14} cy={350+j*5} rx={30} ry={12} fill="#3a6a18" transform={`rotate(${a},${x+14},${350+j*5})`} style={{ animation: `bg-sway-sm ${3+j*.2}s ${j*.2}s ease-in-out infinite` }} />
          ))}
        </g>
      ))}
      {/* T-Rex walking */}
      <g style={{ animation: 'bg-drift-l 18s linear infinite' }}>
        <g transform="translate(450,320)">
          {/* Body */}
          <ellipse cx={0} cy={0} rx={70} ry={45} fill="#4a7820" />
          {/* Head */}
          <ellipse cx={-80} cy={-45} rx={48} ry={28} fill="#4a7820" />
          {/* Jaw */}
          <ellipse cx={-88} cy={-32} rx={40} ry={14} fill="#3a6010" />
          {/* Teeth */}
          {[-100,-88,-76].map((tx,i)=>(
            <polygon key={i} points={`${tx},-28 ${tx+5},-38 ${tx+10},-28`} fill="white" />
          ))}
          {/* Eye */}
          <circle cx={-68} cy={-52} r={8} fill="#ff6600" />
          <circle cx={-65} cy={-52} r={4} fill="#111" />
          {/* Tiny arms */}
          <line x1={-20} y1={-25} x2={-5} y2={-5} stroke="#4a7820" strokeWidth={12} strokeLinecap="round" />
          {/* Tail */}
          <path d="M70,0 Q130,15 160,50" stroke="#4a7820" strokeWidth={28} fill="none" strokeLinecap="round" />
          {/* Legs */}
          <rect x={-25} y={35} width={22} height={55} rx={8} fill="#3a6010" style={{ animation: 'bg-float-sm 1s ease-in-out infinite' }} />
          <rect x={10} y={35} width={22} height={55} rx={8} fill="#3a6010" style={{ animation: 'bg-float-sm 1s 0.5s ease-in-out infinite' }} />
          {/* Spots */}
          {[[-30,10],[20,-5],[50,15]].map(([dx,dy],i)=>(
            <ellipse key={i} cx={dx} cy={dy} rx={8} ry={5} fill="#3a6010" opacity={0.5} />
          ))}
        </g>
      </g>
      {/* Ground */}
      <rect x={0} y={430} width={800} height={70} fill="#3a2808" />
    </svg>
  )
}

function Scene_ocean() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="oc-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#001840" /><stop offset="100%" stopColor="#004080" /></linearGradient>
      </defs>
      <rect width={800} height={500} fill="url(#oc-bg)" />
      {/* Light rays from surface */}
      {[120,250,400,550,680].map((x,i)=>(
        <polygon key={i} points={`${x-20},0 ${x+20},0 ${x+60},500 ${x-60},500`} fill="#4488ff" opacity={0.05+i%2*.03} style={{ animation: `bg-glow ${4+i}s ${i*.5}s ease-in-out infinite` }} />
      ))}
      {/* Whale */}
      <g style={{ animation: 'bg-swim 25s linear infinite' }}>
        <ellipse cx={400} cy={180} rx={110} ry={52} fill="#2a3060" />
        <ellipse cx={380} cy={168} rx={40} ry={20} fill="#e8e0d0" opacity={0.6} /> {/* belly */}
        <path d="M510,180 Q540,155 540,200 Q540,225 510,210Z" fill="#2a3060" /> {/* tail */}
        <circle cx={336} cy={165} r={10} fill="#1a2050" />
        <circle cx={338} cy={163} r={4} fill="white" />
        {/* Spout */}
        <path d="M360,140 Q355,110 365,90" stroke="#88bbff" strokeWidth={4} fill="none" opacity={0.6} style={{ animation: 'bg-glow 3s ease-in-out infinite' }} />
        <ellipse cx={362} cy={88} rx={10} ry={6} fill="#88bbff" opacity={0.4} />
      </g>
      {/* Coral reef */}
      {[{x:80,c:'#ff6060'},{x:180,c:'#ff9940'},{x:600,c:'#ff4080'},{x:700,c:'#40e090'}].map((r,i)=>(
        <g key={i}>
          <polygon points={`${r.x},460 ${r.x-20},500 ${r.x+20},500`} fill={r.c} />
          <polygon points={`${r.x-12},450 ${r.x-30},500 ${r.x+5},500`} fill={r.c} opacity={0.7} />
          <polygon points={`${r.x+12},455 ${r.x-3},500 ${r.x+28},500`} fill={r.c} opacity={0.8} />
        </g>
      ))}
      {/* Fish schools */}
      {Array.from({length:8},(_,i)=>(
        <g key={i} style={{ animation: `bg-drift-l ${8+i*.5}s ${i*.7}s linear infinite` }}>
          <ellipse cx={200+i*20} cy={280+i%3*30} rx={12} ry={6} fill="#ffa040" opacity={0.8} />
          <polygon points={`212,${280+i%3*30} 222,${274+i%3*30} 222,${286+i%3*30}`} fill="#ffa040" opacity={0.8} />
        </g>
      ))}
      {/* Bubbles */}
      {Array.from({length:10},(_,i)=>(
        <circle key={i} cx={(i*113+50)%800} cy={480} r={3+i%3} fill="none" stroke="#60aaff" strokeWidth={1} opacity={0.5} style={{ animation: `bg-bubble ${4+i*.4}s ${i*.5}s linear infinite` }} />
      ))}
    </svg>
  )
}

function Scene_shark() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="sh-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#000818" /><stop offset="100%" stopColor="#001828" /></linearGradient>
      </defs>
      <rect width={800} height={500} fill="url(#sh-bg)" />
      {/* Very faint light from above */}
      <ellipse cx={400} cy={0} rx={300} ry={80} fill="#2060a0" opacity={0.12} />
      {/* Shark — large, slowly circling */}
      <g style={{ animation: 'bg-swim 20s linear infinite' }}>
        {/* Body */}
        <ellipse cx={400} cy={250} rx={140} ry={55} fill="#60707a" />
        {/* Belly */}
        <ellipse cx={400} cy={268} rx={110} ry={30} fill="#c8c8d0" opacity={0.7} />
        {/* Head/snout */}
        <ellipse cx={260} cy={250} rx={50} ry={42} fill="#60707a" />
        {/* Teeth visible */}
        {[274,284,294,304,314].map((x,i)=>(
          <polygon key={i} points={`${x},264 ${x+4},255 ${x+8},264`} fill="white" opacity={0.9} />
        ))}
        {/* Eye */}
        <circle cx={282} cy={244} r={9} fill="white" />
        <circle cx={281} cy={244} r={5} fill="#111" />
        {/* Dorsal fin — prominent */}
        <polygon points="360,200 380,130 420,200" fill="#505a64" />
        {/* Pectoral fins */}
        <polygon points="380,265 360,310 310,280" fill="#505a64" />
        <polygon points="420,265 440,310 490,280" fill="#505a64" />
        {/* Tail fin */}
        <path d="M540,250 Q580,210 590,240 Q580,270 590,300 Q580,295 540,250" fill="#505a64" />
      </g>
      {/* Small fish fleeing */}
      {Array.from({length:6},(_,i)=>(
        <g key={i} style={{ animation: `bg-swim ${4+i*.3}s ${i*.4}s linear infinite` }}>
          <ellipse cx={200+i*30} cy={180+i%3*25} rx={9} ry={4} fill="#ffe090" opacity={0.7} />
          <polygon points={`209,${180+i%3*25} 217,${176+i%3*25} 217,${184+i%3*25}`} fill="#ffe090" opacity={0.7} />
        </g>
      ))}
      {/* Bubbles */}
      {Array.from({length:8},(_,i)=>(
        <circle key={i} cx={(i*120+30)%800} cy={490} r={2+i%3} fill="none" stroke="#4080a0" strokeWidth={1} opacity={0.4} style={{ animation: `bg-bubble ${5+i*.5}s ${i*.6}s linear infinite` }} />
      ))}
      {/* Dark seaweed */}
      {[50,200,650,750].map((x,i)=>(
        <path key={i} d={`M${x},500 Q${x+15},460 ${x},430 Q${x+20},400 ${x},370`} stroke="#104020" strokeWidth={6} fill="none" strokeLinecap="round" style={{ animation: `bg-sway-sm ${3+i*.3}s ease-in-out infinite` }} />
      ))}
    </svg>
  )
}

function Scene_mermaid() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="mr-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#001060" /><stop offset="100%" stopColor="#003090" /></linearGradient>
        <radialGradient id="mr-glow" cx="50%" cy="50%"><stop offset="0%" stopColor="#60e0ff" stopOpacity={0.15} /><stop offset="100%" stopColor="#60e0ff" stopOpacity={0} /></radialGradient>
      </defs>
      <rect width={800} height={500} fill="url(#mr-bg)" />
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
      {/* Mermaid swimming across */}
      <g style={{ animation: 'bg-swim 18s ease-in-out infinite' }}>
        {/* Tail */}
        <ellipse cx={400} cy={220} rx={20} ry={65} fill="#20d0a0" transform="rotate(20,400,220)" />
        <path d="M385,280 Q400,320 415,280" fill="#20d0a0" />
        <path d="M375,295 Q400,340 425,295" fill="#18b090" opacity={0.8} />
        {/* Body */}
        <ellipse cx={395} cy={165} rx={22} ry={35} fill="#f5c8a8" />
        {/* Seashell top */}
        <ellipse cx={390} cy={160} rx={18} ry={8} fill="#ff80a0" opacity={0.8} transform="rotate(-10,390,160)" />
        <ellipse cx={400} cy={163} rx={18} ry={8} fill="#ff8090" opacity={0.8} transform="rotate(10,400,163)" />
        {/* Head + flowing hair */}
        <circle cx={393} cy={132} r={20} fill="#f0c0a0" />
        <ellipse cx={392} cy={120} rx={23} ry={15} fill="#80a830" /> {/* hair top */}
        <path d="M375,130 Q358,155 362,175" stroke="#70a020" strokeWidth={8} fill="none" strokeLinecap="round" />
        <path d="M415,132 Q428,158 420,180" stroke="#70a020" strokeWidth={8} fill="none" strokeLinecap="round" />
        {/* Eyes */}
        <circle cx={387} cy={134} r={4} fill="#2a1808" />
        <circle cx={400} cy={134} r={4} fill="#2a1808" />
        {/* Arm reaching */}
        <line x1={390} y1={155} x2={355} y2={140} stroke="#f0c0a0" strokeWidth={10} strokeLinecap="round" />
      </g>
      {/* Tropical fish */}
      {[{x:120,y:200,c:'#ff6040'},{x:650,y:310,c:'#40e0b0'},{x:300,y:380,c:'#ffcc20'}].map((f,i)=>(
        <g key={i} style={{ animation: `bg-drift-r ${8+i*2}s ${i}s linear infinite` }}>
          <ellipse cx={f.x} cy={f.y} rx={14} ry={8} fill={f.c} />
          <polygon points={`${f.x+14},${f.y} ${f.x+23},${f.y-7} ${f.x+23},${f.y+7}`} fill={f.c} />
          <line x1={f.x-4} y1={f.y} x2={f.x+12} y2={f.y} stroke="rgba(0,0,0,.3)" strokeWidth={1} />
        </g>
      ))}
      {/* Bubbles */}
      {Array.from({length:12},(_,i)=>(
        <circle key={i} cx={(i*93+60)%800} cy={480} r={2+i%4} fill="none" stroke="#80e0ff" strokeWidth={1} opacity={0.4} style={{ animation: `bg-bubble ${3+i*.4}s ${i*.35}s linear infinite` }} />
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
      <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 2 }}>
        <defs>
          <linearGradient id="mo-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0a0a18" /><stop offset="100%" stopColor="#101828" /></linearGradient>
        </defs>
        <rect width={800} height={500} fill="url(#mo-bg)" />
        {/* Dark storm clouds — multiple moving layers */}
        <ellipse cx={200} cy={100} rx={200} ry={80} fill="#1a1a28" style={{ animation: 'bg-cloud-drift 12s ease-in-out infinite alternate' }} />
        <ellipse cx={280} cy={75} rx={170} ry={70} fill="#222230" style={{ animation: 'bg-cloud-drift 10s ease-in-out infinite alternate' }} />
        <ellipse cx={550} cy={90} rx={220} ry={85} fill="#181828" style={{ animation: 'bg-cloud-drift 14s ease-in-out infinite alternate-reverse' }} />
        <ellipse cx={650} cy={65} rx={180} ry={70} fill="#202030" style={{ animation: 'bg-cloud-drift 9s ease-in-out infinite alternate-reverse' }} />
        <ellipse cx={400} cy={120} rx={250} ry={90} fill="#141422" style={{ animation: 'bg-cloud-drift 11s ease-in-out infinite alternate' }} />
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
        <rect x={0} y={460} width={800} height={40} fill="#0a1020" />
        {[150,350,550,700].map((x,i)=>(
          <ellipse key={i} cx={x} cy={475} rx={25} ry={8} fill="none" stroke="#3060a0" strokeWidth={1.5} opacity={0.5} style={{ animation: `bg-ripple ${1.5+i*.3}s ${i*.3}s ease-out infinite` }} />
        ))}
      </svg>
    </>
  )
}

function Scene_candy() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="ca-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff80cc" /><stop offset="100%" stopColor="#ffbbee" /></linearGradient>
      </defs>
      <rect width={800} height={500} fill="url(#ca-bg)" />
      {/* Cotton candy clouds */}
      {[{cx:120,cy:80,c:'#ffccee'},{cx:400,cy:60,c:'#ffddee'},{cx:680,cy:90,c:'#ffccdd'}].map((c,i)=>(
        <g key={i}>
          <ellipse cx={c.cx} cy={c.cy} rx={90} ry={45} fill={c.c} opacity={0.8} style={{ animation: `bg-cloud-drift ${8+i*2}s ease-in-out infinite alternate` }} />
          <ellipse cx={c.cx+30} cy={c.cy-10} rx={70} ry={38} fill={c.c} opacity={0.7} style={{ animation: `bg-cloud-drift ${8+i*2}s ease-in-out infinite alternate` }} />
        </g>
      ))}
      {/* Rainbow arc */}
      {['#ff4040','#ff8800','#ffee00','#40cc40','#4080ff','#8040ff'].map((c,i)=>(
        <ellipse key={i} cx={400} cy={500} rx={350-i*22} ry={250-i*16} fill="none" stroke={c} strokeWidth={12} opacity={0.5} />
      ))}
      {/* Candy cane forest */}
      {[60,160,560,680].map((x,i)=>(
        <g key={i} style={{ animation: `bg-sway-sm ${3+i*.3}s ${i*.3}s ease-in-out infinite` }}>
          <rect x={x+8} y={220} width={14} height={260} rx={7} fill="white" />
          {Array.from({length:8},(_,j)=>(
            <rect key={j} x={x+8} y={220+j*32} width={14} height={16} rx={5} fill="#ff2244" opacity={0.9} />
          ))}
          {/* Hook top */}
          <ellipse cx={x+22} cy={224} rx={16} ry={18} fill="none" stroke="white" strokeWidth={14} strokeDasharray="60 60" />
          <ellipse cx={x+22} cy={224} rx={16} ry={18} fill="none" stroke="#ff2244" strokeWidth={14} strokeDasharray="15 15 15 15" />
        </g>
      ))}
      {/* Gingerbread house */}
      <g transform="translate(320,330)">
        <rect x={0} y={0} width={160} height={100} rx={6} fill="#c87830" />
        <polygon points="0,0 80,-80 160,0" fill="#a05520" />
        <rect x={55} y={40} width={50} height={60} rx={4} fill="#88441a" /> {/* door */}
        {/* Icing */}
        <path d="M0,0 Q40,-85 80,-80 Q120,-85 160,0" stroke="white" strokeWidth={6} fill="none" opacity={0.8} />
        {/* Candy dots */}
        {[20,40,100,130].map((cx,i)=>(
          <circle key={i} cx={cx} cy={20+i%2*30} r={7} fill={['#ff4080','#40ff80','#ffee40','#4080ff'][i]} />
        ))}
      </g>
      {/* Sprinkle rain */}
      {Array.from({length:18},(_,i)=>(
        <rect key={i} x={(i*97+20)%800} y={0} width={4} height={10} rx={2} fill={['#ff4080','#40ff80','#ffee40','#4080ff','#ff8040'][i%5]} style={{ animation: `bg-fall ${3+i*.4}s ${i*.2}s linear infinite` }} transform={`rotate(${i*20})`} />
      ))}
    </svg>
  )
}

function Scene_bubblegum() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="bg2-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f0c0e8" /><stop offset="100%" stopColor="#f8e0f5" /></linearGradient>
      </defs>
      <rect width={800} height={500} fill="url(#bg2-bg)" />
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
          <circle cx={(i*113+30)%800} cy={480} r={8+i%5*5} fill="none" stroke={['#ff80c0','#80c0ff','#80ffc0','#ffc080'][i%4]} strokeWidth={2} opacity={0.5} />
          <ellipse cx={(i*113+33)%800-5} cy={480-6} rx={4} ry={2} fill="white" opacity={0.4} />
        </g>
      ))}
      {/* Cotton candy clouds */}
      {[100,400,650].map((x,i)=>(
        <ellipse key={i} cx={x} cy={80+i*20} rx={80} ry={38} fill="rgba(255,180,220,.6)" style={{ animation: `bg-cloud-drift ${8+i*2}s ease-in-out infinite alternate` }} />
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
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="ic-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fffbe8" /><stop offset="100%" stopColor="#fff0e8" /></linearGradient>
      </defs>
      <rect width={800} height={500} fill="url(#ic-bg)" />
      {/* Rainbow */}
      {['#ff4040','#ff8800','#ffee00','#40cc40','#4080ff','#8040ff'].map((c,i)=>(
        <ellipse key={i} cx={400} cy={500} rx={380-i*25} ry={280-i*18} fill="none" stroke={c} strokeWidth={14} opacity={0.45} />
      ))}
      {/* Ice cream mountains */}
      {[{x:100,scoops:['#ff80a0','#ffccaa']},{x:400,scoops:['#80c0ff','#c080ff','#ffaa80']},{x:680,scoops:['#90e090','#ffe090']}].map((m,i)=>(
        <g key={i}>
          <polygon points={`${m.x-50},450 ${m.x},270 ${m.x+50},450`} fill="#f5e4d0" />
          {m.scoops.map((c,j)=>(
            <circle key={j} cx={m.x} cy={270-j*55} r={45} fill={c} opacity={0.85} style={{ animation: `bg-float-sm ${3+j}s ${j*.4}s ease-in-out infinite` }} />
          ))}
          {/* Cherry on top */}
          <circle cx={m.x} cy={270-m.scoops.length*55+5} r={10} fill="#ff2244" />
          <path d={`M${m.x},${260-m.scoops.length*55} Q${m.x+15},${240-m.scoops.length*55} ${m.x+8},${250-m.scoops.length*55}`} stroke="#20a020" strokeWidth={2} fill="none" />
        </g>
      ))}
      {/* Sprinkle rain */}
      {Array.from({length:20},(_,i)=>(
        <rect key={i} x={(i*83+10)%800} y={0} width={5} height={12} rx={2.5} fill={['#ff4080','#40c0ff','#ffee40','#80ff80','#ff8040'][i%5]} style={{ animation: `bg-fall ${4+i*.35}s ${i*.2}s linear infinite` }} transform={`rotate(${i*20})`} />
      ))}
    </svg>
  )
}

function Scene_pizza() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="pz-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff8800" /><stop offset="100%" stopColor="#cc5500" /></linearGradient>
      </defs>
      <rect width={800} height={500} fill="url(#pz-bg)" />
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
    </svg>
  )
}

function Scene_donut() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="do-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ffe0f0" /><stop offset="100%" stopColor="#ffd0e8" /></linearGradient>
      </defs>
      <rect width={800} height={500} fill="url(#do-bg)" />
      {/* Floating donuts */}
      {[{cx:150,cy:200,c:'#ff80a0',f:'#f5c090',d:5},{cx:400,cy:160,c:'#80c0ff',f:'#f5e0c0',d:7},{cx:650,cy:220,c:'#80ff80',f:'#f5c8a0',d:6},{cx:280,cy:360,c:'#c080ff',f:'#f5d0b0',d:8},{cx:560,cy:340,c:'#ff9040',f:'#f5c898',d:5}].map((d,i)=>(
        <g key={i} style={{ animation: `bg-float ${d.d}s ${i*.6}s ease-in-out infinite, bg-spin-slow ${15+i*3}s ${i}s linear infinite`, transformOrigin: `${d.cx}px ${d.cy}px` }}>
          {/* Donut body */}
          <circle cx={d.cx} cy={d.cy} r={48} fill={d.f} />
          <circle cx={d.cx} cy={d.cy} r={22} fill="#ffe0f0" /> {/* hole */}
          {/* Frosting on top half */}
          <clipPath id={`do-clip-${i}`}><rect x={d.cx-50} y={d.cy-50} width={100} height={50} /></clipPath>
          <circle cx={d.cx} cy={d.cy} r={48} fill={d.c} opacity={0.75} clipPath={`url(#do-clip-${i})`} />
          <circle cx={d.cx} cy={d.cy} r={22} fill="#ffe0f0" clipPath={`url(#do-clip-${i})`} />
          {/* Sprinkles on frosting */}
          {[0,1,2,3].map(j=>(
            <rect key={j} cx={d.cx-20+j*12} cy={d.cy-35+j%2*10} x={d.cx-20+j*12} y={d.cy-38+j%2*10} width={5} height={10} rx={2.5} fill={['#ff4080','#40c0ff','#ffee40','#80ff80'][j]} transform={`rotate(${j*40},${d.cx-18+j*12},${d.cy-33})`} clipPath={`url(#do-clip-${i})`} />
          ))}
        </g>
      ))}
      {/* Sprinkle rain */}
      {Array.from({length:18},(_,i)=>(
        <rect key={i} x={(i*83+20)%800} y={0} width={5} height={12} rx={2.5} fill={['#ff4080','#40c0ff','#ffee40','#80ff80'][i%4]} style={{ animation: `bg-fall ${4+i*.3}s ${i*.22}s linear infinite` }} transform={`rotate(${i*22})`} />
      ))}
    </svg>
  )
}

function Scene_unicorn() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="un-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c080ff" /><stop offset="50%" stopColor="#ff80cc" /><stop offset="100%" stopColor="#80c8ff" /></linearGradient>
      </defs>
      <rect width={800} height={500} fill="url(#un-bg)" />
      {/* Bold rainbow */}
      {['#ff4040','#ff8800','#ffee00','#40cc40','#4080ff','#8040ff'].map((c,i)=>(
        <ellipse key={i} cx={400} cy={500} rx={400-i*28} ry={310-i*20} fill="none" stroke={c} strokeWidth={16} opacity={0.6} />
      ))}
      {/* Cloud islands */}
      {[{cx:150,cy:120},{cx:650,cy:100}].map((c,i)=>(
        <g key={i}>
          <ellipse cx={c.cx} cy={c.cy} rx={100} ry={45} fill="white" opacity={0.9} style={{ animation: `bg-float ${6+i*2}s ease-in-out infinite` }} />
          <ellipse cx={c.cx+25} cy={c.cy-20} rx={75} ry={38} fill="white" opacity={0.85} style={{ animation: `bg-float ${6+i*2}s ease-in-out infinite` }} />
        </g>
      ))}
      {/* Unicorn running across */}
      <g style={{ animation: 'bg-drift-lr 15s ease-in-out infinite' }}>
        {/* Body */}
        <ellipse cx={400} cy={290} rx={80} ry={45} fill="white" />
        {/* Head */}
        <ellipse cx={323} cy={265} rx={38} ry={30} fill="white" />
        {/* Horn */}
        <polygon points="310,248 300,200 320,248" fill="#c080ff" />
        {/* Mane */}
        <path d="M330,248 Q340,230 355,245 Q365,228 375,244 Q385,226 395,244" stroke="#ff80cc" strokeWidth={6} fill="none" />
        <path d="M330,248 Q340,230 355,245 Q365,228 375,244 Q385,226 395,244" stroke="#a060ff" strokeWidth={3} fill="none" />
        {/* Eye */}
        <circle cx={312} cy={268} r={6} fill="#8040cc" />
        <circle cx={313} cy={267} r={3} fill="white" />
        {/* Legs (galloping) */}
        <line x1={350} y1={335} x2={340} y2={390} stroke="white" strokeWidth={12} strokeLinecap="round" style={{ animation: 'bg-float-sm 0.8s ease-in-out infinite' }} />
        <line x1={380} y1={335} x2={395} y2={390} stroke="white" strokeWidth={12} strokeLinecap="round" style={{ animation: 'bg-float-sm 0.8s 0.4s ease-in-out infinite' }} />
        <line x1={420} y1={335} x2={410} y2={390} stroke="white" strokeWidth={12} strokeLinecap="round" style={{ animation: 'bg-float-sm 0.8s 0.2s ease-in-out infinite' }} />
        <line x1={450} y1={335} x2={460} y2={390} stroke="white" strokeWidth={12} strokeLinecap="round" style={{ animation: 'bg-float-sm 0.8s 0.6s ease-in-out infinite' }} />
        {/* Tail */}
        <path d="M480,300 Q520,270 510,310 Q530,280 518,330" stroke="#ff80cc" strokeWidth={8} fill="none" strokeLinecap="round" />
        {/* Sparkle trail */}
        {[{x:500,y:290},{x:520,y:310},{x:540,y:295}].map((s,i)=>(
          <text key={i} x={s.x} y={s.y} fontSize={14} fill="#ffee40" style={{ animation: `bg-twinkle ${1+i*.3}s ${i*.2}s ease-in-out infinite` }}>✦</text>
        ))}
      </g>
      {/* Sparkle explosions */}
      {Array.from({length:16},(_,i)=>(
        <text key={i} x={(i*107+30)%800} y={80+(i%6)*60} fontSize={12+i%4*4} fill={['#ffee40','#ff80cc','#80ffee','#ffffff'][i%4]} style={{ animation: `bg-twinkle ${1.2+i*.25}s ${i*.18}s ease-in-out infinite` }}>✦</text>
      ))}
    </svg>
  )
}

function Scene_storymagic() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="sm2-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0a1040" /><stop offset="100%" stopColor="#181858" /></linearGradient>
      </defs>
      <rect width={800} height={500} fill="url(#sm2-bg)" />
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
      <g transform="translate(580,250)" style={{ animation: 'bg-float 4s ease-in-out infinite' }}>
        <path d="M0,0 Q-30,-50 -10,-100 Q20,-60 0,0Z" fill="#e8e0c0" />
        <path d="M0,0 Q-5,-45 5,-90" stroke="#c0a840" strokeWidth={2} fill="none" />
        <rect x={-2} y={-2} width={4} height={30} rx={2} fill="#4a3010" />
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
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <radialGradient id="ww-bg" cx="50%" cy="50%"><stop offset="0%" stopColor="#1a0860" /><stop offset="100%" stopColor="#060218" /></radialGradient>
      </defs>
      <rect width={800} height={500} fill="url(#ww-bg)" />
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
    </svg>
  )
}

function Scene_goldstar() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="gs-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2a1800" /><stop offset="100%" stopColor="#4a2c00" /></linearGradient>
      </defs>
      <rect width={800} height={500} fill="url(#gs-bg)" />
      {/* Spotlight beams */}
      {[150,400,650].map((x,i)=>(
        <polygon key={i} points={`${x-15},0 ${x+15},0 ${x+80},500 ${x-80},500`} fill="#ffe080" opacity={0.06} style={{ animation: `bg-pulse ${4+i}s ${i}s ease-in-out infinite` }} />
      ))}
      {/* Trophy */}
      <g transform="translate(400,300)">
        <rect x={-22} y={50} width={44} height={18} rx={4} fill="#cc8800" />
        <rect x={-12} y={40} width={24} height={15} rx={3} fill="#cc8800" />
        <path d="M-40,-80 Q-55,-50 -40,0 L40,0 Q55,-50 40,-80Z" fill="#ffd040" />
        <path d="M-40,-80 Q-55,-50 -40,0" stroke="#ffee80" strokeWidth={4} fill="none" />
        <path d="M40,-80 Q55,-50 40,0" stroke="#ffee80" strokeWidth={4} fill="none" />
        <ellipse cx={0} cy={-40} rx={25} ry={22} fill="#ffee80" opacity={0.4} />
        {/* Star on trophy */}
        <text x={-10} y={-28} fontSize={22} fill="#cc6600">★</text>
      </g>
      {/* Gold stars cascading */}
      {Array.from({length:20},(_,i)=>(
        <text key={i} x={(i*107+10)%800} y={0} fontSize={16+i%4*6} fill={i%3===0?'#ffd040':i%3===1?'#ffee80':'#cc8800'} style={{ animation: `bg-fall ${3+i*.35}s ${i*.22}s linear infinite`, '--cx': `${(i%2===0?1:-1)*20}px` }}>★</text>
      ))}
      {/* Confetti */}
      {Array.from({length:16},(_,i)=>(
        <rect key={i} x={(i*97+30)%800} y={0} width={8} height={12} rx={2} fill={['#ff4080','#40c0ff','#ffee40','#80ff80','#ff8040'][i%5]} style={{ animation: `bg-fall ${4+i*.4}s ${i*.28}s linear infinite`, transform: `rotate(${i*22}deg)` }} />
      ))}
    </svg>
  )
}

function Scene_rangoli() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="ra-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a0a2a" /><stop offset="100%" stopColor="#0a0518" /></linearGradient>
      </defs>
      <rect width={800} height={500} fill="url(#ra-bg)" />
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
    </svg>
  )
}

function Scene_kolam() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="ko-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0a1808" /><stop offset="100%" stopColor="#060e04" /></linearGradient>
      </defs>
      <rect width={800} height={500} fill="url(#ko-bg)" />
      {/* Dot grid */}
      {Array.from({length:9},(_,row)=>Array.from({length:15},(_,col)=>(
        <circle key={`${row}-${col}`} cx={50+col*52} cy={50+row*50} r={3} fill="white" opacity={0.35+row%3*.1} style={{ animation: `bg-twinkle ${2+row*.3+col*.1}s ${col*.08+row*.12}s ease-in-out infinite` }} />
      )))}
      {/* Kolam connecting lines — flowing curves */}
      <path d="M50,50 Q200,150 400,50 Q600,150 750,50" stroke="#ffffff" strokeWidth={1.5} fill="none" opacity={0.3} style={{ animation: 'bg-glow 4s ease-in-out infinite' }} />
      <path d="M50,150 Q150,250 250,150 Q350,50 450,150 Q550,250 650,150 Q750,250 800,150" stroke="#ff9020" strokeWidth={1.5} fill="none" opacity={0.4} style={{ animation: 'bg-glow 5s ease-in-out infinite' }} />
      <path d="M100,300 Q200,200 300,300 Q400,400 500,300 Q600,200 700,300" stroke="#40c0a0" strokeWidth={1.5} fill="none" opacity={0.35} style={{ animation: 'bg-glow 6s ease-in-out infinite' }} />
      <path d="M50,450 Q200,350 400,450 Q600,350 750,450" stroke="#c040ff" strokeWidth={1.5} fill="none" opacity={0.3} style={{ animation: 'bg-glow 5s 1s ease-in-out infinite' }} />
      {/* Flower patterns at intersections */}
      {[{x:200,y:150},{x:400,y:250},{x:600,y:150},{x:300,y:350},{x:500,y:350}].map((f,i)=>(
        <g key={i} style={{ animation: `bg-spin-slow ${20+i*4}s ${i*2}s linear infinite`, transformOrigin: `${f.x}px ${f.y}px` }}>
          {[0,60,120,180,240,300].map((a,j)=>(
            <ellipse key={j} cx={f.x+20*Math.cos(a*Math.PI/180)} cy={f.y+20*Math.sin(a*Math.PI/180)} rx={12} ry={6} fill={['#ff9020','#40c0a0','#c040ff'][i%3]} opacity={0.4} transform={`rotate(${a},${f.x+20*Math.cos(a*Math.PI/180)},${f.y+20*Math.sin(a*Math.PI/180)})`} />
          ))}
          <circle cx={f.x} cy={f.y} r={6} fill={['#ffee40','#80ffaa','#ffaa80'][i%3]} opacity={0.7} />
        </g>
      ))}
    </svg>
  )
}

function Scene_fairygarden() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="fg-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c8f0e8" /><stop offset="100%" stopColor="#a0e0c8" /></linearGradient>
      </defs>
      <rect width={800} height={500} fill="url(#fg-bg)" />
      {/* Mushroom circle */}
      {[0,60,120,180,240,300].map((a,i)=>(
        <g key={i} transform={`translate(${400+120*Math.cos(a*Math.PI/180)},${320+60*Math.sin(a*Math.PI/180)})`}>
          <rect x={-6} y={-30} width={12} height={35} rx={4} fill="#f5e8d0" />
          <ellipse cx={0} cy={-30} rx={22} ry={14} fill={i%2===0?'#cc2222':'#cc6622'} />
          <ellipse cx={-5} cy={-34} rx={4} ry={3} fill="white" opacity={0.6} />
          <ellipse cx={6} cy={-28} rx={3} ry={2} fill="white" opacity={0.5} />
        </g>
      ))}
      {/* Flowers */}
      {[{x:100,y:400,c:'#ff80a0'},{x:200,y:420,c:'#ff9040'},{x:600,y:410,c:'#c060ff'},{x:700,y:400,c:'#60c0ff'},{x:500,y:430,c:'#ffee40'}].map((f,i)=>(
        <g key={i}>
          <rect x={f.x-3} y={f.y-40} width={6} height={44} rx={2} fill="#40a040" style={{ animation: `bg-sway-sm ${3+i*.3}s ease-in-out infinite` }} />
          {[0,72,144,216,288].map((a,j)=>(
            <ellipse key={j} cx={f.x+12*Math.cos(a*Math.PI/180)} cy={f.y-40+12*Math.sin(a*Math.PI/180)} rx={8} ry={5} fill={f.c} opacity={0.85} transform={`rotate(${a},${f.x},${f.y-40})`} />
          ))}
          <circle cx={f.x} cy={f.y-40} r={5} fill="#ffee40" />
        </g>
      ))}
      {/* Fairy */}
      <g style={{ animation: 'bg-float 2s ease-in-out infinite, bg-drift-l 22s linear infinite' }}>
        <circle cx={300} cy={200} r={8} fill="#f5c8a8" />
        <rect x={294} y={207} width={12} height={16} rx={4} fill="#ff80cc" />
        {/* Wings */}
        <ellipse cx={290} cy={210} rx={16} ry={9} fill="rgba(200,230,255,.7)" transform="rotate(-30,290,210)" />
        <ellipse cx={310} cy={210} rx={16} ry={9} fill="rgba(200,230,255,.7)" transform="rotate(30,310,210)" />
        <ellipse cx={290} cy={218} rx={11} ry={6} fill="rgba(200,230,255,.55)" transform="rotate(20,290,218)" />
        <ellipse cx={310} cy={218} rx={11} ry={6} fill="rgba(200,230,255,.55)" transform="rotate(-20,310,218)" />
        {/* Wand */}
        <line x1={309} y1={208} x2={322} y2={194} stroke="#d0a040" strokeWidth={2} />
        <text x={318} y={195} fontSize={10} fill="#ffee40" style={{ animation: 'bg-glow-fast 0.8s ease-in-out infinite' }}>★</text>
        {/* Sparkle dust */}
        {[1,2,3].map(j=>(<circle key={j} cx={305+j*8} cy={215-j*3} r={2} fill="#ffee40" opacity={0.5-j*.1} />))}
      </g>
      {/* Dewdrops */}
      {Array.from({length:8},(_,i)=>(
        <ellipse key={i} cx={(i*113+50)%800} cy={380+(i%3)*30} rx={4} ry={6} fill="rgba(150,220,255,.6)" style={{ animation: `bg-glow ${3+i*.4}s ${i*.3}s ease-in-out infinite` }} />
      ))}
    </svg>
  )
}

function Scene_cherryblossom() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="cb-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f0d8e8" /><stop offset="100%" stopColor="#f8e8f0" /></linearGradient>
      </defs>
      <rect width={800} height={500} fill="url(#cb-bg)" />
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
      {/* Path */}
      <ellipse cx={400} cy={490} rx={500} ry={35} fill="#e8c8d0" opacity={0.5} />
      {/* Ground petals */}
      {Array.from({length:12},(_,i)=>(
        <ellipse key={i} cx={(i*77+30)%800} cy={470+i%3*8} rx={6} ry={4} fill="#f090b0" opacity={0.5} />
      ))}
    </svg>
  )
}

function Scene_princess() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="pr-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#180840" /><stop offset="50%" stopColor="#4020a0" /><stop offset="100%" stopColor="#a04080" /></linearGradient>
      </defs>
      <rect width={800} height={500} fill="url(#pr-bg)" />
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
            <rect x={x+28} y={100+i%2*30} width={24} height={16} fill="#ff4080" style={{ animation: 'bg-flag-wave 2s ease-in-out infinite' }} />
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
      <g transform="translate(400,120)" style={{ animation: 'bg-float 5s ease-in-out infinite' }}>
        <path d="M-35,0 L-35,-30 L-10,-15 L0,-40 L10,-15 L35,-30 L35,0 Z" fill="#ffd040" />
        <rect x={-37} y={0} width={74} height={12} rx={3} fill="#cc9000" />
        {['#ff4080','#4080ff','#40c060'].map((c,i)=>(
          <circle key={i} cx={-22+i*22} cy={-2} r={5} fill={c} style={{ animation: `bg-glow ${2+i*.3}s ease-in-out infinite` }} />
        ))}
      </g>
      {/* Fireflies */}
      {Array.from({length:10},(_,i)=>(
        <circle key={i} cx={(i*113+60)%800} cy={350+(i%4)*30} r={2.5} fill="#ffff80" style={{ animation: `bg-twinkle ${2+i*.3}s ${i*.25}s ease-in-out infinite` }} />
      ))}
    </svg>
  )
}

function Scene_holi() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="ho-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a1020" /><stop offset="100%" stopColor="#281820" /></linearGradient>
      </defs>
      <rect width={800} height={500} fill="url(#ho-bg)" />
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
      {/* People silhouettes celebrating */}
      {[100,300,500,700].map((x,i)=>(
        <g key={i} transform={`translate(${x},400)`} style={{ animation: `bg-bob ${1.5+i*.2}s ${i*.3}s ease-in-out infinite` }}>
          <circle cx={0} cy={-60} r={15} fill="#1a1020" />
          <rect x={-12} y={-44} width={24} height={44} rx={6} fill="#1a1020" />
          {/* Arms raised */}
          <line x1={-12} y1={-35} x2={-32} y2={-60} stroke="#1a1020" strokeWidth={8} strokeLinecap="round" />
          <line x1={12} y1={-35} x2={32} y2={-60} stroke="#1a1020" strokeWidth={8} strokeLinecap="round" />
        </g>
      ))}
    </svg>
  )
}

function Scene_pirate() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="pi-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#001830" /><stop offset="50%" stopColor="#0a2a50" /><stop offset="100%" stopColor="#1a3a60" /></linearGradient>
      </defs>
      <rect width={800} height={500} fill="url(#pi-bg)" />
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
        <path d="M264,225 Q310,250 320,280 L264,280Z" fill="#e8e0d0" opacity={0.9} style={{ animation: 'bg-flag-wave 2.5s ease-in-out infinite' }} />
        <path d="M313,245 Q355,268 355,300 L313,300Z" fill="#e8e0d0" opacity={0.85} style={{ animation: 'bg-flag-wave 2.5s 0.3s ease-in-out infinite' }} />
        {/* Skull flag */}
        <rect x={258} y={215} width={3} height={30} fill="#333" />
        <rect x={261} y={215} width={22} height={18} rx={2} fill="#111" style={{ animation: 'bg-flag-wave 2s ease-in-out infinite' }} />
        <circle cx={272} cy={222} r={5} fill="white" opacity={0.7} />
        <line x1={268} y1={227} x2={276} y2={231} stroke="white" strokeWidth={1} opacity={0.7} />
        <line x1={276} y1={227} x2={268} y2={231} stroke="white" strokeWidth={1} opacity={0.7} />
      </g>
      {/* Cannon flash */}
      <circle cx={400} cy={370} r={8} fill="#ff8800" opacity={0.7} style={{ animation: 'bg-glow-fast 3s 2s ease-in-out infinite' }} />
    </svg>
  )
}

function Scene_dragonfire() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="df-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#180000" /><stop offset="100%" stopColor="#300800" /></linearGradient>
        <radialGradient id="lava-g" cx="50%" cy="100%"><stop offset="0%" stopColor="#ff6600" /><stop offset="100%" stopColor="#cc2200" stopOpacity={0} /></radialGradient>
      </defs>
      <rect width={800} height={500} fill="url(#df-bg)" />
      {/* Lava glow at horizon */}
      <ellipse cx={400} cy={500} rx={500} ry={100} fill="url(#lava-g)" opacity={0.6} style={{ animation: 'bg-pulse 3s ease-in-out infinite' }} />
      {/* Mountain peaks */}
      {[{x:0,h:300},{x:150,h:360},{x:300,h:280},{x:450,h:330},{x:600,h:290},{x:720,h:340}].map((m,i)=>(
        <polygon key={i} points={`${m.x},500 ${m.x+100},${500-m.h} ${m.x+200},500`} fill={i%2===0?'#200808':'#180606'} />
      ))}
      {/* Dragon */}
      <g transform="translate(400,200)" style={{ animation: 'bg-float 4s ease-in-out infinite' }}>
        {/* Tail */}
        <path d="M180,40 Q250,20 280,60 Q300,80 270,90" stroke="#603010" strokeWidth={22} fill="none" strokeLinecap="round" />
        <path d="M270,90 Q300,110 285,95" stroke="#603010" strokeWidth={14} fill="none" strokeLinecap="round" />
        {/* Body */}
        <ellipse cx={50} cy={30} rx={140} ry={55} fill="#703a18" />
        <ellipse cx={50} cy={40} rx={120} ry={40} fill="#602c10" opacity={0.5} />
        {/* Wings spread wide */}
        <path d="M0,0 Q-80,-90 -160,-50 Q-130,-10 -60,20 Z" fill="#501808" />
        <path d="M-60,20 Q-130,-10 -160,-50" stroke="#7a3010" strokeWidth={2} fill="none" />
        <path d="M100,0 Q180,-90 260,-50 Q230,-10 160,20 Z" fill="#501808" />
        <path d="M160,20 Q230,-10 260,-50" stroke="#7a3010" strokeWidth={2} fill="none" />
        {/* Neck + head */}
        <path d="M-90,0 Q-130,-30 -150,-60" stroke="#703a18" strokeWidth={35} fill="none" strokeLinecap="round" />
        <ellipse cx={-158} cy={-70} rx={38} ry={26} fill="#703a18" />
        {/* Horns */}
        <polygon points="-168,-92 -180,-125 -155,-90" fill="#401808" />
        <polygon points="-142,-94 -134,-128 -158,-92" fill="#401808" />
        {/* Eyes GLOWING */}
        <circle cx={-165} cy={-73} r={9} fill="#ff4400" style={{ animation: 'bg-glow-fast 1s ease-in-out infinite' }} />
        <circle cx={-165} cy={-73} r={5} fill="#ff8800" />
        <ellipse cx={-165} cy={-73} rx={2} ry={4} fill="#111" />
        {/* Nostril */}
        <ellipse cx={-175} cy={-62} rx={4} ry={3} fill="#500800" />
        {/* FIRE BREATH — animated shooting flame */}
        <g>
          <ellipse cx={-210} cy={-62} rx={0} ry={0} fill="#ff4400" style={{ animation: 'bg-dragon-fire 0.4s ease-in-out infinite' }}>
            <animate attributeName="rx" values="0;50;80;50;0" dur="2s" repeatCount="indefinite" />
            <animate attributeName="ry" values="0;20;35;20;0" dur="2s" repeatCount="indefinite" />
            <animate attributeName="cx" values="-185;-250;-320;-250;-185" dur="2s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx={-230} cy={-62} rx={0} ry={0} fill="#ff8800" opacity={0.8}>
            <animate attributeName="rx" values="0;35;60;35;0" dur="2s" begin="0.2s" repeatCount="indefinite" />
            <animate attributeName="ry" values="0;14;25;14;0" dur="2s" begin="0.2s" repeatCount="indefinite" />
            <animate attributeName="cx" values="-185;-260;-340;-260;-185" dur="2s" begin="0.2s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx={-255} cy={-62} rx={0} ry={0} fill="#ffee40" opacity={0.6}>
            <animate attributeName="rx" values="0;20;35;20;0" dur="2s" begin="0.4s" repeatCount="indefinite" />
            <animate attributeName="ry" values="0;8;15;8;0" dur="2s" begin="0.4s" repeatCount="indefinite" />
            <animate attributeName="cx" values="-185;-270;-360;-270;-185" dur="2s" begin="0.4s" repeatCount="indefinite" />
          </ellipse>
        </g>
        {/* Back spines */}
        {[-60,-20,20,60,100].map((dx,i)=>(
          <polygon key={i} points={`${dx-8},-10 ${dx},${-35-i%2*15} ${dx+8},-10`} fill="#501808" />
        ))}
        {/* Legs */}
        <path d="M-40,50 Q-50,90 -35,110" stroke="#603010" strokeWidth={18} fill="none" strokeLinecap="round" />
        <path d="M80,50 Q90,90 80,110" stroke="#603010" strokeWidth={18} fill="none" strokeLinecap="round" />
        {/* Claws */}
        {[-42,-26,-10].map((dx,i)=>(
          <line key={i} x1={-35+dx+35} y1={110} x2={-32+dx+35} y2={125} stroke="#401808" strokeWidth={4} />
        ))}
      </g>
      {/* Fire particles rising */}
      {Array.from({length:10},(_,i)=>(
        <circle key={i} cx={(i*130+50)%800} cy={500} r={3+i%3*2} fill={i%2===0?'#ff4400':'#ff8800'} style={{ animation: `bg-volcano ${2+i*.3}s ${i*.25}s ease-out infinite` }} />
      ))}
    </svg>
  )
}

function Scene_racecar() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="rc-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#050508" /><stop offset="100%" stopColor="#0a0a14" /></linearGradient>
      </defs>
      <rect width={800} height={500} fill="url(#rc-bg)" />
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
      {/* Car 1 — red — fast */}
      <g style={{ animation: 'bg-car-move 3s linear infinite' }}>
        <rect x={320} y={350} width={120} height={40} rx={10} fill="#cc1122" />
        <rect x={340} y={338} width={75} height={28} rx={8} fill="#dd2233" />
        <rect x={345} y={341} width={65} height={20} rx={5} fill="#66aaff" opacity={0.6} />
        <circle cx={345} cy={393} r={14} fill="#222" /><circle cx={345} cy={393} r={8} fill="#444" />
        <circle cx={415} cy={393} r={14} fill="#222" /><circle cx={415} cy={393} r={8} fill="#444" />
        {/* Speed lines */}
        {[355,365,375].map((y,i)=>(
          <line key={i} x1={320} y1={y} x2={280-i*5} y2={y} stroke="rgba(255,255,255,.2)" strokeWidth={1.5} />
        ))}
        <text x={355} y={373} fontSize={10} fill="white" fontWeight="bold" opacity={0.7}>7</text>
      </g>
      {/* Car 2 — blue — slower */}
      <g style={{ animation: 'bg-car-move 4.5s 1.5s linear infinite' }}>
        <rect x={320} y={390} width={110} height={36} rx={10} fill="#1144cc" />
        <rect x={335} y={380} width={70} height={25} rx={7} fill="#2255dd" />
        <rect x={340} y={383} width={60} height={17} rx={4} fill="#66aaff" opacity={0.5} />
        <circle cx={340} cy={428} r={12} fill="#222" /><circle cx={340} cy={428} r={7} fill="#444" />
        <circle cx={405} cy={428} r={12} fill="#222" /><circle cx={405} cy={428} r={7} fill="#444" />
        <text x={355} y={408} fontSize={10} fill="white" fontWeight="bold" opacity={0.7}>3</text>
      </g>
    </svg>
  )
}

function Scene_spiderman() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="sp-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#040810" /><stop offset="50%" stopColor="#0a1828" /><stop offset="100%" stopColor="#050a15" /></linearGradient>
      </defs>
      <rect width={800} height={500} fill="url(#sp-bg)" />
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
      {/* WEB SHOOTS across screen - from bottom-left corner to upper-right */}
      <line x1={0} y1={500} x2={800} y2={0} stroke="#d8d8d8" strokeWidth={2.5} opacity={0.75}
        strokeDasharray="900 900" style={{ animation: 'bg-web-shoot 7s ease-out infinite' }} />
      {/* Secondary web strands */}
      <line x1={0} y1={400} x2={700} y2={0} stroke="#c8c8c8" strokeWidth={1.8} opacity={0.55}
        strokeDasharray="750 750" style={{ animation: 'bg-web-shoot2 7s 0.4s ease-out infinite' }} />
      <line x1={100} y1={500} x2={800} y2={80} stroke="#c8c8c8" strokeWidth={1.5} opacity={0.45}
        strokeDasharray="730 730" style={{ animation: 'bg-web-shoot2 7s 0.8s ease-out infinite' }} />
      {/* Web pattern in corner */}
      {[1,2,3].map(i=>(
        <circle key={i} cx={0} cy={500} r={i*80} fill="none" stroke="#888" strokeWidth={1} opacity={0.2} />
      ))}
      {/* Radial lines from corner */}
      {[20,40,60,80,100,120].map((a,i)=>(
        <line key={i} x1={0} y1={500} x2={250*Math.cos(a*Math.PI/180)} y2={500-250*Math.sin(a*Math.PI/180)} stroke="#888" strokeWidth={1} opacity={0.15} />
      ))}
      {/* Spider-Man swinging */}
      <g style={{ animation: 'bg-fly 10s 1.5s ease-in-out infinite' }}>
        {/* Swing line */}
        <line x1={400} y1={160} x2={400} y2={80} stroke="#c8c8c8" strokeWidth={1.5} opacity={0.6} />
        {/* Body */}
        <ellipse cx={400} cy={165} rx={16} ry={22} fill="#cc1122" />
        {/* Mask */}
        <circle cx={400} cy={145} r={15} fill="#cc1122" />
        {/* Web pattern on suit */}
        <ellipse cx={400} cy={145} rx={15} ry={15} fill="none" stroke="#990011" strokeWidth={0.8} opacity={0.5} />
        {/* Spider eyes */}
        <ellipse cx={394} cy={142} rx={7} ry={5} fill="white" opacity={0.85} />
        <ellipse cx={407} cy={142} rx={7} ry={5} fill="white" opacity={0.85} />
        {/* Legs trailing */}
        <line x1={390} y1={180} x2={375} y2={210} stroke="#cc1122" strokeWidth={7} strokeLinecap="round" />
        <line x1={410} y1={180} x2={425} y2={210} stroke="#cc1122" strokeWidth={7} strokeLinecap="round" />
        {/* Arm with web */}
        <line x1={388} y1={160} x2={355} y2={135} stroke="#cc1122" strokeWidth={7} strokeLinecap="round" />
        <line x1={355} y1={135} x2={400} y2={80} stroke="#c8c8c8" strokeWidth={1.5} opacity={0.6} />
      </g>
    </svg>
  )
}

function Scene_batman() {
  return (
    <>
      {/* Periodic bat signal blink — entire sky flash */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 8, background: 'rgba(230,240,255,1)', pointerEvents: 'none', animation: 'bg-screen-flash 12s 2s ease-in-out infinite' }} />
      <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 2 }}>
        <defs>
          <linearGradient id="bat-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#020205" /><stop offset="100%" stopColor="#04080f" />
          </linearGradient>
          <radialGradient id="signal-beam" cx="50%" cy="100%">
            <stop offset="0%" stopColor="#d8e8ff" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#d8e8ff" stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect width={800} height={500} fill="url(#bat-bg)" />
        {/* Gothic Gotham skyline — tall dark towers */}
        {[{x:0,w:80,h:320},{x:75,w:45,h:400},{x:115,w:60,h:360},{x:170,w:40,h:280},{x:205,w:65,h:440},{x:265,w:35,h:310},{x:610,w:70,h:380},{x:675,w:50,h:430},{x:720,w:60,h:360},{x:775,w:40,h:400}].map((b,i)=>(
          <g key={i}>
            <rect x={b.x} y={500-b.h} width={b.w} height={b.h} fill="#05050a" />
            {/* Pointed Gothic spire */}
            <polygon points={`${b.x},${500-b.h} ${b.x+b.w/2},${500-b.h-35} ${b.x+b.w},${500-b.h}`} fill="#030308" />
            {/* Tiny yellow windows glowing faint */}
            {[0,1,2].map(j=>(
              <rect key={j} x={b.x+10+j%2*22} y={500-b.h+30+j*35} width={10} height={12} rx={1}
                fill="#aa8800" opacity={0.25} style={{ animation: `bg-glow ${4+j}s ${j*.5+i*.15}s ease-in-out infinite` }} />
            ))}
          </g>
        ))}
        {/* BAT SIGNAL beam — rotating, blinking */}
        <g style={{ animation: 'bg-sweep 6s ease-in-out infinite', transformOrigin: '400px 500px' }}>
          <polygon points="400,500 340,80 460,80" fill="url(#signal-beam)" style={{ animation: 'bg-signal-blink 6s ease-in-out infinite' }} />
        </g>
        {/* Bat signal circle on clouds */}
        <ellipse cx={400} cy={90} rx={80} ry={40} fill="rgba(200,215,255,.12)" style={{ animation: 'bg-signal-blink 6s ease-in-out infinite' }} />
        <circle cx={400} cy={90} r={52} fill="none" stroke="rgba(200,215,255,.25)" strokeWidth={5} style={{ animation: 'bg-signal-blink 6s ease-in-out infinite' }} />
        {/* Bat symbol inside signal */}
        <g transform="translate(400,90)" style={{ animation: 'bg-signal-blink 6s ease-in-out infinite' }}>
          <path d="M0,-18 Q-16,-14 -30,0 Q-16,2 0,-5 Q16,2 30,0 Q16,-14 0,-18Z" fill="rgba(0,0,0,.7)" />
          <path d="M-30,0 Q-40,8 -35,16 Q-20,12 0,8 Q20,12 35,16 Q40,8 30,0 Q16,2 0,-5 Q-16,2 -30,0Z" fill="rgba(0,0,0,.7)" />
          <polygon points="-35,16 -44,28 -28,22" fill="rgba(0,0,0,.7)" />
          <polygon points="35,16 44,28 28,22" fill="rgba(0,0,0,.7)" />
        </g>
        {/* Storm clouds */}
        <ellipse cx={180} cy={110} rx={160} ry={65} fill="#0c0c16" style={{ animation: 'bg-cloud-drift 15s ease-in-out infinite alternate' }} />
        <ellipse cx={250} cy={88} rx={130} ry={55} fill="#101020" style={{ animation: 'bg-cloud-drift 12s ease-in-out infinite alternate' }} />
        <ellipse cx={580} cy={120} rx={180} ry={70} fill="#0a0a14" style={{ animation: 'bg-cloud-drift 18s ease-in-out infinite alternate-reverse' }} />
        <ellipse cx={660} cy={95} rx={140} ry={60} fill="#0c0c18" style={{ animation: 'bg-cloud-drift 10s ease-in-out infinite alternate-reverse' }} />
        {/* Rain */}
        <Rain n={28} heavy={true} />
        {/* BATS FLYING across in formation */}
        <g style={{ animation: 'bg-bat-cross 12s ease-in-out infinite' }}>
          {[{dx:0,dy:0},{dx:50,dy:20},{dx:-50,dy:20},{dx:100,dy:5},{dx:-100,dy:10},{dx:30,dy:40}].map((bat,i)=>(
            <g key={i} transform={`translate(${400+bat.dx},${220+bat.dy})`}>
              {/* Bat body */}
              <ellipse cx={0} cy={0} rx={6} ry={8} fill="#1a1a22" />
              {/* Bat wings */}
              <path d={`M-5,0 Q-20,-12 -30,-2 Q-20,6 -5,3Z`} fill="#1a1a22" style={{ animation: `bg-wing-flap ${0.5+i*.05}s ${i*.08}s ease-in-out infinite` }} />
              <path d={`M5,0 Q20,-12 30,-2 Q20,6 5,3Z`} fill="#1a1a22" style={{ animation: `bg-wing-flap ${0.5+i*.05}s ${i*.08+0.25}s ease-in-out infinite` }} />
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
      <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 2 }}>
        <defs>
          <radialGradient id="hw-bg" cx="50%" cy="30%"><stop offset="0%" stopColor="#1a0820" /><stop offset="100%" stopColor="#050208" /></radialGradient>
        </defs>
        <rect width={800} height={500} fill="url(#hw-bg)" />
        <Stars n={35} />
        {/* Full orange moon */}
        <circle cx={400} cy={110} r={65} fill="#ff9920" opacity={0.9} style={{ animation: 'bg-glow 5s ease-in-out infinite' }} />
        <circle cx={375} cy={95} r={50} fill="#dd7710" opacity={0.3} />
        {/* Cloud wisps crossing moon */}
        <ellipse cx={380} cy={112} rx={90} ry={28} fill="#0d0510" opacity={0.5} style={{ animation: 'bg-drift-lr 18s ease-in-out infinite' }} />
        {/* Haunted house on hill */}
        <polygon points="280,500 280,320 400,200 520,320 520,500" fill="#080508" />
        <polygon points="280,320 400,200 520,320" fill="#050305" /> {/* roof */}
        <polygon points="375,200 400,150 425,200" fill="#030203" /> {/* spire */}
        <rect x={372} y={145} width={6} height={60} fill="#040304" />
        {/* Windows glow orange */}
        <rect x={305} y={340} width={40} height={50} rx={20} fill="#ff8800" opacity={0.5} style={{ animation: 'bg-flicker 2s ease-in-out infinite' }} />
        <rect x={455} y={340} width={40} height={50} rx={20} fill="#ff8800" opacity={0.5} style={{ animation: 'bg-flicker 2s 0.4s ease-in-out infinite' }} />
        <rect x={385} y={280} width={30} height={38} rx={15} fill="#ff6600" opacity={0.45} style={{ animation: 'bg-flicker 1.5s ease-in-out infinite' }} />
        {/* Lightning bolt */}
        <polyline points="600,80 582,140 598,140 580,210" stroke="#ffee80" strokeWidth={5} strokeLinejoin="round" strokeLinecap="round"
          strokeDasharray="180 180" style={{ animation: 'bg-lightning-draw 9s 3.2s linear infinite' }} />
        {/* Jack-o-lanterns */}
        {[{x:80,y:440,s:1},{x:720,y:435,s:0.9},{x:180,y:445,s:0.8}].map((p,i)=>(
          <g key={i} transform={`translate(${p.x},${p.y}) scale(${p.s})`} style={{ animation: `bg-diya-glow ${2+i*.5}s ${i*.4}s ease-in-out infinite` }}>
            <ellipse cx={0} cy={0} rx={32} ry={28} fill="#cc4400" />
            <rect x={-6} y={-34} width={12} height={10} rx={3} fill="#5a2008" />
            {/* Face */}
            <polygon points="-16,-12 -6,-4 -20,-4" fill="#ff8800" />
            <polygon points="16,-12 6,-4 20,-4" fill="#ff8800" />
            <path d="M-14,8 Q-5,16 0,12 Q5,16 14,8" stroke="#ff8800" strokeWidth={2.5} fill="none" strokeLinecap="round" />
            {/* Glow */}
            <ellipse cx={0} cy={5} rx={20} ry={18} fill="#ff6600" opacity={0.25} style={{ animation: 'bg-flicker 1.2s ease-in-out infinite' }} />
          </g>
        ))}
        {/* Ghost floating through */}
        <g style={{ animation: 'bg-drift-l 20s 2s linear infinite' }}>
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
      </svg>
    </>
  )
}

function Scene_diwali() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <radialGradient id="di2-bg" cx="50%" cy="40%"><stop offset="0%" stopColor="#0a0520" /><stop offset="100%" stopColor="#020108" /></radialGradient>
      </defs>
      <rect width={800} height={500} fill="url(#di2-bg)" />
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
        <g key={i} transform={`translate(${x},450)`} style={{ animation: `bg-diya-glow ${2+i*.2}s ${i*.15}s ease-in-out infinite` }}>
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
    </svg>
  )
}

function Scene_hotcocoa() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="hc-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#060410" /><stop offset="100%" stopColor="#0a0818" /></linearGradient>
      </defs>
      <rect width={800} height={500} fill="url(#hc-bg)" />
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
        {/* Chimney smoke */}
        {[0,1,2].map(i=>(
          <path key={i} d={`M500,162 Q${500+8*i},${148-i*20} ${500},${132-i*30}`} stroke="rgba(200,200,220,.35)" strokeWidth={8+i*4} fill="none" strokeLinecap="round" style={{ animation: `bg-steam ${3+i*.6}s ${i*.5}s ease-in-out infinite` }} />
        ))}
        {/* Glowing window — warm orange light */}
        <rect x={250} y={300} width={120} height={100} rx={6} fill="#ff9920" opacity={0.6} style={{ animation: 'bg-glow 3s ease-in-out infinite' }} />
        <rect x={310} y={300} width={6} height={100} fill="#2a1008" />
        <rect x={250} y={348} width={120} height={6} fill="#2a1008" />
        {/* Visible fireplace glow through window */}
        <rect x={255} y={340} width={108} height={55} rx={3} fill="#ff6600" opacity={0.2} style={{ animation: 'bg-flicker 1.5s ease-in-out infinite' }} />
        {/* Door */}
        <rect x={380} y={380} width={70} height={120} rx={6} fill="#1e0c04" />
        <circle cx={444} cy={440} r={5} fill="#cc8820" />
        {/* Right window */}
        <rect x={430} y={300} width={110} height={90} rx={6} fill="#ff9920" opacity={0.5} style={{ animation: 'bg-glow 3s 0.5s ease-in-out infinite' }} />
      </g>
      {/* Big mug */}
      <g transform="translate(680,380)" style={{ animation: 'bg-float-sm 4s ease-in-out infinite' }}>
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
      {/* Snow on ground */}
      <ellipse cx={400} cy={490} rx={500} ry={45} fill="white" opacity={0.25} />
      <ellipse cx={400} cy={496} rx={600} ry={35} fill="white" opacity={0.15} />
    </svg>
  )
}

function Scene_christmas() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="ch-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#010208" /><stop offset="100%" stopColor="#04060f" /></linearGradient>
      </defs>
      <rect width={800} height={500} fill="url(#ch-bg)" />
      <Stars n={70} />
      {/* Big full moon */}
      <circle cx={400} cy={120} r={70} fill="#f0f0e8" style={{ animation: 'bg-glow 8s ease-in-out infinite' }} />
      {/* SANTA AND REINDEER crossing the moon left to right */}
      <g style={{ animation: 'bg-drift-lr 14s ease-in-out infinite' }}>
        {/* Sleigh */}
        <path d="M350,115 Q380,100 420,105 Q440,108 450,120 L430,130 Q400,135 370,128Z" fill="#cc2222" />
        <path d="M350,115 Q345,125 370,128" stroke="#aa1111" strokeWidth={3} fill="none" />
        <path d="M420,110 Q440,118 450,130" stroke="#aa1111" strokeWidth={4} fill="none" />
        {/* Santa silhouette */}
        <circle cx={390} cy={100} r={12} fill="#1a1a1a" />
        <rect x={380} y={105} width={20} height={16} rx={4} fill="#1a1a1a" />
        <ellipse cx={390} cy={96} rx={13} ry={8} fill="#cc2222" /> {/* hat */}
        {/* Reindeer in a line */}
        {[-70,-50,-30,-10,10,30,50,70].map((dx,i)=>(
          <g key={i} transform={`translate(${300+dx},108)`}>
            <ellipse cx={0} cy={0} rx={12} ry={7} fill="#1a1a1a" opacity={0.85} />
            <circle cx={-10} cy={-5} r={5} fill="#1a1a1a" opacity={0.85} />
            {/* Antlers */}
            <path d={`M-13,-8 Q-18,-18 -14,-22`} stroke="#1a1a1a" strokeWidth={1.5} fill="none" opacity={0.7} />
            <path d={`M-14,-22 Q-12,-28 -16,-30`} stroke="#1a1a1a" strokeWidth={1} fill="none" opacity={0.7} />
            {/* Legs */}
            <line x1={-5} y1={6} x2={-7} y2={16} stroke="#1a1a1a" strokeWidth={1.5} opacity={0.7} />
            <line x1={3} y1={6} x2={5} y2={16} stroke="#1a1a1a" strokeWidth={1.5} opacity={0.7} />
            {/* Rudolph's nose */}
            {i===0&&<circle cx={-14} cy={-4} r={3} fill="#ff3333" style={{ animation: 'bg-glow-fast 1s ease-in-out infinite' }} />}
            {/* Harness line */}
            {i<7&&<line x1={12} y1={0} x2={25} y2={0} stroke="#888" strokeWidth={1} opacity={0.5} />}
          </g>
        ))}
      </g>
      {/* Snow-covered ground with Christmas tree */}
      <ellipse cx={400} cy={490} rx={500} ry={50} fill="#e8f0f8" opacity={0.15} />
      {/* Christmas tree */}
      <g transform="translate(400,420)">
        <polygon points="0,-180 -50,-90 50,-90" fill="#0a5218" />
        <polygon points="0,-120 -65,-30 65,-30" fill="#0c6820" />
        <polygon points="0,-50 -80,30 80,30" fill="#0e7822" />
        <rect x={-12} y={30} width={24} height={30} rx={4} fill="#6a3010" />
        {/* Twinkling lights */}
        {[{x:-30,y:-100,c:'#ff4040'},{x:20,y:-80,c:'#ffee40'},{x:-40,y:-40,c:'#4080ff'},{x:30,y:-20,c:'#ff40ff'},{x:-20,y:10,c:'#40ff80'},{x:45,y:-55,c:'#ff8040'},{x:-50,y:-60,c:'#40ffee'},{x:0,y:-150,c:'#ffee40'}].map((l,i)=>(
          <circle key={i} cx={l.x} cy={l.y} r={5} fill={l.c} style={{ animation: `bg-twinkle ${1+i*.3}s ${i*.2}s ease-in-out infinite` }} />
        ))}
        {/* Star on top */}
        <text x={-12} y={-185} fontSize={22} fill="#ffee40" style={{ animation: 'bg-glow 2s ease-in-out infinite' }}>★</text>
      </g>
      <Snowflakes n={18} />
    </svg>
  )
}

function Scene_frozen() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="fr2-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#020610" /><stop offset="100%" stopColor="#041018" /></linearGradient>
        <linearGradient id="ice-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#88ccff" stopOpacity={0.4} /><stop offset="100%" stopColor="#88ccff" stopOpacity={0} /></linearGradient>
      </defs>
      <rect width={800} height={500} fill="url(#fr2-bg)" />
      <Stars n={80} color="#c0e0ff" />
      {/* AURORA BOREALIS — sweeping ribbons */}
      {[{y:80,h:60,c:'#00ff88',d:5},{y:120,h:80,c:'#0080ff',d:7},{y:60,h:50,c:'#ff40ff',d:6},{y:150,h:45,c:'#40ffcc',d:8}].map((a,i)=>(
        <ellipse key={i} cx={400} cy={a.y} rx={450} ry={a.h} fill={a.c} opacity={0.13} style={{ animation: `bg-aurora${i%2===0?'':'2'} ${a.d+i}s ${i*.8}s ease-in-out infinite` }} />
      ))}
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
      <ellipse cx={400} cy={495} rx={550} ry={50} fill="white" opacity={0.12} />
      <Snowflakes n={16} />
    </svg>
  )
}

function Scene_sky() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="sky-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a80d0" /><stop offset="100%" stopColor="#80c8ff" /></linearGradient>
      </defs>
      <rect width={800} height={500} fill="url(#sky-bg)" />
      {/* Bright sun */}
      <circle cx={680} cy={90} r={55} fill="#FFE040" style={{ animation: 'bg-pulse-sm 5s ease-in-out infinite' }} />
      {/* Fluffy clouds */}
      {[{cx:150,cy:80},{cx:400,cy:55},{cx:620,cy:200}].map((c,i)=>(
        <g key={i} style={{ animation: `bg-cloud-drift ${10+i*3}s ease-in-out infinite alternate` }}>
          <ellipse cx={c.cx} cy={c.cy} rx={95} ry={42} fill="white" opacity={0.95} />
          <ellipse cx={c.cx+28} cy={c.cy-18} rx={70} ry={38} fill="white" opacity={0.9} />
          <ellipse cx={c.cx-25} cy={c.cy-12} rx={65} ry={32} fill="white" opacity={0.88} />
        </g>
      ))}
      {/* Hot air balloons */}
      {[{x:180,y:220,c1:'#ff4040',c2:'#ffee40',d:7},{x:420,y:180,c1:'#4080ff',c2:'#ff80ff',d:9},{x:650,y:250,c1:'#40c060',c2:'#ff8040',d:8}].map((b,i)=>(
        <g key={i} style={{ animation: `bg-float ${b.d}s ${i*2}s ease-in-out infinite` }}>
          {/* Balloon */}
          <ellipse cx={b.x} cy={b.y} rx={42} ry={55} fill={b.c1} />
          {/* Stripes */}
          {[0,1,2].map(j=>(
            <clipPath key={j} id={`bal-clip-${i}-${j}`}><ellipse cx={b.x} cy={b.y} rx={42} ry={55} /></clipPath>
          ))}
          <rect x={b.x-12} y={b.y-55} width={24} height={110} fill={b.c2} opacity={0.7} clipPath={`url(#bal-clip-${i}-0)`} />
          <rect x={b.x+12} y={b.y-55} width={24} height={110} fill={b.c1} opacity={0.4} clipPath={`url(#bal-clip-${i}-1)`} />
          {/* Basket */}
          <rect x={b.x-16} y={b.y+55} width={32} height={22} rx={5} fill="#8a5820" />
          {/* Ropes */}
          <line x1={b.x-14} y1={b.y+50} x2={b.x-14} y2={b.y+55} stroke="#8a5820" strokeWidth={1.5} />
          <line x1={b.x+14} y1={b.y+50} x2={b.x+14} y2={b.y+55} stroke="#8a5820" strokeWidth={1.5} />
        </g>
      ))}
      {/* Bird formation */}
      <g style={{ animation: 'bg-drift-l 20s ease-in-out infinite' }}>
        {[{x:0,y:0},{x:30,y:15},{x:-30,y:15},{x:60,y:5},{x:-60,y:5}].map((b,i)=>(
          <path key={i} d={`M${440+b.x},${300+b.y} Q${450+b.x},${292+b.y} ${460+b.x},${300+b.y} Q${470+b.x},${292+b.y} ${480+b.x},${300+b.y}`} stroke="#1a6090" strokeWidth={2} fill="none" />
        ))}
      </g>
    </svg>
  )
}

function Scene_rainbow() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="rb-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#b0d8ff" /><stop offset="100%" stopColor="#e0f0ff" /></linearGradient>
      </defs>
      <rect width={800} height={500} fill="url(#rb-bg)" />
      {/* BOLD rainbow arcs */}
      {['#ff3030','#ff8800','#ffee00','#30c030','#3060ff','#9030ff'].map((c,i)=>(
        <ellipse key={i} cx={400} cy={500} rx={440-i*32} ry={360-i*26} fill="none" stroke={c} strokeWidth={22} opacity={0.65} style={{ animation: `bg-pulse-sm ${4+i*.5}s ${i*.2}s ease-in-out infinite` }} />
      ))}
      {/* Fluffy clouds at ends */}
      {[{cx:80,cy:350},{cx:720,cy:350}].map((c,i)=>(
        <g key={i}>
          <ellipse cx={c.cx} cy={c.cy} rx={90} ry={50} fill="white" opacity={0.9} />
          <ellipse cx={c.cx+25} cy={c.cy-20} rx={70} ry={42} fill="white" opacity={0.85} />
        </g>
      ))}
      {/* Prism shapes */}
      {[{x:200,y:200},{x:550,y:180},{x:380,y:100}].map((p,i)=>(
        <polygon key={i} points={`${p.x},${p.y} ${p.x-20},${p.y+40} ${p.x+20},${p.y+40}`} fill="rgba(255,255,255,.6)" style={{ animation: `bg-twinkle ${2+i}s ${i*.4}s ease-in-out infinite` }} />
      ))}
      {/* Color bubbles */}
      {Array.from({length:14},(_,i)=>(
        <g key={i} style={{ animation: `bg-bubble ${4+i*.35}s ${i*.3}s linear infinite` }}>
          <circle cx={(i*113+50)%800} cy={480} r={10+i%5*6} fill="none" stroke={['#ff4040','#ff8800','#ffee00','#30c030','#3060ff'][i%5]} strokeWidth={2} opacity={0.45} />
          <ellipse cx={(i*113+55)%800-5} cy={480-7} rx={5} ry={3} fill="white" opacity={0.35} />
        </g>
      ))}
      {/* Sun peeking */}
      <circle cx={400} cy={75} r={45} fill="#FFD030" opacity={0.7} style={{ animation: 'bg-pulse 6s ease-in-out infinite' }} />
    </svg>
  )
}

function Scene_artStudio() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="art-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1a0a20" /><stop offset="100%" stopColor="#100616" /></linearGradient>
      </defs>
      <rect width={800} height={500} fill="url(#art-bg)" />
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
      <g transform="translate(400,320)" style={{ animation: 'bg-float 5s ease-in-out infinite' }}>
        <ellipse cx={0} cy={0} rx={75} ry={60} fill="#f5e0c8" />
        <ellipse cx={-5} cy={5} rx={60} ry={48} fill="#e8d4b8" />
        <circle cx={-28} cy={-3} r={5} fill="#1a1a1a" opacity={0.5} /> {/* thumb hole */}
        {[{x:-35,y:-22,c:'#ff4040'},{x:-10,y:-38,c:'#ffee40'},{x:20,y:-38,c:'#40c060'},{x:44,y:-22,c:'#4080ff'},{x:50,y:8,c:'#ff80ff'},{x:44,y:30,c:'#ff8040'}].map((p,i)=>(
          <circle key={i} cx={p.x} cy={p.y} r={9} fill={p.c} opacity={0.85} style={{ animation: `bg-pulse-sm ${2+i*.3}s ease-in-out infinite` }} />
        ))}
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
    </svg>
  )
}

// ── Theme → Scene mapping ─────────────────────────────────────────────────────
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
  artStudio:    Scene_artStudio,
}

// ── Public component ──────────────────────────────────────────────────────────
export function ThemeBackground({ themeKey }) {
  useEffect(() => { injectBgStyles() }, [])

  const Scene = SCENE_MAP[themeKey] || Scene_coral

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 1,
      overflow: 'hidden', pointerEvents: 'none',
      opacity: 0.20,
    }}>
      <Scene />
    </div>
  )
}
