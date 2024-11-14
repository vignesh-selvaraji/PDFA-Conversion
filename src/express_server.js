const express = require("express");
const aport = require('aport');
const { bind_express_port_to_ipchandler } = require('./ipcMainHandler');
module.exports.start_express = async function () {
  const exapp = express();
  let port = -1;
  try {
    port = await aport();
  }
  catch (err) {
    console.log("");
  }
  const server = exapp.listen(port, "127.0.0.1");
  server.setTimeout(240000);
  bind_express_port_to_ipchandler(port);
  return server;
}