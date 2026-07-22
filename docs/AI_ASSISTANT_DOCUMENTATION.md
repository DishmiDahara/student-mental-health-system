# 🤖 MindSpace AI Assistant Architecture & Documentation

## Overview
The MindSpace AI Assistant is a production-ready, 2026-style glassmorphic floating chatbot integrated seamlessly into the MindSpace MERN Stack application. It provides context-aware mental wellness support, automated mood report explanations, stress management advice, and crisis safety protection.

---

## 🌟 Key Features
- **Floating AI Assistant Widget**: Appears across **every page** (`/dashboard`, `/mood`, `/booking`, `/resources`, `/chat`, `/anonymous-chat`, `/admin`, `/apply-counselor`).
- **5-10s Invitation Banner (`PopupBubble`)**: Displays a friendly popup greeting after page load, auto-dismisses after 20s or user interaction.
- **ChatGPT-Style 2026 UI**:
  - Glassmorphic translucent design with `backdrop-filter: blur(20px)`
  - Light & Dark mode support with persistent user preference
  - Floating 3D/gradient widget button with unread counter badge
  - Minimize, Maximize/Restore, and Close controls
  - Code blocks with 1-click Copy button
  - Text-To-Speech (TTS) voice reading
  - Auto-resizing input textarea (Shift+Enter for newline, Enter to send)
  - Web Speech API microphone voice recognition
  - Quick reply suggestion chips
  - Clear chat & 1-click Export chat to `.txt` file
- **Modular Multi-Provider AI Engine (`backend/services/ai/`)**:
  - **Google Gemini API** (`gemini-1.5-flash` or `gemini-2.0-flash`)
  - **OpenRouter API** (Free models support)
  - **Zero-Cost Free Fallback Engine** (Guarantees 100% uptime & zero API bills)
  - Switch providers seamlessly via `.env` without code changes (`AI_PROVIDER=gemini` or `AI_PROVIDER=openrouter`)
- **Context Awareness**:
  - Automatically incorporates user's name, streak, recent mood logs, average wellness score, sleep, hydration, and stress triggers into AI prompts.
  - Answers "Why am I stressed?", "Explain my mood report", "How can I improve my mood?" intelligently without asking basic questions.
- **Emergency Crisis & Self-Harm Escaper**:
  - Detects self-harm & crisis keywords before sending to LLMs.
  - Instantly displays official 24/7 helplines (**1926 NIMH Sri Lanka**, **Sumithrayo**, **1990 Suwa Seriya**, **119 Emergency**, International 988/111).
  - Enforces strict non-medical guidelines ("Never diagnose diseases, never pretend to be a doctor").
- **Security & Performance**:
  - Input sanitization against XSS, script injection, and payload flooding
  - In-memory rate limiting (max 25 requests/min)
  - Error masking (raw API errors are never exposed to users)
  - Persistent MongoDB chat history storage (`ChatHistory` collection)

---

## 🛠️ Environment Variables Configuration (`backend/.env`)

Add the following environment variables to your `backend/.env` file:

```env
# AI Provider Strategy: 'gemini' | 'openrouter' | 'free_fallback'
AI_PROVIDER=gemini

# Google Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash

# OpenRouter API Configuration (Optional alternative)
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=meta-llama/llama-3.2-11b-vision-instruct:free
```

---

## 📡 API Documentation

### 1. Send Message to AI Assistant
- **Endpoint**: `POST /api/ai/chat`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Request Body**:
  ```json
  {
    "message": "Why am I stressed?",
    "conversationId": "conv_1784654321000"
  }
  ```
- **Response**:
  ```json
  {
    "reply": "Hi Friend! 🌿 Stress can stem from many factors...",
    "provider": "gemini",
    "conversationId": "conv_1784654321000",
    "isCrisis": false,
    "suggestedQuestions": [
      "Why am I stressed?",
      "Explain my mood report.",
      "How can I improve my mood?",
      "Where can I see my history?"
    ]
  }
  ```

### 2. Get Persistent Chat History
- **Endpoint**: `GET /api/ai/history`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Response**:
  ```json
  {
    "history": [
      {
        "_id": "678e...",
        "userId": "678d...",
        "conversationId": "conv_1784654321000",
        "role": "user",
        "message": "Why am I stressed?",
        "provider": "gemini",
        "timestamp": "2026-07-22T20:00:00.000Z"
      }
    ]
  }
  ```

### 3. Clear Chat History
- **Endpoint**: `DELETE /api/ai/history`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`

---

## 📁 File Structure

```
backend/
├── models/
│   └── ChatHistory.js           # MongoDB Schema for chat persistence
├── middleware/
│   ├── authMiddleware.js        # JWT verification
│   └── rateLimiter.js           # Rate limiting & input sanitization
├── services/ai/
│   ├── aiProviderFactory.js     # Provider resolver & failover strategy
│   ├── chatService.js           # Business logic, crisis escaper, context assembly
│   └── providers/
│       ├── geminiProvider.js    # Google Gemini REST API integration
│       ├── openrouterProvider.js# OpenRouter API integration
│       └── freeFallbackProvider.js # Zero-cost intelligent offline engine
├── controllers/
│   └── chatController.js        # Controller handlers
└── routes/
    └── chatRoutes.js            # Express router (/api/ai/chat)

frontend/src/
├── hooks/
│   ├── useChat.js               # Chat state, DB sync, TTS, theme state
│   ├── useAutoScroll.js         # Auto-scroll list hook
│   └── useTypingAnimation.js    # ChatGPT text streaming hook
└── components/AIChat/
    ├── ChatWidget.jsx           # Master floating widget anchor (mounted in App.jsx)
    ├── ChatWindow.jsx           # ChatGPT style glassmorphic chat window
    ├── Message.jsx              # Bubble component with copy, voice & markdown
    ├── ChatInput.jsx            # Textarea, voice input, quick replies
    ├── PopupBubble.jsx          # 5-10s invitation banner popup
    ├── MarkdownRenderer.jsx     # Markdown parser & code block copy
    ├── ProviderStatus.jsx       # Active AI engine status badge
    └── TypingIndicator.jsx      # Animated 3-dot thinking indicator
```
