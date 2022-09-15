const Interruption = require("../models/interruptionModel");
var mongoose = require("mongoose");

module.exports.createInterruption = function (req, res, next) {
  var shift = mongoose.Types.ObjectId(req.body.shift);
  var starttime = req.body.starttime;
  var endtime = req.body.endtime;
  var duration = Number(req.body.duration);
  var description = req.body.description;

  var interruption = new Interruption({
    shift: shift,
    starttime: starttime,
    endtime: endtime,
    duration: duration,
    description: description,
  });
  interruption.save(function (err, interruption_) {
    if (err) return next(err);
    return res.json(interruption_);
  });
};

module.exports.getAllInterruptions = function (req, res, next) {
  Interruption.find({})
    .populate("shift")
    .exec(function (err, interruptions) {
      if (err) return next(err);
      return res.json(interruptions);
    });
};

module.exports.getShiftInterruptions = function (req, res, next) {
  var id = req.params.id;
  Interruption.find(
    { shift: mongoose.Types.ObjectId(id) },
    function (err, interruptions) {
      if (err) return next(err);
      return res.json(interruptions);
    }
  );
};
