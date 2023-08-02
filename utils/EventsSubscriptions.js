const DigestClient = require("digest-fetch");
require("dotenv").config();
var {TextDecoderStream} = require("node:stream/web")
// import { TextDecoderStream } from 'node:stream/web';

const fs = require("fs");

module.exports.handleInstancesSubcription = async function (req, res, next) {
  const username = process.env.access_control_username;
  const password = process.env.access_control_password;
  const url = `http://${process.env.access_control_terminal_ip}/ISAPI/Event/notification/alertStream`;
  const client = new DigestClient(username, password, { algorithm: "MD5" });
  try {
    const resp = await client.fetch(url);
    const stream = resp.body;
    const textStream = stream.pipeThrough(new TextDecoderStream());
    console.log(textStream)
    for await (const chunk of textStream) {
    console.log(chunk);
  }

    // const datas = await resp.json();
    // console.log(datas)
    const headers = {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
    };
    res.writeHead(200, headers);
    // fs.createReadStream(buffer.pipeThrough()).pipe(res);
  } catch (e) {
    console.log(e);
    return;
    // next(e);
  }

  //   await res.writeHead(200, headers);
  //   await res.write(datas);

  req.on("close", () => {
    console.log("connection closed");
  });
};
