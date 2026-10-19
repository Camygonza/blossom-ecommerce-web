import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { getAccessToken, getRefreshToken } from '@/api/session'
import { accessibilityViolations, header, renderApp } from '@/test/render'
import { admin, authFor, customer } from '@/test/fixtures'
import { problem } from '@/test/handlers'
import { server } from '@/test/server'

describe('LoginPage', () => {
  it('should_log_in_and_land_on_the_shop_with_the_user_in_the_header', async () => {
    const user = userEvent.setup()
    const { router, container } = renderApp('/login')

    await user.type(await screen.findByLabelText('Correo'), 'cliente@bloom.test')
    await user.type(screen.getByLabelText('Contraseña'), 'Cliente123!')
    expect(await accessibilityViolations(container)).toEqual([])
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByRole('button', { name: 'Cliente Demo' })).toBeInTheDocument()
    await waitFor(() => expect(router.state.location.pathname).toBe('/productos'))
    expect(getAccessToken()).toBe('access-1')
    expect(getRefreshToken()).toBe('refresh-1')
  })

  it('should_show_the_api_message_when_credentials_are_wrong', async () => {
    const user = userEvent.setup()
    renderApp('/login')

    await user.type(await screen.findByLabelText('Correo'), 'cliente@bloom.test')
    await user.type(screen.getByLabelText('Contraseña'), 'incorrecta')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByText('Credenciales inválidas')).toBeInTheDocument()
    expect(getAccessToken()).toBeNull()
  })

  it('should_explain_account_lock_with_wait_time', async () => {
    server.use(
      http.post('*/api/v1/auth/login', () =>
        problem(423, 'Cuenta bloqueada', 'Cuenta bloqueada por intentos fallidos', {
          retryAfterSeconds: 900,
        }),
      ),
    )
    const user = userEvent.setup()
    renderApp('/login')

    await user.type(await screen.findByLabelText('Correo'), 'cliente@bloom.test')
    await user.type(screen.getByLabelText('Contraseña'), 'x')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByText(/15 min/)).toBeInTheDocument()
  })

  it('should_validate_required_fields_before_calling_the_api', async () => {
    const user = userEvent.setup()
    renderApp('/login')

    await user.click(await screen.findByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByText('Ingresa tu correo')).toBeInTheDocument()
    expect(screen.getByText('Ingresa tu contraseña')).toBeInTheDocument()
  })

  it('should_return_to_the_page_that_required_login', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/login')
    await router.navigate('/login', { state: { from: '/productos/1' } })

    await user.type(await screen.findByLabelText('Correo'), 'cliente@bloom.test')
    await user.type(screen.getByLabelText('Contraseña'), 'Cliente123!')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/productos/1'))
  })
})

describe('RegisterPage', () => {
  it('should_register_and_start_a_session', async () => {
    const user = userEvent.setup()
    const { container } = renderApp('/registro')

    await user.type(await screen.findByLabelText('Nombre completo'), 'Ana Pérez')
    await user.type(screen.getByLabelText('Correo'), 'ana@bloom.test')
    await user.type(screen.getByLabelText('Contraseña'), 'Passw0rd!')
    await user.type(screen.getByLabelText('Confirma la contraseña'), 'Passw0rd!')
    expect(await accessibilityViolations(container)).toEqual([])
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByRole('button', { name: 'Ana Pérez' })).toBeInTheDocument()
  })

  it('should_show_password_rule_errors_inline', async () => {
    const user = userEvent.setup()
    renderApp('/registro')

    await user.type(await screen.findByLabelText('Nombre completo'), 'Ana')
    await user.type(screen.getByLabelText('Correo'), 'ana@bloom.test')
    await user.type(screen.getByLabelText('Contraseña'), 'password')
    await user.type(screen.getByLabelText('Confirma la contraseña'), 'distinta')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByText('Incluye una mayúscula')).toBeInTheDocument()
    expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument()
  })

  it('should_map_server_field_errors_to_their_inputs', async () => {
    server.use(
      http.post('*/api/v1/auth/register', () =>
        problem(400, 'Validación fallida', 'datos inválidos', {
          errors: { email: 'Correo no válido' },
        }),
      ),
    )
    const user = userEvent.setup()
    renderApp('/registro')

    await user.type(await screen.findByLabelText('Nombre completo'), 'Ana Pérez')
    await user.type(screen.getByLabelText('Correo'), 'ana@bloom.test')
    await user.type(screen.getByLabelText('Contraseña'), 'Passw0rd!')
    await user.type(screen.getByLabelText('Confirma la contraseña'), 'Passw0rd!')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByText('Correo no válido')).toBeInTheDocument()
  })

  it('should_show_a_general_error_when_the_email_is_already_registered', async () => {
    const user = userEvent.setup()
    renderApp('/registro')

    await user.type(await screen.findByLabelText('Nombre completo'), 'Ana Pérez')
    await user.type(screen.getByLabelText('Correo'), 'repetido@bloom.test')
    await user.type(screen.getByLabelText('Contraseña'), 'Passw0rd!')
    await user.type(screen.getByLabelText('Confirma la contraseña'), 'Passw0rd!')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(await screen.findByText('El correo ya está registrado')).toBeInTheDocument()
  })
})

describe('session', () => {
  it('should_restore_the_session_on_load_when_a_refresh_token_exists', async () => {
    renderApp('/productos', { auth: authFor(customer) })

    expect(await screen.findByRole('button', { name: 'Cliente Demo' })).toBeInTheDocument()
    expect(getRefreshToken()).toBe('refresh-2')
  })

  it('should_show_login_buttons_when_the_stored_session_is_rejected', async () => {
    server.use(http.post('*/api/v1/auth/refresh', () => problem(401, 'No autenticado', 'revocado')))

    renderApp('/productos', { auth: authFor(customer) })

    expect(await header().findByRole('link', { name: 'Ingresar' })).toBeInTheDocument()
    expect(getRefreshToken()).toBeNull()
  })

  it('should_log_out_and_clear_tokens', async () => {
    const user = userEvent.setup()
    renderApp('/productos', { auth: authFor(customer) })

    await user.click(await screen.findByRole('button', { name: 'Cliente Demo' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Cerrar sesión' }))

    expect(await header().findByRole('link', { name: 'Ingresar' })).toBeInTheDocument()
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
  })

  it('should_clear_local_session_even_if_logout_call_fails', async () => {
    server.use(http.post('*/api/v1/auth/logout', () => HttpResponse.error()))
    const user = userEvent.setup()
    renderApp('/productos', { auth: authFor(customer) })

    await user.click(await screen.findByRole('button', { name: 'Cliente Demo' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Cerrar sesión' }))

    await waitFor(() => expect(getRefreshToken()).toBeNull())
  })

  it('should_not_expose_admin_only_areas_to_customers', async () => {
    renderApp('/productos', { auth: authFor(admin) })
    expect(await screen.findByRole('heading', { name: 'Tienda' })).toBeInTheDocument()
  })
})
