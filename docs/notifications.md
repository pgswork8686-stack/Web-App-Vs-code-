# Cấu trúc Thông báo - PGS Hub Notifications

Tài liệu mô tả nền tảng hệ thống thông báo (Notification Foundation).

## 1. Thành phần Dữ liệu thông báo
Hệ thống thông báo chia tách làm hai phần:
- **`notifications`**: Chứa nội dung tĩnh của thông báo (tiêu đề, nội dung, loại sự kiện `event_type`, liên kết chuyển hướng `action_url`).
- **`notification_recipients`**: Lưu trạng thái nhận thông báo của từng cá nhân (đã đọc `read_at`, đã xử lý `handled_at`, đã lưu trữ `archived_at`).

## 2. Các kênh phân phối (Notification Channels)
Hệ thống hỗ trợ cấu hình hai kênh:
1. **In-App**: Hiển thị trên Notification Bell của App Shell và trang thông báo cá nhân.
2. **Email**: Hỗ trợ tích hợp qua interface `EmailNotificationProvider` (phiên bản MVP sử dụng placeholder adapter).

## 3. Cấu hình Nhận thông báo (Preferences)
Người dùng có thể bật/tắt nhận thông báo cho từng loại sự kiện cụ thể bằng cách cập nhật danh mục `notification_preferences` thông qua trang cài đặt cá nhân `/settings/notifications`.
