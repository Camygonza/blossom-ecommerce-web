import { translate, type TFunction } from '@/i18n/i18n'
import type { ApiError } from './types'

function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null && 'status' in error
}

/**
 * Mensaje apto para mostrar al usuario a partir de cualquier error de RTK Query.
 * Sin `translateFn` devuelve español; los `detail` que manda el api llegan tal cual (sin traducir).
 */
export function errorMessage(error: unknown, fallback?: string, translateFn?: TFunction): string {
  const t: TFunction = translateFn ?? ((text, vars) => translate('es', text, vars))
  const other = fallback ?? t('Algo salió mal. Inténtalo de nuevo.')
  if (!isApiError(error)) return other
  if (error.status === 'NETWORK_ERROR')
    return t('No pudimos conectar con el servidor. Revisa tu conexión.')
  const problem = error.problem
  switch (error.status) {
    case 401:
      return problem?.detail ?? t('Tu sesión no es válida. Inicia sesión.')
    case 403:
      return t('No tienes permiso para esta acción.')
    case 404:
      return problem?.detail ?? t('No encontramos lo que buscas.')
    case 423:
    case 429: {
      const wait = problem?.retryAfterSeconds
      const hint = wait
        ? ` ${t('Inténtalo de nuevo en {minutes} min.', { minutes: Math.ceil(wait / 60) })}`
        : ''
      return `${problem?.detail ?? t('Demasiados intentos.')}${hint}`
    }
    default:
      if (error.status >= 500) return t('El servidor tuvo un problema. Inténtalo en unos minutos.')
      return problem?.detail ?? other
  }
}

/** Errores de validación por campo (400) para mostrarlos junto a cada input. */
export function fieldErrors(error: unknown): Record<string, string> {
  return isApiError(error) ? (error.problem?.errors ?? {}) : {}
}
