'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { apiClient, clearAdminToken, getAdminToken, setAdminToken } from '@/lib/api'

interface AdminAuthState {
  isAuthenticated: boolean
  isLoading: boolean
  userId: string | null
}

export function useAdminAuth() {
  const router = useRouter()
  const [state, setState] = useState<AdminAuthState>(() => ({
    isAuthenticated: !!getAdminToken(),
    isLoading: false,
    userId: typeof window !== 'undefined' ? localStorage.getItem('admin_user_id') : null,
  }))

  const login = useCallback(
    async (email: string, password: string) => {
      setState((s) => ({ ...s, isLoading: true }))
      try {
        const result = await apiClient<{
          accessToken: string
          refreshToken: string
          userId: string
        }>('/platform/auth/login', {
          method: 'POST',
          body: { email, password },
        })
        setAdminToken(result.accessToken, result.refreshToken)
        localStorage.setItem('admin_user_id', result.userId)
        setState({ isAuthenticated: true, isLoading: false, userId: result.userId })
        router.push('/dashboard')
      } catch (err) {
        setState((s) => ({ ...s, isLoading: false }))
        throw err
      }
    },
    [router],
  )

  const logout = useCallback(() => {
    clearAdminToken()
    setState({ isAuthenticated: false, isLoading: false, userId: null })
    router.push('/login')
  }, [router])

  return { ...state, login, logout }
}
