# 📌 SỔ TAY KỸ THUẬT & KIẾN TRÚC DỰ ÁN VOCABTALK
> **Tài liệu lưu trữ nội bộ:** Toàn bộ giải pháp kiến trúc, kỹ thuật và chiến lược tối ưu đã thảo luận.  
> **Dự án:** Ứng dụng Luyện giao tiếp tiếng Anh nhập vai rảnh tay với Trợ lý ảo AI (VocabTalk)  
> **Đối tượng áp dụng:** Nhóm 4 sinh viên năm 3 | **Ngân sách:** 0 VNĐ | **Thời gian:** ~5 tuần

---

## 1. ĐỊNH VỊ SẢN PHẨM & TRẢI NGHIỆM CHỦ ĐẠO (CORE UX)
* **Trải nghiệm kiểu "Cuộc gọi rảnh tay" (Hands-free Voice Call):** 
  * Mô phỏng trải nghiệm gọi điện thoại cho người bản xứ hoặc nói chuyện với robot thông minh (tương tự như robot Xiaozhi ESP32 hoặc ChatGPT Voice Mode).
  * Người dùng bấm **"Bắt đầu cuộc gọi"** một lần duy nhất $\rightarrow$ thả tay ra hoàn toàn, cứ thế nói và nghe AI đối đáp tự nhiên.
* **Cơ chế dự phòng (Hybrid Fallback):**
  * Trên màn hình cuộc gọi luôn có **phụ đề chạy trực tiếp (Live Subtitles)**.
  * Vẫn hỗ trợ gõ phím nếu người dùng ở môi trường quá ồn hoặc micro bị trục trặc.

---

## 2. GIẢI QUYẾT BÀI TOÁN "NGƯỜI HỌC BỊ ĐƠ / BÍ TỪ KHÔNG BIẾT NÓI GÌ"
* **"Phao cứu sinh" Từ vựng theo bối cảnh (Target Vocabulary):**
  * Mỗi kịch bản có sẵn 5–8 từ vựng và mẫu câu cốt lõi hiển thị ở một góc nhỏ trên màn hình để người học liếc nhìn lấy ý tưởng đặt câu (thỏa mãn việc học từ vựng bám sát ngữ cảnh).
* **Nút gợi ý câu phản hồi nhanh (Suggested Prompts / Quick Hints):**
  * Hiển thị 2–3 nút câu mẫu mớm lời ngay trên màn hình (ví dụ: *"I'd like an iced latte, please"*). Người học có thể đọc theo hoặc bấm chọn nếu quá bí.
* **Prompt AI chủ động dẫn dắt (Proactive AI Turn):**
  * AI được lập trình luôn kết thúc câu thoại bằng một câu hỏi mở hoặc đưa ra lựa chọn để người học dễ dàng phản xạ đối đáp tiếp.

---

## 3. KIẾN TRÚC NHẬN DIỆN GIỌNG NÓI SIÊU TỐC & LỌC ỒN (0.2s LATENCY, >95% ACCURACY)
* **Vấn đề đã phân tích:**
  * Web Speech API của trình duyệt: Dễ bị ảnh hưởng bởi tạp âm (tiếng quạt, tiếng ồn phòng học làm tụt độ chính xác xuống 60–70%), dễ nuốt âm đuôi (`/t/`, `/s/`, `/k/`).
  * Groq Whisper: Chưa hỗ trợ WebSocket streaming từng byte, nhưng tốc độ xử lý batch file cực nhanh (0.15 – 0.25 giây).
* **Giải pháp chuẩn công nghiệp chốt dùng: Client VAD + Groq Whisper:**
  1. **Client-side VAD (Voice Activity Detection):** Dùng thư viện `@ricky0123/vad-web` chạy ngầm trên trình duyệt.
  2. **Thông số VAD:**
     * Ngưỡng im lặng ngắt câu (*Silence Threshold*): **600ms – 800ms** (khoảng nghỉ tự nhiên của người khi nói, không bị cắt đôi câu).
     * Đệm âm thanh (*Audio Padding*): Giữ dư **150ms** ở đầu và đuôi để không bao giờ bị cắt cụt âm đuôi.
  3. **Xử lý âm thanh:** VAD tự cắt file audio nhỏ (3–5s, vài chục KB) $\rightarrow$ gửi lên FastAPI $\rightarrow$ gọi Groq Whisper API $\rightarrow$ trả về text trong **0.2 giây** với độ chính xác 95%–98% và lọc sạch tạp âm.

---

## 4. CHIẾN LƯỢC TỐI ƯU API & QUẢN LÝ RỦI RO (ZERO COST & 100% SẴN SÀNG)
* **Gộp Prompt 3-trong-1 (Batching Prompt):**
  * Mỗi lượt nói của người dùng chỉ gửi **ĐÚNG 1 LẦN** gọi API đến Google Gemini, yêu cầu trả về cấu trúc JSON gồm cả 3 thứ:
    ```json
    {
      "ai_reply": "Sure! Would you like it hot or iced?",
      "grammar_feedback": "I want coffee -> I'd like to order a coffee, please.",
      "suggested_hints": ["I'd like iced coffee.", "How much is it?"]
    }
    ```
  * $\rightarrow$ Tiết kiệm 66% số lượng request, không bao giờ lo quá tải token.
