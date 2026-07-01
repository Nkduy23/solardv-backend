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
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private svc: ProjectsService) {}

  @Public()
  @Get()
  findAll(@Query() q: PaginationQueryDto) {
    return this.svc.findAll(q);
  }

  @Public()
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.svc.findOne(slug);
  }

  @Post()
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiBearerAuth()
  create(@Body() dto: CreateProjectDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
