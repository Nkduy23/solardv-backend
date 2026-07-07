import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ConsultationStatus, Role } from '@prisma/client';
import type { Response } from 'express';
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

  // Đặt TRƯỚC route ':id' để tránh bị match nhầm thành id="export"
  @Get('export')
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiBearerAuth()
  async export(@Res() res: Response) {
    const buffer = await this.svc.exportToExcel();
    const fileName = `dang-ky-tu-van-${new Date().toISOString().split('T')[0]}.xlsx`;
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });
    res.send(buffer);
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
