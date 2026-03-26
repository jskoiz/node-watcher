import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type AuthenticatedUserRecord = {
  id: string;
  email: string | null;
};

@Injectable()
export class AuthenticatedUserService {
  constructor(private readonly prisma: PrismaService) {}

  async requireActiveUser(userId: string): Promise<AuthenticatedUserRecord> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, isDeleted: false, isBanned: false },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new UnauthorizedException('User no longer valid');
    }

    return user;
  }
}
