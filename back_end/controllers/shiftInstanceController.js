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
