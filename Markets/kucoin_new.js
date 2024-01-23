const axios = require("axios");
var uuid = require("node-uuid");
const toFixed = require("../Util/toFixed");
const kucoinNameFormat = require("../Util/marketNameFormat").kucoinNameFormat;
const logger = require("../logger");

const url = "https://api.kucoin.com/api/v1/market/allTickers";

const getKucoinData = (guid) => {
  logger.log('info', `${guid} | ${new Date().toISOString()} | KUCOIN started`);
  return new Promise((resolve, reject) => {
    axios
      .get(url, { timeout: 1750 })
      .then((response) => {
        var res = response.data.data.ticker.map(({ symbol, buy, sell }) => ({
          symbol,
          buy,
          sell,
        }));

        logger.log('info', `${guid} | ${new Date().toISOString()} | KUCOIN response | data.length: ${response.data.data.ticker.length}`);

        const res_eth = res.filter((item) => {
          return item.symbol.includes("-ETH");
        });

        const res_eth_usdt = res.filter((item) => { 
          if (item.symbol === "ETH-USDT") {
            return item.symbol.includes("ETHUSDT");
          }
        });

        for (i in res_eth_usdt) {
          var eth_usdt_capraz_ask = Number(
            parseFloat(res_eth_usdt[i].sell).toFixed(13)
          );

          var eth_usdt_capraz_bid = Number(
            parseFloat(res_eth_usdt[i].buy).toFixed(13)
          );
        }

        var kucoinSchema, kucoinSchemas = [];
        for (i in res_eth) {
          if (res_eth[i].sell && res_eth[i].buy) {
            kucoinSchema = {};
            kucoinSchema._id = uuid.v1();  
            kucoinSchema.parity = kucoinNameFormat(res_eth[i].symbol);
            kucoinSchema.buy = toFixed(res_eth[i].sell * eth_usdt_capraz_ask); //Number(parseFloat(res_eth[i].askPrice).toFixed(10));
            kucoinSchema.sell = toFixed(res_eth[i].buy * eth_usdt_capraz_bid); //Number(parseFloat(res_eth[i].bidPrice).toFixed(10));
            kucoinSchema.hambuy = toFixed(res_eth[i].sell);
            kucoinSchema.hamsell = toFixed(res_eth[i].buy);
            kucoinSchema.caprazbuy = eth_usdt_capraz_ask;
            kucoinSchema.caprazsell = eth_usdt_capraz_bid;
            kucoinSchema.base = "";
            kucoinSchema.market = "Ku";
            kucoinSchema.contractaddress = "";

            kucoinSchemas.push(kucoinSchema);
          }
        }

        /**********************************************************************/
        //BTC Çevrim faktörüne göre
        /**********************************************************************/
        const res_btc_usdt = res.filter((item) => {
          if (item.symbol === "BTC-USDT") {
            return item.symbol.includes("BTC-USDT");
          }
        });

        for (i in res_btc_usdt) {
          var btc_usdt_capraz_ask = Number(parseFloat(res_btc_usdt[i].sell).toFixed(13));
          var btc_usdt_capraz_bid = Number(parseFloat(res_btc_usdt[i].buy).toFixed(13));
        }

        const res_btc = res.filter((item) => {
          if (item.symbol.substr(item.symbol.length - 4) === "-BTC") {
            return item.symbol.includes("-BTC");
          }
        });

        for (i in res_btc) {
          if (res_btc[i].sell && res_btc[i].buy) {
            //kucoinBtcSchema = new PairInfo();
            kucoinBtcSchema = {};
            kucoinBtcSchema._id = uuid.v1();  
            kucoinBtcSchema.parity = kucoinNameFormat(res_btc[i].symbol);
            kucoinBtcSchema.buy = toFixed(res_btc[i].sell * btc_usdt_capraz_bid); //Number(parseFloat(res_btc[i].Ask / btc_eth_capraz_bid).toFixed(10));
            kucoinBtcSchema.sell = toFixed(res_btc[i].buy * btc_usdt_capraz_ask); //Number(parseFloat(res_btc[i].Bid / btc_eth_capraz_ask).toFixed(10));
            kucoinBtcSchema.hambuy = toFixed(res_btc[i].sell); //Number(parseFloat(res_btc[i].Ask).toFixed(10));
            kucoinBtcSchema.hamsell = toFixed(res_btc[i].buy); //Number(parseFloat(res_btc[i].Bid).toFixed(10));
            kucoinBtcSchema.caprazbuy = btc_usdt_capraz_bid;
            kucoinBtcSchema.caprazsell = btc_usdt_capraz_ask;
            kucoinBtcSchema.base = "BTC";
            kucoinBtcSchema.market = "Ku";
            kucoinBtcSchema.contractaddress = "";

            kucoinSchemas.push(kucoinBtcSchema);
          }
        }

        /**********************************************************************/
        //USDT çevrim faktörüne göre
        /**********************************************************************/
        // const res_usdt_eth = res.filter((item) => {
        //   return item.symbol.includes("ETH-USDT");
        // });

        // for (i in res_usdt_eth) {
        //   var usdt_eth_capraz_ask = Number(parseFloat(res_usdt_eth[i].sell).toFixed(13));
        //   var usdt_eth_capraz_bid = Number(parseFloat(res_usdt_eth[i].buy).toFixed(13));
        // }

        const res_usdt = res.filter((item) => {
          if (item.symbol.substr(item.symbol.length - 5) === "-USDT") {
            return item.symbol.includes("-USDT");
          }
        });

        for (i in res_usdt) {
          if (res_usdt[i].sell && res_usdt[i].buy) {
            //kucoinUsdtSchema = new PairInfo();
            kucoinUsdtSchema = {};
            kucoinUsdtSchema._id = uuid.v1();  
            kucoinUsdtSchema.parity = kucoinNameFormat(res_usdt[i].symbol);
            kucoinUsdtSchema.buy = toFixed(res_usdt[i].sell); //Number(parseFloat(res_usdt[i].Ask / usdt_eth_capraz_bid).toFixed(10));
            kucoinUsdtSchema.sell = toFixed(res_usdt[i].buy); //Number(parseFloat(res_usdt[i].Bid / usdt_eth_capraz_ask).toFixed(10));
            kucoinUsdtSchema.hambuy = 0; //Number(parseFloat(res_usdt[i].Ask).toFixed(10));
            kucoinUsdtSchema.hamsell = 0; //Number(parseFloat(res_usdt[i].Bid).toFixed(10));
            kucoinUsdtSchema.caprazbuy = 0;
            kucoinUsdtSchema.caprazsell = 0;
            kucoinUsdtSchema.base = "USDT";
            kucoinUsdtSchema.market = "Ku";
            kucoinUsdtSchema.contractaddress = "";

            kucoinSchemas.push(kucoinUsdtSchema);
          }
        }

        resolve(kucoinSchemas);
      })
      .catch((error) => {
        logger.log('info', `${guid} | ${new Date().toISOString()} | KUCOIN error | + ${error}`);
        reject("kucoin err: " + error);
      });
  });
};

module.exports = getKucoinData;
