import { useEffect, useCallback } from 'react'
import { useLocale } from 'next-intl'

const STORAGE_PREFIX = 'agencyos:tour:'

interface TourStep {
  elementId: string
  titleAr: string
  titleEn: string
  descAr: string
  descEn: string
  side?: 'top' | 'bottom' | 'left' | 'right'
}

export function useTour(tourId: string, steps: TourStep[]) {
  const locale = useLocale()
  const isAr = locale === 'ar'

  const hasSeenTour = (): boolean => {
    if (typeof window === 'undefined') return true
    return localStorage.getItem(`${STORAGE_PREFIX}${tourId}`) === '1'
  }

  const markSeen = useCallback(() => {
    localStorage.setItem(`${STORAGE_PREFIX}${tourId}`, '1')
  }, [tourId])

  const startTour = useCallback(async () => {
    const { driver } = await import('driver.js')
    // CSS is loaded globally via next.config or a CSS import in the page

    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      nextBtnText: isAr ? 'التالي ←' : 'Next →',
      prevBtnText: isAr ? '→ السابق' : '← Back',
      doneBtnText: isAr ? 'تم ✓' : 'Done ✓',
      progressText: isAr ? '{{current}} من {{total}}' : '{{current}} of {{total}}',
      onDestroyStarted: () => {
        markSeen()
        driverObj.destroy()
      },
      steps: steps.map((s) => ({
        element: `#${s.elementId}`,
        popover: {
          title: isAr ? s.titleAr : s.titleEn,
          description: isAr ? s.descAr : s.descEn,
          side: s.side ?? 'bottom',
        },
      })),
    })

    driverObj.drive()
  }, [isAr, steps, markSeen])

  useEffect(() => {
    if (!hasSeenTour()) {
      // Small delay to let page render first
      const timer = setTimeout(() => {
        void startTour()
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [startTour])

  return { startTour, markSeen }
}
