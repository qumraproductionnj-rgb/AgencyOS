import { refreshAccessToken } from './auth'

const BASE = (process.env['NEXT_PUBLIC_API_URL'] ?? '') + '/api/v1'

async function getToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null
  const { useAuthStore } = await import('@/store/auth.store')
  return useAuthStore.getState().token
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function request<T>(
  path: string,
  options?: RequestInit,
  authRetry = true,
  serverRetry = 0,
): Promise<T> {
  const token = await getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> | undefined),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, { ...options, headers })
  } catch {
    // Network error — retry once
    if (serverRetry < 1) {
      await sleep(1000)
      return request<T>(path, options, authRetry, serverRetry + 1)
    }
    throw new Error('Network error — please check your connection')
  }

  if (res.status === 401 && authRetry) {
    const newToken = await refreshAccessToken()
    if (newToken) return request<T>(path, options, false, serverRetry)
    if (typeof window !== 'undefined') window.location.href = '/ar/login'
    throw new Error('Unauthorized')
  }

  // Retry on 5xx up to 3 times with exponential backoff
  if (res.status >= 500 && serverRetry < 3) {
    await sleep(1000 * Math.pow(2, serverRetry))
    return request<T>(path, options, authRetry, serverRetry + 1)
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
