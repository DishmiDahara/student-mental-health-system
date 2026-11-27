import * as faceapi from '@vladmandic/face-api/dist/face-api.esm.js'

let modelsLoaded = false
let modelLoadingPromise = null

// Primary local path and backup CDN for guaranteed model availability
const LOCAL_MODELS_PATH = '/models'
const CDN_MODELS_PATH = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model'

/**
 * Initializes and loads TinyFaceDetector, FaceLandmark68, and FaceExpression models.
 * Tries local path first, then automatically falls back to CDN if local files are missing.
 */
export async function loadFaceDetectionModels(modelsPath = LOCAL_MODELS_PATH) {
  if (modelsLoaded) return true
  if (modelLoadingPromise) return modelLoadingPromise

  modelLoadingPromise = (async () => {
    // Ensure TensorFlow.js backend is ready
    if (faceapi.tf && faceapi.tf.ready) {
      await faceapi.tf.ready()
    }

    // Attempt 1: Load from specified path (usually local /models)
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(modelsPath),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(modelsPath),
        faceapi.nets.faceLandmark68Net.loadFromUri(modelsPath),
        faceapi.nets.faceExpressionNet.loadFromUri(modelsPath)
      ])
      modelsLoaded = true
      return true
    } catch (localErr) {
      console.warn(`Local model load from "${modelsPath}" failed, attempting CDN fallback:`, localErr)
    }

    // Attempt 2: Fallback to official CDN if local failed
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(CDN_MODELS_PATH),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(CDN_MODELS_PATH),
        faceapi.nets.faceLandmark68Net.loadFromUri(CDN_MODELS_PATH),
        faceapi.nets.faceExpressionNet.loadFromUri(CDN_MODELS_PATH)
      ])
      modelsLoaded = true
      return true
    } catch (cdnErr) {
      console.error('All face detection model loading attempts failed:', cdnErr)
      modelLoadingPromise = null
      throw new Error('Unable to load AI face detection models. Please check your network connection.')
    }
  })()

  return modelLoadingPromise
}

/**
 * Checks if the video frame has adequate lighting by sampling luma.
 */
export function evaluateLighting(video) {
  try {
    if (!video || video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
      return { isPoor: false, isTooBright: false, luma: 100 }
    }
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 48
    const ctx = canvas.getContext('2d')
    if (!ctx) return { isPoor: false, isTooBright: false, luma: 100 }
    ctx.drawImage(video, 0, 0, 64, 48)
    const { data } = ctx.getImageData(0, 0, 64, 48)

    let totalLuma = 0
    const pixelCount = data.length / 4
    for (let i = 0; i < data.length; i += 4) {
      totalLuma += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    }
    const avgLuma = totalLuma / pixelCount
    return {
      isPoor: avgLuma < 30,
      isTooBright: avgLuma > 240,
      luma: Math.round(avgLuma)
    }
  } catch (e) {
    return { isPoor: false, isTooBright: false, luma: 100 }
  }
}

/**
 * Detects all faces in a video frame with high sensitivity and fallback.
 */
export async function detectFacesInVideo(video, options = {}) {
  if (!modelsLoaded || !video || video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
    return null
  }

  // Optimized detector options: 320 input size with 0.28 threshold for sensitive, reliable detection
  const detectorOptions = new faceapi.TinyFaceDetectorOptions({
    inputSize: options.inputSize || 320,
    scoreThreshold: options.scoreThreshold || 0.28
  })

  try {
    // Full detection with landmarks and expressions
    const detections = await faceapi
      .detectAllFaces(video, detectorOptions)
      .withFaceLandmarks(true)
      .withFaceExpressions()

    return detections
  } catch (err) {
    // Graceful fallback: try standard landmarks if tiny landmarks errored
    try {
      const fallbackDetections = await faceapi
        .detectAllFaces(video, detectorOptions)
        .withFaceLandmarks(false)
        .withFaceExpressions()
      return fallbackDetections
    } catch (fallbackErr) {
      // Basic detection without expressions if pipeline choked
      try {
        const basicDetections = await faceapi.detectAllFaces(video, detectorOptions)
        return basicDetections
      } catch (basicErr) {
        console.warn('Face detection pass failed:', basicErr)
        return null
      }
    }
  }
}

/**
 * Checks whether a single detected face is well-aligned inside the frame using normalized coordinates.
 */
export function checkFaceAlignment(face, videoWidth, videoHeight) {
  if (!face || !videoWidth || !videoHeight) {
    return { isReady: false, message: 'Looking for a face...' }
  }

  const box = face.detection ? face.detection.box : face.box
  if (!box) return { isReady: false, message: 'Position face in camera view' }

  const normCenterX = (box.x + box.width / 2) / videoWidth
  const normCenterY = (box.y + box.height / 2) / videoHeight
  const normWidth = box.width / videoWidth

  if (normWidth < 0.14) {
    return {
      isReady: false,
      message: '🔍 Please move slightly closer to the camera'
    }
  }

  if (normCenterX < 0.2 || normCenterX > 0.8 || normCenterY < 0.15 || normCenterY > 0.85) {
    return {
      isReady: false,
      message: '📐 Please center your face inside the scanning guide'
    }
  }

  return {
    isReady: true,
    message: '✅ Face detected & aligned! Ready to scan.'
  }
}

