import type { OrderStatus } from '@/api/types'

export const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagada',
  SHIPPED: 'Enviada',
  DELIVERED: 'Entregada',
  CANCELLED: 'Cancelada',
}

export const STATUS_COLOR: Record<
  OrderStatus,
  'default' | 'info' | 'primary' | 'success' | 'error'
> = {
  PENDING: 'default',
  PAID: 'info',
  SHIPPED: 'primary',
  DELIVERED: 'success',
  CANCELLED: 'error',
}

/** Mismas transiciones que valida el api (OrderStatus.canTransitionTo); el api sigue siendo la autoridad. */
export const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PAID', 'CANCELLED'],
  PAID: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
}

export const PROGRESS: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED']
