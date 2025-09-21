import { Test, TestingModule } from '@nestjs/testing';
import { WebsocketsController } from './websockets.controller';
import { WebsocketsService } from './websockets.service';

describe('WebsocketsController', () => {
  let websocketsController: WebsocketsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [WebsocketsController],
      providers: [WebsocketsService],
    }).compile();

    websocketsController = app.get<WebsocketsController>(WebsocketsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(websocketsController.getHello()).toBe('Hello World!');
    });
  });
});
