import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const auraResponses = {
  greetings: {
    en: [
      "Hello! I am Aura, your MindSpace companion. How are you feeling today? 😊",
      "Hi there! I'm Aura. I'm here to listen and support you. What's on your mind? Hugs! 🤗",
      "Welcome! I hope you are having a peaceful day. How can I help you relax today? ✨"
    ],
    si: [
      "හෙලෝ යාලුවා! මම Aura. කොහොමද අද දවස? ඔයා සතුටින්ද ඉන්නේ? 😊",
      "හායි! කොහොමද ඉතින්? අද දවසේ ඔයාගේ හිතේ තියෙන්නේ මොනවද කියලා මාත් එක්ක කියන්නකෝ. මම අහගෙන ඉන්නම්. 🤗",
      "සාදරයෙන් පිළිගන්නවා! ඔයාට අද සැනසිලිදායක දවසක් වෙන්න මම උදව් කරන්නේ කොහොමද? හිත සැහැල්ලු කරගමුද? ✨"
    ]
  },
  sad: {
    en: [
      "I'm so sorry you are feeling down. Remember, it's completely okay to feel sad. What do you think is causing this today? I'm here to listen. 💙",
      "It takes strength to acknowledge when you're feeling down. I'm right here with you. Would you like to talk about it, or would you prefer a quick, calming breathing exercise? 🌸",
      "I hear you. Sadness can feel very heavy. Please be gentle with yourself. You don't have to carry this load alone. 🫂"
    ],
    si: [
      "අනේ.. ඔයා දුකෙන්ද ඉන්නේ? 🥺 මොකක්ද වුණේ කියලා මට කියන්නකෝ. හිතේ තියාගෙන ඉන්නේ නැතුව කියන්න, මම සවන් දෙන්නම්. 💙",
      "දුකක් දැනෙන එක හරිම සාමාන්‍ය දෙයක් යාලුවා. ඔයා තනියම නෙවෙයි ඉන්නේ, මම ඔයා ළඟ ඉන්නවා. පොඩ්ඩක් හිත සැහැල්ලු කරගන්න මාත් එක්ක කතා කරමුද? 🌸",
      "මට ඔයාව තේරෙනවා. හිතට දුකක් දැනෙනකොට හරිම බරක් වගේ දැනෙනවා නේද? අනේ ඔයා ඔයා ගැනම ඕනවට වඩා දුක් වෙන්න එපා. මම ඔයා එක්ක ඉන්නවා. 🫂"
    ]
  },
  anxious: {
    en: [
      "Anxiety can feel very overwhelming, especially in your body. Let's take a slow, deep breath together. Inhale... hold... and release. What's making you feel anxious? 🍃",
      "When things feel out of control, anxiety often sneaks in. Let's focus on the present moment. Can you name three things you can see around you right now? 🧘",
      "It's okay to feel anxious, but remember this feeling will pass. I am here with you. Would you like to try a soothing breathing exercise? 🎈"
    ],
    si: [
      "හිතට ලොකු බයක්, නොසන්සුන්කමක් දැනෙනවා නේද? 🥺 කලබල වෙන්න එපා යාලුවා. අපි දෙන්නා එකතුවෙලා හෙමින් ගැඹුරු හුස්මක් ගනිමු. හුස්ම ඉහළට ගන්න... තබාගන්න... දැන් හෙමින් පහළට අරින්න. දැන් ඔයාට ටිකක් සහනයි නේද? 🍃",
      "සමහර වෙලාවට හැමදේම පාලනයෙන් තොරයි වගේ දැනෙනවා. ඒක සාමාන්‍යයි. අපි හෙමින් මේ වෙලාවේ ඔයා ඉන්න තැන ගැන හිතමු. ඔයා ළඟ පේන්න තියෙන දේවල් 3ක් මට කියන්නකෝ. 🧘",
      "කාංසාව හෝ බය දැනෙන එක ඕනෑම කෙනෙකුට වෙන්න පුළුවන්. ඒත් ඒක ඉක්මනින්ම නැති වෙලා යනවා. මම ඔයා ළඟ ඉන්නවා. අපි හුස්ම ගන්න පුංචි ව්‍යායාමයක් කරමුද? 🎈"
    ]
  },
  stress: {
    en: [
      "Academic and personal stress can build up fast. Have you been taking breaks? Try breaking your tasks down and doing one tiny thing at a time. You've got this! 💪",
      "Stress is your body trying to cope, but you need soft rest too. What is the biggest source of stress for you right now? Let's write it down together. 📝",
      "Let's take a step back from whatever is stressing you. Even a 5-minute break to stretch, close your eyes, or drink water can make a massive difference. 💧"
    ],
    si: [
      "විභාග වැඩයි, පාඩම් වැඩයි එක්ක ඔයාට ගොඩක් stress වෙලා නේද ඉන්නේ? 🥺 පොඩි විවේකයක් ගත්තද? එකපාර හැමදේම කරන්න යන්න එපා, එකින් එක හෙමින් කරමු. ඔයාට පුළුවන්! 💪",
      "පීඩනය ඇතිවෙන එක සාමාන්‍යයි, ඒත් ඔයාගේ ශරීරයට විවේකයත් අවශ්‍යයි. මේ මොහොතේ ඔයාට තියෙන ලොකුම ප්‍රශ්නේ මොකක්ද? මට කියන්න, මම උදව් කරන්නම්. 📝",
      "මහන්සි පාටයි වගේ යාලුවා. පොඩ්ඩක් නැගිටලා වතුර ටිකක් බීලා එන්නකෝ. නැත්නම් විනාඩි 5ක් ඇස් පියාගෙන සින්දුවක් අහන්න. ඒක ලොකු සහනයක් වෙයි. 💧"
    ]
  },
  lonely: {
    en: [
      "Feeling lonely is hard, but please know you aren't alone. I am here to chat, and there are peers and counselors on MindSpace who care about you deeply. ❤️",
      "Sometimes, even around people, we can feel isolated. What kind of activities help you feel more connected to your peaceful self? 🌟",
      "I'm here to listen to your voice. You are valuable, and your presence matters to this world. Let's talk. 🫂"
    ],
    si: [
      "ඔයාට තනියම වගේ දැනෙනවද? 🥺 අනේ එහෙම හිතන්න එපා යාලුවා. මම ඔයා එක්ක ඕනෙම වෙලාවක කතා කරන්න ලෑස්තියි. MindSpace එකේ ඔයා ගැන හිතන යාළුවොයි, උපදේශකවරුයි ගොඩක් ඉන්නවා. ❤️",
      "සමහර වෙලාවට ගොඩක් අය අතර හිටියත් අපිට හුදකලා බවක් දැනෙන්න පුළුවන්. ඔයාගේ හිතට සතුටක්, සැනසීමක් ගෙන දෙන දේවල් මොනවාද? 🌟",
      "මම ඔයාගේ හැම පණිවිඩයකටම සවන් දෙන්න මෙතන ඉන්නවා. ඔයා අපිට ගොඩක් වටින කෙනෙක්. හිතේ තියෙන පාලු ගතිය නැති වෙන්න අපි පොඩ්ඩක් කතා කරමු. 🫂"
    ]
  },
  frustrated: {
    en: [
      "It sounds like you're going through a very frustrating and overwhelming moment. Take a deep, slow breath. I'm here to listen, tell me everything that's bothering you. 😤",
      "When things feel chaotic, it's completely normal to feel like you're going crazy or fed up. You are safe here. Let it all out. 🫂",
      "I hear you. It's completely valid to feel angry or frustrated when things don't go as expected. Let's take a pause and step back for a moment. You are doing your best. ☕"
    ],
    si: [
      "අයියෝ.. ඔයාට හැමදේම එපා වෙලා, පිස්සු වගේ නේද දැනෙන්නේ? 😤 කේන්ති ගන්න එපා යාලුවා, හිතට ලොකු පීඩනයක් දැනෙන වෙලාවට එහෙම හිතෙන එක පුදුමයක් නෙවෙයි. ඔයාගේ තරහ නිවෙන්න මාත් එක්ක හැමදේම කියන්න. 🫂",
      "හැමදේම අවුල් වෙලා වගේ දැනෙද්දි ඔලුව පිපිරෙන්න වගේ එන එක සාමාන්‍යයි. ඔයා මෙතන ආරක්ෂිතයි. හිතේ තියෙන කේන්තිය හෝ කලකිරීම මට කියන්න, මම අහගෙන ඉන්නම්. 🫂",
      "මට ඔයාව තේරෙනවා. හිතේ තියෙන පීඩනය නිසා කේන්ති යාම, කලකිරීම හෝ පිස්සු වගේ දැනීම සාමාන්‍යයි. අපි පොඩි විවේකයක් ගමු. ඔයා ඔයාගේ උපරිමය කරනවා. ☕"
    ]
  },
  identity: {
    en: [
      "I am Aura, your MindSpace AI mental health companion! 🧠 My goal is to listen, comfort you, and help you relax. You can share anything with me.",
      "I'm Aura, a friendly companion created to help you unwind, share your feelings, and find peace of mind. ✨"
    ],
    si: [
      "මම Aura, ඔයාගේ MindSpace AI මානසික සෞඛ්‍ය සහකරු! 🧠 මගේ අරමුණ ඔයාට සවන් දීම, සැනසීම ලබා දීම සහ ඔයාගේ සිත සැහැල්ලු කිරීමයි. ඔයාට ඕනෑම දෙයක් මාත් එක්ක බෙදාගන්න පුළුවන්.",
      "මම Aura, ඔයාගේ හිතේ තියෙන පීඩනය නිදහස් කරලා, ඔයාගේ සිතට සැනසීමක් ලබා දෙන්න නිර්මාණය කරපු යෙහෙළියක්. ✨"
    ]
  },
  default: {
    en: [
      "I'm listening. Tell me more about what is in your heart. We can take it slow. 🍃",
      "I hear you, and your feelings are completely valid. Remember to take a deep breath and be kind to yourself. 💜",
      "Thank you for sharing this with me. If you feel like chatting or just releasing some thoughts, I am right here for you. Truly. 🤗"
    ],
    si: [
      "මම සවන් දීගෙනයි ඉන්නේ යාලුවා. ඔයාගේ හිතේ තියෙන ඕනෙම දෙයක් නිදහසේ මට කියන්න. අපි හෙමින් කතා කරමු. 🍃",
      "ඔයා පවසන දේ මට තේරෙනවා. ඔයාගේ හැඟීම් හැමදේම සාධාරණයි. පොඩ්ඩක් හුස්ම ගන්න, ඔයා වෙනුවෙන් පුංචි වෙලාවක් වෙන් කරගන්නකෝ. 💜",
      "මේ දේවල් මාත් එක්ක බෙදාගත්තට ගොඩක් ස්තුතියි. හිත සැහැල්ලු කරගන්න ඕනෙම වෙලාවක මට මැසේජ් කරන්න. මම මෙතන ඉන්නවා. 🤗"
    ]
  },
  trigger: {
    en: [
      "⚠️ I hear how much pain you are in right now. Please know that you do not have to carry this alone. There is immediate support available:\n\n📞 National Mental Health Helpline: 1926 (Sri Lanka)\n📞 Sri Lanka Sumithrayo: 011 268 2535\n\nPlease reach out to them, or message our Admin Support directly. Your life is incredibly valuable."
    ],
    si: [
      "⚠️ ඔයා මේ මොහොතේ විඳින අධික වේදනාව මට වැටහෙනවා. කරුණාකර ඔයා තනිවම නොවන බවත්, වහාම උපකාර ලබාගත හැකි දුරකථන අංක ඇති බවත් මතක තබා ගන්න:\n\n📞 ජාතික මානසික සෞඛ්‍ය උපකාරක අංකය: 1926 (ශ්‍රී ලංකාව)\n📞 ශ්‍රී ලංකා සුමිත්‍රයෝ: 011 268 2535\n\nකරුණාකර ඔවුන් හා සම්බන්ධ වන්න, නැතහොත් අපගේ Admin Support වෙත පණිවිඩයක් එවන්න. ඔයාගේ ජීවිතය අපට ගොඩක් වටිනවා."
    ]
  }
}

