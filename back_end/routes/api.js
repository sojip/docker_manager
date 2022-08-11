var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");
var dockerController = require("../controllers/dockerController");
var shiftController = require("../controllers/shiftController");
var interruptionController = require("../controllers/interruptionController");
var shiftInstanceController = require("../controllers/shiftInstanceController");
var passport = require("passport");
require("dotenv").config();

router.post("/workers", dockerController.createDocker);
router.get(
  "/workers",
  //   passport.authenticate("jwt", { session: false }),
  dockerController.getAllDockers
);
router.get("/workers/:id", dockerController.getDocker);
router.post("/shifts", shiftController.createShift);
router.get("/shifts", shiftController.getAllShifts);
router.get(
  "/shifts/:id/interruptions",
  interruptionController.getShiftInterruptions
);
router.get("/shifts/:id", shiftController.getShift);
router.get("/shifts/:id/workers", shiftInstanceController.getShiftDockers);
router.post("/interruptions", interruptionController.createInterruption);
router.get("/interruptions", interruptionController.getAllInterruptions);
router.post("/shiftinstances", shiftInstanceController.createShiftInstance);

//authentication
router.post("/login", async (req, res, next) => {
  passport.authenticate("login", async (err, user, info) => {
    try {
      if (err !== null) return new Error("An Error occured");
      if (!user) return res.json({ info });
      req.login(user, { session: false }, async (error) => {
        if (error) return next(error);

        const body = { _id: user._id };
        const token = jwt.sign({ user: body }, process.env.jwtsecret);

        return res.json({ token, username: user.username });
      });
    } catch (error) {
      return new Error("An Error Occured");
    }
  })(req, res, next);
});

module.exports = router;
