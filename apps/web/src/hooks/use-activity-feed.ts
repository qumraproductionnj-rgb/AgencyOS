import { useEffect, useRef, useState, useCallback } from 'react'
import { useSocket } from './use-socket'

export interface ActivityItem {
  id: string
  type: string
  payload: Record<string, unknown>
  companyId: string
  ts: number
}

const MAX_ITEMS = 50

export function useActivityFeed(companyId: string) {
  const { socket, connected } = useSocket()
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [hasNew, setHasNew] = useState(false)
  const counterRef = useRef(0)

  const clearNew = useCallback(() => setHasNew(false), [])

  useEffect(() => {
    const onActivity = (data: Omit<ActivityItem, 'id'>) => {
      if (data.companyId !== companyId) return
      const item: ActivityItem = { ...data, id: `act-${++counterRef.current}` }
      setActivities((prev) => [item, ...prev].slice(0, MAX_ITEMS))
      setHasNew(true)
    }

    socket.on('activity:new', onActivity)
    return () => {
      socket.off('activity:new', onActivity)
    }
  }, [socket, companyId])

  const broadcast = useCallback(
    (type: string, payload: Record<string, unknown>) => {
      if (!connected) return
      socket.emit('activity:broadcast', { type, payload, companyId })
    },
    [socket, connected, companyId],
  )

  return { activities, hasNew, clearNew, broadcast, connected }
}
