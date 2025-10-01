import { AuthGatewayGuard } from '@app/common/auth-gateway/auth-gateway.guard';
import { CurrentUserDecorator } from '@app/common/decorators/current-user.decorator';
import { User } from '@clerk/backend';
import { Logger, UseGuards } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@UseGuards(AuthGatewayGuard)
@WebSocketGateway({
  cors: { origin: '*' },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger: Logger = new Logger(EventsGateway.name);
  @WebSocketServer()
  server: Server;
  private userSockets = new Map<string, string>(); // userId -> socketId
  handleConnection(
    client: Socket,
    @CurrentUserDecorator() user: User,
    ...args: any[]
  ) {
    const userId = user.publicMetadata.userId as string;
    this.userSockets.set(userId, client.id);
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any): string {
    return payload;
  }
  // for vendor_performance, cash_flow, compliance
  handleCustomEvent(userId: string, event: string, payload: any) {
    this.logger.log('handling custom event: ' + event);
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, payload);
    }
  }
}
