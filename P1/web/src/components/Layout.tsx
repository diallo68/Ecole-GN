import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const LIENS = [
  { to: '/annees-scolaires', label: 'Années scolaires' },
  { to: '/classes', label: 'Classes' },
  { to: '/eleves', label: 'Élèves' },
  { to: '/comptes', label: 'Comptes' },
  { to: '/emploi-du-temps', label: 'Emploi du temps' },
  { to: '/notes', label: 'Notes' },
  { to: '/bulletins', label: 'Bulletins' },
  { to: '/finances', label: 'Finances' },
  { to: '/annonces', label: 'Annonces' },
  { to: '/statistiques', label: 'Statistiques' },
]

// Ce back-office cible la direction et le personnel administratif (voir
// web/README.md) — enseignant et parent ont leurs propres écrans sur
// l'app mobile (miroir de la logique dans mobile/lib/main.dart,
// AuthService.roleCourant). Un compte enseignant/parent PEUT se
// connecter ici (rien ne l'en empêche côté API), mais voyait jusqu'ici
// le menu complet de la direction sans y avoir droit — chaque clic
// échouant ensuite en 403 côté serveur. Trouvé en repassant les mains
// de l'utilisateur sur un compte parent de démonstration.
const ROLES_BACK_OFFICE = ['admin_etablissement', 'personnel_administratif']

export function Layout() {
  const { utilisateur, rattachements, etablissementCourantId, roleCourant, choisirEtablissement, deconnecte } =
    useAuth()

  const etablissementCourant = rattachements.find((r) => r.etablissement.id === etablissementCourantId)?.etablissement
  // null : aucun établissement encore résolu (multi-rattachement pas
  // choisi) — ne pas bloquer prématurément, seul un rôle enseignant/
  // parent CONFIRMÉ ferme l'accès.
  const accesAutorise =
    utilisateur?.est_super_admin ||
    roleCourant === null ||
    ROLES_BACK_OFFICE.includes(roleCourant)

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
            {accesAutorise && (
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
            )}
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
        {accesAutorise ? (
          <Outlet />
        ) : (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-900">
            <p className="font-medium">Ce compte n'est pas prévu pour ce portail.</p>
            <p className="mt-1 text-sm">
              Le back-office web est réservé à la direction et au personnel administratif. En tant qu'{' '}
              {roleCourant === 'parent' ? 'parent' : 'enseignant'}, utilisez l'application mobile pour consulter{' '}
              {roleCourant === 'parent'
                ? "les bulletins et présences de vos enfants, l'emploi du temps et les annonces."
                : "vos classes, faire l'appel, saisir des notes, consulter l'emploi du temps et les annonces."}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
