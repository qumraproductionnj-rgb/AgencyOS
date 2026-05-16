import type { ReactNode } from 'react'
import { AppShell } from '@/components/app-shell'
import { FeedbackForm } from '@/components/feedback/feedback-form'
import { MobileNav } from '@/components/mobile/mobile-nav'
import { PWAInstallPrompt } from '@/components/pwa-install-prompt'
import { IntroWrapper } from '@/components/intro/intro-wrapper'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <IntroWrapper>
      <AppShell>{children}</AppShell>
      <FeedbackForm />
      <MobileNav />
      <PWAInstallPrompt />
    </IntroWrapper>
  )
}
