jest.mock('../config/app.config', () => ({
  appConfig: {
    jwt: { secret: 'test-secret' },
  },
}));

import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { AuthenticatedUserService } from './authenticated-user.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let authenticatedUserService: { requireActiveUser: jest.Mock };

  const payload = { sub: 'user-1', email: 'alice@example.com' };

  beforeEach(() => {
    authenticatedUserService = { requireActiveUser: jest.fn() };
    strategy = new JwtStrategy(
      authenticatedUserService as unknown as AuthenticatedUserService,
    );
  });

  it('returns the user when active and not banned/deleted', async () => {
    const dbUser = { id: 'user-1', email: 'alice@example.com' };
    authenticatedUserService.requireActiveUser.mockResolvedValue(dbUser);

    const result = await strategy.validate(payload);

    expect(result).toEqual(dbUser);
    expect(authenticatedUserService.requireActiveUser).toHaveBeenCalledWith(
      'user-1',
    );
  });

  it.each([
    'deleted',
    'banned',
    'non-existent',
  ])('rejects a %s user with UnauthorizedException', async (scenario) => {
    void scenario;
    authenticatedUserService.requireActiveUser.mockRejectedValue(
      new UnauthorizedException('User no longer valid'),
    );

    await expect(strategy.validate(payload)).rejects.toThrow(
      new UnauthorizedException('User no longer valid'),
    );
  });
});
