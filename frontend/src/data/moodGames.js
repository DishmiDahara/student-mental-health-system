// ---------------------------------------------------------------------------
// MindSpace - Mood-Based Relaxing Games Catalog
//
// Single source of truth for genuine relaxing games.
// All brain-training, chess, math, and competitive quizzes are removed.
// Every game here is a calming, tactile, soothing, or meditative experience.
// ---------------------------------------------------------------------------

export const NEEDS = {
  stress: { label: 'Stress Relief', short: 'Stress', icon: '🫧', color: '#0ea5e9', tint: '#e0f2fe' },
  sadness: { label: 'Sadness & Low Mood', short: 'Low Mood', icon: '🌱', color: '#8b5cf6', tint: '#ede9fe' },
  anxiety: { label: 'Anxiety & Overthinking', short: 'Anxiety', icon: '🌬️', color: '#10b981', tint: '#d1fae5' },
  anger: { label: 'Anger & Frustration', short: 'Anger', icon: '🔥', color: '#f97316', tint: '#ffedd5' },
  refresh: { label: 'Relaxation & Refreshment', short: 'Refresh', icon: '✨', color: '#6366f1', tint: '#e0e7ff' }
}

export const NEED_ORDER = ['stress', 'sadness', 'anxiety', 'anger', 'refresh']

const g = (id, title, icon, desc, needs, launch, extra = {}) => ({ id, title, icon, desc, needs, launch, ...extra })

