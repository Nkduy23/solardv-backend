import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ConsultationStatus } from '@prisma/client';

export class UpdateConsultationDto {
  @ApiProperty({ enum: ConsultationStatus })
  @IsEnum(ConsultationStatus)
  status!: ConsultationStatus;
}
