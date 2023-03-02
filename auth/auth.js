const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const JWTstrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;
var User = require("../models/userModel");
require("dotenv").config();

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

passport.use(
  "access_token",
  new JWTstrategy(
    {
      secretOrKey: process.env.access_token_secret,
      // jwtFromRequest: cookieExtractor,
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

//extract jwt from cookie for test
const cookieExtractor = (req) => {
  let refresh_token = null;
  if (req && req.cookies) {
    refresh_token = req.cookies["refresh_token"];
  }
  return refresh_token;
};

passport.use(
  "refresh_token",
  new JWTstrategy(
    {
      secretOrKey: process.env.refresh_token_secret,
      jwtFromRequest: cookieExtractor,
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
