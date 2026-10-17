import type { PaletteMode } from '@mui/material'
import { createContext, useContext } from 'react'

export interface ColorModeValue {
  mode: PaletteMode
  toggle: () => void
}

export const ColorModeContext = createContext<ColorModeValue>({
  mode: 'light',
  toggle: () => undefined,
})

export const useColorMode = () => useContext(ColorModeContext)
