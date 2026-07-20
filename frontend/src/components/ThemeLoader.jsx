import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

/* ─── Per-theme animation configs ─────────────────────────────────────────── */
const THEMES_ANIM = {

  // ── Superheroes ──────────────────────────────────────────────────────────

  spiderman: {
    msg: ['Spinning a web…', 'Your friendly neighbourhood AI…', 'Thwip! Almost done…'],
    bg: '#c62828', color: 'white',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes web-spin { from { transform-origin:60px 60px; transform:rotate(0deg); } to { transform-origin:60px 60px; transform:rotate(360deg); } }
          @keyframes sp-pulse { 0%,100% { opacity:.3; } 50% { opacity:1; } }
        `}</style>
        {/* web lines */}
        {[0,30,60,90,120,150].map(a => (
          <line key={a} x1="60" y1="60" x2={60 + 55 * Math.cos(a*Math.PI/180)} y2={60 + 55 * Math.sin(a*Math.PI/180)}
            stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
        ))}
        {/* concentric web rings */}
        {[18,34,50].map((r,i) => (
          <circle key={r} cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1"
            style={{ animation: `web-spin ${2 + i}s linear infinite ${i % 2 === 0 ? '' : 'reverse'}` }} />
        ))}
        {/* spider */}
        <g style={{ animation: 'sp-pulse 1.2s ease-in-out infinite' }}>
          <circle cx="60" cy="60" r="14" fill="#1565c0" />
          <ellipse cx="60" cy="56" rx="6" ry="8" fill="white" />
          <ellipse cx="60" cy="67" rx="9" ry="7" fill="white" />
          {[-8,-4,4,8].map(dx => (
            <line key={dx} x1={60+dx} y1="60" x2={60+dx*2.2} y2={dx < 0 ? 50 : 50}
              stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          ))}
        </g>
      </svg>
    ),
  },

  batman: {
    msg: ['The Dark Knight is thinking…', 'Gotham awaits…', 'Activating the Batcomputer…'],
    bg: '#212121', color: '#ffd600',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes bat-signal { 0%,100%{opacity:.15} 50%{opacity:.55} }
          @keyframes bat-flap { 0%,100%{transform:scaleX(1)} 50%{transform:scaleX(.85)} }
        `}</style>
        {/* signal rings */}
        {[48,36,24,12].map((r,i) => (
          <circle key={r} cx="60" cy="60" r={r} fill="none" stroke="#ffd600"
            strokeWidth={1.5} style={{ animation: `bat-signal ${1.2+i*0.3}s ease-in-out infinite ${i*0.2}s`, opacity:.2 }} />
        ))}
        {/* bat silhouette */}
        <g style={{ transformOrigin:'60px 62px', animation:'bat-flap 0.8s ease-in-out infinite' }}>
          <ellipse cx="60" cy="62" rx="9" ry="11" fill="#ffd600" />
          {/* left wing */}
          <path d="M51 62 Q38 48 25 58 Q35 64 51 66Z" fill="#ffd600" />
          {/* right wing */}
          <path d="M69 62 Q82 48 95 58 Q85 64 69 66Z" fill="#ffd600" />
          {/* ears */}
          <polygon points="55,54 52,44 58,52" fill="#ffd600" />
          <polygon points="65,54 62,52 68,44" fill="#ffd600" />
        </g>
      </svg>
    ),
  },

  avengers: {
    msg: ['Assembling…', 'Calling the Avengers…', 'Arc reactor charging…'],
    bg: '#1565c0', color: '#ffd600',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes arc-spin { to { transform:rotate(360deg); transform-origin:60px 60px; } }
          @keyframes arc-glow { 0%,100%{opacity:.4} 50%{opacity:1} }
        `}</style>
        {/* outer ring */}
        <circle cx="60" cy="60" r="52" fill="none" stroke="#ffd600" strokeWidth="3"
          style={{ animation:'arc-spin 3s linear infinite' }}
          strokeDasharray="20 10" />
        {/* A shape */}
        <g style={{ animation:'arc-glow 1.5s ease-in-out infinite' }}>
          <polygon points="60,22 82,82 72,82 60,50 48,82 38,82" fill="#ffd600" />
          <line x1="50" y1="65" x2="70" y2="65" stroke="#1565c0" strokeWidth="5" />
        </g>
        {/* arc reactor rings */}
        {[28,20,12].map((r,i) => (
          <circle key={r} cx="60" cy="60" r={r} fill="none" stroke="rgba(255,214,0,0.5)"
            strokeWidth="1.5" style={{ animation:`arc-spin ${1.5+i*0.4}s linear infinite ${i%2===0?'':'reverse'}` }} />
        ))}
        <circle cx="60" cy="60" r="6" fill="#ffd600" style={{ animation:'arc-glow 1s ease-in-out infinite' }} />
      </svg>
    ),
  },

  superman: {
    msg: ['Up, up and away…', 'Faster than a speeding bullet…', 'Superman is on it…'],
    bg: '#1565c0', color: '#ffd600',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes s-spin { to { transform:rotate(360deg); transform-origin:60px 60px; } }
          @keyframes s-pop  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.12)} }
        `}</style>
        {/* outer cape swirl */}
        <path d="M60 10 Q95 30 95 60 Q95 90 60 110 Q90 80 85 60 Q80 35 60 10Z"
          fill="rgba(198,40,40,0.6)" style={{ animation:'s-spin 4s linear infinite', transformOrigin:'60px 60px' }} />
        {/* shield */}
        <g style={{ animation:'s-pop 1.4s ease-in-out infinite' }}>
          <path d="M60 18 L88 35 L88 65 Q88 88 60 102 Q32 88 32 65 L32 35Z" fill="#c62828" />
          <path d="M60 26 L82 40 L82 63 Q82 82 60 94 Q38 82 38 63 L38 40Z" fill="#ffd600" />
          <text x="60" y="72" textAnchor="middle" fontSize="32" fontWeight="900"
            fontFamily="serif" fill="#1565c0">S</text>
        </g>
      </svg>
    ),
  },

  frozen: {
    msg: ['Let it go…', 'Building an ice palace…', 'Elsa is creating magic…'],
    bg: '#0288d1', color: 'white',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes snow-fall { 0%{transform:translateY(-10px) rotate(0deg);opacity:0} 20%{opacity:1} 100%{transform:translateY(110px) rotate(360deg);opacity:0} }
          @keyframes crystal-spin { to { transform:rotate(360deg); transform-origin:60px 60px; } }
        `}</style>
        {/* snowflakes */}
        {[15,35,55,75,95,25,65,45,85].map((x,i) => (
          <g key={i} style={{ animation:`snow-fall ${1.5+i*0.4}s linear infinite ${i*0.3}s` }}>
            <text x={x} y="10" fontSize={10+i%3*4} fill="rgba(255,255,255,0.9)" textAnchor="middle">❄</text>
          </g>
        ))}
        {/* ice crystal */}
        <g style={{ animation:'crystal-spin 6s linear infinite' }}>
          {[0,60,120].map(a => (
            <line key={a} x1="60" y1="60"
              x2={60+32*Math.cos(a*Math.PI/180)} y2={60+32*Math.sin(a*Math.PI/180)}
              stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          ))}
          {[0,60,120].map(a => (
            <line key={'b'+a} x1="60" y1="60"
              x2={60+32*Math.cos((a+30)*Math.PI/180)} y2={60+32*Math.sin((a+30)*Math.PI/180)}
              stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
          ))}
        </g>
        <circle cx="60" cy="60" r="8" fill="white" />
      </svg>
    ),
  },

  princess: {
    msg: ['Waving the magic wand…', 'Bibbidi-Bobbidi-Boo…', 'Royal magic in progress…'],
    bg: '#ad1457', color: '#ffd600',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes wand-stars { 0%{transform:translate(0,0) scale(1);opacity:1} 100%{transform:translate(var(--dx),var(--dy)) scale(0);opacity:0} }
          @keyframes crown-bob  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        `}</style>
        {/* wand */}
        <line x1="30" y1="90" x2="72" y2="48" stroke="#ffd600" strokeWidth="4" strokeLinecap="round" />
        {/* star tip */}
        <g style={{ animation:'crown-bob 1.2s ease-in-out infinite' }}>
          <text x="74" y="50" fontSize="22" fill="#ffd600">⭐</text>
        </g>
        {/* flying stars */}
        {[
          {x:85,y:30,dx:'20px',dy:'-15px'},{x:95,y:55,dx:'18px',dy:'10px'},
          {x:70,y:20,dx:'-5px',dy:'-20px'},{x:55,y:35,dx:'-15px',dy:'-10px'},
          {x:90,y:75,dx:'15px',dy:'20px'},{x:40,y:55,dx:'-20px',dy:'5px'},
        ].map((s,i) => (
          <text key={i} x={s.x} y={s.y} fontSize="12" fill="#ffd600" textAnchor="middle"
            style={{ '--dx':s.dx,'--dy':s.dy, animation:`wand-stars 1.4s ease-out infinite ${i*0.25}s` }}>✦</text>
        ))}
        {/* crown */}
        <g style={{ animation:'crown-bob 2s ease-in-out infinite 0.3s' }}>
          <polygon points="20,75 28,55 36,70 44,50 52,70 60,55 68,75" fill="#ffd600" />
          {[24,44,64].map(cx => <circle key={cx} cx={cx} cy={57} r={4} fill="#ad1457" />)}
        </g>
      </svg>
    ),
  },

  // ── Festivals ─────────────────────────────────────────────────────────────

  christmas: {
    msg: ['Santa is checking the list…', 'Elves are working…', 'Ho ho ho…'],
    bg: '#c62828', color: 'white',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes xmas-snow { 0%{transform:translateY(-5px);opacity:0} 15%{opacity:1} 100%{transform:translateY(115px);opacity:0} }
          @keyframes star-twinkle { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }
          @keyframes bell-sway { 0%,100%{transform:rotate(-15deg)} 50%{transform:rotate(15deg)} }
        `}</style>
        {[10,25,45,65,80,95,30,55,75].map((x,i) => (
          <text key={i} x={x} y="0" fontSize={8+i%3*3} fill="rgba(255,255,255,0.9)" textAnchor="middle"
            style={{ animation:`xmas-snow ${2+i*0.3}s linear infinite ${i*0.35}s` }}>❄</text>
        ))}
        {/* tree */}
        <polygon points="60,20 38,85 82,85" fill="#2e7d32" />
        <polygon points="60,30 42,75 78,75" fill="#388e3c" />
        <rect x="53" y="85" width="14" height="12" fill="#795548" rx="2" />
        {/* ornaments */}
        {[[48,55,'#ffd600'],[65,48,'#ff8f00'],[52,70,'#e91e8c'],[70,65,'#4fc3f7']].map(([x,y,c],i) => (
          <circle key={i} cx={x} cy={y} r="5" fill={c} style={{ animation:`star-twinkle ${1+i*0.3}s ease-in-out infinite ${i*0.2}s` }} />
        ))}
        {/* star */}
        <text x="60" y="26" fontSize="14" textAnchor="middle" fill="#ffd600"
          style={{ animation:'star-twinkle 0.8s ease-in-out infinite' }}>★</text>
        {/* bell */}
        <text x="95" y="40" fontSize="20" style={{ transformOrigin:'95px 40px', animation:'bell-sway 1s ease-in-out infinite' }}>🔔</text>
      </svg>
    ),
  },

  diwali: {
    msg: ['Lighting the diyas…', 'Festival of lights…', 'Spreading the glow…'],
    bg: '#e65100', color: '#ffd600',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes spark { 0%{transform:translate(0,0) scale(1);opacity:1} 100%{transform:translate(var(--sx),var(--sy)) scale(0);opacity:0} }
          @keyframes flame  { 0%,100%{transform:scaleY(1) scaleX(1)} 50%{transform:scaleY(1.2) scaleX(.8)} }
          @keyframes diya-glow { 0%,100%{opacity:.6} 50%{opacity:1} }
        `}</style>
        {/* diya */}
        <ellipse cx="60" cy="82" rx="28" ry="10" fill="#bf360c" style={{ animation:'diya-glow 1s ease-in-out infinite' }} />
        <path d="M32 82 Q60 70 88 82 Q80 92 40 92Z" fill="#e64a19" />
        {/* flame */}
        <g style={{ transformOrigin:'60px 68px', animation:'flame 0.6s ease-in-out infinite' }}>
          <ellipse cx="60" cy="68" rx="5" ry="12" fill="#ffd600" />
          <ellipse cx="60" cy="72" rx="3" ry="7" fill="#ff6f00" />
        </g>
        {/* sparks */}
        {[
          {sx:'-30px',sy:'-35px'},{sx:'30px',sy:'-35px'},{sx:'-40px',sy:'-15px'},
          {sx:'40px',sy:'-15px'},{sx:'-20px',sy:'-50px'},{sx:'20px',sy:'-50px'},
          {sx:'0px',sy:'-55px'},{sx:'-10px',sy:'-40px'},{sx:'10px',sy:'-40px'},
        ].map((s,i) => (
          <circle key={i} cx="60" cy="68" r="2.5"
            fill={['#ffd600','#ff8f00','#ffcc02'][i%3]}
            style={{ '--sx':s.sx,'--sy':s.sy, animation:`spark 1.2s ease-out infinite ${i*0.15}s` }} />
        ))}
        {/* floating rangoli dots */}
        {[15,40,80,105].map((x,i) => (
          <circle key={i} cx={x} cy={25+i*15} r="3"
            fill={['#ffd600','#e91e8c','#4caf50','#ff9800'][i]}
            style={{ animation:`diya-glow ${0.8+i*0.2}s ease-in-out infinite ${i*0.3}s` }} />
        ))}
      </svg>
    ),
  },

  halloween: {
    msg: ['Trick or treat…', 'Something wicked this way comes…', 'Boo! Almost ready…'],
    bg: '#1a1a1a', color: '#e65100',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes ghost-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
          @keyframes bat-fly { 0%{transform:translate(0,0) scaleX(1)} 50%{transform:translate(20px,-8px) scaleX(-1)} 100%{transform:translate(40px,0) scaleX(1)} }
          @keyframes eye-blink { 0%,90%,100%{scaleY:1} 95%{transform:scaleY(.1)} }
          @keyframes moon-glow { 0%,100%{opacity:.7} 50%{opacity:1} }
        `}</style>
        {/* moon */}
        <path d="M95 25 Q75 18 68 35 Q80 32 88 45 Q102 38 95 25Z" fill="#ffd600"
          style={{ animation:'moon-glow 2s ease-in-out infinite' }} />
        {/* bats */}
        {[0,0.5,1].map(delay => (
          <g key={delay} style={{ animation:`bat-fly ${2+delay}s ease-in-out infinite ${delay}s` }}>
            <text x={10+delay*10} y={30+delay*15} fontSize="16">🦇</text>
          </g>
        ))}
        {/* ghost */}
        <g style={{ animation:'ghost-float 2s ease-in-out infinite' }}>
          <path d="M42 95 Q42 60 60 55 Q78 60 78 95 Q72 89 66 95 Q60 89 54 95 Q48 89 42 95Z"
            fill="rgba(255,255,255,0.9)" />
          {/* eyes */}
          <ellipse cx="54" cy="73" rx="5" ry="6" fill="#1a1a1a" />
          <ellipse cx="66" cy="73" rx="5" ry="6" fill="#1a1a1a" />
          <circle cx="55" cy="71" r="2" fill="white" />
          <circle cx="67" cy="71" r="2" fill="white" />
          {/* smile */}
          <path d="M53 82 Q60 88 67 82" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
        </g>
        {/* pumpkin */}
        <g transform="translate(8,75)">
          <ellipse cx="18" cy="20" rx="16" ry="14" fill="#e65100" />
          <rect x="15" y="6" width="6" height="6" rx="3" fill="#2e7d32" />
          {/* face */}
          <polygon points="10,15 14,22 6,22" fill="#1a1a1a" />
          <polygon points="22,15 26,22 18,22" fill="#1a1a1a" />
          <path d="M8 27 Q18 34 28 27" fill="#1a1a1a" />
        </g>
      </svg>
    ),
  },

  // ── Nature ────────────────────────────────────────────────────────────────

  ocean: {
    msg: ['Riding the waves…', 'Deep sea thinking…', 'Surfing for ideas…'],
    bg: '#0096c7', color: 'white',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes wave1 { 0%,100%{d:path('M0,60 Q30,45 60,60 Q90,75 120,60 L120,100 L0,100Z')} 50%{d:path('M0,60 Q30,75 60,60 Q90,45 120,60 L120,100 L0,100Z')} }
          @keyframes wave2 { 0%,100%{d:path('M0,70 Q30,55 60,70 Q90,85 120,70 L120,100 L0,100Z')} 50%{d:path('M0,70 Q30,85 60,70 Q90,55 120,70 L120,100 L0,100Z')} }
          @keyframes fish-swim { 0%{transform:translateX(-20px)} 100%{transform:translateX(140px)} }
          @keyframes bubble-up { 0%{transform:translateY(80px);opacity:0} 20%{opacity:.8} 100%{transform:translateY(-10px);opacity:0} }
        `}</style>
        <path d="M0,60 Q30,45 60,60 Q90,75 120,60 L120,110 L0,110Z" fill="rgba(0,180,216,0.5)"
          style={{ animation:'wave1 2s ease-in-out infinite' }} />
        <path d="M0,70 Q30,55 60,70 Q90,85 120,70 L120,110 L0,110Z" fill="rgba(0,119,182,0.7)"
          style={{ animation:'wave2 2.5s ease-in-out infinite 0.3s' }} />
        {/* fish */}
        <g style={{ animation:'fish-swim 3s linear infinite' }}>
          <ellipse cx="20" cy="45" rx="12" ry="7" fill="#ffd600" />
          <polygon points="8,45 0,38 0,52" fill="#ffd600" />
          <circle cx="26" cy="43" r="2" fill="#333" />
        </g>
        {/* bubbles */}
        {[30,55,80].map((x,i) => (
          <circle key={i} cx={x} cy="80" r={3+i} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"
            style={{ animation:`bubble-up ${1.5+i*0.5}s ease-in infinite ${i*0.4}s` }} />
        ))}
        {/* sun above */}
        <circle cx="60" cy="25" r="18" fill="#ffd93d" opacity="0.9" />
        {[0,45,90,135,180,225,270,315].map(a => (
          <line key={a} x1={60+20*Math.cos(a*Math.PI/180)} y1={25+20*Math.sin(a*Math.PI/180)}
            x2={60+27*Math.cos(a*Math.PI/180)} y2={25+27*Math.sin(a*Math.PI/180)}
            stroke="#ffd93d" strokeWidth="2.5" strokeLinecap="round" />
        ))}
      </svg>
    ),
  },

  forest: {
    msg: ['Rustling through the leaves…', 'The forest is thinking…', 'Talking to the trees…'],
    bg: '#2d9a4e', color: 'white',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes leaf-fall { 0%{transform:translate(0,-10px) rotate(0deg);opacity:0} 10%{opacity:1} 100%{transform:translate(var(--lx),90px) rotate(360deg);opacity:0} }
          @keyframes firefly { 0%,100%{opacity:0;transform:translate(0,0)} 50%{opacity:1;transform:translate(var(--fx),var(--fy))} }
          @keyframes tree-sway { 0%,100%{transform:rotate(-2deg)} 50%{transform:rotate(2deg)} }
        `}</style>
        {/* tree */}
        <g style={{ transformOrigin:'60px 95px', animation:'tree-sway 3s ease-in-out infinite' }}>
          <polygon points="60,15 30,70 90,70" fill="#1b5e20" />
          <polygon points="60,30 33,78 87,78" fill="#2e7d32" />
          <polygon points="60,45 36,88 84,88" fill="#388e3c" />
          <rect x="55" y="88" width="10" height="18" fill="#795548" rx="2" />
        </g>
        {/* falling leaves */}
        {[['#ffd600','--10px'],['#ff8f00','10px'],['#4caf50','-20px'],['#8bc34a','20px'],['#cddc39','-5px']].map(([c,lx],i) => (
          <text key={i} x={20+i*20} y="-5" fontSize={12+i%3*3} fill={c}
            style={{ '--lx':lx, animation:`leaf-fall ${2+i*0.4}s ease-in infinite ${i*0.45}s` }}>🍃</text>
        ))}
        {/* fireflies */}
        {[[15,60],[100,40],[20,90],[105,75]].map(([x,y],i) => (
          <circle key={i} cx={x} cy={y} r="3" fill="#ffd600"
            style={{ '--fx':`${(i%2===0?1:-1)*15}px`,'--fy':`${-10-i*5}px`, animation:`firefly ${1.5+i*0.4}s ease-in-out infinite ${i*0.5}s` }} />
        ))}
      </svg>
    ),
  },

  galaxy: {
    msg: ['Launching into hyperspace…', 'Calculating lightspeed…', 'Stars aligning…'],
    bg: '#03001c', color: '#40c4ff',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes orbit { from{transform:rotate(0deg) translateX(42px) rotate(0deg)} to{transform:rotate(360deg) translateX(42px) rotate(-360deg)} }
          @keyframes twinkle { 0%,100%{opacity:.3;r:1.5} 50%{opacity:1;r:2.5} }
          @keyframes rocket-wobble { 0%,100%{transform:rotate(-5deg)} 50%{transform:rotate(5deg)} }
        `}</style>
        {/* stars */}
        {Array.from({length:18},(_,i)=>(
          <circle key={i} cx={5+i*7} cy={8+(i*17)%100} r="1.5" fill="white"
            style={{ animation:`twinkle ${0.8+i*0.2}s ease-in-out infinite ${i*0.15}s` }} />
        ))}
        {/* orbit ring */}
        <circle cx="60" cy="60" r="42" fill="none" stroke="rgba(64,196,255,0.25)" strokeWidth="1" />
        {/* orbiting rocket */}
        <g style={{ transformOrigin:'60px 60px', animation:'orbit 3s linear infinite' }}>
          <text x="-6" y="4" fontSize="18" style={{ animation:'rocket-wobble 1s ease-in-out infinite' }}>🚀</text>
        </g>
        {/* planet */}
        <circle cx="60" cy="60" r="18" fill="#7c4dff" />
        <ellipse cx="60" cy="60" rx="28" ry="8" fill="none" stroke="rgba(64,196,255,0.6)" strokeWidth="2.5" />
        <circle cx="60" cy="60" r="14" fill="#9c6ffe" />
        <circle cx="55" cy="55" r="4" fill="rgba(255,255,255,0.2)" />
      </svg>
    ),
  },

  moon: {
    msg: ['Wishing on a star…', 'Moonbeams loading…', 'Counting shooting stars…'],
    bg: '#1a237e', color: '#ffd54f',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes shoot { 0%{transform:translate(0,0);opacity:1} 100%{transform:translate(60px,40px);opacity:0} }
          @keyframes star-twinkle2 { 0%,100%{opacity:.2} 50%{opacity:1} }
          @keyframes moon-pulse { 0%,100%{filter:drop-shadow(0 0 4px #ffd54f)} 50%{filter:drop-shadow(0 0 14px #ffd54f)} }
        `}</style>
        {/* stars */}
        {[[10,15],[30,8],[80,12],[100,20],[15,40],[105,55],[95,30],[50,6]].map(([x,y],i) => (
          <circle key={i} cx={x} cy={y} r="1.8" fill="white"
            style={{ animation:`star-twinkle2 ${1+i*0.25}s ease-in-out infinite ${i*0.2}s` }} />
        ))}
        {/* shooting stars */}
        {[0,0.7,1.4].map((d,i) => (
          <line key={i} x1={10+i*15} y1={20+i*10} x2={30+i*15} y2={35+i*10}
            stroke="white" strokeWidth="2" strokeLinecap="round"
            style={{ animation:`shoot 2s ease-out infinite ${d}s`, opacity:0 }} />
        ))}
        {/* moon */}
        <g style={{ animation:'moon-pulse 2s ease-in-out infinite' }}>
          <circle cx="68" cy="60" r="30" fill="#ffd54f" />
          <circle cx="82" cy="48" r="24" fill="#1a237e" />
        </g>
        {/* small stars near moon */}
        {[[20,65],[25,80],[35,55]].map(([x,y],i) => (
          <text key={i} x={x} y={y} fontSize={10+i*4} fill="#ffd54f" textAnchor="middle"
            style={{ animation:`star-twinkle2 ${0.9+i*0.3}s ease-in-out infinite ${i*0.4}s` }}>★</text>
        ))}
      </svg>
    ),
  },

  sunshine: {
    msg: ['Soaking up sunshine…', 'Bright ideas loading…', 'The sun is thinking…'],
    bg: '#f9a825', color: 'white',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes sun-spin { to{transform:rotate(360deg);transform-origin:60px 60px;} }
          @keyframes sun-pulse { 0%,100%{r:28} 50%{r:34} }
        `}</style>
        {/* rays */}
        <g style={{ animation:'sun-spin 8s linear infinite' }}>
          {Array.from({length:12},(_,i)=>(
            <line key={i}
              x1={60+33*Math.cos(i*30*Math.PI/180)} y1={60+33*Math.sin(i*30*Math.PI/180)}
              x2={60+48*Math.cos(i*30*Math.PI/180)} y2={60+48*Math.sin(i*30*Math.PI/180)}
              stroke="white" strokeWidth={i%2===0?3:2} strokeLinecap="round" strokeOpacity={i%2===0?1:0.6} />
          ))}
        </g>
        {/* sun body */}
        <circle cx="60" cy="60" r="28" fill="white" opacity="0.95"
          style={{ animation:'sun-pulse 2s ease-in-out infinite' }} />
        <circle cx="60" cy="60" r="22" fill="#ffd93d" />
        {/* face */}
        <circle cx="52" cy="56" r="3.5" fill="#e65100" />
        <circle cx="68" cy="56" r="3.5" fill="#e65100" />
        <path d="M50 68 Q60 76 70 68" fill="none" stroke="#e65100" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
  },

  coral: {
    msg: ['A warm idea is forming…', 'Painting the sunset…', 'Golden hour loading…'],
    bg: '#ff6b6b', color: 'white',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes sunset-rise { 0%,100%{transform:translateY(5px)} 50%{transform:translateY(-5px)} }
          @keyframes ray-spin { to{transform:rotate(360deg);transform-origin:60px 75px;} }
        `}</style>
        {/* sky gradient bands */}
        <rect x="0" y="0" width="120" height="40" fill="rgba(255,255,255,0.2)" rx="8" />
        <rect x="0" y="38" width="120" height="20" fill="rgba(255,152,0,0.3)" />
        {/* sun */}
        <g style={{ animation:'sunset-rise 2s ease-in-out infinite' }}>
          <g style={{ animation:'ray-spin 10s linear infinite' }}>
            {Array.from({length:8},(_,i)=>(
              <line key={i}
                x1={60+36*Math.cos(i*45*Math.PI/180)} y1={75+36*Math.sin(i*45*Math.PI/180)}
                x2={60+50*Math.cos(i*45*Math.PI/180)} y2={75+50*Math.sin(i*45*Math.PI/180)}
                stroke="rgba(255,255,255,0.6)" strokeWidth="3" strokeLinecap="round" />
            ))}
          </g>
          <circle cx="60" cy="75" r="26" fill="rgba(255,255,255,0.9)" />
          <circle cx="60" cy="75" r="20" fill="#ffd93d" />
        </g>
        {/* horizon line */}
        <line x1="0" y1="93" x2="120" y2="93" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
        {/* reflection on water */}
        <ellipse cx="60" cy="105" rx="15" ry="5" fill="rgba(255,255,255,0.4)" />
      </svg>
    ),
  },

  sky: {
    msg: ['Head in the clouds…', 'Floating ideas your way…', 'Blue sky thinking…'],
    bg: '#4fc3f7', color: 'white',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes cloud-drift { 0%{transform:translateX(-20px)} 100%{transform:translateX(140px)} }
          @keyframes plane-fly { 0%{transform:translate(-30px,0)} 100%{transform:translate(150px,-20px)} }
          @keyframes puff { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
        `}</style>
        {/* clouds */}
        {[[-20,35,1],[30,70,1.5],[-40,90,0.7]].map(([x,y,scale],i) => (
          <g key={i} style={{ transform:`scale(${scale})`, transformOrigin:`${x+40}px ${y}px`, animation:`cloud-drift ${5+i*2}s linear infinite ${i*1.5}s` }}>
            <ellipse cx={x+40} cy={y} rx="28" ry="16" fill="white" opacity="0.9" />
            <ellipse cx={x+24} cy={y+4} rx="18" ry="13" fill="white" opacity="0.9" />
            <ellipse cx={x+56} cy={y+5} rx="16" ry="11" fill="white" opacity="0.9" />
          </g>
        ))}
        {/* plane */}
        <g style={{ animation:'plane-fly 4s linear infinite 1s' }}>
          <text x="0" y="55" fontSize="24">✈️</text>
        </g>
        {/* sun */}
        <circle cx="90" cy="22" r="20" fill="#ffd93d" style={{ animation:'puff 3s ease-in-out infinite' }} />
        {/* birds */}
        {[[25,25],[40,18],[55,28]].map(([x,y],i) => (
          <path key={i} d={`M${x},${y} Q${x+5},${y-5} ${x+10},${y}`} fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" />
        ))}
      </svg>
    ),
  },

  rainbow: {
    msg: ['Chasing rainbows…', 'Mixing all the colours…', 'Over the rainbow…'],
    bg: '#e91e8c', color: 'white',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes arc-draw { from{stroke-dashoffset:300} to{stroke-dashoffset:0} }
          @keyframes pot-bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        `}</style>
        {['#ff4444','#ff8800','#ffdd00','#44cc44','#4488ff','#8844ee'].map((c,i) => (
          <path key={c} d={`M10,100 Q60,${12+i*6} 110,100`} fill="none" stroke={c}
            strokeWidth="7" strokeLinecap="round"
            strokeDasharray="300" strokeDashoffset="0"
            style={{ animation:`arc-draw ${1+i*0.15}s ease-out forwards` }} />
        ))}
        {/* pot of gold */}
        <g style={{ animation:'pot-bob 2s ease-in-out infinite' }}>
          <ellipse cx="105" cy="100" rx="14" ry="8" fill="#ffd600" />
          <rect x="91" y="96" width="28" height="16" rx="6" fill="#424242" />
          <ellipse cx="105" cy="96" rx="14" ry="6" fill="#616161" />
          {[99,105,111].map(x => (
            <circle key={x} cx={x} cy="93" r="3" fill="#ffd600" />
          ))}
        </g>
        {/* clouds */}
        <ellipse cx="22" cy="90" rx="18" ry="10" fill="white" opacity="0.8" />
        <ellipse cx="10" cy="94" rx="13" ry="8" fill="white" opacity="0.8" />
        <ellipse cx="34" cy="94" rx="11" ry="7" fill="white" opacity="0.8" />
      </svg>
    ),
  },

  candy: {
    msg: ['Unwrapping something sweet…', 'Sugar rush loading…', 'Candy Land magic…'],
    bg: '#e040fb', color: 'white',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes candy-fall { 0%{transform:translateY(-15px) rotate(0deg);opacity:0} 15%{opacity:1} 100%{transform:translateY(115px) rotate(var(--cr));opacity:0} }
          @keyframes lollipop-spin { to{transform:rotate(360deg);transform-origin:60px 78px;} }
        `}</style>
        {['🍭','🍬','🍡','🎀','🍭','🍬','🍫'].map((e,i) => (
          <text key={i} x={8+i*17} y="-5" fontSize="16" style={{ '--cr':`${180+i*60}deg`, animation:`candy-fall ${1.5+i*0.3}s ease-in infinite ${i*0.35}s` }}>{e}</text>
        ))}
        {/* lollipop */}
        <line x1="60" y1="78" x2="60" y2="108" stroke="#ff4081" strokeWidth="4" strokeLinecap="round" />
        <g style={{ animation:'lollipop-spin 4s linear infinite' }}>
          <circle cx="60" cy="60" r="22" fill="#ff4081" />
          <path d="M60 38 Q82 60 60 82 Q38 60 60 38Z" fill="#ffd600" />
          <circle cx="60" cy="60" r="8" fill="#ff4081" />
        </g>
      </svg>
    ),
  },

  // ── Animals ──────────────────────────────────────────────────────────────

  dinosaur: {
    msg: ['Roar! Thinking…', 'Jurassic ideas loading…', 'T-Rex is on it…'],
    bg: '#2d6a4f', color: 'white',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes dino-stomp { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
          @keyframes dino-eye { 0%,90%,100%{ry:4} 95%{ry:.5} }
          @keyframes ground-shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-2px)} 75%{transform:translateX(2px)} }
        `}</style>
        <g style={{ animation:'dino-stomp 0.8s ease-in-out infinite' }}>
          {/* body */}
          <ellipse cx="60" cy="72" rx="28" ry="22" fill="#40916c" />
          {/* head */}
          <ellipse cx="85" cy="50" rx="20" ry="15" fill="#52b788" />
          {/* snout */}
          <ellipse cx="102" cy="55" rx="10" ry="8" fill="#52b788" />
          {/* nostril */}
          <circle cx="108" cy="53" r="2" fill="#2d6a4f" />
          {/* eye */}
          <ellipse cx="92" cy="45" rx="5" ry="4" fill="#ffd600" style={{ animation:'dino-eye 3s ease-in-out infinite' }} />
          <circle cx="93" cy="44" r="2" fill="#1b4332" />
          {/* teeth */}
          {[97,101,105].map(x => <polygon key={x} points={`${x},59 ${x+2},59 ${x+1},65`} fill="white" />)}
          {/* tail */}
          <path d="M32 75 Q10 80 8 95 Q20 88 35 85" fill="#40916c" />
          {/* legs */}
          <rect x="45" y="90" width="12" height="16" rx="5" fill="#2d6a4f" />
          <rect x="63" y="90" width="12" height="16" rx="5" fill="#2d6a4f" />
          {/* spikes */}
          {[55,65,75].map((x,i) => <polygon key={x} points={`${x},${52-i*2} ${x+5},${52-i*2} ${x+2.5},${42-i*2}`} fill="#1b4332" />)}
        </g>
        <ellipse cx="60" cy="108" rx="35" ry="6" fill="rgba(0,0,0,0.15)" style={{ animation:'ground-shake 0.8s ease-in-out infinite' }} />
      </svg>
    ),
  },

  shark: {
    msg: ['Something is lurking…', 'Deep water thinking…', 'Jaws of creativity…'],
    bg: '#023e8a', color: 'white',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes shark-swim { 0%,100%{transform:translateX(0) rotate(0deg)} 50%{transform:translateX(8px) rotate(3deg)} }
          @keyframes fin-wave { 0%,100%{transform:rotate(-5deg)} 50%{transform:rotate(5deg)} }
          @keyframes bubble2 { 0%{transform:translateY(0);opacity:.8} 100%{transform:translateY(-40px);opacity:0} }
        `}</style>
        {/* water */}
        <rect x="0" y="70" width="120" height="50" fill="rgba(0,119,182,0.4)" rx="4" />
        <g style={{ animation:'shark-swim 2s ease-in-out infinite' }}>
          {/* body */}
          <ellipse cx="60" cy="65" rx="35" ry="18" fill="#4cc9f0" />
          {/* head/snout */}
          <ellipse cx="90" cy="67" rx="18" ry="14" fill="#4cc9f0" />
          {/* belly */}
          <ellipse cx="60" cy="72" rx="28" ry="10" fill="white" opacity="0.8" />
          {/* eye */}
          <circle cx="85" cy="60" r="4" fill="#023e8a" />
          <circle cx="86" cy="59" r="1.5" fill="white" />
          {/* teeth */}
          {[86,91,96,101].map(x => <polygon key={x} points={`${x},75 ${x+3},75 ${x+1.5},82`} fill="white" />)}
          {/* tail */}
          <path d="M25 65 L8 50 L8 80Z" fill="#4cc9f0" />
          {/* dorsal fin */}
          <g style={{ transformOrigin:'60px 47px', animation:'fin-wave 1.5s ease-in-out infinite' }}>
            <path d="M50 47 Q60 20 70 47Z" fill="#4cc9f0" />
          </g>
          {/* side fin */}
          <path d="M55 72 Q45 85 50 90 Q60 80 65 72Z" fill="#4cc9f0" />
        </g>
        {/* bubbles */}
        {[30,55,80].map((x,i) => (
          <circle key={i} cx={x} cy={90} r={3+i} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"
            style={{ animation:`bubble2 ${1.5+i*0.5}s ease-in infinite ${i*0.5}s` }} />
        ))}
      </svg>
    ),
  },

  panda: {
    msg: ['Munching bamboo…', 'Black and white thinking…', 'Panda magic loading…'],
    bg: '#424242', color: 'white',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes panda-nod { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(5deg)} }
          @keyframes panda-blink { 0%,88%,100%{ry:8} 94%{ry:1} }
          @keyframes bamboo-sway { 0%,100%{transform:rotate(-3deg)} 50%{transform:rotate(3deg)} }
        `}</style>
        {/* bamboo */}
        <g style={{ transformOrigin:'95px 60px', animation:'bamboo-sway 2s ease-in-out infinite' }}>
          <rect x="92" y="10" width="7" height="95" rx="3" fill="#4caf50" />
          {[20,40,60,75].map(y => <rect key={y} x="89" y={y} width="13" height="4" rx="2" fill="#388e3c" />)}
          {[15,35,55].map((y,i) => <ellipse key={y} cx={i%2===0?86:102} cy={y} rx="10" ry="6" fill="#66bb6a" />)}
        </g>
        <g style={{ animation:'panda-nod 2s ease-in-out infinite' }}>
          {/* body */}
          <ellipse cx="55" cy="82" rx="30" ry="28" fill="white" />
          {/* head */}
          <circle cx="55" cy="48" r="26" fill="white" />
          {/* ears */}
          <circle cx="35" cy="26" r="11" fill="#212121" />
          <circle cx="75" cy="26" r="11" fill="#212121" />
          {/* eye patches */}
          <ellipse cx="45" cy="46" rx="9" ry="8" fill="#212121" style={{ animation:'panda-blink 3s ease-in-out infinite' }} />
          <ellipse cx="65" cy="46" rx="9" ry="8" fill="#212121" style={{ animation:'panda-blink 3s ease-in-out infinite 0.1s' }} />
          {/* eyes */}
          <circle cx="45" cy="46" r="4" fill="white" />
          <circle cx="65" cy="46" r="4" fill="white" />
          <circle cx="46" cy="45" r="2" fill="#212121" />
          <circle cx="66" cy="45" r="2" fill="#212121" />
          {/* nose */}
          <ellipse cx="55" cy="58" rx="5" ry="3.5" fill="#212121" />
          {/* smile */}
          <path d="M48 63 Q55 70 62 63" fill="none" stroke="#212121" strokeWidth="2.5" strokeLinecap="round" />
          {/* arms */}
          <ellipse cx="28" cy="78" rx="10" ry="18" fill="#212121" transform="rotate(-15,28,78)" />
          <ellipse cx="82" cy="78" rx="10" ry="18" fill="#212121" transform="rotate(15,82,78)" />
        </g>
      </svg>
    ),
  },

  lion: {
    msg: ['The lion is roaring up ideas…', 'Mane-taining focus…', 'King of creativity…'],
    bg: '#f57f17', color: 'white',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes mane-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
          @keyframes lion-blink { 0%,88%,100%{ry:6} 94%{ry:.5} }
          @keyframes tail-swish { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(20deg)} }
        `}</style>
        {/* mane */}
        <circle cx="60" cy="58" r="38" fill="#e65100" style={{ animation:'mane-pulse 1.5s ease-in-out infinite' }} />
        {/* mane tips */}
        {Array.from({length:12},(_,i) => {
          const a = i * 30 * Math.PI/180
          const x = 60 + 42*Math.cos(a), y = 58 + 42*Math.sin(a)
          return <ellipse key={i} cx={x} cy={y} rx="7" ry="11" fill="#bf360c"
            transform={`rotate(${i*30},${x},${y})`}
            style={{ animation:`mane-pulse 1.5s ease-in-out infinite ${i*0.1}s` }} />
        })}
        {/* face */}
        <circle cx="60" cy="58" r="28" fill="#ffa726" />
        {/* ears */}
        <circle cx="38" cy="32" r="9" fill="#ffa726" />
        <circle cx="82" cy="32" r="9" fill="#ffa726" />
        {/* eyes */}
        <ellipse cx="50" cy="52" rx="7" ry="6" fill="#ffd600" style={{ animation:'lion-blink 3s ease-in-out infinite' }} />
        <ellipse cx="70" cy="52" rx="7" ry="6" fill="#ffd600" style={{ animation:'lion-blink 3s ease-in-out infinite 0.1s' }} />
        <circle cx="50" cy="52" r="3.5" fill="#1a1a1a" />
        <circle cx="70" cy="52" r="3.5" fill="#1a1a1a" />
        {/* nose */}
        <ellipse cx="60" cy="63" rx="7" ry="5" fill="#bf360c" />
        {/* whiskers */}
        {[[-30,-2],[-20,0],[-30,3],[30,-2],[20,0],[30,3]].map(([dx,dy],i) => (
          <line key={i} x1="60" y1="63" x2={60+dx} y2={63+dy} stroke="#e65100" strokeWidth="1.5" strokeLinecap="round" />
        ))}
        {/* smile */}
        <path d="M52 70 Q60 77 68 70" fill="none" stroke="#bf360c" strokeWidth="2.5" strokeLinecap="round" />
        {/* tail */}
        <g style={{ transformOrigin:'90px 100px', animation:'tail-swish 1.5s ease-in-out infinite' }}>
          <path d="M85 100 Q100 85 105 70" fill="none" stroke="#ffa726" strokeWidth="6" strokeLinecap="round" />
          <circle cx="105" cy="70" r="9" fill="#e65100" />
        </g>
      </svg>
    ),
  },

  frog: {
    msg: ['Ribbit! Thinking…', 'Jumping to conclusions…', 'Lily pad loading…'],
    bg: '#1b5e20', color: 'white',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes frog-jump { 0%,100%{transform:translateY(0) scaleX(1)} 40%{transform:translateY(-20px) scaleX(0.9)} 60%{transform:translateY(-22px) scaleX(0.9)} }
          @keyframes frog-blink { 0%,88%,100%{ry:9} 94%{ry:1} }
          @keyframes lily-bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(3px)} }
        `}</style>
        {/* lily pad */}
        <g style={{ animation:'lily-bob 2s ease-in-out infinite' }}>
          <ellipse cx="60" cy="100" rx="38" ry="14" fill="#2e7d32" />
          <path d="M60 86 L60 100" stroke="#1b5e20" strokeWidth="2" />
          <ellipse cx="60" cy="100" rx="38" ry="14" fill="none" stroke="#1b5e20" strokeWidth="1.5" />
        </g>
        <g style={{ animation:'frog-jump 1.5s ease-in-out infinite' }}>
          {/* body */}
          <ellipse cx="60" cy="80" rx="28" ry="22" fill="#4caf50" />
          {/* head */}
          <ellipse cx="60" cy="56" rx="26" ry="22" fill="#66bb6a" />
          {/* eye bulges */}
          <circle cx="44" cy="44" r="13" fill="#66bb6a" />
          <circle cx="76" cy="44" r="13" fill="#66bb6a" />
          {/* eyes */}
          <ellipse cx="44" cy="44" rx="9" ry="9" fill="#ffd600" style={{ animation:'frog-blink 2.5s ease-in-out infinite' }} />
          <ellipse cx="76" cy="44" rx="9" ry="9" fill="#ffd600" style={{ animation:'frog-blink 2.5s ease-in-out infinite 0.15s' }} />
          <circle cx="44" cy="44" r="5" fill="#1b5e20" />
          <circle cx="76" cy="44" r="5" fill="#1b5e20" />
          <circle cx="45" cy="43" r="2" fill="white" />
          <circle cx="77" cy="43" r="2" fill="white" />
          {/* nostrils */}
          <circle cx="55" cy="62" r="2.5" fill="#2e7d32" />
          <circle cx="65" cy="62" r="2.5" fill="#2e7d32" />
          {/* smile */}
          <path d="M44 68 Q60 80 76 68" fill="none" stroke="#2e7d32" strokeWidth="3" strokeLinecap="round" />
          {/* legs */}
          <path d="M32 90 Q15 95 10 108" stroke="#4caf50" strokeWidth="10" strokeLinecap="round" fill="none" />
          <path d="M88 90 Q105 95 110 108" stroke="#4caf50" strokeWidth="10" strokeLinecap="round" fill="none" />
        </g>
      </svg>
    ),
  },

  // ── Ocean & Adventure ──────────────────────────────────────────────────────

  mermaid: {
    msg: ['Swimming through ideas…', 'Under the sea magic…', 'Riding the current…'],
    bg: '#006994', color: 'white',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes tail-wave { 0%,100%{transform:rotate(-10deg)} 50%{transform:rotate(10deg)} }
          @keyframes hair-flow { 0%,100%{transform:translateX(0)} 50%{transform:translateX(4px)} }
          @keyframes bubble3 { 0%{transform:translateY(0);opacity:.8} 100%{transform:translateY(-50px);opacity:0} }
        `}</style>
        {/* tail */}
        <g style={{ transformOrigin:'60px 90px', animation:'tail-wave 1.5s ease-in-out infinite' }}>
          <ellipse cx="60" cy="85" rx="16" ry="30" fill="#00b4d8" />
          <path d="M44 105 Q60 115 76 105 Q68 95 60 98 Q52 95 44 105Z" fill="#0077b6" />
          <ellipse cx="60" cy="85" rx="10" ry="22" fill="#0096c7" />
        </g>
        {/* body */}
        <ellipse cx="60" cy="62" rx="16" ry="20" fill="#ffb347" />
        {/* shell bra */}
        <ellipse cx="54" cy="66" rx="7" ry="5" fill="#ff6b9d" transform="rotate(-10,54,66)" />
        <ellipse cx="66" cy="66" rx="7" ry="5" fill="#ff6b9d" transform="rotate(10,66,66)" />
        {/* head */}
        <circle cx="60" cy="40" r="18" fill="#ffb347" />
        {/* hair */}
        <g style={{ animation:'hair-flow 2s ease-in-out infinite' }}>
          <path d="M42 35 Q35 60 38 80" stroke="#1a0a00" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M46 33 Q40 58 43 78" stroke="#2d1300" strokeWidth="4" fill="none" strokeLinecap="round" />
          <ellipse cx="60" cy="28" rx="18" ry="12" fill="#2d1300" />
        </g>
        {/* face */}
        <circle cx="54" cy="40" r="3" fill="#5d4037" />
        <circle cx="66" cy="40" r="3" fill="#5d4037" />
        <path d="M54 48 Q60 53 66 48" fill="none" stroke="#c2185b" strokeWidth="2" strokeLinecap="round" />
        {/* bubbles */}
        {[25,45,90].map((x,i) => (
          <circle key={i} cx={x} cy={70+i*10} r={3+i} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"
            style={{ animation:`bubble3 ${1.5+i*0.6}s ease-in infinite ${i*0.4}s` }} />
        ))}
      </svg>
    ),
  },

  pirate: {
    msg: ['Sailing the high seas…', 'X marks the spot…', 'Arr, thinking hard…'],
    bg: '#1a1a2e', color: '#ffd600',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes flag-wave { 0%,100%{transform:skewX(0deg)} 50%{transform:skewX(8deg)} }
          @keyframes ship-bob { 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-5px) rotate(1deg)} }
          @keyframes wave-roll { 0%{transform:translateX(0)} 100%{transform:translateX(-60px)} }
        `}</style>
        {/* waves */}
        <g style={{ animation:'wave-roll 2s linear infinite' }}>
          {[0,60].map(dx => (
            <g key={dx} transform={`translate(${dx},0)`}>
              <path d="M0 90 Q15 80 30 90 Q45 100 60 90" fill="none" stroke="#4488ff" strokeWidth="3" />
            </g>
          ))}
        </g>
        <g style={{ animation:'ship-bob 2s ease-in-out infinite' }}>
          {/* hull */}
          <path d="M20 85 Q60 100 100 85 L95 105 Q60 115 25 105Z" fill="#795548" />
          {/* deck */}
          <rect x="25" y="72" width="70" height="15" rx="3" fill="#8d6e63" />
          {/* mast */}
          <rect x="58" y="20" width="4" height="54" fill="#5d4037" />
          {/* flag */}
          <g style={{ transformOrigin:'62px 22px', animation:'flag-wave 1s ease-in-out infinite' }}>
            <rect x="62" y="20" width="30" height="20" fill="#212121" rx="2" />
            {/* skull */}
            <circle cx="77" cy="27" r="5" fill="white" />
            <circle cx="74" cy="31" r="2" fill="white" />
            <circle cx="80" cy="31" r="2" fill="white" />
            <circle cx="75" cy="25" r="1.5" fill="#212121" />
            <circle cx="79" cy="25" r="1.5" fill="#212121" />
          </g>
          {/* sail */}
          <path d="M62 24 Q85 42 78 68 L62 68Z" fill="white" opacity="0.9" />
          {/* cannon */}
          <rect x="28" y="74" width="22" height="10" rx="5" fill="#424242" />
          <circle cx="22" cy="79" r="6" fill="#616161" />
        </g>
      </svg>
    ),
  },

  // ── Gaming & Vehicles ─────────────────────────────────────────────────────

  minecraft: {
    msg: ['Mining for ideas…', 'Building block by block…', 'Crafting something epic…'],
    bg: '#5d4037', color: 'white',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes creeper-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
          @keyframes block-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
          @keyframes dirt-fall { 0%{transform:translateY(-10px);opacity:0} 20%{opacity:1} 100%{transform:translateY(30px);opacity:0} }
        `}</style>
        {/* floating blocks */}
        {[[10,20,'#8d6e63'],[95,30,'#4caf50'],[15,70,'#78909c'],[100,65,'#ffd600']].map(([x,y,c],i) => (
          <rect key={i} x={x} y={y} width="14" height="14" fill={c} rx="1"
            style={{ animation:`block-float ${1.2+i*0.3}s ease-in-out infinite ${i*0.4}s` }} />
        ))}
        {/* creeper body */}
        <g style={{ animation:'creeper-pulse 2s ease-in-out infinite' }}>
          {/* head */}
          <rect x="35" y="15" width="50" height="50" fill="#4caf50" rx="2" />
          {/* pixel eyes */}
          <rect x="44" y="28" width="14" height="14" fill="#1a1a1a" />
          <rect x="62" y="28" width="14" height="14" fill="#1a1a1a" />
          {/* pixel mouth */}
          <rect x="48" y="46" width="6" height="6" fill="#1a1a1a" />
          <rect x="54" y="52" width="12" height="6" fill="#1a1a1a" />
          <rect x="60" y="46" width="6" height="6" fill="#1a1a1a" />
          {/* body */}
          <rect x="42" y="65" width="36" height="30" fill="#43a047" rx="2" />
          {/* legs */}
          <rect x="42" y="95" width="14" height="18" fill="#388e3c" rx="2" />
          <rect x="64" y="95" width="14" height="18" fill="#388e3c" rx="2" />
        </g>
        {/* dirt particles */}
        {[40,60,80].map((x,i) => (
          <rect key={i} x={x} y="60" width="8" height="8" fill="#8d6e63"
            style={{ animation:`dirt-fall ${0.8+i*0.3}s ease-in infinite ${i*0.5}s` }} />
        ))}
      </svg>
    ),
  },

  robot: {
    msg: ['Beep boop… processing…', 'Robot brain activated…', 'Computing awesomeness…'],
    bg: '#37474f', color: '#4fc3f7',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes eye-scan { 0%,100%{transform:translateX(0)} 50%{transform:translateX(4px)} }
          @keyframes antenna-blink { 0%,100%{fill:#37474f} 50%{fill:#4fc3f7} }
          @keyframes robot-bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
          @keyframes gear-spin { to{transform:rotate(360deg);transform-origin:108px 35px;} }
        `}</style>
        <g style={{ animation:'robot-bob 2s ease-in-out infinite' }}>
          {/* antenna */}
          <line x1="60" y1="12" x2="60" y2="28" stroke="#78909c" strokeWidth="3" />
          <circle cx="60" cy="10" r="5" style={{ animation:'antenna-blink 0.8s ease-in-out infinite' }} />
          {/* head */}
          <rect x="30" y="28" width="60" height="45" rx="8" fill="#546e7a" />
          {/* visor */}
          <rect x="36" y="35" width="48" height="25" rx="5" fill="#263238" />
          {/* scanning eye */}
          <g style={{ animation:'eye-scan 1.5s ease-in-out infinite' }}>
            <rect x="40" y="40" width="16" height="14" rx="3" fill="#4fc3f7" opacity="0.9" />
            <rect x="64" y="40" width="16" height="14" rx="3" fill="#4fc3f7" opacity="0.9" />
          </g>
          {/* mouth panel */}
          <rect x="40" y="62" width="40" height="6" rx="3" fill="#263238" />
          {[44,50,56,62,66,72].map(x => <rect key={x} x={x} y="63" width="3" height="4" rx="1" fill="#4fc3f7" />)}
          {/* body */}
          <rect x="24" y="76" width="72" height="38" rx="8" fill="#546e7a" />
          {/* chest panel */}
          <rect x="32" y="83" width="56" height="24" rx="5" fill="#263238" />
          <circle cx="44" cy="95" r="7" fill="#37474f" stroke="#4fc3f7" strokeWidth="2" />
          <circle cx="44" cy="95" r="3" fill="#4fc3f7" />
          {[55,64,73].map(x => <rect key={x} x={x} y="88" width="10" height="14" rx="2" fill={x===64?'#4fc3f7':'#37474f'} />)}
          {/* arms */}
          <rect x="6" y="78" width="16" height="32" rx="7" fill="#546e7a" />
          <rect x="98" y="78" width="16" height="32" rx="7" fill="#546e7a" />
          {/* legs */}
          <rect x="34" y="114" width="18" height="6" rx="4" fill="#455a64" />
          <rect x="68" y="114" width="18" height="6" rx="4" fill="#455a64" />
        </g>
        {/* gear decoration */}
        <g style={{ animation:'gear-spin 3s linear infinite' }}>
          {Array.from({length:8},(_,i) => {
            const a = i*45*Math.PI/180
            return <rect key={i} x={108+12*Math.cos(a)-3} y={35+12*Math.sin(a)-3} width="6" height="6" rx="1" fill="#78909c" />
          })}
          <circle cx="108" cy="35" r="7" fill="#546e7a" />
          <circle cx="108" cy="35" r="3" fill="#78909c" />
        </g>
      </svg>
    ),
  },

  racecar: {
    msg: ['Vroom! Speeding through…', 'Full throttle thinking…', 'On the fast track…'],
    bg: '#b71c1c', color: 'white',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes car-zoom { 0%{transform:translateX(-130px)} 100%{transform:translateX(130px)} }
          @keyframes wheel-spin { to{transform:rotate(360deg)} }
          @keyframes speed-line { 0%{opacity:0;transform:translateX(0)} 50%{opacity:1} 100%{opacity:0;transform:translateX(-40px)} }
          @keyframes flag-chequered { 0%,100%{transform:rotate(-5deg)} 50%{transform:rotate(5deg)} }
        `}</style>
        {/* track */}
        <rect x="0" y="82" width="120" height="30" fill="#424242" />
        <rect x="0" y="94" width="120" height="6" fill="#616161" />
        {[0,20,40,60,80,100].map(x => <rect key={x} x={x} y="95" width="12" height="4" fill="white" />)}
        {/* chequered flag */}
        <g style={{ transformOrigin:'110px 45px', animation:'flag-chequered 1s ease-in-out infinite' }}>
          <rect x="108" y="30" width="3" height="35" fill="#424242" />
          {[[0,0],[8,0],[0,8],[8,8]].map(([dx,dy],i) => (
            <rect key={i} x={111+dx} y={30+dy} width="8" height="8" fill={i%2===0?'white':'#212121'} />
          ))}
          {[[0,16],[8,16]].map(([dx,dy],i) => (
            <rect key={i} x={111+dx} y={30+dy} width="8" height="8" fill={i%2===0?'#212121':'white'} />
          ))}
        </g>
        {/* speed lines */}
        {[55,65,72,60].map((y,i) => (
          <line key={i} x1="0" y1={y} x2={30+i*5} y2={y} stroke="rgba(255,255,255,0.4)" strokeWidth="2"
            style={{ animation:`speed-line ${0.6+i*0.15}s linear infinite ${i*0.2}s` }} />
        ))}
        {/* car */}
        <g style={{ animation:'car-zoom 1.8s ease-in-out infinite' }}>
          {/* body */}
          <rect x="10" y="62" width="100" height="22" rx="6" fill="#e53935" />
          {/* cockpit */}
          <path d="M30 62 Q45 42 75 42 Q90 42 100 62Z" fill="#c62828" />
          <path d="M35 62 Q48 46 72 46 Q85 46 95 62Z" fill="#b71c1c" opacity="0.5" />
          {/* windscreen */}
          <path d="M42 60 Q52 48 68 48 Q78 48 84 60Z" fill="#4fc3f7" opacity="0.7" />
          {/* number */}
          <text x="60" y="78" textAnchor="middle" fontSize="13" fontWeight="900" fill="white" fontFamily="Nunito,sans-serif">7</text>
          {/* stripe */}
          <rect x="10" y="70" width="100" height="5" fill="white" opacity="0.2" />
          {/* wheels */}
          {[[22,84],[88,84]].map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="13" fill="#212121" />
              <circle cx={cx} cy={cy} r="9" fill="#424242" style={{ transformOrigin:`${cx}px ${cy}px`, animation:'wheel-spin 0.4s linear infinite' }} />
              <circle cx={cx} cy={cy} r="4" fill="#616161" />
              {[0,90,180,270].map(a => (
                <line key={a} x1={cx} y1={cy} x2={cx+7*Math.cos(a*Math.PI/180)} y2={cy+7*Math.sin(a*Math.PI/180)}
                  stroke="#757575" strokeWidth="2" />
              ))}
            </g>
          ))}
          {/* exhaust */}
          {[75,70,65].map((y,i) => (
            <circle key={i} cx={8-i*4} cy={y} r={3+i} fill="rgba(200,200,200,0.4)"
              style={{ animation:`speed-line ${0.5+i*0.2}s ease-out infinite ${i*0.1}s` }} />
          ))}
        </g>
      </svg>
    ),
  },

  // ── Fantasy & Magic ───────────────────────────────────────────────────────

  fairygarden: {
    msg: ['Sprinkling fairy dust…', 'The garden is blooming…', 'Wings of imagination…'],
    bg: '#7b1fa2', color: 'white',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes fairy-fly { 0%,100%{transform:translate(0,0)} 33%{transform:translate(8px,-10px)} 66%{transform:translate(-5px,5px)} }
          @keyframes petal-spin { to{transform:rotate(360deg);transform-origin:60px 60px;} }
          @keyframes dust-float { 0%{transform:translate(0,0) scale(1);opacity:1} 100%{transform:translate(var(--dx),var(--dy)) scale(0);opacity:0} }
          @keyframes flower-bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        `}</style>
        {/* flowers */}
        {[[20,90],[50,95],[80,88],[100,92]].map(([x,y],i) => (
          <g key={i} style={{ animation:`flower-bob ${1.2+i*0.3}s ease-in-out infinite ${i*0.4}s` }}>
            <rect x={x} y={y-20} width="3" height="22" rx="1" fill="#4caf50" />
            {['#ff4081','#ffd600','#e040fb','#4fc3f7'][i] && (
              <>
                {[0,72,144,216,288].map(a => (
                  <ellipse key={a} cx={x+1} cy={y-20}
                    rx="5" ry="8"
                    fill={['#ff4081','#ffd600','#e040fb','#4fc3f7'][i]}
                    transform={`rotate(${a},${x+1},${y-20})`}
                    opacity="0.85" />
                ))}
                <circle cx={x+1} cy={y-20} r="4" fill="white" />
              </>
            )}
          </g>
        ))}
        {/* fairy */}
        <g style={{ animation:'fairy-fly 3s ease-in-out infinite' }}>
          {/* wings */}
          <ellipse cx="52" cy="48" rx="18" ry="10" fill="rgba(200,150,255,0.5)" transform="rotate(-30,52,48)" />
          <ellipse cx="68" cy="48" rx="18" ry="10" fill="rgba(200,150,255,0.5)" transform="rotate(30,68,48)" />
          <ellipse cx="52" cy="58" rx="12" ry="7" fill="rgba(200,150,255,0.35)" transform="rotate(20,52,58)" />
          <ellipse cx="68" cy="58" rx="12" ry="7" fill="rgba(200,150,255,0.35)" transform="rotate(-20,68,58)" />
          {/* body */}
          <ellipse cx="60" cy="60" rx="8" ry="12" fill="#ffb347" />
          {/* dress */}
          <path d="M52 65 Q60 78 68 65" fill="#e040fb" />
          {/* head */}
          <circle cx="60" cy="44" r="10" fill="#ffb347" />
          <ellipse cx="60" cy="36" rx="10" ry="6" fill="#ffd600" />
          <circle cx="56" cy="44" r="2" fill="#5d4037" />
          <circle cx="64" cy="44" r="2" fill="#5d4037" />
          <path d="M57 49 Q60 52 63 49" fill="none" stroke="#c2185b" strokeWidth="1.5" />
          {/* wand */}
          <line x1="68" y1="55" x2="88" y2="35" stroke="#ffd600" strokeWidth="2.5" strokeLinecap="round" />
          <text x="88" y="34" fontSize="14">⭐</text>
        </g>
        {/* fairy dust */}
        {[{dx:'20px',dy:'-30px'},{dx:'-15px',dy:'-25px'},{dx:'25px',dy:'-10px'},{dx:'-20px',dy:'-15px'},{dx:'10px',dy:'-35px'}].map((s,i) => (
          <circle key={i} cx={85+i*3} cy={40+i*4} r="2.5" fill="#ffd600"
            style={{ '--dx':s.dx,'--dy':s.dy, animation:`dust-float 1.2s ease-out infinite ${i*0.2}s` }} />
        ))}
      </svg>
    ),
  },

  dragonfire: {
    msg: ['Breathing fire ideas…', 'Dragon magic unleashed…', 'Scales of imagination…'],
    bg: '#b71c1c', color: '#ffd600',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes fire-flicker { 0%,100%{transform:scaleY(1) scaleX(1)} 50%{transform:scaleY(1.15) scaleX(0.9)} }
          @keyframes dragon-breathe { 0%,100%{transform:scale(1)} 50%{transform:scale(1.03)} }
          @keyframes wing-flap { 0%,100%{transform:rotate(-8deg)} 50%{transform:rotate(8deg)} }
        `}</style>
        {/* fire breath */}
        <g style={{ transformOrigin:'95px 65px', animation:'fire-flicker 0.4s ease-in-out infinite' }}>
          <ellipse cx="108" cy="65" rx="10" ry="5" fill="#ff6f00" />
          <ellipse cx="100" cy="60" rx="7" ry="4" fill="#ffd600" />
          <ellipse cx="112" cy="70" rx="6" ry="3" fill="#ff8f00" />
          {[0,0.15,0.3].map((d,i) => (
            <ellipse key={i} cx={108+i*3} cy={58-i*5} rx={4-i} ry={8+i*2} fill={['#ffd600','#ff6f00','#ff3d00'][i]}
              style={{ animation:`fire-flicker ${0.3+i*0.1}s ease-in-out infinite ${d}s` }} />
          ))}
        </g>
        <g style={{ animation:'dragon-breathe 2s ease-in-out infinite' }}>
          {/* wings */}
          <g style={{ transformOrigin:'48px 45px', animation:'wing-flap 1s ease-in-out infinite' }}>
            <path d="M48 45 Q20 15 5 25 Q15 50 48 55Z" fill="#c62828" />
            <path d="M48 45 Q25 20 15 30 Q25 48 48 55Z" fill="#e53935" opacity="0.6" />
          </g>
          <g style={{ transformOrigin:'72px 45px', animation:'wing-flap 1s ease-in-out infinite reverse' }}>
            <path d="M72 45 Q100 15 115 25 Q105 50 72 55Z" fill="#c62828" />
          </g>
          {/* body */}
          <ellipse cx="60" cy="72" rx="25" ry="20" fill="#d32f2f" />
          {/* belly */}
          <ellipse cx="60" cy="76" rx="17" ry="13" fill="#ff8f00" opacity="0.7" />
          {/* neck */}
          <ellipse cx="80" cy="52" rx="12" ry="18" fill="#d32f2f" />
          {/* head */}
          <ellipse cx="90" cy="38" rx="18" ry="14" fill="#e53935" />
          {/* snout */}
          <ellipse cx="104" cy="42" rx="10" ry="7" fill="#e53935" />
          {/* nostrils */}
          <circle cx="110" cy="40" r="2" fill="#b71c1c" />
          {/* eye */}
          <ellipse cx="96" cy="33" rx="6" ry="5" fill="#ffd600" />
          <ellipse cx="97" cy="33" rx="3" ry="4" fill="#1a1a1a" />
          {/* spikes */}
          {[55,65,75,85].map((x,i) => (
            <polygon key={x} points={`${x},${52-i*2} ${x+5},${52-i*2} ${x+2.5},${40-i*3}`} fill="#b71c1c" />
          ))}
          {/* tail */}
          <path d="M35 78 Q15 85 10 100 Q22 90 38 88" fill="#d32f2f" />
          <polygon points="10,100 5,110 18,103" fill="#b71c1c" />
        </g>
      </svg>
    ),
  },

  enchanted: {
    msg: ['Casting a spell…', 'Enchanted forest awakens…', 'Magic is in the air…'],
    bg: '#1a237e', color: '#e040fb',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes orb-pulse { 0%,100%{r:18;opacity:1} 50%{r:22;opacity:.7} }
          @keyframes rune-spin { to{transform:rotate(360deg);transform-origin:60px 55px;} }
          @keyframes sparkle { 0%,100%{opacity:0;transform:scale(0)} 50%{opacity:1;transform:scale(1)} }
          @keyframes crystal-glow { 0%,100%{filter:drop-shadow(0 0 4px #e040fb)} 50%{filter:drop-shadow(0 0 16px #e040fb)} }
        `}</style>
        {/* rune circles */}
        <g style={{ animation:'rune-spin 8s linear infinite' }}>
          {[38,28].map((r,i) => (
            <circle key={r} cx="60" cy="55" r={r} fill="none" stroke={i===0?'rgba(224,64,251,0.4)':'rgba(64,196,255,0.3)'}
              strokeWidth="1.5" strokeDasharray={i===0?"8 4":"4 8"} />
          ))}
        </g>
        <g style={{ animation:'rune-spin 12s linear infinite reverse' }}>
          <circle cx="60" cy="55" r="48" fill="none" stroke="rgba(224,64,251,0.2)" strokeWidth="1" strokeDasharray="3 6" />
        </g>
        {/* magic orb */}
        <circle cx="60" cy="55" r="18" fill="none" stroke="rgba(224,64,251,0.5)" strokeWidth="2"
          style={{ animation:'orb-pulse 1.5s ease-in-out infinite' }} />
        <circle cx="60" cy="55" r="14" fill="rgba(58,12,163,0.6)" />
        <circle cx="60" cy="55" r="10" fill="#7c4dff" />
        <circle cx="55" cy="50" r="4" fill="rgba(255,255,255,0.3)" />
        {/* crystal */}
        <g style={{ animation:'crystal-glow 2s ease-in-out infinite' }}>
          <polygon points="60,20 68,40 60,48 52,40" fill="#e040fb" opacity="0.9" />
          <polygon points="60,20 68,40 60,35" fill="rgba(255,255,255,0.3)" />
        </g>
        {/* sparkles */}
        {[[20,30],[100,25],[15,75],[105,70],[30,100],[90,95]].map(([x,y],i) => (
          <g key={i} style={{ animation:`sparkle ${1+i*0.3}s ease-in-out infinite ${i*0.25}s` }}>
            <line x1={x} y1={y-7} x2={x} y2={y+7} stroke="#e040fb" strokeWidth="1.5" strokeLinecap="round" />
            <line x1={x-7} y1={y} x2={x+7} y2={y} stroke="#e040fb" strokeWidth="1.5" strokeLinecap="round" />
            <line x1={x-5} y1={y-5} x2={x+5} y2={y+5} stroke="#e040fb" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
            <line x1={x+5} y1={y-5} x2={x-5} y2={y+5} stroke="#e040fb" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
          </g>
        ))}
      </svg>
    ),
  },

  // ── Cozy & Comfort ────────────────────────────────────────────────────────

  hotcocoa: {
    msg: ['Brewing warm ideas…', 'Cosy thinking…', 'Marshmallows floating…'],
    bg: '#4e342e', color: '#ffccbc',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes steam-rise { 0%{transform:translateY(0) scaleX(1);opacity:.8} 100%{transform:translateY(-35px) scaleX(1.4);opacity:0} }
          @keyframes marshmallow-bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
          @keyframes cup-warm { 0%,100%{filter:drop-shadow(0 0 6px rgba(255,87,34,0.4))} 50%{filter:drop-shadow(0 0 18px rgba(255,87,34,0.6))} }
        `}</style>
        {/* steam */}
        {[-12,0,12].map((dx,i) => (
          <path key={i} d={`M${60+dx} 42 Q${60+dx+6} 35 ${60+dx} 28 Q${60+dx-6} 21 ${60+dx} 14`}
            fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="3" strokeLinecap="round"
            style={{ animation:`steam-rise 1.5s ease-out infinite ${i*0.4}s` }} />
        ))}
        {/* cup */}
        <g style={{ animation:'cup-warm 2s ease-in-out infinite' }}>
          {/* saucer */}
          <ellipse cx="60" cy="105" rx="40" ry="10" fill="#795548" />
          <ellipse cx="60" cy="103" rx="36" ry="8" fill="#8d6e63" />
          {/* cup body */}
          <path d="M28 55 Q30 100 60 100 Q90 100 92 55Z" fill="#6d4c41" />
          <path d="M28 55 Q30 96 60 96 Q90 96 92 55Z" fill="#5d4037" />
          {/* cocoa surface */}
          <ellipse cx="60" cy="55" rx="32" ry="10" fill="#4e342e" />
          <ellipse cx="60" cy="53" rx="28" ry="8" fill="#3e2723" />
          {/* marshmallows */}
          {[[52,51],[65,53],[58,58]].map(([cx,cy],i) => (
            <ellipse key={i} cx={cx} cy={cy} rx="7" ry="5" fill="white"
              style={{ animation:`marshmallow-bob ${1+i*0.3}s ease-in-out infinite ${i*0.3}s` }} />
          ))}
          {/* handle */}
          <path d="M92 65 Q112 65 112 78 Q112 91 92 88" fill="none" stroke="#6d4c41" strokeWidth="10" strokeLinecap="round" />
          {/* rim */}
          <ellipse cx="60" cy="55" rx="32" ry="10" fill="none" stroke="#8d6e63" strokeWidth="3" />
        </g>
        {/* snowflakes */}
        {[[15,40],[100,35],[10,70],[108,65]].map(([x,y],i) => (
          <text key={i} x={x} y={y} fontSize="12" fill="rgba(255,255,255,0.4)" textAnchor="middle">❄</text>
        ))}
      </svg>
    ),
  },

  autumnleaves: {
    msg: ['Leaves are falling…', 'Autumn magic…', 'Cosy and warm…'],
    bg: '#bf360c', color: 'white',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes leaf-spin { 0%{transform:translate(0,0) rotate(0deg);opacity:0} 10%{opacity:1} 100%{transform:translate(var(--lx),80px) rotate(var(--lr));opacity:0} }
          @keyframes tree-sway2 { 0%,100%{transform:rotate(-3deg)} 50%{transform:rotate(3deg)} }
        `}</style>
        <g style={{ transformOrigin:'60px 95px', animation:'tree-sway2 3s ease-in-out infinite' }}>
          {/* trunk */}
          <rect x="55" y="65" width="10" height="40" rx="4" fill="#5d4037" />
          {/* branches */}
          <path d="M60 70 Q40 55 25 60" stroke="#5d4037" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M60 70 Q80 55 95 60" stroke="#5d4037" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M60 80 Q45 68 35 72" stroke="#5d4037" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M60 80 Q75 68 85 72" stroke="#5d4037" strokeWidth="4" fill="none" strokeLinecap="round" />
          {/* foliage */}
          {[[60,35,28,'#e65100'],[45,45,20,'#ff8f00'],[75,48,18,'#ffd600'],[55,55,15,'#bf360c'],[65,58,14,'#ff6f00']].map(([cx,cy,r,c],i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill={c} opacity="0.9" />
          ))}
        </g>
        {/* falling leaves */}
        {[
          {x:15,lr:'180deg',lx:'30px',c:'#ff6f00'},{x:30,lr:'-90deg',lx:'-20px',c:'#ffd600'},
          {x:55,lr:'270deg',lx:'25px',c:'#e65100'},{x:75,lr:'-180deg',lx:'-30px',c:'#bf360c'},
          {x:95,lr:'90deg',lx:'20px',c:'#ff8f00'},{x:45,lr:'220deg',lx:'-15px',c:'#ffd600'},
          {x:85,lr:'-120deg',lx:'10px',c:'#e65100'},
        ].map((l,i) => (
          <text key={i} x={l.x} y="5" fontSize={14+i%3*4} fill={l.c}
            style={{ '--lx':l.lx,'--lr':l.lr, animation:`leaf-spin ${2+i*0.4}s ease-in infinite ${i*0.4}s` }}>🍂</text>
        ))}
        {/* ground leaves */}
        {[10,30,50,70,90,110].map((x,i) => (
          <text key={i} x={x} y="112" fontSize="16" fill={['#ff6f00','#ffd600','#e65100'][i%3]}>🍁</text>
        ))}
      </svg>
    ),
  },

  cherryblossom: {
    msg: ['Petals are falling…', 'Spring is in the air…', 'Blossoming ideas…'],
    bg: '#f8bbd0', color: '#880e4f',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes petal-fall2 { 0%{transform:translate(0,0) rotate(0deg);opacity:0} 10%{opacity:.9} 100%{transform:translate(var(--px),70px) rotate(var(--pr));opacity:0} }
          @keyframes branch-sway { 0%,100%{transform:rotate(-2deg)} 50%{transform:rotate(2deg)} }
        `}</style>
        <g style={{ transformOrigin:'60px 100px', animation:'branch-sway 3s ease-in-out infinite' }}>
          {/* main trunk */}
          <path d="M60 110 Q58 70 55 40" stroke="#795548" strokeWidth="8" fill="none" strokeLinecap="round" />
          {/* branches */}
          <path d="M55 50 Q35 35 18 40" stroke="#8d6e63" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M55 45 Q75 28 95 32" stroke="#8d6e63" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M55 60 Q38 52 25 58" stroke="#8d6e63" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M57 65 Q75 58 88 63" stroke="#8d6e63" strokeWidth="4" fill="none" strokeLinecap="round" />
          {/* blossoms */}
          {[
            [20,40],[35,30],[55,25],[75,28],[90,32],
            [25,58],[45,52],[68,55],[85,62],[50,42],[70,45],
          ].map(([cx,cy],i) => (
            <g key={i}>
              {[0,72,144,216,288].map(a => (
                <ellipse key={a} cx={cx+7*Math.cos(a*Math.PI/180)} cy={cy+7*Math.sin(a*Math.PI/180)}
                  rx="5" ry="7" fill="#f48fb1"
                  transform={`rotate(${a},${cx+7*Math.cos(a*Math.PI/180)},${cy+7*Math.sin(a*Math.PI/180)})`}
                  opacity="0.85" />
              ))}
              <circle cx={cx} cy={cy} r="4" fill="#fce4ec" />
              <circle cx={cx} cy={cy} r="2" fill="#ffd600" />
            </g>
          ))}
        </g>
        {/* falling petals */}
        {[
          {x:10,pr:'120deg',px:'20px'},{x:25,pr:'-90deg',px:'30px'},{x:50,pr:'200deg',px:'-10px'},
          {x:70,pr:'-150deg',px:'15px'},{x:90,pr:'80deg',px:'-20px'},{x:110,pr:'-60deg',px:'-15px'},
        ].map((p,i) => (
          <ellipse key={i} cx={p.x} cy="5" rx="5" ry="7" fill="#f48fb1" opacity="0.9"
            style={{ '--px':p.px,'--pr':p.pr, animation:`petal-fall2 ${2+i*0.4}s ease-in infinite ${i*0.4}s` }} />
        ))}
      </svg>
    ),
  },

  // ── Night Sky ─────────────────────────────────────────────────────────────

  stardust: {
    msg: ['Collecting stardust…', 'Galaxy brain activated…', 'Wish upon a star…'],
    bg: '#0d0221', color: '#e0b3ff',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes dust-twinkle { 0%,100%{opacity:.2;r:1} 50%{opacity:1;r:2.5} }
          @keyframes comet { 0%{transform:translate(0,0);opacity:1} 100%{transform:translate(80px,50px);opacity:0} }
          @keyframes nebula-pulse { 0%,100%{opacity:.3} 50%{opacity:.7} }
        `}</style>
        {/* nebula */}
        <ellipse cx="60" cy="60" rx="50" ry="35" fill="rgba(123,31,162,0.3)" style={{ animation:'nebula-pulse 3s ease-in-out infinite' }} />
        <ellipse cx="70" cy="55" rx="35" ry="25" fill="rgba(74,0,224,0.2)" style={{ animation:'nebula-pulse 2.5s ease-in-out infinite 0.5s' }} />
        {/* stardust particles */}
        {Array.from({length:24},(_,i) => (
          <circle key={i} cx={5+i*5} cy={8+(i*13)%104} r="1.5" fill={['#e0b3ff','#b3d9ff','#ffd700','white'][i%4]}
            style={{ animation:`dust-twinkle ${0.6+i*0.18}s ease-in-out infinite ${i*0.12}s` }} />
        ))}
        {/* comets */}
        {[[0,20,0.5],[10,50,1.2],[5,80,0.8]].map(([x,y,delay],i) => (
          <g key={i} style={{ animation:`comet 2.5s ease-in infinite ${delay}s` }}>
            <circle cx={x} cy={y} r="3" fill="white" />
            <path d={`M${x} ${y} L${x-20} ${y+5}`} stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
          </g>
        ))}
        {/* central star cluster */}
        {[[60,45],[52,58],[68,60],[60,72],[48,70],[72,68]].map(([cx,cy],i) => (
          <g key={i} style={{ animation:`dust-twinkle ${0.8+i*0.3}s ease-in-out infinite ${i*0.2}s` }}>
            <line x1={cx-6} y1={cy} x2={cx+6} y2={cy} stroke={['#e0b3ff','#ffd700','#b3d9ff'][i%3]} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={cx} y1={cy-6} x2={cx} y2={cy+6} stroke={['#e0b3ff','#ffd700','#b3d9ff'][i%3]} strokeWidth="1.5" strokeLinecap="round" />
          </g>
        ))}
      </svg>
    ),
  },

  // ── Indian & Cultural ─────────────────────────────────────────────────────

  rangoli: {
    msg: ['Drawing rangoli…', 'Colourful patterns loading…', 'Festival art in progress…'],
    bg: '#880e4f', color: '#ffd600',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes rangoli-spin { to{transform:rotate(360deg);transform-origin:60px 60px;} }
          @keyframes dot-pulse { 0%,100%{r:3} 50%{r:5} }
        `}</style>
        {/* outer petal ring */}
        <g style={{ animation:'rangoli-spin 8s linear infinite' }}>
          {[0,45,90,135,180,225,270,315].map(a => {
            const r=38, x=60+r*Math.cos(a*Math.PI/180), y=60+r*Math.sin(a*Math.PI/180)
            return <ellipse key={a} cx={x} cy={y} rx="10" ry="16" fill={['#e91e8c','#ffd600','#ff5722','#4caf50','#2196f3','#9c27b0','#ff9800','#00bcd4'][a/45]}
              transform={`rotate(${a},${x},${y})`} opacity="0.85" />
          })}
        </g>
        {/* middle ring */}
        <g style={{ animation:'rangoli-spin 5s linear infinite reverse' }}>
          {[0,60,120,180,240,300].map(a => {
            const r=22, x=60+r*Math.cos(a*Math.PI/180), y=60+r*Math.sin(a*Math.PI/180)
            return <ellipse key={a} cx={x} cy={y} rx="7" ry="11" fill={['#ffd600','#ff5722','#4caf50','#2196f3','#e91e8c','#ff9800'][a/60]}
              transform={`rotate(${a},${x},${y})`} />
          })}
        </g>
        {/* center */}
        <circle cx="60" cy="60" r="10" fill="#ffd600" />
        <circle cx="60" cy="60" r="5" fill="#880e4f" />
        {/* dots */}
        {[0,45,90,135,180,225,270,315].map((a,i) => {
          const r=52, x=60+r*Math.cos(a*Math.PI/180), y=60+r*Math.sin(a*Math.PI/180)
          return <circle key={a} cx={x} cy={y} r="3" fill={['#ffd600','#ff5722','#4caf50','#e91e8c'][i%4]}
            style={{ animation:`dot-pulse ${0.8+i*0.15}s ease-in-out infinite ${i*0.1}s` }} />
        })}
      </svg>
    ),
  },

  kolam: {
    msg: ['Drawing kolam…', 'Sacred patterns forming…', 'Lines of art…'],
    bg: '#1a237e', color: 'white',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes kolam-draw { from{stroke-dashoffset:500} to{stroke-dashoffset:0} }
          @keyframes dot-glow { 0%,100%{opacity:.5} 50%{opacity:1} }
        `}</style>
        {/* grid dots */}
        {Array.from({length:5},(_,i) => Array.from({length:5},(_,j) => (
          <circle key={`${i}-${j}`} cx={25+i*17.5} cy={25+j*17.5} r="3" fill="white"
            style={{ animation:`dot-glow ${0.8+(i+j)*0.15}s ease-in-out infinite ${(i+j)*0.1}s` }} />
        )))}
        {/* kolam curves */}
        {[
          "M25 60 Q42 25 60 42 Q78 25 95 60 Q78 95 60 78 Q42 95 25 60Z",
          "M42 42 Q60 18 78 42 Q95 60 78 78 Q60 102 42 78 Q25 60 42 42Z",
          "M60 25 Q85 42 85 60 Q85 78 60 95 Q35 78 35 60 Q35 42 60 25Z",
        ].map((d,i) => (
          <path key={i} d={d} fill="none" stroke={['#ffd600','#ff6b6b','#4fc3f7'][i]}
            strokeWidth="2" strokeLinecap="round"
            strokeDasharray="500"
            style={{ animation:`kolam-draw ${2+i*0.5}s ease-in-out infinite alternate ${i*0.3}s` }} />
        ))}
        <circle cx="60" cy="60" r="6" fill="#ffd600" />
        <circle cx="60" cy="60" r="3" fill="#1a237e" />
      </svg>
    ),
  },

  holi: {
    msg: ['Throwing colours…', 'Festival of colours…', 'Rainbow splashes…'],
    bg: '#ff6f00', color: 'white',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes splash { 0%{transform:translate(0,0) scale(0);opacity:1} 100%{transform:translate(var(--sx),var(--sy)) scale(1.5);opacity:0} }
          @keyframes powder-burst { 0%{r:0;opacity:1} 100%{r:20;opacity:0} }
        `}</style>
        {/* colour bursts */}
        {[
          {cx:30,cy:35,c:'#e91e8c',delay:'0s'},{cx:85,cy:28,c:'#4caf50',delay:'0.3s'},
          {cx:20,cy:75,c:'#2196f3',delay:'0.6s'},{cx:90,cy:80,c:'#ffd600',delay:'0.9s'},
          {cx:55,cy:20,c:'#ff5722',delay:'1.2s'},{cx:60,cy:90,c:'#9c27b0',delay:'0.4s'},
        ].map(({cx,cy,c,delay},i) => (
          <circle key={i} cx={cx} cy={cy} r="0" fill={c} opacity="0.7"
            style={{ animation:`powder-burst 1.5s ease-out infinite ${delay}` }} />
        ))}
        {/* colour splashes */}
        {[
          {x:55,y:55,sx:'-30px',sy:'-25px',c:'#ff4081'},{x:60,y:52,sx:'28px',sy:'-30px',c:'#4caf50'},
          {x:58,y:60,sx:'-25px',sy:'28px',c:'#2196f3'},{x:62,y:55,sx:'30px',sy:'25px',c:'#ffd600'},
          {x:56,y:57,sx:'0px',sy:'-35px',c:'#9c27b0'},{x:60,y:58,sx:'-35px',sy:'10px',c:'#ff5722'},
        ].map((s,i) => (
          <ellipse key={i} cx={s.x} cy={s.y} rx="8" ry="5" fill={s.c}
            style={{ '--sx':s.sx,'--sy':s.sy, animation:`splash 1.2s ease-out infinite ${i*0.2}s` }} />
        ))}
        {/* center pichkari */}
        <circle cx="60" cy="58" r="12" fill="white" opacity="0.9" />
        <text x="60" y="63" textAnchor="middle" fontSize="16">🎨</text>
      </svg>
    ),
  },

  monsoon: {
    msg: ['Rain is pouring ideas…', 'Petrichor loading…', 'Dancing in the rain…'],
    bg: '#1565c0', color: 'white',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes rain-fall { 0%{transform:translateY(-10px);opacity:0} 15%{opacity:1} 100%{transform:translateY(115px);opacity:.3} }
          @keyframes lightning { 0%,88%,100%{opacity:0} 90%,98%{opacity:1} }
          @keyframes ripple { 0%{transform:scale(0);opacity:1} 100%{transform:scale(3);opacity:0} }
        `}</style>
        {/* cloud */}
        <ellipse cx="60" cy="35" rx="40" ry="22" fill="#455a64" />
        <ellipse cx="38" cy="42" rx="22" ry="16" fill="#546e7a" />
        <ellipse cx="82" cy="40" rx="20" ry="15" fill="#546e7a" />
        <ellipse cx="60" cy="50" rx="36" ry="14" fill="#607d8b" />
        {/* lightning */}
        <path d="M62 48 L54 68 L62 68 L52 88" stroke="#ffd600" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
          style={{ animation:'lightning 3s ease-in-out infinite' }} />
        {/* rain drops */}
        {Array.from({length:16},(_,i) => (
          <line key={i} x1={8+i*7} y1={55+i%3*5} x2={5+i*7} y2={65+i%3*5}
            stroke="rgba(144,202,249,0.8)" strokeWidth="2" strokeLinecap="round"
            style={{ animation:`rain-fall ${0.6+i*0.1}s linear infinite ${i*0.12}s` }} />
        ))}
        {/* puddle ripples */}
        {[[30,105],[60,108],[90,105]].map(([cx,cy],i) => (
          <ellipse key={i} cx={cx} cy={cy} rx="10" ry="4" fill="none" stroke="rgba(144,202,249,0.5)" strokeWidth="1.5"
            style={{ animation:`ripple 1.5s ease-out infinite ${i*0.4}s` }} />
        ))}
      </svg>
    ),
  },

  // ── Glumbi Specials ───────────────────────────────────────────────────────

  storymagic: {
    msg: ['Opening the story book…', 'Magic words forming…', 'Once upon a time…'],
    bg: '#4a0072', color: '#ffd600',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes page-turn { 0%,100%{transform:rotateY(0deg)} 50%{transform:rotateY(-20deg)} }
          @keyframes letter-float { 0%{transform:translate(0,0) rotate(0deg);opacity:0} 20%{opacity:1} 100%{transform:translate(var(--lx),var(--ly)) rotate(var(--lr));opacity:0} }
          @keyframes book-glow { 0%,100%{filter:drop-shadow(0 0 6px #ffd600)} 50%{filter:drop-shadow(0 0 20px #ffd600)} }
        `}</style>
        {/* book */}
        <g style={{ animation:'book-glow 2s ease-in-out infinite' }}>
          <rect x="22" y="30" width="76" height="68" rx="5" fill="#ffd600" />
          <rect x="22" y="30" width="38" height="68" rx="4" fill="#ff6f00" />
          <rect x="60" y="30" width="38" height="68" rx="4" fill="#fffde7" />
          {/* spine */}
          <rect x="58" y="30" width="4" height="68" fill="#e65100" />
          {/* lines on right page */}
          {[45,52,59,66,73,80].map(y => <line key={y} x1="65" y1={y} x2="92" y2={y} stroke="#ccc" strokeWidth="1.5" />)}
          {/* star on left */}
          <text x="41" y="72" textAnchor="middle" fontSize="28">⭐</text>
        </g>
        {/* floating letters */}
        {[{l:'A',x:85,y:40,lx:'20px',ly:'-30px',lr:'30deg'},{l:'Z',x:25,y:45,lx:'-20px',ly:'-25px',lr:'-20deg'},
          {l:'!',x:95,y:75,lx:'15px',ly:'20px',lr:'45deg'},{l:'?',x:15,y:78,lx:'-18px',ly:'18px',lr:'-30deg'}].map((lt,i) => (
          <text key={i} x={lt.x} y={lt.y} fontSize="18" fontWeight="900" fill="#ffd600" textAnchor="middle"
            style={{ '--lx':lt.lx,'--ly':lt.ly,'--lr':lt.lr, animation:`letter-float 1.8s ease-out infinite ${i*0.4}s` }}>
            {lt.l}
          </text>
        ))}
      </svg>
    ),
  },

  curiositylab: {
    msg: ['Running experiments…', 'Science is bubbling…', 'Eureka moment loading…'],
    bg: '#00695c', color: '#b2dfdb',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes bubble-lab { 0%{transform:translateY(0) scale(1);opacity:.8} 100%{transform:translateY(-25px) scale(1.3);opacity:0} }
          @keyframes flask-glow { 0%,100%{filter:drop-shadow(0 0 4px #4db6ac)} 50%{filter:drop-shadow(0 0 16px #4db6ac)} }
          @keyframes spin-gear { to{transform:rotate(360deg);transform-origin:90px 35px;} }
        `}</style>
        <g style={{ animation:'flask-glow 2s ease-in-out infinite' }}>
          {/* flask */}
          <path d="M48 25 L48 55 L28 90 Q26 100 40 100 L80 100 Q94 100 92 90 L72 55 L72 25Z" fill="#4db6ac" opacity="0.9" />
          <path d="M48 25 L48 55 L32 85 Q30 95 42 96 L78 96 Q88 96 88 87 L72 55 L72 25Z" fill="rgba(255,255,255,0.15)" />
          {/* liquid */}
          <path d="M32 85 Q36 78 60 78 Q80 78 88 87 L80 100 Q65 105 40 100Z" fill="#00897b" opacity="0.8" />
          {/* bubbles in flask */}
          {[[45,75],[55,68],[65,73],[52,82]].map(([cx,cy],i) => (
            <circle key={i} cx={cx} cy={cy} r="4" fill="rgba(255,255,255,0.5)"
              style={{ animation:`bubble-lab ${0.8+i*0.3}s ease-in infinite ${i*0.25}s` }} />
          ))}
          {/* tube neck */}
          <rect x="48" y="20" width="24" height="8" rx="3" fill="#80cbc4" />
          {/* cork */}
          <rect x="50" y="15" width="20" height="8" rx="4" fill="#a1887f" />
        </g>
        {/* gear */}
        <g style={{ animation:'spin-gear 3s linear infinite' }}>
          {Array.from({length:8},(_,i) => {
            const a=i*45*Math.PI/180
            return <rect key={i} x={90+14*Math.cos(a)-3} y={35+14*Math.sin(a)-3} width="6" height="6" rx="1" fill="#4db6ac" />
          })}
          <circle cx="90" cy="35" r="8" fill="#00695c" stroke="#4db6ac" strokeWidth="2" />
        </g>
        {/* stars/sparkles */}
        {[[15,30],[105,60],[20,80]].map(([x,y],i) => (
          <text key={i} x={x} y={y} fontSize="16" textAnchor="middle"
            style={{ animation:`bubble-lab ${1+i*0.4}s ease-in-out infinite ${i*0.3}s` }}>⚗️</text>
        ))}
      </svg>
    ),
  },

  wordwizard: {
    msg: ['Casting word spells…', 'Dictionary magic…', 'Vocabulary brewing…'],
    bg: '#1a237e', color: '#ffd600',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes word-float { 0%{opacity:0;transform:translateY(0)} 30%{opacity:1} 100%{opacity:0;transform:translateY(-50px)} }
          @keyframes wand-sparkle { 0%,100%{opacity:0;transform:scale(0)} 50%{opacity:1;transform:scale(1)} }
          @keyframes hat-bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        `}</style>
        {/* wizard hat */}
        <g style={{ animation:'hat-bob 2s ease-in-out infinite' }}>
          <path d="M60 10 L30 75 L90 75Z" fill="#1a237e" />
          <rect x="22" y="72" width="76" height="12" rx="6" fill="#283593" />
          {/* hat stars */}
          {[[45,40],[60,25],[75,45],[55,58]].map(([x,y],i) => (
            <text key={i} x={x} y={y} fontSize="10" fill="#ffd600" textAnchor="middle"
              style={{ animation:`wand-sparkle ${0.8+i*0.3}s ease-in-out infinite ${i*0.2}s` }}>★</text>
          ))}
        </g>
        {/* wand */}
        <line x1="70" y1="80" x2="100" y2="50" stroke="#ffd600" strokeWidth="3" strokeLinecap="round" />
        <circle cx="100" cy="50" r="6" fill="#ffd600" style={{ animation:'wand-sparkle 1s ease-in-out infinite' }} />
        {/* floating words */}
        {[{w:'ABC',x:15,y:30,delay:'0s'},{w:'!?',x:100,y:40,delay:'0.5s'},{w:'xyz',x:12,y:80,delay:'1s'},{w:'✦',x:105,y:90,delay:'0.7s'}].map((wd,i) => (
          <text key={i} x={wd.x} y={wd.y} fontSize="14" fontWeight="900" fill="#ffd600" textAnchor="middle"
            style={{ animation:`word-float 2s ease-out infinite ${wd.delay}` }}>
            {wd.w}
          </text>
        ))}
      </svg>
    ),
  },

  goldstar: {
    msg: ['You are a star!', 'Shining bright…', 'Gold star incoming…'],
    bg: '#f57f17', color: 'white',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes star-spin { to{transform:rotate(360deg);transform-origin:60px 55px} }
          @keyframes star-glow { 0%,100%{filter:drop-shadow(0 0 6px #ffd600)} 50%{filter:drop-shadow(0 0 24px #ffd600)} }
          @keyframes confetti-fall { 0%{transform:translateY(-5px) rotate(0deg);opacity:0} 10%{opacity:1} 100%{transform:translateY(115px) rotate(var(--cr));opacity:0} }
        `}</style>
        {/* confetti */}
        {['#ff4081','#4fc3f7','#4caf50','#ffd600','#ff6f00','#e040fb'].map((c,i) => (
          <rect key={i} x={15+i*17} y="-5" width="8" height="10" rx="2" fill={c}
            style={{ '--cr':`${180+i*60}deg`, animation:`confetti-fall ${1.5+i*0.3}s ease-in infinite ${i*0.3}s` }} />
        ))}
        {/* star */}
        <g style={{ animation:'star-glow 1.5s ease-in-out infinite' }}>
          <g style={{ animation:'star-spin 6s linear infinite' }}>
            {/* outer glow rings */}
            {[50,42].map((r,i) => (
              <circle key={r} cx="60" cy="55" r={r} fill="none" stroke="rgba(255,214,0,0.3)" strokeWidth="2"
                style={{ animation:`star-glow ${1+i*0.5}s ease-in-out infinite` }} />
            ))}
          </g>
          {/* main star */}
          <polygon points="60,18 68,45 97,45 74,62 82,90 60,73 38,90 46,62 23,45 52,45"
            fill="#ffd600" />
          <polygon points="60,28 66,46 84,46 70,57 75,75 60,65 45,75 50,57 36,46 54,46"
            fill="#ffee58" />
          <circle cx="60" cy="55" r="8" fill="white" opacity="0.7" />
        </g>
      </svg>
    ),
  },

  artStudio: {
    msg: ['Mixing colours…', 'Artist brain engaged…', 'Masterpiece loading…'],
    bg: '#6a1b9a', color: 'white',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes palette-rotate { 0%,100%{transform:rotate(-5deg)} 50%{transform:rotate(5deg)} }
          @keyframes brush-stroke { 0%,100%{transform:translateY(0) rotate(-10deg)} 50%{transform:translateY(-8px) rotate(10deg)} }
          @keyframes paint-drip { 0%{transform:translateY(0);opacity:1} 100%{transform:translateY(20px);opacity:0} }
        `}</style>
        {/* palette */}
        <g style={{ transformOrigin:'55px 65px', animation:'palette-rotate 3s ease-in-out infinite' }}>
          <ellipse cx="55" cy="68" rx="35" ry="30" fill="#ce93d8" />
          <ellipse cx="66" cy="58" rx="12" ry="10" fill="#f3e5f5" />
          {/* paint blobs */}
          {[[38,52,'#ff4081'],[48,45,'#ffd600'],[62,48,'#4fc3f7'],[72,55,'#4caf50'],[76,68,'#ff6f00'],[65,78,'#e040fb'],[45,75,'#ff5722']].map(([cx,cy,c],i) => (
            <circle key={i} cx={cx} cy={cy} r="7" fill={c} />
          ))}
          {/* thumb hole */}
          <ellipse cx="66" cy="58" rx="8" ry="7" fill="#6a1b9a" />
        </g>
        {/* brush */}
        <g style={{ transformOrigin:'85px 40px', animation:'brush-stroke 2s ease-in-out infinite' }}>
          <rect x="82" y="15" width="6" height="40" rx="3" fill="#8d6e63" />
          <rect x="80" y="52" width="10" height="5" rx="1" fill="#9e9e9e" />
          <ellipse cx="85" cy="62" rx="5" ry="10" fill="#e040fb" />
          {/* drip */}
          <ellipse cx="85" cy="73" rx="3" ry="5" fill="#e040fb"
            style={{ animation:'paint-drip 1.5s ease-in infinite' }} />
        </g>
      </svg>
    ),
  },

  bubblegum: {
    msg: ['Blowing bubbles…', 'Pop! Almost there…', 'Pink and sparkly…'],
    bg: '#f06292', color: 'white',
    render: () => (
      <svg width="120" height="120" viewBox="0 0 120 120">
        <style>{`
          @keyframes bubble-rise { 0%{transform:translateY(115px) scale(.5);opacity:0} 15%{opacity:.9} 90%{opacity:.5} 100%{transform:translateY(-20px) scale(1.1);opacity:0} }
          @keyframes pop { 0%,80%{opacity:1;r:var(--pr)} 90%{opacity:.5;r:calc(var(--pr) + 4px)} 100%{opacity:0;r:calc(var(--pr)+8px)} }
        `}</style>
        {[[20,8,'#f8bbd0'],[40,12,'#fce4ec'],[25,6,'#ff80ab'],
          [60,10,'#f48fb1'],[15,14,'#fce4ec'],[50,8,'#ff80ab'],
          [35,16,'#f8bbd0'],[70,7,'#fce4ec'],[45,11,'#ff80ab']].map(([x,y,c],i) => (
          <circle key={i} cx={x+i*5} cy="110" r={y} fill={c} fillOpacity="0.7"
            stroke="rgba(255,255,255,0.5)" strokeWidth="1"
            style={{ '--pr':`${y}px`, animation:`bubble-rise ${2+i*0.4}s ease-in infinite ${i*0.3}s` }} />
        ))}
        {/* gum machine */}
        <circle cx="60" cy="55" r="30" fill="#f48fb1" stroke="#e91e8c" strokeWidth="3" />
        <circle cx="60" cy="55" r="22" fill="rgba(255,255,255,0.2)" />
        <rect x="48" y="82" width="24" height="16" rx="4" fill="#e91e8c" />
        <rect x="55" y="95" width="10" height="10" rx="3" fill="#880e4f" />
        {/* gumballs */}
        {[[52,48,'#ffd600'],[65,52,'#4fc3f7'],[58,62,'#ff4081'],[68,44,'#4caf50'],[50,60,'#ff8f00']].map(([cx,cy,c],i) => (
          <circle key={i} cx={cx} cy={cy} r="6" fill={c} />
        ))}
      </svg>
    ),
  },
}

/* ─── Loading messages fallback ──────────────────────────────────────────── */
const DEFAULT_MSGS = ['Creating something magical…', 'Thinking hard…', 'Almost ready…']

function pickMsg(msgs) {
  return msgs[Math.floor(Math.random() * msgs.length)]
}

/* ─── ThemeLoader component ──────────────────────────────────────────────── */
export default function ThemeLoader({ theme = 'coral', label }) {
  const anim = THEMES_ANIM[theme]
  const msgRef = useRef(anim ? pickMsg(anim.msg) : pickMsg(DEFAULT_MSGS))

  const msg = label || msgRef.current
  const target = document.fullscreenElement || document.body

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.55)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      animation: 'fadeIn 0.25s ease',
    }}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
        background: 'white',
        borderRadius: 32,
        padding: '36px 48px',
        boxShadow: `0 24px 80px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.08)`,
        maxWidth: 320,
        textAlign: 'center',
        animation: 'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <div style={{
          width: 160, height: 160, borderRadius: 36,
          background: anim ? anim.bg : '#ff6b6b',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 12px 40px ${anim ? anim.bg : '#ff6b6b'}88`,
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          {anim
            ? <div style={{ transform: 'scale(1.33)', transformOrigin: 'center' }}>{anim.render()}</div>
            : <span className="spinner" style={{ width: 40, height: 40, borderWidth: 4, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
          }
        </div>
        <div>
          <div style={{
            fontFamily: 'Nunito, sans-serif', fontSize: 20,
            color: '#222', marginBottom: 6, lineHeight: 1.3,
          }}>
            {msg}
          </div>
          <div style={{ fontSize: 13, color: '#aaa', fontWeight: 600 }}>
            This takes just a moment ✨
          </div>
        </div>
      </div>
      <style>{`
        @keyframes popIn {
          from { transform: scale(0.7); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>,
    target
  )
}
