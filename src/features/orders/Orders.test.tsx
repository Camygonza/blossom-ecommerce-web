import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { admin, authFor, customer, orderFixture } from '@/test/fixtures'
import { problem } from '@/test/handlers'
import { accessibilityViolations, renderApp, money } from '@/test/render'
import { server } from '@/test/server'

describe('OrdersPage', () => {
  it('should_list_the_history_with_status_and_total', async () => {
    const user = userEvent.setup()
    const { container, router } = renderApp('/ordenes', { auth: authFor(customer) })

    expect(await screen.findByText('Orden #7')).toBeInTheDocument()
    expect(screen.getByText('Pendiente')).toBeInTheDocument()
    expect(screen.getByText(money(91.8))).toBeInTheDocument()
    expect(screen.getByText(/2 artículos/)).toBeInTheDocument()
    expect(await accessibilityViolations(container)).toEqual([])

    await user.click(screen.getByRole('link', { name: /Orden #7/ }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/ordenes/7'))
  })

  it('should_show_an_empty_state_for_customers_without_orders', async () => {
    server.use(
      http.get('*/api/v1/orders/me', () =>
        HttpResponse.json({ content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 }),
      ),
    )
    renderApp('/ordenes', { auth: authFor(customer) })

    expect(await screen.findByText('Aún no tienes órdenes')).toBeInTheDocument()
  })

  it('should_paginate_the_history', async () => {
    const pages: number[] = []
    server.use(
      http.get('*/api/v1/orders/me', ({ request }) => {
        const page = Number(new URL(request.url).searchParams.get('page') ?? 0)
        pages.push(page)
        return HttpResponse.json({
          content: [{ ...orderFixture, id: 100 + page }],
          page,
          size: 10,
          totalElements: 25,
          totalPages: 3,
        })
      }),
    )
    const user = userEvent.setup()
    renderApp('/ordenes', { auth: authFor(customer) })
    await screen.findByText('Orden #100')

    await user.click(screen.getByRole('button', { name: 'Ir a la página 2' }))

    expect(await screen.findByText('Orden #101')).toBeInTheDocument()
    expect(pages).toContain(1)
  })

  it('should_show_an_error_with_retry', async () => {
    server.use(http.get('*/api/v1/orders/me', () => problem(500, 'Error', 'boom')))
    renderApp('/ordenes', { auth: authFor(customer) })

    expect(await screen.findByText(/problema/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
  })

  it('should_require_login', async () => {
    const { router } = renderApp('/ordenes')

    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(router.state.location.state).toEqual({ from: '/ordenes' })
  })

  it('should_not_open_for_admin_accounts', async () => {
    server.use(http.post('*/api/v1/auth/refresh', () => HttpResponse.json(authFor(admin, '3'))))
    renderApp('/ordenes', { auth: authFor(admin) })

    expect(await screen.findByText('Sin acceso')).toBeInTheDocument()
  })
})

describe('OrderDetailPage', () => {
  it('should_show_items_with_frozen_prices_and_the_progress', async () => {
    const { container } = renderApp('/ordenes/7', { auth: authFor(customer) })

    expect(await screen.findByRole('heading', { name: 'Orden #7' })).toBeInTheDocument()
    expect(screen.getByText(`2 × ${money(45.9)}`)).toBeInTheDocument()
    expect(screen.getByLabelText('Total de la orden')).toHaveTextContent(money(91.8))
    expect(screen.getByLabelText('Progreso de la orden')).toBeInTheDocument()
    expect(await accessibilityViolations(container)).toEqual([])
  })

  it('should_cancel_a_pending_order_after_confirming', async () => {
    const user = userEvent.setup()
    renderApp('/ordenes/7', { auth: authFor(customer) })

    await user.click(await screen.findByRole('button', { name: 'Cancelar orden' }))
    expect(await screen.findByText('¿Cancelar la orden #7?')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Sí, cancelar' }))

    expect(await screen.findByText('Orden #7 cancelada')).toBeInTheDocument()
  })

  it('should_keep_the_order_when_the_user_changes_their_mind', async () => {
    const user = userEvent.setup()
    renderApp('/ordenes/7', { auth: authFor(customer) })

    await user.click(await screen.findByRole('button', { name: 'Cancelar orden' }))
    await user.click(await screen.findByRole('button', { name: 'Conservar orden' }))

    await waitFor(() =>
      expect(screen.queryByText('¿Cancelar la orden #7?')).not.toBeInTheDocument(),
    )
    expect(screen.getByRole('button', { name: 'Cancelar orden' })).toBeInTheDocument()
  })

  it('should_show_the_api_message_when_cancelling_fails', async () => {
    server.use(
      http.post('*/api/v1/orders/:id/cancel', () =>
        problem(409, 'Conflicto', 'Solo se pueden cancelar órdenes pendientes; la orden está PAID'),
      ),
    )
    const user = userEvent.setup()
    renderApp('/ordenes/7', { auth: authFor(customer) })

    await user.click(await screen.findByRole('button', { name: 'Cancelar orden' }))
    await user.click(await screen.findByRole('button', { name: 'Sí, cancelar' }))

    expect(await screen.findByText(/Solo se pueden cancelar/)).toBeInTheDocument()
  })

  it('should_not_offer_cancelling_once_the_order_is_paid', async () => {
    server.use(
      http.get('*/api/v1/orders/7', () => HttpResponse.json({ ...orderFixture, status: 'PAID' })),
    )
    renderApp('/ordenes/7', { auth: authFor(customer) })

    expect(await screen.findByRole('heading', { name: 'Orden #7' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cancelar orden' })).not.toBeInTheDocument()
  })

  it('should_hide_the_progress_for_cancelled_orders', async () => {
    server.use(
      http.get('*/api/v1/orders/7', () =>
        HttpResponse.json({ ...orderFixture, status: 'CANCELLED' }),
      ),
    )
    renderApp('/ordenes/7', { auth: authFor(customer) })

    expect(await screen.findByText('Cancelada')).toBeInTheDocument()
    expect(screen.queryByLabelText('Progreso de la orden')).not.toBeInTheDocument()
  })

  it('should_show_not_found_for_foreign_or_invalid_orders', async () => {
    const { router } = renderApp('/ordenes/999', { auth: authFor(customer) })
    expect(await screen.findByText('No encontramos esta orden')).toBeInTheDocument()

    await router.navigate('/ordenes/abc')
    expect(await screen.findByText('No encontramos esta orden')).toBeInTheDocument()
  })

  it('should_show_error_with_retry_for_server_failures', async () => {
    server.use(http.get('*/api/v1/orders/7', () => problem(500, 'Error', 'boom')))
    renderApp('/ordenes/7', { auth: authFor(customer) })

    expect(await screen.findByText(/problema/)).toBeInTheDocument()
  })
})
