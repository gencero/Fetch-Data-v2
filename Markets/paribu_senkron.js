const getParibuData = require("./paribu.js");
const paribu_upsert = require("./paribu_upsert.js");
var uuid = require("node-uuid");
const logger = require("../logger");

async function getParibuSenkron() {
  await setInterval(intervalfunction, 1300);
}

async function intervalfunction() {
  var guid = await uuid.v1();
  var result = await getParibuData(guid);
  await paribu_upsert(guid, result);
}

module.exports = getParibuSenkron;
