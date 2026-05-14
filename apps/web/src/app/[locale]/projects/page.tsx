import { setRequestLocale } from 'next-intl/server'
import { ProjectsClient } from '@/components/projects/projects-client'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function ProjectsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  return <ProjectsClient />
}
