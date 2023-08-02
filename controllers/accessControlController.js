const DigestClient = require("digest-fetch");
var xml = require("xml2js");
const { Curl, CurlAuth } = require("node-libcurl");
const curlTest = new Curl();
require("dotenv").config();

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
    .then((text) => {
      xml.parseString(text, function (err, results) {
        if (err) return next(err);
        res.json(results);
      });
    })
    .catch((e) => next(e));
};

module.exports.createUser = async function (req, res, next) {
  try {
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var personID = await getPersonID();
    const userInfo = {
      UserInfo: {
        employeeNo: personID.toString(),
        name: `${firstname} ${lastname}`,
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
    const resp = await client.fetch(url, options);
    const datas = await resp.json();
    if (datas.statusCode !== 1) throw new Error(datas.subStatusCode);
    req.personID = personID;
    next();
  } catch (e) {
    next(e);
  }
};

module.exports.saveFingerPrintCapture = function (req, res, next) {
  const username = process.env.access_control_username;
  const password = process.env.access_control_password;
  const fingerPrintInfo = {
    FingerPrintCfg: {
      employeeNo: req.personID.toString(),
      enableCardReader: [1],
      fingerPrintID: 1,
      fingerType: "normalFP",
      fingerData: req.body.fingerprintcapture,
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
      if (datas.statusCode !== 1) throw new Error(datas.subStatusCode);
      next();
    })
    .catch((e) => next(e));
};

async function getPersonID() {
  const username = process.env.access_control_username;
  const password = process.env.access_control_password;
  const url = `http://${process.env.access_control_terminal_ip}/ISAPI/AccessControl/UserInfo/Search?format=json`;
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      UserInfoSearchCond: {
        searchID: "1",
        searchResultPosition: 0,
        maxResults: 3000,
      },
    }),
  };
  const client = new DigestClient(username, password, { algorithm: "MD5" });
  try {
    const resp = await client.fetch(url, options);
    const datas = await resp.json();
    const lastIDused = await datas.UserInfoSearch.UserInfo[
      datas.UserInfoSearch.UserInfo.length - 1
    ]["employeeNo"];
    const personID = Number(await lastIDused) + 1;
    return personID;
  } catch (e) {
    throw new Error("Failed To Get PersonID");
  }
}

module.exports.subscribe = function (req, res, next) {
  const url = `http://${process.env.access_control_terminal_ip}/ISAPI/Event/notification/alertStream`;
  curlTest.setOpt(Curl.option.URL, url);
  curlTest.setOpt(Curl.option.HTTPAUTH, CurlAuth.Digest);
  curlTest.setOpt(
    Curl.option.USERPWD,
    `${process.env.access_control_username}:${process.env.access_control_password}`
  );
  curlTest.setOpt(Curl.option.VERBOSE, true);

  // Event listener for data
  const headers = {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
  };
  res.writeHead(200, headers);
  // res.flushHeaders();
  curlTest.on("data", (chunk, curlInstance) => {
    console.log("Receiving data with size: ", chunk.length);
    console.log(chunk.toString());
    // const io = req.app.get("io");
    // io.emit("event", chunk.toString());
    res.write(chunk.toString());
    res.flush();
  });

  // Event listener for end
  curlTest.on("end", (statusCode, body, headers, curlInstance) => {
    console.info("Status Code: ", statusCode);
    console.info("***");
    console.info("Headers: ", headers);
    console.info("***");
    console.info("Body length: ", body.length);
    console.info("***");
    console.info("Body: ", body);
    console.info("***");
    console.info("Total time taken: " + this.getInfo("TOTAL_TIME"));
    this.close();
  });

  // Error handler for cURL
  curlTest.on("error", (error, errorCode) => {
    console.error("Error: ", error);
    console.error("Code: ", errorCode);
    curlTest.close();
  });

  // Commits this request to the URL
  curlTest.perform();

  res.on("close", () => {
    curlTest.close();
  });
};
