const getOkexData = require("./okex.js");
const okex_upsert = require("./okex_upsert.js");
var uuid = require("node-uuid");
const logger = require("../logger");

async function getOkexSenkron() {
  await setInterval(intervalfunction, 1300);
}

async function intervalfunction() {
  var guid = await uuid.v1();
  var result = await getOkexData(guid);
  await okex_upsert(guid, result);
}

module.exports = getOkexSenkron;
