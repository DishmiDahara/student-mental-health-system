import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import MoodTracker from './pages/MoodTracker'
import Booking from './pages/Booking'
import Resources from './pages/Resources'
import AIChatbot from './pages/AIChatbot'
import AnonymousChat from './pages/AnonymousChat'
import AdminDashboard from './pages/AdminDashboard'
import ApplyCounselor from './pages/ApplyCounselor'
import ChatWidget from './components/AIChat/ChatWidget'

import axios from 'axios'

axios.defaults.headers.common['Bypass-Tunnel-Reminder'] = 'true'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/mood" element={<MoodTracker />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/chat" element={<AIChatbot />} />
        <Route path="/anonymous-chat" element={<AnonymousChat />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/apply-counselor" element={<ApplyCounselor />} />
        <Route path="*" element={<Login />} />
      </Routes>
      <ChatWidget />
    </BrowserRouter>
  )
}

export default App