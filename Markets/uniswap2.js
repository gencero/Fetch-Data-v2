const axios = require("axios");
const toFixed = require("../Util/toFixed");
var uuid = require("node-uuid");
const logger = require("../logger");
const pg = require("pg");

//const url = "http://het.freemyip.com:3005/uniswap2";
//const url = "http://138.201.32.165:3005/uniswap2";



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
      .catch((error) => {
        logger.log(
          "info",
          `${guid} | ${new Date().toISOString()} | Uniswap-Binance error | + ${error}`
        );
        reject("Uniswap-Binance err: " + error);
      });
  });
};


async function getUniswap2Data(guid, url) {
  try {
    logger.log(
      "info",
      `${guid} | ${new Date().toISOString()} | UNISWAP-2 started`
    );
    console.log("url: " + url);

    var result = await getBinanceNewData(guid);

    return new Promise((resolve, reject) => {
      axios
        .get(url, { timeout: 8000 })
        .then((response) => {
          // console.log("response: " + JSON.stringify(response.data));
          var res = response.data.map(
            ({ symbol, address, ethToTokenPrice, tokenToEthPrice }) => ({
              symbol,
              address,
              ethToTokenPrice,
              tokenToEthPrice,
            })
          );

          logger.log(
            "info",
            `${guid} | ${new Date().toISOString()} | UNISWAP-2 response | data.length: ${
              response.data.length
            }`
          );
          /**********************************************************************/
          //ETH olanları aldık.
          /**********************************************************************/

          // console.log("2   UNISWAP -  BINANCE result: " + JSON.stringify(result));
          // console.log("XX: " + result[0]["caprazbuy"]);    

          var uniswap2Schema,
            uniswap2Schemas = [];
          var ethToTokenPrice, tokenToEthPrice;
          for (i in res) {
            if (
              res[i].ethToTokenPrice &&
              res[i].tokenToEthPrice &&
              !res[i].symbol.includes("'")
            ) {
              if (
                !(
                  res[i].ethToTokenPrice == null ||
                  res[i].tokenToEthPrice == null
                )
              ) {
                if (res[i].ethToTokenPrice < 0) {
                  ethToTokenPrice = 0; //-1 * res[i].ethToTokenPrice;
                  var lowestAsk = 0;
                } else {
                  ethToTokenPrice = res[i].ethToTokenPrice;
                  var lowestAsk = 1 / ethToTokenPrice;
                }

                // ethusdt fiyatını bulup 1/tokenToEthPrice yerine ethusdt/tokenToEthPrice yapabiliriz.
                // ya da yine highestBid bu şekilde buluruz. bunu ethusdt fiyatı ile çarparız.
                if (res[i].tokenToEthPrice < 0) {
                  tokenToEthPrice = 0; //-1 * res[i].tokenToEthPrice;
                  var highestBid = 0;
                } else {
                  tokenToEthPrice = res[i].tokenToEthPrice;
                  var highestBid = 1 / tokenToEthPrice;
                }

                //uniswap3Schema = new PairInfo();
                uniswap2Schema = {};
                uniswap2Schema._id = uuid.v1();
                uniswap2Schema.parity = res[i].symbol.toUpperCase();
                uniswap2Schema.buy = toFixed(lowestAsk * result[0]["caprazbuy"]);
                uniswap2Schema.sell = toFixed(highestBid * result[0]["caprazsell"]);
                uniswap2Schema.hambuy = toFixed(lowestAsk);
                uniswap2Schema.hamsell = toFixed(highestBid);
                uniswap2Schema.caprazbuy = result[0]["caprazbuy"];
                uniswap2Schema.caprazsell = result[0]["caprazsell"];
                uniswap2Schema.base = "";
                uniswap2Schema.contractaddress = res[i].address;
                uniswap2Schema.market = "Uniswap-2";

                uniswap2Schemas.push(uniswap2Schema);
              }
            }
          }
          resolve(uniswap2Schemas);
        })
        .catch((error) => {
          logger.log(
            "info",
            `${guid} | ${new Date().toISOString()} | UNISWAP-2 error | + ${error}`
          );
          reject("XXXXX UNISWAP-2 ERR: " + error);
        });
    });
  } catch (error) {
    logger.log(
      "info",
      `${guid} | ${new Date().toISOString()} | UNISWAP-2 error | + ${error}`
    );
  }
}

module.exports = getUniswap2Data;
