import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { RequireAuth } from './auth/RequireAuth'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { AnneesScolairesPage } from './pages/AnneesScolairesPage'
import { ClassesPage } from './pages/ClassesPage'
import { ElevesPage } from './pages/ElevesPage'
import { NotesPage } from './pages/NotesPage'
import { BulletinsPage } from './pages/BulletinsPage'
import { FinancesPage } from './pages/FinancesPage'
import { UtilisateursPage } from './pages/UtilisateursPage'
import { EmploiDuTempsPage } from './pages/EmploiDuTempsPage'
import { AnnoncesPage } from './pages/AnnoncesPage'
import { StatistiquesPage } from './pages/StatistiquesPage'

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
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/bulletins" element={<BulletinsPage />} />
            <Route path="/finances" element={<FinancesPage />} />
            <Route path="/comptes" element={<UtilisateursPage />} />
            <Route path="/emploi-du-temps" element={<EmploiDuTempsPage />} />
            <Route path="/annonces" element={<AnnoncesPage />} />
            <Route path="/statistiques" element={<StatistiquesPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
