const ChatHistory = require('../../models/ChatHistory')
const Mood = require('../../models/Mood')
const User = require('../../models/User')
const { generateAIResponse } = require('./aiProviderFactory')

// Self-harm & Crisis keywords list
const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'want to die', 'self harm',
  'cutting myself', 'take my life', 'better off dead', 'don\'t want to live',
  'hanging myself', 'overdose', 'end it all'
]

// Emergency Hotline Guidance Response
const CRISIS_RESPONSE = `
⚠️ **IMMEDIATE SUPPORT & EMERGENCY RESOURCES**

It sounds like you are going through a very difficult time right now, and I want you to know that **you are not alone**. Please reach out to someone who can help immediately:

📞 **Emergency Helplines (Sri Lanka)**:
• **National Mental Health Helpline**: **1926** (Toll-Free, 24/7 Confidential)
• **Sumithrayo Lifeline Support**: **011 268 2535** / **011 269 2909**
• **Suwa Seriya Emergency Ambulance**: **1990**
• **Emergency Police**: **119**

🌏 **International Crisis Support**:
• **US / Canada**: Call or text **988**
• **UK**: Call **111** or **0800 689 5652**
• **Befrienders Worldwide**: [befrienders.org](https://www.befrienders.org/)

Please reach out to a trusted friend, family member, or healthcare professional right away. You matter, and support is available for you 24/7. 💖
`

const processUserMessage = async ({ userId, message, conversationId }) => {
  const cleanMessage = message.trim()
  const lowerMessage = cleanMessage.toLowerCase()

  // 1. Check for Crisis / Self-Harm triggers first
  const isCrisisTriggered = CRISIS_KEYWORDS.some(keyword => lowerMessage.includes(keyword))

  if (isCrisisTriggered) {
    // Save User message & Crisis response to DB
    const activeConversationId = conversationId || `conv_${Date.now()}`
    
    await ChatHistory.create([
      { userId, conversationId: activeConversationId, role: 'user', message: cleanMessage, isCrisis: true },
      { userId, conversationId: activeConversationId, role: 'assistant', message: CRISIS_RESPONSE, isCrisis: true }
    ])

    return {
      reply: CRISIS_RESPONSE,
      provider: 'crisis_escaper',
      conversationId: activeConversationId,
      isCrisis: true,
      suggestedQuestions: ['Where can I find a counselor?', 'How to reach Sumithrayo?', 'What are breathing exercises?']
    }
  }

  // 2. Build User Context from DB
  const user = await User.findById(userId)
  const recentMoods = await Mood.find({ user: userId }).sort({ createdAt: -1 }).limit(10)

  // Calculate Streak & Stats
  let streak = 1
  let avgScore = 7.0
  let latestMood = 'Neutral'
  let latestSleep = 7
  let latestWater = 2
  let latestTriggers = []

  if (recentMoods.length > 0) {
    latestMood = recentMoods[0].mood || 'Normal'
    latestSleep = recentMoods[0].sleepHours || 7
    latestWater = recentMoods[0].waterIntake || 2
    latestTriggers = recentMoods[0].triggers || []

    const validScores = recentMoods.map(m => m.score || 7)
    avgScore = (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1)

    // Calculate streak
    const uniqueDays = new Set(recentMoods.map(m => new Date(m.createdAt).toISOString().split('T')[0]))
    streak = uniqueDays.size
  }

  const userContext = {
    userName: user ? user.name : 'Friend',
    latestMood,
    streak,
    avgScore,
    latestSleep,
    latestWater,
    latestTriggers
  }

  // 3. Fetch recent conversation history
  const activeConversationId = conversationId || `conv_${Date.now()}`
  const historyRecords = await ChatHistory.find({ userId, conversationId: activeConversationId })
    .sort({ timestamp: 1 })
    .limit(10)

  // 4. Generate AI Response via Provider Engine
  const aiResult = await generateAIResponse({
    prompt: cleanMessage,
    conversationHistory: historyRecords,
    userContext
  })

  // 5. Persist to MongoDB
  await ChatHistory.create([
    { userId, conversationId: activeConversationId, role: 'user', message: cleanMessage, provider: aiResult.provider },
    { userId, conversationId: activeConversationId, role: 'assistant', message: aiResult.reply, provider: aiResult.provider }
  ])

  // Suggested contextual quick questions
  const suggestedQuestions = [
    'Why am I stressed?',
    'Explain my mood report.',
    'How can I improve my mood?',
    'Where can I see my history?'
  ]

  return {
    reply: aiResult.reply,
    provider: aiResult.provider,
    conversationId: activeConversationId,
    isCrisis: false,
    suggestedQuestions
  }
}

module.exports = {
  processUserMessage
}
