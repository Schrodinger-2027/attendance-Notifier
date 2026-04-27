/**
 * Controller: AttendanceController
 * Manages roll call reads and status updates.
 */
const StudentModel  = require("../models/Student");
const { enqueueEmail } = require("../queues/emailQueue");

class AttendanceController {
  /**
   * GET /api/students
   * All roles: returns all students with current status.
   */
  static getStudents(req, res) {
    const students = StudentModel.getAll();
    res.json({ students });
  }

  /**
   * GET /api/stats
   * All roles: returns aggregate attendance counts.
   */
  static getStats(req, res) {
    res.json(StudentModel.getStats());
  }

  /**
   * POST /api/attendance  — TEACHER ONLY
   * Body: { studentId, status: "present"|"absent"|"late" }
   *
   * 1. Updates the in-memory status.
   * 2. Enqueues an email job to Redis (worker sends the actual mail).
   * 3. Returns job ID so the client knows it was queued.
   */
  static async markAttendance(req, res) {
    try {
      const { studentId, status } = req.body;

      if (!studentId || !status) {
        return res.status(400).json({ error: "studentId and status are required" });
      }
      if (!["present", "absent", "late"].includes(status)) {
        return res.status(400).json({ error: "status must be present, absent, or late" });
      }

      const student = StudentModel.findById(studentId);
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }

      const prev = StudentModel.setStatus(student.id, status);
      console.log(`📋 [Attendance] ${student.name}: ${prev} → ${status} (by ${req.user.name})`);

      // Enqueue email job (fire-and-forget style — worker handles delivery)
      const schoolName = process.env.SCHOOL_NAME || "Our School";
      const className  = process.env.CLASS_NAME  || "your class";

      let jobId = null;
      // Only queue if there's something to email
      const shouldEmail =
        status === "absent" ||
        status === "late"   ||
        (status === "present" && (prev === "absent" || prev === "late"));

      if (shouldEmail) {
        jobId = await enqueueEmail({ student, status, prev, schoolName, className });
      }

      res.json({
        success: true,
        student: student.name,
        prev,
        status,
        emailJobId: jobId,
        queued: jobId !== null,
      });
    } catch (err) {
      console.error("[AttendanceController.markAttendance]", err);
      res.status(500).json({ error: "Server error" });
    }
  }
}

module.exports = AttendanceController;
