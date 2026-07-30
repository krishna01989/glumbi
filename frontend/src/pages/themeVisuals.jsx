// ── themeVisuals.jsx ──────────────────────────────────────────────────────────
// Per-theme zone card scenes and planet object shapes.
// Each of the 49 themes has its own visual identity.

// ── Zone feature icons ─────────────────────────────────────────────────────────
export const ZONE_EMOJI = {
  stories:  '📖',
  curiosity:'🔭',
  play:     '🎮',
  studio:   '🎨',
}

// ── Zone background base color per theme ───────────────────────────────────────
const ZONE_BG = {
  batman:'#07070f',       spiderman:'#0a0004',    superman:'#040820',
  avengers:'#080004',     galaxy:'#020616',        moon:'#06060e',
  stardust:'#040410',     robot:'#050810',         curiositylab:'#040c18',
  forest:'#030d06',       panda:'#040f06',         frog:'#040e05',
  enchanted:'#07000e',    minecraft:'#0c1808',     autumnleaves:'#110700',
  dinosaur:'#070e03',     ocean:'#010810',         shark:'#010712',
  mermaid:'#020b12',      monsoon:'#030710',       candy:'#0c000f',
  bubblegum:'#0f000f',    icecream:'#0c040f',      pizza:'#130700',
  donut:'#0f0707',        coral:'#0c0400',         sunshine:'#0c0700',
  lion:'#110600',         unicorn:'#07000f',       storymagic:'#05000f',
  wordwizard:'#040016',   goldstar:'#120b00',      rangoli:'#0c0007',
  kolam:'#040010',        fairygarden:'#050905',   cherryblossom:'#0e0407',
  princess:'#0c000f',     holi:'#070010',          pirate:'#010810',
  dragonfire:'#0d0000',   racecar:'#090900',       halloween:'#090400',
  diwali:'#0f0700',       hotcocoa:'#040309',      christmas:'#020902',
  frozen:'#051626',       sky:'#051626',           rainbow:'#070007',
  artStudio:'#070007',
}

