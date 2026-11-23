/**
 * MindSpace - Crisis & Safety Intent Detector
 * 
 * Multi-layered safety check that analyzes user input for indications of:
 * - Suicide or self-harm ideation / intent
 * - Lethal means or self-directed violence
 * - Extreme despair / acute safety risk
 * - Threats of severe physical harm
 * 
 * IMPORTANT LIMITATION DISCLAIMER:
 * Automated linguistic detection is an imperfect assistive safety layer.
 * It cannot detect every crisis state or subtle cry for help. MindSpace
 * permanently surfaces official emergency hotline numbers across the UI
 * so users in distress always have direct access to human help.
 */

// English crisis patterns
const ENGLISH_CRISIS_PATTERNS = [
  /\b(suicide|suicidal)\b/i,
  /\b(kill|killing)\s+(myself|me)\b/i,
  /\b(end|ending)\s+(my\s+life|it\s+all)\b/i,
  /\bwant\s+to\s+die\b/i,
  /\b(better\s+off|rather\s+be)\s+dead\b/i,
  /\b(self[-\s]?harm|cutting\s+myself|cut\s+my\s+wrists)\b/i,
  /\b(take|taking)\s+my\s+(own\s+)?life\b/i,
  /\bdon'?t\s+want\s+to\s+(live|exist|wake\s+up)\b/i,
  /\b(overdose|overdosing)\b/i,
  /\b(hang|hanging)\s+myself\b/i,
  /\b(jump|jumping)\s+(off|in\s+front\s+of)\b/i,
  /\bcan'?t\s+go\s+on\s+living\b/i,
  /\bno\s+reason\s+to\s+live\b/i,
  /\b(hurt|harming)\s+(myself|others)\b/i
]

// Sinhala Unicode crisis patterns
const SINHALA_CRISIS_PATTERNS = [
  /සියදිවි\s*නසා/i,
  /දිවි\s*නසා/i,
  /මැරෙන්න\s*(ඕන|ඕනෙ|හිතෙනවා|යනවා)/i,
  /ජීවිතේ\s*එපා\s*වෙලා/i,
  /ජීවිතය\s*නැති\s*කර/i,
  /පණ\s*නැති\s*කර/i,
  /අත\s*කපා/i,
  /බෙහෙත්\s*බීලා\s*මැරෙ/i,
  /වහ\s*බීලා/i,
  /එල්ලිලා\s*මැරෙ/i,
  /තවදුරටත්\s*ජීවත්\s*වෙන්න\s*බැ/i,
  /නැතිවෙලා\s*යන්න\s*ඕන/i
]

// Singlish (Sinhala transliterated in Latin script) crisis patterns
const SINGLISH_CRISIS_PATTERNS = [
  /\bmarenna\s*(one|onei|hithenawa|hithenwa|hithuna|yanawa)\b/i,
  /\bdiwi\s*nasa\s*ganna\b/i,
  /\bsiyadiwi\s*nasa\b/i,
  /\bjeewithe\s*epa\s*(wela|welaa)\b/i,
  /\bjewithe\s*epa\b/i,
  /\bpana\s*nathi\s*kara\b/i,
  /\bathe\s*kapa\s*gann/i,
  /\bath\s*kapa\s*gann/i,
  /\bbeheth\s*bila\s*maren/i,
  /\bthawa\s*inna\s*ba\b/i,
  /\bjeewath\s*wenna\s*ba\b/i,
  /\bmerenna\s*one\b/i,
  /\bmerenna\s*hithenawa\b/i
]

/**
 * Detects whether the input contains Sinhala Unicode or Singlish markers
 */
const detectUserLanguage = (text = '') => {
  if (!text) return 'en'

  // Test for Sinhala Unicode characters (\u0D80-\u0DFF)
  const sinhalaUnicodeRegex = /[\u0D80-\u0DFF]/
  if (sinhalaUnicodeRegex.test(text)) {
    return 'si'
  }

  // Common Singlish conversational markers
  const singlishTokens = [
    /\b(mata|oya|mage|oyage|kohomada|karanna|hithanawa|hithenne|dukai|epa|dawasak|sathutui|inawa|puluwanda)\b/i,
    /\b(stres|ekata|wadak|nehe|nahe|naha|ow|nathnam|mokada|ai|monawada)\b/i
  ]
  const isSinglish = singlishTokens.some(rgx => rgx.test(text))
  if (isSinglish) {
    return 'si'
  }

  return 'en'
}

/**
 * Evaluates whether a user message triggers the high-risk crisis support path
 * @param {string} message - Raw message text
 * @returns {{ isCrisis: boolean, category: string|null, language: string, matchedPatterns: string[] }}
 */
const detectCrisis = (message = '') => {
  if (!message || typeof message !== 'string') {
    return { isCrisis: false, category: null, language: 'en', matchedPatterns: [] }
  }

  const clean = message.trim().toLowerCase()
  const language = detectUserLanguage(clean)
  const matchedPatterns = []

  // Check English patterns
  for (const pattern of ENGLISH_CRISIS_PATTERNS) {
    if (pattern.test(clean)) {
      matchedPatterns.push(`EN:${pattern.source}`)
    }
  }

  // Check Sinhala Unicode patterns
  for (const pattern of SINHALA_CRISIS_PATTERNS) {
    if (pattern.test(clean)) {
      matchedPatterns.push(`SI_UNICODE:${pattern.source}`)
    }
  }

  // Check Singlish patterns
  for (const pattern of SINGLISH_CRISIS_PATTERNS) {
    if (pattern.test(clean)) {
      matchedPatterns.push(`SINGLISH:${pattern.source}`)
    }
  }

  const isCrisis = matchedPatterns.length > 0

  return {
    isCrisis,
    category: isCrisis ? 'crisis_self_harm' : null,
    language,
    matchedPatterns
  }
}

module.exports = {
  detectCrisis,
  detectUserLanguage
}
