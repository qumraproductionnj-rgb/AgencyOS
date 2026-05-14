import { useEffect, useState } from 'react'
import { getSocket, connectSocket } from '@/lib/socket'
import type { Socket } from 'socket.io-client'

export function useSocket(): { socket: Socket; connected: boolean } {
  const socket = getSocket()
  const [connected, setConnected] = useState(socket.connected)

  useEffect(() => {
    connectSocket()

    const onConnect = () => setConnected(true)
    const onDisconnect = () => setConnected(false)

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)

    setConnected(socket.connected)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
    }
  }, [socket])

  return { socket, connected }
}
