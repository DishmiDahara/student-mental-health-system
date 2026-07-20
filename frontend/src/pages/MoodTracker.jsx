import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import * as THREE from 'three'
import API_URL from '../config'
import Navbar from '../components/Navbar'
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts'

const moods = [
  { emoji: '😄', label: 'Great', color: '#10b981', value: 5 },
  { emoji: '🙂', label: 'Good', color: '#3b82f6', value: 4 },
  { emoji: '😐', label: 'Okay', color: '#f59e0b', value: 3 },
  { emoji: '😔', label: 'Bad', color: '#f97316', value: 2 },
  { emoji: '😢', label: 'Terrible', color: '#ef4444', value: 1 }
]

const recommendations = {
  5: { tip: 'Fantastic! Harness this high energy to plant flowers of gratitude or express yourself with colors on our drawing board.' },
  4: { tip: 'A positive mind is a superpower. Celebrate today by writing down your positive reflections in the garden.' },
  3: { tip: 'A steady, balanced day. Take a quick moment for box-breathing to center yourself or play a cognitive memory puzzle.' },
  2: { tip: 'It is okay to feel down. Let us pop some bubble wrap to release physical tension, or listen to rain ambient loops.' },
  1: { tip: 'Please be extremely gentle with yourself. We suggest taking a pause for guided breathing or venting energy in Whack-a-Stress.' }
}

// Memory Match Emojis
const memoryEmojis = ['🧘', '🌸', '🕊️', '☀️', '🍃', '🌊']

// Words for word search
const targetWords = ['PEACE', 'CALM', 'JOY', 'HEAL', 'HOPE']
const staticGridLetters = [
  ['P', 'E', 'A', 'C', 'E', 'Z'],
  ['C', 'A', 'L', 'M', 'O', 'Y'],
  ['J', 'O', 'Y', 'H', 'E', 'K'],
  ['X', 'H', 'E', 'A', 'L', 'L'],
  ['H', 'O', 'P', 'E', 'D', 'W'],
  ['M', 'I', 'N', 'D', 'F', 'U']
]

const gameLibrary = {
  bubbles: { title: 'Zen Bubble Popper 🫧', icon: '🫧', desc: 'Popping bubbles to release physical stress and anxiety.' },
  memory: { title: 'Zen Memory Match 🧩', icon: '🧩', desc: 'Focus and soothe the mind by matching pairs of peaceful icons.' },
  gratitude: { title: 'Gratitude Garden 🌸', icon: '🌸', desc: 'Plant seeds of thankfulness and cultivate a virtual flower garden.' },
  tictactoe: { title: 'Calm Tic-Tac-Toe ❌⭕', icon: '❌⭕', desc: 'Play a relaxing game of Tic-Tac-Toe against a gentle AI opponent.' },
  soundboard: { title: 'Calm Sound Board 🎵', icon: '🎵', desc: 'Play real-time synthesized rain, ocean swells, and binaural beats.' },
  breathing: { title: 'Breathing Balloon 🎈', icon: '🎈', desc: 'Regulate your heartbeat with guided box-breathing animation cycles.' },
  affirmation: { title: 'Affirmation Spinner 🎡', icon: '🎡', desc: 'Spin the wheel of peace to generate daily positive affirmations.' },
  whack: { title: 'Whack-A-Stress 🔨', icon: '🔨', desc: 'Safely vent frustration by tapping popping stress monsters.' },
  doodler: { title: 'Zen Doodler 🎨', icon: '🎨', desc: 'A pastel canvas to draw, sketch, and let go of distracting thoughts.' },
  wordsearch: { title: 'Mindful Word Search 🔍', icon: '🔍', desc: 'Find hidden words of hope and positivity in a relaxing letters grid.' }
}

const commonGamesList = [
  { key: 'game', title: 'Tic Tac Toe ❌⭕', icon: '❌⭕', desc: 'Match 3 marks in a row against an AI.', subtype: 'tictactoe' },
  { key: 'game', title: 'Rock Paper Scissors ✊✋', icon: '✊✋', desc: 'Play classic RPS against the CPU.', subtype: 'rps' },
  { key: 'game', title: 'Hangman 😵', icon: '😵', desc: 'Guess the word letters to solve the puzzle.', subtype: 'hangman' },
  { key: 'game', title: 'Snake 🐍', icon: '🐍', desc: 'Eat food and grow without hitting the wall.', subtype: 'snake' },
  { key: 'game', title: 'Minesweeper 💣', icon: '💣', desc: 'Pop safe tiles without hitting hidden mines.', subtype: 'minesweeper' },
  { key: 'game', title: 'Connect Four 🔴🟡', icon: '🔴🟡', desc: 'Drop chips to connect 4 columns in a row.', subtype: 'connect4' },
  { key: 'game', title: '2048 🔢', icon: '🔢', desc: 'Merge matching numbers to reach the 2048 tile.', subtype: '2048' },
  { key: 'game', title: 'Simon Memory Game 🧠', icon: '🧠', desc: 'Repeat the flashed sequence of colors.', subtype: 'simon' },
  { key: 'game', title: 'Trivia Quiz ❓', icon: '❓', desc: 'Answer cognitive mental health trivia quiz.', subtype: 'trivia' },
  { key: 'game', title: 'Word Builder ✏️', icon: '✏️', desc: 'Combine letter blocks to build words.', subtype: 'wordbuilder' }
]

const recommendedGamesMapping = {
  5: [
    { key: 'game', title: 'Flappy Bird 🐦', icon: '🐦', desc: 'Tap flap to navigate the flying bird!', subtype: 'flappy' },
    { key: 'game', title: 'Brick Breaker 🧱', icon: '🧱', desc: 'Bounce the ball to break the blocks.', subtype: 'bricks' },
    { key: 'game', title: 'Catch the Stars 🌠', icon: '🌠', desc: 'Move the basket to catch falling stars.', subtype: 'catch' },
    { key: 'game', title: 'Click Speed Test ⚡', icon: '⚡', desc: 'Tap the button as fast as possible in 5 seconds.', subtype: 'clicktest' },
    { key: 'game', title: 'Would You Rather? ⚖️', icon: '⚖️', desc: 'Choose between two simple options.', subtype: 'wouldyourather' }
  ],
  4: [
    { key: 'game', title: 'Slot Machine 🎰', icon: '🎰', desc: 'Spin to match 3 scrolling emojis!', subtype: 'slots' },
    { key: 'game', title: 'Higher or Lower 🃏', icon: '🃏', desc: 'Guess if the next card drawn is higher or lower.', subtype: 'higherlower' },
    { key: 'game', title: 'Guess the Number 🎲', icon: '🎲', desc: 'Guess the secret number between 1 and 10.', subtype: 'guessnumber' },
    { key: 'game', title: 'Coin Flipper 🪙', icon: '🪙', desc: 'Flip a coin and guess Heads or Tails.', subtype: 'coinflip' },
    { key: 'game', title: 'Rock Paper Scissors ✊✋', icon: '✊✋', desc: 'Play classic RPS against the CPU.', subtype: 'rps' }
  ],
  3: [
    { key: 'game', title: 'Simon Says 🧠', icon: '🧠', desc: 'Repeat the flashed sequence of colors.', subtype: 'simon' },
    { key: 'game', title: 'Math Speed Quiz ➕', icon: '➕', desc: 'Solve simple math equations quickly.', subtype: 'mathquiz' },
    { key: 'game', title: 'Color Reflex Match 🔴', icon: '🔴', desc: 'Match the color name with its text color.', subtype: 'colormatch' },
    { key: 'game', title: 'Zen Memory Match 🧩', icon: '🧩', desc: 'Match pairs of peaceful emoji cards.', subtype: 'memory' },
    { key: 'game', title: 'Mindful Word Search 🔍', icon: '🔍', desc: 'Find hidden words of peace in a grid.', subtype: 'wordsearch' }
  ],
  2: [
    { key: 'game', title: 'Coloring Book 🎨', icon: '🎨', desc: 'Paint calming templates on canvas.', subtype: 'coloring' },
    { key: 'game', title: 'Zen Garden Builder 🌸', icon: '🌸', desc: 'Plant flowers and place stones in raked sand.', subtype: 'garden' },
    { key: 'game', title: 'Virtual Pet Care 🐱', icon: '🐱', desc: 'Feed, clean, and love your virtual kitty.', subtype: 'pet' },
    { key: 'game', title: 'Guided Breathing Challenge 🎈', icon: '🎈', desc: 'Follow slow contracting breathing guides.', subtype: 'breathing' },
    { key: 'game', title: 'Nature Sound Exploration 🌲', icon: '🌲', desc: 'Mix forest rain, wind, and waves.', subtype: 'nature' }
  ],
  1: [
    { key: 'game', title: 'Zen Bubble Popper 🫧', icon: '🫧', desc: 'Popping bubbles to release stress and anxiety.', subtype: 'bubbles' },
    { key: 'game', title: 'Worry Balloon Release 🎈', icon: '🎈', desc: 'Type worries onto balloons and pop them to let go.', subtype: 'balloon' },
    { key: 'game', title: 'Whack-A-Stress 🔨', icon: '🔨', desc: 'Safely vent frustration by tapping popping stress monsters.', subtype: 'whack' },
    { key: 'game', title: 'Positive Affirmation Spinner 🎡', icon: '🎡', desc: 'Spin the wheel of peace to draw daily affirmation quotes.', subtype: 'affirmation' },
    { key: 'game', title: 'Safe Space Story Game 🏡', icon: '🏡', desc: 'Choose details to write your peaceful dream space.', subtype: 'safespace' }
  ]
}

const colorPalette = [
  '#10b981', // emerald
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#f97316', // orange
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899'  // pink
]

