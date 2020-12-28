const axios = require("axios");
const toFixed = require("../Util/toFixed");
var uuid = require("node-uuid");
const logger = require("../logger");

const url = "https://bitmax.io/api/pro/v1/ticker";

const getBitmaxNewData = (guid) => {
  logger.log('info', `${guid} | ${new Date().toISOString()} | BITMAX started`);
  return new Promise((resolve, reject) => {
    axios
      .get(url, { timeout: 1100 })
      .then((response) => {
        var res = response.data.data.map(({ symbol, ask, bid }) => ({
          symbol,
          ask,
          bid,
        }));

        var res = res.map(function (item) {
          return Object.assign(item, {
            symbol: item.symbol.replace("/", ""),
            bid: item.bid[0],
            ask: item.ask[0],
          });
        });
        logger.log('info', `${guid} | ${new Date().toISOString()} | BITMAX response | data.length: ${response.data.data.length}`);
        /**********************************************************************/
        //ETH olanları aldık.
        /**********************************************************************/
        const res_eth = res.filter((item) => {
          if (item.symbol.substr(item.symbol.length - 3) === "ETH") {
            return item.symbol.includes("ETH");
          }
        });

        var bitmaxSchema, bitmaxSchemas = [];
        for (i in res_eth) {
          if (res_eth[i].ask && res_eth[i].bid) {
            //bitmaxSchema = new PairInfo();
            bitmaxSchema = {};
            bitmaxSchema._id = uuid.v1();
            bitmaxSchema.parity = res_eth[i].symbol;
            bitmaxSchema.buy = toFixed(res_eth[i].ask); //Number(parseFloat(res_eth[i].askPrice).toFixed(10));
            bitmaxSchema.sell = toFixed(res_eth[i].bid); //Number(parseFloat(res_eth[i].bidPrice).toFixed(10));
            bitmaxSchema.hambuy = 0;
            bitmaxSchema.hamsell = 0;
            bitmaxSchema.caprazbuy = 0;
            bitmaxSchema.caprazsell = 0;
            bitmaxSchema.base = "";
            bitmaxSchema.market = "Bitmax";
            bitmaxSchema.contractaddress = "";

            bitmaxSchemas.push(bitmaxSchema);
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

        const res_btc_eth = res.filter((item) => {
          return item.symbol.includes("ETHBTC");
        });

        for (i in res_btc_eth) {
          var btc_eth_capraz_ask = Number(parseFloat(res_btc_eth[i].ask).toFixed(13));
          var btc_eth_capraz_bid = Number(parseFloat(res_btc_eth[i].bid).toFixed(13));
        }

        for (i in res_btc) {
          if (res_btc[i].ask && res_btc[i].bid) {
            //bitmaxSchema = new PairInfo();
            bitmaxSchema = {};
            bitmaxSchema._id = uuid.v1();
            bitmaxSchema.parity = res_btc[i].symbol.replace("BTC", "ETH");
            bitmaxSchema.buy = toFixed(res_btc[i].ask / btc_eth_capraz_bid);
            bitmaxSchema.sell = toFixed(res_btc[i].bid / btc_eth_capraz_ask);
            bitmaxSchema.hambuy = toFixed(res_btc[i].ask);
            bitmaxSchema.hamsell = toFixed(res_btc[i].bid);
            bitmaxSchema.caprazbuy = btc_eth_capraz_ask;
            bitmaxSchema.caprazsell = btc_eth_capraz_bid;
            bitmaxSchema.base = "BTC";
            bitmaxSchema.market = "Bitmax";
            bitmaxSchema.contractaddress = "";

            bitmaxSchemas.push(bitmaxSchema);
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

        const res_usdt_eth = res.filter((item) => {
          return item.symbol.includes("ETHUSDT");
        });

        for (i in res_usdt_eth) {
          var usdt_eth_capraz_ask = Number(parseFloat(res_usdt_eth[i].ask).toFixed(13));
          var usdt_eth_capraz_bid = Number(parseFloat(res_usdt_eth[i].bid).toFixed(13));
        }

        for (i in res_usdt) {
          if (res_usdt[i].ask && res_usdt[i].bid) {
            //bitmaxSchema = new PairInfo();
            bitmaxSchema = {};
            bitmaxSchema._id = uuid.v1();
            bitmaxSchema.parity = res_usdt[i].symbol.replace("USDT", "ETH");
            bitmaxSchema.buy = toFixed(res_usdt[i].ask / usdt_eth_capraz_bid);
            bitmaxSchema.sell = toFixed(res_usdt[i].bid / usdt_eth_capraz_ask);
            bitmaxSchema.hambuy = toFixed(res_usdt[i].ask);
            bitmaxSchema.hamsell = toFixed(res_usdt[i].bid);
            bitmaxSchema.caprazbuy = usdt_eth_capraz_ask;
            bitmaxSchema.caprazsell = usdt_eth_capraz_bid;
            bitmaxSchema.base = "USDT";
            bitmaxSchema.market = "Bitmax";
            bitmaxSchema.contractaddress = "";

            bitmaxSchemas.push(bitmaxSchema);
          }
        }

        resolve(bitmaxSchemas);
      })
      .catch((error) => {
        logger.log('info', `${guid} | ${new Date().toISOString()} | BITMAX error | + ${error}`);
        reject("bitmax err: " + error);
      });
  });
};

module.exports = getBitmaxNewData;
