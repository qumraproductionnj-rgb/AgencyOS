let posthog: {
  capture: (e: string, p?: Record<string, unknown>) => void
  identify: (id: string, props?: Record<string, unknown>) => void
} | null = null

async function getPostHog() {
  if (posthog) return posthog
  if (typeof window === 'undefined') return null

  const key = process.env['NEXT_PUBLIC_POSTHOG_KEY']
  if (!key) return null

  const { default: PostHog } = await import('posthog-js')
  PostHog.init(key, {
    api_host: process.env['NEXT_PUBLIC_POSTHOG_HOST'] ?? 'https://app.posthog.com',
    capture_pageview: false,
    persistence: 'localStorage',
  })
  posthog = PostHog
  return posthog
}

export async function track(event: string, properties?: Record<string, unknown>) {
  const ph = await getPostHog()
  ph?.capture(event, properties)
}

export async function identify(userId: string, properties?: Record<string, unknown>) {
  const ph = await getPostHog()
  ph?.identify(userId, properties)
}
