import { Controller, Get } from '@nestjs/common';
import { WebsocketsService } from './websockets.service';
import { EventsGateway } from './events/events.gateway';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class WebsocketsController {
  constructor(
    private readonly websocketsService: WebsocketsService,
    private readonly eventGateway: EventsGateway,
  ) {}

  @EventPattern('websocket_custom_event')
  handleCustomEvent(
    @Payload() data: { userId: string; event: string; payload: any },
  ) {
    this.eventGateway.handleCustomEvent(data.userId, data.event, data.payload);
  }
}
