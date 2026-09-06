import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { utilisateur, chargement } = useAuth()

  if (chargement) {
    return <div className="flex h-screen items-center justify-center text-slate-500">Chargement…</div>
  }

  if (!utilisateur) {
    return <Navigate to="/connexion" replace />
  }

  return <>{children}</>
}
