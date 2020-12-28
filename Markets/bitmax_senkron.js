const getBitmaxNewData = require("./bitmax_new.js");
const bitmax_upsert = require("./bitmax_upsert.js");
var uuid = require("node-uuid");
const logger = require("../logger");

async function getBitmaxSenkron (){
     await setInterval(intervalfunction, 1200);
}

async function intervalfunction(){
    var guid = await uuid.v1(); 
    var result = await getBitmaxNewData(guid);
    await bitmax_upsert(guid, result);
}

module.exports = getBitmaxSenkron;