* **Xoay vòng khóa (Key Rotation):**
  * Tạo 3 API Key miễn phí từ 3 tài khoản Google của các thành viên trong nhóm.
  * Backend viết hàm `try...except`: Nếu Key 1 chạm giới hạn Rate Limit (mã lỗi 429) $\rightarrow$ tự động chuyển sang Key 2 ngay lập tức.
* **Chế độ ngoại tuyến dự phòng (Offline Mock Fallback):**
  * Lưu sẵn trong Database 1 kịch bản đối đáp mẫu. Nếu mất mạng hoặc API chậm quá 5 giây, hệ thống tự động tải đoạn thoại mẫu để người dùng tiếp tục luyện tập mà không bị crash khi demo trước thầy.

---

## 5. TỐI ƯU LƯU TRỮ LỊCH SỬ CUỘC GỌI (TEXT-ONLY, 0 VNĐ LƯU TRỮ)
* **Bẫy chi phí cần tránh:** Không lưu file ghi âm âm thanh (`.wav`/`.mp3`) vì sẽ tốn hàng gigabyte và phát sinh chi phí Cloud đắt đỏ.
* **Cơ chế "Nghe xong xóa ngay" (Ephemeral Audio):**
  * File âm thanh gửi lên Whisper chuyển thành Text xong $\rightarrow$ **xóa ngay lập tức khỏi bộ nhớ tạm**.
  * Database (PostgreSQL) chỉ lưu các dòng văn bản (Text & JSON). Toàn bộ 1 cuộc gọi 15 lượt chỉ tốn khoảng **5 KB đến 10 KB**.
  * Gói miễn phí 500 MB của Supabase có thể lưu trữ thoải mái tới **50.000 cuộc gọi** mà không tốn một xu!
* **Nghe lại câu nói bằng Web SpeechSynthesis:**
  * Khi người dùng xem lại lịch sử và bấm nút Loa 🔊 bên cạnh câu của AI $\rightarrow$ Trình duyệt tự đọc lại văn bản thành tiếng. Không tốn dung lượng lưu file mp3 trên server.

---

## 6. TÍNH NĂNG ĐẮT GIÁ: TRÍ NHỚ DÀI HẠN CÁ NHÂN HÓA (AI LONG-TERM MEMORY)
* **Bản chất kỹ thuật:** AI là Stateless (không tự nhớ). Phần mềm Backend đóng vai trò "nhắc bài" cho AI.
* **Cách triển khai siêu nhẹ (0 VNĐ & <50 tokens):**
  1. *Khi kết thúc cuộc gọi:* Backend gửi lệnh ngầm cho Gemini tóm tắt 1–2 thông tin cá nhân hoặc mục tiêu của người học (dài 30–50 từ) $\rightarrow$ lưu vào cột `user_memory_notes` trong bảng `Users`.
     * *Ví dụ:* `"Nam, sinh viên năm 3 CNTT, thích uống Iced Latte ít ngọt, chuẩn bị phỏng vấn tuần tới, hay quên chia thì quá khứ."`
  2. *Khi mở cuộc gọi mới:* Backend nhét đoạn note này vào đầu System Prompt của AI.
  3. *Trải nghiệm WOW:* Cuộc gọi mới AI có thể chào: *"Chào Nam! Hôm nay vẫn dùng món Iced Latte ít ngọt chứ? Việc ôn luyện phỏng vấn tuần tới thế nào rồi?"* $\rightarrow$ Điểm nhấn ăn trọn điểm sáng tạo của hội đồng!

---

## 7. TECH STACK CHỐT CHO DỰ ÁN
* **Frontend:** Next.js (React), Tailwind CSS, Framer Motion (hiệu ứng bong bóng chat/sóng âm), `@ricky0123/vad-web` (bắt khoảng lặng giọng nói).
* **Backend:** Python với FastAPI (bất đồng bộ, hiệu năng cao, tự sinh tài liệu Swagger UI `/docs`).
* **AI & Voice Services:**
  * *Speech-to-Text:* Groq Whisper API (miễn phí, tốc độ 0.2s, lọc ồn tốt).
  * *Trí não AI:* Google Gemini API (Free-tier 15 RPM).
  * *Text-to-Speech:* Trình duyệt Native Web SpeechSynthesis API (0 VNĐ).
* **Database:** PostgreSQL (Supabase Free) hoặc SQLite.
* **Deploy:** Vercel (Frontend) + Render / Railway (Backend). Tổng chi phí: **0 VNĐ**.

---

## 8. CHECKLIST CHUẨN BỊ CHO BUỔI BẢO VỆ ĐỒ ÁN (DEMO)
1. Chuẩn bị **1 chiếc tai nghe có micro** (cắm vào laptop khi nói giúp triệt tiêu tiếng ồn của phòng học, độ chính xác nhận diện đạt >95%).
2. Kiểm tra sẵn 3 API Key của nhóm đã nạp vào file `.env`.
3. Kiểm tra tính năng gõ phím dự phòng vẫn hoạt động tốt song song với micro.
