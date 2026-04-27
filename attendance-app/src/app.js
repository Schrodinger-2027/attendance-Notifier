require("dotenv").config();

const express  = require("express");
const cors     = require("cors");
const path     = require("path");

const authRoutes       = require("./routes/auth");
const attendanceRoutes = require("./routes/attendance");

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// ── API Routes ────────────────────────────────────────────────────────────
app.use("/api/auth",  authRoutes);
app.use("/api",       attendanceRoutes);

// ── SPA fallback (serve index.html for all non-API routes) ────────────────
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// ── Global error handler ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("[App Error]", err);
  res.status(500).json({ error: "Internal server error" });
});

// ── Start ─────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🏫 School Attendance Notifier (MVC)`);
  console.log(`   → http://localhost:${PORT}`);
  console.log(`   → Gmail:  ${process.env.GMAIL_USER || "NOT SET — check .env"}`);
  console.log(`   → Redis:  ${process.env.REDIS_HOST || "127.0.0.1"}:${process.env.REDIS_PORT || 6379}`);
  console.log(`\n   📌 Start email worker:  node src/workers/emailWorker.js\n`);
});
