# 01 — Tổng quan dự án

## Bối cảnh

Backend phục vụ website giới thiệu & đăng ký tư vấn dịch vụ điện năng lượng mặt trời của Công ty TNHH Đức Vinh Việt Nam (dự án SolarDV). Hệ thống **không** có chức năng mua bán/thanh toán — trọng tâm là quản lý nội dung giới thiệu và quản lý hiệu suất/lượt truy cập website.

## Domain chính

1. **Auth & Users** — tài khoản nội bộ (Admin/Staff), đăng nhập bằng JWT.
2. **Services** — các giải pháp/dịch vụ điện năng lượng mặt trời công ty cung cấp.
3. **Products** — sản phẩm trưng bày trên website.
4. **Projects** — công trình/dự án đã triển khai (kèm ảnh).
5. **Posts** — tin tức/bài viết.
6. **Consultations** — đăng ký tư vấn từ khách hàng (lead).
7. **Media** — quản lý ảnh upload (sản phẩm, công trình, bàn giao).
8. **Analytics** — theo dõi & thống kê lượt truy cập website cho Admin Dashboard.

## Nguyên tắc thiết kế

- Mỗi domain là một module độc lập, theo chuẩn cấu trúc NestJS (module/controller/service/dto).
- Toàn bộ truy cập dữ liệu qua Prisma, không viết SQL rải rác trong service.
- Tách rõ route public (phục vụ website khách hàng) và route bảo vệ bởi JWT (phục vụ Admin).
- Redis dùng cho 2 mục đích: cache dữ liệu đọc nhiều (services/products) và buffer đếm lượt truy cập realtime trước khi đồng bộ xuống PostgreSQL.

## Ghi chú

Đây là tài liệu kế hoạch ban đầu dựa trên mô tả yêu cầu — sẽ được cập nhật/chi tiết hoá thêm trong quá trình phát triển thực tế.
