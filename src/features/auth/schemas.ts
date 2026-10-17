import { z } from 'zod'

const email = z.string().trim().min(1, 'Ingresa tu correo').pipe(z.email('Correo no válido'))

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Ingresa tu contraseña'),
})

// Misma regla que el api (@StrongPassword): 8–72 caracteres con mayúscula, minúscula, número y símbolo.
export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Ingresa tu nombre').max(255, 'Máximo 255 caracteres'),
    email,
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .max(72, 'Máximo 72 caracteres')
      .regex(/[A-Z]/, 'Incluye una mayúscula')
      .regex(/[a-z]/, 'Incluye una minúscula')
      .regex(/\d/, 'Incluye un número')
      .regex(/[^A-Za-z0-9\s]/, 'Incluye un símbolo'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden',
  })

export type LoginValues = z.infer<typeof loginSchema>
export type RegisterValues = z.infer<typeof registerSchema>
