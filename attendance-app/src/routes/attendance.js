const express               = require("express");
const AttendanceController  = require("../controllers/attendanceController");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

// Both roles can read
router.get("/students",   authenticate, AttendanceController.getStudents);
router.get("/stats",      authenticate, AttendanceController.getStats);

// Only teachers can mark attendance
router.post("/attendance", authenticate, requireRole("teacher"), AttendanceController.markAttendance);

module.exports = router;
