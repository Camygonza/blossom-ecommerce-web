import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import type { Product } from '@/api/types'
import { formatMoney } from '@/lib/format'

export function StockChip({ product }: { product: Product }) {
  if (product.type === 'DIGITAL')
    return <Chip size="small" color="secondary" variant="outlined" label="Digital" />
  const stock = product.stock ?? 0
  if (stock === 0) return <Chip size="small" color="error" label="Agotado" />
  if (stock <= 5) return <Chip size="small" color="warning" label={`Quedan ${stock}`} />
  return null
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardActionArea
        component={RouterLink}
        to={`/productos/${product.id}`}
        sx={{ height: '100%' }}
      >
        {product.imageUrl ? (
          <CardMedia
            component="img"
            image={product.imageUrl}
            alt={product.name}
            loading="lazy"
            sx={{ aspectRatio: '4 / 3', objectFit: 'cover' }}
          />
        ) : (
          <Skeleton
            variant="rectangular"
            animation={false}
            sx={{ aspectRatio: '4 / 3', height: 'auto' }}
          />
        )}
        <CardContent>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1, minHeight: 24 }}>
            <Typography variant="caption" color="text.secondary">
              {product.category.name}
            </Typography>
            <StockChip product={product} />
          </Stack>
          <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
            {product.name}
          </Typography>
          <Typography variant="h6" component="p" color="primary" sx={{ mt: 0.5 }}>
            {formatMoney(product.price)}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

export function ProductCardSkeleton() {
  return (
    <Card sx={{ height: '100%' }} aria-hidden="true">
      <Skeleton variant="rectangular" sx={{ aspectRatio: '4 / 3', height: 'auto' }} />
      <CardContent>
        <Skeleton width="40%" />
        <Skeleton width="80%" height={28} />
        <Skeleton width="30%" height={32} />
      </CardContent>
    </Card>
  )
}
