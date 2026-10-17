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
import { useLoginMutation } from '@/api/api'
import { errorMessage } from '@/api/errors'
import { useAppDispatch } from '@/app/hooks'
import { toastShown } from '@/features/ui/uiSlice'
import { loginSchema, type LoginValues } from './schemas'

export function LoginPage() {
  const [login, { isLoading }] = useLoginMutation()
  const [serverError, setServerError] = useState<string | null>(null)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/productos'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)
    try {
      const auth = await login(values).unwrap()
      dispatch(toastShown(`¡Hola, ${auth.user.fullName}!`, 'success'))
      navigate(from, { replace: true })
    } catch (error) {
      setServerError(errorMessage(error))
    }
  })

  return (
    <Paper variant="outlined" sx={{ maxWidth: 440, mx: 'auto', p: { xs: 3, sm: 4 } }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Ingresa a Bloom
      </Typography>
      <Box component="form" onSubmit={onSubmit} noValidate>
        <Stack spacing={2.5}>
          {serverError && <Alert severity="error">{serverError}</Alert>}
          <TextField
            label="Correo"
            type="email"
            autoComplete="email"
            autoFocus
            fullWidth
            {...register('email')}
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
          />
          <TextField
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            fullWidth
            {...register('password')}
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
          />
          <Button type="submit" variant="contained" size="large" disabled={isLoading}>
            {isLoading ? <CircularProgress size={22} aria-label="Ingresando" /> : 'Ingresar'}
          </Button>
          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            ¿Aún no tienes cuenta?{' '}
            <Link component={RouterLink} to="/registro" state={location.state}>
              Regístrate
            </Link>
          </Typography>
        </Stack>
      </Box>
    </Paper>
  )
}
