import { useEffect, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../auth/AuthContext'
import { ApiError, apiFetch } from '../lib/api'
import type { AnneeScolaire, Classe, CreneauEmploiDuTemps, Matiere, Utilisateur } from '../lib/types'
import { Modal } from '../components/Modal'

const JOURS = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

export function EmploiDuTempsPage() {
  const { etablissementCourantId } = useAuth()
  const queryClient = useQueryClient()
  const [anneeId, setAnneeId] = useState<number | null>(null)
  const [classeId, setClasseId] = useState<number | null>(null)
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)
  const [avertissementConflit, setAvertissementConflit] = useState<string | null>(null)

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

  useEffect(() => setClasseId(null), [anneeId])

  const { data: matieres } = useQuery({
    queryKey: ['matieres', etablissementCourantId],
    queryFn: () => apiFetch<Matiere[]>(`/etablissements/${etablissementCourantId}/matieres`),
    enabled: !!etablissementCourantId,
  })

  const { data: enseignants } = useQuery({
    queryKey: ['utilisateurs', etablissementCourantId, 'enseignant'],
    queryFn: () =>
      apiFetch<{ data: { utilisateur: Utilisateur }[] }>(`/etablissements/${etablissementCourantId}/utilisateurs?role=enseignant`),
    enabled: !!etablissementCourantId,
  })

  const { data: creneaux, isLoading } = useQuery({
    queryKey: ['emploi-du-temps', classeId],
    queryFn: () => apiFetch<CreneauEmploiDuTemps[]>(`/classes/${classeId}/emploi-du-temps`),
    enabled: !!classeId,
  })

  const nomMatiere = (id: number) => matieres?.find((m) => m.id === id)?.nom ?? `#${id}`
  const nomEnseignant = (id: number) => {
    const u = enseignants?.data.find((r) => r.utilisateur.id === id)?.utilisateur
    return u ? `${u.prenom} ${u.nom}` : `#${id}`
  }

  if (!etablissementCourantId) return <p className="text-slate-500">Choisissez un établissement.</p>

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-slate-900">Emploi du temps</h1>
          {annees && (
            <select value={anneeId ?? ''} onChange={(e) => setAnneeId(Number(e.target.value))} className="rounded-md border border-slate-300 px-2 py-1 text-sm">
              {annees.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.libelle}
                </option>
              ))}
            </select>
          )}
          {classes && (
            <select value={classeId ?? ''} onChange={(e) => setClasseId(Number(e.target.value))} className="rounded-md border border-slate-300 px-2 py-1 text-sm">
              <option value="" disabled>
                {classes.length ? 'Choisir une classe…' : 'Aucune classe'}
              </option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.libelle}
                </option>
              ))}
            </select>
          )}
        </div>
        <button
          onClick={() => setFormulaireOuvert(true)}
          disabled={!classeId}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Nouveau créneau
        </button>
      </div>

      {avertissementConflit && (
        <p className="mb-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">{avertissementConflit}</p>
      )}

      {!classeId && <p className="text-slate-500">Choisissez une classe pour voir son emploi du temps.</p>}
      {isLoading && <p className="text-slate-500">Chargement…</p>}

      {creneaux && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2">Jour</th>
                <th className="px-4 py-2">Horaire</th>
                <th className="px-4 py-2">Matière</th>
                <th className="px-4 py-2">Enseignant</th>
                <th className="px-4 py-2">Salle</th>
              </tr>
            </thead>
            <tbody>
              {[...creneaux]
                .sort((a, b) => a.jour_semaine - b.jour_semaine || a.heure_debut.localeCompare(b.heure_debut))
                .map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-2">{JOURS[c.jour_semaine]}</td>
                    <td className="px-4 py-2 font-mono text-xs">
                      {c.heure_debut.slice(0, 5)}–{c.heure_fin.slice(0, 5)}
                    </td>
                    <td className="px-4 py-2">{nomMatiere(c.matiere_id)}</td>
                    <td className="px-4 py-2">{nomEnseignant(c.enseignant_id)}</td>
                    <td className="px-4 py-2 text-slate-500">{c.salle ?? '—'}</td>
                  </tr>
                ))}
              {creneaux.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    Aucun créneau pour cette classe.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {formulaireOuvert && classeId && matieres && enseignants && (
        <FormulaireCreneau
          classeId={classeId}
          matieres={matieres}
          enseignants={enseignants.data.map((r) => r.utilisateur)}
          onFerme={() => setFormulaireOuvert(false)}
          onCree={(nbConflits) => {
            queryClient.invalidateQueries({ queryKey: ['emploi-du-temps', classeId] })
            setAvertissementConflit(
              nbConflits > 0
                ? `Créneau créé, mais il chevauche ${nbConflits} autre(s) créneau(x) existant(s) pour le même enseignant ou la même salle — vérifiez avant de publier.`
                : null
            )
          }}
        />
      )}
    </div>
  )
}

function FormulaireCreneau({
  classeId,
  matieres,
  enseignants,
  onFerme,
  onCree,
}: {
  classeId: number
  matieres: Matiere[]
  enseignants: Utilisateur[]
  onFerme: () => void
  onCree: (nbConflits: number) => void
}) {
  const [matiereId, setMatiereId] = useState<number | ''>('')
  const [enseignantId, setEnseignantId] = useState<number | ''>('')
  const [jourSemaine, setJourSemaine] = useState(1)
  const [heureDebut, setHeureDebut] = useState('')
  const [heureFin, setHeureFin] = useState('')
  const [salle, setSalle] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)

  const creer = useMutation({
    mutationFn: () =>
      apiFetch<CreneauEmploiDuTemps>(`/classes/${classeId}/emploi-du-temps`, {
        method: 'POST',
        body: JSON.stringify({
          matiere_id: matiereId,
          enseignant_id: enseignantId,
          jour_semaine: jourSemaine,
          heure_debut: heureDebut,
          heure_fin: heureFin,
          salle: salle || undefined,
        }),
      }),
    onSuccess: (creneau) => {
      onCree(creneau.conflits?.length ?? 0)
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
        <h2 className="text-base font-semibold text-slate-900">Nouveau créneau</h2>
        {erreur && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Matière</label>
          <select required value={matiereId} onChange={(e) => setMatiereId(Number(e.target.value))} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="" disabled>
              {matieres.length ? 'Choisir…' : 'Aucune matière — créez-en une depuis Classes'}
            </option>
            {matieres.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nom}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Enseignant</label>
          <select required value={enseignantId} onChange={(e) => setEnseignantId(Number(e.target.value))} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="" disabled>
              {enseignants.length ? 'Choisir…' : 'Aucun enseignant — créez-en un depuis Comptes'}
            </option>
            {enseignants.map((u) => (
              <option key={u.id} value={u.id}>
                {u.prenom} {u.nom}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Jour</label>
          <select value={jourSemaine} onChange={(e) => setJourSemaine(Number(e.target.value))} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            {JOURS.slice(1).map((j, i) => (
              <option key={j} value={i + 1}>
                {j}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Début</label>
            <input required type="time" value={heureDebut} onChange={(e) => setHeureDebut(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Fin</label>
            <input required type="time" value={heureFin} onChange={(e) => setHeureFin(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Salle (optionnel)</label>
          <input value={salle} onChange={(e) => setSalle(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onFerme} className="rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100">
            Annuler
          </button>
          <button
            type="submit"
            disabled={creer.isPending || !matiereId || !enseignantId}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {creer.isPending ? 'Création…' : 'Créer'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
