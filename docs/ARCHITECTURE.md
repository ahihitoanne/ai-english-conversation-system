# Kiến Trúc Hệ Thống (System Architecture Document)

Tài liệu này trình bày thiết kế kiến trúc kỹ thuật toàn diện của hệ thống luyện đàm thoại tiếng Anh AI — **VocabTalk**.

---

## 1. Tổng quan Kiến trúc (High-Level Overview)

VocabTalk được thiết kế theo mô hình **Monorepo đa tầng (Multi-tier Monorepo)**, tối ưu cho bài toán đàm thoại tương tác với độ trễ thấp (Low-Latency Voice Interaction):

```
+-------------------------------------------------------------------+
|                        Client Layer (Frontend)                   |
|  - Next.js 14+ (App Router), Tailwind CSS, Framer Motion         |
|  - Web Audio API + Voice Activity Detection (VAD)                 |
+---------------------------------+---------------------------------+
                                  | HTTP / WebSocket / FormData
                                  v
+-------------------------------------------------------------------+
|                     API Gateway / Core Backend                    |
|  - FastAPI (Python 3.10+)                                         |
|  - REST Endpoints (/chat, /scenarios, /auth, /analytics)          |
|  - Session State & History Persistence                            |
+-------------------+-----------------------------+-----------------+
                    |                             |
                    v                             v
+-----------------------------+     +-------------------------------+
|       AI Engine Tier        |     |       Data Persistence        |
| - Groq Cloud (Whisper STT)  |     | - PostgreSQL 16               |
| - Google Gemini 1.5 Flash   |     | - SQLAlchemy ORM              |
| - 3-in-1 Batching Prompt    |     | - Adminer Database GUI        |
+-----------------------------+     +-------------------------------+
```

---

## 2. Chi tiết các tầng thành phần

### 2.1. Client Layer (`frontend/`)
- **Nhiệm vụ:** Thu âm giọng nói, nhận diện điểm bắt đầu và kết thúc câu (VAD), hiển thị kịch bản, phụ đề song ngữ và biểu đồ phân tích kỹ năng sau buổi tập.
- **Tối ưu độ trễ:** Sử dụng Client-side VAD (Voice Activity Detection) để tự động nhận biết khi người dùng dứt lời, ngay lập tức gửi audio buffer lên Backend mà không cần người dùng thao tác bấm nút thủ công.

### 2.2. Core Backend Tier (`core_backend/`)
- **Nhiệm vụ:** Quản lý vòng đời phiên học (Session Lifecycle), điều phối luồng dữ liệu, xác thực người dùng, lưu trữ lịch sử lượt thoại và đánh giá tiến độ học tập.
- **Kiến trúc luồng xử lý:** 
  1. Tiếp nhận file âm thanh (`.wav` / `.webm` / `.mp3`).
  2. Ủy quyền cho `ai_engine` xử lý STT và phân tích LLM.
  3. Lưu `TurnHistory` vào PostgreSQL trong transaction an toàn.
  4. Trả kết quả JSON về cho Frontend theo chuẩn Pydantic schema.

### 2.3. AI Engine Tier (`ai_engine/`)
- **Speech-to-Text (STT):** Sử dụng **Groq Cloud Whisper-large-v3** cho tốc độ chuyển ngữ tức thì (~200ms), giải quyết triệt để nút thắt cổ chai về độ trễ của các model STT truyền thống.
- **Kỹ thuật Prompt Batching 3-trong-1:** Thay vì gọi 3 lần API (1 lần tạo câu thoại, 1 lần sửa ngữ pháp, 1 lần gợi ý Better Phrasing), hệ thống gộp chung vào 1 prompt có định dạng JSON schema ép buộc:
  - Giảm chi phí token đến 60%.
  - Giảm thời gian chờ đợi phản hồi từ ~4s xuống dưới 1s.

### 2.4. Data Layer (`PostgreSQL 16`)
- Lưu trữ quan hệ thực thể chặt chẽ: Tài khoản, Ngân hàng kịch bản theo CEFR (A1-C1), Danh mục từ vựng trọng tâm, Lịch sử buổi học và từng lượt trao đổi.

---

## 3. Chỉ số mục tiêu hiệu năng (Latency & SLA Targets)

| Bước | Thành phần | Thời gian mục tiêu |
| :--- | :--- | :--- |
| 1. Phát hiện dứt lời | Client VAD | ~200 - 300 ms |
| 2. Speech-to-Text | Groq Whisper | ~150 - 250 ms |
| 3. Xử lý Logic & LLM | Gemini 1.5 Flash (3-in-1) | ~600 - 900 ms |
| 4. Lưu DB & Trả kết quả | Core Backend | ~50 ms |
| **Tổng cộng (End-to-End)** | **Client -> AI -> Client** | **~1.2s - 1.5s** (Đạt chuẩn đàm thoại tự nhiên) |

---

## 4. Sơ đồ kiến trúc đính kèm
- Bản vẽ trực quan: [`docs/Kiến trúc/architecture_diagram.png`](Kiến%20trúc/architecture_diagram.png)
- Sơ đồ tương tác tuần tự: xem tại [`docs/Sequence/README.md`](Sequence/README.md)
