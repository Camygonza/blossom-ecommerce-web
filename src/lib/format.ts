const money = new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD' })

export const formatMoney = (value: number): string => money.format(value)

export const formatWeight = (grams: number): string =>
  grams >= 1000 ? `${(grams / 1000).toLocaleString('es')} kg` : `${grams} g`

const date = new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' })

export const formatDate = (iso: string): string => date.format(new Date(iso))
