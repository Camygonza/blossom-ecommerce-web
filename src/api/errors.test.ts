import { describe, expect, it } from 'vitest'
import { errorMessage, fieldErrors } from './errors'

describe('errorMessage', () => {
  it('should_use_problem_detail_when_the_api_explains_the_error', () => {
    expect(errorMessage({ status: 401, problem: { detail: 'Credenciales inválidas' } })).toBe(
      'Credenciales inválidas',
    )
    expect(errorMessage({ status: 409, problem: { detail: 'Stock insuficiente' } })).toBe(
      'Stock insuficiente',
    )
  })

  it('should_describe_network_and_server_failures_without_leaking_internals', () => {
    expect(errorMessage({ status: 'NETWORK_ERROR' })).toMatch(/conectar/)
    expect(errorMessage({ status: 503, problem: { detail: 'stacktrace' } })).toMatch(/servidor/)
  })

  it('should_add_wait_time_when_the_account_is_locked_or_rate_limited', () => {
    const message = errorMessage({
      status: 423,
      problem: { detail: 'Cuenta bloqueada', retryAfterSeconds: 900 },
    })
    expect(message).toContain('Cuenta bloqueada')
    expect(message).toContain('15 min')
  })

  it('should_return_fallback_for_unknown_error_shapes', () => {
    expect(errorMessage(new Error('x'))).toMatch(/Algo salió mal/)
    expect(errorMessage(undefined, 'por defecto')).toBe('por defecto')
    expect(errorMessage({ status: 403 })).toMatch(/permiso/)
    expect(errorMessage({ status: 404 })).toMatch(/No encontramos/)
  })
})

describe('fieldErrors', () => {
  it('should_return_validation_errors_per_field', () => {
    expect(fieldErrors({ status: 400, problem: { errors: { email: 'inválido' } } })).toEqual({
      email: 'inválido',
    })
    expect(fieldErrors({ status: 500 })).toEqual({})
    expect(fieldErrors(null)).toEqual({})
  })
})
