/**
 * Controller: AuthController
 * Handles user registration and login.
 */
const jwt      = require("jsonwebtoken");
const UserModel = require("../models/User");

const JWT_SECRET  = () => process.env.JWT_SECRET || "dev_secret";
const JWT_EXPIRES = "8h";

class AuthController {
  /**
   * POST /api/auth/signup
   * Body: { name, email, password, role?, studentId? }
   *
   * Note: In production, role should NOT be user-supplied for teacher accounts.
   * Add a TEACHER_INVITE_CODE check here as needed.
   */
  static async signup(req, res) {
    try {
      const { name, email, password, role = "student", studentId = null } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: "name, email, and password are required" });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }
      if (!["teacher", "student"].includes(role)) {
        return res.status(400).json({ error: "role must be teacher or student" });
      }

      const user = await UserModel.create({ name, email, password, role, studentId });
      const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email, role: user.role, studentId: user.studentId },
        JWT_SECRET(),
        { expiresIn: JWT_EXPIRES }
      );

      res.status(201).json({ token, user: UserModel.sanitize(user) });
    } catch (err) {
      if (err.message === "Email already registered") {
        return res.status(409).json({ error: err.message });
      }
      console.error("[AuthController.signup]", err);
      res.status(500).json({ error: "Server error" });
    }
  }

  /**
   * POST /api/auth/signin
   * Body: { email, password }
   */
  static async signin(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "email and password are required" });
      }

      const user = UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const valid = await UserModel.verifyPassword(user, password);
      if (!valid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email, role: user.role, studentId: user.studentId },
        JWT_SECRET(),
        { expiresIn: JWT_EXPIRES }
      );

      res.json({ token, user: UserModel.sanitize(user) });
    } catch (err) {
      console.error("[AuthController.signin]", err);
      res.status(500).json({ error: "Server error" });
    }
  }

  /**
   * GET /api/auth/me  (requires authenticate middleware)
   */
  static me(req, res) {
    res.json({ user: req.user });
  }
}

module.exports = AuthController;
