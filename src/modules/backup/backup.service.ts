import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { PrismaService } from '../../database/prisma.service';

const MAX_BACKUPS_KEPT = 14; // giữ 14 bản gần nhất, tự xoá bản cũ hơn

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    cloudinary.config({
      cloud_name: this.config.get('cloudinary.cloudName'),
      api_key: this.config.get('cloudinary.apiKey'),
      api_secret: this.config.get('cloudinary.apiSecret'),
    });
  }

  // Chạy tự động mỗi ngày lúc 2:00 sáng
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async scheduledBackup() {
    this.logger.log('Bắt đầu sao lưu dữ liệu tự động...');
    await this.runBackup();
  }

  async runBackup() {
    // Xuất toàn bộ dữ liệu các bảng chính sang JSON — đơn giản, không phụ
    // thuộc công cụ pg_dump (không có sẵn trên môi trường Render mặc định),
    // đủ để khôi phục thủ công dữ liệu khi cần.
    const [users, services, products, projects, posts, consultations, visitStats, media] = await Promise.all([
      this.prisma.user.findMany(),
      this.prisma.service.findMany(),
      this.prisma.product.findMany(),
      this.prisma.project.findMany(),
      this.prisma.post.findMany(),
      this.prisma.consultation.findMany(),
      this.prisma.visitStat.findMany(),
      this.prisma.media.findMany(),
    ]);

    const payload = {
      generatedAt: new Date().toISOString(),
      tables: { users, services, products, projects, posts, consultations, visitStats, media },
    };

    const json = JSON.stringify(payload, null, 2);
    const buffer = Buffer.from(json, 'utf-8');
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `backup-${dateStr}-${Date.now()}.json`;

    const uploadResult = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'solardv/backups', resource_type: 'raw', public_id: fileName.replace('.json', '') },
        (err, result) => (err ? reject(err) : resolve(result)),
      );
      stream.end(buffer);
    });

    const log = await this.prisma.backupLog.create({
      data: {
        url: uploadResult.secure_url,
        fileName,
        sizeBytes: buffer.byteLength,
      },
    });

    this.logger.log(`Backup thành công: ${fileName} (${(buffer.byteLength / 1024).toFixed(1)} KB)`);

    await this.cleanupOldBackups();

    return log;
  }

  async list() {
    return this.prisma.backupLog.findMany({ orderBy: { createdAt: 'desc' }, take: 30 });
  }

  private async cleanupOldBackups() {
    const all = await this.prisma.backupLog.findMany({ orderBy: { createdAt: 'desc' } });
    const toDelete = all.slice(MAX_BACKUPS_KEPT);
    for (const item of toDelete) {
      try {
        const publicId = `solardv/backups/${item.fileName.replace('.json', '')}`;
        await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
      } catch (err) {
        this.logger.warn(`Không xoá được backup cũ trên Cloudinary: ${item.fileName}`, err);
      }
      await this.prisma.backupLog.delete({ where: { id: item.id } });
    }
  }
}
