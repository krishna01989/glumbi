import { useEffect } from 'react'

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

    /* ─── Float / sway ─── */
    @keyframes bg-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
    @keyframes bg-float-sm{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
    @keyframes bg-float-lg{0%,100%{transform:translateY(0)}50%{transform:translateY(-22px)}}
    @keyframes bg-sway{0%,100%{transform:rotate(-4deg) translateY(0)}50%{transform:rotate(4deg) translateY(-5px)}}
    @keyframes bg-sway-sm{0%,100%{transform:translateX(-4px)}50%{transform:translateX(4px)}}
    @keyframes bg-sway-tree{0%,100%{transform:translateX(-7px)}50%{transform:translateX(7px)}}
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
      {/* Rainbow */}
      {['#ff4444','#ff8800','#ffee00','#44cc44','#4488ff','#8844ff'].map((c,i)=>(
        <path key={i} d={`M ${100+i*8},500 A ${300-i*8} ${200-i*5} 0 0 1 ${700-i*8},500`}
          fill="none" stroke={c} strokeWidth={12} opacity={0.25} />
      ))}
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
      {/* Flag */}
      <rect x={440} y={335} width={4} height={55} fill="#ccc" />
      <rect x={444} y={335} width={34} height={22} fill="#cc2222" style={{ animation: 'bg-flag-wave 2s ease-in-out infinite', transformOrigin: 'left center', transformBox: 'fill-box' }} />
      <text x={448} y={350} fontSize={10} fill="white" opacity={0.8}>★</text>
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
      {/* Iron Man flying — proper armored suit silhouette */}
      <g style={{ animation: 'bg-fly 12s 1s ease-in-out infinite' }}>
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
      {/* Lightning bolt */}
      <polyline points="430,50 415,110 435,110 420,180" stroke="#ffee00" strokeWidth={4} strokeLinejoin="round" strokeLinecap="round"
        style={{ animation: 'bg-flash 6s 2s ease-in-out infinite' }} />
      {/* Shield */}
      <g transform="translate(200,250)"><g style={{ animation: 'bg-drift-l 15s 0.5s linear infinite' }}>
        <circle cx={0} cy={0} r={28} fill="#3355cc" />
        <circle cx={0} cy={0} r={21} fill="#cc2222" />
        <circle cx={0} cy={0} r={13} fill="#3355cc" />
        <circle cx={0} cy={0} r={6} fill="#e0e0e0" />
      </g>
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
            <rect key={j} x={Math.min(b.x+b.w-16, b.x+8+j%2*12)} y={500-b.h+20+Math.floor(j/2)*25} width={8} height={10} rx={1}
              fill="#ffee80" opacity={0.4+j%2*0.3} style={{ animation: `bg-twinkle ${3+j*.5}s ${j*.3+i*.2}s ease-in-out infinite` }} />
          ))}
        </g>
      ))}
      {/* Superman flying — proper caped hero pose, arm outstretched */}
      <g style={{ animation: 'bg-fly 10s ease-in-out infinite' }}>
        {/* CAPE — billowing dramatically behind body */}
        <path d="
          M395,168
          C400,178 408,196 412,210
          C424,200 438,186 444,170
          C440,160 432,158 426,162
          C420,166 412,174 408,178
          C404,174 400,168 395,168 Z
        " fill="#cc2222" opacity={0.95} />
        {/* Head */}
        <circle cx={382} cy={156} r={16} fill="#f0c090" />
        {/* Hair — dark swept back */}
        <path d="M369,150 C372,142 378,138 382,138 C386,138 392,142 396,148 C392,144 386,142 382,142 C378,142 372,146 369,150 Z" fill="#1a0c08" />
        {/* Curl of hair on forehead */}
        <path d="M380,144 C376,146 374,150 376,152" stroke="#1a0c08" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        {/* Body — torso in classic blue */}
        <path d="
          M372,170 C368,174 366,182 367,192
          C368,200 372,208 378,212
          C383,214 390,214 395,212
          L395,168
          C390,166 380,168 372,170 Z
        " fill="#1040cc" />
        {/* Right side body (hidden behind cape) */}
        <path d="
          M395,168 L395,212
          C398,214 402,214 406,212
          C410,208 412,200 411,192 Z
        " fill="#0c30a0" opacity={0.7} />
        {/* S shield on chest — centered on the visible blue body panel (x≈381) */}
        <path d="M374,179 L387,179 C391,181 392,185 390,190 C388,195 383,198 381,198 C379,198 374,195 372,190 C370,185 371,181 374,179 Z" fill="#ffee00" />
        {/* S letter — text renders correctly; bg-fly uses translateX only, no flip */}
        <text x="381" y="194" textAnchor="middle" fontSize="14" fontWeight="900" fill="#cc2222" fontFamily="Arial Black, Arial, sans-serif" style={{userSelect:'none'}}>S</text>
        {/* Lead arm outstretched forward — fist first */}
        <path d="
          M372,176 C362,174 350,170 338,164
          C334,162 330,160 326,158
        " stroke="#1040cc" strokeWidth={13} fill="none" strokeLinecap="round" />
        {/* Fist */}
        <circle cx={324} cy={157} r={9} fill="#f0c090" />
        {/* Trailing arm beside body */}
        <path d="M406,186 C412,192 418,200 420,210" stroke="#1040cc" strokeWidth={10} fill="none" strokeLinecap="round" />
        {/* Legs streamlined behind */}
        <path d="M375,212 C372,224 370,238 370,250" stroke="#1040cc" strokeWidth={12} fill="none" strokeLinecap="round" />
        <path d="M393,212 C394,224 396,238 398,250" stroke="#1040cc" strokeWidth={10} fill="none" strokeLinecap="round" />
        {/* Red boots */}
        <path d="M368,250 C366,256 364,260 366,264 C368,266 374,266 376,262 C376,258 374,254 370,251 Z" fill="#cc2222" />
        <path d="M396,250 C396,256 396,260 398,264 C400,266 406,264 408,260 C408,256 406,252 400,251 Z" fill="#cc2222" />
        {/* Speed lines */}
        {[152,162,172,182].map((y,i)=>(
          <line key={i} x1={415+i*2} y1={y} x2={448+i*6} y2={y} stroke="rgba(255,255,255,.25)" strokeWidth={1.5} />
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
        <linearGradient id="di-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4a1800" /><stop offset="50%" stopColor="#aa3800" /><stop offset="100%" stopColor="#c85020" /></linearGradient>
        <radialGradient id="di-lava" cx="50%" cy="50%"><stop offset="0%" stopColor="#ffcc00" /><stop offset="50%" stopColor="#ff4400" /><stop offset="100%" stopColor="#880000" /></radialGradient>
      </defs>
      <rect width={800} height={500} fill="url(#di-bg)" />
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
      {/* Whale — faces LEFT, swims LEFT via bg-drift-l (no flip) */}
      <g style={{ animation: 'bg-drift-l 25s linear infinite' }}>
        <ellipse cx={400} cy={180} rx={110} ry={52} fill="#2a3060" />
        <ellipse cx={380} cy={168} rx={40} ry={20} fill="#e8e0d0" opacity={0.6} />
        {/* Tail fin on the RIGHT side */}
        <path d="M510,180 Q540,155 540,200 Q540,225 510,210Z" fill="#2a3060" />
        {/* Eye on the LEFT side (snout) */}
        <circle cx={308} cy={168} r={10} fill="#1a2050" />
        <circle cx={310} cy={166} r={4} fill="white" />
        {/* Snout — left tip */}
        <path d="M290,180 C282,172 278,180 282,188 C286,192 292,188 290,180 Z" fill="#2a3060" />
        {/* Spout from blowhole (top-left area) */}
        <path d="M330,140 Q325,110 335,88" stroke="#88bbff" strokeWidth={4} fill="none" opacity={0.6} style={{ animation: 'bg-glow 3s ease-in-out infinite' }} />
        <ellipse cx={332} cy={86} rx={10} ry={6} fill="#88bbff" opacity={0.4} />
      </g>
      {/* Coral reef */}
      {[{x:80,c:'#ff6060'},{x:180,c:'#ff9940'},{x:600,c:'#ff4080'},{x:700,c:'#40e090'}].map((r,i)=>(
        <g key={i}>
          <polygon points={`${r.x},460 ${r.x-20},500 ${r.x+20},500`} fill={r.c} />
          <polygon points={`${r.x-12},450 ${r.x-30},500 ${r.x+5},500`} fill={r.c} opacity={0.7} />
          <polygon points={`${r.x+12},455 ${r.x-3},500 ${r.x+28},500`} fill={r.c} opacity={0.8} />
        </g>
      ))}
      {/* Fish schools — each centered on (0,0) with translate for position, tail attached at +rx */}
      {[
        {tx:620,ty:280,c:'#ffa040',dur:'8s',delay:'0s'},
        {tx:500,ty:310,c:'#ff7060',dur:'9s',delay:'0.7s'},
        {tx:680,ty:295,c:'#ffc060',dur:'7.5s',delay:'1.4s'},
        {tx:440,ty:260,c:'#ffa040',dur:'10s',delay:'0.3s'},
        {tx:560,ty:320,c:'#ff8050',dur:'8.5s',delay:'1s'},
        {tx:720,ty:275,c:'#ffb040',dur:'9.5s',delay:'1.8s'},
        {tx:480,ty:340,c:'#ffa040',dur:'7s',delay:'2s'},
        {tx:640,ty:305,c:'#ffc040',dur:'11s',delay:'0.5s'},
      ].map((f,i)=>(
        <g key={i} transform={`translate(${f.tx},${f.ty})`} style={{ animation: `bg-drift-l ${f.dur} ${f.delay} linear infinite` }}>
          <ellipse cx={0} cy={0} rx={12} ry={6} fill={f.c} opacity={0.85} />
          <polygon points="12,0 22,-6 22,6" fill={f.c} opacity={0.85} />
          <circle cx={-5} cy={-1} r={2} fill="#553010" opacity={0.7} />
        </g>
      ))}
      {/* Bubbles */}
      {Array.from({length:10},(_,i)=>(
        <circle key={i} cx={(i*113+50)%800} cy={480} r={3+i%3} fill="none" stroke="#60aaff" strokeWidth={1} opacity={0.5} style={{ animation: `bg-bubble ${4+i*.4}s ${i*.5}s linear infinite` }} />
      ))}
      {/* Whale tail breaching */}
      <g transform="translate(680,0)"><g style={{ animation: 'bg-float 6s 2s ease-in-out infinite' }}>
        <path d="M0,340 Q-20,300 -10,280 Q0,300 10,280 Q20,300 0,340Z" fill="#2a3060" opacity={0.8} />
        <ellipse cx={0} cy={340} rx={18} ry={6} fill="#1a2050" opacity={0.4} />
      </g>
      </g>
      {/* Jellyfish drifting down from top */}
      {[{x:120,c:'#ff80cc'},{x:350,c:'#80ccff'},{x:620,c:'#ffcc80'}].map((j,i)=>(
        <g key={i} style={{ animation: `bg-fall ${12+i*3}s ${i*4}s linear infinite` }} transform={`translate(${j.x},-80)`}>
          <ellipse cx={0} cy={0} rx={18} ry={12} fill={j.c} opacity={0.5} />
          {[-10,-4,4,10].map((dx,k)=>(
            <path key={k} d={`M${dx},10 Q${dx+3},25 ${dx},40`} stroke={j.c} strokeWidth={1.5} fill="none" opacity={0.4} />
          ))}
        </g>
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
        {tx:620,ty:185,c:'#ffe090',delay:'0s',dur:'6s'},
        {tx:480,ty:210,c:'#ff9080',delay:'0.5s',dur:'7s'},
        {tx:680,ty:220,c:'#90e0ff',delay:'1s',dur:'5.5s'},
        {tx:560,ty:165,c:'#a0ff90',delay:'1.5s',dur:'8s'},
        {tx:420,ty:195,c:'#ffe090',delay:'0.8s',dur:'6.5s'},
        {tx:720,ty:240,c:'#ffb0e0',delay:'1.8s',dur:'7.5s'},
      ].map((f,i)=>(
        <g key={i} transform={`translate(${f.tx},${f.ty})`} style={{ animation: `bg-drift-l ${f.dur} ${f.delay} linear infinite` }}>
          {/* Body centered at (0,0), fish faces LEFT — tail on the right */}
          <ellipse cx={0} cy={0} rx={11} ry={5} fill={f.c} opacity={0.85} />
          {/* Tail fin attached to right edge of body (x=+11) */}
          <polygon points="11,0 20,-6 20,6" fill={f.c} opacity={0.85} />
          {/* Eye on left of body */}
          <circle cx={-5} cy={-1} r={2} fill="#333" />
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
      <g style={{ animation: 'bg-drift-l 35s 8s linear infinite' }}>
        <polygon points="680,160 692,118 704,160" fill="#405060" opacity={0.55} />
      </g>
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
      {[{tx:580,ty:200,c:'#ff6040'},{tx:240,ty:310,c:'#40e0b0'},{tx:720,ty:370,c:'#ffcc20'},{tx:380,ty:240,c:'#ff90c0'}].map((f,i)=>(
        <g key={i} transform={`translate(${f.tx},${f.ty})`} style={{ animation: `bg-drift-l ${8+i*2}s ${i*.8}s linear infinite` }}>
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
      ))}
      {/* Bubbles */}
      {Array.from({length:12},(_,i)=>(
        <circle key={i} cx={(i*93+60)%800} cy={480} r={2+i%4} fill="none" stroke="#80e0ff" strokeWidth={1} opacity={0.4} style={{ animation: `bg-bubble ${3+i*.4}s ${i*.35}s linear infinite` }} />
      ))}
      {/* Treasure chest on seafloor */}
      <g transform="translate(100,460)"><g style={{ animation: 'bg-glow 4s ease-in-out infinite' }}>
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
        {/* Floating boats on flooded street */}
        {[{x:80},{x:500}].map((b,i)=>(
          <g key={i} style={{ animation: `bg-bob ${3+i}s ${i}s ease-in-out infinite` }} transform={`translate(${b.x},458)`}>
            <path d="M-22,0 L-18,-10 L18,-10 L22,0Z" fill="#6a3a10" />
            <rect x={-4} y={-18} width={8} height={10} fill="#8a5030" />
          </g>
        ))}
        {/* Floating leaf */}
        <g transform="translate(-30,0)"><g style={{ animation: 'bg-drift-r 15s 3s linear infinite' }}>
          <ellipse cx={300} cy={467} rx={12} ry={6} fill="#2a5010" opacity={0.7} transform="rotate(-15,300,467)" />
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
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="ca-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff70cc" /><stop offset="100%" stopColor="#ffbbee" /></linearGradient>
        <radialGradient id="lollipop-shine" cx="35%" cy="35%"><stop offset="0%" stopColor="rgba(255,255,255,0.55)" /><stop offset="100%" stopColor="rgba(255,255,255,0)" /></radialGradient>
      </defs>
      <rect width={800} height={500} fill="url(#ca-bg)" />
      {/* Cotton candy clouds */}
      {[{cx:120,cy:75},{cx:420,cy:55},{cx:690,cy:80}].map((c,i)=>(
        <g key={i} style={{ animation: `bg-cloud-drift ${9+i*2}s ease-in-out infinite alternate` }}>
          <ellipse cx={c.cx} cy={c.cy} rx={85} ry={42} fill="rgba(255,200,235,0.85)" />
          <ellipse cx={c.cx+28} cy={c.cy-14} rx={65} ry={35} fill="rgba(255,215,245,0.9)" />
          <ellipse cx={c.cx-22} cy={c.cy-8} rx={55} ry={28} fill="rgba(255,200,240,0.8)" />
        </g>
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
      {/* Unicorn — proper horse silhouette with flowing mane, spiral horn, galloping pose */}
      <g style={{ animation: 'bg-drift-lr 15s ease-in-out infinite' }}>
        {/* Body — horse torso shape */}
        <path d="
          M320,260 C315,252 315,244 320,238
          C328,226 345,220 365,220
          C395,220 440,228 462,244
          C478,256 480,272 472,284
          C460,298 430,306 395,308
          C360,308 330,298 320,284
          C316,278 316,268 320,260 Z
        " fill="white" />
        {/* Neck — arched proudly */}
        <path d="M325,242 C318,228 316,212 320,198" stroke="white" strokeWidth={28} fill="none" strokeLinecap="round" />
        {/* Head — proper horse muzzle shape */}
        <path d="
          M320,198 C314,192 308,188 304,186
          C296,184 288,186 284,192
          C280,198 280,208 286,214
          C290,218 298,220 308,218
          C316,216 322,208 320,198 Z
        " fill="white" />
        {/* Muzzle / snout */}
        <path d="M280,204 C274,202 268,204 266,210 C266,216 272,220 280,218" fill="white" />
        <ellipse cx={272} cy={210} rx={8} ry={5} fill="#f0c0e0" opacity={0.6} />
        {/* Nostril */}
        <ellipse cx={270} cy={212} rx={4} ry={3} fill="#e0a0c0" opacity={0.8} />
        {/* Horn — twisted spiral */}
        <path d="M304,182 C302,172 304,160 308,148 C310,140 312,130 314,120" stroke="#c080ff" strokeWidth={7} fill="none" strokeLinecap="round" />
        <path d="M308,182 C310,172 310,160 308,148 C306,140 306,130 310,120" stroke="#e0a0ff" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.6} />
        {/* Horn segments */}
        {[182,168,154,140,128].map((y,i)=>(
          <path key={i} d={`M${304+i},${y} C${308},${y+2} ${312},${y} ${308+i},${y}`} stroke="#a060dd" strokeWidth={2} fill="none" opacity={0.5} />
        ))}
        {/* Flowing mane — rainbow colors cascading down neck */}
        <path d="M320,198 C330,185 338,175 342,168 C346,162 348,170 344,180 C352,164 358,154 360,148 C362,156 358,170 354,180 C360,162 368,152 374,148 C374,158 368,172 364,182" stroke="#ff80cc" strokeWidth={5} fill="none" strokeLinecap="round" />
        <path d="M320,205 C330,192 340,180 348,173 C352,168 354,176 350,186 C358,170 366,160 372,156" stroke="#c060ff" strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d="M322,212 C333,200 344,190 354,185" stroke="#80c0ff" strokeWidth={3} fill="none" strokeLinecap="round" />
        {/* Eye — large, expressive */}
        <ellipse cx={292} cy={198} rx={9} ry={9} fill="#8040cc" />
        <ellipse cx={292} cy={198} rx={5} ry={5} fill="#111" />
        <circle cx={290} cy={196} r={3} fill="white" opacity={0.8} />
        {/* Lashes */}
        <path d="M284,192 C286,188 290,186 294,186" stroke="#6020aa" strokeWidth={1.5} fill="none" />
        <path d="M286,190 L284,186" stroke="#6020aa" strokeWidth={1.5} strokeLinecap="round" />
        <path d="M291,188 L291,184" stroke="#6020aa" strokeWidth={1.5} strokeLinecap="round" />
        {/* Ear */}
        <path d="M316,190 C312,182 314,174 320,172 C324,174 326,182 322,190 Z" fill="white" />
        <path d="M317,190 C314,184 315,178 320,176 C323,178 324,184 322,190 Z" fill="#f0c0f0" opacity={0.6} />
        {/* Legs — galloping pose, all 4 legs */}
        {/* Front left — stretched forward */}
        <path d="M345,300 C338,316 334,334 334,354" stroke="white" strokeWidth={14} fill="none" strokeLinecap="round" style={{ animation: 'bg-float-sm 0.8s ease-in-out infinite' }} />
        <ellipse cx={334} cy={358} rx={10} ry={6} fill="#f0f0f0" />
        {/* Front right — lifted */}
        <path d="M365,306 C360,320 360,338 365,356" stroke="white" strokeWidth={14} fill="none" strokeLinecap="round" style={{ animation: 'bg-float-sm 0.8s 0.2s ease-in-out infinite' }} />
        <ellipse cx={366} cy={360} rx={10} ry={6} fill="#f0f0f0" />
        {/* Back left — pushing */}
        <path d="M430,304 C436,320 438,338 432,356" stroke="white" strokeWidth={14} fill="none" strokeLinecap="round" style={{ animation: 'bg-float-sm 0.8s 0.4s ease-in-out infinite' }} />
        <ellipse cx={432} cy={360} rx={10} ry={6} fill="#f0f0f0" />
        {/* Back right — trailing */}
        <path d="M455,298 C462,314 466,332 462,350" stroke="white" strokeWidth={14} fill="none" strokeLinecap="round" style={{ animation: 'bg-float-sm 0.8s 0.6s ease-in-out infinite' }} />
        <ellipse cx={462} cy={354} rx={10} ry={6} fill="#f0f0f0" />
        {/* Tail — flowing rainbow */}
        <path d="M472,276 C490,258 506,248 510,262 C514,276 498,294 490,310" stroke="#ff80cc" strokeWidth={7} fill="none" strokeLinecap="round" />
        <path d="M472,280 C492,265 512,258 516,274 C518,286 504,306 496,322" stroke="#c060ff" strokeWidth={5} fill="none" strokeLinecap="round" />
        <path d="M472,284 C494,272 518,270 520,286 C520,298 506,318 498,334" stroke="#80c0ff" strokeWidth={4} fill="none" strokeLinecap="round" />
        {/* Sparkle trail */}
        {[[510,280],[530,300],[548,286],[520,318]].map(([x,y],i)=>(
          <path key={i} d={`M${x},${y} L${x+3},${y-8} L${x},${y-4} L${x-3},${y-8} Z M${x+6},${y} L${x},${y-3} Z`} fill={['#ffee40','#ff80cc','#c080ff','#80ffee'][i]} opacity={0.8} style={{ animation: `bg-twinkle ${1+i*.3}s ${i*.2}s ease-in-out infinite` }} />
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
      {/* Spider-Man swinging — proper dynamic figure */}
      <g style={{ animation: 'bg-fly 10s 1.5s ease-in-out infinite' }}>
        {/* Web line from hand up to building anchor */}
        <path d="M348,125 C355,105 370,90 400,80" stroke="#d0d0d0" strokeWidth={1.8} fill="none" opacity={0.7} />
        {/* Head — round with mask */}
        <circle cx={400} cy={136} r={16} fill="#cc1122" />
        {/* Web pattern on mask */}
        {[[-8,-4],[0,-4],[8,-4],[-8,2],[0,2],[8,2]].map(([dx,dy],i)=>(
          <line key={i} x1={400+dx} y1={136+dy} x2={400+dx+4} y2={136+dy+5} stroke="#990011" strokeWidth={0.7} opacity={0.6} />
        ))}
        {/* Spider lenses — angular white eyes */}
        <ellipse cx={394} cy={133} rx={8} ry={5} fill="white" opacity={0.9} />
        <ellipse cx={407} cy={133} rx={8} ry={5} fill="white" opacity={0.9} />
        {/* Lens detail — inner white */}
        <ellipse cx={394} cy={133} rx={5} ry={3} fill="white" />
        <ellipse cx={407} cy={133} rx={5} ry={3} fill="white" />
        {/* Torso */}
        <path d="M388,150 C384,154 382,164 384,174 C386,180 394,184 400,184 C406,184 414,180 416,174 C418,164 416,154 412,150 C408,148 392,148 388,150 Z" fill="#cc1122" />
        {/* Blue legs on suit */}
        <path d="M385,180 C382,188 378,198 374,208 C378,212 384,212 386,210 C388,202 390,192 392,184 Z" fill="#1122cc" />
        <path d="M415,180 C418,188 422,198 426,208 C422,212 416,212 414,210 C412,202 408,192 408,184 Z" fill="#1122cc" />
        {/* Boots */}
        <path d="M372,208 C370,214 370,220 374,222 C378,224 386,222 387,218 C386,214 382,210 378,208 Z" fill="#cc1122" />
        <path d="M428,208 C430,214 430,220 426,222 C422,224 414,222 413,218 C414,214 418,210 422,208 Z" fill="#cc1122" />
        {/* Web-shooting arm stretched up — dynamic pose */}
        <path d="M388,156 C380,152 372,148 365,143 C360,140 356,136 352,132" stroke="#1122cc" strokeWidth={8} fill="none" strokeLinecap="round" />
        <path d="M350,132 C348,130 347,128 348,126" stroke="#1122cc" strokeWidth={6} fill="none" strokeLinecap="round" />
        {/* Web-shooter hand */}
        <circle cx={348} cy={125} r={6} fill="#cc1122" />
        {/* Other arm behind body */}
        <path d="M412,158 C420,164 428,172 432,182" stroke="#1122cc" strokeWidth={8} fill="none" strokeLinecap="round" />
        {/* Spider emblem on chest */}
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
        <g transform="translate(400,92) scale(1.3)" style={{ animation: 'bg-signal-blink 6s ease-in-out infinite' }}>
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
        </g>
        {/* Storm clouds */}
        <ellipse cx={180} cy={110} rx={160} ry={65} fill="#0c0c16" style={{ animation: 'bg-cloud-drift 15s ease-in-out infinite alternate' }} />
        <ellipse cx={250} cy={88} rx={130} ry={55} fill="#101020" style={{ animation: 'bg-cloud-drift 12s ease-in-out infinite alternate' }} />
        <ellipse cx={580} cy={120} rx={180} ry={70} fill="#0a0a14" style={{ animation: 'bg-cloud-drift 18s ease-in-out infinite alternate-reverse' }} />
        <ellipse cx={660} cy={95} rx={140} ry={60} fill="#0c0c18" style={{ animation: 'bg-cloud-drift 10s ease-in-out infinite alternate-reverse' }} />
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
      <ellipse cx={400} cy={490} rx={500} ry={45} fill="white" opacity={0.25} />
      <ellipse cx={400} cy={496} rx={600} ry={35} fill="white" opacity={0.15} />
    </svg>
  )
}

function Scene_christmas() {
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="ch-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#010310" /><stop offset="100%" stopColor="#041220" /></linearGradient>
        <radialGradient id="ch-moon" cx="50%" cy="50%"><stop offset="0%" stopColor="#fffde8" /><stop offset="100%" stopColor="#e8e0c8" /></radialGradient>
        <radialGradient id="ch-snow" cx="50%" cy="0%"><stop offset="0%" stopColor="#ddeeff" stopOpacity={0.35}/><stop offset="100%" stopColor="#ddeeff" stopOpacity={0}/></radialGradient>
      </defs>
      <rect width={800} height={500} fill="url(#ch-bg)" />
      <Stars n={80} />

      {/* Big full moon */}
      <circle cx={400} cy={130} r={72} fill="url(#ch-moon)" style={{ animation: 'bg-glow 8s ease-in-out infinite' }} />
      <circle cx={400} cy={130} r={72} fill="none" stroke="rgba(255,250,220,0.15)" strokeWidth={10} />

      {/* SANTA SLEIGH + REINDEER flying across the moon */}
      <g style={{ animation: 'bg-drift-lr 18s 1s ease-in-out infinite' }}>
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

      {/* Snowy ground */}
      <ellipse cx={400} cy={498} rx={600} ry={60} fill="url(#ch-snow)" />
      <path d="M0,460 Q100,440 200,455 Q300,470 400,450 Q500,430 600,450 Q700,470 800,455 L800,500 L0,500Z" fill="rgba(200,225,255,0.18)" />

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
      <g transform="translate(400,430)">
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
      <g transform="translate(650,400)">
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
      opacity: 0.4,
      willChange: 'transform',
      contain: 'paint layout',
    }}>
      <Scene />
    </div>
  )
}
