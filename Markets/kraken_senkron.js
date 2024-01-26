const getKrakenData = require("./kraken.js");
const kraken_upsert = require("./kraken_upsert.js");
var uuid = require("node-uuid");
const logger = require("../logger");

async function getKrakenSenkron() {
  await setInterval(intervalfunction, 1300);
}

async function intervalfunction() {
  var guid = await uuid.v1();
  var result = await getKrakenData(guid);
  await kraken_upsert(guid, result);
}

module.exports = getKrakenSenkron;
