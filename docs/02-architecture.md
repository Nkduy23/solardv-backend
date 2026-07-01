# 02 — Kiến trúc Backend

## Sơ đồ tầng

```
Controller  (nhận request, validate DTO, áp Guard)
    │
    ▼
Service     (business logic)
    │
    ▼
PrismaService (truy vấn PostgreSQL)
    │
RedisService (cache / buffer analytics, dùng song song khi cần)
```

## Xác thực & phân quyền

- `POST /auth/login` trả về `accessToken` (ngắn hạn) + `refreshToken` (dài hạn, dùng để cấp lại access token qua `POST /auth/refresh`).
- `JwtAuthGuard` áp dụng global, các route public đánh dấu bằng decorator `@Public()`.
- `RolesGuard` + decorator `@Roles('ADMIN', 'STAFF')` kiểm soát theo vai trò ở cấp method/controller.

## Middleware đếm lượt truy cập

`AnalyticsTrackerMiddleware` gắn ở cấp app (trừ các path `/admin`, `/auth`, `/health`):

1. Mỗi request hợp lệ → tăng counter trong Redis theo key dạng `visits:{yyyy-mm-dd}`.
2. Một cron job nội bộ (`@nestjs/schedule`, sẽ bổ sung khi code) chạy định kỳ (vd. mỗi giờ) đọc counter Redis trong ngày và upsert vào bảng `VisitStat`.
3. `AnalyticsService` khi trả dữ liệu cho Dashboard sẽ gộp: số liệu các ngày trước lấy từ `VisitStat`, số liệu hôm nay lấy realtime từ Redis.

## Chuẩn hoá response & lỗi

- `TransformInterceptor` bọc mọi response thành công công ty dạng: `{ success: true, data, meta? }`.
- `HttpExceptionFilter` bắt mọi lỗi, trả dạng: `{ success: false, message, statusCode }`.

## Validate input

DTO sử dụng `class-validator`, áp dụng qua `ValidationPipe` global (whitelist + transform) cấu hình trong `main.ts`.

## Tài liệu API

Swagger được bật ở môi trường dev tại path `/docs` (cấu hình trong `main.ts`), tự sinh từ decorator trong controller/DTO.
