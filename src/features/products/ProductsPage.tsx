import { Alert, Box, Button, Pagination, Stack, Typography } from '@mui/material'
import Grid from '@mui/material/Grid'
import { useGetProductsQuery } from '@/api/api'
import { errorMessage } from '@/api/errors'
import { EmptyState } from '@/components/EmptyState'
import { PAGE_SIZE, useProductFilters } from './useProductFilters'
import { ProductCard, ProductCardSkeleton } from './ProductCard'
import { ProductFilters } from './ProductFilters'

export function ProductsPage() {
  const { filters, query, update, reset, hasActiveFilters } = useProductFilters()
  const { data, error, isFetching, isLoading, refetch } = useGetProductsQuery(query)

  return (
    <Stack spacing={3}>
      <Typography variant="h3" component="h1">
        Tienda
      </Typography>
      <ProductFilters
        filters={filters}
        onChange={update}
        onReset={reset}
        canReset={hasActiveFilters || filters.sort !== 'id,asc'}
      />

      {error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Reintentar
            </Button>
          }
        >
          {errorMessage(error, 'No pudimos cargar los productos.')}
        </Alert>
      )}

      {isLoading && (
        <Grid container spacing={3} aria-busy="true" aria-label="Cargando productos">
          {Array.from({ length: PAGE_SIZE }, (_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <ProductCardSkeleton />
            </Grid>
          ))}
        </Grid>
      )}

      {data && data.content.length === 0 && (
        <EmptyState
          title="No encontramos plantas con esos filtros"
          description="Prueba con otro nombre, otra categoría o un rango de precio más amplio."
          actionLabel="Limpiar filtros"
          onAction={reset}
        />
      )}

      {data && data.content.length > 0 && (
        <>
          <Typography variant="body2" color="text.secondary" aria-live="polite">
            {data.totalElements} {data.totalElements === 1 ? 'producto' : 'productos'}
          </Typography>
          <Grid
            container
            spacing={3}
            sx={{ opacity: isFetching ? 0.6 : 1, transition: 'opacity .2s' }}
          >
            {data.content.map((product) => (
              <Grid key={product.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
          {data.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={data.totalPages}
                page={filters.page}
                onChange={(_event, page) => {
                  update({ page })
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                color="primary"
                getItemAriaLabel={(type, page, selected) => {
                  if (type === 'page') return selected ? `Página ${page}` : `Ir a la página ${page}`
                  const labels = {
                    first: 'Primera página',
                    last: 'Última página',
                    next: 'Página siguiente',
                    previous: 'Página anterior',
                    'start-ellipsis': 'Más páginas',
                    'end-ellipsis': 'Más páginas',
                  }
                  return labels[type]
                }}
                aria-label="Paginación de productos"
              />
            </Box>
          )}
        </>
      )}
    </Stack>
  )
}
