/**
 * Model: User
 * In-memory store (swap for DB in production).
 * Roles: "teacher" | "student"
 */
const bcrypt = require("bcryptjs");

const users = [
  // Pre-seeded teacher account
  {
    id: 1,
    name: "Mrs. Sharma",
    email: "teacher@school.com",
    passwordHash: bcrypt.hashSync("teacher123", 10),
    role: "teacher",
  },
  // Pre-seeded student accounts
  {
    id: 2,
    name: "Deepak Singh",
    email: "deepak@school.com",
    passwordHash: bcrypt.hashSync("student123", 10),
    role: "student",
    studentId: 1,
  },
  {
    id: 3,
    name: "Priya Mehta",
    email: "priya@school.com",
    passwordHash: bcrypt.hashSync("student123", 10),
    role: "student",
    studentId: 2,
  },
];

let nextId = users.length + 1;

class UserModel {
  static findByEmail(email) {
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  static findById(id) {
    return users.find((u) => u.id === id) || null;
  }

  static async create({ name, email, password, role = "student", studentId = null }) {
    if (this.findByEmail(email)) {
      throw new Error("Email already registered");
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = { id: nextId++, name, email, passwordHash, role, studentId };
    users.push(user);
    return user;
  }

  static async verifyPassword(user, password) {
    return bcrypt.compare(password, user.passwordHash);
  }

  static sanitize(user) {
    const { passwordHash, ...safe } = user;
    return safe;
  }
}

module.exports = UserModel;
