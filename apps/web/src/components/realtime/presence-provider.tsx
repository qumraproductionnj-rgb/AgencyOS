'use client'

import { createContext, useContext, useMemo } from 'react'
import { usePresence, type OnlineUser } from '@/hooks/use-presence'

interface PresenceContextValue {
  onlineList: OnlineUser[]
  connected: boolean
}

const PresenceContext = createContext<PresenceContextValue>({
  onlineList: [],
  connected: false,
})

export function usePresenceContext() {
  return useContext(PresenceContext)
}

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const { onlineList, connected } = usePresence({
    userId: 'demo-user',
    companyId: 'co1',
    name: 'المستخدم',
  })

  const value = useMemo(() => ({ onlineList, connected }), [onlineList, connected])

  return <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>
}
