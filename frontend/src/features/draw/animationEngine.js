// animationEngine.js — brings the kid's actual drawing to life
// Every object has its own personality. Grow with the kid.

// ── Easing ────────────────────────────────────────────────────────────────────
const easeInOut = t => t < 0.5 ? 2*t*t : -1+(4-2*t)*t
const easeIn    = t => t*t
const easeOut   = t => 1-(1-t)*(1-t)
const bounce    = t => {
  const n1=7.5625, d1=2.75
  if (t < 1/d1)       return n1*t*t
  if (t < 2/d1)       return n1*(t-=1.5/d1)*t+0.75
  if (t < 2.5/d1)     return n1*(t-=2.25/d1)*t+0.9375
  return                      n1*(t-=2.625/d1)*t+0.984375
}
const bezierPt  = (t,ax,ay,bx,by,cx,cy) => ({
  x:(1-t)*(1-t)*ax+2*t*(1-t)*bx+t*t*cx,
  y:(1-t)*(1-t)*ay+2*t*(1-t)*by+t*t*cy,
})

// ── Sub-type classifier — 80+ types ──────────────────────────────────────────
function getSubType(label='', tags=[]) {
  const T = new Set([...(tags||[]).map(t=>t.toLowerCase()), ...(label||'').toLowerCase().split(/[\s,/\-()]+/)])
  const has = (...w) => w.some(x => T.has(x))

  // ─ Fantastical / magical ─
  if (has('unicorn'))                                     return 'unicorn'
  if (has('pegasus'))                                     return 'pegasus'
  if (has('mermaid','merman','siren'))                    return 'mermaid'
  if (has('fairy','tinker','tinkerbell'))                 return 'fairy'
  if (has('superhero','superman','superwoman','hero','cape')) return 'superhero'
  if (has('ghost','spirit','phantom','boo'))              return 'ghost'
  if (has('witch','wizard','sorcerer','sorceress','warlock')) return 'witch'
  if (has('alien','extraterrestrial'))                    return 'alien'
  if (has('robot','android','cyborg'))                    return 'robot'
  if (has('dragon'))                                      return 'dragon'
  if (has('monster','ogre','giant'))                      return 'monster'
  if (has('vampire'))                                     return 'ghost'
  if (has('zombie'))                                      return 'zombie'
  if (has('angel'))                                       return 'fairy'
  if (has('dinosaur','t-rex','trex','dino','raptor','pterodactyl','brachiosaurus')) return 'dino'

  // ─ Sports balls ─
  if (has('basketball'))                                  return 'basketball'
  if (has('soccer') && has('ball'))                       return 'soccer'
  if (has('football') && !has('soccer'))                  return 'football'
  if (has('tennis ball') || (has('tennis')&&has('ball'))) return 'tennis'
  if (has('volleyball'))                                  return 'volleyball'
  if (has('bowling ball') || has('bowling'))              return 'bowling'
  if (has('golf ball') || (has('golf')&&has('ball')))     return 'golf'
  if (has('baseball'))                                    return 'baseball'
  if (has('ping pong') || has('pingpong') || has('table tennis')) return 'tennis'
  if (has('frisbee','disc','discus'))                     return 'frisbee'
  if (has('ball'))                                        return 'ball'

  // ─ Vehicles ─
  if (has('race car','racecar','formula','f1'))           return 'race_car'
  if (has('ambulance'))                                   return 'ambulance'
  if (has('fire truck','firetruck','fire engine'))        return 'fire_truck'
  if (has('police car','police'))                         return 'police_car'
  if (has('monster truck'))                               return 'monster_truck'
  if (has('car','truck','bus','van','scooter','tractor','jeep','taxi','auto')) return 'car'
  if (has('bicycle','bike','cycle'))                      return 'bicycle'
  if (has('skateboard','skate'))                          return 'skateboard'
  if (has('train','tram','subway'))                       return 'train'
  if (has('rocket','spaceship'))                          return 'rocket'
  if (has('ufo','flying saucer'))                         return 'ufo'
  if (has('plane','airplane','jet','aircraft'))           return 'plane'
  if (has('helicopter'))                                  return 'helicopter'
  if (has('boat','ship','sailboat','canoe','yacht','ferry','pirate ship')) return 'boat'
  if (has('submarine'))                                   return 'submarine'
  if (has('kite'))                                        return 'kite'
  if (has('balloon','hot air'))                           return 'balloon'
  if (has('paper plane','paper airplane'))                return 'paper_plane'

  // ─ Sea creatures ─
  if (has('shark'))                                       return 'shark'
  if (has('fish','goldfish','clownfish','seahorse','nemo')) return 'fish'
  if (has('whale','blue whale','humpback'))               return 'whale'
  if (has('dolphin','porpoise'))                          return 'dolphin'
  if (has('seal','sea lion','walrus'))                    return 'seal'
  if (has('octopus'))                                     return 'octopus'
  if (has('jellyfish'))                                   return 'jellyfish'
  if (has('crab','lobster'))                              return 'crab'
  if (has('turtle','tortoise'))                           return 'turtle'

  // ─ Flying creatures ─
  if (has('butterfly'))                                   return 'butterfly'
  if (has('dragonfly'))                                   return 'dragonfly'
  if (has('firefly','glowworm'))                          return 'firefly'
  if (has('bee','bumblebee','honeybee','wasp'))           return 'bee'
  if (has('ladybug','ladybird'))                          return 'ladybug'
  if (has('bat'))                                         return 'bat'
  if (has('owl'))                                         return 'owl'
  if (has('peacock','peahen'))                            return 'peacock'
  if (has('penguin'))                                     return 'penguin'
  if (has('flamingo'))                                    return 'flamingo'
  if (has('parrot','macaw','toucan'))                     return 'parrot'
  if (has('duck','goose','swan'))                         return 'duck'
  if (has('eagle','hawk','falcon','vulture'))             return 'eagle'
  if (has('bird','crow','pigeon','robin','dove','sparrow','hen','rooster','chicken')) return 'bird'

  // ─ Land animals ─
  if (has('horse','pony'))                                return 'horse'
  if (has('dog','puppy','pup'))                           return 'dog'
  if (has('cat','kitten'))                                return 'cat'
  if (has('rabbit','bunny'))                              return 'rabbit'
  if (has('kangaroo','wallaby'))                          return 'kangaroo'
  if (has('frog','toad'))                                 return 'frog'
  if (has('elephant'))                                    return 'elephant'
  if (has('giraffe'))                                     return 'giraffe'
  if (has('lion','tiger','cheetah','jaguar','leopard','panther')) return 'lion'
  if (has('bear','panda','koala'))                        return 'bear'
  if (has('wolf','fox'))                                  return 'wolf'
  if (has('monkey','gorilla','ape','chimpanzee','orangutan')) return 'monkey'
  if (has('zebra'))                                       return 'zebra'
  if (has('hippo','hippopotamus','rhino','rhinoceros'))   return 'elephant'
  if (has('camel'))                                       return 'camel'
  if (has('deer','reindeer','moose','stag'))              return 'deer'
  if (has('cow','bull','buffalo','ox'))                   return 'cow'
  if (has('pig','piglet','hog'))                          return 'pig'
  if (has('sheep','lamb','goat'))                         return 'sheep'
  if (has('squirrel','chipmunk'))                         return 'squirrel'
  if (has('hedgehog'))                                    return 'hedgehog'
  if (has('hamster','guinea pig'))                        return 'rabbit'
  if (has('raccoon'))                                     return 'raccoon'
  if (has('snake','python','cobra','anaconda'))           return 'snake'
  if (has('lizard','gecko','chameleon','iguana','crocodile','alligator')) return 'lizard'
  if (has('spider'))                                      return 'spider'
  if (has('snail'))                                       return 'snail'
  if (has('caterpillar'))                                 return 'caterpillar'
  if (has('worm'))                                        return 'worm'
  if (has('ant'))                                         return 'ant'
  if (has('person','human','boy','girl','child','kid','baby','man','woman','stick figure','stick man','people')) return 'person'

  // ─ Spinners / celestial ─
  if (has('sun','solar'))                                 return 'sun'
  if (has('moon','crescent'))                             return 'moon'
  if (has('comet','meteor','shooting star','meteorite'))  return 'comet'
  if (has('black hole','blackhole'))                      return 'black_hole'
  if (has('satellite'))                                   return 'satellite'
  if (has('tornado','hurricane','twister'))               return 'tornado'
  if (has('wheel','gear','fan','windmill','pinwheel','propeller')) return 'wheel'
  if (has('planet','earth','globe','saturn','jupiter','mars','neptune','uranus')) return 'planet'
  if (has('clock','watch'))                               return 'clock'
  if (has('compass'))                                     return 'compass'

  // ─ Swayers / nature ─
  if (has('tree','palm','bamboo','pine','oak','maple','willow','cactus')) return 'tree'
  if (has('flower','tulip','rose','sunflower','daisy','lily','orchid','poppy','cherry blossom')) return 'flower'
  if (has('grass','seaweed','reed','wheat','corn'))       return 'grass'
  if (has('mushroom','toadstool'))                        return 'mushroom'
  if (has('rainbow'))                                     return 'rainbow'
  if (has('thundercloud','storm cloud') || (has('cloud')&&has('thunder'))) return 'thundercloud'
  if (has('cloud','cumulus'))                             return 'cloud'
  if (has('snowflake','snow','blizzard') && !has('man','ball','fight')) return 'snowflake'
  if (has('snowman','snow man'))                          return 'snowman'
  if (has('rain','raindrop','drizzle'))                   return 'rain'
  if (has('volcano','eruption'))                          return 'volcano'
  if (has('wave','ocean wave','sea wave'))                return 'wave'

  // ─ Pulsers / fire / effects ─
  if (has('heart','love'))                                return 'heart'
  if (has('fire','flame','campfire','bonfire'))           return 'fire'
  if (has('candle'))                                      return 'candle'
  if (has('lightning','thunder','bolt'))                  return 'lightning'
  if (has('firework','fireworks','explosion','boom'))     return 'firework'
  if (has('bubble','soap bubble'))                        return 'bubble'
  if (has('sparkler'))                                    return 'sparkler'
  if (has('diamond','gem','crystal','ruby','emerald'))    return 'gem'
  if (has('star','sparkle'))                              return 'star'

  // ─ Food ─
  if (has('ice cream','icecream','popsicle','gelato'))    return 'ice_cream'
  if (has('cake','cupcake','birthday cake','muffin'))     return 'cake'
  if (has('pizza'))                                       return 'pizza'
  if (has('donut','doughnut','cookie','biscuit'))         return 'donut'
  if (has('lollipop','candy','sucker'))                   return 'lollipop'
  if (has('watermelon','melon'))                          return 'watermelon'
  if (has('apple','orange','pear','mango','grape','strawberry','cherry','banana','pineapple','fruit')) return 'fruit'
  if (has('burger','hamburger','sandwich','hot dog','sausage')) return 'burger'

  // ─ Objects / toys ─
  if (has('gift','present','package'))                    return 'gift'
  if (has('coin','penny','dime','quarter','money'))       return 'coin'
  if (has('crown','tiara','queen','king'))                return 'crown'
  if (has('trophy','cup','award','medal'))                return 'trophy'
  if (has('magic wand','wand'))                           return 'magic_wand'
  if (has('key'))                                         return 'key'
  if (has('lock','padlock'))                              return 'lock'
  if (has('book','notebook'))                             return 'book'
  if (has('pencil','pen'))                                return 'pencil'
  if (has('paintbrush','brush','palette'))                return 'paintbrush'
  if (has('umbrella','brolly'))                           return 'umbrella'
  if (has('yo-yo','yoyo'))                                return 'yoyo'
  if (has('boomerang'))                                   return 'boomerang'
  if (has('arrow'))                                       return 'arrow'
  if (has('target','bullseye','dartboard'))               return 'target'
  if (has('lighthouse'))                                  return 'lighthouse'
  if (has('anchor'))                                      return 'anchor'
  if (has('hourglass'))                                   return 'hourglass'
  if (has('lamp','lantern'))                              return 'lantern'
  if (has('telephone','phone','mobile'))                  return 'phone'
  if (has('music note','note','musical','eighth','quarter note')) return 'music_note'
  if (has('drum','bongo','timpani'))                      return 'drum'
  if (has('guitar','ukulele','banjo'))                    return 'guitar'
  if (has('bell'))                                        return 'bell'
  if (has('tent','teepee','tipi'))                        return 'tent'

  return 'ball'
}

// ── Colour palettes ───────────────────────────────────────────────────────────
const P = {
  rainbow: ['#FF69B4','#FFD700','#00CED1','#98FB98','#DA70D6','#FF6347'],
  ocean:   ['#00BFFF','#40E0D0','#7FFFD4','#1E90FF','#87CEEB'],
  space:   ['#9B59B6','#3498DB','#F1C40F','#ECF0F1','#8E44AD'],
  jungle:  ['#228B22','#32CD32','#ADFF2F','#FFD700','#FF69B4'],
  nature:  ['#90EE90','#98FB98','#ADFF2F','#FFD700','#FF69B4'],
  fire:    ['#FF4500','#FF6347','#FFA500','#FFD700','#FF0000'],
  sun:     ['#FFD700','#FFA500','#FF6347','#FFFF00','#FF8C00'],
  heart:   ['#FF0000','#FF69B4','#FF1493','#FF6B81','#C0392B'],
  space2:  ['#9B59B6','#3498DB','#F1C40F','#A9CCE3','#FAD7A0'],
  water:   ['#00BFFF','#40E0D0','#1E90FF','#7FFFD4','#87CEEB'],
  green:   ['#2ECC71','#27AE60','#82E0AA','#A9DFBF','#F9E79F'],
  bball:   ['#FF6B00','#FFD700','#FF4500','#FFFFFF','#FFA500'],
  soccer:  ['#2C2C2C','#FFFFFF','#4CAF50','#FFD700','#1565C0'],
  candy:   ['#FF69B4','#FF1493','#DA70D6','#9B59B6','#FFD700'],
  magic:   ['#FFD700','#FF69B4','#DA70D6','#00CED1','#98FB98'],
  ghost:   ['#9ECFFF','#C9E8FF','#E0F0FF','#B8D4FF','#FFFFFF'],
  food:    ['#FF6347','#FFA500','#FFD700','#F4A460','#FF69B4'],
  earth:   ['#8B7355','#556B2F','#6B8E23','#D2B48C','#90EE90'],
  sky:     ['#87CEEB','#B0E0E6','#4169E1','#1E90FF','#FFFFFF'],
}

function getPalette(obj={}) {
  const T = new Set([...(obj.tags||[]).map(t=>t.toLowerCase()), ...(obj.label||'').toLowerCase().split(/[\s,/\-()]+/)])
  const has = (...w) => w.some(x => T.has(x))
  if (has('sun'))                   return P.sun
  if (has('heart','love'))          return P.heart
  if (has('fire','flame','volcano','lava')) return P.fire
  if (has('basketball'))            return P.bball
  if (has('soccer','football'))     return P.soccer
  if (has('ghost','spirit','fairy','magic','wizard','witch','unicorn','mermaid')) return P.magic
  if (has('alien','ufo','rocket','spaceship','planet','star','space','moon','comet','satellite')) return P.space2
  if (has('ocean','water','fish','sea','whale','dolphin','submarine','jellyfish')) return P.water
  if (has('tree','flower','plant','grass','nature','frog','snake','turtle','cactus')) return P.green
  if (has('cloud','rain','snow','sky'))  return P.sky
  if (has('cake','candy','lollipop','ice cream','donut','cookie')) return P.candy
  if (has('dinosaur','dino'))       return P.earth
  return P[obj.scene] ?? P.rainbow
}

// ── Particle ──────────────────────────────────────────────────────────────────
class Particle {
  constructor(x, y, colors, opts={}) {
    this.x=x; this.y=y
    const ang=opts.angle??(Math.random()*Math.PI*2)
    const spd=opts.speed??(1+Math.random()*3)
    this.vx=Math.cos(ang)*spd; this.vy=Math.sin(ang)*spd-(opts.upBias||0)
    this.gravity=opts.gravity??0.07
    this.life=1; this.decay=0.012+Math.random()*0.022
    this.size=opts.size??(3+Math.random()*5)
    this.color=colors[Math.floor(Math.random()*colors.length)]
    this.rot=Math.random()*Math.PI*2; this.rotV=(Math.random()-0.5)*0.25
    this.shape=opts.shape??'circle'
  }
  update() {
    this.x+=this.vx; this.y+=this.vy; this.vy+=this.gravity
    this.vx*=0.97; this.life-=this.decay; this.rot+=this.rotV
  }
  draw(ctx) {
    if(this.life<=0) return
    const s=this.size*Math.max(0,this.life)
    ctx.save(); ctx.globalAlpha=Math.max(0,this.life*0.9); ctx.fillStyle=this.color
    ctx.translate(this.x,this.y); ctx.rotate(this.rot)
    if      (this.shape==='star')  { _star(ctx,0,0,5,s,s*0.42) }
    else if (this.shape==='heart') { _heart(ctx,0,0,s*0.6) }
    else if (this.shape==='spark') { ctx.fillRect(-s*0.12,-s,s*0.24,s*2) }
    else if (this.shape==='ring')  { ctx.beginPath();ctx.arc(0,0,s,0,Math.PI*2);ctx.strokeStyle=this.color;ctx.lineWidth=2;ctx.stroke() }
    else if (this.shape==='drop')  { ctx.beginPath();ctx.ellipse(0,0,s*0.4,s*0.8,0,0,Math.PI*2);ctx.fill() }
    else { ctx.beginPath();ctx.arc(0,0,s,0,Math.PI*2);ctx.fill() }
    ctx.restore()
  }
}
function _star(ctx,cx,cy,sp,o,i) {
  let r=-Math.PI/2, st=Math.PI/sp
  ctx.beginPath(); ctx.moveTo(cx+Math.cos(r)*o,cy+Math.sin(r)*o)
  for(let n=0;n<sp;n++){r+=st;ctx.lineTo(cx+Math.cos(r)*i,cy+Math.sin(r)*i);r+=st;ctx.lineTo(cx+Math.cos(r)*o,cy+Math.sin(r)*o)}
  ctx.closePath(); ctx.fill()
}
function _heart(ctx,x,y,s) {
  ctx.beginPath(); ctx.moveTo(x,y+s*0.3)
  ctx.bezierCurveTo(x,y-s*0.5,x-s,y-s*0.5,x-s,y+s*0.3)
  ctx.bezierCurveTo(x-s,y+s*1.1,x,y+s*1.3,x,y+s*1.6)
  ctx.bezierCurveTo(x,y+s*1.3,x+s,y+s*1.1,x+s,y+s*0.3)
  ctx.bezierCurveTo(x+s,y-s*0.5,x,y-s*0.5,x,y+s*0.3)
  ctx.closePath(); ctx.fill()
}

// ── Canvas helpers ────────────────────────────────────────────────────────────
// Detect which horizontal direction the drawn object is facing.
// Counts "detail weight" (dark, opaque pixels) in left vs right half.
// More weight on the left → object faces left, and vice versa.
function detectFacing(canvas) {
  const ctx = canvas.getContext('2d', {willReadFrequently: true})
  const {width: w, height: h} = canvas
  const mid = Math.floor(w / 2)
  const img = ctx.getImageData(0, 0, w, h)
  const d = img.data
  let leftWeight = 0, rightWeight = 0
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      const alpha = d[i + 3]
      if (alpha < 30) continue
      const darkness = (255 - (d[i] + d[i+1] + d[i+2]) / 3) * (alpha / 255)
      if (x < mid) leftWeight += darkness
      else rightWeight += darkness
    }
  }
  // Too close to call → fall back to canvas position (stored on canvas as _cx/_W)
  const diff = Math.abs(leftWeight - rightWeight) / (leftWeight + rightWeight + 1)
  if (diff < 0.05) return canvas._cx < canvas._W * 0.5 ? 'right' : 'left'
  return leftWeight > rightWeight ? 'left' : 'right'
}

