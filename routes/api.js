var dockerController = require("../controllers/dockerController");
var shiftController = require("../controllers/shiftController");
var interruptionController = require("../controllers/interruptionController");
var shiftInstanceController = require("../controllers/shiftInstanceController");
var accessControlController = require("../controllers/accessControlController");
var authController = require("../controllers/authController");
// var eventsSubcription = require("../utils/EventsSubscriptions");
var passport = require("passport");
var router = require("express").Router();
const multer = require("multer");
var storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: function (req, file, cb) {
    cb(null, `${file.originalname}`);
  },
});
const upload = multer({ storage: storage });

router.post(
  "/workers",
  upload.single("photo"),
  accessControlController.createUser,
  accessControlController.saveFingerPrintCapture,
  dockerController.createDocker
);
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
router.get("/capture_fingerprint", accessControlController.captureFingerPrint);

//online subscription
router.get(
  "/accesscontroller/events/subscribe",
  accessControlController.subscribe
);

// router.get(
//   "/accesscontroller/events/unsubscribe",
//   accessControlController.unsubscribe
// );

module.exports = router;
