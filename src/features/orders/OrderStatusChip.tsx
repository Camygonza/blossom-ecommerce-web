import { Chip } from '@mui/material'
import type { OrderStatus } from '@/api/types'
import { useT } from '@/i18n/i18n'
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
  const t = useT()
  return <Chip size="small" label={t(STATUS_LABEL[status])} sx={toneSx(TONE[status])} />
}
