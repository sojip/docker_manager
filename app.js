var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var xmlparser = require("express-xml-bodyparser");
var mongoose = require("mongoose");
const http = require("http");
var authRouter = require("./routes/authRouter");
var dockerRouter = require("./routes/dockerRouter");
var accessControlRouter = require("./routes/accessControlRouter");
var shiftRouter = require("./routes/shiftRouter");
var shiftinstanceRouter = require("./routes/shiftinstanceRouter");

const socketio = require("socket.io");

require("dotenv").config();
require("./auth/PassportConfig");

/**
 * Mongodb connection.
 */
var mongodburi = `mongodb+srv://${process.env.username}:${process.env.password}@cluster0.tmdgvq0.mongodb.net/?retryWrites=true&w=majority`;
mongoose.connect(mongodburi, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB Connection Error"));

/**
 * Create Express App.
 */
var app = express();

/**
 * Create HTTP Server.
 */
const server = http.createServer(app);

/**
 * Create the Socket IO server on top of HTTP Server.
 */
const io = socketio(server);
io.on("connection", (socket) => {
  console.log("client connected");
  socket.on("disconnect", (reason) => console.log(reason));
});
// app.set("io", io);

/**
 * Middlewares.
 */
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(xmlparser());
app.use(cookieParser());
app.use("/api/auth", authRouter);
app.use("/api/workers", dockerRouter);
app.use("/api/accesscontroller", accessControlRouter);
app.use("/api/shifts", shiftRouter);
app.use("/api/shiftinstances", shiftinstanceRouter);
/**
 * Indicate folders that should be served.
 */
app.use(express.static(path.join(__dirname, "./front_end/build")));
app.use(express.static(path.join(__dirname, "./public")));

/**
 * Serve React.
 */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "front_end", "build", "index.html"));
});

/**
 * Catch 404 and forward to error handler.
 */
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
  //Access Control listenner is running
  if (err.message === "Handle already running!") {
    console.log("handle already running");
    return;
  }

  console.log(err);
  res.send(err.message);
});

module.exports = { app: app, server: server };
