import { Box } from '@mui/material'
import { useState } from 'react'
import { ProductArt, type ArtProduct } from './ProductArt'

interface Props {
  product: ArtProduct & { imageUrl?: string | null }
  /** Relación de aspecto del contenedor (por defecto 4:3). */
  ratio?: string
  rounded?: number | string
}

/**
 * Foto del producto si existe y carga; si no (sin URL o enlace roto) se dibuja su ilustración.
 * Así el catálogo nunca muestra imágenes rotas.
 */
export function ProductImage({ product, ratio = '4 / 3', rounded = 0 }: Props) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const url = product.imageUrl
  const showPhoto = Boolean(url) && failedUrl !== url

  return (
    <Box
      sx={{
        aspectRatio: ratio,
        overflow: 'hidden',
        borderRadius: rounded,
        bgcolor: 'action.hover',
      }}
    >
      {showPhoto ? (
        <Box
          component="img"
          src={url ?? undefined}
          alt={product.name}
          loading="lazy"
          onError={() => setFailedUrl(url ?? null)}
          sx={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <ProductArt product={product} />
      )}
    </Box>
  )
}
