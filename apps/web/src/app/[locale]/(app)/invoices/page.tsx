import { setRequestLocale } from 'next-intl/server'
import { InvoicesClient } from '@/components/invoices/invoices-client'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function InvoicesPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  return <InvoicesClient />
}
