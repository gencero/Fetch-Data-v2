const getGateNewData = require("./gate_new.js");
const gate_upsert = require("./gate_upsert.js");
var uuid = require("node-uuid");
const logger = require("../logger");

async function getGateSenkron (){
    await setInterval(intervalfunction, 2000);
}

async function intervalfunction(){
    var guid = await uuid.v1();
    var result = await getGateNewData(guid);
    await gate_upsert(guid, result);
}

module.exports = getGateSenkron;


