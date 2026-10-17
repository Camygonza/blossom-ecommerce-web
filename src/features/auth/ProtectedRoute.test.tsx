import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import type { User } from '@/api/types'
import { createStore } from '@/app/store'
import { admin, customer } from '@/test/fixtures'
import { sessionStarted } from './authSlice'
import { ProtectedRoute } from './ProtectedRoute'

function renderAt(path: string, user: User | null, role?: 'ADMIN' | 'CUSTOMER') {
  const store = createStore()
  if (user) store.dispatch(sessionStarted(user))
  const router = createMemoryRouter(
    [
      { path: '/login', element: <p>pantalla de login</p> },
      {
        element: <ProtectedRoute role={role} />,
        children: [{ path: '/privado', element: <p>contenido privado</p> }],
      },
    ],
    { initialEntries: [path] },
  )
  render(
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>,
  )
  return router
}

describe('ProtectedRoute', () => {
  it('should_redirect_to_login_remembering_the_target_when_anonymous', () => {
    const router = renderAt('/privado?x=1', null)

    expect(screen.getByText('pantalla de login')).toBeInTheDocument()
    expect(router.state.location.state).toEqual({ from: '/privado?x=1' })
  })

  it('should_render_the_page_when_signed_in', () => {
    renderAt('/privado', customer)
    expect(screen.getByText('contenido privado')).toBeInTheDocument()
  })

  it('should_block_users_without_the_required_role', () => {
    renderAt('/privado', customer, 'ADMIN')
    expect(screen.getByText('Sin acceso')).toBeInTheDocument()
    expect(screen.queryByText('contenido privado')).not.toBeInTheDocument()
  })

  it('should_allow_the_required_role', () => {
    renderAt('/privado', admin, 'ADMIN')
    expect(screen.getByText('contenido privado')).toBeInTheDocument()
  })
})
