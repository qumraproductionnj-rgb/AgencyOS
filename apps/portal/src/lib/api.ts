const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001/api/v1'

interface RequestOptions {
  method?: string
  body?: Record<string, unknown>
  headers?: Record<string, string>
}

export async function apiClient<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('portal_token') : null
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
    headers['X-Tier'] = 'EXTERNAL'
  }
  const fetchOpts: RequestInit & { headers: Record<string, string> } = {
    method: options.method ?? 'GET',
    headers,
  }
  if (options.body) {
    fetchOpts.body = JSON.stringify(options.body)
  }
  const res = await fetch(`${API_BASE}${path}`, fetchOpts)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message ?? 'Request failed')
  }
  return res.json() as Promise<T>
}

export function setPortalToken(token: string, refreshToken: string): void {
  localStorage.setItem('portal_token', token)
  localStorage.setItem('portal_refresh_token', refreshToken)
}

export function clearPortalToken(): void {
  localStorage.removeItem('portal_token')
  localStorage.removeItem('portal_refresh_token')
  localStorage.removeItem('portal_client_id')
  localStorage.removeItem('portal_user_id')
}

export function getPortalToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('portal_token')
}
