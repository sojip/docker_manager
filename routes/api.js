var express = require("express");
var dockerController = require("../controllers/dockerController");
var shiftController = require("../controllers/shiftController");
var interruptionController = require("../controllers/interruptionController");
var shiftInstanceController = require("../controllers/shiftInstanceController");
var authController = require("../controllers/authController");
var passport = require("passport");
require("dotenv").config();
const multer = require("multer");

var router = express.Router();

var storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: function (req, file, cb) {
    cb(null, `${file.originalname}`);
  },
});
const upload = multer({ storage: storage });

router.post("/workers", upload.single("photo"), dockerController.createDocker);
router.get(
  "/workers",
  passport.authenticate("access_token", { session: false }),
  dockerController.getAllDockers
);
router.get("/workers/:id", dockerController.getDocker);
router.post("/shifts", shiftController.createShift);
router.get("/shifts", shiftController.getAllShifts);
router.get(
  "/shifts/:id/interruptions",
  interruptionController.getShiftInterruptions
);

router.get(
  "/workers/:id/shiftsinstances",
  shiftInstanceController.getDockerShifts
);
router.get(
  "/interruptions/:id/shiftinstances",
  shiftInstanceController.getInterruptionShiftInstances
);

router.get("/shifts/:id", shiftController.getShift);
router.put("/shifts/:id", shiftController.endShift);
router.get("/shifts/:id/workers", shiftInstanceController.getShiftDockers);
router.post("/interruptions", interruptionController.createInterruption);
router.get("/interruptions", interruptionController.getAllInterruptions);
router.post("/shiftinstances", shiftInstanceController.createShiftInstance);
router.put(
  "/shiftinstances/:id/interruptions",
  shiftInstanceController.addInterruption
);
router.put("/shiftinstances/:id/shift", shiftInstanceController.endShift);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.get(
  "/refresh_token",
  passport.authenticate("refresh_token", { session: false }),
  authController.refreshToken
);

router.get("/logguest", authController.logguest);

module.exports = router;
