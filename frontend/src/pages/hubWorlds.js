// ── World system configs ──────────────────────────────────────────────────────
// Each world defines: background, particles, ambient, zone visual style, and labels.
export const WORLD_SYSTEMS = {
  space: {
    bg: 'linear-gradient(180deg,#020616 0%,#050d28 100%)',
    particles: { type: 'star',      count: 90, colors: ['#ffffff'] },
    ambient:   { type: 'nebula',    colors: ['#9d8fff55','#40c4ff44','#9d8fff44'] },
    zoneStyle: 'galaxy',
    zoneName:  'Galaxy',
    zoneAction:'Explore Galaxy ›',
    planetAction: 'Enter World ›',
    worldTitle:'Universe',
    subLabel:  'swipe to explore · tap to enter',
    orbitLabel:'drag to spin · tap focused planet to enter',
  },
  forest: {
    bg: 'linear-gradient(180deg,#030d06 0%,#051408 50%,#0a1f0f 100%)',
    particles: { type: 'firefly',   count: 60, colors: ['#aaff44','#88ee88','#ccff66','#ffff88'] },
    ambient:   { type: 'trees',     colors: ['#2d9a4e55','#52b78844','#95d5b244'] },
    zoneStyle: 'clearing',
    zoneName:  'Grove',
    zoneAction:'Enter Grove ›',
    planetAction: 'Explore Path ›',
    worldTitle:'Forest',
    subLabel:  'swipe to explore · tap to enter',
    orbitLabel:'drag to spin · tap to explore',
  },
  ocean: {
    bg: 'linear-gradient(180deg,#010810 0%,#021428 55%,#032040 100%)',
    particles: { type: 'bubble',    count: 55, colors: ['rgba(100,200,255,0.55)','rgba(180,240,255,0.38)','rgba(64,196,255,0.45)'] },
    ambient:   { type: 'seabed',    colors: ['#0096c755','#48cae444','#00b4d844'] },
    zoneStyle: 'reef',
    zoneName:  'Reef',
    zoneAction:'Dive In ›',
    planetAction: 'Swim There ›',
    worldTitle:'Ocean',
    subLabel:  'drift to explore · tap to dive',
    orbitLabel:'drift · tap to explore',
  },
  candy: {
    bg: 'linear-gradient(180deg,#0d0010 0%,#1a0028 50%,#2d0040 100%)',
    particles: { type: 'sprinkle',  count: 70, colors: ['#ff6ec7','#ffd600','#00e5ff','#ff6b6b','#b967ff','#00ff9f'] },
    ambient:   { type: 'candy',     colors: ['#e040fb55','#f06292aa','#b967ff44'] },
    zoneStyle: 'island',
    zoneName:  'Island',
    zoneAction:'Visit Island ›',
    planetAction: 'Taste It ›',
    worldTitle:'Candy Land',
    subLabel:  'swipe to explore · tap to visit',
    orbitLabel:'spin · tap to explore',
  },
  warmsky: {
    bg: 'linear-gradient(180deg,#0d0500 0%,#1a0800 30%,#3d1200 70%,#6b2200 100%)',
    particles: { type: 'ember',     count: 50, colors: ['#ff8c00','#ffb347','#ffd700','#ff6600','#ff4500'] },
    ambient:   { type: 'hills',     colors: ['#d96f1a55','#ff8c0044','#ffd70033'] },
    zoneStyle: 'meadow',
    zoneName:  'Meadow',
    zoneAction:'Visit Meadow ›',
    planetAction: 'Explore Path ›',
    worldTitle:'Sunny Valley',
    subLabel:  'swipe to explore · tap to visit',
    orbitLabel:'spin · tap to explore',
  },
  magical: {
    bg: 'linear-gradient(180deg,#060010 0%,#0d0020 40%,#1a0038 100%)',
    particles: { type: 'petal',     count: 65, colors: ['#ff80ab','#ce93d8','#ffd600','#80cbc4','#f48fb1','#fff9c4'] },
    ambient:   { type: 'sparkle',   colors: ['#ab47bc55','#ff80ab44','#ffd60033'] },
    zoneStyle: 'realm',
    zoneName:  'Realm',
    zoneAction:'Enter Realm ›',
    planetAction: 'Explore ›',
    worldTitle:'Kingdom',
    subLabel:  'swipe to explore · tap to enter',
    orbitLabel:'spin · tap to explore',
  },
  adventure: {
    bg: 'linear-gradient(180deg,#060000 0%,#0d0400 40%,#1a0600 100%)',
    particles: { type: 'spark',     count: 45, colors: ['#ff6600','#ff3300','#ffaa00','#ffffff','#ff9900'] },
    ambient:   { type: 'dramatic',  colors: ['#b0302055','#ff660044','#7b1fa244'] },
    zoneStyle: 'fortress',
    zoneName:  'Territory',
    zoneAction:'Enter Territory ›',
    planetAction: 'Go There ›',
    worldTitle:'World',
    subLabel:  'swipe to explore · tap to enter',
    orbitLabel:'spin · tap to explore',
  },
  cozy: {
    bg: 'linear-gradient(180deg,#04030a 0%,#0a0810 40%,#100c06 100%)',
    particles: { type: 'snowflake', count: 55, colors: ['rgba(255,255,255,0.72)','rgba(180,220,255,0.52)','rgba(220,240,255,0.6)'] },
    ambient:   { type: 'cozy',      colors: ['#7a5c3a55','#ff8a6544','#ce93d833'] },
    zoneStyle: 'nook',
    zoneName:  'Nook',
    zoneAction:'Visit Nook ›',
    planetAction: 'Snuggle In ›',
    worldTitle:'Cozy World',
    subLabel:  'swipe to explore · tap to visit',
    orbitLabel:'spin · tap to explore',
  },
  sky: {
    bg: 'linear-gradient(180deg,#061828 0%,#0a2440 40%,#1a3a60 100%)',
    particles: { type: 'cloud',     count: 18, colors: ['rgba(255,255,255,0.14)','rgba(180,220,255,0.1)','rgba(220,240,255,0.12)'] },
    ambient:   { type: 'sky',       colors: ['#4fc3f755','#81d4fa44','#b3e5fc33'] },
    zoneStyle: 'cloudisland',
    zoneName:  'Cloud',
    zoneAction:'Float There ›',
    planetAction: 'Fly There ›',
    worldTitle:'Sky',
    subLabel:  'drift to explore · tap to float',
    orbitLabel:'drift · tap to explore',
  },
  sport: {
    bg: 'linear-gradient(180deg,#0f2027 0%,#203a43 45%,#2c5364 100%)',
    particles: {
      type: 'spark',
      count: 20,
      colors: [
        'rgba(255,255,255,0.12)',
        'rgba(255,215,0,0.10)',
        'rgba(0,255,200,0.08)'
      ]
    },
    ambient: {
      type: 'stadium',
      colors: [
        '#00e5ff44',
        '#76ff0344',
        '#ffd60033'
      ]
    },
    zoneStyle: 'sportspark',
    zoneName: 'Arena',
    zoneAction: 'Play Here ›',
    planetAction: 'Compete There ›',
    worldTitle: 'Sports',
    subLabel: 'train to improve · tap to play',
    orbitLabel: 'compete · tap to explore',
  },
  abstract: {
    bg: 'linear-gradient(180deg,#080008 0%,#0d0010 40%,#150018 100%)',
    particles: { type: 'geometric', count: 40, colors: ['#ff6ec7','#ffd600','#00e5ff','#ff6b6b','#b967ff','#00ff9f','#ff9f00'] },
    ambient:   { type: 'abstract',  colors: ['#e91e8c55','#ffd60044','#00bcd433'] },
    zoneStyle: 'burst',
    zoneName:  'Arc',
    zoneAction:'Enter Arc ›',
    planetAction: 'Dive In ›',
    worldTitle:'World',
    subLabel:  'swipe to explore · tap to enter',
    orbitLabel:'spin · tap to explore',
  },
}