export const GAME_CATALOG = [
  // ---- New Real Open-Source Relaxing Games (Locally Hosted) ----
  g('zengarden', 'Zen Sand Garden', '🪨', 'Rake dry sand into ripples around meditation stones with soothing raking acoustics.', ['refresh', 'sadness', 'stress'], { type: 'local', src: '/games/zen-garden/index.html' }, {
    badge: 'Zen Garden',
    credit: 'Karesansui Sand Raking Simulator (MIT License)'
  }),
  g('koipond', 'Interactive Koi Pond', '🐟', 'Gentle Japanese Nishikigoi swimming with natural water ripples; tap to drop food.', ['sadness', 'refresh', 'anxiety'], { type: 'local', src: '/games/koi-pond/index.html' }, {
    badge: 'Aquatic',
    credit: 'Procedural Koi Flocking & Water Refraction (MIT License)'
  }),
  g('bubblewrap', 'Tactile Bubble Wrap', '🫧', 'Pop realistic plastic bubbles with authentic crisp acoustic snaps to relieve tension.', ['stress', 'anxiety', 'anger'], { type: 'local', src: '/games/bubble-wrap/index.html' }, {
    badge: 'Tactile',
    credit: 'Tactile Bubble Wrap Simulator (MIT License)'
  }),
  g('waterripples', 'Interactive Water Ripples', '💧', 'A responsive liquid pool surface that casts concentric refractive waves and raindrops.', ['anxiety', 'stress', 'refresh'], { type: 'local', src: '/games/water-ripples/index.html' }, {
    badge: 'Hydrodynamics',
    credit: 'Interactive Wave Propagation (MIT License)'
  }),
  g('fallingsand', 'Falling Sand Physics', '⏳', 'Creative elemental particle sandbox: pour sand, stream water, sprout plants, and watch soothing physics.', ['anxiety', 'refresh', 'stress'], { type: 'local', src: '/games/falling-sand/index.html' }, {
    badge: 'Physics',
    credit: 'Falling Sand Cellular Automata (MIT License)'
  }),
  g('harmony', 'Procedural Harmony Sketch', '🎨', 'Mr.doob procedural sketching with fluid ribbons, sketchy pencils, and web filaments.', ['refresh', 'sadness', 'anxiety'], { type: 'local', src: '/games/harmony/index.html' }, {
    badge: 'Generative Art',
    credit: 'Harmony Procedural Sketcher by Mr.doob (MIT License)'
  }),
  g('garten', 'Botanical Garden Bloom', '🌸', 'Plant seeds in fertile earth that organically sprout branching stems and blooming wildflowers.', ['sadness', 'refresh', 'anxiety'], { type: 'local', src: '/games/garten/index.html' }, {
    badge: 'Nature',
    credit: 'Procedural Botanical Growth Engine (MIT License)'
  }),
  g('cloth', 'Tearable Silk Cloth', '🧵', 'Interactive soft-body fabric floating in a breeze; stretch, ripple, and slice threads.', ['anger', 'stress', 'anxiety'], { type: 'local', src: '/games/cloth/index.html' }, {
    badge: 'Soft-Body',
    credit: 'Verlet Cloth Simulation by Dissimulate (MIT License)'
  }),
  g('pottery', 'Virtual Pottery Wheel', '🏺', 'Spin the turntable and gently press into soft wet clay to shape vases and ceramic bowls.', ['refresh', 'anxiety', 'stress'], { type: 'local', src: '/games/pottery/index.html' }, {
    badge: 'Ceramics',
    credit: 'Lathe Geometry Mesh Deformation (MIT License)'
  }),
  g('aquarium', 'Virtual Coral Aquarium', '🐠', 'Underwater tropical coral sanctuary with swimming clownfish, god rays, and floating bubbles.', ['sadness', 'refresh', 'anxiety'], { type: 'local', src: '/games/aquarium/index.html' }, {
    badge: 'Marine',
    credit: 'Coral Reef Sanctuary Simulation (MIT/BSD License)'
  }),
  g('fluid', 'Calm Fluid Canvas', '🌈', 'Swirl glowing fluid dynamics across dark velvet with your finger or mouse.', ['stress', 'anxiety', 'refresh'], { type: 'local', src: '/games/fluid/index.html' }, {
    badge: 'Fluid Dynamics',
    credit: 'WebGL Fluid Simulation by Pavel Dobryakov (MIT License)'
  }),
  g('floodit', 'Colour Flood', '🔵', 'Fill the board with a single calming colour in as few gentle moves as you like.', ['anxiety', 'refresh'], { type: 'local', src: '/games/floodit/index.html' }, {
    badge: 'Color Flow',
    credit: 'FloodIt by Thijs van As (MIT License)'
  }),

  // ---- Calming & Release MindSpace Mini-Games ----
  g('breathing', 'Guided Box Breathing', '🌬️', 'Follow the expanding resonant circle for slow, grounding 4-4-4-4 box breathing.', ['anxiety', 'stress'], { type: 'game', subtype: 'breathing' }),
  g('balloon', 'Worry Balloon Release', '🎈', 'Write a worry on a balloon, then pop it and let it float into the sunset.', ['anxiety', 'stress'], { type: 'game', subtype: 'balloon' }),
  g('bubbles', 'Zen Bubble Popper', '🫧', 'Pop soft pastel bubbles one by one to release built-up physical tension.', ['stress', 'anxiety'], { type: 'game', subtype: 'bubbles' }),
  g('whack', 'Whack-A-Stress', '🔨', 'Safely vent frustration by gently tapping popping stress critters.', ['anger', 'stress'], { type: 'game', subtype: 'whack' }),
  g('pet', 'Virtual Zen Pet', '🐱', 'Feed, brush and cuddle a gentle virtual kitten for instant comfort.', ['sadness'], { type: 'game', subtype: 'pet' }),
  g('coloring', 'Coloring Book', '🎨', 'Paint calming templates and let your thoughts slow down.', ['refresh', 'sadness'], { type: 'game', subtype: 'coloring' }),
  g('nature', 'Nature Sound Mixer', '🌲', 'Blend rain, ocean waves, forest wind and a crackling campfire.', ['anxiety', 'refresh'], { type: 'game', subtype: 'nature' }),
  g('soundboard', 'Calm Sound Board', '🎵', 'Play soft synthesized musical tones and ocean swells.', ['anxiety', 'refresh'], { type: 'game', subtype: 'soundboard' }),
  g('doodler', 'Zen Doodler', '✏️', 'A pastel canvas to sketch freely without judgment.', ['stress', 'refresh'], { type: 'game', subtype: 'doodler' }),
  g('safespace', 'Safe Space Story', '🏡', 'Choose sensory details to construct your own peaceful sanctuary.', ['sadness', 'anxiety'], { type: 'game', subtype: 'safespace' }),
  g('gratitude', 'Gratitude Garden', '🌻', 'Plant a blossom for every small thing you feel thankful for today.', ['sadness'], { type: 'game', subtype: 'gratitude' }),
  g('affirmation', 'Affirmation Spinner', '🎡', 'Spin the wheel to receive a kind, comforting reminder.', ['sadness'], { type: 'game', subtype: 'affirmation' }),

  // ---- 3D Relaxation Zone WebGL Worlds ----
  g('starfield', '3D Cosmic Starfield', '🌌', 'Drift through a glowing deep-space nebula in 360° celestial peace.', ['anxiety', 'refresh'], { type: '3d', key: 'starfield' }, { badge: '3D' }),
  g('sakura', '3D Sakura Sanctuary', '🌸', 'A Japanese temple pagoda with cherry blossom petals falling gently around you.', ['sadness', 'refresh'], { type: '3d', key: 'sakura' }, { badge: '3D' }),
  g('water', '3D Water Ripples', '🌊', 'A kinetic liquid pool that ripples wherever you touch.', ['stress', 'refresh'], { type: '3d', key: 'water' }, { badge: '3D' }),
  g('crystal', '3D Breathing Crystal', '🔮', 'Breathe in time with a slowly pulsing glowing glass orb.', ['anxiety', 'stress'], { type: '3d', key: 'crystal' }, { badge: '3D' }),
  g('saturn', '3D Saturn & Moons', '🪐', 'Watch celestial moons orbit a ringed planet in tranquil silence.', ['refresh', 'anxiety'], { type: '3d', key: 'saturn' }, { badge: '3D' }),
  g('autumn', '3D Autumn Forest', '🍃', 'Golden leaves drifting lazily in a quiet autumn breeze.', ['sadness', 'refresh'], { type: '3d', key: 'autumn' }, { badge: '3D' }),
  g('prism', '3D Prism Kaleidoscope', '💎', 'Rainbow light beams bending through a multifaceted crystal prism.', ['refresh', 'stress'], { type: '3d', key: 'prism' }, { badge: '3D' }),
  g('warp', '3D Quantum Warp Tunnel', '🚀', 'A smooth infinite spiral of soft light to quietly zone out to.', ['stress', 'anxiety'], { type: '3d', key: 'warp' }, { badge: '3D' }),

  // ---- Dedicated Tactile Relaxation Modals ----
  g('popit', 'Pop-It Fidget Toy', '🧸', 'Press every silicone bubble flat, then flip the board and pop again.', ['stress', 'anger'], { type: 'modal', modal: 'popit' }),
  g('mower', 'Stone Grass Mower', '🚜', 'Satisfying, repetitive lawn mowing that clears mental clutter.', ['stress', 'anger', 'refresh'], { type: 'modal', modal: 'mower' }),
  g('watersort', 'Water Sort Puzzle', '🧪', 'Gently sort soft pastel liquids between glass tubes at your own pace.', ['anxiety', 'refresh'], { type: 'modal', modal: 'watersort' }),
  g('merge', 'DesignVille Merge', '🏡', 'Merge cozy items to decorate a peaceful dream room.', ['refresh', 'sadness'], { type: 'modal', modal: 'merge' }),
  g('diff', 'Spot the Differences', '🔍', 'Spot subtle details between two peaceful, serene illustrations.', ['refresh'], { type: 'modal', modal: 'diff' }),
  g('catch', 'Catch the Stars', '🌠', 'Slide the basket to catch gentle falling stars.', ['sadness', 'refresh'], { type: 'game', subtype: 'catch' }),
  g('calmgenerator', 'Calm Activity Generator', '🧘', 'Get a simple, gentle mindfulness exercise to try right now.', ['anxiety', 'stress'], { type: 'game', subtype: 'calmgenerator', needsData: true }),
  g('positivequotes', 'Positive Quotes', '💬', 'Savour an uplifting quote to ground your mindset.', ['sadness'], { type: 'game', subtype: 'positivequotes', needsData: true })
]

