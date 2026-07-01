import { useEffect, useRef } from 'react'

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

  return (
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
            fontFamily: 'Fredoka One, cursive', fontSize: 20,
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
    </div>
  )
}
