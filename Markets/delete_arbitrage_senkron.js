const delete_arbitrage = require("./delete_arbitrage.js");

async function deleteArbitrageSenkron (){
    await setInterval(intervalfunction, 1*60*1000);
}

async function intervalfunction(){
    await delete_arbitrage();
}

module.exports = deleteArbitrageSenkron;
