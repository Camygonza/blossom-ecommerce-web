import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { authFor, customer } from '@/test/fixtures'
import { problem } from '@/test/handlers'
import { server } from '@/test/server'
import { http as client } from './http'
import {
  endSession,
  getAccessToken,
  getRefreshToken,
  refreshSession,
  setSessionListener,
  startSession,
} from './session'

const listener = { onStarted: vi.fn(), onEnded: vi.fn() }
setSessionListener(listener)

afterEach(() => {
  endSession()
  vi.clearAllMocks()
})

describe('session', () => {
  it('should_keep_access_token_in_memory_and_refresh_token_in_storage', () => {
    startSession(authFor(customer))

    expect(getAccessToken()).toBe('access-1')
    expect(getRefreshToken()).toBe('refresh-1')
    expect(window.localStorage.getItem('bloom.refreshToken')).toBe('refresh-1')
    expect(window.localStorage.getItem('bloom.accessToken')).toBeNull()
  })

  it('should_share_one_request_between_simultaneous_refreshes', async () => {
    startSession(authFor(customer))
    let calls = 0
    server.use(
      http.post('*/api/v1/auth/refresh', () => {
        calls++
        return HttpResponse.json(authFor(customer, '2'))
      }),
    )

    const [a, b] = await Promise.all([refreshSession(), refreshSession()])

    expect(calls).toBe(1)
    expect(a).toBe(b)
    expect(getRefreshToken()).toBe('refresh-2')
  })

  it('should_return_null_without_calling_the_api_when_there_is_no_refresh_token', async () => {
    expect(await refreshSession()).toBeNull()
    expect(listener.onEnded).not.toHaveBeenCalled()
  })

  it('should_end_the_session_when_the_api_rejects_the_refresh_token', async () => {
    startSession(authFor(customer))
    server.use(
      http.post('*/api/v1/auth/refresh', () => problem(401, 'No autenticado', 'Token inválido')),
    )

    expect(await refreshSession()).toBeNull()

    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
  })

  it('should_keep_the_session_when_the_server_is_down', async () => {
    startSession(authFor(customer))
    server.use(http.post('*/api/v1/auth/refresh', () => problem(503, 'Error', 'caído')))

    expect(await refreshSession()).toBeNull()

    expect(getRefreshToken()).toBe('refresh-1')
  })
})

describe('http interceptors', () => {
  it('should_send_the_bearer_token_on_protected_calls_only', async () => {
    startSession(authFor(customer))
    const seen: Record<string, string | null> = {}
    server.use(
      http.get('*/api/v1/users/me', ({ request }) => {
        seen.me = request.headers.get('authorization')
        return HttpResponse.json(customer)
      }),
      http.post('*/api/v1/auth/login', ({ request }) => {
        seen.login = request.headers.get('authorization')
        return HttpResponse.json(authFor(customer))
      }),
    )

    await client.get('/users/me')
    await client.post('/auth/login', {})

    expect(seen.me).toBe('Bearer access-1')
    expect(seen.login).toBeNull()
  })

  it('should_renew_the_session_and_retry_once_when_a_call_returns_401', async () => {
    startSession(authFor(customer))
    const tokens: (string | null)[] = []
    server.use(
      http.get('*/api/v1/users/me', ({ request }) => {
        const token = request.headers.get('authorization')
        tokens.push(token)
        return token === 'Bearer access-2'
          ? HttpResponse.json(customer)
          : problem(401, 'No autenticado', 'expirado')
      }),
    )

    const response = await client.get('/users/me')

    expect(response.data).toEqual(customer)
    expect(tokens).toEqual(['Bearer access-1', 'Bearer access-2'])
  })

  it('should_fail_with_the_original_401_when_the_session_cannot_be_renewed', async () => {
    startSession(authFor(customer))
    server.use(
      http.get('*/api/v1/users/me', () => problem(401, 'No autenticado', 'expirado')),
      http.post('*/api/v1/auth/refresh', () => problem(401, 'No autenticado', 'revocado')),
    )

    await expect(client.get('/users/me')).rejects.toMatchObject({ response: { status: 401 } })
    expect(getAccessToken()).toBeNull()
  })

  it('should_not_loop_when_the_retry_is_also_unauthorized', async () => {
    startSession(authFor(customer))
    let calls = 0
    server.use(
      http.get('*/api/v1/users/me', () => {
        calls++
        return problem(401, 'No autenticado', 'sigue mal')
      }),
    )

    await expect(client.get('/users/me')).rejects.toMatchObject({ response: { status: 401 } })
    expect(calls).toBe(2)
  })

  it('should_pass_through_non_auth_errors_untouched', async () => {
    server.use(http.get('*/api/v1/users/me', () => problem(500, 'Error', 'boom')))

    await expect(client.get('/users/me')).rejects.toMatchObject({ response: { status: 500 } })
  })
})
