import { useEffect, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../auth/AuthContext'
import { ApiError, apiFetch } from '../lib/api'
import type { AnneeScolaire, Echeance, Eleve, FraisScolarite, Paiement, Pagination } from '../lib/types'
import { Modal } from '../components/Modal'

const LIBELLE_STATUT: Record<Echeance['statut'], string> = { paye: 'Payé', partiel: 'Partiel', impaye: 'Impayé' }
const COULEUR_STATUT: Record<Echeance['statut'], string> = {
  paye: 'bg-emerald-50 text-emerald-700',
  partiel: 'bg-amber-50 text-amber-700',
  impaye: 'bg-red-50 text-red-700',
}

export function FinancesPage() {
  const { etablissementCourantId } = useAuth()
  const queryClient = useQueryClient()
  const [anneeId, setAnneeId] = useState<number | null>(null)
  const [formulaireBaremeOuvert, setFormulaireBaremeOuvert] = useState(false)
  const [recherche, setRecherche] = useState('')
  const [eleveSelectionne, setEleveSelectionne] = useState<Eleve | null>(null)
  const [formulaireEcheanceOuvert, setFormulaireEcheanceOuvert] = useState(false)
  const [echeanceAEncaisser, setEcheanceAEncaisser] = useState<Echeance | null>(null)

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

  const { data: bareme } = useQuery({
    queryKey: ['frais-scolarite', etablissementCourantId],
    queryFn: () => apiFetch<FraisScolarite[]>(`/etablissements/${etablissementCourantId}/frais-scolarite`),
    enabled: !!etablissementCourantId,
  })
  const baremeDeLAnnee = bareme?.filter((f) => f.annee_scolaire_id === anneeId) ?? []

  const { data: resultatsRecherche } = useQuery({
    queryKey: ['eleves', etablissementCourantId, recherche],
    queryFn: () =>
      apiFetch<{ data: Eleve[]; meta: Pagination }>(
        `/etablissements/${etablissementCourantId}/eleves?q=${encodeURIComponent(recherche)}`
      ),
    enabled: !!etablissementCourantId && recherche.length >= 2,
  })

  const { data: echeances } = useQuery({
    queryKey: ['echeances', eleveSelectionne?.id],
    queryFn: () => apiFetch<Echeance[]>(`/eleves/${eleveSelectionne!.id}/echeances`),
    enabled: !!eleveSelectionne,
  })

  if (!etablissementCourantId) return <p className="text-slate-500">Choisissez un établissement.</p>

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-slate-900">Barème des frais</h1>
            {annees && (
              <select value={anneeId ?? ''} onChange={(e) => setAnneeId(Number(e.target.value))} className="rounded-md border border-slate-300 px-2 py-1 text-sm">
                {annees.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.libelle}
                  </option>
                ))}
              </select>
            )}
          </div>
          <button
            onClick={() => setFormulaireBaremeOuvert(true)}
            disabled={!anneeId}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Ajouter un niveau
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          {baremeDeLAnnee.map((f) => (
            <div key={f.id} className="rounded-lg border border-slate-200 bg-white px-4 py-2">
              <span className="font-medium">{f.niveau}</span>
              <span className="ml-2 text-slate-500">{Number(f.montant_total).toLocaleString('fr-FR')} GNF</span>
            </div>
          ))}
          {baremeDeLAnnee.length === 0 && <p className="text-sm text-slate-400">Aucun barème défini pour cette année.</p>}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Échéancier d'un élève</h2>

        <input
          type="text"
          placeholder="Rechercher un élève par nom, prénom ou matricule…"
          value={recherche}
          onChange={(e) => {
            setRecherche(e.target.value)
            setEleveSelectionne(null)
          }}
          className="mb-2 w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm"
        />

        {!eleveSelectionne && resultatsRecherche && (
          <div className="mb-4 max-w-sm divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
            {resultatsRecherche.data.map((eleve) => (
              <button
                key={eleve.id}
                onClick={() => setEleveSelectionne(eleve)}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
              >
                {eleve.nom} {eleve.prenom} <span className="text-slate-400">({eleve.matricule})</span>
              </button>
            ))}
            {resultatsRecherche.data.length === 0 && (
              <p className="px-3 py-2 text-sm text-slate-400">Aucun résultat.</p>
            )}
          </div>
        )}

        {eleveSelectionne && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                <span className="font-medium text-slate-900">
                  {eleveSelectionne.nom} {eleveSelectionne.prenom}
                </span>{' '}
                — {eleveSelectionne.matricule}
                <button onClick={() => setEleveSelectionne(null)} className="ml-2 text-xs text-blue-600 hover:underline">
                  changer
                </button>
              </p>
              <button
                onClick={() => setFormulaireEcheanceOuvert(true)}
                disabled={baremeDeLAnnee.length === 0}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                title={baremeDeLAnnee.length === 0 ? "Définissez d'abord un barème" : undefined}
              >
                Ajouter une échéance
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-2">Échéance</th>
                    <th className="px-4 py-2">Montant dû</th>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Statut</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {echeances?.map((ech) => (
                    <tr key={ech.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-2">{ech.libelle}</td>
                      <td className="px-4 py-2">{Number(ech.montant_du).toLocaleString('fr-FR')} GNF</td>
                      <td className="px-4 py-2">{ech.date_echeance}</td>
                      <td className="px-4 py-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs ${COULEUR_STATUT[ech.statut]}`}>
                          {LIBELLE_STATUT[ech.statut]}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right">
                        {ech.statut !== 'paye' && (
                          <button onClick={() => setEcheanceAEncaisser(ech)} className="text-xs font-medium text-blue-600 hover:underline">
                            Encaisser
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {echeances?.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                        Aucune échéance pour cet élève.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {formulaireBaremeOuvert && anneeId && (
        <FormulaireBareme
          etablissementId={etablissementCourantId}
          anneeScolaireId={anneeId}
          onFerme={() => setFormulaireBaremeOuvert(false)}
          onCree={() => queryClient.invalidateQueries({ queryKey: ['frais-scolarite', etablissementCourantId] })}
        />
      )}

      {formulaireEcheanceOuvert && eleveSelectionne && (
        <FormulaireEcheance
          eleveId={eleveSelectionne.id}
          bareme={baremeDeLAnnee}
          onFerme={() => setFormulaireEcheanceOuvert(false)}
          onCree={() => queryClient.invalidateQueries({ queryKey: ['echeances', eleveSelectionne.id] })}
        />
      )}

      {echeanceAEncaisser && (
        <FormulaireEncaissement
          echeance={echeanceAEncaisser}
          onFerme={() => setEcheanceAEncaisser(null)}
          onEncaisse={() => queryClient.invalidateQueries({ queryKey: ['echeances', eleveSelectionne?.id] })}
        />
      )}
    </div>
  )
}

function FormulaireBareme({
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
  const [montant, setMontant] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)

  const creer = useMutation({
    mutationFn: () =>
      apiFetch<FraisScolarite>(`/etablissements/${etablissementId}/frais-scolarite`, {
        method: 'POST',
        body: JSON.stringify({ niveau, annee_scolaire_id: anneeScolaireId, montant_total: Number(montant) }),
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
        <h2 className="text-base font-semibold text-slate-900">Ajouter un niveau au barème</h2>
        {erreur && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Niveau</label>
          <input required autoFocus placeholder="CM2" value={niveau} onChange={(e) => setNiveau(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Montant total (GNF)</label>
          <input required type="number" min="0" value={montant} onChange={(e) => setMontant(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onFerme} className="rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100">
            Annuler
          </button>
          <button type="submit" disabled={creer.isPending} className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
            {creer.isPending ? 'Création…' : 'Ajouter'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function FormulaireEcheance({
  eleveId,
  bareme,
  onFerme,
  onCree,
}: {
  eleveId: number
  bareme: FraisScolarite[]
  onFerme: () => void
  onCree: () => void
}) {
  const [fraisScolariteId, setFraisScolariteId] = useState(bareme[0]?.id ?? 0)
  const [libelle, setLibelle] = useState('')
  const [montant, setMontant] = useState('')
  const [dateEcheance, setDateEcheance] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)

  const creer = useMutation({
    mutationFn: () =>
      apiFetch<Echeance>(`/eleves/${eleveId}/echeances`, {
        method: 'POST',
        body: JSON.stringify({ frais_scolarite_id: fraisScolariteId, libelle, montant_du: Number(montant), date_echeance: dateEcheance }),
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
        <h2 className="text-base font-semibold text-slate-900">Ajouter une échéance</h2>
        {erreur && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Barème (niveau)</label>
          <select value={fraisScolariteId} onChange={(e) => setFraisScolariteId(Number(e.target.value))} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            {bareme.map((f) => (
              <option key={f.id} value={f.id}>
                {f.niveau} — {Number(f.montant_total).toLocaleString('fr-FR')} GNF
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Libellé</label>
          <input required autoFocus placeholder="1ère tranche" value={libelle} onChange={(e) => setLibelle(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Montant dû (GNF)</label>
            <input required type="number" min="0" value={montant} onChange={(e) => setMontant(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Date d'échéance</label>
            <input required type="date" value={dateEcheance} onChange={(e) => setDateEcheance(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onFerme} className="rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100">
            Annuler
          </button>
          <button type="submit" disabled={creer.isPending} className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
            {creer.isPending ? 'Création…' : 'Ajouter'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function FormulaireEncaissement({
  echeance,
  onFerme,
  onEncaisse,
}: {
  echeance: Echeance
  onFerme: () => void
  onEncaisse: () => void
}) {
  const [montant, setMontant] = useState(echeance.montant_du)
  const [mode, setMode] = useState<'especes' | 'cheque'>('especes')
  const [erreur, setErreur] = useState<string | null>(null)
  const [recu, setRecu] = useState<Paiement | null>(null)

  const encaisser = useMutation({
    mutationFn: () =>
      apiFetch<Paiement>(`/echeances/${echeance.id}/paiements`, {
        method: 'POST',
        body: JSON.stringify({ montant: Number(montant), mode }),
      }),
    onSuccess: (paiement) => {
      onEncaisse()
      setRecu(paiement)
    },
    onError: (err) => setErreur(err instanceof ApiError ? err.message : "Échec de l'encaissement."),
  })

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setErreur(null)
    encaisser.mutate()
  }

  if (recu) {
    return (
      <Modal>
        <div className="space-y-3 text-center">
          <p className="text-2xl">✓</p>
          <h2 className="text-base font-semibold text-slate-900">Paiement encaissé</h2>
          <p className="text-sm text-slate-600">
            Reçu <span className="font-mono">{recu.reference_recu}</span> — {Number(recu.montant).toLocaleString('fr-FR')} GNF
          </p>
          <button onClick={onFerme} className="mt-2 rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
            Fermer
          </button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal>
      <form onSubmit={onSubmit} className="space-y-4">
        <h2 className="text-base font-semibold text-slate-900">Encaisser — {echeance.libelle}</h2>
        {erreur && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Montant (GNF)</label>
          <input required type="number" min="0.01" step="0.01" autoFocus value={montant} onChange={(e) => setMontant(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Mode de paiement</label>
          <select value={mode} onChange={(e) => setMode(e.target.value as 'especes' | 'cheque')} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="especes">Espèces</option>
            <option value="cheque">Chèque</option>
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onFerme} className="rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100">
            Annuler
          </button>
          <button type="submit" disabled={encaisser.isPending} className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
            {encaisser.isPending ? 'Encaissement…' : 'Encaisser'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
