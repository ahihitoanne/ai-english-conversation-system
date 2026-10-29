# Đường Ống Xử Lý Dữ Liệu Thời Gian Thực (Audio & Real-time Pipeline)

Tài liệu này đặc tả chi tiết chu trình luân chuyển dữ liệu từ lúc người dùng phát âm đến khi nhận được câu đối thoại phản hồi cùng nhận xét học tập của hệ thống **VocabTalk**.

---

## 1. Sơ đồ Luồng Pipeline Tổng Thể

```
[1. User Speaks]
       │
       ▼ (Web Audio API / MediaRecorder @ 16kHz Mono)
[2. Client-side VAD]
       │  (Phát hiện ngưng nói >= 700ms)
       ▼ (Gửi Multipart Audio Form)
[3. Core Backend: POST /api/v1/chat/turn]
       │
       ├───► [4. Groq Whisper-large-v3] (~200ms)
       │        └── Trả về: User Transcript Text
       │
       ├───► [5. Context Assembler]
       │        └── Nạp lịch sử phiên + Kịch bản + Từ vựng mục tiêu
       │
       ├───► [6. Google Gemini 1.5 Flash (Batching 3-in-1)] (~800ms)
       │        └── Trả về JSON:
       │             - AI conversational response
       │             - Grammar analysis & corrections
       │             - Better phrasing suggestions
       │             - Target vocabularies matched
       │
       ├───► [7. Database Persistence] (~30ms)
       │        └── Lưu TurnHistory vào PostgreSQL
       │
       ▼ (JSON Response Payload)
[8. Frontend Rendering]
       ├── Hiển thị phụ đề người dùng & AI
       ├── Render thẻ sửa ngữ pháp & Better Phrasing
       └── Phát âm câu trả lời qua Web Speech API / TTS
```

---

## 2. Chi tiết từng công đoạn trong Pipeline

### Giai đoạn 1: Thu âm & Phát hiện tiếng nói (Client-side VAD)
- **Chuẩn âm thanh:** Định dạng 16,000 Hz, kênh đơn (Mono), 16-bit PCM hoặc WebM Opus.
- **Thuật toán VAD:** Sử dụng mô hình Silero VAD thu nhỏ chạy trên WebAssembly (thông qua `@ricky0123/vad-web`).
- **Lợi ích:** Người dùng không cần bấm nút "Dừng nói". Khi hệ thống phát hiện im lặng liên tục vượt quá **700ms**, luồng âm thanh tự động được đóng gói và gửi đi.

### Giai đoạn 2: Chuyển âm thanh thành văn bản (Speech-to-Text)
- **Dịch vụ:** `Groq Whisper Service` (`ai_engine/services/groq_stt.py`).
- **Mô hình:** `whisper-large-v3`.
- **Độ trễ trung bình:** **180ms - 220ms**.
- **Cơ chế dự phòng (Fallback):** Nếu mạng chập chờn hoặc hết quota Groq, hệ thống kích hoạt Mock STT hoặc chuyển hướng sang fallback model để đảm bảo trải nghiệm không bị gián đoạn.

### Giai đoạn 3: Phối hợp ngữ cảnh & Xử lý Batching 3-trong-1
- Hệ thống tập hợp ngữ cảnh:
  - Vai trò AI & Vai trò người dùng trong kịch bản.
  - 5 lượt thoại gần nhất để duy trì tính mạch lạc.
  - Danh sách từ vựng mục tiêu cần đối chiếu.
- Prompt được định dạng nghiêm ngặt để Gemini trả về đúng cấu trúc JSON:
  ```json
  {
    "reply_text": "Great choice! Would you like that with oat milk or whole milk?",
    "grammar_corrections": [
      {
        "original": "I wants a coffee",
        "corrected": "I would like a coffee",
        "explanation": "Dùng 'would like' để gọi đồ lịch sự hơn, và 'I' đi với động từ nguyên mẫu."
      }
    ],
    "better_phrasings": [
      "Can I get a large cappuccino, please?"
    ],
    "vocabularies_used": ["cappuccino"]
  }
  ```

### Giai đoạn 4: Lưu trữ & Phản hồi (Persistence & Delivery)
- Bản ghi `TurnHistory` được lưu đồng thời cùng transaction.
- Dữ liệu trả về cho client gồm đầy đủ: văn bản bóc băng, câu trả lời của AI, danh sách sửa lỗi và thống kê độ trễ (`latency_ms`).

---

## 3. Chiến lược đối phó sự cố (Fault Tolerance)

| Sự cố tiềm ẩn | Biện pháp xử lý tự động |
| :--- | :--- |
| **Mất kết nối Internet khi gửi audio** | Client hiển thị thông báo "Đang thử lại kết nối...", giữ lại audio buffer |
| **Groq API Rate Limit (429)** | Tự động chuyển sang Mock Service với văn bản giả lập và cảnh báo log |
| **Gemini JSON parse fail** | Regex trích xuất khối JSON bên trong markdown code fences, fallback về phản hồi an toàn |
| **Audio người dùng quá ngắn (< 0.5s)** | VAD tự động bỏ qua tạp âm ngắn (tiếng ho, thở mạnh) mà không kích hoạt gọi API |
