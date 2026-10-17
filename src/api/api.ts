import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from './axiosBaseQuery'
import { endSession, getRefreshToken, startSession } from './session'
import type {
  AdminOrderParams,
  AuthResponse,
  Category,
  CreateOrderRequest,
  LoginRequest,
  Order,
  OrderStatus,
  Page,
  PageParams,
  Product,
  ProductInput,
  ProductSearchParams,
  RegisterRequest,
} from './types'

export const api = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery,
  tagTypes: ['Product', 'Order'],
  endpoints: (build) => ({
    // --- catálogo (público) ---
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

    // --- auth ---
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

    // --- órdenes del cliente ---
    createOrder: build.mutation<Order, CreateOrderRequest>({
      query: (data) => ({ url: '/orders', method: 'post', data }),
      // comprar descuenta stock: el catálogo cacheado queda viejo
      invalidatesTags: ['Order', 'Product'],
    }),
    getMyOrders: build.query<Page<Order>, PageParams>({
      query: (params) => ({ url: '/orders/me', params }),
      providesTags: ['Order'],
    }),
    getOrder: build.query<Order, number>({
      query: (id) => ({ url: `/orders/${id}` }),
      providesTags: ['Order'],
    }),
    cancelOrder: build.mutation<Order, number>({
      query: (id) => ({ url: `/orders/${id}/cancel`, method: 'post' }),
      // cancelar repone stock
      invalidatesTags: ['Order', 'Product'],
    }),

    // --- administración ---
    getAdminOrders: build.query<Page<Order>, AdminOrderParams>({
      query: (params) => ({ url: '/orders', params }),
      providesTags: ['Order'],
    }),
    updateOrderStatus: build.mutation<Order, { id: number; status: OrderStatus }>({
      query: ({ id, status }) => ({
        url: `/orders/${id}/status`,
        method: 'patch',
        data: { status },
      }),
      invalidatesTags: ['Order', 'Product'],
    }),
    createProduct: build.mutation<Product, ProductInput>({
      query: (data) => ({ url: '/products', method: 'post', data }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: build.mutation<Product, { id: number; data: ProductInput }>({
      query: ({ id, data }) => ({ url: `/products/${id}`, method: 'put', data }),
      invalidatesTags: ['Product'],
    }),
    deleteProduct: build.mutation<void, number>({
      query: (id) => ({ url: `/products/${id}`, method: 'delete' }),
      invalidatesTags: ['Product'],
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
  useCreateOrderMutation,
  useGetMyOrdersQuery,
  useGetOrderQuery,
  useCancelOrderMutation,
  useGetAdminOrdersQuery,
  useUpdateOrderStatusMutation,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = api
