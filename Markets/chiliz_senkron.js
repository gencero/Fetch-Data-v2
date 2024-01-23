const getChilizData = require("./chiliz.js");
const chiliz_upsert = require("./chiliz_upsert.js");
var uuid = require("node-uuid");
const logger = require("../logger");

async function getChilizSenkron() {
  await setInterval(intervalfunction, 1300);
}

async function intervalfunction() {
  var guid = await uuid.v1();
  var result = await getChilizData(guid);
  await chiliz_upsert(guid, result);
}

module.exports = getChilizSenkron;
