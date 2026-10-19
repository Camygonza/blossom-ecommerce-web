import AddShoppingCart from '@mui/icons-material/AddShoppingCart'
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Chip,
  Skeleton,
  Typography,
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import type { Product } from '@/api/types'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { toneSx } from '@/components/toneChip'
import { itemAdded, maxQuantityFor } from '@/features/cart/cartSlice'
import { toastShown } from '@/features/ui/uiSlice'
import { useT } from '@/i18n/i18n'
import { formatMoney } from '@/lib/format'
import { ProductImage } from './art/ProductImage'

export function StockChip({ product }: { product: Product }) {
  const t = useT()
  if (product.type === 'DIGITAL')
    return <Chip size="small" label={t('Digital')} sx={toneSx('info')} />
  const stock = product.stock ?? 0
  if (stock === 0) return <Chip size="small" label={t('Agotado')} sx={toneSx('error')} />
  if (stock <= 5)
    return <Chip size="small" label={t('Quedan {stock}', { stock })} sx={toneSx('warning')} />
  return null
}

function QuickAdd({ product }: { product: Product }) {
  const t = useT()
  const dispatch = useAppDispatch()
  const inCart = useAppSelector(
    (state) => state.cart.items.find((item) => item.productId === product.id)?.quantity ?? 0,
  )
  const unavailable = maxQuantityFor(product) - inCart < 1
  const label =
    maxQuantityFor(product) < 1
      ? t('Agotado')
      : inCart > 0 && unavailable
        ? t('En tu carrito')
        : t('Agregar')
  return (
    <Button
      size="small"
      variant={unavailable ? 'outlined' : 'contained'}
      startIcon={<AddShoppingCart />}
      disabled={unavailable}
      // el nombre accesible empieza por el texto visible (WCAG 2.5.3)
      aria-label={
        unavailable
          ? `${label}: ${t(product.name)}`
          : t('Agregar {name} al carrito', { name: t(product.name) })
      }
      onClick={() => {
        dispatch(itemAdded({ product }))
        dispatch(toastShown(t('{name} se agregó al carrito', { name: t(product.name) }), 'success'))
      }}
    >
      {label}
    </Button>
  )
}

export function ProductCard({ product }: { product: Product }) {
  const t = useT()
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '& .art svg, & .art img': { transition: 'transform .5s ease' },
        '&:hover .art svg, &:hover .art img': { transform: 'scale(1.06)' },
        '@media (prefers-reduced-motion: reduce)': {
          '& .art svg, & .art img': { transition: 'none' },
          '&:hover .art svg, &:hover .art img': { transform: 'none' },
        },
      }}
    >
      <CardActionArea
        component={RouterLink}
        to={`/productos/${product.id}`}
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        <Box className="art" sx={{ position: 'relative', overflow: 'hidden' }}>
          <ProductImage
            product={{
              name: product.name,
              categoryId: product.category.id,
              type: product.type,
              imageUrl: product.imageUrl,
            }}
          />
          <Chip
            size="small"
            label={t(product.category.name)}
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              bgcolor: 'rgba(255,255,255,0.9)',
              color: '#1d2b24',
              fontWeight: 600,
              backdropFilter: 'blur(6px)',
            }}
          />
          <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
            <StockChip product={product} />
          </Box>
        </Box>
        <CardContent sx={{ pb: 1 }}>
          <Typography variant="h6" component="h3" sx={{ lineHeight: 1.25, fontSize: '1.1rem' }}>
            {t(product.name)}
          </Typography>
          {product.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.75,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                minHeight: '2.8em',
              }}
            >
              {t(product.description)}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
      <CardActions sx={{ px: 2, pb: 2, pt: 0.5, justifyContent: 'space-between' }}>
        <Typography variant="h5" component="p" color="primary" sx={{ fontWeight: 700 }}>
          {formatMoney(product.price)}
        </Typography>
        <QuickAdd product={product} />
      </CardActions>
    </Card>
  )
}

export function ProductCardSkeleton() {
  return (
    <Card sx={{ height: '100%', '&:hover': { transform: 'none' } }} aria-hidden="true">
      <Skeleton variant="rectangular" sx={{ aspectRatio: '4 / 3', height: 'auto' }} />
      <CardContent>
        <Skeleton width="70%" height={28} />
        <Skeleton width="95%" />
        <Skeleton width="40%" height={36} />
      </CardContent>
    </Card>
  )
}
