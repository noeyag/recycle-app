import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="home">
      <div className="home-icon">♻️</div>
      <h1>재활용을 부탁해</h1>
      <p className="subtitle">
        제품 라벨의 재활용 기호를 확인하고<br />
        올바른 분리수거 방법을 알아보세요
      </p>

      <div className="home-buttons">
        <Link to="/select" className="home-btn primary">
          <span className="btn-icon">🔍</span>
          <span className="btn-text">
            <span className="btn-label">기호 선택하기</span>
            <span className="btn-desc">재활용 기호를 직접 선택해요</span>
          </span>
        </Link>

        <Link to="/camera" className="home-btn secondary">
          <span className="btn-icon">📷</span>
          <span className="btn-text">
            <span className="btn-label">카메라로 인식하기</span>
            <span className="btn-desc">라벨을 촬영해서 자동 인식해요</span>
          </span>
        </Link>
      </div>
    </div>
  )
}

export default Home
