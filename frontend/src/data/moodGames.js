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
  // 25 Commercial High-Quality Relaxing Games (Authorized Webmaster Syndication)
  // Featured on CrazyGames / Poki, officially distributed via GameDistribution & Famobi
  // =========================================================================

  // ---- Group 1: Mood 1 - Terrible (Sensory Grounding, Tactile ASMR & Tension Relief) ----
  g('popitmaster', 'Pop It Master', '🧸', 'Interactive 3D sensory fidget popping with 140+ relaxing toys and crisp ASMR pop sounds.', ['stress', 'anger'], { type: 'embed', src: 'https://html5.gamedistribution.com/9214ef9669ee4a3486d6fd6d6dc104bd/' }, {
    badge: 'Pop ASMR',
    credit: 'Rad Brothers · Official Syndication'
  }),
  g('perfectcleaning', 'Perfect ASMR Cleaning', '🧽', 'Deep tactile cleaning, carpet power-washing, and surface restoration with soothing acoustic feedback.', ['stress', 'anger'], { type: 'embed', src: 'https://html5.gamedistribution.com/69d597a6c1b74260972d943f2908c2f2/' }, {
    badge: 'ASMR Cleaning',
    credit: 'GameDistribution Studios'
  }),
  g('smartybubbles', 'Smarty Bubbles', '🫧', 'World-renowned pastel bubble shooter with crisp acoustic snaps in a relaxing, untimed flow.', ['stress', 'anxiety'], { type: 'embed', src: 'https://play.famobi.com/smarty-bubbles' }, {
    badge: 'Bubble Pops',
    credit: 'Famobi Official'
  }),
  g('tidymaster', 'Tidy Master: Satisfeel ASMR', '📦', 'Mindful room sorting and peaceful object decluttering with calming tactile audio.', ['stress', 'anxiety'], { type: 'embed', src: 'https://html5.gamedistribution.com/6b3a8b1a95db42cdb8c166093d0c78a5/' }, {
    badge: 'Declutter ASMR',
    credit: 'GameDistribution Studios'
  }),
  g('popitbubble', 'Pop It Bubble Game', '✨', 'Endless sensory neon bubble wrap popping for immediate tension and stress relief.', ['stress', 'anger', 'refresh'], { type: 'embed', src: 'https://html5.gamedistribution.com/b71b2e86f6fa4739b8e2b57e10f61935/' }, {
    badge: 'Sensory Wrap',
    credit: 'GameDistribution Studios'
  }),

  // ---- Group 2: Mood 2 - Bad (Emotional Comfort, Cozy Botanical & Marine Sanctuary) ----
  g('gardentales', 'Garden Tales', '🌸', 'Beautiful fairy garden puzzle amidst blooming flowers, fruit orchards, and soothing birdsong.', ['sadness', 'refresh'], { type: 'embed', src: 'https://html5.gamedistribution.com/fa29efc197d04cb1bb3074b8255f817f/' }, {
    badge: 'Flower Garden',
    credit: 'Softgames · Official Syndication'
  }),
  g('digitalaqua', 'Digital Aqua', '🐠', 'Serene virtual aquarium with vibrant tropical clownfish, sea turtles, and relaxing ocean currents.', ['sadness', 'anxiety'], { type: 'embed', src: 'https://html5.gamedistribution.com/266e4f5a831543b2b630e4cc63789083/' }, {
    badge: 'Marine Sanctuary',
    credit: 'BUSIDOL · Official Syndication'
  }),
  g('fishstory', 'Fish Story', '🐬', 'Cozy underwater coral reef puzzle with playful sea creatures and tranquil ambient marine music.', ['sadness', 'anxiety'], { type: 'embed', src: 'https://html5.gamedistribution.com/dd353acd7a964c8baf13841666192f95/' }, {
    badge: 'Coral Reef',
    credit: 'Azerion · Official Syndication'
  }),
  g('forestmatch', 'Forest Match', '🌲', 'Enchanted green woodland match puzzle with pinecones, forest berries, and peaceful forest breeze.', ['sadness', 'refresh'], { type: 'embed', src: 'https://html5.gamedistribution.com/4d7af1d66ccd41fdacd3ba87933ced4b/' }, {
    badge: 'Woodland Zen',
    credit: 'Softgames · Official Syndication'
  }),
  g('tinyfishing', 'Tiny Fishing', '🎣', 'The acclaimed ultra-chill lake fishing game; cast your line into serene waters and collect rare fish.', ['sadness', 'refresh', 'anxiety'], { type: 'embed', src: 'https://html5.gamedistribution.com/5ee4b0222a474e44880b6c6d9f96754d/' }, {
    badge: 'Calm Waters',
    credit: 'Mad Buffer · Official Syndication'
  }),

  // ---- Group 3: Mood 3 - Okay (Structured Tidying, Mindful Flow & Brain Fog Reset) ----
  g('goodsortmaster', 'Good Sort Master 3D', '🥫', 'Sort and organize supermarket snacks, drinks, and perfumes neatly onto clean 3D shelves.', ['refresh', 'anxiety'], { type: 'embed', src: 'https://html5.gamedistribution.com/a49d905e3ec9474eb45936d7b70eb246/' }, {
    badge: '3D Shelf Sort',
    credit: 'GameDistribution Studios'
  }),
  g('potterymaster', 'Pottery Master 3D', '🏺', 'Shape wet clay on the spinning wheel with smooth gestures, fire in the kiln, and glaze ceramics.', ['refresh', 'stress'], { type: 'embed', src: 'https://html5.gamedistribution.com/aef52b1f2b9542e18556b6bfa58e0220/' }, {
    badge: 'Ceramic Lathe',
    credit: 'GameDistribution Studios'
  }),
  g('mahjong3d', 'Mahjong 3D', '🀄', 'Rotate geometric 3D cubes in 360 degrees to find soothing symbol matches with zero time stress.', ['refresh', 'anxiety'], { type: 'embed', src: 'https://play.famobi.com/mahjong-3d' }, {
    badge: '3D Zen Solitaire',
    credit: 'Famobi Official'
  }),
  g('colorpixelart', 'Color Pixel Art Classic', '🎨', 'Meditative paint-by-number digital canvas with 800+ intricate illustrations and soft color fills.', ['refresh', 'sadness'], { type: 'embed', src: 'https://play.famobi.com/color-pixel-art-classic' }, {
    badge: 'Color by Number',
    credit: 'Famobi Official'
  }),
  g('woodblockpuzzle', 'Wood Block Puzzle', '🪵', 'Tactile wooden jigsaw puzzle; place natural oak blocks into a 10x10 zen grid with timber acoustics.', ['refresh', 'anxiety'], { type: 'embed', src: 'https://html5.gamedistribution.com/d1e6bc98deee4873a6c2b1e2778ec543/' }, {
    badge: 'Timber Zen',
    credit: 'Softgames · Official Syndication'
  }),

  // ---- Group 4: Mood 4 - Good (Creative Interior Design, Cozy Craft & Floral Gardens) ----
  g('homedesigndreams', 'My Home Design Dreams', '🏡', 'Full-scale interior decoration simulator; renovate luxury living rooms and scenic coastal villas.', ['refresh', 'anxiety'], { type: 'embed', src: 'https://html5.gamedistribution.com/967344d969c5468e930090065701dc97/' }, {
    badge: 'Interior Design',
    credit: 'GameDistribution Studios'
  }),
  g('dreamroommakeover', 'Dream Room Makeover', '🛋️', 'Design cozy pastel bedrooms, choose lighting, wall treatments, furniture, and indoor flora.', ['refresh', 'sadness'], { type: 'embed', src: 'https://html5.gamedistribution.com/759641c55702426ba9fdb73fd9af6fa0/' }, {
    badge: 'Pastel Staging',
    credit: 'tinyDream · Official Syndication'
  }),
  g('homemakeover', 'Home Makeover', '🧹', 'Clear clutter, restore vintage furniture, and transform unkempt rooms into aesthetic sanctuaries.', ['refresh', 'stress'], { type: 'embed', src: 'https://html5.gamedistribution.com/fddd9e1858554fb7b46d22e899679089/' }, {
    badge: 'Restoration',
    credit: 'tinyDream · Official Syndication'
  }),
  g('mergecakes', 'Merge Cakes', '🧁', 'Delightful casual bakery merger; combine croissants and macarons to build a charming Parisian cafe.', ['refresh', 'stress'], { type: 'embed', src: 'https://play.famobi.com/merge-cakes' }, {
    badge: 'Bakery Merge',
    credit: 'Famobi Official'
  }),
  g('onetconnect', 'Onet Connect Classic', '🧩', 'Mindful tile connection puzzle featuring sweet treats, forest animals, and botanical symbols.', ['refresh', 'sadness'], { type: 'embed', src: 'https://play.famobi.com/onet-connect-classic' }, {
    badge: 'Pair Connect',
    credit: 'Famobi Official'
  }),

  // ---- Group 5: Mood 5 - Great (Grand Estate Renovation, Expansive Exploration & Joy) ----
  g('tropicalmerge', 'Tropical Merge', '🏝️', 'Grand coastal island farming and architectural restoration; build villas and lush tropical groves.', ['refresh', 'stress'], { type: 'embed', src: 'https://html5.gamedistribution.com/4eafc18cbceb45ed884f6c5d70df3963/' }, {
    badge: 'Island Renovation',
    credit: 'Clever Apps · Official Syndication'
  }),
  g('bubbleshooterhd', 'Bubble Shooter HD', '🔮', 'Pristine high-definition bubble popping with vibrant cascades and sparkling harmonic celebrations.', ['refresh', 'anxiety'], { type: 'embed', src: 'https://html5.gamedistribution.com/79a7db22af5f420eb9d56e28fffca87b/' }, {
    badge: 'HD Bubble Pop',
    credit: 'Softgames · Official Syndication'
  }),
  g('jigsawclassic', 'Jigsaw Puzzle Classic', '🖼️', 'High-resolution scenic landscape photography jigsaws with custom piece counts and zen framing.', ['refresh', 'sadness'], { type: 'embed', src: 'https://play.famobi.com/jigsaw-puzzle-classic' }, {
    badge: 'Scenic Jigsaw',
    credit: 'Famobi Official'
  }),
  g('zooboom', 'Zoo Boom', '🐾', 'Cheerful animal cube puzzle with delightful animations, rewarding combos, and positive energy.', ['refresh', 'stress'], { type: 'embed', src: 'https://play.famobi.com/zoo-boom' }, {
    badge: 'Animal Cubes',
    credit: 'Famobi Official'
  }),
  g('solitairezen', 'Solitaire Classic Zen', '🃏', 'Timeless Klondike card solitaire in a clean, distraction-free green felt aesthetic.', ['refresh', 'anxiety'], { type: 'embed', src: 'https://play.famobi.com/solitaire-classic' }, {
    badge: 'Classic Cards',
    credit: 'Famobi Official'
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
// 25 genuine commercial titles distributed via authorized webmaster syndication.
export const MOOD_GAME_MAP = {
  1: ['popitmaster', 'perfectcleaning', 'smartybubbles', 'tidymaster', 'popitbubble'],
  2: ['gardentales', 'digitalaqua', 'fishstory', 'forestmatch', 'tinyfishing'],
  3: ['goodsortmaster', 'potterymaster', 'mahjong3d', 'colorpixelart', 'woodblockpuzzle'],
  4: ['homedesigndreams', 'dreamroommakeover', 'homemakeover', 'mergecakes', 'onetconnect'],
  5: ['tropicalmerge', 'bubbleshooterhd', 'jigsawclassic', 'zooboom', 'solitairezen']
}

export const MOOD_GAME_THEMES = {
  1: { headline: 'Sensory Grounding, Tactile ASMR & Tension Release', blurb: 'Interactive 3D sensory fidget popping, deep tactile cleaning, and classic pastel bubble wrap acoustics to melt away acute distress.' },
  2: { headline: 'Emotional Comfort, Cozy Botanical & Marine Sanctuary', blurb: 'Lush botanical garden puzzles, tranquil coral reef aquariums, woodland forest matching, and peaceful lake fishing to soothe the spirit.' },
  3: { headline: 'Structured Tidying, Mindful Flow & Brain Fog Reset', blurb: 'Satisfying 3D pantry shelf organization, ceramic pottery lathe sculpting, rotational 3D zen solitaire, and paint-by-number digital art.' },
  4: { headline: 'Creative Interior Design, Floral Gardens & Craft', blurb: 'Full-scale luxury room decorating, cozy pastel bedroom styling, Parisian bakery cake merging, and mindful animal tile pairing.' },
  5: { headline: 'Grand Estate Renovation, Expansive Exploration & Joy', blurb: 'Lush tropical island renovation, high-definition celestial bubble cascades, scenic photography jigsaws, and uplifting animal matches!' }
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
