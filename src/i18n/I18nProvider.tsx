import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { readStorage, writeStorage } from '@/lib/storage'
import { I18nContext, translate, type I18nValue, type Lang } from './i18n'

const KEY = 'bloom.lang'

function initialLang(): Lang {
  const stored = readStorage(KEY)
  if (stored === 'es' || stored === 'en') return stored
  return typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('en')
    ? 'en'
    : 'es'
}

/** Idioma de la interfaz: se recuerda en localStorage y actualiza el atributo `lang` del documento. */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      setLang: (next) => {
        writeStorage(KEY, next)
        setLangState(next)
      },
      t: (text, vars) => translate(lang, text, vars),
    }),
    [lang],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
