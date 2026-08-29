import { useEffect, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../auth/AuthContext'
import { ApiError, apiFetch } from '../lib/api'
import type { AnneeScolaire, Classe } from '../lib/types'
import { Modal } from '../components/Modal'

export function ClassesPage() {
  const { etablissementCourantId } = useAuth()
  const queryClient = useQueryClient()
  const [anneeSelectionnee, setAnneeSelectionnee] = useState<number | null>(null)
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)

  const { data: annees } = useQuery({
    queryKey: ['annees-scolaires', etablissementCourantId],
    queryFn: () => apiFetch<AnneeScolaire[]>(`/etablissements/${etablissementCourantId}/annees-scolaires`),
    enabled: !!etablissementCourantId,
  })

  // Présélectionne l'année active dès qu'elle est connue.
  useEffect(() => {
    if (anneeSelectionnee === null && annees && annees.length > 0) {
      setAnneeSelectionnee(annees.find((a) => a.statut === 'active')?.id ?? annees[0].id)
    }
  }, [annees, anneeSelectionnee])

  const { data: classes, isLoading, isError } = useQuery({
    queryKey: ['classes', etablissementCourantId, anneeSelectionnee],
    queryFn: () =>
      apiFetch<Classe[]>(
        `/etablissements/${etablissementCourantId}/classes?annee_scolaire_id=${anneeSelectionnee}`
      ),
    enabled: !!etablissementCourantId && !!anneeSelectionnee,
  })

  if (!etablissementCourantId) {
    return <p className="text-slate-500">Choisissez un établissement.</p>
  }

  if (annees && annees.length === 0) {
    return <p className="text-slate-500">Créez d'abord une année scolaire avant de créer des classes.</p>
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-slate-900">Classes</h1>
          {annees && (
            <select
              value={anneeSelectionnee ?? ''}
              onChange={(e) => setAnneeSelectionnee(Number(e.target.value))}
              className="rounded-md border border-slate-300 px-2 py-1 text-sm"
            >
              {annees.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.libelle}
                </option>
              ))}
            </select>
          )}
        </div>
        <button
          onClick={() => setFormulaireOuvert(true)}
          disabled={!anneeSelectionnee}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Nouvelle classe
        </button>
      </div>

      {isLoading && <p className="text-slate-500">Chargement…</p>}
      {isError && <p className="text-red-600">Impossible de charger les classes.</p>}

      {classes && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {classes.map((classe) => (
            <div key={classe.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="font-medium text-slate-900">{classe.libelle}</p>
              <p className="text-sm text-slate-500">{classe.niveau}</p>
              {classe.effectif_max && (
                <p className="mt-1 text-xs text-slate-400">Effectif max : {classe.effectif_max}</p>
              )}
            </div>
          ))}
          {classes.length === 0 && (
            <p className="col-span-full py-6 text-center text-slate-400">Aucune classe pour cette année.</p>
          )}
        </div>
      )}

      {formulaireOuvert && anneeSelectionnee && (
        <FormulaireClasse
          etablissementId={etablissementCourantId}
          anneeScolaireId={anneeSelectionnee}
          onFerme={() => setFormulaireOuvert(false)}
          onCree={() => queryClient.invalidateQueries({ queryKey: ['classes', etablissementCourantId] })}
        />
      )}
    </div>
  )
}

function FormulaireClasse({
  etablissementId,
  anneeScolaireId,
  onFerme,
  onCree,
}: {
  etablissementId: number
  anneeScolaireId: number
  onFerme: () => void
  onCree: () => void
}) {
  const [niveau, setNiveau] = useState('')
  const [libelle, setLibelle] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)

  const creer = useMutation({
    mutationFn: () =>
      apiFetch<Classe>(`/etablissements/${etablissementId}/classes`, {
        method: 'POST',
        body: JSON.stringify({ niveau, libelle, annee_scolaire_id: anneeScolaireId }),
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
        <h2 className="text-base font-semibold text-slate-900">Nouvelle classe</h2>

        {erreur && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Niveau</label>
          <input
            required
            autoFocus
            placeholder="CM2, 7e, Terminale S…"
            value={niveau}
            onChange={(e) => setNiveau(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Libellé</label>
          <input
            required
            placeholder="CM2 A"
            value={libelle}
            onChange={(e) => setLibelle(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
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
