import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { RequireAuth } from './auth/RequireAuth'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { AnneesScolairesPage } from './pages/AnneesScolairesPage'
import { ClassesPage } from './pages/ClassesPage'
import { ElevesPage } from './pages/ElevesPage'
import { BulletinsPage } from './pages/BulletinsPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/connexion" element={<LoginPage />} />
          <Route
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="/eleves" replace />} />
            <Route path="/annees-scolaires" element={<AnneesScolairesPage />} />
            <Route path="/classes" element={<ClassesPage />} />
            <Route path="/eleves" element={<ElevesPage />} />
            <Route path="/bulletins" element={<BulletinsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
