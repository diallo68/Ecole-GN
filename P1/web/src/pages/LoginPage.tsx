import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { ApiError } from '../lib/api'

export function LoginPage() {
  const { connecte, utilisateur, chargement } = useAuth()
  const navigate = useNavigate()
  const [identifiant, setIdentifiant] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)
  const [envoiEnCours, setEnvoiEnCours] = useState(false)

  if (!chargement && utilisateur) {
    return <Navigate to="/" replace />
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setErreur(null)
    setEnvoiEnCours(true)
    try {
      await connecte(identifiant, motDePasse)
      navigate('/')
    } catch (err) {
      setErreur(err instanceof ApiError ? err.message : 'Connexion impossible. Réessayez.')
    } finally {
      setEnvoiEnCours(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-xl font-semibold text-slate-900">Plateforme scolaire</h1>
        <p className="mb-6 text-sm text-slate-500">Connectez-vous avec votre téléphone ou votre email.</p>

        <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          {erreur && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>
          )}

          <div>
            <label htmlFor="identifiant" className="mb-1 block text-sm font-medium text-slate-700">
              Téléphone ou email
            </label>
            <input
              id="identifiant"
              type="text"
              required
              autoFocus
              value={identifiant}
              onChange={(e) => setIdentifiant(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="+224 6XX XXX XXX"
            />
          </div>

          <div>
            <label htmlFor="mot_de_passe" className="mb-1 block text-sm font-medium text-slate-700">
              Mot de passe
            </label>
            <input
              id="mot_de_passe"
              type="password"
              required
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={envoiEnCours}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {envoiEnCours ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