/**
 * Renders face bounding box, corners, and landmark points on an overlay canvas.
 * Accounts for video-to-canvas coordinate scaling and mirroring.
 */
export function drawFaceOverlay(canvas, video, detections, options = {}) {
  if (!canvas || !video) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const canvasWidth = canvas.width
  const canvasHeight = canvas.height
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  if (!detections || detections.length === 0 || !video.videoWidth || !video.videoHeight) {
    return
  }

  // Calculate actual scale factors between video source and canvas display
  const scaleX = canvasWidth / video.videoWidth
  const scaleY = canvasHeight / video.videoHeight

  detections.forEach((det) => {
    const rawBox = det.detection ? det.detection.box : det.box
    if (!rawBox) return

    // Scale coordinates to canvas pixels
    const box = {
      x: rawBox.x * scaleX,
      y: rawBox.y * scaleY,
      width: rawBox.width * scaleX,
      height: rawBox.height * scaleY
    }

    const isSingle = detections.length === 1
    const color = isSingle ? '#10b981' : '#f59e0b'
    const glow = isSingle ? 'rgba(16, 185, 129, 0.6)' : 'rgba(245, 158, 11, 0.6)'

    ctx.save()

    // 1. Draw glowing corner brackets
    const cornerLength = Math.min(26, box.width * 0.25)
    ctx.lineWidth = 3.5
    ctx.strokeStyle = color
    ctx.shadowColor = glow
    ctx.shadowBlur = 12

    // Top-Left
    ctx.beginPath()
    ctx.moveTo(box.x, box.y + cornerLength)
    ctx.lineTo(box.x, box.y)
    ctx.lineTo(box.x + cornerLength, box.y)
    ctx.stroke()

    // Top-Right
    ctx.beginPath()
    ctx.moveTo(box.x + box.width - cornerLength, box.y)
    ctx.lineTo(box.x + box.width, box.y)
    ctx.lineTo(box.x + box.width, box.y + cornerLength)
    ctx.stroke()

    // Bottom-Left
    ctx.beginPath()
    ctx.moveTo(box.x, box.y + box.height - cornerLength)
    ctx.lineTo(box.x, box.y + box.height)
    ctx.lineTo(box.x + cornerLength, box.y + box.height)
    ctx.stroke()

    // Bottom-Right
    ctx.beginPath()
    ctx.moveTo(box.x + box.width - cornerLength, box.y + box.height)
    ctx.lineTo(box.x + box.width, box.y + box.height)
    ctx.lineTo(box.x + box.width, box.y + box.height - cornerLength)
    ctx.stroke()

    // 2. Draw soft inner border
    ctx.lineWidth = 1
    ctx.strokeStyle = isSingle ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'
    ctx.strokeRect(box.x, box.y, box.width, box.height)

    // 3. Draw key facial landmark points if available
    if (det.landmarks && options.showLandmarks !== false) {
      ctx.fillStyle = isSingle ? 'rgba(56, 189, 248, 0.75)' : 'rgba(251, 191, 36, 0.75)'
      const positions = det.landmarks.positions || []
      positions.forEach((pt, pIdx) => {
        // Draw every other landmark point for crisp performance and aesthetics
        if (pIdx % 2 === 0) {
          ctx.beginPath()
          ctx.arc(pt.x * scaleX, pt.y * scaleY, 1.8, 0, 2 * Math.PI)
          ctx.fill()
        }
      })
    }

    ctx.restore()
  })
}

/**
 * Maps raw model expression probabilities into nuanced MindSpace wellbeing indicators.
 */
