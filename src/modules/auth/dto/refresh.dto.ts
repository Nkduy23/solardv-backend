import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshDto {
  @ApiProperty({ example: 'refreshToken' })
  @IsString()
  refreshToken!: string;
}
