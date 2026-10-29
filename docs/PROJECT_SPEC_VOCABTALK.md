# 📘 TÀI LIỆU ĐẶC TẢ DỰ ÁN (PROJECT SPECIFICATION) - BẢN MASTER VOCABTALK
# VOCABTALK — HỆ THỐNG LUYỆN GIAO TIẾP TIẾNG ANH NHẬP VAI RẢNH TAY BẰNG GIỌNG NÓI VỚI TRỢ LÝ AI

> **Môn học:** Nhập môn Công nghệ Phần mềm (CSC13002) - ĐHKHTN (HCMUS)  
> **Quy mô nhóm:** 4 sinh viên | **Thời gian thực hiện:** ~5 tuần (~1.5 tháng)  
> **Slogan / Định vị:** *"Luyện đúng tình huống, cải thiện đúng câu nói"*  
> **Trải nghiệm chủ đạo:** Đàm thoại rảnh tay thời gian thực (Hands-free Voice Conversation) như gọi điện thoại / nói chuyện với robot thông minh (Xiaozhi).  
> **Nguyên tắc kỹ thuật:** Client-side VAD (600ms - 800ms) + Groq Whisper LPU (0.2s STT) + Google Gemini API (đối đáp & sửa câu) + Browser SpeechSynthesis (TTS). Chi phí 0 VNĐ.

---

## 1. BÀI TOÁN & GIẢI PHÁP CỐT LÕI

* **Vấn đề thực tế (Problem):** Sinh viên có kiến thức ngữ pháp và từ vựng cơ bản nhưng lúng túng, sợ sai và thiếu môi trường thực hành giao tiếp thường xuyên. Khi đối diện với người thật hoặc khung chat trống, người học thường bị "đơ" (The Blank Page problem), không biết nói gì và không có ai chỉnh sửa câu ngay lập tức.
* **Đối tượng mục tiêu (Target Users):** Sinh viên đại học trình độ A2 - B1 cần rèn luyện phản xạ giao tiếp theo mục tiêu cụ thể (phỏng vấn thực tập, giao tiếp đại học, đời sống thường nhật).
* **Giải pháp (Solution):** Ứng dụng Web cho phép người học lựa chọn tình huống, tra cứu từ vựng bối cảnh, tham gia cuộc gọi thoại rảnh tay hai chiều với trợ lý AI và nhận phản hồi chỉnh sửa câu nói (Better Phrasing) ngay lập tức.

---

## 2. NĂM TÍNH NĂNG CHÍNH (ĐẶC TẢ CHI TIẾT)

### F01. Chọn tình huống giao tiếp & Tra cứu từ vựng bối cảnh (Target Vocabulary)
* Học viên duyệt danh mục kịch bản theo 2 nhóm: *Đời sống thường nhật* (gọi cafe, khách sạn, mua sắm) và *Nghề nghiệp* (phỏng vấn thực tập IT, họp dự án).
* Bảng thông tin tình huống gồm: Bối cảnh, vai của người học, vai của AI, **danh sách mục tiêu giao tiếp cần đạt** (checklist).
* **Kho từ vựng trọng tâm (Target Vocabulary):** 5–8 từ vựng và mẫu câu cốt lõi kèm phiên âm IPA, giải nghĩa tiếng Việt và câu ví dụ để học viên học trước hoặc làm "phao cứu sinh" tra cứu khi bí từ.

### F02. Hội thoại nhập vai đàm thoại hai chiều bằng giọng nói (Hands-free Voice Call)
* **Tính năng chủ đạo (Core Feature):** Bấm "Bắt đầu cuộc gọi" $\rightarrow$ Thả tay ra (Hands-free). AI cất tiếng chào mở đầu bằng giọng bản xứ chuẩn (Text-to-Speech).
* Học viên nói trực tiếp qua micro. **Client-side VAD (Voice Activity Detection)** tự động phát hiện dứt câu khi im lặng 600ms – 800ms (+ 150ms đệm âm thanh).
* Đoạn âm thanh trọn câu được gửi lên **Groq Whisper** xử lý siêu tốc trong 0.2s với độ chính xác 95% – 98% và khả năng lọc tạp âm vượt trội.
* **Google Gemini API** phân tích ngữ cảnh, đối đáp tự nhiên và luôn kết thúc bằng một câu hỏi gợi mở để người học dễ phản xạ.
* **Hỗ trợ chống bí từ:** Phụ đề trực tiếp (Live Subtitles) hiển thị chữ chạy theo lời nói, kết hợp **Hộp gợi ý phản hồi nhanh (Suggested Prompts)** mớm lời 2–3 câu mẫu trên màn hình. Hỗ trợ gõ phím dự phòng khi cần.

