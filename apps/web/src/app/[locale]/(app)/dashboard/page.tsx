import { setRequestLocale } from 'next-intl/server'
import { DashboardPage as Dashboard } from '@/components/dashboard/dashboard-page'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  return <Dashboard />
}
