const { default: mongoose } = require("mongoose");
const Docker = require("../models/dockerModel");
const path = require("path");
var sharp = require("sharp");
var fs = require("fs");
var crypto = require("crypto");

module.exports.createDocker = async function (req, res, next) {
  //compress photo
  const filename = req.file.filename;
  const extension = req.file.mimetype.replace("image/", "");
  console.table(extension);
  const filenameCompressed =
    crypto.randomUUID() + "-" + filename.replace(extension, "jpeg");
  console.table(filenameCompressed);
  await sharp(req.file.path)
    .toFormat("jpeg", { mozjpeg: true })
    .toFile(path.resolve(req.file.destination, filenameCompressed));
  //save docker in database
  var firstname = req.body.firstname;
  var lastname = req.body.lastname;
  var dateofbirth = req.body.dateofbirth;
  var position = req.body.position;
  var cni = req.body.cni;
  var fingerprint = req.body.fingerprint || undefined;
  var photo = req.file.destination.replace("/public", "") + filenameCompressed;
  console.table(photo);

  var docker = new Docker({
    firstname: firstname,
    lastname: lastname,
    dateofbirth: dateofbirth,
    fingerprint: fingerprint,
    position: position,
    photo: photo,
    cni: cni,
  });

  fs.unlinkSync(req.file.path);

  docker.save(function (err, docker) {
    if (err) return next(err);
    return res.json(docker);
  });
};

module.exports.getAllDockers = function (req, res, next) {
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
