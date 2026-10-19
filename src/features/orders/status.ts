import type { OrderStatus } from '@/api/types'

/**
 * Etiquetas en español (clave de traducción). Se traducen al mostrarlas: `t(STATUS_LABEL[s])`.
 * Las traducciones están en `en.ts` bajo estas mismas claves.
 */
export const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagada',
  SHIPPED: 'Enviada',
  DELIVERED: 'Entregada',
  CANCELLED: 'Cancelada',
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
