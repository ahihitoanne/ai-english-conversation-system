# Sơ đồ Kiến trúc Hệ thống (System Architecture)

Thư mục lưu trữ các bản vẽ thiết kế kiến trúc kỹ thuật của hệ thống **VocabTalk**.

## 1. Thành phần kiến trúc chính
1. **Client Tier**: Next.js 14+ (App Router), Web Audio API, Voice Activity Detection (VAD), Tailwind CSS.
2. **Backend Services Tier**: FastAPI REST API, PostgreSQL database via SQLAlchemy ORM, Alembic migrations.
3. **AI Engine Tier**: 
   - **Groq Cloud**: Whisper-large-v3 (STT siêu tốc độ trễ < 0.2s).
   - **Google Gemini API**: Gemini 1.5 Flash (Xử lý 3-trong-1: Tiếp thoại + Sửa ngữ pháp + Better Phrasing).

## 2. Danh mục tài liệu kiến trúc đính kèm
- `architecture_diagram.png`: Sơ đồ luồng tổng thể từ Client -> Core Backend -> AI Engine -> PostgreSQL.
- Chi tiết đặc tả xem tại [`ARCHITECTURE.md`](../ARCHITECTURE.md).
