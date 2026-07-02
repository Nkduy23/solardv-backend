import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import { ConsultationStatus } from '@prisma/client';

@Injectable()
export class ConsultationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto & { status?: ConsultationStatus }) {
    const { page = 1, limit = 20, search, status } = query;
    const where: any = {};
    if (search)
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    if (status) where.status = status;
    const [data, total] = await Promise.all([
      this.prisma.consultation.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.consultation.count({ where }),
    ]);
    return { data, meta: { total, page, limit } };
  }

  async findOne(id: string) {
    const item = await this.prisma.consultation.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Không tìm thấy đăng ký');
    return item;
  }

  async create(dto: CreateConsultationDto) {
    return this.prisma.consultation.create({ data: dto });
  }

  async updateStatus(id: string, dto: UpdateConsultationDto) {
    await this.findOne(id);
    return this.prisma.consultation.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.consultation.delete({ where: { id } });
  }

  async summary() {
    const [total, newCount, contacted, done] = await Promise.all([
      this.prisma.consultation.count(),
      this.prisma.consultation.count({ where: { status: 'NEW' } }),
      this.prisma.consultation.count({ where: { status: 'CONTACTED' } }),
      this.prisma.consultation.count({ where: { status: 'DONE' } }),
    ]);
    return { total, new: newCount, contacted, done };
  }
}
