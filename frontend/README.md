# VocabTalk Frontend

**Framework:** Next.js 14 (App Router) + TypeScript + Tailwind CSS

## Chạy ở máy local

1. Copy biến môi trường (nếu chưa có `.env.local`):
   ```powershell
   Copy-Item .env.example .env.local
   ```
2. Cài đặt dependencies:
   ```powershell
   npm install
   ```
3. Khởi động dev server ở cổng `3000`:
   ```powershell
   npm run dev
   ```

Mở trình duyệt tại `http://localhost:3000` (đảm bảo Backend FastAPI đang chạy ở `http://localhost:8000`).

## Cấu trúc hiện tại
```text
frontend/
├── .env.example
├── .env.local
├── package.json
└── src/
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    ├── components/
    │   ├── ResultPanel.tsx        # Xuất toàn bộ text kết quả, gợi ý, latency & JSON
    │   ├── ScenarioSelector.tsx   # Tải & chọn kịch bản từ GET /api/v1/scenarios
    │   └── VoiceTestWorkbench.tsx # Giao diện test Mic / File Audio / Text
    ├── hooks/
    │   └── useAudioRecorder.ts    # MediaRecorder ghi âm trình duyệt (.webm)
    ├── lib/
    │   └── api.ts                 # Gọi FastAPI (/health, /scenarios, /voice-turn, /text-turn)
    └── types/
        └── chat.ts
```
