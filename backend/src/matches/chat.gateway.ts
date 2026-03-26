import { Logger, UnauthorizedException } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { MatchesService } from './matches.service';
import { TokenAuthService } from '../auth/token-auth.service';

interface AuthenticatedSocket extends Socket {
  data: { userId?: string; joinedMatchIds?: string[] };
}

function extractToken(client: Socket): string | undefined {
  const authToken = (client.handshake.auth as { token?: unknown } | undefined)?.token;
  if (typeof authToken === 'string' && authToken.trim().length > 0) {
    return authToken.trim();
  }

  const queryToken = client.handshake.query?.token;
  if (typeof queryToken === 'string' && queryToken.trim().length > 0) {
    return queryToken.trim();
  }

  const authorization = client.handshake.headers?.authorization;
  if (typeof authorization === 'string' && authorization.startsWith('Bearer ')) {
    const token = authorization.slice('Bearer '.length).trim();
    if (token.length > 0) {
      return token;
    }
  }

  return undefined;
}


@WebSocketGateway({ namespace: '/chat', cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private readonly joinedMatchRooms = new WeakMap<Socket, Set<string>>();

  constructor(
    private readonly matchesService: MatchesService,
    private readonly tokenAuthService: TokenAuthService,
  ) {}

  private hasJoinedMatch(client: AuthenticatedSocket, matchId: string) {
    return client.data.joinedMatchIds?.includes(matchId) ?? false;
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const userId = await this.authenticateClient(client);
      client.data = { userId, joinedMatchIds: [] };
      this.logger.debug(`Client connected: ${client.id} (user: ${userId})`);
    } catch {
      this.logger.warn(`Connection rejected: ${client.id}`);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.joinedMatchRooms.delete(client);
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join:match')
  async handleJoinMatch(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { matchId: string },
  ) {
    const matchId = data.matchId?.trim();
    if (!matchId) {
      client.emit('error', { message: 'Cannot join this match room' });
      return;
    }

    const userId = await this.requireActiveUser(client);
    if (!userId) {
      return;
    }

    if (this.isMatchRoomJoined(client, matchId)) {
      this.logger.debug(`Ignored duplicate join for match room ${matchId} from user ${userId}`);
      return;
    }

    try {
      // Validates that the user is part of this match
      await this.matchesService.getMessages(matchId, userId, 1);
      await client.join(this.getMatchRoomName(matchId));
      client.data.joinedMatchIds = Array.from(
        new Set([...(client.data.joinedMatchIds ?? []), matchId]),
      );
      this.getJoinedMatchRooms(client).add(matchId);
      client.emit('joined:match', { matchId });
      this.logger.debug(`User ${userId} joined match room ${matchId}`);
    } catch {
      client.emit('error', { message: 'Cannot join this match room' });
    }
  }

  @SubscribeMessage('leave:match')
  async handleLeaveMatch(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { matchId: string },
  ) {
    const matchId = data.matchId?.trim();
    if (!matchId) {
      client.emit('error', { message: 'Cannot leave this match room' });
      return;
    }

    const userId = await this.requireActiveUser(client);
    if (!userId) {
      return;
    }

    await client.leave(this.getMatchRoomName(matchId));
    client.data.joinedMatchIds = (client.data.joinedMatchIds ?? []).filter(
      (joinedMatchId) => joinedMatchId !== matchId,
    );
    this.getJoinedMatchRooms(client).delete(matchId);
    client.emit('left:match', { matchId });
  }

  @SubscribeMessage('message:send')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { matchId: string; content: string },
  ) {
    const matchId = data.matchId?.trim();
    const content = data.content?.trim();

    if (!matchId) {
      client.emit('error', { message: 'Cannot send this message' });
      return;
    }

    if (!content) {
      client.emit('error', { message: 'Message content is required' });
      return;
    }

    const userId = await this.requireActiveUser(client);
    if (!userId) {
      return;
    }

    try {
      await this.matchesService.sendMessage(matchId, userId, content);
    } catch (error) {
      client.emit('error', {
        message:
          error instanceof Error ? error.message : 'Failed to send message',
      });
    }
  }

  @SubscribeMessage('typing:start')
  async handleTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { matchId: string },
  ) {
    const matchId = data.matchId?.trim();
    if (!matchId) return;

    const userId = await this.requireActiveUser(client);
    if (!userId) return;
    if (!this.hasJoinedMatch(client, matchId)) {
      client.emit('error', { message: 'Cannot send typing state for this match' });
      return;
    }

    client.to(this.getMatchRoomName(matchId)).emit('typing:start', {
      matchId,
      userId,
    });
  }

  @SubscribeMessage('typing:stop')
  async handleTypingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { matchId: string },
  ) {
    const matchId = data.matchId?.trim();
    if (!matchId) return;

    const userId = await this.requireActiveUser(client);
    if (!userId) return;
    if (!this.hasJoinedMatch(client, matchId)) {
      client.emit('error', { message: 'Cannot send typing state for this match' });
      return;
    }

    client.to(this.getMatchRoomName(matchId)).emit('typing:stop', {
      matchId,
      userId,
    });
  }

  /**
   * Emit a new message to all clients in a match room.
   * Called by MatchesRealtimeService to bridge SSE and WS transports.
   */
  emitMessageToRoom(
    matchId: string,
    message: { id: string; text: string; sender: 'me' | 'them'; timestamp: Date },
  ) {
    this.server?.to(this.getMatchRoomName(matchId)).emit('message:new', {
      matchId,
      message,
    });
  }

  private async authenticateClient(client: Socket): Promise<string> {
    const token = extractToken(client);
    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    const user = await this.tokenAuthService.authenticateAccessToken(token);
    return user.id;
  }

  private async requireActiveUser(client: AuthenticatedSocket): Promise<string | null> {
    const userId = client.data?.userId;
    if (!userId) {
      client.emit('error', { message: 'Not authenticated' });
      return null;
    }

    try {
      const user = await this.tokenAuthService.authenticateAccessToken(
        extractToken(client) ?? '',
      );
      client.data = {
        userId: user.id,
        joinedMatchIds: client.data.joinedMatchIds ?? [],
      };
      return user.id;
    } catch {
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect(true);
      return null;
    }
  }

  private getMatchRoomName(matchId: string) {
    return `match:${matchId}`;
  }

  private getJoinedMatchRooms(client: Socket) {
    let rooms = this.joinedMatchRooms.get(client);
    if (!rooms) {
      rooms = new Set<string>();
      this.joinedMatchRooms.set(client, rooms);
    }

    return rooms;
  }

  private isMatchRoomJoined(client: Socket, matchId: string) {
    return this.getJoinedMatchRooms(client).has(matchId) || client.rooms.has(this.getMatchRoomName(matchId));
  }
}
