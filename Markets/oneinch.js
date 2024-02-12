const axios = require("axios");
const toFixed = require("../Util/toFixed");
var uuid = require("node-uuid");
const logger = require("../logger");

//const url = "http://het.freemyip.com:3005/oneinch";
//const url = "http://138.201.32.165:3005/oneinch";

const getBinanceNewData = (guid) => {
  const url = "https://api.binance.com/api/v3/ticker/bookTicker";

  return new Promise((resolve, reject) => {
    axios
      .get(url, { timeout: 1200 })
      .then((response) => {
        var res = response.data.map(({ symbol, askPrice, bidPrice }) => ({
          symbol,
          askPrice,
          bidPrice,
        }));

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

        var binanceSchema,
          binanceSchemas = [];
        for (i in res_eth_usdt) {
          var eth_usdt_capraz_ask = Number(
            parseFloat(res_eth_usdt[i].askPrice).toFixed(13)
          );

          var eth_usdt_capraz_bid = Number(
            parseFloat(res_eth_usdt[i].bidPrice).toFixed(13)
          );

          binanceSchema = {};
          binanceSchema._id = uuid.v1();
          binanceSchema.caprazbuy = eth_usdt_capraz_ask;
          binanceSchema.caprazsell = eth_usdt_capraz_bid;

          binanceSchemas.push(binanceSchema);
        }

        resolve(binanceSchemas);
      })
      .catch((error) => {logger.log("info",`${guid} | ${new Date().toISOString()} | Uniswap-Binance error | + ${error}`);
        reject("1inch-Binance err: " + error);
      });
  });
};

async function getOneinchData(guid, url) {
  try {
    logger.log("info", `${guid} | ${new Date().toISOString()} | 1INCH started`);

    var result = await getBinanceNewData(guid);

    return new Promise((resolve, reject) => {
      axios
        .get(url, { timeout: 10000 })
        .then((response) => {
          var res = response.data.map(
            ({ symbol, address, ethToTokenPrice, tokenToEthPrice }) => ({
              symbol,
              address,
              ethToTokenPrice,
              tokenToEthPrice,
            })
          );
          logger.log("info",`${guid} | ${new Date().toISOString()} | 1INCH response | data.length: ${response.data.length}`);
          /**********************************************************************/
          //ETH olanları aldık.
          /**********************************************************************/
          var oneinchSchema,
            oneinchSchemas = [];
          for (i in res) {
            if (res[i].ethToTokenPrice && res[i].tokenToEthPrice) {
              if (
                !(
                  res[i].ethToTokenPrice == null ||
                  res[i].tokenToEthPrice == null
                )
              ) {
                //oneinchSchema = new PairInfo();

                var lowestAsk = 1 / res[i].ethToTokenPrice;
                var highestBid = 1 / res[i].tokenToEthPrice;
                oneinchSchema = {};
                oneinchSchema._id = uuid.v1();
                oneinchSchema.parity = res[i].symbol.toUpperCase();
                oneinchSchema.buy = toFixed(lowestAsk * result[0]["caprazbuy"]);
                oneinchSchema.sell = toFixed(highestBid * result[0]["caprazsell"]);
                oneinchSchema.hambuy = toFixed(lowestAsk);
                oneinchSchema.hamsell = toFixed(highestBid);
                oneinchSchema.caprazbuy = result[0]["caprazbuy"];
                oneinchSchema.caprazsell = result[0]["caprazsell"];
                oneinchSchema.base = "";
                oneinchSchema.contractaddress = res[i].address;
                oneinchSchema.market = "1inch";

                oneinchSchemas.push(oneinchSchema);
              }
            }
          }
          resolve(oneinchSchemas);
        })
        .catch((error) => {
          logger.log("info",`${guid} | ${new Date().toISOString()} | 1INCH error | + ${error}`);
          reject("XXXXX oneinch err: " + error);
        });
    });
  } catch (error) {
    logger.log("info",`${guid} | ${new Date().toISOString()} | 1INCH error | + ${error}`);
  }
}
module.exports = getOneinchData;
