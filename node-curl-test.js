const { Curl, CurlAuth } = require("node-libcurl");
const curlTest = new Curl();
require("dotenv").config();

const url = `http://${process.env.access_control_checkin_terminal_ip}/ISAPI/Event/notification/alertStream`;
curlTest.setOpt(Curl.option.URL, url);
curlTest.setOpt(Curl.option.HTTPAUTH, CurlAuth.Digest);
curlTest.setOpt(
  Curl.option.USERPWD,
  `${process.env.access_control_username}:${process.env.access_control_password}`
);
curlTest.setOpt(Curl.option.VERBOSE, true);

// Event listener for data
curlTest.on("data", (chunk, curlInstance) => {
  console.log("Receiving data with size: ", chunk.length);
  console.log(chunk.toString());
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