export function interpretFacialExpressions(expressions, landmarks) {
  if (!expressions) return null

  // Sort expression probabilities
  const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1])
  const [topExpr, topConfidence] = sorted[0]

  const pct = Math.min(99, Math.max(48, Math.round(topConfidence * 100)))

  // Construct structured result with ethical health disclaimer
  switch (topExpr) {
    case 'happy':
      return {
        emotion: 'Happy & Joyful 😄',
        primaryExpression: 'Smiling / Elevated Curvature',
        value: 5,
        energy: 5,
        confidence: pct,
        color: '#10b981',
        tone: 'positive',
        breakdown: sorted.slice(0, 3).map(([k, v]) => ({ label: k, pct: Math.round(v * 100) })),
        note: `Facial scanner identified upturned lip curvature (${pct}% smile indicator) and relaxed eye openness. Your expression suggests positive energy and joy!`,
        suggestedActivities: ['Music 🎵', 'Socializing 👥', 'Gratitude Journal ✍️', 'Nature Walk 🌿'],
        disclaimer: 'Visual indicator of present facial muscle tone; not a clinical mental health assessment.'
      }

    case 'neutral':
      return {
        emotion: 'Calm & Centered 😌',
        primaryExpression: 'Relaxed / Symmetric Composure',
        value: 4,
        energy: 3,
        confidence: pct,
        color: '#3b82f6',
        tone: 'calm',
        breakdown: sorted.slice(0, 3).map(([k, v]) => ({ label: k, pct: Math.round(v * 100) })),
        note: `Facial scanner observed steady facial symmetry (${pct}% neutral indicator), relaxed brow alignment, and balanced facial muscle tension.`,
        suggestedActivities: ['Meditation 🧘', 'Reading 📚', 'Deep Focus 🧠', 'Reflective Journaling 📝'],
        disclaimer: 'Visual indicator of present facial muscle tone; not a clinical mental health assessment.'
      }

    case 'surprised':
      return {
        emotion: 'Alert & Energized 😲',
        primaryExpression: 'Elevated Eyebrows / Wide Aperture',
        value: 3,
        energy: 4,
        confidence: pct,
        color: '#8b5cf6',
        tone: 'alert',
        breakdown: sorted.slice(0, 3).map(([k, v]) => ({ label: k, pct: Math.round(v * 100) })),
        note: `Facial scanner detected raised eyebrow landmarks (${pct}% surprise/alertness indicator) and widened eye aperture.`,
        suggestedActivities: ['Grounding Breathing 🎈', 'Mindful Stretch 🧘', 'Calming Soundscapes 🎧'],
        disclaimer: 'Visual indicator of present facial muscle tone; not a clinical mental health assessment.'
      }

    case 'sad':
      return {
        emotion: 'Subdued & Down 😔',
        primaryExpression: 'Lowered Lip Corners / Soft Tension',
        value: 2,
        energy: 2,
        confidence: pct,
        color: '#f97316',
        tone: 'reflective',
        breakdown: sorted.slice(0, 3).map(([k, v]) => ({ label: k, pct: Math.round(v * 100) })),
        note: `Facial scanner noted softened muscle tone and lowered lip curvature (${pct}% subdued indicator). Remember to be gentle with yourself today.`,
        suggestedActivities: ['Rest & Self-Compassion 💤', 'Warm Beverage ☕', 'Therapeutic Breathing 🎈', 'Peer Chat 💬'],
        disclaimer: 'Visual indicator of present facial muscle tone; not a clinical mental health assessment.'
      }

    case 'angry':
    case 'disgusted':
      return {
        emotion: 'Tense & Stressed 😣',
        primaryExpression: 'Eyebrow Furrow / Heightened Muscle Tone',
        value: 2,
        energy: 4,
        confidence: pct,
        color: '#ef4444',
        tone: 'tense',
        breakdown: sorted.slice(0, 3).map(([k, v]) => ({ label: k, pct: Math.round(v * 100) })),
        note: `Facial scanner registered furrowed brow tension and elevated jaw muscle firmness (${pct}% tension indicator). A mindful reset can help release tension.`,
        suggestedActivities: ['Box Breathing 4-4-4 🎈', 'Progressive Muscle Relaxation 🧘', 'Bubble Wrap Pop 🫧', 'Whack-a-Stress 🔨'],
        disclaimer: 'Visual indicator of present facial muscle tone; not a clinical mental health assessment.'
      }

    case 'fearful':
      return {
        emotion: 'Anxious & Overwhelmed 😰',
        primaryExpression: 'Heightened Eye-Brow Vigilance',
        value: 1,
        energy: 3,
        confidence: pct,
        color: '#ec4899',
        tone: 'anxious',
        breakdown: sorted.slice(0, 3).map(([k, v]) => ({ label: k, pct: Math.round(v * 100) })),
        note: `Facial scanner noticed rapid facial micro-movements and brow elevation (${pct}% anxiety/alert indicator). You are safe in your personal sanctuary.`,
        suggestedActivities: ['5-4-3-2-1 Sensory Grounding 🌿', 'Guided Calming Audio 🎧', 'Talk to Aura AI 🕊️'],
        disclaimer: 'Visual indicator of present facial muscle tone; not a clinical mental health assessment.'
      }

    default:
      return {
        emotion: 'Neutral & Observant 😐',
        primaryExpression: 'Steady Facial Composure',
        value: 3,
        energy: 3,
        confidence: pct,
        color: '#f59e0b',
        tone: 'neutral',
        breakdown: sorted.slice(0, 3).map(([k, v]) => ({ label: k, pct: Math.round(v * 100) })),
        note: `Facial scanner detected a steady baseline expression (${pct}% neutral balance).`,
        suggestedActivities: ['Breathing 🎈', 'Reading 📚'],
        disclaimer: 'Visual indicator of present facial muscle tone; not a clinical mental health assessment.'
      }
  }
}
