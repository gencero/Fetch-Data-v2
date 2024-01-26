const axios = require("axios");
const toFixed = require("../Util/toFixed");
var uuid = require("node-uuid");
const logger = require("../logger");

const url = "https://api.bybit.com/spot/v3/public/quote/ticker/bookTicker";

const getBybitData = (guid) => {
  logger.log("info", `${guid} | ${new Date().toISOString()} | BYBIT started`);
  return new Promise((resolve, reject) => {
    axios
      .get(url, { timeout: 1200 })
      .then((response) => {
        var res = response.data.result.list.map(({ symbol, askPrice, bidPrice }) => ({
            symbol,
            askPrice,
            bidPrice,
        }));
        
        logger.log(
          "info",
          `${guid} | ${new Date().toISOString()} | BYBIT response | data.length: ${
            response.data.result.list.length
          }`
        );
        /**********************************************************************/
        //ETH olanları aldık.
        /**********************************************************************/

        const res_eth = res.filter((item) => {
          if (item.symbol.substr(item.symbol.length - 3) === "ETH") {
            return item.symbol.includes("ETH");
          }
        });

        const res_eth_usdt = res.filter((item) => {
            if (item.symbol === "ETHUSDT") {  
                return item.symbol.includes("ETHUSDT");
            }
        });

        for (i in res_eth_usdt) {
          var eth_usdt_capraz_ask = Number(
            parseFloat(res_eth_usdt[i].askPrice).toFixed(13)
          );
          var eth_usdt_capraz_bid = Number(
            parseFloat(res_eth_usdt[i].bidPrice).toFixed(13)
          );
        }

        var bybitSchema,
            bybitSchemas = [];
        for (i in res_eth) {
          if (res_eth[i].askPrice && res_eth[i].bidPrice) {
            bybitSchema = {};
            bybitSchema._id = uuid.v1();
            bybitSchema.parity = res_eth[i].symbol.slice(0, -3);
            bybitSchema.buy = toFixed(res_eth[i].askPrice * eth_usdt_capraz_ask);
            bybitSchema.sell = toFixed(res_eth[i].bidPrice * eth_usdt_capraz_bid);
            bybitSchema.hambuy = toFixed(res_eth[i].askPrice);
            bybitSchema.hamsell = toFixed(res_eth[i].bidPrice);
            bybitSchema.caprazbuy = eth_usdt_capraz_ask;
            bybitSchema.caprazsell = eth_usdt_capraz_bid;
            bybitSchema.base = "";
            bybitSchema.market = "Bybit";
            bybitSchema.contractaddress = "";

            bybitSchemas.push(bybitSchema);
          }
        }

        /**********************************************************************/
        //BTC Çevrim faktörüne göre
        /**********************************************************************/
        const res_btc = res.filter((item) => {
          if (item.symbol.substr(item.symbol.length - 3) === "BTC") {
            return item.symbol.includes("BTC");
          }
        });

        const res_btc_usdt = res.filter((item) => {
            if (item.symbol === "BTCUSDT") {  
                return item.symbol.includes("BTCUSDT");
            }
        });

        for (i in res_btc_usdt) {
          var btc_usdt_capraz_ask = Number(
            parseFloat(res_btc_usdt[i].askPrice).toFixed(13)
          );
          var btc_usdt_capraz_bid = Number(
            parseFloat(res_btc_usdt[i].bidPrice).toFixed(13)
          );
        }

        for (i in res_btc) {
          if (res_btc[i].askPrice && res_btc[i].bidPrice) {
            bybitSchema = {};
            bybitSchema._id = uuid.v1();
            bybitSchema.parity = res_btc[i].symbol.slice(0, -3);
            bybitSchema.buy = toFixed(res_btc[i].askPrice * btc_usdt_capraz_ask);
            bybitSchema.sell = toFixed(res_btc[i].bidPrice * btc_usdt_capraz_bid);
            bybitSchema.hambuy = toFixed(res_btc[i].askPrice);
            bybitSchema.hamsell = toFixed(res_btc[i].bidPrice);
            bybitSchema.caprazbuy = btc_usdt_capraz_ask;
            bybitSchema.caprazsell = btc_usdt_capraz_bid;
            bybitSchema.base = "BTC";
            bybitSchema.market = "Bybit";
            bybitSchema.contractaddress = "";

            bybitSchemas.push(bybitSchema);
          }
        }

        /**********************************************************************/
        //USDT Çevrim faktörüne göre
        /**********************************************************************/
        const res_usdt = res.filter((item) => {
          if (item.symbol.substr(item.symbol.length - 4) === "USDT") {
            return item.symbol.includes("USDT");
          }
        });

        for (i in res_usdt) {
          if (res_usdt[i].askPrice && res_usdt[i].bidPrice) {
            bybitSchema = {};
            bybitSchema._id = uuid.v1();
            bybitSchema.parity = res_usdt[i].symbol.slice(0, -4);
            bybitSchema.buy = toFixed(res_usdt[i].askPrice);
            bybitSchema.sell = toFixed(res_usdt[i].bidPrice);
            bybitSchema.hambuy = 0;
            bybitSchema.hamsell = 0;
            bybitSchema.caprazbuy = 0;
            bybitSchema.caprazsell = 0;
            bybitSchema.base = "USDT";
            bybitSchema.market = "Bybit";
            bybitSchema.contractaddress = "";

            bybitSchemas.push(bybitSchema);
          }
        }

        resolve(bybitSchemas);
      })
      .catch((error) => {
        logger.log(
          "info",
          `${guid} | ${new Date().toISOString()} | BYBIT error | + ${error}`
        );
        reject("bybit err: " + error);
      });
  });
};

module.exports = getBybitData;
