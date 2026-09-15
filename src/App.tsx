import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { GrantsPage } from './pages/GrantsPage'
import { ProfilePage } from './pages/ProfilePage'
import { MatchesPage } from './pages/MatchesPage'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/grants" replace />} />
        <Route path="/grants" element={<GrantsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/matches" element={<MatchesPage />} />
      </Route>
    </Routes>
  )
}

export default App
