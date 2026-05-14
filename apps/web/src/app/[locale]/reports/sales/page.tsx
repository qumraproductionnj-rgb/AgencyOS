import { setRequestLocale } from 'next-intl/server'
import { SalesReportClient } from '@/components/reports/sales-report-client'

export default async function SalesReportPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  return <SalesReportClient />
}