function unionBbox(objects) {
  const bb=(objects||[]).map(o=>o.boundingBox).filter(b=>b&&b.w>0.02&&b.h>0.02)
  if(!bb.length) return null
  const x1=Math.min(...bb.map(b=>b.x)), y1=Math.min(...bb.map(b=>b.y))
  const x2=Math.max(...bb.map(b=>b.x+b.w)), y2=Math.max(...bb.map(b=>b.y+b.h))
  return {x:x1,y:y1,w:x2-x1,h:y2-y1}
}
function stripWhite(canvas) {
  const ctx=canvas.getContext('2d',{willReadFrequently:true})
  const img=ctx.getImageData(0,0,canvas.width,canvas.height), d=img.data
  // Only strip pixels that are truly white (all channels >248) AND fully opaque
  // — threshold was 225 which wiped out light-coloured drawing details
  for(let i=0;i<d.length;i+=4) {
    if(d[i]>248&&d[i+1]>248&&d[i+2]>248&&d[i+3]>200) d[i+3]=0
  }
  ctx.putImageData(img,0,0); return canvas
}
function extractCutout(drawCanvas, bbox, W, H) {
  let sx,sy,sw,sh
  if(bbox&&bbox.w>0.02&&bbox.h>0.02) {
    const pad=0.12  // increased from 0.07 — gives more breathing room around the object
    const x1=Math.max(0,(bbox.x-pad)*W)
    const y1=Math.max(0,(bbox.y-pad)*H)
    const x2=Math.min(W,(bbox.x+bbox.w+pad)*W)
    const y2=Math.min(H,(bbox.y+bbox.h+pad)*H)
    sx=x1; sy=y1; sw=x2-x1; sh=y2-y1
  } else { sx=0;sy=0;sw=W;sh=H }
  sw=Math.max(sw,40); sh=Math.max(sh,40)
  const off=document.createElement('canvas'); off.width=sw; off.height=sh
  off.getContext('2d').drawImage(drawCanvas,sx,sy,sw,sh,0,0,sw,sh)
  stripWhite(off)
  // stash canvas position so detectFacing can fall back to it
  off._cx = sx+sw/2; off._W = drawCanvas ? drawCanvas.width : sw*2
  const facing = detectFacing(off)
  return {canvas:off,sx,sy,sw,sh,cx:sx+sw/2,cy:sy+sh/2,facing}
}
function drawCutout(ctx,cut,x,y,{sx=1,sy=1,rot=0,alpha=1,glow=0,glowColor='#FFD700'}={}) {
  ctx.save(); ctx.globalAlpha=Math.max(0,Math.min(1,alpha))
  if(glow>0){ctx.shadowBlur=glow;ctx.shadowColor=glowColor}
  ctx.translate(x,y); if(rot)ctx.rotate(rot); ctx.scale(sx,sy)
  ctx.drawImage(cut.canvas,-cut.sw/2,-cut.sh/2,cut.sw,cut.sh)
  ctx.restore()
}
function spawnAmbient(particles,scene,W,H,colors) {
  for(let i=0;i<12;i++) particles.push(new Particle(Math.random()*W,H*0.2+Math.random()*H*0.8,colors,{
    speed:0.4+Math.random()*1.1,upBias:1.5,gravity:-0.02,
    size:1.5+Math.random()*3,shape:scene==='space'?'star':'circle',
    angle:-Math.PI/2+(Math.random()-0.5)*1.3,
  }))
}
function burst(particles,x,y,colors,{n=20,minS=3,maxS=7,minSpd=2,maxSpd=8,grav=0.08,shape='circle'}={}) {
  for(let i=0;i<n;i++) particles.push(new Particle(x,y,colors,{
    angle:Math.random()*Math.PI*2,speed:minSpd+Math.random()*(maxSpd-minSpd),
    gravity:grav,size:minS+Math.random()*(maxS-minS),shape,
  }))
}
function trail(particles,x,y,colors,{shape='circle',size=3,grav=0.04,angle,speed=1}={}) {
  particles.push(new Particle(x,y,colors,{
    angle:angle??(Math.random()*Math.PI*2),speed:speed*(0.5+Math.random()),
    gravity:grav,size:size*(0.7+Math.random()*0.6),shape,
  }))
}

// ── Shared primitives ─────────────────────────────────────────────────────────
function makeHopAnim(cut,W,H,colors,{hopH=0.28,hops=3,pShape='circle',highness=1,spread=1}={}) {
  const cx=cut.cx, baseY=cut.cy
  const peakY=Math.max(baseY-H*hopH*highness, cut.sh*0.55)
  const floorY=Math.min(baseY+H*0.12, H-cut.sh*0.5)
  const tH=floorY-peakY; let frame=0
  return { draw(ctx,t,particles) {
    frame++
    const bt=(t*hops)%1, yOff=bounce(bt)*tH, y=peakY+yOff
    const atFloor=bt>0.86
    const scX=atFloor?1+((bt-0.86)/0.14)*0.38:1
    const scY=atFloor?1/scX: bt<0.18?(1+(0.18-bt)/0.18*0.18):1
    if(atFloor&&bt<0.93&&frame%3===0) {
      for(let i=0;i<5*spread;i++) trail(particles,cx,floorY,colors,{angle:Math.PI+(Math.random()-0.5)*Math.PI,speed:1.5+Math.random()*2.5,grav:0.1,size:2+Math.random()*3.5,shape:pShape})
    }
    drawCutout(ctx,cut,cx,y,{sx:scX,sy:scY,glow:10+(1-yOff/tH)*20,glowColor:colors[0]})
  }}
}
function makeDriveAnim(cut,W,H,colors,{bobH=4,bobF=8,speedLines=false,trailC=1,trailShape='circle',maxX=1}={}) {
  // Use detected facing direction — never flip the drawing
  const goRight = cut.facing === 'right'
  const startX=cut.cx, endX=goRight?(W+cut.sw)*maxX:(-cut.sw)*maxX, y=cut.cy; let frame=0
  return { draw(ctx,t,particles) {
    frame++
    const x=startX+(endX-startX)*easeInOut(t), bob=Math.abs(Math.sin(t*Math.PI*bobF))*bobH
    if(frame%2===0&&particles.length<80) {
      // trail comes from the back — opposite of facing direction
      const bx=goRight?x-cut.sw*0.5:x+cut.sw*0.5
      if(speedLines) for(let i=0;i<2;i++) trail(particles,bx,y+(Math.random()-0.5)*cut.sh*0.3,['#ccc','#aaa','#bbb'],{angle:goRight?Math.PI:0,speed:3+Math.random()*5,grav:0,size:1.5+Math.random()*2,shape:'spark'})
      for(let i=0;i<trailC;i++) trail(particles,bx+(Math.random()-0.5)*8,y+cut.sh*0.35,colors,{angle:Math.random()*Math.PI*2,speed:0.4+Math.random()*1.5,grav:0.06,size:2+Math.random()*3})
    }
    drawCutout(ctx,cut,x,y-bob,{glow:8,glowColor:colors[0]})
  }}
}
function makeFlyAnim(cut,W,H,colors,{arcH=0.25,wingBeat=14,trailColors}={}) {
  const goRight = cut.facing === 'right'
  const startX=cut.cx, endX=goRight?W+cut.sw:-cut.sw, startY=cut.cy; let frame=0
  const tc=trailColors||colors
  return { draw(ctx,t,particles) {
    frame++
    const x=startX+(endX-startX)*easeInOut(t), y=startY-Math.sin(t*Math.PI)*H*arcH+Math.sin(t*Math.PI*6)*H*0.025
    const scY=1+Math.sin(t*Math.PI*wingBeat)*0.18
    // trail from the back of the object
    if(frame%3===0&&particles.length<60) trail(particles,goRight?x-cut.sw*0.4:x+cut.sw*0.4,y,tc,{size:2+Math.random()*3,grav:0.01})
    drawCutout(ctx,cut,x,y,{sy:scY,rot:Math.sin(t*Math.PI*4)*0.06,glow:12,glowColor:colors[0]})
  }}
}