// ── Theme zone scene SVG (inside clipped circle) ───────────────────────────────
function ZoneScene({ themeKey, h, color, clipId }) {
  const s = h * 2
  const clip = `url(#${clipId})`

  // ── BATMAN ──
  if (themeKey === 'batman') return (
    <g clipPath={clip}>
      {[[0,12,55],[14,9,74],[25,15,46],[42,11,82],[55,13,60],[70,17,51],[90,10,68]].map(([x,w,ht],i)=>(
        <rect key={i} x={h*x/60} y={s-h*ht/60} width={h*w/60} height={h*ht/60} fill="#04040a"/>
      ))}
      <path d={`M${h} ${h*.28} L${h*.22} ${s} L${h*.78} ${s} Z`} fill="rgba(255,215,0,.07)"/>
      <circle cx={h} cy={h*.28} r={h*.2} fill="rgba(255,215,0,.12)"/>
      <g transform={`translate(${h},${h*.28}) scale(${h*.018})`}>
        <path d="M0,-11 C-5,-5 -14,-1 -16,5 C-10,5 -5,1 0,3 C5,1 10,5 16,5 C14,-1 5,-5 0,-11 Z M-3,3 C-7,9 -9,13 -7,17 L0,13 L7,17 C9,13 7,9 3,3 Z" fill="rgba(255,215,0,.5)"/>
      </g>
      <rect x={0} y={s*.82} width={s} height={s*.18} fill="#030308"/>
    </g>
  )

  // ── SPIDERMAN ──
  if (themeKey === 'spiderman') return (
    <g clipPath={clip}>
      {[[0,13,52],[15,9,70],[26,17,43],[45,11,74],[58,15,54],[75,13,64],[90,9,57]].map(([x,w,ht],i)=>(
        <rect key={i} x={h*x/60} y={s-h*ht/60} width={h*w/60} height={h*ht/60} fill="#080002"/>
      ))}
      {Array.from({length:8},(_,i)=>{
        const a=(i/8)*Math.PI*2
        return <line key={i} x1={h} y1={h*.5} x2={h+Math.cos(a)*h*.9} y2={h*.5+Math.sin(a)*h*.9}
          stroke="rgba(200,220,255,.22)" strokeWidth={.8}/>
      })}
      {[.2,.38,.56].map((r,i)=>(
        <circle key={i} cx={h} cy={h*.5} r={h*r} fill="none"
          stroke="rgba(200,220,255,.18)" strokeWidth={.8}/>
      ))}
      <circle cx={h} cy={h*.5} r={h*.07} fill="rgba(220,0,0,.8)"/>
    </g>
  )

  // ── SUPERMAN ──
  if (themeKey === 'superman') return (
    <g clipPath={clip}>
      <rect x={0} y={0} width={s} height={s*.5} fill="rgba(0,40,120,.25)"/>
      {[[0,15,62],[17,11,78],[30,19,52],[51,13,86],[66,17,60],[84,13,54]].map(([x,w,ht],i)=>(
        <rect key={i} x={h*x/60} y={s-h*ht/60} width={h*w/60} height={h*ht/60} fill="#020618"/>
      ))}
      <circle cx={h} cy={h*.52} r={h*.28} fill="rgba(255,215,0,.1)"/>
      <path d={`M${h+h*.13},${h*.35} Q${h+h*.13},${h*.27} ${h},${h*.27} Q${h-h*.13},${h*.27} ${h-h*.13},${h*.4} Q${h-h*.13},${h*.5} ${h},${h*.5} Q${h+h*.13},${h*.5} ${h+h*.13},${h*.62} Q${h+h*.13},${h*.7} ${h},${h*.7} Q${h-h*.13},${h*.7} ${h-h*.13},${h*.64}`}
        stroke="rgba(255,215,0,.65)" strokeWidth={h*.04} fill="none" strokeLinecap="round"/>
    </g>
  )

  // ── AVENGERS ──
  if (themeKey === 'avengers') return (
    <g clipPath={clip}>
      <circle cx={h} cy={h} r={h} fill="rgba(80,0,0,.2)"/>
      <circle cx={h} cy={h*.52} r={h*.3} fill="none" stroke="rgba(200,210,220,.55)" strokeWidth={h*.04}/>
      <line x1={h-h*.16} y1={h*.72} x2={h} y2={h*.28} stroke="rgba(200,210,220,.65)" strokeWidth={h*.045} strokeLinecap="round"/>
      <line x1={h+h*.16} y1={h*.72} x2={h} y2={h*.28} stroke="rgba(200,210,220,.65)" strokeWidth={h*.045} strokeLinecap="round"/>
      <line x1={h-h*.09} y1={h*.55} x2={h+h*.09} y2={h*.55} stroke="rgba(200,210,220,.65)" strokeWidth={h*.04} strokeLinecap="round"/>
      {[{x:.2,y:.22},{x:.78,y:.28},{x:.15,y:.72},{x:.82,y:.68},{x:.52,y:.15}].map((d,i)=>(
        <circle key={i} cx={s*d.x} cy={s*d.y} r={h*.025} fill={color} opacity=".75"/>
      ))}
    </g>
  )

  // ── GALAXY (space) ──
  if (themeKey === 'galaxy') return (
    <g clipPath={clip}>
      {Array.from({length:20},(_,i)=>(
        <circle key={i} cx={(i*1373+7)%s} cy={(i*2741+13)%s} r={(i%3)*.8+.4}
          fill="white" opacity={.1+(i%5)*.12}/>
      ))}
      <ellipse cx={h} cy={h*.52} rx={h*.5} ry={h*.18} fill={color} opacity=".18" filter="url(#zone-blur)"/>
      <g transform={`translate(${h},${h*.52}) scale(${h*.008})`} style={{animation:'hub-arm-spin 30s linear infinite',transformOrigin:'0 0'}}>
        {[0,60,120,180,240,300].map((a,i)=>(
          <ellipse key={i} rx={40} ry={12} fill={color} opacity=".3" transform={`rotate(${a})`}/>
        ))}
      </g>
      <circle cx={h} cy={h*.52} r={h*.08} fill="white" opacity=".9"/>
    </g>
  )

  // ── MOON ──
  if (themeKey === 'moon') return (
    <g clipPath={clip}>
      {Array.from({length:12},(_,i)=>(
        <circle key={i} cx={(i*1373+7)%s} cy={(i*2741+13)%s} r={.6} fill="white" opacity={.4+(i%3)*.2}/>
      ))}
      <circle cx={h*.62} cy={h*.52} r={h*.36} fill="#d4d0c8" opacity=".9"/>
      <circle cx={h*.56} cy={h*.45} r={h*.32} fill="#e8e4dc"/>
      {[{cx:.44,cy:.38,r:.06},{cx:.62,cy:.55,r:.04},{cx:.5,cy:.62,r:.05},{cx:.7,cy:.42,r:.035}].map((c,i)=>(
        <circle key={i} cx={s*c.cx} cy={s*c.cy} r={h*c.r} fill="rgba(0,0,0,.25)"/>
      ))}
    </g>
  )

  // ── STARDUST ──
  if (themeKey === 'stardust') return (
    <g clipPath={clip}>
      {Array.from({length:25},(_,i)=>(
        <circle key={i} cx={(i*1373+7)%s} cy={(i*2741+13)%s} r={(i%4)*.6+.3} fill={i%5===0?color:'white'} opacity={.15+(i%4)*.18}/>
      ))}
      {[h*.3,h*.55,h*.75].map((r,i)=>(
        <circle key={i} cx={h} cy={h} r={r} fill="none" stroke={color} strokeOpacity=".15" strokeWidth={1} strokeDasharray="3 6"/>
      ))}
      <path d={`M${h},${h*.2} L${h+h*.06},${h*.38} L${h+h*.22},${h*.38} L${h+h*.09},${h*.48} L${h+h*.14},${h*.66} L${h},${h*.56} L${h-h*.14},${h*.66} L${h-h*.09},${h*.48} L${h-h*.22},${h*.38} L${h-h*.06},${h*.38} Z`}
        fill={color} opacity=".7"/>
    </g>
  )

  // ── ROBOT ──
  if (themeKey === 'robot') return (
    <g clipPath={clip}>
      <rect x={h*.3} y={h*.22} width={h*1.4} height={h*1.2} rx={h*.1} fill="#0a1a28"/>
      {/* Grid circuit lines */}
      {[.38,.54,.7,.86].map((y,i)=>(<line key={i} x1={0} y1={s*y} x2={s} y2={s*y} stroke="rgba(0,255,180,.18)" strokeWidth={.7}/>))}
      {[.3,.46,.62,.78].map((x,i)=>(<line key={i} x1={s*x} y1={0} x2={s*x} y2={s} stroke="rgba(0,255,180,.18)" strokeWidth={.7}/>))}
      {/* Robot face */}
      <rect x={h*.42} y={h*.28} width={h*1.16} height={h*.82} rx={h*.08} fill="#0f2235" stroke="rgba(0,255,180,.4)" strokeWidth={1.5}/>
      <rect x={h*.55} y={h*.38} width={h*.25} height={h*.18} rx={h*.04} fill="#00ffb4" opacity=".9"/>
      <rect x={h*.92} y={h*.38} width={h*.25} height={h*.18} rx={h*.04} fill="#00ffb4" opacity=".9"/>
      <rect x={h*.55} y={h*.66} width={h*.62} height={h*.08} rx={h*.04} fill="#00ffb4" opacity=".55"/>
      {/* Antenna */}
      <line x1={h} y1={h*.28} x2={h} y2={h*.1} stroke="rgba(0,255,180,.5)" strokeWidth={1.5}/>
      <circle cx={h} cy={h*.1} r={h*.04} fill="#00ffb4"/>
    </g>
  )

  // ── CURIOSITYLAB ──
  if (themeKey === 'curiositylab') return (
    <g clipPath={clip}>
      {/* Lab bench */}
      <rect x={0} y={s*.72} width={s} height={s*.28} fill="#081424"/>
      <rect x={0} y={s*.7} width={s} height={s*.04} fill="#0e2038"/>
      {/* Beakers */}
      <path d={`M${h*.28} ${s*.72} L${h*.2} ${s*.95} L${h*.56} ${s*.95} L${h*.48} ${s*.72} Z`} fill="#4dd0e1" opacity=".7"/>
      <rect x={h*.28} y={s*.55} width={h*.2} height={h*.22} rx={h*.03} fill="#4dd0e1" opacity=".7"/>
      <circle cx={h*.38} cy={s*.85} r={h*.06} fill="rgba(255,200,0,.6)"/>
      {/* Flask */}
      <path d={`M${h*.9} ${s*.72} L${h*.74} ${s*.95} L${h*1.2} ${s*.95} L${h*1.04} ${s*.72} Z`} fill="#80deea" opacity=".65"/>
      <rect x={h*.9} y={s*.52} width={h*.14} height={h*.25} rx={h*.03} fill="#80deea" opacity=".65"/>
      {/* Atom */}
      <circle cx={h*1.56} cy={s*.55} r={h*.05} fill="#ffd600"/>
      {[0,60,120].map((a,i)=>(
        <ellipse key={i} cx={h*1.56} cy={s*.55} rx={h*.18} ry={h*.07}
          fill="none" stroke="#ffd600" strokeWidth={1.2} strokeOpacity=".6"
          transform={`rotate(${a} ${h*1.56} ${s*.55})`}/>
      ))}
      {/* Floating bubbles */}
      {[{x:.55,y:.38},{x:.72,y:.28},{x:.42,y:.52}].map((d,i)=>(
        <circle key={i} cx={s*d.x} cy={s*d.y} r={h*.04}
          fill="none" stroke="rgba(100,220,255,.5)" strokeWidth={1}/>
      ))}
    </g>
  )

  // ── FOREST ──
  if (themeKey === 'forest') return (
    <g clipPath={clip}>
      {[[0,16,68],[18,12,88],[32,20,55],[54,14,92],[68,18,64],[86,14,76]].map(([x,w,ht],i)=>(
        <polygon key={i} points={`${h*x/60},${s} ${h*(x+w/2)/60},${s-h*ht/60} ${h*(x+w)/60},${s}`}
          fill={i%2===0?'#0d2e0f':'#0a2409'}/>
      ))}
      {[{x:.2,y:.35},{x:.72,y:.3},{x:.45,y:.25},{x:.6,y:.42}].map((d,i)=>(
        <circle key={i} cx={s*d.x} cy={s*d.y} r={h*.028}
          fill={['#aaff44','#88ee88','#ccff66','#ffff88'][i]} opacity=".7"
          style={{animation:`hub-twinkle ${2+i*.5}s ${i*.3}s ease-in-out infinite`}}/>
      ))}
      <ellipse cx={h} cy={s*.82} rx={h*.72} ry={h*.12} fill="#0d2e0f"/>
      <circle cx={h} cy={s*.3} r={h*.18} fill="rgba(200,255,150,.1)"/>
    </g>
  )

  // ── PANDA ──
  if (themeKey === 'panda') return (
    <g clipPath={clip}>
      {/* Bamboo stalks */}
      {[.18,.35,.55,.72,.88].map((x,i)=>(
        <g key={i}>
          <rect x={s*x-h*.05} y={0} width={h*.1} height={s} fill={`rgba(100,160,80,${.25+i*.05})`} rx={h*.04}/>
          {[.2,.4,.6,.8].map((y,j)=>(
            <line key={j} x1={s*x-h*.05} y1={s*y} x2={s*x+h*.05} y2={s*y}
              stroke="rgba(70,120,50,.5)" strokeWidth={1.5}/>
          ))}
        </g>
      ))}
      {/* Panda face */}
      <circle cx={h} cy={h*.58} r={h*.3} fill="#e8e8e8" opacity=".9"/>
      <circle cx={h-h*.14} cy={h*.46} r={h*.1} fill="#1a1a1a" opacity=".9"/>
      <circle cx={h+h*.14} cy={h*.46} r={h*.1} fill="#1a1a1a" opacity=".9"/>
      <circle cx={h-h*.11} cy={h*.49} r={h*.055} fill="white"/>
      <circle cx={h+h*.11} cy={h*.49} r={h*.055} fill="white"/>
      <circle cx={h-h*.1} cy={h*.5} r={h*.03} fill="#1a1a1a"/>
      <circle cx={h+h*.1} cy={h*.5} r={h*.03} fill="#1a1a1a"/>
      <circle cx={h} cy={h*.62} r={h*.065} fill="#e8c0b0"/>
      <path d={`M${h-h*.06},${h*.66} Q${h},${h*.72} ${h+h*.06},${h*.66}`}
        stroke="#c08878" strokeWidth={h*.025} fill="none"/>
    </g>
  )

  // ── FROG ──
  if (themeKey === 'frog') return (
    <g clipPath={clip}>
      {/* Pond */}
      <ellipse cx={h} cy={s*.78} rx={h*.8} ry={h*.22} fill="#1a4a2a" opacity=".85"/>
      <ellipse cx={h} cy={s*.76} rx={h*.7} ry={h*.14} fill="#0a7040" opacity=".6"/>
      {/* Lily pads */}
      <ellipse cx={h*.42} cy={s*.74} rx={h*.18} ry={h*.1} fill="#2a8040"/>
      <ellipse cx={h*1.52} cy={s*.76} rx={h*.15} ry={h*.09} fill="#2a8040"/>
      {/* Frog on lily pad */}
      <ellipse cx={h*.42} cy={s*.72} rx={h*.12} ry={h*.08} fill="#4caf50" opacity=".9"/>
      <circle cx={h*.36} cy={s*.68} r={h*.05} fill="#4caf50"/>
      <circle cx={h*.48} cy={s*.68} r={h*.05} fill="#4caf50"/>
      <circle cx={h*.355} cy={s*.678} r={h*.025} fill="#81c784"/>
      <circle cx={h*.475} cy={s*.678} r={h*.025} fill="#81c784"/>
      <circle cx={h*.36} cy={s*.672} r={h*.012} fill="#1a1a1a"/>
      <circle cx={h*.48} cy={s*.672} r={h*.012} fill="#1a1a1a"/>
      {/* Dragonfly */}
      <line x1={h*1.1} y1={s*.38} x2={h*1.1} y2={s*.52} stroke="#666" strokeWidth={1.2}/>
      <ellipse cx={h*1.04} cy={s*.42} rx={h*.08} ry={h*.03} fill="rgba(150,220,255,.55)" transform={`rotate(-20 ${h*1.04} ${s*.42})`}/>
      <ellipse cx={h*1.16} cy={s*.42} rx={h*.08} ry={h*.03} fill="rgba(150,220,255,.55)" transform={`rotate(20 ${h*1.16} ${s*.42})`}/>
    </g>
  )

  // ── ENCHANTED ──
  if (themeKey === 'enchanted') return (
    <g clipPath={clip}>
      {[[0,14,60],[16,10,80],[28,18,48],[48,12,85],[62,16,58],[80,12,72]].map(([x,w,ht],i)=>(
        <polygon key={i} points={`${h*x/60},${s} ${h*(x+w/2)/60},${s-h*ht/60} ${h*(x+w)/60},${s}`}
          fill="#200840"/>
      ))}
      {[{x:.3,y:.32},{x:.55,y:.25},{x:.72,y:.38},{x:.2,y:.52},{x:.65,y:.58},{x:.42,y:.45}].map((d,i)=>(
        <circle key={i} cx={s*d.x} cy={s*d.y} r={h*.03}
          fill={['#ff80ab','#ce93d8','#80cbc4','#fff9c4','#ffd600','#f48fb1'][i]} opacity=".8"
          style={{animation:`hub-glow-pulse ${2+i*.4}s ${i*.2}s ease-in-out infinite`}}/>
      ))}
      <circle cx={h} cy={h*.5} r={h*.25} fill="rgba(200,100,255,.12)"/>
      <path d={`M${h},${h*.3} L${h+h*.06},${h*.45} L${h+h*.2},${h*.45} L${h+h*.08},${h*.54} L${h+h*.12},${h*.7} L${h},${h*.62} L${h-h*.12},${h*.7} L${h-h*.08},${h*.54} L${h-h*.2},${h*.45} L${h-h*.06},${h*.45} Z`}
        fill="rgba(200,100,255,.5)"/>
    </g>
  )

  // ── MINECRAFT ──
  if (themeKey === 'minecraft') return (
    <g clipPath={clip}>
      {/* Pixelated landscape */}
      {Array.from({length:8},(_,i)=>{
        const x = i*(s/8), bh = h*.3+(i%3)*h*.2
        return (
          <g key={i}>
            <rect x={x} y={s-bh-h*.25} width={s/8} height={h*.25} fill="#7c5e3c"/>
            <rect x={x} y={s-bh-h*.32} width={s/8} height={h*.1} fill="#5d9932"/>
            <rect x={x} y={s-bh-h*.38} width={s/8} height={h*.08} fill="#4a7a24"/>
          </g>
        )
      })}
      {/* Sky blocks */}
      {[{x:.1,y:.15},{x:.65,y:.12},{x:.35,y:.08}].map((d,i)=>(
        <rect key={i} x={s*d.x} y={s*d.y} width={h*.25} height={h*.12}
          fill="rgba(220,220,255,.18)" rx={0}/>
      ))}
      {/* Creeper face */}
      <rect x={h*.72} y={s*.38} width={h*.36} height={h*.36} rx={h*.02} fill="#3a8a3a"/>
      <rect x={h*.78} y={s*.44} width={h*.1} height={h*.1} fill="#0a0a0a"/>
      <rect x={h*.96} y={s*.44} width={h*.1} height={h*.1} fill="#0a0a0a"/>
      <rect x={h*.84} y={s*.54} width={h*.08} height={h*.08} fill="#0a0a0a"/>
      <rect x={h*.78} y={s*.62} width={h*.09} height={h*.07} fill="#0a0a0a"/>
      <rect x={h*.87} y={s*.62} width={h*.09} height={h*.07} fill="#0a0a0a"/>
    </g>
  )

  // ── AUTUMNLEAVES ──
  if (themeKey === 'autumnleaves') return (
    <g clipPath={clip}>
      {/* Sky */}
      <rect x={0} y={0} width={s} height={s*.55} fill="rgba(180,80,10,.2)"/>
      {/* Tree trunk */}
      <rect x={h*.86} y={h*.42} width={h*.28} height={h*.8} rx={h*.04} fill="#4a2c0a"/>
      {/* Branches */}
      <line x1={h} y1={h*.7} x2={h*.4} y2={h*.32} stroke="#3a2008" strokeWidth={h*.06}/>
      <line x1={h} y1={h*.6} x2={h*1.6} y2={h*.28} stroke="#3a2008" strokeWidth={h*.05}/>
      <line x1={h} y1={h*.8} x2={h*.3} y2={h*.7} stroke="#3a2008" strokeWidth={h*.04}/>
      {/* Leaf clusters */}
      <circle cx={h*.4} cy={h*.3} r={h*.2} fill="#e65100" opacity=".85"/>
      <circle cx={h*1.6} cy={h*.26} r={h*.18} fill="#bf360c" opacity=".85"/>
      <circle cx={h*.3} cy={h*.68} r={h*.14} fill="#fbc02d" opacity=".8"/>
      <circle cx={h} cy={h*.18} r={h*.16} fill="#ff7043" opacity=".75"/>
      {/* Falling leaves */}
      {[{x:.22,y:.55,r:30},{x:.68,y:.62,r:-45},{x:.44,y:.72,r:60}].map((d,i)=>(
        <ellipse key={i} cx={s*d.x} cy={s*d.y} rx={h*.07} ry={h*.04}
          fill={['#e65100','#fbc02d','#ff7043'][i]} opacity=".8"
          transform={`rotate(${d.r} ${s*d.x} ${s*d.y})`}/>
      ))}
      {/* Ground */}
      <ellipse cx={h} cy={s*.92} rx={h*.75} ry={h*.1} fill="#330e00"/>
    </g>
  )

  // ── DINOSAUR ──
  if (themeKey === 'dinosaur') return (
    <g clipPath={clip}>
      {/* Volcano */}
      <polygon points={`${h*.6},${s} ${h*1.05},${h*.22} ${h*1.5},${s}`} fill="#5d3a1a"/>
      <polygon points={`${h*.75},${s*.6} ${h*1.05},${h*.22} ${h*1.35},${s*.6}`} fill="#8b4513"/>
      <ellipse cx={h*1.05} cy={h*.24} rx={h*.12} ry={h*.06} fill="#ff3d00" opacity=".7"/>
      {/* Jungle ferns */}
      {[{x:0,y:.85,s:1},{x:.25,y:.8,s:.8},{x:.72,y:.88,s:.9},{x:.9,y:.82,s:.75}].map((d,i)=>(
        <g key={i} transform={`translate(${s*d.x},${s*d.y}) scale(${d.s})`}>
          <path d="M0,0 C-12,-20 -20,-18 -18,-10 C-15,-2 -8,-5 0,0 Z" fill="#2e7d32"/>
          <path d="M0,0 C12,-20 20,-18 18,-10 C15,-2 8,-5 0,0 Z" fill="#388e3c"/>
        </g>
      ))}
      {/* T-Rex silhouette small */}
      <g transform={`translate(${h*.28},${s*.68})`} opacity=".85">
        <rect x={-h*.08} y={-h*.14} width={h*.1} height={h*.14} rx={h*.02} fill="#33691e"/>
        <rect x={h*.02} y={-h*.2} width={h*.14} height={h*.08} rx={h*.02} fill="#33691e"/>
        <circle cx={h*.15} cy={-h*.2} r={h*.06} fill="#33691e"/>
        <rect x={-h*.14} y={0} width={h*.06} height={h*.12} rx={h*.02} fill="#33691e"/>
        <rect x={-h*.06} y={0} width={h*.06} height={h*.14} rx={h*.02} fill="#33691e"/>
        <path d={`M${h*.02},${-h*.2} L${h*.05},${-h*.12}`} stroke="#33691e" strokeWidth={h*.03}/>
      </g>
    </g>
  )

  // ── OCEAN ──
  if (themeKey === 'ocean') return (
    <g clipPath={clip}>
      {/* Water waves */}
      {[0,.18,.36,.54,.72,.88].map((y,i)=>(
        <path key={i} d={`M0,${s*y} Q${h*.5},${s*y-h*.06} ${h},${s*y} Q${h*1.5},${s*y+h*.06} ${s},${s*y}`}
          fill={`rgba(0,${80+i*15},${150+i*10},0.25)`}/>
      ))}
      {/* Fish */}
      {[{x:.25,y:.45},{x:.6,y:.32},{x:.78,y:.6}].map((d,i)=>(
        <g key={i} transform={`translate(${s*d.x},${s*d.y})`}>
          <ellipse rx={h*.1} ry={h*.06} fill={['#ff8a65','#4fc3f7','#fff176'][i]} opacity=".8"/>
          <path d={`M${-h*.1},0 L${-h*.17},${-h*.06} L${-h*.17},${h*.06} Z`} fill={['#ff7043','#29b6f6','#ffd54f'][i]} opacity=".8"/>
          <circle cx={h*.06} cy={-h*.01} r={h*.02} fill="#1a1a1a"/>
        </g>
      ))}
      {/* Coral */}
      <path d={`M${h*.4},${s*.88} L${h*.4},${s*.72} M${h*.34},${s*.8} L${h*.4},${s*.72} M${h*.46},${s*.78} L${h*.4},${s*.72}`}
        stroke="#ff80ab" strokeWidth={h*.04} strokeLinecap="round"/>
      <path d={`M${h*1.6},${s*.88} L${h*1.6},${s*.68} M${h*1.52},${s*.74} L${h*1.6},${s*.68} M${h*1.68},${s*.72} L${h*1.6},${s*.68}`}
        stroke="#ff8a65" strokeWidth={h*.04} strokeLinecap="round"/>
      {/* Bubbles */}
      {[{x:.58,y:.22},{x:.32,y:.28},{x:.72,y:.18}].map((d,i)=>(
        <circle key={i} cx={s*d.x} cy={s*d.y} r={h*.03}
          fill="none" stroke="rgba(150,220,255,.6)" strokeWidth={1.2}/>
      ))}
    </g>
  )

  // ── SHARK ──
  if (themeKey === 'shark') return (
    <g clipPath={clip}>
      {/* Deep ocean */}
      {[0,.2,.4,.6,.8].map((y,i)=>(
        <rect key={i} x={0} y={s*y} width={s} height={s*.22} fill={`rgba(0,${30+i*8},${60+i*12},.3)`}/>
      ))}
      {/* Shark fin */}
      <path d={`M${h*.42},${s*.52} L${h*.62},${s*.28} L${h*.78},${s*.52}`}
        fill="#607d8b"/>
      <ellipse cx={h*.6} cy={s*.58} rx={h*.52} ry={h*.22} fill="#546e7a" opacity=".9"/>
      <path d={`M${h*.08},${s*.58} L${h*.32},${s*.56} Q${h*.6},${s*.58} ${h*.88},${s*.56} L${h*1.12},${s*.58}`}
        stroke="rgba(255,255,255,.3)" strokeWidth={1.5} fill="none"/>
      {/* Eye */}
      <circle cx={h*.88} cy={s*.54} r={h*.04} fill="white"/>
      <circle cx={h*.88} cy={s*.54} r={h*.025} fill="#1a1a1a"/>
      {/* Teeth hint */}
      {[0,1,2,3,4].map(i=>(
        <polygon key={i} points={`${h*(.32+i*.08)},${s*.68} ${h*(.36+i*.08)},${s*.75} ${h*(.4+i*.08)},${s*.68}`}
          fill="white" opacity=".7"/>
      ))}
    </g>
  )

  // ── MERMAID ──
  if (themeKey === 'mermaid') return (
    <g clipPath={clip}>
      {/* Underwater gradient layers */}
      {[0,.25,.5,.75].map((y,i)=>(
        <rect key={i} x={0} y={s*y} width={s} height={s*.28}
          fill={`rgba(${20-i*4},${80+i*20},${[120,140,160,180][i]},.3)`}/>
      ))}
      {/* Mermaid silhouette */}
      <ellipse cx={h*.58} cy={h*.52} rx={h*.14} ry={h*.2} fill="#ff80ab" opacity=".85"/>
      <circle cx={h*.58} cy={h*.32} r={h*.12} fill="#ff80ab" opacity=".85"/>
      <path d={`M${h*.44},${h*.7} Q${h*.38},${h*.9} ${h*.28},${h*1.0} Q${h*.42},${h*.98} ${h*.52},${h*.86} L${h*.52},${h*.68} Z`}
        fill="#00bcd4" opacity=".8"/>
      <path d={`M${h*.52},${h*.68} L${h*.52},${h*.86} Q${h*.62},${h*.98} ${h*.76},${h*1.0} Q${h*.66},${h*.9} ${h*.6},${h*.7} Z`}
        fill="#26c6da" opacity=".8"/>
      {/* Hair */}
      <ellipse cx={h*.52} cy={h*.3} rx={h*.16} ry={h*.14} fill="#ffd54f" transform={`rotate(-15 ${h*.52} ${h*.3})`}/>
      {/* Shells and bubbles */}
      {[{x:.7,y:.4},{x:.38,y:.45},{x:.8,y:.6}].map((d,i)=>(
        <circle key={i} cx={s*d.x} cy={s*d.y} r={h*.03}
          fill="none" stroke="rgba(150,240,255,.55)" strokeWidth={1}/>
      ))}
      <ellipse cx={h*1.5} cy={s*.72} rx={h*.1} ry={h*.07} fill="#e040fb" opacity=".6" transform={`rotate(20 ${h*1.5} ${s*.72})`}/>
      <ellipse cx={h*.28} cy={s*.82} rx={h*.12} ry={h*.08} fill="#4dd0e1" opacity=".6" transform={`rotate(-15 ${h*.28} ${s*.82})`}/>
    </g>
  )

  // ── MONSOON ──
  if (themeKey === 'monsoon') return (
    <g clipPath={clip}>
      {/* Dark clouds */}
      <ellipse cx={h*.5} cy={h*.3} rx={h*.5} ry={h*.2} fill="#37474f" opacity=".9"/>
      <ellipse cx={h*.8} cy={h*.25} rx={h*.4} ry={h*.18} fill="#455a64" opacity=".85"/>
      <ellipse cx={h*1.4} cy={h*.32} rx={h*.44} ry={h*.2} fill="#546e7a" opacity=".85"/>
      <ellipse cx={h} cy={h*.36} rx={h*.55} ry={h*.18} fill="#607d8b" opacity=".8"/>
      {/* Lightning */}
      <path d={`M${h*.88},${h*.5} L${h*.82},${h*.68} L${h*.9},${h*.68} L${h*.84},${h*.88}`}
        stroke="#ffee58" strokeWidth={h*.04} fill="none" strokeLinecap="round"/>
      {/* Rain drops */}
      {Array.from({length:18},(_,i)=>{
        const x=(i*1373+7)%80+10, y=(i*2741+13)%60+35
        return <line key={i} x1={s*x/100} y1={s*y/100} x2={s*x/100+2} y2={s*y/100+h*.14}
          stroke="rgba(100,160,220,.55)" strokeWidth={.8} strokeLinecap="round"/>
      })}
      {/* Puddle ripple */}
      {[.12,.22,.34].map((r,i)=>(
        <ellipse key={i} cx={h} cy={s*.9} rx={h*r} ry={h*r*.35}
          fill="none" stroke="rgba(100,180,220,.35)" strokeWidth={.8}/>
      ))}
    </g>
  )

  // ── CANDY ──
  if (themeKey === 'candy') return (
    <g clipPath={clip}>
      {/* Candy landscape */}
      <ellipse cx={h*.35} cy={s*.78} rx={h*.28} ry={h*.22} fill="#c2185b" opacity=".8"/>
      <ellipse cx={h*.35} cy={s*.72} rx={h*.22} ry={h*.16} fill="#e91e63" opacity=".85"/>
      <ellipse cx={h*1.65} cy={s*.8} rx={h*.24} ry={h*.2} fill="#7b1fa2" opacity=".8"/>
      <ellipse cx={h*1.65} cy={s*.74} rx={h*.18} ry={h*.14} fill="#9c27b0" opacity=".85"/>
      {/* Candy canes */}
      {[{x:.5,col:'#e91e63'},{x:.72,col:'#f06292'}].map((d,i)=>(
        <g key={i} transform={`translate(${s*d.x},${s*.72})`}>
          <line x1={0} y1={0} x2={0} y2={-h*.5} stroke="white" strokeWidth={h*.07} strokeLinecap="round"/>
          <line x1={0} y1={0} x2={0} y2={-h*.5} stroke={d.col} strokeWidth={h*.07}
            strokeDasharray={`${h*.06} ${h*.06}`} strokeLinecap="round"/>
          <path d={`M0,${-h*.5} Q${h*.12},${-h*.62} ${h*.12},${-h*.5}`}
            stroke="white" strokeWidth={h*.07} fill="none" strokeLinecap="round"/>
        </g>
      ))}
      {/* Lollipop */}
      <circle cx={h*.8} cy={s*.38} r={h*.14} fill="#ff4081"/>
      <circle cx={h*.8} cy={s*.38} r={h*.1} fill="#f8bbd0"/>
      <line x1={h*.8} y1={s*.52} x2={h*.82} y2={s*.75} stroke="#f8bbd0" strokeWidth={h*.05} strokeLinecap="round"/>
      {/* Sprinkles */}
      {[{x:.2,y:.42,c:'#ffd600'},{x:.55,y:.28,c:'#00e5ff'},{x:.88,y:.55,c:'#ff6b6b'},{x:.38,y:.6,c:'#b967ff'}].map((d,i)=>(
        <rect key={i} x={s*d.x} y={s*d.y} width={h*.1} height={h*.03} rx={h*.015}
          fill={d.c} transform={`rotate(${i*40} ${s*d.x} ${s*d.y})`}/>
      ))}
    </g>
  )

  // ── BUBBLEGUM ──
  if (themeKey === 'bubblegum') return (
    <g clipPath={clip}>
      {/* Pink clouds / gum mounds */}
      {[{cx:.3,cy:.78,rx:.3,ry:.2},{cx:.72,cy:.82,rx:.28,ry:.18},{cx:.55,cy:.72,rx:.25,ry:.16}].map((e,i)=>(
        <ellipse key={i} cx={s*e.cx} cy={s*e.cy} rx={h*e.rx} ry={h*e.ry} fill={['#f8bbd0','#f48fb1','#fce4ec'][i]}/>
      ))}
      {/* Bubbles */}
      {[{x:.28,y:.32,r:.12},{x:.55,y:.22,r:.16},{x:.78,y:.38,r:.1},{x:.16,y:.5,r:.08},{x:.82,y:.62,r:.09}].map((d,i)=>(
        <g key={i}>
          <circle cx={s*d.x} cy={s*d.y} r={h*d.r} fill="rgba(248,187,208,.35)" stroke="#f48fb1" strokeWidth={1.2}/>
          <circle cx={s*d.x-h*d.r*.3} cy={s*d.y-h*d.r*.3} r={h*d.r*.25} fill="rgba(255,255,255,.5)"/>
        </g>
      ))}
      {/* Gum ball machine */}
      <circle cx={h*1.6} cy={s*.48} r={h*.18} fill="#e91e63" opacity=".7"/>
      <rect x={h*1.46} y={s*.65} width={h*.28} height={h*.2} rx={h*.04} fill="#c2185b" opacity=".7"/>
      <rect x={h*1.52} y={s*.84} width={h*.16} height={h*.1} rx={h*.04} fill="#ad1457" opacity=".7"/>
    </g>
  )

  // ── ICECREAM ──
  if (themeKey === 'icecream') return (
    <g clipPath={clip}>
      {/* Background scoops */}
      <circle cx={h*.42} cy={h*.82} r={h*.24} fill="#fff9c4" opacity=".85"/>
      <circle cx={h*.62} cy={h*.72} r={h*.26} fill="#f8bbd0" opacity=".85"/>
      <circle cx={h*.84} cy={h*.82} r={h*.22} fill="#b3e5fc" opacity=".85"/>
      {/* Cone */}
      <path d={`M${h*.36},${s*.7} L${h*.62},${s*.96} L${h*.88},${s*.7} Z`} fill="#ffe0b2"/>
      <path d={`M${h*.38},${s*.72} L${h*.62},${s*.94} L${h*.62},${s*.7} Z`} fill="rgba(0,0,0,.08)"/>
      {/* Grid on cone */}
      {[.75,.82,.89].map((y,i)=>(
        <line key={i} x1={h*(.36+(y-.7)*1.5)} y1={s*y} x2={h*(.88-(y-.7)*1.5)} y2={s*y}
          stroke="rgba(255,160,50,.4)" strokeWidth={.8}/>
      ))}
      {/* Cherry */}
      <circle cx={h*.62} cy={h*.46} r={h*.07} fill="#e53935"/>
      <line x1={h*.62} y1={h*.39} x2={h*.65} y2={h*.32} stroke="#388e3c" strokeWidth={1.2}/>
      {/* Sprinkles on top scoop */}
      {[{x:.56,y:.65,c:'#f06292'},{x:.62,y:.6,c:'#ffd600'},{x:.7,y:.66,c:'#00bcd4'},{x:.64,y:.72,c:'#ff6b6b'}].map((d,i)=>(
        <rect key={i} x={s*d.x} y={s*d.y} width={h*.1} height={h*.03} rx={h*.015} fill={d.c}
          transform={`rotate(${i*45} ${s*d.x} ${s*d.y})`}/>
      ))}
    </g>
  )

  // ── PIZZA ──
  if (themeKey === 'pizza') return (
    <g clipPath={clip}>
      {/* Pizza planet */}
      <circle cx={h} cy={h*.6} r={h*.55} fill="#ffd54f"/>
      <circle cx={h} cy={h*.6} r={h*.47} fill="#ff7043"/>
      <circle cx={h} cy={h*.6} r={h*.42} fill="#ffcc02"/>
      {/* Cheese blobs */}
      {[{x:.42,y:.44},{x:.62,y:.38},{x:.52,y:.58},{x:.72,y:.52},{x:.38,y:.64}].map((d,i)=>(
        <ellipse key={i} cx={s*d.x} cy={s*d.y} rx={h*.06} ry={h*.05} fill="#fff9c4" opacity=".9"/>
      ))}
      {/* Pepperoni */}
      {[{x:.46,y:.52},{x:.65,y:.48},{x:.54,y:.66},{x:.72,y:.62}].map((d,i)=>(
        <circle key={i} cx={s*d.x} cy={s*d.y} r={h*.055} fill="#c62828" opacity=".9"/>
      ))}
      {/* Pizza slice cut */}
      <line x1={h} y1={h*.6} x2={h} y2={h*.05} stroke="rgba(200,100,0,.35)" strokeWidth={1.5}/>
      <line x1={h} y1={h*.6} x2={h*.1} y2={h*1.02} stroke="rgba(200,100,0,.35)" strokeWidth={1.5}/>
      {/* Crust */}
      <path d={`M${h*.45},${h*.06} A${h*.55} ${h*.55} 0 0 1 ${h*1.55},${h*.06}`}
        stroke="#d84315" strokeWidth={h*.09} fill="none" strokeLinecap="round" opacity=".9"/>
    </g>
  )

  // ── DONUT ──
  if (themeKey === 'donut') return (
    <g clipPath={clip}>
      {/* Background donuts */}
      {[{cx:.32,cy:.72,c:'#f06292'},{cx:.72,cy:.78,c:'#4dd0e1'},{cx:.55,cy:.6,c:'#ffd600'}].map((d,i)=>(
        <g key={i}>
          <circle cx={s*d.cx} cy={s*d.cy} r={h*.18} fill={d.c} opacity=".75"/>
          <circle cx={s*d.cx} cy={s*d.cy} r={h*.08} fill={ZONE_BG['donut']}/>
        </g>
      ))}
      {/* Main donut */}
      <circle cx={h} cy={h*.48} r={h*.32} fill="#ff7043"/>
      <circle cx={h} cy={h*.48} r={h*.14} fill={ZONE_BG['donut']}/>
      {/* Glaze drips */}
      <path d={`M${h-h*.18},${h*.3} Q${h-h*.22},${h*.22} ${h-h*.1},${h*.22} Q${h+h*.08},${h*.22} ${h+h*.18},${h*.3}`}
        fill="#f48fb1" strokeWidth={0}/>
      {[{x:.42,y:.22,c:'#ffd600'},{x:.55,y:.2,c:'#00e5ff'},{x:.65,y:.24,c:'#ff6b6b'},{x:.38,y:.27,c:'#b967ff'}].map((d,i)=>(
        <rect key={i} x={s*d.x} y={s*d.y} width={h*.09} height={h*.03} rx={h*.015} fill={d.c}
          transform={`rotate(${i*50} ${s*d.x} ${s*d.y})`}/>
      ))}
    </g>
  )

  // ── CORAL (warm sunny default) ──
  if (themeKey === 'coral') return (
    <g clipPath={clip}>
      <rect x={0} y={0} width={s} height={s*.5} fill="rgba(255,120,40,.2)"/>
      <ellipse cx={h} cy={h*.42} rx={h*.28} ry={h*.28} fill="#ffd700" opacity=".8"/>
      {[0,45,90,135,180,225,270,315].map((a,i)=>(
        <line key={i} x1={h} y1={h*.42} x2={h+Math.cos(a*Math.PI/180)*h*.44} y2={h*.42+Math.sin(a*Math.PI/180)*h*.44}
          stroke="rgba(255,200,50,.5)" strokeWidth={h*.04} strokeLinecap="round"/>
      ))}
      <path d={`M0,${s*.65} Q${h*.5},${s*.55} ${h},${s*.62} Q${h*1.5},${s*.68} ${s},${s*.6} L${s},${s} L0,${s} Z`}
        fill="#1a4d10"/>
      {[{x:.2,y:.72},{x:.5,y:.68},{x:.8,y:.74}].map((d,i)=>(
        <ellipse key={i} cx={s*d.x} cy={s*d.y} rx={h*.1} ry={h*.06}
          fill={['#ff8a65','#ffb74d','#ff7043'][i]}/>
      ))}
    </g>
  )

  // ── SUNSHINE ──
  if (themeKey === 'sunshine') return (
    <g clipPath={clip}>
      {/* Bright sky */}
      <rect x={0} y={0} width={s} height={s} fill="rgba(255,220,80,.15)"/>
      {/* Sun */}
      <circle cx={h} cy={h*.45} r={h*.28} fill="#ffd600" opacity=".9"/>
      <circle cx={h} cy={h*.45} r={h*.22} fill="#ffee58"/>
      {[0,30,60,90,120,150,180,210,240,270,300,330].map((a,i)=>(
        <line key={i} x1={h+Math.cos(a*Math.PI/180)*h*.28} y1={h*.45+Math.sin(a*Math.PI/180)*h*.28}
          x2={h+Math.cos(a*Math.PI/180)*h*.42} y2={h*.45+Math.sin(a*Math.PI/180)*h*.42}
          stroke="#ffd600" strokeWidth={h*.04} strokeLinecap="round"/>
      ))}
      {/* Happy sun face */}
      <circle cx={h-h*.08} cy={h*.42} r={h*.04} fill="#e65100"/>
      <circle cx={h+h*.08} cy={h*.42} r={h*.04} fill="#e65100"/>
      <path d={`M${h-h*.1},${h*.52} Q${h},${h*.6} ${h+h*.1},${h*.52}`}
        stroke="#e65100" strokeWidth={h*.03} fill="none"/>
      {/* Rainbow */}
      {[.42,.48,.54,.6].map((r,i)=>(
        <path key={i} d={`M${h*.02},${s*.75} A${h*r} ${h*r} 0 0 1 ${h*1.98},${s*.75}`}
          stroke={['#ff0000','#ff9800','#ffd600','#4caf50'][i]}
          strokeWidth={h*.06} fill="none" strokeLinecap="round" opacity=".85"/>
      ))}
      <path d={`M${h*.12},${s*.75} A${h*.36} ${h*.36} 0 0 1 ${h*1.88},${s*.75}`}
        stroke="#2196f3" strokeWidth={h*.06} fill="none" strokeLinecap="round" opacity=".85"/>
    </g>
  )

  // ── LION ──
  if (themeKey === 'lion') return (
    <g clipPath={clip}>
      {/* Savanna sky */}
      <rect x={0} y={0} width={s} height={s*.55} fill="rgba(255,130,30,.2)"/>
      {/* Acacia tree silhouette */}
      <rect x={h*1.5} y={h*.5} width={h*.08} height={h*.7} rx={h*.02} fill="#3e2723"/>
      <ellipse cx={h*1.54} cy={h*.44} rx={h*.3} ry={h*.14} fill="#2e7d32" opacity=".85"/>
      {/* Sun setting */}
      <circle cx={h*.3} cy={h*.35} r={h*.2} fill="#ff8f00" opacity=".9"/>
      {/* Lion face */}
      <circle cx={h*.74} cy={h*.58} r={h*.32} fill="#f9a825" opacity=".85"/>
      <circle cx={h*.74} cy={h*.52} r={h*.22} fill="#ffb300"/>
      {/* Mane */}
      {[0,30,60,90,120,150,180,210,240,270,300,330].map((a,i)=>(
        <line key={i}
          x1={h*.74+Math.cos(a*Math.PI/180)*h*.22} y1={h*.52+Math.sin(a*Math.PI/180)*h*.22}
          x2={h*.74+Math.cos(a*Math.PI/180)*h*.32} y2={h*.52+Math.sin(a*Math.PI/180)*h*.32}
          stroke="#e65100" strokeWidth={h*.05} strokeLinecap="round"/>
      ))}
      {/* Face details */}
      <circle cx={h*.69} cy={h*.5} r={h*.04} fill="#4e342e"/>
      <circle cx={h*.8} cy={h*.5} r={h*.04} fill="#4e342e"/>
      <ellipse cx={h*.74} cy={h*.58} rx={h*.06} ry={h*.04} fill="#ff8a65"/>
      <path d={`M${h*.68},${h*.62} Q${h*.74},${h*.68} ${h*.8},${h*.62}`}
        stroke="#4e342e" strokeWidth={h*.025} fill="none"/>
      {/* Grass */}
      <rect x={0} y={s*.8} width={s} height={s*.2} fill="#2e7d32" opacity=".7"/>
    </g>
  )

  // ── UNICORN ──
  if (themeKey === 'unicorn') return (
    <g clipPath={clip}>
      {/* Rainbow sky */}
      {[.62,.68,.74,.80].map((r,i)=>(
        <path key={i} d={`M${-h*.1},${s*.88} A${h*r} ${h*r} 0 0 1 ${s+h*.1},${s*.88}`}
          stroke={['#ff6b6b','#ffd600','#00e5ff','#b967ff'][i]}
          strokeWidth={h*.09} fill="none" opacity=".55"/>
      ))}
      {/* Clouds */}
      {[{cx:.28,cy:.3},{cx:.72,cy:.25}].map((d,i)=>(
        <g key={i}>
          <ellipse cx={s*d.cx} cy={s*d.cy} rx={h*.22} ry={h*.12} fill="rgba(255,255,255,.6)"/>
          <ellipse cx={s*d.cx-h*.08} cy={s*d.cy-h*.04} rx={h*.12} ry={h*.1} fill="rgba(255,255,255,.6)"/>
          <ellipse cx={s*d.cx+h*.1} cy={s*d.cy-h*.02} rx={h*.14} ry={h*.09} fill="rgba(255,255,255,.6)"/>
        </g>
      ))}
      {/* Unicorn head */}
      <circle cx={h} cy={h*.55} r={h*.24} fill="white" opacity=".95"/>
      {/* Horn */}
      <path d={`M${h-h*.04},${h*.34} L${h},${h*.14} L${h+h*.04},${h*.34}`}
        fill="#ffd600" stroke="#ffc107" strokeWidth={.5}/>
      <line x1={h-h*.02} y1={h*.28} x2={h+h*.02} y2={h*.28} stroke="#ffc107" strokeWidth={.8}/>
      <line x1={h-h*.03} y1={h*.22} x2={h+h*.03} y2={h*.22} stroke="#ffc107" strokeWidth={.8}/>
      {/* Mane */}
      <path d={`M${h-h*.24},${h*.5} Q${h-h*.28},${h*.28} ${h-h*.16},${h*.24} Q${h-h*.08},${h*.34} ${h-h*.2},${h*.44}`}
        fill="#ff80ab" opacity=".85"/>
      <path d={`M${h-h*.24},${h*.52} Q${h-h*.32},${h*.36} ${h-h*.18},${h*.3} Q${h-h*.08},${h*.38} ${h-h*.22},${h*.48}`}
        fill="#ce93d8" opacity=".75"/>
      {/* Eye */}
      <circle cx={h+h*.08} cy={h*.55} r={h*.055} fill="#4a148c"/>
      <circle cx={h+h*.09} cy={h*.53} r={h*.022} fill="white"/>
      <path d={`M${h},${h*.66} Q${h+h*.08},${h*.72} ${h+h*.16},${h*.66}`}
        stroke="#ff80ab" strokeWidth={h*.025} fill="none"/>
    </g>
  )

  // ── STORYMAGIC ──
  if (themeKey === 'storymagic') return (
    <g clipPath={clip}>
      {/* Magic book open */}
      <path d={`M${h*.3},${h*.4} Q${h*.3},${h*.3} ${h},${h*.32} Q${h*.7},${h*.3} ${h*.7},${h*.4} L${h*.7},${h*.78} Q${h*.7},${h*.88} ${h},${h*.86} Q${h*.3},${h*.88} ${h*.3},${h*.78} Z`}
        fill="#f3e5f5" opacity=".9"/>
      <line x1={h} y1={h*.32} x2={h} y2={h*.86} stroke="#ce93d8" strokeWidth={1.5}/>
      {/* Magic text lines */}
      {[.44,.54,.64,.74].map((y,i)=>(
        <line key={i} x1={h*.38+(i%2)*2} y1={s*y} x2={h*.62-(i%2)*2} y2={s*y}
          stroke={['#ab47bc','#7e57c2','#ab47bc','#7e57c2'][i]} strokeWidth={1.5} strokeLinecap="round"/>
      ))}
      {/* Stars from book */}
      {[{x:.22,y:.3},{x:.72,y:.25},{x:.15,y:.48},{x:.8,y:.44},{x:.5,y:.18}].map((d,i)=>(
        <path key={i} d={`M${s*d.x},${s*d.y-h*.07} L${s*d.x+h*.02},${s*d.y} L${s*d.x+h*.07},${s*d.y} L${s*d.x+h*.03},${s*d.y+h*.04} L${s*d.x+h*.05},${s*d.y+h*.09} L${s*d.x},${s*d.y+h*.06} L${s*d.x-h*.05},${s*d.y+h*.09} L${s*d.x-h*.03},${s*d.y+h*.04} L${s*d.x-h*.07},${s*d.y} L${s*d.x-h*.02},${s*d.y} Z`}
          fill={['#ffd600','#ce93d8','#ff80ab','#80cbc4','#ffd600'][i]} opacity=".8"/>
      ))}
      {/* Wand */}
      <line x1={h*1.52} y1={h*.4} x2={h*1.8} y2={h*.7} stroke="#7e57c2" strokeWidth={h*.05} strokeLinecap="round"/>
      <circle cx={h*1.52} cy={h*.4} r={h*.06} fill="#ffd600"/>
    </g>
  )

  // ── WORDWIZARD ──
  if (themeKey === 'wordwizard') return (
    <g clipPath={clip}>
      {/* Library shelves */}
      <rect x={0} y={s*.38} width={s} height={s*.04} fill="#5d4037"/>
      <rect x={0} y={s*.6} width={s} height={s*.04} fill="#5d4037"/>
      <rect x={0} y={s*.82} width={s} height={s*.04} fill="#5d4037"/>
      {/* Books on shelves */}
      {[[0,6,'#e91e63'],[6,10,'#2196f3'],[10,16,'#4caf50'],[16,20,'#ff9800'],
        [20,26,'#9c27b0'],[26,30,'#f44336'],[30,36,'#00bcd4'],[36,40,'#ff5722']].map(([x,x2,c],i)=>(
        <rect key={i} x={s*x/40} y={s*.42} width={s*(x2-x)/40} height={s*.18}
          fill={c} opacity=".75" rx={1}/>
      ))}
      {/* Floating letters */}
      {[{c:'A',x:.2,y:.25},{c:'Z',x:.55,y:.18},{c:'∞',x:.8,y:.28},{c:'✦',x:.38,y:.32}].map((d,i)=>(
        <text key={i} x={s*d.x} y={s*d.y} textAnchor="middle" fontSize={h*.18}
          fill={color} opacity=".8" fontWeight="bold">{d.c}</text>
      ))}
      {/* Owl */}
      <circle cx={h*1.7} cy={s*.38} r={h*.12} fill="#795548"/>
      <circle cx={h*1.63} cy={s*.34} r={h*.05} fill="#ffee58"/>
      <circle cx={h*1.77} cy={s*.34} r={h*.05} fill="#ffee58"/>
      <circle cx={h*1.63} cy={s*.34} r={h*.03} fill="#1a1a1a"/>
      <circle cx={h*1.77} cy={s*.34} r={h*.03} fill="#1a1a1a"/>
    </g>
  )

  // ── GOLDSTAR ──
  if (themeKey === 'goldstar') return (
    <g clipPath={clip}>
      {/* Trophy base */}
      <rect x={h*.72} y={h*.96} width={h*.56} height={h*.14} rx={h*.04} fill="#f57f17"/>
      <rect x={h*.84} y={h*.84} width={h*.32} height={h*.14} fill="#f57f17"/>
      {/* Trophy cup */}
      <path d={`M${h*.58},${h*.38} Q${h*.48},${h*.6} ${h*.54},${h*.86} L${h*1.46},${h*.86} Q${h*1.52},${h*.6} ${h*1.42},${h*.38} Z`}
        fill="#ffd600"/>
      <path d={`M${h*.58},${h*.38} Q${h*.48},${h*.6} ${h*.54},${h*.86} L${h*.62},${h*.86} Q${h*.56},${h*.6} ${h*.66},${h*.38} Z`}
        fill="#f9a825"/>
      {/* Handles */}
      <path d={`M${h*.58},${h*.5} Q${h*.38},${h*.5} ${h*.38},${h*.64} Q${h*.38},${h*.78} ${h*.58},${h*.78}`}
        stroke="#ffd600" strokeWidth={h*.06} fill="none"/>
      <path d={`M${h*1.42},${h*.5} Q${h*1.62},${h*.5} ${h*1.62},${h*.64} Q${h*1.62},${h*.78} ${h*1.42},${h*.78}`}
        stroke="#ffd600" strokeWidth={h*.06} fill="none"/>
      {/* Star in trophy */}
      <path d={`M${h},${h*.48} L${h+h*.07},${h*.63} L${h+h*.24},${h*.65} L${h+h*.12},${h*.76} L${h+h*.15},${h*.93} L${h},${h*.85} L${h-h*.15},${h*.93} L${h-h*.12},${h*.76} L${h-h*.24},${h*.65} L${h-h*.07},${h*.63} Z`}
        fill="#fff9c4"/>
      {/* Stars background */}
      {[{x:.18,y:.22},{x:.5,y:.14},{x:.82,y:.2},{x:.3,y:.38},{x:.72,y:.32}].map((d,i)=>(
        <path key={i} d={`M${s*d.x},${s*d.y-h*.07} L${s*d.x+h*.02},${s*d.y-h*.01} L${s*d.x+h*.07},${s*d.y} L${s*d.x+h*.03},${s*d.y+h*.04} L${s*d.x+h*.04},${s*d.y+h*.1} L${s*d.x},${s*d.y+h*.07} L${s*d.x-h*.04},${s*d.y+h*.1} L${s*d.x-h*.03},${s*d.y+h*.04} L${s*d.x-h*.07},${s*d.y} L${s*d.x-h*.02},${s*d.y-h*.01} Z`}
          fill="#ffd600" opacity={.5-(i*.06)}/>
      ))}
    </g>
  )

  // ── RANGOLI ──
  if (themeKey === 'rangoli') return (
    <g clipPath={clip}>
      {/* Rangoli geometric pattern */}
      {[0,45,90,135,180,225,270,315].map((a,i)=>{
        const r1=h*.22, r2=h*.5, rad=a*Math.PI/180
        return (
          <g key={i}>
            <line x1={h+Math.cos(rad)*r1} y1={h*.6+Math.sin(rad)*r1}
              x2={h+Math.cos(rad)*r2} y2={h*.6+Math.sin(rad)*r2}
              stroke={['#e91e63','#ff9800','#ffd600','#4caf50','#2196f3','#9c27b0','#ff5722','#00bcd4'][i]}
              strokeWidth={h*.04} strokeLinecap="round"/>
            <circle cx={h+Math.cos(rad)*r2} cy={h*.6+Math.sin(rad)*r2}
              r={h*.04} fill={['#ff4081','#ffa726','#ffee58','#66bb6a','#42a5f5','#ba68c8','#ff7043','#4dd0e1'][i]}/>
          </g>
        )
      })}
      {/* Inner rings */}
      {[.12,.22,.32].map((r,i)=>(
        <circle key={i} cx={h} cy={h*.6} r={h*r}
          fill="none" stroke={['#ffd600','#e91e63','#2196f3'][i]} strokeWidth={1.5} strokeOpacity=".7"/>
      ))}
      {/* Center dot */}
      <circle cx={h} cy={h*.6} r={h*.06} fill="#ffd600"/>
      {/* Petal shapes between arms */}
      {[22.5,67.5,112.5,157.5,202.5,247.5,292.5,337.5].map((a,i)=>{
        const rad=a*Math.PI/180, r=h*.36
        return <ellipse key={i} cx={h+Math.cos(rad)*r} cy={h*.6+Math.sin(rad)*r}
          rx={h*.07} ry={h*.04} fill={['#ff80ab','#ffcc80','#a5d6a7','#90caf9','#ce93d8','#ffab91','#80deea','#fff9c4'][i]}
          opacity=".8" transform={`rotate(${a} ${h+Math.cos(rad)*r} ${h*.6+Math.sin(rad)*r})`}/>
      })}
    </g>
  )

  // ── KOLAM ──
  if (themeKey === 'kolam') return (
    <g clipPath={clip}>
      {/* Kolam dot grid */}
      {Array.from({length:5},(_,row)=>Array.from({length:5},(_,col)=>{
        const x=h*.3+(col*(h*.35)), y=h*.28+(row*(h*.25))
        return <circle key={`${row}-${col}`} cx={x} cy={y} r={h*.025} fill="white" opacity=".7"/>
      }))}
      {/* Kolam connecting curves */}
      <path d={`M${h*.3},${h*.28} Q${h*.65},${h*.18} ${h*1.0},${h*.28} Q${h*1.1},${h*.53} ${h*1.0},${h*.78} Q${h*.65},${h*.88} ${h*.3},${h*.78} Q${h*.2},${h*.53} ${h*.3},${h*.28}`}
        fill="none" stroke="rgba(255,255,255,.55)" strokeWidth={1.5}/>
      <path d={`M${h*.47},${h*.28} Q${h*.65},${h*.36} ${h*.83},${h*.28} Q${h*.9},${h*.53} ${h*.83},${h*.78} Q${h*.65},${h*.7} ${h*.47},${h*.78} Q${h*.4},${h*.53} ${h*.47},${h*.28}`}
        fill="none" stroke="rgba(200,150,255,.6)" strokeWidth={1.5}/>
      {/* Lotus */}
      {[0,60,120,180,240,300].map((a,i)=>{
        const rad=a*Math.PI/180, r=h*.18
        return <ellipse key={i} cx={h+Math.cos(rad)*r} cy={h*.92+Math.sin(rad)*r}
          rx={h*.09} ry={h*.05}
          fill={['#ff80ab','#f48fb1','#fce4ec','#ffcdd2','#ff80ab','#f48fb1'][i]}
          opacity=".8" transform={`rotate(${a} ${h+Math.cos(rad)*r} ${h*.92+Math.sin(rad)*r})`}/>
      })}
      <circle cx={h} cy={h*.92} r={h*.06} fill="#ffd600"/>
    </g>
  )

  // ── FAIRYGARDEN ──
  if (themeKey === 'fairygarden') return (
    <g clipPath={clip}>
      {/* Garden floor */}
      <ellipse cx={h} cy={s*.88} rx={h*.85} ry={h*.15} fill="#2e7d32" opacity=".8"/>
      {/* Mushrooms */}
      <ellipse cx={h*.28} cy={s*.82} rx={h*.14} ry={h*.07} fill="#e53935" opacity=".9"/>
      <rect x={h*.24} y={s*.76} width={h*.08} height={h*.12} rx={h*.02} fill="#f5f5f5"/>
      {[{cx:.25,cy:.77},{cx:.28,cy:.75},{cx:.31,cy:.77}].map((d,i)=>(
        <circle key={i} cx={s*d.cx} cy={s*d.cy} r={h*.022} fill="white" opacity=".8"/>
      ))}
      {/* Flower field */}
      {[{x:.5,y:.82,c:'#ffd600'},{x:.62,y:.8,c:'#ff80ab'},{x:.72,y:.83,c:'#80cbc4'},{x:.42,y:.81,c:'#ce93d8'}].map((d,i)=>(
        <g key={i}>
          <line x1={s*d.x} y1={s*d.y} x2={s*d.x} y2={s*d.y-h*.14} stroke="#388e3c" strokeWidth={1.5}/>
          <circle cx={s*d.x} cy={s*d.y-h*.14} r={h*.05} fill={d.c}/>
        </g>
      ))}
      {/* Fairy */}
      <circle cx={h*1.52} cy={h*.38} r={h*.08} fill="#ffcdd2"/>
      {/* Wings */}
      <ellipse cx={h*1.38} cy={h*.42} rx={h*.12} ry={h*.07} fill="rgba(150,220,255,.6)" transform={`rotate(-30 ${h*1.38} ${h*.42})`}/>
      <ellipse cx={h*1.66} cy={h*.42} rx={h*.12} ry={h*.07} fill="rgba(150,220,255,.6)" transform={`rotate(30 ${h*1.66} ${h*.42})`}/>
      {/* Sparkles */}
      {[{x:.62,y:.28},{x:.78,y:.22},{x:.52,y:.22}].map((d,i)=>(
        <circle key={i} cx={s*d.x} cy={s*d.y} r={h*.025}
          fill="#ffd600" style={{animation:`hub-twinkle ${1.5+i*.3}s ${i*.2}s ease-in-out infinite`}}/>
      ))}
    </g>
  )

  // ── CHERRYBLOSSOM ──
  if (themeKey === 'cherryblossom') return (
    <g clipPath={clip}>
      {/* Sky */}
      <rect x={0} y={0} width={s} height={s} fill="rgba(255,200,210,.1)"/>
      {/* Tree trunk */}
      <path d={`M${h*.86},${s} Q${h*.88},${h*.72} ${h*.78},${h*.5} Q${h*.88},${h*.56} ${h*1.0},${h*.44}`}
        stroke="#5d4037" strokeWidth={h*.1} fill="none" strokeLinecap="round"/>
      <path d={`M${h*.86},${s} Q${h*.9},${h*.7} ${h*1.02},${h*.52}`}
        stroke="#4e342e" strokeWidth={h*.08} fill="none" strokeLinecap="round"/>
      {/* Blossom clusters */}
      {[{cx:.78,cy:.5,r:.22},{cx:.5,cy:.34,r:.2},{cx:.28,cy:.44,r:.18},{cx:.12,cy:.62,r:.16}].map((d,i)=>(
        <g key={i}>
          <circle cx={s*d.cx} cy={s*d.cy} r={h*d.r} fill="#f8bbd0" opacity=".8"/>
          <circle cx={s*d.cx-h*.05} cy={s*d.cy-h*.06} r={h*d.r*.65} fill="#f48fb1" opacity=".7"/>
        </g>
      ))}
      {/* Falling petals */}
      {[{x:.22,y:.28},{x:.45,y:.2},{x:.62,y:.18},{x:.72,y:.32},{x:.36,y:.42},{x:.55,y:.38}].map((d,i)=>(
        <ellipse key={i} cx={s*d.x} cy={s*d.y} rx={h*.04} ry={h*.025}
          fill={i%2===0?'#f8bbd0':'#fce4ec'} opacity=".75"
          transform={`rotate(${i*35} ${s*d.x} ${s*d.y})`}/>
      ))}
    </g>
  )

  // ── PRINCESS ──
  if (themeKey === 'princess') return (
    <g clipPath={clip}>
      {/* Castle */}
      <rect x={h*.2} y={h*.38} width={h*1.6} height={h*.86} fill="#e1bee7" opacity=".8"/>
      {/* Towers */}
      {[{x:.2,w:.26,h:.76},{x:.74,w:.26,h:.86},{x:1.24,w:.26,h:.72}].map((t,i)=>(
        <g key={i}>
          <rect x={h*t.x} y={s-h*t.h} width={h*t.w} height={h*t.h} fill="#ce93d8" opacity=".85"/>
          <polygon points={`${h*t.x},${s-h*t.h} ${h*(t.x+t.w/2)},${s-h*t.h-h*.2} ${h*(t.x+t.w)},${s-h*t.h}`}
            fill="#ab47bc"/>
          {/* Battlements */}
          {[0,1,2].map(j=>(
            <rect key={j} x={h*(t.x+j*.07)} y={s-h*t.h-h*.04} width={h*.04} height={h*.07}
              fill="#ce93d8" opacity=".85"/>
          ))}
        </g>
      ))}
      {/* Main door arch */}
      <path d={`M${h*.78},${s*.94} L${h*.78},${s*.72} Q${h},${s*.6} ${h*1.22},${s*.72} L${h*1.22},${s*.94}`}
        fill="#f3e5f5"/>
      {/* Window */}
      <circle cx={h} cy={s*.58} r={h*.1} fill="#fff9c4" opacity=".9"/>
      {/* Flag */}
      <line x1={h} y1={s*.14} x2={h} y2={s*.48} stroke="#7b1fa2" strokeWidth={1.5}/>
      <polygon points={`${h},${s*.14} ${h+h*.16},${s*.2} ${h},${s*.26}`} fill="#ff80ab"/>
      {/* Stars */}
      {[{x:.12,y:.18},{x:.85,y:.15},{x:.5,y:.08}].map((d,i)=>(
        <circle key={i} cx={s*d.x} cy={s*d.y} r={h*.03} fill="#ffd600" opacity=".8"/>
      ))}
    </g>
  )

  // ── HOLI ──
  if (themeKey === 'holi') return (
    <g clipPath={clip}>
      {/* Color clouds */}
      {[{cx:.28,cy:.42,c:'#e91e63'},{cx:.72,cy:.38,c:'#ff9800'},{cx:.5,cy:.28,c:'#9c27b0'},
        {cx:.18,cy:.62,c:'#2196f3'},{cx:.78,cy:.58,c:'#4caf50'},{cx:.5,cy:.55,c:'#ffd600'}].map((d,i)=>(
        <circle key={i} cx={s*d.cx} cy={s*d.cy} r={h*.18}
          fill={d.c} opacity=".55" style={{filter:'blur(4px)'}}/>
      ))}
      {/* Color powder splashes */}
      {[{x:.35,y:.22,c:'#ff5722'},{x:.6,y:.18,c:'#e040fb'},{x:.2,y:.44,c:'#00bcd4'},
        {x:.78,y:.38,c:'#ffd600'},{x:.5,y:.68,c:'#ff4081'}].map((d,i)=>(
        <ellipse key={i} cx={s*d.x} cy={s*d.y} rx={h*.1} ry={h*.06}
          fill={d.c} opacity=".8" transform={`rotate(${i*36} ${s*d.x} ${s*d.y})`}/>
      ))}
      {/* Pichkari water gun */}
      <rect x={h*.62} y={h*.78} width={h*.7} height={h*.1} rx={h*.04} fill="#1565c0" opacity=".8"/>
      <circle cx={h*.58} cy={h*.84} r={h*.08} fill="#1976d2" opacity=".8"/>
      <rect x={h*.72} y={h*.86} width={h*.12} height={h*.22} rx={h*.04} fill="#0d47a1" opacity=".8"/>
    </g>
  )

  // ── PIRATE ──
  if (themeKey === 'pirate') return (
    <g clipPath={clip}>
      {/* Ocean waves */}
      {[.5,.62,.74,.86,.94].map((y,i)=>(
        <path key={i} d={`M0,${s*y} Q${h*.5},${s*y-h*.04} ${h},${s*y} Q${h*1.5},${s*y+h*.04} ${s},${s*y}`}
          fill={`rgba(0,80,150,${.2+i*.08})`}/>
      ))}
      {/* Pirate ship */}
      <path d={`M${h*.22},${s*.68} Q${h*.3},${s*.5} ${h*1.0},${s*.5} Q${h*1.7},${s*.5} ${h*1.78},${s*.68} Z`}
        fill="#5d4037"/>
      <rect x={h*.34} y={s*.38} width={h*.08} height={h*.28} fill="#3e2723"/>
      <rect x={h*.42} y={s*.38} width={h*.4} height={h*.18} fill="#f5f5f5" opacity=".9"/>
      <rect x={h*.9} y={s*.42} width={h*.06} height={h*.22} fill="#3e2723"/>
      <rect x={h*.96} y={s*.42} width={h*.28} height={h*.12} fill="#f44336" opacity=".9"/>
      {/* Skull and crossbones flag */}
      <rect x={h*.34} y={s*.26} width={h*.22} height={h*.14} fill="#1a1a1a"/>
      <circle cx={h*.44} cy={s*.3} r={h*.04} fill="white"/>
      <line x1={h*.38} y1={s*.35} x2={h*.5} y2={s*.37} stroke="white" strokeWidth={1}/>
      <line x1={h*.38} y1={s*.37} x2={h*.5} y2={s*.35} stroke="white" strokeWidth={1}/>
    </g>
  )

  // ── DRAGONFIRE ──
  if (themeKey === 'dragonfire') return (
    <g clipPath={clip}>
      {/* Mountains */}
      {[[0,26,70],[24,22,90],[46,28,60],[72,20,80],[90,20,68]].map(([x,w,ht],i)=>(
        <polygon key={i} points={`${h*x/60},${s} ${h*(x+w/2)/60},${s-h*ht/60} ${h*(x+w)/60},${s}`}
          fill={['#1a0000','#200000','#160000','#1e0000','#180000'][i]}/>
      ))}
      {/* Fire/lava glow */}
      <ellipse cx={h} cy={s*.7} rx={h*.6} ry={h*.25} fill="rgba(255,80,0,.2)" style={{filter:'blur(8px)'}}/>
      {/* Dragon silhouette */}
      <g transform={`translate(${h*.6},${h*.44})`}>
        <path d="M0,0 C-10,-15 -20,-18 -24,-10 C-20,-5 -12,-8 0,0 C12,-8 20,-5 24,-10 C20,-18 10,-15 0,0 Z"
          fill="#1a0000" opacity=".9" transform={`scale(${h*.022})`}/>
        <path d="M0,0 C-8,5 -12,16 -8,24 C-4,20 0,14 0,0 C0,14 4,20 8,24 C12,16 8,5 0,0 Z"
          fill="#1a0000" opacity=".9" transform={`scale(${h*.022})`}/>
      </g>
      {/* Flame */}
      {[{x:.44,y:.62,w:.06,h:.18,c:'#ff3d00'},{x:.48,y:.56,w:.04,h:.2,c:'#ff6d00'},{x:.5,y:.5,w:.03,h:.22,c:'#ffd600'}].map((d,i)=>(
        <ellipse key={i} cx={s*d.x} cy={s*d.y} rx={h*d.w} ry={h*d.h} fill={d.c} opacity=".9"/>
      ))}
    </g>
  )

  // ── RACECAR ──
  if (themeKey === 'racecar') return (
    <g clipPath={clip}>
      {/* Race track */}
      <ellipse cx={h} cy={h*.75} rx={h*.88} ry={h*.35} fill="none" stroke="#455a64" strokeWidth={h*.2}/>
      <ellipse cx={h} cy={h*.75} rx={h*.88} ry={h*.35} fill="none" stroke="#607d8b" strokeWidth={h*.16}
        strokeDasharray={`${h*.12} ${h*.08}`}/>
      {/* Track markings */}
      <line x1={h*.12} y1={h*.75} x2={h*.25} y2={h*.75} stroke="white" strokeWidth={1.5} strokeDasharray="3 3"/>
      {/* Checkered flag */}
      {Array.from({length:12},(_,i)=>{
        const row=Math.floor(i/4), col=i%4
        return <rect key={i} x={h*1.42+col*h*.08} y={h*.22+row*h*.06} width={h*.08} height={h*.06}
          fill={(row+col)%2===0?'white':'black'}/>
      })}
      <line x1={h*1.42} y1={h*.18} x2={h*1.42} y2={h*.42} stroke="#d32f2f" strokeWidth={1.5}/>
      {/* Racecar on track */}
      <g transform={`translate(${h*.24},${h*.62})`}>
        <rect x={-h*.16} y={-h*.06} width={h*.32} height={h*.12} rx={h*.03} fill={color}/>
        <rect x={-h*.08} y={-h*.1} width={h*.18} height={h*.06} rx={h*.02} fill={color} opacity=".8"/>
        {/* Wheels */}
        <circle cx={-h*.1} cy={h*.08} r={h*.055} fill="#1a1a1a"/>
        <circle cx={h*.1} cy={h*.08} r={h*.055} fill="#1a1a1a"/>
        <circle cx={-h*.1} cy={-h*.08} r={h*.04} fill="#1a1a1a"/>
        <circle cx={h*.1} cy={-h*.08} r={h*.04} fill="#1a1a1a"/>
        <circle cx={0} cy={-h*.04} r={h*.03} fill="#1a1a1a" opacity=".5"/>
      </g>
      {/* Speed lines */}
      {[-1,0,1].map(i=>(
        <line key={i} x1={h*.38+i*h*.06} y1={h*.62} x2={h*.18+i*h*.06} y2={h*.62}
          stroke="rgba(255,255,255,.35)" strokeWidth={1.2} strokeLinecap="round"/>
      ))}
    </g>
  )

  // ── HALLOWEEN ──
  if (themeKey === 'halloween') return (
    <g clipPath={clip}>
      {/* Dark sky */}
      <rect x={0} y={0} width={s} height={s} fill="rgba(15,8,0,.5)"/>
      {/* Moon */}
      <circle cx={h*.68} cy={h*.36} r={h*.22} fill="#fff9c4" opacity=".92"/>
      {/* Jack-o-lantern */}
      <ellipse cx={h} cy={h*.72} rx={h*.28} ry={h*.24} fill="#e65100"/>
      <ellipse cx={h} cy={h*.68} rx={h*.24} ry={h*.2} fill="#ff6d00"/>
      {/* Eyes */}
      <polygon points={`${h*.88},${h*.62} ${h*.96},${h*.62} ${h*.92},${h*.7}`} fill="#ff3d00"/>
      <polygon points={`${h*1.04},${h*.62} ${h*1.12},${h*.62} ${h*1.08},${h*.7}`} fill="#ff3d00"/>
      {/* Mouth */}
      <path d={`M${h*.82},${h*.78} L${h*.86},${h*.84} L${h*.9},${h*.8} L${h*.96},${h*.86} L${h*1.0},${h*.8} L${h*1.06},${h*.86} L${h*1.1},${h*.8} L${h*1.16},${h*.76}`}
        stroke="#ff3d00" strokeWidth={h*.035} fill="none" strokeLinecap="round"/>
      {/* Stem */}
      <rect x={h*.96} y={h*.48} width={h*.08} height={h*.1} rx={h*.03} fill="#2e7d32"/>
      {/* Bats */}
      {[{x:.18,y:.28,s:1.0},{x:.72,y:.18,s:.8},{x:.85,y:.44,s:.7}].map((d,i)=>(
        <g key={i} transform={`translate(${s*d.x},${s*d.y}) scale(${d.s})`}>
          <path d="M0,-4 C-5,-4 -9,0 -9,4 C-6,0 -3,1 0,2 C3,1 6,0 9,4 C9,0 5,-4 0,-4 Z"
            fill="#050300" opacity=".95"/>
        </g>
      ))}
      {/* Ghost */}
      <path d={`M${h*1.48},${h*.42} Q${h*1.48},${h*.26} ${h*1.6},${h*.26} Q${h*1.72},${h*.26} ${h*1.72},${h*.42} L${h*1.72},${h*.6} Q${h*1.66},${h*.58} ${h*1.6},${h*.62} Q${h*1.54},${h*.58} ${h*1.48},${h*.6} Z`}
        fill="rgba(240,240,255,.7)"/>
      <circle cx={h*1.56} cy={h*.38} r={h*.03} fill="#1a1a1a"/>
      <circle cx={h*1.64} cy={h*.38} r={h*.03} fill="#1a1a1a"/>
      {/* Haunted ground */}
      <rect x={0} y={s*.88} width={s} height={s*.12} fill="#080400"/>
      {/* Tombstone */}
      <rect x={h*.28} y={s*.76} width={h*.22} height={h*.16} rx={h*.06} fill="#212121"/>
      <path d={`M${h*.28},${s*.76} Q${h*.39},${s*.68} ${h*.5},${s*.76}`} fill="#212121"/>
    </g>
  )

  // ── DIWALI ──
  if (themeKey === 'diwali') return (
    <g clipPath={clip}>
      {/* Night sky with string lights */}
      {[{x:.1,y:.18},{x:.3,y:.12},{x:.5,y:.16},{x:.7,y:.11},{x:.9,y:.15}].map((d,i)=>(
        <circle key={i} cx={s*d.x} cy={s*d.y} r={h*.05}
          fill={['#ffd600','#ff9800','#ff5722','#4caf50','#9c27b0'][i]} opacity=".9"
          style={{animation:`hub-glow-pulse ${2+i*.3}s ${i*.2}s ease-in-out infinite`}}/>
      ))}
      {[{x:.2,y:.14},{x:.4,y:.12},{x:.6,y:.13},{x:.8,y:.12}].map((d,i)=>(
        <line key={i} x1={s*(d.x-.1)} y1={s*d.y} x2={s*d.x} y2={s*d.y+h*.08}
          stroke="rgba(255,200,50,.35)" strokeWidth={.8}/>
      ))}
      {/* Diyas */}
      {[{cx:.28,cy:.78},{cx:.5,cy:.74},{cx:.72,cy:.78},{cx:.39,cy:.86},{cx:.62,cy:.86}].map((d,i)=>(
        <g key={i}>
          <path d={`M${s*d.cx-h*.08},${s*d.cy} Q${s*d.cx},${s*d.cy+h*.07} ${s*d.cx+h*.08},${s*d.cy}`}
            fill="#ff7043" stroke="#e64a19" strokeWidth={.8}/>
          <ellipse cx={s*d.cx} cy={s*d.cy-h*.01} rx={h*.08} ry={h*.04} fill="#ff7043"/>
          {/* Flame */}
          <ellipse cx={s*d.cx} cy={s*d.cy-h*.08} rx={h*.03} ry={h*.06} fill="#ffd600" opacity=".9"/>
          <ellipse cx={s*d.cx} cy={s*d.cy-h*.1} rx={h*.015} ry={h*.04} fill="white" opacity=".7"/>
        </g>
      ))}
      {/* Fireworks */}
      {[{cx:.78,cy:.32},{cx:.18,cy:.4}].map((fw,fi)=>(
        <g key={fi}>
          {[0,45,90,135,180,225,270,315].map((a,i)=>(
            <line key={i}
              x1={s*fw.cx} y1={s*fw.cy}
              x2={s*fw.cx+Math.cos(a*Math.PI/180)*h*.14} y2={s*fw.cy+Math.sin(a*Math.PI/180)*h*.14}
              stroke={['#ffd600','#ff9800','#ff5722','#4caf50','#2196f3','#9c27b0','#ffd600','#ff9800'][i]}
              strokeWidth={h*.03} strokeLinecap="round"/>
          ))}
        </g>
      ))}
      {/* Rangoli on ground */}
      <ellipse cx={h} cy={s*.92} rx={h*.45} ry={h*.08} fill="rgba(255,150,0,.3)"/>
    </g>
  )

  // ── HOTCOCOA ──
  if (themeKey === 'hotcocoa') return (
    <g clipPath={clip}>
      {/* Cozy window with snow outside */}
      <rect x={0} y={0} width={s} height={s} fill="rgba(255,160,80,.1)"/>
      {/* Mug */}
      <path d={`M${h*.38},${h*.38} L${h*.38},${h*.9} Q${h*.38},${h}.0 ${h},${h*1.0} Q${h*1.62},${h*1.0} ${h*1.62},${h*.9} L${h*1.62},${h*.38} Z`}
        fill="#6d4c41"/>
      <rect x={h*.38} y={h*.32} width={h*1.24} height={h*.1} rx={h*.05} fill="#5d4037"/>
      {/* Handle */}
      <path d={`M${h*1.62},${h*.5} Q${h*1.88},${h*.5} ${h*1.88},${h*.65} Q${h*1.88},${h*.8} ${h*1.62},${h*.8}`}
        stroke="#5d4037" strokeWidth={h*.08} fill="none"/>
      {/* Cocoa surface */}
      <ellipse cx={h} cy={h*.38} rx={h*.62} ry={h*.14} fill="#3e2723"/>
      <ellipse cx={h} cy={h*.37} rx={h*.55} ry={h*.1} fill="#4e342e"/>
      {/* Marshmallows */}
      {[{x:.72,y:.34},{x:.88,y:.36},{x:.58,y:.35}].map((d,i)=>(
        <rect key={i} x={h*d.x} y={h*d.y} width={h*.18} height={h*.08} rx={h*.04} fill="white" opacity=".9"/>
      ))}
      {/* Steam */}
      {[{x:.5,d:'M0,0 Q-4,-12 0,-24 Q4,-36 0,-48'},{x:.6,d:'M0,0 Q4,-14 0,-28 Q-4,-42 0,-56'},{x:.7,d:'M0,0 Q-3,-10 0,-20 Q3,-30 0,-42'}].map((st,i)=>(
        <path key={i} d={st.d} transform={`translate(${s*st.x},${h*.3})`}
          stroke="rgba(255,255,255,.35)" strokeWidth={h*.03} fill="none" strokeLinecap="round"/>
      ))}
      {/* Snow outside window frame */}
      {[{x:.08,y:.22},{x:.28,y:.16},{x:.6,y:.2},{x:.82,y:.14}].map((d,i)=>(
        <circle key={i} cx={s*d.x} cy={s*d.y} r={h*.025} fill="rgba(220,240,255,.7)"/>
      ))}
    </g>
  )

  // ── CHRISTMAS ──
  if (themeKey === 'christmas') return (
    <g clipPath={clip}>
      {/* Snow ground */}
      <ellipse cx={h} cy={s*.92} rx={h*.88} ry={h*.1} fill="rgba(220,240,255,.55)"/>
      {/* Christmas tree */}
      <polygon points={`${h},${h*.16} ${h*.5},${h*.82} ${h*1.5},${h*.82}`} fill="#2e7d32"/>
      <polygon points={`${h},${h*.28} ${h*.6},${h*.72} ${h*1.4},${h*.72}`} fill="#388e3c"/>
      <polygon points={`${h},${h*.4} ${h*.68},${h*.66} ${h*1.32},${h*.66}`} fill="#43a047"/>
      <rect x={h*.92} y={h*.82} width={h*.16} height={h*.18} rx={h*.02} fill="#5d4037"/>
      {/* Ornaments */}
      {[{x:.5,y:.5,c:'#f44336'},{x:.66,y:.58,c:'#ffd600'},{x:.36,y:.6,c:'#2196f3'},{x:.6,y:.68,c:'#ff80ab'},{x:.4,y:.7,c:'#4caf50'}].map((d,i)=>(
        <circle key={i} cx={s*d.x} cy={s*d.y} r={h*.055} fill={d.c} opacity=".9"/>
      ))}
      {/* Star on top */}
      <path d={`M${h},${h*.1} L${h+h*.05},${h*.2} L${h+h*.16},${h*.2} L${h+h*.07},${h*.28} L${h+h*.1},${h*.38} L${h},${h*.32} L${h-h*.1},${h*.38} L${h-h*.07},${h*.28} L${h-h*.16},${h*.2} L${h-h*.05},${h*.2} Z`}
        fill="#ffd600"/>
      {/* Snowflakes */}
      {[{x:.18,y:.24},{x:.82,y:.2},{x:.22,y:.5},{x:.78,y:.48}].map((d,i)=>(
        <text key={i} x={s*d.x} y={s*d.y} textAnchor="middle" fontSize={h*.14} fill="rgba(200,230,255,.7)">❄</text>
      ))}
    </g>
  )

  // ── FROZEN ──
  if (themeKey === 'frozen') return (
    <g clipPath={clip}>
      {/* Ice palace */}
      <rect x={h*.18} y={h*.24} width={h*1.64} height={h*1.0} rx={h*.06} fill="rgba(100,200,255,.25)"/>
      {/* Palace towers */}
      {[{x:.18,w:.28,h:.62},{x:.54,w:.36,h:.82},{x:1.0,w:.36,h:.72},{x:1.42,w:.28,h:.58}].map((t,i)=>(
        <g key={i}>
          <rect x={h*t.x} y={s-h*t.h} width={h*t.w} height={h*t.h} fill="rgba(100,200,255,.4)" rx={h*.02}/>
          <polygon points={`${h*t.x},${s-h*t.h} ${h*(t.x+t.w/2)},${s-h*t.h-h*.24} ${h*(t.x+t.w)},${s-h*t.h}`}
            fill="rgba(150,230,255,.5)"/>
        </g>
      ))}
      {/* Snowflakes */}
      {[{x:.24,y:.22},{x:.5,y:.14},{x:.76,y:.2},{x:.14,y:.48},{x:.86,y:.44}].map((d,i)=>(
        <text key={i} x={s*d.x} y={s*d.y} textAnchor="middle" fontSize={h*.18}
          fill="rgba(180,240,255,.75)">❄</text>
      ))}
      {/* Ice crystals on ground */}
      {[h*.28,h*.5,h*.72,h*.92,h*1.12,h*1.32].map((x,i)=>(
        <polygon key={i} points={`${x},${s*.88} ${x-h*.04},${s*.96} ${x+h*.04},${s*.96}`}
          fill="rgba(180,240,255,.6)"/>
      ))}
      {/* Stars */}
      {[{x:.38,y:.08},{x:.62,y:.06}].map((d,i)=>(
        <circle key={i} cx={s*d.x} cy={s*d.y} r={h*.025} fill="white" opacity=".8"/>
      ))}
    </g>
  )

  // ── SKY ──
  if (themeKey === 'sky') return (
    <g clipPath={clip}>
      {/* Sky gradient layers */}
      <rect x={0} y={0} width={s} height={s*.4} fill="rgba(255,255,200,.15)"/>
      <rect x={0} y={s*.4} width={s} height={s*.6} fill="rgba(135,200,255,.15)"/>
      {/* Sun */}
      <circle cx={h*.35} cy={h*.38} r={h*.18} fill="#fff9c4" opacity=".9"/>
      {[0,45,90,135,180,225,270,315].map((a,i)=>(
        <line key={i} x1={h*.35+Math.cos(a*Math.PI/180)*h*.18} y1={h*.38+Math.sin(a*Math.PI/180)*h*.18}
          x2={h*.35+Math.cos(a*Math.PI/180)*h*.28} y2={h*.38+Math.sin(a*Math.PI/180)*h*.28}
          stroke="rgba(255,230,100,.6)" strokeWidth={h*.04} strokeLinecap="round"/>
      ))}
      {/* Clouds */}
      {[{cx:.62,cy:.32},{cx:.5,cy:.5},{cx:.18,cy:.58}].map((d,i)=>(
        <g key={i}>
          <ellipse cx={s*d.cx} cy={s*d.cy} rx={h*.24} ry={h*.12} fill="white" opacity={.7-i*.1}/>
          <ellipse cx={s*d.cx-h*.08} cy={s*d.cy-h*.04} rx={h*.14} ry={h*.1} fill="white" opacity={.7-i*.1}/>
          <ellipse cx={s*d.cx+h*.1} cy={s*d.cy-h*.03} rx={h*.16} ry={h*.1} fill="white" opacity={.7-i*.1}/>
        </g>
      ))}
      {/* Bird flock */}
      {[{x:.55,y:.22},{x:.62,y:.2},{x:.7,y:.22},{x:.58,y:.17},{x:.66,y:.17}].map((d,i)=>(
        <path key={i} d={`M${s*d.x-h*.04},${s*d.y} Q${s*d.x},${s*d.y-h*.04} ${s*d.x+h*.04},${s*d.y}`}
          stroke="#546e7a" strokeWidth={1.2} fill="none"/>
      ))}
    </g>
  )

  // ── RAINBOW ──
  if (themeKey === 'rainbow') return (
    <g clipPath={clip}>
      {/* Rainbow arcs */}
      {[.88,.78,.68,.58,.48,.38].map((r,i)=>(
        <path key={i} d={`M${h*.02},${s*.82} A${h*r} ${h*r} 0 0 1 ${h*1.98},${s*.82}`}
          stroke={['#ff0000','#ff9800','#ffd600','#4caf50','#2196f3','#9c27b0'][i]}
          strokeWidth={h*.09} fill="none" opacity=".85"/>
      ))}
      {/* Clouds at base */}
      {[{cx:.12,cy:.82},{cx:.88,cy:.82}].map((d,i)=>(
        <g key={i}>
          <ellipse cx={s*d.cx} cy={s*d.cy} rx={h*.22} ry={h*.12} fill="white" opacity=".8"/>
          <ellipse cx={s*d.cx+(i?h*.06:-h*.06)} cy={s*d.cy-h*.06} rx={h*.14} ry={h*.1} fill="white" opacity=".8"/>
        </g>
      ))}
      {/* Raindrops */}
      {[{x:.4,y:.5},{x:.52,y:.56},{x:.64,y:.5},{x:.44,y:.64},{x:.6,y:.66}].map((d,i)=>(
        <ellipse key={i} cx={s*d.x} cy={s*d.y} rx={h*.025} ry={h*.04}
          fill="rgba(100,180,255,.6)"/>
      ))}
      {/* Pot of gold */}
      <path d={`M${h*.74},${s*.88} Q${h*.74},${s*.96} ${h*.86},${s*.96} Q${h*.98},${s*.96} ${h*.98},${s*.88} Z`}
        fill="#212121"/>
      <ellipse cx={h*.86} cy={s*.88} rx={h*.12} ry={h*.06} fill="#212121"/>
      {[{x:.8,y:.86},{x:.86,y:.84},{x:.92,y:.86}].map((d,i)=>(
        <circle key={i} cx={s*d.x} cy={s*d.y} r={h*.04} fill="#ffd600" opacity=".9"/>
      ))}
    </g>
  )

  // ── ARTSTUDIO ──
  if (themeKey === 'artStudio') return (
    <g clipPath={clip}>
      {/* Palette */}
      <path d={`M${h*.28},${h*.42} Q${h*.18},${h*.28} ${h*.38},${h*.2} Q${h*.62},${h*.1} ${h*.86},${h*.24} Q${h*1.12},${h*.38} ${h*1.04},${h*.58} Q${h*1.0},${h*.7} ${h*.84},${h*.72} Q${h*.72},${h*.74} ${h*.62},${h*.68} Q${h*.52},${h*.78} ${h*.38},${h*.72} Q${h*.22},${h*.64} ${h*.28},${h*.42} Z`}
        fill="#3e2723" opacity=".8"/>
      {/* Color wells on palette */}
      {[{x:.46,y:.36,c:'#f44336'},{x:.62,y:.28,c:'#ffd600'},{x:.76,y:.36,c:'#2196f3'},{x:.72,y:.5,c:'#4caf50'},{x:.56,y:.54,c:'#9c27b0'},{x:.4,y:.5,c:'#ff9800'}].map((d,i)=>(
        <circle key={i} cx={s*d.x} cy={s*d.y} r={h*.065} fill={d.c} opacity=".9"/>
      ))}
      {/* Paintbrush */}
      <line x1={h*1.12} y1={h*.42} x2={h*1.68} y2={h*.88} stroke="#5d4037" strokeWidth={h*.06} strokeLinecap="round"/>
      <rect x={h*1.06} y={h*.36} width={h*.14} height={h*.14} rx={h*.02} fill="#bdbdbd"/>
      <path d={`M${h*1.04},${h*.38} Q${h*1.0},${h*.28} ${h*1.12},${h*.24} Q${h*1.22},${h*.28} ${h*1.2},${h*.38}`}
        fill="#e91e63"/>
      {/* Paint strokes on canvas */}
      <path d={`M${h*.1},${h*.68} Q${h*.28},${h*.62} ${h*.3},${h*.8}`}
        stroke="#f44336" strokeWidth={h*.05} fill="none" strokeLinecap="round"/>
      <path d={`M${h*.18},${h*.82} Q${h*.28},${h*.74} ${h*.4},${h*.82}`}
        stroke="#ffd600" strokeWidth={h*.04} fill="none" strokeLinecap="round"/>
      <path d={`M${h*.08},${h*.9} Q${h*.2},${h*.84} ${h*.26},${h*.96}`}
        stroke="#2196f3" strokeWidth={h*.05} fill="none" strokeLinecap="round"/>
    </g>
  )

  // ── Default fallback ──
  return (
    <g clipPath={clip}>
      {Array.from({length:8},(_,i)=>{
        const a=(i/8)*Math.PI*2
        return <circle key={i} cx={h+Math.cos(a)*h*.6} cy={h+Math.sin(a)*h*.6}
          r={h*.06} fill={color} opacity=".5"/>
      })}
      <circle cx={h} cy={h} r={h*.18} fill={color} opacity=".25"/>
    </g>
  )
}

