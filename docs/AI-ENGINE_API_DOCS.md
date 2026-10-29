# Đặc Tả Kỹ Thuật AI Engine (AI Engine Architecture & API Docs)

Tài liệu này đặc tả chi tiết module **AI Engine (`ai_engine/`)** của hệ thống **VocabTalk**, bao gồm kiến trúc dịch vụ nhận diện giọng nói (STT), mô hình ngôn ngữ lớn (LLM) và kỹ thuật thiết kế Prompt tối ưu độ trễ.

---

## 1. Kiến Trúc Phân Tầng Dịch Vụ AI

```
ai_engine/
├── prompts/
│   └── chat_system.txt           # Prompt hệ thống gộp 3-trong-1
├── services/
│   ├── groq_stt.py               # Groq Whisper-large-v3 STT Client
│   └── gemini_llm.py             # Google Gemini 1.5 Flash Batching Client
├── requirements.txt              # groq, google-generativeai, python-dotenv
└── .env.example                  # GROQ_API_KEY & GEMINI_API_KEY
```

---

## 2. Dịch vụ Chuyển Âm Thanh Thành Văn Bản (`GroqWhisperService`)

### 2.1. Cấu hình kỹ thuật
- **File thực thi:** `ai_engine/services/groq_stt.py`
- **Mô hình triển khai:** `whisper-large-v3` (chạy trên hạ tầng Groq LPU)
- **Ngôn ngữ nhận dạng:** `en` (English)
- **Nhiệt độ (Temperature):** `0.0` (Đảm bảo tính chính xác và nhất quán tuyệt đối)
- **Độ trễ trung bình:** **180ms - 220ms** (nhanh hơn gấp 10 lần so với OpenAI Whisper API)

### 2.2. Giao thức hàm (Method Signature)
```python
async def transcribe_audio(
    self, 
    audio_bytes: bytes, 
    filename: str = "audio.wav"
) -> str:
    """
    Chuyển đổi file âm thanh dạng bytes sang văn bản tiếng Anh.
    Tự động fallback về Mock STT nếu không có GROQ_API_KEY hoặc xảy ra sự cố mạng.
    """
```

---

## 3. Dịch vụ Xử Lý Hội Thoại & Ngôn Ngữ (`GeminiLLMService`)

### 3.1. Kỹ thuật Prompt Batching 3-trong-1 (3-in-1 Prompting)
Để đạt được độ trễ thời gian thực và tiết kiệm chi phí gọi API, hệ thống **không** thực hiện 3 lần gọi tuần tự, mà gộp chung vào một lượt suy luận duy nhất của **Gemini 1.5 Flash**:
1. **Tiếp nối cuộc đối thoại (Conversation Continuity):** Nhập vai người bản xứ tự nhiên, đặt câu hỏi gợi mở.
2. **Sửa lỗi ngữ pháp (Grammar Correction):** Phát hiện lỗi chia thì, giới từ, mạo từ và giải thích ngắn gọn bằng tiếng Việt.
3. **Gợi ý cách nói hay hơn (Better Phrasing):** Đưa ra 1-2 cách diễn đạt tự nhiên chuẩn bản xứ (idiomatic / professional).

### 3.2. Cấu trúc JSON Schema bắt buộc
```json
{
  "reply_text": "Chuỗi câu thoại phản hồi bằng tiếng Anh của AI",
  "grammar_corrections": [
    {
      "original": "Cụm từ người dùng nói sai",
      "corrected": "Cụm từ đã được sửa đúng",
      "explanation": "Giải thích ngắn gọn bằng tiếng Việt"
    }
  ],
  "better_phrasings": [
    "Cách diễn đạt 1 hay và tự nhiên hơn",
    "Cách diễn đạt 2 phù hợp ngữ cảnh hơn"
  ],
  "vocabularies_used": [
    "từ vựng mục tiêu đã được người dùng dùng đúng"
  ]
}
```

### 3.3. Giao thức hàm
```python
async def process_turn(
    self,
    user_transcript: str,
    scenario_info: dict,
    conversation_history: list[dict],
    target_vocabularies: list[str]
) -> dict:
    """
    Xử lý lượt thoại của người dùng và trả về phản hồi kèm nhận xét ngữ pháp theo JSON schema.
    """
```

---

## 4. Cơ Chế Dự Phòng Ngoại Tuyến (Offline Mock Fallback)
Nhằm tạo điều kiện thuận lợi cho việc phát triển cục bộ (Local Development) và chạy CI/CD mà không bắt buộc có API key:
- Khi phát hiện `GROQ_API_KEY` hoặc `GEMINI_API_KEY` chưa được điền hoặc giá trị giả định (`gsk_your_...`), module tự động chuyển sang chế độ **Mock Mode**.
- Mock STT trả về câu thoại mẫu hợp lệ.
- Mock LLM sinh ra phản hồi có đầy đủ cấu trúc JSON và gợi ý sửa lỗi thực tế.
- Ghi log rõ ràng: `[GroqSTT] No API key detected. Using Mock STT mode.`