### F03. Phân tích lỗi sai & Gợi ý cách diễn đạt tự nhiên hơn (Better Phrasing)
* AI phân tích cú pháp câu thoại ngay trong mỗi lượt trao đổi.
* Phát hiện lỗi ngữ pháp, từ vựng chưa tự nhiên và hiển thị hộp thông tin: *"Cách nói tự nhiên hơn của người bản xứ: [Better Phrasing]"* (ví dụ: *"I want order a coffee"* $\rightarrow$ *"I'd like to order a coffee, please"*).
* Hiển thị tinh tế dưới phụ đề câu thoại mà không làm gián đoạn dòng chảy cuộc gọi.

### F04. Báo cáo tổng kết sau buổi luyện tập & Chuỗi Streak (Session Summary)
* Khi bấm "Kết thúc cuộc gọi", hệ thống xuất báo cáo: Thời lượng nói, số lượt đối đáp (turns), tỷ lệ hoàn thành mục tiêu (%), danh sách câu nói đã được sửa lỗi, và thống kê từ vựng mục tiêu đã áp dụng thành công.
* Lưu vào lịch sử học tập cá nhân và tự động ghi nhận chuỗi ngày học liên tục (Daily Streak).

### F05. Quản lý kịch bản hội thoại và từ vựng dành cho Quản trị viên (Admin CMS)
* Dành riêng cho Quản trị viên (Admin).
* Thao tác: Thêm, Sửa, Xóa kịch bản tình huống.
* Cấu hình: Tên kịch bản, bối cảnh, vai diễn User/AI, câu mở đầu, mục tiêu giao tiếp, danh sách từ vựng trọng tâm và System Prompt cho AI.

---

## 3. HAI TÌNH HUỐNG SỬ DỤNG THỰC TẾ (SCENARIOS)

* **Tình huống 1 (Đời sống - Gọi món tại quán cà phê):**
  * *User:* Khách hàng. | *AI:* Barista.
  * *Mục tiêu:* Chào hỏi, gọi đồ uống, chọn size, yêu cầu giảm ngọt ("less sweet"), hỏi giá và thanh toán.
  * *Từ vựng gợi ý:* `takeaway`, `iced latte`, `less sweet`, `receipt`.
  * *Kết quả:* Nhận phản hồi dùng mẫu câu lịch sự (*"Could I have..."* thay vì *"Give me..."*).
* **Tình huống 2 (Nghề nghiệp - Phỏng vấn xin việc thực tập CNTT):**
  * *User:* Sinh viên năm 3 ứng tuyển Intern. | *AI:* Technical Lead.
  * *Mục tiêu:* Giới thiệu bản thân ngắn gọn, trình bày dự án đã làm và trả lời câu hỏi giải quyết xung đột nhóm.
  * *Từ vựng gợi ý:* `internship`, `teamwork`, `problem-solving`, `deadline`.
  * *Kết quả:* Nhận gợi ý cải thiện câu trả lời tự tin, đúng thuật ngữ ngành.

---

## 4. CHIẾN LƯỢC TỐI ƯU API & QUẢN LÝ RỦI RO (ZERO COST & HIGH RELIABILITY)

1. **Gộp Prompt 3-trong-1 (Batching Prompt):** Mỗi lượt thoại chỉ gửi đúng 1 request API đến Gemini, nhận về trọn gói JSON chứa: câu trả lời của AI + câu sửa lỗi ngữ pháp + 2 câu gợi ý tiếp theo. Giảm 66% số lượng request.
2. **Xoay vòng khóa (Key Rotation):** Cài đặt hàm tự động chuyển đổi giữa 3 API Key miễn phí của các thành viên trong nhóm khi chạm giới hạn Rate Limit (mã lỗi 429).
3. **Chế độ ngoại tuyến (Offline Mock Fallback):** Nếu mạng bị ngắt hoặc API chậm quá 5 giây, hệ thống tự động tải đoạn hội thoại mẫu từ Database để người dùng tiếp tục luyện tập mà không bị crash.

---

## 5. MÔI TRƯỜNG & RÀNG BUỘC KỸ THUẬT

* **Frontend:** Next.js với React Server Components, Tailwind CSS, Framer Motion, thư viện VAD phát hiện giọng nói.
* **Backend:** Python với FastAPI framework, tích hợp Groq Whisper Cloud (STT siêu tốc 0.2s) và Google Gemini API (đối đáp AI).
* **Database:** PostgreSQL hoặc SQLite lưu trữ quan hệ chuẩn: Users, Scenarios, Messages, Feedbacks.
* **Chi phí:** 0 VNĐ (tận dụng hoàn toàn gói Free-tier).
* **Chuẩn tài liệu:** Tuân thủ quy trình Công nghệ Phần mềm và đặc tả IEEE 830.
