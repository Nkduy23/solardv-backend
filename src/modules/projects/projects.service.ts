import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto) {
    const { page = 1, limit = 20, search } = query;
    const where = search
      ? { OR: [{ title: { contains: search, mode: 'insensitive' as const } }] }
      : {};
    const [data, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { completedAt: 'desc' },
      }),
      this.prisma.project.count({ where }),
    ]);
    return { data, meta: { total, page, limit } };
  }

  async findOne(slug: string) {
    const item = await this.prisma.project.findUnique({ where: { slug } });
    if (!item) throw new NotFoundException('Không tìm thấy dự án');
    return item;
  }

  async create(dto: CreateProjectDto) {
    return this.prisma.project.create({ data: dto });
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.findById(id);
    return this.prisma.project.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.project.delete({ where: { id } });
  }

  private async findById(id: string) {
    const item = await this.prisma.project.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Không tìm thấy dự án');
    return item;
  }
}
