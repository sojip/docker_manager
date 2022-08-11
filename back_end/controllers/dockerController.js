const { default: mongoose } = require("mongoose");
const Docker = require("../models/dockerModel");

module.exports.createDocker = function (req, res, next) {
  var firstname = req.body.firstname;
  var lastname = req.body.lastname;
  var dateofbirth = new Date(req.body.dateofbirth);
  var fingerprint = req.body.fingerprint || undefined;

  var docker = new Docker({
    firstname: firstname,
    lastname: lastname,
    dateofbirth: dateofbirth,
    fingerprint: fingerprint,
  });

  docker.save(function (err, docker) {
    if (err) return res.status(500).json({ err });
    return res.json(docker);
  });
};

module.exports.getAllDockers = function (req, res, next) {
  // console.log(req.user);
  Docker.find({}, function (err, dockers) {
    if (err) return res.status(500).json({ err });
    return res.json(dockers);
  });
};

module.exports.getDocker = function (req, res, next) {
  var id = req.params.id;
  Docker.findById(mongoose.Types.ObjectId(id), function (err, docker) {
    if (err) return res.status(500).json({ err });
    return res.json(docker);
  });
};