// ── Theme → world key ─────────────────────────────────────────────────────────
export const THEME_WORLD = {
  // Warm Sky
  coral: 'warmsky', sunshine: 'warmsky', lion: 'warmsky',
  // Space
  galaxy: 'space', moon: 'space', stardust: 'space',
  robot: 'space', curiositylab: 'space', avengers: 'adventure', superman: 'adventure',
  // Forest
  forest: 'forest', panda: 'forest', frog: 'forest',
  enchanted: 'forest', minecraft: 'forest',
  // Forest (autumn variant — leaf particles via override)
  autumnleaves: 'forest', dinosaur: 'forest',
  // Ocean
  ocean: 'ocean', shark: 'ocean', mermaid: 'ocean', monsoon: 'sky',
  // Candy
  candy: 'candy', bubblegum: 'candy', icecream: 'candy', pizza: 'candy', donut: 'candy',
  // Magical
  unicorn: 'magical', storymagic: 'magical', wordwizard: 'magical', goldstar: 'magical',
  rangoli: 'magical', kolam: 'magical', fairygarden: 'magical',
  cherryblossom: 'magical', princess: 'magical', holi: 'magical',
  // Adventure
  pirate: 'adventure', dragonfire: 'adventure', racecar: 'adventure',
  spiderman: 'adventure', batman: 'adventure', halloween: 'adventure', diwali: 'adventure',
  // Cozy
  hotcocoa: 'cozy', christmas: 'cozy', frozen: 'cozy',
  // Sky
  sky: 'sky',
  // Abstract
  rainbow: 'abstract', artStudio: 'abstract',
  // New themes
  train: 'warmsky', butterfly: 'magical', bees: 'warmsky',
  sunflowerfarm: 'warmsky', cricket: 'sport', football: 'sport',
  camping: 'forest', aroundtheworld: 'sky', junglebook: 'forest',
  music: 'abstract', girlhero: 'adventure',
}

