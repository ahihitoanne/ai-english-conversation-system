# Danh Mục Công Nghệ & Lý Do Lựa Chọn (Tech Stack & Rationale)

Tài liệu này tổng hợp toàn bộ công nghệ được sử dụng trong hệ thống **VocabTalk** cùng với lý do kỹ thuật chi tiết cho từng lựa chọn.

---

## 1. Bảng phân loại công nghệ tổng thể

| Tầng hệ thống | Công nghệ / Thư viện | Phiên bản | Mục đích sử dụng |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | **Next.js** (App Router) | `14.x` | Giao diện SSR/CSR tối ưu SEO, routing hiện đại, giao diện mượt mà |
| **Ngôn ngữ Frontend** | **TypeScript** | `5.x` | Kiểm soát chặt chẽ kiểu dữ liệu, giảm thiểu lỗi runtime |
| **Styling & Animation** | **Tailwind CSS + Framer Motion** | `3.4+` / `11+` | Xây dựng giao diện nhanh, hiệu ứng âm thanh và phụ đề mượt mà |
| **Voice Processing** | **Web Audio API + VAD** | `@ricky0123/vad-web` | Thu âm và tự động cắt lát âm thanh khi người dùng ngưng nói |
| **Backend Framework** | **FastAPI** | `0.110+` | REST API bất đồng bộ (async/await), hiệu năng cao, tự sinh Swagger docs |
| **Ngôn ngữ Backend** | **Python** | `3.10+` | Hệ sinh thái AI/NLP mạnh mẽ, cú pháp ngắn gọn, xử lý chuỗi nhanh |
| **ORM & Data Mapping** | **SQLAlchemy + Pydantic v2** | `2.0+` / `2.6+` | Ánh xạ đối tượng CSDL an toàn, validate dữ liệu request/response |
| **Cơ sở dữ liệu** | **PostgreSQL** | `16.x` | Hệ quản trị CSDL quan hệ chuẩn công nghiệp, ACID, JSONB hỗ trợ linh hoạt |
| **Database UI Tool** | **Adminer** | `4.8+` | Giao diện web quản lý CSDL trực quan, dung lượng nhẹ chạy qua Docker |
| **AI Speech-to-Text** | **Groq Whisper-large-v3** | Cloud API | Chuyển âm thanh thành văn bản với độ trễ siêu tốc (~0.2 giây) |
| **AI Language Model** | **Google Gemini 1.5 Flash** | Cloud API | Suy luận ngữ cảnh, phản hồi đối thoại, sửa ngữ pháp và Better Phrasing |
| **Container hóa** | **Docker & Docker Compose** | `24+` | Đóng gói môi trường đồng nhất giữa các máy thành viên |

---

## 2. Lý do lựa chọn & Phân tích so sánh (Rationale)

### 2.1. Tại sao chọn PostgreSQL thay vì SQLite?
- **Độ tin cậy & Đa truy cập:** SQLite bị khóa bảng (file lock) khi có nhiều kết nối ghi đồng thời, không phù hợp khi nhiều người dùng cùng luyện nói. PostgreSQL hỗ trợ kết nối đồng thời cao qua connection pool.
- **Khả năng mở rộng:** PostgreSQL hỗ trợ kiểu dữ liệu `JSONB` giúp lưu trữ linh hoạt các cấu trúc phức tạp như mảng phân tích ngữ pháp (`grammar_corrections`) và lịch sử gợi ý (`better_phrasings`) mà vẫn đánh chỉ mục (index) được.
- **Sẵn sàng cho môi trường thực tế (Production-ready):** Dễ dàng triển khai lên AWS RDS, Supabase, Neon hoặc Render khi cần public sản phẩm.

### 2.2. Tại sao chọn Groq Whisper thay vì OpenAI Whisper thông thường?
- OpenAI Whisper API thường mất từ **1.5s - 3s** để trả về text của một đoạn audio 5 giây.
- **Groq LPU (Language Processing Unit)** xử lý mô hình `whisper-large-v3` chỉ mất **150ms - 250ms** (nhanh gấp ~10 lần). Điều này quyết định trực tiếp tới trải nghiệm hội thoại tự nhiên theo thời gian thực.

### 2.3. Tại sao chọn Gemini 1.5 Flash?
- **Tốc độ xử lý (Time to First Token - TTFT) cực nhanh:** Thích hợp cho tương tác thoại liên tục.
- **Cửa sổ ngữ cảnh (Context Window) lớn:** Dễ dàng nhồi toàn bộ lịch sử 10-15 lượt thoại trước đó cùng kịch bản chi tiết mà không lo tràn bộ nhớ.
- **Chi phí tối ưu:** Chi phí trên mỗi triệu token thấp hơn đáng kể so với GPT-4o, đồng thời hỗ trợ JSON Mode nghiêm ngặt.

### 2.4. Tại sao cấu trúc Monorepo?
- Toàn bộ đồ án (AI Engine, Core Backend, Frontend, Docs) nằm trong 1 Git repository duy nhất giúp nhóm dễ phối hợp, đồng bộ phiên bản schemas và kiểm soát tiến độ qua các Pull Request thống nhất.
