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
import { Role } from '@prisma/client';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private svc: PostsService) {}

  @Public()
  @Get()
  @ApiQuery({ name: 'published', required: false })
  findAll(@Query() q: PaginationQueryDto & { published?: string }) {
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
  create(@Body() dto: CreatePostDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() dto: UpdatePostDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
