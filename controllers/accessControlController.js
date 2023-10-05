const DigestClient = require("digest-fetch");
var xml = require("xml2js");
const { Curl, CurlAuth } = require("node-libcurl");
require("dotenv").config();
/**
 * For Development as unmounting the component do not close the persistent connection
 */
// var curl = new Curl();
// var terminateCurl = curl.close.bind(curl);

module.exports.captureFingerPrint = function (req, res, next) {
  var access_control_terminal_ip = req.params.ipaddress;
  const username = process.env.access_control_username;
  const password = process.env.access_control_password;
  const url = `http://${access_control_terminal_ip}/ISAPI/AccessControl/CaptureFingerPrint`;
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

module.exports.captureCardInfo = async function (req, res, next) {
  var access_control_terminal_ip = req.params.ipaddress;
  try {
    const username = process.env.access_control_username;
    const password = process.env.access_control_password;
    const url = `http://${access_control_terminal_ip}/ISAPI/AccessControl/CaptureCardInfo?format=json`;
    const client = new DigestClient(username, password, { algorithm: "MD5" });
    const resp = await client.fetch(url);
    const data = await resp.json();
    return res.json(data);
  } catch (e) {
    next(e);
  }
};

module.exports.subscribeToEvents = function (req, res, next) {
  /**
   * For Production as unmounting the component close the persistent connection
   */
  var access_control_terminal_ip = req.params.ipaddress;
  var curl = new Curl();
  const terminateCurl = curl.close.bind(curl);
  const url = `http://${access_control_terminal_ip}/ISAPI/Event/notification/alertStream`;
  /** Define options for curl request */
  curl.setOpt(Curl.option.URL, url);
  curl.setOpt(Curl.option.HTTPAUTH, CurlAuth.Digest);
  curl.setOpt(
    Curl.option.USERPWD,
    `${process.env.access_control_username}:${process.env.access_control_password}`
  );
  curl.setOpt(Curl.option.VERBOSE, true);

  curl.on("data", (chunk, curlInstance) => {
    console.log("********");
    console.log("Receiving data with size: ", chunk.length);
    console.log(chunk.toString());
    console.log("********");
    res.write(chunk.toString());
  });

  // Event listener for end
  curl.on("end", (statusCode, body, headers, curlInstance) => {
    console.log("request ending");
    terminateCurl();
    res.end();
  });

  // Error handler for cURL
  curl.on("error", (error, errorCode) => {
    console.log("error on access control listener");
    terminateCurl();
  });

  // Commits this request to the URL
  curl.perform();
  res.on("close", terminateCurl);
};

module.exports.getRecords = async function (req, res, next) {
  const access_control_terminal_ip = req.params.ipaddress;
  const searchPosition = req.body.searchPosition;
  const conditions = {
    AcsEventCond: {
      searchID: "1",
      searchResultPosition: searchPosition,
      maxResults: 10,
      major: 0,
      minor: 0,
      eventAttribute: "attendance",
    },
  };
  const username = process.env.access_control_username;
  const password = process.env.access_control_password;
  const url = `http://${access_control_terminal_ip}/ISAPI/AccessControl/AcsEvent?format=json`;
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(conditions),
  };
  const client = new DigestClient(username, password, { algorithm: "MD5" });
  client
    .fetch(url, options)
    .then((resp) => resp.json())
    .then((data) => {
      return res.json(data);
    })
    .catch((e) => next(e));
};

module.exports.getRecordsTotal = async function (req, res, next) {
  const access_control_terminal_ip = req.params.ipaddress;
  const conditions = {
    AcsEventTotalNumCond: {
      major: 0,
      minor: 0,
      eventAttribute: "attendance",
    },
  };
  const username = process.env.access_control_username;
  const password = process.env.access_control_password;
  const url = `http://${access_control_terminal_ip}/ISAPI/AccessControl/AcsEventTotalNum?format=json`;
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(conditions),
  };
  const client = new DigestClient(username, password, { algorithm: "MD5" });
  try {
    const resp = await client.fetch(url, options);
    const data = await resp.json();
    return res.json(data.AcsEventTotalNum);
  } catch (e) {
    next(e);
  }
};

module.exports.saveUser = async function (req, res, next) {
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
    const checkinurl = `http://${process.env.access_control_checkin_terminal_ip}/ISAPI/AccessControl/UserInfo/Record?format=json`;
    const checkouturl = `http://${process.env.access_control_checkout_terminal_ip}/ISAPI/AccessControl/UserInfo/Record?format=json`;
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userInfo),
    };
    const client = new DigestClient(username, password, { algorithm: "MD5" });
    const responses = await Promise.all([
      client.fetch(checkinurl, options),
      client.fetch(checkouturl, options),
    ]);

    const resps = await Promise.all(
      responses.map(async (response) => await response.json())
    );
    for (let resp of resps) {
      if (resp.statusCode !== 1) throw new Error(resp.subStatusCode);
    }
    req.personID = personID;
    next();
  } catch (e) {
    next(e);
  }
};

