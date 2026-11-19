// ---------------------------------------------------------------------------
// MindSpace - Mood-Based Relaxing Games Catalog
//
// Single source of truth for genuine relaxing and mindfulness games.
// Upgraded with 25 advanced titles inspired by the CrazyGames Relaxing collection:
// home decoration, interior design, garden & nature, ASMR cleaning, 3D pottery,
// aquarium simulation, cozy farming, and satisfying sensory physics.
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
  // =========================================================================
  // 25 CrazyGames Advanced Relaxing Titles (High Production Quality)
  // =========================================================================

  // ---- Group 1: Mood 1 - Terrible (Sensory Grounding, Tactile ASMR & Tension Relief) ----
  g('makeoverasmr', 'Makeover Cleaning ASMR', '🧽', 'Power-wash grimy vintage items, scrape mud, and buff metals with soothing ASMR audio.', ['stress', 'anger'], { type: 'local', src: '/games/makeover-asmr/index.html' }, {
    badge: 'ASMR Cleaning',
    credit: 'Tactile Deep Cleaning Simulator'
  }),
  g('smartybubbles', 'Smarty Bubbles Casual', '🫧', 'Pop vibrant glossy bubbles with crisp acoustic snaps in a relaxing, untimed flow.', ['stress', 'anxiety'], { type: 'local', src: '/games/smarty-bubbles/index.html' }, {
    badge: 'Bubble Pops',
    credit: 'Smarty Bubbles Casual'
  }),
  g('growyourhome', 'Grow Your Home', '🌱', 'Nurture cozy indoor windowsill plants from seed to bloom with water and gentle sunlight.', ['anxiety', 'sadness'], { type: 'local', src: '/games/grow-your-home/index.html' }, {
    badge: 'Plant Care',
    credit: 'Indoor Botanical Simulator'
  }),
  g('stickerart', 'Sticker Art Studio', '✨', 'Peel glossy, textured stickers with satisfying crinkles to decorate wholesome dream scrapbook pages.', ['stress', 'sadness'], { type: 'local', src: '/games/sticker-art/index.html' }, {
    badge: 'Scrapbook',
    credit: 'Tactile Sticker Art Engine'
  }),
  g('fluidsimulation', 'Fluid Simulation 3D', '🌈', 'Swirl glowing bioluminescent smoke and luminous liquid dynamics on dark velvet.', ['stress', 'anxiety', 'refresh'], { type: 'local', src: '/games/fluid-simulation/index.html' }, {
    badge: '3D Fluid',
    credit: 'WebGL Fluid Dynamics'
  }),

  // ---- Group 2: Mood 2 - Bad (Emotional Comfort, Cozy Nurturing & Gentle Solace) ----
  g('roombox', 'Roombox Design Studio', '🛋️', 'Stage and arrange miniature pastel bedroom dioramas with cozy ambient lamps, plants, and books.', ['sadness', 'anxiety'], { type: 'local', src: '/games/roombox/index.html' }, {
    badge: 'Room Staging',
    credit: 'Miniature Roombox Staging'
  }),
  g('botanica', 'Botanica: Greenhouse of Wishes', '🌺', 'Mist tropical foliage in a sunlit conservatory and watch exotic orchids bloom with glowing pollen.', ['sadness', 'refresh'], { type: 'local', src: '/games/botanica/index.html' }, {
    badge: 'Greenhouse',
    credit: 'Conservatory Botanical Engine'
  }),
  g('aquariumtycoon', 'Pixel Aquarium Tycoon', '🐠', 'Drop flakes for swimming clownfish and seahorses in a serene, deep-blue coral reef sanctuary.', ['sadness', 'anxiety'], { type: 'local', src: '/games/aquarium-tycoon/index.html' }, {
    badge: 'Marine Habitat',
    credit: 'Pixel Aquarium Simulator'
  }),
  g('yarnfever', 'Yarn Fever! Unravel Puzzle', '🧶', 'Untangle soft pastel woolen yarn skeins and knit them into warm, cozy winter sweaters.', ['sadness', 'anxiety', 'stress'], { type: 'local', src: '/games/yarn-fever/index.html' }, {
    badge: 'Wool Knitting',
    credit: 'Tactile Thread Untangling Engine'
  }),
  g('sproutvalley', 'Sprout Valley: Cozy Farm', '🌾', 'Help Nico the cat till soil, plant sweet strawberries, and harvest crops by the calm sea.', ['sadness', 'refresh'], { type: 'local', src: '/games/sprout-valley/index.html' }, {
    badge: 'Cozy Farming',
    credit: 'Sprout Valley Storybook Farm'
  }),

  // ---- Group 3: Mood 3 - Okay (Structured Tidying, Mindful Flow & Brain Fog Reset) ----
  g('goodsmatch3d', 'Goods Triple Match 3D', '🥫', 'Sort and organize snacks, drinks, and perfumes neatly onto clean wooden pantry shelves in 3D.', ['refresh', 'anxiety'], { type: 'local', src: '/games/goods-match-3d/index.html' }, {
    badge: '3D Shelf Sort',
    credit: 'Supermarket Organization 3D'
  }),
  g('potterymaster', 'Pottery Master 3D', '🏺', 'Spin the pottery wheel, sculpt ceramic clay with smooth gestures, fire in the kiln, and glaze in cobalt blue.', ['refresh', 'stress'], { type: 'local', src: '/games/pottery-master/index.html' }, {
    badge: 'Ceramic Lathe',
    credit: '3D Pottery Wheel Sculptor'
  }),
  g('homemakeover', 'Home Makeover Cleaning', '🧹', 'Vacuum carpets, wipe panoramic glass windows, and tidy messy bedrooms to clear mental clutter.', ['refresh', 'stress'], { type: 'local', src: '/games/home-makeover/index.html' }, {
    badge: 'Declutter',
    credit: 'Room Restoration Simulator'
  }),
  g('numicolor', 'Numicolor Scenic Art', '🎨', 'Meditative paint-by-number digital canvas: bring scenic mountain sunsets and wildlife to life with watercolor.', ['refresh', 'sadness'], { type: 'local', src: '/games/numicolor/index.html' }, {
    badge: 'Color by Number',
    credit: 'Numicolor Digital Canvas'
  }),
  g('scandinavianmahjong', 'Scandinavian Mahjong', '❄️', 'Hygge Nordic minimalist stone and wood tiles: clear matching pinecones, coffee mugs, and mittens.', ['refresh', 'anxiety'], { type: 'local', src: '/games/scandinavian-mahjong/index.html' }, {
    badge: 'Hygge Zen',
    credit: 'Nordic Tile Solitaire'
  }),

  // ---- Group 4: Mood 4 - Good (Creative Interior Design, Floral Gardens & Craft) ----
  g('homedesign', 'Home Design: Decorate House', '🏡', 'Customize luxury 3D penthouses with velvet sofas, marble tables, and atmospheric cove lighting.', ['refresh', 'anxiety'], { type: 'local', src: '/games/home-design/index.html' }, {
    badge: 'Interior Design',
    credit: 'Luxury Room Decorator'
  }),
  g('bloominggardens', 'Blooming Gardens', '🌸', 'Align matching flowerbeds in lines to trigger magnificent floral blossom explosions and butterfly swarms.', ['refresh', 'sadness'], { type: 'local', src: '/games/blooming-gardens/index.html' }, {
    badge: 'Flower Garden',
    credit: 'Floral Bloom Alignment'
  }),
  g('pieceofcake', 'Piece of Cake: Merge & Bake', '🧁', 'Merge French croissants and tarts to create master wedding cakes and decorate a sunny cafe terrace.', ['refresh', 'stress'], { type: 'local', src: '/games/piece-of-cake/index.html' }, {
    badge: 'Bakery Merge',
    credit: 'Pastry Merge & Terrace Decor'
  }),
  g('colormatch', 'Color Match 3D Studio', '🎨', 'Squeeze primary oil paint tubes, blend palette with spatula to match colors, and spray-paint 3D fruits.', ['refresh', 'anxiety'], { type: 'local', src: '/games/color-match/index.html' }, {
    badge: 'Pigment Studio',
    credit: '3D Color Blending Lab'
  }),
  g('idleseapark', 'Idle Sea Park 3D', '🐬', 'Build a 3D ocean rescue sanctuary with leaping dolphins, gentle sea turtles, and turquoise lagoons.', ['refresh', 'stress'], { type: 'local', src: '/games/idle-sea-park/index.html' }, {
    badge: 'Marine Park',
    credit: '3D Marine Sanctuary Simulator'
  }),

  // ---- Group 5: Mood 5 - Great (Grand Estate Renovation, Architectural Freedom & Joy) ----
  g('designville', 'Designville: Merge & Design', '🏰', 'Merge workshop tools to earn design stars, then restore and decorate a coastal mansion estate.', ['refresh', 'stress'], { type: 'local', src: '/games/designville/index.html' }, {
    badge: 'Mansion Renovation',
    credit: 'Designville Estate Decorator'
  }),
  g('castawayisland', 'Castaway Island / Tiny Town', '🏝️', 'Click on turquoise water to procedural construct colorful Mediterranean cottages, archways, and piers.', ['refresh', 'sadness'], { type: 'local', src: '/games/castaway-island/index.html' }, {
    badge: 'Island Builder',
    credit: 'Procedural Island Town Engine'
  }),
  g('soomatch', 'Soo Match: Room Design', '✨', 'Renovate modern skyline penthouses with floor-to-ceiling glass, floating fireplaces, and designer lounges.', ['refresh', 'stress'], { type: 'local', src: '/games/soo-match/index.html' }, {
    badge: 'Skyline Loft',
    credit: 'Modern Penthouse Designer'
  }),
  g('burgercafestory', 'Burger Cafe Story ASMR', '🍔', 'Slice crisp vegetables, hear patties gently sizzle, and stack gourmet burgers in a cozy cafe.', ['refresh', 'stress'], { type: 'local', src: '/games/burger-cafe-story/index.html' }, {
    badge: 'ASMR Kitchen',
    credit: 'Culinary Cooking Simulation'
  }),
  g('bubbleshooterhd', 'Bubble Shooter HD', '🔮', 'High-definition glass spheres popping in cascading chain reactions with sparkling celestial feedback.', ['refresh', 'anxiety'], { type: 'local', src: '/games/bubble-shooter-hd/index.html' }, {
    badge: 'HD Bubble Pop',
    credit: 'Prismatic Bubble Shooter'
  }),

  // =========================================================================
  // Additional MindSpace Native Relaxation Games (Available in Explore More)
  // =========================================================================
  g('zengarden', 'Zen Sand Garden', '🪨', 'Rake dry sand into ripples around meditation stones with soothing raking acoustics.', ['refresh', 'sadness', 'stress'], { type: 'local', src: '/games/zen-garden/index.html' }, {
    badge: 'Zen Garden',
    credit: 'Karesansui Sand Raking Simulator'
  }),
  g('koipond', 'Interactive Koi Pond', '🐟', 'Gentle Japanese Nishikigoi swimming with natural water ripples; tap to drop food.', ['sadness', 'refresh', 'anxiety'], { type: 'local', src: '/games/koi-pond/index.html' }, {
    badge: 'Aquatic',
    credit: 'Procedural Koi Flocking'
  }),
  g('bubblewrap', 'Tactile Bubble Wrap', '🫧', 'Pop realistic plastic bubbles with authentic crisp acoustic snaps to relieve tension.', ['stress', 'anxiety', 'anger'], { type: 'local', src: '/games/bubble-wrap/index.html' }, {
    badge: 'Tactile',
    credit: 'Tactile Bubble Wrap Simulator'
  }),
  g('waterripples', 'Interactive Water Ripples', '💧', 'A responsive liquid pool surface that casts concentric refractive waves and raindrops.', ['anxiety', 'stress', 'refresh'], { type: 'local', src: '/games/water-ripples/index.html' }, {
    badge: 'Hydrodynamics',
    credit: 'Interactive Wave Propagation'
  }),
  g('fallingsand', 'Falling Sand Physics', '⏳', 'Creative elemental particle sandbox: pour sand, stream water, sprout plants, and watch soothing physics.', ['anxiety', 'refresh', 'stress'], { type: 'local', src: '/games/falling-sand/index.html' }, {
    badge: 'Physics',
    credit: 'Falling Sand Cellular Automata'
  }),
  g('harmony', 'Procedural Harmony Sketch', '🎨', 'Mr.doob procedural sketching with fluid ribbons, sketchy pencils, and web filaments.', ['refresh', 'sadness', 'anxiety'], { type: 'local', src: '/games/harmony/index.html' }, {
    badge: 'Generative Art',
    credit: 'Harmony Procedural Sketcher'
  }),
  g('garten', 'Botanical Garden Bloom', '🌸', 'Plant seeds in fertile earth that organically sprout branching stems and blooming wildflowers.', ['sadness', 'refresh', 'anxiety'], { type: 'local', src: '/games/garten/index.html' }, {
    badge: 'Nature',
    credit: 'Procedural Botanical Growth Engine'
  }),
  g('cloth', 'Tearable Silk Cloth', '🧵', 'Interactive soft-body fabric floating in a breeze; stretch, ripple, and slice threads.', ['anger', 'stress', 'anxiety'], { type: 'local', src: '/games/cloth/index.html' }, {
    badge: 'Soft-Body',
    credit: 'Verlet Cloth Simulation'
  }),
  g('pottery', 'Virtual Pottery Wheel', '🏺', 'Spin the turntable and gently press into soft wet clay to shape vases and ceramic bowls.', ['refresh', 'anxiety', 'stress'], { type: 'local', src: '/games/pottery/index.html' }, {
    badge: 'Ceramics',
    credit: 'Lathe Geometry Mesh Deformation'
  }),
  g('aquarium', 'Virtual Coral Aquarium', '🐠', 'Underwater tropical coral sanctuary with swimming clownfish, god rays, and floating bubbles.', ['sadness', 'refresh', 'anxiety'], { type: 'local', src: '/games/aquarium/index.html' }, {
    badge: 'Marine',
    credit: 'Coral Reef Sanctuary Simulation'
  }),
  g('fluid', 'Calm Fluid Canvas', '🌈', 'Swirl glowing fluid dynamics across dark velvet with your finger or mouse.', ['stress', 'anxiety', 'refresh'], { type: 'local', src: '/games/fluid/index.html' }, {
    badge: 'Fluid Dynamics',
    credit: 'WebGL Fluid Simulation'
  }),
  g('floodit', 'Colour Flood', '🔵', 'Fill the board with a single calming colour in as few gentle moves as you like.', ['anxiety', 'refresh'], { type: 'local', src: '/games/floodit/index.html' }, {
    badge: 'Color Flow',
    credit: 'FloodIt Color Algorithm'
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
  g('watersortmodal', 'Water Sort Puzzle Modal', '🧪', 'Gently sort soft pastel liquids between glass tubes at your own pace.', ['anxiety', 'refresh'], { type: 'modal', modal: 'watersort' }),
  g('merge', 'DesignVille Merge Modal', '🏡', 'Merge cozy items to decorate a peaceful dream room.', ['refresh', 'sadness'], { type: 'modal', modal: 'merge' }),
  g('diff', 'Spot the Differences', '🔍', 'Spot subtle details between two peaceful, serene illustrations.', ['refresh'], { type: 'modal', modal: 'diff' }),
  g('catch', 'Catch the Stars', '🌠', 'Slide the basket to catch gentle falling stars.', ['sadness', 'refresh'], { type: 'game', subtype: 'catch' }),
  g('calmgenerator', 'Calm Activity Generator', '🧘', 'Get a simple, gentle mindfulness exercise to try right now.', ['anxiety', 'stress'], { type: 'game', subtype: 'calmgenerator', needsData: true }),
  g('positivequotes', 'Positive Quotes', '💬', 'Savour an uplifting quote to ground your mindset.', ['sadness'], { type: 'game', subtype: 'positivequotes', needsData: true })
]

const byId = Object.fromEntries(GAME_CATALOG.map(game => [game.id, game]))

// Mood value (1 Terrible ... 5 Great) -> EXACTLY 5 recommended game ids.
// Matches the 25 CrazyGames relaxing titles.
export const MOOD_GAME_MAP = {
  1: ['makeoverasmr', 'smartybubbles', 'growyourhome', 'stickerart', 'fluidsimulation'],
  2: ['roombox', 'botanica', 'aquariumtycoon', 'yarnfever', 'sproutvalley'],
  3: ['goodsmatch3d', 'potterymaster', 'homemakeover', 'numicolor', 'scandinavianmahjong'],
  4: ['homedesign', 'bloominggardens', 'pieceofcake', 'colormatch', 'idleseapark'],
  5: ['designville', 'castawayisland', 'soomatch', 'burgercafestory', 'bubbleshooterhd']
}

export const MOOD_GAME_THEMES = {
  1: { headline: 'Sensory Grounding, Tactile ASMR & Tension Release', blurb: 'Deep cleaning restoration, crisp bubble wrap acoustics, windowsill plant misting, and luminous fluid dynamics to melt away acute distress.' },
  2: { headline: 'Emotional Comfort, Cozy Nurturing & Gentle Solace', blurb: 'Miniature pastel room arranging, exotic greenhouse plant care, peaceful aquarium fish, and warm cat island farming to lift heavy spirits.' },
  3: { headline: 'Structured Tidying, Mindful Flow & Brain Fog Reset', blurb: 'Satisfying 3D shelf organization, ceramic pottery wheel sculpting, digital canvas coloring, and Nordic hygge tile matching to regain focus.' },
  4: { headline: 'Creative Interior Design, Floral Gardens & Craft', blurb: 'Luxury room styling, vibrant flowerbed matching, Parisian bakery decoration, and 3D oil paint blending for uplifting momentum.' },
  5: { headline: 'Grand Estate Renovation, Architectural Freedom & Joy', blurb: 'High-fidelity mansion makeover, procedural 3D island village building, modern penthouse design, and sensory cafe cooking to celebrate great energy!' }
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
