var router = require("express").Router();
var passport = require("passport");
var multer = require("multer");
var dockerController = require("../controllers/dockerController");
var accessControlController = require("../controllers/accessControlController");
var shiftInstanceController = require("../controllers/shiftInstanceController");

var storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: function (req, file, cb) {
    cb(null, `${file.originalname}`);
  },
});
const upload = multer({ storage: storage });

router.post(
  "/",
  upload.single("photo"),
  accessControlController.saveUser,
  accessControlController.saveCardInfo,
  accessControlController.saveFingerPrintCapture,
  dockerController.createDocker
);

router.get(
  "/",
  passport.authenticate("access_token", { session: false }),
  dockerController.getAllDockers
);

router.get("/:id", dockerController.getDocker);

router.get("/personID/:id", dockerController.getDockerWithPersonID);

router.get("/:id/shiftsinstances", shiftInstanceController.getDockerShifts);

module.exports = router;
