# 04 — API Spec (khung ban đầu)

> Chi tiết đầy đủ sẽ tự sinh qua Swagger (`/docs`) khi code. Đây là danh sách endpoint dự kiến theo từng module.

## Auth
| Method | Path | Quyền |
|---|---|---|
| POST | `/auth/login` | public |
| POST | `/auth/refresh` | public (kèm refresh token) |
| POST | `/auth/logout` | đã đăng nhập |

## Users
| Method | Path | Quyền |
|---|---|---|
| GET | `/users` | ADMIN |
| POST | `/users` | ADMIN |
| PATCH | `/users/:id` | ADMIN |
| DELETE | `/users/:id` | ADMIN |

## Services / Products / Projects / Posts (cấu trúc giống nhau)
| Method | Path | Quyền |
|---|---|---|
| GET | `/{resource}` | public |
| GET | `/{resource}/:slug` | public |
| POST | `/{resource}` | ADMIN/STAFF |
| PATCH | `/{resource}/:id` | ADMIN/STAFF |
| DELETE | `/{resource}/:id` | ADMIN |

`{resource}` ∈ `services`, `products`, `projects`, `posts`.

## Consultations
| Method | Path | Quyền |
|---|---|---|
| POST | `/consultations` | public (khách hàng gửi đăng ký) |
| GET | `/consultations` | ADMIN/STAFF |
| PATCH | `/consultations/:id` | ADMIN/STAFF (cập nhật trạng thái xử lý) |
| DELETE | `/consultations/:id` | ADMIN |

## Media
| Method | Path | Quyền |
|---|---|---|
| POST | `/media/upload` | ADMIN/STAFF |
| DELETE | `/media/:id` | ADMIN/STAFF |

## Analytics
| Method | Path | Quyền |
|---|---|---|
| GET | `/analytics/overview` | ADMIN/STAFF |
| GET | `/analytics/visits?from=&to=&groupBy=` | ADMIN/STAFF |

## Health
| Method | Path | Quyền |
|---|---|---|
| GET | `/health` | public |
