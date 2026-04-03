import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import RecycleSymbol from '../components/RecycleSymbol'

// Teachable Machine 모델 URL
const MODEL_URL = 'https://teachablemachine.withgoogle.com/models/Som4DE2Pf/'

// 클래스명 → recycleData id 매핑
const CLASS_MAP = {
  'PET': { id: 'pet', name: '페트', markLabel: 'PET', markColor: '#F9A825' },
  'plastic': { id: 'plastic-hdpe', name: '플라스틱', markLabel: '플라스틱', markColor: '#1565C0' },
  'vinyl': { id: 'vinyl-ldpe', name: '비닐류', markLabel: '비닐류', markColor: '#7B1FA2' },
  'can': { id: 'can-steel', name: '캔류', markLabel: '캔류', markColor: '#424242' },
  'paper-pack': { id: 'paper-pack', name: '종이팩', markLabel: '종이팩', markColor: '#00838F' },
  'glass': { id: 'glass', name: '유리', markLabel: '유리', markColor: '#43A047' },
  'paper': { id: 'paper', name: '종이', markLabel: '종이', markColor: '#2E7D32' },
}

function CameraRecognition() {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const modelRef = useRef(null)
  const animFrameRef = useRef(null)
  const [status, setStatus] = useState('loading') // loading, ready, error
  const [predictions, setPredictions] = useState([])

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        // 1. 카메라 먼저 시작
        setStatus('loading')
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: 300, height: 300 }
        })

        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }

        // 2. 모델 로드 (동적 import로 TF.js 지연 로드)
        const tmImage = await import('@teachablemachine/image')
        const modelURL = MODEL_URL + 'model.json'
        const metadataURL = MODEL_URL + 'metadata.json'
        modelRef.current = await tmImage.load(modelURL, metadataURL)

        if (cancelled) return

        setStatus('ready')

        // 3. 예측 시작
        function predict() {
          if (cancelled || !modelRef.current || !videoRef.current) return

          // canvas에 비디오 프레임 그리기
          const canvas = canvasRef.current
          const video = videoRef.current
          if (canvas && video.readyState >= 2) {
            canvas.width = 224
            canvas.height = 224
            const ctx = canvas.getContext('2d')
            ctx.drawImage(video, 0, 0, 224, 224)

            modelRef.current.predict(canvas).then((results) => {
              if (cancelled) return
              const filtered = results
                .filter((r) => r.probability > 0.5)
                .sort((a, b) => b.probability - a.probability)
              setPredictions(filtered)
            })
          }

          animFrameRef.current = requestAnimationFrame(predict)
        }

        predict()
      } catch (err) {
        console.error('초기화 실패:', err)
        if (!cancelled) setStatus('error')
      }
    }

    init()

    return () => {
      cancelled = true
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop())
      }
    }
  }, [])

  function handleResultClick(className) {
    const mapped = CLASS_MAP[className]
    if (mapped) {
      navigate(`/result?ids=${mapped.id}`)
    }
  }

  return (
    <div className="camera">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ←
        </button>
        <h2>카메라 인식</h2>
      </div>

      <div className="camera-container">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ display: status === 'error' ? 'none' : 'block' }}
        />
        {status === 'error' && (
          <div className="camera-placeholder">
            <span>📷</span>
            <p>카메라 또는 모델 로드에 실패했습니다.</p>
          </div>
        )}
      </div>

      {/* 숨겨진 canvas (모델 입력용) */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* 상태 표시 */}
      {status === 'loading' && (
        <div className="camera-notice">
          <p><strong>AI 모델 로딩 중...</strong><br />처음에는 10~20초 정도 걸릴 수 있어요.</p>
        </div>
      )}

      {/* 인식 결과 */}
      {status === 'ready' && predictions.length > 0 && (
        <div className="camera-result">
          <h3>인식 결과</h3>
          {predictions.map((pred) => {
            const mapped = CLASS_MAP[pred.className]
            if (!mapped) return null
            return (
              <button
                className="camera-result-item"
                key={pred.className}
                onClick={() => handleResultClick(pred.className)}
              >
                <span className="camera-result-name">
                  <RecycleSymbol
                    label={mapped.markLabel}
                    color={mapped.markColor}
                    size={32}
                  />
                  {mapped.name}
                </span>
                <span className="camera-confidence">
                  {Math.round(pred.probability * 100)}%
                </span>
              </button>
            )
          })}
        </div>
      )}

      {status === 'ready' && predictions.length === 0 && (
        <div className="camera-notice">
          <p>재활용 마크를 카메라에 비춰주세요</p>
        </div>
      )}

      {status === 'error' && (
        <div className="camera-result">
          <h3>직접 선택할 수 있어요</h3>
          <Link to="/select" className="camera-select-link">
            기호 선택 화면으로 이동 →
          </Link>
        </div>
      )}
    </div>
  )
}

export default CameraRecognition
