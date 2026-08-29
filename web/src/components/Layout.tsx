import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const LIENS = [
  { to: '/annees-scolaires', label: 'Années scolaires' },
  { to: '/classes', label: 'Classes' },
  { to: '/eleves', label: 'Élèves' },
  { to: '/bulletins', label: 'Bulletins' },
  { to: '/finances', label: 'Finances' },
]

export function Layout() {
  const { utilisateur, rattachements, etablissementCourantId, choisirEtablissement, deconnecte } = useAuth()

  const etablissementCourant = rattachements.find((r) => r.etablissement.id === etablissementCourantId)?.etablissement

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <div>
              <span className="font-semibold text-slate-900">Plateforme scolaire</span>
              {etablissementCourant && (
                <span className="ml-2 text-sm text-slate-500">— {etablissementCourant.nom}</span>
              )}
            </div>
            <nav className="flex gap-4">
              {LIENS.map((lien) => (
                <NavLink
                  key={lien.to}
                  to={lien.to}
                  className={({ isActive }) =>
                    `text-sm ${isActive ? 'font-medium text-blue-700' : 'text-slate-600 hover:text-slate-900'}`
                  }
                >
                  {lien.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {rattachements.length > 1 && (
              <select
                value={etablissementCourantId ?? ''}
                onChange={(e) => choisirEtablissement(Number(e.target.value))}
                className="rounded-md border border-slate-300 px-2 py-1 text-sm"
              >
                <option value="" disabled>
                  Choisir un établissement
                </option>
                {rattachements.map((r) => (
                  <option key={r.etablissement.id} value={r.etablissement.id}>
                    {r.etablissement.nom}
                  </option>
                ))}
              </select>
            )}
            <span className="text-sm text-slate-600">
              {utilisateur?.prenom} {utilisateur?.nom}
            </span>
            <button onClick={() => deconnecte()} className="text-sm text-slate-500 hover:text-slate-800">
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
