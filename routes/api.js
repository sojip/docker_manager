var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");
var dockerController = require("../controllers/dockerController");
var shiftController = require("../controllers/shiftController");
var interruptionController = require("../controllers/interruptionController");
var shiftInstanceController = require("../controllers/shiftInstanceController");
var passport = require("passport");
require("dotenv").config();
const multer = require("multer");
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

//authentication
router.post("/login", async (req, res, next) => {
  passport.authenticate("login", async (err, user, info) => {
    try {
      if (err !== null) return new Error("An Error occured");
      if (!user) return res.json(info);
      req.login(user, { session: false }, async (error) => {
        if (error) return next(error);

        const body = { _id: user._id };
        const access_token = jwt.sign(
          { user: body },
          process.env.access_token_secret
        );
        const refresh_token = jwt.sign(
          { user: body },
          process.env.refresh_token_secret
          // { expiresIn: 10 }
        );
        // added cookie to store jwt token in memory for test
        res.cookie("refresh_token", refresh_token, {
          httpOnly: true,
          sameSite: true,
        });

        return res.json({ access_token, user: body });
      });
    } catch (error) {
      return new Error("An Error Occured");
    }
  })(req, res, next);
});

router.get("/logout", (req, res, next) => {
  if (req.cookies["refresh_token"]) {
    res.clearCookie("refresh_token").status(200).json({
      message: "You have logged out",
    });
  } else {
    res.status(401).json({
      error: "Invalid jwt",
    });
  }
});

router.get(
  "/refresh_token",
  passport.authenticate("refresh_token", { session: false }),
  (req, res, next) => {
    const user = { ...req.user };
    const access_token = jwt.sign(
      { user: user },
      process.env.access_token_secret
    );
    res.json({ access_token, user: user });
  }
);

module.exports = router;
