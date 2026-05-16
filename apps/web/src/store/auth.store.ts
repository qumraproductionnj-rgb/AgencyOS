'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthUser {
  id: string
  email: string
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  setAuth: (user: AuthUser, token: string, refreshToken: string) => void
  setToken: (token: string, refreshToken: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user, token, refreshToken) =>
        set({ user, token, refreshToken, isAuthenticated: true }),
      setToken: (token, refreshToken) => set({ token, refreshToken }),
      clearAuth: () => set({ user: null, token: null, refreshToken: null, isAuthenticated: false }),
    }),
    { name: 'vision-auth' },
  ),
)
