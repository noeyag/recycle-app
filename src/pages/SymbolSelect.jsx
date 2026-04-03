import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import recycleData from '../data/recycleData.json'
import RecycleSymbol from '../components/RecycleSymbol'

function SymbolSelect() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState([])
  const [openCategories, setOpenCategories] = useState({})

  function toggleSelect(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  function toggleCategory(category) {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  function goToResult() {
    if (selected.length === 0) return
    navigate(`/result?ids=${selected.join(',')}`)
  }

  // 카테고리에 아이템이 많으면(3개 이상) 접기/펼치기 지원
  function shouldCollapse(items) {
    return items.length > 3
  }

  return (
    <div className="symbol-select">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ←
        </button>
        <h2>재활용 기호 선택</h2>
      </div>

      <p className="select-hint">
        제품에 표시된 마크를 모두 선택하세요 (복수 선택 가능)
      </p>

      {recycleData.map((group) => {
        const isCollapsible = shouldCollapse(group.items)
        const isOpen = openCategories[group.category] !== false // 기본 열림

        return (
          <div className="category-section" key={group.category}>
            <button
              className={`category-header ${isCollapsible ? 'collapsible' : ''}`}
              onClick={() => isCollapsible && toggleCategory(group.category)}
            >
              <span className="category-name">{group.category}</span>
              <span className="category-count">{group.items.length}종</span>
              {isCollapsible && (
                <span className={`category-arrow ${isOpen ? 'open' : ''}`}>▼</span>
              )}
            </button>

            {(!isCollapsible || isOpen) && (
              <div className="symbol-grid">
                {group.items.map((item) => {
                  const isSelected = selected.includes(item.id)
                  return (
                    <button
                      className={`symbol-card ${isSelected ? 'selected' : ''}`}
                      key={item.id}
                      onClick={() => toggleSelect(item.id)}
                    >
                      {isSelected && <span className="check-badge">✓</span>}
                      <RecycleSymbol
                        label={item.markLabel}
                        sublabel={item.markSublabel}
                        color={item.markColor}
                        size={60}
                      />
                      <span className="card-name">{item.name}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {/* 하단 고정 버튼 */}
      {selected.length > 0 && (
        <div className="floating-bar">
          <button className="floating-btn" onClick={goToResult}>
            {selected.length}개 선택 — 분리수거 방법 보기
          </button>
        </div>
      )}

      {/* 하단 고정 버튼 공간 확보 */}
      {selected.length > 0 && <div style={{ height: 80 }} />}
    </div>
  )
}

export default SymbolSelect
