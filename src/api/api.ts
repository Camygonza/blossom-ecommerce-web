import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from './axiosBaseQuery'
import { endSession, getRefreshToken, startSession } from './session'
import type {
  AuthResponse,
  Category,
  LoginRequest,
  Page,
  Product,
  ProductSearchParams,
  RegisterRequest,
} from './types'

export const api = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery,
  tagTypes: ['Product', 'Order'],
  endpoints: (build) => ({
    getProducts: build.query<Page<Product>, ProductSearchParams>({
      query: (params) => ({ url: '/products', params }),
      providesTags: ['Product'],
    }),
    getProduct: build.query<Product, number>({
      query: (id) => ({ url: `/products/${id}` }),
      providesTags: (_result, _error, id) => [{ type: 'Product', id }],
    }),
    getCategories: build.query<Category[], void>({
      query: () => ({ url: '/categories' }),
    }),
    login: build.mutation<AuthResponse, LoginRequest>({
      query: (data) => ({ url: '/auth/login', method: 'post', data }),
      onQueryStarted: async (_arg, { queryFulfilled }) => {
        try {
          startSession((await queryFulfilled).data)
        } catch {
          // el error llega al componente por unwrap(); aquí no hay sesión que iniciar
        }
      },
    }),
    register: build.mutation<AuthResponse, RegisterRequest>({
      query: (data) => ({ url: '/auth/register', method: 'post', data }),
      onQueryStarted: async (_arg, { queryFulfilled }) => {
        try {
          startSession((await queryFulfilled).data)
        } catch {
          // el error llega al componente por unwrap(); aquí no hay sesión que iniciar
        }
      },
    }),
    logout: build.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'post',
        data: { refreshToken: getRefreshToken() },
      }),
      // la sesión local se cierra aunque el api no responda
      onQueryStarted: async (_arg, { queryFulfilled }) => {
        try {
          await queryFulfilled
        } catch {
          // sin conexión o token ya inválido: igual se cierra la sesión local
        } finally {
          endSession()
        }
      },
    }),
  }),
})

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useGetCategoriesQuery,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
} = api
