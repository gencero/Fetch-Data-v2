const getIdex2Data = require("./idex_2.js");
const idex_upsert = require("./idex_upsert.js");
var uuid = require("node-uuid");
const logger = require("../logger");

async function getIdexSenkron (){
    await setInterval(intervalfunction, 1000);
}

async function intervalfunction(){
    var guid = await uuid.v1();
    var result = await getIdex2Data(guid);
    await idex_upsert(guid, result);
}

module.exports = getIdexSenkron;


