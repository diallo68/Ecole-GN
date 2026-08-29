import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../auth/AuthContext'
import { ApiError, apiFetch } from '../lib/api'
import type { Eleve, Pagination, ResultatImport } from '../lib/types'
import { Modal } from '../components/Modal'

export function ElevesPage() {
  const { etablissementCourantId } = useAuth()
  const queryClient = useQueryClient()
  const [recherche, setRecherche] = useState('')
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)
  const [importOuvert, setImportOuvert] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['eleves', etablissementCourantId, recherche],
    queryFn: () =>
      apiFetch<{ data: Eleve[]; meta: Pagination }>(
        `/etablissements/${etablissementCourantId}/eleves${recherche ? `?q=${encodeURIComponent(recherche)}` : ''}`
      ),
    enabled: !!etablissementCourantId,
  })

  if (!etablissementCourantId) {
    return <p className="text-slate-500">Choisissez un établissement pour voir ses élèves.</p>
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Élèves</h1>
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
            Inscrire un élève
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Rechercher par nom, prénom ou matricule…"
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
        className="mb-4 w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />

      {isLoading && <p className="text-slate-500">Chargement…</p>}
      {isError && <p className="text-red-600">Impossible de charger les élèves.</p>}

      {data && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2">Matricule</th>
                <th className="px-4 py-2">Nom</th>
                <th className="px-4 py-2">Prénom</th>
                <th className="px-4 py-2">Statut</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((eleve) => (
                <tr key={eleve.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-2 font-mono text-xs text-slate-500">{eleve.matricule}</td>
                  <td className="px-4 py-2">{eleve.nom}</td>
                  <td className="px-4 py-2">{eleve.prenom}</td>
                  <td className="px-4 py-2">
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
                      {eleve.statut}
                    </span>
                  </td>
                </tr>
              ))}
              {data.data.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                    Aucun élève{recherche ? ' pour cette recherche' : ''}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {formulaireOuvert && (
        <FormulaireEleve
          etablissementId={etablissementCourantId}
          onFerme={() => setFormulaireOuvert(false)}
          onCree={() => queryClient.invalidateQueries({ queryKey: ['eleves', etablissementCourantId] })}
        />
      )}

      {importOuvert && (
        <FormulaireImport
          etablissementId={etablissementCourantId}
          onFerme={() => setImportOuvert(false)}
          onImporte={() => queryClient.invalidateQueries({ queryKey: ['eleves', etablissementCourantId] })}
        />
      )}
    </div>
  )
}

function FormulaireEleve({
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
  const [sexe, setSexe] = useState<'M' | 'F' | ''>('')
  const [erreur, setErreur] = useState<string | null>(null)

  const creerEleve = useMutation({
    mutationFn: () =>
      apiFetch<Eleve>(`/etablissements/${etablissementId}/eleves`, {
        method: 'POST',
        body: JSON.stringify({ nom, prenom, sexe: sexe || undefined }),
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
    creerEleve.mutate()
  }

  return (
    <Modal>
      <form onSubmit={onSubmit} className="space-y-4">
        <h2 className="text-base font-semibold text-slate-900">Inscrire un élève</h2>

        {erreur && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Nom</label>
          <input
            required
            autoFocus
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Prénom</label>
          <input
            required
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Sexe</label>
          <select
            value={sexe}
            onChange={(e) => setSexe(e.target.value as 'M' | 'F' | '')}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Non précisé</option>
            <option value="M">Masculin</option>
            <option value="F">Féminin</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onFerme} className="rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100">
            Annuler
          </button>
          <button
            type="submit"
            disabled={creerEleve.isPending}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {creerEleve.isPending ? 'Création…' : 'Inscrire'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function FormulaireImport({
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
      return apiFetch<ResultatImport>(`/etablissements/${etablissementId}/eleves/import`, {
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
            {importer.data.nb_crees} élève(s) créé(s) sur {importer.data.lignes_recues} ligne(s) reçue(s).
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
          <h2 className="text-base font-semibold text-slate-900">Importer des élèves (CSV)</h2>

          {erreur && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>}

          <p className="text-sm text-slate-600">
            Colonnes attendues (en-tête, casse indifférente) : <code className="text-xs">nom, prenom, matricule, date_naissance, sexe</code>.
            Seuls <code className="text-xs">nom</code> et <code className="text-xs">prenom</code> sont obligatoires ; le matricule est généré
            automatiquement si absent.
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
