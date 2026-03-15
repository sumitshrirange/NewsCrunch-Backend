const { Router } = require("express");
const ctrl = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = Router();

router.post("/register", ctrl.register);
router.post("/login", ctrl.login);
router.post("/google", ctrl.googleLogin);
router.post("/refresh", ctrl.refreshToken);
router.post("/logout", protect, ctrl.logout);
router.get("/me", protect, ctrl.getMe);

module.exports = router;
