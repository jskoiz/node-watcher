import type { JwtService } from '@nestjs/jwt';
import type { AuthenticatedUser, AuthResult } from './auth.types';

export function issueAuthToken(
  jwtService: JwtService,
  user: AuthenticatedUser,
): AuthResult {
  const userEmail = user.email?.trim() ?? '';
  const payload = { sub: user.id };

  return {
    access_token: jwtService.sign(payload),
    user: {
      id: user.id,
      email: userEmail,
      firstName: user.firstName,
      isOnboarded: user.isOnboarded,
    },
  };
}
