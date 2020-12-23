const getPoloniexData = require("./poloniex.js");
const poloniex_upsert = require("./poloniex_upsert.js");
var uuid = require("node-uuid");
const logger = require("../logger");

async function getPoloniexSenkron (){
    await setInterval(intervalfunction, 2000);
}

async function intervalfunction(){
    var guid = await uuid.v1();
    var result = await getPoloniexData(guid);
    await poloniex_upsert(guid, result);
}

module.exports = getPoloniexSenkron;