import { Injectable, Logger } from '@nestjs/common';
import Expo, {
  ExpoPushMessage,
  ExpoPushTicket,
  ExpoPushReceiptId,
} from 'expo-server-sdk';
import { PrismaService } from '../prisma/prisma.service';

/** Outcome categories for structured logging. */
export type PushOutcome =
  | 'delivered'
  | 'token_invalid'
  | 'device_not_registered'
  | 'delivery_failed'
  | 'send_error';

export interface PushDeliveryResult {
  outcome: PushOutcome;
  pushToken: string;
  error?: string;
  attempt?: number;
}

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 500;

function asLogMessage(event: string, context: Record<string, unknown>) {
  return JSON.stringify({ event, ...context });
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function redactPushToken(pushToken: string) {
  if (pushToken.length <= 10) return pushToken;
  return `${pushToken.slice(0, 8)}...${pushToken.slice(-6)}`;
}

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private readonly expo: Expo;

  constructor(private readonly prisma: PrismaService) {
    this.expo = new Expo();
  }

  async sendPushNotification(
    pushToken: string,
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<PushDeliveryResult> {
    const tokenPreview = redactPushToken(pushToken);

    if (!Expo.isExpoPushToken(pushToken)) {
      this.logger.warn(
        asLogMessage('push.send.rejected_invalid_token', {
          outcome: 'token_invalid',
          pushToken: tokenPreview,
        }),
      );
      return { outcome: 'token_invalid', pushToken };
    }

    const message: ExpoPushMessage = {
      to: pushToken,
      sound: 'default',
      title,
      body,
      data: data ?? {},
    };

    return this.sendWithRetry(message, pushToken, tokenPreview);
  }

  private async sendWithRetry(
    message: ExpoPushMessage,
    pushToken: string,
    tokenPreview: string,
  ): Promise<PushDeliveryResult> {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const tickets = await this.expo.sendPushNotificationsAsync([message]);
        const result = await this.handleTickets(
          tickets,
          pushToken,
          attempt,
          tokenPreview,
        );
        if (result) return result;

        // Ticket had status 'ok'
        this.logger.debug(
          asLogMessage('push.send.completed', {
            outcome: 'delivered',
            pushToken: tokenPreview,
            attempt,
          }),
        );
        return { outcome: 'delivered', pushToken, attempt };
      } catch (error) {
        const errMsg = errorMessage(error);

        if (attempt < MAX_RETRIES) {
          const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
          this.logger.warn(
            asLogMessage('push.send.retrying', {
              outcome: 'retrying',
              pushToken: tokenPreview,
              attempt,
              maxRetries: MAX_RETRIES,
              delayMs: delay,
              error: errMsg,
            }),
          );
          await this.sleep(delay);
          continue;
        }

        this.logger.error(
          asLogMessage('push.send.failed', {
            outcome: 'send_error',
            pushToken: tokenPreview,
            attempt,
            maxRetries: MAX_RETRIES,
            error: errMsg,
          }),
          error instanceof Error ? error.stack : undefined,
        );
        return { outcome: 'send_error', pushToken, error: errMsg, attempt };
      }
    }

    // Unreachable, but satisfies the compiler
    return { outcome: 'send_error', pushToken };
  }

  /**
   * Handle ticket responses. Returns a PushDeliveryResult if the ticket
   * indicates a terminal error (device not registered, etc.), or null
   * if the ticket was successful and the caller should report 'delivered'.
   */
  private async handleTickets(
    tickets: ExpoPushTicket[],
    pushToken: string,
    attempt: number,
    tokenPreview: string,
  ): Promise<PushDeliveryResult | null> {
    const receiptIds: ExpoPushReceiptId[] = [];

    for (const ticket of tickets) {
      if (ticket.status === 'ok' && 'id' in ticket) {
        receiptIds.push(ticket.id);
      } else if (ticket.status === 'error') {
        this.logger.error(
          asLogMessage('push.ticket.failed', {
            pushToken: tokenPreview,
            attempt,
            message: ticket.message,
            expoError:
              'details' in ticket ? ticket.details?.error : undefined,
          }),
        );

        if (
          'details' in ticket &&
          ticket.details?.error === 'DeviceNotRegistered'
        ) {
          await this.clearPushToken(pushToken);
          return {
            outcome: 'device_not_registered',
            pushToken,
            error: ticket.message,
            attempt,
          };
        }

        return {
          outcome: 'delivery_failed',
          pushToken,
          error: ticket.message,
          attempt,
        };
      }
    }

    if (receiptIds.length > 0) {
      this.logger.debug(
        asLogMessage('push.receipts.received', {
          pushToken: tokenPreview,
          receiptIds,
        }),
      );
    }

    return null;
  }

  private async clearPushToken(pushToken: string): Promise<void> {
    const tokenPreview = redactPushToken(pushToken);

    this.logger.warn(
      asLogMessage('push.token.clearing', {
        outcome: 'device_not_registered',
        pushToken: tokenPreview,
      }),
    );

    try {
      await this.prisma.user.updateMany({
        where: { pushToken },
        data: { pushToken: null },
      });
    } catch (error) {
      this.logger.error(
        asLogMessage('push.token.clear_failed', {
          pushToken: tokenPreview,
          error: errorMessage(error),
        }),
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
