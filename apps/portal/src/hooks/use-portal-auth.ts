'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { apiClient, clearPortalToken, getPortalToken, setPortalToken } from '@/lib/api'

interface PortalAuthState {
  isAuthenticated: boolean
  isLoading: boolean
  userId: string | null
  clientId: string | null
}

export function usePortalAuth() {
  const router = useRouter()
  const [state, setState] = useState<PortalAuthState>(() => ({
    isAuthenticated: !!getPortalToken(),
    isLoading: false,
    userId: typeof window !== 'undefined' ? localStorage.getItem('portal_user_id') : null,
    clientId: typeof window !== 'undefined' ? localStorage.getItem('portal_client_id') : null,
  }))

  const login = useCallback(
    async (email: string, password: string) => {
      setState((s) => ({ ...s, isLoading: true }))
      try {
        const result = await apiClient<{
          accessToken: string
          refreshToken: string
          userId: string
          clientId: string
        }>('/portal/auth/login', {
          method: 'POST',
          body: { email, password },
        })
        setPortalToken(result.accessToken, result.refreshToken)
        localStorage.setItem('portal_user_id', result.userId)
        localStorage.setItem('portal_client_id', result.clientId)
        setState({
          isAuthenticated: true,
          isLoading: false,
          userId: result.userId,
          clientId: result.clientId,
        })
        router.push('/dashboard')
      } catch (err) {
        setState((s) => ({ ...s, isLoading: false }))
        throw err
      }
    },
    [router],
  )

  const logout = useCallback(() => {
    clearPortalToken()
    setState({ isAuthenticated: false, isLoading: false, userId: null, clientId: null })
    router.push('/login')
  }, [router])

  return { ...state, login, logout }
}
