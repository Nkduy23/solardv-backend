import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { UploadMediaDto } from './dto/upload-media.dto';
import { PrismaService } from '../../database/prisma.service';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    cloudinary.config({
      cloud_name: this.config.get('cloudinary.cloudName'),
      api_key: this.config.get('cloudinary.apiKey'),
      api_secret: this.config.get('cloudinary.apiSecret'),
    });
  }

  async save(file: Express.Multer.File, dto: UploadMediaDto) {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        'Chỉ chấp nhận file ảnh (JPEG, PNG, WEBP, GIF)',
      );
    }
    if (file.size > MAX_SIZE) {
      throw new BadRequestException('File không được vượt quá 10MB');
    }

    const uploadResult = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `solardv/${dto.category ?? 'other'}`,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
      stream.end(file.buffer);
    });

    const record = await this.prisma.media.create({
      data: {
        publicId: uploadResult.public_id,
        url: uploadResult.secure_url,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        category: dto.category,
        caption: dto.caption,
        refId: dto.refId,
      },
    });

    this.logger.log(`Uploaded to Cloudinary: ${uploadResult.public_id}`);
    return record;
  }

  async findAll(category?: string) {
    return this.prisma.media.findMany({
      where: category ? { category } : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.media.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Không tìm thấy file');
    return item;
  }

  async remove(id: string) {
    const item = await this.findOne(id);
    try {
      await cloudinary.uploader.destroy(item.publicId);
    } catch (err) {
      this.logger.warn(
        `Failed to delete from Cloudinary: ${item.publicId}`,
        err,
      );
    }
    await this.prisma.media.delete({ where: { id } });
    return { deleted: true };
  }
}