// ── Animators — 80+ types ─────────────────────────────────────────────────────
const ANIMATORS = {

  // ──── FANTASY / MAGICAL ────

  unicorn(cut,W,H,c) {
    const rc=['#FF0000','#FF7F00','#FFFF00','#00FF00','#4169E1','#8B00FF','#FF69B4']
    const goRight=cut.facing==="right", sx=cut.cx, ex=goRight?W+cut.sw:-cut.sw, y=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const x=sx+(ex-sx)*easeInOut(t), bob=Math.abs(Math.sin(t*Math.PI*8))*H*0.04, scX=1
      for(let i=0;i<2;i++) trail(particles,goRight?x-cut.sw*0.3:x+cut.sw*0.3,y+bob,rc,{shape:'star',size:2+Math.random()*4,grav:0.01,speed:0.5+Math.random()*2})
      drawCutout(ctx,cut,x,y-bob,{sx:scX,glow:20+Math.sin(t*Math.PI*6)*10,glowColor:'#FF69B4'})
    }}
  },
  pegasus(cut,W,H,c) { return ANIMATORS.unicorn(cut,W,H,['#FFD700','#FFFFFF','#87CEEB','#9B59B6']) },

  mermaid(cut,W,H,c) {
    const mc=['#00CED1','#7FFFD4','#40E0D0','#FF69B4','#DA70D6']
    const goRight=cut.facing==="right", sx=cut.cx, ex=goRight?W+cut.sw:-cut.sw, sy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const x=sx+(ex-sx)*easeInOut(t), y=sy+Math.sin(t*Math.PI*4)*H*0.1
      const rot=Math.sin(t*Math.PI*4)*0.15, scX=1
      if(frame%2===0) trail(particles,goRight?x-cut.sw*0.4:x+cut.sw*0.4,y,mc,{shape:'star',size:2+Math.random()*4,grav:-0.02})
      drawCutout(ctx,cut,x,y,{sx:scX,rot,glow:18+Math.sin(t*Math.PI*8)*8,glowColor:'#00CED1'})
    }}
  },

  fairy(cut,W,H,c) {
    const fc=['#FFD700','#FF69B4','#DA70D6','#FFFFFF','#87CEEB']; let frame=0
    const cx=cut.cx, cy=cut.cy
    return { draw(ctx,t,particles) {
      frame++
      const x=cx+Math.sin(t*Math.PI*4)*W*0.28+Math.sin(t*Math.PI*9)*W*0.07
      const y=cy+Math.sin(t*Math.PI*6)*H*0.18-H*0.02, scY=1+Math.sin(t*Math.PI*20)*0.2
      if(frame%2===0) trail(particles,x,y,fc,{shape:'star',size:1.5+Math.random()*3.5,grav:-0.01})
      drawCutout(ctx,cut,x,y,{sy:scY,glow:20+Math.sin(t*Math.PI*12)*10,glowColor:'#FFD700'})
    }}
  },

  superhero(cut,W,H,c) {
    const goRight=cut.facing==="right"
    const cx=cut.cx, startY=cut.cy, endY=-cut.sh*2; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const x=cx+(goRight?1:-1)*easeIn(t)*W*0.3, y=startY+(endY-startY)*easeIn(t)
      const scX=1, rot=(goRight?1:-1)*(-0.35+t*0.35)
      if(frame%2===0) trail(particles,x,y+cut.sh*0.15,c,{shape:'star',size:2+Math.random()*4,grav:-0.02,angle:(goRight?Math.PI:0)+(Math.random()-0.5)*0.5})
      drawCutout(ctx,cut,x,y,{sx:scX,rot,glow:18+Math.sin(t*Math.PI*8)*8,glowColor:c[0]})
    }}
  },

  ghost(cut,W,H,c) {
    const gc=['#9ECFFF','#C9E8FF','#E0F0FF','#B8D4FF']
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const float=Math.sin(t*Math.PI*3)*H*0.08+Math.sin(t*Math.PI*7)*H*0.02
      const alpha=0.65+Math.sin(t*Math.PI*5)*0.25, scale=1+Math.sin(t*Math.PI*4)*0.06
      if(frame%4===0) trail(particles,cx+(Math.random()-0.5)*cut.sw*0.7,cy+float+cut.sh*0.3,gc,{grav:-0.015,size:2+Math.random()*4})
      drawCutout(ctx,cut,cx,cy+float,{sx:scale,sy:scale,alpha,glow:22+Math.sin(t*Math.PI*8)*12,glowColor:'#9ECFFF'})
    }}
  },

  zombie(cut,W,H,c) {
    const zc=['#8FBC8F','#696969','#556B2F','#6B8E23']
    const goRight=cut.facing==="right", sx=cut.cx, ex=goRight?W+cut.sw:-cut.sw, y=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const x=sx+(ex-sx)*easeInOut(t)*0.55
      const tilt=Math.sin(t*Math.PI*6)*0.18, bob=Math.abs(Math.sin(t*Math.PI*6))*H*0.025, scX=1
      if(frame%8===0) trail(particles,x,y,zc,{shape:'circle',size:2+Math.random()*3,grav:0.04})
      drawCutout(ctx,cut,x,y-bob,{sx:scX,rot:tilt,glow:10,glowColor:'#8FBC8F'})
    }}
  },

  witch(cut,W,H,c) {
    const wc=['#9B59B6','#DA70D6','#FFD700','#FF69B4','#2C2C2C']
    const goRight=cut.facing==="right", sx=cut.cx, ex=goRight?W+cut.sw:-cut.sw, startY=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const x=sx+(ex-sx)*easeInOut(t), y=startY-Math.sin(t*Math.PI)*H*0.22+Math.sin(t*Math.PI*7)*H*0.04
      const scX=1
      if(frame%2===0) trail(particles,goRight?x-cut.sw*0.4:x+cut.sw*0.4,y,wc,{shape:'star',size:2+Math.random()*4,grav:0.01})
      drawCutout(ctx,cut,x,y,{sx:scX,glow:16+Math.sin(t*Math.PI*6)*8,glowColor:'#9B59B6'})
    }}
  },

  alien(cut,W,H,c) {
    const ac=['#00FF7F','#7FFF00','#39FF14','#00FA9A']
    const cx=cut.cx, cy=cut.cy; let frame=0, beamFrame=0
    return { draw(ctx,t,particles) {
      frame++
      const x=cx+Math.sin(t*Math.PI*3)*W*0.25+Math.sin(t*Math.PI*8)*W*0.05
      const y=cy+Math.sin(t*Math.PI*5)*H*0.12, rot=Math.sin(t*Math.PI*4)*0.12
      if(frame%120===60) beamFrame=frame
      if(frame-beamFrame<30) {
        const bf=1-(frame-beamFrame)/30
        ctx.save(); ctx.fillStyle=`rgba(0,255,127,${0.15*bf})`
        ctx.beginPath(); ctx.moveTo(x,y+cut.sh*0.3); ctx.lineTo(x-cut.sw*0.5*bf,y+H*0.5*bf); ctx.lineTo(x+cut.sw*0.5*bf,y+H*0.5*bf); ctx.closePath(); ctx.fill(); ctx.restore()
      }
      if(frame%3===0) trail(particles,x+(Math.random()-0.5)*cut.sw*0.6,y+cut.sh*0.2,ac,{shape:'star',size:2+Math.random()*4,grav:-0.02})
      drawCutout(ctx,cut,x,y,{rot,glow:22+Math.sin(t*Math.PI*10)*10,glowColor:'#00FF7F'})
    }}
  },

  robot(cut,W,H,c) {
    const rc=['#778899','#4169E1','#FFD700','#B0C4DE']
    const goRight=cut.facing==="right", sx=cut.cx, ex=goRight?W+cut.sw:-cut.sw, y=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const x=sx+(ex-sx)*easeInOut(t), bob=Math.abs(Math.sin(t*Math.PI*6))*H*0.02, scX=1
      if(frame%6===0) trail(particles,x+(Math.random()-0.5)*cut.sw*0.4,y,rc,{shape:'star',size:2+Math.random()*3,grav:0.04})
      drawCutout(ctx,cut,x,y-bob,{sx:scX,rot:Math.sin(t*Math.PI*6)*0.06,glow:12,glowColor:'#4169E1'})
    }}
  },

  monster(cut,W,H,c) { return makeHopAnim(cut,W,H,['#228B22','#32CD32','#800080','#FF4500'],{hopH:0.3,hops:3,pShape:'circle',spread:2}) },

  zombie(cut,W,H,c) {
    const zc=['#8FBC8F','#696969','#556B2F']
    const goRight=cut.facing==="right", sx=cut.cx, ex=goRight?W+cut.sw:-cut.sw, y=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const x=sx+(ex-sx)*easeInOut(t)*0.5, tilt=Math.sin(t*Math.PI*6)*0.2, bob=Math.abs(Math.sin(t*Math.PI*6))*H*0.02, scX=1
      if(frame%8===0) trail(particles,x,y,zc,{size:2+Math.random()*3,grav:0.04})
      drawCutout(ctx,cut,x,y-bob,{sx:scX,rot:tilt,glow:10,glowColor:'#8FBC8F'})
    }}
  },

  dino(cut,W,H,c) {
    const dc=['#228B22','#556B2F','#6B8E23','#8FBC8F']
    const goRight=cut.facing==="right", sx=cut.cx, ex=goRight?W+cut.sw:-cut.sw, y=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const x=sx+(ex-sx)*easeInOut(t), stomp=Math.abs(Math.sin(t*Math.PI*7))*H*0.04, scX=1
      if(stomp>H*0.03&&frame%3===0) for(let i=0;i<4;i++) trail(particles,x+(Math.random()-0.5)*cut.sw*0.7,y+cut.sh*0.4,dc,{angle:Math.PI+(Math.random()-0.5)*1.2,speed:1+Math.random()*3,grav:0.09,size:2+Math.random()*4})
      drawCutout(ctx,cut,x,y-stomp,{sx:scX,glow:12+stomp*80,glowColor:dc[0]})
    }}
  },

  // ──── SPORTS BALLS ────

  basketball(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy, floorY=Math.min(cy+H*0.34,H-cut.sh*0.5-8), tH=floorY-cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const bt=(t*3.5)%1, yOff=bounce(bt)*tH, y=cy+yOff, atFloor=bt>0.85
      const scX=atFloor?1+((bt-0.85)/0.15)*0.5:1, scY=atFloor?1/scX: bt<0.18?(1+(0.18-bt)/0.18*0.22):1
      if(atFloor&&bt<0.93&&frame%2===0) for(let i=0;i<4;i++) trail(particles,cx+(Math.random()-0.5)*cut.sw*0.7,floorY,P.bball,{angle:Math.PI+(Math.random()-0.5)*1.4,speed:1.5+Math.random()*3,grav:0.09,size:2+Math.random()*3})
      drawCutout(ctx,cut,cx,y,{sx:scX,sy:scY,rot:t*Math.PI*6,glow:atFloor?28:10+(1-yOff/tH)*18,glowColor:P.bball[0]})
    }}
  },
  soccer(cut,W,H,c) {
    const goRight=cut.facing==="right", sx=cut.cx, ex=goRight?W+cut.sw:-cut.sw, y=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const x=sx+(ex-sx)*easeInOut(t), dist=Math.abs(x-sx)
      const rot=(dist/Math.max(cut.sw,cut.sh)/Math.PI)*(goRight?1:-1)*Math.PI*2
      if(frame%3===0) trail(particles,x,y+cut.sh*0.42,['#8B7355','#6B8E23','#90EE90'],{angle:Math.PI+(Math.random()-0.5)*0.8,speed:0.5+Math.random()*1.5,grav:0.05,size:2+Math.random()*3})
      drawCutout(ctx,cut,x,y,{rot,glow:10,glowColor:P.soccer[2]})
    }}
  },
  football(cut,W,H,c) {
    const goRight=cut.facing==="right", sx=cut.cx, ex=goRight?W+cut.sw:-cut.sw, startY=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const x=sx+(ex-sx)*easeInOut(t), y=startY-Math.sin(t*Math.PI)*H*0.3
      const rot=t*Math.PI*(goRight?10:-10)
      if(frame%4===0) trail(particles,goRight?x-cut.sw*0.3:x+cut.sw*0.3,y,c,{size:2+Math.random()*3,grav:0.04})
      drawCutout(ctx,cut,x,y,{rot,glow:12,glowColor:c[0]})
    }}
  },
  tennis(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy, amp=Math.min(W*0.35,200); let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const x=cx+Math.sin(t*Math.PI*5)*amp, y=cy+Math.abs(Math.sin(t*Math.PI*10))*H*0.2-H*0.1
      if(frame%2===0) trail(particles,x,y,['#ADFF2F','#7CFC00','#FFFF00'],{size:2+Math.random()*3,grav:0.05})
      drawCutout(ctx,cut,x,y,{rot:t*Math.PI*12,glow:14,glowColor:'#ADFF2F'})
    }}
  },
  volleyball(cut,W,H,c) { return ANIMATORS.basketball(cut,W,H,['#FFFFFF','#FFD700','#4169E1','#FF4500']) },
  bowling(cut,W,H,c) {
    const goRight=cut.facing==="right", sx=cut.cx, ex=goRight?W+cut.sw:-cut.sw, y=cut.cy; let explodeFired=false; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const x=sx+(ex-sx)*easeInOut(t), dist=Math.abs(x-sx)
      const rot=(dist/Math.max(cut.sw,cut.sh)/Math.PI)*(goRight?1:-1)*Math.PI*2
      if(t>0.85&&!explodeFired) { explodeFired=true; burst(particles,ex,y,['#FFFFFF','#FF4500','#FFD700','#4169E1'],{n:25,shape:'star'}) }
      drawCutout(ctx,cut,x,y,{rot,glow:10,glowColor:'#4169E1'})
    }}
  },
  golf(cut,W,H,c) {
    const goRight=cut.facing==="right", sx=cut.cx, ex=goRight?W+cut.sw:-cut.sw, startY=cut.cy; let landed=false; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const x=sx+(ex-sx)*easeInOut(t), y=startY-Math.sin(t*Math.PI)*H*0.35
      if(t>0.85&&!landed) { landed=true; burst(particles,ex,startY,['#90EE90','#228B22','#FFFFFF'],{n:15}) }
      drawCutout(ctx,cut,x,y,{rot:t*Math.PI*8,glow:10,glowColor:'#FFFFFF'})
    }}
  },
  baseball(cut,W,H,c) {
    const goRight=cut.facing==="right", sx=cut.cx, ex=goRight?W+cut.sw:-cut.sw, startY=cut.cy
    return { draw(ctx,t,particles) {
      const x=sx+(ex-sx)*easeInOut(t), y=startY-Math.sin(t*Math.PI*0.8)*H*0.15
      drawCutout(ctx,cut,x,y,{rot:t*Math.PI*8*(goRight?1:-1),glow:10,glowColor:'#FFFFFF'})
    }}
  },
  frisbee(cut,W,H,c) {
    const goRight=cut.facing==="right", sx=cut.cx, ex=goRight?W+cut.sw:-cut.sw, startY=cut.cy
    return { draw(ctx,t,particles) {
      const x=sx+(ex-sx)*easeInOut(t), y=startY+Math.sin(t*Math.PI*2)*H*0.08
      drawCutout(ctx,cut,x,y,{rot:t*Math.PI*12*(goRight?1:-1),sx:goRight?1:-1,glow:12,glowColor:c[0]})
    }}
  },
  ball(cut,W,H,c) { return makeHopAnim(cut,W,H,c,{hopH:0.32,hops:3}) },

  // ──── VEHICLES ────

  car(cut,W,H,c)         { return makeDriveAnim(cut,W,H,c,{bobH:5,bobF:10,speedLines:true,trailC:1}) },
  race_car(cut,W,H,c)    { return makeDriveAnim(cut,W,H,['#FF0000','#FFD700','#FFFFFF'],{bobH:3,bobF:14,speedLines:true,trailC:2}) },
  ambulance(cut,W,H,c) {
    const goRight=cut.facing==="right", sx=cut.cx, ex=goRight?W+cut.sw:-cut.sw, y=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const x=sx+(ex-sx)*easeInOut(t), bob=Math.abs(Math.sin(t*Math.PI*8))*4, scX=1
      const sirenColor=frame%30<15?'#FF0000':'#0000FF'
      if(frame%2===0) trail(particles,goRight?x-cut.sw*0.5:x+cut.sw*0.5,y+(Math.random()-0.5)*cut.sh*0.3,[sirenColor,'#FFFFFF'],{angle:goRight?Math.PI:0,speed:2+Math.random()*3,grav:0,size:2+Math.random()*3,shape:'spark'})
      drawCutout(ctx,cut,x,y-bob,{sx:scX,glow:15,glowColor:sirenColor})
    }}
  },
  fire_truck(cut,W,H,c) {
    const goRight=cut.facing==="right", sx=cut.cx, ex=goRight?W+cut.sw:-cut.sw, y=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const x=sx+(ex-sx)*easeInOut(t), bob=Math.abs(Math.sin(t*Math.PI*8))*4, scX=1
      if(frame%2===0) for(let i=0;i<2;i++) trail(particles,goRight?x+cut.sw*0.4:x-cut.sw*0.4,y-cut.sh*0.2+Math.random()*cut.sh*0.3,['#00BFFF','#87CEEB','#FFFFFF'],{angle:(goRight?0:Math.PI)+(Math.random()-0.5)*0.6,speed:2+Math.random()*3,grav:0.1,size:2+Math.random()*4,shape:'drop'})
      drawCutout(ctx,cut,x,y-bob,{sx:scX,glow:16,glowColor:'#FF0000'})
    }}
  },
  police_car(cut,W,H,c) {
    const goRight=cut.facing==="right", sx=cut.cx, ex=goRight?W+cut.sw:-cut.sw, y=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const x=sx+(ex-sx)*easeInOut(t), bob=Math.abs(Math.sin(t*Math.PI*8))*4, scX=1
      const sirenColor=frame%20<10?'#FF0000':'#0000FF'
      drawCutout(ctx,cut,x,y-bob,{sx:scX,glow:20,glowColor:sirenColor})
    }}
  },
  monster_truck(cut,W,H,c) { return makeDriveAnim(cut,W,H,['#FF4500','#8B0000','#FFD700'],{bobH:H*0.07,bobF:7,trailC:3}) },
  train(cut,W,H,c)         { return makeDriveAnim(cut,W,H,['#556B2F','#808080','#FFD700'],{bobH:3,bobF:6,speedLines:true}) },
  bicycle(cut,W,H,c)       { return makeDriveAnim(cut,W,H,['#4169E1','#FFD700','#FFFFFF'],{bobH:4,bobF:9}) },
  skateboard(cut,W,H,c) {
    const goRight=cut.facing==="right", sx=cut.cx, ex=goRight?W+cut.sw:-cut.sw, startY=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const x=sx+(ex-sx)*easeInOut(t), scX=1
      const jumpT=(t*3)%1, jumpY=Math.sin(jumpT*Math.PI)*H*0.12
      if(jumpT<0.05&&t>0.1) burst(particles,x,startY,c,{n:8,minSpd:1,maxSpd:4,grav:0.08})
      drawCutout(ctx,cut,x,startY-jumpY,{sx:scX,rot:(goRight?1:-1)*jumpY/H*0.15,glow:10,glowColor:c[0]})
    }}
  },
  rocket(cut,W,H,c) {
    const cx=cut.cx, startY=cut.cy, endY=-cut.sh; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const y=startY+(endY-startY)*easeIn(t), wobble=Math.sin(t*Math.PI*10)*3*(1-t)
      if(frame%1===0) for(let i=0;i<4;i++) trail(particles,cx+wobble+(Math.random()-0.5)*cut.sw*0.25,y+cut.sh*0.42,P.fire,{angle:Math.PI/2+(Math.random()-0.5)*0.5,speed:2+Math.random()*4,grav:0.12,size:3+Math.random()*6,shape:'spark'})
      drawCutout(ctx,cut,cx+wobble,y,{glow:22+Math.sin(t*Math.PI*8)*8,glowColor:'#FFD700'})
    }}
  },
  ufo(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const x=cx+Math.sin(t*Math.PI*3)*W*0.25, y=cy+Math.sin(t*Math.PI*5)*H*0.1
      if(frame%3===0) trail(particles,x,y+cut.sh*0.4,P.space2,{shape:'star',size:2+Math.random()*4,grav:-0.02})
      drawCutout(ctx,cut,x,y,{rot:Math.sin(t*Math.PI*4)*0.15,glow:22+Math.sin(t*Math.PI*10)*10,glowColor:'#9B59B6'})
    }}
  },
  plane(cut,W,H,c)       { return makeFlyAnim(cut,W,H,['#FFFFFF','#B0E0E6','#87CEEB'],{arcH:0.22,wingBeat:0,trailColors:['#FFFFFF','#B0E0E6']}) },
  helicopter(cut,W,H,c)  { return makeFlyAnim(cut,W,H,c,{arcH:0.18,wingBeat:0}) },
  paper_plane(cut,W,H,c) {
    const goRight=cut.facing==="right", sx=cut.cx, ex=goRight?W+cut.sw:-cut.sw, startY=cut.cy
    return { draw(ctx,t,particles) {
      const x=sx+(ex-sx)*easeInOut(t), y=startY-Math.sin(t*Math.PI)*H*0.2+Math.sin(t*Math.PI*8)*H*0.03
      const scX=1, rot=Math.sin(t*Math.PI*4)*0.12
      drawCutout(ctx,cut,x,y,{sx:scX,rot,glow:8,glowColor:'#FFFFFF'})
    }}
  },
  boat(cut,W,H,c) {
    const goRight=cut.facing==="right", sx=cut.cx, ex=goRight?W+cut.sw:-cut.sw, y=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const x=sx+(ex-sx)*easeInOut(t), bob=Math.sin(t*Math.PI*5)*H*0.03, rot=Math.sin(t*Math.PI*5)*0.1, scX=1
      if(frame%4===0) trail(particles,x,y+cut.sh*0.35,P.water,{size:2+Math.random()*3,grav:0.02})
      drawCutout(ctx,cut,x,y+bob,{sx:scX,rot,glow:10,glowColor:P.water[0]})
    }}
  },
  submarine(cut,W,H,c) {
    const goRight=cut.facing==="right", sx=cut.cx, ex=goRight?W+cut.sw:-cut.sw, y=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const x=sx+(ex-sx)*easeInOut(t), bob=Math.sin(t*Math.PI*4)*H*0.06, scX=1
      if(frame%3===0) trail(particles,goRight?x-cut.sw*0.45:x+cut.sw*0.45,y+bob,P.water,{angle:-Math.PI/2+(Math.random()-0.5)*0.6,speed:0.5+Math.random()*1.5,grav:-0.04,size:3+Math.random()*4})
      drawCutout(ctx,cut,x,y+bob,{sx:scX,glow:14,glowColor:P.water[0]})
    }}
  },
  kite(cut,W,H,c) {
    const cx=cut.cx, startY=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const x=cx+Math.sin(t*Math.PI*3)*W*0.18
      const y=startY-Math.sin(t*Math.PI)*H*0.28+Math.sin(t*Math.PI*7)*H*0.04
      const rot=Math.sin(t*Math.PI*4)*0.18
      if(frame%3===0) trail(particles,cx+Math.sin(t*Math.PI*3+Math.PI)*W*0.1,y,c,{shape:'star',size:2+Math.random()*3,grav:0.02})
      drawCutout(ctx,cut,x,y,{rot,glow:14+Math.sin(t*Math.PI*6)*6,glowColor:c[0]})
    }}
  },
  balloon(cut,W,H,c) {
    const cx=cut.cx, startY=cut.cy, endY=-cut.sh; let popped=false; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const x=cx+Math.sin(t*Math.PI*5)*W*0.06
      if(t>0.85&&!popped) {
        popped=true; burst(particles,x,startY+(endY-startY)*0.85,c,{n:24,shape:'star',minSpd:2,maxSpd:8}); return
      }
      if(t>0.87) return
      const y=startY+(endY-startY)*easeInOut(t/0.85), scale=1+Math.sin(t*Math.PI*8)*0.04
      drawCutout(ctx,cut,x,y,{sx:scale,sy:scale,alpha:0.92,glow:12,glowColor:c[0]})
    }}
  },

  // ──── SEA CREATURES ────

  fish(cut,W,H,c) {
    const goRight=cut.facing==="right", sx=cut.cx, ex=goRight?W+cut.sw:-cut.sw, sy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const x=sx+(ex-sx)*easeInOut(t), y=sy+Math.sin(t*Math.PI*5)*H*0.1
      const rot=Math.sin(t*Math.PI*5)*0.2, scX=1, scY=1+Math.abs(Math.sin(t*Math.PI*10))*0.06
      if(frame%2===0) trail(particles,goRight?x-cut.sw*0.45:x+cut.sw*0.45,y,P.water,{angle:-Math.PI/2+(Math.random()-0.5)*1.2,speed:0.4+Math.random()*1.2,grav:-0.03,size:2+Math.random()*3.5})
      drawCutout(ctx,cut,x,y,{sx:scX,sy:scY,rot,glow:12+Math.sin(t*Math.PI*8)*5,glowColor:P.water[0]})
    }}
  },
  shark(cut,W,H,c) {
    const goRight=cut.facing==="right", sx=cut.cx, ex=goRight?W+cut.sw:-cut.sw, sy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const speed=easeIn(t), x=sx+(ex-sx)*speed, y=sy+Math.sin(t*Math.PI*4)*H*0.08, scX=1
      if(frame%3===0&&speed>0.5) trail(particles,goRight?x-cut.sw*0.5:x+cut.sw*0.5,y,P.water,{size:2+Math.random()*3,grav:0.02})
      drawCutout(ctx,cut,x,y,{sx:scX,glow:14+speed*15,glowColor:'#1E90FF'})
    }}
  },
  whale(cut,W,H,c) {
    const goRight=cut.facing==="right", sx=cut.cx, ex=goRight?W+cut.sw:-cut.sw, sy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const x=sx+(ex-sx)*easeInOut(t), y=sy+Math.sin(t*Math.PI*3)*H*0.14, scX=1
      if(Math.sin(t*Math.PI*3)>0.85&&frame%2===0) for(let i=0;i<3;i++) trail(particles,x,y-cut.sh*0.5,P.water,{angle:-Math.PI/2+(Math.random()-0.5)*0.6,speed:1+Math.random()*3,grav:0.05,size:3+Math.random()*4})
      drawCutout(ctx,cut,x,y,{sx:scX,glow:14,glowColor:P.water[0]})
    }}
  },
  dolphin(cut,W,H,c) {
    const goRight=cut.facing==="right", sx=cut.cx, ex=goRight?W+cut.sw:-cut.sw, sy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const x=sx+(ex-sx)*easeInOut(t)
      const leapT=(t*2.5)%1, y=sy-Math.sin(leapT*Math.PI)*H*0.25, scX=1
      const rot=Math.sin(leapT*Math.PI)*0.5*(goRight?1:-1)
      if(leapT<0.05&&t>0.05) burst(particles,x,sy,P.water,{n:8,shape:'drop',minSpd:1,maxSpd:4,grav:0.08})
      drawCutout(ctx,cut,x,y,{sx:scX,rot,glow:14+Math.sin(leapT*Math.PI)*20,glowColor:'#40E0D0'})
    }}
  },
  seal(cut,W,H,c) { return makeHopAnim(cut,W,H,P.water,{hopH:0.22,hops:3}) },
  octopus(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const x=cx+Math.sin(t*Math.PI*4)*W*0.18, y=cy+Math.sin(t*Math.PI*6)*H*0.1, scale=1+Math.sin(t*Math.PI*8)*0.12
      if(frame%3===0) trail(particles,x+(Math.random()-0.5)*cut.sw*0.8,y+cut.sh*0.3,P.water,{angle:Math.PI/2+(Math.random()-0.5)*1,speed:0.5+Math.random()*2,grav:0.04,size:2+Math.random()*4})
      drawCutout(ctx,cut,x,y,{sx:scale,sy:scale,rot:Math.sin(t*Math.PI*4)*0.15,glow:14,glowColor:'#9B59B6'})
    }}
  },
  jellyfish(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const y=cy+Math.sin(t*Math.PI*3)*H*0.12, scale=1+Math.sin(t*Math.PI*8)*0.15
      const x=cx+Math.sin(t*Math.PI*4)*W*0.1
      if(frame%3===0) trail(particles,x+(Math.random()-0.5)*cut.sw*0.4,y+cut.sh*0.3,['#DA70D6','#FF69B4','#9B59B6','#E0B0FF'],{angle:Math.PI/2+(Math.random()-0.5)*0.8,speed:0.3+Math.random()*0.8,grav:0.01,size:2+Math.random()*3})
      drawCutout(ctx,cut,x,y,{sx:scale,sy:scale,alpha:0.8,glow:16+Math.sin(t*Math.PI*8)*12,glowColor:'#DA70D6'})
    }}
  },
  crab(cut,W,H,c) {
    const goRight=cut.facing==="right", sx=cut.cx, ex=goRight?W+cut.sw:-cut.sw, y=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const x=sx+(ex-sx)*easeInOut(t), scX=goRight?-1:1  // crabs face opposite direction
      const bob=Math.abs(Math.sin(t*Math.PI*8))*H*0.015
      if(frame%4===0) trail(particles,x,y+cut.sh*0.4,['#FF6347','#FF4500','#CD5C5C'],{size:2+Math.random()*3,grav:0.05})
      drawCutout(ctx,cut,x,y-bob,{sx:scX,glow:10,glowColor:'#FF6347'})
    }}
  },
  turtle(cut,W,H,c) {
    const goRight=cut.facing==="right", sx=cut.cx, ex=goRight?sx+W*0.55:sx-W*0.55, y=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const x=sx+(ex-sx)*easeInOut(t), bob=Math.abs(Math.sin(t*Math.PI*5))*H*0.018, scX=1
      if(frame%7===0) trail(particles,goRight?x-cut.sw*0.4:x+cut.sw*0.4,y,['#228B22','#556B2F','#8B7355'],{size:1.5+Math.random()*2.5,grav:0.03})
      drawCutout(ctx,cut,x,y-bob,{sx:scX,glow:8,glowColor:'#228B22'})
    }}
  },

  // ──── FLYING CREATURES ────

  bird(cut,W,H,c)      { return makeFlyAnim(cut,W,H,c,{arcH:0.28,wingBeat:14}) },
  eagle(cut,W,H,c)     { return makeFlyAnim(cut,W,H,['#8B4513','#D2691E','#FFD700'],{arcH:0.35,wingBeat:10}) },
  butterfly(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const x=cx+Math.sin(t*Math.PI*3)*W*0.3+Math.sin(t*Math.PI*7)*W*0.08
      const y=cy+Math.sin(t*Math.PI*5)*H*0.2+Math.cos(t*Math.PI*3)*H*0.05-H*0.05
      const scY=1+Math.sin(t*Math.PI*16)*0.22
      if(frame%4===0) trail(particles,x,y,c,{shape:'star',size:1.5+Math.random()*2.5,grav:0.01})
      drawCutout(ctx,cut,x,y,{sy:scY,glow:12,glowColor:c[0]})
    }}
  },
  dragonfly(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy
    return { draw(ctx,t,particles) {
      const x=cx+Math.sin(t*Math.PI*5)*W*0.28+Math.cos(t*Math.PI*9)*W*0.06
      const y=cy+Math.sin(t*Math.PI*7)*H*0.16, scY=1+Math.sin(t*Math.PI*30)*0.1
      drawCutout(ctx,cut,x,y,{sy:scY,glow:14,glowColor:'#00CED1'})
    }}
  },
  firefly(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const x=cx+Math.sin(t*Math.PI*6)*W*0.22+Math.cos(t*Math.PI*11)*W*0.05
      const y=cy+Math.sin(t*Math.PI*8)*H*0.18
      const glow=Math.sin(t*Math.PI*10)>0.5?40:5
      if(glow>30&&frame%3===0) trail(particles,x,y,['#ADFF2F','#FFD700','#7CFC00'],{shape:'star',size:2+Math.random()*4,grav:-0.01})
      drawCutout(ctx,cut,x,y,{alpha:glow>30?1:0.5,glow,glowColor:'#ADFF2F'})
    }}
  },
  bee(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const x=cx+Math.sin(t*Math.PI*5)*W*0.25+Math.cos(t*Math.PI*8)*W*0.06
      const y=cy+Math.sin(t*Math.PI*7)*H*0.15, scY=1+Math.sin(t*Math.PI*30)*0.12
      if(frame%3===0) trail(particles,x,y,['#FFD700','#FFA500'],{size:1.5+Math.random()*2,grav:0.01})
      drawCutout(ctx,cut,x,y,{sy:scY,glow:10,glowColor:'#FFD700'})
    }}
  },
  ladybug(cut,W,H,c) { return ANIMATORS.butterfly(cut,W,H,['#FF0000','#2C2C2C','#FFFFFF']) },
  bat(cut,W,H,c) {
    const goRight=cut.facing==="right", sx=cut.cx, ex=goRight?W+cut.sw:-cut.sw, startY=cut.cy
    return { draw(ctx,t,particles) {
      const x=sx+(ex-sx)*easeInOut(t), y=startY+Math.sin(t*Math.PI*6)*H*0.1-H*0.05
      const scX=1, scY=1+Math.sin(t*Math.PI*18)*0.25
      drawCutout(ctx,cut,x,y,{sx:scX,sy:scY,glow:12,glowColor:'#9B59B6'})
    }}
  },
  owl(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const headTurn=Math.sin(t*Math.PI*3)*0.4, blink=Math.sin(t*Math.PI*10)>0.9?0.12:0
      if(frame%8===0) trail(particles,cx+(Math.random()-0.5)*cut.sw*0.5,cy,c,{size:2+Math.random()*3,grav:0.02})
      drawCutout(ctx,cut,cx,cy,{rot:headTurn,sy:1-blink,glow:12,glowColor:c[0]})
    }}
  },
  penguin(cut,W,H,c) {
    const goRight=cut.facing==="right", sx=cut.cx, ex=goRight?sx+W*0.6:sx-W*0.6, y=cut.cy
    return { draw(ctx,t,particles) {
      const x=sx+(ex-sx)*easeInOut(t)*0.65, rock=Math.sin(t*Math.PI*8)*0.2, bob=Math.abs(Math.sin(t*Math.PI*8))*H*0.025, scX=1
      drawCutout(ctx,cut,x,y-bob,{sx:scX,rot:rock,glow:10,glowColor:'#000000'})
    }}
  },
  flamingo(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const tilt=Math.sin(t*Math.PI*4)*0.15, bob=Math.sin(t*Math.PI*4)*H*0.03
      if(frame%5===0) trail(particles,cx,cy,['#FF69B4','#FF1493','#FFB6C1'],{size:2+Math.random()*3,grav:0.03,shape:'star'})
      drawCutout(ctx,cut,cx,cy+bob,{rot:tilt,glow:14,glowColor:'#FF69B4'})
    }}
  },
  parrot(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const x=cx+Math.sin(t*Math.PI*4)*W*0.08, bob=Math.sin(t*Math.PI*6)*H*0.04, rot=Math.sin(t*Math.PI*3)*0.1
      if(frame%4===0) trail(particles,x,cy+bob,['#FF0000','#FFD700','#00FF00','#0000FF','#FF6347'],{shape:'star',size:2+Math.random()*3,grav:0.01})
      drawCutout(ctx,cut,x,cy+bob,{rot,glow:14,glowColor:'#FF0000'})
    }}
  },
  duck(cut,W,H,c) {
    const goRight=cut.facing==="right", sx=cut.cx, ex=goRight?W+cut.sw:-cut.sw, y=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const x=sx+(ex-sx)*easeInOut(t)*0.8, scX=1
      const waddle=Math.sin(t*Math.PI*10)*0.15, bob=Math.abs(Math.sin(t*Math.PI*10))*H*0.02
      drawCutout(ctx,cut,x,y-bob,{sx:scX,rot:waddle,glow:10,glowColor:'#FFD700'})
    }}
  },
  peacock(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    const tc=['#4169E1','#00CED1','#9B59B6','#2ECC71','#FFD700','#FF69B4']
    return { draw(ctx,t,particles) {
      frame++
      const fan=Math.sin(t*Math.PI*2)*0.5+0.5, scale=1+fan*0.45
      if(fan>0.7&&frame%2===0) trail(particles,cx+(Math.random()-0.5)*cut.sw*scale,cy+(Math.random()-0.5)*cut.sh*scale,tc,{shape:'star',size:2+Math.random()*4,grav:-0.01})
      drawCutout(ctx,cut,cx,cy,{sx:scale,sy:scale,glow:10+fan*32,glowColor:tc[0]})
    }}
  },
  dragon(cut,W,H,c) {
    const goRight=cut.facing==="right", sx=cut.cx, ex=goRight?W+cut.sw:-cut.sw, startY=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const x=sx+(ex-sx)*easeInOut(t), y=startY+Math.sin(t*Math.PI*4)*H*0.15
      const scX=1, scY=1+Math.sin(t*Math.PI*8)*0.14
      if(frame%2===0) for(let i=0;i<3;i++) trail(particles,goRight?x+cut.sw*0.45:x-cut.sw*0.45,y+(Math.random()-0.5)*cut.sh*0.3,P.fire,{angle:(goRight?0:Math.PI)+(Math.random()-0.5)*0.5,speed:2+Math.random()*4,grav:0.02,size:3+Math.random()*5,shape:'spark'})
      drawCutout(ctx,cut,x,y,{sx:scX,sy:scY,glow:18,glowColor:'#FF6347'})
    }}
  },

  // ──── LAND ANIMALS ────

  horse(cut,W,H,c)    { return makeDriveAnim(cut,W,H,['#C4A882','#8B7355','#D2B48C'],{bobH:H*0.045,bobF:10,trailC:2}) },
  dog(cut,W,H,c)      { return makeHopAnim(cut,W,H,c,{hopH:0.30,hops:4}) },
  cat(cut,W,H,c)      { return makeHopAnim(cut,W,H,c,{hopH:0.26,hops:3}) },
  rabbit(cut,W,H,c)   { return makeHopAnim(cut,W,H,['#F5DEB3','#D2B48C','#FFFFFF'],{hopH:0.35,hops:4}) },
  kangaroo(cut,W,H,c) { return makeHopAnim(cut,W,H,['#C4A882','#8B7355','#D2B48C'],{hopH:0.50,hops:3,highness:1.2}) },
  frog(cut,W,H,c)     { return makeHopAnim(cut,W,H,['#228B22','#32CD32','#ADFF2F'],{hopH:0.42,hops:4}) },
  elephant(cut,W,H,c) { return makeDriveAnim(cut,W,H,['#808080','#A9A9A9','#D3D3D3'],{bobH:7,bobF:5,trailC:2}) },
  giraffe(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const craneY=Math.sin(t*Math.PI*3)*H*0.08, sway=Math.sin(t*Math.PI*4)*0.08
      if(frame%5===0) trail(particles,cx,cy,['#D2691E','#FFD700','#8B4513'],{size:2+Math.random()*3,grav:0.03})
      drawCutout(ctx,cut,cx,cy+craneY,{rot:sway,glow:10,glowColor:'#D2691E'})
    }}
  },
  lion(cut,W,H,c) {
    const goRight=cut.facing==="right", sx=cut.cx, ex=goRight?W+cut.sw:-cut.sw, y=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const x=sx+(ex-sx)*easeIn(t), bob=Math.abs(Math.sin(t*Math.PI*7))*H*0.03, scX=1
      if(frame%4===0) trail(particles,goRight?x-cut.sw*0.4:x+cut.sw*0.4,y,['#C4A82A','#8B7355','#FFD700'],{size:2+Math.random()*3,grav:0.05})
      drawCutout(ctx,cut,x,y-bob,{sx:scX,glow:14+easeIn(t)*12,glowColor:'#FFD700'})
    }}
  },
  bear(cut,W,H,c)     { return makeHopAnim(cut,W,H,c,{hopH:0.20,hops:2}) },
  wolf(cut,W,H,c) {
    const goRight=cut.facing==="right", sx=cut.cx, ex=goRight?W+cut.sw:-cut.sw, y=cut.cy; let howled=false; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      if(t<0.25) {
        if(!howled) { howled=true; burst(particles,cut.cx,cut.cy-cut.sh*0.4,['#B0C4DE','#778899','#FFFFFF'],{n:15,shape:'star',minSpd:1,maxSpd:5,grav:-0.01}) }
        drawCutout(ctx,cut,cut.cx,cut.cy,{rot:-0.3,glow:12,glowColor:'#B0C4DE'})
      } else {
        const x=sx+(ex-sx)*easeInOut((t-0.25)/0.75), bob=Math.abs(Math.sin(t*Math.PI*9))*H*0.03, scX=1
        drawCutout(ctx,cut,x,y-bob,{sx:scX,glow:12,glowColor:'#B0C4DE'})
      }
    }}
  },
  monkey(cut,W,H,c)   { return makeHopAnim(cut,W,H,['#8B4513','#A0522D','#FFD700'],{hopH:0.38,hops:4,pShape:'star'}) },
  zebra(cut,W,H,c)    { return makeDriveAnim(cut,W,H,['#FFFFFF','#2C2C2C','#808080'],{bobH:H*0.04,bobF:9}) },
  camel(cut,W,H,c)    { return makeDriveAnim(cut,W,H,['#C4A82A','#D2B48C','#F4A460'],{bobH:H*0.03,bobF:5}) },
  deer(cut,W,H,c)     { return makeDriveAnim(cut,W,H,['#D2691E','#8B4513','#A0522D'],{bobH:H*0.05,bobF:9}) },
  cow(cut,W,H,c)      { return makeDriveAnim(cut,W,H,['#FFFFFF','#2C2C2C','#F4A460'],{bobH:H*0.025,bobF:5}) },
  pig(cut,W,H,c)      { return makeHopAnim(cut,W,H,['#FFB6C1','#FF69B4','#FFA07A'],{hopH:0.18,hops:3}) },
  sheep(cut,W,H,c)    { return makeHopAnim(cut,W,H,['#FFFFFF','#D3D3D3','#F5F5F5'],{hopH:0.20,hops:3}) },
  squirrel(cut,W,H,c) { return makeHopAnim(cut,W,H,['#D2691E','#8B4513','#FFD700'],{hopH:0.28,hops:5}) },
  hedgehog(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let curled=false; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      if(t<0.3) {
        const scale=1-(t/0.3)*0.25
        drawCutout(ctx,cut,cx,cy,{sx:scale,sy:scale,glow:10,glowColor:'#8B4513'})
      } else {
        const ht=(t-0.3)/0.7, bob=Math.abs(Math.sin(ht*Math.PI*6))*H*0.06
        if(!curled) { curled=true; burst(particles,cx,cy,['#8B4513','#D2691E','#A0522D'],{n:12}) }
        drawCutout(ctx,cut,cx,cy-bob,{glow:10,glowColor:'#8B4513'})
      }
    }}
  },
  raccoon(cut,W,H,c)  { return makeDriveAnim(cut,W,H,['#808080','#2C2C2C','#FFFFFF'],{bobH:H*0.03,bobF:7}) },
  snake(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy
    return { draw(ctx,t,particles) {
      const x=cx+Math.sin(t*Math.PI*6)*W*0.22, y=cy+Math.sin(t*Math.PI*4)*H*0.1
      drawCutout(ctx,cut,x,y,{rot:Math.sin(t*Math.PI*6)*0.3,glow:12,glowColor:c[0]})
    }}
  },
  lizard(cut,W,H,c) {
    const goRight=cut.facing==="right", sx=cut.cx, ex=goRight?W+cut.sw:-cut.sw, y=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const x=sx+(ex-sx)*easeInOut(t), scX=1, dart=Math.sin(t*Math.PI*8)*H*0.02
      drawCutout(ctx,cut,x,y+dart,{sx:scX,glow:10,glowColor:'#228B22'})
    }}
  },
  spider(cut,W,H,c) {
    const cx=cut.cx, endY=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const dropT=Math.min(t*2,1), y=0+(endY-0)*easeOut(dropT)
      const swing=t>0.5?Math.sin((t-0.5)*Math.PI*6)*W*0.12:0, x=cx+swing
      ctx.save(); ctx.strokeStyle='rgba(200,200,200,0.5)'; ctx.lineWidth=1.5; ctx.setLineDash([5,3])
      ctx.beginPath(); ctx.moveTo(cx,0); ctx.lineTo(x,y-cut.sh*0.4); ctx.stroke(); ctx.restore()
      drawCutout(ctx,cut,x,y,{glow:10,glowColor:'#2F2F2F'})
    }}
  },
  snail(cut,W,H,c) {
    const goRight=cut.facing==="right", sx=cut.cx, ex=goRight?sx+W*0.45:sx-W*0.45, y=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const x=sx+(ex-sx)*easeInOut(t)*0.6, scX=1
      if(frame%8===0) trail(particles,goRight?x-cut.sw*0.4:x+cut.sw*0.4,y+cut.sh*0.4,['#ADFF2F','#7CFC00','#90EE90'],{size:2+Math.random()*3,grav:0.01,angle:Math.PI+(Math.random()-0.5)*0.3})
      drawCutout(ctx,cut,x,y,{sx:scX,glow:8,glowColor:'#ADFF2F'})
    }}
  },
  caterpillar(cut,W,H,c) {
    const goRight=cut.facing==="right", sx=cut.cx, ex=goRight?sx+W*0.6:sx-W*0.6, y=cut.cy
    return { draw(ctx,t,particles) {
      const x=sx+(ex-sx)*easeInOut(t), scX=1
      const inch=Math.sin(t*Math.PI*10), scY=1+inch*0.12, scX2=1-inch*0.08
      drawCutout(ctx,cut,x,y,{sx:scX*scX2,sy:scY,glow:10,glowColor:'#32CD32'})
    }}
  },
  worm(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy
    return { draw(ctx,t,particles) {
      const wiggle=Math.sin(t*Math.PI*8)*W*0.12, rot=Math.sin(t*Math.PI*8)*0.4
      drawCutout(ctx,cut,cx+wiggle*0.3,cy,{rot,sx:1+Math.abs(Math.sin(t*Math.PI*8))*0.15,glow:8,glowColor:'#D2691E'})
    }}
  },
  ant(cut,W,H,c) { return makeDriveAnim(cut,W,H,['#2C2C2C','#8B0000','#D2691E'],{bobH:4,bobF:14,maxX:0.7}) },
  person(cut,W,H,c) { return makeHopAnim(cut,W,H,c,{hopH:0.30,hops:3,pShape:'star'}) },

  // ──── CELESTIAL / SPINNERS ────

  sun(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const rot=t*Math.PI*3, scale=1+Math.sin(t*Math.PI*4)*0.07
      if(frame%2===0) trail(particles,cx,cy,P.sun,{angle:Math.random()*Math.PI*2,speed:1.5+Math.random()*3.5,grav:-0.02,size:2+Math.random()*4,shape:'spark'})
      drawCutout(ctx,cut,cx,cy,{sx:scale,sy:scale,rot,glow:22+Math.sin(t*Math.PI*8)*10,glowColor:'#FFD700'})
    }}
  },
  moon(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const x=cx+Math.sin(t*Math.PI*2)*W*0.06, scale=1+Math.sin(t*Math.PI*3)*0.05
      if(frame%4===0) trail(particles,x,cy,['#F1C40F','#FAD7A0','#FFFFFF','#F9E79F'],{shape:'star',size:1.5+Math.random()*2.5,grav:-0.01})
      drawCutout(ctx,cut,x,cy,{sx:scale,sy:scale,glow:20,glowColor:'#F1C40F'})
    }}
  },
  comet(cut,W,H,c) {
    const goRight=cut.facing==="right", sx=cut.cx, ex=goRight?W+cut.sw:-cut.sw, startY=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const x=sx+(ex-sx)*easeIn(t), y=startY+startY*0.3*t
      const angle=Math.atan2(startY*0.3,Math.abs(ex-sx))*(goRight?1:-1)
      if(frame%1===0) for(let i=0;i<3;i++) trail(particles,x,y,['#FFD700','#FFFFFF','#87CEEB','#FFA500'],{angle:(goRight?Math.PI:0)+(Math.random()-0.5)*0.5,speed:1+Math.random()*4,grav:0.01,size:2+Math.random()*5,shape:'star'})
      drawCutout(ctx,cut,x,y,{rot:angle,glow:25,glowColor:'#FFD700'})
    }}
  },
  black_hole(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      if(frame%2===0) {
        const angle=Math.random()*Math.PI*2, radius=W*0.3+Math.random()*W*0.15
        const px=cx+Math.cos(angle)*radius, py=cy+Math.sin(angle)*radius
        trail(particles,px,py,P.space2,{angle:angle+Math.PI/2,speed:1.5+Math.random()*2,grav:0,size:2+Math.random()*4,shape:'star'})
      }
      const scale=1+Math.sin(t*Math.PI*3)*0.05
      drawCutout(ctx,cut,cx,cy,{sx:scale,sy:scale,rot:t*Math.PI*1.5,glow:18+Math.sin(t*Math.PI*6)*12,glowColor:'#9B59B6'})
    }}
  },
  satellite(cut,W,H,c) {
    const cx=W*0.5, cy=H*0.5
    return { draw(ctx,t,particles) {
      const angle=t*Math.PI*4, rx=W*0.38, ry=H*0.25
      const x=cx+Math.cos(angle)*rx, y=cy+Math.sin(angle)*ry
      trail(particles,x,y,P.space2,{shape:'star',size:1.5+Math.random()*2.5,grav:-0.01})
      drawCutout(ctx,cut,x,y,{rot:angle,glow:14,glowColor:'#4169E1'})
    }}
  },
  planet(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const scale=1+Math.sin(t*Math.PI*2)*0.04
      if(frame%4===0) trail(particles,cx,cy,P.space2,{shape:'star',size:1.5+Math.random()*3,grav:-0.01})
      drawCutout(ctx,cut,cx,cy,{sx:scale,sy:scale,rot:t*Math.PI*1.5,glow:18,glowColor:'#F1C40F'})
    }}
  },
  tornado(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const x=cx+Math.sin(t*Math.PI*4)*W*0.08
      if(frame%2===0) trail(particles,x+(Math.random()-0.5)*cut.sw,cy,['#888','#aaa','#bbb','#ddd'],{angle:Math.random()*Math.PI*2,speed:1+Math.random()*3,grav:0.02,size:2+Math.random()*4})
      drawCutout(ctx,cut,x,cy,{sx:1+Math.sin(t*Math.PI*8)*0.1,rot:t*Math.PI*8,glow:16,glowColor:'#778899'})
    }}
  },
  wheel(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      if(frame%4===0) trail(particles,cx,cy,c,{angle:Math.random()*Math.PI*2,speed:1+Math.random()*3,grav:0.04,size:2+Math.random()*4,shape:'spark'})
      drawCutout(ctx,cut,cx,cy,{rot:t*Math.PI*6,glow:16,glowColor:c[0]})
    }}
  },
  clock(cut,W,H,c)   { return ANIMATORS.wheel(cut,W,H,['#333','#555','#FFD700']) },
  compass(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy
    return { draw(ctx,t,particles) {
      const rot=Math.sin(t*Math.PI*3)*0.8+t*Math.PI*2
      drawCutout(ctx,cut,cx,cy,{rot,glow:12,glowColor:'#FF4500'})
    }}
  },

  // ──── WEATHER / NATURE ────

  rainbow(cut,W,H,c) {
    const rc=['#FF0000','#FF7F00','#FFFF00','#00FF00','#4169E1','#8B00FF']
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const reveal=Math.min(t*1.1,1)
      ctx.save(); ctx.beginPath()
      ctx.rect(cx-cut.sw/2, cy-cut.sh*0.6, cut.sw*reveal, cut.sh*1.2); ctx.clip()
      drawCutout(ctx,cut,cx,cy,{glow:15,glowColor:'#FFD700'})
      ctx.restore()
      const edgeX=cx-cut.sw/2+cut.sw*Math.min(reveal,1)
      if(reveal<1&&frame%2===0) for(let i=0;i<2;i++) trail(particles,edgeX,cy+(Math.random()-0.5)*cut.sh*0.7,rc,{shape:'star',size:3+Math.random()*4,grav:0.01})
    }}
  },

  cloud(cut,W,H,c) {
    const goRight=cut.facing==="right", sx=cut.cx, ex=goRight?W+cut.sw:-cut.sw, y=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const x=sx+(ex-sx)*easeInOut(t)*0.7+Math.sin(t*Math.PI*3)*W*0.04, bob=Math.sin(t*Math.PI*4)*H*0.02
      if(frame%2===0) for(let i=0;i<3;i++) trail(particles,x+(Math.random()-0.5)*cut.sw*0.7,y+cut.sh*0.4+bob,P.sky,{angle:Math.PI/2+(Math.random()-0.5)*0.2,speed:3+Math.random()*4,grav:0.15,size:2+Math.random()*2,shape:'drop'})
      drawCutout(ctx,cut,x,y+bob,{glow:12,glowColor:'#87CEEB'})
    }}
  },

  thundercloud(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const flash=Math.sin(t*Math.PI*9)
      if(flash>0.88&&frame%3===0) for(let i=0;i<6;i++) trail(particles,cx+(Math.random()-0.5)*cut.sw*0.4,cy+cut.sh*0.3+(Math.random()-0.5)*30,['#FFD700','#FFFFFF','#FFF176'],{angle:Math.PI/2+(Math.random()-0.5)*0.5,speed:4+Math.random()*5,grav:0.2,size:2+Math.random()*4,shape:'spark'})
      if(frame%3===0) trail(particles,cx+(Math.random()-0.5)*cut.sw*0.6,cy+cut.sh*0.4,P.sky,{angle:Math.PI/2+(Math.random()-0.5)*0.2,speed:3+Math.random()*4,grav:0.15,size:2+Math.random()*2,shape:'drop'})
      drawCutout(ctx,cut,cx,cy,{alpha:0.85+flash*0.15,glow:flash>0.88?55:10,glowColor:flash>0.88?'#FFD700':'#4169E1'})
    }}
  },

  snowflake(cut,W,H,c) {
    const cx=cut.cx, startY=cut.cy, endY=H+cut.sh
    return { draw(ctx,t,particles) {
      const x=cx+Math.sin(t*Math.PI*4)*W*0.1, y=startY+(endY-startY)*easeInOut(t)
      const scale=1+Math.sin(t*Math.PI*8)*0.08
      if(Math.random()>0.7) trail(particles,x+(Math.random()-0.5)*cut.sw*0.5,y,['#FFFFFF','#B0E0E6','#87CEEB'],{shape:'star',size:1+Math.random()*2.5,grav:0.01})
      drawCutout(ctx,cut,x,y,{sx:scale,sy:scale,rot:t*Math.PI*6,glow:14,glowColor:'#FFFFFF'})
    }}
  },

  snowman(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const bob=Math.sin(t*Math.PI*3)*H*0.03, rot=Math.sin(t*Math.PI*3)*0.08
      if(frame%4===0) for(let i=0;i<3;i++) trail(particles,cx+(Math.random()-0.5)*W*0.4,cy-H*0.1,['#FFFFFF','#B0E0E6','#87CEEB'],{angle:-Math.PI/2+(Math.random()-0.5)*1.3,speed:0.5+Math.random()*1.5,grav:0.02,size:2+Math.random()*3.5,shape:'star'})
      drawCutout(ctx,cut,cx,cy+bob,{rot,glow:10,glowColor:'#FFFFFF'})
    }}
  },

  rain(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy
    return { draw(ctx,t,particles) {
      const x=cx+Math.sin(t*Math.PI*3)*W*0.05
      for(let i=0;i<4;i++) trail(particles,x+(Math.random()-0.5)*cut.sw,cy+cut.sh*0.2+(Math.random()-0.5)*cut.sh,P.sky,{angle:Math.PI/2+(Math.random()-0.5)*0.15,speed:4+Math.random()*4,grav:0.2,size:2+Math.random()*3,shape:'drop'})
      drawCutout(ctx,cut,x,cy,{glow:10,glowColor:'#4169E1'})
    }}
  },

  volcano(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const shake=t<0.3?Math.sin(t*Math.PI*20)*(t/0.3)*5:0
      if(t>0.25&&frame%1===0) for(let i=0;i<4;i++) trail(particles,cx+shake+(Math.random()-0.5)*cut.sw*0.12,cy-cut.sh*0.38,P.fire,{angle:-Math.PI/2+(Math.random()-0.5)*0.7,speed:3+Math.random()*6,upBias:4,grav:0.2,size:4+Math.random()*8,shape:Math.random()>0.5?'circle':'spark'})
      drawCutout(ctx,cut,cx+shake,cy,{glow:t>0.3?20+Math.sin(t*Math.PI*10)*10:8,glowColor:'#FF4500'})
    }}
  },

  wave(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const crash=Math.sin(t*Math.PI*4)*H*0.06, scale=1+Math.sin(t*Math.PI*4)*0.12
      if(crash>H*0.04&&frame%2===0) for(let i=0;i<4;i++) trail(particles,cx+(Math.random()-0.5)*cut.sw*0.8,cy+crash,P.water,{angle:-Math.PI/2+(Math.random()-0.5)*1,speed:2+Math.random()*4,grav:0.08,size:3+Math.random()*5,shape:'drop'})
      drawCutout(ctx,cut,cx,cy+crash,{sx:scale,glow:14,glowColor:'#00BFFF'})
    }}
  },

  // ──── SWAYERS ────

  tree(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy, pivotY=cy+cut.sh*0.42; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const angle=Math.sin(t*Math.PI*3.5)*0.22
      if(frame%4===0&&Math.random()>0.45) trail(particles,cx+(Math.random()-0.5)*cut.sw*0.7,cy-cut.sh*0.2,c,{angle:Math.PI/2+(Math.random()-0.5)*0.8,speed:0.4+Math.random()*1.2,grav:0.03,size:3+Math.random()*4})
      ctx.save(); ctx.translate(cx,pivotY); ctx.rotate(angle); ctx.shadowBlur=8+Math.abs(angle)*40; ctx.shadowColor=c[0]; ctx.globalAlpha=0.97
      ctx.drawImage(cut.canvas,-cut.sw/2,-(cut.sh+cut.sh*0.42-cut.sh*0.5),cut.sw,cut.sh); ctx.restore()
    }}
  },
  flower(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy, pivotY=cy+cut.sh*0.45; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const angle=Math.sin(t*Math.PI*4)*0.18
      if(frame%5===0&&Math.random()>0.4) trail(particles,cx+(Math.random()-0.5)*cut.sw*0.6,cy-cut.sh*0.15,c,{angle:Math.PI/2+(Math.random()-0.5)*0.9,speed:0.3+Math.random()*0.9,grav:0.02,size:2+Math.random()*3.5})
      ctx.save(); ctx.translate(cx,pivotY); ctx.rotate(angle); ctx.shadowBlur=10+Math.abs(angle)*35; ctx.shadowColor=c[0]; ctx.globalAlpha=0.97
      ctx.drawImage(cut.canvas,-cut.sw/2,-(cut.sh+cut.sh*0.45-cut.sh*0.5),cut.sw,cut.sh); ctx.restore()
    }}
  },
  grass(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy, pivotY=cy+cut.sh*0.48
    return { draw(ctx,t,particles) {
      const angle=Math.sin(t*Math.PI*5)*0.28
      ctx.save(); ctx.translate(cx,pivotY); ctx.rotate(angle); ctx.shadowBlur=6; ctx.shadowColor=c[0]; ctx.globalAlpha=0.97
      ctx.drawImage(cut.canvas,-cut.sw/2,-(cut.sh+cut.sh*0.48-cut.sh*0.5),cut.sw,cut.sh); ctx.restore()
    }}
  },
  mushroom(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const scale=1+Math.sin(t*Math.PI*4)*0.06, rot=Math.sin(t*Math.PI*4)*0.06
      if(frame%5===0) trail(particles,cx+(Math.random()-0.5)*cut.sw*0.4,cy-cut.sh*0.2,c,{angle:Math.random()*Math.PI*2,speed:0.4+Math.random(),grav:-0.01,size:2+Math.random()*3})
      drawCutout(ctx,cut,cx,cy,{sx:scale,sy:scale,rot,glow:10,glowColor:c[0]})
    }}
  },

  // ──── PULSERS / EFFECTS ────

  heart(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const beat=(t*2.2)%1
      const scale= beat<0.12?1+beat/0.12*0.40: beat<0.22?1.40-(beat-0.12)/0.10*0.18: beat<0.34?1.22+(beat-0.22)/0.12*0.22: beat<0.44?1.44-(beat-0.34)/0.10*0.44: 1
      if(scale>1.35&&frame%4===0) for(let i=0;i<5;i++) trail(particles,cx,cy,P.heart,{angle:Math.random()*Math.PI*2,speed:2+Math.random()*3.5,grav:0.04,size:2+Math.random()*4,shape:'heart'})
      drawCutout(ctx,cut,cx,cy,{sx:scale,sy:scale,glow:scale>1.35?35:8+(scale-1)*60,glowColor:'#FF0000'})
    }}
  },
  fire(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const flk=Math.random()*0.12, scale=1+Math.sin(t*Math.PI*14)*0.12+flk, lean=Math.sin(t*Math.PI*9)*0.1+flk*0.2
      if(frame%2===0) trail(particles,cx+(Math.random()-0.5)*cut.sw*0.55,cy+cut.sh*0.15,P.fire,{angle:-Math.PI/2+(Math.random()-0.5)*0.8,speed:1+Math.random()*3.5,upBias:2.5,grav:-0.04,size:1.5+Math.random()*3.5,shape:Math.random()>0.5?'spark':'circle'})
      drawCutout(ctx,cut,cx,cy,{sx:scale,sy:scale,rot:lean,glow:22+flk*35,glowColor:'#FF6347'})
    }}
  },
  candle(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const flk=Math.sin(t*Math.PI*15)*0.06, lean=Math.sin(t*Math.PI*11)*0.08
      if(frame%3===0) trail(particles,cx+(Math.random()-0.5)*cut.sw*0.15,cy-cut.sh*0.4,P.fire,{angle:-Math.PI/2+(Math.random()-0.5)*0.6,speed:0.6+Math.random()*2,upBias:1.5,grav:-0.03,size:1.5+Math.random()*3,shape:'spark'})
      drawCutout(ctx,cut,cx,cy,{sx:1+flk,rot:lean,glow:14+Math.abs(flk)*60,glowColor:'#FFD700'})
    }}
  },
  star(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const tw=Math.sin(t*Math.PI*6)*0.28, scale=1+tw
      if(tw>0.24&&frame%4===0) for(let i=0;i<6;i++) trail(particles,cx,cy,c,{shape:'star',size:2+Math.random()*3.5,angle:Math.random()*Math.PI*2,speed:2.5+Math.random()*4.5,grav:0.02})
      drawCutout(ctx,cut,cx,cy,{sx:scale,sy:scale,rot:t*Math.PI*2,glow:10+tw*65,glowColor:c[0]})
    }}
  },
  lightning(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const flash=Math.pow(Math.sin(t*Math.PI*8),2), scale=1+flash*0.35
      if(flash>0.8&&frame%3===0) for(let i=0;i<8;i++) trail(particles,cx,cy,['#FFD700','#FFFFFF','#87CEEB'],{angle:Math.random()*Math.PI*2,speed:3+Math.random()*6,grav:0.08,size:2+Math.random()*5,shape:'spark'})
      drawCutout(ctx,cut,cx,cy,{sx:scale,sy:scale,alpha:0.6+flash*0.4,glow:flash*50,glowColor:'#FFD700'})
    }}
  },
  firework(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let wavesDone=0
    return { draw(ctx,t,particles) {
      const wt=(t*3.5)%1
      if(wt<0.06) { wavesDone++; if(wavesDone<=4) burst(particles,cx,cy,c,{n:18,minSpd:2,maxSpd:9,grav:0.05,shape:Math.random()>0.5?'star':'circle'}) }
      const scale=1+wt*0.5, alpha=1-wt*0.6
      drawCutout(ctx,cut,cx,cy,{sx:scale,sy:scale,alpha,glow:22*(1-wt)+5,glowColor:c[0]})
    }}
  },
  sparkler(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      if(frame%1===0) for(let i=0;i<5;i++) trail(particles,cx+(Math.random()-0.5)*cut.sw*0.3,cy+(Math.random()-0.5)*cut.sh*0.6,['#FFD700','#FFFFFF','#FFA500','#FF6347'],{angle:Math.random()*Math.PI*2,speed:1+Math.random()*5,grav:0.06,size:2+Math.random()*4,shape:'spark'})
      drawCutout(ctx,cut,cx,cy,{glow:18+Math.sin(t*Math.PI*20)*12,glowColor:'#FFD700'})
    }}
  },
  bubble(cut,W,H,c) {
    const cx=cut.cx, startY=cut.cy, endY=-cut.sh; let popped=false; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      if(t>0.88&&!popped) {
        popped=true
        for(let i=0;i<12;i++) trail(particles,cx,startY+(endY-startY)*0.88,P.water,{angle:Math.random()*Math.PI*2,speed:1+Math.random()*5,grav:0.05,size:3+Math.random()*6,shape:'ring'})
        return
      }
      if(t>0.9) return
      const x=cx+Math.sin(t*Math.PI*5)*W*0.07, y=startY+(endY-startY)*easeInOut(t/0.88)
      const scale=1+Math.sin(t*Math.PI*8)*0.04
      drawCutout(ctx,cut,x,y,{sx:scale,sy:scale,alpha:0.8,glow:12,glowColor:'#87CEEB'})
    }}
  },
  gem(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const rot=Math.sin(t*Math.PI*3)*0.3, scale=1+Math.sin(t*Math.PI*4)*0.08
      if(frame%3===0) trail(particles,cx+(Math.random()-0.5)*cut.sw*0.5,cy+(Math.random()-0.5)*cut.sh*0.5,c,{shape:'star',size:1.5+Math.random()*3,grav:-0.01})
      drawCutout(ctx,cut,cx,cy,{sx:scale,sy:scale,rot,glow:18+Math.sin(t*Math.PI*8)*12,glowColor:c[0]})
    }}
  },

  // ──── FOOD ────

  ice_cream(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    const dc=['#FFF8DC','#F5DEB3','#FF69B4','#A0522D','#FFFACD']
    return { draw(ctx,t,particles) {
      frame++
      const sway=Math.sin(t*Math.PI*3)*W*0.02
      if(frame%3===0) trail(particles,cx+sway+(Math.random()-0.5)*cut.sw*0.4,cy+cut.sh*0.3,dc,{angle:Math.PI/2+(Math.random()-0.5)*0.3,speed:1+Math.random()*2,grav:0.1,size:3+Math.random()*5})
      drawCutout(ctx,cut,cx+sway,cy+t*H*0.04,{sy:1+t*0.15,glow:12,glowColor:'#FFD700'})
    }}
  },

  cake(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    const cc=['#FF69B4','#FFD700','#00CED1','#FF4500','#9B59B6']
    return { draw(ctx,t,particles) {
      frame++
      const bob=Math.sin(t*Math.PI*4)*H*0.015, scale=1+Math.sin(t*Math.PI*4)*0.04
      if(frame%2===0) trail(particles,cx+(Math.random()-0.5)*cut.sw*0.2,cy-cut.sh*0.4+bob,P.fire,{angle:-Math.PI/2+(Math.random()-0.5)*0.6,speed:0.8+Math.random()*2,upBias:1.5,grav:-0.03,size:2+Math.random()*3.5,shape:'spark'})
      if(bob>H*0.012&&frame%5===0) trail(particles,cx+(Math.random()-0.5)*W*0.5,cy-H*0.1,cc,{angle:-Math.PI/2+(Math.random()-0.5)*Math.PI,speed:1+Math.random()*3,grav:0.06,size:3+Math.random()*5,shape:'star'})
      drawCutout(ctx,cut,cx,cy+bob,{sx:scale,sy:scale,glow:14+Math.sin(t*Math.PI*8)*6,glowColor:'#FFD700'})
    }}
  },

  pizza(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const toss=Math.sin(t*Math.PI*3)*H*0.12, spin=t*Math.PI*6
      if(toss>H*0.08&&frame%4===0) for(let i=0;i<3;i++) trail(particles,cx+(Math.random()-0.5)*cut.sw*0.7,cy-toss,['#FF6347','#FFD700','#FFFFFF','#FF4500'],{size:2+Math.random()*4,grav:0.08})
      drawCutout(ctx,cut,cx,cy-toss,{rot:spin,glow:12,glowColor:'#FF6347'})
    }}
  },

  donut(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy
    return { draw(ctx,t,particles) {
      const toss=Math.sin(t*Math.PI*3)*H*0.1, flip=Math.cos(t*Math.PI*6)||0.05
      trail(particles,cx+(Math.random()-0.5)*cut.sw*0.6,cy-toss,P.candy,{size:2+Math.random()*4,grav:0.06})
      drawCutout(ctx,cut,cx,cy-toss,{sx:flip,rot:t*Math.PI*4,glow:14,glowColor:P.candy[0]})
    }}
  },

  lollipop(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const spin=t*Math.PI*8, scale=1+Math.sin(t*Math.PI*4)*0.08
      if(frame%4===0) trail(particles,cx,cy,P.candy,{shape:'star',size:2+Math.random()*4,grav:0.01})
      drawCutout(ctx,cut,cx,cy,{sx:scale,sy:scale,rot:spin,glow:14,glowColor:P.candy[0]})
    }}
  },

  watermelon(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy, floorY=Math.min(cy+H*0.3,H-cut.sh*0.5); let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const bt=(t*2.5)%1, yOff=bounce(bt)*(floorY-cy), y=cy+yOff
      if(bt>0.85&&bt<0.93&&frame%3===0) for(let i=0;i<4;i++) trail(particles,cx,floorY,['#FF4B4B','#2F4F2F','#90EE90','#000000'],{angle:Math.PI+(Math.random()-0.5)*1.4,speed:1.5+Math.random()*3,grav:0.09,size:2+Math.random()*4})
      drawCutout(ctx,cut,cx,y,{glow:10+(1-yOff/(floorY-cy||1))*18,glowColor:'#FF4B4B'})
    }}
  },

  fruit(cut,W,H,c)   { return makeHopAnim(cut,W,H,['#FF4500','#FFD700','#32CD32','#FF69B4'],{hopH:0.28,hops:3}) },
  burger(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const bob=Math.sin(t*Math.PI*4)*H*0.015, jiggle=Math.sin(t*Math.PI*8)*0.04
      if(frame%6===0) trail(particles,cx+(Math.random()-0.5)*cut.sw*0.5,cy,P.food,{size:2+Math.random()*3,grav:0.05})
      drawCutout(ctx,cut,cx,cy+bob,{rot:jiggle,glow:12,glowColor:'#FF6347'})
    }}
  },

  // ──── OBJECTS / TOYS ────

  gift(cut,W,H,c) {
    const cx=cut.cx, baseY=cut.cy, peakY=Math.max(baseY-H*0.3,cut.sh*0.6), floorY=Math.min(baseY+H*0.1,H-cut.sh*0.5)
    let explodeFired=false; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const bt=(t*2)%1, yOff=bounce(bt)*(floorY-peakY), y=peakY+yOff
      const scX=bt>0.86?1+((bt-0.86)/0.14)*0.35:1, scY=bt>0.86?1/scX:1
      if(!explodeFired&&bt<0.06&&t>0.46) {
        explodeFired=true
        burst(particles,cx,y,['#FF69B4','#FFD700','#00CED1','#FF4500','#9B59B6','#2ECC71','#FF6347'],{n:36,minSpd:3,maxSpd:10,shape:'star'})
      }
      drawCutout(ctx,cut,cx,y,{sx:scX,sy:scY,glow:10+(1-yOff/(floorY-peakY||1))*22,glowColor:'#FF69B4'})
    }}
  },

  coin(cut,W,H,c) {
    const cx=cut.cx, baseY=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const tossT=(t*3)%1, yOff=Math.sin(tossT*Math.PI)*H*0.22, y=baseY-yOff
      const flip=Math.cos(tossT*Math.PI*6)||0.05
      if(yOff>H*0.18&&frame%3===0) trail(particles,cx,y,['#FFD700','#FFA500','#FFFF00'],{shape:'star',size:2+Math.random()*3,grav:0.05})
      drawCutout(ctx,cut,cx,y,{sx:flip,glow:12+(1-Math.abs(flip))*25,glowColor:'#FFD700'})
    }}
  },

  crown(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const bob=Math.sin(t*Math.PI*4)*H*0.025, rot=Math.sin(t*Math.PI*3)*0.1
      if(frame%3===0) trail(particles,cx+(Math.random()-0.5)*cut.sw*0.7,cy+bob,['#FFD700','#FF69B4','#9B59B6'],{shape:'star',size:2+Math.random()*4,grav:0.01})
      drawCutout(ctx,cut,cx,cy+bob,{rot,glow:22+Math.sin(t*Math.PI*6)*10,glowColor:'#FFD700'})
    }}
  },

  trophy(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const bob=Math.sin(t*Math.PI*3)*H*0.02, scale=1+Math.sin(t*Math.PI*3)*0.06
      if(frame%2===0) trail(particles,cx+(Math.random()-0.5)*cut.sw*0.6,cy+bob,['#FFD700','#FFA500','#FFFF00','#FFFFFF'],{shape:'star',size:2+Math.random()*4,grav:0.02})
      drawCutout(ctx,cut,cx,cy+bob,{sx:scale,sy:scale,glow:20+Math.sin(t*Math.PI*6)*12,glowColor:'#FFD700'})
    }}
  },

  magic_wand(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const rot=Math.sin(t*Math.PI*4)*0.6
      if(frame%2===0) for(let i=0;i<3;i++) trail(particles,cx+Math.sin(rot)*cut.sw*0.4,cy-Math.cos(rot)*cut.sh*0.4,P.magic,{shape:'star',size:2+Math.random()*5,grav:0.02,speed:1+Math.random()*4})
      drawCutout(ctx,cut,cx,cy,{rot,glow:22+Math.sin(t*Math.PI*8)*15,glowColor:'#FFD700'})
    }}
  },

  key(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const rot=Math.sin(t*Math.PI*6)*0.4, bob=Math.sin(t*Math.PI*4)*H*0.02
      if(frame%4===0) trail(particles,cx,cy+bob,['#FFD700','#FFA500','#DAA520'],{shape:'star',size:2+Math.random()*3,grav:0.01})
      drawCutout(ctx,cut,cx,cy+bob,{rot,glow:14,glowColor:'#FFD700'})
    }}
  },

  lock(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const shake=t<0.4?Math.sin(t*Math.PI*15)*(t/0.4)*6:0
      if(t>0.4&&frame%4===0) trail(particles,cx+(Math.random()-0.5)*cut.sw*0.6,cy,['#FFD700','#FFFFFF','#FFA500'],{shape:'star',size:2+Math.random()*4,grav:-0.01})
      drawCutout(ctx,cut,cx+shake,cy,{glow:t>0.4?20+Math.sin(t*Math.PI*8)*10:8,glowColor:'#FFD700'})
    }}
  },

  boomerang(cut,W,H,c) {
    const goRight=cut.facing==="right", cx=cut.cx, cy=cut.cy
    return { draw(ctx,t,particles) {
      const arc=t<0.5?t/0.5:(1-t)/0.5
      const x=cx+(goRight?1:-1)*arc*W*0.4, y=cy-Math.sin(arc*Math.PI)*H*0.2
      const rot=t*Math.PI*8*(goRight?1:-1)
      trail(particles,x,y,c,{size:2+Math.random()*3,grav:0.02})
      drawCutout(ctx,cut,x,y,{rot,glow:12,glowColor:c[0]})
    }}
  },

  arrow(cut,W,H,c) {
    const goRight=cut.facing==="right", sx=cut.cx, ex=goRight?W+cut.sw:-cut.sw, y=cut.cy
    return { draw(ctx,t,particles) {
      const x=sx+(ex-sx)*easeIn(t), scX=1
      trail(particles,x,y,['#8B4513','#D2691E','#FFD700'],{angle:(goRight?Math.PI:0),speed:1+Math.random()*2,grav:0.02,shape:'spark'})
      drawCutout(ctx,cut,x,y,{sx:scX,glow:10,glowColor:'#8B4513'})
    }}
  },

  target(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const pulse=Math.sin(t*Math.PI*6)*0.1+1
      if(Math.sin(t*Math.PI*6)>0.9&&frame%5===0) trail(particles,cx,cy,['#FF4500','#FFD700','#FF0000'],{shape:'ring',size:4+Math.random()*6,grav:-0.02,speed:0.5+Math.random()})
      drawCutout(ctx,cut,cx,cy,{sx:pulse,sy:pulse,glow:10+Math.sin(t*Math.PI*6)*20,glowColor:'#FF4500'})
    }}
  },

  lighthouse(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const beamAngle=t*Math.PI*6
      ctx.save(); ctx.translate(cx,cy-cut.sh*0.3); ctx.rotate(beamAngle)
      const grad=ctx.createLinearGradient(0,0,W*0.5,0)
      grad.addColorStop(0,'rgba(255,255,180,0.4)'); grad.addColorStop(1,'rgba(255,255,180,0)')
      ctx.fillStyle=grad; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(W*0.5,-W*0.08); ctx.lineTo(W*0.5,W*0.08); ctx.closePath(); ctx.fill(); ctx.restore()
      if(frame%8===0) trail(particles,cx+Math.cos(beamAngle)*W*0.3,cy-cut.sh*0.3+Math.sin(beamAngle)*W*0.3,['#FFFFE0','#FFD700','#FFFFFF'],{shape:'star',size:2+Math.random()*4,grav:-0.01})
      drawCutout(ctx,cut,cx,cy,{glow:16,glowColor:'#FFD700'})
    }}
  },

  anchor(cut,W,H,c) {
    const cx=cut.cx, startY=cut.cy, endY=Math.min(startY+H*0.3,H-cut.sh*0.5)
    return { draw(ctx,t,particles) {
      const y=startY+(endY-startY)*easeIn(t)+Math.sin(t*Math.PI*6)*H*0.015*(1-t)
      trail(particles,cx,y,P.water,{shape:'circle',size:2+Math.random()*3,grav:-0.02,angle:-Math.PI/2+(Math.random()-0.5)*0.8})
      drawCutout(ctx,cut,cx,y,{glow:12,glowColor:'#4169E1'})
    }}
  },

  hourglass(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      if(t>0.48&&t<0.55&&frame%2===0) burst(particles,cx,cy,['#FFD700','#FFA500','#F4A460'],{n:12,shape:'spark',minSpd:1,maxSpd:4})
      const rot=t>0.5?Math.PI:0
      if(frame%4===0) trail(particles,cx,cy+(t>0.5?-cut.sh*0.2:cut.sh*0.2),['#FFD700','#FFA500'],{angle:t>0.5?-Math.PI/2:Math.PI/2,speed:0.3+Math.random()*0.8,grav:0.08,size:2+Math.random()*3})
      drawCutout(ctx,cut,cx,cy,{rot:rot+Math.sin(t*Math.PI*4)*0.06,glow:12,glowColor:'#FFD700'})
    }}
  },

  lantern(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const flk=Math.random()*0.1, bob=Math.sin(t*Math.PI*4)*H*0.02
      if(frame%3===0) trail(particles,cx,cy+bob,['#FFD700','#FFA500','#FF6347'],{shape:'star',size:1.5+Math.random()*3,grav:-0.015})
      drawCutout(ctx,cut,cx,cy+bob,{sx:1+flk,glow:16+flk*40,glowColor:'#FFD700'})
    }}
  },

  yoyo(cut,W,H,c) {
    const cx=cut.cx, baseY=cut.cy, bottomY=Math.min(baseY+H*0.38,H-cut.sh*0.5)
    return { draw(ctx,t,particles) {
      const yt=(t*3)%1, y=baseY+(bottomY-baseY)*Math.abs(Math.sin(yt*Math.PI)), rot=t*Math.PI*20
      ctx.save(); ctx.strokeStyle='rgba(150,150,150,0.6)'; ctx.lineWidth=2
      ctx.beginPath(); ctx.moveTo(cx,baseY-cut.sh*0.4); ctx.lineTo(cx,y-cut.sh*0.4); ctx.stroke(); ctx.restore()
      trail(particles,cx,y,c,{shape:'star',size:2+Math.random()*3,grav:0.02})
      drawCutout(ctx,cut,cx,y,{rot,glow:12,glowColor:c[0]})
    }}
  },

  umbrella(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const bob=Math.sin(t*Math.PI*4)*H*0.02, sway=Math.sin(t*Math.PI*3)*0.12
      if(frame%2===0) for(let i=0;i<3;i++) trail(particles,cx+(Math.random()-0.5)*W*0.5,cy-H*0.3,P.sky,{angle:Math.PI/2+(Math.random()-0.5)*0.2,speed:4+Math.random()*4,grav:0.15,size:2+Math.random()*2,shape:'drop'})
      drawCutout(ctx,cut,cx,cy+bob,{rot:sway,glow:14,glowColor:c[0]})
    }}
  },

  music_note(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    const mc=['#9B59B6','#3498DB','#F1C40F','#2ECC71','#E74C3C']
    return { draw(ctx,t,particles) {
      frame++
      const bob=Math.sin(t*Math.PI*6)*H*0.08, rot=Math.sin(t*Math.PI*5)*0.2, scale=1+Math.sin(t*Math.PI*6)*0.12
      if(frame%3===0) trail(particles,cx+(Math.random()-0.5)*W*0.35,cy+bob,mc,{shape:'star',size:2+Math.random()*4,grav:-0.01})
      drawCutout(ctx,cut,cx,cy+bob,{sx:scale,sy:scale,rot,glow:14+Math.abs(bob/H)*120,glowColor:'#9B59B6'})
    }}
  },

  drum(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const beat=(t*6)%1, hit=beat<0.1, bob=hit?-H*0.03:Math.sin(t*Math.PI*12)*H*0.01
      if(hit&&frame%2===0) burst(particles,cx,cy,c,{n:8,minSpd:2,maxSpd:6,grav:0.1})
      drawCutout(ctx,cut,cx,cy+bob,{glow:hit?28:10,glowColor:c[0]})
    }}
  },

  guitar(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const vibe=Math.sin(t*Math.PI*20)*0.04, bob=Math.sin(t*Math.PI*4)*H*0.02
      if(frame%4===0) trail(particles,cx,cy,['#8B4513','#FFD700','#D2691E'],{shape:'star',size:2+Math.random()*3,grav:0.02})
      drawCutout(ctx,cut,cx,cy+bob,{sx:1+vibe,glow:12,glowColor:'#D2691E'})
    }}
  },

  bell(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const swing=Math.sin(t*Math.PI*8)*0.35*(1-t*0.3)
      if(Math.abs(swing)>0.3&&frame%4===0) for(let i=0;i<5;i++) trail(particles,cx,cy+cut.sh*0.5,['#FFD700','#FFA500'],{shape:'star',size:2+Math.random()*3,grav:0.02})
      drawCutout(ctx,cut,cx,cy,{rot:swing,glow:10+Math.abs(swing)*40,glowColor:'#FFD700'})
    }}
  },

  book(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const flutter=Math.sin(t*Math.PI*8)*0.08
      if(frame%5===0) trail(particles,cx+(Math.random()-0.5)*cut.sw*0.6,cy+(Math.random()-0.5)*cut.sh*0.4,P.magic,{shape:'star',size:2+Math.random()*3,grav:-0.01})
      drawCutout(ctx,cut,cx,cy,{sx:1+flutter,sy:1-flutter*0.3,glow:10,glowColor:'#DA70D6'})
    }}
  },

  pencil(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy
    return { draw(ctx,t,particles) {
      const x=cx+Math.sin(t*Math.PI*5)*W*0.15, rot=Math.sin(t*Math.PI*5)*0.3
      trail(particles,x+Math.cos(rot)*cut.sw*0.4,cy+Math.sin(rot)*cut.sh*0.4,['#FFD700','#FFA500','#2C2C2C'],{shape:'circle',size:2+Math.random()*2,grav:0.02})
      drawCutout(ctx,cut,x,cy,{rot,glow:10,glowColor:'#FFD700'})
    }}
  },

  paintbrush(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy
    return { draw(ctx,t,particles) {
      const x=cx+Math.sin(t*Math.PI*4)*W*0.18, rot=Math.sin(t*Math.PI*4)*0.4
      trail(particles,x+Math.cos(rot)*cut.sw*0.45,cy+Math.sin(rot)*cut.sh*0.45,c,{size:3+Math.random()*4,grav:0.02,speed:0.5+Math.random()*1.5})
      drawCutout(ctx,cut,x,cy,{rot,glow:10,glowColor:c[0]})
    }}
  },

  phone(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const ring=Math.sin(t*Math.PI*15)*H*0.015, rot=Math.sin(t*Math.PI*15)*0.06
      if(frame%10===0) trail(particles,cx,cy-cut.sh*0.4,['#00BFFF','#FFD700','#FF69B4'],{shape:'star',size:2+Math.random()*3,grav:-0.01})
      drawCutout(ctx,cut,cx+ring,cy,{rot,glow:12,glowColor:'#4169E1'})
    }}
  },

  tent(cut,W,H,c) {
    const cx=cut.cx, cy=cut.cy; let frame=0
    return { draw(ctx,t,particles) {
      frame++
      const sway=Math.sin(t*Math.PI*3)*0.04
      if(frame%6===0) trail(particles,cx,cy-cut.sh*0.2,P.fire,{angle:-Math.PI/2+(Math.random()-0.5)*0.5,speed:0.5+Math.random()*1.5,upBias:1.5,grav:-0.03,size:2+Math.random()*3,shape:'spark'})
      drawCutout(ctx,cut,cx,cy,{rot:sway,glow:10,glowColor:'#8B4513'})
    }}
  },
}

