
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { EncryptedLocalStorage } from '@utils/EncryptedLocalStorage'

interface AuthState {
  accessToken: string | null
  guestToken: string | null
  isAuthenticated: boolean
  user_id: string | null
}

const initialState: AuthState = {
  accessToken: EncryptedLocalStorage.getItem('accessToken') ?? null,
  guestToken: EncryptedLocalStorage.getItem('guestToken') ?? null,
  isAuthenticated: EncryptedLocalStorage.getItem('isAuthenticated') ? true : false,
  user_id: JSON.parse(EncryptedLocalStorage.getItem('user_id') || 'null'),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthToken: (
      state,
      action: PayloadAction<{
        accessToken?: string | null
        guestToken?: string | null
        isAuthenticated: boolean
        user_id?: string | null
      }>,
    ) => {
      const { accessToken, guestToken, isAuthenticated, user_id } = action.payload
      if (accessToken !== undefined) {
        state.accessToken = accessToken
        EncryptedLocalStorage.setItem('accessToken', accessToken || '')
      }

      if (guestToken !== undefined) {
        state.guestToken = guestToken
        EncryptedLocalStorage.setItem('guestToken', guestToken || '')
      }

      if (isAuthenticated !== undefined) {
        state.isAuthenticated = isAuthenticated
        EncryptedLocalStorage.setItem('isAuthenticated', JSON.stringify(isAuthenticated))
      }
      if (user_id !== undefined) {
        state.user_id = user_id
        EncryptedLocalStorage.setItem('user_id', JSON.stringify(user_id))
      }
    },
    clearAuthToken: (state) => {
      state.accessToken = null
      state.guestToken = null
      state.user_id = null
      state.isAuthenticated = false

      try {
        EncryptedLocalStorage.removeItem('accessToken')
        EncryptedLocalStorage.removeItem('guestToken')
        localStorage.removeItem('isAuthenticated')
        localStorage.clear()
      } catch (error) {
        console.error('Failed to clear localStorage:', error)
      }
    },
  },
})

export const { setAuthToken, clearAuthToken } = authSlice.actions
export default authSlice.reducer

