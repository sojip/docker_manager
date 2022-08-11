const Interruption = require("../models/interruptionModel");
var mongoose = require("mongoose");

module.exports.createInterruption = function (req, res, next) {
  var shift = mongoose.Types.ObjectId(req.body.shift);
  var duration = req.body.duration;
  var description = req.body.description;

  var interruption = new Interruption({
    shift: shift,
    duration: duration,
    description: description,
  });
  interruption.save(function (err, interruption_) {
    if (err) return res.status(500).json({ err });
    return res.json(interruption_);
  });
};

module.exports.getAllInterruptions = function (req, res, next) {
  Interruption.find({})
    .populate("shift")
    .exec(function (err, interruptions) {
      if (err) return res.status(500).json({ err });
      return res.json(interruptions);
    });
};

module.exports.getShiftInterruptions = function (req, res, next) {
  var id = req.params.id;
  Interruption.find(
    { shift: mongoose.Types.ObjectId(id) },
    function (err, interruptions) {
      if (err) return res.status(500).json({ err });
      return res.json(interruptions);
    }
  );
};
