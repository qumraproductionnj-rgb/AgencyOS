import type { ReactNode } from 'react'
import { IntroWrapper } from '@/components/intro/intro-wrapper'

export default function AppLayout({ children }: { children: ReactNode }) {
  return <IntroWrapper>{children}</IntroWrapper>
}
