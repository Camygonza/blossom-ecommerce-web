import { createTheme, type PaletteMode } from '@mui/material'

const headingFont = '"Fraunces", Georgia, serif'
const bodyFont = '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif'

/** Verde salvia + coral. Los tonos principales cumplen contraste AA con el texto que llevan encima. */
export function buildTheme(mode: PaletteMode) {
  const dark = mode === 'dark'
  return createTheme({
    palette: {
      mode,
      primary: dark
        ? { main: '#93c9a0', contrastText: '#10231a' }
        : { main: '#3f6b4b', contrastText: '#ffffff' },
      secondary: dark
        ? { main: '#f2a08e', contrastText: '#2b0f08' }
        : { main: '#b8452f', contrastText: '#ffffff' },
      background: dark
        ? { default: '#121714', paper: '#1a211d' }
        : { default: '#f7f5f0', paper: '#ffffff' },
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: bodyFont,
      h1: { fontFamily: headingFont, fontWeight: 600 },
      h2: { fontFamily: headingFont, fontWeight: 600 },
      h3: { fontFamily: headingFont, fontWeight: 600 },
      h4: { fontFamily: headingFont, fontWeight: 600 },
      h5: { fontFamily: headingFont, fontWeight: 600 },
      h6: { fontFamily: headingFont, fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiButtonBase: { defaultProps: { disableRipple: false } },
      MuiCard: { defaultProps: { variant: 'outlined' } },
    },
  })
}
