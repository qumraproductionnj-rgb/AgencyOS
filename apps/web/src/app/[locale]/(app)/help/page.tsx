import { setRequestLocale } from 'next-intl/server'
import { HelpCenterClient } from '@/components/help/help-center-client'

export default async function HelpPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  return <HelpCenterClient />
}
