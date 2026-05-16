import { useAuthStore } from '@/store/auth.store'

const API = process.env['NEXT_PUBLIC_API_URL'] ?? '/api'

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.message ?? 'فشل تسجيل الدخول')
  }
  const data = (await res.json()) as {
    accessToken: string
    refreshToken: string
    userId: string
  }
  useAuthStore.getState().setAuth({ id: data.userId, email }, data.accessToken, data.refreshToken)
  // Store refresh token in cookie for middleware check
  document.cookie = `vision_token=${data.accessToken}; path=/; max-age=900; SameSite=Lax`
  document.cookie = `vision_refresh=${data.refreshToken}; path=/; max-age=604800; SameSite=Lax`
}

export async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken, setToken, clearAuth } = useAuthStore.getState()
  if (!refreshToken) return null
  try {
    const res = await fetch(`${API}/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) {
      clearAuth()
      clearCookies()
      return null
    }
    const data = (await res.json()) as {
      accessToken: string
      refreshToken: string
    }
    setToken(data.accessToken, data.refreshToken)
    document.cookie = `vision_token=${data.accessToken}; path=/; max-age=900; SameSite=Lax`
    document.cookie = `vision_refresh=${data.refreshToken}; path=/; max-age=604800; SameSite=Lax`
    return data.accessToken
  } catch {
    clearAuth()
    clearCookies()
    return null
  }
}

export function logoutUser() {
  const { token, refreshToken, clearAuth } = useAuthStore.getState()
  // Fire-and-forget logout
  if (token && refreshToken) {
    fetch(`${API}/v1/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => null)
  }
  clearAuth()
  clearCookies()
}

function clearCookies() {
  document.cookie = 'vision_token=; path=/; max-age=0'
  document.cookie = 'vision_refresh=; path=/; max-age=0'
}
