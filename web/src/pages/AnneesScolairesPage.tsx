import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../auth/AuthContext'
import { ApiError, apiFetch } from '../lib/api'
import type { AnneeScolaire } from '../lib/types'
import { Modal } from '../components/Modal'

const LIBELLE_STATUT: Record<AnneeScolaire['statut'], string> = {
  en_preparation: 'En préparation',
  active: 'Active',
  archivee: 'Archivée',
}

export function AnneesScolairesPage() {
  const { etablissementCourantId } = useAuth()
  const queryClient = useQueryClient()
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['annees-scolaires', etablissementCourantId],
    queryFn: () => apiFetch<AnneeScolaire[]>(`/etablissements/${etablissementCourantId}/annees-scolaires`),
    enabled: !!etablissementCourantId,
  })

  const activer = useMutation({
    mutationFn: (id: number) => apiFetch(`/annees-scolaires/${id}`, { method: 'PATCH', body: JSON.stringify({ statut: 'active' }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['annees-scolaires', etablissementCourantId] }),
  })

  if (!etablissementCourantId) {
    return <p className="text-slate-500">Choisissez un établissement.</p>
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Années scolaires</h1>
        <button
          onClick={() => setFormulaireOuvert(true)}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Nouvelle année
        </button>
      </div>

      {isLoading && <p className="text-slate-500">Chargement…</p>}
      {isError && <p className="text-red-600">Impossible de charger les années scolaires.</p>}

      {data && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2">Libellé</th>
                <th className="px-4 py-2">Du</th>
                <th className="px-4 py-2">Au</th>
                <th className="px-4 py-2">Statut</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {data.map((annee) => (
                <tr key={annee.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-2 font-medium">{annee.libelle}</td>
                  <td className="px-4 py-2">{annee.date_debut}</td>
                  <td className="px-4 py-2">{annee.date_fin}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        annee.statut === 'active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : annee.statut === 'archivee'
                            ? 'bg-slate-100 text-slate-500'
                            : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {LIBELLE_STATUT[annee.statut]}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    {annee.statut !== 'active' && (
                      <button
                        onClick={() => activer.mutate(annee.id)}
                        disabled={activer.isPending}
                        className="text-xs font-medium text-blue-600 hover:underline disabled:opacity-50"
                      >
                        Activer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    Aucune année scolaire créée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activer.isError && (
        <p className="mt-2 text-sm text-red-600">
          {activer.error instanceof ApiError ? activer.error.message : "Échec de l'activation."}
        </p>
      )}

      {formulaireOuvert && (
        <FormulaireAnnee
          etablissementId={etablissementCourantId}
          onFerme={() => setFormulaireOuvert(false)}
          onCree={() => queryClient.invalidateQueries({ queryKey: ['annees-scolaires', etablissementCourantId] })}
        />
      )}
    </div>
  )
}

function FormulaireAnnee({
  etablissementId,
  onFerme,
  onCree,
}: {
  etablissementId: number
  onFerme: () => void
  onCree: () => void
}) {
  const [libelle, setLibelle] = useState('')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)

  const creer = useMutation({
    mutationFn: () =>
      apiFetch<AnneeScolaire>(`/etablissements/${etablissementId}/annees-scolaires`, {
        method: 'POST',
        body: JSON.stringify({ libelle, date_debut: dateDebut, date_fin: dateFin }),
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
        <h2 className="text-base font-semibold text-slate-900">Nouvelle année scolaire</h2>

        {erreur && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Libellé</label>
          <input
            required
            autoFocus
            placeholder="2026-2027"
            value={libelle}
            onChange={(e) => setLibelle(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Début</label>
            <input
              required
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Fin</label>
            <input
              required
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onFerme} className="rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100">
            Annuler
          </button>
          <button
            type="submit"
            disabled={creer.isPending}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {creer.isPending ? 'Création…' : 'Créer'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
