import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { VisitsQueryDto, GroupBy } from './dto/visits-query.dto';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  // ─── Cron: chạy mỗi giờ, đồng bộ Redis buffer → VisitStat DB ───────────
  @Cron(CronExpression.EVERY_HOUR)
  async syncToDb() {
    try {
      const keys = await this.redis.keys('visits:pageviews:*');
      for (const key of keys) {
        const date = key.replace('visits:pageviews:', ''); // "2026-06-30"
        const val = await this.redis.get(key);
        if (!val) continue;
        const pageViews = parseInt(val, 10);

        await this.prisma.visitStat.upsert({
          where: { date: new Date(date) },
          update: { pageViews },
          create: { date: new Date(date), pageViews },
        });
      }
      this.logger.log(`Synced ${keys.length} visit keys to DB`);
    } catch (err) {
      this.logger.error('syncToDb failed', err);
    }
  }

  // ─── Overview cho StatCard trên Dashboard ────────────────────────────────
  async overview() {
    const today = new Date().toISOString().split('T')[0];

    // Lượt truy cập hôm nay — đọc realtime từ Redis
    const todayRedis = await this.redis.get(`visits:pageviews:${today}`);
    const totalVisitsToday = parseInt(todayRedis ?? '0', 10);

    // Tháng này — tổng từ DB (đã sync) + phần hôm nay chưa sync
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );
    const dbMonthResult = await this.prisma.visitStat.aggregate({
      _sum: { pageViews: true },
      where: { date: { gte: startOfMonth } },
    });
    const totalVisitsThisMonth =
      (dbMonthResult._sum.pageViews ?? 0) + totalVisitsToday;

    // Đăng ký tư vấn tháng này
    const totalConsultationsThisMonth = await this.prisma.consultation.count({
      where: { createdAt: { gte: startOfMonth } },
    });

    // Tỉ lệ chuyển đổi
    const conversionRate =
      totalVisitsThisMonth > 0
        ? +((totalConsultationsThisMonth / totalVisitsThisMonth) * 100).toFixed(
            2,
          )
        : 0;

    return {
      totalVisitsToday,
      totalVisitsThisMonth,
      totalConsultationsThisMonth,
      conversionRate,
    };
  }

  // ─── Data cho VisitsChart (lịch sử theo ngày/tuần/tháng) ────────────────
  async visits(query: VisitsQueryDto) {
    const from = query.from ? new Date(query.from) : this.daysAgo(30);
    const to = query.to ? new Date(query.to) : new Date();

    const rows = await this.prisma.visitStat.findMany({
      where: { date: { gte: from, lte: to } },
      orderBy: { date: 'asc' },
    });

    // Lấy thêm giá trị Redis hôm nay nếu nằm trong range
    const today = new Date().toISOString().split('T')[0];
    if (to >= new Date(today)) {
      const todayVal = await this.redis.get(`visits:pageviews:${today}`);
      const todayPv = parseInt(todayVal ?? '0', 10);
      const existIdx = rows.findIndex((r) =>
        r.date.toISOString().startsWith(today),
      );
      if (existIdx >= 0) {
        rows[existIdx] = { ...rows[existIdx], pageViews: todayPv };
      } else if (todayPv > 0) {
        rows.push({
          id: 'today',
          date: new Date(today),
          pageViews: todayPv,
          visitors: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any);
      }
    }

    if (query.groupBy === GroupBy.DAY || !query.groupBy) return rows;

    // Group by week hoặc month
    const grouped: Record<string, number> = {};
    for (const row of rows) {
      const key =
        query.groupBy === GroupBy.MONTH
          ? `${row.date.getFullYear()}-${String(row.date.getMonth() + 1).padStart(2, '0')}`
          : this.weekLabel(row.date);
      grouped[key] = (grouped[key] ?? 0) + row.pageViews;
    }
    return Object.entries(grouped).map(([date, pageViews]) => ({
      date,
      pageViews,
    }));
  }

  private daysAgo(n: number) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
  }

  private weekLabel(date: Date) {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString().split('T')[0];
  }
}
