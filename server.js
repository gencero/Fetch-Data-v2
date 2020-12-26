const express = require("express");
const app = express();
const logger = require("./logger.js");

const getBinanceSenkron = require("./Markets/binance_senkron.js");
const getBittrexSenkron = require("./Markets/bittrex_senkron.js");
const getIdexSenkron = require("./Markets/idex_senkron.js");
const getKucoinSenkron = require("./Markets/kucoin_senkron.js");
const getHuobiSenkron = require("./Markets/huobi_senkron.js");
const getBitmaxSenkron = require("./Markets/bitmax_senkron.js");
const getGateSenkron = require("./Markets/gate_senkron.js");
const getPoloniexSenkron = require("./Markets/poloniex_senkron.js");
const getBitfinexSenkron = require("./Markets/bitfinex_senkron.js");
const getOneinch_Block = require("./Markets/oneinch_blocktime.js");
const getKyber_Block = require("./Markets/kyber_blocktime.js");
const getUniswap3_Block = require("./Markets/uniswap3_blocktime.js");
const getUniswap1_Block = require("./Markets/uniswap1_blocktime.js");
const getBalancer_Block = require("./Markets/balancer_blocktime.js");
const getSushiswap_Block = require("./Markets/sushiswap_blocktime.js");
const getArbitrageNewSenkron = require("./Markets/arbitrage_new_senkron.js");
const deleteArbitrageSenkron = require("./Markets/delete_arbitrage_senkron.js");

 getBinanceSenkron();
 getBittrexSenkron();
 getIdexSenkron();
 getKucoinSenkron();
 getHuobiSenkron();
 getBitmaxSenkron();
 getGateSenkron();
 getOneinch_Block();
 getKyber_Block();
 getUniswap3_Block();
 getUniswap1_Block();
 getPoloniexSenkron();
 getBitfinexSenkron();
 getArbitrageNewSenkron();
 deleteArbitrageSenkron();
 getBalancer_Block();
 getSushiswap_Block();

//routes
app.get('/', (req,res)=> {
    res.send("We are on home");
});

var server = app.listen(process.env.PORT || 5000, function (){
    var port = server.address().port;
    logger.log('info', `App now running on port: ${port}`);
});