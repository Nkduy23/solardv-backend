import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum MediaCategory {
  PRODUCT = 'product',
  PROJECT = 'project',
  HANDOVER = 'handover', // ảnh bàn giao
  OTHER = 'other',
}

export class UploadMediaDto {
  @ApiPropertyOptional({ enum: MediaCategory })
  @IsOptional()
  @IsEnum(MediaCategory)
  category?: MediaCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  caption?: string;

  @ApiPropertyOptional({
    description: 'ID của project/product liên quan nếu có',
  })
  @IsOptional()
  @IsString()
  refId?: string;
}
