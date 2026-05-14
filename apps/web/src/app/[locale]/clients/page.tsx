import { setRequestLocale } from 'next-intl/server'
import { ClientsClient } from '@/components/clients/clients-client'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function ClientsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  return <ClientsClient />
}
