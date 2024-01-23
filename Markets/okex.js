const axios = require("axios");
const toFixed = require("../Util/toFixed");
var uuid = require("node-uuid");
const logger = require("../logger");

const url = "https://www.okx.com/api/v5/market/tickers?instType=SPOT";

const getOkexData = (guid) => {
  logger.log("info", `${guid} | ${new Date().toISOString()} | OKEX started`);
  return new Promise((resolve, reject) => {
    axios
      .get(url, { timeout: 1200 })
      .then((response) => {
        var res = response.data.data.map(({ instId, askPx, bidPx }) => ({
          instId,
          askPx,
          bidPx,
        }));

        var res = res.map(function (item) {
          return Object.assign(item, {
            instId: item.instId.replace("-", ""),
            bidPx: item.bidPx,
            askPx: item.askPx,
          });
        });
        logger.log(
          "info",
          `${guid} | ${new Date().toISOString()} | OKEX response | data.length: ${
            response.data.data.length
          }`
        );
        /**********************************************************************/
        //ETH olanları aldık.
        /**********************************************************************/
        const res_eth = res.filter((item) => {
          if (item.instId.substr(item.instId.length - 3) === "ETH") {
            return item.instId.includes("ETH");
          }
        });

        const res_eth_usdt = res.filter((item) => {
            if (item.instId === "ETHUSDT") {  
                return item.instId.includes("ETHUSDT");
            }
        });

        for (i in res_eth_usdt) {
          var eth_usdt_capraz_ask = Number(
            parseFloat(res_eth_usdt[i].askPx).toFixed(13)
          );
          var eth_usdt_capraz_bid = Number(
            parseFloat(res_eth_usdt[i].bidPx).toFixed(13)
          );
        }

        var okexSchema,
          okexSchemas = [];
        for (i in res_eth) {
          if (res_eth[i].askPx && res_eth[i].bidPx) {
            okexSchema = {};
            okexSchema._id = uuid.v1();
            //okexSchema.parity = res_eth[i].instId;
            //okexSchema.parity = res_eth[i].instId.replace("ETH", "USDT");
            okexSchema.parity = res_eth[i].instId.slice(0, -3);
            //okexSchema.buy = toFixed(res_eth[i].ask); //Number(parseFloat(res_eth[i].askPrice).toFixed(10));
            //okexSchema.sell = toFixed(res_eth[i].bid); //Number(parseFloat(res_eth[i].bidPrice).toFixed(10));
            okexSchema.buy = toFixed(res_eth[i].askPx * eth_usdt_capraz_ask);
            okexSchema.sell = toFixed(res_eth[i].bidPx * eth_usdt_capraz_bid);
            okexSchema.hambuy = toFixed(res_eth[i].askPx);
            okexSchema.hamsell = toFixed(res_eth[i].bidPx);
            okexSchema.caprazbuy = eth_usdt_capraz_ask;
            okexSchema.caprazsell = eth_usdt_capraz_bid;
            okexSchema.base = "";
            okexSchema.market = "Okex";
            okexSchema.contractaddress = "";

            okexSchemas.push(okexSchema);
          }
        }

        /**********************************************************************/
        //BTC Çevrim faktörüne göre
        /**********************************************************************/
        const res_btc = res.filter((item) => {
          if (item.instId.substr(item.instId.length - 3) === "BTC") {
            return item.instId.includes("BTC");
          }
        });

        const res_btc_usdt = res.filter((item) => {
            if (item.instId === "BTCUSDT") {  
                return item.instId.includes("BTCUSDT");
            }
        });

        for (i in res_btc_usdt) {
          var btc_usdt_capraz_ask = Number(
            parseFloat(res_btc_usdt[i].askPx).toFixed(13)
          );
          var btc_usdt_capraz_bid = Number(
            parseFloat(res_btc_usdt[i].bidPx).toFixed(13)
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
          if (res_btc[i].askPx && res_btc[i].bidPx) {
            okexSchema = {};
            okexSchema._id = uuid.v1();
            //okexSchema.parity = res_btc[i].instId.replace("BTC", "ETH");
            //okexSchema.parity = res_btc[i].instId.replace("BTC", "USDT");
            okexSchema.parity = res_btc[i].instId.slice(0, -3);
            //okexSchema.buy = toFixed(res_btc[i].ask / btc_eth_capraz_bid);
            //okexSchema.sell = toFixed(res_btc[i].bid / btc_eth_capraz_ask);
            okexSchema.buy = toFixed(res_btc[i].askPx * btc_usdt_capraz_ask);
            okexSchema.sell = toFixed(res_btc[i].bidPx * btc_usdt_capraz_bid);
            okexSchema.hambuy = toFixed(res_btc[i].askPx);
            okexSchema.hamsell = toFixed(res_btc[i].bidPx);
            okexSchema.caprazbuy = btc_usdt_capraz_ask;
            okexSchema.caprazsell = btc_usdt_capraz_bid;
            okexSchema.base = "BTC";
            okexSchema.market = "Okex";
            okexSchema.contractaddress = "";

            okexSchemas.push(okexSchema);
          }
        }

        /**********************************************************************/
        //USDT Çevrim faktörüne göre
        /**********************************************************************/
        const res_usdt = res.filter((item) => {
          if (item.instId.substr(item.instId.length - 4) === "USDT") {
            return item.instId.includes("USDT");
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
          if (res_usdt[i].askPx && res_usdt[i].bidPx) {
            okexSchema = {};
            okexSchema._id = uuid.v1();
            //okexSchema.parity = res_usdt[i].instId.replace("USDT", "ETH");
            //okexSchema.parity = res_usdt[i].instId;
            okexSchema.parity = res_usdt[i].instId.slice(0, -4);
            // okexSchema.buy = toFixed(res_usdt[i].ask / usdt_eth_capraz_bid);
            // okexSchema.sell = toFixed(res_usdt[i].bid / usdt_eth_capraz_ask);
            okexSchema.buy = toFixed(res_usdt[i].askPx);
            okexSchema.sell = toFixed(res_usdt[i].bidPx);
            // okexSchema.hambuy = toFixed(res_usdt[i].askPx);
            // okexSchema.hamsell = toFixed(res_usdt[i].bidPx);
            // okexSchema.caprazbuy = usdt_eth_capraz_ask;
            // okexSchema.caprazsell = usdt_eth_capraz_bid;
            okexSchema.hambuy = 0;
            okexSchema.hamsell = 0;
            okexSchema.caprazbuy = 0;
            okexSchema.caprazsell = 0;
            okexSchema.base = "USDT";
            okexSchema.market = "Okex";
            okexSchema.contractaddress = "";

            okexSchemas.push(okexSchema);
          }
        }

        resolve(okexSchemas);
      })
      .catch((error) => {
        logger.log(
          "info",
          `${guid} | ${new Date().toISOString()} | OKEX error | + ${error}`
        );
        reject("okex err: " + error);
      });
  });
};

module.exports = getOkexData;