// ── Multi-object interaction detection ───────────────────────────────────────
function detectInteraction(objects) {
  if (!objects?.length || objects.length < 2) return null
  const tagged = objects.map(o => ({
    obj:o,
    T: new Set([...(o.tags||[]).map(t=>t.toLowerCase()), ...(o.label||'').toLowerCase().split(/[\s,/\-()]+/)]),
    bbox: (o.boundingBox?.w??0) > 0.05,
  }))
  const has = (item,...w) => w.some(x => item.T.has(x))

  const bball = tagged.find(l=>has(l,'basketball')||(has(l,'ball')&&!has(l,'soccer','football','tennis')))
  const hoop  = tagged.find(l=>has(l,'hoop','basket','net','rim','goal')&&l!==bball)
  if (bball?.bbox && hoop?.bbox) return {type:'basketball_shot',ball:bball.obj,hoop:hoop.obj}

  const sball = tagged.find(l=>has(l,'soccer','football'))
  const goal  = tagged.find(l=>has(l,'goal','goalpost')&&l!==sball)
  if (sball?.bbox && goal?.bbox) return {type:'soccer_goal',ball:sball.obj,goal:goal.obj}

  const rocket = tagged.find(l=>has(l,'rocket','spaceship','ufo'))
  const planet = tagged.find(l=>has(l,'moon','planet','earth','saturn','star')&&l!==rocket)
  if (rocket?.bbox && planet?.bbox) return {type:'rocket_moon',rocket:rocket.obj,planet:planet.obj}

  const sun  = tagged.find(l=>has(l,'sun'))
  const snow = tagged.find(l=>has(l,'snowman','snow man')&&l!==sun)
  if (sun?.bbox && snow?.bbox) return {type:'sun_melts',sun:sun.obj,snowman:snow.obj}

  const cloudI = tagged.find(l=>has(l,'cloud'))
  const bolt   = tagged.find(l=>has(l,'lightning','thunder','bolt')&&l!==cloudI)
  if (cloudI?.bbox && bolt?.bbox) return {type:'cloud_storm',cloud:cloudI.obj,bolt:bolt.obj}

  const arrowI  = tagged.find(l=>has(l,'arrow'))
  const targetI = tagged.find(l=>has(l,'target','bullseye','dartboard')&&l!==arrowI)
  if (arrowI?.bbox && targetI?.bbox) return {type:'arrow_bullseye',arrow:arrowI.obj,target:targetI.obj}

  const bugI    = tagged.find(l=>has(l,'bee','butterfly','bumblebee'))
  const flowerI = tagged.find(l=>has(l,'flower','tulip','rose','sunflower','daisy')&&l!==bugI)
  if (bugI?.bbox && flowerI?.bbox) return {type:'pollination',bug:bugI.obj,flower:flowerI.obj}

  const dogI  = tagged.find(l=>has(l,'dog','puppy'))
  const fetchI = tagged.find(l=>has(l,'ball','bone','stick')&&l!==dogI)
  if (dogI?.bbox && fetchI?.bbox) return {type:'dog_fetch',dog:dogI.obj,ball:fetchI.obj}

  const personI = tagged.find(l=>has(l,'person','boy','girl','child','kid'))
  const pball   = tagged.find(l=>has(l,'ball')&&l!==personI)
  if (personI?.bbox && pball?.bbox) return {type:'person_kick',person:personI.obj,ball:pball.obj}

  const whaleI = tagged.find(l=>has(l,'whale','dolphin'))
  const boatI  = tagged.find(l=>has(l,'boat','ship','sailboat')&&l!==whaleI)
  if (whaleI?.bbox && boatI?.bbox) return {type:'whale_boat',whale:whaleI.obj,boat:boatI.obj}

  const birdI = tagged.find(l=>has(l,'bird','crow','robin','hen','chicken'))
  const wormI = tagged.find(l=>has(l,'worm','bug','caterpillar')&&l!==birdI)
  if (birdI?.bbox && wormI?.bbox) return {type:'bird_peck',bird:birdI.obj,worm:wormI.obj}

  return null
}

