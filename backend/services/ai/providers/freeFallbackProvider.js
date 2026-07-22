/**
 * Free Fallback AI Provider
 * High-quality, empathetic, context-aware offline response engine for MindSpace.
 * Ensures zero-cost, instant, 100% reliable fallback when API keys are missing or quota is exceeded.
 */

const generateFallbackResponse = ({ prompt, conversationHistory = [], userContext = {} }) => {
  const lowerPrompt = prompt.toLowerCase().trim()
  const userName = userContext.userName || 'Friend'
  const currentMood = userContext.latestMood || 'Neutral'
  const streak = userContext.streak || 1
  const avgScore = userContext.avgScore ? `${userContext.avgScore}/10` : 'N/A'
  const sleepHours = userContext.latestSleep ? `${userContext.latestSleep} hrs` : 'N/A'
  const waterIntake = userContext.latestWater ? `${userContext.latestWater} L` : 'N/A'

  // Common Question Matching with rich contextual insights
  if (lowerPrompt.includes('why am i stressed') || lowerPrompt.includes('stressed') || lowerPrompt.includes('anxious')) {
    let specificCause = ''
    if (userContext.latestTriggers && userContext.latestTriggers.length > 0) {
      specificCause = `\n\nLooking at your recent entries, you noted stress triggers related to: **${userContext.latestTriggers.join(', ')}**.`
    }

    return {
      reply: `Hi **${userName}**! 🌿 Stress can stem from many factors, such as academic deadlines, lack of rest, or emotional overload.${specificCause}\n\nHere are 3 quick actions you can take right now to lower your stress levels:\n\n1. **4-7-8 Breathing**: Inhale for 4s, hold for 7s, exhale for 8s. (Try our *Resources & Breathing* tab!)\n2. **Take a 5-min walk**: Step away from screen time.\n3. **Hydrate & Rest**: You recently logged **${sleepHours}** of sleep. Getting 7-8 hours is crucial.\n\nWould you like me to guide you through a quick 2-minute relaxation exercise?`,
      provider: 'free_fallback'
    }
  }

  if (lowerPrompt.includes('explain my mood report') || lowerPrompt.includes('mood report') || lowerPrompt.includes('report')) {
    return {
      reply: `Here is a summary of your recent wellness data, **${userName}**:\n\n` +
        `• **Current Mood**: ${currentMood}\n` +
        `• **Streak**: 🔥 ${streak} Day${streak > 1 ? 's' : ''} active\n` +
        `• **Average Wellness Score**: 📊 ${avgScore}\n` +
        `• **Recent Sleep Average**: 🛌 ${sleepHours}\n` +
        `• **Hydration**: 💧 ${waterIntake}\n\n` +
        `Your consistent logging shows great self-awareness! To view detailed visual charts, check the **Mood Journal** page.`,
      provider: 'free_fallback'
    }
  }

  if (lowerPrompt.includes('what does this chart mean') || lowerPrompt.includes('chart') || lowerPrompt.includes('analytics')) {
    return {
      reply: `The analytics charts in MindSpace display your emotional trajectory over time! 📈\n\n` +
        `• **Line Graph**: Tracks your daily mood score (1-10) over time to highlight peak wellness days and stressful periods.\n` +
        `• **Factor Breakdown**: Shows how sleep, water intake, and screen time impact your daily mood.\n` +
        `• **Pattern Recognition**: Helps you identify habits that boost your mood versus triggers that lower it.`,
      provider: 'free_fallback'
    }
  }

  if (lowerPrompt.includes('improve my mood') || lowerPrompt.includes('feel better') || lowerPrompt.includes('happy')) {
    return {
      reply: `Here are 4 evidence-backed habits to boost your mood today, **${userName}**:\n\n` +
        `1. ☀️ **Get 10 minutes of sunlight**: Helps regulate serotonin & sleep cycles.\n` +
        `2. 🎧 **Listen to calming audio**: Visit our **Resources** tab for relaxing tracks.\n` +
        `3. 🤝 **Connect with a peer**: Use our **Peer Support Chat** to talk anonymously with a supportive student.\n` +
        `4. ✍️ **Expressive Journaling**: Write down 3 things you are grateful for today in your Mood Journal.`,
      provider: 'free_fallback'
    }
  }

  if (lowerPrompt.includes('where can i see my history') || lowerPrompt.includes('history')) {
    return {
      reply: `You can access your complete mood history and past entries anytime by navigating to the **Mood Journal** page from the top menu bar! 📚`,
      provider: 'free_fallback'
    }
  }

  // Default empathetic response
  return {
    reply: `Thank you for sharing, **${userName}**. I'm your MindSpace AI Assistant, here to support your mental wellness journey. 🌟\n\n` +
      `Based on your current status (**${currentMood}**), I recommend taking a moment for self-care today. You can explore breathing exercises in **Resources**, talk to fellow students in **Peer Chat**, or schedule a professional session under **Bookings**.\n\n` +
      `How are you feeling right now? Feel free to ask me about your mood stats, stress management tips, or app features!`,
    provider: 'free_fallback'
  }
}

module.exports = { generateFallbackResponse }
