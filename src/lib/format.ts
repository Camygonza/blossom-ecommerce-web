import type { Lang } from '@/i18n/i18n'

const money = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

/** Los precios siempre van en pesos colombianos, sin importar el idioma de la interfaz. */
export const formatMoney = (value: number): string => money.format(value)

export const formatWeight = (grams: number): string =>
  grams >= 1000 ? `${(grams / 1000).toLocaleString('es')} kg` : `${grams} g`

const DATE_LOCALE: Record<Lang, string> = { es: 'es-CO', en: 'en-US' }

const dateFormats: Record<Lang, Intl.DateTimeFormat> = {
  es: new Intl.DateTimeFormat(DATE_LOCALE.es, { dateStyle: 'medium', timeStyle: 'short' }),
  en: new Intl.DateTimeFormat(DATE_LOCALE.en, { dateStyle: 'medium', timeStyle: 'short' }),
}

export const formatDate = (iso: string, lang: Lang = 'es'): string =>
  dateFormats[lang].format(new Date(iso))
