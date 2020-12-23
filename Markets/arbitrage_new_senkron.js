const arbitrage_new = require("./arbitrage_new.js");
const arbitrage_upsert = require("./arbitrage_upsert.js");
var uuid = require("node-uuid");

async function getArbitrageNewSenkron() {
  await infinite(); 
}
  
async function infinite() {
  await intervalfunction();
  await setTimeout(infinite, 1500);
}
  
async function intervalfunction() {
  var guid = uuid.v1();  
  var result = await arbitrage_new(guid);
  await arbitrage_upsert(result, guid); 
}

module.exports = getArbitrageNewSenkron;
