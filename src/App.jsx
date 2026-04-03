import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import SymbolSelect from './pages/SymbolSelect'
import Result from './pages/Result'
import CameraRecognition from './pages/CameraRecognition'
import './App.css'

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/select" element={<SymbolSelect />} />
        <Route path="/camera" element={<CameraRecognition />} />
        <Route path="/result" element={<Result />} />
      </Routes>
    </div>
  )
}

export default App
