import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { appConfig } from '../config/app.config';
import { AuthenticatedUserService } from './authenticated-user.service';

interface JwtPayload {
  sub: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authenticatedUserService: AuthenticatedUserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request: { query?: Record<string, unknown> } | undefined) => {
          const token = request?.query?.token;
          return typeof token === 'string' && token.trim() ? token : null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: appConfig.jwt.secret,
    });
  }

  async validate(payload: JwtPayload) {
    return this.authenticatedUserService.requireActiveUser(payload.sub);
  }
}
