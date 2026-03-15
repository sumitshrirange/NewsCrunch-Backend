const { Router } = require("express");
const ctrl = require("../controllers/newsController");
const { protect } = require("../middleware/authMiddleware");

const router = Router();

router.use(protect);

router.get("/trending", ctrl.getTrending);
router.get("/", ctrl.getFeed);

module.exports = router;
