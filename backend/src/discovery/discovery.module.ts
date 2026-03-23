import { Module } from '@nestjs/common';
import { DiscoveryService } from './discovery.service';
import { DiscoveryController } from './discovery.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { ProfileModule } from '../profile/profile.module';
import { ModerationModule } from '../moderation/moderation.module';

@Module({
  imports: [NotificationsModule, ProfileModule, ModerationModule],
  providers: [DiscoveryService],
  controllers: [DiscoveryController],
})
export class DiscoveryModule {}
