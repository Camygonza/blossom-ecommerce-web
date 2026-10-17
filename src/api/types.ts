// Tipos alineados con el contrato OpenAPI del api (repositorios/blossom-ecommerce-api/docs/openapi.json).

export type Role = 'CUSTOMER' | 'ADMIN'

export interface User {
  id: number
  email: string
  fullName: string
  role: Role
  createdAt: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: User
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest extends LoginRequest {
  fullName: string
}

export interface Category {
  id: number
  name: string
  description: string | null
}

export type ProductType = 'PHYSICAL' | 'DIGITAL'
export type LicenseType = 'PERSONAL' | 'COMMERCIAL'

export interface Product {
  id: number
  type: ProductType
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  category: Category
  /** Solo productos físicos. */
  stock: number | null
  weightGrams: number | null
  /** Solo productos digitales. */
  licenseType: LicenseType | null
  version: number
}

export interface Page<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export type ProductSort = 'id,asc' | 'price,asc' | 'price,desc' | 'name,asc' | 'createdAt,desc'

export interface ProductSearchParams {
  name?: string
  categoryId?: number
  minPrice?: number
  maxPrice?: number
  /** Base 0, como el api. */
  page?: number
  size?: number
  sort?: ProductSort
}

/** ProblemDetail (RFC 7807) que devuelve el api en todos los errores. */
export interface ProblemDetail {
  type?: string
  title?: string
  status?: number
  detail?: string
  instance?: string
  requestId?: string
  /** Solo en 400 de validación: campo → mensaje. */
  errors?: Record<string, string>
  retryAfterSeconds?: number
}

export interface ApiError {
  status: number | 'NETWORK_ERROR'
  problem?: ProblemDetail
}
