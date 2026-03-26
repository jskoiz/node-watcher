/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { JwtService } from '@nestjs/jwt';
import { ChatGateway } from './chat.gateway';
import { MatchesService } from './matches.service';
import { appConfig } from '../config/app.config';
import { TokenAuthService } from '../auth/token-auth.service';

function createMockSocket(overrides: Record<string, unknown> = {}) {
  return {
    id: 'socket-1',
    handshake: {
      auth: {},
      query: {},
      headers: {},
    },
    data: {},
    emit: jest.fn(),
    join: jest.fn().mockResolvedValue(undefined),
    leave: jest.fn().mockResolvedValue(undefined),
    to: jest.fn().mockReturnThis(),
    disconnect: jest.fn(),
    ...overrides,
  } as any;
}

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let matchesService: jest.Mocked<MatchesService>;
  let jwtService: JwtService;
  let tokenAuthService: { authenticateAccessToken: jest.Mock };
  let mockServer: any;
  let validToken: string;

  const createToken = (
    payload: Record<string, unknown>,
    expiresIn: '1h' | '0s' = '1h',
  ) =>
    jwtService.sign(payload, { expiresIn });

  beforeEach(() => {
    matchesService = {
      getMessages: jest.fn().mockResolvedValue([]),
      sendMessage: jest.fn(),
    } as any;
    jwtService = new JwtService({ secret: appConfig.jwt.secret });
    validToken = createToken({ sub: 'user-1' });

    tokenAuthService = {
      authenticateAccessToken: jest.fn().mockResolvedValue({
        id: 'user-1',
        email: 'alice@example.com',
      }),
    };

    mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };

    gateway = new ChatGateway(
      matchesService,
      tokenAuthService as unknown as TokenAuthService,
    );
    gateway.server = mockServer;
  });

  describe('handleConnection', () => {
    it('authenticates a client with a valid token in auth', async () => {
      const socket = createMockSocket({
        handshake: { auth: { token: validToken }, query: {}, headers: {} },
      });

      await gateway.handleConnection(socket);

      expect(socket.data).toEqual({ userId: 'user-1', joinedMatchIds: [] });
      expect(tokenAuthService.authenticateAccessToken).toHaveBeenCalledWith(
        validToken,
      );
      expect(socket.disconnect).not.toHaveBeenCalled();
    });

    it('authenticates a client with a token in query param', async () => {
      const socket = createMockSocket({
        handshake: { auth: {}, query: { token: validToken }, headers: {} },
      });

      await gateway.handleConnection(socket);

      expect(socket.data).toEqual({ userId: 'user-1', joinedMatchIds: [] });
      expect(socket.disconnect).not.toHaveBeenCalled();
    });

    it('authenticates a client with a Bearer token in headers', async () => {
      const socket = createMockSocket({
        handshake: {
          auth: {},
          query: {},
          headers: { authorization: `Bearer ${validToken}` },
        },
      });

      await gateway.handleConnection(socket);

      expect(socket.data).toEqual({ userId: 'user-1', joinedMatchIds: [] });
      expect(socket.disconnect).not.toHaveBeenCalled();
    });

    it('rejects a client with no token', async () => {
      const socket = createMockSocket();

      await gateway.handleConnection(socket);

      expect(socket.emit).toHaveBeenCalledWith('error', {
        message: 'Authentication failed',
      });
      expect(socket.disconnect).toHaveBeenCalledWith(true);
    });

    it('rejects a client with an invalid token', async () => {
      tokenAuthService.authenticateAccessToken.mockRejectedValueOnce(
        new Error('Invalid authentication token'),
      );
      const socket = createMockSocket({
        handshake: { auth: { token: 'invalid-token' }, query: {}, headers: {} },
      });

      await gateway.handleConnection(socket);

      expect(socket.emit).toHaveBeenCalledWith('error', {
        message: 'Authentication failed',
      });
      expect(socket.disconnect).toHaveBeenCalledWith(true);
    });

    it('rejects a client with an expired token', async () => {
      tokenAuthService.authenticateAccessToken.mockRejectedValueOnce(
        new Error('Invalid authentication token'),
      );
      const expiredToken = createToken({ sub: 'user-1' }, '0s');

      const socket = createMockSocket({
        handshake: { auth: { token: expiredToken }, query: {}, headers: {} },
      });

      // Small delay so the token is actually expired
      await new Promise((r) => setTimeout(r, 10));
      await gateway.handleConnection(socket);

      expect(socket.disconnect).toHaveBeenCalledWith(true);
    });

    it('rejects a client when the token does not include a subject', async () => {
      tokenAuthService.authenticateAccessToken.mockRejectedValueOnce(
        new Error('Invalid authentication token'),
      );
      const socket = createMockSocket({
        handshake: { auth: { token: createToken({ role: 'user' }) }, query: {}, headers: {} },
      });

      await gateway.handleConnection(socket);

      expect(socket.emit).toHaveBeenCalledWith('error', {
        message: 'Authentication failed',
      });
      expect(socket.disconnect).toHaveBeenCalledWith(true);
    });

    it('rejects a client whose account is no longer active', async () => {
      tokenAuthService.authenticateAccessToken.mockRejectedValueOnce(
        new Error('User no longer valid'),
      );
      const socket = createMockSocket({
        handshake: { auth: { token: validToken }, query: {}, headers: {} },
      });

      await gateway.handleConnection(socket);

      expect(socket.emit).toHaveBeenCalledWith('error', {
        message: 'Authentication failed',
      });
      expect(socket.disconnect).toHaveBeenCalledWith(true);
    });
  });

  describe('handleJoinMatch', () => {
    it('joins the room when user has match access', async () => {
      const socket = createMockSocket();
      socket.handshake.auth.token = validToken;
      socket.data = { userId: 'user-1', joinedMatchIds: [] };

      await gateway.handleJoinMatch(socket, { matchId: 'match-1' });

      expect(matchesService.getMessages).toHaveBeenCalledWith('match-1', 'user-1', 1);
      expect(socket.join).toHaveBeenCalledWith('match:match-1');
      expect(socket.emit).toHaveBeenCalledWith('joined:match', { matchId: 'match-1' });
      expect(socket.data.joinedMatchIds).toEqual(['match-1']);
    });

    it('rejects join when the match id is blank', async () => {
      const socket = createMockSocket();
      socket.handshake.auth.token = validToken;
      socket.data = { userId: 'user-1' };

      await gateway.handleJoinMatch(socket, { matchId: '   ' });

      expect(matchesService.getMessages).not.toHaveBeenCalled();
      expect(socket.join).not.toHaveBeenCalled();
      expect(socket.emit).toHaveBeenCalledWith('error', {
        message: 'Cannot join this match room',
      });
    });

    it('rejects join when user does not have match access', async () => {
      const socket = createMockSocket();
      socket.handshake.auth.token = validToken;
      socket.data = { userId: 'user-1', joinedMatchIds: [] };
      matchesService.getMessages.mockRejectedValueOnce(new Error('Access denied'));

      await gateway.handleJoinMatch(socket, { matchId: 'match-1' });

      expect(socket.join).not.toHaveBeenCalled();
      expect(socket.emit).toHaveBeenCalledWith('error', {
        message: 'Cannot join this match room',
      });
    });

    it('rejects join when the account is no longer active', async () => {
      tokenAuthService.authenticateAccessToken.mockRejectedValueOnce(
        new Error('User no longer valid'),
      );

      const socket = createMockSocket();
      socket.handshake.auth.token = validToken;
      socket.data = { userId: 'user-1', joinedMatchIds: [] };

      await gateway.handleJoinMatch(socket, { matchId: 'match-1' });

      expect(matchesService.getMessages).not.toHaveBeenCalled();
      expect(socket.emit).toHaveBeenCalledWith('error', {
        message: 'Authentication failed',
      });
      expect(socket.disconnect).toHaveBeenCalledWith(true);
    });

    it('rejects join when client is not authenticated', async () => {
      const socket = createMockSocket();
      socket.data = {};

      await gateway.handleJoinMatch(socket, { matchId: 'match-1' });

      expect(socket.emit).toHaveBeenCalledWith('error', {
        message: 'Not authenticated',
      });
    });
  });

  describe('handleLeaveMatch', () => {
    it('leaves the room', async () => {
      const socket = createMockSocket();
      socket.handshake.auth.token = validToken;
      socket.data = { userId: 'user-1', joinedMatchIds: ['match-1'] };

      await gateway.handleLeaveMatch(socket, { matchId: 'match-1' });

      expect(socket.leave).toHaveBeenCalledWith('match:match-1');
      expect(socket.emit).toHaveBeenCalledWith('left:match', { matchId: 'match-1' });
      expect(socket.data.joinedMatchIds).toEqual([]);
    });

    it('rejects leave when the account is no longer active', async () => {
      tokenAuthService.authenticateAccessToken.mockRejectedValueOnce(
        new Error('User no longer valid'),
      );

      const socket = createMockSocket();
      socket.handshake.auth.token = validToken;
      socket.data = { userId: 'user-1', joinedMatchIds: ['match-1'] };

      await gateway.handleLeaveMatch(socket, { matchId: 'match-1' });

      expect(socket.leave).not.toHaveBeenCalled();
      expect(socket.emit).toHaveBeenCalledWith('error', {
        message: 'Authentication failed',
      });
      expect(socket.disconnect).toHaveBeenCalledWith(true);
    });
  });

  describe('handleSendMessage', () => {
    it('persists the message without broadcasting directly from the gateway', async () => {
      const socket = createMockSocket();
      socket.handshake.auth.token = validToken;
      socket.data = { userId: 'user-1', joinedMatchIds: ['match-1'] };
      const savedMessage = {
        id: 'msg-1',
        text: 'hello',
        sender: 'me' as const,
        timestamp: new Date(),
      };
      matchesService.sendMessage.mockResolvedValue(savedMessage);

      await gateway.handleSendMessage(socket, {
        matchId: 'match-1',
        content: 'hello',
      });

      expect(matchesService.sendMessage).toHaveBeenCalledWith(
        'match-1',
        'user-1',
        'hello',
      );
      expect(mockServer.to).not.toHaveBeenCalled();
      expect(mockServer.emit).not.toHaveBeenCalled();
    });

    it('rejects blank message content before calling the service', async () => {
      const socket = createMockSocket();
      socket.handshake.auth.token = validToken;
      socket.data = { userId: 'user-1', joinedMatchIds: ['match-1'] };

      await gateway.handleSendMessage(socket, {
        matchId: 'match-1',
        content: '   ',
      });

      expect(matchesService.sendMessage).not.toHaveBeenCalled();
      expect(socket.emit).toHaveBeenCalledWith('error', {
        message: 'Message content is required',
      });
    });

    it('rejects a blank match id before calling the service', async () => {
      const socket = createMockSocket();
      socket.handshake.auth.token = validToken;
      socket.data = { userId: 'user-1', joinedMatchIds: ['match-1'] };

      await gateway.handleSendMessage(socket, {
        matchId: '   ',
        content: 'hello',
      });

      expect(matchesService.sendMessage).not.toHaveBeenCalled();
      expect(socket.emit).toHaveBeenCalledWith('error', {
        message: 'Cannot send this message',
      });
    });

    it('emits error when sendMessage fails', async () => {
      const socket = createMockSocket();
      socket.handshake.auth.token = validToken;
      socket.data = { userId: 'user-1', joinedMatchIds: ['match-1'] };
      matchesService.sendMessage.mockRejectedValueOnce(new Error('Access denied'));

      await gateway.handleSendMessage(socket, {
        matchId: 'match-1',
        content: 'hello',
      });

      expect(socket.emit).toHaveBeenCalledWith('error', {
        message: 'Access denied',
      });
    });

    it('rejects send when the account is no longer active', async () => {
      tokenAuthService.authenticateAccessToken.mockRejectedValueOnce(
        new Error('User no longer valid'),
      );

      const socket = createMockSocket();
      socket.handshake.auth.token = validToken;
      socket.data = { userId: 'user-1', joinedMatchIds: ['match-1'] };

      await gateway.handleSendMessage(socket, {
        matchId: 'match-1',
        content: 'hello',
      });

      expect(matchesService.sendMessage).not.toHaveBeenCalled();
      expect(socket.emit).toHaveBeenCalledWith('error', {
        message: 'Authentication failed',
      });
      expect(socket.disconnect).toHaveBeenCalledWith(true);
    });

    it('rejects send when client is not authenticated', async () => {
      const socket = createMockSocket();
      socket.data = {};

      await gateway.handleSendMessage(socket, {
        matchId: 'match-1',
        content: 'hello',
      });

      expect(socket.emit).toHaveBeenCalledWith('error', {
        message: 'Not authenticated',
      });
      expect(matchesService.sendMessage).not.toHaveBeenCalled();
    });
  });

  describe('typing indicators', () => {
    it('broadcasts typing events only after the client has joined the room', async () => {
      const socket = createMockSocket();
      socket.handshake.auth.token = validToken;
      socket.data = { userId: 'user-1', joinedMatchIds: ['match-1'] };

      await gateway.handleTypingStart(socket, { matchId: 'match-1' });

      expect(socket.to).toHaveBeenCalledWith('match:match-1');
      expect(socket.emit).not.toHaveBeenCalledWith('error', expect.anything());
    });

    it('rejects typing events for matches the client has not joined', async () => {
      const socket = createMockSocket();
      socket.handshake.auth.token = validToken;
      socket.data = { userId: 'user-1', joinedMatchIds: [] };

      await gateway.handleTypingStop(socket, { matchId: 'match-1' });

      expect(socket.to).not.toHaveBeenCalled();
      expect(socket.emit).toHaveBeenCalledWith('error', {
        message: 'Cannot send typing state for this match',
      });
    });

    it('ignores blank match ids for typing events', async () => {
      const socket = createMockSocket();
      socket.handshake.auth.token = validToken;
      socket.data = { userId: 'user-1', joinedMatchIds: ['match-1'] };

      await gateway.handleTypingStop(socket, { matchId: '   ' });

      expect(socket.to).not.toHaveBeenCalled();
      expect(socket.emit).not.toHaveBeenCalled();
    });
  });

  describe('emitMessageToRoom', () => {
    it('broadcasts message to the match room', () => {
      const message = {
        id: 'msg-1',
        text: 'hello',
        sender: 'me' as const,
        timestamp: new Date(),
      };

      gateway.emitMessageToRoom('match-1', message);

      expect(mockServer.to).toHaveBeenCalledWith('match:match-1');
      expect(mockServer.emit).toHaveBeenCalledWith('message:new', {
        matchId: 'match-1',
        message,
      });
    });
  });
});
