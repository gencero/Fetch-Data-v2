const getBybitData = require("./bybit.js");
const bybit_upsert = require("./bybit_upsert.js");
var uuid = require("node-uuid");
const logger = require("../logger");

async function getBybitSenkron() {
  await setInterval(intervalfunction, 1300);
}

async function intervalfunction() {
  var guid = await uuid.v1();
  var result = await getBybitData(guid);
  await bybit_upsert(guid, result);
}

module.exports = getBybitSenkron;
