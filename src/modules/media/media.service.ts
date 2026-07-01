import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import { UploadMediaDto } from './dto/upload-media.dto';

export interface MediaFile {
  id: string;
  originalName: string;
  filename: string;
  url: string;
  size: number;
  mimetype: string;
  category?: string;
  caption?: string;
  refId?: string;
  createdAt: Date;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  // In-memory store tạm — thay bằng DB khi cần persist
  private readonly store: Map<string, MediaFile> = new Map();
  private readonly uploadDir: string;

  constructor(private config: ConfigService) {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async save(
    file: Express.Multer.File,
    dto: UploadMediaDto,
    baseUrl: string,
  ): Promise<MediaFile> {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        'Chỉ chấp nhận file ảnh (JPEG, PNG, WEBP, GIF)',
      );
    }
    if (file.size > MAX_SIZE) {
      throw new BadRequestException('File không được vượt quá 10MB');
    }

    const id = `media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const ext = path.extname(file.originalname);
    const filename = `${id}${ext}`;
    const dest = path.join(this.uploadDir, filename);

    fs.writeFileSync(dest, file.buffer);

    const record: MediaFile = {
      id,
      originalName: file.originalname,
      filename,
      url: `${baseUrl}/uploads/${filename}`,
      size: file.size,
      mimetype: file.mimetype,
      category: dto.category,
      caption: dto.caption,
      refId: dto.refId,
      createdAt: new Date(),
    };

    this.store.set(id, record);
    this.logger.log(`Uploaded: ${filename} (${file.size} bytes)`);
    return record;
  }

  findAll(category?: string): MediaFile[] {
    const all = Array.from(this.store.values());
    return category ? all.filter((f) => f.category === category) : all;
  }

  findOne(id: string): MediaFile {
    const item = this.store.get(id);
    if (!item) throw new NotFoundException('Không tìm thấy file');
    return item;
  }

  remove(id: string): { deleted: boolean } {
    const item = this.findOne(id);
    const filePath = path.join(this.uploadDir, item.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    this.store.delete(id);
    this.logger.log(`Deleted: ${item.filename}`);
    return { deleted: true };
  }
}
