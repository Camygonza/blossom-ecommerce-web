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
import { useT } from '@/i18n/i18n'
import { toastShown } from '@/features/ui/uiSlice'
import { registerSchema, type RegisterValues } from './schemas'

const SERVER_FIELDS = ['fullName', 'email', 'password'] as const

export function RegisterPage() {
  const t = useT()
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
      dispatch(
        toastShown(t('¡Bienvenida/o a Bloom, {name}!', { name: auth.user.fullName }), 'success'),
      )
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
      setServerError(mapped ? null : errorMessage(error, undefined, t))
    }
  })

  return (
    <Paper variant="outlined" sx={{ maxWidth: 440, mx: 'auto', p: { xs: 3, sm: 4 } }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('Crea tu cuenta')}
      </Typography>
      <Box component="form" onSubmit={onSubmit} noValidate>
        <Stack spacing={2.5}>
          {serverError && <Alert severity="error">{serverError}</Alert>}
          <TextField
            label={t('Nombre completo')}
            autoComplete="name"
            autoFocus
            fullWidth
            {...register('fullName')}
            error={Boolean(errors.fullName)}
            helperText={t(errors.fullName?.message ?? '')}
          />
          <TextField
            label={t('Correo')}
            type="email"
            autoComplete="email"
            fullWidth
            {...register('email')}
            error={Boolean(errors.email)}
            helperText={t(errors.email?.message ?? '')}
          />
          <TextField
            label={t('Contraseña')}
            type="password"
            autoComplete="new-password"
            fullWidth
            {...register('password')}
            error={Boolean(errors.password)}
            helperText={
              errors.password?.message
                ? t(errors.password.message)
                : t('8+ caracteres con mayúscula, minúscula, número y símbolo')
            }
          />
          <TextField
            label={t('Confirma la contraseña')}
            type="password"
            autoComplete="new-password"
            fullWidth
            {...register('confirmPassword')}
            error={Boolean(errors.confirmPassword)}
            helperText={t(errors.confirmPassword?.message ?? '')}
          />
          <Button type="submit" variant="contained" size="large" disabled={isLoading}>
            {isLoading ? (
              <CircularProgress size={22} aria-label={t('Creando cuenta')} />
            ) : (
              t('Crear cuenta')
            )}
          </Button>
          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            {t('¿Ya tienes cuenta?')}{' '}
            <Link component={RouterLink} to="/login" state={location.state}>
              {t('Ingresa')}
            </Link>
          </Typography>
        </Stack>
      </Box>
    </Paper>
  )
}
