/**
 * Free Fallback AI Provider
 * High-quality, empathetic, context-aware offline response engine for MindSpace.
 * Supports Sinhala, Singlish, and English with friendly conversational responses.
 */

const generateFallbackResponse = ({ prompt, conversationHistory = [], userContext = {} }) => {
  const lowerPrompt = prompt.toLowerCase().trim()
  const userName = userContext.userName || 'යාලුවා'
  const currentMood = userContext.latestMood || 'Normal'
  const streak = userContext.streak || 1
  const avgScore = userContext.avgScore ? `${userContext.avgScore}/10` : 'N/A'
  const sleepHours = userContext.latestSleep ? `${userContext.latestSleep} hrs` : 'N/A'

  // Language auto-detection
  const hasSinhalaUnicode = /[\u0D80-\u0DFF]/.test(prompt)
  const hasSinglish = /\b(dukai|duk|epa|epawela|epawelaa|pissu|wage|awul|awl|aul|taniyama|thaniyama|bayai|bayayi|taraha|kenthayi|palui|paluyi|kohomada|oyata|mamat|mama|hi|halo|stess|stress)\b/i.test(prompt)
  const isSinhalaContext = hasSinhalaUnicode || hasSinglish

  if (isSinhalaContext) {
    if (lowerPrompt.includes('stress') || lowerPrompt.includes('පීඩනය') || lowerPrompt.includes('epawela') || lowerPrompt.includes('අවුල්')) {
      return {
        reply: `අනේ **${userName}**, ඔයාට ලොකු stress එකක් දැනෙනවා නේද? 🥺 හිත අවුල් කරගන්න එපා යාලුවා. මම ඔයා ළඟ ඉන්නවා.\n\nඅද දවසේ ඔයා logged කරපු විස්තර අනුව ඔයාට පැය **${sleepHours}**ක නින්දක් තමයි ලැබිලා තියෙන්නේ. විවේකය අඩු වුණාම හිතට පීඩනය වැඩි වෙනවා.\n\nඅපි හෙමින් හුස්ම ගන්න පුංචි ව්‍යායාමයක් කරමුද? නැත්නම් අපේ **Resources** එකෙන් ලස්සන සින්දුවක් අහමුද? මොකක්ද අද ඔයාට වුණේ? මට කියන්න. 🌸`,
        provider: 'free_fallback'
      }
    }

    if (lowerPrompt.includes('report') || lowerPrompt.includes('වාර්තාව') || lowerPrompt.includes('mood')) {
      return {
        reply: `මෙන්න ඔයාගේ මානසික සුවතා වාර්තාවේ සාරාංශය, **${userName}**:\n\n` +
          `• **වර්තමාන මනෝභාවය**: ${currentMood}\n` +
          `• **සක්‍රිය දින ගණන (Streak)**: 🔥 දින ${streak}ක් සක්‍රියයි\n` +
          `• **සග්‍රහිත ලකුණු මට්ටම**: 📊 ${avgScore}\n` +
          `• **ලබාගත් නින්ද**: 🛌 ${sleepHours}\n\n` +
          `ඔයා දිගටම Mood log කරන එක ගැන මට ගොඩක් සතුටුයි! තව විස්තර බලන්න **Mood Journal** පිටුවට යන්න. 💖`,
        provider: 'free_fallback'
      }
    }

    return {
      reply: `හායි **${userName}**! 😊 ඔයා මාත් එක්ක කතා කරන්න ආපු එකට ගොඩක් සතුටුයි. ඔයාගේ සිත සැහැල්ලු කරගන්න මම ඕනෑම වෙලාවක ලෑස්තියි.\n\nඅද දවසේ ඔයාගේ හිතේ තියෙන්නේ මොන වගේ හැඟීමක්ද? මට නිදහසේ කියන්න, මම අහගෙන ඉන්නම්. 🌸`,
      provider: 'free_fallback'
    }
  }

  // English fallback responses
  if (lowerPrompt.includes('why am i stressed') || lowerPrompt.includes('stressed') || lowerPrompt.includes('anxious')) {
    let specificCause = ''
    if (userContext.latestTriggers && userContext.latestTriggers.length > 0) {
      specificCause = `\n\nLooking at your recent entries, you noted stress triggers related to: **${userContext.latestTriggers.join(', ')}**.`
    }

    return {
      reply: `Hi **${userName}**! 🌿 Stress can stem from many factors, such as academic deadlines, lack of rest, or emotional overload.${specificCause}\n\nHere are 3 quick actions you can take right now to lower your stress levels:\n\n1. **4-7-8 Breathing**: Inhale for 4s, hold for 7s, exhale for 8s.\n2. **Take a 5-min walk**: Step away from screen time.\n3. **Hydrate & Rest**: You recently logged **${sleepHours}** of sleep.\n\nHow are you feeling right now? I'm right here with you.`,
      provider: 'free_fallback'
    }
  }

  return {
    reply: `Thank you for sharing, **${userName}**. I'm your MindSpace AI Assistant (Aura), here to support your mental wellness journey. 🌟\n\n` +
      `How are you feeling right now? Feel free to ask me about your mood stats, stress management tips, or app features!`,
    provider: 'free_fallback'
  }
}

module.exports = { generateFallbackResponse }
