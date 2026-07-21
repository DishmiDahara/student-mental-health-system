# 🧠 MindSpace - Student Mental Health & Wellness Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v19.0-blue.svg)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-emerald.svg)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-v4.8-black.svg)](https://socket.io/)
[![Vite](https://img.shields.io/badge/Vite-v8.0-purple.svg)](https://vitejs.dev/)

> A comprehensive, full-stack digital mental health platform built specifically for students. Combines real-time AI facial emotion scanning, sentiment analysis, anonymous peer matchmaking, private counseling appointments, and hardware-accelerated 3D WebGL relaxation tools.

🌐 **Live Demo**: [https://delicate-squirrel-5ffc5f.netlify.app](https://delicate-squirrel-5ffc5f.netlify.app)

---

## 🚀 Key Features

### 📸 1. AI Facial Emotion & Sentiment Analysis
- **Real-Time Facial Camera Scanner**: Captures video frame pixels to evaluate facial luminance, smile curvature, and eye aperture posture in real time.
- **Auto-Fill Wellness Parameters**: Auto-populates mood score (1-5), energy levels, and advisor notes upon facial detection.
- **AI Sentiment Analyzer**: Evaluates journal entries to compute sentiment scores and provide personalized wellness suggestions.

### 💬 2. Anonymous Peer Support Chat
- **Socket.IO Matchmaking**: Connects students randomly for private, real-time peer chat sessions.
- **Complete Privacy**: Generates anonymous aliases to ensure a safe environment for open expression.

### 📅 3. Private Counseling Appointments
- **Verified Counselors**: Browse profiles of campus mental health advisors.
- **Appointment Scheduling**: Book private video/chat sessions with real-time advisor confirmation.
- **Live Counselor Support**: Integrated one-on-one live chat with counselor notifications.

### 📊 4. Mood & Lifestyle Tracker
- **Comprehensive Logging**: Record daily mood, sleep hours, hydration, screen time, weather, and custom triggers.
- **Interactive Analytics & Heatmaps**: Visualizes monthly logging trends, sleep vs. mood correlations, and trigger frequency using Recharts.
- **Journal History**: Responsive timeline displaying voice notes, photo attachments, and lifestyle badges.

### 🌌 5. Interactive 3D WebGL Relaxation Zone
- **Three.js Environments**: Hardware-accelerated 3D relaxation tools (Cosmic Starfield, Water Ripples, Sakura Sanctuary, Crystal Breathing Orb, Saturn & Moons, Autumn Forest).
- **Soothing Music & Soundscape Hub**: Ambient Web Audio synthesizer soundscapes and song search.

### 🛡️ 6. Counselor & Admin Portal
- **Student Monitoring**: Overview of student wellness trends and urgent support alerts.
- **Custom Advisor Suggestions**: Assign personalized relaxation activities and games to students.
- **Settlement & Reporting**: Financial settlement tracking and PDF/Docx report generation.

---

## 🛠️ Technology Architecture

### **Frontend**
- **Framework**: React 19 + Vite 8
- **Styling**: Vanilla CSS (Custom Design System with Glassmorphic Elements)
- **3D Graphics & Visuals**: Three.js (WebGL Engine)
- **Data Visualization**: Recharts
- **Real-Time Client**: Socket.IO Client

### **Backend**
- **Runtime**: Node.js + Express.js
- **Database**: MongoDB + Mongoose ODM
- **Real-Time Server**: Socket.IO (WebSockets)
- **Authentication**: JSON Web Tokens (JWT) + Bcrypt.js
- **Security**: CORS, Dotenv, Admin Auth Middleware

---

## 📁 Project Structure

```
mental-health-project/
├── backend/
│   ├── models/            # Mongoose Schemas (User, Mood, Booking, Message, etc.)
│   ├── routes/            # REST API endpoints (auth, mood, bookings, etc.)
│   ├── seed.js            # Database seeder script
│   └── server.js          # Main Express & Socket.IO server
└── frontend/
    ├── src/
    │   ├── components/    # Reusable UI components (Navbar, Modals, etc.)
    │   ├── pages/         # Application pages (Login, Dashboard, MoodTracker, etc.)
    │   ├── config.js      # Dynamic API URL resolution
    │   ├── App.jsx        # Route definitions
    │   └── main.jsx       # Entry point
    ├── vite.config.js     # Vite dev server & API proxy config
    └── package.json
```

---

## ⚡ Quick Start & Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Server running locally on port 27017 or a MongoDB Atlas URI

### 1. Clone the Repository
```bash
git clone https://github.com/DaharaGajanayaka/student-mental-health-system.git
cd student-mental-health-system
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file inside the `backend` folder:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/mentalhealth
JWT_SECRET=mysecretkey123
```
Seed initial data & start backend:
```bash
node seed.js
npm start
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser!

---

## 🔑 Test Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin / Counselor** | `admin@mindspace.com` | `admin123` |
| **Student** | Create any new account on the Register tab | Any password |

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

### 👩‍💻 Author
**Dishmi Dahara Gajanayaka**  
*IT Undergraduate @ SLIATE | Full-Stack Software Developer*  
[GitHub Profile](https://github.com/DaharaGajanayaka)
