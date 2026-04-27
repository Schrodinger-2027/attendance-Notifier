const express        = require("express");
const AuthController = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.post("/signup",  AuthController.signup);
router.post("/signin",  AuthController.signin);
router.get("/me",       authenticate, AuthController.me);

module.exports = router;
