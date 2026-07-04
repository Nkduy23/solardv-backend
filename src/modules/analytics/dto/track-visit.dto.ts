import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class TrackVisitDto {
  @ApiPropertyOptional({
    description: 'Đường dẫn trang khách vừa xem, vd: /products',
  })
  @IsOptional()
  @IsString()
  path?: string;
}
