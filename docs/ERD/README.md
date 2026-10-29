# Sơ đồ Thực thể Quan hệ (Entity Relationship Diagram - ERD)

Thư mục này lưu trữ các sơ đồ thiết kế cơ sở dữ liệu (ERD) của hệ thống **VocabTalk**.

## 1. Các bảng dữ liệu chính trong hệ thống
- `users`: Quản lý tài khoản, phân quyền (Learner, Admin).
- `scenarios`: Danh mục kịch bản giao tiếp (Nhà hàng, Phỏng vấn, Sân bay,...).
- `vocabularies`: Ngân hàng từ vựng mục tiêu gắn theo từng kịch bản.
- `session_histories`: Lịch sử các phiên luyện thoại (điểm tổng kết, đánh giá CEFR).
- `turn_histories`: Lịch sử từng lượt đối thoại (audio người dùng, transcription, phản hồi của AI, gợi ý Better Phrasing, ngữ pháp).

## 2. Công cụ thiết kế khuyên dùng
- dbdiagram.io / draw.io / PlantUML
- File xuất: `.png`, `.svg` hoặc `.puml`

## 3. Danh sách tài liệu ERD
- [x] Bản nháp mô hình quan hệ (xem chi tiết tại [`DATABASE.md`](../DATABASE.md))
- [ ] File ảnh ERD chi tiết (`erd_diagram.png`)
