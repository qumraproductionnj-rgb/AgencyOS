export async function healthCheck(): Promise<string[]> {
  const failures: string[] = []

  try {
    const api = await fetch('http://localhost:3001/health')
    const data = await api.json()
    if (data.status !== 'ok') failures.push(`API health: ${data.status}`)
  } catch {
    failures.push('API not reachable on :3001 — run `pnpm dev:api`')
  }

  try {
    const web = await fetch('http://localhost:3000')
    if (web.status !== 200) failures.push(`Web returned ${web.status}`)
  } catch {
    failures.push('Web not reachable on :3000 — run `pnpm dev:web`')
  }

  try {
    const mh = await fetch('http://localhost:8025/api/v2/messages')
    if (mh.status !== 200) failures.push(`MailHog returned ${mh.status}`)
  } catch {
    failures.push('MailHog not reachable on :8025 — run `docker compose up -d`')
  }

  return failures
}
