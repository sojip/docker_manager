var router = require("express").Router();
var shiftController = require("../controllers/shiftController");
var interruptionController = require("../controllers/interruptionController");
var shiftInstanceController = require("../controllers/shiftInstanceController");

router.post("/", shiftController.createShift);
router.get("/", shiftController.getAllShifts);
router.get("/:id", shiftController.getShift);
router.put("/:id", shiftController.endShift);
router.get("/:id/interruptions", interruptionController.getShiftInterruptions);
router.get("/:id/workers", shiftInstanceController.getShiftDockers);

module.exports = router;