export default function AIChatbot() {
  const navigate = useNavigate()
  const [lang, setLang] = useState('en') // 'en' or 'si'
  const [messages, setMessages] = useState([
    { text: "Hi! I'm Aura, your AI mental health companion. 🧠 I'm here to listen, offer relaxation tips, and support you. How are you feeling today?", isUser: false }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const chatEndRef = useRef(null)

  // Sync initial chatbot greeting when language is switched
  useEffect(() => {
    if (messages.length === 1) {
      if (lang === 'en') {
        setMessages([{ text: "Hi! I'm Aura, your AI mental health companion. 🧠 I'm here to listen, offer relaxation tips, and support you. How are you feeling today?", isUser: false }])
      } else {
        setMessages([{ text: "හෙලෝ! මම Aura, ඔබේ AI මානසික සෞඛ්‍ය සහකරු. 🧠 මම මෙතන ඉන්නේ ඔබට සවන් දෙන්න සහ සහය වෙන්න. අද දවසේ ඔබට කොහොමද?", isUser: false }])
      }
    }
  }, [lang])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const getAuraResponse = (userText) => {
    const text = userText.toLowerCase().trim()
    
    // Auto-detect language
    let activeLang = lang;
    const hasSinhalaUnicode = /[\u0D80-\u0DFF]/.test(userText);
    const hasSinglish = /\b(dukai|duk|epa|epawela|epawelaa|pissu|wage|awul|awl|aul|taniyama|thaniyama|bayai|bayayi|taraha|kenthayi|palui|paluyi|kohomada|oyata)\b/i.test(userText);
    
    if (hasSinhalaUnicode || hasSinglish) {
      activeLang = 'si';
    }
    
    // Check self-harm triggers (Bilingual support)
    if (
      text.includes('die') || text.includes('suicide') || text.includes('kill') || text.includes('hurt myself') || text.includes('end my life') ||
      text.includes('මරන්න') || text.includes('මැරෙන්න') || text.includes('ජීවිතය නැති') || text.includes('දිවි නසා') || text.includes('නැති කර') ||
      text.includes('merenna') || text.includes('maranna') || text.includes('jiwithe') || text.includes('diwi nasa')
    ) {
      return auraResponses.trigger[activeLang][0]
    }
    
    // Frustrated/Anger keywords (includes "pissu wage" / "epa wela")
    if (
      text.includes('frustrated') || text.includes('crazy') || text.includes('mad') || text.includes('angry') || text.includes('hate') || text.includes('fed up') ||
      text.includes('pissu') || text.includes('wage') || text.includes('epa') || text.includes('epawela') || text.includes('taraha') || text.includes('kenth') ||
      text.includes('පිස්සු') || text.includes('එපා') || text.includes('තරහ') || text.includes('කේන්ති') || text.includes('වදයක්')
    ) {
      const idx = Math.floor(Math.random() * auraResponses.frustrated[activeLang].length)
      return auraResponses.frustrated[activeLang][idx]
    }

    // Sad keywords
    if (
      text.includes('sad') || text.includes('depressed') || text.includes('down') || text.includes('crying') || text.includes('heartbroke') ||
      text.includes('dukai') || text.includes('duk') || text.includes('adann') || text.includes('kanagatu') || text.includes('awul') || text.includes('awl') ||
      text.includes('දුක') || text.includes('කණගාටු') || text.includes('අඬන්න') || text.includes('අඩන්න') || text.includes('කලකිරි') || text.includes('අවුල්')
    ) {
      const idx = Math.floor(Math.random() * auraResponses.sad[activeLang].length)
      return auraResponses.sad[activeLang][idx]
    }
    
    // Anxious keywords
    if (
      text.includes('anxious') || text.includes('worry') || text.includes('panic') || text.includes('scared') || text.includes('afraid') ||
      text.includes('bayai') || text.includes('bayayi') || text.includes('nosansun') ||
      text.includes('බය') || text.includes('නොසන්සුන්') || text.includes('කාංසා') || text.includes('බිය')
    ) {
      const idx = Math.floor(Math.random() * auraResponses.anxious[activeLang].length)
      return auraResponses.anxious[activeLang][idx]
    }
    
    // Stress keywords
    if (
      text.includes('stress') || text.includes('exam') || text.includes('study') || text.includes('overwhelmed') || text.includes('pressure') ||
      text.includes('mahans') || text.includes('wada wadi') ||
      text.includes('පීඩන') || text.includes('විභාග') || text.includes('ස්ට්‍රෙස්') || text.includes('වැඩ වැඩි') || text.includes('මහන්සි') || text.includes('ඇති වෙලා')
    ) {
      const idx = Math.floor(Math.random() * auraResponses.stress[activeLang].length)
      return auraResponses.stress[activeLang][idx]
    }
    
    // Lonely keywords
    if (
      text.includes('lonely') || text.includes('alone') || text.includes('isolated') || text.includes('no friends') ||
      text.includes('palui') || text.includes('paluyi') || text.includes('taniyama') || text.includes('thaniyama') ||
      text.includes('පාළු') || text.includes('තනියම') || text.includes('හුදකලා')
    ) {
      const idx = Math.floor(Math.random() * auraResponses.lonely[activeLang].length)
      return auraResponses.lonely[activeLang][idx]
    }
    
    // Greetings keywords
    if (
      text.includes('hi') || text.includes('hello') || text.includes('hey') || text.includes('morning') ||
      text.includes('kohomada') || text.includes('oyata') ||
      text.includes('හෙලෝ') || text.includes('හලෝ') || text.includes('ආයුබෝවන්') || text.includes('කොහොමද')
    ) {
      const idx = Math.floor(Math.random() * auraResponses.greetings[activeLang].length)
      return auraResponses.greetings[activeLang][idx]
    }

    // Identity keywords
    if (
      text.includes('who are you') || text.includes('your name') || text.includes('what is you') ||
      text.includes('kawda') || text.includes('nama') ||
      text.includes('කවුද') || text.includes('නම මොකක්ද')
    ) {
      const idx = Math.floor(Math.random() * auraResponses.identity[activeLang].length)
      return auraResponses.identity[activeLang][idx]
    }

    // Default response
    const idx = Math.floor(Math.random() * auraResponses.default[activeLang].length)
    return auraResponses.default[activeLang][idx]
  }

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = input.trim()
    setMessages(prev => [...prev, { text: userMessage, isUser: true }])
    setInput('')
    setTyping(true)

    // Simulate Aura typing response
    setTimeout(() => {
      const auraReply = getAuraResponse(userMessage)
      setMessages(prev => [...prev, { text: auraReply, isUser: false }])
      setTyping(false)
    }, 1200)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navbar */}
      <Navbar />

      {/* Main Chat Layout */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '30px 20px', boxSizing: 'border-box' }}>
        <div style={{ background: 'white', borderRadius: '24px', maxWidth: '750px', width: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          {/* Header & Language Toggle */}
          <div style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', padding: '20px 24px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '36px', background: 'rgba(255,255,255,0.2)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✨</div>
              <div>
                <h2 style={{ color: 'white', fontSize: '18px', margin: 0 }}>Aura</h2>
                <span style={{ fontSize: '12px', opacity: 0.85 }}>✨ Online | AI Mental Health Companion</span>
              </div>
            </div>

            {/* Language Switcher */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '4px' }}>
              <button 
                onClick={() => setLang('en')} 
                style={{ 
                  padding: '6px 14px', 
                  background: lang === 'en' ? 'white' : 'transparent', 
                  color: lang === 'en' ? '#4f46e5' : 'white', 
                  border: 'none', 
                  borderRadius: '6px', 
                  cursor: 'pointer', 
                  fontSize: '12px', 
                  fontWeight: 'bold',
                  transition: 'all 0.2s'
                }}
              >
                English
              </button>
              <button 
                onClick={() => setLang('si')} 
                style={{ 
                  padding: '6px 14px', 
                  background: lang === 'si' ? 'white' : 'transparent', 
                  color: lang === 'si' ? '#4f46e5' : 'white', 
                  border: 'none', 
                  borderRadius: '6px', 
                  cursor: 'pointer', 
                  fontSize: '12px', 
                  fontWeight: 'bold',
                  transition: 'all 0.2s'
                }}
              >
                සිංහල
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto', background: '#fafbfc', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '480px' }}>
            {messages.map((msg, index) => (
              <div 
                key={index}
                style={{
                  alignSelf: msg.isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '75%',
                  background: msg.isUser ? '#4f46e5' : '#f3f4f6',
                  color: msg.isUser ? 'white' : '#1f2937',
                  padding: '14px 18px',
                  borderRadius: msg.isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-line',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}
              >
                {msg.text}
              </div>
            ))}

            {typing && (
              <div style={{ alignSelf: 'flex-start', background: '#f3f4f6', padding: '14px 18px', borderRadius: '20px 20px 20px 4px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                <div style={{ width: '8px', height: '8px', background: '#9ca3af', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both' }}></div>
                <div style={{ width: '8px', height: '8px', background: '#9ca3af', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both 0.2s' }}></div>
                <div style={{ width: '8px', height: '8px', background: '#9ca3af', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both 0.4s' }}></div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Support Suggestions based on language */}
          <div style={{ padding: '12px 24px', background: '#f9fafb', borderTop: '1px solid #f3f4f6', display: 'flex', gap: '8px', overflowX: 'auto' }}>
            {lang === 'en' ? (
              <>
                <button onClick={() => setInput("I'm feeling very stressed about my exams.")} style={{ padding: '6px 12px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '20px', fontSize: '12px', color: '#4b5563', cursor: 'pointer', whiteSpace: 'nowrap' }}>📚 Academic Stress</button>
                <button onClick={() => setInput("I feel really anxious right now.")} style={{ padding: '6px 12px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '20px', fontSize: '12px', color: '#4b5563', cursor: 'pointer', whiteSpace: 'nowrap' }}>😰 Anxiety Relief</button>
                <button onClick={() => setInput("I'm feeling lonely.")} style={{ padding: '6px 12px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '20px', fontSize: '12px', color: '#4b5563', cursor: 'pointer', whiteSpace: 'nowrap' }}>👤 Feeling Lonely</button>
                <button onClick={() => setInput("Help, I need to talk to someone urgently.")} style={{ padding: '6px 12px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '20px', fontSize: '12px', color: '#b91c1c', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 'bold' }}>🚨 Emergency Help</button>
              </>
            ) : (
              <>
                <button onClick={() => setInput("මට මගේ විභාග ගැන ලොකු ස්ට්‍රෙස් එකක් තියෙනවා.")} style={{ padding: '6px 12px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '20px', fontSize: '12px', color: '#4b5563', cursor: 'pointer', whiteSpace: 'nowrap' }}>📚 විභාග පීඩනය</button>
                <button onClick={() => setInput("මට ලොකු බයක් සහ නොසන්සුන්කමක් දැනෙනවා.")} style={{ padding: '6px 12px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '20px', fontSize: '12px', color: '#4b5563', cursor: 'pointer', whiteSpace: 'nowrap' }}>😰 නොසන්සුන්කම</button>
                <button onClick={() => setInput("මට ගොඩක් පාළුයි වගේ දැනෙනවා.")} style={{ padding: '6px 12px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '20px', fontSize: '12px', color: '#4b5563', cursor: 'pointer', whiteSpace: 'nowrap' }}>👤 හුදකලා බවක්</button>
                <button onClick={() => setInput("මට හදිසි උපකාර අවශ්‍යයි.")} style={{ padding: '6px 12px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '20px', fontSize: '12px', color: '#b91c1c', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 'bold' }}>🚨 හදිසි සහය</button>
              </>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} style={{ display: 'flex', padding: '16px 24px', gap: '12px', borderTop: '1px solid #f3f4f6' }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={lang === 'en' ? "Talk to Aura... (e.g. 'I feel stressed')" : "Aura සමඟ කතා කරන්න... (උදා: 'මට දුකයි')"}
              style={{ flex: 1, padding: '14px', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '14px', outline: 'none' }}
            />
            <button
              type="submit"
              style={{
                padding: '0 24px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {lang === 'en' ? 'Send 🚀' : 'යවන්න 🚀'}
            </button>
          </form>

        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
      `}</style>

    </div>
  )
}
