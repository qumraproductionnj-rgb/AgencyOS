import { useEffect, useRef, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { useSocket } from './use-socket'

export interface OnlineUser {
  socketId: string
  userId: string
  name: string
  page: string
  status: 'online' | 'away' | 'offline'
}

interface PresenceUpdate extends OnlineUser {
  ts: number
}

const PRESENCE_INTERVAL_MS = 30_000
const AWAY_TIMEOUT_MS = 60_000

export function usePresence(params: { userId: string; companyId: string; name: string }) {
  const { userId, companyId, name } = params
  const { socket, connected } = useSocket()
  const pathname = usePathname()
  const [onlineUsers, setOnlineUsers] = useState<Map<string, OnlineUser>>(new Map())
  const lastActivityRef = useRef(Date.now())
  const statusRef = useRef<'online' | 'away'>('online')

  const sendPresence = useCallback(
    (status: 'online' | 'away' | 'offline') => {
      if (!connected) return
      socket.emit('presence:update', {
        userId,
        companyId,
        page: pathname,
        status,
        name,
      })
    },
    [connected, socket, userId, companyId, pathname, name],
  )

  // Track user activity for away detection
  useEffect(() => {
    const handleActivity = () => {
      lastActivityRef.current = Date.now()
      if (statusRef.current === 'away') {
        statusRef.current = 'online'
        sendPresence('online')
      }
    }
    window.addEventListener('mousemove', handleActivity)
    window.addEventListener('keydown', handleActivity)
    return () => {
      window.removeEventListener('mousemove', handleActivity)
      window.removeEventListener('keydown', handleActivity)
    }
  }, [sendPresence])

  // Periodic presence heartbeat
  useEffect(() => {
    if (!connected) return
    sendPresence('online')

    const interval = setInterval(() => {
      const idle = Date.now() - lastActivityRef.current
      const newStatus = idle > AWAY_TIMEOUT_MS ? 'away' : 'online'
      if (newStatus !== statusRef.current) statusRef.current = newStatus
      sendPresence(newStatus)
    }, PRESENCE_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [connected, sendPresence])

  // Send offline on page unload
  useEffect(() => {
    const handleUnload = () => sendPresence('offline')
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [sendPresence])

  // Resend presence when page changes
  useEffect(() => {
    if (connected) sendPresence('online')
  }, [pathname, connected, sendPresence])

  // Listen for presence updates and snapshots
  useEffect(() => {
    const onUpdate = (data: PresenceUpdate) => {
      setOnlineUsers((prev) => {
        const next = new Map(prev)
        if (data.status === 'offline') {
          next.delete(data.socketId)
        } else {
          next.set(data.socketId, {
            socketId: data.socketId,
            userId: data.userId,
            name: data.name,
            page: data.page,
            status: data.status,
          })
        }
        return next
      })
    }

    const onOffline = (data: { socketId: string }) => {
      setOnlineUsers((prev) => {
        const next = new Map(prev)
        next.delete(data.socketId)
        return next
      })
    }

    const onSnapshot = (users: OnlineUser[]) => {
      const map = new Map<string, OnlineUser>()
      users.forEach((u) => map.set(u.socketId, u))
      setOnlineUsers(map)
    }

    socket.on('presence:update', onUpdate)
    socket.on('user:offline', onOffline)
    socket.on('presence:snapshot', onSnapshot)

    return () => {
      socket.off('presence:update', onUpdate)
      socket.off('user:offline', onOffline)
      socket.off('presence:snapshot', onSnapshot)
    }
  }, [socket])

  return {
    onlineUsers,
    onlineList: Array.from(onlineUsers.values()).filter((u) => u.userId !== userId),
    connected,
  }
}
