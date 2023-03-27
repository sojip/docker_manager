const ShiftInstance = require("../models/shiftInstanceModel");
const mongoose = require("mongoose");

module.exports.createShiftInstance = function (req, res, next) {
  var shift = req.body.shiftId;
  var docker = req.body.dockerId;
  var startedshift = req.body.startedshift || true;

  var shiftinstance = new ShiftInstance({
    shift: mongoose.Types.ObjectId(shift),
    docker: mongoose.Types.ObjectId(docker),
    startedshift: startedshift,
  });

  shiftinstance.save(function (err, shiftinstance_) {
    if (err) return next(err);
    return res.json(shiftinstance_);
  });
};

module.exports.getShiftDockers = function (req, res, next) {
  var id = req.params.id;
  ShiftInstance.find({ shift: mongoose.Types.ObjectId(id) })
    .select("docker startedshift endedshift operation")
    .populate("docker")
    .exec(function (err, dockers) {
      if (err) return next(err);
      return res.json(dockers);
    });
};

module.exports.getDockerShifts = function (req, res, next) {
  var id = req.params.id;
  ShiftInstance.find({ docker: mongoose.Types.ObjectId(id) })
    .populate("shift interruptions")
    .exec(function (err, shifts) {
      if (err) return next(err);
      return res.json(shifts);
    });
};

module.exports.addInterruption = function (req, res, next) {
  var id = mongoose.Types.ObjectId(req.params.id);
  var interruption = mongoose.Types.ObjectId(req.body.interruption);

  ShiftInstance.findByIdAndUpdate(
    id,
    { $push: { interruptions: [interruption] } },
    { new: true }
  )
    .populate("docker")
    .exec(function (err, instance) {
      if (err) return next(err);
      return res.json(instance);
    });
};

module.exports.endShift = function (req, res, next) {
  var id = mongoose.Types.ObjectId(req.params.id);
  var operation = {
    type: req.body.opsType,
    position: req.body.opsposition,
    vessel: req.body.opsType === "navire" ? req.body.opsvessel : undefined,
    description: req.body.opsdescription,
  };
  console.log(operation);
  ShiftInstance.findByIdAndUpdate(
    id,
    {
      endedshift: true,
      operation: operation,
    },
    { new: true, populate: { path: "docker" } },
    function (err, instance) {
      if (err) return next(err);
      return res.json(instance);
    }
  );
};

module.exports.getInterruptionShiftInstances = function (req, res, next) {
  let id = mongoose.Types.ObjectId(req.params.id);
  ShiftInstance.find({
    interruptions: id,
  })
    .select("docker")
    .populate("docker")
    .exec(function (err, instances) {
      if (err) return next(err);
      return res.json(instances);
    });
};
