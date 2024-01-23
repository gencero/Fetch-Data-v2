const axios = require("axios");
var uuid = require("node-uuid");
const toFixed = require("../Util/toFixed");
const logger = require("../logger");
const url = "https://data.gateio.co/api2/1/tickers";

const getGateNewData = (guid) => {
  logger.log('info', `${guid} | ${new Date().toISOString()} | GATE started`);
  return new Promise((resolve, reject) => {
    axios
      .get(url, { timeout: 1750 })
      .then((response) => {
        var obj = response.data;
        logger.log('info', `${guid} | ${new Date().toISOString()} | GATE response | data.length: ${Object.keys(obj).length}`);

        for (const prop in obj){
            var upperProp = prop.toUpperCase();

            // if (upperProp === "ETH_BTC"){
            //     var btc_eth_capraz_ask = Number(parseFloat(obj[prop].lowestAsk).toFixed(13));
            //     var btc_eth_capraz_bid = Number(parseFloat(obj[prop].highestBid).toFixed(13));
            // }   

            if (upperProp === "BTC_USDT"){
                var btc_usdt_capraz_ask = Number(parseFloat(obj[prop].lowestAsk).toFixed(13));
                var btc_usdt_capraz_bid = Number(parseFloat(obj[prop].highestBid).toFixed(13));
            } 

            if (upperProp === "ETH_USDT"){
                //var usdt_eth_capraz_ask = Number(parseFloat(obj[prop].lowestAsk).toFixed(13));
                //var usdt_eth_capraz_bid = Number(parseFloat(obj[prop].highestBid).toFixed(13));
                var eth_usdt_capraz_ask = Number(parseFloat(obj[prop].lowestAsk).toFixed(13));
                var eth_usdt_capraz_bid = Number(parseFloat(obj[prop].highestBid).toFixed(13));
            }
        }
        
        var gateSchema, gateSchemas = [];
        for (const prop in obj) {
            var upperProp = prop.toUpperCase();

          if (upperProp.includes("_ETH")) {
            if (obj[prop].highestBid && obj[prop].lowestAsk) {
                //gateSchema = new PairInfo();
                gateSchema = {};
                gateSchema._id = uuid.v1();    
                gateSchema.parity = upperProp.replace("_", "").slice(0, -3);
                //gateSchema.sell = obj[prop].highestBid;
                //gateSchema.buy = obj[prop].lowestAsk;
                //gateSchema.hamsell = 0;
                //gateSchema.hambuy = 0;
                //gateSchema.caprazbuy = 0;
                //gateSchema.caprazsell = 0;
                gateSchema.sell = toFixed(obj[prop].highestBid * eth_usdt_capraz_bid);
                gateSchema.buy = toFixed(obj[prop].lowestAsk * eth_usdt_capraz_ask) ;
                gateSchema.hamsell = toFixed(obj[prop].highestBid);
                gateSchema.hambuy = toFixed(obj[prop].lowestAsk);
                gateSchema.caprazbuy = eth_usdt_capraz_ask;
                gateSchema.caprazsell = eth_usdt_capraz_bid;
                gateSchema.base = "";
                gateSchema.market = "Gate";
                gateSchema.contractaddress = "";

                gateSchemas.push(gateSchema);
            }
          }

          if (upperProp.includes("_BTC")) {
            if (obj[prop].highestBid && obj[prop].lowestAsk) {
                //upperProp = upperProp.replace(new RegExp("BTC" + '$'), "ETH");
                //gateSchema = new PairInfo();
                gateSchema = {};
                gateSchema._id = uuid.v1();    
                // gateSchema.parity = upperProp.replace("_", "");
                // gateSchema.sell = toFixed(obj[prop].highestBid / btc_eth_capraz_ask);
                // gateSchema.buy = toFixed(obj[prop].lowestAsk / btc_eth_capraz_bid);
                // gateSchema.hamsell = toFixed(obj[prop].highestBid);
                // gateSchema.hambuy = toFixed(obj[prop].lowestAsk);
                // gateSchema.caprazbuy = btc_eth_capraz_ask;
                // gateSchema.caprazsell = btc_eth_capraz_bid;
                gateSchema.parity = upperProp.replace("_", "").slice(0, -3);
                gateSchema.sell = toFixed(obj[prop].highestBid * btc_usdt_capraz_bid);
                gateSchema.buy = toFixed(obj[prop].lowestAsk * btc_usdt_capraz_ask);
                gateSchema.hamsell = toFixed(obj[prop].highestBid);
                gateSchema.hambuy = toFixed(obj[prop].lowestAsk);
                gateSchema.caprazbuy = btc_usdt_capraz_ask;
                gateSchema.caprazsell = btc_usdt_capraz_bid;

                gateSchema.base = "BTC";
                gateSchema.market = "Gate";
                gateSchema.contractaddress = "";

                gateSchemas.push(gateSchema);
            }
          }

          if (upperProp.includes("_USDT")) {
            if (obj[prop].highestBid && obj[prop].lowestAsk) {
                //upperProp = upperProp.replace(new RegExp("USDT" + '$'), "ETH");
                //gateSchema = new PairInfo();
                gateSchema = {};
                gateSchema._id = uuid.v1();    
                gateSchema.parity = upperProp.replace("_", "").slice(0, -4);
                // gateSchema.sell = toFixed(obj[prop].highestBid / usdt_eth_capraz_ask);
                // gateSchema.buy = toFixed(obj[prop].lowestAsk / usdt_eth_capraz_bid);
                // gateSchema.hamsell = toFixed(obj[prop].highestBid);
                // gateSchema.hambuy = toFixed(obj[prop].lowestAsk);
                // gateSchema.caprazbuy = usdt_eth_capraz_ask;
                // gateSchema.caprazsell =usdt_eth_capraz_bid;
                gateSchema.sell = toFixed(obj[prop].highestBid);
                gateSchema.buy = toFixed(obj[prop].lowestAsk);
                gateSchema.hamsell = 0;
                gateSchema.hambuy = 0;
                gateSchema.caprazbuy = 0;
                gateSchema.caprazsell =0;
                gateSchema.base = "USDT";
                gateSchema.market = "Gate";
                gateSchema.contractaddress = "";

                gateSchemas.push(gateSchema);
            }
          }
        }

        resolve(gateSchemas);
      })
      .catch((error) => {
        logger.log('info', `${guid} | ${new Date().toISOString()} | GATE error | + ${error}`);
        reject("gate err: " + error);
      });
  });
};
module.exports = getGateNewData;
