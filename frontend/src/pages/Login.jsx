import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'
import ThemeToggle from '../components/ThemeToggle'
import Icon from '../components/ui/Icon'
import { Logo, Horizon } from '../components/ui/Brand'

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
    setSuccessMessage('')
    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }
    if (!password) {
      setError('Please enter your password')
      return
    }
    if (!isLogin && !name.trim()) {
      setError('Please enter your full name')
      return
    }
    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match. Please check and try again.')
      return
    }
    setLoading(true)

    const cleanEmail = email.toLowerCase().trim()
    const cleanName = name.trim() || cleanEmail.split('@')[0]

    try {
      const url = isLogin ? `${API_URL}/api/auth/login` : `${API_URL}/api/auth/register`
      const body = isLogin ? { email: cleanEmail, password } : { name: cleanName, email: cleanEmail, password }
      const res = await axios.post(url, body, {
        headers: { 'Bypass-Tunnel-Reminder': 'true' },
        timeout: 10000
      })
      if (res.data?.token && res.data?.user) {
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('user', JSON.stringify(res.data.user))
        navigate('/dashboard')
        setLoading(false)
        return
      }
    } catch (err) {
      console.error('Auth error:', err)
      const errorMsg = err.response?.data?.message || (err.code === 'ECONNABORTED' ? 'Connection timed out. Please check backend server.' : 'Authentication failed. Please check your credentials or server connection.')
      setError(errorMsg)
      setLoading(false)
      return
    }
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
      setSuccessMessage('Verification code generated successfully!')
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
      setSuccessMessage('Password updated successfully! Please log in.')
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

  const features = [
    { icon: 'smile', title: 'Daily mood check-ins', text: 'Notice patterns and celebrate small wins.' },
    { icon: 'feather', title: 'Aura, always listening', text: 'A gentle AI companion, any hour of the day.' },
    { icon: 'shield', title: 'Private & anonymous', text: 'Talk to peers and counsellors safely.' }
  ]

  const errorBox = error && (
    <div className="alert alert-danger" role="alert">
      <Icon name="alert" size={18} /> <span>{error}</span>
    </div>
  )
  const successBox = successMessage && (
    <div className="alert alert-success" role="status">
      <Icon name="checkCircle" size={18} /> <span>{successMessage}</span>
    </div>
  )

  return (
    <div className="auth">
      {/* ---------- Hero ---------- */}
      <section className="auth-hero" aria-hidden={false}>
        <Horizon />
        <div className="auth-hero-top">
          <div className="row">
            <Logo size={44} />
            <span className="brand-name" style={{ fontSize: 28 }}>MindSpace</span>
          </div>
        </div>

        <div className="auth-hero-copy">
          <span className="eyebrow">Student mental health support</span>
          <h1 className="h-display">A calm place<br />to land.</h1>
          <p className="lead">Check in with yourself, talk it through, and find support that fits, whenever you need it.</p>
        </div>

        <ul className="auth-features">
          {features.map(f => (
            <li key={f.title}>
              <span className="tile tile-sm"><Icon name={f.icon} size={18} /></span>
              <div>
                <strong>{f.title}</strong>
                <span>{f.text}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Form ---------- */}
      <section className="auth-panel">
        <div className="auth-theme"><ThemeToggle showLabel /></div>

        <div className="auth-card rise" key={forgotMode ? 'forgot' : isLogin ? 'login' : 'register'}>
          {forgotMode ? (
            <>
              <button className="btn btn-ghost btn-sm" style={{ marginLeft: -10 }} onClick={() => { setForgotMode(false); setError(''); setSuccessMessage('') }}>
                <Icon name="arrowLeft" size={17} /> Back to log in
              </button>
              <div className="tile tile-lg mt-16"><Icon name="key" size={26} /></div>
              <h2 className="h-title mt-16">Reset your password</h2>
              <p className="muted mt-8">
                {otpSent ? 'Enter the verification code and choose a new password.' : 'Enter your registered email and we\u2019ll generate a reset code.'}
              </p>

              <div className="col gap-16 mt-24">
                {errorBox}
                {successBox}

                {!otpSent ? (
                  <>
                    <div className="field">
                      <label className="label" htmlFor="fe">Email address</label>
                      <div className="input-wrap has-left">
                        <span className="input-icon-left"><Icon name="mail" size={18} /></span>
                        <input id="fe" className="input" type="email" value={forgotEmail} placeholder="you@school.edu"
                          onChange={e => { setForgotEmail(e.target.value); setError('') }} />
                      </div>
                    </div>
                    <button className="btn btn-primary btn-lg btn-block" onClick={handleRequestOtp} disabled={loading}>
                      {loading ? 'Processing…' : 'Request reset code'}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="alert alert-info">
                      <Icon name="info" size={18} />
                      <span>Dev mode reset code: <strong style={{ letterSpacing: '0.1em' }}>123456</strong></span>
                    </div>
                    <div className="field">
                      <label className="label" htmlFor="otp">Verification code</label>
                      <input id="otp" className="input" type="text" maxLength={6} value={otpCode} placeholder="6-digit code"
                        style={{ letterSpacing: '0.5em', textAlign: 'center', fontWeight: 700, fontSize: 20 }}
                        onChange={e => { setOtpCode(e.target.value); setError('') }} />
                    </div>
                    <div className="field">
                      <label className="label" htmlFor="np">New password</label>
                      <div className="input-wrap has-left">
                        <span className="input-icon-left"><Icon name="lock" size={18} /></span>
                        <input id="np" className="input" type="password" value={newPasswordInput} placeholder="Choose a strong password"
                          onChange={e => { setNewPasswordInput(e.target.value); setError('') }} />
                      </div>
                    </div>
                    <button className="btn btn-primary btn-lg btn-block" onClick={handleResetPassword} disabled={loading}>
                      {loading ? 'Updating…' : 'Reset password'}
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <h2 className="h-title">{isLogin ? 'Welcome back' : 'Create your space'}</h2>
              <p className="muted mt-8">
                {isLogin ? 'Log in to continue your journey.' : 'It only takes a minute. No judgement, ever.'}
              </p>

              <div className="seg mt-24" style={{ display: 'flex' }} role="tablist">
                <button type="button" role="tab" aria-selected={isLogin} className={`seg-btn grow ${isLogin ? 'is-active' : ''}`}
                  onClick={() => { setIsLogin(true); setError(''); setSuccessMessage('') }}>Login</button>
                <button type="button" role="tab" aria-selected={!isLogin} className={`seg-btn grow ${!isLogin ? 'is-active' : ''}`}
                  onClick={() => { setIsLogin(false); setError(''); setSuccessMessage('') }}>Register</button>
              </div>

              <form className="col gap-16 mt-24" onSubmit={e => { e.preventDefault(); handleSubmit() }} noValidate>
                {errorBox}
                {successBox}

                {!isLogin && (
                  <div className="field">
                    <label className="label" htmlFor="nm">Full name</label>
                    <div className="input-wrap has-left">
                      <span className="input-icon-left"><Icon name="user" size={18} /></span>
                      <input id="nm" className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
                        autoCapitalize="words" autoCorrect="off" spellCheck="false" autoComplete="name" />
                    </div>
                  </div>
                )}

                <div className="field">
                  <label className="label" htmlFor="em">Email address</label>
                  <div className="input-wrap has-left">
                    <span className="input-icon-left"><Icon name="mail" size={18} /></span>
                    <input id="em" className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@school.edu"
                      autoComplete="email" inputMode="email" autoCapitalize="none" autoCorrect="off" spellCheck="false" />
                  </div>
                </div>

                <div className="field">
                  <div className="row-between">
                    <label className="label" htmlFor="pw">Password</label>
                    {isLogin && (
                      <button type="button" className="btn btn-ghost btn-sm" style={{ minHeight: 24, padding: '0 6px', color: 'var(--primary)' }}
                        onClick={() => {
                          setForgotMode(true); setOtpSent(false); setForgotEmail(email)
                          setOtpCode(''); setNewPasswordInput(''); setError(''); setSuccessMessage('')
                        }}>
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="input-wrap has-left">
                    <span className="input-icon-left"><Icon name="lock" size={18} /></span>
                    <input id="pw" className="input" type={showPassword ? 'text' : 'password'} value={password}
                      onChange={e => setPassword(e.target.value)} placeholder="Your password"
                      autoComplete={isLogin ? 'current-password' : 'new-password'} autoCapitalize="none" autoCorrect="off" spellCheck="false" />
                    <button type="button" className="input-action" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                      <Icon name={showPassword ? 'eyeOff' : 'eye'} size={18} />
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div className="field">
                    <label className="label" htmlFor="cpw">Confirm password</label>
                    <div className="input-wrap has-left">
                      <span className="input-icon-left"><Icon name="lock" size={18} /></span>
                      <input id="cpw" className="input" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword}
                        onChange={e => { setConfirmPassword(e.target.value); setError('') }} placeholder="Repeat your password"
                        autoComplete="new-password" autoCapitalize="none" autoCorrect="off" spellCheck="false" />
                      <button type="button" className="input-action" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                        <Icon name={showConfirmPassword ? 'eyeOff' : 'eye'} size={18} />
                      </button>
                    </div>
                  </div>
                )}

                <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
                  {loading ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}
                  {!loading && <Icon name="arrowRight" size={18} />}
                </button>
              </form>

              <p className="tiny muted center mt-24" style={{ lineHeight: 1.6 }}>
                <Icon name="lock" size={12} style={{ verticalAlign: '-1px', marginRight: 5 }} />
                Your check-ins and chats are private to you.
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
