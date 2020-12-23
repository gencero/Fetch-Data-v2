const getBinanceNewData = require("./binance_new.js");
const binance_upsert = require("./binance_upsert.js");
var uuid = require("node-uuid");
const logger = require("../logger");

async function getBinanceSenkron (){
    await setInterval(intervalfunction, 2000);
}

async function intervalfunction(){
    var guid = await uuid.v1(); 
    var result = await getBinanceNewData(guid);
    await binance_upsert(guid, result);
}

module.exports = getBinanceSenkron;


