import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import recycleData from '../data/recycleData.json'
import RecycleSymbol from '../components/RecycleSymbol'

// 모든 아이템을 평탄화
function getAllItems() {
  return recycleData.flatMap((group) => group.items)
}

function Result() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const idsParam = searchParams.get('ids') || ''
  const ids = idsParam.split(',').filter(Boolean)
  const allItems = getAllItems()
  const selectedItems = ids.map((id) => allItems.find((item) => item.id === id)).filter(Boolean)

  if (selectedItems.length === 0) {
    return (
      <div className="result">
        <div className="not-found">
          <h2>선택된 마크가 없어요</h2>
          <Link to="/select" className="action-btn">
            기호 선택으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="result">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ←
        </button>
        <h2>분리수거 방법</h2>
      </div>

      {/* 선택된 마크 요약 */}
      <div className="selected-marks">
        <h3>선택된 마크 {selectedItems.length}개</h3>
        <div className="marks-row">
          {selectedItems.map((item) => (
            <div className="mark-chip" key={item.id}>
              <RecycleSymbol
                label={item.markLabel}
                sublabel={item.markSublabel}
                color={item.markColor}
                size={36}
              />
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 각 마크별 분리수거 방법 */}
      {selectedItems.map((item) => (
        <div className="result-card" key={item.id}>
          <div className="result-card-header">
            <RecycleSymbol
              label={item.markLabel}
              sublabel={item.markSublabel}
              color={item.markColor}
              size={48}
            />
            <div className="result-info">
              <h3>{item.name}</h3>
              <span className="result-symbol">{item.symbol}</span>
            </div>
          </div>

          <div className="result-card-body">
            <div className="result-subsection">
              <h4>📋 이렇게 버려주세요</h4>
              <ol className="step-list">
                {item.steps.map((step, i) => (
                  <li className="step-item" key={i}>
                    <span className="step-number">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="result-subsection">
              <h4>⚠️ 주의</h4>
              <ul className="warning-list">
                {item.warnings.map((w, i) => (
                  <li className="warning-item" key={i}>{w}</li>
                ))}
              </ul>
            </div>

            <div className="result-subsection">
              <h4>📌 해당 제품</h4>
              <div className="example-tags">
                {item.examples.map((ex, i) => (
                  <span className="example-tag" key={i}>{ex}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* 공통 팁 */}
      <div className="result-section common-tips">
        <h3>💡 분리수거 공통 팁</h3>
        <ul className="tip-list">
          <li>내용물은 반드시 비우고 헹궈주세요</li>
          <li>라벨과 뚜껑은 재질별로 분리해주세요</li>
          <li>오염이 심해 세척이 안 되면 일반쓰레기로 배출하세요</li>
          <li>재질이 다른 부분은 각각 분리해서 배출하세요</li>
        </ul>
      </div>

      <div className="result-actions">
        <Link to="/select" className="action-btn">
          다른 기호 확인하기
        </Link>
      </div>
    </div>
  )
}

export default Result
