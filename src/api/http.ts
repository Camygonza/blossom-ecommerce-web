import axios, { type InternalAxiosRequestConfig } from 'axios'
import { API_URL, getAccessToken, refreshSession } from './session'

export const http = axios.create({ baseURL: API_URL, timeout: 15000 })

type RetriableConfig = InternalAxiosRequestConfig & { retried?: boolean }

const isAuthEndpoint = (url?: string) => url?.startsWith('/auth/') ?? false

http.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token && !isAuthEndpoint(config.url)) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

// Ante un 401 intenta renovar la sesión una vez y repite la petición; si no se puede, deja pasar el error.
http.interceptors.response.use(undefined, async (error: unknown) => {
  if (!axios.isAxiosError(error) || error.response?.status !== 401 || !error.config) {
    throw error
  }
  const config: RetriableConfig = error.config
  if (config.retried || isAuthEndpoint(config.url)) throw error

  const renewed = await refreshSession()
  if (!renewed) throw error

  config.retried = true
  return http.request(config)
})