const byId = Object.fromEntries(GAME_CATALOG.map(game => [game.id, game]))

// Mood value (1 Terrible ... 5 Great) -> EXACTLY 5 recommended game ids.
// 100% focused on genuine relaxing, calming, visual, and tactile games.
export const MOOD_GAME_MAP = {
  1: ['breathing', 'bubblewrap', 'cloth', 'waterripples', 'balloon'],
  2: ['koipond', 'garten', 'pet', 'aquarium', 'fluid'],
  3: ['fallingsand', 'zengarden', 'floodit', 'pottery', 'waterripples'],
  4: ['zengarden', 'harmony', 'sakura', 'garten', 'fluid'],
  5: ['fluid', 'fallingsand', 'starfield', 'harmony', 'mower']
}

export const MOOD_GAME_THEMES = {
  1: { headline: 'Deep Grounding & Tension Release', blurb: 'Slow box-breathing, tactile bubble wrap, and gentle silk tearing to ease high stress and heavy feelings.' },
  2: { headline: 'Comfort, Low Mood & Soothing', blurb: 'Gentle swimming koi fish, blooming wildflowers, and a peaceful aquarium to lift a low mood.' },
  3: { headline: 'Mental Refreshment & Focus', blurb: 'Falling sand physics, meditative sand raking, and pottery shaping to clear a foggy, restless mind.' },
  4: { headline: 'Creative Flow & Mindful Joy', blurb: 'Japanese zen gardens, procedural harmony sketching, and drifting cherry blossoms for mindful flow.' },
  5: { headline: 'Vibrant Energy & Wonder', blurb: 'Luminous fluid flows, celestial cosmic nebulae, and satisfying physical sand to channel great energy.' }
}