module.exports.saveCardInfo = async function (req, res, next) {
  const username = process.env.access_control_username;
  const password = process.env.access_control_password;
  const checkinurl = `http://${process.env.access_control_checkin_terminal_ip}/ISAPI/AccessControl/CardInfo/Record?format=json`;
  const checkouturl = `http://${process.env.access_control_checkout_terminal_ip}/ISAPI/AccessControl/CardInfo/Record?format=json`;
  const cardInfo = {
    CardInfo: {
      employeeNo: req.personID.toString(),
      cardNo: req.body.cardInfo,
      deleteCard: false,
      cardType: "normalCard",
      leaderCard: "1",
      checkEmployeeNo: true,
      addCard: true,
    },
  };
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cardInfo),
  };

  const client = new DigestClient(username, password, { algorithm: "MD5" });

  try {
    const responses = await Promise.all([
      client.fetch(checkinurl, options),
      client.fetch(checkouturl, options),
    ]);
    const resps = await Promise.all(
      responses.map(async (response) => await response.json())
    );
    for (let resp of resps) {
      if (resp.statusCode !== 1) throw new Error(resp.subStatusCode);
    }
    next();
  } catch (e) {
    next(e);
  }
};

module.exports.saveFingerPrintCapture = async function (req, res, next) {
  const username = process.env.access_control_username;
  const password = process.env.access_control_password;
  const fingerPrintInfoCheckIn = {
    FingerPrintCfg: {
      employeeNo: req.personID.toString(),
      enableCardReader: [1],
      fingerPrintID: 1,
      fingerType: "normalFP",
      fingerData: req.body.fingerprintcapturecheckIn,
      leaderFP: [1],
    },
  };
  const fingerPrintInfoCheckOut = {
    FingerPrintCfg: {
      employeeNo: req.personID.toString(),
      enableCardReader: [1],
      fingerPrintID: 1,
      fingerType: "normalFP",
      fingerData: req.body.fingerprintcapturecheckOut,
      leaderFP: [1],
    },
  };
  const checkinurl = `http://${process.env.access_control_checkin_terminal_ip}/ISAPI/AccessControl/FingerPrintDownload?format=json`;
  const checkouturl = `http://${process.env.access_control_checkout_terminal_ip}/ISAPI/AccessControl/FingerPrintDownload?format=json`;

  const checkinoptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(fingerPrintInfoCheckIn),
  };
  const checkoutoptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(fingerPrintInfoCheckOut),
  };
  const client = new DigestClient(username, password, { algorithm: "MD5" });
  try {
    const responses = await Promise.all([
      client.fetch(checkinurl, checkinoptions),
      client.fetch(checkouturl, checkoutoptions),
    ]);
    const resps = await Promise.all(
      responses.map(async (response) => await response.json())
    );
    for (let resp of resps) {
      if (resp.statusCode !== 1) throw new Error(resp.subStatusCode);
    }
    next();
  } catch (e) {
    next(e);
  }
};

// module.exports.captureFingerPrintCheckIn = function (req, res, next) {
//   const username = process.env.access_control_username;
//   const password = process.env.access_control_password;
//   const url = `http://${process.env.access_control_checkin_terminal_ip}/ISAPI/AccessControl/CaptureFingerPrint`;
//   const options = {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/xml",
//     },
//     body: `<CaptureFingerPrintCond version="2.0" xmlns="http://www.isapi.org/ver20/XMLSchema">
//     <fingerNo>1</fingerNo>
// </CaptureFingerPrintCond>`,
//   };
//   const client = new DigestClient(username, password, { algorithm: "MD5" });
//   client
//     .fetch(url, options)
//     .then((resp) => resp.text())
//     .then((text) => {
//       xml.parseString(text, function (err, results) {
//         if (err) return next(err);
//         res.json(results);
//       });
//     })
//     .catch((e) => next(e));
// };

// module.exports.captureFingerPrintCheckOut = function (req, res, next) {
//   const username = process.env.access_control_username;
//   const password = process.env.access_control_password;
//   const url = `http://${process.env.access_control_checkout_terminal_ip}/ISAPI/AccessControl/CaptureFingerPrint`;
//   const options = {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/xml",
//     },
//     body: `<CaptureFingerPrintCond version="2.0" xmlns="http://www.isapi.org/ver20/XMLSchema">
//     <fingerNo>1</fingerNo>
// </CaptureFingerPrintCond>`,
//   };
//   const client = new DigestClient(username, password, { algorithm: "MD5" });
//   client
//     .fetch(url, options)
//     .then((resp) => resp.text())
//     .then((text) => {
//       xml.parseString(text, function (err, results) {
//         if (err) return next(err);
//         res.json(results);
//       });
//     })
//     .catch((e) => next(e));
// };

// module.exports.checkOutSubscription = function (req, res, next) {
//   /**
//    * For Production as unmounting the component close the persistent connection
//    */

//   // var curlTest = new Curl();
//   // const terminateCurl = curlTest.close.bind(curlTest);

