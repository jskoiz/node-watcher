import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import type { LoginDto } from './auth.service';
import type { AuthenticatedRequest } from '../common/auth-request.interface';

describe('AuthController', () => {
  let controller: AuthController;

  const authServiceMock = {
    login: jest.fn(),
    signup: jest.fn(),
    getCurrentUser: jest.fn(),
    deleteAccount: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates login to auth service', async () => {
    const dto: LoginDto = { email: 'test@example.com', password: 'pw' };
    authServiceMock.login.mockResolvedValue({ access_token: 'token' });

    await expect(controller.login(dto)).resolves.toEqual({
      access_token: 'token',
    });
    expect(authServiceMock.login).toHaveBeenCalledWith(dto);
  });

  it('delegates authenticated account deletion to auth service', async () => {
    authServiceMock.deleteAccount.mockResolvedValue(undefined);
    const req = { user: { id: 'user-1' } } as AuthenticatedRequest;

    await expect(controller.deleteAccount(req)).resolves.toBeUndefined();
    expect(authServiceMock.deleteAccount).toHaveBeenCalledWith('user-1');
  });
});
