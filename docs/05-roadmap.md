# 05 — Kế hoạch triển khai (Backend)

## Giai đoạn 1 — Nền tảng
- [ ] Cấu hình `ConfigModule` + validate biến môi trường
- [ ] Kết nối Prisma + PostgreSQL, chạy migration đầu tiên
- [ ] Kết nối Redis
- [ ] Global pipe/filter/interceptor (validation, response chuẩn hoá, log)

## Giai đoạn 2 — Auth & Users
- [ ] Đăng nhập + phát hành JWT access/refresh
- [ ] Guard + decorator phân quyền ADMIN/STAFF
- [ ] CRUD user nội bộ + seed tài khoản admin mặc định

## Giai đoạn 3 — Nội dung (Services/Products/Projects/Posts)
- [ ] CRUD đầy đủ từng module
- [ ] Upload ảnh qua module `media`, gắn vào product/project
- [ ] Phân trang, tìm kiếm, lọc cơ bản

## Giai đoạn 4 — Consultations & Analytics
- [ ] API nhận đăng ký tư vấn từ FE
- [ ] Middleware đếm lượt truy cập (Redis) + job đồng bộ xuống `VisitStat`
- [ ] API thống kê cho Admin Dashboard (tổng lượt truy cập, lượt đăng ký theo thời gian)

## Giai đoạn 5 — Hoàn thiện
- [ ] Swagger đầy đủ cho toàn bộ endpoint
- [ ] Test e2e cho các luồng chính (auth, consultations, analytics)
- [ ] Rate limiting cơ bản (`@nestjs/throttler`) cho endpoint public (đặc biệt `/consultations`)
- [ ] Chuẩn bị cấu hình deploy (Docker, biến môi trường production)

> Ghi chú: roadmap sẽ cập nhật theo tiến độ thực tế, có thể bổ sung thêm các hạng mục được nêu trong báo cáo thực tập (gửi email thông báo, phân quyền chi tiết hơn, tối ưu hiệu năng dữ liệu lớn...).
