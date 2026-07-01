import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto) {
    const { page = 1, limit = 20, search } = query;
    const where = search
      ? { OR: [{ title: { contains: search, mode: 'insensitive' as const } }] }
      : {};
    const [data, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.service.count({ where }),
    ]);
    return { data, meta: { total, page, limit } };
  }

  async findOne(slug: string) {
    const item = await this.prisma.service.findUnique({ where: { slug } });
    if (!item) throw new NotFoundException('Không tìm thấy dịch vụ');
    return item;
  }

  async create(dto: CreateServiceDto) {
    return this.prisma.service.create({ data: dto });
  }

  async update(id: string, dto: UpdateServiceDto) {
    await this.findById(id);
    return this.prisma.service.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.service.delete({ where: { id } });
  }

  private async findById(id: string) {
    const item = await this.prisma.service.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Không tìm thấy dịch vụ');
    return item;
  }
}
