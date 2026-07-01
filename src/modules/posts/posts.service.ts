import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto & { published?: string }) {
    const { page = 1, limit = 20, search, published } = query;
    const where: any = {};
    if (search)
      where.OR = [{ title: { contains: search, mode: 'insensitive' } }];
    if (published === 'true') where.isPublished = true;
    const [data, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { publishedAt: 'desc' },
      }),
      this.prisma.post.count({ where }),
    ]);
    return { data, meta: { total, page, limit } };
  }

  async findOne(slug: string) {
    const item = await this.prisma.post.findUnique({ where: { slug } });
    if (!item) throw new NotFoundException('Không tìm thấy bài viết');
    return item;
  }

  async create(dto: CreatePostDto) {
    const data: any = { ...dto };
    if (dto.isPublished && !dto.publishedAt) data.publishedAt = new Date();
    return this.prisma.post.create({ data });
  }

  async update(id: string, dto: UpdatePostDto) {
    await this.findById(id);
    const data: any = { ...dto };
    if (dto.isPublished && !dto.publishedAt) data.publishedAt = new Date();
    return this.prisma.post.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.post.delete({ where: { id } });
  }

  private async findById(id: string) {
    const item = await this.prisma.post.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Không tìm thấy bài viết');
    return item;
  }
}