export const getGameById = id => byId[id]

export const getRecommendedGames = moodValue =>
  (MOOD_GAME_MAP[moodValue] || []).map(id => byId[id]).filter(Boolean)

// "Explore More Games": everything that is NOT in the current mood's top 5.
export const getExploreGames = moodValue => {
  const recommended = new Set(MOOD_GAME_MAP[moodValue] || [])
  return GAME_CATALOG.filter(game => !recommended.has(game.id))
}

// Small shape saved with the mood log
export const toSavedRecommendation = game => ({
  key: 'game',
  title: `${game.title} ${game.icon}`,
  icon: game.icon,
  desc: game.desc,
  subtype: game.launch.subtype || game.launch.key || game.launch.modal || game.id
})

const pick = arr => arr[Math.floor(Math.random() * arr.length)]

const QUOTES = [
  { text: 'Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.', author: 'Thich Nhat Hanh' },
  { text: 'You are allowed to be both a masterpiece and a work in progress.', author: 'Sophia Bush' },
  { text: 'Act as if what you do makes a difference. It does.', author: 'William James' },
  { text: 'Nothing can dim the light which shines from within.', author: 'Maya Angelou' }
]

const CALM_ACTIVITIES = [
  'Sip a warm cup of herbal tea 🍵',
  'Close your eyes and take 3 deep belly breaths 🧘',
  'Stretch your arms above your head for 10 seconds 🙆',
  'Sit completely still and focus on a distant sound 🕊️',
  'Write down one simple thing you appreciate about today ✍️'
]

export const buildGameData = subtype => {
  switch (subtype) {
    case 'positivequotes':
      return { ...pick(QUOTES) }
    case 'calmgenerator':
      return { activity: pick(CALM_ACTIVITIES) }
    default:
      return null
  }
}