// ── Planet decoration per theme ────────────────────────────────────────────────
// Small SVG accents drawn on/around the planet sphere (inside clipPath)
function PlanetDecoration({ themeKey, c, size, clipId }) {
  const clip = `url(#${clipId})`
  const h = c

  if (themeKey === 'batman') return (
    <g clipPath={clip}>
      {/* Bat silhouette overlay */}
      <g transform={`translate(${c},${c*.5}) scale(${c*.012})`}>
        <path d="M0,-12 C-6,-5 -14,-2 -18,5 C-12,5 -6,1 0,3 C6,1 12,5 18,5 C14,-2 6,-5 0,-12 Z M-3,3 C-7,9 -9,14 -7,18 L0,14 L7,18 C9,14 7,9 3,3 Z"
          fill="rgba(0,0,0,.45)"/>
      </g>
    </g>
  )

  if (themeKey === 'spiderman') return (
    <g clipPath={clip}>
      {Array.from({length:6},(_,i)=>{
        const a=(i/6)*Math.PI*2
        return <line key={i} x1={c} y1={c} x2={c+Math.cos(a)*c} y2={c+Math.sin(a)*c}
          stroke="rgba(220,220,255,.22)" strokeWidth={.8}/>
      })}
      {[.25,.45,.65,.85].map((r,i)=>(
        <circle key={i} cx={c} cy={c} r={c*r} fill="none" stroke="rgba(220,220,255,.18)" strokeWidth={.8}/>
      ))}
    </g>
  )

  if (themeKey === 'halloween') return (
    <g clipPath={clip}>
      {/* Small bats at edges */}
      {[{x:.18,y:.22},{x:.78,y:.18},{x:.82,y:.72}].map((d,i)=>(
        <g key={i} transform={`translate(${size*d.x},${size*d.y}) scale(${c*.008})`}>
          <path d="M0,-8 C-4,-3 -10,0 -12,4 C-8,2 -4,1 0,2 C4,1 8,2 12,4 C10,0 4,-3 0,-8 Z"
            fill="rgba(0,0,0,.6)"/>
        </g>
      ))}
    </g>
  )

  if (themeKey === 'christmas') return (
    <g clipPath={clip}>
      {[{x:.2,y:.25},{x:.75,y:.2},{x:.3,y:.72},{x:.72,y:.7}].map((d,i)=>(
        <text key={i} x={size*d.x} y={size*d.y} fontSize={c*.16} fill="rgba(180,230,255,.6)">❄</text>
      ))}
    </g>
  )

  if (themeKey === 'frozen') return (
    <g clipPath={clip}>
      {[{x:.15,y:.2},{x:.72,y:.15},{x:.2,y:.74},{x:.78,y:.72},{x:.5,y:.12}].map((d,i)=>(
        <text key={i} x={size*d.x} y={size*d.y} fontSize={c*.14} fill="rgba(150,220,255,.65)">❄</text>
      ))}
    </g>
  )

  if (themeKey === 'forest' || themeKey === 'enchanted') return (
    <g clipPath={clip}>
      {[{x:.14,y:.24},{x:.78,y:.2},{x:.18,y:.72},{x:.74,y:.7}].map((d,i)=>(
        <ellipse key={i} cx={size*d.x} cy={size*d.y} rx={c*.08} ry={c*.05}
          fill="rgba(100,200,80,.4)" transform={`rotate(${i*40} ${size*d.x} ${size*d.y})`}/>
      ))}
    </g>
  )

  if (themeKey === 'ocean' || themeKey === 'mermaid') return (
    <g clipPath={clip}>
      {[{x:.15,y:.25},{x:.75,y:.2},{x:.18,y:.74},{x:.78,y:.72}].map((d,i)=>(
        <circle key={i} cx={size*d.x} cy={size*d.y} r={c*.05}
          fill="none" stroke="rgba(150,220,255,.45)" strokeWidth={1}/>
      ))}
    </g>
  )

  if (themeKey === 'candy' || themeKey === 'bubblegum') return (
    <g clipPath={clip}>
      {[{x:.18,y:.2,c:'#ff6ec7'},{x:.74,y:.18,c:'#ffd600'},{x:.2,y:.74,c:'#00e5ff'},{x:.72,y:.72,c:'#ff6b6b'}].map((d,i)=>(
        <rect key={i} x={size*d.x} y={size*d.y} width={c*.09} height={c*.03} rx={c*.015} fill={d.c} opacity=".7"
          transform={`rotate(${i*45} ${size*d.x} ${size*d.y})`}/>
      ))}
    </g>
  )

  if (themeKey === 'diwali') return (
    <g clipPath={clip}>
      {[{x:.15,y:.22},{x:.72,y:.18},{x:.2,y:.72},{x:.74,y:.7}].map((d,i)=>(
        <ellipse key={i} cx={size*d.x} cy={size*d.y} rx={c*.06} ry={c*.04}
          fill={['#ffd600','#ff9800','#ff5722','#ffd600'][i]} opacity=".7"/>
      ))}
    </g>
  )

  if (themeKey === 'galaxy' || themeKey === 'stardust' || themeKey === 'moon') return (
    <g clipPath={clip}>
      {Array.from({length:6},(_,i)=>(
        <circle key={i} cx={(i*1373+7)%(size*.7)+size*.15} cy={(i*2741+13)%(size*.7)+size*.15}
          r={c*.025} fill="white" opacity={.2+(i%3)*.15}/>
      ))}
    </g>
  )

  if (themeKey === 'holi' || themeKey === 'rangoli') return (
    <g clipPath={clip}>
      {[{x:.15,y:.22,c:'#e91e63'},{x:.72,y:.2,c:'#ffd600'},{x:.2,y:.74,c:'#00bcd4'},{x:.74,y:.72,c:'#9c27b0'}].map((d,i)=>(
        <circle key={i} cx={size*d.x} cy={size*d.y} r={c*.07} fill={d.c} opacity=".55"
          style={{filter:'blur(2px)'}}/>
      ))}
    </g>
  )

  if (themeKey === 'cherryblossom') return (
    <g clipPath={clip}>
      {[{x:.16,y:.2},{x:.72,y:.18},{x:.2,y:.72},{x:.74,y:.7},{x:.5,y:.14}].map((d,i)=>(
        <ellipse key={i} cx={size*d.x} cy={size*d.y} rx={c*.05} ry={c*.03}
          fill="#f8bbd0" opacity=".7" transform={`rotate(${i*36} ${size*d.x} ${size*d.y})`}/>
      ))}
    </g>
  )

  return null
}

