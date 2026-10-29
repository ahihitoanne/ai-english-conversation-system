# Sơ đồ Tuần tự (Sequence Diagrams)

Thư mục lưu trữ các biểu đồ trình tự (Sequence Diagrams) mô tả luồng tương tác giữa Người dùng, Giao diện Client, Backend API, AI Engine và Cơ sở dữ liệu.

## 1. Các luồng nghiệp vụ cốt lõi
- **Sequence 01 - Voice Turn Exchange**:
  - Người dùng bấm mic nói -> Client VAD phát hiện khoảng lặng -> Gửi audio chunk lên `core_backend`.
  - `core_backend` chuyển tiếp audio sang Groq Whisper STT.
  - Nhận text -> Gộp prompt gửi sang Gemini 1.5 Flash -> Trả về JSON (response, grammar corrections, better phrasing).
  - Backend lưu vào DB và trả kết quả về Client hiển thị phụ đề + phát audio.
- **Sequence 02 - Scenario Initialization & Vocabulary Loading**:
  - Người dùng chọn kịch bản -> Backend tải thông tin & từ vựng mục tiêu -> Khởi tạo session.
- **Sequence 03 - Session Completion & CEFR Scoring**:
  - Người dùng bấm kết thúc buổi tập -> AI tổng kết lượt nói, chấm điểm từ vựng, độ lưu loát -> Hiển thị Radar Chart.

## 2. Công cụ khuyên dùng
- PlantUML / Mermaid.js / draw.io
