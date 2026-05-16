import { setRequestLocale } from 'next-intl/server'
import { ExpensesClient } from '@/components/expenses/expenses-client'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function ExpensesPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  return <ExpensesClient />
}
