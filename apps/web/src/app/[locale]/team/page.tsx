import { setRequestLocale } from 'next-intl/server'
import { TeamPresenceClient } from '@/components/realtime/team-presence-client'

export default async function TeamPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  return <TeamPresenceClient />
}
