// ---------------------------------------------------------------------------
// MindSpace - Mood-Based Relaxing Games catalog
//
// Single source of truth for every game that can be launched from the Mood
// page. Nothing here renders a game - each entry only DESCRIBES how the
// existing MoodTracker launchers (launchGame / 3D / modal) or the new local
// open-source iframe games should be opened.
//
// launch.type:
//   'game'  -> launchGame(subtype)           (standard in-page game modal)
//   '3d'    -> setActive3DGame(key)          (Three.js WebGL scenes)
//   'modal' -> one of the dedicated dark modals (merge, diff, mower, popit, watersort)
//   'local' -> open-source game hosted in /public/games/<id>/ shown in an iframe
//
// launch.needsData: the game's renderer needs a data payload (puzzle board,
// quiz question, ...). MoodTracker supplies it from the live backend response
// when available, otherwise from buildGameData() below.
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
  // ---- Calming & release games (standard modal) ----
  g('bubbles', 'Zen Bubble Popper', '🫧', 'Pop soft bubbles one by one to release built-up tension.', ['stress', 'anxiety'], { type: 'game', subtype: 'bubbles' }),
  g('balloon', 'Worry Balloon Release', '🎈', 'Write a worry on a balloon, then pop it and let it go.', ['anxiety', 'stress'], { type: 'game', subtype: 'balloon' }),
  g('whack', 'Whack-A-Stress', '🔨', 'Safely vent frustration by tapping popping stress monsters.', ['anger', 'stress'], { type: 'game', subtype: 'whack' }),
  g('breathing', 'Guided Breathing', '🌬️', 'Follow the expanding circle for slow, steady box-breathing.', ['anxiety', 'stress'], { type: 'game', subtype: 'breathing' }),
  g('affirmation', 'Affirmation Spinner', '🎡', 'Spin the wheel to draw a kind, positive message for today.', ['sadness'], { type: 'game', subtype: 'affirmation' }),
  g('safespace', 'Safe Space Story', '🏡', 'Choose the details that build your own peaceful dream place.', ['sadness', 'anxiety'], { type: 'game', subtype: 'safespace' }),
  g('garden', 'Zen Garden Builder', '🌸', 'Plant flowers and place stones in raked sand at your own pace.', ['sadness', 'refresh'], { type: 'game', subtype: 'garden' }),
  g('gratitude', 'Gratitude Garden', '🌻', 'Plant a flower for every thing you feel thankful for.', ['sadness'], { type: 'game', subtype: 'gratitude' }),
  g('pet', 'Virtual Zen Pet', '🐱', 'Feed, clean and cuddle a gentle virtual kitten.', ['sadness'], { type: 'game', subtype: 'pet' }),
  g('coloring', 'Coloring Book', '🎨', 'Paint calming templates and let your mind slow down.', ['refresh', 'sadness'], { type: 'game', subtype: 'coloring' }),
  g('doodler', 'Zen Doodler', '✏️', 'A pastel canvas to sketch freely and let go of racing thoughts.', ['stress', 'refresh'], { type: 'game', subtype: 'doodler' }),
  g('nature', 'Nature Sound Mixer', '🌲', 'Blend rain, waves, wind and a crackling campfire.', ['anxiety', 'refresh'], { type: 'game', subtype: 'nature' }),
  g('soundboard', 'Calm Sound Board', '🎵', 'Play soft synthesized tones, rain and ocean swells.', ['anxiety', 'refresh'], { type: 'game', subtype: 'soundboard' }),
  g('memory', 'Zen Memory Match', '🧩', 'Match pairs of peaceful icons to gently focus the mind.', ['refresh', 'anxiety'], { type: 'game', subtype: 'memory' }),

  // ---- Open-source games hosted locally (new) ----
  g('fluid', 'Calm Fluid Canvas', '🌈', 'Swirl glowing colour through water with your finger or mouse.', ['stress', 'anxiety'], { type: 'local', src: '/games/fluid/index.html' }, {
    badge: 'Open source',
    credit: 'WebGL Fluid Simulation by Pavel Dobryakov (MIT License)'
  }),
  g('floodit', 'Colour Flood', '🔵', 'Fill the board with a single colour in as few calm moves as you can.', ['anxiety', 'refresh'], { type: 'local', src: '/games/floodit/index.html' }, {
    badge: 'Open source',
    credit: 'FloodIt by Thijs van As (MIT License)'
  }),

  // ---- 3D WebGL worlds ----
  g('starfield', '3D Cosmic Starfield', '🌌', 'Drift through a glowing particle universe. Drag to look around.', ['anxiety', 'refresh'], { type: '3d', key: 'starfield' }, { badge: '3D' }),
  g('water', '3D Water Ripples', '🌊', 'A kinetic liquid pool that ripples wherever you touch.', ['stress', 'refresh'], { type: '3d', key: 'water' }, { badge: '3D' }),
  g('sakura', '3D Sakura Sanctuary', '🌸', 'A cherry tree with petals falling softly around you.', ['sadness', 'refresh'], { type: '3d', key: 'sakura' }, { badge: '3D' }),
  g('crystal', '3D Breathing Crystal', '🔮', 'Breathe in time with a slowly pulsing glass orb.', ['anxiety', 'stress'], { type: '3d', key: 'crystal' }, { badge: '3D' }),
  g('saturn', '3D Saturn & Moons', '🪐', 'Watch moons orbit a ringed planet in peaceful silence.', ['refresh', 'anxiety'], { type: '3d', key: 'saturn' }, { badge: '3D' }),
  g('autumn', '3D Autumn Forest', '🍃', 'Golden leaves drifting on a gentle breeze.', ['sadness', 'refresh'], { type: '3d', key: 'autumn' }, { badge: '3D' }),
  g('prism', '3D Prism Kaleidoscope', '💎', 'Rainbow light beams bending through a crystal prism.', ['refresh', 'stress'], { type: '3d', key: 'prism' }, { badge: '3D' }),
  g('warp', '3D Quantum Warp Tunnel', '🚀', 'A smooth infinite spiral of light to zone out to.', ['stress', 'anxiety'], { type: '3d', key: 'warp' }, { badge: '3D' }),

  // ---- Satisfying toys & building games (dedicated modals) ----
  g('popit', 'Pop-It Fidget Toy', '🧸', 'Press every bubble flat, then flip the board and start again.', ['stress', 'anger'], { type: 'modal', modal: 'popit' }),
  g('mower', 'Stone Grass Mower', '🚜', 'Satisfying, repetitive lawn cutting that clears the mind.', ['stress', 'anger'], { type: 'modal', modal: 'mower' }),
  g('watersort', 'Water Sort Puzzle', '🧪', 'Sort colourful liquids into tubes - slow, quiet, satisfying.', ['anxiety', 'refresh'], { type: 'modal', modal: 'watersort' }),
  g('merge', 'DesignVille Merge', '🏡', 'Merge items to decorate your dream room piece by piece.', ['refresh', 'sadness'], { type: 'modal', modal: 'merge' }),
  g('diff', 'Spot the Differences', '🔍', 'Find the hidden differences between two peaceful scenes.', ['refresh'], { type: 'modal', modal: 'diff' }),

  // ---- Light arcade & classic games ----
  g('catch', 'Catch the Stars', '🌠', 'Slide the basket to catch falling stars and lift your mood.', ['sadness', 'refresh'], { type: 'game', subtype: 'catch' }),
  g('flappy', 'Flappy Bird', '🐦', 'Tap to flap through the gaps and enjoy a playful challenge.', ['refresh'], { type: 'game', subtype: 'flappy' }),
  g('bricks', 'Brick Breaker', '🧱', 'Bounce the ball and smash bricks to burn off frustration.', ['anger', 'stress'], { type: 'game', subtype: 'bricks' }),
  g('clicktest', 'Click Speed Test', '⚡', 'Tap as fast as you can for five seconds to burn off energy.', ['anger', 'stress'], { type: 'game', subtype: 'clicktest' }),
  g('2048', '2048', '🔢', 'Slide and merge numbered tiles - a calm, absorbing puzzle.', ['refresh', 'anxiety'], { type: 'game', subtype: '2048' }),
  g('snake', 'Snake', '🐍', 'Guide the snake to food without touching the walls.', ['stress'], { type: 'game', subtype: 'snake' }),
  g('minesweeper', 'Minesweeper', '💣', 'Reveal safe tiles with quiet concentration.', ['anxiety'], { type: 'game', subtype: 'minesweeper' }),
  g('tictactoe', 'Tic-Tac-Toe', '❌', 'A relaxed game of Tic-Tac-Toe against a gentle AI.', ['refresh'], { type: 'game', subtype: 'tictactoe' }),
  g('connect4', 'Connect Four', '🔴', 'Drop chips to line up four in a row.', ['refresh'], { type: 'game', subtype: 'connect4' }),
  g('rps', 'Rock Paper Scissors', '✊', 'The classic hand game against the computer.', ['refresh'], { type: 'game', subtype: 'rps' }),
  g('hangman', 'Hangman', '😵', 'Guess the hidden word one letter at a time.', ['refresh'], { type: 'game', subtype: 'hangman' }),
  g('wordbuilder', 'Word Builder', '🔤', 'Combine letter blocks to build calming words.', ['refresh', 'anxiety'], { type: 'game', subtype: 'wordbuilder' }),
  g('wordsearch', 'Mindful Word Search', '🔍', 'Find hidden words of peace and hope in a letter grid.', ['anxiety', 'refresh'], { type: 'game', subtype: 'wordsearch' }),
  g('simon', 'Simon Memory', '🧠', 'Repeat the flashing sequence of colours.', ['refresh'], { type: 'game', subtype: 'simon' }),
  g('trivia', 'Trivia Quiz', '❓', 'Answer friendly questions about mind and wellbeing.', ['refresh'], { type: 'game', subtype: 'trivia' }),
  g('mathquiz', 'Math Speed Quiz', '➕', 'Solve quick sums - a focused way to quiet racing thoughts.', ['anxiety'], { type: 'game', subtype: 'mathquiz' }),
  g('colormatch', 'Color Reflex Match', '🎯', 'Match the colour name with the colour of the text.', ['refresh'], { type: 'game', subtype: 'colormatch' }),
  g('wouldyourather', 'Would You Rather?', '⚖️', 'Pick between two light-hearted choices.', ['refresh'], { type: 'game', subtype: 'wouldyourather' }),
  g('higherlower', 'Higher or Lower', '🃏', 'Guess whether the next card is higher or lower.', ['refresh'], { type: 'game', subtype: 'higherlower' }),
  g('guessnumber', 'Guess the Number', '🎲', 'Find the secret number between 1 and 10.', ['refresh'], { type: 'game', subtype: 'guessnumber' }),
  g('coinflip', 'Coin Flipper', '🪙', 'Call heads or tails and flip the coin.', ['refresh'], { type: 'game', subtype: 'coinflip' }),
  g('slots', 'Emoji Slot Machine', '🎰', 'Spin the reels to match three emojis. Just for fun.', ['refresh'], { type: 'game', subtype: 'slots' }),

  // ---- Puzzles & brain games (need puzzle data) ----
  g('chess', 'Chess Puzzle', '👑', 'Solve a tactical chess puzzle at your own pace.', ['refresh'], { type: 'game', subtype: 'chess', needsData: true }),
  g('sudoku', 'Sudoku', '🔢', 'Fill the grid so every row, column and box has 1 to 9.', ['anxiety', 'refresh'], { type: 'game', subtype: 'sudoku', needsData: true }),
  g('crossword', 'Mindful Crossword', '📰', 'Solve word clues about calm, peace and mindfulness.', ['refresh'], { type: 'game', subtype: 'crossword', needsData: true }),
  g('scramble', 'Word Scramble', '🔡', 'Unscramble the letters to find the hidden word.', ['refresh'], { type: 'game', subtype: 'scramble', needsData: true }),
  g('numbersequence', 'Number Sequence', '📈', 'Spot the pattern and find the missing number.', ['anxiety', 'refresh'], { type: 'game', subtype: 'numbersequence', needsData: true }),
  g('logicpuzzle', 'Logic Riddle', '💡', 'Think through a gentle riddle.', ['refresh'], { type: 'game', subtype: 'logicpuzzle', needsData: true }),
  g('speedmath', 'Speed Math', '🧮', 'Answer rapid-fire sums to sharpen your focus.', ['refresh'], { type: 'game', subtype: 'speedmath', needsData: true }),
  g('visualmemory', 'Visual Memory', '🔲', 'Remember and repeat the flashed grid sequence.', ['refresh'], { type: 'game', subtype: 'visualmemory', needsData: true }),
  g('patternmatch', 'Pattern Match', '📊', 'Guess the missing shape in the pattern.', ['refresh'], { type: 'game', subtype: 'patternmatch', needsData: true }),
  g('nonogram', 'Nonogram', '🖼️', 'Paint cells using number clues to reveal a hidden picture.', ['anxiety', 'refresh'], { type: 'game', subtype: 'nonogram', needsData: true }),
  g('kakuro', 'Kakuro', '➕', 'Solve a small cross-sum number puzzle.', ['refresh'], { type: 'game', subtype: 'kakuro', needsData: true }),
  g('jigsaw', 'Jigsaw Puzzle', '🧩', 'Swap pieces to assemble a calm picture.', ['sadness', 'refresh'], { type: 'game', subtype: 'jigsaw', needsData: true }),
  g('shapesort', 'Shape Sort', '📐', 'Match each shape to its matching slot.', ['sadness', 'refresh'], { type: 'game', subtype: 'shapesort', needsData: true }),
  g('relaxmatch', 'Relax Match', '🍃', 'Match calming pairs to soften the mind.', ['sadness', 'refresh'], { type: 'game', subtype: 'relaxmatch', needsData: true }),
  g('zenpuzzle', 'Zen Sliding Puzzle', '🪷', 'Slide the blocks back into zen order.', ['sadness', 'refresh'], { type: 'game', subtype: 'zenpuzzle', needsData: true }),
  g('emotionmatch', 'Emotion Match', '😊', 'Match pairs of emotional expressions.', ['sadness', 'anxiety'], { type: 'game', subtype: 'emotionmatch', needsData: true }),
  g('positivequotes', 'Positive Quotes', '💬', 'Savour a random uplifting quote.', ['sadness'], { type: 'game', subtype: 'positivequotes', needsData: true }),
  g('calmgenerator', 'Calm Activity Generator', '🧘', 'Get a simple, gentle exercise to try right now.', ['anxiety', 'stress'], { type: 'game', subtype: 'calmgenerator', needsData: true })
]

