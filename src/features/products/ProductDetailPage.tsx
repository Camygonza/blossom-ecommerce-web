import ArrowBack from '@mui/icons-material/ArrowBack'
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import { useGetProductQuery } from '@/api/api'
import { errorMessage } from '@/api/errors'
import type { Product } from '@/api/types'
import { EmptyState } from '@/components/EmptyState'
import { formatMoney, formatWeight } from '@/lib/format'
import { AddToCart } from '@/features/cart/AddToCart'
import { ProductImage } from './art/ProductImage'
import { StockChip } from './ProductCard'

function Specs({ product }: { product: Product }) {
  const rows: [string, string][] =
    product.type === 'PHYSICAL'
      ? [
          ['Tipo', 'Producto físico'],
          ['Peso', product.weightGrams != null ? formatWeight(product.weightGrams) : '—'],
          ['Disponibles', String(product.stock ?? 0)],
        ]
      : [
          ['Tipo', 'Producto digital'],
          ['Licencia', product.licenseType === 'COMMERCIAL' ? 'Comercial' : 'Personal'],
          ['Entrega', 'Descarga inmediata tras la compra'],
        ]
  return (
    <Box
      component="dl"
      sx={{
        m: 0,
        display: 'grid',
        gridTemplateColumns: 'max-content 1fr',
        columnGap: 3,
        rowGap: 1,
      }}
    >
      {rows.map(([label, value]) => (
        <Box key={label} sx={{ display: 'contents' }}>
          <Typography component="dt" color="text.secondary">
            {label}
          </Typography>
          <Typography component="dd" sx={{ m: 0 }}>
            {value}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}

export function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const productId = Number(id)
  const validId = Number.isInteger(productId) && productId > 0
  const {
    data: product,
    error,
    isLoading,
    refetch,
  } = useGetProductQuery(productId, { skip: !validId })

  const back = (
    <Button
      component={RouterLink}
      to="/productos"
      startIcon={<ArrowBack />}
      sx={{ alignSelf: 'flex-start' }}
    >
      Volver a la tienda
    </Button>
  )

  if (!validId || (error && 'status' in error && error.status === 404)) {
    return (
      <Stack spacing={2}>
        {back}
        <EmptyState
          title="Este producto no existe"
          description="Puede que ya no esté disponible."
          actionLabel="Ver la tienda"
          onAction={() => navigate('/productos')}
        />
      </Stack>
    )
  }

  if (error) {
    return (
      <Stack spacing={2}>
        {back}
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Reintentar
            </Button>
          }
        >
          {errorMessage(error, 'No pudimos cargar el producto.')}
        </Alert>
      </Stack>
    )
  }

  if (isLoading || !product) {
    return (
      <Stack spacing={2} aria-busy="true" aria-label="Cargando producto">
        {back}
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rounded" sx={{ aspectRatio: '4 / 3', height: 'auto' }} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton width="60%" height={48} />
            <Skeleton width="30%" height={40} />
            <Skeleton height={120} />
          </Grid>
        </Grid>
      </Stack>
    )
  }

  return (
    <Stack spacing={3}>
      {back}
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              borderRadius: 6,
              overflow: 'hidden',
              boxShadow: '0 24px 60px -28px rgba(31,61,49,0.45)',
            }}
          >
            <ProductImage
              product={{
                name: product.name,
                categoryId: product.category.id,
                type: product.type,
                imageUrl: product.imageUrl,
              }}
              ratio="1 / 1"
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Chip
                label={product.category.name}
                size="small"
                component={RouterLink}
                to={`/productos?categoria=${product.category.id}`}
                clickable
              />
              <StockChip product={product} />
            </Stack>
            <Typography variant="h3" component="h1">
              {product.name}
            </Typography>
            <Typography variant="h4" component="p" color="primary">
              {formatMoney(product.price)}
            </Typography>
            {product.description && (
              <Typography color="text.secondary">{product.description}</Typography>
            )}
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Stack spacing={3}>
                <Specs product={product} />
                <Divider />
                <AddToCart product={product} />
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  )
}