// ── Themed Zone Visual ─────────────────────────────────────────────────────────
export function ThemedZoneVisual({ zone, themeKey, size = 110 }) {
  const h = size / 2
  const { color, coreColor } = zone
  const bg = ZONE_BG[themeKey] || '#030308'
  const clipId = `tzc-${zone.id}-${themeKey}`
  const featureEmoji = ZONE_EMOJI[zone.id] || zone.emoji
  const fontSize = size * 0.3

  return (
    <div style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}>
      {/* Glow */}
      <div style={{
        position: 'absolute', inset: -size * 0.2, borderRadius: '50%',
        background: `radial-gradient(circle, ${color}38 0%, transparent 66%)`,
        animation: 'hub-glow-pulse 3.5s ease-in-out infinite',
      }} />

      {/* SVG scene */}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
        style={{ position: 'relative', zIndex: 1, overflow: 'visible' }}>
        <defs>
          <clipPath id={clipId}><circle cx={h} cy={h} r={h - 1}/></clipPath>
          <filter id="zone-blur"><feGaussianBlur stdDeviation="4"/></filter>
          <radialGradient id={`zbg-${zone.id}`} cx="50%" cy="45%" r="65%">
            <stop offset="0%" stopColor={bg} stopOpacity=".6"/>
            <stop offset="100%" stopColor={bg} stopOpacity="1"/>
          </radialGradient>
        </defs>

        {/* Base fill */}
        <circle cx={h} cy={h} r={h - 1} fill={`url(#zbg-${zone.id})`}/>
        <circle cx={h} cy={h} r={h - 1} fill={bg}/>

        {/* Theme-specific scene */}
        <ZoneScene themeKey={themeKey} h={h} color={color} coreColor={coreColor} clipId={clipId}/>

        {/* Ring */}
        <circle cx={h} cy={h} r={h - 1} fill="none"
          stroke={color} strokeWidth={1.5} strokeOpacity=".55"/>

        {/* Focus ring when this is highlighted - rendered by parent */}
      </svg>

      {/* Feature emoji overlay — clearly identifies the feature zone */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: fontSize, zIndex: 3, lineHeight: 1,
        filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.8))',
        pointerEvents: 'none',
      }}>
        {featureEmoji}
      </div>
    </div>
  )
}

