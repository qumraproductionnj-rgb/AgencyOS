import { setRequestLocale } from 'next-intl/server'
import WizardPage from '@/components/onboarding/wizard-page'

interface OnboardingPageProps {
  params: Promise<{ locale: string }>
}

export default async function OnboardingPage({ params }: OnboardingPageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  return <WizardPage />
}
