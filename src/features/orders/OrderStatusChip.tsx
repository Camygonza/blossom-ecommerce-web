import { Chip } from '@mui/material'
import type { OrderStatus } from '@/api/types'
import { STATUS_COLOR, STATUS_LABEL } from './status'

export function OrderStatusChip({ status }: { status: OrderStatus }) {
  return <Chip size="small" color={STATUS_COLOR[status]} label={STATUS_LABEL[status]} />
}
