import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

const SINGLETON_ID = 'singleton';

// Giá trị mặc định nếu DB chưa có dòng SiteSettings nào (lần đầu chạy)
const DEFAULTS = {
  phone: '0985 821 820',
  email: 'contact@solardv.vn',
  address: '160 đường số 2, Khu đô thị Vạn Phúc, Phường Hiệp Bình, TP. Hồ Chí Minh',
};

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async get() {
    const existing = await this.prisma.siteSettings.findUnique({ where: { id: SINGLETON_ID } });
    if (existing) return existing;
    // Chưa có dòng nào -> tự tạo với giá trị mặc định
    return this.prisma.siteSettings.create({ data: { id: SINGLETON_ID, ...DEFAULTS } });
  }

  async update(dto: UpdateSettingsDto) {
    // Đảm bảo dòng singleton tồn tại trước khi update (phòng trường hợp DB trống)
    await this.get();
    return this.prisma.siteSettings.update({ where: { id: SINGLETON_ID }, data: dto });
  }
}
