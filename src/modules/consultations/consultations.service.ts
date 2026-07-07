import { Injectable, NotFoundException } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { PrismaService } from '../../database/prisma.service';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import { ConsultationStatus } from '@prisma/client';
import { EmailService } from '../email/email.service';

const STATUS_LABEL: Record<ConsultationStatus, string> = {
  NEW: 'Mới',
  CONTACTED: 'Đã liên hệ',
  DONE: 'Hoàn tất',
  CANCELLED: 'Đã huỷ',
};

@Injectable()
export class ConsultationsService {
  constructor(
    private prisma: PrismaService,
    private email: EmailService,
  ) {}

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
    return { data, meta: { total, page: Number(page), limit: Number(limit) } };
  }

  async findOne(id: string) {
    const item = await this.prisma.consultation.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Không tìm thấy đăng ký');
    return item;
  }

  async create(dto: CreateConsultationDto) {
    const created = await this.prisma.consultation.create({ data: dto });

    // Gửi email thông báo — không await chặn response, chạy nền, lỗi tự nuốt bên trong EmailService
    this.email.sendNewConsultationNotification(dto);

    return created;
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

  // Xuất toàn bộ danh sách đăng ký tư vấn ra file Excel (.xlsx)
  async exportToExcel(): Promise<ExcelJS.Buffer> {
    const consultations = await this.prisma.consultation.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SolarDV';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Đăng ký tư vấn');
    sheet.columns = [
      { header: 'Họ và tên', key: 'fullName', width: 25 },
      { header: 'Điện thoại', key: 'phone', width: 16 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Địa chỉ', key: 'address', width: 30 },
      { header: 'Nội dung', key: 'message', width: 40 },
      { header: 'Trạng thái', key: 'status', width: 14 },
      { header: 'Ngày đăng ký', key: 'createdAt', width: 18 },
    ];

    // Header bold + nền màu nhẹ cho dễ nhìn
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF5A623' },
    };

    consultations.forEach((c) => {
      sheet.addRow({
        fullName: c.fullName,
        phone: c.phone,
        email: c.email ?? '',
        address: c.address ?? '',
        message: c.message ?? '',
        status: STATUS_LABEL[c.status],
        createdAt: c.createdAt.toLocaleDateString('vi-VN'),
      });
    });

    return workbook.xlsx.writeBuffer();
  }
}
