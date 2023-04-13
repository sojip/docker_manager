const DigestClient = require("digest-fetch");
var xml = require("xml2js");

//helper function to add years on date
function addYears(date, years) {
  const dateCopy = new Date(date);
  dateCopy.setFullYear(dateCopy.getFullYear() + years);
  return dateCopy;
}

module.exports.captureFingerPrint = function (req, res, next) {
  const username = process.env.access_control_username;
  const password = process.env.access_control_password;
  const url = `http://${process.env.access_control_terminal_ip}/ISAPI/AccessControl/CaptureFingerPrint`;
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/xml",
    },
    body: `<CaptureFingerPrintCond version="2.0" xmlns="http://www.isapi.org/ver20/XMLSchema">
    <fingerNo>1</fingerNo>
</CaptureFingerPrintCond>`,
  };
  const client = new DigestClient(username, password, { algorithm: "MD5" });
  client
    .fetch(url, options)
    .then((resp) => resp.text())
    .then((text) =>
      xml.parseString(text, function (err, results) {
        if (err) return next(err);
        res.json(results);
      })
    )
    .catch((e) => next(e));
};

module.exports.createUser = function (req, res, next) {
  const docker = req.docker;
  const userInfo = {
    UserInfo: {
      employeeNo: docker._id,
      name: `${docker.firstname} ${docker.lastname}`,
      userType: "normal",
      Valid: {
        enable: true,
        beginTime: new Date(Date.now()).toISOString(),
        endTime: addYears(Date.now(), 10).toISOString(),
        timeType: "local",
      },
      doorRight: "1",
      RightPlan: [
        {
          doorNo: 1,
          planTemplateNo: "1",
        },
      ],
    },
  };
  const username = process.env.access_control_username;
  const password = process.env.access_control_password;
  const url = `http://${process.env.access_control_terminal_ip}/ISAPI/AccessControl/UserInfo/Record?format=json`;
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userInfo),
  };
  const client = new DigestClient(username, password, { algorithm: "MD5" });
  client
    .fetch(url, options)
    .then((resp) => resp.json())
    .then((datas) => {
      console.log(datas);
      if (datas.statusCode !== 1)
        throw new Error("Failed To Record User On Access Control");
      console.log("here");
      next();
    })
    .catch((e) => next(e));
};

module.exports.saveFingerPrintCapture = function (req, res, next) {
  console.log(req.docker);
  var docker = req.docker;
  const username = process.env.access_control_username;
  const password = process.env.access_control_password;
  const fingerPrintInfo = {
    FingerPrintCfg: {
      employeeNo: docker._id,
      enableCardReader: [1],
      fingerPrintID: 1,
      fingerType: "normalFP",
      fingerData: docker.fingerprint,
      leaderFP: [1],
    },
  };
  const url = `http://${process.env.access_control_terminal_ip}/ISAPI/AccessControl/FingerPrintDownload?format=json`;
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(fingerPrintInfo),
  };
  const client = new DigestClient(username, password, { algorithm: "MD5" });
  client
    .fetch(url, options)
    .then((resp) => resp.json())
    .then((datas) => {
      if (datas.statusCode !== 1)
        throw new Error("Failed To Record FingerPrint On Access Control");
      res.json(docker);
    })
    .catch((e) => next(e));
};
