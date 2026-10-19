import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import reducer, { toastDismissed, toastShown } from '@/features/ui/uiSlice'
import { renderApp } from '@/test/render'
import { ErrorBoundary } from './ErrorBoundary'

function Boom(): never {
  throw new Error('fallo de render')
}

describe('ErrorBoundary', () => {
  it('should_show_a_friendly_screen_instead_of_a_blank_page_when_a_child_throws', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Algo se marchitó')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Recargar' })).toBeInTheDocument()
  })

  it('should_render_children_when_nothing_fails', () => {
    render(
      <ErrorBoundary>
        <p>todo bien</p>
      </ErrorBoundary>,
    )
    expect(screen.getByText('todo bien')).toBeInTheDocument()
  })
})

describe('route fallbacks', () => {
  it('should_offer_a_way_home_from_the_not_found_page', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/ruta/que/no/existe')

    await user.click(await screen.findByRole('button', { name: 'Ir al inicio' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
  })
})

describe('uiSlice', () => {
  it('should_queue_toasts_and_dismiss_them_by_id', () => {
    let state = reducer(undefined, toastShown('uno', 'success'))
    state = reducer(state, toastShown('dos'))

    expect(state.toasts.map((t) => [t.message, t.severity])).toEqual([
      ['uno', 'success'],
      ['dos', 'info'],
    ])
    state = reducer(state, toastDismissed(state.toasts[0].id))
    expect(state.toasts.map((t) => t.message)).toEqual(['dos'])
  })
})