// ── Per-theme planet shape sets ────────────────────────────────────────────────
// 5 themed object shapes per theme; each planet picks by (planetIndex % 5)
// Returns an emoji representing what this planet looks like in this theme
const THEME_PLANET_EMOJIS = {
  batman:       ['🦇','🚗','🔱','🔦','🌃'],
  spiderman:    ['🕸️','🕷️','🏙️','🎯','⭐'],
  superman:     ['🛡️','🦸','🌆','💎','🚀'],
  avengers:     ['🛡️','⚡','💥','🌟','🔮'],
  galaxy:       ['🌌','⭐','🚀','🪐','🔭'],
  moon:         ['🌙','⭐','🌟','🪨','🛸'],
  stardust:     ['✨','💫','⭐','🌟','🌠'],
  robot:        ['🤖','⚙️','💡','📡','🔋'],
  curiositylab: ['🔬','⚗️','💡','🔭','🧬'],
  forest:       ['🌳','🍄','🦋','🌿','🐛'],
  panda:        ['🐼','🎋','🍃','🐾','🌿'],
  frog:         ['🐸','🍃','🌸','💧','🌿'],
  enchanted:    ['🧚','🌟','🍄','🦋','✨'],
  minecraft:    ['⬜','🟩','🧱','⛏️','💎'],
  autumnleaves: ['🍂','🍁','🌰','🎃','🌾'],
  dinosaur:     ['🦕','🌋','🥚','🌿','💀'],
  ocean:        ['🐠','🐚','🌊','🦑','🌿'],
  shark:        ['🦈','⚓','🌊','🐟','💀'],
  mermaid:      ['🧜','🐚','⭐','🌊','💎'],
  monsoon:      ['🌧️','⚡','☁️','🌈','💧'],
  candy:        ['🍭','🧁','🍬','🍡','🍫'],
  bubblegum:    ['🫧','💗','🍬','🎀','⭐'],
  icecream:     ['🍦','🍨','🍧','🍡','🍰'],
  pizza:        ['🍕','🧀','🍅','🫑','🧄'],
  donut:        ['🍩','🧁','🍪','🍰','🎂'],
  coral:        ['🌻','🦋','☀️','🌈','🌸'],
  sunshine:     ['☀️','🌻','🌈','⭐','🌤️'],
  lion:         ['🦁','🌅','🌿','⭐','🐾'],
  unicorn:      ['🦄','🌈','⭐','💜','✨'],
  storymagic:   ['📚','🔮','✨','🌟','🪄'],
  wordwizard:   ['📖','🦉','🔤','✨','⭐'],
  goldstar:     ['⭐','🏆','🥇','👑','✨'],
  rangoli:      ['🌸','🪔','🌺','✨','🎨'],
  kolam:        ['🌸','🐘','🪷','🌟','🎨'],
  fairygarden:  ['🧚','🌸','🍄','🦋','🌺'],
  cherryblossom:['🌸','🌺','🌼','🎋','✨'],
  princess:     ['👑','🏰','💎','🌸','🪄'],
  holi:         ['🎨','🌸','🎊','🌈','✨'],
  pirate:       ['💀','⚓','🏴‍☠️','💰','🗡️'],
  dragonfire:   ['🐉','🔥','⚔️','🏰','💎'],
  racecar:      ['🏎️','🏁','🏆','⚡','🔥'],
  halloween:    ['🎃','👻','🦇','💀','🧙'],
  diwali:       ['🪔','✨','🎆','🌸','⭐'],
  hotcocoa:     ['☕','❄️','🏠','🍪','⛄'],
  christmas:    ['🎄','⭐','🎁','❄️','🔔'],
  frozen:       ['❄️','🏰','🌨️','💎','⛄'],
  sky:          ['☁️','🌤️','🪁','🦅','🌈'],
  rainbow:      ['🌈','☁️','💧','⭐','🌟'],
  artStudio:    ['🎨','🖌️','✏️','🖼️','🌈'],
}

