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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private svc: ProductsService) {}

  @Public()
  @Get()
  @ApiQuery({ name: 'category', required: false })
  findAll(@Query() query: PaginationQueryDto & { category?: string }) {
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
  create(@Body() dto: CreateProductDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
