/**
 * MindSpace - Verified Crisis & Emergency Resources
 * 
 * Central maintainable registry of official, verified mental health and emergency helplines.
 * For Sri Lanka and international guidance.
 * 
 * IMPORTANT:
 * - Phone numbers must be verified against official institutional sources.
 * - Do NOT allow AI models to generate or guess phone numbers dynamically.
 */

const CRISIS_RESOURCES = {
  sriLanka: {
    country: 'Sri Lanka',
    resources: [
      {
        id: 'nimh_1926',
        name: 'National Mental Health Helpline (NIMH)',
        shortName: 'NIMH Helpline',
        number: '1926',
        dialNumber: 'tel:1926',
        availability: '24/7, Toll-Free, Confidential',
        description: 'Free confidential emotional support, mental health counseling, and crisis intervention by the National Institute of Mental Health Sri Lanka.',
        type: 'mental_health'
      },
      {
        id: 'suwa_seriya_1990',
        name: '1990 Suwa Seriya Emergency Ambulance',
        shortName: 'Suwa Seriya Ambulance',
        number: '1990',
        dialNumber: 'tel:1990',
        availability: '24/7, Toll-Free Emergency',
        description: 'National emergency pre-hospital healthcare and rapid ambulance response across Sri Lanka.',
        type: 'medical_emergency'
      },
      {
        id: 'sumithrayo',
        name: 'Sumithrayo Lifeline Support',
        shortName: 'Sumithrayo',
        number: '011 269 6666 / 011 268 2535',
        dialNumber: 'tel:0112696666',
        availability: 'Daily 9:00 AM – 8:00 PM, Confidential',
        description: 'Non-judgmental, confidential befriending and suicide prevention emotional support.',
        type: 'crisis_befriending'
      },
      {
        id: 'cccline_1333',
        name: 'CCCline Crisis Support',
        shortName: 'CCCline',
        number: '1333',
        dialNumber: 'tel:1333',
        availability: '24/7, Toll-Free, Confidential',
        description: 'Confidential telephone counseling service for individuals in emotional distress.',
        type: 'counseling'
      },
      {
        id: 'police_119',
        name: 'Sri Lanka Police Emergency Service',
        shortName: 'Police Emergency',
        number: '119',
        dialNumber: 'tel:119',
        availability: '24/7 Emergency',
        description: 'Immediate police emergency assistance if someone is in imminent physical danger.',
        type: 'safety_emergency'
      }
    ]
  },
  international: {
    guidance: 'If you are outside Sri Lanka, please immediately contact your local emergency services (e.g. 988 in the US/Canada, 111 in the UK, 000 in Australia) or visit Befrienders Worldwide (https://www.befrienders.org/) for free, confidential global crisis support.'
  }
}

/**
 * Formats a verified, empathetic crisis response message
 */
const buildCrisisResponse = (language = 'en') => {
  if (language === 'si') {
    return `⚠️ **හදිසි සහය සහ ආරක්ෂක මගපෙන්වීම**

ඔබ ඉතා අසීරු සහ පීඩාකාරී අවස්ථාවක පසුවන බව වැටහෙනවා. **ඔබ තනිවී නැත**. කරුණාකර පහත දැක්වෙන නොමිලේ සහ රහස්‍ය හදිසි උපකාරක සේවාවන් අමතා ක්ෂණික සහය ලබාගන්න:

📞 **ශ්‍රී ලංකා හදිසි මානසික සුවතා සහ ජීවිතාරක්ෂක දුරකථන අංක**:
• **ජාතික මානසික සෞඛ්‍ය උපකාරක සේවය (NIMH)**: **1926** (නොමිලේ, පැය 24 පුරා, රහස්‍යයි)
• **සුවසැරිය හදිසි ගිලන්රථ සේවය**: **1990** (නොමිලේ, පැය 24 පුරා)
• **සුමිත්‍රයෝ සංවිධානය (Sumithrayo)**: **011 269 6666** / **011 268 2535**
• **CCCline උපදේශන සේවය**: **1333** (නොමිලේ, පැය 24 පුරා)
• **හදිසි පොලිස් සේවය**: **119**

🌏 **විදේශගත පරිශීලකයින් සඳහා**:
ඔබ ශ්‍රී ලංකාවෙන් බැහැරව සිටී නම්, කරුණාකර ඔබගේ ප්‍රදේශයේ හදිසි අංකය අමතන්න (ඇමරිකාව/කැනඩාව: 988, බ්‍රිතාන්‍යය: 111) නැතහොත් [befrienders.org](https://www.befrienders.org/) වෙත පිවිසෙන්න.

Aura යනු සාමාන්‍ය සුවතා සහකරුවෙකු පමණි; වෛද්‍ය හෝ හදිසි සේවාවක් නොවේ. කරුණාකර ඔබ විශ්වාස කරන සමීපතමයෙකුට හෝ වෘත්තීය වෛද්‍යවරයෙකුට මේ මොහොතේම කතා කරන්න. ඔබගේ ජීවිතය අතිශයින් වටිනා බව මතක තබාගන්න. 💖`
  }

  return `⚠️ **IMMEDIATE SUPPORT & EMERGENCY RESOURCES**

It sounds like you are going through a deeply overwhelming and painful moment right now. **Please know that you are not alone, and you do not have to carry this by yourself.** 

Please connect with trained human support or reach out to someone you trust immediately:

📞 **Emergency Helplines (Sri Lanka)**:
• **National Mental Health Helpline (NIMH)**: **1926** (Toll-Free, 24/7 Confidential)
• **1990 Suwa Seriya Emergency Ambulance**: **1990** (Toll-Free, 24/7 Medical Emergency)
• **Sumithrayo Lifeline Support**: **011 269 6666** / **011 268 2535** (Daily 9am–8pm, Confidential)
• **CCCline Crisis Counseling**: **1333** (Toll-Free, 24/7 Confidential)
• **Sri Lanka Police Emergency**: **119**

🌏 **International Support**:
If you are outside Sri Lanka, please call your local emergency service (e.g., **988** in the US/Canada, **111** in the UK, **000** in Australia) or connect with [Befrienders Worldwide](https://www.befrienders.org/) for confidential support in your country.

*Aura is an AI wellbeing companion and cannot provide emergency or medical care. Please contact a trusted friend, family member, counselor, or emergency service right now.* 💖`
}

module.exports = {
  CRISIS_RESOURCES,
  buildCrisisResponse
}
