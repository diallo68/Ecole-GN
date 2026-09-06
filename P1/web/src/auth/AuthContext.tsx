import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { apiFetch, getToken, setEtablissementCourant, setToken } from '../lib/api'
import type { Rattachement, Utilisateur } from '../lib/types'

interface AuthState {
  utilisateur: Utilisateur | null
  rattachements: Rattachement[]
  etablissementCourantId: number | null
  /** Rôle du rattachement à l'établissement courant — miroir de
   * AuthService.roleCourant côté mobile (lib/auth/auth_service.dart). */
  roleCourant: string | null
  chargement: boolean
  connecte: (identifiant: string, motDePasse: string) => Promise<void>
  deconnecte: () => Promise<void>
  choisirEtablissement: (id: number) => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null)
  const [rattachements, setRattachements] = useState<Rattachement[]>([])
  const [etablissementCourantId, setEtablissementCourantId] = useState<number | null>(null)
  const [chargement, setChargement] = useState(true)

  const chargerProfil = useCallback(async () => {
    const reponse = await apiFetch<{ utilisateur: Utilisateur; rattachements: Rattachement[] }>('/auth/me')
    setUtilisateur(reponse.utilisateur)
    setRattachements(reponse.rattachements)

    // Un seul établissement actif : on le sélectionne d'office, comme le
    // fait déjà ResolveEtablissementContext côté API pour ce même cas.
    if (reponse.rattachements.length === 1) {
      const id = reponse.rattachements[0].etablissement.id
      setEtablissementCourant(id)
      setEtablissementCourantId(id)
    }
  }, [])

  useEffect(() => {
    if (!getToken()) {
      setChargement(false)
      return
    }
    chargerProfil().finally(() => setChargement(false))
  }, [chargerProfil])

  async function connecte(identifiant: string, motDePasse: string) {
    const reponse = await apiFetch<{ token: string; utilisateur: Utilisateur }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifiant, mot_de_passe: motDePasse }),
    })
    setToken(reponse.token)
    await chargerProfil()
  }

  async function deconnecte() {
    try {
      await apiFetch('/auth/logout', { method: 'POST' })
    } finally {
      setToken(null)
      setEtablissementCourant(null)
      setUtilisateur(null)
      setRattachements([])
      setEtablissementCourantId(null)
    }
  }

  function choisirEtablissement(id: number) {
    setEtablissementCourant(id)
    setEtablissementCourantId(id)
  }

  const roleCourant = rattachements.find((r) => r.etablissement.id === etablissementCourantId)?.role ?? null

  return (
    <AuthContext.Provider
      value={{
        utilisateur,
        rattachements,
        etablissementCourantId,
        roleCourant,
        chargement,
        connecte,
        deconnecte,
        choisirEtablissement,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé sous AuthProvider')
  return ctx
}
