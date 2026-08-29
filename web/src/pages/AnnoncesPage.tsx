import { useEffect, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../auth/AuthContext'
import { ApiError, apiFetch } from '../lib/api'
import type { AnneeScolaire, Annonce, Classe } from '../lib/types'
import { Modal } from '../components/Modal'

export function AnnoncesPage() {
  const { etablissementCourantId } = useAuth()
  const queryClient = useQueryClient()
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)

  const { data: annonces, isLoading, isError } = useQuery({
    queryKey: ['annonces', etablissementCourantId],
    queryFn: () => apiFetch<Annonce[]>(`/etablissements/${etablissementCourantId}/annonces`),
    enabled: !!etablissementCourantId,
  })

  if (!etablissementCourantId) return <p className="text-slate-500">Choisissez un établissement.</p>

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Annonces</h1>
        <button
          onClick={() => setFormulaireOuvert(true)}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Publier une annonce
        </button>
      </div>

      {isLoading && <p className="text-slate-500">Chargement…</p>}
      {isError && <p className="text-red-600">Impossible de charger les annonces.</p>}

      <div className="space-y-3">
        {annonces?.map((a) => (
          <article key={a.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="font-medium text-slate-900">{a.titre}</h2>
              <span className="text-xs text-slate-400">
                {new Date(a.publiee_le).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <p className="whitespace-pre-wrap text-sm text-slate-600">{a.contenu}</p>
            {a.cible_type === 'classe' && (
              <span className="mt-2 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                Classe spécifique
              </span>
            )}
          </article>
        ))}
        {annonces?.length === 0 && <p className="py-6 text-center text-slate-400">Aucune annonce publiée.</p>}
      </div>

      {formulaireOuvert && (
        <FormulaireAnnonce
          etablissementId={etablissementCourantId}
          onFerme={() => setFormulaireOuvert(false)}
          onPubliee={() => queryClient.invalidateQueries({ queryKey: ['annonces', etablissementCourantId] })}
        />
      )}
    </div>
  )
}

function FormulaireAnnonce({
  etablissementId,
  onFerme,
  onPubliee,
}: {
  etablissementId: number
  onFerme: () => void
  onPubliee: () => void
}) {
  const [titre, setTitre] = useState('')
  const [contenu, setContenu] = useState('')
  const [cibleType, setCibleType] = useState<'etablissement' | 'classe'>('etablissement')
  const [classeId, setClasseId] = useState<number | ''>('')
  const [anneeId, setAnneeId] = useState<number | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)

  const { data: annees } = useQuery({
    queryKey: ['annees-scolaires', etablissementId],
    queryFn: () => apiFetch<AnneeScolaire[]>(`/etablissements/${etablissementId}/annees-scolaires`),
  })

  useEffect(() => {
    if (anneeId === null && annees && annees.length > 0) {
      setAnneeId(annees.find((a) => a.statut === 'active')?.id ?? annees[0].id)
    }
  }, [annees, anneeId])

  const { data: classes } = useQuery({
    queryKey: ['classes', etablissementId, anneeId],
    queryFn: () => apiFetch<Classe[]>(`/etablissements/${etablissementId}/classes?annee_scolaire_id=${anneeId}`),
    enabled: cibleType === 'classe' && !!anneeId,
  })

  const publier = useMutation({
    mutationFn: () =>
      apiFetch<Annonce>(`/etablissements/${etablissementId}/annonces`, {
        method: 'POST',
        body: JSON.stringify({
          titre,
          contenu,
          cible_type: cibleType,
          cible_id: cibleType === 'classe' ? classeId : undefined,
        }),
      }),
    onSuccess: () => {
      onPubliee()
      onFerme()
    },
    onError: (err) => setErreur(err instanceof ApiError ? err.message : 'Échec de la publication.'),
  })

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setErreur(null)
    publier.mutate()
  }

  return (
    <Modal>
      <form onSubmit={onSubmit} className="space-y-4">
        <h2 className="text-base font-semibold text-slate-900">Publier une annonce</h2>
        {erreur && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Titre</label>
          <input required autoFocus value={titre} onChange={(e) => setTitre(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Message</label>
          <textarea required rows={4} value={contenu} onChange={(e) => setContenu(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Destinataires</label>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-1.5">
              <input type="radio" checked={cibleType === 'etablissement'} onChange={() => setCibleType('etablissement')} />
              Tout l'établissement
            </label>
            <label className="flex items-center gap-1.5">
              <input type="radio" checked={cibleType === 'classe'} onChange={() => setCibleType('classe')} />
              Une classe
            </label>
          </div>
        </div>

        {cibleType === 'classe' && (
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Classe</label>
            <select required value={classeId} onChange={(e) => setClasseId(Number(e.target.value))} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="" disabled>
                {classes?.length ? 'Choisir…' : 'Aucune classe'}
              </option>
              {classes?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.libelle}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onFerme} className="rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100">
            Annuler
          </button>
          <button
            type="submit"
            disabled={publier.isPending || (cibleType === 'classe' && !classeId)}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {publier.isPending ? 'Publication…' : 'Publier'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
