import type { AuthResponse, Category, Product, User } from '@/api/types'

export const categories: Category[] = [
  { id: 1, name: 'Plantas de interior', description: 'Plantas para el hogar' },
  { id: 2, name: 'Flores', description: 'Ramos frescos' },
  { id: 5, name: 'Guías digitales', description: 'Guías descargables' },
]

const base = { description: 'Descripción de prueba', imageUrl: null, version: 0 }

export const products: Product[] = [
  {
    ...base,
    id: 1,
    type: 'PHYSICAL',
    name: 'Monstera Deliciosa',
    price: 45.9,
    category: categories[0],
    stock: 12,
    weightGrams: 1800,
    licenseType: null,
  },
  {
    ...base,
    id: 2,
    type: 'PHYSICAL',
    name: 'Pothos Dorado',
    price: 22.5,
    category: categories[0],
    stock: 3,
    weightGrams: 600,
    licenseType: null,
  },
  {
    ...base,
    id: 3,
    type: 'PHYSICAL',
    name: 'Ramo de Girasoles',
    price: 29.9,
    category: categories[1],
    stock: 0,
    weightGrams: 700,
    licenseType: null,
  },
  {
    ...base,
    id: 25,
    type: 'DIGITAL',
    name: 'Guía de Interior',
    price: 9.9,
    category: categories[2],
    stock: null,
    weightGrams: null,
    licenseType: 'PERSONAL',
  },
]

export const customer: User = {
  id: 2,
  email: 'cliente@bloom.test',
  fullName: 'Cliente Demo',
  role: 'CUSTOMER',
  createdAt: '2026-01-01T00:00:00Z',
}

export const admin: User = {
  ...customer,
  id: 1,
  email: 'admin@bloom.test',
  fullName: 'Admin Bloom',
  role: 'ADMIN',
}

export const authFor = (user: User, suffix = '1'): AuthResponse => ({
  accessToken: `access-${suffix}`,
  refreshToken: `refresh-${suffix}`,
  tokenType: 'Bearer',
  expiresIn: 900,
  user,
})
