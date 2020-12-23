const axios = require("axios");
const toFixed = require("../Util/toFixed");
var uuid = require("node-uuid");
const logger = require("../logger");

//const url = "http://het.freemyip.com:3005/kyber";
//const url = "http://138.201.32.165:3005/kyber";

async function getKyberData(guid, url) {
  try {
  logger.log('info', `${guid} | ${new Date().toISOString()} | KYBER started`);
  return new Promise((resolve, reject) => {
    axios
      .get(url, { timeout: 8000 })
      .then((response) => {
        var res = response.data.map(({ symbol, address, ethToTokenPrice, tokenToEthPrice }) => ({
          symbol,
          address,
          ethToTokenPrice,
          tokenToEthPrice
        }));
        logger.log('info', `${guid} | ${new Date().toISOString()} | KYBER response | data.length: ${response.data.length}`);
        /**********************************************************************/
        //ETH olanları aldık.
        /**********************************************************************/
        var kyberSchema,kyberSchemas = [];
        for (i in res) {

          if (res[i].ethToTokenPrice && res[i].tokenToEthPrice) {
            if (!(res[i].ethToTokenPrice == null || res[i].tokenToEthPrice == null)) { 
            //kyberSchema = new PairInfo();
            var lowestAsk = 1 / res[i].ethToTokenPrice;
            var highestBid = 1 / res[i].tokenToEthPrice;
            kyberSchema = {};
            kyberSchema._id = uuid.v1();
            kyberSchema.parity = res[i].symbol.toUpperCase()  + "ETH";
            kyberSchema.buy = toFixed(lowestAsk); 
            kyberSchema.sell = toFixed(highestBid); 
            kyberSchema.hambuy = 0;
            kyberSchema.hamsell = 0;
            kyberSchema.caprazbuy = 0;
            kyberSchema.caprazsell = 0;
            kyberSchema.base = "";
            kyberSchema.contractaddress = res[i].address;
            kyberSchema.market = "Kyber";

            kyberSchemas.push(kyberSchema);
            }
          }
        }
        resolve(kyberSchemas);
        
      })
      .catch((error) => {
        logger.log('info', `${guid} | ${new Date().toISOString()} | KYBER error | + ${error}`);
        reject("XXXXX kyber err: " + error);
      });
  });
      
  } catch (error) {
    logger.log('info', `${guid} | ${new Date().toISOString()} | KYBER error | + ${error}`);
  }
};
module.exports = getKyberData;
