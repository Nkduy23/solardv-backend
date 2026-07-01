import { Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AnalyticsService } from './analytics.service';
import { VisitsQueryDto } from './dto/visits-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Analytics')
@Controller('analytics')
@Roles(Role.ADMIN, Role.STAFF)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private svc: AnalyticsService) {}

  @Get('overview')
  overview() {
    return this.svc.overview();
  }

  @Get('visits')
  visits(@Query() query: VisitsQueryDto) {
    return this.svc.visits(query);
  }

  // Trigger sync thủ công (hữu ích khi test)
  @Post('sync')
  @Roles(Role.ADMIN)
  sync() {
    return this.svc.syncToDb();
  }
}
