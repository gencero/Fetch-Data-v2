const axios = require("axios");
const toFixed = require("../Util/toFixed");
var uuid = require("node-uuid");
const logger = require("../logger");

const url = "https://api.binance.com/api/v3/ticker/bookTicker";

const getBinanceNewData = (guid) => {
  logger.log('info', `${guid} | ${new Date().toISOString()} | BINANCE started`);
  return new Promise((resolve, reject) => {
    axios
      .get(url, { timeout: 1200 })
      .then((response) => {
        var res = response.data.map(({ symbol, askPrice, bidPrice }) => ({
          symbol,
          askPrice,
          bidPrice,
        }));
        logger.log('info', `${guid} | ${new Date().toISOString()} | BINANCE response | data.length: ${response.data.length}`);
        /**********************************************************************/
        //ETH olanları aldık.
        /**********************************************************************/
        const res_eth = res.filter((item) => {
          if (item.symbol.indexOf("ETH") > 0) {
            return item.symbol.includes("ETH");
          }
        });

        var binanceSchema,binanceSchemas = [];
        for (i in res_eth) {
          if (res_eth[i].askPrice && res_eth[i].bidPrice) {
            //binanceSchema = new PairInfo();
            binanceSchema = {};
            binanceSchema._id = uuid.v1();
            binanceSchema.parity = res_eth[i].symbol;
            binanceSchema.buy = toFixed(res_eth[i].askPrice); //Number(parseFloat(res_eth[i].askPrice).toFixed(10));
            binanceSchema.sell = toFixed(res_eth[i].bidPrice); //Number(parseFloat(res_eth[i].bidPrice).toFixed(10));
            binanceSchema.hambuy = 0;
            binanceSchema.hamsell = 0;
            binanceSchema.caprazbuy = 0;
            binanceSchema.caprazsell = 0;
            binanceSchema.base = "";
            binanceSchema.market = "Binance";
            binanceSchema.contractaddress = "";

            binanceSchemas.push(binanceSchema);
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
          var btc_eth_capraz_ask = Number(parseFloat(res_btc_eth[i].askPrice).toFixed(13));
          var btc_eth_capraz_bid = Number(parseFloat(res_btc_eth[i].bidPrice).toFixed(13));
        }

        for (i in res_btc) {
          if (res_btc[i].askPrice && res_btc[i].bidPrice) {
            //binanceSchema = new PairInfo();
            binanceSchema = {};
            binanceSchema._id = uuid.v1();
            binanceSchema.parity = res_btc[i].symbol.replace(new RegExp("BTC" + '$'), 'ETH');
            binanceSchema.buy = toFixed(res_btc[i].askPrice / btc_eth_capraz_bid); // Number(parseFloat(res_btc[i].askPrice / btc_eth_capraz_bid).toFixed(10));
            binanceSchema.sell = toFixed(res_btc[i].bidPrice / btc_eth_capraz_ask); //Number(parseFloat(res_btc[i].bidPrice / btc_eth_capraz_ask).toFixed(10));
            binanceSchema.hambuy = toFixed(res_btc[i].askPrice); //Number(parseFloat(res_btc[i].askPrice).toFixed(10));
            binanceSchema.hamsell = toFixed(res_btc[i].bidPrice); //Number(parseFloat(res_btc[i].bidPrice).toFixed(10));
            binanceSchema.caprazbuy = btc_eth_capraz_ask;
            binanceSchema.caprazsell = btc_eth_capraz_bid;
            binanceSchema.base = "BTC";
            binanceSchema.market = "Binance";
            binanceSchema.contractaddress = "";

            binanceSchemas.push(binanceSchema);
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
          var usdt_eth_capraz_ask = Number(parseFloat(res_usdt_eth[i].askPrice).toFixed(13));
          var usdt_eth_capraz_bid = Number(parseFloat(res_usdt_eth[i].bidPrice).toFixed(13));
        }

        for (i in res_usdt) {
          if (res_usdt[i].askPrice && res_usdt[i].bidPrice) {
            //binanceSchema = new PairInfo();
            binanceSchema = {};
            binanceSchema._id = uuid.v1();                       
            binanceSchema.parity = res_usdt[i].symbol.replace(new RegExp("USDT" + '$'), 'ETH');
            binanceSchema.buy = toFixed(res_usdt[i].askPrice / usdt_eth_capraz_bid); //Number(parseFloat(res_usdt[i].askPrice/ usdt_eth_capraz_bid).toFixed(10));
            binanceSchema.sell = toFixed(res_usdt[i].bidPrice / usdt_eth_capraz_ask); //Number(parseFloat(res_usdt[i].bidPrice/ usdt_eth_capraz_ask).toFixed(10));
            binanceSchema.hambuy = toFixed(res_usdt[i].askPrice); //Number(parseFloat(res_usdt[i].askPrice).toFixed(10));
            binanceSchema.hamsell = toFixed(res_usdt[i].bidPrice); //Number(parseFloat(res_usdt[i].bidPrice).toFixed(10));
            binanceSchema.caprazbuy = usdt_eth_capraz_ask;
            binanceSchema.caprazsell = usdt_eth_capraz_bid;
            binanceSchema.base = "USDT";
            binanceSchema.market = "Binance";
            binanceSchema.contractaddress = "";

            binanceSchemas.push(binanceSchema);
          }
        }
        /**********************************************************************/

        resolve(binanceSchemas);
      })
      .catch((error) => {
        logger.log('info', `${guid} | ${new Date().toISOString()} | BINANCE error | + ${error}`);
        reject("binance err: " + error);
      });
  });
};

module.exports = getBinanceNewData;
