import { useEffect, useState, type FormEvent } from 'react'
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../auth/AuthContext'
import { ApiError, apiFetch } from '../lib/api'
import type { AnneeScolaire, Bulletin, Classe, Eleve, PeriodeEvaluation } from '../lib/types'
import { Modal } from '../components/Modal'

export function BulletinsPage() {
  const { etablissementCourantId } = useAuth()
  const queryClient = useQueryClient()
  const [anneeId, setAnneeId] = useState<number | null>(null)
  const [classeId, setClasseId] = useState<number | null>(null)
  const [periodeId, setPeriodeId] = useState<number | null>(null)
  const [formulairePeriodeOuvert, setFormulairePeriodeOuvert] = useState(false)

  const { data: annees } = useQuery({
    queryKey: ['annees-scolaires', etablissementCourantId],
    queryFn: () => apiFetch<AnneeScolaire[]>(`/etablissements/${etablissementCourantId}/annees-scolaires`),
    enabled: !!etablissementCourantId,
  })

  useEffect(() => {
    if (anneeId === null && annees && annees.length > 0) {
      setAnneeId(annees.find((a) => a.statut === 'active')?.id ?? annees[0].id)
    }
  }, [annees, anneeId])

  const { data: classes } = useQuery({
    queryKey: ['classes', etablissementCourantId, anneeId],
    queryFn: () => apiFetch<Classe[]>(`/etablissements/${etablissementCourantId}/classes?annee_scolaire_id=${anneeId}`),
    enabled: !!etablissementCourantId && !!anneeId,
  })

  useEffect(() => {
    setClasseId(null)
  }, [anneeId])

  const { data: periodes } = useQuery({
    queryKey: ['periodes', etablissementCourantId, anneeId],
    queryFn: () => apiFetch<PeriodeEvaluation[]>(`/etablissements/${etablissementCourantId}/periodes?annee_scolaire_id=${anneeId}`),
    enabled: !!etablissementCourantId && !!anneeId,
  })

  const { data: eleves } = useQuery({
    queryKey: ['classe-eleves', classeId],
    queryFn: () => apiFetch<Eleve[]>(`/classes/${classeId}/eleves`),
    enabled: !!classeId,
  })

  // Un bulletin par élève, filtré à la période sélectionnée : l'API n'a pas
  // d'endpoint "bulletins de la classe" (juste /eleves/{id}/bulletins), donc
  // on interroge élève par élève — acceptable à l'échelle d'une classe
  // (quelques dizaines d'élèves, pas de pagination nécessaire).
  const bulletinsParEleve = useQueries({
    queries: (eleves ?? []).map((eleve) => ({
      queryKey: ['bulletins', eleve.id],
      queryFn: () => apiFetch<Bulletin[]>(`/eleves/${eleve.id}/bulletins`),
      enabled: !!eleves,
    })),
  })

  const generer = useMutation({
    mutationFn: () =>
      apiFetch<{ nb_bulletins: number; nb_ignores_deja_publies: number }>(
        `/periodes/${periodeId}/bulletins/generer`,
        { method: 'POST', body: JSON.stringify({ classe_id: classeId }) }
      ),
    onSuccess: () => {
      (eleves ?? []).forEach((e) => queryClient.invalidateQueries({ queryKey: ['bulletins', e.id] }))
    },
  })

  const publier = useMutation({
    mutationFn: ({ bulletinId }: { bulletinId: number; eleveId: number }) =>
      apiFetch(`/bulletins/${bulletinId}/valider`, { method: 'POST' }),
    onSuccess: (_data, { eleveId }) => queryClient.invalidateQueries({ queryKey: ['bulletins', eleveId] }),
  })

  if (!etablissementCourantId) return <p className="text-slate-500">Choisissez un établissement.</p>

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold text-slate-900">Bulletins</h1>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <Champ label="Année scolaire">
          <select value={anneeId ?? ''} onChange={(e) => setAnneeId(Number(e.target.value))} className="rounded-md border border-slate-300 px-2 py-1.5 text-sm">
            {annees?.map((a) => (
              <option key={a.id} value={a.id}>
                {a.libelle}
              </option>
            ))}
          </select>
        </Champ>

        <Champ label="Classe">
          <select
            value={classeId ?? ''}
            onChange={(e) => setClasseId(Number(e.target.value))}
            disabled={!classes?.length}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="" disabled>
              {classes?.length ? 'Choisir…' : 'Aucune classe'}
            </option>
            {classes?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.libelle}
              </option>
            ))}
          </select>
        </Champ>

        <Champ label="Période">
          <div className="flex items-center gap-2">
            <select
              value={periodeId ?? ''}
              onChange={(e) => setPeriodeId(Number(e.target.value))}
              disabled={!periodes?.length}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            >
              <option value="" disabled>
                {periodes?.length ? 'Choisir…' : 'Aucune période'}
              </option>
              {periodes?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.libelle} {p.statut === 'cloturee' ? '(clôturée)' : ''}
                </option>
              ))}
            </select>
            <button onClick={() => setFormulairePeriodeOuvert(true)} className="text-sm text-blue-600 hover:underline">
              + période
            </button>
          </div>
        </Champ>

        <button
          onClick={() => generer.mutate()}
          disabled={!classeId || !periodeId || generer.isPending}
          className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {generer.isPending ? 'Génération…' : 'Générer les bulletins'}
        </button>
      </div>

      {generer.isSuccess && (
        <p className="mb-3 text-sm text-emerald-700">
          {generer.data.nb_bulletins} bulletin(s) généré(s)
          {generer.data.nb_ignores_deja_publies > 0 && ` — ${generer.data.nb_ignores_deja_publies} déjà publié(s), ignoré(s)`}.
        </p>
      )}
      {generer.isError && (
        <p className="mb-3 text-sm text-red-600">
          {generer.error instanceof ApiError ? generer.error.message : 'Échec de la génération.'}
        </p>
      )}

      {classeId && periodeId && eleves && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2">Élève</th>
                <th className="px-4 py-2">Moyenne</th>
                <th className="px-4 py-2">Rang</th>
                <th className="px-4 py-2">Statut</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {eleves.map((eleve, i) => {
                const bulletin = bulletinsParEleve[i]?.data?.find((b) => b.periode_id === periodeId)
                return (
                  <tr key={eleve.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-2">
                      {eleve.nom} {eleve.prenom}
                    </td>
                    <td className="px-4 py-2">{bulletin?.moyenne_generale ?? '—'}</td>
                    <td className="px-4 py-2">{bulletin?.rang ?? '—'}</td>
                    <td className="px-4 py-2">
                      {bulletin ? (
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            bulletin.statut === 'publie'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {bulletin.statut}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">non généré</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {bulletin && bulletin.statut === 'brouillon' && (
                        <button
                          onClick={() => publier.mutate({ bulletinId: bulletin.id, eleveId: eleve.id })}
                          disabled={publier.isPending}
                          className="text-xs font-medium text-blue-600 hover:underline disabled:opacity-50"
                        >
                          Publier
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {formulairePeriodeOuvert && anneeId && (
        <FormulairePeriode
          etablissementId={etablissementCourantId}
          anneeScolaireId={anneeId}
          onFerme={() => setFormulairePeriodeOuvert(false)}
          onCree={() => queryClient.invalidateQueries({ queryKey: ['periodes', etablissementCourantId, anneeId] })}
        />
      )}
    </div>
  )
}

function Champ({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="text-sm">
      <span className="mb-1 block font-medium text-slate-700">{label}</span>
      {children}
    </label>
  )
}

function FormulairePeriode({
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
  const [libelle, setLibelle] = useState('')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)

  const creer = useMutation({
    mutationFn: () =>
      apiFetch<PeriodeEvaluation>(`/etablissements/${etablissementId}/periodes`, {
        method: 'POST',
        body: JSON.stringify({ libelle, annee_scolaire_id: anneeScolaireId, date_debut: dateDebut, date_fin: dateFin }),
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
        <h2 className="text-base font-semibold text-slate-900">Nouvelle période</h2>

        {erreur && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Libellé</label>
          <input
            required
            autoFocus
            placeholder="Trimestre 1"
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
