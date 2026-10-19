import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useGetMyOrdersQuery } from '@/api/api'
import { errorMessage } from '@/api/errors'
import { AppPagination } from '@/components/AppPagination'
import { EmptyState } from '@/components/EmptyState'
import { useI18n } from '@/i18n/i18n'
import { formatDate, formatMoney } from '@/lib/format'
import { OrderStatusChip } from './OrderStatusChip'

const PAGE_SIZE = 10

export function OrdersPage() {
  const { lang, t } = useI18n()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const itemsLabel = (count: number) =>
    count === 1 ? t('1 artículo') : t('{count} artículos', { count })
  const { data, error, isLoading, refetch } = useGetMyOrdersQuery({
    page: page - 1,
    size: PAGE_SIZE,
  })

  return (
    <Stack spacing={3}>
      <Typography variant="h3" component="h1">
        {t('Mis órdenes')}
      </Typography>

      {error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              {t('Reintentar')}
            </Button>
          }
        >
          {errorMessage(error, t('No pudimos cargar tus órdenes.'), t)}
        </Alert>
      )}

      {isLoading && (
        <Stack spacing={2} aria-busy="true" aria-label={t('Cargando órdenes')}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} variant="rounded" height={88} />
          ))}
        </Stack>
      )}

      {data && data.content.length === 0 && (
        <EmptyState
          title={t('Aún no tienes órdenes')}
          description={t('Cuando compres algo, lo verás aquí con su estado.')}
          actionLabel={t('Ir a la tienda')}
          onAction={() => navigate('/productos')}
        />
      )}

      {data && data.content.length > 0 && (
        <>
          <Stack spacing={2} component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
            {data.content.map((order) => (
              <Card key={order.id} component="li">
                <CardActionArea component={RouterLink} to={`/ordenes/${order.id}`}>
                  <CardContent
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 2,
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 600 }}>
                        {t('Orden #{id}', { id: order.id })}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(order.createdAt, lang)} ·{' '}
                        {itemsLabel(order.items.reduce((sum, item) => sum + item.quantity, 0))}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                      <OrderStatusChip status={order.status} />
                      <Typography variant="h6" component="p">
                        {formatMoney(order.total)}
                      </Typography>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Stack>
          {data.totalPages > 1 && (
            <AppPagination
              count={data.totalPages}
              page={page}
              onChange={(next) => setPage(next)}
              label={t('Paginación de órdenes')}
            />
          )}
        </>
      )}
    </Stack>
  )
}
