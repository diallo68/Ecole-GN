import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../auth/AuthContext'
import { apiFetch } from '../lib/api'
import type { AnneeScolaire } from '../lib/types'

interface StatistiquesClasse {
  classe_id: number
  libelle: string
  niveau: string
  effectif: number
  taux_absenteisme: number | null
  taux_reussite: number | null
}

interface Statistiques {
  annee_scolaire_id: number
  effectif_total: number
  taux_recouvrement: number | null
  par_classe: StatistiquesClasse[]
}

/**
 * Cahier des charges §4.9 — jamais construit avant le 30 août 2026 malgré
 * mvp-scope.md qui le déclarait « Complet » (voir la note dans ce
 * document). Définitions des trois taux dans StatistiqueController.
 */
export function StatistiquesPage() {
  const { etablissementCourantId } = useAuth()
  const [anneeId, setAnneeId] = useState<number | null>(null)

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

  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['statistiques', etablissementCourantId, anneeId],
    queryFn: () =>
      apiFetch<Statistiques>(`/etablissements/${etablissementCourantId}/statistiques?annee_scolaire_id=${anneeId}`),
    enabled: !!etablissementCourantId && !!anneeId,
  })

  if (!etablissementCourantId) return <p className="text-slate-500">Choisissez un établissement.</p>

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <h1 className="text-lg font-semibold text-slate-900">Statistiques</h1>
        {annees && (
          <select
            value={anneeId ?? ''}
            onChange={(e) => setAnneeId(Number(e.target.value))}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            {annees.map((a) => (
              <option key={a.id} value={a.id}>
                {a.libelle}
              </option>
            ))}
          </select>
        )}
      </div>

      {isLoading && <p className="text-slate-500">Chargement…</p>}
      {isError && <p className="text-red-600">Impossible de charger les statistiques.</p>}

      {stats && (
        <>
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <CarteChiffre libelle="Effectif total" valeur={String(stats.effectif_total)} />
            <CarteChiffre
              libelle="Taux de recouvrement"
              valeur={stats.taux_recouvrement === null ? '—' : `${stats.taux_recouvrement}%`}
              sousLibelle="Sur les échéances de l'année"
            />
            <CarteChiffre libelle="Classes" valeur={String(stats.par_classe.length)} />
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2">Classe</th>
                  <th className="px-4 py-2">Effectif</th>
                  <th className="px-4 py-2">Absentéisme</th>
                  <th className="px-4 py-2">Réussite</th>
                </tr>
              </thead>
              <tbody>
                {stats.par_classe.map((c) => (
                  <tr key={c.classe_id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-2">
                      {c.libelle} <span className="text-slate-400">— {c.niveau}</span>
                    </td>
                    <td className="px-4 py-2">{c.effectif}</td>
                    <td className="px-4 py-2">
                      <Taux valeur={c.taux_absenteisme} inverse />
                    </td>
                    <td className="px-4 py-2">
                      <Taux valeur={c.taux_reussite} />
                    </td>
                  </tr>
                ))}
                {stats.par_classe.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                      Aucune classe pour cette année.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-xs text-slate-400">
            « — » : pas encore mesurable (aucune présence saisie, ou aucun bulletin généré pour la période la plus
            récente) — pas un taux à 0%.
          </p>
        </>
      )}
    </div>
  )
}

function CarteChiffre({ libelle, valeur, sousLibelle }: { libelle: string; valeur: string; sousLibelle?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{libelle}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{valeur}</p>
      {sousLibelle && <p className="mt-0.5 text-xs text-slate-400">{sousLibelle}</p>}
    </div>
  )
}

/** `inverse` : un taux élevé est défavorable (absentéisme), pas favorable (réussite) — la couleur suit ce sens. */
function Taux({ valeur, inverse = false }: { valeur: number | null; inverse?: boolean }) {
  if (valeur === null) return <span className="text-slate-400">—</span>

  const favorable = inverse ? valeur <= 10 : valeur >= 60
  const defavorable = inverse ? valeur > 20 : valeur < 40

  const couleur = favorable ? 'text-emerald-700' : defavorable ? 'text-red-600' : 'text-amber-700'

  return <span className={`font-medium ${couleur}`}>{valeur}%</span>
}
