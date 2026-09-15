import { Navigate, Route, Routes } from 'react-router-dom'
import { GrantsPage } from './pages/GrantsPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/grants" replace />} />
      <Route path="/grants" element={<GrantsPage />} />
    </Routes>
  )
}

export default App
