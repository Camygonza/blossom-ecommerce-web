import { Alert, Button, Stack, Typography } from '@mui/material'
import Grid from '@mui/material/Grid'
import { useGetProductsQuery } from '@/api/api'
import { errorMessage } from '@/api/errors'
import { AppPagination } from '@/components/AppPagination'
import { EmptyState } from '@/components/EmptyState'
import { useT } from '@/i18n/i18n'
import { PAGE_SIZE, useProductFilters } from './useProductFilters'
import { ProductCard, ProductCardSkeleton } from './ProductCard'
import { ProductFilters } from './ProductFilters'

export function ProductsPage() {
  const t = useT()
  const { filters, query, update, reset, hasActiveFilters } = useProductFilters()
  const { data, error, isFetching, isLoading, refetch } = useGetProductsQuery(query)

  return (
    <Stack spacing={3}>
      <Typography variant="h3" component="h1">
        {t('Tienda')}
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
              {t('Reintentar')}
            </Button>
          }
        >
          {errorMessage(error, t('No pudimos cargar los productos.'), t)}
        </Alert>
      )}

      {isLoading && (
        <Grid container spacing={3} aria-busy="true" aria-label={t('Cargando productos')}>
          {Array.from({ length: PAGE_SIZE }, (_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <ProductCardSkeleton />
            </Grid>
          ))}
        </Grid>
      )}

      {data && data.content.length === 0 && (
        <EmptyState
          title={t('No encontramos plantas con esos filtros')}
          description={t('Prueba con otro nombre, otra categoría o un rango de precio más amplio.')}
          actionLabel={t('Limpiar filtros')}
          onAction={reset}
        />
      )}

      {data && data.content.length > 0 && (
        <>
          <Typography variant="body2" color="text.secondary" aria-live="polite">
            {data.totalElements === 1
              ? t('1 producto')
              : t('{count} productos', { count: data.totalElements })}
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
            <AppPagination
              count={data.totalPages}
              page={filters.page}
              onChange={(page) => {
                update({ page })
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              label={t('Paginación de productos')}
            />
          )}
        </>
      )}
    </Stack>
  )
}
