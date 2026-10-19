import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Product } from '@/api/types'
import { readStorage, writeStorage } from '@/lib/storage'

export interface CartItem {
  productId: number
  name: string
  /** Precio de referencia: el api congela el real al crear la orden. */
  price: number
  imageUrl: string | null
  /** Para dibujar su ilustración si no hay foto; opcionales por compatibilidad con carritos guardados. */
  categoryId?: number
  type?: 'PHYSICAL' | 'DIGITAL'
  quantity: number
  /** Tope por línea: el stock en físicos, 1 en digitales (una licencia por guía), 100 como máximo del api. */
  maxQuantity: number
}

export interface CartState {
  items: CartItem[]
}

const KEY = 'bloom.cart'
const API_MAX_PER_LINE = 100

export const maxQuantityFor = (product: Product): number =>
  product.type === 'DIGITAL' ? 1 : Math.min(product.stock ?? 0, API_MAX_PER_LINE)

const clamp = (value: number, max: number) => Math.max(1, Math.min(Math.floor(value), max))

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Record<string, unknown>
  return (
    typeof item.productId === 'number' &&
    typeof item.name === 'string' &&
    typeof item.price === 'number' &&
    typeof item.quantity === 'number' &&
    typeof item.maxQuantity === 'number' &&
    item.maxQuantity >= 1 &&
    item.quantity >= 1
  )
}

/** Recupera el carrito guardado; si el JSON está corrupto o manipulado, empieza vacío. */
export function loadCart(): CartState {
  const raw = readStorage(KEY)
  if (!raw) return { items: [] }
  try {
    const parsed: unknown = JSON.parse(raw)
    const items = Array.isArray(parsed) ? parsed.filter(isCartItem) : []
    return {
      items: items.map((item) => ({ ...item, quantity: clamp(item.quantity, item.maxQuantity) })),
    }
  } catch {
    return { items: [] }
  }
}

export function saveCart(state: CartState): void {
  writeStorage(KEY, JSON.stringify(state.items))
}

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [] } as CartState,
  reducers: {
    itemAdded(state, action: PayloadAction<{ product: Product; quantity?: number }>) {
      const { product, quantity = 1 } = action.payload
      const max = maxQuantityFor(product)
      if (max < 1) return
      const existing = state.items.find((item) => item.productId === product.id)
      if (existing) {
        existing.maxQuantity = max
        existing.price = product.price
        existing.quantity = clamp(existing.quantity + quantity, max)
      } else {
        state.items.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          categoryId: product.category.id,
          type: product.type,
          quantity: clamp(quantity, max),
          maxQuantity: max,
        })
      }
    },
    quantitySet(state, action: PayloadAction<{ productId: number; quantity: number }>) {
      const item = state.items.find((i) => i.productId === action.payload.productId)
      if (item) item.quantity = clamp(action.payload.quantity, item.maxQuantity)
    },
    itemRemoved(state, action: PayloadAction<number>) {
      state.items = state.items.filter((item) => item.productId !== action.payload)
    },
    cartCleared(state) {
      state.items = []
    },
  },
})

export const { itemAdded, quantitySet, itemRemoved, cartCleared } = cartSlice.actions
export default cartSlice.reducer

export const selectCartCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0)

export const selectCartTotal = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
