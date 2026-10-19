import { Box } from '@mui/material'
import { useT } from '@/i18n/i18n'

const PHOTOS = [
  { src: '/products/01.jpg', sx: { gridRow: 'span 2' } },
  { src: '/products/08.jpg', sx: {} },
  { src: '/products/04.jpg', sx: {} },
]

/** Collage de fotos del hero: una planta grande y dos tomas más pequeñas. */
export function HeroArt() {
  const t = useT()
  return (
    <Box
      role="img"
      aria-label={t('Plantas y flores')}
      sx={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)',
        gridTemplateRows: 'repeat(2, minmax(0, 1fr))',
        gap: 1.5,
        aspectRatio: '1.1 / 1',
      }}
    >
      {PHOTOS.map(({ src, sx }) => (
        <Box
          key={src}
          aria-hidden="true"
          sx={{
            ...sx,
            borderRadius: 4,
            backgroundImage: `url(${src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            boxShadow: '0 18px 40px -18px rgba(0,0,0,0.5)',
          }}
        />
      ))}
    </Box>
  )
}
