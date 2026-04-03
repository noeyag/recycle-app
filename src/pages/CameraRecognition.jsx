import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as tmImage from '@teachablemachine/image'
import RecycleSymbol from '../components/RecycleSymbol'

// Teachable Machine 모델 URL (학습 후 여기에 붙여넣기)
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
  const webcamRef = useRef(null)
  const modelRef = useRef(null)
  const animFrameRef = useRef(null)
  const [error, setError] = useState(null)
  const [modelLoaded, setModelLoaded] = useState(false)
  const [modelError, setModelError] = useState(false)
  const [predictions, setPredictions] = useState([])

  useEffect(() => {
    if (MODEL_URL) {
      initModel()
    } else {
      startBasicCamera()
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      if (webcamRef.current) webcamRef.current.stop()
      stopBasicCamera()
    }
  }, [])

  async function startBasicCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      setError('카메라에 접근할 수 없습니다. 카메라 권한을 허용해주세요.')
    }
  }

  function stopBasicCamera() {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop())
    }
  }

  async function initModel() {
    try {
      const modelURL = MODEL_URL + 'model.json'
      const metadataURL = MODEL_URL + 'metadata.json'
      modelRef.current = await tmImage.load(modelURL, metadataURL)

      const flip = true
      webcamRef.current = new tmImage.Webcam(300, 300, flip)
      await webcamRef.current.setup({ facingMode: 'environment' })
      await webcamRef.current.play()

      if (videoRef.current) {
        videoRef.current.replaceWith(webcamRef.current.canvas)
      }

      setModelLoaded(true)
      predict()
    } catch (err) {
      console.error('모델 로드 실패:', err)
      setModelError(true)
      startBasicCamera()
    }
  }

  async function predict() {
    if (!modelRef.current || !webcamRef.current) return

    webcamRef.current.update()
    const results = await modelRef.current.predict(webcamRef.current.canvas)

    const filtered = results
      .filter((r) => r.probability > 0.5)
      .sort((a, b) => b.probability - a.probability)

    setPredictions(filtered)
    animFrameRef.current = requestAnimationFrame(predict)
  }

  function handleResultClick(className) {
    const mapped = CLASS_MAP[className]
    if (mapped) {
      navigate(`/result?ids=${mapped.id}`)
    }
  }

  const noModel = !MODEL_URL

  return (
    <div className="camera">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ←
        </button>
        <h2>카메라 인식</h2>
      </div>

      <div className="camera-container">
        {error ? (
          <div className="camera-placeholder">
            <span>📷</span>
            <p>{error}</p>
          </div>
        ) : (
          <video ref={videoRef} autoPlay playsInline />
        )}
      </div>

      {/* 모델 로드 상태 */}
      {!noModel && !modelLoaded && !modelError && (
        <div className="camera-notice">
          <p><strong>모델 로딩 중...</strong><br />잠시만 기다려주세요.</p>
        </div>
      )}

      {modelError && (
        <div className="camera-notice" style={{ background: '#fef2f2' }}>
          <p><strong>모델 로드에 실패했습니다.</strong><br />모델 URL을 확인해주세요.</p>
        </div>
      )}

      {/* 인식 결과 */}
      {modelLoaded && predictions.length > 0 && (
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

      {modelLoaded && predictions.length === 0 && (
        <div className="camera-notice">
          <p>카메라에 재활용 마크를 비춰주세요</p>
        </div>
      )}

      {/* 모델 미설정 시 안내 */}
      {noModel && (
        <>
          <div className="camera-notice">
            <p>
              <strong>Teachable Machine 모델이 아직 연결되지 않았어요.</strong><br />
              모델을 학습시킨 후 URL을 입력하면<br />
              카메라로 재활용 마크를 자동 인식할 수 있어요.
            </p>
          </div>
          <div className="camera-result">
            <h3>지금은 직접 선택할 수 있어요</h3>
            <Link to="/select" className="camera-select-link">
              기호 선택 화면으로 이동 →
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

export default CameraRecognition
