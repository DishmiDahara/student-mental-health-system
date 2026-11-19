// ---------------------------------------------------------------------------
// MindSpace - Mood-Based Relaxing Games Catalog
//
// Single source of truth for genuine relaxing and mindfulness games.
// Categorized for the 5 moods: Terrible, Bad, Okay, Good, and Great.
// Recommends exactly 5 suitable games per mood; all other games appear
// under "Explore More Games".
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
  // 25 Poki Brain & Relaxation Games (Self-Hosted, Legal & Zero External Block)
  // =========================================================================

  // ---- Group 1: Mood 1 - Terrible (Sensory Relief & Tactile Grounding) ----
  g('popitmaster', 'Pop It Master', '🫧', 'Pop realistic silicone bubbles with multi-tone ASMR acoustics to relieve acute tension and stress.', ['stress', 'anger'], { type: 'local', src: '/games/pop-it-master/index.html' }, {
    badge: 'Sensory ASMR',
    credit: 'Tactile Silicone Bubble Simulator'
  }),
  g('satisbox', 'SatisBox Mini Games', '📦', 'Oddly satisfying tidying tasks: defog steamy windows, align picture frames, and sort pencils.', ['stress', 'sadness', 'anxiety'], { type: 'local', src: '/games/satisbox/index.html' }, {
    badge: 'Oddly Satisfying',
    credit: 'SatisBox Tidying & Organization'
  }),
  g('shapefoldnature', 'Shape Fold Nature', '🌿', 'Gently fold interconnected botanical leaves and flower petals to form calming nature silhouettes.', ['anxiety', 'sadness'], { type: 'local', src: '/games/shape-fold-nature/index.html' }, {
    badge: 'Nature Tangram',
    credit: 'Botanical Polygon Folding Engine'
  }),
  g('watercolor', 'Water Color Sort', '🧪', 'Pour and sort soothing pastel liquids between glass test tubes at your own pace with zero timers.', ['anxiety', 'stress'], { type: 'local', src: '/games/water-color-sort/index.html' }, {
    badge: 'Liquid Sorting',
    credit: 'Fluid Color Tube Sorting Simulator'
  }),
  g('sugarsugar', 'Sugar, Sugar Physics', '☕', 'Draw smooth chalk paths to guide thousands of cascading granular sweet sugar grains into the mug.', ['stress', 'sadness'], { type: 'local', src: '/games/sugar-sugar/index.html' }, {
    badge: 'Granular Physics',
    credit: 'Sugar Particle Simulation'
  }),

  // ---- Group 2: Mood 2 - Bad (Gentle Comfort, Warm Reassurance & Untangling) ----
  g('catslovecake', 'Cats Love Cake', '🐱', 'Bounce a cheerful marshmallow cat across pastel platforms to reach sweet cake with cozy physics.', ['sadness', 'anxiety'], { type: 'local', src: '/games/cats-love-cake/index.html' }, {
    badge: 'Cozy Physics',
    credit: 'Squash & Stretch Cat Bouncing'
  }),
  g('infinityloop', 'Infinity Loop', '♾️', 'Rotate neon curved lines to connect ambient circuits into soothing, unbroken glowing loops.', ['sadness', 'anxiety', 'refresh'], { type: 'local', src: '/games/infinity-loop/index.html' }, {
    badge: 'Zen Circuit',
    credit: 'Ambient Harmonic Circuit Loop'
  }),
  g('colorgreen', 'Green Color Logic', '🟢', 'Bart Bonte style: solve creative, peaceful puzzles where the only soothing goal is turning the screen green.', ['sadness', 'refresh'], { type: 'local', src: '/games/color-green/index.html' }, {
    badge: 'Color Logic',
    credit: 'Bonte-Inspired Minimalist Green'
  }),
  g('unpuzzle', 'Unpuzzle Deconstruction', '🧩', 'A therapeutic reverse-jigsaw: disassemble interlocking puzzle pieces one by one into clear space.', ['sadness', 'anxiety', 'stress'], { type: 'local', src: '/games/unpuzzle/index.html' }, {
    badge: 'Reverse Puzzle',
    credit: 'Jigsaw Disassembly Engine'
  }),
  g('linestofill', 'Lines to Fill', '〰️', 'Draw continuous pastel ribbon lines across clean tiles to fill the board with pure satisfying flow.', ['sadness', 'anxiety'], { type: 'local', src: '/games/lines-to-fill/index.html' }, {
    badge: 'Grid Flow',
    credit: 'Continuous Path Tile Filler'
  }),

  // ---- Group 3: Mood 3 - Okay (Grounding Flow & Mental Refreshment) ----
  g('onetmaster', 'Onet Master Tile Connect', '🍓', 'Connect pairs of cute nature and fruit tiles with soothing audio chimes and gentle logic.', ['refresh', 'anxiety'], { type: 'local', src: '/games/onet-master/index.html' }, {
    badge: 'Tile Matching',
    credit: 'Onet Fruit Pair Link'
  }),
  g('shapefoldanimals', 'Shape Fold Animals', '🦊', 'Manipulate and fold hinged origami segments to complete charming animal silhouettes.', ['refresh', 'stress'], { type: 'local', src: '/games/shape-fold-animals/index.html' }, {
    badge: 'Origami Animals',
    credit: 'Origami Silhouette Kinematics'
  }),
  g('colorblue', 'Blue Color Harmony', '🔵', 'Bart Bonte style: interact with rain clouds and tranquil oceans to make the screen peaceful blue.', ['refresh', 'anxiety'], { type: 'local', src: '/games/color-blue/index.html' }, {
    badge: 'Color Logic',
    credit: 'Bonte-Inspired Tranquil Blue'
  }),
  g('blockyblast', 'Blocky Blast Puzzle', '🧱', 'Cozy 1010 block placement: clear full wooden rows and columns at your leisure without any timer.', ['refresh', 'stress'], { type: 'local', src: '/games/blocky-blast/index.html' }, {
    badge: 'Cozy Blocks',
    credit: 'Grid Line Clear Simulator'
  }),
  g('unpuzzler', 'UnpuzzleR Radial Rings', '🔐', 'Rotate concentric rings and align mechanical keyways to smoothly release the golden core.', ['refresh', 'anxiety'], { type: 'local', src: '/games/unpuzzle-r/index.html' }, {
    badge: 'Radial Untangling',
    credit: 'Concentric Ring Lock Engine'
  }),

  // ---- Group 4: Mood 4 - Good (Mindful Joy & Creative Craft) ----
  g('factoryballs', 'Factory Balls Forever', '🎨', 'Bart Bonte classic: dip balls in paint and apply masks in the right sequence to craft designer spheres.', ['refresh', 'anxiety'], { type: 'local', src: '/games/factory-balls/index.html' }, {
    badge: 'Creative Craft',
    credit: 'Layered Sequence Logic'
  }),
  g('game2048', '2048 Zen Edition', '🔢', 'Hypnotic sliding numbers: merge matching pastel tiles in rhythmic, satisfying flow with undo.', ['refresh', 'stress'], { type: 'local', src: '/games/game-2048/index.html' }, {
    badge: 'Flow Sliding',
    credit: '2048 Engine (MIT License)'
  }),
  g('colorpink', 'Pink Color Spark', '🌸', 'Bart Bonte style: inflate bubble gum, arrange flamingo feathers, and turn the canvas cheerful pink.', ['refresh', 'sadness'], { type: 'local', src: '/games/color-pink/index.html' }, {
    badge: 'Color Logic',
    credit: 'Bonte-Inspired Playful Pink'
  }),
  g('minitrain', 'Mini Train Builder', '🚂', 'Lay wooden bridge blocks across mountain canyons so the cheerful locomotive safely crosses.', ['refresh', 'stress'], { type: 'local', src: '/games/mini-train/index.html' }, {
    badge: 'Toy Railway',
    credit: 'Physics Bridge Builder'
  }),
  g('nonogram', 'Nonogram Pixel Art', '🔲', 'Picture cross deduction: fill cells according to numeric clues to reveal heartwarming pixel art.', ['refresh', 'anxiety'], { type: 'local', src: '/games/nonogram/index.html' }, {
    badge: 'Pixel Picross',
    credit: 'Nonogram Picture Cross Engine'
  }),

  // ---- Group 5: Mood 5 - Great (Vibrant Play & Whimsical Celebration) ----
  g('braintest', 'Brain Test Tricky Puzzles', '💡', 'Whimsical, humorous cartoon riddles and out-of-the-box puzzles that spark laughter and playful joy.', ['refresh', 'stress'], { type: 'local', src: '/games/brain-test/index.html' }, {
    badge: 'Whimsical Riddles',
    credit: 'Interactive Cartoon Lateral Thinking'
  }),
  g('dualcat', 'Dual Cat Adventure', '🐾', 'Guide two adorable synchronized cats working together to press buttons, pass gates, and get tuna.', ['refresh', 'sadness'], { type: 'local', src: '/games/dual-cat/index.html' }, {
    badge: 'Co-op Kittens',
    credit: 'Dual Character Platform Puzzle'
  }),
  g('freethekey', 'Free The Key / Klotski', '🔑', 'Classic wooden sliding blocks: clear a path and slide the golden brass key out through the vault exit.', ['refresh', 'stress'], { type: 'local', src: '/games/free-the-key/index.html' }, {
    badge: 'Wooden Klotski',
    credit: 'Sliding Wooden Block Engine'
  }),
  g('shenzhenmahjong', 'Shenzhen Mahjong', '🀄', 'Traditional relaxing Mahjong solitaire: match ivory bamboo and flower tiles amidst calm garden breezes.', ['refresh', 'anxiety'], { type: 'local', src: '/games/shenzhen-mahjong/index.html' }, {
    badge: 'Zen Mahjong',
    credit: 'Oriental Tile Solitaire'
  }),
  g('colororange', 'Orange Color Burst', '🍊', 'Bart Bonte style: slice juicy oranges, set the sunset horizon, and turn the world warm sunny orange.', ['refresh', 'sadness'], { type: 'local', src: '/games/color-orange/index.html' }, {
    badge: 'Color Logic',
    credit: 'Bonte-Inspired Sunny Orange'
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
  g('merge', 'DesignVille Merge', '🏡', 'Merge cozy items to decorate a peaceful dream room.', ['refresh', 'sadness'], { type: 'modal', modal: 'merge' }),
  g('diff', 'Spot the Differences', '🔍', 'Spot subtle details between two peaceful, serene illustrations.', ['refresh'], { type: 'modal', modal: 'diff' }),
  g('catch', 'Catch the Stars', '🌠', 'Slide the basket to catch gentle falling stars.', ['sadness', 'refresh'], { type: 'game', subtype: 'catch' }),
  g('calmgenerator', 'Calm Activity Generator', '🧘', 'Get a simple, gentle mindfulness exercise to try right now.', ['anxiety', 'stress'], { type: 'game', subtype: 'calmgenerator', needsData: true }),
  g('positivequotes', 'Positive Quotes', '💬', 'Savour an uplifting quote to ground your mindset.', ['sadness'], { type: 'game', subtype: 'positivequotes', needsData: true })
]

const byId = Object.fromEntries(GAME_CATALOG.map(game => [game.id, game]))

// Mood value (1 Terrible ... 5 Great) -> EXACTLY 5 recommended game ids.
// Matches the 25 researched Poki relaxation & brain titles.
export const MOOD_GAME_MAP = {
  1: ['popitmaster', 'satisbox', 'shapefoldnature', 'watercolor', 'sugarsugar'],
  2: ['catslovecake', 'infinityloop', 'colorgreen', 'unpuzzle', 'linestofill'],
  3: ['onetmaster', 'shapefoldanimals', 'colorblue', 'blockyblast', 'unpuzzler'],
  4: ['factoryballs', 'game2048', 'colorpink', 'minitrain', 'nonogram'],
  5: ['braintest', 'dualcat', 'freethekey', 'shenzhenmahjong', 'colororange']
}

export const MOOD_GAME_THEMES = {
  1: { headline: 'Deep Sensory Relief & Tension Release', blurb: 'Tactile bubble popping, satisfying tidying, and gentle water sorting to ease high stress and heavy feelings.' },
  2: { headline: 'Comfort, Cozy Joy & Untangling', blurb: 'Cute bouncing cats, glowing infinity loops, and gentle reverse puzzles to softly lift a low mood.' },
  3: { headline: 'Grounding Flow & Mental Refreshment', blurb: 'Refreshing fruit tile connections, origami animal folding, and cozy block placement to clear brain fog.' },
  4: { headline: 'Mindful Joy & Creative Craft', blurb: 'Designer factory balls, hypnotic 2048 number merges, and toy train construction for positive momentum.' },
  5: { headline: 'Vibrant Play & Whimsical Celebration', blurb: 'Whimsical cartoon brain riddles, co-op kitten adventures, and zen mahjong to celebrate great energy!' }
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
