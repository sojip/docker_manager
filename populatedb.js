#! /usr/bin/env node

console.log(
  "This script populates some test datas to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true"
);

// Get arguments passed on command line
var userArgs = process.argv.slice(2);

if (!userArgs[0].startsWith("mongodb")) {
  console.log(
    "ERROR: You need to specify a valid mongodb URL as the first argument"
  );
  // return
}

var async = require("async");
// var Docker = require("./models/dockerModel");
// var Interruption = require("./models/interruptionModel.js");
// var Shift = require("./models/shiftModel");
var User = require("./models/userModel");
// var ShiftInstance = require("./models/shiftInstanceModel");

var bcrypt = require("bcryptjs");
var mongoose = require("mongoose");
var Faker = require("@faker-js/faker");

var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

var dockers = [];
var shifts = [];
var interruptions = [];
var shiftInstances = [];
var users = [];

function userCreate(username, password, cb) {
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return cb(err);
    userdetail = {
      username: username,
      password: hashedPassword,
      profile: "supervisor",
    };
    var user = new User(userdetail);
    user.save(function (err) {
      if (err) {
        cb(err, null);
        return;
      }
      console.log("New user: " + user);
      users.push(user);
      cb(null, user);
    });
  });
}

function dockerCreate(firstname, lastname, dateofbirth, cb) {
  var docker = new Docker({
    firstname: firstname,
    lastname: lastname,
    dateofbirth: dateofbirth,
  });

  docker.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New docker: " + docker);
    dockers.push(docker);
    cb(null, docker);
  });
}

function shiftCreate(type, startdate, cb) {
  shiftdetail = {
    type: type,
    startdate: startdate,
  };

  var shift = new Shift(shiftdetail);
  shift.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New shift: " + shift);
    shifts.push(shift);
    cb(null, shift);
  });
}

function interruptionCreate(shift, duration, description, cb) {
  interruptiondetail = {
    shift: shift,
    duration: duration,
    description: description,
  };

  var interruption = new Interruption(interruptiondetail);
  interruption.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New interruption: " + interruption);
    interruptions.push(interruption);
    cb(null, interruption);
  });
}

function shiftInstanceCreate(
  shift,
  docker,
  startedshift,
  endedshift,
  interruptions,
  cb
) {
  shiftInstancedetail = {
    shift: shift,
    docker: docker,
    startedshift: startedshift,
    endedshift: endedshift,
    interruptions: interruptions,
  };

  var shiftInstance = new ShiftInstance(shiftInstancedetail);
  shiftInstance.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New shiftInstance: " + shiftInstance);
    shiftInstances.push(shiftInstance);
    cb(null, shiftInstance);
  });
}

function createUsers(cb) {
  userCreate("sojip", "sojip1", cb);
}

function createDockers(cb) {
  async.parallel(
    [
      function (callback) {
        dockerCreate(
          Faker.faker.name.firstName(),
          Faker.faker.name.lastName(),
          new Date(1995, 11, 17),
          callback
        );
      },
      function (callback) {
        dockerCreate(
          Faker.faker.name.firstName(),
          Faker.faker.name.lastName(),
          new Date(1994, 01, 15),
          callback
        );
      },
      function (callback) {
        dockerCreate(
          Faker.faker.name.firstName(),
          Faker.faker.name.lastName(),
          new Date(1990, 11, 7),
          callback
        );
      },
      function (callback) {
        dockerCreate(
          Faker.faker.name.firstName(),
          Faker.faker.name.lastName(),
          new Date(1990, 9, 1),
          callback
        );
      },
      function (callback) {
        dockerCreate(
          Faker.faker.name.firstName(),
          Faker.faker.name.lastName(),
          new Date(1987, 4, 27),
          callback
        );
      },
      function (callback) {
        dockerCreate(
          Faker.faker.name.firstName(),
          Faker.faker.name.lastName(),
          new Date(1995, 03, 17),
          callback
        );
      },
      function (callback) {
        dockerCreate(
          Faker.faker.name.firstName(),
          Faker.faker.name.lastName(),
          new Date(1978, 2, 3),
          callback
        );
      },
    ],
    // optional callback
    cb
  );
}

function createShifts(cb) {
  async.parallel(
    [
      function (callback) {
        shiftCreate("jour", new Date(2022, 0, 12, 7, 0), callback);
      },
      function (callback) {
        shiftCreate("nuit", new Date(2022, 0, 12, 19, 0), callback);
      },
      function (callback) {
        shiftCreate("jour", new Date(2022, 0, 13, 7, 0), callback);
      },
      function (callback) {
        shiftCreate("nuit", new Date(2022, 0, 13, 19, 0), callback);
      },
      function (callback) {
        shiftCreate("jour", new Date(2022, 0, 14, 7, 0), callback);
      },
      function (callback) {
        shiftCreate("nuit", new Date(2022, 0, 14, 19, 0), callback);
      },
      function (callback) {
        shiftCreate("jour", new Date(2022, 0, 15, 7, 0), callback);
      },
      function (callback) {
        shiftCreate("nuit", new Date(2022, 0, 15, 19, 0), callback);
      },
      function (callback) {
        shiftCreate("jour", new Date(2022, 8, 1, 7, 0), callback);
      },
      function (callback) {
        shiftCreate("nuit", new Date(2022, 8, 1, 19, 0), callback);
      },
      function (callback) {
        shiftCreate("jour", new Date(2022, 0, 12, 7, 0), callback);
      },
    ],
    // Optional callback
    cb
  );
}

