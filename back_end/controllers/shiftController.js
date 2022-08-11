const Shift = require("../models/shiftModel");
var mongoose = require("mongoose");

module.exports.createShift = function (req, res, next) {
  var type = req.body.type;
  var startdate = req.body.startdate;

  var shift = new Shift({
    type: type,
    startdate: startdate,
  });

  shift.save(function (err, shift_) {
    if (err) return res.status(500).json({ err });
    return res.json(shift_);
  });
};

module.exports.getAllShifts = function (req, res, next) {
  Shift.find({}, function (err, shifts) {
    if (err) return res.status(500).json({ err });
    return res.json(shifts);
  });
};

module.exports.getShift = function (req, res, next) {
  var id = req.params.id;
  Shift.findById(mongoose.Types.ObjectId(id), function (err, shift_) {
    if (err) return res.status(500).json({ err });
    return res.json(shift_);
  });
};
