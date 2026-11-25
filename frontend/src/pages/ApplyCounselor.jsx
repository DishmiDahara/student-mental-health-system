import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'
import Icon from '../components/ui/Icon'

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
      <div className="page page-narrow">
        <div className="skeleton" style={{ height: 320, borderRadius: 30 }} />
      </div>
    )
  }

  const stepLabels = ['Personal details', 'Credentials', 'Experience']

  const Upload = ({ label, value, onChange, round }) => (
    <div className="field">
      <span className="label">{label}</span>
      <label className="dropzone">
        {value ? (
          <img src={value} alt="Preview" className={round ? 'dz-round' : 'dz-rect'} />
        ) : (
          <span className="tile"><Icon name="upload" size={22} /></span>
        )}
        <span className="small strong">{value ? 'Replace image' : 'Click to upload'}</span>
        <span className="tiny muted">JPG or PNG</span>
        <input type="file" accept="image/png, image/jpeg, image/jpg" onChange={onChange} style={{ display: 'none' }} />
      </label>
    </div>
  )

  const Choice = ({ opt, list, setList }) => {
    const on = list.includes(opt)
    return (
      <label className={`check ${on ? 'is-on' : ''}`}>
        <input type="checkbox" checked={on} onChange={() => handleCheckboxToggle(opt, list, setList)} />
        {opt}
      </label>
    )
  }

  return (
    <div className="page page-narrow">
      {activeApp ? (
        <div className="card card-pad-lg center rise" style={{ padding: '48px 28px' }}>
          {activeApp.status === 'pending' && (
            <>
              <div className="tile tile-lg tile-warn" style={{ margin: '0 auto 18px', width: 72, height: 72, borderRadius: 24 }}><Icon name="clock" size={32} /></div>
              <h1 className="h-title">Verification under review</h1>
              <p className="muted mt-16" style={{ maxWidth: 480, margin: '16px auto 0' }}>
                Your application to become a counselor has been submitted successfully. Our administrative staff will review your credentials, license number, and certificates shortly.
              </p>
              <span className="chip chip-warn mt-24" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>Status: {activeApp.status}</span>
            </>
          )}
          {activeApp.status === 'approved' && (
            <>
              <div className="tile tile-lg tile-success" style={{ margin: '0 auto 18px', width: 72, height: 72, borderRadius: 24 }}><Icon name="checkCircle" size={32} /></div>
              <h1 className="h-title">Application approved!</h1>
              <p className="muted mt-16" style={{ maxWidth: 480, margin: '16px auto 0' }}>
                Congratulations! You have been verified as a Counselor. You are now registered on the bookings panel and can conduct sessions.
              </p>
              <button className="btn btn-primary btn-lg mt-24" onClick={() => navigate('/admin')}>Go to counsellor console <Icon name="arrowRight" size={18} /></button>
            </>
          )}
          {activeApp.status === 'rejected' && (
            <>
              <div className="tile tile-lg tile-danger" style={{ margin: '0 auto 18px', width: 72, height: 72, borderRadius: 24 }}><Icon name="xCircle" size={32} /></div>
              <h1 className="h-title">Application not approved</h1>
              <p className="muted mt-16" style={{ maxWidth: 480, margin: '16px auto 0' }}>
                We were unable to verify your qualifications or professional license number. Please check your credentials and try again.
              </p>
              <button className="btn btn-primary btn-lg mt-24" onClick={handleReset}>Re-apply</button>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="page-head">
            <div>
              <span className="eyebrow">Join our care team</span>
              <h1 className="h-title">Counselor verification</h1>
              <p className="muted mt-8">Provide your professional credentials. Approved applicants receive counsellor access.</p>
            </div>
          </div>

          <ol className="stepper" aria-label="Progress">
            {stepLabels.map((l, i) => (
              <li key={l} className={step > i + 1 ? 'is-done' : step === i + 1 ? 'is-current' : ''}>
                <span className="stepper-dot">{step > i + 1 ? <Icon name="check" size={15} stroke={2.6} /> : i + 1}</span>
                <span className="stepper-label">{l}</span>
              </li>
            ))}
          </ol>

          <form className="card card-pad-lg col gap-24" onSubmit={handleSubmit}>
            {errorMsg && <div className="alert alert-danger" role="alert"><Icon name="alert" size={18} /> <span>{errorMsg}</span></div>}

            {step === 1 && (
              <>
                <div className="grid grid-2">
                  <div className="field"><label className="label">Full name (matching credentials)</label>
                    <input className="input" type="text" value={fullName} onChange={e => setFullName(e.target.value)} /></div>
                  <div className="field"><label className="label">NIC or passport number</label>
                    <input className="input" type="text" value={nic} onChange={e => setNic(e.target.value)} /></div>
                  <div className="field"><label className="label">Email address</label>
                    <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
                  <div className="field"><label className="label">Phone number</label>
                    <input className="input" type="text" value={phone} onChange={e => setPhone(e.target.value)} /></div>
                </div>
                <Upload label="Profile photo" value={profilePhoto} onChange={handleFileChange} round />
                <button type="button" className="btn btn-primary btn-lg btn-block" onClick={handleNext}>Continue <Icon name="arrowRight" size={18} /></button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="field">
                  <span className="label">Educational qualifications <span className="muted">(select all that apply)</span></span>
                  <div className="grid grid-3" style={{ gap: 10 }}>
                    {qualificationOptions.map(opt => <Choice key={opt} opt={opt} list={selectedQuals} setList={setSelectedQuals} />)}
                  </div>
                </div>
                <div className="grid grid-2">
                  <div className="field"><label className="label">Registration / license number <span className="muted">(if available)</span></label>
                    <input className="input" type="text" value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} placeholder="e.g. SLMC-12345" /></div>
                  <div className="field"><label className="label">Professional association membership</label>
                    <input className="input" type="text" value={membership} onChange={e => setMembership(e.target.value)} placeholder="e.g. Sri Lanka Association for Counseling" /></div>
                </div>
                <div className="card card-soft">
                  <h3 className="h-section" style={{ fontSize: 17 }}>Counselor ID card verification</h3>
                  <div className="grid grid-2 mt-16">
                    <Upload label="ID card (front)" value={counsellorIdFront} onChange={handleIdFrontChange} />
                    <Upload label="ID card (back)" value={counsellorIdBack} onChange={handleIdBackChange} />
                  </div>
                </div>
                <div className="row gap-16">
                  <button type="button" className="btn btn-outline btn-lg grow" onClick={handleBack}><Icon name="arrowLeft" size={18} /> Back</button>
                  <button type="button" className="btn btn-primary btn-lg grow" onClick={handleNext}>Continue <Icon name="arrowRight" size={18} /></button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="grid grid-2">
                  <div className="field"><label className="label">Work experience (years)</label>
                    <input className="input" type="number" min="0" value={experienceYears} onChange={e => setExperienceYears(e.target.value)} /></div>
                  <div className="field"><label className="label">Institutions worked at</label>
                    <input className="input" type="text" value={experienceInstitutions} onChange={e => setExperienceInstitutions(e.target.value)} placeholder="e.g. National Hospital, SLIIT Counseling Unit" /></div>
                </div>
                <div className="field">
                  <span className="label">Specialization areas</span>
                  <div className="grid grid-2" style={{ gap: 10 }}>
                    {specializationOptions.map(opt => <Choice key={opt} opt={opt} list={selectedSpecs} setList={setSelectedSpecs} />)}
                  </div>
                </div>
                <div className="row gap-16">
                  <button type="button" className="btn btn-outline btn-lg grow" onClick={handleBack}><Icon name="arrowLeft" size={18} /> Back</button>
                  <button type="submit" className="btn btn-primary btn-lg grow" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit application'}</button>
                </div>
              </>
            )}
          </form>
        </>
      )}
    </div>
  )
}
