import { setRequestLocale } from 'next-intl/server'
import { OrgWizard } from '@/components/org-structure/org-wizard'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function OrgStructurePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <OrgWizard />
    </div>
  )
}
