import ArrowBack from '@mui/icons-material/ArrowBack'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Paper,
  Skeleton,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { Link as RouterLink, useLocation, useParams } from 'react-router-dom'
import { useCancelOrderMutation, useGetOrderQuery } from '@/api/api'
import { errorMessage } from '@/api/errors'
import { useAppDispatch } from '@/app/hooks'
import { EmptyState } from '@/components/EmptyState'
import { toastShown } from '@/features/ui/uiSlice'
import { formatDate, formatMoney } from '@/lib/format'
import { OrderStatusChip } from './OrderStatusChip'
import { PROGRESS, STATUS_LABEL } from './status'

export function OrderDetailPage() {
  const { id } = useParams()
  const orderId = Number(id)
  const validId = Number.isInteger(orderId) && orderId > 0
  const placed = (useLocation().state as { placed?: boolean } | null)?.placed === true
  const dispatch = useAppDispatch()
  const { data: order, error, isLoading, refetch } = useGetOrderQuery(orderId, { skip: !validId })
  const [cancelOrder, { isLoading: cancelling }] = useCancelOrderMutation()
  const [confirming, setConfirming] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)

  const back = (
    <Button
      component={RouterLink}
      to="/ordenes"
      startIcon={<ArrowBack />}
      sx={{ alignSelf: 'flex-start' }}
    >
      Mis órdenes
    </Button>
  )

  if (!validId || (error && 'status' in error && error.status === 404)) {
    return (
      <Stack spacing={2}>
        {back}
        <EmptyState
          title="No encontramos esta orden"
          description="Revisa el enlace o vuelve a tus órdenes."
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
          {errorMessage(error, 'No pudimos cargar la orden.')}
        </Alert>
      </Stack>
    )
  }
  if (isLoading || !order) {
    return (
      <Stack spacing={2} aria-busy="true" aria-label="Cargando orden">
        {back}
        <Skeleton variant="rounded" height={260} />
      </Stack>
    )
  }

  const confirmCancel = async () => {
    setCancelError(null)
    try {
      await cancelOrder(order.id).unwrap()
      setConfirming(false)
      dispatch(toastShown(`Orden #${order.id} cancelada`, 'info'))
    } catch (err) {
      setConfirming(false)
      setCancelError(errorMessage(err, 'No pudimos cancelar la orden.'))
    }
  }

  const activeStep = PROGRESS.indexOf(order.status)

  return (
    <Stack spacing={3}>
      {back}
      {placed && <Alert severity="success">¡Gracias por tu compra! Recibimos tu orden.</Alert>}
      {cancelError && <Alert severity="error">{cancelError}</Alert>}

      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography variant="h3" component="h1">
          Orden #{order.id}
        </Typography>
        <OrderStatusChip status={order.status} />
      </Stack>
      <Typography color="text.secondary">Realizada el {formatDate(order.createdAt)}</Typography>

      {order.status !== 'CANCELLED' && (
        <Stepper activeStep={activeStep} alternativeLabel aria-label="Progreso de la orden">
          {PROGRESS.map((step) => (
            <Step key={step} completed={PROGRESS.indexOf(step) <= activeStep}>
              <StepLabel>{STATUS_LABEL[step]}</StepLabel>
            </Step>
          ))}
        </Stepper>
      )}

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={1.5} divider={<Divider flexItem />}>
          {order.items.map((item) => (
            <Stack
              key={item.productId}
              direction="row"
              sx={{ justifyContent: 'space-between', gap: 2 }}
            >
              <div>
                <Typography
                  component={RouterLink}
                  to={`/productos/${item.productId}`}
                  sx={{ fontWeight: 600, color: 'inherit', textDecoration: 'none' }}
                >
                  {item.productName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.quantity} × {formatMoney(item.unitPrice)}
                </Typography>
              </div>
              <Typography>{formatMoney(item.subtotal)}</Typography>
            </Stack>
          ))}
          <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
            <Typography variant="h6" component="p">
              Total
            </Typography>
            <Typography variant="h6" component="p" aria-label="Total de la orden">
              {formatMoney(order.total)}
            </Typography>
          </Stack>
        </Stack>
      </Paper>

      {order.status === 'PENDING' && (
        <Button
          color="error"
          variant="outlined"
          sx={{ alignSelf: 'flex-start' }}
          onClick={() => setConfirming(true)}
        >
          Cancelar orden
        </Button>
      )}

      <Dialog open={confirming} onClose={() => setConfirming(false)} aria-labelledby="cancel-title">
        <DialogTitle id="cancel-title">¿Cancelar la orden #{order.id}?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Los productos volverán al inventario. Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirming(false)}>Conservar orden</Button>
          <Button color="error" onClick={confirmCancel} disabled={cancelling}>
            Sí, cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
