import { Alert, Box, Button, Stack, Typography } from '@mui/material'
import Grid from '@mui/material/Grid'
import { Link as RouterLink } from 'react-router-dom'
import { useGetProductsQuery } from '@/api/api'
import { ProductCard, ProductCardSkeleton } from '@/features/products/ProductCard'

export function HomePage() {
  const { data, isLoading, error } = useGetProductsQuery({ size: 4, sort: 'createdAt,desc' })

  return (
    <Stack spacing={6}>
      <Box sx={{ py: { xs: 4, md: 8 }, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" sx={{ fontSize: { xs: '2.25rem', md: '3.5rem' } }}>
          Verde que se siente en casa
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 2, mb: 4, maxWidth: 560, mx: 'auto' }}>
          Plantas de interior, flores frescas y guías digitales para que tu hogar florezca.
        </Typography>
        <Button component={RouterLink} to="/productos" variant="contained" size="large">
          Explorar la tienda
        </Button>
      </Box>

      <Box component="section" aria-labelledby="novedades">
        <Typography id="novedades" variant="h4" component="h2" sx={{ mb: 3 }}>
          Novedades
        </Typography>
        {error && <Alert severity="warning">No pudimos cargar las novedades ahora mismo.</Alert>}
        <Grid container spacing={3}>
          {isLoading &&
            Array.from({ length: 4 }, (_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                <ProductCardSkeleton />
              </Grid>
            ))}
          {data?.content.map((product) => (
            <Grid key={product.id} size={{ xs: 12, sm: 6, md: 3 }}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Stack>
  )
}
