import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  loadFaceDetectionModels,
  detectFacesInVideo,
  drawFaceOverlay,
  evaluateLighting,
  interpretFacialExpressions
} from '../services/faceDetectionService'

export default function FaceEmotionScannerModal({ isOpen, onClose, onApplyResult }) {
  // Modal & Engine States
  const [isModelLoading, setIsModelLoading] = useState(true)
  const [modelError, setModelError] = useState(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState(null)

  // Real-time Detection States
  const [faceCount, setFaceCount] = useState(0)
  const [isFaceAligned, setIsFaceAligned] = useState(false)
  const [lightingStatus, setLightingStatus] = useState({ isPoor: false, isTooBright: false })
  const [statusMessage, setStatusMessage] = useState('Initializing Face Detection AI...')
  const [statusType, setStatusType] = useState('info') // 'info' | 'success' | 'warning' | 'danger'

  // Scanning & Analysis States
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [analysisResult, setAnalysisResult] = useState(null)

  // DOM & Loop References
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const animFrameRef = useRef(null)
  const isLoopRunningRef = useRef(false)
  const currentDetectionsRef = useRef([])
  const isScanningRef = useRef(false)
  const samplesRef = useRef([])

  // Keep ref synchronized with state
  useEffect(() => {
    isScanningRef.current = isScanning
  }, [isScanning])

  // =========================================================================
  // 1. Initialize Face Detection Models on Mount
  // =========================================================================
  useEffect(() => {
    let isMounted = true

    async function initModels() {
      setIsModelLoading(true)
      setModelError(null)
      try {
        await loadFaceDetectionModels('/models')
        if (isMounted) {
          setIsModelLoading(false)
          setStatusMessage('Models ready. Start your camera to begin scanning.')
          setStatusType('info')
          // Auto-start camera on open
          startCamera()
        }
      } catch (err) {
        console.error('Failed to load neural models:', err)
        if (isMounted) {
          setIsModelLoading(false)
          setModelError('Could not load neural face models. Please verify your connection or refresh.')
          setStatusMessage('Neural model initialization failed.')
          setStatusType('danger')
        }
      }
    }

    if (isOpen) {
      initModels()
    } else {
      stopCamera()
    }

    return () => {
      isMounted = false
      stopCamera()
    }
  }, [isOpen])

  // =========================================================================
  // 2. Camera Controls (Start / Stop)
  // =========================================================================
  const startCamera = async () => {
    setCameraError(null)
    setAnalysisResult(null)
    setScanProgress(0)
    setStatusMessage('Requesting camera permission...')
    setStatusType('info')

    try {
      // Release any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }

      // Constraints with graceful fallback
      let stream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: false
        })
      } catch (constraintErr) {
        // Fallback to basic unconstrained video
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        })
      }

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        // Wait for video metadata to play
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().then(resolve).catch(resolve)
          }
        })
      }

      setIsCameraActive(true)
      setStatusMessage('Looking for a human face in the camera frame...')
      setStatusType('info')

      // Start detection loop
      startDetectionLoop()
    } catch (err) {
      console.error('Camera access error:', err)
      setIsCameraActive(false)
      let msg = 'Failed to access camera.'
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera permission denied. Please allow camera access in your browser to use the facial scanner.'
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No camera found on this device. Please connect a webcam.'
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        msg = 'Camera is in use by another application. Please close other camera tabs or apps and retry.'
      } else {
        msg = `Camera error: ${err.message || 'Unable to start camera stream'}`
      }
      setCameraError(msg)
      setStatusMessage(msg)
      setStatusType('danger')
    }
  }

  const stopCamera = () => {
    isLoopRunningRef.current = false
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }

    setIsCameraActive(false)
    setIsScanning(false)
    setFaceCount(0)
    setIsFaceAligned(false)
  }

  // =========================================================================
  // 3. Continuous Real-Time Detection Loop (Throttled for Performance)
  // =========================================================================
  const startDetectionLoop = () => {
    if (isLoopRunningRef.current) return
    isLoopRunningRef.current = true

    let lastDetectTime = 0
    const DETECT_INTERVAL_MS = 140 // ~7 fps detection: smooth, accurate, no device lag

    const loop = async (timestamp) => {
      if (!isLoopRunningRef.current) return

      const video = videoRef.current
      const canvas = canvasRef.current

      if (video && video.readyState >= 2 && canvas) {
        // Sync canvas internal resolution with video element dimensions
        const rect = video.getBoundingClientRect()
        if (canvas.width !== Math.round(rect.width) || canvas.height !== Math.round(rect.height)) {
          canvas.width = Math.round(rect.width)
          canvas.height = Math.round(rect.height)
        }

        // Throttle detection calls to prevent CPU overload
        if (timestamp - lastDetectTime >= DETECT_INTERVAL_MS) {
          lastDetectTime = timestamp

          // Check lighting
          const lighting = evaluateLighting(video)
          setLightingStatus(lighting)

          // Perform real face detection
          const detections = await detectFacesInVideo(video)
          currentDetectionsRef.current = detections || []

          if (!isScanningRef.current) {
            handleDetectionFeedback(detections, lighting, canvas.width, canvas.height)
          } else if (detections && detections.length === 1) {
            // Collect sample during active scanning
            samplesRef.current.push({
              expressions: detections[0].expressions,
              landmarks: detections[0].landmarks
            })
          }
        }

        // Render visual overlay
        drawFaceOverlay(canvas, video, currentDetectionsRef.current, {
          showLandmarks: true
        })
      }

      animFrameRef.current = requestAnimationFrame(loop)
    }

    animFrameRef.current = requestAnimationFrame(loop)
  }

  // Feedback evaluation based on real face detection
  const handleDetectionFeedback = (detections, lighting, canvasWidth, canvasHeight) => {
    if (lighting.isPoor) {
      setStatusMessage('⚠️ Poor lighting detected. Face a light source for better accuracy.')
      setStatusType('warning')
      setIsFaceAligned(false)
      setFaceCount(detections ? detections.length : 0)
      return
    }

    if (!detections || detections.length === 0) {
      setFaceCount(0)
      setIsFaceAligned(false)
      setStatusMessage('👤 No face detected. Please position your face in front of the camera.')
      setStatusType('info')
      return
    }

    setFaceCount(detections.length)

    if (detections.length > 1) {
      setIsFaceAligned(false)
      setStatusMessage(`👥 ${detections.length} faces detected. Please ensure only one person is in view.`)
      setStatusType('warning')
      return
    }

    // Exactly 1 face detected: evaluate positioning
    const face = detections[0]
    const box = face.detection.box
    const faceCenterX = box.x + box.width / 2
    const faceCenterY = box.y + box.height / 2

    const isTooSmall = box.width < canvasWidth * 0.22
    const isTooFarOffCenter =
      Math.abs(faceCenterX - canvasWidth / 2) > canvasWidth * 0.35 ||
      Math.abs(faceCenterY - canvasHeight / 2) > canvasHeight * 0.35

    if (isTooSmall) {
      setIsFaceAligned(false)
      setStatusMessage('🔍 Move slightly closer to the camera for optimal landmark detection.')
      setStatusType('info')
    } else if (isTooFarOffCenter) {
      setIsFaceAligned(false)
      setStatusMessage('📐 Center your face inside the scanning guide.')
      setStatusType('info')
    } else {
      setIsFaceAligned(true)
      setStatusMessage('✅ Face aligned & detected! Ready to scan your expression.')
      setStatusType('success')
    }
  }

  // =========================================================================
  // 4. Multi-Frame Expression Scanning Procedure
  // =========================================================================
  const triggerScan = () => {
    if (isScanning || !isFaceAligned || faceCount !== 1) return

    setIsScanning(true)
    setAnalysisResult(null)
    setScanProgress(0)
    samplesRef.current = []
    setStatusMessage('Scanning facial landmarks & muscle tension...')
    setStatusType('info')

    const SCAN_DURATION_MS = 1600
    const INTERVAL_MS = 50
    const totalSteps = SCAN_DURATION_MS / INTERVAL_MS
    let step = 0

    const scanInterval = setInterval(() => {
      step++
      const progress = Math.min(100, Math.round((step / totalSteps) * 100))
      setScanProgress(progress)

      if (progress === 30) {
        setStatusMessage('Analyzing eye openness, eyebrow elevation & smile curvature...')
      } else if (progress === 70) {
        setStatusMessage('Cross-referencing expression probabilities & stability...')
      }

      if (step >= totalSteps) {
        clearInterval(scanInterval)
        finishScan()
      }
    }, INTERVAL_MS)
  }

  const finishScan = () => {
    setIsScanning(false)
    const samples = samplesRef.current

    if (!samples || samples.length === 0) {
      // Fallback: single detection snapshot if multi-frame was empty
      if (currentDetectionsRef.current && currentDetectionsRef.current.length > 0) {
        const det = currentDetectionsRef.current[0]
        const result = interpretFacialExpressions(det.expressions, det.landmarks)
        setAnalysisResult(result)
        setStatusMessage('🎉 Facial expression analysis complete!')
        setStatusType('success')
        return
      }

      setStatusMessage('Face was lost during scanning. Please hold steady and try again.')
      setStatusType('warning')
      return
    }

    // Average the collected samples to smooth micro-jitters
    const exprSum = {
      neutral: 0,
      happy: 0,
      sad: 0,
      angry: 0,
      fearful: 0,
      disgusted: 0,
      surprised: 0
    }

    samples.forEach((s) => {
      if (s.expressions) {
        Object.entries(s.expressions).forEach(([k, v]) => {
          if (exprSum[k] !== undefined) exprSum[k] += v
        })
      }
    })

    const averagedExpressions = {}
    Object.keys(exprSum).forEach((k) => {
      averagedExpressions[k] = exprSum[k] / samples.length
    })

    // Use latest landmarks
    const lastLandmarks = samples[samples.length - 1]?.landmarks

    const finalResult = interpretFacialExpressions(averagedExpressions, lastLandmarks)
    setAnalysisResult(finalResult)
    setStatusMessage('🎉 Facial expression analysis complete!')
    setStatusType('success')
  }

  // =========================================================================
  // 5. Apply Result to Mood Log & Close
  // =========================================================================
  const handleApply = () => {
    if (analysisResult && onApplyResult) {
      onApplyResult(analysisResult)
    }
    stopCamera()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10, 20, 25, 0.75)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          background: 'var(--surface)',
          color: 'var(--ink)',
          borderRadius: '24px',
          padding: '24px',
          maxWidth: '520px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          border: '1px solid var(--line)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxSizing: 'border-box'
        }}
        className="custom-scrollbar"
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '20px' }}>📷</span>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--ink)' }}>
                AI Facial Emotion Scanner
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--ink-3)', lineHeight: '1.4' }}>
              Real-time facial expression and landmark analysis for mindful reflection.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              stopCamera()
              onClose()
            }}
            aria-label="Close Scanner"
            style={{
              background: 'var(--surface-3)',
              border: 'none',
              color: 'var(--ink-2)',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.2s'
            }}
          >
            ✕
          </button>
        </div>

        {/* Status Chip / Live Feedback Banner */}
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '12px',
            fontSize: '12.5px',
            fontWeight: '600',
            lineHeight: '1.4',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background:
              statusType === 'danger'
                ? 'var(--danger-soft)'
                : statusType === 'warning'
                ? 'var(--warn-soft)'
                : statusType === 'success'
                ? 'var(--success-soft)'
                : 'var(--primary-soft)',
            color:
              statusType === 'danger'
                ? 'var(--danger-ink)'
                : statusType === 'warning'
                ? 'var(--warn-ink)'
                : statusType === 'success'
                ? 'var(--success-ink)'
                : 'var(--primary-ink)',
            border: `1px solid ${
              statusType === 'danger'
                ? 'var(--danger)'
                : statusType === 'warning'
                ? 'var(--warn)'
                : statusType === 'success'
                ? 'var(--success)'
                : 'var(--primary)'
            }`
          }}
        >
          <span>{statusMessage}</span>
        </div>

        {/* Camera Viewport Container */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '4 / 3',
            maxHeight: '320px',
            background: '#090d16',
            borderRadius: '18px',
            overflow: 'hidden',
            border: `2px solid ${isFaceAligned ? 'var(--success)' : isScanning ? 'var(--primary)' : 'var(--line-strong)'}`,
            boxShadow: isFaceAligned
              ? '0 0 20px color-mix(in srgb, var(--success) 35%, transparent)'
              : '0 4px 20px rgba(0,0,0,0.15)',
            transition: 'border-color 0.3s, box-shadow 0.3s'
          }}
        >
          {/* Live Video Preview (Mirrored for natural user feel) */}
          <video
            ref={videoRef}
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)',
              display: isCameraActive ? 'block' : 'none'
            }}
          />

          {/* Real-time Landmark & Bounding Box Overlay Canvas (Mirrored to align with video) */}
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              transform: 'scaleX(-1)',
              display: isCameraActive ? 'block' : 'none'
            }}
          />

          {/* Fallback Display When Camera Is Off or Error */}
          {!isCameraActive && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                textAlign: 'center',
                color: '#cbd5e1'
              }}
            >
              {isModelLoading ? (
                <>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      border: '3px solid rgba(255,255,255,0.2)',
                      borderTopColor: 'var(--primary)',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      marginBottom: '12px'
                    }}
                  />
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>Loading AI Vision Models...</p>
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#94a3b8' }}>
                    Preparing real-time face landmark & expression detectors
                  </p>
                </>
              ) : cameraError ? (
                <>
                  <span style={{ fontSize: '32px', marginBottom: '8px' }}>⚠️</span>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#f87171' }}>Camera Error</p>
                  <p style={{ margin: '4px 0 14px', fontSize: '11.5px', color: '#cbd5e1', maxWidth: '300px' }}>
                    {cameraError}
                  </p>
                  <button
                    type="button"
                    onClick={startCamera}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '10px',
                      background: 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      fontWeight: '700',
                      fontSize: '12.5px',
                      cursor: 'pointer'
                    }}
                  >
                    🔄 Retry Camera Access
                  </button>
                </>
              ) : (
                <>
                  <span style={{ fontSize: '36px', marginBottom: '8px' }}>📷</span>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>Camera is currently stopped</p>
                  <p style={{ margin: '4px 0 14px', fontSize: '11.5px', color: '#94a3b8' }}>
                    Click below to start live preview and face detection
                  </p>
                  <button
                    type="button"
                    onClick={startCamera}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '10px',
                      background: 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      fontWeight: '700',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    ▶️ Start Camera
                  </button>
                </>
              )}
            </div>
          )}

          {/* Face Reticle / Guide Overlay */}
          {isCameraActive && !isScanning && (
            <div
              style={{
                position: 'absolute',
                top: '12%',
                left: '20%',
                right: '20%',
                bottom: '12%',
                border: `2px dashed ${isFaceAligned ? 'rgba(16, 185, 129, 0.7)' : 'rgba(255, 255, 255, 0.35)'}`,
                borderRadius: '50%',
                pointerEvents: 'none',
                transition: 'border-color 0.3s ease'
              }}
            />
          )}

          {/* Active Scanning Laser Line */}
          {isScanning && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, transparent, #38bdf8, #818cf8, transparent)',
                boxShadow: '0 0 16px #38bdf8',
                animation: 'scanLaser 1.5s infinite ease-in-out',
                pointerEvents: 'none'
              }}
            />
          )}

          {/* Face Detection Indicator Badge in top corner */}
          {isCameraActive && (
            <div
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                padding: '4px 8px',
                borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(4px)',
                color: faceCount === 1 ? '#34d399' : faceCount > 1 ? '#fbbf24' : '#94a3b8',
                fontSize: '11px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: faceCount === 1 ? '#34d399' : faceCount > 1 ? '#fbbf24' : '#94a3b8'
                }}
              />
              {faceCount === 1
                ? 'Face Locked'
                : faceCount > 1
                ? `${faceCount} Faces Detected`
                : 'Searching...'}
            </div>
          )}
        </div>

        {/* Scanning Progress Bar */}
        {isScanning && (
          <div style={{ width: '100%', background: 'var(--surface-3)', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${scanProgress}%`,
                background: 'linear-gradient(90deg, var(--primary), var(--sky))',
                height: '100%',
                transition: 'width 0.1s linear'
              }}
            />
          </div>
        )}

        {/* Analysis Results Display */}
        {analysisResult && (
          <div
            style={{
              background: 'var(--surface-2)',
              border: `1.5px solid ${analysisResult.color}`,
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Observed Expression Indicator
                </span>
                <h4 style={{ margin: '2px 0 0', fontSize: '16px', fontWeight: '800', color: analysisResult.color }}>
                  {analysisResult.emotion}
                </h4>
              </div>
              <span
                style={{
                  fontSize: '12px',
                  background: analysisResult.color,
                  color: '#ffffff',
                  padding: '4px 10px',
                  borderRadius: '10px',
                  fontWeight: '800'
                }}
              >
                {analysisResult.confidence}% Expression Match
              </span>
            </div>

            <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--ink-2)', lineHeight: '1.45' }}>
              {analysisResult.note}
            </p>

            {/* Expression Probability Breakdown */}
            {analysisResult.breakdown && analysisResult.breakdown.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
                {analysisResult.breakdown.map((item, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '11px',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: 'var(--surface)',
                      border: '1px solid var(--line)',
                      color: 'var(--ink-3)',
                      fontWeight: '600'
                    }}
                  >
                    {item.label}: {item.pct}%
                  </span>
                ))}
              </div>
            )}

            {/* Suggested Mindful Activities */}
            {analysisResult.suggestedActivities && (
              <div style={{ marginTop: '4px' }}>
                <span style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--ink-3)' }}>
                  Recommended Coping Suggestions:
                </span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                  {analysisResult.suggestedActivities.map((act, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '11.5px',
                        padding: '4px 8px',
                        borderRadius: '8px',
                        background: 'var(--primary-soft)',
                        color: 'var(--primary-ink)',
                        fontWeight: '700'
                      }}
                    >
                      {act}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Ethical / Clinical Disclaimer as explicitly requested */}
            <div
              style={{
                marginTop: '6px',
                paddingTop: '8px',
                borderTop: '1px dashed var(--line)',
                fontSize: '11px',
                color: 'var(--ink-4)',
                fontStyle: 'italic',
                lineHeight: '1.35'
              }}
            >
              ⚠️ <strong>Disclaimer:</strong> Facial expressions are external visual indicators of momentary facial muscle tone and posture. They serve as supportive prompts for self-awareness, not clinical evaluations or mental health diagnoses.
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
          {isCameraActive ? (
            <button
              type="button"
              onClick={stopCamera}
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'var(--surface-3)',
                color: 'var(--ink-2)',
                border: '1px solid var(--line)',
                fontWeight: '700',
                fontSize: '13.5px',
                cursor: 'pointer',
                touchAction: 'manipulation'
              }}
            >
              ⏹️ Stop Camera
            </button>
          ) : (
            <button
              type="button"
              onClick={startCamera}
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'var(--surface-3)',
                color: 'var(--ink-2)',
                border: '1px solid var(--line)',
                fontWeight: '700',
                fontSize: '13.5px',
                cursor: 'pointer',
                touchAction: 'manipulation'
              }}
            >
              ▶️ Start Camera
            </button>
          )}

          {!analysisResult ? (
            <button
              type="button"
              onClick={triggerScan}
              disabled={!isCameraActive || isScanning || !isFaceAligned || faceCount !== 1}
              style={{
                flex: 1,
                minWidth: '150px',
                height: '46px',
                borderRadius: '12px',
                background:
                  !isCameraActive || isScanning || !isFaceAligned || faceCount !== 1
                    ? 'var(--surface-3)'
                    : 'linear-gradient(135deg, var(--primary-fill), var(--primary-fill))',
                color:
                  !isCameraActive || isScanning || !isFaceAligned || faceCount !== 1
                    ? 'var(--ink-4)'
                    : '#ffffff',
                border: 'none',
                fontWeight: '800',
                fontSize: '14px',
                cursor:
                  !isCameraActive || isScanning || !isFaceAligned || faceCount !== 1
                    ? 'not-allowed'
                    : 'pointer',
                boxShadow:
                  !isCameraActive || isScanning || !isFaceAligned || faceCount !== 1
                    ? 'none'
                    : '0 4px 14px color-mix(in srgb, var(--primary) 35%, transparent)',
                touchAction: 'manipulation',
                transition: 'all 0.2s'
              }}
            >
              {isScanning ? '🔍 Scanning Features...' : '📸 Scan Face'}
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '220px' }}>
              <button
                type="button"
                onClick={() => {
                  setAnalysisResult(null)
                  setScanProgress(0)
                  setStatusMessage('Align your face to scan again.')
                  setStatusType('info')
                  if (!isCameraActive) startCamera()
                }}
                style={{
                  flex: 1,
                  height: '46px',
                  borderRadius: '12px',
                  background: 'var(--surface-3)',
                  color: 'var(--ink-2)',
                  border: '1px solid var(--line)',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                🔄 Rescan
              </button>

              <button
                type="button"
                onClick={handleApply}
                style={{
                  flex: 2,
                  height: '46px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, var(--success-fill), var(--success-fill))',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: '800',
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px color-mix(in srgb, var(--success) 35%, transparent)'
                }}
              >
                ✨ Apply to Wellbeing Log
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
