const getMexcData = require("./mexc.js");
const mexc_upsert = require("./mexc_upsert.js");
var uuid = require("node-uuid");
const logger = require("../logger");

async function getMexcSenkron() {
  await setInterval(intervalfunction, 1300);
}

async function intervalfunction() {
  var guid = await uuid.v1();
  var result = await getMexcData(guid);
  await mexc_upsert(guid, result);
}

module.exports = getMexcSenkron;
