# University Student CRUD

ระบบตัวอย่างจัดการข้อมูลนักศึกษาของมหาวิทยาลัย รองรับ Create, Read, Update และ Delete โดยใช้ React, Node.js/Express, MySQL และ Docker Compose

## Services

| Service | URL / Port | หน้าที่ |
|---|---|---|
| Frontend | http://localhost:3000 | React build ที่ให้บริการผ่าน Nginx |
| Backend | http://localhost:3001/api | REST API ด้วย Express |
| phpMyAdmin | http://localhost:8080 | จัดการฐานข้อมูลผ่านเว็บ |
| MySQL | localhost:3306 | ฐานข้อมูล MySQL 8.4 |

## เริ่มใช้งาน

ต้องติดตั้ง Docker Desktop หรือ Docker Engine พร้อม Docker Compose

```bash
cp .env.example .env
docker compose up --build
```

จากนั้นเปิด http://localhost:3000 ข้อมูลตัวอย่าง 5 รายการจะถูก seed เมื่อสร้าง MySQL volume ครั้งแรก

บัญชี phpMyAdmin ตามค่าเริ่มต้น:

- Server: `mysql`
- Username: `student_app`
- Password: `student_password`

## API

| Method | Endpoint | รายละเอียด |
|---|---|---|
| GET | `/api/health` | ตรวจสอบสถานะ API และฐานข้อมูล |
| GET | `/api/students` | ดูนักศึกษาทั้งหมด (`?search=คำค้น`) |
| GET | `/api/students/:id` | ดูข้อมูลรายคน |
| POST | `/api/students` | เพิ่มนักศึกษา |
| PUT | `/api/students/:id` | แก้ไขนักศึกษา |
| DELETE | `/api/students/:id` | ลบนักศึกษา |

## คำสั่งที่ใช้บ่อย

```bash
docker compose ps
docker compose logs -f
docker compose down
```

หากต้องการลบข้อมูลทั้งหมดและให้ seed ใหม่ในครั้งถัดไป:

```bash
docker compose down -v
docker compose up --build
```

## Deploy: Vercel + Render + TiDB Cloud

โครงสร้าง production ที่แนะนำ:

```text
Vercel (React) -> Render (Express API) -> TiDB Cloud
```

Docker Compose, MySQL container และ phpMyAdmin ยังคงใช้สำหรับพัฒนาในเครื่องเท่านั้น

### 1. เตรียม TiDB Cloud

1. สร้าง TiDB Cloud Starter หรือ Essential instance
2. สร้าง database ชื่อ `university`
3. เปิด SQL Editor แล้วรันไฟล์ `database/init.sql` เพื่อสร้างตารางและ seed data
4. เปิดหน้า Connect และเก็บค่า Host, Port, User และ Password ไว้ใช้กับ Render

### 2. Deploy backend ไป Render

วิธีที่ง่ายที่สุดคือสร้าง Render Blueprint จาก repository นี้ โดย Render จะอ่าน `render.yaml` และสร้าง Docker Web Service ที่ใช้ `backend/Dockerfile`

ระหว่างสร้าง Blueprint ให้กรอกค่าที่ Render ถามดังนี้:

| Variable | ค่า |
|---|---|
| `DB_HOST` | Host จาก TiDB Cloud |
| `DB_USER` | User จาก TiDB Cloud |
| `DB_PASSWORD` | Password จาก TiDB Cloud |
| `CORS_ORIGIN` | URL frontend เช่น `https://student-profile.vercel.app` โดยไม่ใส่ `/` ท้าย URL |

ค่าอื่นถูกกำหนดไว้ใน `render.yaml` แล้ว:

```text
DB_PORT=4000
DB_NAME=university
DB_SSL=true
DB_CONNECTION_LIMIT=5
```

หลัง deploy ให้ตรวจ URL ต่อไปนี้ โดยต้องได้ `status: ok`:

```text
https://<render-service>.onrender.com/api/health
```

หากสร้าง Web Service เองโดยไม่ใช้ Blueprint ให้ตั้งค่า:

```text
Runtime: Docker
Root Directory: backend
Health Check Path: /api/health
Region: Singapore
```

### 3. Deploy frontend ไป Vercel

Import repository เดียวกันและตั้งค่า:

```text
Root Directory: frontend
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
```

เพิ่ม Environment Variable ใน Vercel:

```text
VITE_API_URL=https://<render-service>.onrender.com/api
```

จากนั้น redeploy frontend เพื่อให้ Vite นำ URL ไปใช้ตอน build ไฟล์ `frontend/vercel.json` จะดูแล SPA fallback ให้แล้ว

หาก URL ของ Vercel เปลี่ยน ให้แก้ `CORS_ORIGIN` ใน Render แล้ว deploy backend ใหม่ โดยรองรับหลาย origin ด้วย comma เช่น:

```text
https://app.example.com,https://student-profile.vercel.app
```

### Environment aliases สำหรับ TiDB

Backend รองรับทั้งชื่อ `DB_*` และชื่อตัวแปรจาก TiDB Integration ต่อไปนี้:

```text
TIDB_HOST
TIDB_PORT
TIDB_USER
TIDB_PASSWORD
TIDB_DATABASE
TIDB_ENABLE_SSL
```
