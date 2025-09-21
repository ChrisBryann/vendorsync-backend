import { AuthGatewayGuard } from './auth-gateway.guard';

describe('AuthGatewayGuard', () => {
  it('should be defined', () => {
    expect(new AuthGatewayGuard()).toBeDefined();
  });
});
