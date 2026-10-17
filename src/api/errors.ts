import type { ApiError } from './types'

function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null && 'status' in error
}

/** Mensaje en español apto para mostrar al usuario a partir de cualquier error de RTK Query. */
export function errorMessage(
  error: unknown,
  fallback = 'Algo salió mal. Inténtalo de nuevo.',
): string {
  if (!isApiError(error)) return fallback
  if (error.status === 'NETWORK_ERROR')
    return 'No pudimos conectar con el servidor. Revisa tu conexión.'
  const problem = error.problem
  switch (error.status) {
    case 401:
      return problem?.detail ?? 'Tu sesión no es válida. Inicia sesión.'
    case 403:
      return 'No tienes permiso para esta acción.'
    case 404:
      return problem?.detail ?? 'No encontramos lo que buscas.'
    case 423:
    case 429: {
      const wait = problem?.retryAfterSeconds
      const hint = wait ? ` Inténtalo de nuevo en ${Math.ceil(wait / 60)} min.` : ''
      return `${problem?.detail ?? 'Demasiados intentos.'}${hint}`
    }
    default:
      if (error.status >= 500) return 'El servidor tuvo un problema. Inténtalo en unos minutos.'
      return problem?.detail ?? fallback
  }
}

/** Errores de validación por campo (400) para mostrarlos junto a cada input. */
export function fieldErrors(error: unknown): Record<string, string> {
  return isApiError(error) ? (error.problem?.errors ?? {}) : {}
}
