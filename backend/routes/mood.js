const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const Mood = require('../models/Mood')
const User = require('../models/User')

// Search Relaxing Music (Public API for Mobile & Web)
router.get('/search-music', async (req, res) => {
  try {
    const query = req.query.q || 'Relaxing Meditation'
    const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=15`)
    const data = await response.json()
    const tracks = (data.results || []).map(t => ({
      trackId: t.trackId,
      trackName: t.trackName,
      artistName: t.artistName,
      artworkUrl: t.artworkUrl100 || t.artworkUrl60,
      previewUrl: t.previewUrl
    }))
    res.json(tracks)
  } catch (err) {
    res.status(500).json({ message: 'Error searching music' })
  }
})

// User Auth Middleware
const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'No token' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)
    if (!user) return res.status(401).json({ message: 'User not found' })
    if (user.status === 'deactivated') {
      return res.status(403).json({ message: 'Your account has been deactivated. Please contact support.' })
    }
    req.user = user
    next()
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' })
  }
}

// Counselor Auth Middleware
const counselorAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'No token' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)
    if (!user) return res.status(401).json({ message: 'User not found' })
    if (user.status === 'deactivated') {
      return res.status(403).json({ message: 'Your account has been deactivated. Please contact support.' })
    }
    if (user.role !== 'admin' && user.role !== 'counsellor') {
      return res.status(403).json({ message: 'Access denied: Counselors only' })
    }
    req.user = user
    next()
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' })
  }
}

// Helper: Journal Sentiment Analysis & Suggestions
function analyzeSentiment(note, sleepHours, waterIntake, screenTime, isExamPeriod) {
  if (!note) return { score: 0, label: 'Neutral', suggestions: [] }
  
  const posWords = ['happy', 'great', 'joy', 'good', 'peaceful', 'love', 'productive', 'amazing', 'proud', 'awesome', 'calm', 'relaxed', 'සතුටු', 'හොඳ', 'සාමකාමී', 'ආදරේ', 'නිදහස්', 'සුවපහසු']
  const negWords = ['sad', 'depressed', 'bad', 'down', 'anxiety', 'stressed', 'tired', 'lonely', 'angry', 'hate', 'pressure', 'overwhelmed', 'worry', 'pain', 'දුක', 'කනගාටු', 'නරක', 'බය', 'නොසන්සුන්', 'ස්ට්‍රෙස්', 'මහන්සි', 'තනිවම', 'තරහ']
  
  const words = note.toLowerCase().split(/\s+/)
  let score = 0
  words.forEach(w => {
    if (posWords.some(pw => w.includes(pw))) score++
    if (negWords.some(nw => w.includes(nw))) score--
  })
  
  let label = 'Neutral'
  let suggestions = []
  
  if (score > 0) {
    label = 'Positive'
    suggestions.push('Fantastic positive energy! Share this vibe by reaching out to a friend or write down details of your success.')
    suggestions.push('Keep up this great momentum. Consider working on a creative design or studying your favorite topic today.')
  } else if (score < 0) {
    label = 'Negative'
    suggestions.push('It seems like you are having a heavy day. Be extremely gentle with yourself. Try pop some bubble wrap or take a box-breathing break.')
    suggestions.push('Your feelings are valid. Consider speaking to a campus counselor or scheduling an Aura chat session for release.')
  } else {
    label = 'Neutral'
    suggestions.push('A steady, balanced day. Take a moment to stretch, hydrate, and maintain this stable state.')
  }

  // Lifestyle factor alerts
  if (sleepHours < 6) {
    suggestions.push('Sleep alert: You slept less than 6 hours. Minimize screens 45 minutes before bed to support sleep hygiene.')
  }
  if (waterIntake < 1500) {
    suggestions.push('Hydration alert: Your water intake is low. Sip water periodically to avoid dehydration fatigue.')
  }
  if (screenTime > 6) {
    suggestions.push('Screen alert: Screen duration is high. We suggest a short screen detox walk to rest your eyes.')
  }
  if (isExamPeriod) {
    suggestions.push('Exam stress alert: Academic pressure is active. Take 5-minute study pauses to avoid cognitive overload.')
  }

  return { score, label, suggestions }
}

// Helper: Compile Mood Analytics
const compileAnalytics = (moods) => {
  if (moods.length === 0) {
    return {
      averageMood: 0,
      mostCommonMood: 'N/A',
      mostCommonTrigger: 'N/A',
      weeklyTrend: [],
      monthlyTrend: [],
      triggerFrequency: [],
      activityVsMood: [],
      sleepVsMood: [],
      weatherVsMood: [],
      musicVsMood: [],
      examStressAnalysis: { exam: 0, nonExam: 0 },
      weeklySummary: 'No logs available yet to generate your weekly wellness summary.',
      predictedMood: 3.0,
      heatmapData: []
    }
  }

  // Average mood score
  const avgMood = moods.reduce((acc, curr) => acc + curr.value, 0) / moods.length

  // Most common mood label
  const moodCounts = {}
  moods.forEach(m => { moodCounts[m.label] = (moodCounts[m.label] || 0) + 1 })
  let mostCommonMood = 'N/A'
  let maxMoodCount = 0
  Object.keys(moodCounts).forEach(label => {
    if (moodCounts[label] > maxMoodCount) {
      maxMoodCount = moodCounts[label]
      mostCommonMood = label
    }
  })

  // Most common trigger
  const triggerCounts = {}
  moods.forEach(m => {
    if (m.trigger) {
      triggerCounts[m.trigger] = (triggerCounts[m.trigger] || 0) + 1
    }
  })
  let mostCommonTrigger = 'N/A'
  let maxTriggerCount = 0
  Object.keys(triggerCounts).forEach(trig => {
    if (triggerCounts[trig] > maxTriggerCount) {
      maxTriggerCount = triggerCounts[trig]
      mostCommonTrigger = trig
    }
  })

  // Sort moods ascending for graphs
  const sortedMoods = [...moods].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  
  const formatDateString = (dateObj) => {
    const d = new Date(dateObj)
    return `${d.getMonth() + 1}/${d.getDate()}`
  }

  const weeklyTrend = sortedMoods.slice(-7).map(m => ({
    date: formatDateString(m.createdAt),
    mood: m.value
  }))

  const monthlyTrend = sortedMoods.slice(-30).map(m => ({
    date: formatDateString(m.createdAt),
    mood: m.value
  }))

  // Trigger counts list
  const triggerFrequency = Object.keys(triggerCounts).map(trig => ({
    name: trig,
    count: triggerCounts[trig]
  }))

  // Activity vs Mood
  const activityMoods = {}
  moods.forEach(m => {
    if (m.activities) {
      m.activities.forEach(act => {
        if (!activityMoods[act]) activityMoods[act] = []
        activityMoods[act].push(m.value)
      })
    }
  })
  const activityVsMood = Object.keys(activityMoods).map(act => ({
    name: act,
    avgMood: Number((activityMoods[act].reduce((a, b) => a + b, 0) / activityMoods[act].length).toFixed(2))
  }))

  // Sleep vs Mood
  const sleepVsMood = moods.map(m => ({
    sleep: m.sleepHours,
    mood: m.value,
    date: formatDateString(m.createdAt)
  }))

  // Weather vs Mood
  const weatherMoods = {}
  moods.forEach(m => {
    if (m.weather) {
      if (!weatherMoods[m.weather]) weatherMoods[m.weather] = []
      weatherMoods[m.weather].push(m.value)
    }
  })
  const weatherVsMood = Object.keys(weatherMoods).map(w => ({
    name: w,
    avgMood: Number((weatherMoods[w].reduce((a, b) => a + b, 0) / weatherMoods[w].length).toFixed(2))
  }))

  // Music vs Mood
  const musicMoods = {}
  moods.forEach(m => {
    if (m.music) {
      if (!musicMoods[m.music]) musicMoods[m.music] = []
      musicMoods[m.music].push(m.value)
    }
  })
  const musicVsMood = Object.keys(musicMoods).map(msc => ({
    name: msc,
    avgMood: Number((musicMoods[msc].reduce((a, b) => a + b, 0) / musicMoods[msc].length).toFixed(2))
  }))

  // Exam Stress
  const examMoods = moods.filter(m => m.isExamPeriod).map(m => m.value)
  const nonExamMoods = moods.filter(m => !m.isExamPeriod).map(m => m.value)
  const examStressAnalysis = {
    exam: examMoods.length > 0 ? Number((examMoods.reduce((a, b) => a + b, 0) / examMoods.length).toFixed(2)) : 0,
    nonExam: nonExamMoods.length > 0 ? Number((nonExamMoods.reduce((a, b) => a + b, 0) / nonExamMoods.length).toFixed(2)) : 0
  }

  // Heatmap Data (YYYY-MM-DD)
  const heatmapData = moods.map(m => {
    const d = new Date(m.createdAt)
    const localD = new Date(d.getTime() - (d.getTimezoneOffset() * 60000))
    const dateStr = localD.toISOString().split('T')[0]
    return {
      date: dateStr,
      value: m.value,
      color: m.color || '#6366f1'
    }
  })

  // Summary
  const totalSleep = moods.reduce((a, b) => a + b.sleepHours, 0)
  const avgSleep = totalSleep / moods.length
  const totalWater = moods.reduce((a, b) => a + b.waterIntake, 0)
  const avgWater = totalWater / moods.length
  
  let summary = `Your average mood index is ${avgMood.toFixed(1)}/5.0 ("${mostCommonMood}"). `
  summary += `You logged an average of ${avgSleep.toFixed(1)} sleep hours and ${avgWater.toFixed(0)}ml hydration. `
  if (mostCommonTrigger !== 'N/A') {
    summary += `The most frequent trigger logged was "${mostCommonTrigger}". `
  }

  // Highlight what helps
  const helpedCounts = {}
  moods.forEach(m => {
    if (m.whatHelped) {
      m.whatHelped.forEach(h => { helpedCounts[h] = (helpedCounts[h] || 0) + 1 })
    }
  })
  let bestHelper = 'N/A'
  let maxHelperCount = 0
  Object.keys(helpedCounts).forEach(h => {
    if (helpedCounts[h] > maxHelperCount) {
      maxHelperCount = helpedCounts[h]
      bestHelper = h
    }
  })
  if (bestHelper !== 'N/A') {
    summary += `Practicing "${bestHelper}" helped boost your state the most. `
  }

  if (avgSleep < 7.0) {
    summary += `AI Advice: Your sleep levels are currently below 7 hours. Try reducing screen exposure before sleeping to enhance REM sleep recovery.`
  } else {
    summary += `AI Advice: Great job maintaining healthy rest cycles!`
  }

  // AI Prediction
  let predictedMood = avgMood
  if (moods.length >= 3) {
    const recentValue1 = moods[0].value // newest
    const recentValue2 = moods[1].value
    const recentValue3 = moods[2].value
    const diff = ((recentValue1 - recentValue2) + (recentValue2 - recentValue3)) / 2
    predictedMood = Math.max(1.0, Math.min(5.0, recentValue1 + diff))
  }

  return {
    averageMood: Number(avgMood.toFixed(2)),
    mostCommonMood,
    mostCommonTrigger,
    weeklyTrend,
    monthlyTrend,
    triggerFrequency,
    activityVsMood,
    sleepVsMood,
    weatherVsMood,
    musicVsMood,
    examStressAnalysis,
    weeklySummary: summary,
    predictedMood: Number(predictedMood.toFixed(2)),
    heatmapData
  }
}

// Get all student mood logs (Counselors/Admins only)
router.get('/all', counselorAuth, async (req, res) => {
  try {
    const moods = await Mood.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(100)
    res.json(moods)
  } catch (err) {
    res.status(500).json({ message: 'Server error loading all student logs' })
  }
})

// Get compiled user analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const moods = await Mood.find({ user: req.user.id }).sort({ createdAt: -1 })
    const stats = compileAnalytics(moods)
    res.json(stats)
  } catch (err) {
    res.status(500).json({ message: 'Server error compiling stats' })
  }
})

// Helper: Timeout Fetch
async function fetchWithTimeout(url, options = {}, timeout = 2500) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  try {
    const response = await fetch(url, { ...options, signal: controller.signal })
    clearTimeout(id)
    if (!response.ok) throw new Error(`HTTP status ${response.status}`)
    return await response.json()
  } catch (error) {
    clearTimeout(id)
    throw error
  }
}

// Helper: Shuffle Array
function shuffleArray(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

// Helper: Scramble Word
function scrambleWord(word) {
  let arr = word.split('')
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.join('')
}

// Get dynamic recommendations based on mood value (1 to 5)
// CONNECTED TO GAME APIS: This endpoint returns a customized list of 5 therapeutic games/activities.
// It integrates with Lichess, Open Trivia DB, Random Word, and ZenQuotes external APIs.
router.get('/recommendations', auth, async (req, res) => {
  try {
    const moodValue = parseInt(req.query.moodValue) || 3
    let gamesList = []

    if (moodValue === 5) {
      // Great Mood (5)
      // 1. Chess Puzzle (Lichess API Connection)
      // Connects to the public Lichess Puzzle API to fetch the daily chess puzzle dynamically.
      let chessData = {
        fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR b KQkq - 0 1",
        solution: ["c6d4", "f3f7"],
        rating: 600,
        id: "local_1"
      }
      try {
        const lichessRes = await fetchWithTimeout('https://lichess.org/api/puzzle/daily', {}, 2000)
        if (lichessRes && lichessRes.game && lichessRes.puzzle) {
          chessData = {
            fen: lichessRes.game.fen,
            solution: lichessRes.puzzle.solution,
            rating: lichessRes.puzzle.rating,
            id: lichessRes.puzzle.id
          }
        }
      } catch (err) {
        console.log("Lichess API failed, using fallback chess puzzle:", err.message)
      }

      // 2. Trivia Quiz (Open Trivia DB API Connection)
      // Connects to Open Trivia Database API to dynamically fetch a random trivia question.
      let triviaData = {
        question: "Which hormone is commonly associated with bonding, trust, and reduction of stress?",
        options: ["Cortisol", "Adrenaline", "Oxytocin", "Melatonin"],
        correct_answer: "Oxytocin"
      }
      try {
        const triviaRes = await fetchWithTimeout('https://opentdb.com/api.php?amount=1&type=multiple', {}, 2000)
        if (triviaRes && triviaRes.results && triviaRes.results[0]) {
          const item = triviaRes.results[0]
          triviaData = {
            question: item.question,
            options: shuffleArray([...item.incorrect_answers, item.correct_answer]),
            correct_answer: item.correct_answer
          }
        }
      } catch (err) {
        console.log("Trivia API failed, using fallback trivia quiz:", err.message)
      }

      // 3. Speed Math
      const n1 = Math.floor(Math.random() * 80) + 15
      const n2 = Math.floor(Math.random() * 80) + 15
      const ans = n1 + n2
      const speedMathData = {
        question: `${n1} + ${n2} = ?`,
        answer: ans,
        options: shuffleArray([ans, ans + 4, ans - 3])
      }

      // 4. Visual Memory
      const sequence = Array.from({ length: 4 }, () => Math.floor(Math.random() * 4) + 1)
      const visualMemoryData = { sequence }

      // 5. Pattern Match
      const shapes = ["🔺", "🟦", "🟡", "🟢"]
      const s1 = shapes[Math.floor(Math.random() * shapes.length)]
      const s2 = shapes[Math.floor(Math.random() * shapes.length)]
      const patternMatchData = {
        sequence: [s1, s2, s1, s2, "?"],
        answer: s1,
        options: shuffleArray([s1, s2, shapes.find(s => s !== s1 && s !== s2) || "🟡"])
      }

      gamesList = [
        { key: 'game', title: 'Chess Puzzle 👑', icon: '👑', desc: 'Solve the daily Lichess chess puzzle!', subtype: 'chess', data: chessData },
        { key: 'game', title: 'Trivia Quiz ❓', icon: '❓', desc: 'Test your knowledge on interesting facts!', subtype: 'trivia', data: triviaData },
        { key: 'game', title: 'Speed Math ⚡', icon: '⚡', desc: 'Solve rapid math equations quickly.', subtype: 'speedmath', data: speedMathData },
        { key: 'game', title: 'Visual Memory 🧠', icon: '🧠', desc: 'Repeat the flashed sequence of grids.', subtype: 'visualmemory', data: visualMemoryData },
        { key: 'game', title: 'Pattern Match 📊', icon: '📊', desc: 'Guess the missing shape in the pattern.', subtype: 'patternmatch', data: patternMatchData }
      ]
    } else if (moodValue === 4) {
      // Good Mood (4)
      // 1. Sudoku (Sudoku API)
      let sudokuData = {
        board: [
          [5,3,0,0,7,0,0,0,0],
          [6,0,0,1,9,5,0,0,0],
          [0,9,8,0,0,0,0,6,0],
          [8,0,0,0,6,0,0,0,3],
          [4,0,0,8,0,3,0,0,1],
          [7,0,0,0,2,0,0,0,6],
          [0,6,0,0,0,0,2,8,0],
          [0,0,0,4,1,9,0,0,5],
          [0,0,0,0,8,0,0,7,9]
        ],
        solution: [
          [5,3,4,6,7,8,9,1,2],
          [6,7,2,1,9,5,3,4,8],
          [1,9,8,3,4,2,5,6,7],
          [8,5,9,7,6,1,4,2,3],
          [4,2,6,8,5,3,7,9,1],
          [7,1,3,9,2,4,8,5,6],
          [9,6,1,5,3,7,2,8,4],
          [2,8,7,4,1,9,6,3,5],
          [3,4,5,2,8,6,1,7,9]
        ]
      }
      try {
        const sudokuRes = await fetchWithTimeout('https://sudoku-api.vercel.app/api/dosuku?query={newboard(limit:1){ofgrids{value,solution}}}', {}, 2000)
        if (sudokuRes && sudokuRes.newboard && sudokuRes.newboard.grids && sudokuRes.newboard.grids[0]) {
          const grid = sudokuRes.newboard.grids[0]
          sudokuData = {
            board: grid.value,
            solution: grid.solution
          }
        }
      } catch (err) {
        console.log("Sudoku API failed, using fallback sudoku puzzle:", err.message)
      }

      // 2. Crossword
      const crosswordData = {
        clues: [
          { word: "PEACE", clue: "A state of tranquility or quiet." },
          { word: "CALM", clue: "Free from agitation or excitement." },
          { word: "MINDFUL", clue: "Conscious or aware of one's surroundings." }
        ]
      }

      // 3. Word Scramble (Random Word API Connection)
      // Connects to Random Word API to fetch a random dictionary word for the scramble game.
      let word = "serenity"
      try {
        const wordRes = await fetchWithTimeout('https://random-word-api.herokuapp.com/word?number=1', {}, 2000)
        if (wordRes && wordRes[0]) {
          word = wordRes[0].toLowerCase()
        }
      } catch (err) {
        console.log("Random Word API failed, using fallback scramble word:", err.message)
      }
      const scrambleData = {
        scrambled: scrambleWord(word),
        original: word
      }

      // 4. Number Sequence
      const sequences = [
        { seq: [2, 4, 8, 16], ans: 32, opts: [24, 30, 32, 64] },
        { seq: [5, 10, 15, 20], ans: 25, opts: [22, 25, 30, 35] },
        { seq: [1, 3, 6, 10], ans: 15, opts: [12, 14, 15, 18] }
      ]
      const chosenSeq = sequences[Math.floor(Math.random() * sequences.length)]
      const numberSequenceData = {
        sequence: chosenSeq.seq,
        answer: chosenSeq.ans,
        options: shuffleArray(chosenSeq.opts)
      }

      // 5. Logic Puzzle
      const logicPuzzleData = {
        question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
        answer: "echo",
        options: shuffleArray(["echo", "shadow", "cloud", "mirror"])
      }

      gamesList = [
        { key: 'game', title: 'Sudoku 🔢', icon: '🔢', desc: 'Solve a relaxing Sudoku grid!', subtype: 'sudoku', data: sudokuData },
        { key: 'game', title: 'Crossword 🧩', icon: '🧩', desc: 'Solve a mindful word clue crossword!', subtype: 'crossword', data: crosswordData },
        { key: 'game', title: 'Word Scramble 🔤', icon: '🔤', desc: 'Unscramble the scrambled letters!', subtype: 'scramble', data: scrambleData },
        { key: 'game', title: 'Number Sequence 📈', icon: '📈', desc: 'Find the missing number in the sequence!', subtype: 'numbersequence', data: numberSequenceData },
        { key: 'game', title: 'Logic Riddle 🧠', icon: '🧠', desc: 'Solve a thought-provoking logic riddle!', subtype: 'logicpuzzle', data: logicPuzzleData }
      ]
    } else if (moodValue === 3) {
      // Okay Mood (3)
      // 1. Word Search (Random Word API Connection)
      // Connects to Random Word API to fetch 5 random words for the Mindful Word Search grid.
      let wordList = ['peace', 'calm', 'joy', 'heal', 'hope']
      try {
        const wordRes = await fetchWithTimeout('https://random-word-api.herokuapp.com/word?number=5', {}, 2000)
        if (wordRes && wordRes.length >= 5) {
          wordList = wordRes.map(w => w.toUpperCase())
        }
      } catch (err) {
        console.log("Random Word API failed, using fallback wordsearch words:", err.message)
      }
      const wordSearchData = { words: wordList }

      // 2. Simon Memory
      const simonMemoryData = { sequence: [0, 2, 1, 3] }

      // 3. Spot Difference
      const emojis = ["🐱", "🐶", "🦁", "🐯", "🐼", "🐸"]
      const base = emojis[Math.floor(Math.random() * emojis.length)]
      const diff = emojis.find(e => e !== base) || "🐹"
      const grid = Array(9).fill(base)
      const diffIdx = Math.floor(Math.random() * 9)
      grid[diffIdx] = diff
      const spotDifferenceData = { grid, diffIdx }

      // 4. Nonogram
      const nonogramData = {
        rowClues: [[1], [3], [5], [3], [1]],
        colClues: [[1], [3], [5], [3], [1]],
        grid: [
          [0,0,1,0,0],
          [0,1,1,1,0],
          [1,1,1,1,1],
          [0,1,1,1,0],
          [0,0,1,0,0]
        ]
      }

      // 5. Kakuro
      const kakuroData = {
        rowSums: [4, 6],
        colSums: [5, 5],
        solution: [
          [1, 3],
          [4, 2]
        ]
      }

      gamesList = [
        { key: 'game', title: 'Word Search 🔍', icon: '🔍', desc: 'Find positive words hidden in letters.', subtype: 'wordsearch', data: wordSearchData },
        { key: 'game', title: 'Simon Memory 🧠', icon: '🧠', desc: 'Repeat the flashed sequence of colors.', subtype: 'simon', data: simonMemoryData },
        { key: 'game', title: 'Spot Difference 👁️', icon: '👁️', desc: 'Find the emoji that is different.', subtype: 'spotdifference', data: spotDifferenceData },
        { key: 'game', title: 'Nonogram 🎨', icon: '🎨', desc: 'Paint cells to build a beautiful design.', subtype: 'nonogram', data: nonogramData },
        { key: 'game', title: 'Kakuro ➕', icon: '➕', desc: 'Solve cross-addition number puzzles.', subtype: 'kakuro', data: kakuroData }
      ]
    } else if (moodValue === 2) {
      // Bad Mood (2)
      // 1. Jigsaw Puzzle
      const jigsawData = {
        tiles: [2, 0, 3, 1], // scrambled
        solution: [0, 1, 2, 3]
      }

      // 2. Coloring Activity
      const coloringData = { template: "flower" }

      // 3. Shape Sort
      const shapeSortData = {
        shapes: [
          { id: 1, name: "Circle", color: "#f43f5e" },
          { id: 2, name: "Square", color: "#3b82f6" },
          { id: 3, name: "Triangle", color: "#10b981" }
        ]
      }

      // 4. Relax Match
      const relaxMatchData = {
        cards: shuffleArray(["🌸", "🌸", "🪨", "🪨", "🍃", "🍃"])
      }

      // 5. Zen Puzzle
      const zenPuzzleData = {
        tiles: [1, 2, 0, 3],
        solution: [1, 2, 3, 0]
      }

      gamesList = [
        { key: 'game', title: 'Jigsaw Puzzle 🖼️', icon: '🖼️', desc: 'Click/swap pieces to assemble a calm picture.', subtype: 'jigsaw', data: jigsawData },
        { key: 'game', title: 'Coloring Book 🎨', icon: '🎨', desc: 'Paint peaceful templates on canvas.', subtype: 'coloring', data: coloringData },
        { key: 'game', title: 'Shape Sort 📐', icon: '📐', desc: 'Match drag shapes to correct slots.', subtype: 'shapesort', data: shapeSortData },
        { key: 'game', title: 'Relax Match 🧩', icon: '🧩', desc: 'Soften the mind by matching calming pairs.', subtype: 'relaxmatch', data: relaxMatchData },
        { key: 'game', title: 'Zen Puzzle 🌸', icon: '🌸', desc: 'Organize sliding blocks in zen style.', subtype: 'zenpuzzle', data: zenPuzzleData }
      ]
    } else {
      // Terrible Mood (1)
      // 1. Breathing Game
      const breathingData = { inhale: 4, hold: 4, exhale: 4, rest: 4 }

      // 2. Gratitude Challenge
      const gratitudeData = {
        prompts: ["Something beautiful you saw today 🌸", "A sound in nature you enjoy 🍃", "A person you are glad is in your life ❤️"]
      }

      // 3. Emotion Match
      const emotionMatchData = {
        cards: shuffleArray(["😄 Great", "😄 Great", "😐 Okay", "😐 Okay", "😢 Terrible", "😢 Terrible"])
      }

      // 4. Positive Quotes (ZenQuotes API Connection)
      // Connects to ZenQuotes API to fetch a calming, positive quote for terrible mood state.
      let quoteData = {
        text: "Act as if what you do makes a difference. It does.",
        author: "William James"
      }
      try {
        const quoteRes = await fetchWithTimeout('https://zenquotes.io/api/random', {}, 2000)
        if (quoteRes && quoteRes[0]) {
          quoteData = {
            text: quoteRes[0].q,
            author: quoteRes[0].a
          }
        }
      } catch (err) {
        console.log("ZenQuotes API failed, using fallback positive quote:", err.message)
      }

      // 5. Calm Activity Generator
      const activities = [
        "Sip a warm cup of herbal tea 🍵",
        "Close your eyes and take 3 deep belly breaths 🧘",
        "Stretch your arms above your head for 10 seconds 🙆",
        "Sit completely still and focus on a distant sound 🕊️",
        "Write down one simple thing you appreciate about today ✍️"
      ]
      const calmGeneratorData = {
        activity: activities[Math.floor(Math.random() * activities.length)]
      }

      gamesList = [
        { key: 'game', title: 'Breathing Game 🎈', icon: '🎈', desc: 'Follow guided deep box breathing animation cycles.', subtype: 'breathing', data: breathingData },
        { key: 'game', title: 'Gratitude Challenge 📜', icon: '📜', desc: 'Find 3 positive items around you.', subtype: 'gratitude', data: gratitudeData },
        { key: 'game', title: 'Emotion Match 🧩', icon: '🧩', desc: 'Identify matching emotional expressions.', subtype: 'emotionmatch', data: emotionMatchData },
        { key: 'game', title: 'Positive Quotes 💬', icon: '💬', desc: 'Savor a random positive affirmation.', subtype: 'positivequotes', data: quoteData },
        { key: 'game', title: 'Calm Generator 🏡', icon: '🏡', desc: 'Get a recommended calming physical exercise.', subtype: 'calmgenerator', data: calmGeneratorData }
      ]
    }

    res.json(gamesList)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error loading recommendations' })
  }
})

// Save mood log with streak, badge, and AI sentiment checks
router.post('/', auth, async (req, res) => {
  try {
    const { 
      emoji, label, value, note,
      trigger, isCustomTrigger, activities,
      sleepHours, waterIntake, screenTime, exerciseDuration, energyLevel,
      voiceNote, photo, weather, music, isExamPeriod, color, whatHelped,
      recommendations
    } = req.body

    // 1. Analyze journal note sentiment
    const aiSentiment = analyzeSentiment(note, sleepHours, waterIntake, screenTime, isExamPeriod)

    // 2. Compute Logging Streaks
    const user = await User.findById(req.user.id)
    
    // Calculate local date (YYYY-MM-DD)
    const localDate = new Date()
    const offset = localDate.getTimezoneOffset()
    const localToday = new Date(localDate.getTime() - (offset * 60 * 1000))
    const today = localToday.toISOString().split('T')[0]

    let streak = user.streakCount || 0
    let badges = user.badges || []

    if (user.lastLoggedDate) {
      const lastDate = new Date(user.lastLoggedDate)
      const currentDate = new Date(today)
      const diffTime = Math.abs(currentDate - lastDate)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) {
        streak += 1
      } else if (diffDays > 1) {
        streak = 1
      }
    } else {
      streak = 1
    }

    // Award badges
    const newBadges = []
    const checkAwardBadge = (badgeName) => {
      if (!badges.includes(badgeName)) {
        badges.push(badgeName)
        newBadges.push(badgeName)
      }
    }

    if (streak >= 3) checkAwardBadge('3-Day Explorer')
    if (streak >= 7) checkAwardBadge('7-Day Streak Warrior')
    if (streak >= 30) checkAwardBadge('30-Day Zen Master')
    if (sleepHours >= 8) checkAwardBadge('Rest & Recover')
    if (waterIntake >= 2000) checkAwardBadge('Hydration Hero')
    if (activities && activities.length >= 3) checkAwardBadge('Active Soul')

    // Update User Document
    user.streakCount = streak
    user.lastLoggedDate = today
    user.badges = badges
    user.monthlyGoalLogs = (user.monthlyGoalLogs || 0) + 1
    await user.save()

    // 3. Save Mood entry
    const mood = await Mood.create({
      user: req.user.id,
      emoji, label, value, note,
      trigger, isCustomTrigger, activities,
      sleepHours, waterIntake, screenTime, exerciseDuration, energyLevel,
      voiceNote, photo, weather, music, isExamPeriod, color, whatHelped,
      aiSentiment,
      recommendations: recommendations || []
    })

    res.json({
      mood,
      streakCount: streak,
      badges,
      newBadges
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error saving mood entry' })
  }
})

// Get recent mood logs
router.get('/', auth, async (req, res) => {
  try {
    const moods = await Mood.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(50)
    res.json(moods)
  } catch (err) {
    res.status(500).json({ message: 'Server error loading logs' })
  }
})

// Counselor View statistics for a specific student
router.get('/counselor-view/:studentId', counselorAuth, async (req, res) => {
  try {
    const moods = await Mood.find({ user: req.params.studentId }).sort({ createdAt: -1 })
    const stats = compileAnalytics(moods)
    
    // Also send user streak & badge overview
    const student = await User.findById(req.params.studentId, 'name email streakCount badges monthlyGoalLogs')
    
    res.json({
      student,
      stats,
      moods: moods.map(m => ({
        id: m._id,
        value: m.value,
        label: m.label,
        emoji: m.emoji,
        note: m.note,
        trigger: m.trigger,
        isCustomTrigger: m.isCustomTrigger,
        activities: m.activities,
        sleepHours: m.sleepHours,
        waterIntake: m.waterIntake,
        screenTime: m.screenTime,
        exerciseDuration: m.exerciseDuration,
        energyLevel: m.energyLevel,
        voiceNote: m.voiceNote,
        photo: m.photo,
        weather: m.weather,
        music: m.music,
        isExamPeriod: m.isExamPeriod,
        color: m.color,
        whatHelped: m.whatHelped,
        aiSentiment: m.aiSentiment,
        date: new Date(m.createdAt).toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }))
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error retrieving counselor metrics' })
  }
})

module.exports = router