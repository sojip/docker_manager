const { default: mongoose } = require("mongoose");
const Docker = require("../models/dockerModel");
const path = require("path");

module.exports.createDocker = function (req, res, next) {
  var firstname = req.body.firstname;
  var lastname = req.body.lastname;
  var dateofbirth = new Date(req.body.dateofbirth);
  var position = req.body.position;
  var cni = req.body.cni;
  var fingerprint = req.body.fingerprint || undefined;
  var photo = req.file.path.replace("public", "");
  var docker = new Docker({
    firstname: firstname,
    lastname: lastname,
    dateofbirth: dateofbirth,
    fingerprint: fingerprint,
    position: position,
    photo: photo,
    cni: cni,
  });

  docker.save(function (err, docker) {
    if (err) return next(err);
    return res.json(docker);
  });
};

module.exports.getAllDockers = function (req, res, next) {
  // console.log(req.user);
  Docker.find({}, function (err, dockers) {
    if (err) return next(err);
    return res.json(dockers);
  });
};

module.exports.getDocker = function (req, res, next) {
  var id = req.params.id;
  Docker.findById(mongoose.Types.ObjectId(id), function (err, docker) {
    if (err) return next(err);
    return res.json(docker);
  });
};

module.exports.getPhoto = function (req, res, next) {
  var id = req.params.id;
  Docker.findById(mongoose.Types.ObjectId(id))
    .select("photo")
    .exec(function (err, docker) {
      if (err) return next(err);
      if (docker.photo !== undefined) {
        return res.json(`${docker.photo}`);
      }
      return res.json("");
    });
};
