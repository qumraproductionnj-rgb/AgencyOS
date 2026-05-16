import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  vus: 50,
  duration: '2m',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
}

const BASE = __ENV.BASE_URL || 'https://api.agencyos.app'

export default function () {
  // Health check
  const health = http.get(`${BASE}/health`)
  check(health, { 'health 200': (r) => r.status === 200 })

  // Login (expect 401 on bad creds — just checking response time)
  const login = http.post(
    `${BASE}/api/v1/auth/login`,
    JSON.stringify({ email: 'test@example.com', password: 'wrongpassword' }),
    { headers: { 'Content-Type': 'application/json' } },
  )
  check(login, { 'login responds': (r) => r.status < 500 })

  sleep(1)
}
