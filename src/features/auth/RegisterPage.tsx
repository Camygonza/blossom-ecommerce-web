import { zodResolver } from '@hookform/resolvers/zod'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { useRegisterMutation } from '@/api/api'
import { errorMessage, fieldErrors } from '@/api/errors'
import { useAppDispatch } from '@/app/hooks'
import { toastShown } from '@/features/ui/uiSlice'
import { registerSchema, type RegisterValues } from './schemas'

const SERVER_FIELDS = ['fullName', 'email', 'password'] as const

export function RegisterPage() {
  const [registerUser, { isLoading }] = useRegisterMutation()
  const [serverError, setServerError] = useState<string | null>(null)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/productos'

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = handleSubmit(async ({ confirmPassword: _confirm, ...values }) => {
    setServerError(null)
    try {
      const auth = await registerUser(values).unwrap()
      dispatch(toastShown(`¡Bienvenida/o a Bloom, ${auth.user.fullName}!`, 'success'))
      navigate(from, { replace: true })
    } catch (error) {
      const server = fieldErrors(error)
      let mapped = false
      for (const field of SERVER_FIELDS) {
        if (server[field]) {
          setError(field, { message: server[field] })
          mapped = true
        }
      }
      setServerError(mapped ? null : errorMessage(error))
    }
  })

  return (
    <Paper variant="outlined" sx={{ maxWidth: 440, mx: 'auto', p: { xs: 3, sm: 4 } }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Crea tu cuenta
      </Typography>
      <Box component="form" onSubmit={onSubmit} noValidate>
        <Stack spacing={2.5}>
          {serverError && <Alert severity="error">{serverError}</Alert>}
          <TextField
            label="Nombre completo"
            autoComplete="name"
            autoFocus
            fullWidth
            {...register('fullName')}
            error={Boolean(errors.fullName)}
            helperText={errors.fullName?.message}
          />
          <TextField
            label="Correo"
            type="email"
            autoComplete="email"
            fullWidth
            {...register('email')}
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
          />
          <TextField
            label="Contraseña"
            type="password"
            autoComplete="new-password"
            fullWidth
            {...register('password')}
            error={Boolean(errors.password)}
            helperText={
              errors.password?.message ?? '8+ caracteres con mayúscula, minúscula, número y símbolo'
            }
          />
          <TextField
            label="Confirma la contraseña"
            type="password"
            autoComplete="new-password"
            fullWidth
            {...register('confirmPassword')}
            error={Boolean(errors.confirmPassword)}
            helperText={errors.confirmPassword?.message}
          />
          <Button type="submit" variant="contained" size="large" disabled={isLoading}>
            {isLoading ? (
              <CircularProgress size={22} aria-label="Creando cuenta" />
            ) : (
              'Crear cuenta'
            )}
          </Button>
          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            ¿Ya tienes cuenta?{' '}
            <Link component={RouterLink} to="/login" state={location.state}>
              Ingresa
            </Link>
          </Typography>
        </Stack>
      </Box>
    </Paper>
  )
}