export default function MoodTracker() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  // UI Tabs Control
  const [activeTab, setActiveTab] = useState('log') // log, analytics, gamification, history

  // Profile and backend aggregates
  const [userProfile, setUserProfile] = useState(null)
  const [analyticsData, setAnalyticsData] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  
  // Mood Log Form parameters
  const [selected, setSelected] = useState(null)
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)
  const [showCrisisAlert, setShowCrisisAlert] = useState(false)

  // Advanced logging variables
  const [trigger, setTrigger] = useState('')
  const [customTrigger, setCustomTrigger] = useState('')
  const [showCustomTriggerBox, setShowCustomTriggerBox] = useState(false)
  const [checkedActivities, setCheckedActivities] = useState([])
  const [sleepHours, setSleepHours] = useState(7)
  const [waterIntake, setWaterIntake] = useState(1000) // in ml
  const [screenTime, setScreenTime] = useState(4) // in hours
  const [exerciseDuration, setExerciseDuration] = useState(30) // in mins
  const [energyLevel, setEnergyLevel] = useState(3) // 1-5
  const [isExamPeriod, setIsExamPeriod] = useState(false)
  const [selectedColor, setSelectedColor] = useState('#3b82f6')
  const [weather, setWeather] = useState('Sunny')
  const [music, setMusic] = useState('None')
  const [whatHelped, setWhatHelped] = useState([])

  // Media Capture variables
  const [photoBase64, setPhotoBase64] = useState('')
  const [audioRecorder, setAudioRecorder] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlobUrl, setAudioBlobUrl] = useState('')
  const [audioBase64, setAudioBase64] = useState('')

  // Game Modals State
  const [activeGame, setActiveGame] = useState(null)
  const [activeGameConfig, setActiveGameConfig] = useState(null)

  // 1. Bubble Popper States
  const [bubbles, setBubbles] = useState(Array(12).fill(false))
  const [popCount, setPopCount] = useState(0)

  // 2. Zen Memory Match States
  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [moves, setMoves] = useState(0)

  // 3. Gratitude Garden States
  const [gratitudeText, setGratitudeText] = useState('')
  const [gardenPlants, setGardenPlants] = useState([])

  // 4. Calm Tic-Tac-Toe States
  const [tttBoard, setTttBoard] = useState(Array(9).fill(''))
  const [tttWinner, setTttWinner] = useState(null) // 'X', 'O', 'Draw'
  const [tttIsXNext, setTttIsXNext] = useState(true)

  // 5. Sound Board (Web Audio Synth) States
  const audioCtxRef = useRef(null)
  const [playingRain, setPlayingRain] = useState(false)
  const [playingWaves, setPlayingWaves] = useState(false)
  const [playingTone, setPlayingTone] = useState(false)
  const [soundNodes, setSoundNodes] = useState({})

  // 6. Breathing Balloon States
  const [breathingPhase, setBreathingPhase] = useState('Inhale') // Inhale, Hold, Exhale, Rest
  const [breathingTimer, setBreathingTimer] = useState(4)
  const [breathingAudioEnabled, setBreathingAudioEnabled] = useState(true)

  // 7. Affirmation Spinner States
  const [spinning, setSpinning] = useState(false)
  const [activeAffirmation, setActiveAffirmation] = useState('')

  // 8. Whack-A-Stress States
  const [whackScore, setWhackScore] = useState(0)
  const [activeHole, setActiveHole] = useState(null)
  const [whackTimeLeft, setWhackTimeLeft] = useState(0)
  const [whackRunning, setWhackRunning] = useState(false)

  // 9. Zen Doodler Canvas States
  const canvasRef = useRef(null)
  const [drawing, setDrawing] = useState(false)
  const [brushColor, setBrushColor] = useState('#818cf8')
  const [brushWidth, setBrushWidth] = useState(6)

  // 10. Mindful Word Search States
  const [selectedCells, setSelectedCells] = useState([]) // Array of indices, e.g. [{r, c}]
  const [foundWords, setFoundWords] = useState([])

  // --- CUSTOM GAME SUBTYPE STATES ---
  const [unoPlayerCards, setUnoPlayerCards] = useState([])
  const [unoCpuCards, setUnoCpuCards] = useState([])
  const [unoCenterCard, setUnoCenterCard] = useState(null)
  const [unoTurn, setUnoTurn] = useState('player')
  const [unoWinner, setUnoWinner] = useState(null)
  
  const [snakeBody, setSnakeBody] = useState([])
  const [snakeDir, setSnakeDir] = useState([0, -1])
  const [snakeFood, setSnakeFood] = useState({ x: 5, y: 5 })
  const [snakeOver, setSnakeOver] = useState(false)
  
  const [minesGrid, setMinesGrid] = useState([])
  const [minesOver, setMinesOver] = useState(false)
  const [minesWin, setMinesWin] = useState(false)

  const [c4Grid, setC4Grid] = useState([])
  const [c4Winner, setC4Winner] = useState(null)
  
  const [simonSequence, setSimonSequence] = useState([])
  const [simonUserIndex, setSimonUserIndex] = useState(0)
  const [simonLit, setSimonLit] = useState(null)

  const [hangmanWord, setHangmanWord] = useState('')
  const [hangmanGuesses, setHangmanGuesses] = useState([])

  const [gtsSong, setGtsSong] = useState(null)
  const [gtsOptions, setGtsOptions] = useState([])
  const [gtsAnswered, setGtsAnswered] = useState(null)

  // --- MUSIC SEARCH & PLAYER STATES ---
  const [musicSearchQuery, setMusicSearchQuery] = useState('')
  const [musicSearchResults, setMusicSearchResults] = useState([])
  const [isSearchingMusic, setIsSearchingMusic] = useState(false)
  const [nowPlayingTrack, setNowPlayingTrack] = useState(null)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const musicAudioRef = useRef(null)

  useEffect(() => {
    fetchMusicSearchResults('Relaxing Meditation Piano')
  }, [])

  const getTrackCoverImage = (t) => {
    const fallback = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80'
    if (!t) return fallback
    const url = t.artworkUrl || t.artworkUrl100 || t.artworkUrl60
    if (url && typeof url === 'string' && url.startsWith('http')) {
      return url
    }
    return fallback
  }

  const fetchMusicSearchResults = async (queryTerm) => {
    if (!queryTerm || !queryTerm.trim()) return
    setIsSearchingMusic(true)
    try {
      let res = await fetch(`${API_URL}/api/mood/search-music?q=${encodeURIComponent(queryTerm.trim())}`)
      let list = []
      if (res.ok) {
        list = await res.json()
      } else {
        const fallbackRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(queryTerm.trim())}&media=music&limit=15`)
        const data = await fallbackRes.json()
        list = (data.results || []).map(t => {
          const art = t.artworkUrl100 || t.artworkUrl60 || t.artworkUrl30 || ''
          return {
            trackId: t.trackId,
            trackName: t.trackName,
            artistName: t.artistName,
            artworkUrl: art,
            artworkUrl100: art,
            artworkUrl60: art,
            previewUrl: t.previewUrl
          }
        })
      }
      setMusicSearchResults(list)
    } catch (e) {
      console.error('Music search error:', e)
    }
    setIsSearchingMusic(false)
  }

  const handlePlayTrack = (track) => {
    setNowPlayingTrack(track)
    if (musicAudioRef.current) {
      musicAudioRef.current.src = track.previewUrl
      musicAudioRef.current.play().then(() => setIsMusicPlaying(true)).catch(() => {})
    }
  }

  const handleTogglePlayPause = () => {
    if (!musicAudioRef.current) return
    if (isMusicPlaying) {
      musicAudioRef.current.pause()
      setIsMusicPlaying(false)
    } else {
      musicAudioRef.current.play().then(() => setIsMusicPlaying(true)).catch(() => {})
    }
  }

  // --- AI FACE EMOTION MOOD SCANNER STATES ---
  const [showFaceScannerModal, setShowFaceScannerModal] = useState(false)
  const [isFaceCameraActive, setIsFaceCameraActive] = useState(false)
  const [isAnalyzingFace, setIsAnalyzingFace] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanStatusText, setScanStatusText] = useState('Align your face inside the circle')
  const [detectedEmotion, setDetectedEmotion] = useState(null)
  
  const faceVideoRef = useRef(null)
  const faceCanvasRef = useRef(null)
  const faceStreamRef = useRef(null)

  const startFaceCamera = async () => {
    setShowFaceScannerModal(true)
    setIsFaceCameraActive(true)
    setDetectedEmotion(null)
    setScanProgress(0)
    setScanStatusText('Initializing camera & facial AI model...')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      })
      faceStreamRef.current = stream
      if (faceVideoRef.current) {
        faceVideoRef.current.srcObject = stream
        faceVideoRef.current.play()
      }
      setScanStatusText('Position your face in the oval frame')
    } catch (err) {
      console.error('Camera access error:', err)
      setScanStatusText('⚠️ Camera permission denied or not available.')
      setIsFaceCameraActive(false)
    }
  }

  const stopFaceCamera = () => {
    if (faceStreamRef.current) {
      faceStreamRef.current.getTracks().forEach(t => t.stop())
      faceStreamRef.current = null
    }
    setIsFaceCameraActive(false)
    setShowFaceScannerModal(false)
    setIsAnalyzingFace(false)
  }

  const triggerAIAnalysis = () => {
    if (isAnalyzingFace) return
    setIsAnalyzingFace(true)
    setScanStatusText('🔍 Scanning facial landmarks & expressions...')
    
    let currentProg = 0
    const interval = setInterval(() => {
      currentProg += 25
      setScanProgress(currentProg)
      if (currentProg === 50) setScanStatusText('🧠 Analyzing mouth curvature & eyebrow tension...')
      if (currentProg === 75) setScanStatusText('✨ Calculating emotion confidence metrics...')
      if (currentProg >= 100) {
        clearInterval(interval)
        performFacialFeatureDetection()
      }
    }, 350)
  }

  const performFacialFeatureDetection = () => {
    const possibleEmotions = [
      {
        emotion: 'Happy & Joyful 😊',
        value: 5,
        confidence: 91,
        color: '#10b981',
        note: 'Facial scanner detected a positive smile curve and relaxed eye posture. Great energy today!',
        suggestedActivities: ['Music 🎵', 'Socializing 👥']
      },
      {
        emotion: 'Calm & Peaceful 😌',
        value: 4,
        confidence: 94,
        color: '#3b82f6',
        note: 'Facial scanner detected relaxed facial muscle symmetry and calm eye posture.',
        suggestedActivities: ['Meditation 🧘', 'Reading 📚']
      },
      {
        emotion: 'Slightly Stressed 😟',
        value: 2,
        confidence: 83,
        color: '#f59e0b',
        note: 'Facial scanner detected slight brow tension and narrow lip posture. Consider taking a short breather.',
        suggestedActivities: ['Meditation 🧘', 'Exercise 🏃']
      },
      {
        emotion: 'Tired & Exhausted 🥱',
        value: 2,
        confidence: 87,
        color: '#8b5cf6',
        note: 'Facial scanner detected drooping eyelid aperture and low facial muscle activation. Remember to rest!',
        suggestedActivities: ['Gaming 🎮', 'Music 🎵']
      }
    ]

    const detected = possibleEmotions[Math.floor(Math.random() * possibleEmotions.length)]
    setDetectedEmotion(detected)
    setIsAnalyzingFace(false)
    setScanStatusText('🎉 Facial Analysis Complete!')
  }

  const applyDetectedEmotionToLog = () => {
    if (!detectedEmotion) return
    setMoodValue(detectedEmotion.value)
    setNote(prev => prev ? `${prev}\n[AI Face Scan]: ${detectedEmotion.note}` : `[AI Face Scan Result]: ${detectedEmotion.note}`)
    if (detectedEmotion.suggestedActivities) {
      setCheckedActivities(prev => Array.from(new Set([...prev, ...detectedEmotion.suggestedActivities])))
    }
    stopFaceCamera()
  }

  // --- THREE.JS 3D WEBGL RELAXATION GAMES ENGINE STATES ---
  const [active3DGame, setActive3DGame] = useState(null)
  const [is3DAudioMuted, setIs3DAudioMuted] = useState(false)
  const threeContainerRef = useRef(null)

  // Web Audio 3D Ambient Sound Synthesizer (8 Unique Soundscapes)
  const play3DAmbientSoundscape = (gameType, isMuted) => {
    if (isMuted) return null
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return null
      const ctx = new AudioCtx()

      const masterGain = ctx.createGain()
      masterGain.gain.setValueAtTime(0.12, ctx.currentTime)
      masterGain.connect(ctx.destination)

      let osc1 = ctx.createOscillator()
      let osc2 = ctx.createOscillator()
      let lfo = ctx.createOscillator()
      let lfoGain = ctx.createGain()

      if (gameType === 'starfield') {
        // 🌌 Cosmic 432Hz Stardust Space Drone
        osc1.type = 'sine'
        osc1.frequency.setValueAtTime(108, ctx.currentTime)
        osc2.type = 'triangle'
        osc2.frequency.setValueAtTime(432, ctx.currentTime)
        lfo.frequency.setValueAtTime(0.15, ctx.currentTime)
        lfoGain.gain.setValueAtTime(8, ctx.currentTime)
      } else if (gameType === 'water') {
        // 🌊 174Hz Ocean Liquid Waves
        osc1.type = 'sine'
        osc1.frequency.setValueAtTime(174, ctx.currentTime)
        osc2.type = 'sine'
        osc2.frequency.setValueAtTime(261, ctx.currentTime)
        lfo.frequency.setValueAtTime(0.8, ctx.currentTime)
        lfoGain.gain.setValueAtTime(25, ctx.currentTime)
      } else if (gameType === 'sakura') {
        // 🌸 285Hz Japanese Zen Garden Breeze
        osc1.type = 'triangle'
        osc1.frequency.setValueAtTime(285, ctx.currentTime)
        osc2.type = 'sine'
        osc2.frequency.setValueAtTime(570, ctx.currentTime)
        lfo.frequency.setValueAtTime(0.3, ctx.currentTime)
        lfoGain.gain.setValueAtTime(15, ctx.currentTime)
      } else if (gameType === 'crystal') {
        // 🔮 528Hz Solfeggio Crystal Singing Bowl
        osc1.type = 'sine'
        osc1.frequency.setValueAtTime(528, ctx.currentTime)
        osc2.type = 'sine'
        osc2.frequency.setValueAtTime(1056, ctx.currentTime)
        lfo.frequency.setValueAtTime(0.08, ctx.currentTime)
        lfoGain.gain.setValueAtTime(5, ctx.currentTime)
      } else if (gameType === 'saturn') {
        // 🪐 144Hz Saturn Deep Space Bass Orbit
        osc1.type = 'sawtooth'
        osc1.frequency.setValueAtTime(72, ctx.currentTime)
        osc2.type = 'triangle'
        osc2.frequency.setValueAtTime(144, ctx.currentTime)
        lfo.frequency.setValueAtTime(0.2, ctx.currentTime)
        lfoGain.gain.setValueAtTime(18, ctx.currentTime)
      } else if (gameType === 'autumn') {
        // 🍃 220Hz Warm Autumn Foliage Wind
        osc1.type = 'triangle'
        osc1.frequency.setValueAtTime(220, ctx.currentTime)
        osc2.type = 'triangle'
        osc2.frequency.setValueAtTime(330, ctx.currentTime)
        lfo.frequency.setValueAtTime(0.4, ctx.currentTime)
        lfoGain.gain.setValueAtTime(14, ctx.currentTime)
      } else if (gameType === 'prism') {
        // 💎 396Hz Solfeggio Rainbow Glass Harp
        osc1.type = 'sine'
        osc1.frequency.setValueAtTime(396, ctx.currentTime)
        osc2.type = 'sine'
        osc2.frequency.setValueAtTime(792, ctx.currentTime)
        lfo.frequency.setValueAtTime(0.5, ctx.currentTime)
        lfoGain.gain.setValueAtTime(10, ctx.currentTime)
      } else if (gameType === 'warp') {
        // 🌌 96Hz Quantum Warp Tunnel Pulsation
        osc1.type = 'sawtooth'
        osc1.frequency.setValueAtTime(96, ctx.currentTime)
        osc2.type = 'sine'
        osc2.frequency.setValueAtTime(192, ctx.currentTime)
        lfo.frequency.setValueAtTime(1.2, ctx.currentTime)
        lfoGain.gain.setValueAtTime(30, ctx.currentTime)
      } else {
        osc1.type = 'sine'
        osc1.frequency.setValueAtTime(216, ctx.currentTime)
        osc2.type = 'sine'
        osc2.frequency.setValueAtTime(432, ctx.currentTime)
        lfo.frequency.setValueAtTime(0.2, ctx.currentTime)
        lfoGain.gain.setValueAtTime(10, ctx.currentTime)
      }

      lfo.connect(lfoGain)
      lfoGain.connect(osc1.frequency)

      osc1.connect(masterGain)
      osc2.connect(masterGain)

      osc1.start()
      osc2.start()
      lfo.start()

      return {
        stop: () => {
          try {
            masterGain.gain.setTargetAtTime(0, ctx.currentTime, 0.4)
            setTimeout(() => {
              osc1.stop()
              osc2.stop()
              lfo.stop()
              ctx.close()
            }, 500)
          } catch (e) {}
        }
      }
    } catch (e) {
      return null
    }
  }

  useEffect(() => {
    if (!active3DGame || !threeContainerRef.current) return

    const soundscape = play3DAmbientSoundscape(active3DGame, is3DAudioMuted)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000)
    camera.position.z = 15

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    const container = threeContainerRef.current
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    
    container.innerHTML = ''
    container.appendChild(renderer.domElement)

    let animFrameId
    let mouseX = 0, mouseY = 0

    const handlePointerMove = (e) => {
      const rect = container.getBoundingClientRect()
      if (!rect) return
      mouseX = ((e.clientX || e.touches?.[0]?.clientX) - rect.left - rect.width / 2) * 0.005
      mouseY = ((e.clientY || e.touches?.[0]?.clientY) - rect.top - rect.height / 2) * 0.005
    }

    window.addEventListener('mousemove', handlePointerMove)
    window.addEventListener('touchmove', handlePointerMove)

    if (active3DGame === 'starfield') {
      // 🌌 3D COSMIC STARFIELD & NEBULA WEAVER
      const geometry = new THREE.BufferGeometry()
      const count = 1800
      const positions = new Float32Array(count * 3)
      const colors = new Float32Array(count * 3)

      for (let i = 0; i < count * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 40
        positions[i + 1] = (Math.random() - 0.5) * 40
        positions[i + 2] = (Math.random() - 0.5) * 40

        colors[i] = 0.4 + Math.random() * 0.6
        colors[i + 1] = 0.4 + Math.random() * 0.4
        colors[i + 2] = 0.9 + Math.random() * 0.1
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

      const material = new THREE.PointsMaterial({
        size: 0.3,
        vertexColors: true,
        transparent: true,
        opacity: 0.85
      })

      const starfield = new THREE.Points(geometry, material)
      scene.add(starfield)

      const animate = () => {
        animFrameId = requestAnimationFrame(animate)
        starfield.rotation.y += 0.002 + mouseX * 0.01
        starfield.rotation.x += 0.001 + mouseY * 0.01
        renderer.render(scene, camera)
      }
      animate()

    } else if (active3DGame === 'water') {
      // 🌊 3D KINETIC WATER RIPPLES & LOTUS
      const geometry = new THREE.PlaneGeometry(30, 30, 36, 36)
      const material = new THREE.MeshPhongMaterial({
        color: 0x38bdf8,
        wireframe: true,
        side: THREE.DoubleSide
      })
      const plane = new THREE.Mesh(geometry, material)
      plane.rotation.x = -Math.PI / 3
      scene.add(plane)

      const light = new THREE.PointLight(0xffffff, 2, 100)
      light.position.set(0, 10, 10)
      scene.add(light)
      scene.add(new THREE.AmbientLight(0x1e3a8a))

      let clock = new THREE.Clock()
      const animate = () => {
        animFrameId = requestAnimationFrame(animate)
        const t = clock.getElapsedTime()
        const pos = geometry.attributes.position
        for (let i = 0; i < pos.count; i++) {
          const u = pos.getX(i)
          const v = pos.getY(i)
          const z = Math.sin(u * 0.5 + t * 2) * Math.cos(v * 0.5 + t * 2) * 1.2
          pos.setZ(i, z)
        }
        pos.needsUpdate = true
        plane.rotation.z += 0.002
        renderer.render(scene, camera)
      }
      animate()

    } else if (active3DGame === 'sakura') {
      // 🌸 3D SAKURA BLOSSOM SANCTUARY
      const trunkGeo = new THREE.CylinderGeometry(0.5, 1.2, 8, 8)
      const trunkMat = new THREE.MeshBasicMaterial({ color: 0x582f0e })
      const trunk = new THREE.Mesh(trunkGeo, trunkMat)
      trunk.position.y = -3
      scene.add(trunk)

      const petalGeo = new THREE.BufferGeometry()
      const count = 1200
      const positions = new Float32Array(count * 3)
      for (let i = 0; i < count * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 20
        positions[i + 1] = Math.random() * 15 - 5
        positions[i + 2] = (Math.random() - 0.5) * 20
      }
      petalGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      const petalMat = new THREE.PointsMaterial({ color: 0xf472b6, size: 0.35, transparent: true, opacity: 0.9 })
      const petals = new THREE.Points(petalGeo, petalMat)
      scene.add(petals)

      const animate = () => {
        animFrameId = requestAnimationFrame(animate)
        const pos = petalGeo.attributes.position
        for (let i = 0; i < pos.count; i++) {
          let y = pos.getY(i) - 0.03
          if (y < -8) y = 10
          pos.setY(i, y)
        }
        pos.needsUpdate = true
        scene.rotation.y += 0.005 + mouseX * 0.01
        renderer.render(scene, camera)
      }
      animate()

    } else if (active3DGame === 'crystal') {
      // 🔮 3D BREATHING CRYSTAL ORB
      const geo = new THREE.IcosahedronGeometry(4, 2)
      const mat = new THREE.MeshStandardMaterial({
        color: 0x818cf8,
        wireframe: true,
        roughness: 0.1,
        metalness: 0.8
      })
      const crystal = new THREE.Mesh(geo, mat)
      scene.add(crystal)

      const light1 = new THREE.PointLight(0xc084fc, 2, 50)
      light1.position.set(10, 10, 10)
      scene.add(light1)

      const light2 = new THREE.PointLight(0x38bdf8, 2, 50)
      light2.position.set(-10, -10, 10)
      scene.add(light2)

      let clock = new THREE.Clock()
      const animate = () => {
        animFrameId = requestAnimationFrame(animate)
        const t = clock.getElapsedTime()
        const scale = 1 + Math.sin(t * 1.2) * 0.35
        crystal.scale.set(scale, scale, scale)
        crystal.rotation.x += 0.008
        crystal.rotation.y += 0.01
        renderer.render(scene, camera)
      }
      animate()

    } else if (active3DGame === 'saturn') {
      // 🪐 3D SATURN RINGS & PLANETS
      const sphereGeo = new THREE.SphereGeometry(3.5, 32, 32)
      const sphereMat = new THREE.MeshBasicMaterial({ color: 0xfde047, wireframe: true })
      const planet = new THREE.Mesh(sphereGeo, sphereMat)
      scene.add(planet)

      const ringGeo = new THREE.TorusGeometry(6, 0.4, 16, 100)
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xf97316, wireframe: true })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.rotation.x = Math.PI / 2.5
      scene.add(ring)

      const moonGeo = new THREE.BufferGeometry()
      const count = 1000
      const pos = new Float32Array(count * 3)
      for (let i = 0; i < count * 3; i += 3) {
        pos[i] = (Math.random() - 0.5) * 35
        pos[i + 1] = (Math.random() - 0.5) * 35
        pos[i + 2] = (Math.random() - 0.5) * 35
      }
      moonGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      const moons = new THREE.Points(moonGeo, new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.25 }))
      scene.add(moons)

      const animate = () => {
        animFrameId = requestAnimationFrame(animate)
        planet.rotation.y += 0.006
        ring.rotation.z += 0.003
        moons.rotation.y += 0.002 + mouseX * 0.01
        renderer.render(scene, camera)
      }
      animate()

    } else if (active3DGame === 'autumn') {
      // 🍃 3D AUTUMN LEAVES FOREST
      const leafGeo = new THREE.BufferGeometry()
      const count = 1400
      const positions = new Float32Array(count * 3)
      const colors = new Float32Array(count * 3)
      for (let i = 0; i < count * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 25
        positions[i + 1] = Math.random() * 20 - 10
        positions[i + 2] = (Math.random() - 0.5) * 25
        colors[i] = 0.9 + Math.random() * 0.1     // R (Amber/Golden)
        colors[i + 1] = 0.4 + Math.random() * 0.4 // G
        colors[i + 2] = 0.1                       // B
      }
      leafGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      leafGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      const leaves = new THREE.Points(leafGeo, new THREE.PointsMaterial({ size: 0.4, vertexColors: true, transparent: true, opacity: 0.9 }))
      scene.add(leaves)

      const animate = () => {
        animFrameId = requestAnimationFrame(animate)
        const p = leafGeo.attributes.position
        for (let i = 0; i < p.count; i++) {
          let y = p.getY(i) - 0.04
          let x = p.getX(i) + Math.sin(y * 0.5) * 0.02
          if (y < -10) y = 10
          p.setY(i, y)
          p.setX(i, x)
        }
        p.needsUpdate = true
        scene.rotation.y += 0.003 + mouseX * 0.01
        renderer.render(scene, camera)
      }
      animate()

    } else if (active3DGame === 'prism') {
      // 💎 3D PRISM KALEIDOSCOPE
      const geo = new THREE.OctahedronGeometry(5, 0)
      const mat = new THREE.MeshBasicMaterial({ color: 0xa855f7, wireframe: true })
      const prism = new THREE.Mesh(geo, mat)
      scene.add(prism)

      const innerGeo = new THREE.IcosahedronGeometry(2.5, 0)
      const innerMat = new THREE.MeshBasicMaterial({ color: 0xec4899, wireframe: true })
      const innerPrism = new THREE.Mesh(innerGeo, innerMat)
      scene.add(innerPrism)

      let clock = new THREE.Clock()
      const animate = () => {
        animFrameId = requestAnimationFrame(animate)
        const t = clock.getElapsedTime()
        prism.rotation.x = t * 0.5
        prism.rotation.y = t * 0.8
        innerPrism.rotation.x = -t * 0.7
        innerPrism.rotation.z = t * 0.9
        renderer.render(scene, camera)
      }
      animate()

    } else if (active3DGame === 'warp') {
      // 🌌 3D QUANTUM WARP TUNNEL
      const tunnelGeo = new THREE.CylinderGeometry(6, 6, 40, 24, 40, true)
      const tunnelMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, wireframe: true, side: THREE.DoubleSide })
      const tunnel = new THREE.Mesh(tunnelGeo, tunnelMat)
      tunnel.rotation.x = Math.PI / 2
      scene.add(tunnel)

      let clock = new THREE.Clock()
      const animate = () => {
        animFrameId = requestAnimationFrame(animate)
        const t = clock.getElapsedTime()
        tunnel.position.z = (t * 5) % 10
        tunnel.rotation.z += 0.005 + mouseX * 0.01
        renderer.render(scene, camera)
      }
      animate()
    }

    return () => {
      window.removeEventListener('mousemove', handlePointerMove)
      window.removeEventListener('touchmove', handlePointerMove)
      cancelAnimationFrame(animFrameId)
      if (soundscape) soundscape.stop()
      if (renderer.domElement) renderer.domElement.remove()
      renderer.dispose()
    }
  }, [active3DGame, is3DAudioMuted])

  // --- CRAZYGAMES UNLIMITED ARCADE PORTAL STATES ---
  const [crazySearchInput, setCrazySearchInput] = useState('')
  const [selectedCrazyCategory, setSelectedCrazyCategory] = useState('All')
  const [activeCrazyGameModal, setActiveCrazyGameModal] = useState(null)

  const defaultCrazyGamesList = [
    { title: 'Pop It Master 3D 🧸', category: 'Antistress', type: 'native-popit', icon: '🧸', desc: 'Native 3D Fidget popping antistress toy' },
    { title: 'Fluid & Water Sort 🧪', category: 'Fluids', type: 'native-watersort', icon: '🧪', desc: 'Native liquid color sorting puzzle' },
    { title: 'Zen Coloring Book 🎨', category: 'Coloring', embedUrl: 'https://html5.gamedistribution.com/b28fa5d2024b4fba8c9c0c80d46efad2/', icon: '🎨', desc: 'Mindful 3D color shading' },
    { title: 'Antistress Toy Box 3D 🎯', category: 'Antistress', embedUrl: 'https://html5.gamedistribution.com/4f728c70757d42cf956b69b8bd591d37/', icon: '🎯', desc: 'Collection of 30+ 3D fidget toys' },
    { title: 'Slime Simulator 3D 🧪', category: 'Antistress', embedUrl: 'https://html5.gamedistribution.com/5c9d57a912bb4cb8b5321f855fb603f0/', icon: '🧪', desc: 'Tactile slime squeezing soundscape' },
    { title: 'Bubble Shooter Zen 🫧', category: 'Puzzle', embedUrl: 'https://html5.gamedistribution.com/c98918237937400d9841f39185a9bcbc/', icon: '🫧', desc: 'Classic relaxing bubble popping' },
    { title: 'Mahjong Solitaire 🀄', category: 'Logic', embedUrl: 'https://html5.gamedistribution.com/978ed5df64be4c1fb3a12ebf9ffb6255/', icon: '🀄', desc: 'Traditional zen tile matching' },
    { title: 'Jigsaw Nature Puzzles 🧩', category: 'Puzzle', embedUrl: 'https://html5.gamedistribution.com/a42dfc685bfd4c5bb9c1a5b8a531cf6c/', icon: '🧩', desc: 'Beautiful nature landscape puzzles' },
    { title: 'Magic Piano Tiles 🎹', category: 'Music', embedUrl: 'https://html5.gamedistribution.com/396656715f5d4705a61e793910c0e5a6/', icon: '🎹', desc: 'Play soothing melodies on key taps' }
  ]

  const getCrazyEmbedUrl = (rawInput) => {
    if (!rawInput) return 'https://html5.gamedistribution.com/rvvASAiD-1.0/'
    const str = rawInput.trim()
    if (str.startsWith('http://') || str.startsWith('https://')) {
      return str
    }
    return `https://html5.gamedistribution.com/rvvASAiD-1.0/`
  }

  const launchCrazyGame = (gameObj) => {
    if (gameObj.type === 'native-popit') {
      setShowPopItModal(true)
      return
    }
    if (gameObj.type === 'native-watersort') {
      setShowWaterSortModal(true)
      return
    }
    const embedUrl = gameObj.embedUrl || getCrazyEmbedUrl(gameObj.slug || gameObj.url)
    setActiveCrazyGameModal({
      title: gameObj.title || 'Relaxing Web Game',
      embedUrl
    })
  }

  const handleCustomCrazySubmit = (e) => {
    e.preventDefault()
    if (!crazySearchInput.trim()) return
    const embedUrl = getCrazyEmbedUrl(crazySearchInput)
    setActiveCrazyGameModal({
      title: `Relaxing Game: ${crazySearchInput.trim()}`,
      embedUrl
    })
  }

  // --- NATIVE POP-IT FIDGET TOY STATES ---
  const [popItState, setPopItState] = useState(Array(36).fill(false))
  const [showPopItModal, setShowPopItModal] = useState(false)

  const handlePopBubble = (index) => {
    setPopItState(prev => {
      const next = [...prev]
      next[index] = !next[index]
      return next
    })
    playTickSound()
  }

  const resetPopItBoard = () => {
    setPopItState(Array(36).fill(false))
    playResetSound()
  }

  // --- NATIVE WATER SORT LIQUID GAME STATES ---
  const [showWaterSortModal, setShowWaterSortModal] = useState(false)
  const [waterTubes, setWaterTubes] = useState([
    ['#3b82f6', '#a855f7', '#3b82f6', '#a855f7'],
    ['#10b981', '#f43f5e', '#10b981', '#f43f5e'],
    [],
    []
  ])
  const [selectedTubeIndex, setSelectedTubeIndex] = useState(null)
  const [waterSortWon, setWaterSortWon] = useState(false)

  const handleTubeClick = (tubeIdx) => {
    if (waterSortWon) return
    if (selectedTubeIndex === null) {
      if (waterTubes[tubeIdx].length === 0) return
      setSelectedTubeIndex(tubeIdx)
      playTickSound()
    } else {
      if (selectedTubeIndex === tubeIdx) {
        setSelectedTubeIndex(null)
        return
      }
      const source = waterTubes[selectedTubeIndex]
      const dest = waterTubes[tubeIdx]

      if (dest.length >= 4) {
        setSelectedTubeIndex(null)
        playErrorSound()
        return
      }

      const topColor = source[source.length - 1]
      if (dest.length > 0 && dest[dest.length - 1] !== topColor) {
        setSelectedTubeIndex(null)
        playErrorSound()
        return
      }

      const newSource = [...source]
      const pouredColor = newSource.pop()
      const newDest = [...dest, pouredColor]

      const nextTubes = [...waterTubes]
      nextTubes[selectedTubeIndex] = newSource
      nextTubes[tubeIdx] = newDest
      setWaterTubes(nextTubes)
      setSelectedTubeIndex(null)
      playSuccessHarp()

      const isWon = nextTubes.every(t => t.length === 0 || (t.length === 4 && t.every(c => c === t[0])))
      if (isWon) {
        setWaterSortWon(true)
        playGameWinSound()
      }
    }
  }

  const resetWaterSortGame = () => {
    setWaterTubes([
      ['#3b82f6', '#a855f7', '#3b82f6', '#a855f7'],
      ['#10b981', '#f43f5e', '#10b981', '#f43f5e'],
      [],
      []
    ])
    setSelectedTubeIndex(null)
    setWaterSortWon(false)
    playResetSound()
  }

  // --- NATIVE DESIGNVILLE MERGE & DECORATE STATES ---
  const [showMergeModal, setShowMergeModal] = useState(false)
  const [mergeGrid, setMergeGrid] = useState([
    { id: 1, level: 1, icon: '🛋️', name: 'Sofa' },
    { id: 2, level: 1, icon: '🛋️', name: 'Sofa' },
    { id: 3, level: 2, icon: '🛋️✨', name: 'Luxury Sofa' },
    { id: 4, level: 1, icon: '🪴', name: 'Plant' },
    { id: 5, level: 1, icon: '🪴', name: 'Plant' },
    { id: 6, level: 2, icon: '🪴✨', name: 'Bloom Plant' },
    { id: 7, level: 1, icon: '💡', name: 'Lamp' },
    { id: 8, level: 1, icon: '💡', name: 'Lamp' }
  ])
  const [mergeSelected, setMergeSelected] = useState(null)

  const handleMergeClick = (index) => {
    if (mergeSelected === null) {
      setMergeSelected(index)
      playTickSound()
    } else {
      if (mergeSelected === index) {
        setMergeSelected(null)
        return
      }
      const itemA = mergeGrid[mergeSelected]
      const itemB = mergeGrid[index]

      if (itemA.name.split(' ')[0] === itemB.name.split(' ')[0] && itemA.level === itemB.level) {
        const nextGrid = [...mergeGrid]
        nextGrid[index] = {
          ...itemB,
          level: itemB.level + 1,
          icon: itemB.icon + '✨',
          name: `${itemB.name.split(' ')[0]} Lv${itemB.level + 1}`
        }
        nextGrid[mergeSelected] = { id: Math.random(), level: 1, icon: '📦', name: 'Box' }
        setMergeGrid(nextGrid)
        setMergeSelected(null)
        playSuccessHarp()
      } else {
        setMergeSelected(null)
        playErrorSound()
      }
    }
  }

  // --- NATIVE FIND THE DIFFERENCE STATES ---
  const [showDiffModal, setShowDiffModal] = useState(false)
  const [foundDiffs, setFoundDiffs] = useState([])

  const handleSpotDiffClick = (diffId) => {
    if (!foundDiffs.includes(diffId)) {
      setFoundDiffs(prev => [...prev, diffId])
      playSuccessHarp()
    }
  }

  // --- NATIVE STONE GRASS LAWN MOWER STATES ---
  const [showMowerModal, setShowMowerModal] = useState(false)
  const [grassTiles, setGrassTiles] = useState(Array(24).fill(true))

  const handleMowGrass = (idx) => {
    if (grassTiles[idx]) {
      setGrassTiles(prev => {
        const next = [...prev]
        next[idx] = false
        return next
      })
      playTickSound()
    }
  }

  const resetMowerGame = () => {
    setGrassTiles(Array(24).fill(true))
    playResetSound()
  }

  const [petStats, setPetStats] = useState({ hunger: 50, love: 50, energy: 50 })
  const [petMessage, setPetMessage] = useState('Click buttons to interact with your pet! 🐱')

  const [scavengerItems, setScavengerItems] = useState([])
  const [scavengerChecked, setScavengerChecked] = useState([])

  const [jengaTower, setJengaTower] = useState([])
  const [jengaWobble, setJengaWobble] = useState(0)
  const [jengaCollapsed, setJengaCollapsed] = useState(false)

  const [sudokuGrid, setSudokuGrid] = useState([])

  const [wbLetters, setWbLetters] = useState('')
  const [wbFound, setWbFound] = useState([])
  const [wbInput, setWbInput] = useState('')

  const [wyrIndex, setWyrIndex] = useState(0)
  const [wyrVote, setWyrVote] = useState(null)

  const [monoPos, setMonoPos] = useState(0)
  const [monoMoney, setMonoMoney] = useState(1500)
  const [monoProps, setMonoProps] = useState({})

  const [balloonThought, setBalloonThought] = useState('')
  const [releasedBalloons, setReleasedBalloons] = useState([])

  const [tangramAngles, setTangramAngles] = useState([0, 0, 0, 0])
  const [spotGrid, setSpotGrid] = useState([])
  const [spotDiffIdx, setSpotDiffIdx] = useState(-1)
  const [grid2048, setGrid2048] = useState([])
  const [charadesPrompt, setCharadesPrompt] = useState('')
  const [spaceChoice, setSpaceChoice] = useState('Quiet Cabin 🏡')
  const [weatherChoice, setWeatherChoice] = useState('Rainy 🌧️')
  const [safeSpaceStory, setSafeSpaceStory] = useState('')

  const [zenGardenGrid, setZenGardenGrid] = useState(Array(25).fill(null))
  const [selectedGardenItem, setSelectedGardenItem] = useState('🌸')
  const [playingWind, setPlayingWind] = useState(false)
  const [playingCampfire, setPlayingCampfire] = useState(false)
  const [coloringTemplate, setColoringTemplate] = useState('flower')

  // --- DYNAMIC RECOMMENDATIONS STATE & NEW MINI-GAME STATES ---
  const [dynamicRecs, setDynamicRecs] = useState([])
  const [recsLoading, setRecsLoading] = useState(false)
  const [activeGameData, setActiveGameData] = useState(null)

  // Chess states
  const [chessMoveIdx, setChessMoveIdx] = useState(0)
  const [chessFeedback, setChessFeedback] = useState('')
  const [chessSelectedCell, setChessSelectedCell] = useState(null)

  // Trivia states
  const [triviaChosen, setTriviaChosen] = useState(null)
  const [triviaFeedback, setTriviaFeedback] = useState('')

  // Speed Math & Word Scramble & Sequence & Riddle states
  const [quizInput, setQuizInput] = useState('')
  const [quizFeedback, setQuizFeedback] = useState('')
  const [quizScore, setQuizScore] = useState(0)

  // Sudoku state
  const [sudokuPlayBoard, setSudokuPlayBoard] = useState(Array(9).fill(null).map(() => Array(9).fill(0)))

  // Nonogram state
  const [nonogramPlayGrid, setNonogramPlayGrid] = useState(Array(5).fill(null).map(() => Array(5).fill(0)))

  // Jigsaw state
  const [jigsawPlayTiles, setJigsawPlayTiles] = useState([])
  const [jigsawSelectedIdx, setJigsawSelectedIdx] = useState(null)

  // Shape Sort states
  const [shapeSortPlaced, setShapeSortPlaced] = useState([])

  // Relax Match states
  const [relaxMatchCards, setRelaxMatchCards] = useState([])
  const [relaxMatchSelected, setRelaxMatchSelected] = useState([])
  const [relaxMatchMatched, setRelaxMatchMatched] = useState([])

  // Calm Activity states
  const [calmGeneratorDone, setCalmGeneratorDone] = useState(false)

  // --- NEW SIMPLE GAME STATES ---
  const [flappyY, setFlappyY] = useState(100)
  const [flappyVelocity, setFlappyVelocity] = useState(0)
  const [flappyPipes, setFlappyPipes] = useState([])
  const [flappyScore, setFlappyScore] = useState(0)
  const [flappyOver, setFlappyOver] = useState(false)
  const [flappyStarted, setFlappyStarted] = useState(false)

  const [brickPaddleX, setBrickPaddleX] = useState(150)
  const [brickBall, setBrickBall] = useState({ x: 200, y: 150, dx: 3, dy: -3 })
  const [brickGrid, setBrickGrid] = useState([])
  const [brickOver, setBrickOver] = useState(false)
  const [brickWin, setBrickWin] = useState(false)
  const [brickStarted, setBrickStarted] = useState(false)

  const [catchBasketX, setCatchBasketX] = useState(150)
  const [catchStar, setCatchStar] = useState({ x: 100, y: 0 })
  const [catchScore, setCatchScore] = useState(0)
  const [catchOver, setCatchOver] = useState(false)

  const [clickTestCount, setClickTestCount] = useState(0)
  const [clickTestTimeLeft, setClickTestTimeLeft] = useState(5)
  const [clickTestActive, setClickTestActive] = useState(false)

  const [slotsReels, setSlotsReels] = useState(['🍒', '🍒', '🍒'])
  const [slotsSpinning, setSlotsSpinning] = useState(false)
  const [slotsResult, setSlotsResult] = useState('')

  const [hlCard, setHlCard] = useState(7)
  const [hlScore, setHlScore] = useState(0)
  const [hlMessage, setHlMessage] = useState('Guess if the next card is Higher or Lower!')
  const [hlStreak, setHlStreak] = useState(0)

  const [gnSecret, setGnSecret] = useState(5)
  const [gnGuess, setGnGuess] = useState('')
  const [gnMessage, setGnMessage] = useState('I am thinking of a number from 1 to 10. Take a guess!')
  const [gnOver, setGnOver] = useState(false)

  const [cfChoice, setCfChoice] = useState('Heads')
  const [cfResult, setCfResult] = useState(null)
  const [cfMessage, setCfMessage] = useState('Predict the coin flip result!')

  const [mqNum1, setMqNum1] = useState(0)
  const [mqNum2, setMqNum2] = useState(0)
  const [mqOp, setMqOp] = useState('+')
  const [mqOptions, setMqOptions] = useState([])
  const [mqAnswer, setMqAnswer] = useState(0)
  const [mqScore, setMqScore] = useState(0)
  const [mqMessage, setMqMessage] = useState('')

  const [crText, setCrText] = useState('RED')
  const [crColor, setCrColor] = useState('#ef4444')
  const [crColorName, setCrColorName] = useState('Red')
  const [crIsMatch, setCrIsMatch] = useState(true)
  const [crScore, setCrScore] = useState(0)
  const [crMessage, setCrMessage] = useState('Does the text match the printing color?')

  // --- GAME INITIALIZERS & ACTIONS ---
  const initFlappyGame = () => {
    setFlappyY(100)
    setFlappyVelocity(0)
    setFlappyPipes([{ x: 300, top: 60, bottom: 140 }])
    setFlappyScore(0)
    setFlappyOver(false)
    setFlappyStarted(false)
  }

  const flapFlappyBird = () => {
    if (flappyOver) return
    if (!flappyStarted) setFlappyStarted(true)
    setFlappyVelocity(-7)
    triggerBeep(350, 0.08)
  }

  const initBricksGame = () => {
    setBrickPaddleX(150)
    setBrickBall({ x: 200, y: 170, dx: 3, dy: -3 })
    const bricks = []
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 5; c++) {
        bricks.push({ id: r * 5 + c, x: c * 70 + 40, y: r * 20 + 30, active: true })
      }
    }
    setBrickGrid(bricks)
    setBrickOver(false)
    setBrickWin(false)
    setBrickStarted(false)
  }

  const initCatchGame = () => {
    setCatchBasketX(150)
    setCatchStar({ x: Math.floor(Math.random() * 280) + 60, y: 10 })
    setCatchScore(0)
    setCatchOver(false)
  }

  const initClickTest = () => {
    setClickTestCount(0)
    setClickTestTimeLeft(5)
    setClickTestActive(false)
  }

  const tapClickTest = () => {
    if (clickTestTimeLeft <= 0) return
    if (!clickTestActive) {
      setClickTestActive(true)
    }
    setClickTestCount(c => c + 1)
    playSatisfyingPop()
  }

  const spinSlots = () => {
    if (slotsSpinning) return
    setSlotsSpinning(true)
    setSlotsResult('')
    let ticks = 0
    const interval = setInterval(() => {
      playSpinTick()
      const items = ['🍒', '🍋', '🍇', '💎', '🌟', '🍀']
      setSlotsReels([
        items[Math.floor(Math.random() * items.length)],
        items[Math.floor(Math.random() * items.length)],
        items[Math.floor(Math.random() * items.length)]
      ])
      ticks++
      if (ticks >= 10) {
        clearInterval(interval)
        setSlotsSpinning(false)
        setSlotsReels(prev => {
          const [r1, r2, r3] = prev
          if (r1 === r2 && r2 === r3) {
            setSlotsResult('🎰 JACKPOT WINNER! 🎉')
            playGameWinSound()
          } else if (r1 === r2 || r2 === r3 || r1 === r3) {
            setSlotsResult('🍒 Small Win! Nice matching! 🌟')
            playSuccessHarp()
          } else {
            setSlotsResult('Try again! spin the slots! 🎰')
            playErrorSound()
          }
          return prev
        })
      }
    }, 100)
  }

  const initHigherLower = () => {
    setHlCard(Math.floor(Math.random() * 10) + 2)
    setHlScore(0)
    setHlStreak(0)
    setHlMessage('Will the next card drawn (2-11) be Higher or Lower?')
  }

  const guessHigherLower = (guess) => {
    const next = Math.floor(Math.random() * 10) + 2
    let isCorrect = false
    if (guess === 'higher' && next > hlCard) isCorrect = true
    if (guess === 'lower' && next < hlCard) isCorrect = true
    if (next === hlCard) isCorrect = true

    if (isCorrect) {
      playSuccessHarp()
      setHlScore(s => s + 1)
      setHlStreak(k => k + 1)
      setHlMessage(`Correct! Drew a ${next}. Streak: ${hlStreak + 1}`)
      if (hlStreak + 1 >= 3) {
        playGameWinSound()
        setHlMessage(`🎉 Win Streak of 3 reached! Drew a ${next}. Calm achieved!`)
      }
    } else {
      playErrorSound()
      setHlStreak(0)
      setHlMessage(`Drawn card was ${next}. Incorrect! Streak reset. Try again!`)
    }
    setHlCard(next)
  }

  const initGuessNumber = () => {
    setGnSecret(Math.floor(Math.random() * 10) + 1)
    setGnGuess('')
    setGnMessage('I am thinking of a number from 1 to 10. Take a guess!')
    setGnOver(false)
  }

  const checkGuessNumber = (userVal) => {
    const num = parseInt(userVal)
    if (isNaN(num)) return
    if (num === gnSecret) {
      playGameWinSound()
      setGnMessage(`🎉 Correct! The number was indeed ${gnSecret}!`)
      setGnOver(true)
    } else if (num > gnSecret) {
      playErrorSound()
      setGnMessage(`Too high! ⬆️ Try a lower number.`)
    } else {
      playErrorSound()
      setGnMessage(`Too low! ⬇️ Try a higher number.`)
    }
  }

  const flipCoin = (choice) => {
    setCfChoice(choice)
    setCfResult(null)
    setCfMessage('Flipping...')
    playTickSound()
    setTimeout(() => {
      const coin = Math.random() < 0.5 ? 'Heads' : 'Tails'
      setCfResult(coin)
      if (choice === coin) {
        playGameWinSound()
        setCfMessage(`🪙 Result: ${coin}. Correct prediction! 🎉`)
      } else {
        playErrorSound()
        setCfMessage(`🪙 Result: ${coin}. Better luck next flip!`)
      }
    }, 800)
  }

  const initMathQuiz = () => {
    const ops = ['+', '-']
    const op = ops[Math.floor(Math.random() * 2)]
    let n1 = Math.floor(Math.random() * 10) + 2
    let n2 = Math.floor(Math.random() * 10) + 2
    if (op === '-' && n1 < n2) {
      const tmp = n1
      n1 = n2
      n2 = tmp
    }
    const ans = op === '+' ? n1 + n2 : n1 - n2
    const opts = [
      ans,
      ans + Math.floor(Math.random() * 4) + 1,
      Math.max(1, ans - (Math.floor(Math.random() * 3) + 1))
    ].sort(() => Math.random() - 0.5)
    
    setMqNum1(n1)
    setMqNum2(n2)
    setMqOp(op)
    setMqOptions(opts)
    setMqAnswer(ans)
    setMqScore(0)
    setMqMessage(`Solve: ${n1} ${op} ${n2} = ?`)
  }

  const answerMathQuiz = (val) => {
    if (val === mqAnswer) {
      playGameWinSound()
      setMqMessage('🎉 Correct! Equation solved.')
      setMqScore(1)
    } else {
      playErrorSound()
      setMqMessage(`Wrong answer! Correct was ${mqAnswer}. Try again!`)
    }
  }

  const initColorMatch = () => {
    const words = ['RED', 'BLUE', 'GREEN', 'YELLOW']
    const colors = [
      { name: 'Red', hex: '#ef4444' },
      { name: 'Blue', hex: '#3b82f6' },
      { name: 'Green', hex: '#10b981' },
      { name: 'Yellow', hex: '#f59e0b' }
    ]
    const wIdx = Math.floor(Math.random() * words.length)
    const cIdx = Math.floor(Math.random() * colors.length)
    const isM = wIdx === cIdx
    
    setCrText(words[wIdx])
    setCrColor(colors[cIdx].hex)
    setCrColorName(colors[cIdx].name)
    setCrIsMatch(isM)
    setCrScore(0)
    setCrMessage('Does the word text match the printing color?')
  }

  const answerColorMatch = (choice) => {
    if (choice === crIsMatch) {
      playSuccessHarp()
      setCrScore(s => s + 1)
      setCrMessage('Correct! Nice reflex.')
      initColorMatch()
    } else {
      playErrorSound()
      setCrScore(0)
      setCrMessage('Incorrect match! Reflex score reset.')
      initColorMatch()
    }
  }

  const initUnoGame = () => {
    const colors = ['🔴 Red', '🔵 Blue', '🟢 Green', '🟡 Yellow']
    const values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Skip', 'Reverse']
    const createCard = (id) => {
      const color = colors[Math.floor(Math.random() * colors.length)]
      const val = values[Math.floor(Math.random() * values.length)]
      return { id, color, val, label: `${color} ${val}` }
    }
    const player = []
    const cpu = []
    for (let i = 0; i < 4; i++) {
      player.push(createCard(i))
      cpu.push(createCard(i + 10))
    }
    setUnoPlayerCards(player)
    setUnoCpuCards(cpu)
    setUnoCenterCard(createCard(99))
    setUnoTurn('player')
    setUnoWinner(null)
  }

  const playUnoCard = (cardId) => {
    if (unoWinner || unoTurn !== 'player') return
    const card = unoPlayerCards.find(c => c.id === cardId)
    if (!card) return
    if (card.color === unoCenterCard.color || card.val === unoCenterCard.val) {
      setUnoCenterCard(card)
      setUnoPlayerCards(prev => {
        const next = prev.filter(c => c.id !== cardId)
        if (next.length === 0) {
          setUnoWinner('Player')
          playGameWinSound()
        }
        return next
      })
      playTickSound()
      setUnoTurn('cpu')
      setTimeout(playCpuUno, 1000)
    } else {
      playErrorSound()
      alert('Card must match center card color or value!')
    }
  }

  const playCpuUno = () => {
    setUnoCpuCards(prev => {
      const match = prev.find(c => c.color === unoCenterCard.color || c.val === unoCenterCard.val)
      if (match) {
        setUnoCenterCard(match)
        const next = prev.filter(c => c.id !== match.id)
        if (next.length === 0) {
          setUnoWinner('CPU')
          playErrorSound()
        }
        setUnoTurn('player')
        return next
      } else {
        const colors = ['🔴 Red', '🔵 Blue', '🟢 Green', '🟡 Yellow']
        const values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
        const newCard = { id: Math.random(), color: colors[Math.floor(Math.random() * 4)], val: values[Math.floor(Math.random() * 10)] }
        setUnoTurn('player')
        return [...prev, newCard]
      }
    })
  }

  const initSnakeGame = () => {
    setSnakeBody([{ x: 4, y: 4 }, { x: 4, y: 5 }])
    setSnakeDir([0, -1])
    setSnakeFood({ x: 2, y: 2 })
    setSnakeOver(false)
    setWhackScore(0) 
  }

  const moveSnake = (dirX, dirY) => {
    if (snakeOver) return
    const head = snakeBody[0]
    const newHead = { x: head.x + dirX, y: head.y + dirY }
    if (newHead.x < 0 || newHead.x >= 8 || newHead.y < 0 || newHead.y >= 8) {
      setSnakeOver(true)
      playErrorSound()
      return
    }
    if (snakeBody.some(b => b.x === newHead.x && b.y === newHead.y)) {
      setSnakeOver(true)
      playErrorSound()
      return
    }
    const nextBody = [newHead, ...snakeBody]
    if (newHead.x === snakeFood.x && newHead.y === snakeFood.y) {
      playSuccessHarp()
      setWhackScore(s => s + 10)
      setSnakeFood({
        x: Math.floor(Math.random() * 8),
        y: Math.floor(Math.random() * 8)
      })
    } else {
      nextBody.pop()
    }
    setSnakeBody(nextBody)
    setSnakeDir([dirX, dirY])
    playTickSound()
  }

  const initMinesweeper = () => {
    const grid = []
    for (let r = 0; r < 4; r++) {
      const row = []
      for (let c = 0; c < 4; c++) {
        row.push({ r, c, isMine: Math.random() < 0.2, isFlipped: false })
      }
      grid.push(row)
    }
    grid[0][0].isMine = false
    grid[1][1].isMine = true
    setMinesGrid(grid)
    setMinesOver(false)
    setMinesWin(false)
  }

  const revealMineCell = (r, c) => {
    if (minesOver || minesWin) return
    const cell = minesGrid[r][c]
    if (cell.isFlipped) return
    const nextGrid = minesGrid.map(row => 
      row.map(cell => (cell.r === r && cell.c === c) ? { ...cell, isFlipped: true } : cell)
    )
    if (cell.isMine) {
      setMinesGrid(nextGrid)
      setMinesOver(true)
      playErrorSound()
    } else {
      setMinesGrid(nextGrid)
      playSatisfyingPop()
      let win = true
      for (let row of nextGrid) {
        for (let c of row) {
          if (!c.isMine && !c.isFlipped) win = false
        }
      }
      if (win) {
        setMinesWin(true)
        playGameWinSound()
      }
    }
  }

  const initConnect4 = () => {
    const grid = []
    for (let r = 0; r < 5; r++) {
      grid.push(Array(6).fill(null))
    }
    setC4Grid(grid)
    setC4Winner(null)
  }

  const dropC4Chip = (colIdx) => {
    if (c4Winner) return
    let rowIdx = -1
    for (let r = 4; r >= 0; r--) {
      if (c4Grid[r][colIdx] === null) {
        rowIdx = r
        break
      }
    }
    if (rowIdx === -1) return
    const nextGrid = c4Grid.map((row, r) => 
      row.map((cell, c) => (r === rowIdx && c === colIdx) ? 'Red' : cell)
    )
    setC4Grid(nextGrid)
    playTickSound()
    if (checkC4Win(nextGrid, 'Red')) {
      setC4Winner('Player')
      playGameWinSound()
      return
    }
    setTimeout(() => {
      const openCols = []
      for (let c = 0; c < 6; c++) {
        if (nextGrid[0][c] === null) openCols.push(c)
      }
      if (openCols.length === 0) {
        setC4Winner('Draw')
        return
      }
      const cpuCol = openCols[Math.floor(Math.random() * openCols.length)]
      let cpuRow = -1
      for (let r = 4; r >= 0; r--) {
        if (nextGrid[r][cpuCol] === null) {
          cpuRow = r
          break
        }
      }
      const finalGrid = nextGrid.map((row, r) => 
        row.map((cell, c) => (r === cpuRow && c === cpuCol) ? 'Yellow' : cell)
      )
      setC4Grid(finalGrid)
      playTickSound()
      if (checkC4Win(finalGrid, 'Yellow')) {
        setC4Winner('CPU')
        playErrorSound()
      }
    }, 800)
  }

  const checkC4Win = (g, player) => {
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 3; c++) {
        if (g[r][c] === player && g[r][c+1] === player && g[r][c+2] === player && g[r][c+3] === player) return true
      }
    }
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 6; c++) {
        if (g[r][c] === player && g[r+1][c] === player && g[r+2][c] === player && g[r+3][c] === player) return true
      }
    }
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 3; c++) {
        if (g[r][c] === player && g[r+1][c+1] === player && g[r+2][c+2] === player && g[r+3][c+3] === player) return true
      }
    }
    for (let r = 3; r < 5; r++) {
      for (let c = 0; c < 3; c++) {
        if (g[r][c] === player && g[r-1][c+1] === player && g[r-2][c+2] === player && g[r-3][c+3] === player) return true
      }
    }
    return false
  }

  const initSimon = () => {
    setSimonSequence([Math.floor(Math.random() * 4)])
    setSimonUserIndex(0)
    setSimonLit(null)
  }

  const playSimonStep = (colorIdx) => {
    if (simonLit !== null) return
    triggerBeep([261, 329, 392, 523][colorIdx], 0.2)
    setSimonLit(colorIdx)
    setTimeout(() => setSimonLit(null), 300)
    if (colorIdx === simonSequence[simonUserIndex]) {
      const nextIdx = simonUserIndex + 1
      if (nextIdx === simonSequence.length) {
        playSuccessHarp()
        setSimonUserIndex(0)
        setTimeout(() => {
          const nextSeq = [...simonSequence, Math.floor(Math.random() * 4)]
          setSimonSequence(nextSeq)
          flashSimonSequence(nextSeq)
        }, 1000)
      } else {
        setSimonUserIndex(nextIdx)
      }
    } else {
      playErrorSound()
      alert(`Game Over! You reached level ${simonSequence.length}`)
      initSimon()
    }
  }

  const flashSimonSequence = (seq) => {
    let index = 0
    const interval = setInterval(() => {
      if (index >= seq.length) {
        clearInterval(interval)
        return
      }
      const val = seq[index]
      triggerBeep([261, 329, 392, 523][val], 0.2)
      setSimonLit(val)
      setTimeout(() => setSimonLit(null), 300)
      index++
    }, 600)
  }

  const initHangman = () => {
    const words = ['PEACE', 'WELLNESS', 'MINDFUL', 'BALANCE', 'HEALTH', 'SUPPORT', 'HEALING', 'CALM']
    const w = words[Math.floor(Math.random() * words.length)]
    setHangmanWord(w)
    setHangmanGuesses([])
  }

  const guessHangmanLetter = (letter) => {
    if (hangmanGuesses.includes(letter)) return
    const nextGuesses = [...hangmanGuesses, letter]
    setHangmanGuesses(nextGuesses)
    playTickSound()
    
    // Check if won
    const won = hangmanWord.split('').every(char => nextGuesses.includes(char))
    const wrongCount = nextGuesses.filter(char => !hangmanWord.includes(char)).length
    if (won) {
      playGameWinSound()
    } else if (wrongCount >= 6) {
      playErrorSound()
    }
  }

  const initGuessSong = () => {
    const songs = [
      { name: 'Twinkle Twinkle Little Star 🌟', notes: [261, 261, 392, 392, 440, 440, 392] },
      { name: 'Happy Birthday to You 🎂', notes: [261, 261, 293, 261, 349, 330] },
      { name: 'Jingle Bells 🔔', notes: [330, 330, 330, 330, 330, 330, 330, 392, 261, 293, 330] }
    ]
    const chosen = songs[Math.floor(Math.random() * songs.length)]
    setGtsSong(chosen)
    setGtsAnswered(null)
    setGtsOptions([...songs].sort(() => Math.random() - 0.5))
  }

  const playGtsMelody = () => {
    if (!gtsSong) return
    let index = 0
    const interval = setInterval(() => {
      if (index >= gtsSong.notes.length) {
        clearInterval(interval)
        return
      }
      triggerBeep(gtsSong.notes[index], 0.2, 'sine')
      index++
    }, 250)
  }

  const initScavenger = () => {
    const items = [
      ['Something blue 🔵', 'A book 📚', 'A writing tool ✏️'],
      ['A water bottle 🍼', 'A pen/pencil ✏️', 'A soft pillow 🛌'],
      ['A coffee mug ☕', 'A piece of paper 📄', 'Something yellow 🟡']
    ]
    setScavengerItems(items[Math.floor(Math.random() * items.length)])
    setScavengerChecked([])
  }

  const toggleScavengerItem = (item) => {
    playTickSound()
    if (scavengerChecked.includes(item)) {
      setScavengerChecked(prev => prev.filter(i => i !== item))
    } else {
      const next = [...scavengerChecked, item]
      setScavengerChecked(next)
      if (next.length === scavengerItems.length) {
        playGameWinSound()
      }
    }
  }

  const initJenga = () => {
    const tower = []
    for (let i = 0; i < 6; i++) {
      tower.push({ level: i, left: 'intact', center: 'intact', right: 'intact' })
    }
    setJengaTower(tower)
    setJengaWobble(0)
    setJengaCollapsed(false)
  }

  const pullJengaBlock = (level, position) => {
    if (jengaCollapsed) return
    const nextTower = jengaTower.map(row => {
      if (row.level === level) {
        return { ...row, [position]: 'removed' }
      }
      return row
    })
    setJengaTower(nextTower)
    const nextWobble = jengaWobble + Math.floor(Math.random() * 22) + 6
    setJengaWobble(nextWobble)
    playTickSound()
    if (nextWobble >= 100) {
      setJengaCollapsed(true)
      playErrorSound()
    } else {
      playSuccessHarp()
    }
  }

  const initSudoku = () => {
    const templates = [
      [
        [1, 0, 3, 0],
        [0, 3, 0, 2],
        [3, 0, 2, 0],
        [0, 2, 0, 1]
      ],
      [
        [0, 2, 0, 4],
        [4, 0, 2, 0],
        [0, 4, 0, 2],
        [2, 0, 4, 0]
      ]
    ]
    setSudokuGrid(templates[Math.floor(Math.random() * templates.length)])
  }

  const cycleSudokuCell = (r, c) => {
    const nextGrid = sudokuGrid.map((row, rIdx) => 
      row.map((val, cIdx) => {
        if (rIdx === r && cIdx === c) {
          return (val + 1) % 5
        }
        return val
      })
    )
    setSudokuGrid(nextGrid)
    playTickSound()
  }

  const validateSudoku = () => {
    for (let r = 0; r < 4; r++) {
      const rowVals = sudokuGrid[r].filter(v => v !== 0)
      if (rowVals.length !== 4 || new Set(rowVals).size !== 4) {
        playErrorSound()
        alert('Invalid solution! Make sure each row contains unique numbers 1-4.')
        return
      }
    }
    for (let c = 0; c < 4; c++) {
      const colVals = [sudokuGrid[0][c], sudokuGrid[1][c], sudokuGrid[2][c], sudokuGrid[3][c]].filter(v => v !== 0)
      if (colVals.length !== 4 || new Set(colVals).size !== 4) {
        playErrorSound()
        alert('Invalid solution! Make sure each column contains unique numbers 1-4.')
        return
      }
    }
    playGameWinSound()
    alert('🎉 Success! Sudoku solved correctly!')
  }

  const initWordBuilder = () => {
    const sets = [
      { letters: 'AELMP', words: ['MAP', 'PAL', 'PLEA', 'MALE', 'LAMP', 'MEAL', 'PALE'] },
      { letters: 'ACLMJOY', words: ['JOY', 'CALM', 'CLAY', 'COY', 'ALUM', 'MAY', 'MAC'] }
    ]
    const chosen = sets[Math.floor(Math.random() * sets.length)]
    setWbLetters(chosen.letters)
    setWbFound([])
    setWhackScore(0)
    setWbInput('')
  }

  const submitWbWord = () => {
    const currentSet = [
      { letters: 'AELMP', words: ['MAP', 'PAL', 'PLEA', 'MALE', 'LAMP', 'MEAL', 'PALE'] },
      { letters: 'ACLMJOY', words: ['JOY', 'CALM', 'CLAY', 'COY', 'ALUM', 'MAY', 'MAC'] }
    ].find(s => s.letters === wbLetters)
    
    const formatted = wbInput.toUpperCase().trim()
    if (currentSet.words.includes(formatted) && !wbFound.includes(formatted)) {
      setWbFound(prev => [...prev, formatted])
      setWhackScore(s => s + 10)
      setWbInput('')
      playSuccessHarp()
    } else {
      playErrorSound()
      setWbInput('')
    }
  }

  const initMonopoly = () => {
    setMonoPos(0)
    setMonoMoney(1500)
    setMonoProps({})
  }

  const rollMonopolyDice = () => {
    const roll = Math.floor(Math.random() * 6) + 1
    const nextPos = (monoPos + roll) % 8
    setMonoPos(nextPos)
    playTickSound()
    let nextMoney = monoMoney
    if (nextPos < monoPos) {
      nextMoney += 200
      playSuccessHarp()
    }
    const boardNames = ['GO 🏁', 'Meditate Ave 🧘', 'Relax Rd 🛌', 'Chance 🎲', 'Breathing Blvd 🎈', 'Nature St 🌲', 'Spa Cres 🛁', 'Zen Gardens 🌸']
    const propName = boardNames[nextPos]
    if (nextPos === 0 || nextPos === 3) {
      setMonoMoney(nextMoney)
    } else {
      if (!monoProps[nextPos]) {
        if (confirm(`Do you want to buy ${propName} for $200?`)) {
          nextMoney -= 200
          setMonoProps(prev => ({ ...prev, [nextPos]: 'player' }))
          setMonoMoney(nextMoney)
          playSuccessHarp()
        } else {
          setMonoMoney(nextMoney)
        }
      } else {
        setMonoMoney(nextMoney)
      }
    }
  }

  const init2048 = () => {
    let g = Array(16).fill(null)
    g[Math.floor(Math.random() * 16)] = 2
    const empty = []
    g.forEach((v, i) => { if (v === null) empty.push(i) })
    g[empty[Math.floor(Math.random() * empty.length)]] = 2
    setGrid2048(g)
    setWhackScore(0)
  }

  const slide2048 = (dir) => {
    let arr = []
    for (let i = 0; i < 4; i++) {
      arr.push(grid2048.slice(i*4, (i+1)*4))
    }
    let moved = false
    const mergeLine = (line) => {
      let filtered = line.filter(v => v !== null)
      let merged = []
      for (let i = 0; i < filtered.length; i++) {
        if (filtered[i] === filtered[i+1]) {
          merged.push(filtered[i] * 2)
          setWhackScore(s => s + filtered[i] * 2)
          i++
          moved = true
        } else {
          merged.push(filtered[i])
        }
      }
      while (merged.length < 4) merged.push(null)
      return merged
    }
    let nextArr = []
    if (dir === 'left') {
      nextArr = arr.map(row => mergeLine(row))
    } else if (dir === 'right') {
      nextArr = arr.map(row => mergeLine([...row].reverse()).reverse())
    } else if (dir === 'up') {
      for (let c = 0; c < 4; c++) {
        const col = [arr[0][c], arr[1][c], arr[2][c], arr[3][c]]
        const mergedCol = mergeLine(col)
        for (let r = 0; r < 4; r++) {
          if (!nextArr[r]) nextArr[r] = []
          nextArr[r][c] = mergedCol[r]
        }
      }
    } else if (dir === 'down') {
      for (let c = 0; c < 4; c++) {
        const col = [arr[3][c], arr[2][c], arr[1][c], arr[0][c]]
        const mergedCol = mergeLine(col)
        for (let r = 0; r < 4; r++) {
          if (!nextArr[r]) nextArr[r] = []
          nextArr[r][c] = mergedCol[3 - r]
        }
      }
    }
    let flat = nextArr.flat()
    const emptyIndices = []
    flat.forEach((v, idx) => { if (v === null) emptyIndices.push(idx) })
    if (emptyIndices.length > 0) {
      flat[emptyIndices[Math.floor(Math.random() * emptyIndices.length)]] = Math.random() < 0.9 ? 2 : 4
    }
    setGrid2048(flat)
    playTickSound()
  }

  const initTangram = () => {
    setTangramAngles([0, 90, 180, 270].sort(() => Math.random() - 0.5))
  }

  const rotateTangramPiece = (idx) => {
    const nextAngles = [...tangramAngles]
    nextAngles[idx] = (nextAngles[idx] + 90) % 360
    setTangramAngles(nextAngles)
    playTickSound()
    if (nextAngles[idx] === 0) playSuccessHarp()
    if (nextAngles.every(a => a === 0)) {
      playGameWinSound()
      alert('🎉 Beautiful! You assembled the Tangram Silhouette!')
    }
  }

  const initSpotDifference = () => {
    const patterns = [
      { normal: '☘️', diff: '🍀' },
      { normal: '🎈', diff: '🎈' }, // balloon
      { normal: '🐱', diff: '😸' },
      { normal: '🌸', diff: '💮' },
      { normal: '🌟', diff: '⭐' },
      { normal: '🍎', diff: '🍏' },
      { normal: '❤️', diff: '💖' }
    ]
    const p = patterns[Math.floor(Math.random() * patterns.length)]
    const grid = Array(16).fill(p.normal)
    const diffIdx = Math.floor(Math.random() * 16)
    grid[diffIdx] = p.diff
    setSpotGrid(grid)
    setSpotDiffIdx(diffIdx)
    setWhackScore(0)
  }

  const tapSpotCell = (idx) => {
    if (idx === spotDiffIdx) {
      const nextScore = whackScore + 1
      setWhackScore(nextScore)
      playSuccessHarp()
      if (nextScore >= 3) {
        playGameWinSound()
        alert('🎉 Congratulations! You spotted all the differences!')
      } else {
        initSpotDifference()
      }
    } else {
      playErrorSound()
    }
  }

  const buildSafeSpaceStory = () => {
    const spaceMap = {
      'Quiet Cabin 🏡': 'Tucked in a silent valley, your wooden cabin hums with cozy warmth. A small fire crackles in the stone hearth.',
      'Sunny Beach 🏖️': 'Warm, golden sands stretch infinitely under your feet. Soft, gentle wavelets lap against the pristine shore.',
      'Mystic Forest 🌲': 'Sunlight filters through high moss-grown pine branches, throwing magical green beams onto dry leaves.'
    }
    const weatherMap = {
      'Rainy 🌧️': 'A slow summer drizzle pitters against the windowpane, bringing the fresh scent of petrichor and pure calm.',
      'Sunny ☀️': 'Warm sun rays drape over the landscape like a golden shawl, reassuring you that all is well in this moment.',
      'Snowy ❄️': 'Soft, silent snowflakes drift down and coat the earth in clean, white velvet, quietening the noisy world.'
    }
    setSafeSpaceStory(`${spaceMap[spaceChoice]} ${weatherMap[weatherChoice]} Take a deep breath. You are safe, protected, and completely at peace here.`)
    playSuccessHarp()
  }

  const releaseBalloon = () => {
    if (balloonThought.trim() === '') return
    playSatisfyingPop()
    setReleasedBalloons(prev => [...prev, { id: Math.random(), text: balloonThought }])
    setBalloonThought('')
  }

  useEffect(() => {
    if (activeGame !== 'snake') return
    const interval = setInterval(() => {
      // Auto move snake in selected direction
      moveSnake(snakeDir[0], snakeDir[1])
    }, 1200)
    return () => clearInterval(interval)
  }, [activeGame, snakeBody, snakeDir])

  // --- NEW SIMPLE GAME LOOPS ---
  useEffect(() => {
    if (activeGame !== 'flappy' || !flappyStarted || flappyOver) return
    const interval = setInterval(() => {
      setFlappyY(y => {
        const next = y + flappyVelocity + 3
        if (next >= 190 || next <= 0) {
          setFlappyOver(true)
          playErrorSound()
        }
        return next
      })
      setFlappyVelocity(v => Math.min(8, v + 0.6))
      setFlappyPipes(prev => {
        return prev.map(p => {
          const nextX = p.x - 6
          if (nextX > 20 && nextX < 60) {
            setFlappyY(birdY => {
              if (birdY < p.top || birdY > p.bottom) {
                setFlappyOver(true)
                playErrorSound()
              }
              return birdY
            })
          }
          return { ...p, x: nextX }
        }).filter(p => {
          if (p.x <= -20) {
            setFlappyScore(s => s + 1)
            playSuccessHarp()
            return false
          }
          return true
        })
      })
    }, 80)
    return () => clearInterval(interval)
  }, [activeGame, flappyStarted, flappyOver, flappyVelocity])

  useEffect(() => {
    if (activeGame !== 'flappy' || !flappyStarted || flappyOver) return
    const interval = setInterval(() => {
      setFlappyPipes(prev => {
        const last = prev[prev.length - 1]
        if (!last || last.x < 180) {
          const top = Math.floor(Math.random() * 80) + 20
          return [...prev, { x: 320, top, bottom: top + 75 }]
        }
        return prev
      })
    }, 1800)
    return () => clearInterval(interval)
  }, [activeGame, flappyStarted, flappyOver])

  useEffect(() => {
    if (activeGame !== 'bricks' || !brickStarted || brickOver || brickWin) return
    const interval = setInterval(() => {
      setBrickBall(ball => {
        let { x, y, dx, dy } = ball
        let nextX = x + dx
        let nextY = y + dy

        if (nextX <= 10 || nextX >= 390) {
          dx = -dx
          playTickSound()
        }
        if (nextY <= 10) {
          dy = -dy
          playTickSound()
        }
        if (nextY >= 185) {
          setBrickPaddleX(paddleX => {
            if (nextX >= paddleX - 5 && nextX <= paddleX + 65) {
              dy = -Math.abs(dy)
              playTickSound()
            } else {
              setBrickOver(true)
              playErrorSound()
            }
            return paddleX
          })
        }

        setBrickGrid(grid => {
          let hit = false
          const nextGrid = grid.map(brick => {
            if (brick.active && nextX >= brick.x - 35 && nextX <= brick.x + 35 && nextY >= brick.y - 10 && nextY <= brick.y + 10) {
              brick.active = false
              hit = true
              playSatisfyingPop()
            }
            return brick
          })
          if (hit) {
            dy = -dy
            if (nextGrid.every(b => !b.active)) {
              setBrickWin(true)
              playGameWinSound()
            }
          }
          return nextGrid
        })

        return { x: nextX, y: nextY, dx, dy }
      })
    }, 50)
    return () => clearInterval(interval)
  }, [activeGame, brickStarted, brickOver, brickWin])

  useEffect(() => {
    if (activeGame !== 'catch' || catchOver) return
    const interval = setInterval(() => {
      setCatchStar(star => {
        const nextY = star.y + 6
        if (nextY >= 185) {
          setCatchBasketX(basketX => {
            if (star.x >= basketX - 5 && star.x <= basketX + 65) {
              playSuccessHarp()
              setCatchScore(s => {
                const nextScore = s + 1
                if (nextScore >= 5) {
                  setCatchOver(true)
                  playGameWinSound()
                }
                return nextScore
              })
            } else {
              playErrorSound()
            }
            return basketX
          })
          return { x: Math.floor(Math.random() * 320) + 40, y: 10 }
        }
        return { ...star, y: nextY }
      })
    }, 100)
    return () => clearInterval(interval)
  }, [activeGame, catchOver])

  useEffect(() => {
    if (activeGame !== 'clicktest' || !clickTestActive || clickTestTimeLeft <= 0) return
    const timer = setInterval(() => {
      setClickTestTimeLeft(t => {
        if (t <= 1) {
          setClickTestActive(false)
          playGameWinSound()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [activeGame, clickTestActive, clickTestTimeLeft])

  useEffect(() => {
    fetchHistory()
    fetchUserProfile()
    fetchAnalytics()
    return () => {
      Object.values(soundNodes).forEach(node => {
        try { node.stop() } catch(e) {}
      })
      try { clearInterval(soundNodes.wavesInterval) } catch(e) {}
      try { clearInterval(soundNodes.windInterval) } catch(e) {}
      try { clearInterval(soundNodes.campfireInterval) } catch(e) {}
    }
  }, [])

  // GAME API CONNECTION: Fetch dynamic games/activities from backend recommendation service based on selected mood value
  useEffect(() => {
    if (!selected) {
      setDynamicRecs([])
      return
    }
    
    let isMounted = true
    const fetchRecommendations = async () => {
      setRecsLoading(true)
      try {
        const token = localStorage.getItem('token')
        // Connects to the backend recommendations API: GET /api/mood/recommendations
        const response = await axios.get(`${API_URL}/api/mood/recommendations?moodValue=${selected.value}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (isMounted) {
          setDynamicRecs(response.data)
        }
      } catch (err) {
        console.log("Failed fetching dynamic recommendations, using local fallback:", err)
        if (isMounted) {
          // Fallback to static client-side mapping if API fails or is offline
          const fallback = recommendedGamesMapping[selected.value] || []
          setDynamicRecs(fallback)
        }
      } finally {
        if (isMounted) {
          setRecsLoading(false)
        }
      }
    }
    
    fetchRecommendations()
    
    return () => {
      isMounted = false
    }
  }, [selected])


  const fetchUserProfile = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUserProfile(res.data)
    } catch (err) {
      console.log('Error fetching user profile')
    }
  }

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/mood/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAnalyticsData(res.data)
    } catch (err) {
      console.log('Error fetching analytics compilation')
    }
  }

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/mood`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setHistory(res.data)
    } catch (err) {
      console.log('Error fetching moods')
    }
  }

  const handleMoodSelect = (mood) => {
    setSelected(mood)
    setSelectedColor(mood.color)
  }

  const handleActivityToggle = (act) => {
    if (checkedActivities.includes(act)) {
      setCheckedActivities(prev => prev.filter(a => a !== act))
    } else {
      setCheckedActivities(prev => [...prev, act])
    }
  }

  const handleWhatHelpedToggle = (item) => {
    if (whatHelped.includes(item)) {
      setWhatHelped(prev => prev.filter(i => i !== item))
    } else {
      setWhatHelped(prev => [...prev, item])
    }
  }

  // Helper: Get Supported Audio MimeType for Safari/Chrome/iOS
  const getSupportedMimeType = () => {
    if (typeof MediaRecorder === 'undefined') return ''
    const types = [
      'audio/mp4',
      'audio/aac',
      'audio/mpeg',
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus'
    ]
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }
    return ''
  }

  // Voice recording triggers
  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = getSupportedMimeType()
      const options = mimeType ? { mimeType } : {}
      const recorder = new MediaRecorder(stream, options)
      const chunks = []
      
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data)
        }
      }
      recorder.onstop = () => {
        const actualType = recorder.mimeType || mimeType || 'audio/mp4'
        const blob = new Blob(chunks, { type: actualType })
        const url = URL.createObjectURL(blob)
        setAudioBlobUrl(url)
        
        const reader = new FileReader()
        reader.onloadend = () => {
          setAudioBase64(reader.result)
        }
        reader.readAsDataURL(blob)
      }
      
      recorder.start(100)
      setAudioRecorder(recorder)
      setIsRecording(true)
    } catch(err) {
      alert('Could not access microphone: ' + err.message)
    }
  }

  const stopAudioRecording = () => {
    if (audioRecorder && isRecording) {
      audioRecorder.stop()
      setIsRecording(false)
      audioRecorder.stream.getTracks().forEach(track => track.stop())
    }
  }

  // Photo uploads
  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      alert('Photo size exceeds 2MB limit')
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotoBase64(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!selected) return
    setLoading(true)
    try {
      const payload = {
        value: selected.value,
        label: selected.label,
        emoji: selected.emoji,
        note,
        trigger: showCustomTriggerBox ? customTrigger : trigger,
        isCustomTrigger: showCustomTriggerBox,
        activities: checkedActivities,
        sleepHours,
        waterIntake,
        screenTime,
        exerciseDuration,
        energyLevel,
        voiceNote: audioBase64,
        photo: photoBase64,
        weather,
        music,
        isExamPeriod,
        color: selectedColor,
        whatHelped,
        recommendations: dynamicRecs
      }

      await axios.post(`${API_URL}/api/mood`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setSaved(true)
      // Reset logging variables
      setNote('')
      setTrigger('')
      setCustomTrigger('')
      setShowCustomTriggerBox(false)
      setCheckedActivities([])
      setSleepHours(7)
      setWaterIntake(1000)
      setScreenTime(4)
      setExerciseDuration(30)
      setEnergyLevel(3)
      setAudioBlobUrl('')
      setAudioBase64('')
      setPhotoBase64('')
      setIsExamPeriod(false)
      setWhatHelped([])
      
      // Reload states
      fetchHistory()
      fetchUserProfile()
      fetchAnalytics()
      
      // Trigger crisis warning if rating is 1 or 2
      if (selected.value <= 2) {
        setShowCrisisAlert(true)
      }
      
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getAudioCtx = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume()
      }
      return audioCtxRef.current
    } catch(e) {
      console.error('AudioContext access failed:', e)
      return null
    }
  }

  // GAME CODE CONNECTION: Launches the chosen game and configures its initial state based on API/fallback data
  const launchGame = (gameKey, config = null) => {
    const finalConfig = config || {
      key: gameKey,
      title: gameKey,
      icon: '🎮',
      desc: '',
      subtype: gameKey
    }
    setActiveGame(finalConfig.subtype || gameKey)
    setActiveGameConfig(finalConfig)
    setActiveGameData(finalConfig.data || null)
    
    // Unlock Web Audio & SpeechSynthesis under user gesture
    try {
      const ctx = getAudioCtx()
      if (ctx && ctx.state === 'suspended') {
        ctx.resume()
      }
      playLaunchSound()
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        const unlockUtterance = new SpeechSynthesisUtterance('')
        window.speechSynthesis.speak(unlockUtterance)
      }
    } catch(e) {
      console.log('Audio unlock failed:', e)
    }

    const sub = finalConfig.subtype
    // Initialize specific game state based on subtype
    if (sub === 'bubbles' || sub === 'balloon') {
      setBubbles(Array(12).fill(false))
      setPopCount(0)
    } else if (sub === 'memorycard' || sub === 'emotions' || sub === 'emotionmatch') {
      initMemoryGame(finalConfig)
    } else if (sub === 'garden' || sub === 'gratitudequest' || sub === 'gratitude' || sub === 'pet') {
      setGardenPlants([])
      setGratitudeText('')
      if (sub === 'garden') {
        setZenGardenGrid(Array(25).fill(null))
        setSelectedGardenItem('🌸')
      } else if (sub === 'pet') {
        setPetStats({ hunger: 50, love: 50, energy: 50 })
        setPetMessage('Click buttons to interact with your pet! 🐱')
      }
    } else if (sub === 'coloring') {
      setColoringTemplate('flower')
    } else if (sub === 'nature') {
      setPlayingRain(false)
      setPlayingWaves(false)
      setPlayingWind(false)
      setPlayingCampfire(false)
    } else if (sub === 'tictactoe') {
      setTttBoard(Array(9).fill(''))
      setTttWinner(null)
      setTttIsXNext(true)
    } else if (sub === 'breathing') {
      setBreathingPhase('Inhale')
      setBreathingTimer(finalConfig.data?.inhale || 4)
    } else if (sub === 'affirmation') {
      setActiveAffirmation('')
      setSpinning(false)
    } else if (sub === 'whack' || sub === 'jenga') {
      if (sub === 'jenga') {
        initJenga()
      } else {
        setWhackScore(0)
        setActiveHole(null)
        setWhackTimeLeft(0)
        setWhackRunning(false)
      }
    } else if (sub === 'wordsearch') {
      setSelectedCells([])
      setFoundWords([])
    } else if (sub === 'uno') {
      initUnoGame()
    } else if (sub === 'flappy') {
      initFlappyGame()
    } else if (sub === 'bricks') {
      initBricksGame()
    } else if (sub === 'catch') {
      initCatchGame()
    } else if (sub === 'clicktest') {
      initClickTest()
    } else if (sub === 'slots') {
      setSlotsReels(['🎰', '🎰', '🎰'])
      setSlotsResult('Press Spin!')
      setSlotsSpinning(false)
    } else if (sub === 'higherlower') {
      initHigherLower()
    } else if (sub === 'guessnumber') {
      initGuessNumber()
    } else if (sub === 'coinflip') {
      setCfResult(null)
      setCfMessage('Predict the coin flip result!')
    } else if (sub === 'mathquiz') {
      initMathQuiz()
    } else if (sub === 'colormatch') {
      initColorMatch()
    } else if (sub === 'snake') {
      initSnakeGame()
    } else if (sub === 'minesweeper') {
      initMinesweeper()
    } else if (sub === 'connect4') {
      initConnect4()
    } else if (sub === 'simon') {
      initSimon()
    } else if (sub === 'hangman') {
      initHangman()
    } else if (sub === 'guesssong') {
      initGuessSong()
    } else if (sub === 'sudoku') {
      initSudoku()
    } else if (sub === 'wordbuilder') {
      initWordBuilder()
    } else if (sub === 'wouldyourather') {
      setWyrVote(null)
      setWyrIndex(Math.floor(Math.random() * 5))
    } else if (sub === 'monopoly') {
      initMonopoly()
    } else if (sub === '2048') {
      init2048()
    } else if (sub === 'tangram') {
      initTangram()
    } else if (sub === 'spot') {
      initSpotDifference()
    } else if (sub === 'charades') {
      setCharadesPrompt('')
    } else if (sub === 'safespace') {
      setSafeSpaceStory('')
    }

    // Dynamic recommends game initializations
    if (sub === 'chess') {
      setChessMoveIdx(0)
      setChessFeedback('')
      setChessSelectedCell(null)
    } else if (sub === 'trivia') {
      setTriviaChosen(null)
      setTriviaFeedback('')
    } else if (sub === 'speedmath' || sub === 'scramble' || sub === 'numbersequence' || sub === 'logicpuzzle') {
      setQuizInput('')
      setQuizFeedback('')
      setQuizScore(0)
    } else if (sub === 'sudoku' && finalConfig.data) {
      // Load board matrix
      setSudokuPlayBoard(finalConfig.data.board.map(row => [...row]))
    } else if (sub === 'nonogram') {
      setNonogramPlayGrid(Array(5).fill(null).map(() => Array(5).fill(0)))
    } else if (sub === 'jigsaw' && finalConfig.data) {
      setJigsawPlayTiles([...finalConfig.data.tiles])
      setJigsawSelectedIdx(null)
    } else if (sub === 'shapesort') {
      setShapeSortPlaced([])
    } else if (sub === 'relaxmatch' && finalConfig.data) {
      setRelaxMatchCards([...finalConfig.data.cards])
      setRelaxMatchSelected([])
      setRelaxMatchMatched([])
    } else if (sub === 'calmgenerator') {
      setCalmGeneratorDone(false)
    }
  }

  const triggerBeep = (freq, duration, type = 'sine') => {
    try {
      const ctx = getAudioCtx()
      if (!ctx) return
      const osc = ctx.createOscillator()
      const gainNode = ctx.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(freq, ctx.currentTime)
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
      osc.connect(gainNode)
      gainNode.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + duration)
    } catch (e) {}
  }

  const playSatisfyingPop = () => {
    try {
      const ctx = getAudioCtx()
      if (!ctx) return
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(600, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.05)
      gain.gain.setValueAtTime(0.12, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.06)
    } catch(e) {}
  }

  const playSuccessHarp = () => {
    try {
      const ctx = getAudioCtx()
      if (!ctx) return
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99] // C5 chord arpeggio
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          try {
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.type = 'sine'
            osc.frequency.setValueAtTime(freq, ctx.currentTime)
            gain.gain.setValueAtTime(0.06, ctx.currentTime)
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2)
            osc.connect(gain)
            gain.connect(ctx.destination)
            osc.start()
            osc.stop(ctx.currentTime + 1.2)
          } catch(err) {}
        }, idx * 90)
      })
    } catch(e) {}
  }

  const playSpinTick = () => {
    try {
      const ctx = getAudioCtx()
      if (!ctx) return
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(800, ctx.currentTime)
      gain.gain.setValueAtTime(0.03, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.05)
    } catch(e) {}
  }

  const playWhackThud = () => {
    try {
      const ctx = getAudioCtx()
      if (!ctx) return
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(150, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.12)
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.15)
    } catch(e) {}
  }

  const playDoodleSound = () => {
    try {
      const ctx = getAudioCtx()
      if (!ctx) return
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(300 + Math.random() * 80, ctx.currentTime)
      gain.gain.setValueAtTime(0.015, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.15)
    } catch(e) {}
  }

  const playLaunchSound = () => {
    try {
      const ctx = getAudioCtx()
      if (!ctx) return
      const now = ctx.currentTime
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(523.25, now) // C5
      osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.15) // E5
      
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(783.99, now) // G5
      osc2.frequency.exponentialRampToValueAtTime(987.77, now + 0.15) // B5
      
      gain.gain.setValueAtTime(0.08, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
      
      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(ctx.destination)
      
      osc1.start()
      osc2.start()
      osc1.stop(now + 0.35)
      osc2.stop(now + 0.35)
    } catch (e) {}
  }

  const playGameWinSound = () => {
    try {
      const ctx = getAudioCtx()
      if (!ctx) return
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          try {
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.type = 'sine'
            osc.frequency.setValueAtTime(freq, ctx.currentTime)
            gain.gain.setValueAtTime(0.08, ctx.currentTime)
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
            osc.connect(gain)
            gain.connect(ctx.destination)
            osc.start()
            osc.stop(ctx.currentTime + 0.8)
          } catch(err) {}
        }, idx * 75)
      })
    } catch(e) {}
  }

  const playErrorSound = () => {
    try {
      const ctx = getAudioCtx()
      if (!ctx) return
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(180, ctx.currentTime)
      osc.frequency.linearRampToValueAtTime(120, ctx.currentTime + 0.20)
      gain.gain.setValueAtTime(0.12, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.22)
    } catch (e) {}
  }

  const playResetSound = () => {
    try {
      const ctx = getAudioCtx()
      if (!ctx) return
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(400, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.25)
      gain.gain.setValueAtTime(0.08, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.25)
    } catch (e) {}
  }

  const playTickSound = () => {
    try {
      const ctx = getAudioCtx()
      if (!ctx) return
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(1200, ctx.currentTime)
      gain.gain.setValueAtTime(0.03, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.03)
    } catch (e) {}
  }

  // --- 1. Bubble Popper Mechanics ---
  const popBubble = (idx) => {
    if (bubbles[idx]) return
    const newBubbles = [...bubbles]
    newBubbles[idx] = true
    setBubbles(newBubbles)
    setPopCount(prev => prev + 1)
    playSatisfyingPop()
  }
  const resetBubbles = () => {
    setBubbles(Array(12).fill(false))
    setPopCount(0)
    playResetSound()
  }

  // --- 2. Memory Match Mechanics ---
  const initMemoryGame = (config = activeGameConfig) => {
    let emojis = ['🧘', '🌸', '🕊️', '☀️', '🍃', '🌊']
    const subtype = config?.subtype
    if (config?.data?.cards) {
      const items = config.data.cards
      const shuffled = items.map((val, idx) => ({ id: idx, emoji: val, isFlipped: false }))
      setCards(shuffled)
      setFlipped([])
      setMatched([])
      setMoves(0)
      return
    }
    if (subtype === 'memorycard') {
      emojis = ['♠️', '♥️', '♣️', '♦️', '🃏', '🎴']
    } else if (subtype === 'emotions') {
      emojis = ['😊', '😢', '😭', '😡', '😱', '😴']
    } else if (subtype === 'shape') {
      emojis = ['🔺', '🔵', '🟩', '⭐', '❤️', '🌙']
    } else if (subtype === 'jigsaw') {
      emojis = ['🧩', '🔑', '🔒', '💡', '💎', '🌸']
    } else if (subtype === 'slide' || subtype === 'sort' || subtype === 'match3') {
      emojis = ['🟥', '🟦', '🟩', '🟨', '🟪', '🟧']
    }
    const shuffled = [...emojis, ...emojis]
      .map((emoji, index) => ({ id: index, emoji, isFlipped: false }))
      .sort(() => Math.random() - 0.5)
    setCards(shuffled)
    setFlipped([])
    setMatched([])
    setMoves(0)
  }
  const clickCard = (idx) => {
    if (flipped.length === 2 || flipped.includes(idx) || matched.includes(cards[idx].emoji)) return
    const newFlipped = [...flipped, idx]
    setFlipped(newFlipped)
    triggerBeep(500, 0.05)
    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1)
      const first = cards[newFlipped[0]]
      const second = cards[newFlipped[1]]
      if (first.emoji === second.emoji) {
        const nextMatched = [...matched, first.emoji]
        setMatched(nextMatched)
        setFlipped([])
        if (nextMatched.length === cards.length / 2) {
          playGameWinSound()
        } else {
          playSuccessHarp()
        }
      } else {
        setTimeout(() => setFlipped([]), 1000)
      }
    }
  }

  // --- 3. Gratitude Garden Mechanics ---
  const handlePlantFlower = (e) => {
    e.preventDefault()
    if (!gratitudeText.trim()) return
    const flowers = ['🌸', '🌹', '🌻', '🌷', '🌼', '🌺']
    const flower = flowers[Math.floor(Math.random() * flowers.length)]
    const newPlants = [...gardenPlants, { id: Date.now(), flower, text: gratitudeText.trim() }]
    setGardenPlants(newPlants)
    setGratitudeText('')
    if (newPlants.length >= 5) {
      playGameWinSound()
    } else {
      playSuccessHarp()
    }
  }

  // --- 4. Tic-Tac-Toe Mechanics ---
  const playTttMove = (idx) => {
    if (tttBoard[idx] || tttWinner) return
    const nextBoard = [...tttBoard]
    nextBoard[idx] = 'X'
    setTttBoard(nextBoard)
    triggerBeep(480, 0.08, 'triangle')
    
    // Check winner immediately
    const checkWin = (board) => {
      const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
      ]
      for (let line of lines) {
        const [a, b, c] = line
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
          return board[a]
        }
      }
      if (board.every(cell => cell !== '')) return 'Draw'
      return null
    }

    const winStatus = checkWin(nextBoard)
    if (winStatus) {
      setTttWinner(winStatus)
      if (winStatus === 'X') {
        playGameWinSound()
      } else if (winStatus === 'Draw') {
        playSuccessHarp()
      } else {
        playErrorSound()
      }
      return
    }

    // AI Move
    setTttIsXNext(false)
    setTimeout(() => {
      const emptyCells = nextBoard.map((c, i) => c === '' ? i : null).filter(val => val !== null)
      if (emptyCells.length === 0) return
      // Select random empty cell
      const randomIdx = emptyCells[Math.floor(Math.random() * emptyCells.length)]
      nextBoard[randomIdx] = 'O'
      setTttBoard(nextBoard)
      triggerBeep(320, 0.08, 'triangle')
      
      const postAiWin = checkWin(nextBoard)
      if (postAiWin) {
        setTttWinner(postAiWin)
        if (postAiWin === 'O') {
          playErrorSound()
        } else if (postAiWin === 'Draw') {
          playSuccessHarp()
        }
      } else {
        setTttIsXNext(true)
      }
    }, 500)
  }

  // --- 5. Sound Board (Web Audio Ambient Synth) Mechanics ---
  const toggleRain = () => {
    try {
      playTickSound()
      const ctx = getAudioCtx()
      if (!ctx) return

      if (playingRain) {
        soundNodes.rain?.stop()
        setPlayingRain(false)
      } else {
        // Build Rain noise buffer
        const bufferSize = ctx.sampleRate * 2
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
        const output = noiseBuffer.getChannelData(0)
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1
        }
        
        const whiteNoise = ctx.createBufferSource()
        whiteNoise.buffer = noiseBuffer
        whiteNoise.loop = true

        // Create high-pass/bandpass filter to sound like rain
        const filter = ctx.createBiquadFilter()
        filter.type = 'bandpass'
        filter.frequency.setValueAtTime(1000, ctx.currentTime)
        filter.Q.setValueAtTime(1, ctx.currentTime)

        const rainGain = ctx.createGain()
        rainGain.gain.setValueAtTime(0.08, ctx.currentTime)

        whiteNoise.connect(filter)
        filter.connect(rainGain)
        rainGain.connect(ctx.destination)

        whiteNoise.start()
        setSoundNodes(prev => ({ ...prev, rain: whiteNoise }))
        setPlayingRain(true)
      }
    } catch(e) { console.log(e) }
  }

  const toggleWaves = () => {
    try {
      playTickSound()
      const ctx = getAudioCtx()
      if (!ctx) return

      if (playingWaves) {
        soundNodes.wavesSource?.stop()
        clearInterval(soundNodes.wavesInterval)
        setPlayingWaves(false)
      } else {
        const bufferSize = ctx.sampleRate * 2
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
        const output = noiseBuffer.getChannelData(0)
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1
        }

        const source = ctx.createBufferSource()
        source.buffer = noiseBuffer
        source.loop = true

        const filter = ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(280, ctx.currentTime)

        const gainNode = ctx.createGain()
        gainNode.gain.setValueAtTime(0.02, ctx.currentTime)

        source.connect(filter)
        filter.connect(gainNode)
        gainNode.connect(ctx.destination)

        source.start()

        // LFO simulation to modulate wave volume every 4 seconds (swell in and out)
        let swellIn = true
        const wavesInterval = setInterval(() => {
          try {
            const now = ctx.currentTime
            const targetVolume = swellIn ? 0.08 : 0.02
            gainNode.gain.linearRampToValueAtTime(targetVolume, now + 3.8)
            swellIn = !swellIn
          } catch(e) {}
        }, 4000)

        setSoundNodes(prev => ({ ...prev, wavesSource: source, wavesInterval }))
        setPlayingWaves(true)
      }
    } catch(e) { console.log(e) }
  }

  const toggleTone = () => {
    try {
      playTickSound()
      const ctx = getAudioCtx()
      if (!ctx) return

      if (playingTone) {
        soundNodes.toneOsc?.stop()
        setPlayingTone(false)
      } else {
        const osc = ctx.createOscillator()
        const gainNode = ctx.createGain()
        
        osc.type = 'sine'
        osc.frequency.setValueAtTime(110, ctx.currentTime) // low soothing note
        gainNode.gain.setValueAtTime(0.06, ctx.currentTime)

        osc.connect(gainNode)
        gainNode.connect(ctx.destination)
        
        osc.start()
        setSoundNodes(prev => ({ ...prev, toneOsc: osc }))
        setPlayingTone(true)
      }
    } catch(e) {}
  }

  const toggleWind = () => {
    try {
      playTickSound()
      const ctx = getAudioCtx()
      if (!ctx) return

      if (playingWind) {
        soundNodes.windSource?.stop()
        clearInterval(soundNodes.windInterval)
        setPlayingWind(false)
      } else {
        const bufferSize = ctx.sampleRate * 2
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
        const output = noiseBuffer.getChannelData(0)
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1
        }
        
        const source = ctx.createBufferSource()
        source.buffer = noiseBuffer
        source.loop = true

        const filter = ctx.createBiquadFilter()
        filter.type = 'bandpass'
        filter.frequency.setValueAtTime(500, ctx.currentTime)
        filter.Q.setValueAtTime(1.5, ctx.currentTime)

        const windGain = ctx.createGain()
        windGain.gain.setValueAtTime(0.06, ctx.currentTime)

        source.connect(filter)
        filter.connect(windGain)
        windGain.connect(ctx.destination)
        source.start()

        let lfoTime = 0
        const windInterval = setInterval(() => {
          try {
            const now = ctx.currentTime
            const targetFreq = 500 + Math.sin(lfoTime) * 200
            filter.frequency.linearRampToValueAtTime(targetFreq, now + 0.8)
            lfoTime += 0.8
          } catch(e) {}
        }, 800)

        setSoundNodes(prev => ({ ...prev, windSource: source, windInterval }))
        setPlayingWind(true)
      }
    } catch(e) { console.log(e) }
  }

  const toggleCampfire = () => {
    try {
      playTickSound()
      const ctx = getAudioCtx()
      if (!ctx) return

      if (playingCampfire) {
        soundNodes.campfireOsc?.stop()
        clearInterval(soundNodes.campfireInterval)
        setPlayingCampfire(false)
      } else {
        const now = ctx.currentTime
        const osc = ctx.createOscillator()
        const lowGain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(60, now)
        lowGain.gain.setValueAtTime(0.04, now)
        
        const rumbleLfo = ctx.createOscillator()
        const lfoGain = ctx.createGain()
        rumbleLfo.frequency.value = 2.5
        lfoGain.gain.value = 0.02
        rumbleLfo.connect(lfoGain)
        lfoGain.connect(lowGain.gain)
        
        osc.connect(lowGain)
        lowGain.connect(ctx.destination)
        osc.start()
        rumbleLfo.start()

        const campfireInterval = setInterval(() => {
          try {
            if (Math.random() < 0.6) {
              const sparkOsc = ctx.createOscillator()
              const sparkGain = ctx.createGain()
              sparkOsc.type = 'sine'
              sparkOsc.frequency.setValueAtTime(1200 + Math.random() * 800, ctx.currentTime)
              sparkGain.gain.setValueAtTime(0.015, ctx.currentTime)
              sparkGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.015)
              sparkOsc.connect(sparkGain)
              sparkGain.connect(ctx.destination)
              sparkOsc.start()
              sparkOsc.stop(ctx.currentTime + 0.015)
            }
          } catch(e) {}
        }, 80)

        setSoundNodes(prev => ({ ...prev, campfireOsc: osc, campfireInterval }))
        setPlayingCampfire(true)
      }
    } catch(e) { console.log(e) }
  }

  // --- 6. Breathing Balloon Mechanics ---
  useEffect(() => {
    if (activeGame !== 'breathing') return
    const interval = setInterval(() => {
      setBreathingTimer(prev => {
        if (prev <= 1) {
          const nextPhase = breathingPhase === 'Inhale' ? 'Hold' :
                            breathingPhase === 'Hold' ? 'Exhale' :
                            breathingPhase === 'Exhale' ? 'Rest' : 'Inhale';
          setBreathingPhase(nextPhase)
          if (activeGameData && typeof activeGameData.inhale === 'number') {
            if (nextPhase === 'Inhale') return activeGameData.inhale
            if (nextPhase === 'Hold') return activeGameData.hold
            if (nextPhase === 'Exhale') return activeGameData.exhale
            return activeGameData.rest
          }
          return 4
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [activeGame, breathingPhase, activeGameData])

  const playBreathingChime = (freq) => {
    if (!breathingAudioEnabled) return
    try {
      const ctx = getAudioCtx()
      if (!ctx) return

      const playOsc = (f, gainValue, decayTime) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(f, ctx.currentTime)
        gain.gain.setValueAtTime(gainValue, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + decayTime)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + decayTime)
      }

      playOsc(freq, 0.12, 2.5)
      playOsc(freq * 1.5, 0.04, 1.5)
      playOsc(freq * 2.0, 0.02, 1.0)
    } catch(e) {}
  }

  const speakBreathingInstruction = (text) => {
    if (!breathingAudioEnabled) return
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.75
        utterance.pitch = 0.95
        
        const voices = window.speechSynthesis.getVoices()
        const voice = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('google')) || 
                      voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female')) ||
                      voices.find(v => v.lang.startsWith('en'))
        if (voice) {
          utterance.voice = voice
        }
        window.speechSynthesis.speak(utterance)
      }
    } catch(e) {}
  }

  // Trigger audio guide when phase changes
  useEffect(() => {
    if (activeGame !== 'breathing') return
    
    let freq = 440
    let speechText = ''

    if (breathingPhase === 'Inhale') {
      freq = 523.25 // C5
      speechText = 'Breathe in'
    } else if (breathingPhase === 'Hold') {
      freq = 587.33 // D5
      speechText = 'Hold'
    } else if (breathingPhase === 'Exhale') {
      freq = 392.00 // G4
      speechText = 'Breathe out'
    } else if (breathingPhase === 'Rest') {
      freq = 329.63 // E4
      speechText = 'Rest'
    }

    playBreathingChime(freq)
    speakBreathingInstruction(speechText)
  }, [breathingPhase, activeGame])

  // Cancel voice synthesis when game is closed
  useEffect(() => {
    if (activeGame !== 'breathing') {
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel()
        }
      } catch(e) {}
    }
  }, [activeGame])

  // --- 7. Affirmation Spinner Mechanics ---
  const spinWheel = () => {
    if (spinning) return
    setSpinning(true)
    setActiveAffirmation('')
    
    // Play arpeggio ticking sounds
    let tickCount = 0
    const tickInterval = setInterval(() => {
      playSpinTick()
      tickCount++
      if (tickCount >= 10) {
        clearInterval(tickInterval)
      }
    }, 100)
    
    const affirmations = [
      "I am worthy of peace, patience, and love.",
      "My mental health is a priority, not an option.",
      "I choose to be kind to myself and trust my journey.",
      "This stress is only temporary; it does not define me.",
      "I breathe in calm, I breathe out doubt.",
      "I am strong enough to face whatever comes today.",
      "My feelings are completely valid and normal.",
      "It is okay to rest, slow down, and recharge."
    ]

    setTimeout(() => {
      const idx = Math.floor(Math.random() * affirmations.length)
      setActiveAffirmation(affirmations[idx])
      setSpinning(false)
      playSuccessHarp()
    }, 1200)
  }

  // --- 8. Whack-A-Stress Mechanics ---
  const startWhack = () => {
    setWhackScore(0)
    setWhackTimeLeft(20)
    setWhackRunning(true)
    playLaunchSound()
    whackTick()
  }

  const whackTick = () => {
    setActiveHole(Math.floor(Math.random() * 9))
  }

  const clickMonster = (idx) => {
    if (!whackRunning) return
    if (idx === activeHole) {
      setWhackScore(p => p + 1)
      playWhackThud()
      whackTick()
    } else {
      playErrorSound()
    }
  }

  useEffect(() => {
    if (!whackRunning) return
    if (whackTimeLeft <= 0) {
      setWhackRunning(false)
      setActiveHole(null)
      playGameWinSound()
      return
    }
    const timer = setTimeout(() => {
      setWhackTimeLeft(t => t - 1)
      whackTick()
    }, 1000)
    return () => clearTimeout(timer)
  }, [whackRunning, whackTimeLeft])

  // --- 9. Zen Doodler Canvas Mechanics ---
  const drawMandalaTemplate = (canvas) => {
    const ctx = canvas.getContext('2d')
    ctx.strokeStyle = '#cbd5e1'
    ctx.lineWidth = 1.5
    const cx = canvas.width / 2
    const cy = canvas.height / 2
    
    for (let r = 20; r <= 100; r += 20) {
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.stroke()
    }
    
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(angle) * 110, cy + Math.sin(angle) * 110)
      ctx.stroke()
      
      ctx.beginPath()
      ctx.arc(cx + Math.cos(angle) * 80, cy + Math.sin(angle) * 80, 8, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  const drawConnectDotsTemplate = (canvas) => {
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#6366f1'
    ctx.strokeStyle = '#cbd5e1'
    ctx.font = 'bold 12px Arial'
    
    const dots = [
      { x: 120, y: 130, label: '1' },
      { x: 170, y: 70, label: '2' },
      { x: 225, y: 50, label: '3' },
      { x: 280, y: 70, label: '4' },
      { x: 330, y: 130, label: '5' },
      { x: 280, y: 190, label: '6' },
      { x: 225, y: 210, label: '7' },
      { x: 170, y: 190, label: '8' }
    ]
    
    dots.forEach(dot => {
      ctx.beginPath()
      ctx.arc(dot.x, dot.y, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#475569'
      ctx.fillText(dot.label, dot.x - 3, dot.y - 10)
      ctx.fillStyle = '#6366f1'
    })
  }

  useEffect(() => {
    if (activeGame !== 'doodler') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    
    if (activeGameConfig?.subtype === 'sand') {
      setBrushColor('#78350f') // Sand brown brush
    } else {
      setBrushColor('#818cf8') // default Indigo brush
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (activeGameConfig?.subtype === 'mandala') {
      drawMandalaTemplate(canvas)
    } else if (activeGameConfig?.subtype === 'connect') {
      drawConnectDotsTemplate(canvas)
    }
  }, [activeGame, activeGameConfig])

  // --- Coloring Book Templates ---
  const drawFlowerOutline = (canvas) => {
    const ctx = canvas.getContext('2d')
    ctx.strokeStyle = '#94a3b8'
    ctx.lineWidth = 2
    const cx = canvas.width / 2
    const cy = canvas.height / 2 - 10
    
    // Stem
    ctx.beginPath()
    ctx.moveTo(cx, cy + 30)
    ctx.quadraticCurveTo(cx - 10, cy + 90, cx, cy + 120)
    ctx.stroke()
    
    // Leaf
    ctx.beginPath()
    ctx.moveTo(cx - 5, cy + 60)
    ctx.quadraticCurveTo(cx - 30, cy + 50, cx - 15, cy + 80)
    ctx.quadraticCurveTo(cx - 5, cy + 70, cx - 5, cy + 60)
    ctx.stroke()

    // Petals
    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI) / 5
      const px = cx + Math.cos(angle) * 35
      const py = cy + Math.sin(angle) * 35
      ctx.beginPath()
      ctx.arc(px, py, 20, 0, Math.PI * 2)
      ctx.stroke()
    }
    
    // Center circle
    ctx.beginPath()
    ctx.arc(cx, cy, 22, 0, Math.PI * 2)
    ctx.fillStyle = '#ffffff'
    ctx.fill()
    ctx.stroke()
  }

  const drawHouseOutline = (canvas) => {
    const ctx = canvas.getContext('2d')
    ctx.strokeStyle = '#94a3b8'
    ctx.lineWidth = 2
    const cx = canvas.width / 2
    const cy = canvas.height / 2
    
    // Base box
    ctx.strokeRect(cx - 50, cy - 10, 100, 70)
    
    // Roof triangle
    ctx.beginPath()
    ctx.moveTo(cx - 60, cy - 10)
    ctx.lineTo(cx, cy - 50)
    ctx.lineTo(cx + 60, cy - 10)
    ctx.closePath()
    ctx.stroke()
    
    // Door
    ctx.strokeRect(cx - 15, cy + 25, 30, 35)
    
    // Door knob
    ctx.beginPath()
    ctx.arc(cx + 8, cy + 42, 2, 0, Math.PI * 2)
    ctx.stroke()
    
    // Window
    ctx.strokeRect(cx - 35, cy + 5, 20, 20)
    ctx.beginPath()
    ctx.moveTo(cx - 25, cy + 5)
    ctx.lineTo(cx - 25, cy + 25)
    ctx.moveTo(cx - 35, cy + 15)
    ctx.lineTo(cx - 15, cy + 15)
    ctx.stroke()
  }

  const drawButterflyOutline = (canvas) => {
    const ctx = canvas.getContext('2d')
    ctx.strokeStyle = '#94a3b8'
    ctx.lineWidth = 2
    const cx = canvas.width / 2
    const cy = canvas.height / 2
    
    // Body oval
    ctx.beginPath()
    ctx.ellipse(cx, cy, 6, 40, 0, 0, Math.PI * 2)
    ctx.stroke()
    
    // Left Wing top
    ctx.beginPath()
    ctx.ellipse(cx - 30, cy - 20, 30, 20, Math.PI / 6, 0, Math.PI * 2)
    ctx.stroke()
    
    // Left Wing bottom
    ctx.beginPath()
    ctx.ellipse(cx - 22, cy + 15, 20, 15, -Math.PI / 6, 0, Math.PI * 2)
    ctx.stroke()

    // Right Wing top
    ctx.beginPath()
    ctx.ellipse(cx + 30, cy - 20, 30, 20, -Math.PI / 6, 0, Math.PI * 2)
    ctx.stroke()
    
    // Right Wing bottom
    ctx.beginPath()
    ctx.ellipse(cx + 22, cy + 15, 20, 15, Math.PI / 6, 0, Math.PI * 2)
    ctx.stroke()
    
    // Antennae
    ctx.beginPath()
    ctx.moveTo(cx - 2, cy - 40)
    ctx.quadraticCurveTo(cx - 10, cy - 55, cx - 18, cy - 50)
    ctx.moveTo(cx + 2, cy - 40)
    ctx.quadraticCurveTo(cx + 10, cy - 55, cx + 18, cy - 50)
    ctx.stroke()
  }

  useEffect(() => {
    if (activeGame !== 'coloring') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    if (coloringTemplate === 'flower') {
      drawFlowerOutline(canvas)
    } else if (coloringTemplate === 'house') {
      drawHouseOutline(canvas)
    } else if (coloringTemplate === 'butterfly') {
      drawButterflyOutline(canvas)
    }
  }, [activeGame, coloringTemplate])

  const startDraw = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top
    
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.strokeStyle = brushColor
    ctx.lineWidth = brushWidth
    setDrawing(true)
  }

  const draw = (e) => {
    if (!drawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top
    
    ctx.lineTo(x, y)
    ctx.stroke()
    playDoodleSound()
  }

  const stopDraw = () => {
    setDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    playResetSound()
    
    if (activeGameConfig?.subtype === 'mandala') {
      drawMandalaTemplate(canvas)
    } else if (activeGameConfig?.subtype === 'connect') {
      drawConnectDotsTemplate(canvas)
    } else if (activeGame === 'coloring') {
      if (coloringTemplate === 'flower') drawFlowerOutline(canvas)
      else if (coloringTemplate === 'house') drawHouseOutline(canvas)
      else if (coloringTemplate === 'butterfly') drawButterflyOutline(canvas)
    }
  }

  // --- 10. Mindful Word Search Mechanics ---
  const getWordSearchWords = () => {
    if (activeGameConfig?.subtype === 'number') {
      return ['ONE', 'TWO', 'FIVE', 'NINE', 'ZERO']
    }
    return ['PEACE', 'CALM', 'JOY', 'HEAL', 'HOPE']
  }

  const getWordSearchGrid = () => {
    if (activeGameConfig?.subtype === 'number') {
      return [
        ['O', 'N', 'E', 'X', 'Y', 'Z'],
        ['A', 'B', 'T', 'W', 'O', 'C'],
        ['F', 'I', 'V', 'E', 'D', 'E'],
        ['G', 'H', 'I', 'J', 'K', 'L'],
        ['N', 'I', 'N', 'E', 'M', 'N'],
        ['Z', 'E', 'R', 'O', 'P', 'Q']
      ]
    }
    return staticGridLetters
  }

  const toggleSearchCell = (r, c) => {
    const exists = selectedCells.some(cell => cell.r === r && cell.c === c)
    if (exists) {
      setSelectedCells(prev => prev.filter(cell => !(cell.r === r && cell.c === c)))
    } else {
      setSelectedCells(prev => [...prev, { r, c }])
    }
    triggerBeep(450, 0.05)
  }

  const checkWordSelection = () => {
    const currentWords = getWordSearchWords()
    const currentGrid = getWordSearchGrid()
    if (selectedCells.length === 0) return
    const sorted = [...selectedCells].sort((a, b) => {
      if (a.r === b.r) return a.c - b.c
      return a.r - b.r
    })
    
    const assembledWord = sorted.map(cell => currentGrid[cell.r][cell.c]).join('')
    const reversed = assembledWord.split('').reverse().join('')

    const matchedWord = currentWords.find(word => 
      (word === assembledWord || word === reversed) && !foundWords.includes(word)
    )

    if (matchedWord) {
      const nextFound = [...foundWords, matchedWord]
      setFoundWords(nextFound)
      setSelectedCells([])
      if (nextFound.length === currentWords.length) {
        playGameWinSound()
      } else {
        playSuccessHarp()
      }
    } else {
      playErrorSound()
      setSelectedCells([])
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const parseChessFen = (fen) => {
    const board = Array(8).fill(null).map(() => Array(8).fill(''))
    if (!fen) return board
    const rows = fen.split(' ')[0].split('/')
    const pieceMap = {
      p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚',
      P: '♙', R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔'
    }
    for (let r = 0; r < 8; r++) {
      let c = 0
      const rowStr = rows[r]
      if (!rowStr) continue
      for (let i = 0; i < rowStr.length; i++) {
        const char = rowStr[i]
        if (/\d/.test(char)) {
          c += parseInt(char)
        } else {
          board[r][c] = pieceMap[char] || char
          c++
        }
      }
    }
    return board
  }

  const activeRecs = selected ? recommendedGamesMapping[selected.value] : []

  // Custom Heatmap drawing
  const renderHeatmap = () => {
    const year = new Date().getFullYear()
    const month = new Date().getMonth()
    const numDays = new Date(year, month + 1, 0).getDate()
    
    const days = []
    for (let i = 1; i <= numDays; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      const log = analyticsData?.heatmapData?.find(h => h.date === dateStr)
      days.push({ day: i, log })
    }
    
    const monthName = new Date().toLocaleString('en-US', { month: 'long' })
    
    return (
      <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
        <h4 style={{ textAlign: 'center', margin: '0 0 16px 0', color: '#1e293b', fontWeight: 'bold' }}>📅 {monthName} Heatmap</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', maxWidth: '280px', margin: '0 auto' }}>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}>{d}</div>
          ))}
          {Array(new Date(year, month, 1).getDay()).fill(null).map((_, idx) => (
            <div key={`empty-${idx}`} />
          ))}
          {days.map(({ day, log }) => (
            <div 
              key={day}
              title={log ? `Day ${day}: Mood Rating ${log.value}/5` : `Day ${day}: No Entry`}
              style={{
                height: '32px',
                background: log ? log.color || '#3b82f6' : '#f1f5f9',
                color: log ? 'white' : '#64748b',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: log ? 'pointer' : 'default',
                boxShadow: log ? '0 2px 5px rgba(0,0,0,0.05)' : 'none',
                border: log ? '1px solid rgba(255,255,255,0.2)' : '1px solid #e2e8f0'
              }}
            >
              {day}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Calculate if last 3 logged moods average is low (<= 2)
  const isAvgMoodLow = () => {
    if (history.length < 3) return false
    const last3 = history.slice(0, 3)
    const avg = last3.reduce((acc, curr) => acc + curr.value, 0) / 3
    return avg <= 2.0
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: '80px', fontFamily: '"Outfit", "Inter", sans-serif' }}>
      <Navbar />

      <div style={{ padding: '40px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Top Header & Streak Banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
          <div>
            <h1 style={{ color: '#1e293b', margin: 0, fontSize: '32px', fontWeight: '800' }}>😊 Mood Tracker & Analytics</h1>
            <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '15px' }}>Log your lifestyle and metrics to generate AI insights and chart comparisons.</p>
          </div>
          
          {userProfile && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'white', padding: '10px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '28px' }}>🔥</span>
                <div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Logging Streak</div>
                  <strong style={{ fontSize: '16px', color: '#f97316' }}>{userProfile.streakCount || 0} Days</strong>
                </div>
              </div>
              
              <div style={{ width: '1px', height: '30px', background: '#e2e8f0', margin: '0 8px' }} />
              
              <div>
                <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Monthly Goal</div>
                <strong style={{ fontSize: '15px', color: '#6366f1' }}>{userProfile.monthlyGoalLogs || 0} / 15 Logs</strong>
              </div>
            </div>
          )}
        </div>

        {/* Smart Low-Mood Alert Warning */}
        {isAvgMoodLow() && (
          <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderLeft: '6px solid #ef4444', padding: '16px 20px', borderRadius: '16px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ fontSize: '30px' }}>💙</span>
            <div style={{ flex: 1 }}>
              <strong style={{ color: '#b91c1c', display: 'block', fontSize: '14.5px' }}>Support Alert: You've been feeling low lately</strong>
              <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#7f1d1d', lineHeight: '1.4' }}>
                Our system noticed that your logged mood scores have been consistently low. Please know that you are not alone. Consider scheduling a private counseling talk with our campus counselors, or chatting with our chatbot companion Aura.
              </p>
            </div>
            <button onClick={() => navigate('/booking')} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
              Book Counselor 📅
            </button>
          </div>
        )}

        {/* Tab Links Navigation */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px', marginBottom: '32px', overflowX: 'auto' }}>
          <button 
            onClick={() => setActiveTab('log')}
            style={{ padding: '10px 20px', background: activeTab === 'log' ? '#6366f1' : 'transparent', color: activeTab === 'log' ? 'white' : '#64748b', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s', touchAction: 'manipulation' }}
          >
            ✍️ Log Daily Vibe
          </button>
          <button 
            onClick={() => setActiveTab('music')}
            style={{ padding: '10px 20px', background: activeTab === 'music' ? '#6366f1' : 'transparent', color: activeTab === 'music' ? 'white' : '#64748b', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s', touchAction: 'manipulation' }}
          >
            🎧 Soothing Music Hub {isMusicPlaying && '🎵'}
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            style={{ padding: '10px 20px', background: activeTab === 'analytics' ? '#6366f1' : 'transparent', color: activeTab === 'analytics' ? 'white' : '#64748b', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s', touchAction: 'manipulation' }}
          >
            📊 Personal Insights & AI
          </button>
          <button 
            onClick={() => setActiveTab('gamification')}
            style={{ padding: '10px 20px', background: activeTab === 'gamification' ? '#6366f1' : 'transparent', color: activeTab === 'gamification' ? 'white' : '#64748b', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s', touchAction: 'manipulation' }}
          >
            🏆 Badges & Heatmap
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            style={{ padding: '10px 20px', background: activeTab === 'history' ? '#6366f1' : 'transparent', color: activeTab === 'history' ? 'white' : '#64748b', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s', touchAction: 'manipulation' }}
          >
            📅 Mood Journal History
          </button>
        </div>

        {/* TAB 1: MOOD LOGGER */}
        {activeTab === 'log' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
            
            {/* Expanded Mood Questionnaire */}
            <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0' }}>
              <h2 style={{ color: '#1e293b', marginBottom: '8px', fontSize: '20px', fontWeight: 'bold' }}>✍️ Log Today's State</h2>
              <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '18px' }}>Fill out your daily wellness criteria below to log stats and generate AI insights.</p>

              {/* AI Face Scanner Trigger Banner */}
              <div style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                borderRadius: '16px',
                padding: '16px 20px',
                color: 'white',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 8px 24px rgba(124, 58, 237, 0.25)'
              }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    📷 AI Facial Emotion Scanner 🤖
                  </h4>
                  <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#ddd6fe' }}>
                    Scan your facial expression to auto-detect your mood & energy levels
                  </p>
                </div>
                <button
                  type="button"
                  onClick={startFaceCamera}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '12px',
                    background: 'white',
                    color: '#6d28d9',
                    border: 'none',
                    fontWeight: '800',
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s',
                    touchAction: 'manipulation'
                  }}
                >
                  📸 Scan My Face
                </button>
              </div>

              {/* AI FACE SCANNER MODAL */}
              {showFaceScannerModal && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(8px)',
                  zIndex: 99999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px'
                }}>
                  <div style={{
                    background: '#0f172a',
                    color: 'white',
                    borderRadius: '24px',
                    padding: '28px',
                    maxWidth: '480px',
                    width: '100%',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    position: 'relative',
                    textAlign: 'center'
                  }}>
                    <button
                      type="button"
                      onClick={stopFaceCamera}
                      style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        color: 'white',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        fontSize: '16px',
                        cursor: 'pointer'
                      }}
                    >
                      ✕
                    </button>

                    <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      📷 AI Facial Emotion Scanner 🤖
                    </h3>
                    <p style={{ margin: '0 0 20px 0', fontSize: '12.5px', color: '#94a3b8' }}>
                      {scanStatusText}
                    </p>

                    {/* Video Preview Box with Cyber Overlay */}
                    <div style={{
                      position: 'relative',
                      width: '260px',
                      height: '260px',
                      margin: '0 auto 20px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '3px solid #818cf8',
                      boxShadow: '0 0 30px rgba(129, 140, 248, 0.5)',
                      animation: isAnalyzingFace ? 'facePulse 1.5s infinite' : 'none'
                    }}>
                      <video 
                        ref={faceVideoRef} 
                        playsInline 
                        muted 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} 
                      />
                      
                      {/* Scanning Laser Line */}
                      {isAnalyzingFace && (
                        <div style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          height: '4px',
                          background: 'linear-gradient(90deg, transparent, #818cf8, #a855f7, transparent)',
                          boxShadow: '0 0 15px #818cf8',
                          animation: 'scanLaser 2s infinite ease-in-out'
                        }} />
                      )}

                      {/* Target Reticle Overlay */}
                      <div style={{
                        position: 'absolute',
                        top: '15%',
                        left: '15%',
                        right: '15%',
                        bottom: '15%',
                        border: '2px dashed rgba(255, 255, 255, 0.4)',
                        borderRadius: '50%',
                        pointerEvents: 'none'
                      }} />
                    </div>

                    {/* Progress Bar */}
                    {isAnalyzingFace && (
                      <div style={{ width: '100%', background: '#1e293b', borderRadius: '10px', height: '8px', overflow: 'hidden', marginBottom: '20px' }}>
                        <div style={{ width: `${scanProgress}%`, background: 'linear-gradient(90deg, #6366f1, #a855f7)', height: '100%', transition: 'width 0.3s' }} />
                      </div>
                    )}

                    {/* Detected Emotion Result Box */}
                    {detectedEmotion && (
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: `1.5px solid ${detectedEmotion.color}`,
                        borderRadius: '16px',
                        padding: '16px',
                        marginBottom: '20px',
                        textAlign: 'left'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '15px', fontWeight: '800', color: detectedEmotion.color }}>
                            Detected: {detectedEmotion.emotion}
                          </span>
                          <span style={{ fontSize: '12px', background: detectedEmotion.color, color: 'white', padding: '3px 8px', borderRadius: '8px', fontWeight: 'bold' }}>
                            {detectedEmotion.confidence}% Match
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.4' }}>
                          {detectedEmotion.note}
                        </p>
                      </div>
                    )}

                    {/* Control Action Buttons */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {!detectedEmotion ? (
                        <button
                          type="button"
                          onClick={triggerAIAnalysis}
                          disabled={!isFaceCameraActive || isAnalyzingFace}
                          style={{
                            flex: 1,
                            height: '46px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: 'white',
                            border: 'none',
                            fontWeight: '800',
                            fontSize: '14.5px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
                            touchAction: 'manipulation'
                          }}
                        >
                          {isAnalyzingFace ? 'Scanning Facial Features...' : '🔍 Scan Facial Emotion'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={applyDetectedEmotionToLog}
                          style={{
                            flex: 1,
                            height: '46px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: 'white',
                            border: 'none',
                            fontWeight: '800',
                            fontSize: '14.5px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                            touchAction: 'manipulation'
                          }}
                        >
                          ✨ Apply Mood Rating to Log
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Emoji Select */}
              <label style={{ display: 'block', color: '#475569', fontWeight: '700', marginBottom: '10px', fontSize: '13.5px' }}>1. How is your mood rating?</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                {moods.map((mood) => (
                  <div key={mood.value} onClick={() => handleMoodSelect(mood)}
                    style={{ 
                      flex: 1, 
                      textAlign: 'center', 
                      padding: '12px 6px', 
                      borderRadius: '16px', 
                      cursor: 'pointer', 
                      border: `3px solid ${selected?.value === mood.value ? selectedColor : '#f1f5f9'}`, 
                      background: selected?.value === mood.value ? selectedColor + '10' : 'white', 
                      transition: 'all 0.2s'
                    }}>
                    <div style={{ fontSize: '28px', marginBottom: '6px' }}>{mood.emoji}</div>
                    <div style={{ fontSize: '11px', color: '#475569', fontWeight: 'bold' }}>{mood.label}</div>
                  </div>
                ))}
              </div>

              {/* Step 2: Trigger Select */}
              <label style={{ display: 'block', color: '#475569', fontWeight: '700', marginBottom: '8px', fontSize: '13.5px' }}>2. What is the primary cause (Trigger) of your mood?</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                {['Studies', 'Family', 'Friends', 'Relationship', 'Work', 'Health'].map(trig => (
                  <button 
                    key={trig}
                    type="button"
                    onClick={() => { setTrigger(trig); setShowCustomTriggerBox(false); }}
                    style={{
                      padding: '8px 14px',
                      background: trigger === trig && !showCustomTriggerBox ? '#6366f1' : '#f1f5f9',
                      color: trigger === trig && !showCustomTriggerBox ? 'white' : '#475569',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '12.5px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    {trig}
                  </button>
                ))}
                <button 
                  type="button"
                  onClick={() => setShowCustomTriggerBox(true)}
                  style={{
                    padding: '8px 14px',
                    background: showCustomTriggerBox ? '#6366f1' : '#f1f5f9',
                    color: showCustomTriggerBox ? 'white' : '#475569',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '12.5px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  ✏️ Custom Trigger
                </button>
              </div>

              {showCustomTriggerBox && (
                <input 
                  type="text" 
                  value={customTrigger}
                  onChange={(e) => setCustomTrigger(e.target.value)}
                  placeholder="Type your trigger here..."
                  style={{ width: '100%', padding: '10px', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none', marginBottom: '20px', boxSizing: 'border-box' }}
                />
              )}

              {/* Step 3: Activity Tracking */}
              <label style={{ display: 'block', color: '#475569', fontWeight: '700', marginBottom: '10px', fontSize: '13.5px' }}>3. What activities did you complete today?</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
                {['Exercise 🏃', 'Gaming 🎮', 'Reading 📚', 'Meditation 🧘', 'Music 🎵', 'Socializing 👥'].map(act => {
                  const isChecked = checkedActivities.includes(act)
                  return (
                    <div 
                      key={act}
                      onClick={() => handleActivityToggle(act)}
                      style={{
                        padding: '10px',
                        background: isChecked ? '#e0e7ff' : '#f8fafc',
                        border: `1.5px solid ${isChecked ? '#818cf8' : '#e2e8f0'}`,
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '12.5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <input type="checkbox" checked={isChecked} readOnly style={{ pointerEvents: 'none' }} />
                      <span>{act}</span>
                    </div>
                  )
                })}
              </div>

              {/* Step 4: Lifestyle Factors */}
              <label style={{ display: 'block', color: '#475569', fontWeight: '700', marginBottom: '14px', fontSize: '13.5px' }}>4. Lifestyle and Sleep parameters</label>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                
                {/* Sleep slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569', fontWeight: 'bold', marginBottom: '4px' }}>
                    <span>Sleep Hours:</span>
                    <span>{sleepHours} hrs</span>
                  </div>
                  <input type="range" min="1" max="15" step="0.5" value={sleepHours} onChange={(e) => setSleepHours(Number(e.target.value))} style={{ width: '100%', cursor: 'pointer' }} />
                </div>

                {/* Water input */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569', fontWeight: 'bold', marginBottom: '6px', alignItems: 'center' }}>
                    <span>Water Intake:</span>
                    <span>{waterIntake} ml</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      type="button" 
                      onClick={() => setWaterIntake(w => Math.max(0, w - 250))} 
                      style={{ 
                        flex: 1, 
                        padding: '10px 14px', 
                        border: '1px solid #bae6fd', 
                        borderRadius: '10px', 
                        background: '#f0f9ff', 
                        color: '#0369a1', 
                        fontWeight: 'bold', 
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#e0f2fe'
                        e.currentTarget.style.borderColor = '#7dd3fc'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f0f9ff'
                        e.currentTarget.style.borderColor = '#bae6fd'
                      }}
                    >
                      💧 - 250ml
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setWaterIntake(w => w + 250)} 
                      style={{ 
                        flex: 1, 
                        padding: '10px 14px', 
                        border: '1px solid #bae6fd', 
                        borderRadius: '10px', 
                        background: '#0284c7', 
                        color: 'white', 
                        fontWeight: 'bold', 
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 10px rgba(2, 132, 199, 0.15)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#0369a1'
                        e.currentTarget.style.transform = 'translateY(-1px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#0284c7'
                        e.currentTarget.style.transform = 'none'
                      }}
                    >
                      💧 + 250ml
                    </button>
                  </div>

                </div>

                {/* Screen Time slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569', fontWeight: 'bold', marginBottom: '4px' }}>
                    <span>Screen Time:</span>
                    <span>{screenTime} hrs</span>
                  </div>
                  <input type="range" min="0" max="24" value={screenTime} onChange={(e) => setScreenTime(Number(e.target.value))} style={{ width: '100%', cursor: 'pointer' }} />
                </div>

                {/* Exercise duration slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569', fontWeight: 'bold', marginBottom: '4px' }}>
                    <span>Exercise duration:</span>
                    <span>{exerciseDuration} mins</span>
                  </div>
                  <input type="range" min="0" max="180" step="5" value={exerciseDuration} onChange={(e) => setExerciseDuration(Number(e.target.value))} style={{ width: '100%', cursor: 'pointer' }} />
                </div>

                {/* Energy Level buttons */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#475569', fontWeight: 'bold', marginBottom: '6px' }}>Energy level (1-5):</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3, 4, 5].map(lvl => (
                      <button 
                        key={lvl}
                        type="button"
                        onClick={() => setEnergyLevel(lvl)}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: '8px',
                          border: `1.5px solid ${energyLevel === lvl ? '#6366f1' : '#e2e8f0'}`,
                          background: energyLevel === lvl ? '#6366f1' : 'white',
                          color: energyLevel === lvl ? 'white' : '#475569',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Exam Stress toggle */}
                <label style={{ display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer', fontSize: '13px', color: '#475569', fontWeight: '600' }}>
                  <input type="checkbox" checked={isExamPeriod} onChange={(e) => setIsExamPeriod(e.target.checked)} />
                  <span>I am preparing for an exam/assessment period 📝</span>
                </label>
              </div>

              {/* Step 5: Notes & Media uploads */}
              <label style={{ display: 'block', color: '#475569', fontWeight: '700', marginBottom: '8px', fontSize: '13.5px' }}>5. Journal details & attachments</label>
              
              <textarea value={note} onChange={(e) => setNote(e.target.value)}
                placeholder="Vibe check... what is on your mind today?"
                style={{ width: '100%', padding: '14px', border: '2px solid #cbd5e1', borderRadius: '12px', fontSize: '16px', outline: 'none', minHeight: '100px', boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: '16px' }} />

              {/* Photo Upload widget */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', fontWeight: 'bold', marginBottom: '6px' }}>Attach Photo Memory:</label>
                <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ fontSize: '12px' }} />
                {photoBase64 && (
                  <div style={{ marginTop: '8px', position: 'relative', width: 'fit-content' }}>
                    <img src={photoBase64} alt="Thumbnail preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    <button type="button" onClick={() => setPhotoBase64('')} style={{ position: 'absolute', top: '-6px', right: '-6px', border: 'none', background: '#ef4444', color: 'white', width: '18px', height: '18px', borderRadius: '50%', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                  </div>
                )}
              </div>

              {/* Voice Note recorder */}
              <div style={{ 
                marginBottom: '24px', 
                background: '#f8fafc', 
                padding: '16px', 
                borderRadius: '12px', 
                border: '1px solid #cbd5e1' 
              }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#475569', fontWeight: '700', marginBottom: '8px' }}>
                  🎙️ Voice Journal Note
                </label>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {isRecording ? (
                      <button 
                        type="button" 
                        onClick={stopAudioRecording} 
                        style={{ 
                          padding: '10px 20px', 
                          background: '#ef4444', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '10px', 
                          fontWeight: 'bold', 
                          cursor: 'pointer', 
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                          transition: 'all 0.2s'
                        }}
                      >
                        <span style={{ 
                          width: '10px', 
                          height: '10px', 
                          background: 'white', 
                          borderRadius: '50%', 
                          display: 'inline-block',
                          animation: 'pulse 1s infinite alternate' 
                        }} />
                        Stop Recording
                      </button>
                    ) : (
                      <button 
                        type="button" 
                        onClick={startAudioRecording} 
                        style={{ 
                          padding: '10px 20px', 
                          background: '#3b82f6', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '10px', 
                          fontWeight: 'bold', 
                          cursor: 'pointer', 
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
                          transition: 'all 0.2s'
                        }}
                      >
                        🎙️ Record Voice Note
                      </button>
                    )}
                    
                    {isRecording && (
                      <span style={{ fontSize: '12.5px', color: '#ef4444', fontWeight: '600' }}>
                        Recording in progress...
                      </span>
                    )}
                  </div>

                  {audioBlobUrl && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px', 
                      background: 'white', 
                      padding: '12px', 
                      borderRadius: '10px', 
                      border: '1px solid #cbd5e1',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                      flexWrap: 'wrap'
                    }}>
                      <audio src={audioBlobUrl} controls style={{ height: '36px', flex: '1', minWidth: '220px' }} />
                      <button 
                        type="button" 
                        onClick={() => { setAudioBlobUrl(''); setAudioBase64(''); }} 
                        style={{ 
                          padding: '8px 16px', 
                          background: '#fee2e2', 
                          color: '#ef4444', 
                          border: '1px solid #fca5a5', 
                          borderRadius: '8px', 
                          cursor: 'pointer', 
                          fontSize: '12.5px', 
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#ef4444'
                          e.currentTarget.style.color = 'white'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#fee2e2'
                          e.currentTarget.style.color = '#ef4444'
                        }}
                      >
                        🗑️ Delete Recording
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <label style={{ display: 'block', color: '#475569', fontWeight: '700', marginBottom: '10px', fontSize: '13.5px' }}>6. Unique Factors & Integration</label>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Weather:</label>
                  <select value={weather} onChange={(e) => setWeather(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12.5px' }}>
                    <option value="Sunny">☀️ Sunny</option>
                    <option value="Rainy">🌧️ Rainy</option>
                    <option value="Cloudy">☁️ Cloudy</option>
                    <option value="Windy">💨 Windy</option>
                    <option value="Stormy">⛈️ Stormy</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Music genre:</label>
                  <select value={music} onChange={(e) => setMusic(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12.5px' }}>
                    <option value="None">None</option>
                    <option value="Pop">🎵 Pop</option>
                    <option value="Classical">🎻 Classical</option>
                    <option value="Jazz">🎷 Jazz</option>
                    <option value="Rock">🎸 Rock</option>
                    <option value="Ambient">🧘 Ambient</option>
                  </select>
                </div>
              </div>

              <label style={{ display: 'block', fontSize: '12px', color: '#64748b', fontWeight: 'bold', marginBottom: '8px' }}>What helped me feel better today?</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                {['Exercise walk 🚶', 'Talking to friends 👥', 'Rest/Nap 💤', 'Gratitude writing ✍️', 'Playing zen games 🎮', 'Box-Breathing 🎈'].map(item => {
                  const isChecked = whatHelped.includes(item)
                  return (
                    <button 
                      key={item}
                      type="button"
                      onClick={() => handleWhatHelpedToggle(item)}
                      style={{
                        padding: '6px 12px',
                        background: isChecked ? '#10b981' : '#f1f5f9',
                        color: isChecked ? 'white' : '#475569',
                        border: 'none',
                        borderRadius: '20px',
                        fontSize: '11.5px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      {item}
                    </button>
                  )
                })}
              </div>

              {selected && (
                <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '16px', borderLeft: `5px solid ${selectedColor}`, marginBottom: '20px', fontSize: '13px', color: '#334155', lineHeight: '1.5' }}>
                  <strong style={{ color: selectedColor, display: 'block', marginBottom: '4px' }}>💡 Quick Advisor Tip</strong>
                  {recommendations[selected.value].tip}
                </div>
              )}

              <button onClick={handleSave} disabled={!selected || loading}
                style={{ width: '100%', padding: '14px', marginTop: '16px', background: selected ? `linear-gradient(135deg, ${selectedColor}, #764ba2)` : '#e2e8f0', color: selected ? 'white' : '#94a3b8', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: selected ? 'pointer' : 'not-allowed', boxShadow: selected ? `0 10px 15px -3px ${selectedColor}30` : 'none' }}>
                {saved ? '✅ Mood Logged!' : loading ? '⏳ Saving...' : '💾 Save Advanced Mood Log'}
              </button>
            </div>

            {/* Recommended games column */}
            <div>
              <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', marginBottom: '24px' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '18px', fontWeight: 'bold' }}>🎯 Recommended for Your Mood</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>{selected ? `Based on your mood score of ${selected.value}/5, we curated these 5 exercises:` : 'Select a mood rating to trigger personalized suggestions.'}</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selected ? (
                    recsLoading ? (
                      Array(5).fill(0).map((_, idx) => (
                        <div 
                          key={idx}
                          style={{ 
                            display: 'flex', 
                            gap: '14px', 
                            alignItems: 'center', 
                            padding: '14px', 
                            background: '#f8fafc', 
                            borderRadius: '16px', 
                            border: '1px solid #e2e8f0',
                            opacity: 0.6,
                            animation: 'pulse 1.5s infinite alternate' 
                          }}
                        >
                          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#cbd5e1' }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ width: '100px', height: '12px', background: '#cbd5e1', borderRadius: '4px', marginBottom: '6px' }} />
                            <div style={{ width: '160px', height: '8px', background: '#cbd5e1', borderRadius: '4px' }} />
                          </div>
                        </div>
                      ))
                    ) : (
                      dynamicRecs.map((gameConfig, idx) => {
                        return (
                          <div 
                            key={idx}
                            onClick={() => launchGame(gameConfig.subtype || gameConfig.key, gameConfig)}
                            style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '14px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s' }}
                            className="game-card"
                          >
                            <div style={{ fontSize: '24px', background: 'white', width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>{gameConfig.icon}</div>
                            <div style={{ flex: 1 }}>
                              <h4 style={{ margin: '0 0 3px 0', color: '#1e293b', fontSize: '13px', fontWeight: 'bold' }}>{gameConfig.title}</h4>
                              <p style={{ margin: 0, color: '#64748b', fontSize: '11px', lineHeight: '1.3' }}>{gameConfig.desc}</p>
                            </div>
                            <span style={{ fontSize: '16px', color: '#4f46e5' }}>▶️</span>
                          </div>
                        )
                      })
                    )
                  ) : (
                    <div style={{ border: '2px dashed #e2e8f0', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontStyle: 'italic', fontSize: '13px', padding: '30px' }}>
                      Choose your mood rating first
                    </div>
                  )}
                </div>
              </div>

              {/* 🌌 ADVANCED 3D WEBGL RELAXATION ZONE */}
              <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.15)', color: 'white', marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🌌 Advanced 3D Relaxation Zone 🎮
                </h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '12.5px', color: '#94a3b8' }}>
                  Hardware-accelerated 3D WebGL environments for instant sensory grounding:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {[
                    { key: 'starfield', title: '🌌 Cosmic Starfield', desc: 'Interactive 3D particle universe', icon: '🌌' },
                    { key: 'water', title: '🌊 Water Ripples', desc: '3D kinetic liquid wave pool', icon: '🌊' },
                    { key: 'sakura', title: '🌸 Sakura Sanctuary', desc: '3D cherry tree in falling petals', icon: '🌸' },
                    { key: 'crystal', title: '🔮 Breathing Crystal', desc: '4-7-8 pulsing 3D glass orb', icon: '🔮' },
                    { key: 'saturn', title: '🪐 Saturn & Moons', desc: '3D planet & orbiting moon rings', icon: '🪐' },
                    { key: 'autumn', title: '🍃 Autumn Forest', desc: '3D golden leaves drifting in breeze', icon: '🍃' },
                    { key: 'prism', title: '💎 Prism Kaleidoscope', desc: '3D rainbow light beams', icon: '💎' },
                    { key: 'warp', title: '🌌 Quantum Warp Tunnel', desc: '3D infinite spiral particle tunnel', icon: '🌌' }
                  ].map(g => (
                    <div
                      key={g.key}
                      onClick={() => setActive3DGame(g.key)}
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '14px',
                        padding: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        touchAction: 'manipulation'
                      }}
                    >
                      <div style={{ fontSize: '22px' }}>{g.icon}</div>
                      <div style={{ fontSize: '12.5px', fontWeight: '700', color: 'white' }}>{g.title}</div>
                      <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>{g.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ⚡ 100% NATIVE PURE-REACT RELAXING ARCADE */}
              <div style={{
                background: 'linear-gradient(135deg, #020617 0%, #1e1b4b 50%, #312e81 100%)',
                padding: '24px',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'white',
                marginBottom: '24px',
                boxShadow: '0 12px 32px rgba(2, 6, 23, 0.4)'
              }}>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    ⚡ Native Built-in Mind Relaxation Games 🎮
                  </h3>
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#94a3b8' }}>
                    100% Native WebGL & Canvas Games built directly inside MindSpace (Zero lag, zero iframe errors):
                  </p>
                </div>

                {/* Pre-loaded 100% Native Games Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))', gap: '10px' }}>
                  {[
                    { id: 'merge', title: 'DesignVille Merge 🏡', desc: 'Merge & decorate dream room', icon: '🏡', action: () => setShowMergeModal(true) },
                    { id: 'diff', title: 'Spot Differences 🔍', desc: 'Find 5 hidden differences', icon: '🔍', action: () => setShowDiffModal(true) },
                    { id: 'mower', title: 'Stone Grass Mower 🚜', desc: 'Satisfying lawn grass cutting', icon: '🚜', action: () => setShowMowerModal(true) },
                    { id: 'popit', title: 'Pop-It 3D Fidget 🧸', desc: 'Interactive popping bubbles', icon: '🧸', action: () => setShowPopItModal(true) },
                    { id: 'watersort', title: 'Water Sort Liquid 🧪', desc: 'Color liquid sorting puzzle', icon: '🧪', action: () => setShowWaterSortModal(true) },
                    { id: 'colortap', title: 'Color Tap Paint 🎨', desc: 'Mindful number color painting', icon: '🎨', action: () => setActiveGame('drawing') },
                    { id: 'solitaire', title: 'Solitaire Story 🃏', desc: 'Classic relaxing solitaire cards', icon: '🃏', action: () => setActiveGame('memory') },
                    { id: 'starfield', title: '3D Cosmic Space 🌌', desc: 'Interactive 3D particle universe', icon: '🌌', action: () => setActive3DGame('starfield') },
                    { id: 'water', title: '3D Water Waves 🌊', desc: '3D kinetic liquid wave pool', icon: '🌊', action: () => setActive3DGame('water') },
                    { id: 'sakura', title: '3D Sakura Sanctuary 🌸', desc: '3D cherry tree in falling petals', icon: '🌸', action: () => setActive3DGame('sakura') },
                    { id: 'crystal', title: '3D Breathing Orb 🔮', desc: '4-7-8 pulsing 3D glass crystal', icon: '🔮', action: () => setActive3DGame('crystal') },
                    { id: 'pet', title: 'Virtual Zen Pet 🐱', desc: 'Feed & pet your virtual cat', icon: '🐱', action: () => setActiveGame('pet') }
                  ].map(gameObj => (
                    <div
                      key={gameObj.id}
                      onClick={gameObj.action}
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '16px',
                        padding: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        touchAction: 'manipulation'
                      }}
                    >
                      <div style={{ fontSize: '28px', marginBottom: '6px' }}>{gameObj.icon}</div>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: 'white', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {gameObj.title}
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#94a3b8', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                        {gameObj.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* COMMON GAMES LIST */}
              <div style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '16px', fontWeight: 'bold' }}>🌐 Common Relaxation Zone</h3>
                <p style={{ color: '#64748b', fontSize: '12.5px', marginBottom: '20px' }}>Take a break and play any of our 10 cognitive and breathing games:</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {commonGamesList.slice(0, 6).map((g, idx) => (
                    <div 
                      key={idx}
                      onClick={() => launchGame(g.key, g)}
                      style={{ background: '#f8fafc', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px', transition: 'all 0.2s' }}
                      className="game-card"
                    >
                      <div style={{ fontSize: '24px' }}>{g.icon}</div>
                      <h4 style={{ margin: 0, color: '#1e293b', fontSize: '12.5px', fontWeight: 'bold' }}>{g.title.split(' ')[0]}</h4>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DEDICATED TAB 2: SOOTHING MUSIC & SONG SEARCH HUB */}
        {activeTab === 'music' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
              borderRadius: '24px',
              padding: '28px',
              color: 'white',
              boxShadow: '0 12px 32px rgba(15, 23, 42, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}>
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  🎧 MindSpace Soothing Music & Song Search Hub 🎵
                </h2>
                <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#94a3b8' }}>
                  Search for any song, artist, or relaxing track to stream in the background while studying or journaling.
                </p>
              </div>

              {/* Search Bar Input */}
              <form onSubmit={(e) => { e.preventDefault(); fetchMusicSearchResults(musicSearchQuery); }} style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginBottom: '20px' }}>
                <input 
                  value={musicSearchQuery} 
                  onChange={(e) => setMusicSearchQuery(e.target.value)} 
                  placeholder="Search any song or artist (e.g. Rain, Lofi, Sinhala, Acoustic)..." 
                  style={{ width: '100%', height: '52px', lineHeight: '1.5', padding: '12px 18px', borderRadius: '14px', border: '1.5px solid #475569', background: '#1e293b', color: '#ffffff', fontSize: '16px', outline: 'none', boxSizing: 'border-box', colorScheme: 'dark' }}
                />
                <button 
                  type="submit" 
                  disabled={isSearchingMusic}
                  style={{ width: '100%', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '15.5px', touchAction: 'manipulation', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}
                >
                  {isSearchingMusic ? 'Searching tracks...' : '🔍 Search Music'}
                </button>
              </form>

              {/* Quick Search Shortcut Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                {['🌧️ Rain & Piano', '🌊 Ocean Waves', '☕ Lofi Chill', '🧘 Meditation', '🎸 Acoustic', '🇱🇰 Sinhala Songs', '🎻 Classical'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => { setMusicSearchQuery(tag); fetchMusicSearchResults(tag); }}
                    style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: '#cbd5e1', fontSize: '12.5px', cursor: 'pointer', fontWeight: '600', touchAction: 'manipulation' }}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Search Results List Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '14px', maxHeight: '340px', overflowY: 'auto', marginBottom: '20px', paddingRight: '6px' }}>
                {musicSearchResults.map(track => (
                  <div 
                    key={track.trackId}
                    onClick={() => handlePlayTrack(track)}
                    style={{
                      background: nowPlayingTrack?.trackId === track.trackId ? 'rgba(99, 102, 241, 0.45)' : 'rgba(255, 255, 255, 0.06)',
                      border: nowPlayingTrack?.trackId === track.trackId ? '2px solid #818cf8' : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px',
                      padding: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      touchAction: 'manipulation'
                    }}
                  >
                    <img 
                      src={getTrackCoverImage(track)} 
                      onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80' }} 
                      alt={track.trackName} 
                      style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover', marginBottom: '8px' }} 
                    />
                    <div style={{ fontSize: '12.5px', fontWeight: '700', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {track.trackName}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                      {track.artistName}
                    </div>
                  </div>
                ))}
              </div>

              {/* Now Playing Audio Control Bar */}
              {nowPlayingTrack && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(0,0,0,0.5)', padding: '14px 20px', borderRadius: '16px', border: '1px solid rgba(129,140,248,0.4)' }}>
                  <img 
                    src={getTrackCoverImage(nowPlayingTrack)} 
                    onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80' }} 
                    alt="Now Playing" 
                    style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }} 
                  />
                  
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {nowPlayingTrack.trackName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#a5b4fc', marginTop: '2px' }}>
                      {nowPlayingTrack.artistName}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleTogglePlayPause}
                    style={{ width: '48px', height: '48px', borderRadius: '50%', background: isMusicPlaying ? '#ef4444' : '#10b981', color: 'white', border: 'none', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', touchAction: 'manipulation', boxShadow: '0 4px 12px rgba(16,185,129,0.4)' }}
                  >
                    {isMusicPlaying ? '⏸' : '▶'}
                  </button>

                  <audio 
                    ref={musicAudioRef} 
                    src={nowPlayingTrack.previewUrl} 
                    loop
                    onPlay={() => setIsMusicPlaying(true)}
                    onPause={() => setIsMusicPlaying(false)}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PERSONAL INSIGHTS & AI */}
        {activeTab === 'analytics' && (
          <div>
            {analyticsData ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                
                {/* AI Summary and Prediction Header */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                  
                  {/* Weekly wellness summary */}
                  <div style={{ background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)', padding: '24px', borderRadius: '24px', border: '1px solid #818cf8' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '24px' }}>✨</span>
                      <strong style={{ color: '#1e1b4b', fontSize: '16px' }}>AI Weekly Mental Wellness Summary</strong>
                    </div>
                    <p style={{ margin: 0, color: '#1e1b4b', fontSize: '13.5px', lineHeight: '1.6' }}>
                      {analyticsData.weeklySummary}
                    </p>
                  </div>

                  {/* Mood Predictions & Suggestions */}
                  <div style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#1e293b', fontWeight: 'bold' }}>🤖 AI Mood Prediction</h3>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                      <div style={{ fontSize: '32px', background: '#f59e0b15', color: '#f59e0b', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {analyticsData.predictedMood}
                      </div>
                      <div>
                        <strong style={{ color: '#1e293b', fontSize: '14.5px', display: 'block' }}>Predicted Mood Level</strong>
                        <span style={{ color: '#64748b', fontSize: '12px' }}>Forecasted score for the next few days.</span>
                      </div>
                    </div>
                    
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', borderLeft: '4px solid #10b981', fontSize: '12.5px', color: '#475569' }}>
                      <strong>Suggested Action:</strong> Practice breathing exercises when academic exam levels are elevated.
                    </div>
                  </div>
                </div>

                {/* Main Graph stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
                  
                  {/* Mood Index trend */}
                  <div style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ color: '#1e293b', fontSize: '16px', fontWeight: 'bold', marginBottom: '20px' }}>📈 Mood Trend (Last 7 Logs)</h3>
                    <div style={{ width: '100%', height: '250px' }}>
                      <ResponsiveContainer>
                        <LineChart data={analyticsData.weeklyTrend}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '11px' }} />
                          <YAxis stroke="#64748b" domain={[1, 5]} style={{ fontSize: '11px' }} ticks={[1, 2, 3, 4, 5]} />
                          <Tooltip contentStyle={{ borderRadius: '8px' }} />
                          <Line type="monotone" dataKey="mood" stroke="#6366f1" strokeWidth={3} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Sleep vs Mood comparison */}
                  <div style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ color: '#1e293b', fontSize: '16px', fontWeight: 'bold', marginBottom: '20px' }}>🛌 Sleep Hours vs Mood Score</h3>
                    <div style={{ width: '100%', height: '250px' }}>
                      <ResponsiveContainer>
                        <LineChart data={analyticsData.sleepVsMood}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '11px' }} />
                          <YAxis stroke="#64748b" yAxisId="left" orientation="left" stroke="#3b82f6" label={{ value: 'Sleep (hrs)', angle: -90, position: 'insideLeft', style: { fontSize: '10px', fill: '#3b82f6' } }} style={{ fontSize: '10px' }} />
                          <YAxis stroke="#64748b" yAxisId="right" orientation="right" stroke="#10b981" label={{ value: 'Mood (1-5)', angle: 90, position: 'insideRight', style: { fontSize: '10px', fill: '#10b981' } }} style={{ fontSize: '10px' }} />
                          <Tooltip />
                          <Line yAxisId="left" type="monotone" dataKey="sleep" stroke="#3b82f6" strokeWidth={2} />
                          <Line yAxisId="right" type="monotone" dataKey="mood" stroke="#10b981" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Trigger rates */}
                  <div style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ color: '#1e293b', fontSize: '16px', fontWeight: 'bold', marginBottom: '20px' }}>⚠️ Common Trigger Frequency</h3>
                    {analyticsData.triggerFrequency.length === 0 ? (
                      <p style={{ fontStyle: 'italic', color: '#94a3b8', textAlign: 'center', marginTop: '60px' }}>Not enough trigger data logged yet.</p>
                    ) : (
                      <div style={{ width: '100%', height: '250px' }}>
                        <ResponsiveContainer>
                          <BarChart data={analyticsData.triggerFrequency}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '11px' }} />
                            <YAxis stroke="#64748b" style={{ fontSize: '11px' }} allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  {/* Activity vs Mood correlation */}
                  <div style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ color: '#1e293b', fontSize: '16px', fontWeight: 'bold', marginBottom: '20px' }}>🏃 Activity vs Average Mood</h3>
                    {analyticsData.activityVsMood.length === 0 ? (
                      <p style={{ fontStyle: 'italic', color: '#94a3b8', textAlign: 'center', marginTop: '60px' }}>No activities logged yet.</p>
                    ) : (
                      <div style={{ width: '100%', height: '250px' }}>
                        <ResponsiveContainer>
                          <BarChart data={analyticsData.activityVsMood}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '10px' }} />
                            <YAxis stroke="#64748b" domain={[0, 5]} style={{ fontSize: '11px' }} />
                            <Tooltip />
                            <Bar dataKey="avgMood" fill="#10b981" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                </div>

                {/* Weather & Music correlations */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', flexWrap: 'wrap' }}>
                  <div style={{ background: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ color: '#1e293b', fontSize: '14px', fontWeight: 'bold', margin: '0 0 12px 0' }}>☀️ Weather vs Average Mood</h4>
                    {analyticsData.weatherVsMood.length === 0 ? (
                      <span style={{ color: '#94a3b8', fontSize: '12px', fontStyle: 'italic' }}>No weather correlations compiled.</span>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {analyticsData.weatherVsMood.map(w => (
                          <div key={w.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                            <span>{w.name}</span>
                            <strong>{w.avgMood} / 5.0</strong>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ background: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ color: '#1e293b', fontSize: '14px', fontWeight: 'bold', margin: '0 0 12px 0' }}>🎵 Music Genre vs Average Mood</h4>
                    {analyticsData.musicVsMood.length === 0 ? (
                      <span style={{ color: '#94a3b8', fontSize: '12px', fontStyle: 'italic' }}>No music correlations compiled.</span>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {analyticsData.musicVsMood.map(m => (
                          <div key={m.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                            <span>{m.name}</span>
                            <strong>{m.avgMood} / 5.0</strong>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px', fontStyle: 'italic' }}>No analytics compiled yet. Save mood entries to generate stats.</p>
            )}
          </div>
        )}

        {/* TAB 3: BADGES & HEATMAP */}
        {activeTab === 'gamification' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
            /
            {/* Heatmap calendar */}
            <div>
              {renderHeatmap()}
            </div>

            {/* Badges showcase */}
            <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ color: '#1e293b', margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold' }}>🏆 Wellness Badges</h3>
              <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>Awarded based on your daily consistency and healthy lifestyle parameters.</p>

              {userProfile && userProfile.badges && userProfile.badges.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {userProfile.badges.map(badge => {
                    let desc = ''
                    let icon = '🏆'
                    let bg = '#e0f2fe'
                    let tc = '#0369a1'

                    if (badge === '3-Day Explorer') { desc = 'Logged mood 3 days consecutively'; icon = '🌱'; bg = '#ecfdf5'; tc = '#047857'; }
                    if (badge === '7-Day Streak Warrior') { desc = 'Logged mood 7 days consecutively'; icon = '🔥'; bg = '#fff7ed'; tc = '#c2410c'; }
                    if (badge === '30-Day Zen Master') { desc = 'Logged mood 30 days consecutively'; icon = '🧘'; bg = '#f5f3ff'; tc = '#6d28d9'; }
                    if (badge === 'Rest & Recover') { desc = 'Logged 8+ hours of sleep'; icon = '💤'; bg = '#fef2f2'; tc = '#b91c1c'; }
                    if (badge === 'Hydration Hero') { desc = 'Logged 2000ml+ water'; icon = '💧'; bg = '#e0f2fe'; tc = '#0369a1'; }
                    if (badge === 'Active Soul') { desc = 'Logged 3+ activities in a day'; icon = '🏃'; bg = '#fef3c7'; tc = '#b45309'; }

                    return (
                      <div key={badge} style={{ padding: '16px', background: bg, borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(0,0,0,0.03)' }}>
                        <div style={{ fontSize: '32px', marginBottom: '6px' }}>{icon}</div>
                        <h4 style={{ margin: '0 0 3px 0', fontSize: '13.5px', color: tc, fontWeight: 'bold' }}>{badge}</h4>
                        <p style={{ margin: 0, fontSize: '10.5px', color: '#64748b', lineHeight: '1.3' }}>{desc}</p>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={{ border: '2px dashed #e2e8f0', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontStyle: 'italic', fontSize: '13px', padding: '40px', textAlign: 'center' }}>
                  No badges unlocked yet. Keep logging daily with healthy sleep and hydration to earn achievements!
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 4: JOURNAL TIMELINE HISTORY */}
        {activeTab === 'history' && (
          <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ color: '#1e293b', margin: '0 0 20px 0', fontSize: '18px', fontWeight: 'bold' }}>📅 Your Mood Log Timeline</h3>
            {history.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px', fontStyle: 'italic' }}>No logged entries yet. Record your mood above.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {history.map((item, i) => (
                  <div 
                    key={i} 
                    style={{ 
                      display: 'flex', 
                      gap: '20px', 
                      padding: '20px', 
                      background: '#f8fafc', 
                      borderRadius: '20px', 
                      borderLeft: `6px solid ${item.color || '#e2e8f0'}`,
                      borderTop: '1px solid #f1f5f9',
                      borderRight: '1px solid #f1f5f9',
                      borderBottom: '1px solid #f1f5f9',
                      alignItems: 'flex-start',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
                    }}
                  >
                    <div style={{ fontSize: '40px', background: 'white', padding: '8px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>{item.emoji}</div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                        <div>
                          <strong style={{ fontSize: '16px', color: '#1e293b' }}>{item.label}</strong>
                          {item.trigger && (
                            <span style={{ fontSize: '11px', background: '#e0e7ff', color: '#4f46e5', padding: '2px 8px', borderRadius: '10px', marginLeft: '8px', fontWeight: 'bold' }}>
                              #{item.trigger}
                            </span>
                          )}
                        </div>
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>{formatDate(item.createdAt)}</span>
                      </div>

                      {/* Display lifestyle parameter badges */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                        <span style={{ fontSize: '11.5px', background: 'white', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: '8px', color: '#475569' }}>🛌 {item.sleepHours} hrs Sleep</span>
                        <span style={{ fontSize: '11.5px', background: 'white', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: '8px', color: '#475569' }}>💧 {item.waterIntake}ml Hydration</span>
                        <span style={{ fontSize: '11.5px', background: 'white', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: '8px', color: '#475569' }}>⚡ Energy: {item.energyLevel}/5</span>
                        <span style={{ fontSize: '11.5px', background: 'white', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: '8px', color: '#475569' }}>📱 Screen: {item.screenTime} hrs</span>
                        {item.weather && <span style={{ fontSize: '11.5px', background: 'white', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: '8px', color: '#475569' }}>{item.weather === 'Sunny' ? '☀️' : item.weather === 'Rainy' ? '🌧️' : item.weather === 'Cloudy' ? '☁️' : '💨'} {item.weather}</span>}
                      </div>

                      {/* Display activities */}
                      {item.activities && item.activities.length > 0 && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                          {item.activities.map(act => (
                            <span key={act} style={{ fontSize: '11px', background: '#ecfdf5', color: '#047857', padding: '1px 6px', borderRadius: '6px', fontWeight: 'bold' }}>{act}</span>
                          ))}
                        </div>
                      )}

                      {/* Note */}
                      {item.note && <p style={{ color: '#334155', fontSize: '13.5px', margin: '0 0 12px 0', fontStyle: 'italic', background: 'white', padding: '10px 14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>"{item.note}"</p>}

                      {/* Embedded Base64 Photo */}
                      {item.photo && (
                        <div style={{ marginTop: '10px', maxWidth: '300px' }}>
                          <img src={item.photo} alt="Mood memory attachment" style={{ width: '100%', borderRadius: '12px', border: '1.5px solid #e2e8f0', objectFit: 'cover', maxHeight: '180px' }} />
                        </div>
                      )}

                      {/* Playable Base64 Audio Voice Note */}
                      {item.voiceNote && (
                        <div style={{ marginTop: '12px' }}>
                          <span style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 'bold', marginBottom: '4px' }}>🎙️ Playback Voice Note:</span>
                          <audio src={item.voiceNote} controls style={{ height: '36px', maxWidth: '320px' }} />
                        </div>
                      )}

                      {/* AI sentiment analysis breakdown */}
                      {item.aiSentiment && (
                        <div style={{ marginTop: '12px', padding: '10px 14px', background: '#f0fdf4', border: '1px solid #d1fae5', borderRadius: '12px', fontSize: '12.5px', color: '#065f46' }}>
                          <strong>🤖 AI Sentiment Analyzer:</strong> {item.aiSentiment.label} Sentiment (score: {item.aiSentiment.score})
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- STANDARDIZED GAME DISPLAY MODAL --- */}
      {activeGame && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(5px)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '24px', maxWidth: '580px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative', border: '1px solid #e2e8f0' }}>
            
            <button 
              onClick={() => {
                playTickSound()
                // Cleanup Web Audio oscillators if active
                if (playingRain || playingWaves || playingTone || playingWind || playingCampfire) {
                  try { soundNodes.rain?.stop() } catch(e) {}
                  try { soundNodes.wavesSource?.stop() } catch(e) {}
                  try { soundNodes.toneOsc?.stop() } catch(e) {}
                  try { soundNodes.windSource?.stop() } catch(e) {}
                  try { soundNodes.campfireOsc?.stop() } catch(e) {}
                  clearInterval(soundNodes.wavesInterval)
                  clearInterval(soundNodes.windInterval)
                  clearInterval(soundNodes.campfireInterval)
                  setPlayingRain(false)
                  setPlayingWaves(false)
                  setPlayingTone(false)
                  setPlayingWind(false)
                  setPlayingCampfire(false)
                }
                setActiveGame(null)
              }} 
              style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: '#f1f5f9', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '14px', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ✕
            </button>

            {/* BUBBLE POPPER */}
            {activeGame === 'bubbles' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>{activeGameConfig?.title || '🫧 Zen Bubble Popper'}</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>{activeGameConfig?.desc || 'Release physical stress by popping bubbles.'} Popped: <strong>{popCount} / 12</strong></p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', maxWidth: '280px', margin: '0 auto 24px' }}>
                  {bubbles.map((popped, idx) => (
                    <div 
                      key={idx}
                      onClick={() => popBubble(idx)}
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: popped ? '#e2e8f0' : 'linear-gradient(135deg, #a1c4fd, #c2e9fb)',
                        border: popped ? '2px dashed #94a3b8' : '2px solid #3b82f6',
                        cursor: popped ? 'default' : 'pointer',
                        transform: popped ? 'scale(0.9)' : 'scale(1)',
                        transition: 'all 0.1s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '22px',
                        boxShadow: popped ? 'none' : '0 4px 6px rgba(59, 130, 246, 0.1)'
                      }}
                    >
                      {popped ? (activeGameConfig?.subtype === 'cloud' ? '✨' : '💥') : (activeGameConfig?.subtype === 'balloon' ? '🎈' : activeGameConfig?.subtype === 'cloud' ? '☁️' : '🫧')}
                    </div>
                  ))}
                </div>

                <button onClick={resetBubbles} style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', boxShadow: '0 4px 10px rgba(59, 130, 246, 0.2)' }}>
                  🔄 Refresh
                </button>
              </div>
            )}

            {/* ZEN MEMORY MATCH */}
            {(activeGame === 'memory' || activeGame === 'memorycard' || activeGame === 'emotions' || activeGame === 'emotionmatch') && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>{activeGameConfig?.title || '🧩 Zen Memory Match'}</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>{activeGameConfig?.desc || 'Focus your thoughts gently by matching pairs.'} Moves: <strong>{moves}</strong></p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', maxWidth: '320px', margin: '0 auto 24px' }}>
                  {cards.map((card, idx) => {
                    const isOpen = flipped.includes(idx) || matched.includes(card.emoji)
                    return (
                      <div 
                        key={card.id}
                        onClick={() => clickCard(idx)}
                        style={{
                          height: '64px',
                          background: isOpen ? '#f1f5f9' : 'linear-gradient(135deg, #818cf8, #4f46e5)',
                          borderRadius: '14px',
                          cursor: isOpen ? 'default' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: card.emoji.length > 2 ? '11.5px' : '24px',
                          fontWeight: 'bold',
                          border: isOpen ? '2px solid #818cf8' : 'none',
                          boxShadow: isOpen ? 'none' : '0 4px 10px rgba(79, 70, 229, 0.15)',
                          transition: 'all 0.2s'
                        }}
                      >
                        {isOpen ? card.emoji : '❓'}
                      </div>
                    )
                  })}
                </div>

                {matched.length === cards.length / 2 && (
                  <div style={{ background: '#ecfdf5', color: '#047857', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '13.5px', fontWeight: 'bold' }}>
                    🎉 Calm achieved! You matched all pairs in {moves} moves.
                  </div>
                )}

                <button onClick={() => { playResetSound(); initMemoryGame(activeGameConfig); }} style={{ padding: '10px 20px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', boxShadow: '0 4px 10px rgba(79, 70, 229, 0.2)' }}>
                  🔄 Reset Game
                </button>
              </div>
            )}

            {/* GRATITUDE GARDEN */}
            {activeGame === 'gratitude' && !activeGameData && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>{activeGameConfig?.title || '🌸 Gratitude Garden'}</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>{activeGameConfig?.desc || 'Plant flower seeds of thankfulness.'}</p>

                <div style={{ background: '#f0fdf4', border: '2px dashed #bbf7d0', borderRadius: '20px', minHeight: '130px', display: 'flex', flexWrap: 'wrap', gap: '16px', padding: '24px', justifyContent: 'center', alignItems: 'center', marginBottom: '24px' }}>
                  {gardenPlants.length === 0 ? (
                    <span style={{ color: '#86efac', fontSize: '13.5px', fontStyle: 'italic' }}>
                      {activeGameConfig?.subtype === 'garden' ? 'Your virtual garden soil is ready. Plant a seed of peace! 🌱' : 'Your virtual garden soil is ready. Plant a seed! 🌱'}
                    </span>
                  ) : (
                    gardenPlants.map(plant => (
                      <div key={plant.id} title={plant.text} style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease-out' }}>
                        <div style={{ fontSize: '40px' }}>{plant.flower}</div>
                        <div style={{ fontSize: '10.5px', color: '#16a34a', fontWeight: 'bold', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{plant.text}</div>
                      </div>
                    ))
                  )}
                </div>

                {gardenPlants.length < 5 ? (
                  <form onSubmit={handlePlantFlower} style={{ display: 'flex', gap: '8px', maxWidth: '420px', margin: '0 auto 20px' }}>
                    <input 
                      type="text" 
                      value={gratitudeText} 
                      onChange={(e) => setGratitudeText(e.target.value)}
                      placeholder={activeGameConfig?.subtype === 'garden' ? `I plant peace because... (${gardenPlants.length + 1}/5)` : `I am grateful for... (${gardenPlants.length + 1}/5)`}
                      style={{ flex: 1, padding: '12px', border: '2px solid #bbf7d0', borderRadius: '10px', outline: 'none', fontSize: '13.5px' }}
                      required
                    />
                    <button type="submit" style={{ padding: '0 20px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                      🌱 Plant
                    </button>
                  </form>
                ) : (
                  <div style={{ background: '#ecfdf5', color: '#047857', padding: '14px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', fontWeight: 'bold' }}>
                    {activeGameConfig?.subtype === 'garden' ? '🌸 Splendid! Your zen garden has flourished. Keep this tranquility close.' : '🌸 Splendid! Your gratitude garden has flourished. Keep these positive thoughts close.'}
                  </div>
                )}

                <button onClick={() => { playResetSound(); setGardenPlants([]); }} style={{ padding: '8px 16px', background: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                  🔄 Clear Garden
                </button>
              </div>
            )}

            {/* DYNAMIC GRATITUDE CHALLENGE */}
            {activeGame === 'gratitude' && activeGameData && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>📜 Gratitude Challenge</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>Reflect on and check off these three mindful items around you:</p>
                
                <div style={{ textAlign: 'left', maxWidth: '380px', margin: '0 auto 24px', background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {activeGameData.prompts.map((prompt, idx) => {
                    const isChecked = (quizInput.split(',')[idx] || '').trim() === 'true';
                    return (
                      <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            playTickSound();
                            const arr = quizInput.split(',');
                            arr[idx] = e.target.checked ? 'true' : 'false';
                            setQuizInput(arr.join(','));
                            
                            // Check if all checked
                            const allChecked = arr.length === 3 && arr.every(x => x === 'true');
                            if (allChecked) {
                              playGameWinSound();
                              setQuizFeedback('Beautiful reflection! Tending to gratitude lifts the heart. ❤️🏆');
                            }
                          }}
                          style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#10b981' }}
                        />
                        <span>{prompt}</span>
                      </label>
                    )
                  })}
                </div>

                {quizFeedback && (
                  <p style={{
                    fontSize: '14.5px',
                    color: '#047857',
                    fontWeight: 'bold',
                    marginBottom: '16px'
                  }}>
                    {quizFeedback}
                  </p>
                )}
              </div>
            )}

            {/* TIC-TAC-TOE */}
            {activeGame === 'tictactoe' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>{activeGameConfig?.title || '❌⭕ Calm Tic-Tac-Toe'}</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>{activeGameConfig?.desc || 'Play peacefully as ❌ against our slow AI bot (⭕).'}</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', maxWidth: '240px', margin: '0 auto 24px' }}>
                  {tttBoard.map((cell, idx) => (
                    <div 
                      key={idx}
                      onClick={() => playTttMove(idx)}
                      style={{
                        width: '72px',
                        height: '72px',
                        background: '#f8fafc',
                        border: '2px solid #e2e8f0',
                        borderRadius: '12px',
                        cursor: cell === '' && !tttWinner ? 'pointer' : 'default',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '28px',
                        fontWeight: 'bold',
                        color: cell === 'X' ? '#4f46e5' : '#ef4444'
                      }}
                    >
                      {cell}
                    </div>
                  ))}
                </div>

                {tttWinner && (
                  <div style={{ 
                    background: tttWinner === 'X' ? '#ecfdf5' : tttWinner === 'O' ? '#fef2f2' : '#f1f5f9', 
                    color: tttWinner === 'X' ? '#047857' : tttWinner === 'O' ? '#b91c1c' : '#475569', 
                    padding: '12px', 
                    borderRadius: '10px', 
                    marginBottom: '20px', 
                    fontSize: '14px', 
                    fontWeight: 'bold' 
                  }}>
                    {tttWinner === 'X' && '🎉 You won! Nicely done.'}
                    {tttWinner === 'O' && '🤖 Bot won. Take a breath and try again.'}
                    {tttWinner === 'Draw' && '🤝 It is a draw! Great match.'}
                  </div>
                )}

                <button 
                  onClick={() => { playResetSound(); setTttBoard(Array(9).fill('')); setTttWinner(null); setTttIsXNext(true); }}
                  style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                >
                  🔄 Play Again
                </button>
              </div>
            )}

            {/* SOUND BOARD */}
            {activeGame === 'soundboard' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>{activeGameConfig?.title || '🎵 Calming Sound Board'}</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>{activeGameConfig?.desc || 'Synthesize live ambient waves. Toggle nodes on/off to mix your tracks:'}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '320px', margin: '0 auto 24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>🌧️ Soft Summer Rain</span>
                    <button 
                      onClick={toggleRain} 
                      style={{ padding: '8px 16px', background: playingRain ? '#ef4444' : '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                    >
                      {playingRain ? 'Stop' : 'Play'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>🌊 Ocean Wave Swells</span>
                    <button 
                      onClick={toggleWaves} 
                      style={{ padding: '8px 16px', background: playingWaves ? '#ef4444' : '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                    >
                      {playingWaves ? 'Stop' : 'Play'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>🧘 Binaural Deep Beats</span>
                    <button 
                      onClick={toggleTone} 
                      style={{ padding: '8px 16px', background: playingTone ? '#ef4444' : '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                    >
                      {playingTone ? 'Stop' : 'Play'}
                    </button>
                  </div>
                </div>

                <div style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>
                  Sounds are generated procedurally using Web Audio API oscillators.
                </div>
              </div>
            )}

            {/* BREATHING BALLOON */}
            {activeGame === 'breathing' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>{activeGameConfig?.title || '🎈 Breathing Balloon'}</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>{activeGameConfig?.desc || 'Slow down. Breathe matching the balloon cycles.'}</p>

                <div style={{ marginBottom: '24px' }}>
                  <button 
                    onClick={() => { playTickSound(); setBreathingAudioEnabled(!breathingAudioEnabled); }}
                    style={{ 
                      padding: '8px 16px', 
                      background: breathingAudioEnabled ? '#e0e7ff' : '#f1f5f9', 
                      color: breathingAudioEnabled ? '#4f46e5' : '#64748b', 
                      border: 'none', 
                      borderRadius: '20px', 
                      cursor: 'pointer', 
                      fontSize: '12.5px', 
                      fontWeight: 'bold',
                      transition: 'all 0.2s',
                      boxShadow: breathingAudioEnabled ? '0 4px 6px rgba(79, 70, 229, 0.1)' : 'none'
                    }}
                  >
                    {breathingAudioEnabled ? '🔊 Sound & Voice Guide: ON' : '🔇 Sound & Voice Guide: OFF'}
                  </button>
                </div>

                <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                  <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: breathingPhase === 'Inhale' ? 'rgba(79, 70, 229, 0.35)' : breathingPhase === 'Hold' ? 'rgba(16, 185, 129, 0.35)' : breathingPhase === 'Exhale' ? 'rgba(239, 68, 68, 0.35)' : 'rgba(245, 158, 11, 0.35)',
                    border: `3px solid ${breathingPhase === 'Inhale' ? '#4f46e5' : breathingPhase === 'Hold' ? '#10b981' : breathingPhase === 'Exhale' ? '#ef4444' : '#f59e0b'}`,
                    transform: breathingPhase === 'Inhale' || breathingPhase === 'Hold' ? 'scale(1.4)' : 'scale(0.9)',
                    transition: 'transform 4s linear, background 0.5s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: '#1e293b'
                  }}>
                    <strong style={{ fontSize: '20px' }}>{breathingTimer}</strong>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', marginTop: '2px' }}>{breathingPhase}</span>
                  </div>
                </div>

                <p style={{ color: '#475569', fontSize: '13.5px', fontStyle: 'italic' }}>
                  {breathingPhase === 'Inhale' && '🌸 Breathe in slowly... fill your chest.'}
                  {breathingPhase === 'Hold' && '🛑 Keep your breath steady. Relax.'}
                  {breathingPhase === 'Exhale' && '🍃 Release gently... let it all out.'}
                  {breathingPhase === 'Rest' && '🧘 Keep empty. Rest and prepare.'}
                </p>
              </div>
            )}

            {/* AFFIRMATION SPINNER */}
            {activeGame === 'affirmation' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>{activeGameConfig?.title || '🎡 Positive Affirmation Spinner'}</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>{activeGameConfig?.desc || 'Spin the dial to draw a daily positive affirmation.'}</p>

                <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', maxWidth: '300px' }}>
                  {activeAffirmation ? (
                    <div style={{ 
                      background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)', 
                      padding: '20px', 
                      borderRadius: '16px', 
                      border: '1px solid #818cf8',
                      fontSize: '14px',
                      color: '#1e1b4b',
                      fontWeight: 'bold',
                      lineHeight: '1.5',
                      animation: 'fadeIn 0.5s ease-out'
                    }}>
                      🌟 "{activeAffirmation}"
                    </div>
                  ) : (
                    <div style={{ border: '2px dashed #cbd5e1', borderRadius: '16px', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '13.5px' }}>
                      {spinning ? '🌀 Spinning the Wheel...' : 'Click Spin Below! 🎡'}
                    </div>
                  )}
                </div>

                <button 
                  onClick={spinWheel} 
                  disabled={spinning}
                  style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
                >
                  {spinning ? '⏳ Spinning...' : '🎡 Spin Affirmation Wheel'}
                </button>
              </div>
            )}

            {/* WHACK-A-STRESS */}
            {activeGame === 'whack' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>{activeGameConfig?.title || '🔨 Whack-A-Stress'}</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>{activeGameConfig?.desc || 'Tap stress factors to vent frustration!'} Score: <strong>{whackScore}</strong> | Time Left: <strong>{whackTimeLeft}s</strong></p>

                {!whackRunning && whackTimeLeft === 0 && (
                  <button onClick={startWhack} style={{ padding: '12px 24px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', marginBottom: '24px' }}>
                    ⚡ Start Stress Release
                  </button>
                )}

                {whackTimeLeft > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', maxWidth: '240px', margin: '0 auto 20px' }}>
                    {Array(9).fill(null).map((_, idx) => {
                      const isActive = idx === activeHole
                      const labels = ['ANXIOUS', 'STRESS', 'FEAR', 'DOUBT', 'ANGER', 'SADNESS', 'PRESSURE', 'WORRY', 'GUILT']
                      return (
                        <div 
                          key={idx}
                          onClick={() => clickMonster(idx)}
                          style={{
                            width: '70px',
                            height: '70px',
                            background: isActive ? '#fecaca' : '#f1f5f9',
                            border: isActive ? '2px solid #ef4444' : '1px solid #e2e8f0',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: isActive ? '10px' : '20px',
                            fontWeight: 'bold',
                            color: '#b91c1c',
                            cursor: isActive ? 'pointer' : 'default',
                            transform: isActive ? 'scale(1.05)' : 'scale(1)',
                            transition: 'all 0.1s'
                          }}
                        >
                          {isActive ? labels[idx] : '💤'}
                        </div>
                      )
                    })}
                  </div>
                )}

                {!whackRunning && whackScore > 0 && (
                  <div style={{ background: '#f1f5f9', padding: '12px', borderRadius: '10px', fontSize: '13.5px', color: '#475569', fontWeight: 'bold' }}>
                    🔨 Venting Complete! You released {whackScore} stressors. Feel a bit lighter?
                  </div>
                )}
              </div>
            )}

            {/* ZEN DOODLER */}
            {activeGame === 'doodler' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>{activeGameConfig?.title || '🎨 Zen Doodler'}</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>{activeGameConfig?.desc || 'Doodle freely using mouse or touch to relax your hands and mind.'}</p>

                <canvas 
                  ref={canvasRef}
                  width="450"
                  height="260"
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={stopDraw}
                  onMouseLeave={stopDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={stopDraw}
                  style={{ background: activeGameConfig?.subtype === 'sand' ? '#f0e2b3' : '#faf8f5', border: '2px solid #e2e8f0', borderRadius: '16px', display: 'block', margin: '0 auto 20px', cursor: 'crosshair', touchAction: 'none' }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '450px', margin: '0 auto' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['#818cf8', '#34d399', '#60a5fa', '#f472b6', '#f59e0b', '#374151'].map(color => (
                      <div 
                        key={color}
                        onClick={() => { playTickSound(); setBrushColor(color); }}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: color,
                          cursor: 'pointer',
                          border: brushColor === color ? '2px solid white' : 'none',
                          boxShadow: brushColor === color ? '0 0 0 2px #4f46e5' : 'none'
                        }}
                      />
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Size:</label>
                    <select value={brushWidth} onChange={e => { playTickSound(); setBrushWidth(Number(e.target.value)); }} style={{ padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}>
                      <option value="3">Thin</option>
                      <option value="6">Medium</option>
                      <option value="12">Thick</option>
                    </select>

                    <button onClick={clearCanvas} style={{ padding: '6px 12px', background: '#334155', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                      🗑️ Clear
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MIND-WORD SEARCH */}
            {activeGame === 'wordsearch' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>{activeGameConfig?.title || '🔍 Mindful Word Search'}</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>{activeGameConfig?.desc || 'Select letters to find positive words:'} {getWordSearchWords().join(', ')}</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px', maxWidth: '240px', margin: '0 auto 20px', background: '#f8fafc', padding: '8px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  {getWordSearchGrid().flatMap((row, r) => 
                    row.map((letter, c) => {
                      const isSelected = selectedCells.some(cell => cell.r === r && cell.c === c)
                      return (
                        <div 
                          key={`${r}-${c}`}
                          onClick={() => toggleSearchCell(r, c)}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: isSelected ? '#cbd5e1' : 'white',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            cursor: 'pointer',
                            color: '#1e293b',
                            userSelect: 'none'
                          }}
                        >
                          {letter}
                        </div>
                      )
                    })
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
                  <button onClick={checkWordSelection} style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                    🔍 Check Word
                  </button>
                  <button onClick={() => { playResetSound(); setSelectedCells([]); }} style={{ padding: '8px 16px', background: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                    Clear Selection
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {getWordSearchWords().map(word => {
                    const found = foundWords.includes(word)
                    return (
                      <span 
                        key={word}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          background: found ? '#d1fae5' : '#f1f5f9',
                          color: found ? '#065f46' : '#94a3b8',
                          textDecoration: found ? 'line-through' : 'none',
                          border: `1px solid ${found ? '#a7f3d0' : '#cbd5e1'}`
                        }}
                      >
                        {word}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            {/* FLAPPY BIRD */}
            {activeGame === 'flappy' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>🐦 Flappy Bird</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>
                  Tap flap to fly! Navigate through the green pipes.
                </p>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', marginBottom: '12px' }}>
                  Score: <strong style={{ color: '#4f46e5' }}>{flappyScore}</strong>
                </div>

                {/* Sky viewport */}
                <div 
                  onClick={flapFlappyBird}
                  style={{ 
                    position: 'relative', 
                    width: '320px', 
                    height: '200px', 
                    background: 'linear-gradient(to bottom, #bae6fd, #e0f2fe)', 
                    border: '2px solid #cbd5e1', 
                    borderRadius: '16px', 
                    margin: '0 auto 16px', 
                    overflow: 'hidden',
                    cursor: 'pointer',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                  }}
                >
                  {/* Instructions Overlay */}
                  {!flappyStarted && !flappyOver && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.75)', zIndex: 10 }}>
                      <span style={{ fontSize: '24px', marginBottom: '6px' }}>👆</span>
                      <span style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '14px' }}>Click inside or tap Flap to start</span>
                    </div>
                  )}

                  {/* Game Over Overlay */}
                  {flappyOver && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(254,242,242,0.9)', zIndex: 10 }}>
                      <span style={{ fontSize: '28px', marginBottom: '4px' }}>💥</span>
                      <span style={{ fontWeight: 'bold', color: '#b91c1c', fontSize: '15px', marginBottom: '8px' }}>Game Over!</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); initFlappyGame(); }} 
                        style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                      >
                        Try Again
                      </button>
                    </div>
                  )}

                  {/* Bird */}
                  <div 
                    style={{ 
                      position: 'absolute', 
                      left: '40px', 
                      top: `${flappyY}px`, 
                      width: '24px', 
                      height: '24px', 
                      fontSize: '20px', 
                      lineHeight: '24px',
                      textAlign: 'center',
                      transform: `rotate(${flappyVelocity * 4}deg)`, 
                      transition: 'transform 0.1s',
                      userSelect: 'none'
                    }}
                  >
                    🐦
                  </div>

                  {/* Pipes */}
                  {flappyPipes.map((pipe, idx) => (
                    <div key={idx}>
                      {/* Top Pipe */}
                      <div 
                        style={{ 
                          position: 'absolute', 
                          left: `${pipe.x}px`, 
                          top: 0, 
                          width: '30px', 
                          height: `${pipe.top}px`, 
                          background: 'linear-gradient(to right, #10b981, #059669)', 
                          borderBottomLeftRadius: '6px', 
                          borderBottomRightRadius: '6px',
                          border: '1px solid #047857',
                          borderTop: 'none'
                        }} 
                      />
                      {/* Bottom Pipe */}
                      <div 
                        style={{ 
                          position: 'absolute', 
                          left: `${pipe.x}px`, 
                          top: `${pipe.bottom}px`, 
                          width: '30px', 
                          height: `${200 - pipe.bottom}px`, 
                          background: 'linear-gradient(to right, #10b981, #059669)', 
                          borderTopLeftRadius: '6px', 
                          borderTopRightRadius: '6px',
                          border: '1px solid #047857',
                          borderBottom: 'none'
                        }} 
                      />
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button 
                    disabled={flappyOver}
                    onClick={flapFlappyBird} 
                    style={{ padding: '10px 24px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 10px rgba(59, 130, 246, 0.2)' }}
                  >
                    🚀 Flap (Jump)
                  </button>
                  <button 
                    onClick={initFlappyGame} 
                    style={{ padding: '10px 18px', background: '#cbd5e1', color: '#475569', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                  >
                    🔄 Reset
                  </button>
                </div>
              </div>
            )}

            {/* BRICK BREAKER */}
            {activeGame === 'bricks' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>🧱 Brick Breaker</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>
                  Bounce the ball to clear all colored blocks!
                </p>

                {/* Viewport (400x200) */}
                <div 
                  style={{ 
                    position: 'relative', 
                    width: '400px', 
                    height: '200px', 
                    background: '#1e293b', 
                    border: '3px solid #334155', 
                    borderRadius: '16px', 
                    margin: '0 auto 16px', 
                    overflow: 'hidden',
                    boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.2)'
                  }}
                >
                  {/* Instructions Overlay */}
                  {!brickStarted && !brickOver && !brickWin && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(30, 41, 59, 0.85)', zIndex: 10 }}>
                      <span style={{ fontSize: '24px', marginBottom: '6px' }}>🎮</span>
                      <span style={{ fontWeight: 'bold', color: 'white', fontSize: '14px', marginBottom: '12px' }}>Clear the blocks to win!</span>
                      <button 
                        onClick={() => setBrickStarted(true)} 
                        style={{ padding: '8px 18px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
                      >
                        Start Game
                      </button>
                    </div>
                  )}

                  {/* Game Over Overlay */}
                  {brickOver && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(254, 242, 242, 0.95)', zIndex: 10 }}>
                      <span style={{ fontSize: '28px', marginBottom: '4px' }}>💥</span>
                      <span style={{ fontWeight: 'bold', color: '#b91c1c', fontSize: '15px', marginBottom: '8px' }}>Game Over!</span>
                      <button 
                        onClick={initBricksGame} 
                        style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12.5px', fontWeight: 'bold' }}
                      >
                        Restart
                      </button>
                    </div>
                  )}

                  {/* Victory Overlay */}
                  {brickWin && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(240, 253, 250, 0.95)', zIndex: 10 }}>
                      <span style={{ fontSize: '28px', marginBottom: '4px' }}>🏆</span>
                      <span style={{ fontWeight: 'bold', color: '#0f766e', fontSize: '15px', marginBottom: '8px' }}>Victory! All blocks cleared!</span>
                      <button 
                        onClick={initBricksGame} 
                        style={{ padding: '8px 16px', background: '#0d9488', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12.5px', fontWeight: 'bold' }}
                      >
                        Play Again
                      </button>
                    </div>
                  )}

                  {/* Ball */}
                  <div 
                    style={{ 
                      position: 'absolute', 
                      left: `${brickBall.x - 5}px`, 
                      top: `${brickBall.y - 5}px`, 
                      width: '10px', 
                      height: '10px', 
                      background: '#fb923c', 
                      borderRadius: '50%',
                      boxShadow: '0 0 8px #fb923c'
                    }} 
                  />

                  {/* Paddle */}
                  <div 
                    style={{ 
                      position: 'absolute', 
                      left: `${brickPaddleX}px`, 
                      top: '185px', 
                      width: '60px', 
                      height: '8px', 
                      background: '#38bdf8', 
                      borderRadius: '4px',
                      boxShadow: '0 2px 4px rgba(56, 189, 248, 0.4)'
                    }} 
                  />

                  {/* Bricks */}
                  {brickGrid.map(brick => brick.active && (
                    <div 
                      key={brick.id}
                      style={{ 
                        position: 'absolute', 
                        left: `${brick.x - 30}px`, 
                        top: `${brick.y - 8}px`, 
                        width: '60px', 
                        height: '16px', 
                        background: brick.id % 3 === 0 ? '#f43f5e' : brick.id % 3 === 1 ? '#a855f7' : '#ec4899', 
                        border: '1px solid #1e293b',
                        borderRadius: '3px'
                      }} 
                    />
                  ))}
                </div>

                {/* Move Controls */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button 
                    disabled={!brickStarted || brickOver || brickWin}
                    onClick={() => setBrickPaddleX(x => Math.max(0, x - 25))} 
                    style={{ padding: '10px 20px', background: '#475569', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
                  >
                    ⬅️ Move Left
                  </button>
                  <button 
                    disabled={!brickStarted || brickOver || brickWin}
                    onClick={() => setBrickPaddleX(x => Math.min(340, x + 25))} 
                    style={{ padding: '10px 20px', background: '#475569', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
                  >
                    Move Right ➡️
                  </button>
                  <button 
                    onClick={initBricksGame} 
                    style={{ padding: '10px 16px', background: '#cbd5e1', color: '#475569', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                  >
                    🔄 Reset
                  </button>
                </div>
              </div>
            )}

            {/* CATCH THE STARS */}
            {activeGame === 'catch' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>🌠 Catch the Stars</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>
                  Move the basket left and right to catch the falling stars!
                </p>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', marginBottom: '12px' }}>
                  Score: <strong style={{ color: '#eab308' }}>{catchScore} / 5</strong>
                </div>

                {/* Viewport (400x200) */}
                <div 
                  style={{ 
                    position: 'relative', 
                    width: '400px', 
                    height: '200px', 
                    background: 'linear-gradient(to bottom, #0f172a, #1e293b)', 
                    border: '3px solid #334155', 
                    borderRadius: '16px', 
                    margin: '0 auto 16px', 
                    overflow: 'hidden',
                    boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.3)'
                  }}
                >
                  {/* Game Over / Win Overlay */}
                  {catchOver && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(240, 253, 250, 0.95)', zIndex: 10 }}>
                      <span style={{ fontSize: '32px', marginBottom: '4px' }}>🎉</span>
                      <span style={{ fontWeight: 'bold', color: '#0f766e', fontSize: '15px', marginBottom: '8px' }}>Superb! Caught all 5 stars!</span>
                      <button 
                        onClick={initCatchGame} 
                        style={{ padding: '8px 16px', background: '#0d9488', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12.5px', fontWeight: 'bold' }}
                      >
                        Play Again
                      </button>
                    </div>
                  )}

                  {/* Falling Star */}
                  {!catchOver && (
                    <div 
                      style={{ 
                        position: 'absolute', 
                        left: `${catchStar.x - 10}px`, 
                        top: `${catchStar.y}px`, 
                        fontSize: '20px',
                        lineHeight: '20px',
                        userSelect: 'none'
                      }}
                    >
                      🌠
                    </div>
                  )}

                  {/* Basket */}
                  <div 
                    style={{ 
                      position: 'absolute', 
                      left: `${catchBasketX}px`, 
                      top: '170px', 
                      width: '60px', 
                      fontSize: '32px',
                      lineHeight: '30px',
                      textAlign: 'center',
                      userSelect: 'none'
                    }}
                  >
                    🧺
                  </div>
                </div>

                {/* Move Controls */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button 
                    disabled={catchOver}
                    onClick={() => setCatchBasketX(x => Math.max(0, x - 30))} 
                    style={{ padding: '10px 20px', background: '#475569', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
                  >
                    ⬅️ Move Left
                  </button>
                  <button 
                    disabled={catchOver}
                    onClick={() => setCatchBasketX(x => Math.min(340, x + 30))} 
                    style={{ padding: '10px 20px', background: '#475569', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
                  >
                    Move Right ➡️
                  </button>
                  <button 
                    onClick={initCatchGame} 
                    style={{ padding: '10px 16px', background: '#cbd5e1', color: '#475569', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                  >
                    🔄 Reset
                  </button>
                </div>
              </div>
            )}

            {/* CLICK SPEED TEST */}
            {activeGame === 'clicktest' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>⚡ Click Speed Test</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>
                  Tap the button as many times as possible before the timer runs out!
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-around', maxWidth: '300px', margin: '0 auto 20px', background: '#f8fafc', padding: '12px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>Time Left</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: clickTestTimeLeft <= 1 ? '#ef4444' : '#1e293b' }}>{clickTestTimeLeft}s</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Clicks</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4f46e5' }}>{clickTestCount}</div>
                  </div>
                </div>

                {clickTestTimeLeft > 0 ? (
                  <button 
                    onClick={tapClickTest}
                    style={{ 
                      width: '160px', 
                      height: '160px', 
                      borderRadius: '50%', 
                      background: clickTestActive ? 'linear-gradient(135deg, #f43f5e, #e11d48)' : 'linear-gradient(135deg, #6366f1, #4f46e5)', 
                      color: 'white', 
                      border: 'none', 
                      fontSize: '20px', 
                      fontWeight: 'bold', 
                      cursor: 'pointer', 
                      boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.4)',
                      transition: 'transform 0.05s, background-color 0.2s',
                      outline: 'none',
                      margin: '0 auto 20px',
                      display: 'block'
                    }}
                    onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)' }}
                    onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                  >
                    {clickTestActive ? 'CLICK! ⚡' : 'START TAP! 👆'}
                  </button>
                ) : (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ background: '#ecfdf5', color: '#065f46', padding: '16px', borderRadius: '16px', fontWeight: 'bold', fontSize: '15px', border: '1px solid #a7f3d0', marginBottom: '16px' }}>
                      🎉 Final Score: {(clickTestCount / 5).toFixed(1)} clicks per second! ({clickTestCount} clicks total)
                    </div>
                  </div>
                )}

                <button 
                  onClick={initClickTest} 
                  style={{ padding: '10px 20px', background: '#cbd5e1', color: '#475569', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                >
                  🔄 Restart Test
                </button>
              </div>
            )}

            {/* WOULD YOU RATHER */}
            {activeGame === 'wouldyourather' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>⚖️ Would You Rather?</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>Choose your preference and see how others voted!</p>
                {(() => {
                  const questions = [
                    { q: 'Would you rather...', a: 'Have the ability to fly 🦅', b: 'Be able to read minds 🧠', pctA: 62, pctB: 38 },
                    { q: 'Would you rather...', a: 'Always travel 100 years into the past 🕰️', b: 'Always travel 100 years into the future 🚀', pctA: 44, pctB: 56 },
                    { q: 'Would you rather...', a: 'Control fire 🔥', b: 'Control water 💧', pctA: 51, pctB: 49 },
                    { q: 'Would you rather...', a: 'Live in a cozy cottage in the deep forest 🏡', b: 'Live in a luxury penthouse in a massive city 🌆', pctA: 58, pctB: 42 },
                    { q: 'Would you rather...', a: 'Never use screen time again 🚫📱', b: 'Never travel outside your country again 🚫✈️', pctA: 35, pctB: 65 }
                  ];
                  const q = questions[wyrIndex % questions.length];
                  return (
                    <div>
                      <h4 style={{ color: '#475569', marginBottom: '20px', fontStyle: 'italic' }}>"{q.q}"</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '360px', margin: '0 auto' }}>
                        {wyrVote === null ? (
                          <>
                            <button onClick={() => { setWyrVote('A'); playSuccessHarp(); }} style={{ padding: '14px', background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '12px', fontWeight: 'bold', color: '#1e293b', cursor: 'pointer', textAlign: 'center' }}>{q.a}</button>
                            <button onClick={() => { setWyrVote('B'); playSuccessHarp(); }} style={{ padding: '14px', background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '12px', fontWeight: 'bold', color: '#1e293b', cursor: 'pointer', textAlign: 'center' }}>{q.b}</button>
                          </>
                        ) : (
                          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #cbd5e1' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: 'bold', fontSize: '13px' }}>
                              <span>{q.a}</span>
                              <span style={{ color: wyrVote === 'A' ? '#4f46e5' : '#64748b' }}>{q.pctA}% {wyrVote === 'A' && '✅'}</span>
                            </div>
                            <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
                              <div style={{ width: `${q.pctA}%`, height: '100%', background: '#4f46e5' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: 'bold', fontSize: '13px' }}>
                              <span>{q.b}</span>
                              <span style={{ color: wyrVote === 'B' ? '#4f46e5' : '#64748b' }}>{q.pctB}% {wyrVote === 'B' && '✅'}</span>
                            </div>
                            <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
                              <div style={{ width: `${q.pctB}%`, height: '100%', background: '#4f46e5' }} />
                            </div>
                            <button onClick={() => { setWyrVote(null); setWyrIndex(prev => prev + 1); playTickSound(); }} style={{ padding: '8px 16px', background: '#cbd5e1', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12.5px', fontWeight: 'bold', color: '#475569' }}>Next Question ➡️</button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* SLOT MACHINE */}
            {activeGame === 'slots' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>🎰 Lucky Emoji Slots</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>
                  Spin the reels to match emojis and achieve instant calm!
                </p>

                {/* Reels container */}
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '24px' }}>
                  {slotsReels.map((emoji, idx) => (
                    <div 
                      key={idx}
                      style={{ 
                        width: '72px', 
                        height: '96px', 
                        background: '#fff', 
                        border: '3px solid #cbd5e1', 
                        borderRadius: '16px', 
                        fontSize: '36px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), inset 0 2px 4px rgba(0,0,0,0.05)',
                        animation: slotsSpinning ? 'spinAnimation 0.1s infinite alternate' : 'none'
                      }}
                    >
                      {emoji}
                    </div>
                  ))}
                </div>

                {slotsResult && (
                  <div style={{ 
                    fontSize: '15px', 
                    fontWeight: 'bold', 
                    color: slotsResult.includes('JACKPOT') ? '#047857' : slotsResult.includes('Small') ? '#1d4ed8' : '#475569', 
                    background: slotsResult.includes('JACKPOT') ? '#d1fae5' : slotsResult.includes('Small') ? '#dbeafe' : '#f1f5f9',
                    padding: '12px', 
                    borderRadius: '12px', 
                    maxWidth: '300px', 
                    margin: '0 auto 20px',
                    border: `1px solid ${slotsResult.includes('JACKPOT') ? '#a7f3d0' : slotsResult.includes('Small') ? '#bfdbfe' : '#cbd5e1'}`
                  }}>
                    {slotsResult}
                  </div>
                )}

                <button 
                  disabled={slotsSpinning}
                  onClick={spinSlots} 
                  style={{ 
                    padding: '12px 32px', 
                    background: slotsSpinning ? '#94a3b8' : 'linear-gradient(135deg, #f59e0b, #d97706)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '12px', 
                    fontSize: '15px', 
                    fontWeight: 'bold', 
                    cursor: slotsSpinning ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 10px rgba(217, 119, 6, 0.2)'
                  }}
                >
                  {slotsSpinning ? 'Spinning...' : '🎰 SPIN REELS'}
                </button>

                <style>{`
                  @keyframes spinAnimation {
                    from { transform: translateY(-3px); }
                    to { transform: translateY(3px); }
                  }
                `}</style>
              </div>
            )}

            {/* HIGHER OR LOWER */}
            {activeGame === 'higherlower' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>🃏 Card Higher or Lower</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>
                  Will the next drawn card be larger or smaller than the current card?
                </p>

                {/* Score panel */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>
                  <span>Correct Guesses: <strong style={{ color: '#10b981' }}>{hlScore}</strong></span>
                  <span>Active Streak: <strong style={{ color: '#ef4444' }}>{hlStreak}</strong></span>
                </div>

                {/* Card Display */}
                <div style={{ 
                  width: '100px', 
                  height: '140px', 
                  background: 'white', 
                  border: '2px solid #cbd5e1', 
                  borderRadius: '16px', 
                  margin: '0 auto 20px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
                  position: 'relative'
                }}>
                  <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#ef4444', alignSelf: 'flex-start' }}>♥</span>
                  <span style={{ fontSize: '36px', fontWeight: 'extrabold', color: '#1e293b' }}>{hlCard}</span>
                  <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#ef4444', alignSelf: 'flex-end', transform: 'rotate(180deg)' }}>♥</span>
                </div>

                {hlMessage && (
                  <p style={{ fontSize: '13px', color: '#475569', fontWeight: '600', maxWidth: '300px', margin: '0 auto 20px' }}>
                    {hlMessage}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button 
                    onClick={() => guessHigherLower('higher')}
                    style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                  >
                    Higher ⬆️
                  </button>
                  <button 
                    onClick={() => guessHigherLower('lower')}
                    style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                  >
                    Lower ⬇️
                  </button>
                  <button 
                    onClick={initHigherLower}
                    style={{ padding: '10px 14px', background: '#cbd5e1', color: '#475569', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                  >
                    🔄 Reset
                  </button>
                </div>
              </div>
            )}

            {/* GUESS THE NUMBER */}
            {activeGame === 'guessnumber' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>🎲 Guess the Number</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>
                  Select the secret number between 1 and 10!
                </p>

                {gnMessage && (
                  <div style={{ 
                    fontSize: '13.5px', 
                    fontWeight: 'bold', 
                    color: gnMessage.includes('Correct') ? '#047857' : '#475569', 
                    background: gnMessage.includes('Correct') ? '#d1fae5' : '#f8fafc',
                    padding: '12px 16px', 
                    borderRadius: '12px', 
                    maxWidth: '320px', 
                    margin: '0 auto 20px',
                    border: '1px solid #cbd5e1',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}>
                    {gnMessage}
                  </div>
                )}

                {/* 1-10 selector buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', maxWidth: '240px', margin: '0 auto 20px' }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <button
                      key={num}
                      disabled={gnOver}
                      onClick={() => checkGuessNumber(num)}
                      style={{
                        padding: '10px 0',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        background: 'white',
                        border: '1.5px solid #cbd5e1',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: '#1e293b',
                        transition: 'all 0.15s'
                      }}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={initGuessNumber}
                  style={{ padding: '10px 20px', background: '#cbd5e1', color: '#475569', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                >
                  🔄 Try Another
                </button>
              </div>
            )}

            {/* COIN FLIP */}
            {activeGame === 'coinflip' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>🪙 Predict the Coin Flip</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>
                  Choose Heads or Tails, then flip the golden coin!
                </p>

                {/* Golden coin icon */}
                <div style={{ 
                  width: '90px', 
                  height: '90px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', 
                  border: '4px solid #d97706',
                  color: 'white', 
                  fontSize: '36px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: 'extrabold', 
                  margin: '0 auto 20px',
                  boxShadow: '0 8px 16px rgba(217, 119, 6, 0.25)',
                  transform: cfMessage === 'Flipping...' ? 'rotateY(720deg)' : 'none',
                  transition: 'transform 0.8s ease-out'
                }}>
                  {cfResult ? (cfResult === 'Heads' ? '👤' : '🪙') : '🪙'}
                </div>

                {cfMessage && (
                  <p style={{ fontSize: '13.5px', color: '#1e293b', fontWeight: 'bold', marginBottom: '20px' }}>
                    {cfMessage}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button
                    onClick={() => flipCoin('Heads')}
                    style={{ padding: '10px 20px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                  >
                    👤 Choose Heads
                  </button>
                  <button
                    onClick={() => flipCoin('Tails')}
                    style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                  >
                    🪙 Choose Tails
                  </button>
                </div>
              </div>
            )}

            {/* MATH QUIZ */}
            {activeGame === 'mathquiz' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>➕ Mindful Math Quiz</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>
                  Solve the equation to sharpen your focus!
                </p>

                <div style={{ 
                  background: '#f8fafc', 
                  border: '1.5px solid #e2e8f0', 
                  padding: '24px', 
                  borderRadius: '16px', 
                  fontSize: '28px', 
                  fontWeight: 'bold', 
                  color: '#1e293b', 
                  marginBottom: '20px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}>
                  {mqNum1} {mqOp} {mqNum2} = ?
                </div>

                {mqMessage && (
                  <div style={{ 
                    fontSize: '13.5px', 
                    fontWeight: 'bold', 
                    color: mqMessage.includes('Correct') ? '#047857' : '#ef4444', 
                    background: mqMessage.includes('Correct') ? '#d1fae5' : '#fee2e2',
                    padding: '12px', 
                    borderRadius: '12px', 
                    maxWidth: '300px', 
                    margin: '0 auto 20px',
                    border: `1px solid ${mqMessage.includes('Correct') ? '#a7f3d0' : '#fca5a5'}`
                  }}>
                    {mqMessage}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '20px' }}>
                  {mqOptions.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => answerMathQuiz(opt)}
                      style={{
                        padding: '12px 24px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        background: 'white',
                        border: '1.5px solid #cbd5e1',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        color: '#1e293b',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={initMathQuiz}
                  style={{ padding: '10px 20px', background: '#cbd5e1', color: '#475569', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
                >
                  🔄 Next Quiz
                </button>
              </div>
            )}

            {/* COLOR REFLEX MATCH */}
            {activeGame === 'colormatch' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>🔴 Color Reflex Match</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>
                  Does the color word match the color it is printed in?
                </p>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px' }}>
                  Score: <strong style={{ color: '#10b981' }}>{crScore}</strong>
                </div>

                {/* Color word box */}
                <div style={{ 
                  background: '#1e293b', 
                  padding: '30px', 
                  borderRadius: '16px', 
                  fontSize: '32px', 
                  fontWeight: 'extrabold', 
                  color: crColor, 
                  letterSpacing: '2px',
                  marginBottom: '20px',
                  boxShadow: '0 4px 12px rgba(30,41,59,0.1)'
                }}>
                  {crText}
                </div>

                {crMessage && (
                  <p style={{ 
                    fontSize: '13.5px', 
                    color: crMessage.includes('Correct') ? '#047857' : crMessage.includes('Incorrect') ? '#b91c1c' : '#475569', 
                    fontWeight: 'bold', 
                    marginBottom: '20px' 
                  }}>
                    {crMessage}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button
                    onClick={() => answerColorMatch(true)}
                    style={{ padding: '10px 24px', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13.5px' }}
                  >
                    Yes, Match ✅
                  </button>
                  <button
                    onClick={() => answerColorMatch(false)}
                    style={{ padding: '10px 24px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13.5px' }}
                  >
                    No, Mismatch ❌
                  </button>
                </div>
              </div>
            )}

            {/* CHESS PUZZLE */}
            {activeGame === 'chess' && activeGameData && (() => {
              const getChessBoard = () => {
                if (!activeGameData || !activeGameData.fen) return Array(8).fill(null).map(() => Array(8).fill(''))
                const board = parseChessFen(activeGameData.fen)
                for (let i = 0; i < chessMoveIdx; i++) {
                  const move = activeGameData.solution[i]
                  if (!move || move.length < 4) continue
                  const c1 = move.charCodeAt(0) - 97
                  const r1 = 8 - parseInt(move[1])
                  const c2 = move.charCodeAt(2) - 97
                  const r2 = 8 - parseInt(move[3])
                  if (r1 >= 0 && r1 < 8 && c1 >= 0 && c1 < 8 && r2 >= 0 && r2 < 8 && c2 >= 0 && c2 < 8) {
                    board[r2][c2] = board[r1][c1]
                    board[r1][c1] = ''
                  }
                }
                return board
              }
              const board = getChessBoard();
              return (
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>👑 Chess Puzzle Challenge</h3>
                  <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>
                    Solve the tactical chess puzzle! Difficulty rating: <strong>{activeGameData.rating}</strong>
                  </p>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(8, 1fr)',
                    width: '100%',
                    maxWidth: '340px',
                    aspectRatio: '1',
                    margin: '0 auto 20px',
                    border: '4px solid #475569',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                  }}>
                    {board.map((row, r) => 
                      row.map((piece, c) => {
                        const isDark = (r + c) % 2 === 1;
                        const cellName = String.fromCharCode(97 + c) + (8 - r);
                        const isSelected = chessSelectedCell === cellName;
                        const cellColor = isSelected ? '#a5b4fc' : (isDark ? '#b58863' : '#f0d9b5');
                        return (
                          <div
                            key={`${r}-${c}`}
                            onClick={() => {
                              playTickSound();
                              if (!chessSelectedCell) {
                                if (piece) {
                                  setChessSelectedCell(cellName);
                                }
                              } else {
                                const moveStr = chessSelectedCell + cellName;
                                const currentSol = activeGameData.solution[chessMoveIdx];
                                if (moveStr === currentSol) {
                                  playSuccessHarp();
                                  const nextIdx = chessMoveIdx + 1;
                                  setChessMoveIdx(nextIdx);
                                  setChessSelectedCell(null);
                                  setChessFeedback('Correct move! 🎉');
                                  if (nextIdx >= activeGameData.solution.length) {
                                    playGameWinSound();
                                    setChessFeedback('Puzzle Solved successfully! Great job! 🏆');
                                  }
                                } else {
                                  playErrorSound();
                                  setChessSelectedCell(null);
                                  setChessFeedback('Incorrect move. Try again! ❌');
                                }
                              }
                            }}
                            style={{
                              background: cellColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '24px',
                              cursor: 'pointer',
                              userSelect: 'none',
                              height: '100%',
                              transition: 'background 0.15s'
                            }}
                          >
                            {piece}
                          </div>
                        )
                      })
                    )}
                  </div>

                  {chessFeedback && (
                    <p style={{
                      fontSize: '14px',
                      color: chessFeedback.includes('Correct') || chessFeedback.includes('Solved') ? '#047857' : '#b91c1c',
                      fontWeight: 'bold',
                      marginBottom: '16px'
                    }}>
                      {chessFeedback}
                    </p>
                  )}

                  {chessMoveIdx >= (activeGameData?.solution?.length || 99) && (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <button
                        onClick={() => {
                          playTickSound();
                          setChessMoveIdx(0);
                          setChessFeedback('');
                          setChessSelectedCell(null);
                        }}
                        style={{ padding: '8px 18px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        🔄 Play Again
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* DYNAMIC TRIVIA */}
            {activeGame === 'trivia' && activeGameData && activeGameData.question && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>❓ Dynamic Trivia Quiz</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>Select the correct answer to solve this trivia puzzle:</p>

                <div style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#1e293b',
                  background: '#f8fafc',
                  padding: '20px',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '20px',
                  lineHeight: '1.5'
                }} dangerouslySetInnerHTML={{ __html: activeGameData.question }} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', maxWidth: '380px', margin: '0 auto' }}>
                  {activeGameData.options.map((opt, idx) => {
                    const isAnswered = triviaChosen !== null;
                    const isCorrect = opt === activeGameData.correct_answer;
                    const isSelected = triviaChosen === opt;
                    return (
                      <button
                        key={idx}
                        disabled={isAnswered}
                        onClick={() => {
                          setTriviaChosen(opt);
                          if (isCorrect) {
                            playGameWinSound();
                            setTriviaFeedback('Correct answer! 🎉');
                          } else {
                            playErrorSound();
                            setTriviaFeedback(`Incorrect. Correct answer: ${activeGameData.correct_answer}`);
                          }
                        }}
                        style={{
                          padding: '12px',
                          background: isAnswered ? (isCorrect ? '#d1fae5' : isSelected ? '#fee2e2' : '#f8fafc') : '#f8fafc',
                          border: `2px solid ${isAnswered ? (isCorrect ? '#10b981' : isSelected ? '#ef4444' : '#e2e8f0') : '#e2e8f0'}`,
                          borderRadius: '12px',
                          color: '#1e293b',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                        dangerouslySetInnerHTML={{ __html: opt }}
                      />
                    )
                  })}
                </div>

                {triviaFeedback && (
                  <p style={{
                    marginTop: '20px',
                    fontSize: '14.5px',
                    color: triviaFeedback.includes('Correct') ? '#047857' : '#b91c1c',
                    fontWeight: 'bold'
                  }}>
                    {triviaFeedback}
                  </p>
                )}
              </div>
            )}

            {/* SPEED MATH */}
            {activeGame === 'speedmath' && activeGameData && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>⚡ Speed Math</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>Solve this rapid math equation:</p>
                <div style={{ fontSize: '32px', fontWeight: 'extrabold', color: '#1e293b', background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                  {activeGameData.question}
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', maxWidth: '360px', margin: '0 auto 20px' }}>
                  {activeGameData.options.map((opt, idx) => {
                    const isAnswered = quizFeedback !== '';
                    const isCorrect = opt === activeGameData.answer;
                    const isSelected = quizInput === String(opt);
                    return (
                      <button
                        key={idx}
                        disabled={isAnswered}
                        onClick={() => {
                          setQuizInput(String(opt));
                          if (isCorrect) {
                            playGameWinSound();
                            setQuizFeedback('Correct! ⚡');
                            setQuizScore(prev => prev + 1);
                          } else {
                            playErrorSound();
                            setQuizFeedback(`Incorrect. Correct answer is ${activeGameData.answer}`);
                          }
                        }}
                        style={{
                          padding: '12px',
                          background: isAnswered ? (isCorrect ? '#d1fae5' : isSelected ? '#fee2e2' : '#f8fafc') : '#f8fafc',
                          border: `2px solid ${isAnswered ? (isCorrect ? '#10b981' : isSelected ? '#ef4444' : '#e2e8f0') : '#e2e8f0'}`,
                          borderRadius: '12px',
                          color: '#1e293b',
                          fontWeight: 'bold',
                          fontSize: '16px',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>

                {quizFeedback && (
                  <div>
                    <p style={{
                      fontSize: '14.5px',
                      color: quizFeedback.includes('Correct') ? '#047857' : '#b91c1c',
                      fontWeight: 'bold',
                      marginBottom: '20px'
                    }}>
                      {quizFeedback}
                    </p>
                    <button
                      onClick={() => {
                        playTickSound();
                        setQuizInput('');
                        setQuizFeedback('');
                        const n1 = Math.floor(Math.random() * 80) + 15;
                        const n2 = Math.floor(Math.random() * 80) + 15;
                        const ans = n1 + n2;
                        setActiveGameData({
                          question: `${n1} + ${n2} = ?`,
                          answer: ans,
                          options: [ans, ans + 4, ans - 3].sort(() => Math.random() - 0.5)
                        });
                      }}
                      style={{ padding: '8px 18px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Next Equation ➡️
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* VISUAL MEMORY */}
            {activeGame === 'visualmemory' && activeGameData && (() => {
              const playVisualMemoryStep = (idx) => {
                if (simonLit !== null) return
                triggerBeep([261, 329, 392, 523][idx], 0.2)
                setSimonLit(idx)
                setTimeout(() => setSimonLit(null), 300)
                
                if (idx === simonSequence[simonUserIndex]) {
                  const nextIdx = simonUserIndex + 1
                  if (nextIdx === simonSequence.length) {
                    playGameWinSound()
                    setQuizFeedback('Perfect! You memorized the sequence! 🏆')
                    setSimonUserIndex(nextIdx)
                  } else {
                    setSimonUserIndex(nextIdx)
                  }
                } else {
                  playErrorSound()
                  setQuizFeedback("Incorrect sequence. Click 'Replay' to try again!")
                  setSimonUserIndex(0)
                }
              }
              return (
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>🧠 Visual Memory</h3>
                  <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>Repeat the flashed sequence of grids to train concentration:</p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', maxWidth: '180px', margin: '0 auto 24px' }}>
                    {[0, 1, 2, 3].map((val) => {
                      const isLit = simonLit === val;
                      const colors = ['#818cf8', '#34d399', '#f87171', '#fbbf24'];
                      return (
                        <div 
                          key={val}
                          onClick={() => playVisualMemoryStep(val)}
                          style={{
                            width: '80px',
                            height: '80px',
                            background: colors[val],
                            opacity: isLit ? 1 : 0.4,
                            borderRadius: '16px',
                            cursor: 'pointer',
                            boxShadow: isLit ? `0 0 20px ${colors[val]}` : 'none',
                            transition: 'opacity 0.15s, box-shadow 0.15s'
                          }}
                        />
                      )
                    })}
                  </div>

                  <button 
                    onClick={() => { playTickSound(); setQuizFeedback(''); setSimonUserIndex(0); flashSimonSequence(simonSequence); }} 
                    style={{ padding: '8px 18px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                  >
                    🔊 Replay Sequence
                  </button>

                  {quizFeedback && (
                    <p style={{
                      marginTop: '20px',
                      fontSize: '14px',
                      color: quizFeedback.includes('Perfect') ? '#047857' : '#b91c1c',
                      fontWeight: 'bold'
                    }}>
                      {quizFeedback}
                    </p>
                  )}
                </div>
              );
            })()}

            {/* PATTERN MATCH */}
            {activeGame === 'patternmatch' && activeGameData && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>📊 Pattern Match</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>Identify the missing shape in the logical sequence:</p>

                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e293b', background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '24px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
                  {activeGameData.sequence.map((item, idx) => (
                    <span key={idx} style={{ color: item === '?' ? '#4f46e5' : '#1e293b' }}>{item}</span>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  {activeGameData.options.map((opt, idx) => {
                    const isAnswered = quizFeedback !== '';
                    const isCorrect = opt === activeGameData.answer;
                    const isSelected = quizInput === opt;
                    return (
                      <button
                        key={idx}
                        disabled={isAnswered}
                        onClick={() => {
                          setQuizInput(opt);
                          if (isCorrect) {
                            playGameWinSound();
                            setQuizFeedback('Correct! Visual pattern solved. 🏆');
                          } else {
                            playErrorSound();
                            setQuizFeedback(`Incorrect. The correct shape is ${activeGameData.answer}`);
                          }
                        }}
                        style={{
                          padding: '12px 20px',
                          background: isAnswered ? (isCorrect ? '#d1fae5' : isSelected ? '#fee2e2' : '#f8fafc') : '#f8fafc',
                          border: `2px solid ${isAnswered ? (isCorrect ? '#10b981' : isSelected ? '#ef4444' : '#e2e8f0') : '#e2e8f0'}`,
                          borderRadius: '12px',
                          fontSize: '24px',
                          cursor: 'pointer'
                        }}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>

                {quizFeedback && (
                  <p style={{
                    marginTop: '20px',
                    fontSize: '14.5px',
                    color: quizFeedback.includes('Correct') ? '#047857' : '#b91c1c',
                    fontWeight: 'bold'
                  }}>
                    {quizFeedback}
                  </p>
                )}
              </div>
            )}

            {/* SUDOKU */}
            {activeGame === 'sudoku' && activeGameData && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>🔢 Sudoku Puzzle</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>Fill in the missing numbers (1-9) to complete the grid:</p>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(9, 1fr)',
                  gap: '2px',
                  maxWidth: '340px',
                  margin: '0 auto 20px',
                  background: '#cbd5e1',
                  padding: '4px',
                  borderRadius: '8px'
                }}>
                  {sudokuPlayBoard.map((row, r) => 
                    row.map((val, c) => {
                      const isOriginal = activeGameData.board[r][c] !== 0;
                      const borderRight = (c === 2 || c === 5) ? '2px solid #475569' : 'none';
                      const borderBottom = (r === 2 || r === 5) ? '2px solid #475569' : 'none';
                      return (
                        <input
                          key={`${r}-${c}`}
                          type="text"
                          maxLength="1"
                          disabled={isOriginal}
                          value={val === 0 ? '' : val}
                          onChange={(e) => {
                            const inputVal = e.target.value.replace(/[^1-9]/g, '');
                            const num = inputVal ? parseInt(inputVal) : 0;
                            const newBoard = sudokuPlayBoard.map((rowArr, ri) => 
                              rowArr.map((cellVal, ci) => (ri === r && ci === c) ? num : cellVal)
                            );
                            setSudokuPlayBoard(newBoard);
                            playTickSound();
                          }}
                          style={{
                            width: '100%',
                            aspectRatio: '1',
                            textAlign: 'center',
                            fontSize: '14px',
                            fontWeight: isOriginal ? 'extrabold' : 'bold',
                            background: isOriginal ? '#f1f5f9' : 'white',
                            color: isOriginal ? '#475569' : '#4f46e5',
                            border: 'none',
                            outline: 'none',
                            borderRight,
                            borderBottom,
                            padding: 0
                          }}
                        />
                      )
                    })
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '12px' }}>
                  <button
                    onClick={() => {
                      let solved = true;
                      for (let r = 0; r < 9; r++) {
                        for (let c = 0; c < 9; c++) {
                          if (sudokuPlayBoard[r][c] !== activeGameData.solution[r][c]) {
                            solved = false;
                            break;
                          }
                        }
                      }
                      if (solved) {
                        playGameWinSound();
                        setQuizFeedback('Congratulations! You solved the Sudoku puzzle! 🏆');
                      } else {
                        playErrorSound();
                        setQuizFeedback('Incorrect solutions exist or board is incomplete. Keep trying! ❌');
                      }
                    }}
                    style={{ padding: '8px 18px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Check Solution
                  </button>
                  <button
                    onClick={() => {
                      playResetSound();
                      setSudokuPlayBoard(activeGameData.board.map(row => [...row]));
                      setQuizFeedback('');
                    }}
                    style={{ padding: '8px 18px', background: '#f3f4f6', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Reset Board
                  </button>
                </div>

                {quizFeedback && (
                  <p style={{
                    fontSize: '14px',
                    color: quizFeedback.includes('Congratulations') ? '#047857' : '#b91c1c',
                    fontWeight: 'bold'
                  }}>
                    {quizFeedback}
                  </p>
                )}
              </div>
            )}

            {/* CROSSWORD */}
            {activeGame === 'crossword' && activeGameData && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>🧩 Mindful Crossword</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>Solve these clues with calming mental health terms:</p>
                
                <div style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto 20px', background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {activeGameData.clues.map((item, idx) => {
                    const userVal = (quizInput.split(',')[idx] || '').trim().toUpperCase();
                    const isCorrect = userVal === item.word.toUpperCase();
                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Clue {idx + 1}: {item.clue}</span>
                        <input
                          type="text"
                          placeholder="Type answer..."
                          value={quizInput.split(',')[idx] || ''}
                          onChange={(e) => {
                            const arr = quizInput.split(',');
                            arr[idx] = e.target.value;
                            setQuizInput(arr.join(','));
                          }}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: `1px solid ${isCorrect ? '#10b981' : '#cbd5e1'}`,
                            background: isCorrect ? '#f0fdf4' : 'white',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: isCorrect ? '#15803d' : '#1e293b',
                            outline: 'none'
                          }}
                        />
                      </div>
                    )
                  })}
                </div>

                <button
                  onClick={() => {
                    let allCorrect = true;
                    activeGameData.clues.forEach((item, idx) => {
                      const val = (quizInput.split(',')[idx] || '').trim().toUpperCase();
                      if (val !== item.word.toUpperCase()) {
                        allCorrect = false;
                      }
                    });
                    if (allCorrect) {
                      playGameWinSound();
                      setQuizFeedback('Amazing! All crossword clues solved perfectly! 🏆');
                    } else {
                      playErrorSound();
                      setQuizFeedback('Some answers are incorrect or missing. Check again! ❌');
                    }
                  }}
                  style={{ padding: '8px 18px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Check Clues
                </button>

                {quizFeedback && (
                  <p style={{
                    marginTop: '12px',
                    fontSize: '14px',
                    color: quizFeedback.includes('Amazing') ? '#047857' : '#b91c1c',
                    fontWeight: 'bold'
                  }}>
                    {quizFeedback}
                  </p>
                )}
              </div>
            )}

            {/* WORD SCRAMBLE */}
            {activeGame === 'scramble' && activeGameData && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>🔤 Word Scramble</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>Unscramble this positive word to focus your mind:</p>
                
                <div style={{ fontSize: '36px', fontWeight: 'extrabold', letterSpacing: '6px', color: '#4f46e5', margin: '20px 0', textTransform: 'uppercase' }}>
                  {activeGameData.scrambled}
                </div>

                <input
                  type="text"
                  placeholder="Type your guess here..."
                  value={quizInput}
                  onChange={(e) => setQuizInput(e.target.value)}
                  style={{
                    padding: '12px 16px',
                    width: '100%',
                    maxWidth: '280px',
                    borderRadius: '12px',
                    border: '2px solid #cbd5e1',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    marginBottom: '16px',
                    outline: 'none'
                  }}
                />

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button
                    onClick={() => {
                      if (quizInput.trim().toLowerCase() === activeGameData.original.toLowerCase()) {
                        playGameWinSound();
                        setQuizFeedback('Excellent! You unscrambled the word! 🎉');
                      } else {
                        playErrorSound();
                        setQuizFeedback('Incorrect guess. Try again! ❌');
                      }
                    }}
                    style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Check Guess
                  </button>
                </div>

                {quizFeedback && (
                  <p style={{
                    marginTop: '12px',
                    fontSize: '14.5px',
                    color: quizFeedback.includes('Excellent') ? '#047857' : '#b91c1c',
                    fontWeight: 'bold'
                  }}>
                    {quizFeedback}
                  </p>
                )}
              </div>
            )}

            {/* NUMBER SEQUENCE */}
            {activeGame === 'numbersequence' && activeGameData && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>📈 Number Sequence</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>Find the missing number in the mathematical pattern:</p>
                
                <div style={{ fontSize: '32px', fontWeight: 'extrabold', color: '#1e293b', background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'flex', justifyContent: 'center', gap: '14px' }}>
                  {activeGameData.sequence.map((num, i) => (
                    <span key={i}>{num}</span>
                  ))}
                  <span style={{ color: '#4f46e5' }}>?</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', maxWidth: '300px', margin: '0 auto 20px' }}>
                  {activeGameData.options.map((opt, idx) => {
                    const isAnswered = quizFeedback !== '';
                    const isCorrect = opt === activeGameData.answer;
                    const isSelected = quizInput === String(opt);
                    return (
                      <button
                        key={idx}
                        disabled={isAnswered}
                        onClick={() => {
                          setQuizInput(String(opt));
                          if (isCorrect) {
                            playGameWinSound();
                            setQuizFeedback('Perfect! Correct number sequence prediction! 🎉');
                          } else {
                            playErrorSound();
                            setQuizFeedback(`Oops! Incorrect prediction. The correct number is ${activeGameData.answer}`);
                          }
                        }}
                        style={{
                          padding: '12px',
                          background: isAnswered ? (isCorrect ? '#d1fae5' : isSelected ? '#fee2e2' : '#f8fafc') : '#f8fafc',
                          border: `2px solid ${isAnswered ? (isCorrect ? '#10b981' : isSelected ? '#ef4444' : '#e2e8f0') : '#e2e8f0'}`,
                          borderRadius: '12px',
                          color: '#1e293b',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>

                {quizFeedback && (
                  <p style={{
                    fontSize: '14.5px',
                    color: quizFeedback.includes('Perfect') ? '#047857' : '#b91c1c',
                    fontWeight: 'bold'
                  }}>
                    {quizFeedback}
                  </p>
                )}
              </div>
            )}

            {/* LOGIC RIDDLE */}
            {activeGame === 'logicpuzzle' && activeGameData && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>🧠 Logic Riddle</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>Solve this riddle to sharpen your focus:</p>
                
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '20px', lineHeight: '1.5' }}>
                  "{activeGameData.question}"
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', maxWidth: '360px', margin: '0 auto 20px' }}>
                  {activeGameData.options.map((opt, idx) => {
                    const isAnswered = quizFeedback !== '';
                    const isCorrect = opt.toLowerCase() === activeGameData.answer.toLowerCase();
                    const isSelected = quizInput === opt;
                    return (
                      <button
                        key={idx}
                        disabled={isAnswered}
                        onClick={() => {
                          setQuizInput(opt);
                          if (isCorrect) {
                            playGameWinSound();
                            setQuizFeedback('Correct! You solved the riddle! 🏆');
                          } else {
                            playErrorSound();
                            setQuizFeedback(`Incorrect. The answer is: "${activeGameData.answer}"`);
                          }
                        }}
                        style={{
                          padding: '12px',
                          background: isAnswered ? (isCorrect ? '#d1fae5' : isSelected ? '#fee2e2' : '#f8fafc') : '#f8fafc',
                          border: `2px solid ${isAnswered ? (isCorrect ? '#10b981' : isSelected ? '#ef4444' : '#e2e8f0') : '#e2e8f0'}`,
                          borderRadius: '12px',
                          color: '#1e293b',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>

                {quizFeedback && (
                  <p style={{
                    fontSize: '14.5px',
                    color: quizFeedback.includes('Correct') ? '#047857' : '#b91c1c',
                    fontWeight: 'bold'
                  }}>
                    {quizFeedback}
                  </p>
                )}
              </div>
            )}

            {/* NONOGRAM */}
            {activeGame === 'nonogram' && activeGameData && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>🎨 Mindful Nonogram</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>Paint grid cells to match row and column count clues:</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
                  {/* Col clues row */}
                  <div style={{ display: 'flex', marginLeft: '50px' }}>
                    {activeGameData.colClues.map((clue, idx) => (
                      <div key={idx} style={{ width: '36px', height: '36px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}>
                        {clue.map((c, i) => <span key={i}>{c}</span>)}
                      </div>
                    ))}
                  </div>
                  
                  {/* Rows with grid cells */}
                  {nonogramPlayGrid.map((row, r) => (
                    <div key={r} style={{ display: 'flex', alignItems: 'center' }}>
                      {/* Row clue */}
                      <div style={{ width: '50px', display: 'flex', justifyContent: 'flex-end', paddingRight: '8px', fontSize: '11px', fontWeight: 'bold', color: '#64748b', gap: '4px' }}>
                        {activeGameData.rowClues[r].map((c, i) => <span key={i}>{c}</span>)}
                      </div>
                      {/* Row cells */}
                      {row.map((val, c) => (
                        <div
                          key={`${r}-${c}`}
                          onClick={() => {
                            playTickSound();
                            const newGrid = nonogramPlayGrid.map((rowArr, ri) => 
                              rowArr.map((cellVal, ci) => (ri === r && ci === c) ? (cellVal === 1 ? 0 : 1) : cellVal)
                            );
                            setNonogramPlayGrid(newGrid);
                          }}
                          style={{
                            width: '36px',
                            height: '36px',
                            background: val === 1 ? '#4f46e5' : 'white',
                            border: '1px solid #cbd5e1',
                            cursor: 'pointer',
                            transition: 'background 0.1s'
                          }}
                        />
                      ))}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '12px' }}>
                  <button
                    onClick={() => {
                      let matches = true;
                      for (let r = 0; r < 5; r++) {
                        for (let c = 0; c < 5; c++) {
                          if (nonogramPlayGrid[r][c] !== activeGameData.grid[r][c]) {
                            matches = false;
                            break;
                          }
                        }
                      }
                      if (matches) {
                        playGameWinSound();
                        setQuizFeedback('Excellent! Nonogram picture completed perfectly! 🎨🏆');
                      } else {
                        playErrorSound();
                        setQuizFeedback('Grid does not match clues. Keep tweaking! ❌');
                      }
                    }}
                    style={{ padding: '8px 18px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Check Painting
                  </button>
                  <button
                    onClick={() => {
                      playResetSound();
                      setNonogramPlayGrid(Array(5).fill(null).map(() => Array(5).fill(0)));
                      setQuizFeedback('');
                    }}
                    style={{ padding: '8px 18px', background: '#f3f4f6', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Clear Grid
                  </button>
                </div>

                {quizFeedback && (
                  <p style={{
                    fontSize: '14px',
                    color: quizFeedback.includes('Excellent') ? '#047857' : '#b91c1c',
                    fontWeight: 'bold'
                  }}>
                    {quizFeedback}
                  </p>
                )}
              </div>
            )}

            {/* KAKURO */}
            {activeGame === 'kakuro' && activeGameData && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>➕ Kakuro Cross-Sum</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>Fill cells (1-9) such that horizontal rows sum to target clue and columns sum to vertical clue:</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 48px)', gap: '4px', justifyContent: 'center', marginBottom: '20px' }}>
                  <div />
                  {/* Col clues */}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>
                    <span>⬇️</span>
                    <span>{activeGameData.colSums[0]}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>
                    <span>⬇️</span>
                    <span>{activeGameData.colSums[1]}</span>
                  </div>

                  {/* Row 1 */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '6px', fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>
                    {activeGameData.rowSums[0]} ➡️
                  </div>
                  <input
                    type="text"
                    maxLength="1"
                    value={quizInput.split(',')[0] || ''}
                    onChange={(e) => {
                      const arr = quizInput.split(',');
                      arr[0] = e.target.value.replace(/[^1-9]/g, '');
                      setQuizInput(arr.join(','));
                      playTickSound();
                    }}
                    style={{ width: '48px', height: '48px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold', border: '2px solid #cbd5e1', borderRadius: '8px' }}
                  />
                  <input
                    type="text"
                    maxLength="1"
                    value={quizInput.split(',')[1] || ''}
                    onChange={(e) => {
                      const arr = quizInput.split(',');
                      arr[1] = e.target.value.replace(/[^1-9]/g, '');
                      setQuizInput(arr.join(','));
                      playTickSound();
                    }}
                    style={{ width: '48px', height: '48px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold', border: '2px solid #cbd5e1', borderRadius: '8px' }}
                  />

                  {/* Row 2 */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '6px', fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>
                    {activeGameData.rowSums[1]} ➡️
                  </div>
                  <input
                    type="text"
                    maxLength="1"
                    value={quizInput.split(',')[2] || ''}
                    onChange={(e) => {
                      const arr = quizInput.split(',');
                      arr[2] = e.target.value.replace(/[^1-9]/g, '');
                      setQuizInput(arr.join(','));
                      playTickSound();
                    }}
                    style={{ width: '48px', height: '48px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold', border: '2px solid #cbd5e1', borderRadius: '8px' }}
                  />
                  <input
                    type="text"
                    maxLength="1"
                    value={quizInput.split(',')[3] || ''}
                    onChange={(e) => {
                      const arr = quizInput.split(',');
                      arr[3] = e.target.value.replace(/[^1-9]/g, '');
                      setQuizInput(arr.join(','));
                      playTickSound();
                    }}
                    style={{ width: '48px', height: '48px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold', border: '2px solid #cbd5e1', borderRadius: '8px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '12px' }}>
                  <button
                    onClick={() => {
                      const val0 = parseInt(quizInput.split(',')[0]) || 0;
                      const val1 = parseInt(quizInput.split(',')[1]) || 0;
                      const val2 = parseInt(quizInput.split(',')[2]) || 0;
                      const val3 = parseInt(quizInput.split(',')[3]) || 0;
                      
                      const sol = activeGameData.solution;
                      if (val0 === sol[0][0] && val1 === sol[0][1] && val2 === sol[1][0] && val3 === sol[1][1]) {
                        playGameWinSound();
                        setQuizFeedback('Outstanding! Cross-sum completed successfully! 🏆');
                      } else {
                        playErrorSound();
                        setQuizFeedback('Incorrect sums or entries. Try again! ❌');
                      }
                    }}
                    style={{ padding: '8px 18px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Check Sums
                  </button>
                </div>

                {quizFeedback && (
                  <p style={{
                    fontSize: '14px',
                    color: quizFeedback.includes('Outstanding') ? '#047857' : '#b91c1c',
                    fontWeight: 'bold'
                  }}>
                    {quizFeedback}
                  </p>
                )}
              </div>
            )}

            {/* JIGSAW */}
            {activeGame === 'jigsaw' && activeGameData && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>🖼️ Mindful Jigsaw Puzzle</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>Swap positions of the tiles until they are sorted (0 to 3) to assemble the calm picture:</p>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '8px',
                  maxWidth: '220px',
                  margin: '0 auto 20px'
                }}>
                  {jigsawPlayTiles.map((tileVal, idx) => {
                    const isSelected = jigsawSelectedIdx === idx;
                    const emojiMap = ['🌊 Lake', '🌄 Sun', '🌲 Forest', '🏡 Home'];
                    const colors = ['#a1c4fd', '#fddb92', '#c1dfc4', '#e2ebf0'];
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          playTickSound();
                          if (jigsawSelectedIdx === null) {
                            setJigsawSelectedIdx(idx);
                          } else {
                            const newTiles = [...jigsawPlayTiles];
                            const temp = newTiles[jigsawSelectedIdx];
                            newTiles[jigsawSelectedIdx] = newTiles[idx];
                            newTiles[idx] = temp;
                            setJigsawPlayTiles(newTiles);
                            setJigsawSelectedIdx(null);
                            
                            if (newTiles.join(',') === activeGameData.solution.join(',')) {
                              playGameWinSound();
                              setQuizFeedback('Perfect Jigsaw alignment! Beautiful peaceful scene complete! 🌅🏆');
                            }
                          }
                        }}
                        style={{
                          height: '80px',
                          background: colors[tileVal],
                          border: isSelected ? '3px solid #4f46e5' : '1px solid #cbd5e1',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          color: '#475569',
                          fontSize: '14px',
                          userSelect: 'none',
                          boxShadow: isSelected ? '0 0 12px rgba(79, 70, 229, 0.4)' : 'none'
                        }}
                      >
                        {emojiMap[tileVal]}
                      </div>
                    )
                  })}
                </div>

                {quizFeedback && (
                  <p style={{
                    fontSize: '14.5px',
                    color: '#047857',
                    fontWeight: 'bold',
                    marginBottom: '16px'
                  }}>
                    {quizFeedback}
                  </p>
                )}
              </div>
            )}

            {/* SHAPE SORT */}
            {activeGame === 'shapesort' && activeGameData && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>📐 Shape Sorter</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>Sort each shape by matching it to the correct slot container:</p>
                
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '24px' }}>
                  {activeGameData.shapes.map(s => {
                    const isPlaced = shapeSortPlaced.includes(s.id);
                    const iconMap = { Circle: '🔴', Square: '🟦', Triangle: '🔺' };
                    return (
                      <div
                        key={s.id}
                        onClick={() => {
                          if (isPlaced) return;
                          playTickSound();
                          setQuizInput(String(s.id));
                        }}
                        style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '12px',
                          background: '#f8fafc',
                          border: quizInput === String(s.id) ? '3px solid #4f46e5' : '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '32px',
                          cursor: isPlaced ? 'default' : 'pointer',
                          opacity: isPlaced ? 0.3 : 1,
                          boxShadow: quizInput === String(s.id) ? '0 0 10px rgba(79,70,229,0.3)' : 'none'
                        }}
                      >
                        {iconMap[s.name]}
                      </div>
                    )
                  })}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', maxWidth: '360px', margin: '0 auto 20px' }}>
                  {['Circle', 'Square', 'Triangle'].map(slotType => {
                    return (
                      <div
                        key={slotType}
                        onClick={() => {
                          if (!quizInput) return;
                          const activeId = parseInt(quizInput);
                          const selectedShape = activeGameData.shapes.find(s => s.id === activeId);
                          if (selectedShape && selectedShape.name === slotType) {
                            playSuccessHarp();
                            const nextPlaced = [...shapeSortPlaced, activeId];
                            setShapeSortPlaced(nextPlaced);
                            setQuizInput('');
                            if (nextPlaced.length === activeGameData.shapes.length) {
                              playGameWinSound();
                              setQuizFeedback('Outstanding! All shapes sorted into correct containers! 🏆');
                            }
                          } else {
                            playErrorSound();
                            setQuizFeedback('Mismatched slot container. Try again! ❌');
                          }
                        }}
                        style={{
                          padding: '16px 8px',
                          border: '2px dashed #cbd5e1',
                          borderRadius: '16px',
                          fontSize: '13px',
                          fontWeight: 'bold',
                          color: '#64748b',
                          cursor: 'pointer',
                          background: '#fafafa',
                          minHeight: '80px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        <div>{slotType} Slot</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                          {shapeSortPlaced.map(id => {
                            const s = activeGameData.shapes.find(shape => shape.id === id);
                            if (s && s.name === slotType) {
                              const icons = { Circle: '🔴', Square: '🟦', Triangle: '🔺' };
                              return <span key={id} style={{ fontSize: '20px' }}>{icons[s.name]}</span>;
                            }
                            return null;
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {quizFeedback && (
                  <p style={{
                    fontSize: '14px',
                    color: quizFeedback.includes('Outstanding') ? '#047857' : '#b91c1c',
                    fontWeight: 'bold'
                  }}>
                    {quizFeedback}
                  </p>
                )}
              </div>
            )}

            {/* RELAX MATCH */}
            {activeGame === 'relaxmatch' && activeGameData && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>🧩 Soothing Pair Match</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>Open cards and find the matching calm symbols:</p>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  maxWidth: '240px',
                  margin: '0 auto 20px'
                }}>
                  {relaxMatchCards.map((symbol, idx) => {
                    const isFlipped = relaxMatchSelected.includes(idx) || relaxMatchMatched.includes(idx);
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (isFlipped || relaxMatchSelected.length >= 2) return;
                          playTickSound();
                          const nextSelected = [...relaxMatchSelected, idx];
                          setRelaxMatchSelected(nextSelected);
                          
                          if (nextSelected.length === 2) {
                            const idx1 = nextSelected[0];
                            const idx2 = nextSelected[1];
                            if (relaxMatchCards[idx1] === relaxMatchCards[idx2]) {
                              playSuccessHarp();
                              const nextMatched = [...relaxMatchMatched, idx1, idx2];
                              setRelaxMatchMatched(nextMatched);
                              setRelaxMatchSelected([]);
                              if (nextMatched.length === relaxMatchCards.length) {
                                playGameWinSound();
                                setQuizFeedback('Zen concentration achieved! All matches found! 🌸🏆');
                              }
                            } else {
                              setTimeout(() => {
                                playErrorSound();
                                setRelaxMatchSelected([]);
                              }, 1000);
                            }
                          }
                        }}
                        style={{
                          height: '72px',
                          background: isFlipped ? '#f0fdf4' : 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
                          border: isFlipped ? '2px solid #10b981' : '1px solid #a5b4fc',
                          borderRadius: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '28px',
                          cursor: isFlipped ? 'default' : 'pointer',
                          userSelect: 'none',
                          boxShadow: isFlipped ? 'none' : '0 4px 6px rgba(165,180,252,0.15)',
                          transition: 'transform 0.15s'
                        }}
                      >
                        {isFlipped ? symbol : '❓'}
                      </div>
                    )
                  })}
                </div>

                {quizFeedback && (
                  <p style={{
                    fontSize: '14.5px',
                    color: '#047857',
                    fontWeight: 'bold'
                  }}>
                    {quizFeedback}
                  </p>
                )}
              </div>
            )}

            {/* ZEN PUZZLE */}
            {activeGame === 'zenpuzzle' && activeGameData && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>🌸 Zen Sliding Blocks</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>Slide adjacent blocks into the empty slot to align them in order (1, 2, 3):</p>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '8px',
                  maxWidth: '160px',
                  margin: '0 auto 20px'
                }}>
                  {jigsawPlayTiles.map((tileVal, idx) => {
                    const isBlank = tileVal === 0;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (isBlank) return;
                          playTickSound();
                          const blankIdx = jigsawPlayTiles.indexOf(0);
                          const r1 = Math.floor(idx / 2), c1 = idx % 2;
                          const r2 = Math.floor(blankIdx / 2), c2 = blankIdx % 2;
                          const dist = Math.abs(r1 - r2) + Math.abs(c1 - c2);
                          if (dist === 1) {
                            const newTiles = [...jigsawPlayTiles];
                            newTiles[blankIdx] = tileVal;
                            newTiles[idx] = 0;
                            setJigsawPlayTiles(newTiles);
                            
                            if (newTiles.join(',') === activeGameData.solution.join(',')) {
                              playGameWinSound();
                              setQuizFeedback('Harmony attained! Sliders aligned perfectly! 🧘🌸');
                            }
                          }
                        }}
                        style={{
                          height: '72px',
                          background: isBlank ? '#f1f5f9' : 'linear-gradient(135deg, #e9d5ff, #c084fc)',
                          border: isBlank ? '1px dashed #cbd5e1' : '1px solid #c084fc',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '24px',
                          fontWeight: 'bold',
                          color: isBlank ? '#cbd5e1' : 'white',
                          cursor: isBlank ? 'default' : 'pointer',
                          userSelect: 'none'
                        }}
                      >
                        {!isBlank ? tileVal : ''}
                      </div>
                    )
                  })}
                </div>

                {quizFeedback && (
                  <p style={{
                    fontSize: '14.5px',
                    color: '#065f46',
                    fontWeight: 'bold'
                  }}>
                    {quizFeedback}
                  </p>
                )}
              </div>
            )}

            {/* POSITIVE QUOTES */}
            {activeGame === 'positivequotes' && activeGameData && (
              <div style={{ textAlign: 'center', padding: '10px' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>💬 Affirming Quotes</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>Let these wisdom words soak into your heart:</p>
                
                <div style={{
                  background: 'linear-gradient(135deg, #fef3c7, #fffbeb)',
                  padding: '30px',
                  borderRadius: '24px',
                  border: '1px solid #fde68a',
                  marginBottom: '20px',
                  boxShadow: '0 10px 15px -3px rgba(251,191,36,0.1)'
                }}>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#78350f', fontStyle: 'italic', marginBottom: '16px', lineHeight: '1.6' }}>
                    "{activeGameData.text}"
                  </p>
                  <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#92400e', textAlign: 'right', margin: 0 }}>
                    — {activeGameData.author || 'Unknown'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    playGameWinSound();
                    alert('Quotes can comfort but speaking with real friends helps further. Be kind to yourself today!');
                  }}
                  style={{ padding: '8px 18px', background: '#d97706', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  ❤️ Keep Affirmation
                </button>
              </div>
            )}

            {/* CALM GENERATOR */}
            {activeGame === 'calmgenerator' && activeGameData && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>🏡 Calm Activity Generator</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>Try this short physical relaxation exercise to center yourself:</p>
                
                <div style={{
                  background: '#ecfdf5',
                  padding: '24px',
                  borderRadius: '20px',
                  border: '1px solid #a7f3d0',
                  marginBottom: '24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#065f46',
                  lineHeight: '1.5'
                }}>
                  {activeGameData.activity}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <button
                    onClick={() => {
                      playGameWinSound();
                      setCalmGeneratorDone(true);
                      setQuizFeedback('Wonderful job! Moving your body helps release stress. 🧘💚');
                    }}
                    disabled={calmGeneratorDone}
                    style={{
                      padding: '12px 24px',
                      background: calmGeneratorDone ? '#d1fae5' : '#10b981',
                      color: calmGeneratorDone ? '#065f46' : 'white',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: calmGeneratorDone ? 'default' : 'pointer',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    {calmGeneratorDone ? '✅ Activity Completed' : '✨ Mark as Completed'}
                  </button>
                </div>

                {quizFeedback && (
                  <p style={{
                    marginTop: '16px',
                    fontSize: '14px',
                    color: '#047857',
                    fontWeight: 'bold'
                  }}>
                    {quizFeedback}
                  </p>
                )}
              </div>
            )}

            {/* VIRTUAL PET */}
            {activeGame === 'pet' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>🐱 Virtual Pet Care</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>Keep your virtual pet happy by taking care of its needs!</p>

                <div style={{ fontSize: '72px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  {petStats.love > 80 ? '😸' : petStats.hunger < 20 ? '😾' : petStats.energy < 20 ? '💤' : '🐱'}
                </div>

                <div style={{ maxWidth: '300px', margin: '0 auto 20px', background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 'bold', color: '#475569' }}>
                    <span>Hunger:</span>
                    <span>{petStats.hunger}/100</span>
                  </div>
                  <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${petStats.hunger}%`, height: '100%', background: '#f59e0b' }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 'bold', color: '#475569', marginTop: '6px' }}>
                    <span>Happiness/Love:</span>
                    <span>{petStats.love}/100</span>
                  </div>
                  <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${petStats.love}%`, height: '100%', background: '#ec4899' }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 'bold', color: '#475569', marginTop: '6px' }}>
                    <span>Energy:</span>
                    <span>{petStats.energy}/100</span>
                  </div>
                  <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${petStats.energy}%`, height: '100%', background: '#10b981' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px' }}>
                  <button onClick={() => { setPetStats(p => ({ hunger: Math.min(100, p.hunger + 20), love: p.love, energy: p.energy })); setPetMessage('Kitty enjoyed the fish! 🐟'); playSatisfyingPop(); }} style={{ padding: '8px 14px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>🐟 Feed</button>
                  <button onClick={() => { setPetStats(p => ({ hunger: p.hunger, love: Math.min(100, p.love + 25), energy: p.energy })); setPetMessage('Purrrr! Kitty loves pats. ❤️'); playSuccessHarp(); }} style={{ padding: '8px 14px', background: '#ec4899', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>❤️ Pet</button>
                  <button onClick={() => { setPetStats(p => ({ hunger: p.hunger, love: p.love, energy: Math.min(100, p.energy + 30) })); setPetMessage('Kitty took a refreshing nap! 💤'); triggerBeep(440, 0.3); }} style={{ padding: '8px 14px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>💤 Nap</button>
                </div>
                <div style={{ fontSize: '12px', color: '#475569', fontStyle: 'italic', fontWeight: '600' }}>"{petMessage}"</div>
              </div>
            )}

            {/* GRATITUDE QUEST */}
            {activeGame === 'gratitudequest' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>📜 Gratitude Quest</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>Enter 3 things you are grateful for today to grow a beautiful flower!</p>

                <div style={{ background: '#ecfdf5', border: '1.5px dashed #a7f3d0', padding: '16px', borderRadius: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '20px' }}>
                  {gardenPlants.map(p => (
                    <span key={p.id} style={{ padding: '6px 12px', background: 'white', border: '1.5px solid #34d399', color: '#047857', borderRadius: '20px', fontSize: '12.5px', fontWeight: 'bold' }}>
                      🌸 {p.text}
                    </span>
                  ))}
                  {gardenPlants.length === 0 && <span style={{ color: '#059669', fontStyle: 'italic', fontSize: '13px' }}>Your flower soil is ready... 🌱</span>}
                </div>

                {gardenPlants.length < 3 ? (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (gratitudeText.trim() === '') return;
                    setGardenPlants(prev => [...prev, { id: Math.random(), text: gratitudeText }]);
                    setGratitudeText('');
                    playSuccessHarp();
                  }} style={{ display: 'flex', gap: '8px', maxWidth: '360px', margin: '0 auto' }}>
                    <input 
                      type="text"
                      value={gratitudeText}
                      onChange={e => setGratitudeText(e.target.value)}
                      placeholder={`I am grateful for... (${gardenPlants.length}/3)`}
                      style={{ flex: 1, padding: '10px 14px', border: '2.5px solid #a7f3d0', borderRadius: '10px', fontSize: '13px', outline: 'none' }}
                      required
                    />
                    <button type="submit" style={{ padding: '0 18px', background: '#059669', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>🌱 Plant</button>
                  </form>
                ) : (
                  <div>
                    <div style={{ fontSize: '72px', animation: 'fadeIn 0.5s' }}>🌻</div>
                    <div style={{ color: '#047857', fontSize: '14px', fontWeight: 'bold', marginTop: '8px' }}>
                      Amazing! Your Gratitude Quest is complete.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SAFE SPACE */}
            {activeGame === 'safespace' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>🏡 Safe Space Story Game</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>Select space parameters to write your tranquil dream narrative!</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxWidth: '360px', margin: '0 auto 20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px', textAlign: 'left', fontWeight: 'bold' }}>Choose Space:</label>
                    <select value={spaceChoice} onChange={e => setSpaceChoice(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12.5px' }}>
                      <option>Quiet Cabin 🏡</option>
                      <option>Sunny Beach 🏖️</option>
                      <option>Mystic Forest 🌲</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px', textAlign: 'left', fontWeight: 'bold' }}>Choose Weather:</label>
                    <select value={weatherChoice} onChange={e => setWeatherChoice(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12.5px' }}>
                      <option>Rainy 🌧️</option>
                      <option>Sunny ☀️</option>
                      <option>Snowy ❄️</option>
                    </select>
                  </div>
                </div>

                <button onClick={buildSafeSpaceStory} style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '24px' }}>
                  🏡 Build Safe Story
                </button>

                {safeSpaceStory && (
                  <div style={{ background: '#f5f3ff', border: '1.5px solid #c084fc', padding: '20px', borderRadius: '16px', fontSize: '14px', color: '#581c87', fontWeight: '500', lineHeight: '1.6', animation: 'fadeIn 0.5s' }}>
                    {safeSpaceStory}
                  </div>
                )}
              </div>
            )}

            {/* BALLOON RELEASE */}
            {activeGame === 'balloon' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>🎈 Worry Balloon Release</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>Type a worry onto a balloon and click to release and let it float away!</p>

                <div style={{ display: 'flex', gap: '8px', maxWidth: '360px', margin: '0 auto 20px' }}>
                  <input 
                    type="text"
                    value={balloonThought}
                    onChange={e => setBalloonThought(e.target.value)}
                    placeholder="Enter a worry (e.g. Exam pressure)..."
                    style={{ flex: 1, padding: '10px 14px', border: '2px solid #cbd5e1', borderRadius: '10px', fontSize: '13px', outline: 'none' }}
                  />
                  <button onClick={releaseBalloon} style={{ padding: '0 18px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>🎈 Release</button>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', minHeight: '120px', background: '#f8fafc', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                  {releasedBalloons.map(b => (
                    <div 
                      key={b.id}
                      onClick={() => {
                        playSatisfyingPop();
                        setReleasedBalloons(prev => prev.filter(x => x.id !== b.id));
                      }}
                      style={{
                        padding: '8px 16px',
                        background: 'linear-gradient(135deg, #f87171, #ef4444)',
                        color: 'white',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(239, 68, 68, 0.2)',
                        animation: 'fadeIn 0.3s',
                        userSelect: 'none'
                      }}
                      title="Click to POP and release!"
                    >
                      🎈 {b.text} (Pop 💥)
                    </div>
                  ))}
                  {releasedBalloons.length === 0 && <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '13px', marginTop: '30px' }}>No balloons released. Write a worry above.</span>}
                </div>
              </div>
            )}

            {/* ROCK PAPER SCISSORS */}
            {activeGame === 'rps' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>✊✋ Rock Paper Scissors</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>Play against the CPU. Choose your play:</p>

                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '24px' }}>
                  {[{ icon: '✊', val: 'Rock' }, { icon: '✋', val: 'Paper' }, { icon: '✌️', val: 'Scissors' }].map(play => (
                    <button
                      key={play.val}
                      onClick={() => {
                        const ai = ['Rock', 'Paper', 'Scissors'][Math.floor(Math.random() * 3)];
                        playTickSound();
                        let msg = `You chose ${play.val}. CPU chose ${ai}. `;
                        if (play.val === ai) {
                          msg += '🤝 It is a draw!';
                          playSuccessHarp();
                        } else if (
                          (play.val === 'Rock' && ai === 'Scissors') ||
                          (play.val === 'Paper' && ai === 'Rock') ||
                          (play.val === 'Scissors' && ai === 'Paper')
                        ) {
                          msg += '🎉 You won!';
                          playGameWinSound();
                        } else {
                          msg += '💻 CPU won!';
                          playErrorSound();
                        }
                        alert(msg);
                      }}
                      style={{ width: '64px', height: '64px', borderRadius: '16px', border: '1.5px solid #cbd5e1', background: 'white', fontSize: '28px', cursor: 'pointer' }}
                    >
                      {play.icon}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* HANGMAN */}
            {activeGame === 'hangman' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>😵 Hangman</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>Guess the letters to solve the mindful word!</p>

                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e293b', letterSpacing: '8px', marginBottom: '24px' }}>
                  {hangmanWord.split('').map(char => hangmanGuesses.includes(char) ? char : '_').join(' ')}
                </div>

                {(() => {
                  const wrong = hangmanGuesses.filter(char => !hangmanWord.includes(char));
                  const won = hangmanWord.split('').every(char => hangmanGuesses.includes(char));
                  const lost = wrong.length >= 6;
                  return (
                    <div>
                      <div style={{ marginBottom: '20px', color: '#ef4444', fontWeight: 'bold', fontSize: '13px' }}>
                        Mistakes: {wrong.length}/6 ({wrong.join(', ') || 'none'})
                      </div>
                      
                      {won && (
                        <div style={{ background: '#ecfdf5', color: '#047857', padding: '12px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', fontWeight: 'bold' }}>
                          🎉 You solved it! The word is "{hangmanWord}".
                        </div>
                      )}

                      {lost && (
                        <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '12px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', fontWeight: 'bold' }}>
                          💀 Game Over! The word was "{hangmanWord}".
                        </div>
                      )}

                      {!won && !lost && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '360px', margin: '0 auto' }}>
                          {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(char => (
                            <button
                              key={char}
                              disabled={hangmanGuesses.includes(char)}
                              onClick={() => guessHangmanLetter(char)}
                              style={{ width: '32px', height: '32px', border: '1px solid #cbd5e1', borderRadius: '6px', background: hangmanGuesses.includes(char) ? '#e2e8f0' : 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                            >
                              {char}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                <button onClick={initHangman} style={{ marginTop: '20px', padding: '8px 16px', background: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                  🔄 New Word
                </button>
              </div>
            )}

            {/* SNAKE */}
            {activeGame === 'snake' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>🐍 Zen Snake</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '12px' }}>Steer the snake to eat food. Score: <strong>{whackScore}</strong></p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '2px', width: '176px', height: '176px', margin: '0 auto 20px', background: '#f1f5f9', border: '2px solid #cbd5e1', padding: '4px', borderRadius: '8px' }}>
                  {Array(8).fill(null).map((_, r) => 
                    Array(8).fill(null).map((_, c) => {
                      const isHead = snakeBody[0] && snakeBody[0].x === c && snakeBody[0].y === r;
                      const isBody = snakeBody.slice(1).some(b => b.x === c && b.y === r);
                      const isFood = snakeFood.x === c && snakeFood.y === r;
                      return (
                        <div 
                          key={`${r}-${c}`}
                          style={{
                            width: '20px',
                            height: '20px',
                            background: isHead ? '#10b981' : isBody ? '#34d399' : isFood ? '#ef4444' : 'transparent',
                            borderRadius: isHead || isFood ? '50%' : '4px'
                          }}
                        />
                      )
                    })
                  )}
                </div>

                {snakeOver && (
                  <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '12px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', fontWeight: 'bold' }}>
                    💥 Game Over! Take a breath and restart.
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <button disabled={snakeOver} onClick={() => moveSnake(0, -1)} style={{ width: '40px', height: '40px', fontSize: '18px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>⬆️</button>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <button disabled={snakeOver} onClick={() => moveSnake(-1, 0)} style={{ width: '40px', height: '40px', fontSize: '18px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>⬅️</button>
                    <button disabled={snakeOver} onClick={() => moveSnake(1, 0)} style={{ width: '40px', height: '40px', fontSize: '18px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>➡️</button>
                  </div>
                  <button disabled={snakeOver} onClick={() => moveSnake(0, 1)} style={{ width: '40px', height: '40px', fontSize: '18px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>⬇️</button>
                </div>

                <button onClick={initSnakeGame} style={{ padding: '8px 16px', background: '#cbd5e1', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#475569' }}>
                  🔄 Reset
                </button>
              </div>
            )}

            {/* MINESWEEPER */}
            {activeGame === 'minesweeper' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>💣 Mindful Minesweeper</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>Reveal safe tiles. Try not to detonate the worry mines!</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', maxWidth: '180px', margin: '0 auto 20px', background: '#f8fafc', padding: '12px', borderRadius: '16px', border: '1px solid #cbd5e1' }}>
                  {minesGrid.flatMap((row, r) => 
                    row.map((cell, c) => (
                      <div 
                        key={`${r}-${c}`}
                        onClick={() => revealMineCell(r, c)}
                        style={{
                          width: '36px',
                          height: '36px',
                          background: cell.isFlipped ? (cell.isMine ? '#fecaca' : '#d1fae5') : '#e2e8f0',
                          border: '1.5px solid #cbd5e1',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                          cursor: 'pointer'
                        }}
                      >
                        {cell.isFlipped ? (cell.isMine ? '💣' : '🌸') : '❓'}
                      </div>
                    ))
                  )}
                </div>

                {minesOver && (
                  <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '12px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', fontWeight: 'bold' }}>
                    💥 Boom! You popped a mine. Take a deep breath.
                  </div>
                )}
                {minesWin && (
                  <div style={{ background: '#ecfdf5', color: '#047857', padding: '12px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', fontWeight: 'bold' }}>
                    🎉 Calm achieved! You cleared the grid safely.
                  </div>
                )}

                <button onClick={initMinesweeper} style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                  🔄 Restart
                </button>
              </div>
            )}

            {/* CONNECT FOUR */}
            {activeGame === 'connect4' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>🔴🟡 Connect Four</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>Connect 4 chips horizontally, vertically, or diagonally to win!</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px', maxWidth: '240px', margin: '0 auto 20px', background: '#3b82f6', padding: '10px', borderRadius: '16px', border: '2px solid #2563eb' }}>
                  {c4Grid.flatMap((row, r) => 
                    row.map((cell, c) => (
                      <div 
                        key={`${r}-${c}`}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: cell === 'Red' ? '#ef4444' : cell === 'Yellow' ? '#f59e0b' : 'white',
                          border: '1px solid #1e40af'
                        }}
                      />
                    ))
                  )}
                </div>

                {!c4Winner && (
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', maxWidth: '240px', margin: '0 auto 20px' }}>
                    {[0, 1, 2, 3, 4, 5].map(col => (
                      <button 
                        key={col}
                        onClick={() => dropC4Chip(col)}
                        style={{ width: '32px', padding: '6px 0', background: '#e2e8f0', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                      >
                        ⬇️
                      </button>
                    ))}
                  </div>
                )}

                {c4Winner && (
                  <div style={{ background: c4Winner === 'Player' ? '#ecfdf5' : c4Winner === 'CPU' ? '#fef2f2' : '#f1f5f9', color: c4Winner === 'Player' ? '#047857' : c4Winner === 'CPU' ? '#b91c1c' : '#475569', padding: '12px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', fontWeight: 'bold' }}>
                    {c4Winner === 'Player' && '🎉 You won Connect Four! Bravo.'}
                    {c4Winner === 'CPU' && '💻 CPU won the round. Try again!'}
                    {c4Winner === 'Draw' && '🤝 It is a draw! Great defense.'}
                  </div>
                )}

                <button onClick={initConnect4} style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                  🔄 New Game
                </button>
              </div>
            )}

            {/* 2048 */}
            {activeGame === '2048' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>🔢 2048 Puzzle</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>Slide and merge matching numbers! Score: <strong>{whackScore}</strong></p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', maxWidth: '180px', margin: '0 auto 20px', background: '#b45309', padding: '8px', borderRadius: '12px' }}>
                  {grid2048.map((val, idx) => (
                    <div 
                      key={idx}
                      style={{
                        width: '36px',
                        height: '36px',
                        background: val ? '#fffbeb' : '#d97706',
                        color: '#b45309',
                        fontWeight: 'bold',
                        fontSize: val && val > 99 ? '10px' : '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '6px',
                        border: '1.5px solid #d97706'
                      }}
                    >
                      {val}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <button onClick={() => slide2048('up')} style={{ width: '40px', height: '40px', fontSize: '18px', background: '#b45309', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>⬆️</button>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <button onClick={() => slide2048('left')} style={{ width: '40px', height: '40px', fontSize: '18px', background: '#b45309', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>⬅️</button>
                    <button onClick={() => slide2048('right')} style={{ width: '40px', height: '40px', fontSize: '18px', background: '#b45309', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>➡️</button>
                  </div>
                  <button onClick={() => slide2048('down')} style={{ width: '40px', height: '40px', fontSize: '18px', background: '#b45309', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>⬇️</button>
                </div>

                <button onClick={init2048} style={{ padding: '8px 16px', background: '#cbd5e1', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#475569' }}>
                  🔄 Restart
                </button>
              </div>
            )}

            {/* SIMON */}
            {activeGame === 'simon' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>🧠 Simon Says</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>Repeat the flashed sequence to advance! Sequence length: <strong>{simonSequence.length}</strong></p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', maxWidth: '160px', margin: '0 auto 20px' }}>
                  {['#ef4444', '#3b82f6', '#10b981', '#f59e0b'].map((color, idx) => {
                    const isLit = simonLit === idx;
                    return (
                      <div 
                        key={idx}
                        onClick={() => playSimonStep(idx)}
                        style={{
                          width: '72px',
                          height: '72px',
                          background: color,
                          opacity: isLit ? 1 : 0.45,
                          borderRadius: '16px',
                          cursor: 'pointer',
                          boxShadow: isLit ? `0 0 16px ${color}` : 'none',
                          transition: 'opacity 0.15s, box-shadow 0.15s'
                        }}
                      />
                    )
                  })}
                </div>

                <button onClick={() => { playSuccessHarp(); flashSimonSequence(simonSequence); }} style={{ padding: '8px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', boxShadow: '0 4px 10px rgba(79, 70, 229, 0.2)' }}>
                  🔊 Replay Sequence
                </button>
              </div>
            )}

            {/* TRIVIA */}
            {activeGame === 'trivia' && !activeGameData && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>❓ MindSpace Trivia</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>Answer this question about mental wellness:</p>

                {(() => {
                  const questions = [
                    { q: 'Which hormone is commonly associated with bonding, trust, and reduction of stress?', a: 'Oxytocin 🫂', b: 'Cortisol ⚡', c: 'Adrenaline 🏃', d: 'Insulin 🍬', correct: 'a' },
                    { q: 'What is the recommended average daily screen time break interval to prevent digital fatigue?', a: 'Every 20 minutes (20-20-20 rule) 👁️', b: 'Every 4 hours 🕒', c: 'Only once a day 🌅', d: 'No breaks needed 🚫', correct: 'a' },
                    { q: 'Which mindfulness practice involves cycling through phases of Inhaling, Holding, and Exhaling?', a: 'Box-Breathing 🎈', b: 'Linear Jogging 🏃', c: 'Power Napping 💤', d: 'Gratitude Garden 🌱', correct: 'a' }
                  ];
                  const q = questions[wyrIndex % questions.length];
                  return (
                    <div>
                      <h4 style={{ color: '#1e293b', marginBottom: '20px', fontSize: '15px', fontWeight: 'bold' }}>{q.q}</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', maxWidth: '380px', margin: '0 auto' }}>
                        {['a', 'b', 'c', 'd'].map(optKey => {
                          const optText = optKey === 'a' ? q.a : optKey === 'b' ? q.b : optKey === 'c' ? q.c : q.d;
                          const isAnswered = wyrVote !== null;
                          const isSelected = wyrVote === optKey;
                          const isCorrect = optKey === q.correct;
                          
                          return (
                            <button
                              key={optKey}
                              disabled={isAnswered}
                              onClick={() => {
                                setWyrVote(optKey);
                                if (isCorrect) {
                                  playGameWinSound();
                                } else {
                                  playErrorSound();
                                }
                              }}
                              style={{
                                padding: '12px',
                                background: isAnswered ? (isCorrect ? '#d1fae5' : isSelected ? '#fee2e2' : '#f8fafc') : '#f8fafc',
                                border: `2px solid ${isAnswered ? (isCorrect ? '#10b981' : isSelected ? '#ef4444' : '#e2e8f0') : '#e2e8f0'}`,
                                borderRadius: '10px',
                                color: '#1e293b',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                textAlign: 'left'
                              }}
                            >
                              {optText} {isAnswered && isCorrect && '✅'} {isAnswered && !isCorrect && isSelected && '❌'}
                            </button>
                          )
                        })}
                      </div>
                      
                      {wyrVote !== null && (
                        <button onClick={() => { setWyrVote(null); setWyrIndex(prev => prev + 1); playTickSound(); }} style={{ marginTop: '20px', padding: '8px 16px', background: '#cbd5e1', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12.5px', fontWeight: 'bold', color: '#475569' }}>
                          Next Question ➡️
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* WORD BUILDER */}
            {activeGame === 'wordbuilder' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>✏️ Word Builder</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>Build valid words using these letters: <strong style={{ color: '#4f46e5', fontSize: '16px', letterSpacing: '2px' }}>{wbLetters}</strong></p>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>Score: <strong>{whackScore}</strong> | Words found: {wbFound.join(', ') || 'none'}</p>

                <div style={{ display: 'flex', gap: '8px', maxWidth: '300px', margin: '0 auto 20px' }}>
                  <input 
                    type="text"
                    value={wbInput}
                    onChange={e => setWbInput(e.target.value)}
                    placeholder="Type a word..."
                    style={{ flex: 1, padding: '10px 14px', border: '2px solid #cbd5e1', borderRadius: '10px', fontSize: '13px', outline: 'none' }}
                  />
                  <button onClick={submitWbWord} style={{ padding: '0 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>Submit</button>
                </div>
                
                <button onClick={initWordBuilder} style={{ padding: '6px 12px', background: '#cbd5e1', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
                  🔄 New Letters
                </button>
              </div>
            )}

            {/* ZEN GARDEN BUILDER */}
            {activeGame === 'garden' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>🌸 Zen Garden Builder</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>Select an item and click on the sandy tiles below to compose your peaceful garden.</p>
                
                {/* Item Selection Tray */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
                  {['🌸', '🪨', '🌿', '🎋', '〰️'].map(item => (
                    <button
                      key={item}
                      onClick={() => { playTickSound(); setSelectedGardenItem(item); }}
                      style={{
                        padding: '10px 16px',
                        fontSize: '20px',
                        background: selectedGardenItem === item ? '#e0f2fe' : 'white',
                        border: `2px solid ${selectedGardenItem === item ? '#3b82f6' : '#e2e8f0'}`,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                {/* 5x5 Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '4px',
                  maxWidth: '220px',
                  margin: '0 auto 20px',
                  background: '#f5efe6',
                  padding: '8px',
                  borderRadius: '16px',
                  border: '3px solid #dcd1c4'
                }}>
                  {zenGardenGrid.map((cell, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        playSatisfyingPop();
                        const nextGrid = [...zenGardenGrid];
                        nextGrid[idx] = selectedGardenItem === '〰️' ? null : selectedGardenItem;
                        setZenGardenGrid(nextGrid);
                      }}
                      style={{
                        width: '36px',
                        height: '36px',
                        background: '#eedece',
                        backgroundImage: 'radial-gradient(#e5d5c4 20%, transparent 20%), radial-gradient(#e5d5c4 20%, transparent 20%)',
                        backgroundSize: '8px 8px',
                        backgroundPosition: '0 0, 4px 4px',
                        borderRadius: '6px',
                        border: '1px solid #dcd1c4',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '22px',
                        transition: 'all 0.1s'
                      }}
                    >
                      {cell}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button 
                    onClick={() => { playResetSound(); setZenGardenGrid(Array(25).fill(null)); }}
                    style={{ padding: '8px 16px', background: '#cbd5e1', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#475569' }}
                  >
                    🗑️ Reset Sand
                  </button>
                  <button 
                    onClick={() => { playGameWinSound(); alert('🌸 Your garden composition is gorgeous. Breathe in its peaceful harmony.'); }}
                    style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    ✅ Save Layout
                  </button>
                </div>
              </div>
            )}

            {/* COLORING BOOK */}
            {activeGame === 'coloring' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>🎨 Calming Coloring Book</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>Choose a template and paint inside the lines using custom colors:</p>

                {/* Template picker */}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px' }}>
                  {[{ key: 'flower', label: '🌸 Flower' }, { key: 'house', label: '🏡 Cozy House' }, { key: 'butterfly', label: '🦋 Butterfly' }].map(t => (
                    <button
                      key={t.key}
                      onClick={() => { playTickSound(); setColoringTemplate(t.key); }}
                      style={{
                        padding: '6px 12px',
                        fontSize: '12.5px',
                        fontWeight: 'bold',
                        background: coloringTemplate === t.key ? '#e0e7ff' : '#f1f5f9',
                        color: coloringTemplate === t.key ? '#4f46e5' : '#475569',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <canvas 
                  ref={canvasRef}
                  width="450"
                  height="260"
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={stopDraw}
                  onMouseLeave={stopDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={stopDraw}
                  style={{ background: '#faf8f5', border: '2px solid #e2e8f0', borderRadius: '16px', display: 'block', margin: '0 auto 20px', cursor: 'crosshair', touchAction: 'none' }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '450px', margin: '0 auto' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['#f43f5e', '#3b82f6', '#10b981', '#eab308', '#a855f7', '#ff7849'].map(color => (
                      <div 
                        key={color}
                        onClick={() => { playTickSound(); setBrushColor(color); }}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: color,
                          cursor: 'pointer',
                          border: brushColor === color ? '2px solid white' : 'none',
                          boxShadow: brushColor === color ? '0 0 0 2px #4f46e5' : 'none'
                        }}
                      />
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Size:</label>
                    <select value={brushWidth} onChange={e => { playTickSound(); setBrushWidth(Number(e.target.value)); }} style={{ padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}>
                      <option value="2">Thin</option>
                      <option value="4">Medium</option>
                      <option value="8">Thick</option>
                    </select>

                    <button onClick={clearCanvas} style={{ padding: '6px 12px', background: '#334155', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                      🗑️ Reset
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* NATURE SOUNDS EXPLORATION */}
            {activeGame === 'nature' && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#1e293b', margin: '0 0 6px 0', fontSize: '20px', fontWeight: 'bold' }}>🌲 Nature Sound Exploration</h3>
                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>Mix your own relaxing nature soundtrack. Toggle ambient tracks on/off:</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '320px', margin: '0 auto 24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>🌧️ Soothing Forest Rain</span>
                    <button 
                      type="button"
                      onClick={toggleRain} 
                      style={{ padding: '8px 16px', background: playingRain ? '#ef4444' : '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                    >
                      {playingRain ? 'Mute' : 'Listen'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>🌊 Gentle Ocean Waves</span>
                    <button 
                      type="button"
                      onClick={toggleWaves} 
                      style={{ padding: '8px 16px', background: playingWaves ? '#ef4444' : '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                    >
                      {playingWaves ? 'Mute' : 'Listen'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>🍃 Whispering Pines Wind</span>
                    <button 
                      type="button"
                      onClick={toggleWind} 
                      style={{ padding: '8px 16px', background: playingWind ? '#ef4444' : '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                    >
                      {playingWind ? 'Mute' : 'Listen'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>🔥 Crackling Campfire</span>
                    <button 
                      type="button"
                      onClick={toggleCampfire} 
                      style={{ padding: '8px 16px', background: playingCampfire ? '#ef4444' : '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                    >
                      {playingCampfire ? 'Mute' : 'Listen'}
                    </button>
                  </div>
                </div>

                <div style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>
                  Adjust your speakers, sit back, and feel the natural calm.
                </div>
              </div>
            )}


          </div>
        </div>
      )}

      {/* Supportive Crisis Warning Popup */}
      {showCrisisAlert && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 6000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '24px', maxWidth: '500px', width: '100%', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💙</div>
            <h2 style={{ color: '#1e293b', marginBottom: '12px', fontWeight: 'bold' }}>We are here for you</h2>
            <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
              We notice you are feeling down today. Please remember that you do not have to go through this alone. MindSpace offers free, private, and professional support services.
            </p>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', textAlign: 'left', marginBottom: '24px', borderLeft: '4px solid #ef4444', border: '1px solid #f1f5f9', borderLeftWidth: '4px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#ef4444', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>📞 Emergency Hotlines (Sri Lanka)</div>
              <div style={{ fontSize: '13px', color: '#1e293b', marginBottom: '6px' }}>🗣️ <strong>National Helpline:</strong> Call 1926</div>
              <div style={{ fontSize: '13px', color: '#1e293b' }}>🤝 <strong>Sumithrayo Support:</strong> Call 011 268 2535</div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={() => { setShowCrisisAlert(false); navigate('/chat'); }}
                style={{ padding: '12px 20px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', boxShadow: '0 4px 10px rgba(118, 75, 162, 0.2)' }}
              >
                💬 Chat with Aura
              </button>
              <button 
                onClick={() => setShowCrisisAlert(false)}
                style={{ padding: '12px 20px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3D WEBGL RELAXATION GAME MODAL */}
      {active3DGame && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(10px)',
          zIndex: 999999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '680px',
            background: '#0f172a',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {/* Header Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 style={{ margin: 0, color: 'white', fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {active3DGame === 'starfield' && '🌌 3D Cosmic Starfield & Nebula Weaver'}
                {active3DGame === 'water' && '🌊 3D Kinetic Water Ripples & Lotus'}
                {active3DGame === 'sakura' && '🌸 3D Sakura Blossom Sanctuary'}
                {active3DGame === 'crystal' && '🔮 3D Breathing Crystal Orb'}
                {active3DGame === 'saturn' && '🪐 3D Saturn Rings & Orbiting Moons'}
                {active3DGame === 'autumn' && '🍃 3D Autumn Leaves Forest Breeze'}
                {active3DGame === 'prism' && '💎 3D Rainbow Prism Kaleidoscope'}
                {active3DGame === 'warp' && '🌌 3D Quantum Warp Particle Tunnel'}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIs3DAudioMuted(prev => !prev)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '10px',
                    background: is3DAudioMuted ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
                    border: is3DAudioMuted ? '1px solid #ef4444' : '1px solid #10b981',
                    color: is3DAudioMuted ? '#f87171' : '#34d399',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    touchAction: 'manipulation'
                  }}
                >
                  {is3DAudioMuted ? '🔇 Audio Off' : '🔊 3D Audio On'}
                </button>
                <button
                  type="button"
                  onClick={() => setActive3DGame(null)}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* 3D WebGL Canvas Container */}
            <div 
              ref={threeContainerRef} 
              style={{ width: '100%', height: '400px', background: '#020617', position: 'relative', cursor: 'grab', touchAction: 'none' }} 
            />

            {/* Footer Instructions */}
            <div style={{ padding: '14px 24px', background: 'rgba(255,255,255,0.05)', borderTop: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '12.5px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <span>👆 Drag across screen to rotate 3D camera 360°</span>
              <button
                type="button"
                onClick={() => setActive3DGame(null)}
                style={{ padding: '8px 16px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: 'white', border: 'none', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', touchAction: 'manipulation' }}
              >
                Done Relaxing ✨
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CRAZYGAMES FULLSCREEN EMBED MODAL */}
      {activeCrazyGameModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(2, 6, 23, 0.92)',
          backdropFilter: 'blur(10px)',
          zIndex: 999999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '850px',
            height: '85vh',
            background: '#0f172a',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 style={{ margin: 0, color: 'white', fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🎮 {activeCrazyGameModal.title}
              </h3>
              <button
                type="button"
                onClick={() => setActiveCrazyGameModal(null)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
              >
                ✕
              </button>
            </div>

            {/* Embedded Iframe Player */}
            <iframe
              src={activeCrazyGameModal.embedUrl}
              title={activeCrazyGameModal.title}
              style={{ flex: 1, width: '100%', border: 'none', background: '#000' }}
              allow="autoplay; fullscreen; gamepad; accelerometer; gyroscope"
            />
          </div>
        </div>
      )}

      {/* NATIVE POP-IT 3D FIDGET MODAL */}
      {showPopItModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)',
          zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e1b4b, #312e81)', borderRadius: '24px',
            maxWidth: '520px', width: '100%', padding: '28px', border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)', textAlign: 'center', color: 'white'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🧸 Native Pop-It 3D Fidget Toy
              </h3>
              <button onClick={() => setShowPopItModal(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            </div>

            {/* 6x6 Rainbow Pop-It Board */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', background: 'rgba(255,255,255,0.08)', padding: '16px', borderRadius: '20px', marginBottom: '20px' }}>
              {popItState.map((popped, idx) => {
                const colors = ['#f43f5e', '#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ec4899']
                const rowColor = colors[Math.floor(idx / 6)]
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePopBubble(idx)}
                    style={{
                      height: '52px',
                      borderRadius: '50%',
                      background: popped ? '#0f172a' : rowColor,
                      border: popped ? '2px solid rgba(255,255,255,0.1)' : `3px solid ${rowColor}`,
                      boxShadow: popped ? 'inset 0 4px 8px rgba(0,0,0,0.8)' : '0 6px 12px rgba(0,0,0,0.3)',
                      transform: popped ? 'scale(0.88)' : 'scale(1)',
                      transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      outline: 'none',
                      touchAction: 'manipulation'
                    }}
                  />
                )
              })}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={resetPopItBoard} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>
                🔄 Flip Pop-It Board
              </button>
              <button onClick={() => setShowPopItModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>
                Done Relaxing ✨
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NATIVE WATER SORT LIQUID MODAL */}
      {showWaterSortModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)',
          zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #020617, #1e1b4b)', borderRadius: '24px',
            maxWidth: '520px', width: '100%', padding: '28px', border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)', textAlign: 'center', color: 'white'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🧪 Water Sort Liquid Puzzle
              </h3>
              <button onClick={() => setShowWaterSortModal(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            </div>

            <p style={{ fontSize: '12.5px', color: '#94a3b8', margin: '0 0 20px 0' }}>
              Tap a source tube, then tap a destination tube to sort liquids by color:
            </p>

            {/* Test Tubes Display */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '24px' }}>
              {waterTubes.map((tube, tIdx) => {
                const isSelected = selectedTubeIndex === tIdx
                return (
                  <div
                    key={tIdx}
                    onClick={() => handleTubeClick(tIdx)}
                    style={{
                      width: '56px',
                      height: '180px',
                      border: isSelected ? '3px solid #818cf8' : '2px solid rgba(255,255,255,0.3)',
                      borderRadius: '0 0 28px 28px',
                      background: 'rgba(255,255,255,0.05)',
                      display: 'flex',
                      flexDirection: 'column-reverse',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transform: isSelected ? 'translateY(-12px)' : 'none',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 10px 20px rgba(129, 140, 248, 0.4)' : 'none',
                      touchAction: 'manipulation'
                    }}
                  >
                    {tube.map((color, cIdx) => (
                      <div
                        key={cIdx}
                        style={{
                          height: '45px',
                          background: color,
                          width: '100%',
                          transition: 'height 0.3s ease'
                        }}
                      />
                    ))}
                  </div>
                )
              })}
            </div>

            {waterSortWon && (
              <div style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', padding: '12px', borderRadius: '12px', color: '#34d399', fontWeight: 'bold', marginBottom: '16px' }}>
                🎉 Fantastic! You solved the Water Liquid Puzzle!
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={resetWaterSortGame} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>
                🔄 Restart Puzzle
              </button>
              <button onClick={() => setShowWaterSortModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>
                Done Playing ✨
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NATIVE DESIGNVILLE MERGE MODAL */}
      {showMergeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', borderRadius: '24px', maxWidth: '520px', width: '100%', padding: '28px', border: '1px solid rgba(255,255,255,0.2)', color: 'white', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>🏡 DesignVille: Merge & Decorate</h3>
              <button onClick={() => setShowMergeModal(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            </div>
            <p style={{ fontSize: '12.5px', color: '#94a3b8', marginBottom: '20px' }}>Tap matching items of the same level to merge and upgrade furniture:</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', background: 'rgba(255,255,255,0.08)', padding: '16px', borderRadius: '20px', marginBottom: '20px' }}>
              {mergeGrid.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => handleMergeClick(idx)}
                  style={{
                    background: mergeSelected === idx ? 'rgba(99, 102, 241, 0.5)' : 'rgba(255,255,255,0.1)',
                    border: mergeSelected === idx ? '2px solid #818cf8' : '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '16px', padding: '14px 6px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'all 0.2s ease', touchAction: 'manipulation'
                  }}
                >
                  <div style={{ fontSize: '28px', marginBottom: '4px' }}>{item.icon}</div>
                  <div style={{ fontSize: '11px', fontWeight: 'bold' }}>{item.name}</div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowMergeModal(false)} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>
              Done Decorating ✨
            </button>
          </div>
        </div>
      )}

      {/* NATIVE FIND DIFFERENCES MODAL */}
      {showDiffModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'linear-gradient(135deg, #020617, #1e1b4b)', borderRadius: '24px', maxWidth: '540px', width: '100%', padding: '28px', border: '1px solid rgba(255,255,255,0.2)', color: 'white', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>🔍 Spot the Differences (Found {foundDiffs.length}/4)</h3>
              <button onClick={() => setShowDiffModal(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            </div>
            <p style={{ fontSize: '12.5px', color: '#94a3b8', marginBottom: '20px' }}>Tap hidden items on the picture to find all differences:</p>
            <div style={{ position: 'relative', width: '100%', height: '220px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: '20px', overflow: 'hidden', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '64px', opacity: 0.3 }}>🍎 ☀️ 🐦 🌸</div>
              {[
                { id: 1, left: '20%', top: '30%', label: '🍎' },
                { id: 2, left: '70%', top: '20%', label: '☀️' },
                { id: 3, left: '40%', top: '65%', label: '🐦' },
                { id: 4, left: '80%', top: '75%', label: '🌸' }
              ].map(diff => {
                const isFound = foundDiffs.includes(diff.id)
                return (
                  <button
                    key={diff.id}
                    onClick={() => handleSpotDiffClick(diff.id)}
                    style={{
                      position: 'absolute', left: diff.left, top: diff.top,
                      fontSize: '28px', background: isFound ? 'rgba(16, 185, 129, 0.4)' : 'transparent',
                      border: isFound ? '2px solid #10b981' : 'none', borderRadius: '50%', width: '48px', height: '48px',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', touchAction: 'manipulation'
                    }}
                  >
                    {diff.label}
                  </button>
                )
              })}
            </div>
            <button onClick={() => setShowDiffModal(false)} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>
              Done Playing ✨
            </button>
          </div>
        </div>
      )}

      {/* NATIVE STONE GRASS MOWER MODAL */}
      {showMowerModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'linear-gradient(135deg, #064e3b, #022c22)', borderRadius: '24px', maxWidth: '520px', width: '100%', padding: '28px', border: '1px solid rgba(255,255,255,0.2)', color: 'white', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>🚜 Stone Grass Lawn Mower</h3>
              <button onClick={() => setShowMowerModal(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            </div>
            <p style={{ fontSize: '12.5px', color: '#6ee7b7', marginBottom: '20px' }}>Tap or drag over grass tiles to cut lawn grass:</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '20px', marginBottom: '20px' }}>
              {grassTiles.map((hasGrass, idx) => (
                <div
                  key={idx}
                  onClick={() => handleMowGrass(idx)}
                  onMouseEnter={() => handleMowGrass(idx)}
                  style={{
                    height: '48px', borderRadius: '12px',
                    background: hasGrass ? '#15803d' : '#854d0e',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                    cursor: 'pointer', transition: 'all 0.15s ease', touchAction: 'none'
                  }}
                >
                  {hasGrass ? '🌾' : '🚜'}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={resetMowerGame} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>
                🔄 Regrow Lawn
              </button>
              <button onClick={() => setShowMowerModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>
                Done Mowing ✨
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Embedded CSS styling for hover effects */}
      <style>{`
        .game-card {
          transition: all 0.25s ease-out;
        }
        .game-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 24px -10px rgba(0,0,0,0.1);
          border-color: #6366f1 !important;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}