//   const url = `http://${process.env.access_control_checkout_terminal_ip}/ISAPI/Event/notification/alertStream`;
//   checkOutCurl.setOpt(Curl.option.URL, url);
//   checkOutCurl.setOpt(Curl.option.HTTPAUTH, CurlAuth.Digest);
//   checkOutCurl.setOpt(
//     Curl.option.USERPWD,
//     `${process.env.access_control_username}:${process.env.access_control_password}`
//   );
//   checkOutCurl.setOpt(Curl.option.VERBOSE, true);

//   checkOutCurl.on("data", (chunk, curlInstance) => {
//     console.log("********");
//     console.log("Receiving data with size: ", chunk.length);
//     console.log(chunk.toString());
//     console.log("********");
//     res.write(chunk.toString());
//   });

//   // Event listener for end
//   checkOutCurl.on("end", (statusCode, body, headers, curlInstance) => {
//     console.log("request ending");
//     terminateCheckOutCurl();
//     res.end();
//   });

//   // Error handler for cURL
//   checkOutCurl.on("error", (error, errorCode) => {
//     console.log("error on access control listener");
//     terminateCheckOutCurl();
//   });

//   // Commits this request to the URL
//   checkOutCurl.perform();
//   res.on("close", terminateCheckOutCurl);
// };

// module.exports.getRecordsCheckIn = async function (req, res, next) {
//   const searchPosition = req.body.searchPosition;
//   const conditions = {
//     AcsEventCond: {
//       searchID: "1",
//       searchResultPosition: searchPosition,
//       maxResults: 10,
//       major: 0,
//       minor: 0,
//       eventAttribute: "attendance",
//     },
//   };
//   const username = process.env.access_control_username;
//   const password = process.env.access_control_password;
//   const url = `http://${process.env.access_control_checkin_terminal_ip}/ISAPI/AccessControl/AcsEvent?format=json`;
//   const options = {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(conditions),
//   };
//   const client = new DigestClient(username, password, { algorithm: "MD5" });
//   client
//     .fetch(url, options)
//     .then((resp) => resp.json())
//     .then((data) => {
//       return res.json(data);
//     })
//     .catch((e) => next(e));
// };

// module.exports.getRecordsCheckOut = async function (req, res, next) {
//   const searchPosition = req.body.searchPosition;
//   const conditions = {
//     AcsEventCond: {
//       searchID: "1",
//       searchResultPosition: searchPosition,
//       maxResults: 10,
//       major: 0,
//       minor: 0,
//       eventAttribute: "attendance",
//     },
//   };
//   const username = process.env.access_control_username;
//   const password = process.env.access_control_password;
//   const url = `http://${process.env.access_control_checkout_terminal_ip}/ISAPI/AccessControl/AcsEvent?format=json`;
//   const options = {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(conditions),
//   };
//   const client = new DigestClient(username, password, { algorithm: "MD5" });
//   client
//     .fetch(url, options)
//     .then((resp) => resp.json())
//     .then((data) => {
//       return res.json(data);
//     })
//     .catch((e) => next(e));
// };

// module.exports.getTotalRecordsCheckIn = async function (req, res, next) {
//   const conditions = {
//     AcsEventTotalNumCond: {
//       major: 0,
//       minor: 0,
//       eventAttribute: "attendance",
//     },
//   };
//   const username = process.env.access_control_username;
//   const password = process.env.access_control_password;
//   const url = `http://${process.env.access_control_checkin_terminal_ip}/ISAPI/AccessControl/AcsEventTotalNum?format=json`;
//   const options = {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(conditions),
//   };
//   const client = new DigestClient(username, password, { algorithm: "MD5" });
//   try {
//     const resp = await client.fetch(url, options);
//     const data = await resp.json();
//     return res.json(data.AcsEventTotalNum);
//   } catch (e) {
//     next(e);
//   }
// };

// module.exports.getTotalRecordsCheckOut = async function (req, res, next) {
//   const conditions = {
//     AcsEventTotalNumCond: {
//       major: 0,
//       minor: 0,
//       eventAttribute: "attendance",
//     },
//   };
//   const username = process.env.access_control_username;
//   const password = process.env.access_control_password;
//   const url = `http://${process.env.access_control_checkout_terminal_ip}/ISAPI/AccessControl/AcsEventTotalNum?format=json`;
//   const options = {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(conditions),
//   };
//   const client = new DigestClient(username, password, { algorithm: "MD5" });
//   try {
//     const resp = await client.fetch(url, options);
//     const data = await resp.json();
//     return res.json(data.AcsEventTotalNum);
//   } catch (e) {
//     next(e);
//   }
// };

/**
 *
 * Helpers
 */

async function getPersonID() {
  const username = process.env.access_control_username;
  const password = process.env.access_control_password;
  const url = `http://${process.env.access_control_checkin_terminal_ip}/ISAPI/AccessControl/UserInfo/Search?format=json`;
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

function addYears(date, years) {
  const dateCopy = new Date(date);
  dateCopy.setFullYear(dateCopy.getFullYear() + years);
  return dateCopy;
}
