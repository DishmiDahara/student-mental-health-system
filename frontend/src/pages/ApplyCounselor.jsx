import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'
import Navbar from '../components/Navbar'

const qualificationOptions = [
  'Diploma in Counseling',
  'Psychology Degree',
  'Master’s Degree'
]

const specializationOptions = [
  'Mental Health Counseling',
  'Career Counseling',
  'Marriage & Family Counseling',
  'Child Counseling'
]

export default function ApplyCounselor() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [activeApp, setActiveApp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Form states
  const [fullName, setFullName] = useState('')
  const [nic, setNic] = useState('')
  const [profilePhoto, setProfilePhoto] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedQuals, setSelectedQuals] = useState([])
  const [licenseNumber, setLicenseNumber] = useState('')
  const [membership, setMembership] = useState('')
  const [experienceYears, setExperienceYears] = useState('')
  const [experienceInstitutions, setExperienceInstitutions] = useState('')
  const [selectedSpecs, setSelectedSpecs] = useState([])
  const [counsellorIdFront, setCounsellorIdFront] = useState('')
  const [counsellorIdBack, setCounsellorIdBack] = useState('')

  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchActiveApplication()
  }, [])

  const fetchActiveApplication = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/counselor-applications/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setActiveApp(res.data)
      
      // Auto-fill email and name from logged-in user if empty
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        const parsed = JSON.parse(savedUser)
        setFullName(parsed.name || '')
        setEmail(parsed.email || '')
      }
    } catch (err) {
      console.error('Error fetching application status:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckboxToggle = (val, list, setList) => {
    if (list.includes(val)) {
      setList(list.filter(item => item !== val))
    } else {
      setList([...list, val])
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg('⚠️ Only JPG, JPEG, and PNG formats are allowed for the profile photo.')
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      setProfilePhoto(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleIdFrontChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg('⚠️ Only JPG, JPEG, and PNG formats are allowed for the ID Card Front.')
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      setCounsellorIdFront(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleIdBackChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg('⚠️ Only JPG, JPEG, and PNG formats are allowed for the ID Card Back.')
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      setCounsellorIdBack(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleNext = () => {
    setErrorMsg('')
    if (step === 1) {
      if (!fullName || !nic || !profilePhoto || !email || !phone) {
        setErrorMsg('Please fill in all personal details.')
        return
      }
    } else if (step === 2) {
      if (selectedQuals.length === 0) {
        setErrorMsg('Please select at least one educational qualification.')
        return
      }
      if (!counsellorIdFront || !counsellorIdBack) {
        setErrorMsg('Please upload both Front and Back sides of your Counselor ID Card.')
        return
      }
    }
    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!experienceYears || !experienceInstitutions || selectedSpecs.length === 0) {
      setErrorMsg('Please complete all professional experience fields.')
      return
    }

    setSubmitting(true)
    setErrorMsg('')

    try {
      const payload = {
        fullName,
        nic,
        profilePhoto,
        email,
        phone,
        qualifications: selectedQuals,
        licenseNumber,
        membership,
        counsellorIdFront,
        counsellorIdBack,
        experienceYears: Number(experienceYears),
        experienceInstitutions,
        specialization: selectedSpecs
      }

      const res = await axios.post(`${API_URL}/api/counselor-applications`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setActiveApp(res.data)
      setStep(1)
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit counselor verification.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setActiveApp(null)
    setStep(1)
    setFullName('')
    setNic('')
    setProfilePhoto('')
    setPhone('')
    setSelectedQuals([])
    setLicenseNumber('')
    setMembership('')
    setExperienceYears('')
    setExperienceInstitutions('')
    setSelectedSpecs([])
    setCounsellorIdFront('')
    setCounsellorIdBack('')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h3>⏳ Checking application status...</h3>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', paddingBottom: '60px' }}>
      
      {/* Navbar */}
      <Navbar />

      <div style={{ maxWidth: '650px', margin: '40px auto', padding: '0 20px' }}>
        
        {/* Case 1: Already has application */}
        {activeApp ? (
          <div style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 25px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            {activeApp.status === 'pending' && (
              <>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>⏳</div>
                <h2 style={{ color: '#d97706', marginBottom: '12px' }}>Verification Under Review</h2>
                <p style={{ color: '#4b5563', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
                  Your application to become a counselor has been submitted successfully. Our administrative staff will review your credentials, license number, and certificates shortly.
                </p>
                <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '12px', fontSize: '13.5px', color: '#6b7280', display: 'inline-block' }}>
                  Status: <strong style={{ color: '#d97706', textTransform: 'uppercase' }}>{activeApp.status}</strong>
                </div>
              </>
            )}

            {activeApp.status === 'approved' && (
              <>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
                <h2 style={{ color: '#10b981', marginBottom: '12px' }}>Application Approved!</h2>
                <p style={{ color: '#4b5563', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
                  Congratulations! You have been verified as a Counselor. You are now registered on the bookings panel and can conduct sessions.
                </p>
                <button 
                  onClick={() => navigate('/admin')}
                  style={{ padding: '12px 24px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Go to Counselor Console
                </button>
              </>
            )}

            {activeApp.status === 'rejected' && (
              <>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>❌</div>
                <h2 style={{ color: '#ef4444', marginBottom: '12px' }}>Application Rejected</h2>
                <p style={{ color: '#4b5563', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
                  We were unable to verify your qualifications or professional license number. Please check your credentials and try again.
                </p>
                <button 
                  onClick={handleReset}
                  style={{ padding: '12px 24px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Submit New Application
                </button>
              </>
            )}
          </div>
        ) : (
          
          // Case 2: Multi-step Application Wizard
          <div style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 25px rgba(0,0,0,0.05)' }}>
            <h2 style={{ color: '#1f2937', marginBottom: '8px' }}>🤝 Counselor Verification Wizard</h2>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '32px' }}>Provide your professional credentials. Approved applicants receive counsellor credentials.</p>

            {/* Steps Indicator */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', position: 'relative' }}>
              <div style={{ flex: 1, textAlign: 'center', borderBottom: `4px solid ${step >= 1 ? '#4f46e5' : '#e5e7eb'}`, paddingBottom: '8px', fontWeight: 'bold', fontSize: '13px', color: step >= 1 ? '#4f46e5' : '#9ca3af' }}>1. Personal</div>
              <div style={{ flex: 1, textAlign: 'center', borderBottom: `4px solid ${step >= 2 ? '#4f46e5' : '#e5e7eb'}`, paddingBottom: '8px', fontWeight: 'bold', fontSize: '13px', color: step >= 2 ? '#4f46e5' : '#9ca3af' }}>2. Credentials</div>
              <div style={{ flex: 1, textAlign: 'center', borderBottom: `4px solid ${step >= 3 ? '#4f46e5' : '#e5e7eb'}`, paddingBottom: '8px', fontWeight: 'bold', fontSize: '13px', color: step >= 3 ? '#4f46e5' : '#9ca3af' }}>3. Experience</div>
            </div>

            {errorMsg && (
              <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', fontWeight: '500' }}>
                {errorMsg}
              </div>
            )}

            {/* STEP 1: Personal Details */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Full Name (matching credentials):</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>NIC or Passport Number:</label>
                  <input type="text" value={nic} onChange={e => setNic(e.target.value)} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Upload Profile Photo:</label>
                  <input 
                    type="file" 
                    accept="image/png, image/jpeg, image/jpg" 
                    onChange={handleFileChange} 
                    style={{ width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} 
                    required 
                  />
                  {profilePhoto && (
                    <div style={{ marginTop: '10px' }}>
                      <img src={profilePhoto} alt="Preview" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #4f46e5' }} />
                    </div>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Email Address:</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Phone Number:</label>
                    <input type="text" value={phone} onChange={e => setPhone(e.target.value)} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} required />
                  </div>
                </div>

                <button onClick={handleNext} style={{ width: '100%', padding: '14px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', marginTop: '10px' }}>Next Steps →</button>
              </div>
            )}

            {/* STEP 2: Qualifications & Credentials */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>Educational Qualifications (Select all that apply):</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {qualificationOptions.map(opt => (
                      <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={selectedQuals.includes(opt)}
                          onChange={() => handleCheckboxToggle(opt, selectedQuals, setSelectedQuals)}
                          style={{ width: '18px', height: '18px' }}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Registration / License Number (If available):</label>
                  <input type="text" value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} placeholder="e.g. SLMC-12345" style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Professional Association Membership:</label>
                  <input type="text" value={membership} onChange={e => setMembership(e.target.value)} placeholder="e.g. Sri Lanka Association for Counseling" style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                </div>

                {/* Both-side Counselor ID Card Upload */}
                <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#111827' }}>📁 Counselor ID Card Verification</h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>ID Card (Front Side):</label>
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg, image/jpg" 
                        onChange={handleIdFrontChange}
                        style={{ width: '100%', padding: '6px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} 
                        required
                      />
                      {counsellorIdFront && (
                        <div style={{ marginTop: '8px' }}>
                          <img src={counsellorIdFront} alt="ID Front Preview" style={{ width: '100%', maxHeight: '110px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>ID Card (Back Side):</label>
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg, image/jpg" 
                        onChange={handleIdBackChange}
                        style={{ width: '100%', padding: '6px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} 
                        required
                      />
                      {counsellorIdBack && (
                        <div style={{ marginTop: '8px' }}>
                          <img src={counsellorIdBack} alt="ID Back Preview" style={{ width: '100%', maxHeight: '110px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button onClick={handleBack} style={{ flex: 1, padding: '14px', background: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>← Back</button>
                  <button onClick={handleNext} style={{ flex: 1, padding: '14px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>Next Steps →</button>
                </div>
              </div>
            )}

            {/* STEP 3: Experience & Specialization */}
            {step === 3 && (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Work Exp. (Years):</label>
                    <input type="number" value={experienceYears} onChange={e => setExperienceYears(e.target.value)} min="0" style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Institutions Worked At:</label>
                    <input type="text" value={experienceInstitutions} onChange={e => setExperienceInstitutions(e.target.value)} placeholder="e.g. National Hospital, SLIIT Counseling Unit" style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} required />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>Specialization Areas:</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {specializationOptions.map(opt => (
                      <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={selectedSpecs.includes(opt)}
                          onChange={() => handleCheckboxToggle(opt, selectedSpecs, setSelectedSpecs)}
                          style={{ width: '18px', height: '18px' }}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button type="button" onClick={handleBack} style={{ flex: 1, padding: '14px', background: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>← Back</button>
                  <button type="submit" disabled={submitting} style={{ flex: 1, padding: '14px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>
                    {submitting ? '⏳ Submitting...' : '🚀 Submit Verification'}
                  </button>
                </div>
              </form>
            )}

          </div>
        )}

      </div>

    </div>
  )
}
