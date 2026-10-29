# Đặc Tả Cơ Sở Dữ Liệu PostgreSQL (Database Schema Specification)

Tài liệu này mô tả chi tiết lược đồ cơ sở dữ liệu quan hệ của hệ thống **VocabTalk**, cài đặt trên **PostgreSQL 16**.

---

## 1. Thông số kết nối & Môi trường

| Thuộc tính | Giá trị cấu hình | Ghi chú |
| :--- | :--- | :--- |
| **Hệ quản trị CSDL** | PostgreSQL 16.x | Quản lý qua Docker Compose |
| **Database Host** | `localhost` | Container name: `vocabtalk_postgres` |
| **Database Port** | `5432` | Mapping `5432:5432` ra máy chủ |
| **Database Name** | `vocabtalk_db` | Tên CSDL ứng dụng |
| **Database User** | `vocabtalk_user` | Tài khoản có quyền toàn bộ trên db |
| **Database Password** | `vocabtalk_pass` | Mật khẩu mặc định (sửa ở `.env`) |
| **Adminer GUI** | `http://localhost:8080` | Giao diện quản lý trực quan |

---

## 2. Chi tiết các bảng dữ liệu (Tables Specification)

### 2.1. Bảng `users` (Quản lý người dùng)
| Tên cột | Kiểu dữ liệu | Ràng buộc | Diễn giải |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | PK | UUID định danh người dùng |
| `email` | `VARCHAR(255)` | UNIQUE, NOT NULL, INDEX | Email đăng nhập |
| `hashed_password` | `VARCHAR(255)` | NOT NULL | Mật khẩu băm (bcrypt) |
| `full_name` | `VARCHAR(100)` | NULL | Họ và tên hiển thị |
| `role` | `VARCHAR(20)` | DEFAULT `'learner'` | Phân quyền: `learner` hoặc `admin` |
| `level` | `VARCHAR(10)` | DEFAULT `'B1'` | Trình độ CEFR: `A1`, `A2`, `B1`, `B2`, `C1` |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | DEFAULT `NOW()` | Ngày tạo tài khoản |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | DEFAULT `NOW()` | Ngày cập nhật gần nhất |

---

### 2.2. Bảng `scenarios` (Ngân hàng kịch bản hội thoại)
| Tên cột | Kiểu dữ liệu | Ràng buộc | Diễn giải |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | PK | UUID định danh kịch bản |
| `title` | `VARCHAR(150)` | NOT NULL | Tên kịch bản (VD: "Ordering Coffee at Starbucks") |
| `description` | `TEXT` | NOT NULL | Mô tả bối cảnh và mục tiêu hội thoại |
| `category` | `VARCHAR(50)` | NOT NULL, INDEX | Thể loại: `daily_life`, `business`, `travel`, `interview` |
| `difficulty_level` | `VARCHAR(10)` | NOT NULL | Độ khó theo CEFR (`A1` -> `C1`) |
| `initial_prompt` | `TEXT` | NOT NULL | Câu chào mở đầu hoặc bối cảnh cho AI |
| `ai_role` | `VARCHAR(100)` | NOT NULL | Vai của AI (VD: "Barista", "Hiring Manager") |
| `user_role` | `VARCHAR(100)` | NOT NULL | Vai của người dùng (VD: "Customer", "Job Applicant") |
| `is_active` | `BOOLEAN` | DEFAULT `TRUE` | Trạng thái hiển thị kịch bản |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | DEFAULT `NOW()` | Ngày tạo |

---

