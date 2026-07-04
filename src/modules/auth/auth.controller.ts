import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

const ACCESS_COOKIE = 'solardv_access_token';
const REFRESH_COOKIE = 'solardv_refresh_token';
const ACCESS_MAX_AGE = 15 * 60 * 1000; // khớp JWT_ACCESS_EXPIRES_IN=15m
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // khớp JWT_REFRESH_EXPIRES_IN=7d

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
  ) {}

  private cookieOptions(maxAge: number) {
    const isProd = this.config.get('nodeEnv') === 'production';
    return {
      httpOnly: true,
      secure: isProd, // bắt buộc HTTPS ở production
      sameSite: 'lax' as const, // subdomain cùng gốc vẫn tính là same-site
      domain: this.config.get<string>('cookieDomain'), // ".ducvinhgreen.io.vn" — undefined ở local
      path: '/',
      maxAge,
    };
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập, set cookie httpOnly' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    res.cookie(
      ACCESS_COOKIE,
      result.accessToken,
      this.cookieOptions(ACCESS_MAX_AGE),
    );
    res.cookie(
      REFRESH_COOKIE,
      result.refreshToken,
      this.cookieOptions(REFRESH_MAX_AGE),
    );
    return { user: result.user };
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Cấp lại access token từ refresh cookie' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = (req as any).cookies?.[REFRESH_COOKIE];
    if (!refreshToken)
      throw new UnauthorizedException('Không có refresh token');
    const result = await this.authService.refresh(refreshToken);
    res.cookie(
      ACCESS_COOKIE,
      result.accessToken,
      this.cookieOptions(ACCESS_MAX_AGE),
    );
    return { success: true };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Xoá cookie đăng nhập' })
  logout(@Res({ passthrough: true }) res: Response) {
    const opts = { ...this.cookieOptions(0), maxAge: undefined };
    res.clearCookie(ACCESS_COOKIE, opts);
    res.clearCookie(REFRESH_COOKIE, opts);
    return { success: true };
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin user đang đăng nhập' })
  me(@CurrentUser() user: { id: string }) {
    return this.authService.me(user.id);
  }
}