// ── Per-theme particle overrides ──────────────────────────────────────────────
// Lets specific themes within a world system have more fitting particles.
const THEME_PARTICLE_OVERRIDES = {
  autumnleaves: { type: 'leaf',      colors: ['#e65100','#fbc02d','#bf360c','#ff7043','#8d6e63','#ff8f00'] },
  cherryblossom:{ type: 'petal',     colors: ['#f8bbd0','#f48fb1','#ffffff','#fce4ec','#ffcdd2'] },
  monsoon:      { type: 'raindrop',  colors: ['rgba(100,160,220,0.6)','rgba(150,200,255,0.4)','rgba(80,140,200,0.5)'] },
  minecraft:    { type: 'pixel',     colors: ['#8bc34a','#5d4037','#4fc3f7','#ffd600','#81c784'] },
  holi:         { type: 'geometric', colors: ['#e91e63','#ff9800','#00bcd4','#9c27b0','#8bc34a','#ffd600','#ff5722'] },
  diwali:       { type: 'spark',     colors: ['#ffd600','#ff9800','#ff5722','#ffffff','#ffcc02'] },
  frozen:       { type: 'snowflake', colors: ['rgba(200,240,255,0.82)','rgba(178,235,242,0.65)','rgba(255,255,255,0.75)'] },
  halloween:    { type: 'spark',     colors: ['#ff6600','#9c27b0','#ff3300','#ffa000','#e91e63'] },
  dinosaur:     { type: 'leaf',      colors: ['#558b2f','#33691e','#8bc34a','#aed581','#1b5e20'] },
}

// ── Resolver ──────────────────────────────────────────────────────────────────
export function getWorld(themeKey) {
  const worldKey = THEME_WORLD[themeKey] || 'warmsky' // coral/warmsky is default
  const world    = WORLD_SYSTEMS[worldKey]
  const override = THEME_PARTICLE_OVERRIDES[themeKey]
  if (override) return { ...world, particles: { ...world.particles, ...override } }
  return world
}
