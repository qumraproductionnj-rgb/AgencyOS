'use client'

export function useDesktop() {
  const isDesktop = typeof window !== 'undefined' && !!window.electron?.isElectron

  const notify = (title: string, body: string) => {
    if (isDesktop && window.electron) {
      window.electron.notify(title, body)
    } else if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, { body })
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((perm) => {
          if (perm === 'granted') new Notification(title, { body })
        })
      }
    }
  }

  return {
    isDesktop,
    notify,
    platform: typeof window !== 'undefined' ? window.electron?.platform : undefined,
  }
}
