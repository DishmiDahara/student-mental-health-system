import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Forgot Password States
  const [forgotMode, setForgotMode] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [newPasswordInput, setNewPasswordInput] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSubmit = async () => {
    setError('')
    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match. Please check and try again.')
      return
    }
    setLoading(true)
    try {
      const url = isLogin ? `${API_URL}/api/auth/login` : `${API_URL}/api/auth/register`
      const body = isLogin ? { email, password } : { name, email, password }
      const res = await axios.post(url, body)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
    setLoading(false)
  }

  const handleRequestOtp = async () => {
    if (!forgotEmail.trim()) {
      setError('Please enter your email address')
      return
    }
    setError('')
    setLoading(true)
    try {
      await axios.post(`${API_URL}/api/auth/forgot-password`, { email: forgotEmail.trim() })
      setOtpSent(true)
      setError('')
      setSuccessMessage('✅ Verification code generated successfully!')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request reset code')
    }
    setLoading(false)
  }

  const handleResetPassword = async () => {
    if (!otpCode.trim() || !newPasswordInput.trim()) {
      setError('Please enter both verification code and new password')
      return
    }
    if (otpCode.trim() !== '123456') {
      setError('Invalid verification code')
      return
    }
    setError('')
    setLoading(true)
    try {
      await axios.post(`${API_URL}/api/auth/reset-password`, {
        email: forgotEmail.trim(),
        code: otpCode.trim(),
        newPassword: newPasswordInput.trim()
      })
      alert('🔒 Password reset successful! You can now log in.')
      setSuccessMessage('✅ Password updated successfully! Please log in.')
      setOtpSent(false)
      setForgotMode(false)
      // Autofill fields
      setEmail(forgotEmail.trim())
      setPassword('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password')
    }
    setLoading(false)
  }

  if (forgotMode) {
    return (
      <div style={{ minHeight: '100dvh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', overflowY: 'auto', boxSizing: 'border-box' }}>
        <div style={{ background: 'white', padding: '32px 24px', borderRadius: '20px', width: '100%', maxWidth: '380px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', boxSizing: 'border-box', margin: 'auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2 style={{ color: '#4f46e5', fontSize: '24px' }}>Reset Password</h2>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>MindSpace Security Console</p>
          </div>

          {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
          {successMessage && <div style={{ background: '#ecfdf5', color: '#047857', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', fontWeight: '500' }}>{successMessage}</div>}

          {!otpSent ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ color: '#4b5563', fontSize: '13.5px', margin: '0 0 4px', lineHeight: '1.5' }}>
                Enter your registered email address to request a password reset verification code.
              </p>
              <input 
                value={forgotEmail} 
                onChange={e => { setForgotEmail(e.target.value); setError(''); }} 
                placeholder="Enter email address" 
                type="email" 
                style={{ width: '100%', padding: '14px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#1e293b', background: '#ffffff', colorScheme: 'light', textAlign: 'left', opacity: 1, pointerEvents: 'auto' }} 
              />
              <button 
                onClick={handleRequestOtp} 
                disabled={loading}
                style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}
              >
                {loading ? 'Processing...' : 'Request Reset Code'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px', fontSize: '12.5px', color: '#1e3a8a', fontWeight: '500', lineHeight: '1.4' }}>
                Dev Mode Reset Code: <strong style={{ color: '#2563eb', fontSize: '13.5px' }}>123456</strong>
              </div>
              <div>
                <label style={{ display: 'block', color: '#4b5563', fontWeight: '600', marginBottom: '6px', fontSize: '12.5px' }}>Verification Code:</label>
                <input 
                  value={otpCode} 
                  onChange={e => { setOtpCode(e.target.value); setError(''); }} 
                  placeholder="Enter 123456" 
                  type="text" 
                  maxLength={6}
                  style={{ width: '100%', padding: '14px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', letterSpacing: '2px', textAlign: 'center', fontWeight: 'bold', color: '#1e293b', background: '#ffffff', colorScheme: 'light', opacity: 1, pointerEvents: 'auto' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#4b5563', fontWeight: '600', marginBottom: '6px', fontSize: '12.5px' }}>New Password:</label>
                <input 
                  value={newPasswordInput} 
                  onChange={e => { setNewPasswordInput(e.target.value); setError(''); }} 
                  placeholder="Enter new secure password" 
                  type="password" 
                  style={{ width: '100%', padding: '14px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#1e293b', background: '#ffffff', colorScheme: 'light', textAlign: 'left', opacity: 1, pointerEvents: 'auto' }} 
                />
              </div>
              <button 
                onClick={handleResetPassword} 
                disabled={loading}
                style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}
              >
                {loading ? 'Updating...' : 'Reset Password'}
              </button>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <span 
              onClick={() => {
                setForgotMode(false)
                setError('')
                setSuccessMessage('')
              }}
              style={{ color: '#6b7280', fontSize: '13.5px', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}
            >
              ← Back to Login
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="animated-bg" style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', overflow: 'hidden', position: 'relative', boxSizing: 'border-box' }}>
      {/* Background Animated Blobs */}
      <div className="bg-blob-1" />
      <div className="bg-blob-2" />
      <div className="bg-blob-3" />

      <div className="animated-card" key={isLogin ? 'login-card' : 'register-card'} style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '32px 24px', borderRadius: '24px', width: '100%', maxWidth: '380px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', boxSizing: 'border-box', margin: 'auto', backdropFilter: 'blur(16px)', zIndex: 2, border: '1px solid rgba(255,255,255,0.4)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="animated-brain-icon" style={{ fontSize: '48px', filter: 'drop-shadow(0 4px 12px rgba(79,70,229,0.3))' }}>🧠</div>
          <h2 style={{ color: '#4f46e5', fontSize: '26px', margin: '6px 0 2px', fontWeight: '800', letterSpacing: '-0.5px' }}>MindSpace</h2>
          <p style={{ color: '#6b7280', fontSize: '13.5px', margin: 0, fontWeight: '500' }}>Student Mental Health Support</p>
        </div>

        <div style={{ display: 'flex', marginBottom: '20px', background: '#f1f5f9', borderRadius: '12px', padding: '4px', position: 'relative' }}>
          <button 
            type="button" 
            onClick={() => { setIsLogin(true); setError(''); }} 
            style={{ flex: 1, padding: '11px', background: isLogin ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : 'transparent', color: isLogin ? 'white' : '#64748b', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14.5px', transition: 'all 0.3s ease', boxShadow: isLogin ? '0 4px 12px rgba(79,70,229,0.3)' : 'none', touchAction: 'manipulation' }}
          >
            Login
          </button>
          <button 
            type="button" 
            onClick={() => { setIsLogin(false); setError(''); }} 
            style={{ flex: 1, padding: '11px', background: !isLogin ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : 'transparent', color: !isLogin ? 'white' : '#64748b', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14.5px', transition: 'all 0.3s ease', boxShadow: !isLogin ? '0 4px 12px rgba(79,70,229,0.3)' : 'none', touchAction: 'manipulation' }}
          >
            Register
          </button>
        </div>

        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13.5px' }}>{error}</div>}

        <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
          {!isLogin && (
            <input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Full Name" 
              autoCapitalize="words"
              autoCorrect="off"
              spellCheck="false"
              style={{ width: '100%', height: '50px', lineHeight: '1.5', padding: '12px 16px', marginBottom: '14px', border: '2px solid #cbd5e1', borderRadius: '12px', fontSize: '16px', color: '#1e293b', background: '#ffffff', outline: 'none', boxSizing: 'border-box', textAlign: 'left', colorScheme: 'light' }} 
            />
          )}
          <input 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="Email address" 
            type="email" 
            autoComplete="email" 
            inputMode="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            style={{ width: '100%', height: '50px', lineHeight: '1.5', padding: '12px 16px', marginBottom: '14px', border: '2px solid #cbd5e1', borderRadius: '12px', fontSize: '16px', color: '#1e293b', background: '#ffffff', outline: 'none', boxSizing: 'border-box', textAlign: 'left', colorScheme: 'light' }} 
          />
          <div style={{ position: 'relative', width: '100%', marginBottom: isLogin ? '16px' : '14px' }}>
            <input 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="Password" 
              type={showPassword ? "text" : "password"} 
              autoComplete="current-password" 
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              style={{ width: '100%', height: '50px', lineHeight: '1.5', padding: '12px 46px 12px 16px', border: '2px solid #cbd5e1', borderRadius: '12px', fontSize: '16px', color: '#1e293b', background: '#ffffff', outline: 'none', boxSizing: 'border-box', textAlign: 'left', colorScheme: 'light' }} 
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', opacity: 0.7, padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          {!isLogin && (
            <div style={{ position: 'relative', width: '100%', marginBottom: '16px' }}>
              <input 
                value={confirmPassword} 
                onChange={e => { setConfirmPassword(e.target.value); setError(''); }} 
                placeholder="Confirm Password" 
                type={showConfirmPassword ? "text" : "password"} 
                autoComplete="new-password" 
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                style={{ width: '100%', height: '50px', lineHeight: '1.5', padding: '12px 46px 12px 16px', border: '2px solid #cbd5e1', borderRadius: '12px', fontSize: '16px', color: '#1e293b', background: '#ffffff', outline: 'none', boxSizing: 'border-box', textAlign: 'left', colorScheme: 'light' }} 
              />
              <button 
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', opacity: 0.7, padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
            </div>
          )}

          {isLogin && (
            <div style={{ textAlign: 'right', marginBottom: '16px', marginTop: '-6px' }}>
              <span 
                onClick={() => {
                  setForgotMode(true)
                  setOtpSent(false)
                  setForgotEmail(email)
                  setOtpCode('')
                  setNewPasswordInput('')
                  setError('')
                  setSuccessMessage('')
                }}
                style={{ color: '#4f46e5', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}
              >
                Forgot Password?
              </span>
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{ width: '100%', height: '50px', padding: '0 16px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}