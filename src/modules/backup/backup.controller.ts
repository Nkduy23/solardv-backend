import { Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { BackupService } from './backup.service';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Backup')
@Controller('backup')
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class BackupController {
  constructor(private svc: BackupService) {}

  @Get()
  list() {
    return this.svc.list();
  }

  // Trigger sao lưu thủ công (hữu ích để test hoặc backup ngay trước khi thao tác rủi ro)
  @Post('run')
  run() {
    return this.svc.runBackup();
  }
}
