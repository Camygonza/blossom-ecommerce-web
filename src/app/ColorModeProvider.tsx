import { CssBaseline, ThemeProvider, useMediaQuery, type PaletteMode } from '@mui/material'
import { useMemo, useState, type ReactNode } from 'react'
import { ColorModeContext, type ColorModeValue } from './colorMode'
import { readStorage, writeStorage } from '@/lib/storage'
import { buildTheme } from './theme'

const KEY = 'bloom.colorMode'

export function ColorModeProvider({ children }: { children: ReactNode }) {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
  const [stored, setStored] = useState<PaletteMode | null>(() => {
    const value = readStorage(KEY)
    return value === 'light' || value === 'dark' ? value : null
  })
  const mode: PaletteMode = stored ?? (prefersDark ? 'dark' : 'light')

  const value = useMemo<ColorModeValue>(
    () => ({
      mode,
      toggle: () => {
        const next: PaletteMode = mode === 'dark' ? 'light' : 'dark'
        writeStorage(KEY, next)
        setStored(next)
      },
    }),
    [mode],
  )
  const theme = useMemo(() => buildTheme(mode), [mode])

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}
