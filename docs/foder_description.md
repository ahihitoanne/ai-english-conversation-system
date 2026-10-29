# Mô Tả Cấu Trúc Thư Mục (Folder Description)

Tài liệu này giải thích chi tiết cấu trúc Monorepo của dự án **VocabTalk**, phân định trách nhiệm từng thư mục và vai trò của từng thành viên.

---

## 1. Cây thư mục tổng quan

```
ai-english-conversation-system/
├── ai_engine/                  # [Module AI] Dịch vụ Speech-to-Text & LLM Engine
│   ├── prompts/                # Prompt templates cho từng tác vụ AI
│   │   └── chat_system.txt     # System prompt 3-trong-1 (tiếp thoại + sửa lỗi + phrasing)
│   ├── services/               # Mã nguồn tích hợp AI API
│   │   ├── groq_service.py     # Groq Whisper-large-v3 Speech-to-Text service
│   │   └── gemini_service.py   # Google Gemini 1.5 Flash batching reasoning service
│   ├── .env.example            # Mẫu biến môi trường cho AI (GROQ_API_KEY, GEMINI_API_KEY)
│   └── requirements.txt        # Thư viện Python riêng cho AI
│
├── core_backend/               # [Module Backend] REST API Server & Cơ sở dữ liệu
│   ├── app/                    # Mã nguồn ứng dụng FastAPI
│   │   ├── api/v1/endpoints/   # Các API endpoints (/chat, /scenarios, /auth,...)
│   │   ├── core/               # Cấu hình hệ thống (config, postgres database engine)
│   │   ├── models/             # SQLAlchemy ORM Models (User, Scenario, Session, Turn)
│   │   ├── schemas/            # Pydantic v2 validation schemas
│   │   └── main.py             # Khởi tạo FastAPI app, middleware & CORS
│   ├── Dockerfile              # Dockerfile chạy FastAPI backend
│   ├── requirements.txt        # Thư viện Python cho backend (FastAPI, SQLAlchemy, psycopg2,...)
│   └── .env.example            # Mẫu biến môi trường cho backend & database
│
├── frontend/                   # [Module Frontend] Giao diện người dùng Web App
│   ├── src/                    # Mã nguồn Next.js 14+ (App Router)
│   │   ├── app/                # Trang web (Dashboard, Voice Room, History, Report)
│   │   ├── components/         # UI components tái sử dụng (AudioRecorder, SubtitleBox,...)
│   │   ├── hooks/              # Custom hooks (useAudioRecorder, useVAD, useSocket)
│   │   └── lib/                # Utility functions & API clients
│   ├── .env.example            # Mẫu biến môi trường frontend (NEXT_PUBLIC_API_URL)
│   └── package.json            # Thư viện Node.js (Tailwind, Framer Motion, Lucide,...)
│
├── docs/                       # [Module Tài Liệu] Tài liệu kỹ thuật, sơ đồ, báo cáo
│   ├── ERD/                    # Sơ đồ thiết kế cơ sở dữ liệu quan hệ
│   ├── Kiến trúc/              # Sơ đồ kiến trúc hệ thống và luồng dữ liệu
│   ├── Sequence/               # Sơ đồ tuần tự các ca sử dụng (Use Cases)
│   ├── slide-final/            # Slide trình bày đồ án cuối kỳ
│   ├── AI-ENGINE_API_DOCS.md   # Đặc tả kỹ thuật và API của AI Engine
│   ├── ARCHITECTURE.md         # Tài liệu kiến trúc toàn diện
│   ├── BE_API_DOCS.md          # Đặc tả REST API cho Core Backend
│   ├── DATABASE.md             # Đặc tả chi tiết cơ sở dữ liệu PostgreSQL
│   ├── PIPELINE.md             # Luồng xử lý âm thanh và dữ liệu thời gian thực
│   ├── TECH_STACK.md           # Lý do và chi tiết công nghệ sử dụng
│   ├── foder_description.md    # Tài liệu cấu trúc thư mục (file này)
│   └── spec_design.md          # Đặc tả yêu cầu phần mềm và thiết kế chi tiết
│
├── docker-compose.yml          # Quản lý Docker cho PostgreSQL 16 và Adminer
├── run_services.bat            # Script 1-click khởi động toàn bộ hệ thống trên Windows
├── CONTRIBUTING.md             # Quy tắc phối hợp Git, chia nhánh, commit chuẩn
├── README.md                   # Giới thiệu dự án, hướng dẫn cài đặt và chạy thử
└── .gitignore                  # Cấu hình loại trừ file rác, env và file nộp bài bí mật
```

---

## 2. Phân công sở hữu module (Code Ownership)

| Thư mục | Thành viên phụ trách | Nhiệm vụ chính |
| :--- | :--- | :--- |
| `core_backend/` | **Phạm Đức Toàn**, **Nguyễn Nhật Hảo** | FastAPI, PostgreSQL, Authentication, CRUD Scenarios |
| `ai_engine/` | **Phạm Đức Toàn** | Groq Whisper STT, Gemini LLM Batching, Error Fallback |
| `frontend/` | **Hồ Minh Quân** | Next.js, MediaRecorder, VAD, Animation, Subtitle UI |
| `docs/` | **Đỗ Ngọc Gia Bảo**, Cả nhóm | Nội dung kịch bản, ngân hàng từ vựng, tài liệu & sơ đồ |
