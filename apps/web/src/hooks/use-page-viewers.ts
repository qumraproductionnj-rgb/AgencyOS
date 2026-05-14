import { useMemo } from 'react'
import { usePresence, type OnlineUser } from './use-presence'

export function usePageViewers(params: {
  userId: string
  companyId: string
  name: string
  page: string
}): OnlineUser[] {
  const { onlineList } = usePresence(params)

  return useMemo(() => onlineList.filter((u) => u.page === params.page), [onlineList, params.page])
}
