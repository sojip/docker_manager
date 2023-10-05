var router = require("express").Router();
var shiftInstanceController = require("../controllers/shiftInstanceController");
var interruptionController = require("../controllers/interruptionController");

router.get(
  "/interruptions/:id/shiftinstances",
  shiftInstanceController.getInterruptionShiftInstances
);

router.post("/interruptions", interruptionController.createInterruption);
router.get("/interruptions", interruptionController.getAllInterruptions);
router.post("/shiftinstances", shiftInstanceController.createShiftInstance);
router.put("/:id/interruptions", shiftInstanceController.addInterruption);
router.put("/:id/", shiftInstanceController.endShift);

module.exports = router;
