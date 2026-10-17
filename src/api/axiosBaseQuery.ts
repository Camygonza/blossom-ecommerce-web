import type { BaseQueryFn } from '@reduxjs/toolkit/query'
import { isAxiosError, type Method } from 'axios'
import { http } from './http'
import type { ApiError, ProblemDetail } from './types'

export interface AxiosQueryArgs {
  url: string
  method?: Method
  data?: unknown
  params?: object
}

/** baseQuery de RTK Query sobre axios (D5): los errores salen normalizados como ApiError. */
export const axiosBaseQuery: BaseQueryFn<AxiosQueryArgs, unknown, ApiError> = async ({
  url,
  method = 'get',
  data,
  params,
}) => {
  try {
    const response = await http.request({ url, method, data, params })
    return { data: response.data }
  } catch (error) {
    if (isAxiosError<ProblemDetail>(error) && error.response) {
      return { error: { status: error.response.status, problem: error.response.data } }
    }
    return { error: { status: 'NETWORK_ERROR' } }
  }
}
