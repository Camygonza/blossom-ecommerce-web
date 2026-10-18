import type { Theme } from '@mui/material'

export type Tone = 'neutral' | 'info' | 'primary' | 'success' | 'warning' | 'error'

// Pares fondo/texto con contraste ≥ 4.5:1 en ambos modos (los colores «main» de MUI en chips rellenos no llegan).
const TONES: Record<Tone, { light: [string, string]; dark: [string, string] }> = {
  neutral: { light: ['#eceff1', '#37474f'], dark: ['#2c3338', '#cfd8dc'] },
  info: { light: ['#e1f0fa', '#0b4f7a'], dark: ['#123a54', '#b3dcf7'] },
  primary: { light: ['#dcedde', '#1f4d2b'], dark: ['#1f3d2a', '#bfe3c6'] },
  success: { light: ['#c8e6c9', '#1b5e20'], dark: ['#1d4a25', '#c8f0cc'] },
  warning: { light: ['#fff0cc', '#6b4500'], dark: ['#4d3a10', '#ffe3a3'] },
  error: { light: ['#fde0dc', '#8c1d12'], dark: ['#5a1d17', '#ffd0ca'] },
}

/** Estilo `sx` de un chip con colores accesibles según el modo claro/oscuro del tema. */
export const toneSx = (tone: Tone) => (theme: Theme) => {
  const [background, color] = TONES[tone][theme.palette.mode]
  return { backgroundColor: background, color, fontWeight: 600 }
}
