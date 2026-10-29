# 🎙️ Hệ thống Hỗ trợ Luyện Hội thoại Tiếng Anh Nhập vai theo Ngữ cảnh Tích hợp Trợ lý AI

> **Môn học:** Nhập môn Công nghệ Phần mềm — ĐH Khoa học Tự nhiên, ĐHQG TP.HCM  
> **GVHD:** ThS. Ngô Ngọc Đăng Khoa  
> **Học kỳ 1 – Năm học 2026-2027**

---

## 📋 Giới thiệu

Ứng dụng Web cho phép sinh viên luyện hội thoại tiếng Anh nhập vai theo từng tình huống thực tế (gọi món, phỏng vấn thực tập, ...) thông qua trợ lý AI. Hệ thống hỗ trợ ghi âm theo lượt, chuyển giọng nói thành văn bản, tạo phản hồi AI theo ngữ cảnh, gợi ý cách diễn đạt tự nhiên hơn (Better Phrasing) và báo cáo tiến bộ học tập.

---

## 🏛️ Kiến trúc hệ thống (3-Tier Architecture)

| Tầng | Công nghệ |
| :--- | :--- |
| **Giao diện (Presentation)** | Next.js (React) + Tailwind CSS + Framer Motion, MediaRecorder (thu âm), Web Speech API (phát âm) |
| **Nghiệp vụ (Application)** | Python FastAPI — xử lý yêu cầu, phân quyền, tích hợp AI |
| **AI Engine** | Groq Whisper API (STT ~0.2s) + Google Gemini API (phản hồi 3-trong-1: đối đáp + sửa lỗi + gợi ý) |
| **Dữ liệu (Data)** | PostgreSQL 16 (pgvector) — chỉ lưu văn bản & chỉ số học tập, không lưu file âm thanh |

---

## 📂 Cấu trúc Repository

```text
ai-english-conversation-system/
├── frontend/              # Ứng dụng Next.js (React, Tailwind CSS, VAD, Framer Motion)
├── core_backend/          # Máy chủ FastAPI + kết nối PostgreSQL
│   └── app/
│       ├── api/v1/        # REST API endpoints (/chat, /scenarios)
│       ├── core/          # Config, PostgreSQL session factory
│       ├── models/        # SQLAlchemy ORM (User, Scenario, Vocabulary, Session, Turn)
│       └── schemas/       # Pydantic v2 request/response schemas
├── ai_engine/             # Dịch vụ AI: Groq Whisper STT & Gemini 3-in-1 batching
│   ├── services/          # groq_service.py, gemini_service.py
│   └── prompts/           # System prompt templates cho từng kịch bản
├── docker-compose.yml     # Khởi động PostgreSQL 16 (pgvector) + Adminer Web UI
├── run_services.bat       # Khởi động tất cả services 1 lệnh (Windows)
├── CONTRIBUTING.md        # Quy ước commit, branching, phân công thành viên
└── README.md
```

> **Lưu ý:** Thư mục `docs/` (tài liệu nộp bài) được lưu cục bộ và **không được push lên GitHub** (đã thêm vào `.gitignore`).

---

## ⚡ Hướng dẫn cài đặt & Khởi chạy

### 1. Khởi động PostgreSQL (Docker)
```bash
docker compose up -d
```
- **PostgreSQL** tại port `5432` (user: `postgres`, pass: `postgrespassword`, db: `vocabtalk`)
- **Adminer UI** tại `http://localhost:8080` — xem dữ liệu trực quan trên trình duyệt

### 2. Chạy Backend (FastAPI)
```bash
cd core_backend

python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS / Linux

pip install -r requirements.txt
copy .env.example .env        # Điền GROQ_API_KEY và GEMINI_API_KEY vào file .env

python main.py
```
- API: `http://localhost:8000`
- Swagger Docs: `http://localhost:8000/docs`

### 3. Chạy Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
- Giao diện: `http://localhost:3000`

### ⚡ Hoặc khởi động tất cả cùng lúc (Windows)
```bash
run_services.bat
```

---

## 👥 Thành viên nhóm

| MSSV | Họ và tên | Vai trò | Module phụ trách chính |
| :---: | :--- | :--- | :--- |
| **24120467** | Phạm Đức Toàn | **Backend Developer / Lead** | `core_backend` + `ai_engine` — tích hợp Groq Whisper, Gemini, xử lý lỗi API, Better Phrasing (US04). Quản lý repo & tích hợp hệ thống |
| **19120501** | Nguyễn Nhật Hảo | **Scrum Master** | Auth & phân quyền (US01), Admin Portal (US06), triển khai (deploy, HTTPS, biến môi trường) |
| **24120263** | Đỗ Ngọc Gia Bảo | **Product Owner** | Thư viện kịch bản & từ vựng (US02, US03), nội dung hội thoại mẫu, kiểm thử nghiệm thu |
| **19120627** | Hồ Minh Quân | **Frontend Developer** | `frontend` — giao diện phòng luyện thoại, MediaRecorder, phụ đề, báo cáo & lịch sử (US05) |

---

## 📌 Các chức năng chính (User Stories)

| Mã | Mô tả |
| :--- | :--- |
| **US01** | Đăng ký, đăng nhập, quản lý thông tin cá nhân và phân quyền học viên / quản trị viên |
| **US02** | Duyệt và chọn kịch bản giao tiếp theo chủ đề (đời sống, nghề nghiệp) |
| **US03** | Tra cứu từ vựng, phiên âm IPA và câu ví dụ gắn với từng tình huống |
| **US04** | Luyện hội thoại giọng nói với AI: ghi âm → STT → phản hồi AI → Better Phrasing → gợi ý câu |
| **US05** | Xem báo cáo phiên học: thời lượng, số lượt, mục tiêu đạt được, câu đã được sửa |
| **US06** | Quản trị viên thêm / sửa / xóa kịch bản và bộ từ vựng |
