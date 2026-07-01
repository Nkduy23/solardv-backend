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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(private svc: ServicesService) {}

  @Public()
  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.svc.findAll(query);
  }

  @Public()
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.svc.findOne(slug);
  }

  @Post()
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiBearerAuth()
  create(@Body() dto: CreateServiceDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
