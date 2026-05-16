import { refreshAccessToken } from './auth'

const BASE = (process.env['NEXT_PUBLIC_API_URL'] ?? '') + '/api/v1'

async function getToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null
  const { useAuthStore } = await import('@/store/auth.store')
  return useAuthStore.getState().token
}

async function request<T>(path: string, options?: RequestInit, retry = true): Promise<T> {
  const token = await getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> | undefined),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  if (res.status === 401 && retry) {
    const newToken = await refreshAccessToken()
    if (newToken) return request<T>(path, options, false)
    if (typeof window !== 'undefined') window.location.href = '/ar/login'
    throw new Error('Unauthorized')
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.message ?? `Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) as BodyInit | null }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      ...(body !== undefined ? { body: JSON.stringify(body) as BodyInit | null } : {}),
    }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PATCH',
      ...(body !== undefined ? { body: JSON.stringify(body) as BodyInit | null } : {}),
    }),
  del: <T = void>(path: string) => request<T>(path, { method: 'DELETE' }),
}
