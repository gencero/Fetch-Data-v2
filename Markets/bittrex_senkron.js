const getBittrexNewData = require("./bittrex_new.js");
const bittrex_upsert = require("./bittrex_upsert.js");
var uuid = require("node-uuid");
const logger = require("../logger");

async function getBittrexSenkron (){
    await setInterval(intervalfunction, 1000);
}

async function intervalfunction(){
    var guid = await uuid.v1();
    var result = await getBittrexNewData(guid);
    await bittrex_upsert(guid, result);
}

module.exports = getBittrexSenkron;
