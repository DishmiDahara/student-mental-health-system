import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '20px', width: '380px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ fontSize: '48px' }}>🔑</div>
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
                style={{ width: '100%', padding: '14px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} 
              />
              <button 
                onClick={handleRequestOtp} 
                disabled={loading}
                style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}
              >
                {loading ? '⏳ Processing...' : '✉️ Request Reset Code'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px', fontSize: '12.5px', color: '#1e3a8a', fontWeight: '500', lineHeight: '1.4' }}>
                🔑 Dev Mode Reset Code: <strong style={{ color: '#2563eb', fontSize: '13.5px' }}>123456</strong>
              </div>
              <div>
                <label style={{ display: 'block', color: '#4b5563', fontWeight: '600', marginBottom: '6px', fontSize: '12.5px' }}>Verification Code:</label>
                <input 
                  value={otpCode} 
                  onChange={e => { setOtpCode(e.target.value); setError(''); }} 
                  placeholder="Enter 123456" 
                  type="text" 
                  maxLength={6}
                  style={{ width: '100%', padding: '14px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', letterSpacing: '2px', textAlign: 'center', fontWeight: 'bold' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#4b5563', fontWeight: '600', marginBottom: '6px', fontSize: '12.5px' }}>New Password:</label>
                <input 
                  value={newPasswordInput} 
                  onChange={e => { setNewPasswordInput(e.target.value); setError(''); }} 
                  placeholder="Enter new secure password" 
                  type="password" 
                  style={{ width: '100%', padding: '14px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} 
                />
              </div>
              <button 
                onClick={handleResetPassword} 
                disabled={loading}
                style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}
              >
                {loading ? '⏳ Updating...' : '🔒 Reset Password'}
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '20px', width: '380px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '48px' }}>🧠</div>
          <h2 style={{ color: '#4f46e5', fontSize: '24px' }}>MindSpace</h2>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Student Mental Health Support</p>
        </div>

        <div style={{ display: 'flex', marginBottom: '24px', background: '#f3f4f6', borderRadius: '10px', padding: '4px' }}>
          <button onClick={() => setIsLogin(true)} style={{ flex: 1, padding: '10px', background: isLogin ? '#4f46e5' : 'transparent', color: isLogin ? 'white' : '#6b7280', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Login</button>
          <button onClick={() => setIsLogin(false)} style={{ flex: 1, padding: '10px', background: !isLogin ? '#4f46e5' : 'transparent', color: !isLogin ? 'white' : '#6b7280', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Register</button>
        </div>

        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}

        {!isLogin && <input value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" style={{ width: '100%', padding: '14px', marginBottom: '12px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />}
        <input value={email} onChange={e => { setEmail(e.target.value); setError(''); }} placeholder="Email address" type="email" style={{ width: '100%', padding: '14px', marginBottom: '12px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
        <input value={password} onChange={e => { setPassword(e.target.value); setError(''); }} placeholder="Password" type="password" style={{ width: '100%', padding: '14px', marginBottom: '20px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />

        {isLogin && (
          <div style={{ textAlign: 'right', marginBottom: '16px', marginTop: '-8px' }}>
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

        <button onClick={handleSubmit} disabled={loading}
          style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
          {loading ? '⏳ Please wait...' : isLogin ? '🔐 Login' : '🚀 Create Account'}
        </button>
      </div>
    </div>
  )
}