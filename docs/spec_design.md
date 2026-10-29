# Đặc Tả Yêu Cầu & Thiết Kế Phần Mềm (Software Specification & Design)

Tài liệu này định nghĩa chi tiết các yêu cầu chức năng (Functional Requirements), yêu cầu phi chức năng (Non-Functional Requirements) và thiết kế ca sử dụng (User Stories) của đồ án **VocabTalk**.

---

## 1. Mục Tiêu Dự Án & Bài Toán Cần Giải Quyết

### 1.1. Thực trạng & Nỗi đau của người học
- **Rào cản tâm lý:** Người học tiếng Anh tại Việt Nam thường ngại ngùng, sợ phát âm sai khi nói chuyện trực tiếp với giáo viên bản xứ.
- **Chi phí đắt đỏ:** Thuê gia sư kèm 1-1 có chi phí cao, khó duy trì luyện tập hàng ngày.
- **Học thụ động:** Học từ vựng theo cách ghi nhớ danh sách rời rạc, không có môi trường ngữ cảnh thực tế để kích hoạt phản xạ áp dụng.

### 1.2. Giải pháp VocabTalk
- Tạo ra người bạn đồng hành AI có thể đàm thoại tự nhiên bằng giọng nói theo ngữ cảnh thực tế (Nhà hàng, Sân bay, Phỏng vấn xin việc).
- Tích hợp phương pháp học từ vựng chủ động: Buộc người dùng ứng dụng các từ vựng mục tiêu vào câu nói và chấm điểm ngay lập tức.
- Phản hồi đa chiều tức thì: Vừa tiếp thoại tự nhiên, vừa sửa lỗi ngữ pháp và gợi ý cách diễn đạt tự nhiên hơn (Better Phrasing).

---

## 2. Các Vai Trò Người Dùng (User Roles)

1. **Người học (Learner):**
   - Đăng ký/đăng nhập tài khoản, thiết lập trình độ CEFR mong muốn (A1 - C1).
   - Chọn kịch bản hội thoại, xem trước từ vựng gợi ý.
   - Trò chuyện với AI bằng giọng nói (Voice-first) hoặc văn bản.
   - Xem báo cáo tiến độ, điểm số từ vựng, ngữ pháp và lịch sử luyện tập.
2. **Quản trị viên (Admin):**
   - Quản lý danh mục kịch bản (Thêm, sửa, đóng/mở kịch bản).
   - Quản lý ngân hàng từ vựng và câu ví dụ mẫu.
   - Giám sát các chỉ số hoạt động của hệ thống.

---

## 3. Đặc Tả Chi Tiết Các Ca Sử Dụng (User Stories - US)

| Mã US | Tên User Story | Mô tả tóm tắt | Tiêu chí nghiệm thu (Acceptance Criteria) |
| :---: | :--- | :--- | :--- |
| **US01** | **Xác thực & Hồ sơ** | Người dùng đăng ký, đăng nhập và chọn trình độ CEFR | - Đăng ký với Email và mật khẩu mã hóa bcrypt.<br>- Nhận JWT Token hợp lệ khi đăng nhập.<br>- Lưu trình độ người học (`A1`, `A2`, `B1`, `B2`, `C1`). |
| **US02** | **Thư viện Kịch bản** | Duyệt và tìm kiếm kịch bản theo độ khó và chủ đề | - Phân loại theo chủ đề: Đời sống, Công việc, Du lịch.<br>- Hiển thị thẻ kịch bản: hình ảnh, độ khó, số từ vựng mục tiêu.<br>- Lọc nhanh kịch bản phù hợp với trình độ người dùng. |
| **US03** | **Khởi động Từ vựng** | Xem trước danh sách từ vựng mục tiêu trước khi vào phòng thoại | - Hiển thị từ vựng kèm phiên âm IPA, từ loại và nghĩa tiếng Việt.<br>- Bấm nghe phát âm mẫu của từ vựng.<br>- Nút "Bắt đầu luyện tập" khởi tạo phiên hội thoại mới. |
| **US04** | **Phòng Đàm Thoại AI** | Luyện nói trực tiếp với AI thời gian thực | - Thu âm giọng nói tự động qua Web Audio API & VAD.<br>- Độ trễ từ khi dứt lời đến khi AI phản hồi <= 1.5s.<br>- Hiển thị phụ đề thời gian thực.<br>- Hiển thị thẻ góp ý ngữ pháp và Better Phrasing trực quan. |
| **US05** | **Báo Cáo Sau Buổi Tập** | Xem thống kê chi tiết hiệu quả buổi luyện nói | - Biểu đồ Radar thể hiện 3 trục: Từ vựng, Ngữ pháp, Độ lưu loát.<br>- Danh sách các từ vựng mục tiêu đã áp dụng thành công.<br>- Nhận xét tổng kết tiến bộ từ AI. |
| **US06** | **Quản Trị Kịch Bản** | Admin quản trị thêm mới và chỉnh sửa kịch bản | - Giao diện tạo kịch bản: Tiêu đề, Bối cảnh, Vai của AI, Vai người học.<br>- Thêm danh sách từ vựng mục tiêu vào kịch bản.<br>- Dữ liệu cập nhật ngay lập tức vào CSDL PostgreSQL. |

---

## 4. Yêu Cầu Phi Chức Năng (Non-Functional Requirements - NFRs)

- **Hiệu năng & Độ trễ (Performance):**
  - Thời gian xử lý toàn trình (End-to-end Latency) cho một lượt thoại giọng nói đạt dưới **1.5 giây**.
  - Tải trang ban đầu (First Contentful Paint) của giao diện web dưới **1.0 giây**.
- **Độ tin cậy (Reliability):**
  - Hệ thống tự động kích hoạt chế độ Fallback Mock nếu API bên thứ 3 (Groq, Gemini) gặp lỗi hoặc cạn hạn ngạch.
- **Bảo mật (Security):**
  - Mọi mật khẩu được băm một chiều bằng thư viện `bcrypt`.
  - API endpoint nhạy cảm được bảo vệ bằng JSON Web Token (JWT).
  - Không commit các thông tin bí mật (API Keys, Database Passwords) lên Git repository.
- **Khả năng tương thích (Compatibility):**
  - Hoạt động mượt mà trên các trình duyệt hiện đại hỗ trợ Web Audio API (Google Chrome, Microsoft Edge, Safari, Firefox).
