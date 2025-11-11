
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { store, type RootState } from '@config/Store'

export const AxiosInstance = axios.create({
  // Prefer env override; otherwise use same-origin so Vercel rewrites/edge proxy can handle /api/*
  baseURL: ((import.meta as any)?.env?.VITE_APP_API_URL as string | undefined) || '',
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

