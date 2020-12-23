const axios = require("axios");
const toFixed = require("../Util/toFixed");
var uuid = require("node-uuid");
const logger = require("../logger");

//const url = "http://het.freemyip.com:3005/uniswap2";
//const url = "http://138.201.32.165:3005/uniswap2";

async function getUniswap3Data(guid, url) {
  try {
    logger.log('info', `${guid} | ${new Date().toISOString()} | UNISWAP-3 started`);
    return new Promise((resolve, reject) => {
      axios
        .get(url, { timeout: 8000 })
        .then((response) => {
          var res = response.data.map(
            ({ symbol, address, ethToTokenPrice, tokenToEthPrice }) => ({
              symbol,
              address,
              ethToTokenPrice,
              tokenToEthPrice,
            })
          );

          logger.log('info', `${guid} | ${new Date().toISOString()} | UNISWAP-3 response | data.length: ${response.data.length}`);
          /**********************************************************************/
          //ETH olanları aldık.
          /**********************************************************************/
          var uniswap3Schema, uniswap3Schemas = [];
          var ethToTokenPrice, tokenToEthPrice;
          for (i in res) {
            if (res[i].ethToTokenPrice && res[i].tokenToEthPrice) {
              if (
                !(
                  res[i].ethToTokenPrice == null ||
                  res[i].tokenToEthPrice == null
                )
              ) {
                if (res[i].ethToTokenPrice < 0) {
                  ethToTokenPrice = 0;//-1 * res[i].ethToTokenPrice;
                  var lowestAsk = 0;
                } else {
                  ethToTokenPrice = res[i].ethToTokenPrice;
                  var lowestAsk = 1 / ethToTokenPrice;
                }

                if (res[i].tokenToEthPrice < 0) {
                  tokenToEthPrice = 0; //-1 * res[i].tokenToEthPrice;
                  var highestBid = 0;
                } else {
                  tokenToEthPrice = res[i].tokenToEthPrice;
                  var highestBid = 1 / tokenToEthPrice;
                }

                //uniswap3Schema = new PairInfo();
                uniswap3Schema = {};
                uniswap3Schema._id = uuid.v1(); 
                uniswap3Schema.parity = res[i].symbol.toUpperCase() + "ETH";
                uniswap3Schema.buy = toFixed(lowestAsk);
                uniswap3Schema.sell = toFixed(highestBid);
                uniswap3Schema.hambuy = 0;
                uniswap3Schema.hamsell = 0;
                uniswap3Schema.caprazbuy = 0;
                uniswap3Schema.caprazsell = 0;
                uniswap3Schema.base = "";
                uniswap3Schema.contractaddress = res[i].address;
                uniswap3Schema.market = "Uniswap-3";

                uniswap3Schemas.push(uniswap3Schema);
              }
            }
          }
          
          resolve(uniswap3Schemas);
        })
        .catch((error) => {
          logger.log('info', `${guid} | ${new Date().toISOString()} | UNISWAP-3 error | + ${error}`);
          reject("XXXXX UNISWAP-3 ERR: " + error); 
        });
    });
  } catch (error) {
    logger.log('info', `${guid} | ${new Date().toISOString()} | UNISWAP-3 error | + ${error}`);
  }
}

module.exports = getUniswap3Data;
