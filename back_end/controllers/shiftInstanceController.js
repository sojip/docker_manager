const ShiftInstance = require("../models/shiftInstanceModel");
const mongoose = require("mongoose");

module.exports.createShiftInstance = function (req, res, next) {
  var shift = req.body.shiftId;
  var docker = req.body.dockerId;
  var startedshift = req.body.startedshift;

  var shiftinstance = new ShiftInstance({
    shift: mongoose.Types.ObjectId(shift),
    docker: mongoose.Types.ObjectId(docker),
    startedshift: startedshift,
  });

  shiftinstance.save(function (err, shiftinstance_) {
    if (err) return res.status(500).json({ err });
    return res.json(shiftinstance_);
  });
};

module.exports.getShiftDockers = function (req, res, next) {
  var id = req.params.id;
  ShiftInstance.find({ shift: mongoose.Types.ObjectId(id) })
    .select("docker startedshift endedshift")
    .populate("docker")
    .exec(function (err, dockers) {
      if (err) return res.status(500).json({ err });
      return res.json(dockers);
    });
};

// module.exports.getDockerInterruptions = function (req, res, next) {
//   var id = req.params.id;
//   ShiftInstance.find({ docker: mongoose.Types.ObjectId(id) })
//     .populate("interruptions")
//     .exec(function (err, interruptions) {
//       if (err) return res.status(500).json({ err });
//       return res.json(interruptions);
//     });
// };

module.exports.getDockerShifts = function (req, res, next) {
  var id = req.params.id;
  ShiftInstance.find({ docker: mongoose.Types.ObjectId(id) })
    .select("shift startedshift endedshift interruptions")
    .populate("shift interruptions")
    .exec(function (err, shifts) {
      if (err) return res.status(500).json({ err });
      return res.json(shifts);
    });
};
