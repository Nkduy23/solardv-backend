# SolarDV — Backend

API phục vụ website & hệ thống quản trị **SolarDV** (Công ty TNHH Đức Vinh Việt Nam).

## Tech stack

- **NestJS 10** + TypeScript
- **PostgreSQL** + **Prisma ORM**
- **Redis** (cache + buffer đếm lượt truy cập realtime)
- **JWT** (access + refresh token) cho xác thực Admin
- **class-validator / class-transformer** cho validate DTO
- **Swagger** cho tài liệu API tự sinh

## Cấu trúc thư mục

```
src/
  main.ts, app.module.ts        Bootstrap & root module
  config/                       Đọc & validate biến môi trường
  common/                       decorators, filters, guards, interceptors, pipes, middleware dùng chung
  database/                     PrismaModule/PrismaService
  redis/                        RedisModule/RedisService
  modules/
    auth/                       Đăng nhập, JWT, refresh token
    users/                      Quản lý tài khoản admin/staff
    services/                   CRUD dịch vụ điện năng lượng mặt trời
    products/                   CRUD sản phẩm
    projects/                   CRUD công trình/dự án đã triển khai
    posts/                      CRUD tin tức
    consultations/              Đăng ký tư vấn của khách hàng
    media/                      Upload & quản lý ảnh
    analytics/                  Thống kê lượt truy cập website
prisma/
  schema.prisma                 Định nghĩa database schema
  seed.ts                       Script tạo dữ liệu mẫu
docs/                           Tài liệu thiết kế & kế hoạch của Backend
```

## Bắt đầu

```bash
npm install
cp .env.example .env

# chạy nhanh Postgres + Redis cho local
docker compose up -d

npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

npm run start:dev
```

## Quy ước module

Mỗi module nghiệp vụ có cấu trúc giống nhau: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `dto/`. Toàn bộ truy vấn DB đi qua `PrismaService` (không gọi Prisma trực tiếp trong controller).

## Phân quyền

- Hầu hết endpoint **đọc** (GET danh sách/chi tiết public content) là public.
- Toàn bộ endpoint **ghi** (POST/PATCH/DELETE) và mọi endpoint trong `users`, `analytics`, `consultations` (trừ tạo mới) yêu cầu JWT + role `ADMIN` hoặc `STAFF` tuỳ endpoint, qua `JwtAuthGuard` + `RolesGuard`.

## Theo dõi lượt truy cập

`AnalyticsTrackerMiddleware` ghi nhận mỗi request (loại trừ route admin) vào Redis (đếm theo ngày), sau đó một job định kỳ (hoặc khi đọc dashboard) đồng bộ số liệu xuống bảng `VisitStat` trong PostgreSQL để lưu trữ lâu dài. Endpoint `analytics` đọc kết hợp cả hai nguồn để trả số liệu realtime + lịch sử.

## Tài liệu liên quan

Xem thêm tại [`docs/`](./docs).
