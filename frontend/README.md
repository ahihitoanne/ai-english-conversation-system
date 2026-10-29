# 🎨 VocabTalk Frontend (Next.js + Tailwind CSS)

## 📌 Công nghệ sử dụng:
* **Framework:** Next.js (App Router, React Server Components)
* **Styling:** Tailwind CSS
* **Animations:** Framer Motion (hiệu ứng sóng âm giọng nói, bong bóng thoại)
* **Voice Activity Detection:** `@ricky0123/vad-web` (bắt khoảng lặng 600ms–800ms)
* **Speech Synthesis:** Web Speech API (trình duyệt tự phát giọng đọc bản xứ)

---

## 🚀 Khởi tạo dự án (Dành cho Frontend Developer):
Để khởi tạo mã nguồn Next.js vào thư mục `frontend/`, chạy lệnh:

```bash
cd frontend
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

### Cài đặt các thư viện bổ sung cho Audio & UI:
```bash
npm install @ricky0123/vad-web framer-motion lucide-react clsx tailwind-merge
```

### Chạy môi trường phát triển:
```bash
npm run dev
```
Truy cập: `http://localhost:3000`
