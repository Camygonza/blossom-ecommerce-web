import { Box } from '@mui/material'
import { useT } from '@/i18n/i18n'

const PHOTOS = [
  { src: '/products/01.jpg', sx: { gridRow: 'span 2', aspectRatio: '3 / 4' } },
  { src: '/products/08.jpg', sx: { aspectRatio: '1 / 1' } },
  { src: '/products/04.jpg', sx: { aspectRatio: '1 / 1' } },
]

/** Collage de fotos del hero: una planta grande y dos tomas más pequeñas. */
export function HeroArt() {
  const t = useT()
  return (
    <Box
      role="img"
      aria-label={t('Plantas y flores')}
      sx={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 1.5 }}
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
