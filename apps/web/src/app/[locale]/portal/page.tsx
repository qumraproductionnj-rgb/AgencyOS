import { setRequestLocale } from 'next-intl/server'
import { PortalClient } from '@/components/portal/portal-client'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function PortalPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  return <PortalClient />
}
