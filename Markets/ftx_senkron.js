const getFtxNewData = require("./ftx_new.js");
const ftx_upsert = require("./ftx_upsert.js");
var uuid = require("node-uuid");
const logger = require("../logger");

async function getFtxSenkron (){
    await setInterval(intervalfunction, 1000);
}

async function intervalfunction(){
    var guid = await uuid.v1();
    var result = await getFtxNewData(guid);
    await ftx_upsert(guid, result);
}

module.exports = getFtxSenkron;
