const arbitrage_new = require("./arbitrage_new.js");
const arbitrage_upsert = require("./arbitrage_upsert.js");
var uuid = require("node-uuid");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getArbitrageNewSenkron() {
  await sleep(5000);
  await infinite(); 
}
  
async function infinite() {
  await intervalfunction();
  await setTimeout(infinite, 700);
}
  
async function intervalfunction() {
  var guid = uuid.v1();  
  var result = await arbitrage_new(guid);
  await arbitrage_upsert(result, guid); 
}

module.exports = getArbitrageNewSenkron;
