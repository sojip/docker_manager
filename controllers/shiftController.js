const Shift = require("../models/shiftModel");
var mongoose = require("mongoose");

module.exports.createShift = function (req, res, next) {
  var type = req.body.type;
  var startdate = new Date(req.body.startdate);
  type === "jour" ? startdate.setHours(7) : startdate.setHours(19);

  Shift.find({ startdate: startdate }, function (err, shift) {
    if (err) return next(err);
    if (shift.length)
      return res
        .status(400)
        .json({ message: "Shift Already Exist, Please verify Date and Time" });

    var shift = new Shift({
      type: type,
      startdate: startdate,
    });

    shift.save(function (err, shift_) {
      if (err) return next(err);
      return res.json(shift_);
    });
  });
};

module.exports.getAllShifts = function (req, res, next) {
  Shift.find({}, function (err, shifts) {
    if (err) return next(err);
    return res.json(shifts);
  });
};

module.exports.getShift = function (req, res, next) {
  var id = req.params.id;
  Shift.findById(mongoose.Types.ObjectId(id), function (err, shift_) {
    if (err) return next(err);
    return res.json(shift_);
  });
};

module.exports.endShift = function (req, res, next) {
  var id = req.params.id;
  console.log(id);
  Shift.findByIdAndUpdate(
    mongoose.Types.ObjectId(id),
    { status: "closed" },
    {
      new: true,
    },
    function (err, shift) {
      if (err) return next(err);
      return res.json(shift);
    }
  );
};
