import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AnalyticsService } from './analytics.service';
import { VisitsQueryDto } from './dto/visits-query.dto';
import { TrackVisitDto } from './dto/track-visit.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private svc: AnalyticsService) {}

  // Public — gọi bởi FE (client layout), không cần auth
  // Throttle nhẹ để tránh spam giả lượt truy cập
  @Public()
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Post('track')
  track(@Body() _dto: TrackVisitDto) {
    return this.svc.track();
  }

  @Get('overview')
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiBearerAuth()
  overview() {
    return this.svc.overview();
  }

  @Get('visits')
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiBearerAuth()
  visits(@Query() query: VisitsQueryDto) {
    return this.svc.visits(query);
  }

  @Post('sync')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  sync() {
    return this.svc.syncToDb();
  }
}
