
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { store, type RootState } from '@config/Store'

export const AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL || '',
  headers: {
    Accept: '*/*',
    'Content-Type': 'application/json',
  },
})

// Request interceptor
AxiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const state = store.getState() as RootState
    const { accessToken, guestToken } = state.auth

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    } else if (guestToken) {
      config.headers.Authorization = `Bearer ${guestToken}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  },
)

