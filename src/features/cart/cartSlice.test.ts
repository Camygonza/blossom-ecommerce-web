import { describe, expect, it } from 'vitest'
import { createStore } from '@/app/store'
import { products } from '@/test/fixtures'
import reducer, {
  cartCleared,
  itemAdded,
  itemRemoved,
  loadCart,
  quantitySet,
  selectCartCount,
  selectCartTotal,
  type CartState,
} from './cartSlice'

const [monstera, pothos, soldOut, guide] = [products[0], products[1], products[2], products[3]]
const empty: CartState = { items: [] }

describe('cartSlice', () => {
  it('should_add_a_product_and_merge_repeated_adds', () => {
    let state = reducer(empty, itemAdded({ product: monstera }))
    state = reducer(state, itemAdded({ product: monstera, quantity: 2 }))

    expect(state.items).toHaveLength(1)
    expect(state.items[0]).toMatchObject({
      productId: 1,
      quantity: 3,
      price: 45.9,
      maxQuantity: 12,
    })
  })

  it('should_never_exceed_the_available_stock', () => {
    let state = reducer(empty, itemAdded({ product: pothos, quantity: 10 }))
    expect(state.items[0].quantity).toBe(3)

    state = reducer(state, itemAdded({ product: pothos }))
    expect(state.items[0].quantity).toBe(3)
    state = reducer(state, quantitySet({ productId: 2, quantity: 99 }))
    expect(state.items[0].quantity).toBe(3)
  })

  it('should_ignore_sold_out_products_and_allow_one_license_per_digital_product', () => {
    expect(reducer(empty, itemAdded({ product: soldOut })).items).toHaveLength(0)

    const state = reducer(empty, itemAdded({ product: guide, quantity: 5 }))
    expect(state.items[0]).toMatchObject({ quantity: 1, maxQuantity: 1 })
  })

  it('should_clamp_quantities_to_at_least_one', () => {
    let state = reducer(empty, itemAdded({ product: monstera, quantity: 4 }))
    state = reducer(state, quantitySet({ productId: 1, quantity: 0 }))
    expect(state.items[0].quantity).toBe(1)
    state = reducer(state, quantitySet({ productId: 404, quantity: 3 }))
    expect(state.items).toHaveLength(1)
  })

  it('should_remove_items_and_clear_the_cart', () => {
    let state = reducer(empty, itemAdded({ product: monstera }))
    state = reducer(state, itemAdded({ product: pothos }))

    state = reducer(state, itemRemoved(1))
    expect(state.items.map((i) => i.productId)).toEqual([2])
    expect(reducer(state, cartCleared()).items).toEqual([])
  })

  it('should_compute_count_and_total', () => {
    let state = reducer(empty, itemAdded({ product: monstera, quantity: 2 }))
    state = reducer(state, itemAdded({ product: pothos }))

    expect(selectCartCount({ cart: state })).toBe(3)
    expect(selectCartTotal({ cart: state })).toBeCloseTo(114.3)
  })

  it('should_refresh_price_and_limit_when_the_product_is_added_again', () => {
    let state = reducer(empty, itemAdded({ product: monstera }))
    state = reducer(state, itemAdded({ product: { ...monstera, price: 50, stock: 4 } }))

    expect(state.items[0]).toMatchObject({ price: 50, maxQuantity: 4, quantity: 2 })
  })
})

describe('cart persistence', () => {
  it('should_save_every_change_and_restore_it_in_a_new_store', () => {
    const store = createStore()
    store.dispatch(itemAdded({ product: monstera, quantity: 2 }))

    expect(JSON.parse(window.localStorage.getItem('bloom.cart') ?? '[]')).toHaveLength(1)
    expect(createStore().getState().cart.items[0]).toMatchObject({ productId: 1, quantity: 2 })
  })

  it('should_start_empty_when_the_stored_cart_is_corrupt_or_tampered_with', () => {
    window.localStorage.setItem('bloom.cart', '{no es json')
    expect(loadCart().items).toEqual([])

    window.localStorage.setItem('bloom.cart', JSON.stringify({ items: 'x' }))
    expect(loadCart().items).toEqual([])

    window.localStorage.setItem(
      'bloom.cart',
      JSON.stringify([
        { productId: 1, name: 'ok', price: 1, quantity: 99, maxQuantity: 5, imageUrl: null },
        { productId: 'malo', name: 3 },
        { productId: 2, name: 'sin tope', price: 1, quantity: 1, maxQuantity: 0 },
      ]),
    )
    const items = loadCart().items
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(5)
  })
})
