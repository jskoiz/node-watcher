import { ReportCategory } from '@prisma/client';
import { BlockService } from './block.service';
import { PrismaService } from '../prisma/prisma.service';

const matchFindMany = jest.fn();
const matchFindFirst = jest.fn();
const reportFindMany = jest.fn();
const reportFindFirst = jest.fn();

const prisma = {
  match: { findMany: matchFindMany, findFirst: matchFindFirst },
  report: { findMany: reportFindMany, findFirst: reportFindFirst },
} as unknown as PrismaService;

describe('BlockService', () => {
  let service: BlockService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new BlockService(prisma);
  });

  describe('getBlockedUserIds', () => {
    it('returns user IDs from both blocked matches and BLOCK reports', async () => {
      matchFindMany.mockResolvedValue([
        { userAId: 'blocked-1', userBId: 'me' },
        { userAId: 'me', userBId: 'blocked-2' },
      ]);
      reportFindMany.mockResolvedValue([
        { reporterId: 'me', reportedUserId: 'blocked-3' },
        { reporterId: 'blocked-4', reportedUserId: 'me' },
      ]);

      const result = await service.getBlockedUserIds('me');

      expect(result).toEqual(
        expect.arrayContaining(['blocked-1', 'blocked-2', 'blocked-3', 'blocked-4']),
      );
      expect(result).toHaveLength(4);
    });

    it('deduplicates user IDs that appear in both matches and reports', async () => {
      matchFindMany.mockResolvedValue([
        { userAId: 'blocked-1', userBId: 'me' },
      ]);
      reportFindMany.mockResolvedValue([
        { reporterId: 'me', reportedUserId: 'blocked-1' },
      ]);

      const result = await service.getBlockedUserIds('me');

      expect(result).toEqual(['blocked-1']);
    });

    it('returns empty array when no blocks exist', async () => {
      matchFindMany.mockResolvedValue([]);
      reportFindMany.mockResolvedValue([]);

      const result = await service.getBlockedUserIds('me');

      expect(result).toEqual([]);
    });

    it('queries blocked matches with correct bidirectional filter', async () => {
      matchFindMany.mockResolvedValue([]);
      reportFindMany.mockResolvedValue([]);

      await service.getBlockedUserIds('user-1');

      expect(matchFindMany).toHaveBeenCalledWith({
        where: {
          isBlocked: true,
          OR: [{ userAId: 'user-1' }, { userBId: 'user-1' }],
        },
        select: { userAId: true, userBId: true },
      });
    });

    it('queries reports with BLOCK category filter', async () => {
      matchFindMany.mockResolvedValue([]);
      reportFindMany.mockResolvedValue([]);

      await service.getBlockedUserIds('user-1');

      expect(reportFindMany).toHaveBeenCalledWith({
        where: {
          category: ReportCategory.BLOCK,
          OR: [{ reporterId: 'user-1' }, { reportedUserId: 'user-1' }],
        },
        select: { reporterId: true, reportedUserId: true },
      });
    });
  });

  describe('isBlocked', () => {
    it('returns true when a blocked match exists', async () => {
      matchFindFirst.mockResolvedValue({ id: 'blocked-match' });

      const result = await service.isBlocked('user-a', 'user-b');

      expect(result).toBe(true);
    });

    it('returns true when a BLOCK report exists', async () => {
      matchFindFirst.mockResolvedValue(null);
      reportFindFirst.mockResolvedValue({ id: 'block-report' });

      const result = await service.isBlocked('user-a', 'user-b');

      expect(result).toBe(true);
    });

    it('returns false when no block indicators exist', async () => {
      matchFindFirst.mockResolvedValue(null);
      reportFindFirst.mockResolvedValue(null);

      const result = await service.isBlocked('user-a', 'user-b');

      expect(result).toBe(false);
    });

    it('sorts user IDs for match lookup', async () => {
      matchFindFirst.mockResolvedValue(null);
      reportFindFirst.mockResolvedValue(null);

      await service.isBlocked('zzz', 'aaa');

      expect(matchFindFirst).toHaveBeenCalledWith({
        where: { userAId: 'aaa', userBId: 'zzz', isBlocked: true },
        select: { id: true },
      });
    });

    it('checks report in both directions', async () => {
      matchFindFirst.mockResolvedValue(null);
      reportFindFirst.mockResolvedValue(null);

      await service.isBlocked('user-a', 'user-b');

      expect(reportFindFirst).toHaveBeenCalledWith({
        where: {
          category: ReportCategory.BLOCK,
          OR: [
            { reporterId: 'user-a', reportedUserId: 'user-b' },
            { reporterId: 'user-b', reportedUserId: 'user-a' },
          ],
        },
        select: { id: true },
      });
    });
  });
});