// ── Interaction animators ─────────────────────────────────────────────────────
function makeBasketballShot(ballCut,hoopCut,W,H) {
  const bx=ballCut.cx,by=ballCut.cy,hx=hoopCut.cx,hy=hoopCut.cy
  const px=(bx+hx)/2, py=Math.min(by,hy)-H*0.32; let swishFired=false
  return { draw(ctx,t,particles) {
    const hoopGlow=t>0.62&&t<0.82?32:6
    drawCutout(ctx,hoopCut,hx,hy,{glow:hoopGlow,glowColor:'#FFD700'})
    if(t<0.70) {
      const bt=easeInOut(t/0.70), {x,y}=bezierPt(bt,bx,by,px,py,hx,hy)
      trail(particles,x,y,P.bball,{size:2+Math.random()*3,grav:0.03})
      drawCutout(ctx,ballCut,x,y,{rot:bt*Math.PI*5,glow:14+bt*12,glowColor:P.bball[0]})
    } else if(t<0.82) {
      if(!swishFired){swishFired=true;burst(particles,hx,hy,P.bball,{n:30,shape:'star',minSpd:2,maxSpd:9})}
      drawCutout(ctx,ballCut,hx,hy+8,{glow:38*((0.82-t)/0.12)+5,glowColor:'#FFD700',alpha:1-((t-0.70)/0.12)*0.35})
    } else {
      const ft=(t-0.82)/0.18
      drawCutout(ctx,ballCut,hx,hy+ft*H*0.40,{alpha:1-ft*0.85,glow:5,glowColor:P.bball[0]})
    }
  }}
}

