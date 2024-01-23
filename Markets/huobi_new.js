const axios = require("axios");
const toFixed = require("../Util/toFixed");
var uuid = require("node-uuid");
const logger = require("../logger");
const url = "https://api.huobi.pro/market/tickers";

const getHuobiNewData = (guid) => {
  logger.log('info', `${guid} | ${new Date().toISOString()} | HUOBI started`);
  return new Promise((resolve, reject) => {
    axios
      .get(url , { timeout: 1000 })
      .then((response) => {
        var res = response.data.data.map(({ symbol, ask, bid }) => ({
          symbol,
          ask,
          bid,
        }));

        logger.log('info', `${guid} | ${new Date().toISOString()} | HUOBI response | data.length: ${response.data.data.length}`);

        var res = res.map(function (item) {
          return Object.assign(item, { symbol: item.symbol.toUpperCase() });
        });

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
            parseFloat(res_eth_usdt[i].ask).toFixed(13)
          );

          var eth_usdt_capraz_bid = Number(
            parseFloat(res_eth_usdt[i].bid).toFixed(13)
          );
        }

        var huobiSchema, huobiSchemas = [];
        for (i in res_eth) {
          if (res_eth[i].ask && res_eth[i].bid) {
            //huobiSchema = new PairInfo();
            huobiSchema = {};
            huobiSchema._id = uuid.v1();  
            huobiSchema.parity = res_eth[i].symbol.slice(0, -3);
            huobiSchema.buy = toFixed(res_eth[i].ask * eth_usdt_capraz_ask); //Number(parseFloat(res_eth[i].askPrice).toFixed(10));
            huobiSchema.sell = toFixed(res_eth[i].bid * eth_usdt_capraz_bid); //Number(parseFloat(res_eth[i].bidPrice).toFixed(10));
            huobiSchema.hambuy = toFixed(res_eth[i].ask);
            huobiSchema.hamsell = toFixed(res_eth[i].bid);
            huobiSchema.caprazbuy = eth_usdt_capraz_ask;
            huobiSchema.caprazsell = eth_usdt_capraz_bid;
            huobiSchema.base = "";
            huobiSchema.market = "Huobi";
            huobiSchema.contractaddress = "";

            huobiSchemas.push(huobiSchema);
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

        // const res_btc_eth = res.filter((item) => {
        //   return item.symbol.includes("ETHBTC");
        // });

        // for (i in res_btc_eth) {
        //   var btc_eth_capraz_ask = Number(parseFloat(res_btc_eth[i].ask).toFixed(13));
        //   var btc_eth_capraz_bid = Number(parseFloat(res_btc_eth[i].bid).toFixed(13));
        // }

        const res_btc_usdt = res.filter((item) => { 
          if (item.symbol === "BTCUSDT") {
            return item.symbol.includes("BTCUSDT");
          }
        });

        for (i in res_btc_usdt) {
          var btc_usdt_capraz_ask = Number(
            parseFloat(res_btc_usdt[i].ask).toFixed(13)
          );

          var btc_usdt_capraz_bid = Number(
            parseFloat(res_btc_usdt[i].bid).toFixed(13)
          );
        }

        for (i in res_btc) {
          if (res_btc[i].ask && res_btc[i].bid) {
            //huobiSchema = new PairInfo();
            huobiSchema = {};
            huobiSchema._id = uuid.v1();  
            huobiSchema.parity = res_btc[i].symbol.replace(new RegExp("BTC" + '$'), "");
            huobiSchema.buy = toFixed(res_btc[i].ask * btc_usdt_capraz_ask);
            huobiSchema.sell = toFixed(res_btc[i].bid * btc_usdt_capraz_bid);
            huobiSchema.hambuy = toFixed(res_btc[i].ask);
            huobiSchema.hamsell = toFixed(res_btc[i].bid);
            huobiSchema.caprazbuy = btc_usdt_capraz_ask;
            huobiSchema.caprazsell = btc_usdt_capraz_bid;
            huobiSchema.base = "BTC";
            huobiSchema.market = "Huobi";
            huobiSchema.contractaddress = "";

            huobiSchemas.push(huobiSchema);
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
        //   var usdt_eth_capraz_ask = Number(parseFloat(res_usdt_eth[i].ask).toFixed(13));
        //   var usdt_eth_capraz_bid = Number(parseFloat(res_usdt_eth[i].bid).toFixed(13));
        // }

        for (i in res_usdt) {
          if (res_usdt[i].ask && res_usdt[i].bid) {
            //huobiSchema = new PairInfo();
            huobiSchema = {};
            huobiSchema._id = uuid.v1();  
            huobiSchema.parity = res_usdt[i].symbol.replace(new RegExp("USDT" + '$'), "");
            huobiSchema.buy = toFixed(res_usdt[i].ask);
            huobiSchema.sell = toFixed(res_usdt[i].bid);
            huobiSchema.hambuy = 0;
            huobiSchema.hamsell = 0;
            huobiSchema.caprazbuy = 0;
            huobiSchema.caprazsell = 0;
            huobiSchema.base = "USDT";
            huobiSchema.market = "Huobi";
            huobiSchema.contractaddress = "";

            huobiSchemas.push(huobiSchema);
          }
        }

        resolve(huobiSchemas);
      })
      .catch((error) => {
        logger.log('info', `${guid} | ${new Date().toISOString()} | HUOBI error | + ${error}`);
        reject("huobi err: " + error);
      });
  });
};

module.exports = getHuobiNewData;
