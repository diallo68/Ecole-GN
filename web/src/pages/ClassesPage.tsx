import { useEffect, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../auth/AuthContext'
import { ApiError, apiFetch } from '../lib/api'
import type { AnneeScolaire, Classe, ClasseMatiereEnseignant, Inscription, Matiere, Utilisateur } from '../lib/types'
import { Modal } from '../components/Modal'

export function ClassesPage() {
  const { etablissementCourantId } = useAuth()
  const queryClient = useQueryClient()
  const [anneeSelectionnee, setAnneeSelectionnee] = useState<number | null>(null)
  const [classeSelectionnee, setClasseSelectionnee] = useState<Classe | null>(null)
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)

  const { data: annees } = useQuery({
    queryKey: ['annees-scolaires', etablissementCourantId],
    queryFn: () => apiFetch<AnneeScolaire[]>(`/etablissements/${etablissementCourantId}/annees-scolaires`),
    enabled: !!etablissementCourantId,
  })

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
              onChange={(e) => {
                setAnneeSelectionnee(Number(e.target.value))
                setClasseSelectionnee(null)
              }}
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
            <button
              key={classe.id}
              onClick={() => setClasseSelectionnee(classe)}
              className={`rounded-lg border bg-white p-4 text-left transition ${
                classeSelectionnee?.id === classe.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <p className="font-medium text-slate-900">{classe.libelle}</p>
              <p className="text-sm text-slate-500">{classe.niveau}</p>
              {classe.effectif_max && <p className="mt-1 text-xs text-slate-400">Effectif max : {classe.effectif_max}</p>}
            </button>
          ))}
          {classes.length === 0 && (
            <p className="col-span-full py-6 text-center text-slate-400">Aucune classe pour cette année.</p>
          )}
        </div>
      )}

      {classeSelectionnee && (
        <>
          <ElevesDeLaClasse etablissementId={etablissementCourantId} classe={classeSelectionnee} />
          <MatieresDeLaClasse etablissementId={etablissementCourantId} classe={classeSelectionnee} />
        </>
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

function ElevesDeLaClasse({ etablissementId, classe }: { etablissementId: number; classe: Classe }) {
  const queryClient = useQueryClient()
  const [inscriptionATransferer, setInscriptionATransferer] = useState<Inscription | null>(null)

  const { data: inscriptions, isLoading } = useQuery({
    queryKey: ['classe-inscriptions', classe.id],
    queryFn: () => apiFetch<Inscription[]>(`/classes/${classe.id}/inscriptions`),
  })

  return (
    <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">Élèves — {classe.libelle}</h2>

      {isLoading && <p className="text-sm text-slate-500">Chargement…</p>}

      <ul className="divide-y divide-slate-100">
        {inscriptions?.map((inscription) => (
          <li key={inscription.id} className="flex items-center justify-between py-2 text-sm">
            <span>
              {inscription.eleve?.nom} {inscription.eleve?.prenom}
              <span className="ml-2 font-mono text-xs text-slate-400">{inscription.eleve?.matricule}</span>
            </span>
            <button
              onClick={() => setInscriptionATransferer(inscription)}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Transférer
            </button>
          </li>
        ))}
        {inscriptions?.length === 0 && <p className="py-4 text-center text-sm text-slate-400">Aucun élève inscrit.</p>}
      </ul>

      {inscriptionATransferer && (
        <FormulaireTransfert
          etablissementId={etablissementId}
          classeActuelle={classe}
          inscription={inscriptionATransferer}
          onFerme={() => setInscriptionATransferer(null)}
          onTransfere={() => {
            queryClient.invalidateQueries({ queryKey: ['classe-inscriptions', classe.id] })
          }}
        />
      )}
    </div>
  )
}

function FormulaireTransfert({
  etablissementId,
  classeActuelle,
  inscription,
  onFerme,
  onTransfere,
}: {
  etablissementId: number
  classeActuelle: Classe
  inscription: Inscription
  onFerme: () => void
  onTransfere: () => void
}) {
  const [classeCibleId, setClasseCibleId] = useState<number | ''>('')
  const [erreur, setErreur] = useState<string | null>(null)

  // Même année scolaire uniquement — PATCH /inscriptions/{id} le refuse
  // sinon (voir openapi.yaml).
  const { data: classes } = useQuery({
    queryKey: ['classes', etablissementId, classeActuelle.annee_scolaire_id],
    queryFn: () =>
      apiFetch<Classe[]>(`/etablissements/${etablissementId}/classes?annee_scolaire_id=${classeActuelle.annee_scolaire_id}`),
  })
  const classesCibles = classes?.filter((c) => c.id !== classeActuelle.id) ?? []

  const transferer = useMutation({
    mutationFn: () =>
      apiFetch(`/inscriptions/${inscription.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ classe_id: classeCibleId }),
      }),
    onSuccess: () => {
      onTransfere()
      onFerme()
    },
    onError: (err) => setErreur(err instanceof ApiError ? err.message : 'Échec du transfert.'),
  })

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setErreur(null)
    if (classeCibleId) transferer.mutate()
  }

  return (
    <Modal>
      <form onSubmit={onSubmit} className="space-y-4">
        <h2 className="text-base font-semibold text-slate-900">
          Transférer {inscription.eleve?.nom} {inscription.eleve?.prenom}
        </h2>
        <p className="text-sm text-slate-500">Actuellement en {classeActuelle.libelle}.</p>

        {erreur && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Nouvelle classe</label>
          <select
            required
            autoFocus
            value={classeCibleId}
            onChange={(e) => setClasseCibleId(Number(e.target.value))}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="" disabled>
              {classesCibles.length ? 'Choisir…' : 'Aucune autre classe pour cette année'}
            </option>
            {classesCibles.map((c) => (
              <option key={c.id} value={c.id}>
                {c.libelle}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onFerme} className="rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100">
            Annuler
          </button>
          <button
            type="submit"
            disabled={!classeCibleId || transferer.isPending}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {transferer.isPending ? 'Transfert…' : 'Transférer'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function MatieresDeLaClasse({ etablissementId, classe }: { etablissementId: number; classe: Classe }) {
  const queryClient = useQueryClient()
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)

  const { data: affectations, isLoading } = useQuery({
    queryKey: ['classe-matieres', classe.id],
    queryFn: () => apiFetch<ClasseMatiereEnseignant[]>(`/classes/${classe.id}/matieres`),
  })

  return (
    <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Matières enseignées — {classe.libelle}</h2>
        <button onClick={() => setFormulaireOuvert(true)} className="text-sm font-medium text-blue-600 hover:underline">
          Affecter un enseignant
        </button>
      </div>

      {isLoading && <p className="text-sm text-slate-500">Chargement…</p>}

      <ul className="divide-y divide-slate-100">
        {affectations?.map((a) => (
          <li key={a.id} className="flex items-center justify-between py-2 text-sm">
            <span className="font-medium">{a.matiere.nom}</span>
            <span className="text-slate-500">
              {a.enseignant.prenom} {a.enseignant.nom}
              {a.coefficient && <span className="ml-2 text-xs text-slate-400">coef. {a.coefficient}</span>}
            </span>
          </li>
        ))}
        {affectations?.length === 0 && <p className="py-4 text-center text-sm text-slate-400">Aucune matière affectée.</p>}
      </ul>

      {formulaireOuvert && (
        <FormulaireAffectation
          etablissementId={etablissementId}
          classeId={classe.id}
          onFerme={() => setFormulaireOuvert(false)}
          onAffecte={() => queryClient.invalidateQueries({ queryKey: ['classe-matieres', classe.id] })}
        />
      )}
    </div>
  )
}

function FormulaireAffectation({
  etablissementId,
  classeId,
  onFerme,
  onAffecte,
}: {
  etablissementId: number
  classeId: number
  onFerme: () => void
  onAffecte: () => void
}) {
  const queryClient = useQueryClient()
  const [matiereId, setMatiereId] = useState<number | ''>('')
  const [enseignantId, setEnseignantId] = useState<number | ''>('')
  const [coefficient, setCoefficient] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)
  const [nouvelleMatiereOuvert, setNouvelleMatiereOuvert] = useState(false)
  const [nouvelleMatiereNom, setNouvelleMatiereNom] = useState('')

  const { data: matieres } = useQuery({
    queryKey: ['matieres', etablissementId],
    queryFn: () => apiFetch<Matiere[]>(`/etablissements/${etablissementId}/matieres`),
  })

  const creerMatiere = useMutation({
    mutationFn: () =>
      apiFetch<Matiere>(`/etablissements/${etablissementId}/matieres`, {
        method: 'POST',
        body: JSON.stringify({ nom: nouvelleMatiereNom }),
      }),
    onSuccess: async (matiere) => {
      await queryClient.invalidateQueries({ queryKey: ['matieres', etablissementId] })
      setMatiereId(matiere.id)
      setNouvelleMatiereOuvert(false)
      setNouvelleMatiereNom('')
    },
    onError: (err) => setErreur(err instanceof ApiError ? err.message : 'Échec de la création de la matière.'),
  })

  const { data: enseignants } = useQuery({
    queryKey: ['utilisateurs', etablissementId, 'enseignant'],
    queryFn: () =>
      apiFetch<{ data: { utilisateur: Utilisateur }[] }>(`/etablissements/${etablissementId}/utilisateurs?role=enseignant`),
  })

  const affecter = useMutation({
    mutationFn: () =>
      apiFetch(`/classes/${classeId}/matieres/${matiereId}/enseignant`, {
        method: 'PUT',
        body: JSON.stringify({ enseignant_id: enseignantId, coefficient: coefficient ? Number(coefficient) : undefined }),
      }),
    onSuccess: () => {
      onAffecte()
      onFerme()
    },
    onError: (err) => setErreur(err instanceof ApiError ? err.message : "Échec de l'affectation."),
  })

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setErreur(null)
    affecter.mutate()
  }

  const enseignantManquant = enseignants && enseignants.data.length === 0

  return (
    <Modal>
      <form onSubmit={onSubmit} className="space-y-4">
        <h2 className="text-base font-semibold text-slate-900">Affecter un enseignant</h2>
        {erreur && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>}
        {enseignantManquant && (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">Créez d'abord un compte enseignant (page Comptes).</p>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Matière</label>
          {nouvelleMatiereOuvert ? (
            <div className="flex gap-2">
              <input
                autoFocus
                placeholder="Nom de la matière"
                value={nouvelleMatiereNom}
                onChange={(e) => setNouvelleMatiereNom(e.target.value)}
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => creerMatiere.mutate()}
                disabled={!nouvelleMatiereNom || creerMatiere.isPending}
                className="rounded-md bg-slate-800 px-3 py-2 text-sm text-white disabled:opacity-50"
              >
                Créer
              </button>
              <button type="button" onClick={() => setNouvelleMatiereOuvert(false)} className="text-sm text-slate-500">
                Annuler
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <select required value={matiereId} onChange={(e) => setMatiereId(Number(e.target.value))} className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm">
                <option value="" disabled>
                  {matieres?.length ? 'Choisir…' : 'Aucune matière'}
                </option>
                {matieres?.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nom}
                  </option>
                ))}
              </select>
              <button type="button" onClick={() => setNouvelleMatiereOuvert(true)} className="whitespace-nowrap text-sm text-blue-600 hover:underline">
                + matière
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Enseignant</label>
          <select required value={enseignantId} onChange={(e) => setEnseignantId(Number(e.target.value))} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="" disabled>
              Choisir…
            </option>
            {enseignants?.data.map((r) => (
              <option key={r.utilisateur.id} value={r.utilisateur.id}>
                {r.utilisateur.prenom} {r.utilisateur.nom}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Coefficient (optionnel)</label>
          <input type="number" min="0" step="0.5" value={coefficient} onChange={(e) => setCoefficient(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onFerme} className="rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100">
            Annuler
          </button>
          <button
            type="submit"
            disabled={affecter.isPending || !matiereId || !enseignantId}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {affecter.isPending ? 'Affectation…' : 'Affecter'}
          </button>
        </div>
      </form>
    </Modal>
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
