/**
 * Worker: emailWorker
 * Run separately:  node src/workers/emailWorker.js
 *
 * Picks jobs from the "email-notifications" Bull queue and sends
 * real emails via Gmail SMTP using Nodemailer.
 */
require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });

const nodemailer  = require("nodemailer");
const { emailQueue }     = require("../queues/emailQueue");
const { buildEmailPayload } = require("../services/emailTemplate");

// ── Nodemailer transporter ────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

transporter.verify((err) => {
  if (err) {
    console.error("❌ [Worker] Gmail connection failed:", err.message);
    console.error("   → Set GMAIL_USER and GMAIL_APP_PASSWORD in .env");
  } else {
    console.log("✅ [Worker] Gmail connected — listening for email jobs…");
  }
});

// ── Process jobs ──────────────────────────────────────────────────────────
emailQueue.process(async (job) => {
  const { student, status, prev } = job.data;
  const schoolName = process.env.SCHOOL_NAME || "Our School";
  const className  = process.env.CLASS_NAME  || "your class";

  const payload = buildEmailPayload({ student, status, prev, schoolName, className });

  if (!payload) {
    console.log(`[Worker] Job #${job.id} — no email needed (${student.name}: ${prev} → ${status})`);
    return { skipped: true };
  }

  await transporter.sendMail({
    from: `"${schoolName}" <${process.env.GMAIL_USER}>`,
    to:   student.parentEmail,
    subject: payload.subject,
    text:    payload.text,
    html:    payload.html,
  });

  console.log(`📧 [Worker] Job #${job.id} — Email sent to ${student.parentEmail} [${status}]`);
  return { sent: true, to: student.parentEmail };
});

// ── Lifecycle logs ────────────────────────────────────────────────────────
emailQueue.on("completed", (job, result) => {
  if (!result.skipped) {
    console.log(`✅ [Worker] Job #${job.id} completed`);
  }
});

emailQueue.on("failed", (job, err) => {
  console.error(`❌ [Worker] Job #${job.id} failed (attempt ${job.attemptsMade}): ${err.message}`);
});

emailQueue.on("stalled", (job) => {
  console.warn(`⚠️  [Worker] Job #${job.id} stalled — will retry`);
});

console.log("\n📮 Email Worker started");
console.log("   Waiting for jobs from Redis queue…\n");
