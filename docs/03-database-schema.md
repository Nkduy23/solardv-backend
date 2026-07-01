# 03 — Database Schema (khung ban đầu)

Định nghĩa đầy đủ nằm tại [`prisma/schema.prisma`](../prisma/schema.prisma). Tóm tắt:

| Model | Mô tả | Trường đáng chú ý |
|---|---|---|
| `User` | Tài khoản nội bộ (Admin/Staff) | `email`, `password` (hash), `role` |
| `Service` | Dịch vụ/giải pháp điện mặt trời | `title`, `slug`, `content`, `isPublished` |
| `Product` | Sản phẩm trưng bày | `name`, `slug`, `images[]`, `category` |
| `Project` | Công trình/dự án đã triển khai | `title`, `location`, `images[]`, `completedAt` |
| `Post` | Tin tức/bài viết | `title`, `slug`, `content`, `publishedAt` |
| `Consultation` | Đăng ký tư vấn của khách hàng | `fullName`, `phone`, `email`, `status` |
| `VisitStat` | Số liệu lượt truy cập theo ngày (đã tổng hợp từ Redis) | `date`, `pageViews`, `visitors` |

## Quan hệ dự kiến mở rộng (chưa code)

- `Project` có thể liên kết nhiều ảnh chi tiết hơn qua bảng `Media` riêng (hiện đang dùng mảng `images[]` đơn giản cho giai đoạn đầu).
- `Consultation` có thể thêm liên kết tới `Service`/`Product` quan tâm nếu cần phân tích nhu cầu khách hàng kỹ hơn.
- `User` có thể mở rộng thêm bảng `RefreshToken` riêng nếu cần thu hồi token theo từng phiên đăng nhập.

## Migration

```bash
npm run prisma:migrate   # tạo & áp dụng migration trong môi trường dev
npm run prisma:studio    # xem dữ liệu trực quan
```
