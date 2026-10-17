import axios, { isAxiosError } from 'axios'
import { readStorage, removeStorage, writeStorage } from '@/lib/storage'
import type { AuthResponse } from './types'

export const API_URL: string = import.meta.env.VITE_API_URL ?? '/api/v1'

const REFRESH_KEY = 'bloom.refreshToken'

/** El access token vive solo en memoria (D21); el refresh en localStorage para restaurar la sesión. */
let accessToken: string | null = null
let inflight: Promise<AuthResponse | null> | null = null

interface SessionListener {
  onStarted: (auth: AuthResponse) => void
  onEnded: () => void
}

let listener: SessionListener | null = null

export function setSessionListener(next: SessionListener): void {
  listener = next
}

export const getAccessToken = (): string | null => accessToken
export const getRefreshToken = (): string | null => readStorage(REFRESH_KEY)

export function startSession(auth: AuthResponse): void {
  accessToken = auth.accessToken
  writeStorage(REFRESH_KEY, auth.refreshToken)
  listener?.onStarted(auth)
}

export function endSession(): void {
  accessToken = null
  removeStorage(REFRESH_KEY)
  listener?.onEnded()
}

/**
 * Rota el refresh token. Es de un solo vuelo: el api revoca toda la familia si se reusa un refresh token, así que
 * dos llamadas simultáneas (StrictMode, dos peticiones 401 a la vez) deben compartir la misma petición.
 * Devuelve null si no hay sesión que renovar; solo cierra la sesión si el api rechaza el token.
 */
export function refreshSession(): Promise<AuthResponse | null> {
  if (inflight) return inflight
  const refreshToken = getRefreshToken()
  if (!refreshToken) return Promise.resolve(null)

  inflight = axios
    .post<AuthResponse>(`${API_URL}/auth/refresh`, { refreshToken })
    .then((response) => {
      startSession(response.data)
      return response.data
    })
    .catch((error: unknown) => {
      const rejected = isAxiosError(error) && error.response && error.response.status < 500
      if (rejected) endSession()
      return null
    })
    .finally(() => {
      inflight = null
    })
  return inflight
}
