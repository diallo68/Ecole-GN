// Client API minimal — pas d'axios : fetch suffit pour ce volume d'appels,
// une dépendance de moins à faire descendre sur une connexion faible.

const BASE_URL = '/api/v1'

const TOKEN_KEY = 'ecole_gn_token'
const ETABLISSEMENT_KEY = 'ecole_gn_etablissement_id'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export function getEtablissementCourant(): number | null {
  const v = localStorage.getItem(ETABLISSEMENT_KEY)
  return v ? Number(v) : null
}

export function setEtablissementCourant(id: number | null): void {
  if (id) localStorage.setItem(ETABLISSEMENT_KEY, String(id))
  else localStorage.removeItem(ETABLISSEMENT_KEY)
}

export class ApiError extends Error {
  status: number
  code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

interface ApiOptions extends RequestInit {
  /** Force un établissement précis, sinon celui mémorisé (utile pour un
   * compte rattaché à plusieurs établissements — voir api-contract.md). */
  etablissementId?: number
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  if (options.body) headers.set('Content-Type', 'application/json')

  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const etablissementId = options.etablissementId ?? getEtablissementCourant()
  if (etablissementId) headers.set('X-Etablissement-Id', String(etablissementId))

  const reponse = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (reponse.status === 204) return undefined as T

  const corps = await reponse.json().catch(() => null)

  if (!reponse.ok) {
    const message = corps?.error?.message ?? `Erreur ${reponse.status}`
    throw new ApiError(message, reponse.status, corps?.error?.code)
  }

  return corps as T
}
