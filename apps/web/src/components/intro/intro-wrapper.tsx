'use client'

import { useState, useEffect } from 'react'
import { VisionIntro } from './vision-intro'

const STORAGE_KEY = 'agencyos:intro:shown'

export function IntroWrapper({ children }: { children: React.ReactNode }) {
  const [showIntro, setShowIntro] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setShowIntro(true)
    }
  }, [])

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setShowIntro(false)
  }

  return (
    <>
      {showIntro && <VisionIntro onComplete={handleComplete} />}
      {children}
    </>
  )
}
