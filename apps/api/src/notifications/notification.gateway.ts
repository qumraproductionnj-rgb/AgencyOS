import { Injectable, Logger } from '@nestjs/common'
import { WebSocketGateway as WSGateway, WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

@Injectable()
@WSGateway({
  cors: {
    origin: process.env['CORS_ORIGINS']?.split(',') ?? ['http://localhost:3000'],
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationGateway {
  @WebSocketServer()
  server!: Server

  private readonly logger = new Logger(NotificationGateway.name)

  afterInit() {
    this.logger.log('Notification WebSocket gateway initialized')
  }

  handleConnection(client: Socket) {
    const userId = client.handshake.query['userId'] as string | undefined
    if (userId) {
      client.join(`user:${userId}`)
      this.logger.debug(`Client connected: ${client.id} (user: ${userId})`)
    } else {
      this.logger.debug(`Client connected (anonymous): ${client.id}`)
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}`)
  }

  sendToUser(userId: string, event: string, data: unknown) {
    this.server.to(`user:${userId}`).emit(event, data)
  }

  sendToCompany(companyId: string, event: string, data: unknown) {
    this.server.to(`company:${companyId}`).emit(event, data)
  }
}
