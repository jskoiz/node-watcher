import { Module } from '@nestjs/common';
import { ModerationController } from './moderation.controller';
import { ModerationService } from './moderation.service';
import { BlockService } from './block.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [ModerationController],
  providers: [ModerationService, BlockService],
  exports: [BlockService],
})
export class ModerationModule {}
