import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from './profile.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProfileService', () => {
  let service: ProfileService;

  const prismaMock = {
    userFitnessProfile: {
      upsert: jest.fn(),
    },
    userProfile: {
      upsert: jest.fn(),
    },
    user: {
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('marks user as onboarded when fitness profile is updated', async () => {
    const profile = { userId: 'user-1', intensityLevel: 'high' };
    prismaMock.$transaction.mockImplementation(async (fn: (tx: typeof prismaMock) => Promise<typeof profile>) => fn(prismaMock));
    prismaMock.userFitnessProfile.upsert.mockResolvedValue(profile);

    const result = await service.updateFitnessProfile('user-1', {
      intensityLevel: 'high',
    });

    expect(result).toEqual(profile);
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { isOnboarded: true },
    });
  });

  it('runs fitness upsert and isOnboarded update inside a transaction', async () => {
    const profile = { userId: 'user-1', intensityLevel: 'high' };
    prismaMock.$transaction.mockImplementation(async (fn: (tx: typeof prismaMock) => Promise<typeof profile>) => fn(prismaMock));
    prismaMock.userFitnessProfile.upsert.mockResolvedValue(profile);

    await service.updateFitnessProfile('user-1', { intensityLevel: 'high' });

    // Both DB writes must happen inside the same $transaction call
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(prismaMock.userFitnessProfile.upsert).toHaveBeenCalledTimes(1);
    expect(prismaMock.user.update).toHaveBeenCalledTimes(1);
  });

  it('strips userId from caller-supplied data in updateFitnessProfile', async () => {
    prismaMock.$transaction.mockImplementation(async (fn: (tx: typeof prismaMock) => Promise<unknown>) => fn(prismaMock));
    prismaMock.userFitnessProfile.upsert.mockResolvedValue({ userId: 'user-1' });

    await service.updateFitnessProfile('user-1', {
      userId: 'attacker-id',
      intensityLevel: 'low',
    });

    const call = prismaMock.userFitnessProfile.upsert.mock.calls[0][0];
    // The create clause must use the authoritative userId, not the one from the body
    expect(call.create.userId).toBe('user-1');
    // The update clause must not contain userId at all
    expect(call.update).not.toHaveProperty('userId');
  });

  it('strips userId from caller-supplied data in updateProfile', async () => {
    prismaMock.userProfile.upsert.mockResolvedValue({ userId: 'user-1' });

    await service.updateProfile('user-1', {
      userId: 'attacker-id',
      bio: 'hello',
    });

    const call = prismaMock.userProfile.upsert.mock.calls[0][0];
    expect(call.create.userId).toBe('user-1');
    expect(call.update).not.toHaveProperty('userId');
  });

  it('returns null age when birthdate is null', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      birthdate: null,
      fitnessProfile: null,
      profile: null,
      photos: [],
    });

    const result = await service.getProfile('user-1');
    expect(result).not.toBeNull();
    expect(result!.age).toBeNull();
  });

  it('calculates age correctly when birthdate is set', async () => {
    const birthdate = new Date('1990-01-01');
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      birthdate,
      fitnessProfile: null,
      profile: null,
      photos: [],
    });

    const result = await service.getProfile('user-1');
    expect(typeof result!.age).toBe('number');
    expect(result!.age).toBeGreaterThan(30);
  });

  it('strips passwordHash, providerId, and authProvider from getProfile result', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      birthdate: new Date('1995-06-15'),
      passwordHash: 'super-secret-hash',
      providerId: 'provider-xyz',
      authProvider: 'phone',
      fitnessProfile: null,
      profile: null,
      photos: [],
    });

    const result = await service.getProfile('user-1');
    expect(result).not.toBeNull();
    expect(result).not.toHaveProperty('passwordHash');
    expect(result).not.toHaveProperty('providerId');
    expect(result).not.toHaveProperty('authProvider');
    // Safe fields must still be present
    expect(result!.id).toBe('user-1');
  });
});
