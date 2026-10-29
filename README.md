# 🎙️ VocabTalk — AI Hands-free Voice English Practice System

> **Môn học:** Nhập môn Công nghệ Phần mềm (CSC13002) — ĐH Khoa học Tự nhiên (HCMUS)  
> **Nhóm thực hiện:** STTNhom (19120501 - 19120627 - 24120263 - 24120467)  
> **Định vị sản phẩm:** Luyện giao tiếp tiếng Anh nhập vai đàm thoại hai chiều rảnh tay bằng giọng nói với Trợ lý AI.

---

## 🏛️ Kiến trúc hệ thống (3-Tier Architecture)

![Kiến trúc VocabTalk](docs/architecture_diagram.png)

1. **Tầng Giao diện (Presentation Layer):**
   * **Framework:** Next.js (React Server Components) + Tailwind CSS + Framer Motion.
   * **Audio & Voice:** Thư viện `@ricky0123/vad-web` phát hiện khoảng lặng (Client-side VAD 600ms–800ms) + Web Speech API (TTS).
2. **Tầng Nghiệp vụ (Application Layer):**
   * **Framework:** Python FastAPI (REST API, OpenAPI/Swagger docs tự động).
   * **AI Connectors:**
     * **Groq Whisper API:** STT siêu tốc (~0.2s latency) với độ chính xác >95%.
     * **Google Gemini API:** Xử lý hội thoại thông minh, gộp Prompt 3-trong-1 (trả về lời đáp + Better Phrasing sửa lỗi + gợi ý câu trả lời nhanh).
3. **Tầng Dữ liệu (Data Layer):**
   * **Cơ sở dữ liệu:** **PostgreSQL 16** tích hợp extension `pgvector`.
   * **ORM:** SQLAlchemy 2.0.
   * **Tiêu chí:** Text-only storage (chỉ lưu phụ đề và lịch sử hội thoại, không lưu file âm thanh $\rightarrow$ chi phí 0 VNĐ, bảo mật tuyệt đối).

---

## 📂 Cấu trúc Repository (Monorepo)

```text
VocabTalk/
├── docs/                                  # Toàn bộ tài liệu chính thức đã nộp
│   ├── STTNhom-19120501-19120627...zip    # File nén nộp bài
│   ├── ProjectProposal.md                 # Đề xuất đồ án chi tiết
│   ├── PROJECT_SPEC_VOCABTALK.md          # Đặc tả 5 tính năng cốt lõi (F01–F05)
│   ├── GHI_CHU_KIEN_TRUC_VOCABTALK.md     # Sổ tay kiến trúc, giải pháp kỹ thuật
│   └── architecture_diagram.png           # Sơ đồ kiến trúc 3 tầng
├── backend/                               # Máy chủ FastAPI + PostgreSQL
│   ├── app/
│   │   ├── api/v1/                        # Router endpoints (/chat, /scenarios)
│   │   ├── core/                          # Config, PostgreSQL connection & session
│   │   ├── models/                        # SQLAlchemy Models (User, Scenario, Session)
│   │   ├── schemas/                       # Pydantic Schemas
│   │   └── services/                      # Groq Whisper STT & Gemini LLM
│   ├── requirements.txt
│   ├── .env.example
│   ├── Dockerfile
│   └── main.py
├── frontend/                              # Ứng dụng Next.js
│   ├── .env.example
│   └── README.md
├── docker-compose.yml                     # Chạy PostgreSQL (pgvector) & Adminer
├── .gitignore
└── README.md
```

---

## ⚡ Hướng dẫn cài đặt & Khởi chạy (Local Development)

### 1. Khởi động Cơ sở dữ liệu PostgreSQL (Khuyên dùng Docker)
Chỉ cần chạy lệnh sau tại thư mục gốc:
```bash
docker compose up -d
```
* **PostgreSQL:** Chạy tại port `5432` (`user: postgres`, `password: postgrespassword`, `database: vocabtalk`).
* **Adminer (Xem DB trên Web):** Truy cập `http://localhost:8080` (Hệ thống: `PostgreSQL`, Máy chủ: `db`, Tài khoản: `postgres`, Mật khẩu: `postgrespassword`, CSDL: `vocabtalk`).

*(Nếu không dùng Docker, bạn có thể tạo database trên [Supabase](https://supabase.com/) hoặc [Neon](https://neon.tech/) rồi dán connection string vào `backend/.env`).*

---

### 2. Cài đặt & Chạy Backend (FastAPI)
```bash
cd backend

# 1. Tạo môi trường ảo Python
python -m venv .venv
# Trên Windows:
.venv\Scripts\activate
# Trên macOS/Linux:
source .venv/bin/activate

# 2. Cài đặt thư viện
pip install -r requirements.txt

# 3. Tạo file cấu hình môi trường
copy .env.example .env    # Trên Windows
# cp .env.example .env     # Trên Linux/macOS

# 4. Khởi động Backend
python main.py
```
* Backend API: `http://localhost:8000`
* Swagger API Documentation: `http://localhost:8000/docs`

---

### 3. Cài đặt & Chạy Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
* Giao diện Web: `http://localhost:3000`

---

## 👥 Phân công thành viên nhóm

| MSSV | Họ và tên | Vai trò chính |
| :--- | :--- | :--- |
| **19120501** | Bùi Minh Nhật | Project Manager / Fullstack Lead |
| **24120263** | Nguyễn Quốc Hưng | Backend Developer (Database, API, CMS) |
| **24120467** | Nguyễn Hoàng Phát | AI & Voice Engineer (Groq Whisper, Gemini Prompt) |
| **19120627** | Hồ Minh Quân | Frontend Developer (Next.js, Web VAD, Audio UI) |