function makeSoccerGoal(ballCut,goalCut,W,H) {
  const bx=ballCut.cx,by=ballCut.cy,gx=goalCut.cx,gy=goalCut.cy
  const goRight=gx>bx; let goalFired=false
  return { draw(ctx,t,particles) {
    drawCutout(ctx,goalCut,gx,gy,{glow:t>0.68?22:4,glowColor:'#4CAF50'})
    if(t<0.72) {
      const prog=easeInOut(t/0.72), x=bx+(gx-bx)*prog
      const dist=Math.abs(gx-bx)*prog, rot=(dist/Math.max(ballCut.sw,ballCut.sh)/Math.PI)*(goRight?1:-1)*Math.PI*2
      trail(particles,x,by+ballCut.sh*0.4,['#8B7355','#6B8E23','#90EE90'],{angle:Math.PI+(Math.random()-0.5)*0.8,speed:0.5+Math.random()*1.5,grav:0.05,size:2+Math.random()*3})
      drawCutout(ctx,ballCut,x,by,{rot,glow:8,glowColor:'#4CAF50'})
    } else {
      if(!goalFired){goalFired=true;burst(particles,gx,gy,['#FFD700','#FF4500','#00FF00','#FFFFFF','#FF69B4'],{n:35,shape:'star',minSpd:2,maxSpd:10})}
      const ft=(t-0.72)/0.28
      drawCutout(ctx,ballCut,gx,gy,{alpha:1-ft*0.6,glow:15*(1-ft),glowColor:'#FFD700'})
    }
  }}
}

function makeRocketMoon(rocketCut,moonCut,W,H) {
  const rx=rocketCut.cx,ry=rocketCut.cy,mx=moonCut.cx,my=moonCut.cy; let landFired=false; let frame=0
  return { draw(ctx,t,particles) {
    frame++
    const moonScale=1+Math.sin(t*Math.PI*2)*0.05
    drawCutout(ctx,moonCut,mx,my,{sx:moonScale,sy:moonScale,glow:t>0.78?28:10,glowColor:'#F1C40F'})
    if(t<0.78) {
      const prog=easeIn(t/0.78), x=rx+(mx-rx)*prog, y=ry+(my-ry)*prog, scale=1-prog*0.55
      if(frame%1===0) for(let i=0;i<3;i++) trail(particles,x+(Math.random()-0.5)*6,y+(Math.random()-0.5)*6,P.fire,{angle:Math.atan2(ry-my,rx-mx)+(Math.random()-0.5)*0.5,speed:1+Math.random()*3,grav:0.02,size:2+Math.random()*4,shape:'spark'})
      drawCutout(ctx,rocketCut,x,y,{sx:scale,sy:scale,glow:16,glowColor:'#FFD700'})
    } else {
      if(!landFired){landFired=true;burst(particles,mx,my,P.space2,{n:28,shape:'star',minSpd:1,maxSpd:5,grav:0.01})}
      const ft=(t-0.78)/0.22
      drawCutout(ctx,rocketCut,mx,my,{sx:0.45,sy:0.45,alpha:1-ft*0.6,glow:10*(1-ft),glowColor:'#FFD700'})
    }
  }}
}

