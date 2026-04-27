/**
 * Middleware: authenticate
 * Verifies JWT from Authorization header or cookie.
 * Attaches req.user = { id, name, email, role, studentId? }
 */
const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
  // Accept token from Authorization header OR cookie
  let token =
    (req.headers.authorization || "").replace("Bearer ", "") ||
    (req.cookies && req.cookies.token) ||
    null;

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * Middleware: requireRole(...roles)
 * Must be used after `authenticate`.
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied — requires role: ${roles.join(" or ")}`,
      });
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
