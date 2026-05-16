import { setRequestLocale } from 'next-intl/server'
import { LeadsClient } from '@/components/leads/leads-client'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function LeadsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  return <LeadsClient />
}
