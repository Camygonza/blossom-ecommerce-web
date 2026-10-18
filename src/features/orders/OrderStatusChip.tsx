import { Chip } from '@mui/material'
import type { OrderStatus } from '@/api/types'
import { toneSx, type Tone } from '@/components/toneChip'
import { STATUS_LABEL } from './status'

const TONE: Record<OrderStatus, Tone> = {
  PENDING: 'neutral',
  PAID: 'info',
  SHIPPED: 'primary',
  DELIVERED: 'success',
  CANCELLED: 'error',
}

export function OrderStatusChip({ status }: { status: OrderStatus }) {
  return <Chip size="small" label={STATUS_LABEL[status]} sx={toneSx(TONE[status])} />
}
