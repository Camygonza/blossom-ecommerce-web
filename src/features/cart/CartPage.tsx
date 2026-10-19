import AddIcon from '@mui/icons-material/Add'
import DeleteOutline from '@mui/icons-material/DeleteOutlined'
import RemoveIcon from '@mui/icons-material/Remove'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useCreateOrderMutation } from '@/api/api'
import { errorMessage } from '@/api/errors'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { EmptyState } from '@/components/EmptyState'
import { ProductImage } from '@/features/products/art/ProductImage'
import { toastShown } from '@/features/ui/uiSlice'
import { useT } from '@/i18n/i18n'
import { formatMoney } from '@/lib/format'
import {
  cartCleared,
  itemRemoved,
  quantitySet,
  selectCartCount,
  selectCartTotal,
} from './cartSlice'

export function CartPage() {
  const t = useT()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const items = useAppSelector((state) => state.cart.items)
  const total = useAppSelector(selectCartTotal)
  const count = useAppSelector(selectCartCount)
  const user = useAppSelector((state) => state.auth.user)
  const [createOrder, { isLoading }] = useCreateOrderMutation()
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  if (items.length === 0) {
    return (
      <EmptyState
        title={t('Tu carrito está vacío')}
        description={t('Agrega plantas, flores o guías para empezar.')}
        actionLabel={t('Explorar la tienda')}
        onAction={() => navigate('/productos')}
      />
    )
  }

  const checkout = async () => {
    setCheckoutError(null)
    if (!user) {
      // el login devuelve al carrito, que sigue guardado
      navigate('/login', { state: { from: '/carrito' } })
      return
    }
    if (user.role !== 'CUSTOMER') {
      setCheckoutError(
        t('Las cuentas de administración no realizan compras. Ingresa con una cuenta de cliente.'),
      )
      return
    }
    try {
      const order = await createOrder({
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      }).unwrap()
      dispatch(cartCleared())
      dispatch(toastShown(t('Orden #{id} creada', { id: order.id }), 'success'))
      navigate(`/ordenes/${order.id}`, { state: { placed: true } })
    } catch (error) {
      setCheckoutError(errorMessage(error, t('No pudimos crear tu orden.'), t))
    }
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h3" component="h1">
        {t('Tu carrito')}
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2} component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
            {items.map((item) => (
              <Paper key={item.productId} component="li" variant="outlined" sx={{ p: 2 }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <Box sx={{ width: 84, flexShrink: 0 }}>
                    <ProductImage
                      product={{
                        name: item.name,
                        categoryId: item.categoryId ?? 0,
                        type: item.type,
                        imageUrl: item.imageUrl,
                      }}
                      ratio="1 / 1"
                      rounded={3}
                    />
                  </Box>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography
                      component={RouterLink}
                      to={`/productos/${item.productId}`}
                      sx={{ fontWeight: 600, color: 'inherit', textDecoration: 'none' }}
                    >
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('{price} c/u', { price: formatMoney(item.price) })}
                    </Typography>
                    <Stack direction="row" sx={{ alignItems: 'center', mt: 1 }}>
                      <IconButton
                        size="small"
                        aria-label={t('Quitar una unidad de {name}', { name: item.name })}
                        disabled={item.quantity <= 1}
                        onClick={() =>
                          dispatch(
                            quantitySet({ productId: item.productId, quantity: item.quantity - 1 }),
                          )
                        }
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography
                        component="span"
                        aria-label={t('Cantidad de {name}', { name: item.name })}
                        sx={{ minWidth: 32, textAlign: 'center' }}
                      >
                        {item.quantity}
                      </Typography>
                      <IconButton
                        size="small"
                        aria-label={t('Agregar una unidad de {name}', { name: item.name })}
                        disabled={item.quantity >= item.maxQuantity}
                        onClick={() =>
                          dispatch(
                            quantitySet({ productId: item.productId, quantity: item.quantity + 1 }),
                          )
                        }
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Box>
                  <Stack sx={{ alignItems: 'flex-end' }}>
                    <Typography sx={{ fontWeight: 600 }}>
                      {formatMoney(item.price * item.quantity)}
                    </Typography>
                    <IconButton
                      aria-label={t('Eliminar {name} del carrito', { name: item.name })}
                      onClick={() => dispatch(itemRemoved(item.productId))}
                    >
                      <DeleteOutline />
                    </IconButton>
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 3, position: { md: 'sticky' }, top: { md: 88 } }}>
            <Typography variant="h5" component="h2" gutterBottom>
              {t('Resumen')}
            </Typography>
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
              <Typography color="text.secondary">
                {count === 1 ? t('1 artículo') : t('{count} artículos', { count })}
              </Typography>
              <Typography variant="h6" component="p" aria-label={t('Total del carrito')}>
                {formatMoney(total)}
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 1 }}>
              {t('El precio final se confirma al crear la orden.')}
            </Typography>
            {checkoutError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {checkoutError}
              </Alert>
            )}
            <Button
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 2 }}
              onClick={checkout}
              disabled={isLoading}
            >
              {isLoading ? (
                <CircularProgress size={22} aria-label={t('Creando orden')} />
              ) : user ? (
                t('Finalizar compra')
              ) : (
                t('Ingresa para comprar')
              )}
            </Button>
            <Button fullWidth sx={{ mt: 1 }} onClick={() => dispatch(cartCleared())}>
              {t('Vaciar carrito')}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  )
}
