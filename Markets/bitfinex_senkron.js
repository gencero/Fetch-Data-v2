const getBitfinexData = require("./bitfinex.js");
const bitfinex_upsert = require("./bitfinex_upsert.js");
var uuid = require("node-uuid");
const logger = require("../logger");

async function getBitfinexSenkron (){
    await setInterval(intervalfunction, 2000);
}

async function intervalfunction(){
    var guid = await uuid.v1(); 
    var result = await getBitfinexData(guid);
    await bitfinex_upsert(guid, result);
}

module.exports = getBitfinexSenkron;


