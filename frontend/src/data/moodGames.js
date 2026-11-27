// ---------------------------------------------------------------------------
// MindSpace - Mood-Based Relaxing Games Catalog
//
// 100% In-App Self-Hosted Relaxing Games Catalog.
// Zero external redirects, zero external syndication iframes, zero ads.
// Every single title runs natively within the MindSpace application player.
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
  // Curated Mood Recommendations (5 Tailored In-App Games Per Mood Rating)
  // All run 100% locally via MindSpace's integrated game player modal.
  // =========================================================================

  // ---- Group 1: Mood 1 - Terrible (Sensory Grounding, Tactile ASMR & Tension Relief) ----
  g('popitmaster', 'Pop It Master', '🧸', 'Interactive 3D sensory fidget popping with 36 tactile silicone bubbles, flip board, and crisp ASMR pop sounds.', ['stress', 'anger'], { type: 'local', src: '/games/pop-it-master/index.html' }, {
    badge: 'Pop ASMR',
    credit: 'MindSpace Tactile Engine · In-App Game'
  }),
  g('bubblewrap', 'Tactile Bubble Wrap', '🫧', 'Endless tactile plastic bubble wrap popping with realistic acoustic snaps for immediate tension relief.', ['stress', 'anxiety', 'anger'], { type: 'local', src: '/games/bubble-wrap/index.html' }, {
    badge: 'Sensory Wrap',
    credit: 'MindSpace Tactile Engine · In-App Game'
  }),
  g('satisbox', 'SatisBox ASMR Mini', '📦', 'Satisfying tactile mini-tasks: defog steam mirrors, straighten wall picture frames, and sort pencils by height.', ['stress', 'anxiety'], { type: 'local', src: '/games/satisbox/index.html' }, {
    badge: 'Declutter ASMR',
    credit: 'MindSpace Tactile Engine · In-App Game'
  }),
  g('fallingsand', 'Falling Sand Physics', '⏳', 'Creative cellular particle sandbox: stream sand, pour water, spark fire, grow plants, and watch soothing physics.', ['stress', 'anxiety', 'refresh'], { type: 'local', src: '/games/falling-sand/index.html' }, {
    badge: 'Physics Sandbox',
    credit: 'MindSpace Particle Physics Engine · In-App Game'
  }),
  g('fluidsim', 'Calm Fluid Canvas', '🌈', 'Interactive glowing fluid dynamics simulator; glide your finger or mouse to swirl vibrant luminous aurora ribbons.', ['stress', 'anxiety', 'refresh'], { type: 'local', src: '/games/fluid-simulation/index.html' }, {
    badge: 'Fluid Dynamics',
    credit: 'MindSpace WebGL Fluid Engine · In-App Game'
  }),

  // ---- Group 2: Mood 2 - Bad (Emotional Comfort, Serene Aquatic & Botanical Sanctuary) ----
  g('koipond', 'Zen Koi Pond', '🐟', 'Living Japanese Nishikigoi swimming gracefully with realistic water ripples; tap to drop food pellets and feed the fish.', ['sadness', 'refresh', 'anxiety'], { type: 'local', src: '/games/koi-pond/index.html' }, {
    badge: 'Aquatic Zen',
    credit: 'MindSpace Procedural Flocking · In-App Game'
  }),
  g('zengarden', 'Zen Sand Garden', '🪨', 'Traditional Japanese Karesansui dry sand garden: rake patterns around meditation stones with dry sand raking acoustics.', ['sadness', 'stress', 'refresh'], { type: 'local', src: '/games/zen-garden/index.html' }, {
    badge: 'Karesansui',
    credit: 'MindSpace Zen Engine · In-App Game'
  }),
  g('watercolor', 'Water Color Sort', '🧪', 'Gently sort soft pastel liquids between glass test tubes until each tube holds a single pure color, with liquid sounds.', ['sadness', 'anxiety', 'refresh'], { type: 'local', src: '/games/water-color-sort/index.html' }, {
    badge: 'Color Harmony',
    credit: 'MindSpace Puzzle Lab · In-App Game'
  }),
  g('aquarium', 'Virtual Coral Aquarium', '🐠', 'Underwater tropical coral sanctuary with clownfish, peaceful swimming schools, sunbeams, and floating bubbles.', ['sadness', 'anxiety', 'refresh'], { type: 'local', src: '/games/aquarium/index.html' }, {
    badge: 'Marine Haven',
    credit: 'MindSpace Marine Simulator · In-App Game'
  }),
  g('bloominggardens', 'Blooming Gardens', '🌸', 'Plant vibrant flowers and tend blossoming garden plots in a relaxing, untimed nature sanctuary.', ['sadness', 'refresh'], { type: 'local', src: '/games/blooming-gardens/index.html' }, {
    badge: 'Flower Garden',
    credit: 'MindSpace Botanical Engine · In-App Game'
  }),

  // ---- Group 3: Mood 3 - Okay (Cognitive De-Clutter, Mindful Flow & Brain Fog Reset) ----
  g('infinityloop', 'Infinity Loop Zen', '♾️', 'Rotate minimalist geometric curves to connect harmonious closed circuits with zero timer or pressure.', ['refresh', 'anxiety'], { type: 'local', src: '/games/infinity-loop/index.html' }, {
    badge: 'Minimal Flow',
    credit: 'MindSpace Geometry Lab · In-App Game'
  }),
  g('potterymaster', 'Pottery Master 3D', '🏺', 'Spin the ceramic turntable and sculpt soft wet clay into elegant vases and bowls, then fire and glaze them.', ['refresh', 'stress'], { type: 'local', src: '/games/pottery-master/index.html' }, {
    badge: 'Ceramic Lathe',
    credit: 'MindSpace 3D Ceramics · In-App Game'
  }),
  g('floodit', 'Colour Flood Harmony', '🔵', 'Fill the grid with a single calming colour in as few gentle, mindful moves as you like.', ['refresh', 'anxiety'], { type: 'local', src: '/games/floodit/index.html' }, {
    badge: 'Color Flow',
    credit: 'MindSpace Flood Algorithm · In-App Game'
  }),
  g('linestofill', 'Lines to Fill', '〰️', 'Draw satisfying continuous lines to neatly fill puzzle shapes and clear away mental clutter.', ['refresh', 'anxiety'], { type: 'local', src: '/games/lines-to-fill/index.html' }, {
    badge: 'Path Drawing',
    credit: 'MindSpace Flow Engine · In-App Game'
  }),
  g('game2048', '2048 Zen Edition', '🔢', 'Slide and merge soft pastel number tiles in an elegant, distraction-free environment.', ['refresh', 'anxiety'], { type: 'local', src: '/games/game-2048/index.html' }, {
    badge: 'Zen Numbers',
    credit: 'MindSpace Logic Engine · In-App Game'
  }),

  // ---- Group 4: Mood 4 - Good (Creative Styling, Cozy Craft & Mindful Growth) ----
  g('roombox', 'Cozy Roombox 3D', '🛋️', 'Design and furnish miniature pastel isometric rooms with indoor plants, ambient lamps, and cozy decor.', ['refresh', 'sadness'], { type: 'local', src: '/games/roombox/index.html' }, {
    badge: 'Cozy Room',
    credit: 'MindSpace Room Studio · In-App Game'
  }),
  g('homedesign', 'Home Design Studio', '🏡', 'Renovate scenic living spaces and arrange furniture to create peaceful aesthetic sanctuaries.', ['refresh', 'anxiety'], { type: 'local', src: '/games/home-design/index.html' }, {
    badge: 'Interior Design',
    credit: 'MindSpace Design Lab · In-App Game'
  }),
  g('stickerart', 'Sticker Art Zen', '🎨', 'Place vibrant sticker illustrations onto serene canvas backdrops to complete delightful artwork.', ['refresh', 'sadness'], { type: 'local', src: '/games/sticker-art/index.html' }, {
    badge: 'Sticker Book',
    credit: 'MindSpace Art Studio · In-App Game'
  }),
  g('sproutvalley', 'Sprout Valley Garden', '🌾', 'Cozy farming and gardening: plant seeds, water sprouts, and harvest organic crops in peaceful rhythm.', ['refresh', 'sadness'], { type: 'local', src: '/games/sprout-valley/index.html' }, {
    badge: 'Cozy Farm',
    credit: 'MindSpace Farm Simulator · In-App Game'
  }),
  g('sugarsugar', 'Sugar Sugar Physics', '☕', 'Draw gentle slopes and ramps with your finger or mouse to guide cascading sugar grains into warm mugs.', ['refresh', 'stress', 'anxiety'], { type: 'local', src: '/games/sugar-sugar/index.html' }, {
    badge: 'Grain Physics',
    credit: 'MindSpace Physics Studio · In-App Game'
  }),

  // ---- Group 5: Mood 5 - Great (Playful Joy, Cheerful Energy & Harmonic Flow) ----
  g('smartybubbles', 'Smarty Bubbles HD', '🫧', 'Joyful pastel bubble popping with crisp acoustic snaps, bright cascades, and untimed harmonic celebrations.', ['refresh', 'stress'], { type: 'local', src: '/games/smarty-bubbles/index.html' }, {
    badge: 'Bubble Pop',
    credit: 'MindSpace Arcade Zen · In-App Game'
  }),
  g('catslovecake', 'Cats Love Cake', '🐱', 'Bounce adorable cute cats across playful stages towards sweet cakes with cheerful physics.', ['refresh', 'sadness'], { type: 'local', src: '/games/cats-love-cake/index.html' }, {
    badge: 'Cheerful Cats',
    credit: 'MindSpace Wholesome Lab · In-App Game'
  }),
  g('goodsmatch3d', 'Goods Match 3D', '🥫', 'Satisfying 3D supermarket shelf organization: match identical grocery items and clear clean pantry shelves.', ['refresh', 'anxiety'], { type: 'local', src: '/games/goods-match-3d/index.html' }, {
    badge: '3D Shelf Tidy',
    credit: 'MindSpace 3D Match · In-App Game'
  }),
  g('shapefoldnature', 'Shape Fold Nature', '🍃', 'Fold interconnected geometric origami tiles to assemble peaceful nature leaves, animals, and flowers.', ['refresh', 'anxiety'], { type: 'local', src: '/games/shape-fold-nature/index.html' }, {
    badge: 'Origami Fold',
    credit: 'MindSpace Origami Studio · In-App Game'
  }),
  g('waterripples', 'Interactive Water Ripples', '💧', 'A responsive liquid pool surface that casts concentric refractive waves, gentle droplets, and soothing reflections.', ['refresh', 'anxiety', 'stress'], { type: 'local', src: '/games/water-ripples/index.html' }, {
    badge: 'Hydrodynamics',
    credit: 'MindSpace Water Engine · In-App Game'
  }),

  // =========================================================================
  // Additional In-App Self-Hosted Relaxing Games (Available in Explore More)
  // =========================================================================
  g('cloth', 'Tearable Silk Cloth', '🧵', 'Interactive soft-body fabric floating in a calm breeze; stretch, drag, ripple, and slice threads gently.', ['anger', 'stress', 'anxiety'], { type: 'local', src: '/games/cloth/index.html' }, {
    badge: 'Soft-Body',
    credit: 'Verlet Cloth Simulation · In-App'
  }),
  g('harmony', 'Procedural Harmony Sketch', '✏️', 'Procedural generative art sketchpad with fluid ribbon lines, sketchy pencils, and web filaments.', ['refresh', 'sadness', 'anxiety'], { type: 'local', src: '/games/harmony/index.html' }, {
    badge: 'Generative Art',
    credit: 'Procedural Sketch Studio · In-App'
  }),
  g('homemakeover', 'Home Makeover Cleaning', '🧹', 'Clear clutter, scrub surfaces clean, and transform messy rooms into sparkling aesthetic sanctuaries.', ['refresh', 'stress'], { type: 'local', src: '/games/home-makeover/index.html' }, {
    badge: 'Declutter Spa',
    credit: 'Cleaning ASMR · In-App'
  }),
  g('bubbleshooterhd', 'Bubble Shooter HD', '🔮', 'High-definition celestial bubble popping with vibrant cascades and sparkling harmonic celebrations.', ['refresh', 'anxiety'], { type: 'local', src: '/games/bubble-shooter-hd/index.html' }, {
    badge: 'HD Bubbles',
    credit: 'MindSpace Arcade · In-App'
  }),
  g('onetmaster', 'Onet Master Tile Match', '🧩', 'Mindful tile connection puzzle featuring sweet pastries, gentle forest animals, and botanical symbols.', ['refresh', 'sadness'], { type: 'local', src: '/games/onet-master/index.html' }, {
    badge: 'Pair Connect',
    credit: 'Tile Flow · In-App'
  }),
  g('pieceofcake', 'Piece of Cake: Bakery Merge', '🧁', 'Delightful casual bakery merger; combine croissants, cupcakes, and macarons to bake tasty treats.', ['refresh', 'stress'], { type: 'local', src: '/games/piece-of-cake/index.html' }, {
    badge: 'Cozy Bakery',
    credit: 'Pastry Merge · In-App'
  }),
  g('braintest', 'Brain Test Mindful Riddles', '💡', 'Whimsical, stress-free brain teasers with creative humorous solutions to spark a gentle smile.', ['refresh', 'sadness'], { type: 'local', src: '/games/brain-test/index.html' }, {
    badge: 'Gentle Riddles',
    credit: 'Mind Test · In-App'
  }),
  g('castawayisland', 'Castaway Island Cozy Town', '🏝️', 'Peaceful island exploration and village building: harvest resources and build a tranquil tropical refuge.', ['refresh', 'stress'], { type: 'local', src: '/games/castaway-island/index.html' }, {
    badge: 'Island Haven',
    credit: 'Island Sandbox · In-App'
  }),
  g('aquariumtycoon', 'Pixel Aquarium Sanctuary', '🐡', 'Care for sweet pixel fish, feed them daily, and decorate an underwater haven with colorful sea plants.', ['sadness', 'refresh'], { type: 'local', src: '/games/aquarium-tycoon/index.html' }, {
    badge: 'Pixel Marine',
    credit: 'Aquarium Life · In-App'
  }),
  g('botanica', 'Botanica Greenhouse of Wishes', '🌿', 'Cultivate rare botanical specimens, water tropical seedlings, and build an indoor conservatory.', ['sadness', 'refresh', 'anxiety'], { type: 'local', src: '/games/botanica/index.html' }, {
    badge: 'Greenhouse',
    credit: 'Botanica Studio · In-App'
  }),
  g('burgercafe', 'Burger Cafe ASMR Story', '🍔', 'Cozy culinary cafe simulator: grill patties, layer crisp lettuce, and serve cheerful orders with cooking sounds.', ['refresh', 'stress'], { type: 'local', src: '/games/burger-cafe-story/index.html' }, {
    badge: 'Cooking ASMR',
    credit: 'Cafe Story · In-App'
  }),
  g('colorblue', 'Blue - Bart Bonte Style', '🟦', 'Solve 50 clever, tranquil logic puzzles where your goal is to turn the entire screen calming blue.', ['anxiety', 'refresh'], { type: 'local', src: '/games/color-blue/index.html' }, {
    badge: 'Blue Zen',
    credit: 'Color Series · In-App'
  }),
  g('colorgreen', 'Green - Bart Bonte Style', '🟩', 'Solve clever, meditative logic challenges where every stage transforms into lush calming green.', ['anxiety', 'refresh'], { type: 'local', src: '/games/color-green/index.html' }, {
    badge: 'Green Zen',
    credit: 'Color Series · In-App'
  }),
  g('colororange', 'Orange - Bart Bonte Style', '🟧', 'Warm, uplifting logic puzzles where each inventive riddle turns the screen a comforting citrus orange.', ['refresh', 'sadness'], { type: 'local', src: '/games/color-orange/index.html' }, {
    badge: 'Orange Zen',
    credit: 'Color Series · In-App'
  }),
  g('colorpink', 'Pink - Bart Bonte Style', '🟪', 'Sweet pastel puzzle challenges where every creative touch transforms the canvas into rosy pink.', ['refresh', 'sadness'], { type: 'local', src: '/games/color-pink/index.html' }, {
    badge: 'Pink Zen',
    credit: 'Color Series · In-App'
  }),
  g('colormatch', 'Color Match 3D Studio', '🎨', 'Mix primary paint pigments on the artist palette to match 3D everyday objects with soothing paint physics.', ['refresh', 'stress'], { type: 'local', src: '/games/color-match/index.html' }, {
    badge: 'Paint Studio',
    credit: 'Color Lab · In-App'
  }),
  g('designville', 'Designville Cozy Merge', '🛋️', 'Merge cozy craft tools and decorative tiles to renovate stylish garden rooms and sunrooms.', ['refresh', 'anxiety'], { type: 'local', src: '/games/designville/index.html' }, {
    badge: 'Merge & Style',
    credit: 'Designville Lab · In-App'
  }),
  g('dualcat', 'Dual Cat Cozy Journey', '🐱', 'Guide two adorable adventurous cats through sweet obstacle puzzles by working together in harmony.', ['refresh', 'sadness'], { type: 'local', src: '/games/dual-cat/index.html' }, {
    badge: 'Cat Journey',
    credit: 'Cozy Platformer · In-App'
  }),
  g('factoryballs', 'Factory Balls Logic Craft', '⚪', 'Dip, spray, and mask white balls in thoughtful order to match the charming target design.', ['refresh', 'anxiety'], { type: 'local', src: '/games/factory-balls/index.html' }, {
    badge: 'Craft Logic',
    credit: 'Factory Balls · In-App'
  }),
  g('freethekey', 'Free The Key Timber Slide', '🗝️', 'Slide smooth wooden timber blocks around the board to unlock the golden key with tactile wooden sounds.', ['anxiety', 'refresh'], { type: 'local', src: '/games/free-the-key/index.html' }, {
    badge: 'Timber Zen',
    credit: 'Slide Puzzle · In-App'
  }),
  g('growyourhome', 'Grow Your Home Expansion', '🌱', 'Sprout living organic rooms with flourishing vines, sunlit windows, and cozy furnishings.', ['sadness', 'refresh'], { type: 'local', src: '/games/grow-your-home/index.html' }, {
    badge: 'Botanical Home',
    credit: 'Grow Studio · In-App'
  }),
  g('idleseapark', 'Idle Sea Park Marine Haven', '🐋', 'Build a calm oceanic reserve with playful dolphins, manta rays, and coral habitats.', ['sadness', 'refresh'], { type: 'local', src: '/games/idle-sea-park/index.html' }, {
    badge: 'Ocean Haven',
    credit: 'Marine Sanctuary · In-App'
  }),
  g('makeoverasmr', 'Makeover ASMR Spa', '💅', 'Enjoy soothing skincare, gentle facials, and calming beauty treatments with crisp ASMR acoustic triggers.', ['stress', 'sadness'], { type: 'local', src: '/games/makeover-asmr/index.html' }, {
    badge: 'ASMR Spa',
    credit: 'Makeover Studio · In-App'
  }),
  g('minitrain', 'Mini Train Wooden Rails', '🚂', 'Place wooden track blocks to guide a cheerful mini locomotive safely across peaceful countryside hills.', ['refresh', 'anxiety'], { type: 'local', src: '/games/mini-train/index.html' }, {
    badge: 'Wooden Rails',
    credit: 'Train Puzzle · In-App'
  }),
  g('nonogram', 'Nonogram Zen Pixel Art', '🔢', 'Reveal beautiful hidden pixel illustrations by deducing numeric row and column clues at your leisure.', ['refresh', 'anxiety'], { type: 'local', src: '/games/nonogram/index.html' }, {
    badge: 'Picross',
    credit: 'Nonogram Studio · In-App'
  }),
  g('numicolor', 'Numicolor Scenic Canvas', '🖌️', 'Meditative color-by-number digital canvas: tap numbered sections to paint scenic landscapes and flowers.', ['refresh', 'sadness'], { type: 'local', src: '/games/numicolor/index.html' }, {
    badge: 'Paint by Number',
    credit: 'Coloring Studio · In-App'
  }),
  g('pottery', 'Virtual Pottery Wheel', '🏺', 'Spin the turntable and gently press into soft wet clay to shape vases and ceramic bowls.', ['refresh', 'anxiety', 'stress'], { type: 'local', src: '/games/pottery/index.html' }, {
    badge: 'Ceramics',
    credit: 'Lathe Mesh Deformation · In-App'
  }),
  g('scandinavianmahjong', 'Scandinavian Zen Mahjong', '🀄', 'Clean Nordic-style tile matching solitaire with minimalist botanical and nature icons.', ['refresh', 'anxiety'], { type: 'local', src: '/games/scandinavian-mahjong/index.html' }, {
    badge: 'Nordic Zen',
    credit: 'Mahjong Solitaire · In-App'
  }),
  g('shapefoldanimals', 'Shape Fold Animals', '🦊', 'Fold connected origami segments into cheerful animal shapes including fox, owl, and gentle deer.', ['refresh', 'sadness'], { type: 'local', src: '/games/shape-fold-animals/index.html' }, {
    badge: 'Animal Origami',
    credit: 'Origami Studio · In-App'
  }),
  g('shenzhenmahjong', 'Shenzhen Zen Solitaire', '🎋', 'Classic bamboo and floral tile pairing with tranquil background ambience and smooth card turns.', ['refresh', 'anxiety'], { type: 'local', src: '/games/shenzhen-mahjong/index.html' }, {
    badge: 'Zen Solitaire',
    credit: 'Mahjong Solitaire · In-App'
  }),
  g('soomatch', 'Soo Match Cozy Decor', '🪴', 'Triple-match 3D cozy objects and furnish aesthetic bedrooms with relaxing rewards.', ['refresh', 'stress'], { type: 'local', src: '/games/soo-match/index.html' }, {
    badge: 'Triple Match',
    credit: '3D Match Studio · In-App'
  }),
  g('unpuzzle', 'Unpuzzle Mindful Disassembly', '🧩', 'Peacefully take apart intricate geometric jigsaw structures piece by piece with zero time limits.', ['anxiety', 'refresh'], { type: 'local', src: '/games/unpuzzle/index.html' }, {
    badge: 'Deconstruction',
    credit: 'Unpuzzle Lab · In-App'
  }),
  g('unpuzzler', 'UnpuzzleR Reverse Flow', '🔄', 'The meditative reverse edition of Unpuzzle: push jigsaw pieces back together to restore harmony.', ['anxiety', 'refresh'], { type: 'local', src: '/games/unpuzzle-r/index.html' }, {
    badge: 'Harmonic Flow',
    credit: 'Unpuzzle Lab · In-App'
  }),
  g('yarnfever', 'Yarn Fever Knitting Loop', '🧶', 'Untangle and knit soft colored yarn loops into warm scarves with cozy tactile wool mechanics.', ['stress', 'anxiety', 'refresh'], { type: 'local', src: '/games/yarn-fever/index.html' }, {
    badge: 'Cozy Wool',
    credit: 'Textile Physics · In-App'
  }),
  g('blockyblast', 'Blocky Blast Timber Grid', '🪵', 'Fit smooth natural oak blocks into a 10x10 zen grid with timber acoustics and no stressful timer.', ['refresh', 'anxiety'], { type: 'local', src: '/games/blocky-blast/index.html' }, {
    badge: 'Timber Grid',
    credit: 'Block Puzzle · In-App'
  }),
  g('garten', 'Botanical Garden Bloom', '🌸', 'Plant seeds in fertile earth that organically sprout branching stems and blooming wildflowers.', ['sadness', 'refresh', 'anxiety'], { type: 'local', src: '/games/garten/index.html' }, {
    badge: 'Nature',
    credit: 'Botanical Growth Engine · In-App'
  }),
  g('fluid', 'Calm Fluid Waves', '🌊', 'Swirl glowing fluid dynamics across dark velvet with touch or mouse in soft harmonic motion.', ['stress', 'anxiety', 'refresh'], { type: 'local', src: '/games/fluid/index.html' }, {
    badge: 'Fluid Art',
    credit: 'Fluid Physics · In-App'
  }),

  // =========================================================================
  // Native Interactive Calming & Release MindSpace Mini-Games
  // =========================================================================
  g('breathing', 'Guided Box Breathing', '🌬️', 'Follow the expanding resonant circle for slow, grounding 4-4-4-4 box breathing to restore calmness.', ['anxiety', 'stress'], { type: 'game', subtype: 'breathing' }),
  g('balloon', 'Worry Balloon Release', '🎈', 'Write a worry or heavy thought onto a balloon, pop it or let it float peacefully into the sunset.', ['anxiety', 'stress', 'sadness'], { type: 'game', subtype: 'balloon' }),
  g('bubbles', 'Zen Bubble Popper', '🫧', 'Pop soft pastel bubbles one by one to release built-up physical and emotional tension.', ['stress', 'anxiety', 'anger'], { type: 'game', subtype: 'bubbles' }),
  g('whack', 'Whack-A-Stress', '🔨', 'Safely vent frustration and anger by gently tapping popping stress critters.', ['anger', 'stress'], { type: 'game', subtype: 'whack' }),
  g('pet', 'Virtual Zen Pet', '🐱', 'Feed, brush, and cuddle a gentle virtual kitten for instant emotional warmth and comfort.', ['sadness', 'refresh'], { type: 'game', subtype: 'pet' }),
  g('coloring', 'Coloring Book', '🎨', 'Paint soothing mindfulness templates and let your racing thoughts quiet down.', ['refresh', 'sadness', 'anxiety'], { type: 'game', subtype: 'coloring' }),
  g('nature', 'Nature Sound Mixer', '🌲', 'Blend rain, ocean waves, forest wind, and a crackling campfire into your custom soundscape.', ['anxiety', 'refresh', 'stress'], { type: 'game', subtype: 'nature' }),
  g('soundboard', 'Calm Sound Board', '🎵', 'Play soft synthesized musical tones, singing bowls, and ocean swells.', ['anxiety', 'refresh'], { type: 'game', subtype: 'soundboard' }),
  g('doodler', 'Zen Doodler', '✏️', 'A pastel canvas to sketch freely without judgment and let your mind unwind.', ['stress', 'refresh'], { type: 'game', subtype: 'doodler' }),
  g('safespace', 'Safe Space Story', '🏡', 'Choose sensory details to construct your own peaceful sanctuary in your mind.', ['sadness', 'anxiety'], { type: 'game', subtype: 'safespace' }),
  g('gratitude', 'Gratitude Garden', '🌻', 'Plant a blossom for every small thing you feel thankful for today to foster optimism.', ['sadness', 'refresh'], { type: 'game', subtype: 'gratitude' }),
  g('affirmation', 'Affirmation Spinner', '🎡', 'Spin the wheel to receive a kind, comforting reminder and therapeutic affirmation.', ['sadness', 'refresh'], { type: 'game', subtype: 'affirmation' }),

  // =========================================================================
  // 3D Relaxation Zone WebGL Worlds (Interactive 3D Sensory Immersion)
  // =========================================================================
  g('starfield', '3D Cosmic Starfield', '🌌', 'Drift through a glowing deep-space nebula in 360° celestial peace with ambient stardust pad.', ['anxiety', 'refresh'], { type: '3d', key: 'starfield' }, { badge: '3D Sensory' }),
  g('sakura', '3D Sakura Sanctuary', '🌸', 'A Japanese temple pagoda with cherry blossom petals falling gently around you with soothing breeze.', ['sadness', 'refresh'], { type: '3d', key: 'sakura' }, { badge: '3D Sensory' }),
  g('water', '3D Water Ripples', '🌊', 'A kinetic liquid pool that ripples wherever you touch with realistic Solfeggio frequency sound.', ['stress', 'refresh'], { type: '3d', key: 'water' }, { badge: '3D Sensory' }),
  g('crystal', '3D Breathing Crystal', '🔮', 'Breathe in time with a slowly pulsing glowing glass orb tuned to pure 528Hz Solfeggio.', ['anxiety', 'stress'], { type: '3d', key: 'crystal' }, { badge: '3D Sensory' }),
  g('saturn', '3D Saturn & Moons', '🪐', 'Watch celestial moons orbit a ringed planet in tranquil silence with deep space harmonics.', ['refresh', 'anxiety'], { type: '3d', key: 'saturn' }, { badge: '3D Sensory' }),
  g('autumn', '3D Autumn Forest', '🍃', 'Golden leaves drifting lazily in a quiet autumn breeze with woodland tranquility.', ['sadness', 'refresh'], { type: '3d', key: 'autumn' }, { badge: '3D Sensory' }),
  g('prism', '3D Prism Kaleidoscope', '💎', 'Rainbow light beams bending through a multifaceted crystal prism in slow symmetry.', ['refresh', 'stress'], { type: '3d', key: 'prism' }, { badge: '3D Sensory' }),
  g('warp', '3D Quantum Warp Tunnel', '🚀', 'A smooth infinite spiral of soft neon light to quietly zone out and decompress.', ['stress', 'anxiety'], { type: '3d', key: 'warp' }, { badge: '3D Sensory' }),

  // =========================================================================
  // Dedicated In-App Relaxation Modals
  // =========================================================================
  g('popitmodal', 'Pop-It Fidget Toy', '🧸', 'Press every silicone bubble flat, then flip the board and pop again.', ['stress', 'anger'], { type: 'modal', modal: 'popit' }),
  g('mowermodal', 'Stone Grass Mower', '🚜', 'Satisfying, repetitive lawn mowing that clears mental clutter and restores rhythm.', ['stress', 'anger', 'refresh'], { type: 'modal', modal: 'mower' }),
  g('watersortmodal', 'Water Sort Puzzle Modal', '🧪', 'Gently sort soft pastel liquids between glass tubes at your own pace.', ['anxiety', 'refresh'], { type: 'modal', modal: 'watersort' }),
  g('mergemodal', 'DesignVille Merge Modal', '🏡', 'Merge cozy items to decorate a peaceful dream room.', ['refresh', 'sadness'], { type: 'modal', modal: 'merge' }),
  g('diffmodal', 'Spot the Differences', '🔍', 'Spot subtle peaceful details between two serene illustrations without any timer.', ['refresh'], { type: 'modal', modal: 'diff' }),
  g('catch', 'Catch the Stars', '🌠', 'Slide the basket to catch gentle falling stars in a peaceful night sky.', ['sadness', 'refresh'], { type: 'game', subtype: 'catch' }),
  g('calmgenerator', 'Calm Activity Generator', '🧘', 'Get a simple, gentle mindfulness exercise to ground your thoughts right now.', ['anxiety', 'stress'], { type: 'game', subtype: 'calmgenerator', needsData: true }),
  g('positivequotes', 'Positive Quotes', '💬', 'Savour an uplifting quote to ground your mindset with warmth and clarity.', ['sadness'], { type: 'game', subtype: 'positivequotes', needsData: true })
]

