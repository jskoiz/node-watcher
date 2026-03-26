import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomInt } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { appConfig } from '../config/app.config';

/** Verification code lives for 10 minutes. */
const VERIFICATION_TTL_MS = 10 * 60 * 1000;
/** Minimum value (inclusive) for a 6-digit verification code. */
const CODE_MIN = 100_000;
/** Maximum value (exclusive) for a 6-digit verification code. */
const CODE_MAX = 1_000_000;
/** Maximum wrong-code attempts before a pending challenge is discarded. */
const MAX_CONFIRM_ATTEMPTS = 5;

interface PendingVerification {
  userId: string;
  channel: 'email' | 'phone';
  target: string;
  code: string;
  expiresAt: Date;
  attemptsRemaining: number;
  inFlight?: boolean;
}

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);
  // TODO: Replace in-memory Map with Redis or database for horizontal scaling
  private pending = new Map<string, PendingVerification>();

  constructor(private readonly prisma: PrismaService) {}

  async start(userId: string, channel: 'email' | 'phone', target: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        phoneNumber: true,
        hasVerifiedEmail: true,
        hasVerifiedPhone: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const normalizedTarget =
      channel === 'email' ? target.trim().toLowerCase() : target.trim();
    const storedTarget =
      channel === 'email'
        ? user.email?.trim().toLowerCase()
        : user.phoneNumber?.trim();

    if (!normalizedTarget || !storedTarget || storedTarget !== normalizedTarget) {
      throw new BadRequestException('Verification target does not match your account');
    }

    const alreadyVerified =
      channel === 'email' ? user.hasVerifiedEmail : user.hasVerifiedPhone;
    if (alreadyVerified) {
      throw new BadRequestException('Verification is already complete');
    }

    const code = randomInt(CODE_MIN, CODE_MAX).toString();
    const key = `${userId}:${channel}`;
    this.pending.set(key, {
      userId,
      channel,
      target: normalizedTarget,
      code,
      expiresAt: new Date(Date.now() + VERIFICATION_TTL_MS),
      attemptsRemaining: MAX_CONFIRM_ATTEMPTS,
    });

    // In production, dispatch via real SMS/email provider and never return the code.
    const isDev = !appConfig.isProduction;
    return {
      started: true,
      channel,
      maskedTarget: this.maskTarget(channel, normalizedTarget),
      ...(isDev ? { devCode: code } : {}),
    };
  }

  async confirm(userId: string, channel: 'email' | 'phone', code: string) {
    const key = `${userId}:${channel}`;
    const pending = this.pending.get(key);

    if (
      !pending ||
      pending.inFlight ||
      pending.expiresAt.getTime() < Date.now()
    ) {
      if (pending && pending.expiresAt.getTime() < Date.now()) {
        this.pending.delete(key);
      }
      return { verified: false };
    }

    if (pending.code !== code) {
      if (pending.attemptsRemaining <= 1) {
        this.pending.delete(key);
      } else {
        this.pending.set(key, {
          ...pending,
          attemptsRemaining: pending.attemptsRemaining - 1,
        });
      }
      return { verified: false };
    }

    const lockedPending: PendingVerification = {
      ...pending,
      inFlight: true,
    };

    // Lock this code during the confirmation attempt so concurrent requests
    // fail fast without consuming the pending code on retryable failures.
    this.pending.set(key, lockedPending);

    const restorePending = () => {
      if (this.pending.get(key) === lockedPending) {
        this.pending.set(key, pending);
      }
    };

    const consumePending = () => {
      if (this.pending.get(key) === lockedPending) {
        this.pending.delete(key);
      }
    };

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          phoneNumber: true,
        },
      });

      if (!user) {
        restorePending();
        throw new NotFoundException('User not found');
      }

      const storedTarget =
        channel === 'email'
          ? user.email?.trim().toLowerCase()
          : user.phoneNumber?.trim();
      const pendingTarget =
        channel === 'email'
          ? pending.target.trim().toLowerCase()
          : pending.target.trim();

      if (!storedTarget || storedTarget !== pendingTarget) {
        restorePending();
        return { verified: false };
      }

      if (this.pending.get(key) !== lockedPending) {
        return { verified: false };
      }

      if (channel === 'email') {
        await this.prisma.user.update({
          where: { id: userId },
          data: { hasVerifiedEmail: true },
        });
      } else {
        await this.prisma.user.update({
          where: { id: userId },
          data: { hasVerifiedPhone: true },
        });
      }

      consumePending();
      return { verified: true };
    } catch (error: unknown) {
      restorePending();
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code: string }).code === 'P2025'
      ) {
        throw new NotFoundException('User not found');
      }
      throw error;
    }
  }

  async status(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        hasVerifiedEmail: true,
        hasVerifiedPhone: true,
        email: true,
        phoneNumber: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private maskTarget(channel: 'email' | 'phone', target: string) {
    if (channel === 'email') {
      const [name, domain] = target.split('@');
      if (!domain) return '***';
      return `${name.slice(0, 1)}***@${domain}`;
    }

    return `***${target.slice(-2)}`;
  }
}
