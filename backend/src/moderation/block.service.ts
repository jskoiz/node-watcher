import { Injectable } from '@nestjs/common';
import { ReportCategory } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BlockService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns all user IDs that are in a block relationship with the given user
   * (bidirectional). Uses two reliable signals:
   *   1. Matches flagged isBlocked=true
   *   2. Report records with category=BLOCK
   */
  async getBlockedUserIds(userId: string): Promise<string[]> {
    const [blockedMatches, reportRows] = await Promise.all([
      // Matches explicitly marked as blocked
      this.prisma.match.findMany({
        where: {
          isBlocked: true,
          OR: [{ userAId: userId }, { userBId: userId }],
        },
        select: { userAId: true, userBId: true },
      }),
      // Block-category reports — check both directions
      this.prisma.report.findMany({
        where: {
          category: ReportCategory.BLOCK,
          OR: [{ reporterId: userId }, { reportedUserId: userId }],
        },
        select: { reporterId: true, reportedUserId: true },
      }),
    ]);

    const ids = new Set<string>();

    for (const row of blockedMatches) {
      const otherId = row.userAId === userId ? row.userBId : row.userAId;
      ids.add(otherId);
    }

    for (const row of reportRows) {
      const otherId =
        row.reporterId === userId ? row.reportedUserId : row.reporterId;
      ids.add(otherId);
    }

    return Array.from(ids);
  }

  /**
   * Quick check whether two specific users are in a block relationship.
   */
  async isBlocked(userA: string, userB: string): Promise<boolean> {
    // Check for blocked match
    const [sortedA, sortedB] = [userA, userB].sort();
    const blockedMatch = await this.prisma.match.findFirst({
      where: {
        userAId: sortedA,
        userBId: sortedB,
        isBlocked: true,
      },
      select: { id: true },
    });
    if (blockedMatch) return true;

    // Check for block-category report in either direction
    const blockReport = await this.prisma.report.findFirst({
      where: {
        category: ReportCategory.BLOCK,
        OR: [
          { reporterId: userA, reportedUserId: userB },
          { reporterId: userB, reportedUserId: userA },
        ],
      },
      select: { id: true },
    });
    return !!blockReport;
  }
}
