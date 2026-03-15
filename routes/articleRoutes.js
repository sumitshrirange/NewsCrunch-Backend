const { Router } = require("express");
const ctrl = require("../controllers/articleController");
const { protect } = require("../middleware/authMiddleware");

const router = Router();

router.use(protect);

router.post("/summarize", ctrl.summarize);
router.get("/stats", ctrl.getStats);
router.get("/", ctrl.list);
router.get("/:id", ctrl.getOne);
router.delete("/:id", ctrl.remove);

module.exports = router;
