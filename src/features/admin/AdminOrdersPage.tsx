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
import { formatDate, formatMoney } from '@/lib/format'

const PAGE_SIZE = 10

export function AdminOrdersPage() {
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
      dispatch(toastShown(`Orden #${id}: ${STATUS_LABEL[next].toLowerCase()}`, 'success'))
    } catch (err) {
      dispatch(toastShown(errorMessage(err, 'No pudimos cambiar el estado.'), 'error'))
    }
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h3" component="h1">
        Órdenes
      </Typography>

      <TextField
        select
        label="Filtrar por estado"
        size="small"
        value={status}
        onChange={(e) => {
          setStatus(e.target.value as OrderStatus | '')
          setPage(1)
        }}
        sx={{ maxWidth: 260 }}
      >
        <MenuItem value="">Todos</MenuItem>
        {(Object.keys(STATUS_LABEL) as OrderStatus[]).map((s) => (
          <MenuItem key={s} value={s}>
            {STATUS_LABEL[s]}
          </MenuItem>
        ))}
      </TextField>

      {error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Reintentar
            </Button>
          }
        >
          {errorMessage(error, 'No pudimos cargar las órdenes.')}
        </Alert>
      )}
      {isLoading && <Skeleton variant="rounded" height={320} aria-label="Cargando órdenes" />}
      {data && data.content.length === 0 && (
        <EmptyState title="Sin órdenes" description="No hay órdenes con ese estado." />
      )}

      {data && data.content.length > 0 && (
        <>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small" aria-label="Órdenes">
              <TableHead>
                <TableRow>
                  <TableCell>Orden</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Cambiar estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.content.map((order) => {
                  const next = NEXT_STATUSES[order.status]
                  return (
                    <TableRow key={order.id} hover>
                      <TableCell>#{order.id}</TableCell>
                      <TableCell>{order.customerEmail}</TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
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
                                renderValue: () => 'Elegir…',
                                SelectDisplayProps: {
                                  'aria-label': `Cambiar estado de la orden #${order.id}`,
                                },
                              },
                            }}
                            sx={{ minWidth: 140 }}
                          >
                            {next.map((s) => (
                              <MenuItem key={s} value={s}>
                                {STATUS_LABEL[s]}
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
              label="Paginación de órdenes"
            />
          )}
        </>
      )}
    </Stack>
  )
}
