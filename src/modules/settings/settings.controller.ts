import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private svc: SettingsService) {}

  // Public — để client (Footer/Contact) có thể lấy thông tin liên hệ mới nhất nếu sau này muốn động hoá
  @Public()
  @Get()
  get() {
    return this.svc.get();
  }

  @Patch()
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  update(@Body() dto: UpdateSettingsDto) {
    return this.svc.update(dto);
  }
}
