import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { EventsService } from './events.service';
import type { AuthenticatedRequest } from '../common/auth-request.interface';
import { CreateEventDto } from './create-event.dto';
import { InviteEventDto } from './invite-event.dto';

@Controller('events')
@UseGuards(AuthGuard('jwt'))
@ApiTags('Events')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Authentication is required.' })
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'List public events' })
  @ApiOkResponse({ description: 'Events returned successfully.' })
  list(
    @Request() req: AuthenticatedRequest,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    const parsedTake = parseInt(take ?? '', 10);
    const parsedSkip = parseInt(skip ?? '', 10);
    const safeTake = Number.isNaN(parsedTake) ? 20 : Math.min(Math.max(parsedTake, 1), 100);
    const safeSkip = Number.isNaN(parsedSkip) ? 0 : Math.max(parsedSkip, 0);
    return this.eventsService.list(req.user.id, safeTake, safeSkip);
  }

  @Get('me')
  @ApiOperation({ summary: 'List events joined by the current user' })
  @ApiOkResponse({ description: 'Current user events returned successfully.' })
  myEvents(
    @Request() req: AuthenticatedRequest,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    const parsedTake = parseInt(take ?? '', 10);
    const parsedSkip = parseInt(skip ?? '', 10);
    const safeTake = Number.isNaN(parsedTake) ? 20 : Math.min(Math.max(parsedTake, 1), 100);
    const safeSkip = Number.isNaN(parsedSkip) ? 0 : Math.max(parsedSkip, 0);
    return this.eventsService.myEvents(req.user.id, safeTake, safeSkip);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event details for the current user' })
  @ApiOkResponse({ description: 'Event details returned successfully.' })
  detail(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.eventsService.detail(id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new event' })
  @ApiCreatedResponse({ description: 'Event created successfully.' })
  create(
    @Body() payload: CreateEventDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.eventsService.create(payload, req.user.id);
  }

  @Post(':id/rsvp')
  @ApiOperation({ summary: 'RSVP to an event' })
  @ApiCreatedResponse({ description: 'RSVP recorded successfully.' })
  rsvp(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.eventsService.rsvp(id, req.user.id);
  }

  @Post(':id/invite')
  @ApiOperation({ summary: 'Invite a match to an event' })
  @ApiCreatedResponse({ description: 'Invite sent successfully.' })
  invite(
    @Param('id') id: string,
    @Body() payload: InviteEventDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.eventsService.invite(
      id,
      req.user.id,
      payload.matchId,
      payload.message,
    );
  }

  @Get(':id/invites')
  @ApiOperation({ summary: 'List invites for an event (host only)' })
  @ApiOkResponse({ description: 'Event invites returned successfully.' })
  getInvites(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.eventsService.getInvites(id, req.user.id);
  }
}
