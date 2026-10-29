# Hướng Dẫn Cài Đặt & Chạy Dự Án (Developer Setup Guide)

> **Dành cho các thành viên nhóm VocabTalk:** Hướng dẫn chi tiết từ lúc clone code về máy đến khi khởi chạy hoàn chỉnh hệ thống bằng **2 cách: Chạy Local (Hot reload)** và **Chạy hoàn toàn bằng Docker**.

---

## 📌 Bảng tóm tắt cổng dịch vụ (Quick URLs)

Sau khi khởi chạy thành công, mở trình duyệt để truy cập:

| Thành phần | Đường dẫn (URL) | Mục đích |
| :--- | :--- | :--- |
| **Frontend Web App** | `http://localhost:3000` | Giao diện phòng luyện thoại tiếng Anh |
| **Backend REST API** | `http://localhost:8000` | FastAPI Server |
| **Swagger API Docs** | `http://localhost:8000/docs` | Giao diện kiểm thử API tương tác |
| **Adminer Database GUI** | `http://localhost:8080` | Giao diện quản lý trực quan CSDL PostgreSQL |

---

## 🛠️ Yêu cầu môi trường chuẩn bị (Prerequisites)

Cần cài đặt sẵn các công cụ sau trên máy:
1. **Git:** [Tải Git](https://git-scm.com/)
2. **Docker Desktop:** [Tải Docker Desktop](https://www.docker.com/products/docker-desktop/) *(Bắt buộc phải mở Docker Desktop lên trước khi chạy)*
3. **Python:** Phiên bản `3.10` hoặc `3.11` *(chọn "Add python.exe to PATH" khi cài)*
4. **Node.js:** Phiên bản `18.x` hoặc `20.x` LTS *(kèm npm)*

---

## 📥 Bước 1: Clone Repository & Chuyển sang nhánh `dev`

Mở terminal (PowerShell, Command Prompt hoặc Git Bash) và chạy:

```bash
# 1. Clone repo về máy
git clone https://github.com/ahihitoanne/ai-english-conversation-system.git
cd ai-english-conversation-system

# 2. Chuyển sang nhánh dev (Tất cả thành viên làm việc trên dev)
git checkout dev
git pull origin dev
```

---

## ⚙️ Bước 2: Thiết lập biến môi trường (`.env`)

Tạo file `.env` từ file mẫu có sẵn:

### Cho Backend:
```bash
# Copy file mẫu sang file .env thực tế
cp core_backend/.env.example core_backend/.env
# Trên Windows PowerShell:
Copy-Item core_backend\.env.example core_backend\.env
```

### Cho AI Engine:
```bash
# Copy file mẫu sang file .env thực tế
cp ai_engine/.env.example ai_engine/.env
# Trên Windows PowerShell:
Copy-Item ai_engine\.env.example ai_engine\.env
```

> 🔑 **Lưu ý về API Key (Tùy chọn):**  
> - Nếu bạn có `GROQ_API_KEY` ([lấy miễn phí tại console.groq.com](https://console.groq.com/keys)) và `GEMINI_API_KEY` ([lấy miễn phí tại aistudio.google.com](https://aistudio.google.com/app/apikey)), hãy dán vào file `.env`.  
> - **Nếu chưa có key:** Hệ thống vẫn chạy bình thường với chế độ **Mock Test** giả lập thông minh mà không bị crash.

---

## 🚀 CÁCH 1: Chạy Local Dev (Khuyên dùng khi lập trình hàng ngày)

> **Ưu điểm:** Tự động cập nhật code ngay khi lưu (Hot Reload), dễ debug lỗi bằng VS Code, chạy nhẹ máy.

### Cách 1.1: Khởi động 1-Click trên Windows (Nhanh nhất)
Tại thư mục gốc dự án, nhấp đúp vào file **`run_services.bat`** (hoặc gõ `.\run_services.bat` trong PowerShell).  
File script sẽ tự động bật Docker Database, Backend FastAPI và Frontend Next.js trong các cửa sổ riêng.

---

### Cách 1.2: Khởi động thủ công từng bước

#### Bước 1: Bật Database PostgreSQL & Adminer qua Docker
```bash
docker compose up -d
```
> *Đảm bảo Docker Desktop đang mở (có con cá voi màu xanh "Engine running").*

#### Bước 2: Chạy Backend FastAPI
Mở một cửa sổ Terminal mới:
```powershell
cd core_backend

# Tạo môi trường ảo Python (chỉ làm lần đầu)
python -m venv .venv

# Kích hoạt môi trường ảo
# Trên Windows:
.venv\Scripts\activate
# Trên macOS / Linux:
source .venv/bin/activate

# Cài đặt thư viện (chỉ làm lần đầu)
pip install -r requirements.txt

# Khởi chạy server
uvicorn app.main:app --reload --port 8000
```
Server chạy tại: `http://localhost:8000`  
Swagger docs tại: `http://localhost:8000/docs`

#### Bước 3: Chạy Frontend Next.js
Mở thêm một cửa sổ Terminal mới:
```bash
cd frontend

# Cài đặt package Node (chỉ làm lần đầu)
npm install

# Khởi chạy giao diện dev
npm run dev
```
Trang web chạy tại: `http://localhost:3000`

---

## 🐳 CÁCH 2: Chạy Hoàn Toàn Bằng Docker (Full-Stack Containerized)

> **Ưu điểm:** Không cần cài Python hay Node.js trên máy, dùng khi muốn demo sản phẩm nhanh hoặc kiểm tra tính nhất quán giữa các máy của thành viên.

Tại thư mục gốc dự án, chạy 1 lệnh duy nhất:
```bash
docker compose --profile all up -d --build
```

Lệnh này sẽ tự động:
1. Khởi động PostgreSQL 16 (`vocabtalk_postgres`)
2. Khởi động Adminer GUI (`vocabtalk_adminer`)
3. Tự động build và chạy FastAPI Backend container (`vocabtalk_backend`)

### Xem log tiến trình:
```bash
# Xem log của backend
docker logs -f vocabtalk_backend

# Xem log của tất cả service
docker compose logs -f
```

### Dừng toàn bộ hệ thống Docker:
```bash
docker compose --profile all down
```

---

## 🗄️ Hướng dẫn đăng nhập Adminer xem Cơ Sở Dữ Liệu

Khi mở `http://localhost:8080`, điền thông tin đăng nhập:

- **Hệ thống (System):** Chọn `PostgreSQL` *(chú ý đổi từ MySQL sang PostgreSQL)*
- **Máy chủ (Server):** `db`
- **Tên người dùng (Username):** `postgres`
- **Mật khẩu (Password):** `postgrespassword`
- **Cơ sở dữ liệu (Database):** `vocabtalk`

Bấm **Đăng nhập** ➡️ Bạn sẽ thấy các bảng dữ liệu `scenarios`, `vocabularies`, `users`, `session_histories`, `turn_histories` đã được tạo sẵn!

---

## 🌿 Quy Tắc Làm Việc Nhóm Trên Git

1. **Luôn bắt đầu từ nhánh `dev`:**
   ```bash
   git checkout dev
   git pull origin dev
   ```
2. **Tạo nhánh chức năng riêng trước khi code:**
   ```bash
   git checkout -b feature/<tên-tính-năng>
   # Ví dụ: git checkout -b feature/voice-room-ui
   ```
3. **Commit theo chuẩn Conventional Commits:**
   ```bash
   git add .
   git commit -m "feat(frontend): add media recorder audio visualizer"
   ```
4. **Đẩy nhánh lên GitHub & Tạo Pull Request (PR):**
   ```bash
   git push -u origin feature/<tên-tính-năng>
   ```
   Lên GitHub tạo Pull Request merge vào nhánh **`dev`** (nhờ ít nhất 1 bạn trong nhóm review).
5. **Tuyệt đối không push trực tiếp vào `main`.**

---

## ❓ Xử Lý Các Lỗi Thường Gặp (Troubleshooting)

### Lỗi 1: `failed to connect to the docker API at ...`
- **Nguyên nhân:** Phần mềm Docker Desktop chưa được mở hoặc đang khởi động dở.
- **Cách sửa:** Mở Docker Desktop lên, đợi khoảng 30 giây cho con cá voi dưới góc taskbar chuyển sang màu xanh (Engine running) rồi chạy lại lệnh.

### Lỗi 2: `Port 5432 is already in use` hoặc `Port 8000 is already in use`
- **Nguyên nhân:** Máy bạn đang có một PostgreSQL hoặc FastAPI khác đang chạy chiếm cổng.
- **Cách sửa:** Tắt dịch vụ Postgres cũ trên máy (vào Services.msc -> Stop PostgreSQL) hoặc đổi cổng ở file `docker-compose.yml`.

### Lỗi 3: `ModuleNotFoundError: No module named 'ai_engine'`
- **Nguyên nhân:** Chưa cài đặt đầy đủ requirements hoặc chạy Python ngoài thư mục.
- **Cách sửa:** Chạy uvicorn từ thư mục `core_backend` với lệnh:
  ```powershell
  cd core_backend
  .venv\Scripts\uvicorn app.main:app --reload --port 8000
  ```
