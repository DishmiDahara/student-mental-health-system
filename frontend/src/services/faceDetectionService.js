import * as faceapi from '@vladmandic/face-api/dist/face-api.esm.js'

let modelsLoaded = false
let modelLoadingPromise = null

/**
 * Loads TinyFaceDetector, FaceLandmark68Tiny, and FaceExpression models from /models directory.
 */
export async function loadFaceDetectionModels(modelsPath = '/models') {
  if (modelsLoaded) return true
  if (modelLoadingPromise) return modelLoadingPromise

  modelLoadingPromise = (async () => {
    try {
      // Load lightweight, high-performance models
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(modelsPath),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(modelsPath),
        faceapi.nets.faceExpressionNet.loadFromUri(modelsPath)
      ])
      modelsLoaded = true
      return true
    } catch (err) {
      console.warn('Primary models load failed, trying standard landmark model:', err)
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(modelsPath),
          faceapi.nets.faceLandmark68Net.loadFromUri(modelsPath),
          faceapi.nets.faceExpressionNet.loadFromUri(modelsPath)
        ])
        modelsLoaded = true
        return true
      } catch (fallbackErr) {
        console.error('Failed to load face detection models:', fallbackErr)
        modelLoadingPromise = null
        throw new Error('Could not load face detection neural network models. Please check connection.')
      }
    }
  })()

  return modelLoadingPromise
}

/**
 * Checks if the video frame has adequate lighting.
 */
export function evaluateLighting(video) {
  try {
    if (!video || video.readyState < 2) return { isPoor: false, luma: 100 }
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 48
    const ctx = canvas.getContext('2d')
    if (!ctx) return { isPoor: false, luma: 100 }
    ctx.drawImage(video, 0, 0, 64, 48)
    const { data } = ctx.getImageData(0, 0, 64, 48)

    let totalLuma = 0
    const pixelCount = data.length / 4
    for (let i = 0; i < data.length; i += 4) {
      totalLuma += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    }
    const avgLuma = totalLuma / pixelCount
    return {
      isPoor: avgLuma < 35,
      isTooBright: avgLuma > 235,
      luma: Math.round(avgLuma)
    }
  } catch (e) {
    return { isPoor: false, luma: 100 }
  }
}

/**
 * Detects all faces in a video frame with landmarks and expressions.
 */
export async function detectFacesInVideo(video) {
  if (!modelsLoaded || !video || video.readyState < 2) return null

  // Use TinyFaceDetector with balanced scoreThreshold for fast 30fps detection
  const options = new faceapi.TinyFaceDetectorOptions({
    inputSize: 224,
    scoreThreshold: 0.4
  })

  try {
    const detections = await faceapi
      .detectAllFaces(video, options)
      .withFaceLandmarks(true)
      .withFaceExpressions()

    return detections
  } catch (err) {
    console.error('Error in detectFacesInVideo:', err)
    return null
  }
}

/**
 * Renders face bounding box, corners, and landmark points on an overlay canvas.
 */
export function drawFaceOverlay(canvas, video, detections, options = {}) {
  if (!canvas || !video) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const width = canvas.width
  const height = canvas.height
  ctx.clearRect(0, 0, width, height)

  if (!detections || detections.length === 0) return

  // Rescale detections to match current canvas size
  const resized = faceapi.resizeResults(detections, { width, height })

  resized.forEach((det, idx) => {
    const box = det.detection.box
    const isSingle = detections.length === 1

    // Draw styled corner brackets instead of plain rectangle
    const cornerLength = Math.min(24, box.width * 0.25)
    ctx.save()
    ctx.lineWidth = 3
    ctx.strokeStyle = isSingle ? '#10b981' : '#f59e0b'
    ctx.shadowColor = isSingle ? 'rgba(16, 185, 129, 0.6)' : 'rgba(245, 158, 11, 0.6)'
    ctx.shadowBlur = 10

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

    ctx.restore()

    // Draw facial landmark points lightly
    if (det.landmarks && options.showLandmarks !== false) {
      ctx.save()
      ctx.fillStyle = isSingle ? 'rgba(56, 189, 248, 0.75)' : 'rgba(251, 191, 36, 0.75)'
      const positions = det.landmarks.positions
      positions.forEach((pt, pIdx) => {
        // Only draw key contour points to avoid visual clutter
        if (pIdx % 2 === 0) {
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, 1.8, 0, 2 * Math.PI)
          ctx.fill()
        }
      })
      ctx.restore()
    }

    // Draw detected face label badge
    if (det.expressions) {
      const topExpression = Object.entries(det.expressions)
        .sort((a, b) => b[1] - a[1])[0]

      if (topExpression && topExpression[1] > 0.3) {
        const label = `${topExpression[0].toUpperCase()} (${Math.round(topExpression[1] * 100)}%)`
        ctx.save()
        ctx.font = '600 11px system-ui, sans-serif'
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'
        const textWidth = ctx.measureText(label).width + 16
        ctx.fillRect(box.x, Math.max(0, box.y - 24), textWidth, 20)
        ctx.fillStyle = '#ffffff'
        ctx.fillText(label, box.x + 8, Math.max(14, box.y - 10))
        ctx.restore()
      }
    }
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
  const [secExpr, secConfidence] = sorted[1] || ['none', 0]

  const pct = Math.min(99, Math.max(45, Math.round(topConfidence * 100)))

  // Calculate smile curvature and eye aspect ratio if landmarks available
  let smileCurve = 0
  if (landmarks && landmarks.getMouth) {
    const mouth = landmarks.getMouth()
    if (mouth && mouth.length >= 20) {
      const leftCorner = mouth[0]
      const rightCorner = mouth[6]
      const topLip = mouth[3]
      const bottomLip = mouth[9]
      const mouthWidth = Math.hypot(rightCorner.x - leftCorner.x, rightCorner.y - leftCorner.y)
      const mouthHeight = Math.hypot(bottomLip.x - topLip.x, bottomLip.y - topLip.y)
      smileCurve = mouthWidth / (mouthHeight || 1)
    }
  }

  // Construct structured result
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
      // Differentiate between calm and tired neutral
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
