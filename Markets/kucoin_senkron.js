const getKucoinNewData = require("./kucoin_new.js");
const kucoin_upsert = require("./kucoin_upsert.js");
var uuid = require("node-uuid");
const logger = require("../logger");

async function getKucoinSenkron (){
    await setInterval(intervalfunction, 2000);
}

async function intervalfunction(){
    var guid = await uuid.v1();
    var result = await getKucoinNewData(guid);
    await kucoin_upsert(guid, result);
}

module.exports = getKucoinSenkron;


