import { AiToolsList } from '@/components/ai-tools/ai-tools-list'
import { setRequestLocale } from 'next-intl/server'

interface AiToolsPageProps {
  params: Promise<{ locale: string }>
}

export default async function AiToolsPage({ params }: AiToolsPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  return <AiToolsList />
}
