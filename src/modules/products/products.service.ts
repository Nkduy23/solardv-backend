import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto & { category?: string }) {
    const { page = 1, limit = 20, search, category } = query;
    const where: any = {};
    if (search)
      where.OR = [{ name: { contains: search, mode: 'insensitive' } }];
    if (category) where.category = category;
    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);
    return { data, meta: { total, page, limit } };
  }

  async findOne(slug: string) {
    const item = await this.prisma.product.findUnique({ where: { slug } });
    if (!item) throw new NotFoundException('Không tìm thấy sản phẩm');
    return item;
  }

  async create(dto: CreateProductDto) {
    return this.prisma.product.create({ data: dto });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findById(id);
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.product.delete({ where: { id } });
  }

  private async findById(id: string) {
    const item = await this.prisma.product.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Không tìm thấy sản phẩm');
    return item;
  }
}
