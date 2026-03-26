import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { AuthProvider, Gender, Prisma } from '@prisma/client';
import { appConfig } from '../config/app.config';
import { calculateAge } from '../common/age.util';
import type { SignupDto, LoginDto } from './auth.dto';
import type {
  AuthenticatedUser,
  AuthResult,
  CurrentUserResult,
  EmailAuthUser,
} from './auth.types';
import {
  buildEmailLookup,
  normalizeEmail,
  normalizeGender,
  parseBirthdate,
  redactEmail,
} from './auth.normalization';
import { issueAuthToken } from './auth.token-factory';

export type { SignupDto, LoginDto };
export type { AuthResult } from './auth.types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private async findEmailAuthUser(
    email: string,
  ): Promise<EmailAuthUser | null> {
    return this.prisma.user.findFirst({
      where: {
        ...buildEmailLookup(email),
        isDeleted: false,
        isBanned: false,
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        isOnboarded: true,
        passwordHash: true,
      },
    });
  }

  async signup(data: SignupDto): Promise<AuthResult> {
    const normalizedEmail = normalizeEmail(data.email);
    const { password, firstName, birthdate, gender } = data;

    if (!normalizedEmail) {
      throw new BadRequestException('Email is required');
    }

    if (!password || !password.trim()) {
      throw new BadRequestException('Password is required');
    }

    const parsedBirthdate = parseBirthdate(birthdate);
    const normalizedGender = normalizeGender(gender);

    const existing = await this.prisma.user.findFirst({
      where: { ...buildEmailLookup(normalizedEmail), isDeleted: false },
    });
    if (existing) {
      this.logger.warn(
        `Signup conflict for email=${redactEmail(normalizedEmail)}`,
      );
      throw new BadRequestException('Unable to create account');
    }

    const hashedPassword = await bcrypt.hash(password, appConfig.auth.bcryptRounds);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash: hashedPassword,
          firstName,
          birthdate: parsedBirthdate,
          gender: normalizedGender,
          authProvider: AuthProvider.EMAIL,
        },
      });

      return issueAuthToken(this.jwtService, user);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.warn(
          `Signup unique-constraint conflict for email=${redactEmail(normalizedEmail)}`,
        );
        throw new BadRequestException('Unable to create account');
      }
      throw error;
    }
  }

  async login(user: LoginDto): Promise<AuthResult> {
    let userEmail = normalizeEmail(user.email);
    const password = user.password ?? '';

    const hasCredentials = Boolean(userEmail && password);

    if (!hasCredentials) {
      this.logger.warn('Login rejected due to incomplete credentials');
      throw new UnauthorizedException('Invalid credentials');
    }

    const foundUser = await this.findEmailAuthUser(userEmail);
    if (!foundUser || !foundUser.passwordHash) {
      this.logger.warn(`Login rejected for email=${redactEmail(userEmail)}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, foundUser.passwordHash);
    if (!isMatch) {
      this.logger.warn(`Login rejected for email=${redactEmail(userEmail)}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    userEmail = foundUser.email ?? '';
    return issueAuthToken(this.jwtService, foundUser);
  }

  async registerPushToken(userId: string, token: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { pushToken: token },
    });
  }

  async deregisterPushToken(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { pushToken: null },
    });
  }

  async getCurrentUser(userId: string): Promise<CurrentUserResult> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, isDeleted: false, isBanned: false },
      select: {
        id: true,
        email: true,
        firstName: true,
        birthdate: true,
        gender: true,
        pronouns: true,
        isOnboarded: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
        fitnessProfile: true,
        photos: {
          where: { isHidden: false },
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            storageKey: true,
            isPrimary: true,
            sortOrder: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      this.logger.warn(`Current user lookup failed for userId=${userId}`);
      throw new UnauthorizedException('User not found');
    }

    return {
      ...user,
      age: calculateAge(user.birthdate),
    };
  }

  async deleteAccount(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!user) {
      this.logger.warn(`Delete account lookup failed for userId=${userId}`);
      throw new UnauthorizedException('User not found');
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: {
            isDeleted: true,
            email: `deleted-${userId}@deleted.invalid`,
            passwordHash: null,
            phoneNumber: null,
            providerId: null,
            firstName: 'Deleted',
            pronouns: null,
          },
        });

        // Archive all matches involving the deleted user
        await tx.match.updateMany({
          where: {
            OR: [{ userAId: userId }, { userBId: userId }],
          },
          data: { isArchived: true },
        });
      });
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: string }).code === 'P2025'
      ) {
        throw new UnauthorizedException('User not found');
      }
      throw error;
    }

    this.logger.log(
      `Soft-deleted account for userId=${user.id}${
        user.email ? ` email=${redactEmail(user.email)}` : ''
      }`,
    );
  }
}
