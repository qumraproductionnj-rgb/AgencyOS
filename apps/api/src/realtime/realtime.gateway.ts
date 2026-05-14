import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets'
import { Logger } from '@nestjs/common'
import type { Server, Socket } from 'socket.io'

interface PresenceData {
  userId: string
  companyId: string
  page: string
  status: 'online' | 'away' | 'offline'
  name?: string
}

interface ActivityData {
  type: string
  payload: Record<string, unknown>
  companyId: string
}

@WebSocketGateway({
  cors: {
    origin: process.env['CORS_ORIGINS']?.split(',') ?? ['http://localhost:3000'],
    credentials: true,
  },
  namespace: '/realtime',
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server

  private readonly logger = new Logger(RealtimeGateway.name)

  // clientId → presence data
  private presenceMap = new Map<string, PresenceData>()

  handleConnection(client: Socket): void {
    this.logger.debug(`Client connected: ${client.id}`)
    client.emit('connection:ack', { socketId: client.id, ts: Date.now() })
  }

  handleDisconnect(client: Socket): void {
    this.logger.debug(`Client disconnected: ${client.id}`)
    const presence = this.presenceMap.get(client.id)
    if (presence) {
      this.server
        .to(`company:${presence.companyId}`)
        .emit('user:offline', { userId: presence.userId, socketId: client.id })
      this.presenceMap.delete(client.id)
    }
  }

  @SubscribeMessage('presence:update')
  handlePresence(@ConnectedSocket() client: Socket, @MessageBody() data: PresenceData): void {
    const prev = this.presenceMap.get(client.id)

    // Join/leave company room
    if (!prev || prev.companyId !== data.companyId) {
      if (prev) void client.leave(`company:${prev.companyId}`)
      void client.join(`company:${data.companyId}`)
    }

    this.presenceMap.set(client.id, data)

    // Broadcast to everyone in the same company
    this.server.to(`company:${data.companyId}`).emit('presence:update', {
      socketId: client.id,
      userId: data.userId,
      page: data.page,
      status: data.status,
      name: data.name,
      ts: Date.now(),
    })

    // Emit online users snapshot back to the joining client
    const companyPresence = Array.from(this.presenceMap.entries())
      .filter(([, p]) => p.companyId === data.companyId)
      .map(([sid, p]) => ({ socketId: sid, ...p }))
    client.emit('presence:snapshot', companyPresence)
  }

  @SubscribeMessage('activity:broadcast')
  handleActivity(@ConnectedSocket() client: Socket, @MessageBody() data: ActivityData): void {
    // Broadcast to everyone in the company (including sender)
    this.server.to(`company:${data.companyId}`).emit('activity:new', {
      ...data,
      socketId: client.id,
      ts: Date.now(),
    })
  }

  @SubscribeMessage('typing:start')
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { companyId: string; context: string; userId: string; name: string },
  ): void {
    client.to(`company:${data.companyId}`).emit('typing:start', {
      context: data.context,
      userId: data.userId,
      name: data.name,
    })
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { companyId: string; context: string; userId: string },
  ): void {
    client.to(`company:${data.companyId}`).emit('typing:stop', {
      context: data.context,
      userId: data.userId,
    })
  }

  @SubscribeMessage('mention:notify')
  handleMention(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      companyId: string
      mentionedUserId: string
      mentionedBy: string
      context: string
      text: string
    },
  ): void {
    this.server.to(`company:${data.companyId}`).emit('mention:received', {
      ...data,
      socketId: client.id,
      ts: Date.now(),
    })
  }

  /** Called from other services to push activity to a company room */
  broadcastActivity(companyId: string, type: string, payload: Record<string, unknown>): void {
    this.server.to(`company:${companyId}`).emit('activity:new', {
      type,
      payload,
      companyId,
      ts: Date.now(),
    })
  }
}
