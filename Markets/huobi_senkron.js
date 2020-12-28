const getHuobiNewData = require("./huobi_new.js");
const huobi_upsert = require("./huobi_upsert.js");
var uuid = require("node-uuid");
const logger = require("../logger");

async function getHuobiSenkron (){
    await setInterval(intervalfunction, 1100);
}

async function intervalfunction(){
    var guid = await uuid.v1();
    var result = await getHuobiNewData(guid);
    await huobi_upsert(guid, result);
}

module.exports = getHuobiSenkron;