// ── Themed Planet Visual ───────────────────────────────────────────────────────
export function ThemedPlanetVisual({ planet, themeKey, size, planetIndex = 0 }) {
  const { hi, mid, lo, hasRing } = planet
  const c = size / 2

  // Pick the theme emoji for this planet slot
  const themeEmojis = THEME_PLANET_EMOJIS[themeKey] || THEME_PLANET_EMOJIS['coral']
  const themeEmoji = themeEmojis[planetIndex % themeEmojis.length]

  // Show both the theme emoji AND the feature emoji
  const featureEmoji = planet.emoji
  const emojiSize = size * 0.32
  const themeEmojiSize = size * 0.36

  const pid = `tp-${planet.id}-${themeKey}`

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {/* Glow */}
      <div style={{
        position: 'absolute', inset: -size * .26, borderRadius: '50%',
        background: `radial-gradient(circle, ${mid}58 0%, ${mid}18 44%, transparent 66%)`,
        filter: 'blur(10px)',
        animation: 'hub-glow-pulse 4s ease-in-out infinite', zIndex: 0,
      }} />

      {/* Ring */}
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

      {/* Sphere */}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
        style={{ position: 'relative', zIndex: 2, overflow: 'visible' }}>
        <defs>
          <radialGradient id={`${pid}-s`} cx="34%" cy="27%" r="76%">
            <stop offset="0%"   stopColor={hi}  />
            <stop offset="38%"  stopColor={mid} />
            <stop offset="100%" stopColor={lo}  />
          </radialGradient>
          <radialGradient id={`${pid}-sh`} cx="68%" cy="62%" r="50%">
            <stop offset="0%"   stopColor="black" stopOpacity=".42" />
            <stop offset="100%" stopColor="black" stopOpacity="0"   />
          </radialGradient>
          <clipPath id={`${pid}-c`}><circle cx={c} cy={c} r={c - 1}/></clipPath>
        </defs>

        {/* Planet sphere */}
        <circle cx={c} cy={c} r={c - 1} fill={`url(#${pid}-s)`}/>

        {/* Theme decoration */}
        <PlanetDecoration themeKey={themeKey} c={c} size={size} clipId={`${pid}-c`}/>

        {/* Shadow */}
        <circle cx={c} cy={c} r={c - 1} fill={`url(#${pid}-sh)`} clipPath={`url(#${pid}-c)`}/>

        {/* Shine */}
        <ellipse cx={c * .7} cy={c * .56} rx={c * .25} ry={c * .17}
          fill="rgba(255,255,255,.25)" clipPath={`url(#${pid}-c)`}/>
        <circle cx={c * .64} cy={c * .5} r={c * .08}
          fill="rgba(255,255,255,.5)" clipPath={`url(#${pid}-c)`}/>
      </svg>

      {/* Theme emoji — large, centered, clearly themed */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        zIndex: 3, pointerEvents: 'none', gap: 0, lineHeight: 1,
      }}>
        <div style={{
          fontSize: themeEmojiSize,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.7))',
          lineHeight: 1,
        }}>
          {themeEmoji}
        </div>
      </div>

      {/* Feature emoji — small, bottom-right corner badge */}
      <div style={{
        position: 'absolute', bottom: size * .04, right: size * .04,
        fontSize: size * 0.2, lineHeight: 1, zIndex: 4, pointerEvents: 'none',
        filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.8))',
        background: 'rgba(0,0,0,0.45)', borderRadius: '50%',
        width: size * 0.28, height: size * 0.28,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {featureEmoji}
      </div>
    </div>
  )
}
