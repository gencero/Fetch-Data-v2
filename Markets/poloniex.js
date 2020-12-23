const axios = require("axios");
var uuid = require("node-uuid");
const toFixed = require("../Util/toFixed");
const poloNameFormat = require("../Util/marketNameFormat").poloNameFormat;
const logger = require("../logger");

const url = "https://poloniex.com/public?command=returnTicker";

const getPoloniexData = (guid) => {
  logger.log('info', `${guid} | ${new Date().toISOString()} | POLONIEX started`);
  return new Promise((resolve, reject) => {
    axios
      .get(url, { timeout: 1750 })
      .then((response) => {
        var obj = response.data;

        logger.log('info', `${guid} | ${new Date().toISOString()} | POLONIEX response | data.length: ${response.data.length}`);

        for (const prop in obj){

            if (prop === "BTC_ETH"){
                var btc_eth_capraz_ask = Number(parseFloat(obj[prop].lowestAsk).toFixed(13));
                var btc_eth_capraz_bid = Number(parseFloat(obj[prop].highestBid).toFixed(13));
            }   

            if (prop === "USDT_ETH"){
                var usdt_eth_capraz_ask = Number(parseFloat(obj[prop].lowestAsk).toFixed(13));
                var usdt_eth_capraz_bid = Number(parseFloat(obj[prop].highestBid).toFixed(13));
            }
        }

        count = 0;
        var poloSchema, poloSchemas = [];
        for (const prop in obj) {

          if (prop.substr(0,4) == "ETH_") {
            if (obj[prop].highestBid && obj[prop].lowestAsk) {
                //poloSchema = new PairInfo();
                poloSchema = {};
                poloSchema._id = uuid.v1(); 
                poloSchema.parity = poloNameFormat(prop);
                poloSchema.sell = obj[prop].highestBid;
                poloSchema.buy = obj[prop].lowestAsk;
                poloSchema.hamsell = 0;
                poloSchema.hambuy = 0;
                poloSchema.caprazbuy = 0;
                poloSchema.caprazsell = 0;
                poloSchema.base = "";
                poloSchema.market = "Poloniex";
                poloSchema.contractaddress = "";

                poloSchemas.push(poloSchema);
            }
            count= count + 1;
          }

          
          if (prop.substr(0,4) == "BTC_") {
            if (obj[prop].highestBid && obj[prop].lowestAsk) {

                repProp = prop.replace(new RegExp("BTC" + '$'), "ETH");
                //poloSchema = new PairInfo();
                poloSchema = {};
                poloSchema._id = uuid.v1(); 
                poloSchema.parity = poloNameFormat(repProp);
                poloSchema.sell = toFixed(obj[prop].highestBid / btc_eth_capraz_ask);
                poloSchema.buy = toFixed(obj[prop].lowestAsk / btc_eth_capraz_bid);
                poloSchema.hamsell = toFixed(obj[prop].highestBid);
                poloSchema.hambuy = toFixed(obj[prop].lowestAsk);
                poloSchema.caprazbuy = btc_eth_capraz_ask;
                poloSchema.caprazsell = btc_eth_capraz_bid;
                poloSchema.base = "BTC";
                poloSchema.market = "Poloniex";
                poloSchema.contractaddress = "";

                poloSchemas.push(poloSchema);
            }
          }

          if (prop.substr(0,4) == "USDT") {
            if (obj[prop].highestBid && obj[prop].lowestAsk) {

                repProp = prop.replace(new RegExp("USDT" + '$'), "ETH");
                //poloSchema = new PairInfo();
                poloSchema = {};
                poloSchema._id = uuid.v1();
                poloSchema.parity = poloNameFormat(repProp);
                poloSchema.sell = toFixed(obj[prop].highestBid / usdt_eth_capraz_ask);
                poloSchema.buy = toFixed(obj[prop].lowestAsk / usdt_eth_capraz_bid);
                poloSchema.hamsell = toFixed(obj[prop].highestBid);
                poloSchema.hambuy = toFixed(obj[prop].lowestAsk);
                poloSchema.caprazbuy = usdt_eth_capraz_ask;
                poloSchema.caprazsell =usdt_eth_capraz_bid;
                poloSchema.base = "USDT";
                poloSchema.market = "Poloniex";
                poloSchema.contractaddress = "";

                poloSchemas.push(poloSchema);
            }
          }
        }

        resolve(poloSchemas);
      })
      .catch((error) => {
        logger.log('info', `${guid} | ${new Date().toISOString()} | POLONIEX error | + ${error}`);
        reject("poloniex err: " + error);
      });
  });
};

module.exports = getPoloniexData;