function createInterruptions(cb) {
  async.parallel(
    [
      function (callback) {
        interruptionCreate(
          shifts[0],
          30,
          Faker.faker.lorem.sentence(),
          callback
        );
      },
      function (callback) {
        interruptionCreate(
          shifts[1],
          20,
          Faker.faker.lorem.sentence(),
          callback
        );
      },
      function (callback) {
        interruptionCreate(
          shifts[4],
          60,
          Faker.faker.lorem.sentence(),
          callback
        );
      },
      function (callback) {
        interruptionCreate(
          shifts[0],
          15,
          Faker.faker.lorem.sentence(),
          callback
        );
      },
      function (callback) {
        interruptionCreate(
          shifts[7],
          30,
          Faker.faker.lorem.sentence(),
          callback
        );
      },
      function (callback) {
        interruptionCreate(
          shifts[0],
          10,
          Faker.faker.lorem.sentence(),
          callback
        );
      },
      function (callback) {
        interruptionCreate(
          shifts[0],
          30,
          Faker.faker.lorem.sentence(),
          callback
        );
      },
      function (callback) {
        interruptionCreate(
          shifts[4],
          25,
          Faker.faker.lorem.sentence(),
          callback
        );
      },
      function (callback) {
        interruptionCreate(
          shifts[0],
          10,
          Faker.faker.lorem.sentence(),
          callback
        );
      },
    ],
    // Optional callback
    cb
  );
}

function createShiftInstances(cb) {
  async.parallel(
    [
      function (callback) {
        shiftInstanceCreate(
          shifts[0],
          dockers[0],
          true,
          true,
          interruptions.filter((interruption) => {
            return interruption.shift._id === shifts[0]._id;
          }),
          callback
        );
      },
      function (callback) {
        shiftInstanceCreate(
          shifts[0],
          dockers[1],
          true,
          true,
          interruptions.filter((interruption) => {
            return interruption.shift._id === shifts[0]._id;
          }),
          callback
        );
      },
      function (callback) {
        shiftInstanceCreate(
          shifts[1],
          dockers[2],
          true,
          true,
          interruptions.filter((interruption) => {
            return interruption.shift._id === shifts[1]._id;
          }),
          callback
        );
      },
      function (callback) {
        shiftInstanceCreate(
          shifts[4],
          dockers[4],
          true,
          true,
          interruptions.filter((interruption) => {
            return interruption.shift._id === shifts[4]._id;
          }),
          callback
        );
      },
      function (callback) {
        shiftInstanceCreate(
          shifts[4],
          dockers[0],
          true,
          true,
          interruptions.filter((interruption) => {
            return interruption.shift._id === shifts[4]._id;
          }),
          callback
        );
      },
      function (callback) {
        shiftInstanceCreate(
          shifts[0],
          dockers[3],
          true,
          true,
          undefined,
          callback
        );
      },
      function (callback) {
        shiftInstanceCreate(
          shifts[5],
          dockers[4],
          true,
          true,
          undefined,
          callback
        );
      },
      function (callback) {
        shiftInstanceCreate(
          shifts[10],
          dockers[6],
          true,
          true,
          undefined,
          callback
        );
      },
      function (callback) {
        shiftInstanceCreate(
          shifts[0],
          dockers[6],
          true,
          true,
          interruptions.filter((interruption) => {
            return interruption.shift._id === shifts[0]._id;
          }),
          callback
        );
      },
      function (callback) {
        shiftInstanceCreate(
          shifts[8],
          dockers[5],
          true,
          true,
          undefined,
          callback
        );
      },
      function (callback) {
        shiftInstanceCreate(
          shifts[6],
          dockers[3],
          true,
          true,
          interruptions.filter((interruption) => {
            return interruption.shift._id === shifts[6]._id;
          }),
          callback
        );
      },
    ],
    // Optional callback
    cb
  );
}

async.series(
  [
    createUsers,
    // createDockers,
    // createShifts,
    // createInterruptions,
    // createShiftInstances,
  ],
  // Optional callback
  function (err, results) {
    if (err) {
      console.log("FINAL ERR: " + err);
    }
    console.log("created with success: ");
    // All done, disconnect from database
    mongoose.connection.close();
  }
);
