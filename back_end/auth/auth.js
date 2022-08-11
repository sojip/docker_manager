const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const JWTstrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;
require("dotenv").config();
var User = require("../models/userModel");

// ...

passport.use(
  "login",
  new localStrategy(
    {
      usernameField: "username",
      passwordField: "password",
    },
    async (username, password, done) => {
      try {
        const user = await User.findOne({ username });

        if (!user) {
          return done(null, false, { message: "User not found" });
        }

        bcrypt.compare(password, user.password, function (err, isMatch) {
          if (err) return done(err);
          if (!isMatch) return done(null, false, { message: "Wrong Password" });
          return done(null, user, {
            message: "Logged in Successfully",
          });
        });
      } catch (error) {
        return done(error);
      }
    }
  )
);

// ...

passport.use(
  new JWTstrategy(
    {
      secretOrKey: process.env.jwtsecret,
      //   jwtFromRequest: ExtractJWT.fromUrlQueryParameter("token"),
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    },
    async (token, done) => {
      try {
        return done(null, token.user);
      } catch (error) {
        done(error);
      }
    }
  )
);
