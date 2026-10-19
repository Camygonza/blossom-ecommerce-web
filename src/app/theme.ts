import { alpha, createTheme, type PaletteMode } from '@mui/material'

const headingFont = '"Fraunces", Georgia, serif'
const bodyFont = '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif'

/**
 * Botánico cálido: verde profundo + terracota sobre crema, con fondos degradados y sombras suaves teñidas de verde.
 * Los tonos principales cumplen contraste AA con el texto que llevan encima.
 */
export function buildTheme(mode: PaletteMode) {
  const dark = mode === 'dark'
  const ink = dark ? '#000000' : '#1f3d31'
  const shadow = (blur: number, y: number, opacity: number) =>
    `0 ${y}px ${blur}px ${alpha(ink, opacity)}`

  return createTheme({
    palette: {
      mode,
      primary: dark
        ? { main: '#93c9a0', light: '#b5ddbf', dark: '#6fae82', contrastText: '#10231a' }
        : { main: '#2d6a4f', light: '#52967a', dark: '#1f4d38', contrastText: '#ffffff' },
      secondary: dark
        ? { main: '#f2a08e', contrastText: '#2b0f08' }
        : { main: '#b8452f', contrastText: '#ffffff' },
      background: dark
        ? { default: '#121714', paper: '#1a211d' }
        : { default: '#f8f4ea', paper: '#ffffff' },
      text: dark ? {} : { primary: '#1d2b24', secondary: '#4b5d54' },
      divider: dark ? 'rgba(255,255,255,0.10)' : 'rgba(31,61,49,0.12)',
    },
    shape: { borderRadius: 16 },
    typography: {
      fontFamily: bodyFont,
      h1: { fontFamily: headingFont, fontWeight: 600, letterSpacing: '-0.02em' },
      h2: { fontFamily: headingFont, fontWeight: 600, letterSpacing: '-0.015em' },
      h3: { fontFamily: headingFont, fontWeight: 600, letterSpacing: '-0.01em' },
      h4: { fontFamily: headingFont, fontWeight: 600 },
      h5: { fontFamily: headingFont, fontWeight: 600 },
      h6: { fontFamily: headingFont, fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundAttachment: 'fixed',
            backgroundImage: dark
              ? 'radial-gradient(900px 480px at 8% -8%, rgba(107,177,132,0.14), transparent 60%), radial-gradient(800px 420px at 100% 0%, rgba(227,148,119,0.10), transparent 60%)'
              : 'radial-gradient(900px 480px at 8% -8%, rgba(107,177,132,0.22), transparent 60%), radial-gradient(800px 420px at 100% 0%, rgba(227,148,119,0.20), transparent 60%)',
          },
        },
      },
      MuiPaper: { styleOverrides: { rounded: { borderRadius: 20 } } },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            borderRadius: 24,
            border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(31,61,49,0.08)'}`,
            boxShadow: `${shadow(2, 1, 0.06)}, ${shadow(28, 14, dark ? 0.35 : 0.1)}`,
            transition: 'transform .25s ease, box-shadow .25s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `${shadow(4, 2, 0.08)}, ${shadow(40, 22, dark ? 0.5 : 0.18)}`,
            },
            '@media (prefers-reduced-motion: reduce)': {
              transition: 'none',
              '&:hover': { transform: 'none' },
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 999, paddingInline: 20 },
          contained: {
            boxShadow: shadow(12, 4, dark ? 0.35 : 0.18),
            '&:hover': { boxShadow: shadow(18, 8, 0.24) },
          },
          sizeLarge: { paddingBlock: 12, paddingInline: 28 },
        },
      },
      MuiChip: { styleOverrides: { root: { borderRadius: 999 } } },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: alpha(dark ? '#121714' : '#f8f4ea', 0.82),
            backdropFilter: 'blur(14px)',
            color: dark ? '#e8efe9' : '#1d2b24',
          },
        },
      },
      MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 14 } } },
    },
  })
}
