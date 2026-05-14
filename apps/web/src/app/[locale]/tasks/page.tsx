import { setRequestLocale } from 'next-intl/server'
import { TasksClient } from '@/components/tasks/tasks-client'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function TasksPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  return <TasksClient />
}
