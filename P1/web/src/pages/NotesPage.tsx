import { useEffect, useState, type FormEvent } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useAuth } from '../auth/AuthContext'
import { ApiError, apiFetch } from '../lib/api'
import type {
  AnneeScolaire,
  Classe,
  ClasseMatiereEnseignant,
  Eleve,
  Evaluation,
  Note,
  PeriodeEvaluation,
} from '../lib/types'
import { Modal } from '../components/Modal'

/**
 * Parcours critique n°3 du MVP (docs/mvp-scope.md) : jusqu'ici seule l'API
 * l'exposait (utilisée par app mobile enseignant et par les tests) — cette
 * page comble le même trou côté back-office web (voir mobile/README.md,
 * section "limites connues" de la session précédente).
 */
export function NotesPage() {
  const { etablissementCourantId } = useAuth()
  const [anneeId, setAnneeId] = useState<number | null>(null)
  const [classeId, setClasseId] = useState<number | null>(null)
  const [matiereId, setMatiereId] = useState<number | null>(null)
  const [periodeId, setPeriodeId] = useState<number | null>(null)
  const [evaluationId, setEvaluationId] = useState<number | null>(null)
  const [formulaireEvaluationOuvert, setFormulaireEvaluationOuvert] = useState(false)

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
    setMatiereId(null)
    setEvaluationId(null)
  }, [anneeId])

  const { data: matieres } = useQuery({
    queryKey: ['classe-matieres', classeId],
    queryFn: () => apiFetch<ClasseMatiereEnseignant[]>(`/classes/${classeId}/matieres`),
    enabled: !!classeId,
  })

  useEffect(() => {
    setMatiereId(null)
    setEvaluationId(null)
  }, [classeId])

  const { data: periodes } = useQuery({
    queryKey: ['periodes', etablissementCourantId, anneeId],
    queryFn: () => apiFetch<PeriodeEvaluation[]>(`/etablissements/${etablissementCourantId}/periodes?annee_scolaire_id=${anneeId}`),
    enabled: !!etablissementCourantId && !!anneeId,
  })

  useEffect(() => {
    setEvaluationId(null)
  }, [matiereId, periodeId])

  const { data: evaluations, refetch: rechargerEvaluations } = useQuery({
    queryKey: ['evaluations', classeId, matiereId, periodeId],
    queryFn: () =>
      apiFetch<Evaluation[]>(
        `/classes/${classeId}/matieres/${matiereId}/evaluations?periode_id=${periodeId}`
      ),
    enabled: !!classeId && !!matiereId && !!periodeId,
  })

  const evaluation = evaluations?.find((e) => e.id === evaluationId)

  if (!etablissementCourantId) return <p className="text-slate-500">Choisissez un établissement.</p>

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold text-slate-900">Notes</h1>

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

        <Champ label="Matière">
          <select
            value={matiereId ?? ''}
            onChange={(e) => setMatiereId(Number(e.target.value))}
            disabled={!matieres?.length}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="" disabled>
              {matieres?.length ? 'Choisir…' : 'Aucune matière affectée'}
            </option>
            {matieres?.map((m) => (
              <option key={m.matiere_id} value={m.matiere_id}>
                {m.matiere.nom}
              </option>
            ))}
          </select>
        </Champ>

        <Champ label="Période">
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
        </Champ>

        <Champ label="Évaluation">
          <div className="flex items-center gap-2">
            <select
              value={evaluationId ?? ''}
              onChange={(e) => setEvaluationId(Number(e.target.value))}
              disabled={!matiereId || !periodeId}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            >
              <option value="" disabled>
                {evaluations?.length ? 'Choisir…' : 'Aucune évaluation'}
              </option>
              {evaluations?.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.libelle} ({e.date_evaluation.split('T')[0]})
                </option>
              ))}
            </select>
            <button
              onClick={() => setFormulaireEvaluationOuvert(true)}
              disabled={!matiereId || !periodeId}
              className="text-sm text-blue-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-300"
            >
              + évaluation
            </button>
          </div>
        </Champ>
      </div>

      {classeId && evaluation && (
        <TableauNotes classeId={classeId} evaluation={evaluation} />
      )}

      {formulaireEvaluationOuvert && classeId && matiereId && periodeId && (
        <FormulaireEvaluation
          classeId={classeId}
          matiereId={matiereId}
          periodeId={periodeId}
          onFerme={() => setFormulaireEvaluationOuvert(false)}
          onCree={(id) => {
            rechargerEvaluations().then(() => setEvaluationId(id))
          }}
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

function TableauNotes({ classeId, evaluation }: { classeId: number; evaluation: Evaluation }) {
  const { data: eleves } = useQuery({
    queryKey: ['classe-eleves', classeId],
    queryFn: () => apiFetch<Eleve[]>(`/classes/${classeId}/eleves`),
  })

  const { data: notesExistantes } = useQuery({
    queryKey: ['evaluation-notes', evaluation.id],
    queryFn: () => apiFetch<Note[]>(`/evaluations/${evaluation.id}/notes`),
  })

  // Brouillon local des valeurs saisies, clé par eleve_id — reconstruit à
  // chaque changement d'évaluation ou de notes déjà chargées (updateOrCreate
  // côté API : resaisir remplace, l'écran doit refléter ce choix).
  const [valeurs, setValeurs] = useState<Record<number, string>>({})

  useEffect(() => {
    const brouillon: Record<number, string> = {}
    for (const n of notesExistantes ?? []) {
      if (n.valeur !== null && n.valeur !== undefined) brouillon[n.eleve_id] = String(n.valeur)
    }
    setValeurs(brouillon)
  }, [notesExistantes])

  const [erreur, setErreur] = useState<string | null>(null)
  const [succes, setSucces] = useState(false)

  const enregistrer = useMutation({
    mutationFn: () => {
      const notes = (eleves ?? []).map((eleve) => {
        const texte = (valeurs[eleve.id] ?? '').trim()
        return {
          eleve_id: eleve.id,
          valeur: texte === '' ? null : Number(texte.replace(',', '.')),
        }
      })
      return apiFetch<Note[]>(`/evaluations/${evaluation.id}/notes`, {
        method: 'PUT',
        body: JSON.stringify({ notes }),
      })
    },
    onSuccess: () => setSucces(true),
    onError: (err) => setErreur(err instanceof ApiError ? err.message : "Échec de l'enregistrement."),
  })

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setErreur(null)
    setSucces(false)
    const invalides = (eleves ?? []).some((eleve) => {
      const texte = (valeurs[eleve.id] ?? '').trim()
      if (texte === '') return false
      const v = Number(texte.replace(',', '.'))
      return Number.isNaN(v) || v < 0 || v > 20
    })
    if (invalides) {
      setErreur('Une ou plusieurs notes sont invalides (attendu : entre 0 et 20).')
      return
    }
    enregistrer.mutate()
  }

  return (
    <form onSubmit={onSubmit} className="mt-4">
      {erreur && <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>}
      {succes && <p className="mb-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Notes enregistrées.</p>}

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2">Élève</th>
              <th className="px-4 py-2">Matricule</th>
              <th className="px-4 py-2">Note / 20</th>
            </tr>
          </thead>
          <tbody>
            {eleves?.map((eleve) => (
              <tr key={eleve.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2">
                  {eleve.nom} {eleve.prenom}
                </td>
                <td className="px-4 py-2 text-slate-500">{eleve.matricule}</td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="—"
                    value={valeurs[eleve.id] ?? ''}
                    onChange={(e) => setValeurs((v) => ({ ...v, [eleve.id]: e.target.value }))}
                    className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm"
                  />
                </td>
              </tr>
            ))}
            {eleves?.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-slate-400">
                  Aucun élève inscrit dans cette classe.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button
        type="submit"
        disabled={!eleves?.length || enregistrer.isPending}
        className="mt-3 rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {enregistrer.isPending ? 'Enregistrement…' : 'Enregistrer les notes'}
      </button>
    </form>
  )
}

function FormulaireEvaluation({
  classeId,
  matiereId,
  periodeId,
  onFerme,
  onCree,
}: {
  classeId: number
  matiereId: number
  periodeId: number
  onFerme: () => void
  onCree: (id: number) => void
}) {
  const [type, setType] = useState<'devoir' | 'composition' | 'interrogation'>('devoir')
  const [libelle, setLibelle] = useState('')
  const [dateEvaluation, setDateEvaluation] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)

  const creer = useMutation({
    mutationFn: () =>
      apiFetch<Evaluation>(`/classes/${classeId}/matieres/${matiereId}/evaluations`, {
        method: 'POST',
        body: JSON.stringify({ type, libelle, periode_id: periodeId, date_evaluation: dateEvaluation }),
      }),
    onSuccess: (evaluation) => {
      onCree(evaluation.id)
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
        <h2 className="text-base font-semibold text-slate-900">Nouvelle évaluation</h2>

        {erreur && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as typeof type)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="devoir">Devoir</option>
            <option value="composition">Composition</option>
            <option value="interrogation">Interrogation</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Libellé</label>
          <input
            required
            autoFocus
            placeholder="Devoir 1"
            value={libelle}
            onChange={(e) => setLibelle(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Date</label>
          <input
            required
            type="date"
            value={dateEvaluation}
            onChange={(e) => setDateEvaluation(e.target.value)}
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
