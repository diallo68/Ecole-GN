import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../auth/AuthContext'
import { ApiError, apiFetch } from '../lib/api'
import type { Pagination, Rattachement, ResultatImport, Role, Utilisateur } from '../lib/types'
import { Modal } from '../components/Modal'

const LIBELLE_ROLE: Record<Role, string> = {
  admin_etablissement: 'Direction',
  enseignant: 'Enseignant',
  personnel_administratif: 'Personnel administratif',
  parent: 'Parent',
}

// La réponse de GET /etablissements/{id}/utilisateurs imbrique
// l'utilisateur dans le rattachement (voir EtablissementUtilisateurController).
interface RattachementAvecUtilisateur extends Omit<Rattachement, 'etablissement'> {
  utilisateur: Utilisateur
}

export function UtilisateursPage() {
  const { etablissementCourantId } = useAuth()
  const queryClient = useQueryClient()
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)
  const [importOuvert, setImportOuvert] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['utilisateurs', etablissementCourantId],
    queryFn: () =>
      apiFetch<{ data: RattachementAvecUtilisateur[]; meta: Pagination }>(
        `/etablissements/${etablissementCourantId}/utilisateurs`
      ),
    enabled: !!etablissementCourantId,
  })

  if (!etablissementCourantId) return <p className="text-slate-500">Choisissez un établissement.</p>

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Comptes rattachés</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setImportOuvert(true)}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Importer un CSV
          </button>
          <button
            onClick={() => setFormulaireOuvert(true)}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Créer un compte
          </button>
        </div>
      </div>

      {isLoading && <p className="text-slate-500">Chargement…</p>}
      {isError && <p className="text-red-600">Impossible de charger les comptes.</p>}

      {data && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2">Nom</th>
                <th className="px-4 py-2">Téléphone</th>
                <th className="px-4 py-2">Rôle</th>
                <th className="px-4 py-2">Statut</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-2">
                    {r.utilisateur.nom} {r.utilisateur.prenom}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs">{r.utilisateur.telephone}</td>
                  <td className="px-4 py-2">{LIBELLE_ROLE[r.role]}</td>
                  <td className="px-4 py-2">
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">{r.statut}</span>
                  </td>
                </tr>
              ))}
              {data.data.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                    Aucun compte rattaché.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {formulaireOuvert && (
        <FormulaireUtilisateur
          etablissementId={etablissementCourantId}
          onFerme={() => setFormulaireOuvert(false)}
          onCree={() => queryClient.invalidateQueries({ queryKey: ['utilisateurs', etablissementCourantId] })}
        />
      )}

      {importOuvert && (
        <FormulaireImportUtilisateurs
          etablissementId={etablissementCourantId}
          onFerme={() => setImportOuvert(false)}
          onImporte={() => queryClient.invalidateQueries({ queryKey: ['utilisateurs', etablissementCourantId] })}
        />
      )}
    </div>
  )
}

function FormulaireUtilisateur({
  etablissementId,
  onFerme,
  onCree,
}: {
  etablissementId: number
  onFerme: () => void
  onCree: () => void
}) {
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [role, setRole] = useState<Role>('enseignant')
  const [erreur, setErreur] = useState<string | null>(null)

  const creer = useMutation({
    mutationFn: () =>
      apiFetch<RattachementAvecUtilisateur>(`/etablissements/${etablissementId}/utilisateurs`, {
        method: 'POST',
        body: JSON.stringify({ nom, prenom, telephone, role }),
      }),
    onSuccess: () => {
      onCree()
      onFerme()
    },
    onError: (err) => setErreur(err instanceof ApiError ? err.message : 'Échec de la création.'),
  })

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setErreur(null)
    creer.mutate()
  }

  return (
    <Modal>
      <form onSubmit={onSubmit} className="space-y-4">
        <h2 className="text-base font-semibold text-slate-900">Créer un compte</h2>
        {erreur && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Rôle</label>
          <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="enseignant">Enseignant</option>
            <option value="personnel_administratif">Personnel administratif</option>
            <option value="admin_etablissement">Direction</option>
            <option value="parent">Parent</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Nom</label>
          <input required autoFocus value={nom} onChange={(e) => setNom(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Prénom</label>
          <input required value={prenom} onChange={(e) => setPrenom(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Téléphone</label>
          <input
            required
            placeholder="+224 6XX XXX XXX"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-slate-400">
            Identifie la personne : si un compte existe déjà avec ce numéro, il est rattaché à cet établissement plutôt que dupliqué.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onFerme} className="rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100">
            Annuler
          </button>
          <button type="submit" disabled={creer.isPending} className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
            {creer.isPending ? 'Création…' : 'Créer'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function FormulaireImportUtilisateurs({
  etablissementId,
  onFerme,
  onImporte,
}: {
  etablissementId: number
  onFerme: () => void
  onImporte: () => void
}) {
  const [fichier, setFichier] = useState<File | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)

  const importer = useMutation({
    mutationFn: () => {
      const corps = new FormData()
      corps.append('fichier', fichier!)
      return apiFetch<ResultatImport>(`/etablissements/${etablissementId}/utilisateurs/import`, {
        method: 'POST',
        body: corps,
      })
    },
    onSuccess: () => onImporte(),
    onError: (err) => setErreur(err instanceof ApiError ? err.message : "Échec de l'import."),
  })

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setErreur(null)
    if (fichier) importer.mutate()
  }

  return (
    <Modal>
      {importer.isSuccess ? (
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900">Import terminé</h2>
          <p className="text-sm text-slate-700">
            {importer.data.nb_crees} compte(s) créé(s) ou rattaché(s) sur {importer.data.lignes_recues} ligne(s) reçue(s).
          </p>
          {importer.data.nb_erreurs > 0 && (
            <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
              <p className="mb-1 font-medium">{importer.data.nb_erreurs} ligne(s) ignorée(s) :</p>
              <ul className="list-inside list-disc space-y-0.5">
                {importer.data.erreurs.map((e) => (
                  <li key={e.ligne}>
                    Ligne {e.ligne} : {e.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex justify-end pt-2">
            <button onClick={onFerme} className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
              Fermer
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900">Importer des comptes (CSV)</h2>

          {erreur && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>}

          <p className="text-sm text-slate-600">
            Colonnes attendues (en-tête, casse indifférente) :{' '}
            <code className="text-xs">nom, prenom, telephone, email, role</code>. <code className="text-xs">role</code> doit être l'une
            de : {(Object.keys(LIBELLE_ROLE) as Role[]).join(', ')}. Un téléphone déjà connu rattache le compte existant plutôt que d'en
            créer un doublon.
          </p>

          <input
            required
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => setFichier(e.target.files?.[0] ?? null)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onFerme} className="rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100">
              Annuler
            </button>
            <button
              type="submit"
              disabled={!fichier || importer.isPending}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {importer.isPending ? 'Import…' : 'Importer'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
