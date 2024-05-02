const axios = require("axios");
var uuid = require("node-uuid");
const toFixed = require("../Util/toFixed");
const logger = require("../logger");
//const url = "https://data.gateio.co/api2/1/tickers";
const url = "https://api.gateio.ws/api/v4/spot/tickers";

const getGateNewData = (guid) => {
  logger.log('info', `${guid} | ${new Date().toISOString()} | GATE started`);
  return new Promise((resolve, reject) => {
    axios
      .get(url, { timeout: 1750 })
      .then((response) => {
        var res = response.data.map(({ currency_pair, lowest_ask, highest_bid }) => ({
          currency_pair,
          lowest_ask,
          highest_bid,
        }));

        logger.log('info', `${guid} | ${new Date().toISOString()} | GATE response | data.length: ${response.data.length}`);

        /**********************************************************************/
        //ETH olanları aldık.
        /**********************************************************************/
        const res_eth = res.filter((item) => {
          if (item.currency_pair.substr(item.currency_pair.length - 3) === "ETH") {
            return item.currency_pair.includes("ETH");
          }
        });

        const res_eth_usdt = res.filter((item) => { 
          if (item.currency_pair === "ETH_USDT") {
            return item.currency_pair.includes("ETH_USDT");
          }
        });

        for (i in res_eth_usdt) {
          var eth_usdt_capraz_ask = Number(
            parseFloat(res_eth_usdt[i].lowest_ask).toFixed(13)
          );

          var eth_usdt_capraz_bid = Number(
            parseFloat(res_eth_usdt[i].highest_bid).toFixed(13)
          );
        }

        var gateSchema, gateSchemas = [];
        for (i in res_eth) {
          if (
            res_eth[i].lowest_ask &&
            res_eth[i].highest_bid &&
            res_eth[i].lowest_ask > 0 &&
            res_eth[i].highest_bid > 0
          ) {
            gateSchema = {};
            gateSchema._id = uuid.v1();
            gateSchema.parity = res_eth[i].currency_pair.replace("_", "").slice(0, -3);
            gateSchema.buy = toFixed(res_eth[i].lowest_ask * eth_usdt_capraz_ask); //Number(parseFloat(res_eth[i].askPrice).toFixed(10));
            gateSchema.sell = toFixed(res_eth[i].highest_bid * eth_usdt_capraz_bid); //Number(parseFloat(res_eth[i].bidPrice).toFixed(10));
            gateSchema.hambuy = toFixed(res_eth[i].lowest_ask);
            gateSchema.hamsell = toFixed(res_eth[i].highest_bid);
            gateSchema.caprazbuy = eth_usdt_capraz_ask;
            gateSchema.caprazsell = eth_usdt_capraz_bid;
            gateSchema.base = "";
            gateSchema.market = "Gate";
            gateSchema.contractaddress = "";

            gateSchemas.push(gateSchema);
          }
        }

        /**********************************************************************/
        //BTC Çevrim faktörüne göre
        /**********************************************************************/
        const res_btc = res.filter((item) => {
          if (item.currency_pair.substr(item.currency_pair.length - 3) === "BTC") {
            return item.currency_pair.includes("BTC");
          }
        });

        const res_btc_usdt = res.filter((item) => { 
          if (item.currency_pair === "BTC_USDT") {
            return item.currency_pair.includes("BTC_USDT");
          }
        });

        for (i in res_btc_usdt) {
          var btc_usdt_capraz_ask = Number(
            parseFloat(res_btc_usdt[i].lowest_ask).toFixed(13)
          );

          var btc_usdt_capraz_bid = Number(
            parseFloat(res_btc_usdt[i].highest_bid).toFixed(13)
          );
        }

        for (i in res_btc) {
          if (
            res_btc[i].lowest_ask &&
            res_btc[i].highest_bid &&
            res_btc[i].lowest_ask > 0 &&
            res_btc[i].highest_bid > 0
          ) {
            gateSchema = {};
            gateSchema._id = uuid.v1();
            gateSchema.parity = res_btc[i].currency_pair.replace("_", "").replace(new RegExp("BTC" + "$"),"");
            gateSchema.buy = toFixed(res_btc[i].lowest_ask * btc_usdt_capraz_ask); 
            gateSchema.sell = toFixed(res_btc[i].highest_bid * btc_usdt_capraz_bid); 
            gateSchema.hambuy = toFixed(res_btc[i].lowest_ask); 
            gateSchema.hamsell = toFixed(res_btc[i].highest_bid); 
            gateSchema.caprazbuy = btc_usdt_capraz_ask;
            gateSchema.caprazsell = btc_usdt_capraz_bid;
            gateSchema.base = "BTC";
            gateSchema.market = "Gate";
            gateSchema.contractaddress = "";

            gateSchemas.push(gateSchema);
          }
        }

        /**********************************************************************/
        //USDT Çevrim faktörüne göre
        /**********************************************************************/
        const res_usdt = res.filter((item) => {
          if (item.currency_pair.substr(item.currency_pair.length - 4) === "USDT") {
            return item.currency_pair.includes("USDT");
          }
        });

        for (i in res_usdt) {
          if (
            res_usdt[i].lowest_ask &&
            res_usdt[i].highest_bid &&
            res_usdt[i].lowest_ask > 0 &&
            res_usdt[i].highest_bid > 0
          ) {
            gateSchema = {};
            gateSchema._id = uuid.v1();
            gateSchema.parity = res_usdt[i].currency_pair.replace("_", "").replace(new RegExp("USDT" + "$"),"");
            gateSchema.buy = toFixed(res_usdt[i].lowest_ask); 
            gateSchema.sell = toFixed(res_usdt[i].highest_bid); 
            gateSchema.hambuy = 0; 
            gateSchema.hamsell = 0; 
            gateSchema.caprazbuy = 0;
            gateSchema.caprazsell = 0;
            gateSchema.base = "USDT";
            gateSchema.market = "Gate";
            gateSchema.contractaddress = "";

            gateSchemas.push(gateSchema);
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
