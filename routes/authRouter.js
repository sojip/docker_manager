const router = require("express").Router();
var authController = require("../controllers/authController");
var passport = require("passport");

router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.get(
  "/refresh_token",
  passport.authenticate("refresh_token", { session: false }),
  authController.refreshToken
);

module.exports = router;
