const axios = require("axios");
const toFixed = require("../Util/toFixed");
var uuid = require("node-uuid");
const logger = require("../logger");

const url = "https://api.mexc.com/api/v3/ticker/bookTicker";

const getMexcData = (guid) => {
  logger.log("info", `${guid} | ${new Date().toISOString()} | MEXC started`);
  return new Promise((resolve, reject) => {
    axios
      .get(url, { timeout: 1200 })
      .then((response) => {
        var res = response.data.map(({ symbol, askPrice, bidPrice }) => ({
            symbol,
            askPrice,
            bidPrice,
        }));

        logger.log(
          "info",
          `${guid} | ${new Date().toISOString()} | MEXC response | data.length: ${
            response.data.length
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

        var mexcSchema,
            mexcSchemas = [];
        for (i in res_eth) {
          if (res_eth[i].askPrice && res_eth[i].bidPrice) {
            mexcSchema = {};
            mexcSchema._id = uuid.v1();
            //okexSchema.parity = res_eth[i].instId;
            //okexSchema.parity = res_eth[i].instId.replace("ETH", "USDT");
            mexcSchema.parity = res_eth[i].symbol.slice(0, -3);
            //okexSchema.buy = toFixed(res_eth[i].ask); //Number(parseFloat(res_eth[i].askPrice).toFixed(10));
            //okexSchema.sell = toFixed(res_eth[i].bid); //Number(parseFloat(res_eth[i].bidPrice).toFixed(10));
            mexcSchema.buy = toFixed(res_eth[i].askPrice * eth_usdt_capraz_ask);
            mexcSchema.sell = toFixed(res_eth[i].bidPrice * eth_usdt_capraz_bid);
            mexcSchema.hambuy = toFixed(res_eth[i].askPrice);
            mexcSchema.hamsell = toFixed(res_eth[i].bidPrice);
            mexcSchema.caprazbuy = eth_usdt_capraz_ask;
            mexcSchema.caprazsell = eth_usdt_capraz_bid;
            mexcSchema.base = "";
            mexcSchema.market = "Mexc";
            mexcSchema.contractaddress = "";

            mexcSchemas.push(mexcSchema);
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

        // const res_btc_eth = res.filter((item) => {
        //   return item.symbol.includes("ETHBTC");
        // });

        // for (i in res_btc_eth) {
        //   var btc_eth_capraz_ask = Number(
        //     parseFloat(res_btc_eth[i].ask).toFixed(13)
        //   );
        //   var btc_eth_capraz_bid = Number(
        //     parseFloat(res_btc_eth[i].bid).toFixed(13)
        //   );
        // }

        for (i in res_btc) {
          if (res_btc[i].askPrice && res_btc[i].bidPrice) {
            mexcSchema = {};
            mexcSchema._id = uuid.v1();
            //okexSchema.parity = res_btc[i].instId.replace("BTC", "ETH");
            //okexSchema.parity = res_btc[i].instId.replace("BTC", "USDT");
            mexcSchema.parity = res_btc[i].symbol.slice(0, -3);
            //okexSchema.buy = toFixed(res_btc[i].ask / btc_eth_capraz_bid);
            //okexSchema.sell = toFixed(res_btc[i].bid / btc_eth_capraz_ask);
            mexcSchema.buy = toFixed(res_btc[i].askPrice * btc_usdt_capraz_ask);
            mexcSchema.sell = toFixed(res_btc[i].bidPrice * btc_usdt_capraz_bid);
            mexcSchema.hambuy = toFixed(res_btc[i].askPrice);
            mexcSchema.hamsell = toFixed(res_btc[i].bidPrice);
            mexcSchema.caprazbuy = btc_usdt_capraz_ask;
            mexcSchema.caprazsell = btc_usdt_capraz_bid;
            mexcSchema.base = "BTC";
            mexcSchema.market = "Mexc";
            mexcSchema.contractaddress = "";

            mexcSchemas.push(mexcSchema);
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

        // const res_usdt_eth = res.filter((item) => {
        //   return item.symbol.includes("ETHUSDT");
        // });

        // for (i in res_usdt_eth) {
        //   var usdt_eth_capraz_ask = Number(
        //     parseFloat(res_usdt_eth[i].ask).toFixed(13)
        //   );
        //   var usdt_eth_capraz_bid = Number(
        //     parseFloat(res_usdt_eth[i].bid).toFixed(13)
        //   );
        // }

        for (i in res_usdt) {
          if (res_usdt[i].askPrice && res_usdt[i].bidPrice) {
            mexcSchema = {};
            mexcSchema._id = uuid.v1();
            //okexSchema.parity = res_usdt[i].instId.replace("USDT", "ETH");
            //okexSchema.parity = res_usdt[i].instId;
            mexcSchema.parity = res_usdt[i].symbol.slice(0, -4);
            // okexSchema.buy = toFixed(res_usdt[i].ask / usdt_eth_capraz_bid);
            // okexSchema.sell = toFixed(res_usdt[i].bid / usdt_eth_capraz_ask);
            mexcSchema.buy = toFixed(res_usdt[i].askPrice);
            mexcSchema.sell = toFixed(res_usdt[i].bidPrice);
            // okexSchema.hambuy = toFixed(res_usdt[i].askPx);
            // okexSchema.hamsell = toFixed(res_usdt[i].bidPx);
            // okexSchema.caprazbuy = usdt_eth_capraz_ask;
            // okexSchema.caprazsell = usdt_eth_capraz_bid;
            mexcSchema.hambuy = 0;
            mexcSchema.hamsell = 0;
            mexcSchema.caprazbuy = 0;
            mexcSchema.caprazsell = 0;
            mexcSchema.base = "USDT";
            mexcSchema.market = "Mexc";
            mexcSchema.contractaddress = "";

            mexcSchemas.push(mexcSchema);
          }
        }

        resolve(mexcSchemas);
      })
      .catch((error) => {
        logger.log(
          "info",
          `${guid} | ${new Date().toISOString()} | MEXC error | + ${error}`
        );
        reject("mexc err: " + error);
      });
  });
};

module.exports = getMexcData;
