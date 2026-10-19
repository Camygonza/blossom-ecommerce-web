import {
  Alert,
  Button,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useGetAdminOrdersQuery, useUpdateOrderStatusMutation } from '@/api/api'
import { errorMessage } from '@/api/errors'
import type { OrderStatus } from '@/api/types'
import { useAppDispatch } from '@/app/hooks'
import { AppPagination } from '@/components/AppPagination'
import { EmptyState } from '@/components/EmptyState'
import { OrderStatusChip } from '@/features/orders/OrderStatusChip'
import { NEXT_STATUSES, STATUS_LABEL } from '@/features/orders/status'
import { toastShown } from '@/features/ui/uiSlice'
import { useI18n } from '@/i18n/i18n'
import { formatDate, formatMoney } from '@/lib/format'

const PAGE_SIZE = 10

export function AdminOrdersPage() {
  const { lang, t } = useI18n()
  const dispatch = useAppDispatch()
  const [status, setStatus] = useState<OrderStatus | ''>('')
  const [page, setPage] = useState(1)
  const { data, error, isLoading, refetch } = useGetAdminOrdersQuery({
    status: status || undefined,
    page: page - 1,
    size: PAGE_SIZE,
  })
  const [updateStatus, { isLoading: updating }] = useUpdateOrderStatusMutation()

  const change = async (id: number, next: OrderStatus) => {
    try {
      await updateStatus({ id, status: next }).unwrap()
      dispatch(
        toastShown(
          t('Orden #{id}: {status}', { id, status: t(STATUS_LABEL[next]).toLowerCase() }),
          'success',
        ),
      )
    } catch (err) {
      dispatch(toastShown(errorMessage(err, t('No pudimos cambiar el estado.'), t), 'error'))
    }
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h3" component="h1">
        {t('Órdenes')}
      </Typography>

      <TextField
        select
        label={t('Filtrar por estado')}
        size="small"
        value={status}
        onChange={(e) => {
          setStatus(e.target.value as OrderStatus | '')
          setPage(1)
        }}
        sx={{ maxWidth: 260 }}
      >
        <MenuItem value="">{t('Todos')}</MenuItem>
        {(Object.keys(STATUS_LABEL) as OrderStatus[]).map((s) => (
          <MenuItem key={s} value={s}>
            {t(STATUS_LABEL[s])}
          </MenuItem>
        ))}
      </TextField>

      {error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              {t('Reintentar')}
            </Button>
          }
        >
          {errorMessage(error, t('No pudimos cargar las órdenes.'), t)}
        </Alert>
      )}
      {isLoading && <Skeleton variant="rounded" height={320} aria-label={t('Cargando órdenes')} />}
      {data && data.content.length === 0 && (
        <EmptyState title={t('Sin órdenes')} description={t('No hay órdenes con ese estado.')} />
      )}

      {data && data.content.length > 0 && (
        <>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small" aria-label={t('Órdenes')}>
              <TableHead>
                <TableRow>
                  <TableCell>{t('Orden')}</TableCell>
                  <TableCell>{t('Cliente')}</TableCell>
                  <TableCell>{t('Fecha')}</TableCell>
                  <TableCell align="right">{t('Total')}</TableCell>
                  <TableCell>{t('Estado')}</TableCell>
                  <TableCell>{t('Cambiar estado')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.content.map((order) => {
                  const next = NEXT_STATUSES[order.status]
                  return (
                    <TableRow key={order.id} hover>
                      <TableCell>#{order.id}</TableCell>
                      <TableCell>{order.customerEmail}</TableCell>
                      <TableCell>{formatDate(order.createdAt, lang)}</TableCell>
                      <TableCell align="right">{formatMoney(order.total)}</TableCell>
                      <TableCell>
                        <OrderStatusChip status={order.status} />
                      </TableCell>
                      <TableCell>
                        {next.length === 0 ? (
                          '—'
                        ) : (
                          <TextField
                            select
                            size="small"
                            value=""
                            disabled={updating}
                            onChange={(e) => change(order.id, e.target.value as OrderStatus)}
                            slotProps={{
                              select: {
                                displayEmpty: true,
                                renderValue: () => t('Elegir…'),
                                SelectDisplayProps: {
                                  'aria-label': t('Cambiar estado de la orden #{id}', {
                                    id: order.id,
                                  }),
                                },
                              },
                            }}
                            sx={{ minWidth: 140 }}
                          >
                            {next.map((s) => (
                              <MenuItem key={s} value={s}>
                                {t(STATUS_LABEL[s])}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
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
