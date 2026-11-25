import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import AppShell from './components/AppShell'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import MoodTracker from './pages/MoodTracker'
import Booking from './pages/Booking'
import Resources from './pages/Resources'
import AIChatbot from './pages/AIChatbot'
import AnonymousChat from './pages/AnonymousChat'
import AdminDashboard from './pages/AdminDashboard'
import ApplyCounselor from './pages/ApplyCounselor'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public entry */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />

          {/* Signed-in area — shares the MindSpace shell (rail / tab bar) */}
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/mood" element={<MoodTracker />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/chat" element={<AIChatbot />} />
            <Route path="/anonymous-chat" element={<AnonymousChat />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/apply-counselor" element={<ApplyCounselor />} />
          </Route>

          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