### 2.3. Bảng `vocabularies` (Từ vựng mục tiêu theo kịch bản)
| Tên cột | Kiểu dữ liệu | Ràng buộc | Diễn giải |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | PK | UUID định danh từ vựng |
| `scenario_id` | `VARCHAR(36)` | FK -> `scenarios.id`, INDEX | Kịch bản gắn liền |
| `word` | `VARCHAR(100)` | NOT NULL | Từ vựng hoặc cụm từ (VD: "cappuccino", "decaf") |
| `phonetic` | `VARCHAR(100)` | NULL | Phiên âm quốc tế IPA (VD: `/ˌkæp.əˈtʃiː.nəʊ/`) |
| `part_of_speech` | `VARCHAR(30)` | NULL | Từ loại (noun, verb, adjective,...) |
| `definition_vi` | `TEXT` | NOT NULL | Định nghĩa và giải nghĩa tiếng Việt |
| `example_en` | `TEXT` | NOT NULL | Câu ví dụ mẫu tiếng Anh |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | DEFAULT `NOW()` | Ngày tạo |

---

### 2.4. Bảng `session_histories` (Lịch sử các phiên luyện nói)
| Tên cột | Kiểu dữ liệu | Ràng buộc | Diễn giải |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | PK | UUID định danh phiên học |
| `user_id` | `VARCHAR(36)` | FK -> `users.id`, INDEX | Người dùng thực hiện |
| `scenario_id` | `VARCHAR(36)` | FK -> `scenarios.id`, INDEX | Kịch bản đã chọn |
| `status` | `VARCHAR(20)` | DEFAULT `'in_progress'` | Trạng thái: `in_progress`, `completed`, `abandoned` |
| `total_turns` | `INTEGER` | DEFAULT `0` | Tổng số lượt hội thoại trong phiên |
| `vocabulary_score` | `FLOAT` | NULL | Điểm sử dụng từ vựng (thang 100) |
| `grammar_score` | `FLOAT` | NULL | Điểm chuẩn xác ngữ pháp (thang 100) |
| `fluency_score` | `FLOAT` | NULL | Điểm độ trôi chảy & thời gian phản hồi (thang 100) |
| `overall_feedback` | `TEXT` | NULL | Nhận xét tổng kết chi tiết từ AI |
| `started_at` | `TIMESTAMP WITH TIME ZONE` | DEFAULT `NOW()` | Thời điểm bắt đầu |
| `completed_at` | `TIMESTAMP WITH TIME ZONE` | NULL | Thời điểm hoàn thành |

---

### 2.5. Bảng `turn_histories` (Lịch sử từng lượt thoại chi tiết)
| Tên cột | Kiểu dữ liệu | Ràng buộc | Diễn giải |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | PK | UUID định danh lượt thoại |
| `session_id` | `VARCHAR(36)` | FK -> `session_histories.id`, INDEX | Thuộc về phiên học nào |
| `turn_index` | `INTEGER` | NOT NULL | Thứ tự lượt (1, 2, 3...) |
| `user_transcript` | `TEXT` | NOT NULL | Đoạn text STT nhận diện từ giọng nói |
| `ai_response_text` | `TEXT` | NOT NULL | Câu phản hồi tiếp thoại của AI |
| `grammar_corrections` | `JSONB` | DEFAULT `'[]'` | Danh sách lỗi ngữ pháp và cách sửa |
| `better_phrasings` | `JSONB` | DEFAULT `'[]'` | Gợi ý cách diễn đạt tự nhiên hơn |
| `vocabularies_hit` | `JSONB` | DEFAULT `'[]'` | Các từ vựng mục tiêu đã áp dụng thành công |
| `latency_ms` | `INTEGER` | NULL | Tổng độ trễ xử lý của lượt thoại (mili giây) |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | DEFAULT `NOW()` | Thời điểm diễn ra |

---

## 3. Khởi tạo & Dữ liệu mẫu (Auto Seeding)
- Khi khởi động backend lần đầu qua `main.py`, hệ thống tự động kiểm tra và tạo bảng qua SQLAlchemy `Base.metadata.create_all(bind=engine)`.
- Tự động nạp sẵn 3 kịch bản mẫu:
  1. *Ordering Coffee at a Cafe* (A2 - Giao tiếp cơ bản)
  2. *Job Interview for Software Engineer* (B2 - Phỏng vấn xin việc)
  3. *Checking in at the Airport* (B1 - Du lịch sân bay)
