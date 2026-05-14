import { setRequestLocale } from 'next-intl/server'
import { QuotationsClient } from '@/components/quotations/quotations-client'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function QuotationsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  return <QuotationsClient />
}
