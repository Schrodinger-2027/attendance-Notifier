# 🏫 School Attendance Notifier — MVC + Auth + Redis Queue

Refactored from a single-file Express app into a **clean MVC architecture** with:

- **JWT Authentication** — sign-up / sign-in with role-based access
- **Role-based UI** — Teachers can mark attendance; Students get read-only view
- **Redis Bull Queue** — email jobs are enqueued instantly, not sent in-request
- **Separate Email Worker** — picks jobs from Redis and sends via Gmail SMTP
- **Observer Pattern** retained in email template service

---

## 📂 Project Structure

```
attendance-app/
├── src/
│   ├── app.js                    ← Express entry point
│   ├── controllers/
│   │   ├── authController.js     ← sign-up, sign-in, /me
│   │   └── attendanceController.js ← get students, stats, mark attendance
│   ├── models/
│   │   ├── User.js               ← user store + bcrypt auth
│   │   └── Student.js            ← student store + status map
│   ├── routes/
│   │   ├── auth.js               ← /api/auth/*
│   │   └── attendance.js         ← /api/students, /api/stats, /api/attendance
│   ├── middleware/
│   │   └── auth.js               ← authenticate() + requireRole()
│   ├── services/
│   │   └── emailTemplate.js      ← HTML email builder
│   ├── queues/
│   │   └── emailQueue.js         ← Bull queue connected to Redis
│   └── workers/
│       └── emailWorker.js        ← Separate process: consumes queue, sends emails
├── public/
│   └── index.html                ← SPA: auth + role-aware dashboard
├── .env.example
└── package.json
```

---

## ⚙️ Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```

Edit `.env`:
```env
JWT_SECRET=your_random_secret_here
GMAIL_USER=yourschool@gmail.com
GMAIL_APP_PASSWORD=xxxx_xxxx_xxxx_xxxx   # Gmail App Password (not your login password)
SCHOOL_NAME=Springfield Public School
CLASS_NAME=Grade 7 – Room 12
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

### 3. Start Redis
```bash
# macOS
brew services start redis

# Ubuntu/Debian
sudo systemctl start redis

# Docker
docker run -d -p 6379:6379 redis:alpine
```

### 4. Start the server
```bash
node src/app.js
```

### 5. Start the email worker (separate terminal)
```bash
node src/workers/emailWorker.js
```

Open **http://localhost:3000**

---

## 🔐 Authentication

### Demo Accounts
| Role    | Email                  | Password   |
|---------|------------------------|------------|
| Teacher | teacher@school.com     | teacher123 |
| Student | deepak@school.com      | student123 |
| Student | priya@school.com       | student123 |

### Roles
| Action                       | Teacher | Student |
|------------------------------|:-------:|:-------:|
| View roll call & statuses    | ✅      | ✅      |
| Mark Present / Late / Absent | ✅      | ❌ 403  |
| View email queue log         | ✅      | ❌      |

---

## 📬 Email Queue Architecture

```
Teacher marks student absent
        │
        ▼
POST /api/attendance
        │
        ▼
AttendanceController
  → updates in-memory status
  → calls enqueueEmail()
        │
        ▼
Bull Queue (Redis)
  "email-notifications" queue
  Job stored in Redis
        │
        ▼  (separate process)
emailWorker.js
  → picks job from queue
  → builds email via emailTemplate.js
  → sends via Gmail SMTP (Nodemailer)
  → retries up to 3× on failure
```

**Why a queue?**
- Attendance marking responds instantly (no waiting for SMTP)
- Emails retry automatically on transient failures
- Worker can be scaled horizontally
- Redis persists jobs — emails survive server restarts

---

## 🔑 Gmail App Password Setup

1. Enable 2FA on your Google account
2. Go to **Google Account → Security → App Passwords**
3. Create a new app password for "Mail"
4. Paste the 16-character password into `GMAIL_APP_PASSWORD` in `.env`

---

## 🚀 Production Tips

- Replace in-memory `User` and `Student` models with a real DB (PostgreSQL / MongoDB)
- Add a `TEACHER_INVITE_CODE` to the sign-up endpoint to restrict teacher registration
- Run the worker with **PM2**: `pm2 start src/workers/emailWorker.js --name email-worker`
- Use **Bull Board** for a Redis queue dashboard: `npm install @bull-board/express`
