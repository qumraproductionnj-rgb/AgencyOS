const API = process.env.API_URL ?? 'http://localhost:3001'
const API_V1 = `${API}/api/v1`

async function api(path: string, options?: RequestInit) {
  const mergedHeaders = new Headers({ 'Content-Type': 'application/json' })
  if (options?.headers) {
    const incoming = new Headers(options.headers as Record<string, string>)
    incoming.forEach((v, k) => mergedHeaders.set(k, v))
  }
  const res = await fetch(`${API_V1}${path}`, {
    method: options?.method ?? 'GET',
    body: options?.body,
    headers: mergedHeaders,
  })
  const body = await res.json().catch(() => ({}))
  return { status: res.status, body, headers: res.headers }
}

export async function signup(data: {
  company: { name: string; slug: string }
  owner: { email: string; password: string; fullNameAr: string; preferredLanguage?: string }
}) {
  return api('/auth/signup', { method: 'POST', body: JSON.stringify(data) })
}

export async function verifyEmail(token: string) {
  return api('/auth/verify-email', { method: 'POST', body: JSON.stringify({ token }) })
}

export async function login(email: string, password: string) {
  return api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
}

export async function createEmployee(token: string, data: Record<string, unknown>) {
  return api('/employees', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function acceptInvite(token: string, password: string) {
  return api('/employees/accept-invite', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  })
}

export async function createWorkLocation(token: string, data: Record<string, unknown>) {
  return api('/work-locations', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function assignEmployeeToLocation(
  token: string,
  locationId: string,
  employeeIds: string[],
) {
  return api(`/work-locations/${locationId}/employees`, {
    method: 'POST',
    body: JSON.stringify({ employeeIds }),
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function checkIn(token: string, data: { latitude: number; longitude: number }) {
  return api('/attendance/check-in', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function getTodayAll(token: string) {
  return api('/attendance/today/all', { headers: { Authorization: `Bearer ${token}` } })
}

export async function clearMailhog() {
  await fetch('http://localhost:8025/api/v1/messages', { method: 'DELETE' }).catch(() => {
    void 0
  })
}

function decodeQP(text: string): string {
  // Step 1: remove QP soft line breaks (= followed by CR/LF)
  let s = text.replace(/=\r?\n/g, '')
  // Step 2: decode =XX hex sequences
  s = s.replace(/=([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
  return s
}

async function pollMailhog(): Promise<string> {
  for (let i = 0; i < 30; i++) {
    const res = await fetch('http://localhost:8025/api/v2/messages').catch(() => null)
    if (!res) {
      await sleep(1000)
      continue
    }
    const data = await res.json()
    const msg = data.items?.[0]
    if (msg) {
      const raw = msg.Content?.Body ?? msg.Content?.Text ?? ''
      const body = decodeQP(raw)
      const match = body.match(/[?&]token=([a-zA-Z0-9_-]{10,})/)
      if (match) return match[1]
    }
    await sleep(1000)
  }
  throw new Error('Token not found in MailHog after 30s')
}

export async function getVerifyToken() {
  return pollMailhog()
}

export async function getInviteToken() {
  return pollMailhog()
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}
