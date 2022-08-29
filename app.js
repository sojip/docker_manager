var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
require("dotenv").config();
var mongoose = require("mongoose");
require("./auth/auth");

//mongodb connection
var mongodburi = `mongodb+srv://${process.env.username}:${process.env.password}@cluster0.gfhtwet.mongodb.net/?retryWrites=true&w=majority`;

mongoose.connect(mongodburi, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
var db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB Connection Error"));

var apiRouter = require("./routes/api");
var usersRouter = require("./routes/users");

var app = express();
app.use(cors());

// view engine setup
// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", apiRouter);
app.use("/users", usersRouter);

// app.use(express.static(path.join(__dirname, "./public")));
//indicate react app folder
app.use(express.static(path.join(__dirname, "./front_end/build")));

// app.get("/", function (req, res, next) {
//   res.render("index", { title: "Express" });
// });

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  console.log(err);
  res.send("error");
});

//serve react
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "front_end", "build", "index.html"));
});

module.exports = app;
