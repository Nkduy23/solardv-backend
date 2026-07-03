import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Request } from 'express';
import { MediaService } from './media.service';
import { UploadMediaDto } from './dto/upload-media.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private svc: MediaService) {}

  @Post('upload')
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        category: { type: 'string' },
        caption: { type: 'string' },
        refId: { type: 'string' },
      },
    },
  })
  upload(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    const dto = new UploadMediaDto();
    dto.category = req.body?.category;
    dto.caption = req.body?.caption;
    dto.refId = req.body?.refId;
    return this.svc.save(file, dto);
  }

  @Get()
  @Public()
  @ApiQuery({ name: 'category', required: false })
  findAll(@Query('category') category?: string) {
    return this.svc.findAll(category);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
