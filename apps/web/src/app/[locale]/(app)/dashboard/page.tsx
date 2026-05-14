import { setRequestLocale } from 'next-intl/server'
import { DashboardClient } from '@/components/dashboard/dashboard-client'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  return <DashboardClient />
}
