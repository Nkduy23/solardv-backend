import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RedisService } from '../../redis/redis.service';

// Prefix key Redis: visits:YYYY-MM-DD
const visitKey = (date: string) => `visits:pageviews:${date}`;

// Bỏ qua các path không phải trang thật
const SKIP_PREFIXES = [
  '/api/v1/auth',
  '/api/v1/media',
  '/docs',
  '/health',
  '/uploads',
];

@Injectable()
export class AnalyticsTrackerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AnalyticsTrackerMiddleware.name);

  constructor(private redis: RedisService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    console.log('[AnalyticsTracker] hit:', req.method, req.path);
    const skip = SKIP_PREFIXES.some((p) => req.path.startsWith(p));
    if (!skip && req.method === 'GET') {
      const today = new Date().toISOString().split('T')[0]; // "2026-06-30"
      const key = visitKey(today);
      try {
        await this.redis.incr(key);
        await this.redis.expire(key, 60 * 60 * 48); // giữ 48h trong Redis
      } catch (err) {
        this.logger.warn('Analytics Redis error', err);
      }
    }
    next();
  }
}

// bỏ
