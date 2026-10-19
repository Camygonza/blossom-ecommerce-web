import { createContext, useContext } from 'react'
import { en } from './en'

export type Lang = 'es' | 'en'

/** Variables de interpolación: `t('Hola, {name}', { name })`. */
export type Vars = Record<string, string | number>

export type TFunction = (text: string, vars?: Vars) => string

function interpolate(text: string, vars?: Vars): string {
  if (!vars) return text
  return text.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  )
}

/**
 * El texto en español es la clave: en español se muestra tal cual y en inglés se busca en `en.ts`.
 * Si falta la traducción se muestra el español (una prueba vigila que no falte ninguna).
 */
export function translate(lang: Lang, text: string, vars?: Vars): string {
  return interpolate(lang === 'en' ? (en[text] ?? text) : text, vars)
}

export interface I18nValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: TFunction
}

export const I18nContext = createContext<I18nValue>({
  lang: 'es',
  setLang: () => undefined,
  t: (text, vars) => translate('es', text, vars),
})

export const useI18n = () => useContext(I18nContext)

/** Atajo para componentes que solo necesitan traducir. */
export const useT = (): TFunction => useContext(I18nContext).t