const byId = Object.fromEntries(GAME_CATALOG.map(game => [game.id, game]))

// Mood value (1 Terrible ... 5 Great) -> EXACTLY 5 recommended game ids.
// Games can appear for more than one mood (e.g. fluid for Bad and Good).
export const MOOD_GAME_MAP = {
  1: ['breathing', 'balloon', 'bubbles', 'whack', 'affirmation'],
  2: ['garden', 'pet', 'fluid', 'coloring', 'nature'],
  3: ['floodit', 'memory', 'wordsearch', 'watersort', 'crystal'],
  4: ['sakura', 'mower', 'catch', 'merge', 'fluid'],
  5: ['flappy', 'bricks', '2048', 'clicktest', 'diff']
}

export const MOOD_GAME_THEMES = {
  1: { headline: 'Calm, release and comfort', blurb: 'Grounding breathing, worry release and gentle venting for a really tough day.' },
  2: { headline: 'Soothe and lift', blurb: 'Soft, creative and comforting games to ease a low mood.' },
  3: { headline: 'Refresh and refocus', blurb: 'Light focus games and quiet puzzles to clear a flat, foggy mind.' },
  4: { headline: 'Keep the good vibes', blurb: 'Playful, satisfying games to enjoy and extend a good mood.' },
  5: { headline: 'Channel the energy', blurb: 'Upbeat, energetic games to play while you feel great.' }
}

