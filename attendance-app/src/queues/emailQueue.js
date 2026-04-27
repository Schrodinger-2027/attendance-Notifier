/**
 * Queue: emailQueue
 * Bull queue backed by Redis.
 * Jobs added here are picked up by src/workers/emailWorker.js
 */
const Bull = require("bull");

const redisConfig = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  ...(process.env.REDIS_PASSWORD ? { password: process.env.REDIS_PASSWORD } : {}),
};

const emailQueue = new Bull("email-notifications", { redis: redisConfig });

// Log queue errors (don't crash the server)
emailQueue.on("error", (err) => {
  console.error("❌ [Queue] Redis error:", err.message);
});

emailQueue.on("failed", (job, err) => {
  console.error(`❌ [Queue] Job ${job.id} failed after ${job.attemptsMade} attempts:`, err.message);
});

/**
 * Enqueue an email notification job.
 * @param {object} payload  { student, status, prev, schoolName, className }
 */
async function enqueueEmail(payload) {
  const job = await emailQueue.add(payload, {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: 100, // keep last 100 completed jobs
    removeOnFail: 50,
  });
  console.log(`📬 [Queue] Email job #${job.id} enqueued for ${payload.student.name} [${payload.status}]`);
  return job.id;
}

module.exports = { emailQueue, enqueueEmail };
