# Contributing to ai-english-conversation-system

> **Môn học:** Nhập môn Công nghệ Phần mềm — ĐH Khoa học Tự nhiên, ĐHQG TP.HCM  
> **GVHD:** ThS. Ngô Ngọc Đăng Khoa | **HK1 – 2026-2027**

---

## 👥 Phân công & Module ownership

| MSSV | Họ và tên | Vai trò | Module chủ sở hữu |
| :---: | :--- | :--- | :--- |
| **24120467** | Phạm Đức Toàn | Backend Developer | `core_backend/` + `ai_engine/` (Groq, Gemini, US04). Quản lý repo |
| **19120501** | Nguyễn Nhật Hảo | Fullstack Developer | Auth (US01), Admin Portal (US06), Deploy |
| **24120263** | Đỗ Ngọc Gia Bảo | Content / QA Engineer | Nội dung kịch bản & từ vựng (US02, US03), kiểm thử nghiệm thu |
| **19120627** | Hồ Minh Quân | Frontend Developer | `frontend/` (MediaRecorder, phụ đề, báo cáo, US05) |

> **Quy tắc:** Mỗi file có 1 thành viên phụ trách chính (owner) và ít nhất 1 người review trước khi merge.

---

## 🌿 Branching Strategy (Quy Tắc Chia Nhánh)

```
main          ← CHỈ chứa code ổn định, sẵn sàng báo cáo/demo cho giảng viên
  └── dev     ← Nhánh làm việc chung hàng ngày của toàn bộ nhóm
        ├── feature/groq-stt-service    (Toàn)
        ├── feature/gemini-service      (Toàn)
        ├── feature/auth-login          (Hảo)
        ├── feature/admin-portal        (Hảo)
        ├── feature/scenario-library    (Bảo)
        └── feature/voice-room-ui       (Quân)
```

**⚠️ Quy tắc bắt buộc đối với tất cả thành viên:**
1. **Tuyệt đối không commit/push trực tiếp lên `main`.**
2. **Tất cả thành viên làm việc trên nhánh `dev`** (hoặc tạo nhánh con `feature/<tên-tính-năng>` từ `dev`).
3. Khi hoàn thành tính năng, tạo **Pull Request (PR)** merge vào `dev`.
4. Chỉ merge từ `dev` vào `main` khi phiên bản đã qua kiểm thử ổn định và sẵn sàng nghiệm thu sprint/báo cáo.

---

## 📝 Commit Message Convention

Format: **`<type>(<scope>): <mô tả ngắn gọn bằng tiếng Anh>`**

| Type | Khi nào dùng |
| :--- | :--- |
| `feat` | Thêm tính năng mới |
| `fix` | Sửa lỗi |
| `refactor` | Tái cấu trúc code (không thay đổi hành vi) |
| `docs` | Chỉ cập nhật tài liệu |
| `test` | Thêm hoặc cập nhật test |
| `chore` | Cấu hình build, cài đặt thư viện, CI/CD |
| `style` | Format code, sửa lint (không thay đổi logic) |

**Ví dụ đúng:**
```
feat(ai_engine): implement Groq Whisper STT transcription endpoint
feat(core_backend): add JWT authentication middleware for protected routes
feat(frontend): build voice recording UI with start/stop controls
fix(ai_engine): handle Gemini rate limit 429 with fallback mock response
refactor(core_backend): normalize scenario seed data structure
docs: update README setup instructions for Windows
```

**Ví dụ sai (không dùng):**
```
update code
fix bug
them tinh nang moi
```

---

## 🔄 Quy trình làm việc (Scrum)

| Sự kiện | Mô tả |
| :--- | :--- |
| **Sprint Planning** | Đầu mỗi Sprint (2 tuần): chọn User Story, phân công, ước lượng |
| **Daily Scrum** | 10–15 phút mỗi buổi làm việc chung: hôm qua làm gì, hôm nay làm gì, có vướng mắc gì |
| **Sprint Review** | Cuối Sprint: demo tính năng đã hoàn thành, đánh giá so với tiêu chí nghiệm thu |
| **Sprint Retrospective** | Nhóm nhìn lại cách phối hợp, đề xuất cải thiện cho Sprint tiếp theo |

**Công cụ phối hợp:** GitHub Issues + GitHub Projects (Kanban board) + Git PRs.

---

## 🚀 Pull Request Checklist

Trước khi tạo PR, kiểm tra:
- [ ] Code chạy được, không có lỗi syntax hoặc import
- [ ] Commit message đúng convention
- [ ] Không commit file `.env` (chứa API key thật)
- [ ] Không commit thư mục `docs/`, `node_modules/`, `.venv/`
- [ ] Đã tự test thủ công chức năng đã làm
- [ ] Mô tả PR rõ "Đã làm gì" và "Cách test"
