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
import { toastShown } from '@/features/ui/uiSlice'
import { formatMoney } from '@/lib/format'
import {
  cartCleared,
  itemRemoved,
  quantitySet,
  selectCartCount,
  selectCartTotal,
} from './cartSlice'

export function CartPage() {
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
        title="Tu carrito está vacío"
        description="Agrega plantas, flores o guías para empezar."
        actionLabel="Explorar la tienda"
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
        'Las cuentas de administración no realizan compras. Ingresa con una cuenta de cliente.',
      )
      return
    }
    try {
      const order = await createOrder({
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      }).unwrap()
      dispatch(cartCleared())
      dispatch(toastShown(`Orden #${order.id} creada`, 'success'))
      navigate(`/ordenes/${order.id}`, { state: { placed: true } })
    } catch (error) {
      setCheckoutError(errorMessage(error, 'No pudimos crear tu orden.'))
    }
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h3" component="h1">
        Tu carrito
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2} component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
            {items.map((item) => (
              <Paper key={item.productId} component="li" variant="outlined" sx={{ p: 2 }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  {item.imageUrl && (
                    <Box
                      component="img"
                      src={item.imageUrl}
                      alt=""
                      sx={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 2 }}
                    />
                  )}
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography
                      component={RouterLink}
                      to={`/productos/${item.productId}`}
                      sx={{ fontWeight: 600, color: 'inherit', textDecoration: 'none' }}
                    >
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatMoney(item.price)} c/u
                    </Typography>
                    <Stack direction="row" sx={{ alignItems: 'center', mt: 1 }}>
                      <IconButton
                        size="small"
                        aria-label={`Quitar una unidad de ${item.name}`}
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
                        aria-label={`Cantidad de ${item.name}`}
                        sx={{ minWidth: 32, textAlign: 'center' }}
                      >
                        {item.quantity}
                      </Typography>
                      <IconButton
                        size="small"
                        aria-label={`Agregar una unidad de ${item.name}`}
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
                      aria-label={`Eliminar ${item.name} del carrito`}
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
              Resumen
            </Typography>
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
              <Typography color="text.secondary">
                {count} {count === 1 ? 'artículo' : 'artículos'}
              </Typography>
              <Typography variant="h6" component="p" aria-label="Total del carrito">
                {formatMoney(total)}
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 1 }}>
              El precio final se confirma al crear la orden.
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
                <CircularProgress size={22} aria-label="Creando orden" />
              ) : user ? (
                'Finalizar compra'
              ) : (
                'Ingresa para comprar'
              )}
            </Button>
            <Button fullWidth sx={{ mt: 1 }} onClick={() => dispatch(cartCleared())}>
              Vaciar carrito
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  )
}
