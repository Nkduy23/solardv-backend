import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ConsultationStatus, Role } from '@prisma/client';
import { ConsultationsService } from './consultations.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Consultations')
@Controller('consultations')
export class ConsultationsController {
  constructor(private svc: ConsultationsService) {}

  // Giới hạn 5 lần đăng ký / 1 phút / 1 IP
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post()
  create(@Body() dto: CreateConsultationDto) {
    return this.svc.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiBearerAuth()
  @ApiQuery({ name: 'status', enum: ConsultationStatus, required: false })
  findAll(@Query() q: PaginationQueryDto & { status?: ConsultationStatus }) {
    return this.svc.findAll(q);
  }

  @Get('summary')
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiBearerAuth()
  summary() {
    return this.svc.summary();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiBearerAuth()
  updateStatus(@Param('id') id: string, @Body() dto: UpdateConsultationDto) {
    return this.svc.updateStatus(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