function makeSunMelts(sunCut,snowCut,W,H) {
  const sx=sunCut.cx,sy=sunCut.cy,smx=snowCut.cx,smy=snowCut.cy; let frame=0
  return { draw(ctx,t,particles) {
    frame++
    const sunScale=1+Math.sin(t*Math.PI*4)*0.08+t*0.12
    drawCutout(ctx,sunCut,sx,sy,{sx:sunScale,sy:sunScale,rot:t*Math.PI*3,glow:10+t*45,glowColor:'#FFD700'})
    const melt=Math.pow(t,0.65), smScaleY=1-melt*0.88, smScaleX=1+melt*0.32
    if(t>0.08&&frame%3===0) for(let i=0;i<2;i++) trail(particles,smx+(Math.random()-0.5)*snowCut.sw*smScaleX*0.8,smy,['#FFFFFF','#B0E0E6','#87CEEB'],{angle:Math.PI/2+(Math.random()-0.5)*0.5,speed:1+Math.random()*2,grav:0.1,size:3+Math.random()*4,shape:'drop'})
    drawCutout(ctx,snowCut,smx,smy+snowCut.sh*(1-smScaleY)*0.4,{sx:smScaleX,sy:smScaleY,alpha:1-t*0.65,glowColor:'#87CEEB'})
  }}
}

function makeCloudStorm(cloudCut,boltCut,W,H) {
  const cx=cloudCut.cx,cy=cloudCut.cy; let frame=0
  const strikes=[{x:cx,t:0.25},{x:cx+W*0.1,t:0.55},{x:cx-W*0.08,t:0.78}]
  return { draw(ctx,t,particles) {
    frame++
    drawCutout(ctx,cloudCut,cx+Math.sin(t*Math.PI*3)*W*0.03,cy,{glow:10+Math.sin(t*Math.PI*4)*15,glowColor:'#4169E1',alpha:0.85})
    if(frame%3===0) trail(particles,cx+(Math.random()-0.5)*cloudCut.sw*0.6,cy+cloudCut.sh*0.4,P.sky,{angle:Math.PI/2+(Math.random()-0.5)*0.2,speed:3+Math.random()*4,grav:0.15,size:2+Math.random()*2,shape:'drop'})
    strikes.forEach(({x,t:st})=>{
      const d=Math.abs(t-st)
      if(d<0.08) {
        const fl=1-d/0.08
        drawCutout(ctx,boltCut,x,cy+cloudCut.sh*0.3,{glow:fl*60,glowColor:'#FFD700',alpha:fl})
        if(d<0.02) burst(particles,x,cy+cloudCut.sh*0.5,['#FFD700','#FFFFFF','#FFF176'],{n:14,shape:'spark',minSpd:2,maxSpd:7})
      }
    })
  }}
}

function makeArrowBullseye(arrowCut,targetCut,W,H) {
  const ax=arrowCut.cx,ay=arrowCut.cy,tx=targetCut.cx,ty=targetCut.cy; let hitFired=false
  return { draw(ctx,t,particles) {
    const tScale=1+Math.sin(t*Math.PI*4)*0.04
    drawCutout(ctx,targetCut,tx,ty,{sx:tScale,sy:tScale,glow:t>0.68?30:6,glowColor:'#FF4500'})
    if(t<0.70) {
      const prog=easeIn(t/0.70), x=ax+(tx-ax)*prog, y=ay+(ty-ay)*prog
      drawCutout(ctx,arrowCut,x,y,{rot:Math.atan2(ty-ay,tx-ax),glow:10,glowColor:'#8B4513'})
    } else {
      if(!hitFired){hitFired=true;burst(particles,tx,ty,['#FF4500','#FFD700','#FF0000','#FFFFFF','#FF6347'],{n:28,shape:'star',minSpd:2,maxSpd:9})}
      const vib=Math.sin((t-0.7)*Math.PI*40)*3*Math.exp(-(t-0.7)*8)
      drawCutout(ctx,arrowCut,tx+vib,ty,{rot:Math.atan2(ty-ay,tx-ax),glow:8,glowColor:'#8B4513'})
    }
  }}
}

function makePollination(bugCut,flowerCut,W,H) {
  const bx=bugCut.cx,by=bugCut.cy,fx=flowerCut.cx,fy=flowerCut.cy
  const pc=['#FFD700','#FFA500','#FFFF00','#F0E68C']; let pollinated=false
  return { draw(ctx,t,particles) {
    const sway=Math.sin(t*Math.PI*4)*0.12, pivY=fy+flowerCut.sh*0.45
    ctx.save(); ctx.translate(fx,pivY); ctx.rotate(sway); ctx.shadowBlur=8; ctx.shadowColor=pc[0]; ctx.globalAlpha=1
    ctx.drawImage(flowerCut.canvas,-flowerCut.sw/2,-flowerCut.sh-flowerCut.sh*0.45+flowerCut.sh*0.5,flowerCut.sw,flowerCut.sh); ctx.restore()
    if(t<0.60) {
      const prog=easeInOut(t/0.60), x=bx+(fx-bx)*prog+Math.sin(t*Math.PI*6)*W*0.06, y=by+(fy-by)*prog+Math.sin(t*Math.PI*10)*H*0.04
      drawCutout(ctx,bugCut,x,y,{sy:1+Math.sin(t*Math.PI*28)*0.12,glow:10,glowColor:'#FFD700'})
    } else if(t<0.75) {
      if(!pollinated){pollinated=true;burst(particles,fx,fy,pc,{n:24,shape:'star',minSpd:1,maxSpd:5,grav:0.03})}
      drawCutout(ctx,bugCut,fx,fy,{sx:0.6,sy:0.6,glow:18,glowColor:'#FFD700'})
    } else {
      const prog=(t-0.75)/0.25, gd=bx<fx?-1:1, x=fx+gd*prog*W*0.42, y=fy-prog*H*0.15
      trail(particles,x,y,pc,{shape:'star',size:1.5+Math.random()*3,grav:0.01})
      drawCutout(ctx,bugCut,x,y,{sx:0.8,sy:0.8,glow:12,glowColor:'#FFD700'})
    }
  }}
}

function makeDogFetch(dogCut,ballCut,W,H) {
  const dx=dogCut.cx,dy=dogCut.cy,bx=ballCut.cx,by=ballCut.cy; let fetched=false; let frame=0
  return { draw(ctx,t,particles) {
    frame++
    if(t<0.45) {
      const prog=easeInOut(t/0.45), x=dx+(bx-dx)*prog, scX=bx>dx?1:-1
      const bob=Math.abs(Math.sin(t*Math.PI*12))*H*0.03
      drawCutout(ctx,ballCut,bx,by,{glow:8,glowColor:P.bball[0]})
      drawCutout(ctx,dogCut,x,dy-bob,{sx:scX,glow:10,glowColor:P.rainbow[0]})
    } else if(t<0.55) {
      if(!fetched){fetched=true;burst(particles,bx,by,P.bball,{n:12,minSpd:2,maxSpd:5})}
      drawCutout(ctx,dogCut,bx,dy,{glow:18,glowColor:'#FFD700'})
    } else {
      const prog=easeInOut((t-0.55)/0.45), x=bx+(dx-bx)*prog, scX=dx>bx?1:-1
      const bob=Math.abs(Math.sin(t*Math.PI*12))*H*0.04
      if(frame%3===0) trail(particles,x,dy+bob,P.rainbow,{shape:'star',size:2+Math.random()*3,grav:0.02})
      drawCutout(ctx,dogCut,x,dy-bob,{sx:scX,glow:14+bob*50,glowColor:'#FFD700'})
    }
  }}
}

function makePersonKick(personCut,ballCut,W,H) {
  const px=personCut.cx,py=personCut.cy,bx=ballCut.cx,by=ballCut.cy
  const goRight=bx>px, ballEndX=goRight?W+ballCut.sw:-ballCut.sw; let kicked=false
  return { draw(ctx,t,particles) {
    const bob=Math.sin(t*Math.PI*4)*H*0.05, scY=1+Math.cos(t*Math.PI*4)*0.08
    drawCutout(ctx,personCut,px,py+bob,{sy:scY,glow:10,glowColor:'#FF69B4'})
    if(t<0.25) {
      drawCutout(ctx,ballCut,bx,by,{glow:8,glowColor:P.bball[0]})
    } else {
      if(!kicked&&t<0.28){kicked=true;burst(particles,bx,by,P.bball,{n:12,minSpd:3,maxSpd:6,shape:'star'})}
      const prog=easeInOut((t-0.25)/0.75), x=bx+(ballEndX-bx)*prog
      const dist=Math.abs(ballEndX-bx)*prog, rot=(dist/Math.max(ballCut.sw,ballCut.sh)/Math.PI)*(goRight?1:-1)*Math.PI*2
      drawCutout(ctx,ballCut,x,by,{rot,glow:10,glowColor:P.bball[0]})
    }
  }}
}

function makeWhaleSurfaces(whaleCut,boatCut,W,H) {
  const wx=whaleCut.cx, startY=H+whaleCut.sh, peakY=Math.min(whaleCut.cy,H*0.4)
  const bx=boatCut.cx,by=boatCut.cy; let splashed=false
  return { draw(ctx,t,particles) {
    const rock=Math.sin(t*Math.PI*5)*0.12*(t>0.3?1:0)
    drawCutout(ctx,boatCut,bx,by+Math.sin(t*Math.PI*5)*H*0.02,{rot:rock,glow:8,glowColor:P.water[0]})
    const wt=t<0.5?t/0.5:(1-t)/0.5
    const y=startY+(peakY-startY)*easeOut(wt)
    if(wt>0.8&&!splashed){splashed=true;burst(particles,wx,H*0.7,P.water,{n:20,shape:'drop',minSpd:2,maxSpd:7,grav:0.1})}
    drawCutout(ctx,whaleCut,wx,y,{glow:16+wt*20,glowColor:'#40E0D0'})
  }}
}

function makeBirdPeck(birdCut,wormCut,W,H) {
  const bx=birdCut.cx, by=birdCut.cy, wx=wormCut.cx, wy=wormCut.cy; let pecked=false; let frame=0
  return { draw(ctx,t,particles) {
    frame++
    if(!pecked) {
      const wiggle=Math.sin(t*Math.PI*8)*W*0.04
      drawCutout(ctx,wormCut,wx+wiggle,wy,{rot:Math.sin(t*Math.PI*8)*0.3,glow:8,glowColor:'#8B4513'})
    }
    if(t<0.6) {
      const prog=easeInOut(t/0.6), x=bx+(wx-bx)*prog
      const bob=Math.abs(Math.sin(t*Math.PI*8))*H*0.04, scX=wx>bx?1:-1
      drawCutout(ctx,birdCut,x,by-bob,{sx:scX,glow:10,glowColor:P.rainbow[0]})
    } else if(t<0.72) {
      if(!pecked){pecked=true;burst(particles,wx,wy,['#8B4513','#D2691E','#A0522D'],{n:12})}
      drawCutout(ctx,birdCut,wx,by,{sx:wx>bx?1:-1,rot:Math.sin((t-0.6)*Math.PI*15)*0.5,glow:16,glowColor:'#FFD700'})
    } else {
      const prog=(t-0.72)/0.28, x=wx+(bx-wx)*prog, scX=wx>bx?1:-1
      const bob=Math.abs(Math.sin(t*Math.PI*8))*H*0.03
      if(frame%3===0) trail(particles,x,by+bob,P.rainbow,{shape:'star',size:2+Math.random()*3,grav:0.02})
      drawCutout(ctx,birdCut,x,by-bob,{sx:scX,glow:12,glowColor:P.rainbow[0]})
    }
  }}
}

// ── Adaptive scene engine ─────────────────────────────────────────────────────
// Every object is assigned a ROLE. The scene composes itself from whatever roles
// are present — no lookup table, no hardcoded scene names. Any drawing adapts.
//
// Roles:
//   celestial    — sun, moon, comet, planet, star  → arc across sky over terrain
//   sky_drifter  — cloud, balloon, kite, snowflake → drift horizontally
//   sky_flier    — bird, plane, butterfly, bat      → fly with arc
//   terrain      — mountain, building, lighthouse   → static backdrop
//   sway         — tree, flower, grass, mushroom   → sway in breeze
//   water        — river, ocean, wave, lake         → shimmer + ripple
//   swimmer      — fish, whale, dolphin, shark      → swim through water
//   ground_mover — dog, horse, car, person         → move across ground
//   fire         — fire, candle, volcano, sparkler  → flicker
//   weather      — rain, lightning, snow, tornado   → atmospheric particles
//   magic        — rainbow, firework, gem, comet   → reveal / sparkle
//   structure    — house, barn, tent, anchor        → static + warm glow
//   prop         — everything else                  → subtle pulse

// ── Role classifier ──────────────────────────────────────────────────────────
// Maps a subType to its role in a scene. Roles drive adaptive scene composition.
const ROLE_MAP = {
  // Celestial — arc across sky over terrain horizon
  celestial:    ['sun','moon','comet','planet','satellite','black_hole','star'],
  // Sky drifters — drift horizontally at their natural height
  sky_drifter:  ['cloud','thundercloud','balloon','kite','snowflake'],
  // Sky fliers — fly with arc and wing motion
  sky_flier:    ['bird','eagle','owl','bat','butterfly','dragonfly','bee','ladybug',
                 'firefly','parrot','duck','flamingo','peacock','plane','helicopter',
                 'paper_plane','ufo'],
  // Terrain — static backdrop, the stage everything else plays on
  terrain:      ['mountain','volcano','lighthouse'],
  // Sway — plants/nature that sways in breeze
  sway:         ['tree','flower','grass','mushroom','cactus','bamboo'],
  // Water body — shimmers and ripples
  water:        ['wave','anchor'],
  // Swimmers — move through water
  swimmer:      ['fish','whale','dolphin','shark','turtle','octopus',
                 'jellyfish','crab','seal','submarine','mermaid'],
  // Ground movers — walk/run/drive across the scene
  ground_mover: ['dog','cat','horse','rabbit','kangaroo','lion','bear',
                 'elephant','person','robot','dino','cow','pig','sheep',
                 'snake','lizard','monkey','wolf','deer','zebra','camel',
                 'frog','squirrel','hedgehog','raccoon','worm','ant',
                 'caterpillar','snail','spider','penguin'],
  // Ground drivers
  ground_driver:['car','race_car','bicycle','skateboard','train','ambulance',
                 'fire_truck','police_car','monster_truck'],
  // Marine vehicles
  boat:         ['boat','submarine'],
  // Fire/glow — flicker with heat particles
  fire:         ['fire','candle','lantern','sparkler'],
  // Weather — atmospheric particle effects
  weather:      ['rain','lightning','tornado'],
  // Magic/reveal — special effects
  magic:        ['rainbow','firework','gem','magic_wand'],
  // Structures — static with warm glow
  structure:    ['house','building','tent','barn','coin','crown','trophy',
                 'gift','book','guitar','drum','bell','phone'],
  // Props — subtle pulse glow, static position
  prop:         [],
}
const _subTypeToRole = {}
for (const [role,list] of Object.entries(ROLE_MAP))
  list.forEach(s => { _subTypeToRole[s] = role })

function getRole(subType) { return _subTypeToRole[subType] ?? 'prop' }

// ── Horizon helper ─────────────────────────────────────────────────────────────
// Returns the Y position of the "ground horizon" in canvas pixels.
// Uses the top edge of the lowest terrain object, falling back to 65% height.
function getHorizonY(groups, H) {
  const terrainCuts = [...(groups.terrain||[]), ...(groups.structure||[]), ...(groups.water||[])]
  if (terrainCuts.length) return Math.min(...terrainCuts.map(c => c.cy - c.sh * 0.44))
  return H * 0.65
}

