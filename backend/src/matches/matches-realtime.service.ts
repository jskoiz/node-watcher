import {
  Inject,
  Injectable,
  Logger,
  Optional,
  forwardRef,
} from '@nestjs/common';
import { Observable, Subject, finalize } from 'rxjs';
import type { ChatGateway } from './chat.gateway';

export interface MatchMessagePayload {
  id: string;
  text: string;
  sender: 'me' | 'them';
  timestamp: Date;
}

export interface MatchMessageEvent {
  type: 'message';
  matchId: string;
  message: MatchMessagePayload;
}

function asLogMessage(event: string, context: Record<string, unknown>) {
  return JSON.stringify({ event, ...context });
}

@Injectable()
export class MatchesRealtimeService {
  private readonly logger = new Logger(MatchesRealtimeService.name);
  private readonly streams = new Map<string, Subject<MatchMessageEvent>>();
  private readonly refCounts = new Map<string, number>();
  private chatGateway: ChatGateway | null = null;

  /**
   * Inject the ChatGateway lazily to avoid circular dependency.
   * Both ChatGateway and MatchesService depend on each other indirectly
   * through this service, so we use forwardRef + optional injection.
   */
  @Optional()
  @Inject(forwardRef(() => 'ChatGateway'))
  set _chatGateway(gateway: ChatGateway | null) {
    this.chatGateway = gateway ?? null;
  }

  /** Number of active streams (exposed for testing). */
  get activeStreamCount(): number {
    return this.streams.size;
  }

  stream(matchId: string): Observable<MatchMessageEvent> {
    const stream = this.getOrCreateStream(matchId);
    this.incrementRef(matchId);
    this.logger.debug(
      `Opened SSE stream for match ${matchId} (active streams: ${this.streams.size}, subscribers: ${this.getRefCount(matchId)})`,
    );

    return stream.asObservable().pipe(
      finalize(() => this.decrementRef(matchId)),
    );
  }

  publishMessage(matchId: string, message: MatchMessagePayload) {
    const subscriberCount = this.getRefCount(matchId);
    const stream = this.getOrCreateStream(matchId);

    // Publish to SSE subscribers via RxJS Subject.
    stream.next({
      type: 'message',
      matchId,
      message,
    });

    // Also publish to WebSocket room via the gateway.
    const bridgedToWebsocket = Boolean(this.chatGateway);
    this.chatGateway?.emitMessageToRoom(matchId, message);

    this.logger.debug(
      asLogMessage('realtime.message.published', {
        matchId,
        messageId: message.id,
        subscriberCount,
        websocketEnabled: bridgedToWebsocket,
      }),
    );

    if (subscriberCount === 0) {
      this.logger.debug(
        `Discarded idle SSE stream for match ${matchId} after publish`,
      );
      this.removeStream(matchId);
    }
  }

  private getOrCreateStream(matchId: string): Subject<MatchMessageEvent> {
    const existing = this.streams.get(matchId);
    if (existing) return existing;

    const subject = new Subject<MatchMessageEvent>();
    this.streams.set(matchId, subject);
    this.logger.debug(
      asLogMessage('realtime.stream.created', {
        matchId,
        activeStreamCount: this.streams.size,
      }),
    );
    return subject;
  }

  private incrementRef(matchId: string): void {
    this.refCounts.set(matchId, (this.refCounts.get(matchId) ?? 0) + 1);
  }

  private decrementRef(matchId: string): void {
    const currentCount = this.refCounts.get(matchId);

    if (currentCount === undefined) {
      this.logger.warn(
        `Stream finalized without a matching subscriber count for match ${matchId}`,
      );
      this.removeStream(matchId);
      return;
    }

    const count = currentCount - 1;
    if (count <= 0) {
      this.logger.debug(`Closing SSE stream for match ${matchId}`);
      this.removeStream(matchId);
    } else {
      this.refCounts.set(matchId, count);
      this.logger.debug(
        `Detached SSE subscriber for match ${matchId} (subscribers: ${count})`,
      );
    }
  }

  private removeStream(matchId: string): void {
    const subject = this.streams.get(matchId);
    if (subject) {
      subject.complete();
      this.streams.delete(matchId);
      this.logger.debug(
        asLogMessage('realtime.stream.closed', {
          matchId,
          activeStreamCount: this.streams.size,
        }),
      );
    }
    this.refCounts.delete(matchId);
  }

  private getRefCount(matchId: string): number {
    return this.refCounts.get(matchId) ?? 0;
  }
}
