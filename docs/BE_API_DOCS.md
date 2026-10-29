# Đặc Tả REST API Backend (Core Backend API Documentation)

Tài liệu này cung cấp danh sách đầy đủ các API endpoints được cung cấp bởi **Core Backend (FastAPI)** trong hệ thống **VocabTalk**.

- **Base URL:** `http://localhost:8000/api/v1`
- **Tài liệu Swagger UI tương tác:** `http://localhost:8000/docs`
- **Định dạng dữ liệu:** `application/json` (trừ endpoint gửi file âm thanh sử dụng `multipart/form-data`).

---

## 1. Nhóm API Đàm Thoại & Phiên Học (Chat & Session APIs)

### 1.1. Gửi Lượt Nói Của Người Dùng (Process Chat Turn)
Thực hiện nhận âm thanh từ người dùng, gọi STT, phân tích LLM 3-trong-1 và lưu lịch sử.

- **Endpoint:** `POST /chat/turn`
- **Content-Type:** `multipart/form-data`
- **Request Parameters / Form Fields:**

| Trường | Kiểu dữ liệu | Bắt buộc | Diễn giải |
| :--- | :--- | :--- | :--- |
| `audio_file` | `UploadFile (binary)` | Không* | File âm thanh giọng nói (`.wav`, `.webm`, `.mp3`) |
| `session_id` | `string (UUID)` | Có | Mã phiên học hiện tại |
| `turn_index` | `integer` | Có | Số thứ tự của lượt thoại (bắt đầu từ 1) |
| `text_input` | `string` | Không* | Nhập chữ trực tiếp nếu người dùng không dùng micro |

*\* Phải cung cấp ít nhất một trong hai: `audio_file` hoặc `text_input`.*

- **Response Payload (200 OK):**
```json
{
  "turn_index": 1,
  "user_transcript": "Good morning. I wants to order a cup of cappuccino please.",
  "ai_response_text": "Good morning! Certainly, would you like regular milk or oat milk with your cappuccino?",
  "grammar_corrections": [
    {
      "original": "I wants to order",
      "corrected": "I would like to order",
      "explanation": "Đại từ 'I' đi với động từ nguyên thể 'want' hoặc dùng cấu trúc lịch sự 'would like'."
    }
  ],
  "better_phrasings": [
    "Good morning. Could I get a cappuccino, please?",
    "Morning! I'd love a cappuccino to start my day."
  ],
  "vocabularies_used": [
    "cappuccino"
  ],
  "latency_ms": 1120
}
```

---

### 1.2. Hoàn Thành Phiên Học & Chấm Điểm (Complete Session)
Đánh giá toàn diện các lượt nói trong phiên, chấm điểm từ vựng, ngữ pháp, độ lưu loát theo chuẩn CEFR.

- **Endpoint:** `POST /chat/sessions/{session_id}/complete`
- **Response Payload (200 OK):**
```json
{
  "session_id": "8a3e7b21-4f10-41ab-811d-729930a0d4b9",
  "status": "completed",
  "total_turns": 8,
  "vocabulary_score": 85.0,
  "grammar_score": 78.5,
  "fluency_score": 82.0,
  "overall_feedback": "Bạn đã hoàn thành tốt kịch bản gọi đồ uống. Vốn từ vựng áp dụng chính xác. Cần lưu ý chia đúng động từ khi nói ở thì hiện tại đơn.",
  "completed_at": "2026-10-29T10:30:00Z"
}
```

---

### 1.3. Lấy Lịch Sử Chi Tiết Của Một Phiên Học
- **Endpoint:** `GET /chat/sessions/{session_id}/history`
- **Response Payload (200 OK):** Danh sách toàn bộ các lượt `TurnHistory` thuộc phiên đó.

---

## 2. Nhóm API Kịch Bản & Từ Vựng (Scenario & Vocabulary APIs)

### 2.1. Lấy Danh Sách Kịch Bản (List Scenarios)
- **Endpoint:** `GET /scenarios`
- **Query Params:**
  - `category` (tùy chọn): Lọc theo danh mục (`daily_life`, `business`, `travel`,...)
  - `difficulty` (tùy chọn): Lọc theo độ khó (`A1`, `A2`, `B1`, `B2`, `C1`)
- **Response Payload (200 OK):** Mảng các đối tượng kịch bản, bao gồm số lượng từ vựng mục tiêu.

### 2.2. Lấy Chi Tiết Kịch Bản & Từ Vựng Mục Tiêu
- **Endpoint:** `GET /scenarios/{scenario_id}`
- **Response Payload (200 OK):** Chi tiết kịch bản, vai diễn của AI, vai diễn người học và mảng các từ vựng mục tiêu kèm phiên âm IPA và ví dụ.

---

## 3. Nhóm API Kiểm Tra Hệ Thống (Health Check)
- **Endpoint:** `GET /health`
- **Response Payload (200 OK):**
```json
{
  "status": "ok",
  "database": "connected",
  "version": "1.0.0"
}
```

---

## 4. Mã lỗi chuẩn (Error Codes)
- `400 Bad Request`: Thiếu tham số hoặc định dạng file âm thanh không hợp lệ.
- `401 Unauthorized`: Token xác thực không hợp lệ hoặc đã hết hạn.
- `404 Not Found`: Không tìm thấy session hoặc scenario tương ứng.
- `422 Unprocessable Entity`: Dữ liệu không khớp schema Pydantic.
- `500 Internal Server Error`: Lỗi kết nối dịch vụ ngoài hoặc cơ sở dữ liệu.
