import { useEffect, useRef, useState, useCallback } from 'react'
import { useSocket } from './use-socket'

const TYPING_TIMEOUT_MS = 3000

export function useTypingIndicator(params: {
  companyId: string
  context: string
  userId: string
  name: string
}) {
  const { companyId, context, userId, name } = params
  const { socket, connected } = useSocket()
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map())
  const typingTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const isSendingRef = useRef(false)
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const startTyping = useCallback(() => {
    if (!connected || isSendingRef.current) return
    isSendingRef.current = true
    socket.emit('typing:start', { companyId, context, userId, name })

    if (stopTimerRef.current) clearTimeout(stopTimerRef.current)
    stopTimerRef.current = setTimeout(() => {
      isSendingRef.current = false
      socket.emit('typing:stop', { companyId, context, userId })
    }, TYPING_TIMEOUT_MS)
  }, [connected, socket, companyId, context, userId, name])

  const stopTyping = useCallback(() => {
    if (!connected || !isSendingRef.current) return
    isSendingRef.current = false
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current)
    socket.emit('typing:stop', { companyId, context, userId })
  }, [connected, socket, companyId, context, userId])

  useEffect(() => {
    const onStart = (data: { context: string; userId: string; name: string }) => {
      if (data.context !== context || data.userId === userId) return

      setTypingUsers((prev) => {
        const next = new Map(prev)
        next.set(data.userId, data.name)
        return next
      })

      const existing = typingTimers.current.get(data.userId)
      if (existing) clearTimeout(existing)

      const timer = setTimeout(() => {
        setTypingUsers((prev) => {
          const next = new Map(prev)
          next.delete(data.userId)
          return next
        })
        typingTimers.current.delete(data.userId)
      }, TYPING_TIMEOUT_MS + 500)

      typingTimers.current.set(data.userId, timer)
    }

    const onStop = (data: { context: string; userId: string }) => {
      if (data.context !== context) return
      setTypingUsers((prev) => {
        const next = new Map(prev)
        next.delete(data.userId)
        return next
      })
      const timer = typingTimers.current.get(data.userId)
      if (timer) {
        clearTimeout(timer)
        typingTimers.current.delete(data.userId)
      }
    }

    socket.on('typing:start', onStart)
    socket.on('typing:stop', onStop)

    return () => {
      socket.off('typing:start', onStart)
      socket.off('typing:stop', onStop)
      typingTimers.current.forEach((t) => clearTimeout(t))
    }
  }, [socket, context, userId])

  const typingList = Array.from(typingUsers.values())

  return { typingList, startTyping, stopTyping }
}