export const getGameById = id => byId[id]

export const getRecommendedGames = moodValue =>
  (MOOD_GAME_MAP[moodValue] || []).map(id => byId[id]).filter(Boolean)

// "Explore More Games": everything that is NOT in the current mood's top 5.
export const getExploreGames = moodValue => {
  const recommended = new Set(MOOD_GAME_MAP[moodValue] || [])
  return GAME_CATALOG.filter(game => !recommended.has(game.id))
}

// Small shape saved with the mood log (replaces the old backend list shape).
export const toSavedRecommendation = game => ({
  key: 'game',
  title: `${game.title} ${game.icon}`,
  icon: game.icon,
  desc: game.desc,
  subtype: game.launch.subtype || game.launch.key || game.launch.modal || game.id
})

// ---------------------------------------------------------------------------
// Offline/local data for puzzle games. Used when the backend response does not
// include fresh data for that game, so every Explore card always works.
// ---------------------------------------------------------------------------
const shuffle = arr => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
const pick = arr => arr[Math.floor(Math.random() * arr.length)]

const CHESS_PUZZLES = [
  { fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR b KQkq - 0 1', solution: ['c6d4', 'f3f7'], rating: 600, id: 'local_1' }
]

const SUDOKU_BOARDS = [
  {
    board: [
      [5, 3, 0, 0, 7, 0, 0, 0, 0], [6, 0, 0, 1, 9, 5, 0, 0, 0], [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3], [4, 0, 0, 8, 0, 3, 0, 0, 1], [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0], [0, 0, 0, 4, 1, 9, 0, 0, 5], [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ],
    solution: [
      [5, 3, 4, 6, 7, 8, 9, 1, 2], [6, 7, 2, 1, 9, 5, 3, 4, 8], [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3], [4, 2, 6, 8, 5, 3, 7, 9, 1], [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4], [2, 8, 7, 4, 1, 9, 6, 3, 5], [3, 4, 5, 2, 8, 6, 1, 7, 9]
    ]
  }
]

const SCRAMBLE_WORDS = ['serenity', 'harmony', 'gratitude', 'balance', 'tranquil', 'sunrise', 'breathe', 'kindness']
const QUOTES = [
  { text: 'Act as if what you do makes a difference. It does.', author: 'William James' },
  { text: 'You are allowed to be both a masterpiece and a work in progress.', author: 'Sophia Bush' },
  { text: 'Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.', author: 'Thich Nhat Hanh' },
  { text: 'Nothing can dim the light which shines from within.', author: 'Maya Angelou' }
]
const CALM_ACTIVITIES = [
  'Sip a warm cup of herbal tea 🍵',
  'Close your eyes and take 3 deep belly breaths 🧘',
  'Stretch your arms above your head for 10 seconds 🙆',
  'Sit completely still and focus on a distant sound 🕊️',
  'Write down one simple thing you appreciate about today ✍️'
]

const scrambleWord = word => {
  let out = word
  for (let i = 0; i < 6 && out === word; i++) out = shuffle(word.split('')).join('')
  return out
}

export const buildGameData = subtype => {
  switch (subtype) {
    case 'chess':
      return { ...pick(CHESS_PUZZLES) }
    case 'sudoku':
      return JSON.parse(JSON.stringify(pick(SUDOKU_BOARDS)))
    case 'crossword':
      return {
        clues: [
          { word: 'PEACE', clue: 'A state of tranquility or quiet.' },
          { word: 'CALM', clue: 'Free from agitation or excitement.' },
          { word: 'MINDFUL', clue: "Conscious or aware of one's surroundings." }
        ]
      }
    case 'scramble': {
      const original = pick(SCRAMBLE_WORDS)
      return { scrambled: scrambleWord(original), original }
    }
    case 'numbersequence': {
      const seq = pick([
        { seq: [2, 4, 8, 16], ans: 32, opts: [24, 30, 32, 64] },
        { seq: [5, 10, 15, 20], ans: 25, opts: [22, 25, 30, 35] },
        { seq: [1, 3, 6, 10], ans: 15, opts: [12, 14, 15, 18] }
      ])
      return { sequence: seq.seq, answer: seq.ans, options: shuffle(seq.opts) }
    }
    case 'logicpuzzle':
      return {
        question: 'I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?',
        answer: 'echo',
        options: shuffle(['echo', 'shadow', 'cloud', 'mirror'])
      }
    case 'speedmath': {
      const a = Math.floor(Math.random() * 80) + 15
      const b = Math.floor(Math.random() * 80) + 15
      const answer = a + b
      return { question: `${a} + ${b} = ?`, answer, options: shuffle([answer, answer + 4, answer - 3]) }
    }
    case 'visualmemory':
      return { sequence: Array.from({ length: 4 }, () => Math.floor(Math.random() * 4) + 1) }
    case 'patternmatch': {
      const shapes = ['🔺', '🟦', '🟡', '🟢']
      const s1 = pick(shapes)
      const s2 = pick(shapes)
      return {
        sequence: [s1, s2, s1, s2, '?'],
        answer: s1,
        options: shuffle([s1, s2, shapes.find(s => s !== s1 && s !== s2) || '🟡'])
      }
    }
    case 'nonogram':
      return {
        rowClues: [[1], [3], [5], [3], [1]],
        colClues: [[1], [3], [5], [3], [1]],
        grid: [[0, 0, 1, 0, 0], [0, 1, 1, 1, 0], [1, 1, 1, 1, 1], [0, 1, 1, 1, 0], [0, 0, 1, 0, 0]]
      }
    case 'kakuro':
      return { rowSums: [4, 6], colSums: [5, 5], solution: [[1, 3], [4, 2]] }
    case 'jigsaw':
      return { tiles: [2, 0, 3, 1], solution: [0, 1, 2, 3] }
    case 'shapesort':
      return {
        shapes: [
          { id: 1, name: 'Circle', color: '#f43f5e' },
          { id: 2, name: 'Square', color: '#3b82f6' },
          { id: 3, name: 'Triangle', color: '#10b981' }
        ]
      }
    case 'relaxmatch':
      return { cards: shuffle(['🌸', '🌸', '🪨', '🪨', '🍃', '🍃']) }
    case 'zenpuzzle':
      return { tiles: [1, 2, 0, 3], solution: [1, 2, 3, 0] }
    case 'emotionmatch':
      return { cards: shuffle(['😄 Great', '😄 Great', '😐 Okay', '😐 Okay', '😢 Terrible', '😢 Terrible']) }
    case 'positivequotes':
      return { ...pick(QUOTES) }
    case 'calmgenerator':
      return { activity: pick(CALM_ACTIVITIES) }
    default:
      return null
  }
}

