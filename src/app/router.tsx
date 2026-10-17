import { createBrowserRouter, createMemoryRouter, type RouteObject } from 'react-router-dom'
import { HydrateSplash, NotFound, RouteError } from '@/components/RouteFallbacks'
import { Layout } from '@/components/Layout'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'

// Cada página se descarga al visitarla (lazy loading) para mantener ligera la carga inicial.
export const routes: RouteObject[] = [
  {
    element: <Layout />,
    errorElement: <RouteError />,
    HydrateFallback: HydrateSplash,
    children: [
      {
        index: true,
        lazy: async () => ({ Component: (await import('@/features/home/HomePage')).HomePage }),
      },
      {
        path: 'productos',
        lazy: async () => ({
          Component: (await import('@/features/products/ProductsPage')).ProductsPage,
        }),
      },
      {
        path: 'productos/:id',
        lazy: async () => ({
          Component: (await import('@/features/products/ProductDetailPage')).ProductDetailPage,
        }),
      },
      {
        path: 'login',
        lazy: async () => ({ Component: (await import('@/features/auth/LoginPage')).LoginPage }),
      },
      {
        path: 'registro',
        lazy: async () => ({
          Component: (await import('@/features/auth/RegisterPage')).RegisterPage,
        }),
      },
      {
        path: 'carrito',
        lazy: async () => ({ Component: (await import('@/features/cart/CartPage')).CartPage }),
      },
      {
        element: <ProtectedRoute role="CUSTOMER" />,
        children: [
          {
            path: 'ordenes',
            lazy: async () => ({
              Component: (await import('@/features/orders/OrdersPage')).OrdersPage,
            }),
          },
          {
            path: 'ordenes/:id',
            lazy: async () => ({
              Component: (await import('@/features/orders/OrderDetailPage')).OrderDetailPage,
            }),
          },
        ],
      },
      {
        element: <ProtectedRoute role="ADMIN" />,
        children: [
          {
            path: 'admin/productos',
            lazy: async () => ({
              Component: (await import('@/features/admin/AdminProductsPage')).AdminProductsPage,
            }),
          },
          {
            path: 'admin/ordenes',
            lazy: async () => ({
              Component: (await import('@/features/admin/AdminOrdersPage')).AdminOrdersPage,
            }),
          },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]

export const createAppRouter = () => createBrowserRouter(routes)
export const createTestRouter = (initialEntries: string[]) =>
  createMemoryRouter(routes, { initialEntries })