const byId = Object.fromEntries(GAME_CATALOG.map(game => [game.id, game]))

// Mood value (1 Terrible ... 5 Great) -> EXACTLY 5 recommended game ids.
// All 5 per mood are 100% self-hosted, offline-capable, and run in the in-app player.
export const MOOD_GAME_MAP = {
  1: ['popitmaster', 'bubblewrap', 'satisbox', 'fallingsand', 'fluidsim'],
  2: ['koipond', 'zengarden', 'watercolor', 'aquarium', 'bloominggardens'],
  3: ['infinityloop', 'potterymaster', 'floodit', 'linestofill', 'game2048'],
  4: ['roombox', 'homedesign', 'stickerart', 'sproutvalley', 'sugarsugar'],
  5: ['smartybubbles', 'catslovecake', 'goodsmatch3d', 'shapefoldnature', 'waterripples']
}

export const MOOD_GAME_THEMES = {
  1: {
    headline: 'Sensory Grounding, Tactile ASMR & High Tension Relief',
    blurb: 'Interactive 3D fidget popping, tactile bubble sheets, satisfying mini-tasks, falling sand physics, and glowing fluid dynamics to rapidly melt acute distress.'
  },
  2: {
    headline: 'Emotional Comfort, Aquatic Peace & Serene Sanctuary',
    blurb: 'Living Nishikigoi koi pond, Karesansui dry sand raking, pastel water color sorting, coral reef aquarium, and flower bloom gardens to soothe the spirit.'
  },
  3: {
    headline: 'Mental De-Clutter, Mindful Flow & Brain Fog Reset',
    blurb: 'Geometric loop connections, 3D pottery lathe sculpting, colour flood harmony, grid line filling, and 2048 zen number merging for calm mental clarity.'
  },
  4: {
    headline: 'Creative Styling, Cozy Craft & Mindful Growth',
    blurb: 'Cozy miniature 3D room styling, home interior decorating, scenic sticker art, tranquil farm gardening, and sweet physics drawing.'
  },
  5: {
    headline: 'Playful Joy, Cheerful Energy & Harmonic Flow',
    blurb: 'Joyful pastel bubble shooting, adorable cat bouncing adventures, 3D goods shelf matching, tactile origami folding, and kinetic water ripples!'
  }
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
  subtype: game.launch?.subtype || game.launch?.key || game.launch?.modal || game.id
})

const pick = arr => arr[Math.floor(Math.random() * arr.length)]

const QUOTES = [
  { text: 'Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.', author: 'Thich Nhat Hanh' },
  { text: 'You are allowed to be both a masterpiece and a work in progress.', author: 'Sophia Bush' },
  { text: 'Act as if what you do makes a difference. It does.', author: 'William James' },
  { text: 'Nothing can dim the light which shines from within.', author: 'Maya Angelou' },
  { text: 'Peace comes from within. Do not seek it without.', author: 'Buddha' },
  { text: 'Almost everything will work again if you unplug it for a few minutes, including you.', author: 'Anne Lamott' }
]

const CALM_ACTIVITIES = [
  'Sip a warm cup of herbal tea 🍵',
  'Close your eyes and take 3 deep belly breaths 🧘',
  'Stretch your arms above your head for 10 seconds 🙆',
  'Sit completely still and focus on a distant sound 🕊️',
  'Write down one simple thing you appreciate about today ✍️',
  'Look out the window and spot three green things in nature 🌿',
  'Place both feet flat on the floor and feel the solid ground beneath you 👣'
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
