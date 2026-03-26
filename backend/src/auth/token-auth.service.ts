import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthenticatedUserService } from './authenticated-user.service';

type JwtPayload = {
  sub?: unknown;
};

@Injectable()
export class TokenAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authenticatedUserService: AuthenticatedUserService,
  ) {}

  async authenticateAccessToken(token: string) {
    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid authentication token');
    }

    if (typeof payload.sub !== 'string' || payload.sub.length === 0) {
      throw new UnauthorizedException('Invalid authentication token');
    }

    return this.authenticatedUserService.requireActiveUser(payload.sub);
  }
}
