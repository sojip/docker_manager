const jwt = require("jsonwebtoken");
var passport = require("passport");

module.exports.login = function (req, res, next) {
  passport.authenticate("login", async (err, user, info) => {
    try {
      if (err !== null) return new Error("An Error occured");
      if (!user) return res.json(info);
      req.login(user, { session: false }, (error) => {
        if (error) return next(error);

        const body = {
          _id: user._id,
          username: user.username,
          profile: user.profile,
        };
        const access_token = jwt.sign(
          { user: body },
          process.env.access_token_secret
        );
        const refresh_token = jwt.sign(
          { user: body },
          process.env.refresh_token_secret
          // { expiresIn: 10 }
        );
        //add refresh token to each request cookie
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
};

module.exports.logout = function (req, res, next) {
  if (req.cookies["refresh_token"]) {
    res.clearCookie("refresh_token").status(200).json({
      message: "You have logged out",
    });
  } else {
    res.status(401).json({
      error: "Invalid jwt",
    });
  }
};

module.exports.refreshToken = function (req, res, next) {
  const user = { ...req.user };
  const access_token = jwt.sign(
    { user: user },
    process.env.access_token_secret
  );
  res.json({ access_token, user: user });
};

module.exports.logguest = function (req, res, next) {
  const user = {
    _id: "123456",
    username: "guest",
    profile: "supervisor",
  };
  const access_token = jwt.sign(
    { user: user },
    process.env.access_token_secret
  );
  const refresh_token = jwt.sign(
    { user: user },
    process.env.refresh_token_secret,
    { expiresIn: 300 }
  );
  //add refresh token to each request cookie
  res.cookie("refresh_token", refresh_token, {
    httpOnly: true,
    sameSite: true,
  });

  return res.json({ access_token, user: user });
};
