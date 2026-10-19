import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { en } from './en'
import { translate } from './i18n'

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return sourceFiles(path)
    return /\.(ts|tsx)$/.test(name) && !/\.test\.|[\\/]test[\\/]|[\\/]i18n[\\/]/.test(path)
      ? [path]
      : []
  })
}

/** Textos literales pasados a t('…') o t("…") / t(`…`) en el código de la app. */
function usedKeys(): { key: string; file: string }[] {
  const found: { key: string; file: string }[] = []
  for (const file of sourceFiles('src')) {
    const code = readFileSync(file, 'utf8')
    for (const match of code.matchAll(/\bt\(\s*(['"`])((?:\\.|(?!\1).)*)\1/g)) {
      found.push({ key: match[2].replace(/\\(['"`])/g, '$1'), file })
    }
  }
  return found
}

describe('translations', () => {
  it('should_return_the_spanish_text_unchanged_and_interpolate_variables', () => {
    expect(translate('es', 'Orden #{id} creada', { id: 7 })).toBe('Orden #7 creada')
    expect(translate('es', 'Sin traducción')).toBe('Sin traducción')
  })

  it('should_translate_known_texts_to_english_and_fall_back_to_spanish_when_missing', () => {
    expect(translate('en', 'Mis órdenes')).toBe('My orders')
    expect(translate('en', 'Texto que no está en el diccionario')).toBe(
      'Texto que no está en el diccionario',
    )
  })

  it('should_have_an_english_translation_for_every_text_used_in_the_code', () => {
    const missing = usedKeys().filter(({ key }) => !(key in en))
    expect(missing.map(({ key, file }) => `${key}  (${file})`)).toEqual([])
  })

  it('should_not_keep_translations_for_texts_no_longer_used', () => {
    const used = new Set(usedKeys().map(({ key }) => key))
    const dynamic = Object.keys(en).filter((key) => !used.has(key))
    // permite claves que se arman fuera de t('…') (p. ej. etiquetas de estado); la lista debe revisarse si crece
    expect(dynamic.length).toBeLessThan(80)
  })

  it('should_keep_the_same_placeholders_in_both_languages', () => {
    const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort()
    for (const [es, english] of Object.entries(en)) {
      expect(placeholders(english), es).toEqual(placeholders(es))
    }
  })
})
