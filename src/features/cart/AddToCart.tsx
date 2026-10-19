import AddShoppingCart from '@mui/icons-material/AddShoppingCart'
import { Button, Stack, TextField } from '@mui/material'
import { useState } from 'react'
import type { Product } from '@/api/types'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { toastShown } from '@/features/ui/uiSlice'
import { useT } from '@/i18n/i18n'
import { itemAdded, maxQuantityFor } from './cartSlice'

/** Selector de cantidad y botón de agregar para la página de detalle. */
export function AddToCart({ product }: { product: Product }) {
  const t = useT()
  const dispatch = useAppDispatch()
  const inCart = useAppSelector(
    (state) => state.cart.items.find((item) => item.productId === product.id)?.quantity ?? 0,
  )
  const max = maxQuantityFor(product)
  const available = max - inCart
  const [text, setText] = useState('1')

  if (max < 1) {
    return (
      <Button variant="contained" disabled size="large">
        {t('Agotado')}
      </Button>
    )
  }
  if (available < 1) {
    return (
      <Button variant="outlined" disabled size="large">
        {product.type === 'DIGITAL'
          ? t('Ya está en tu carrito')
          : t('Ya tienes todo el stock en tu carrito')}
      </Button>
    )
  }

  const parsed = Number.parseInt(text, 10)
  const safeQuantity = Math.min(Math.max(1, Number.isNaN(parsed) ? 1 : parsed), available)

  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
      {product.type === 'PHYSICAL' && (
        <TextField
          label={t('Cantidad')}
          type="number"
          size="small"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => setText(String(safeQuantity))}
          slotProps={{ htmlInput: { min: 1, max: available } }}
          sx={{ width: 110 }}
        />
      )}
      <Button
        variant="contained"
        size="large"
        startIcon={<AddShoppingCart />}
        onClick={() => {
          dispatch(itemAdded({ product, quantity: safeQuantity }))
          dispatch(
            toastShown(t('{name} se agregó al carrito', { name: t(product.name) }), 'success'),
          )
          setText('1')
        }}
      >
        {t('Agregar al carrito')}
      </Button>
    </Stack>
  )
}
