import { describe, expect, it } from 'vitest'
import { loginSchema, registerSchema } from './schemas'

const valid = {
  fullName: 'Ana Pérez',
  email: 'ana@bloom.test',
  password: 'Passw0rd!',
  confirmPassword: 'Passw0rd!',
}

describe('registerSchema', () => {
  it('should_accept_a_strong_password_matching_the_api_rule', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true)
  })

  it.each([
    ['Sh0rt!', 'Mínimo 8'],
    ['passw0rd!', 'mayúscula'],
    ['PASSW0RD!', 'minúscula'],
    ['Password!', 'número'],
    ['Passw0rdd', 'símbolo'],
  ])('should_reject_password_%s', (password, message) => {
    const result = registerSchema.safeParse({ ...valid, password, confirmPassword: password })
    expect(result.success).toBe(false)
    expect(JSON.stringify(result.error?.issues)).toContain(message)
  })

  it('should_reject_mismatched_confirmation_and_bad_email', () => {
    const mismatch = registerSchema.safeParse({ ...valid, confirmPassword: 'Otra123!' })
    expect(mismatch.error?.issues[0].path).toEqual(['confirmPassword'])
    expect(registerSchema.safeParse({ ...valid, email: 'no-es-correo' }).success).toBe(false)
  })
})

describe('loginSchema', () => {
  it('should_require_email_and_password', () => {
    expect(loginSchema.safeParse({ email: '', password: '' }).success).toBe(false)
    expect(loginSchema.safeParse({ email: 'a@b.co', password: 'x' }).success).toBe(true)
  })
})