// ── Adaptive scene compositor ─────────────────────────────────────────────────
// Given a role→[cuts] map, produces ONE unified animation that tells the most
// meaningful story possible from whatever objects are present.
// Any combination works: single object, two objects, full scenery.
function buildAdaptiveSceneAnim(groups, W, H) {
  let frame = 0
  const horizonY = getHorizonY(groups, H)

  // Pre-compute arc parameters for celestial objects
  const celestials = groups.celestial || []
  const arcCX = W * 0.5, arcRX = W * 0.44
  const arcRY = Math.max(horizonY * 0.82, H * 0.25)

  // Stagger multiple celestials so they don't overlap
  const celestialArcs = celestials.map((c, i) => {
    const offset = (i / Math.max(celestials.length, 1)) * 0.35
    return { cut: c, offset }
  })

  // Weather intensity flag
  const hasWeather  = (groups.weather||[]).length > 0
  const hasWater    = (groups.water||[]).length > 0
  const hasSwimmer  = (groups.swimmer||[]).length > 0
  const hasFire     = (groups.fire||[]).length > 0
  const hasRainbow  = (groups.magic||[]).some(c => true) // magic role includes rainbow
  const hasLightning= (groups.weather||[]).some(c =>
    c.canvas._cx !== undefined) // any weather = could have lightning

  // Precompute swimmer travel paths so they loop independently
  const swimmerPaths = (groups.swimmer||[]).map((c, i) => {
    const goRight = c.facing === 'right'
    return { cut:c, goRight, sx:c.cx, ex: goRight ? W+c.sw : -c.sw, phase: i*0.28 }
  })
  const groundPaths = [...(groups.ground_mover||[]), ...(groups.ground_driver||[])].map((c,i) => {
    const goRight = c.facing === 'right'
    return { cut:c, goRight, sx:c.cx, ex: goRight ? W+c.sw : -c.sw, phase: i*0.22 }
  })
  const boatPaths = (groups.boat||[]).map((c,i) => {
    const goRight = c.facing === 'right'
    return { cut:c, goRight, sx:c.cx, ex: goRight ? W+c.sw : -c.sw, phase: i*0.15 }
  })

  // Lightning strike times (for weather with lightning)
  const lightningTimes = [0.18, 0.44, 0.67, 0.85]

  return { draw(ctx, t, particles) {
    frame++

    // ── Layer 1: Terrain (static backdrop) ──────────────────────────────
    ;(groups.terrain||[]).forEach(c => drawCutout(ctx,c,c.cx,c.cy,{glow:0}))
    ;(groups.structure||[]).forEach(c => {
      const flicker = hasFire ? Math.sin(t*Math.PI*11)*0.08 : 0
      drawCutout(ctx,c,c.cx,c.cy,{glow:4+flicker*20,glowColor:'#FFD700',alpha:1})
    })

    // ── Layer 2: Water ────────────────────────────────────────────────────
    ;(groups.water||[]).forEach(c => {
      const wv = Math.sin(t*Math.PI*5 + c.cx*0.01) * H*0.018
      // colour shifts warmer when there's a celestial setting over it
      const sunX = celestials[0]?.cx ?? W*0.5
      const warmT = celestials.length ? Math.max(0, 1 - Math.abs(sunX - c.cx)/(W*0.5)) : 0
      const glowColor = warmT > 0.3 ? `hsl(${20+t*30},80%,55%)` : '#00BFFF'
      if(frame%4===0) trail(particles, c.cx+(Math.random()-0.5)*c.sw*0.7, c.cy+wv,
        [glowColor,'#40E0D0'], {size:2+Math.random()*3, grav:-0.01, speed:0.4})
      drawCutout(ctx,c,c.cx,c.cy+wv,{glow:8,glowColor})
    })

    // ── Layer 3: Swaying plants ────────────────────────────────────────────
    // Wind strength increases if weather is present
    const windStr = hasWeather ? 0.22 : 0.13
    ;(groups.sway||[]).forEach((c,i) => {
      const pivY = c.cy + c.sh*0.44
      const sw = Math.sin(t*Math.PI*(3+i*0.4))*windStr + (hasWeather?Math.sin(t*Math.PI*9+i)*0.06:0)
      ctx.save()
      ctx.translate(c.cx,pivY); ctx.rotate(sw)
      ctx.shadowBlur=6; ctx.shadowColor=P.nature[0]
      ctx.drawImage(c.canvas, -c.sw/2, -(c.sh + c.sh*0.44 - c.sh*0.5), c.sw, c.sh)
      ctx.restore()
      if(frame%7===0 && !hasWeather)
        trail(particles,c.cx+(Math.random()-0.5)*c.sw*0.4,c.cy-c.sh*0.1,P.nature,
          {shape:'star',size:2+Math.random()*3,grav:0.01,speed:0.4+Math.random()})
    })

    // ── Layer 4: Fire ───────────────────────────────────────────────────────
    ;(groups.fire||[]).forEach(c => {
      const flk = Math.random()*0.1, sc = 1+Math.sin(t*Math.PI*14)*0.12+flk
      if(frame%2===0) trail(particles,c.cx+(Math.random()-0.5)*c.sw*0.4,c.cy+c.sh*0.1,
        P.fire,{angle:-Math.PI/2+(Math.random()-0.5)*0.7,speed:0.8+Math.random()*3,
        upBias:2,grav:-0.03,size:2+Math.random()*5,shape:'spark'})
      drawCutout(ctx,c,c.cx,c.cy,{sx:sc,sy:sc,glow:18+flk*40,glowColor:'#FF6347'})
    })

    // ── Layer 5: Weather ───────────────────────────────────────────────────
    if(hasWeather) {
      // Rain particles falling everywhere
      if(frame%2===0) for(let i=0;i<5;i++)
        trail(particles,Math.random()*W,Math.random()*H*0.2,P.sky,
          {angle:Math.PI/2+(Math.random()-0.5)*0.2,speed:5+Math.random()*5,
           grav:0.2,size:2+Math.random()*2,shape:'drop'})
      // Lightning flashes at fixed times
      lightningTimes.forEach(lt => {
        const d = Math.abs(t-lt)
        if(d < 0.055) {
          const fl=1-d/0.055, lx=W*(0.25+Math.random()*0.5)
          ctx.save()
          ctx.strokeStyle=`rgba(255,255,100,${fl*0.9})`; ctx.lineWidth=3+fl*4
          ctx.shadowBlur=20*fl; ctx.shadowColor='#FFD700'
          ctx.beginPath()
          ctx.moveTo(lx,0); ctx.lineTo(lx+15,H*0.4); ctx.lineTo(lx-8,H*0.55)
          ctx.stroke(); ctx.restore()
          if(d<0.01) burst(particles,lx,H*0.55,['#FFD700','#FFFFFF'],{n:10,shape:'spark',minSpd:2,maxSpd:7})
        }
      })
    }

    // ── Layer 6: Sky drifters (clouds, balloons, kites) ────────────────────
    ;(groups.sky_drifter||[]).forEach((c,i) => {
      // Drift at their natural Y, loop across canvas width
      const speed = hasWeather ? 0.55 : 0.3
      const drift = (t*speed + i*0.38) % 1.4 - 0.2
      const bob   = Math.sin(t*Math.PI*3+i)*H*0.01
      const stormShake = hasWeather ? Math.sin(t*Math.PI*12+i)*W*0.008 : 0
      drawCutout(ctx,c,W*drift+c.sw*0.5+stormShake,c.cy+bob,
        {glow:hasWeather?12:5,glowColor:hasWeather?'#4169E1':'#87CEEB'})
    })

    // ── Layer 7: Swimmers ────────────────────────────────────────────────────
    swimmerPaths.forEach(({cut:c,goRight,sx,ex,phase}) => {
      const phasedT = (t + phase) % 1
      const x = sx + (ex-sx)*easeInOut(phasedT)
      const y = c.cy + Math.sin(phasedT*Math.PI*5)*H*0.06
      const rot = Math.sin(phasedT*Math.PI*5)*0.12
      if(frame%3===0) trail(particles,goRight?x-c.sw*0.4:x+c.sw*0.4,y,P.water,
        {angle:-Math.PI/2+(Math.random()-0.5)*1,speed:0.3+Math.random(),grav:-0.03,size:2+Math.random()*3})
      drawCutout(ctx,c,x,y,{rot,glow:12,glowColor:P.water[0]})
    })

    // ── Layer 8: Boats ───────────────────────────────────────────────────────
    boatPaths.forEach(({cut:c,goRight,sx,ex,phase}) => {
      const phasedT = (t+phase)%1
      const x = sx + (ex-sx)*easeInOut(phasedT)
      const bob = Math.sin(t*Math.PI*6)*H*0.022, rock=Math.sin(t*Math.PI*5)*0.09
      if(frame%4===0) trail(particles,goRight?x-c.sw*0.45:x+c.sw*0.45,
        c.cy+H*0.04,P.water,{size:2+Math.random()*4,grav:0.02,angle:Math.PI/2+(Math.random()-0.5)*0.5})
      drawCutout(ctx,c,x,c.cy+bob,{rot:rock,glow:10,glowColor:P.water[0]})
    })

    // ── Layer 9: Ground movers ────────────────────────────────────────────────
    groundPaths.forEach(({cut:c,goRight,sx,ex,phase}) => {
      const phasedT = (t+phase)%1
      const x = sx + (ex-sx)*easeInOut(phasedT)
      const bob = Math.abs(Math.sin(phasedT*Math.PI*8))*H*0.028
      if(frame%3===0) trail(particles,goRight?x-c.sw*0.4:x+c.sw*0.4,c.cy,
        P.earth,{size:2+Math.random()*3,grav:0.05})
      drawCutout(ctx,c,x,c.cy-bob,{glow:8,glowColor:'#FFD700'})
    })

    // ── Layer 10: Sky fliers ──────────────────────────────────────────────────
    ;(groups.sky_flier||[]).forEach((c,i) => {
      const goRight = c.facing==='right'
      const phasedT = (t + i*0.3) % 1
      const startX = c.cx, endX = goRight?W+c.sw:-c.sw
      const x = startX + (endX-startX)*easeInOut(phasedT)
      const y = c.cy - Math.sin(phasedT*Math.PI)*H*0.22 + Math.sin(phasedT*Math.PI*6)*H*0.025
      const scY = 1+Math.sin(phasedT*Math.PI*14)*0.18
      if(frame%4===0) trail(particles,goRight?x-c.sw*0.4:x+c.sw*0.4,y,P.sky,
        {size:1.5+Math.random()*2.5,grav:0.01})
      drawCutout(ctx,c,x,y,{sy:scY,glow:10,glowColor:P.sky[0]})
    })

    // ── Layer 11: Celestial objects arc across sky ─────────────────────────────
    celestialArcs.forEach(({cut:c,offset},i) => {
      const phasedT = Math.min(t+offset, 1)
      const angle = Math.PI - phasedT*Math.PI          // PI → 0 (left horizon → peak → right horizon)
      const sunX = arcCX + Math.cos(angle)*arcRX
      const sunY = horizonY - Math.sin(angle)*arcRY
      const visible = phasedT > 0.02 && phasedT < 0.98
      const scale = phasedT < 0.08 ? phasedT/0.08 : phasedT > 0.92 ? (1-phasedT)/0.08 : 1

      // Colour: infer from subType — sun=warm, moon=cool, star=white, comet=blue-white
      const subType = Object.entries(_subTypeToRole).find(([k,v])=>v==='celestial'&&c.cx!==undefined)?.[0] ?? 'sun'
      const hue = i===0 ? (20+phasedT*50) : 200    // first celestial warms, others cool
      const glowColor = celestials.length > 0 ? `hsl(${hue},100%,55%)` : '#FFD700'

      // Ambient light wash behind celestial object
      if(visible) {
        ctx.save()
        const grd=ctx.createRadialGradient(sunX,sunY,0,sunX,sunY,W*0.32)
        grd.addColorStop(0,`hsla(${hue},100%,60%,${0.12*scale})`)
        grd.addColorStop(1,'rgba(0,0,0,0)')
        ctx.fillStyle=grd; ctx.fillRect(0,0,W,H); ctx.restore()
      }

      // Light ray particles
      if(visible && frame%2===0) for(let j=0;j<3;j++)
        trail(particles,sunX,sunY,[`hsl(${hue},100%,75%)`,'#FFD700','#FFF'],
          {angle:Math.random()*Math.PI*2,speed:1+Math.random()*4,grav:-0.01,size:2+Math.random()*5,shape:'spark'})

      if(visible) drawCutout(ctx,c,sunX,sunY,{
        sx:scale,sy:scale, rot:phasedT*Math.PI*4,
        glow:16+Math.sin(phasedT*Math.PI)*28, glowColor
      })
    })

    // ── Layer 12: Magic / rainbow ──────────────────────────────────────────────
    ;(groups.magic||[]).forEach((c,i) => {
      // Rainbow reveals left-to-right over first half, then glows
      const rc=['#FF0000','#FF7F00','#FFFF00','#00FF00','#4169E1','#8B00FF']
      if(t < 0.55) {
        const reveal = t/0.55
        ctx.save(); ctx.beginPath()
        ctx.rect(c.cx-c.sw/2, c.cy-c.sh, c.sw*reveal, c.sh*2); ctx.clip()
        drawCutout(ctx,c,c.cx,c.cy,{glow:10+reveal*18,glowColor:'#FFD700'})
        ctx.restore()
        if(reveal<1&&frame%2===0) for(let j=0;j<2;j++)
          trail(particles,c.cx-c.sw/2+c.sw*reveal,c.cy+(Math.random()-0.5)*c.sh*0.6,
            rc,{shape:'star',size:2+Math.random()*4,grav:0.01})
      } else {
        const pulse=1+Math.sin(t*Math.PI*6)*0.06
        drawCutout(ctx,c,c.cx,c.cy,{sx:pulse,sy:pulse,glow:18+Math.sin(t*Math.PI*6)*12,glowColor:'#FFD700'})
      }
    })

    // ── Layer 13: Props — anything unclassified pulses gently ─────────────────
    ;(groups.prop||[]).forEach(c => {
      const pulse=1+Math.sin(t*Math.PI*4+c.cx)*0.06
      drawCutout(ctx,c,c.cx,c.cy,{sx:pulse,sy:pulse,glow:10+Math.sin(t*Math.PI*4)*8,glowColor:'#FFD700'})
    })
  }}
}


// Build cutMap: subtype → [cut, ...]  from detected objects
function buildCutMap(drawCanvas, objects, W, H) {
  const cutMap = {}
  objects.forEach(o => {
    if (!o.boundingBox?.w || o.boundingBox.w < 0.04) return
    const key = getSubType(o.label, o.tags)
    const cut = extractCutout(drawCanvas, o.boundingBox, W, H)
    if (!cutMap[key]) cutMap[key] = []
    cutMap[key].push(cut)
  })
  return cutMap
}

// ── Claude-dictated behavior executor ────────────────────────────────────────
// Maps behavior names from animation_plan → ANIMATORS methods (already in the engine).
// Defined after ANIMATORS so we can reference it.  Each value is (cut, W, H, c, obj) → anim.
function _behaviorAnimator(behavior, cut, W, H, colors, obj) {
  switch (behavior) {
    case 'arc_across_sky':     return ANIMATORS.sun(cut,W,H,colors,obj)
    case 'static_backdrop':    return { draw(ctx){ const {canvas:cv,sx,sy,sw,sh}=cut; ctx.drawImage(cv,0,0,sw,sh,sx,sy,sw,sh) } }
    case 'sway_in_breeze':     return ANIMATORS.tree(cut,W,H,colors,obj)
    case 'drift_horizontally': return ANIMATORS.cloud(cut,W,H,colors,obj)
    case 'fly_across':         return makeFlyAnim(cut,W,H,colors)
    case 'shimmer':            return ANIMATORS.wave(cut,W,H,colors,obj)
    case 'swim_across':        return ANIMATORS.fish(cut,W,H,colors,obj)
    case 'walk_across':        return makeHopAnim(cut,W,H,colors,{hopH:0.08,hops:6})
    case 'drive_across':       return makeDriveAnim(cut,W,H,colors)
    case 'bounce':             return makeHopAnim(cut,W,H,colors,{hopH:0.28,hops:3})
    case 'spin_in_place':      return ANIMATORS.star?.(cut,W,H,colors,obj) ?? makeHopAnim(cut,W,H,colors,{hopH:0.05,hops:8})
    case 'flicker':            return ANIMATORS.fire(cut,W,H,colors,obj)
    case 'rain_fall':          return ANIMATORS.rain(cut,W,H,colors,obj)
    case 'reveal_left_right':  return ANIMATORS.rainbow(cut,W,H,colors,obj)
    case 'pulse_glow':         return ANIMATORS.gem(cut,W,H,colors,obj)
    case 'shake_and_erupt':    return ANIMATORS.volcano(cut,W,H,colors,obj)
    case 'rise_from_below':    return makeRiseAnim(cut,W,H)
    case 'fall_from_above':    return makeFallAnim(cut,W,H)
    case 'orbit':              return makeOrbitAnim(cut,W,H)
    case 'chase':              return makeDriveAnim(cut,W,H,colors)
    default:                   return ANIMATORS.ball(cut,W,H,colors,obj)
  }
}

// Simple fallback animators for behaviors that don't have a direct match
function makeRiseAnim(cut,W,H) {
  const {canvas:cv,sx,sy,sw,sh}=cut
  return { draw(ctx,t) {
    const yOff=(1-t)*H*0.4
    ctx.drawImage(cv,0,0,sw,sh, sx, sy+yOff*(1-t*2<0?0:1-t*2), sw, sh)
  }}
}
function makeFallAnim(cut,W,H) {
  const {canvas:cv,sx,sy,sw,sh}=cut
  return { draw(ctx,t) {
    const yOff=-H*0.4*(1-t)
    ctx.drawImage(cv,0,0,sw,sh, sx, sy+yOff, sw, sh)
  }}
}
function makeOrbitAnim(cut,W,H) {
  const {canvas:cv,sx,sy,sw,sh}=cut
  const cx=W/2, cy=H/2
  const r=Math.min(W,H)*0.3
  return { draw(ctx,t) {
    const angle=t*Math.PI*2
    ctx.save()
    ctx.translate(cx+Math.cos(angle)*r-sw/2, cy+Math.sin(angle)*r*0.4-sh/2)
    ctx.drawImage(cv,0,0,sw,sh,0,0,sw,sh)
    ctx.restore()
  }}
}

function buildPlanAnim(plan, detectedObjects, drawCanvas, W, H) {
  // Build label → cutout map
  const cutMap = {}
  detectedObjects.forEach(o => {
    if (o.boundingBox?.w > 0.02) cutMap[o.label] = extractCutout(drawCanvas, o.boundingBox, W, H)
  })

  const anims = plan.map(entry => {
    const cut = cutMap[entry.label]
    if (!cut) return null
    const obj  = detectedObjects.find(o => o.label === entry.label) ?? {}
    const colors = getPalette(obj)
    try { return _behaviorAnimator(entry.behavior, cut, W, H, colors, obj) } catch { return null }
  }).filter(Boolean)

  if (!anims.length) return null

  return {
    draw(ctx, t, particles) {
      anims.forEach(a => { try { a.draw(ctx, t, particles) } catch {} })
    }
  }
}

// ── Main export ───────────────────────────────────────────────────────────────
export function bringToLife(overlay, drawCanvas, detectedObjects, age=6, onDone, animationPlan) {
  if (!detectedObjects?.length) { onDone?.(); return ()=>{} }

  const W=drawCanvas.width, H=drawCanvas.height
  overlay.width=W; overlay.height=H
  const ctx=overlay.getContext('2d')
  const particles=[]

  let anim = null

  // Priority 0: Claude-dictated animation plan
  if (animationPlan?.length) {
    anim = buildPlanAnim(animationPlan, detectedObjects, drawCanvas, W, H)
  }

  const ix = !anim && detectedObjects.length >= 2 ? detectInteraction(detectedObjects) : null
  if (ix) {
    const {type,...roles}=ix
    if      (type==='basketball_shot') { const bC=extractCutout(drawCanvas,roles.ball.boundingBox,W,H); const hC=extractCutout(drawCanvas,roles.hoop.boundingBox,W,H); anim=makeBasketballShot(bC,hC,W,H) }
    else if (type==='soccer_goal')     { const bC=extractCutout(drawCanvas,roles.ball.boundingBox,W,H); const gC=extractCutout(drawCanvas,roles.goal.boundingBox,W,H); anim=makeSoccerGoal(bC,gC,W,H) }
    else if (type==='rocket_moon')     { const rC=extractCutout(drawCanvas,roles.rocket.boundingBox,W,H); const mC=extractCutout(drawCanvas,roles.planet.boundingBox,W,H); anim=makeRocketMoon(rC,mC,W,H) }
    else if (type==='sun_melts')       { const sC=extractCutout(drawCanvas,roles.sun.boundingBox,W,H); const nC=extractCutout(drawCanvas,roles.snowman.boundingBox,W,H); anim=makeSunMelts(sC,nC,W,H) }
    else if (type==='cloud_storm')     { const cC=extractCutout(drawCanvas,roles.cloud.boundingBox,W,H); const bC=extractCutout(drawCanvas,roles.bolt.boundingBox,W,H); anim=makeCloudStorm(cC,bC,W,H) }
    else if (type==='arrow_bullseye')  { const aC=extractCutout(drawCanvas,roles.arrow.boundingBox,W,H); const tC=extractCutout(drawCanvas,roles.target.boundingBox,W,H); anim=makeArrowBullseye(aC,tC,W,H) }
    else if (type==='pollination')     { const bC=extractCutout(drawCanvas,roles.bug.boundingBox,W,H); const fC=extractCutout(drawCanvas,roles.flower.boundingBox,W,H); anim=makePollination(bC,fC,W,H) }
    else if (type==='dog_fetch')       { const dC=extractCutout(drawCanvas,roles.dog.boundingBox,W,H); const bC=extractCutout(drawCanvas,roles.ball.boundingBox,W,H); anim=makeDogFetch(dC,bC,W,H) }
    else if (type==='person_kick')     { const pC=extractCutout(drawCanvas,roles.person.boundingBox,W,H); const bC=extractCutout(drawCanvas,roles.ball.boundingBox,W,H); anim=makePersonKick(pC,bC,W,H) }
    else if (type==='whale_boat')      { const wC=extractCutout(drawCanvas,roles.whale.boundingBox,W,H); const bC=extractCutout(drawCanvas,roles.boat.boundingBox,W,H); anim=makeWhaleSurfaces(wC,bC,W,H) }
    else if (type==='bird_peck')       { const bC=extractCutout(drawCanvas,roles.bird.boundingBox,W,H); const wC=extractCutout(drawCanvas,roles.worm.boundingBox,W,H); anim=makeBirdPeck(bC,wC,W,H) }
  }

  if (!anim) {
    // Build role-grouped cutMap from all detected objects that have a bbox
    const validObjects = detectedObjects.filter(o => o.boundingBox?.w > 0.04 && o.boundingBox?.h > 0.04)
    const allObjects   = validObjects.length > 0 ? validObjects : detectedObjects.slice(0,1)

    if (allObjects.length > 1) {
      // Multi-object: adaptive scene engine assigns each object a role and
      // composes a meaningful layered animation automatically — any scene works.
      const groups = {}
      allObjects.forEach(o => {
        const subType = getSubType(o.label, o.tags)
        const role    = getRole(subType)
        const cut     = extractCutout(drawCanvas, o.boundingBox, W, H)
        if (!groups[role]) groups[role] = []
        groups[role].push(cut)
      })
      anim = buildAdaptiveSceneAnim(groups, W, H)
    } else {
      // Single object: use its individual ANIMATOR (full personality animation)
      const primary  = allObjects[0]
      const cut      = extractCutout(drawCanvas, primary.boundingBox, W, H)
      const colors   = getPalette(primary)
      const subType  = getSubType(primary.label, primary.tags)
      const maker    = ANIMATORS[subType] ?? ANIMATORS.ball
      anim = maker(cut, W, H, colors, primary)
    }
  }

  spawnAmbient(particles, detectedObjects[0]?.scene, W, H, getPalette(detectedObjects[0]))

  const DURATION=5800; let startTime=null, rafId=null
  function frame(ts) {
    if(!startTime) startTime=ts
    const t=Math.min((ts-startTime)/DURATION,1)
    ctx.clearRect(0,0,W,H)
    for(let i=particles.length-1;i>=0;i--){ particles[i].update(); particles[i].draw(ctx); if(particles[i].life<=0) particles.splice(i,1) }
    anim.draw(ctx,t,particles)
    if(t<1) { rafId=requestAnimationFrame(frame) }
    else { ctx.clearRect(0,0,W,H); onDone?.() }
  }
  rafId=requestAnimationFrame(frame)
  return ()=>{ if(rafId) cancelAnimationFrame(rafId); ctx.clearRect(0,0,W,H) }
}
