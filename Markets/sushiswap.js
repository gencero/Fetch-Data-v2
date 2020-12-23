const axios = require("axios");
const toFixed = require("../Util/toFixed");
var uuid = require("node-uuid");
const logger = require("../logger");

//const url = "http://het.freemyip.com:3005/sushiswap";
//const url = "http://138.201.32.165:3005/sushiswap";

async function getSushiswapData(guid, url) {
  try {
  logger.log('info', `${guid} | ${new Date().toISOString()} | SUSHISWAP started`);
  return new Promise((resolve, reject) => {
    axios
      .get(url, {timeout: 3000})
      .then((response) => {
        var res = response.data.map(({ symbol, address, ethToTokenPrice, tokenToEthPrice }) => ({
          symbol,
          address,
          ethToTokenPrice,
          tokenToEthPrice
        }));
        logger.log('info', `${guid} | ${new Date().toISOString()} | SUSHISWAP response | data.length: ${response.data.length}`);
        /**********************************************************************/
        //ETH olanları aldık.
        /**********************************************************************/
        var sushiSchema,sushiSchemas = [];
        for (i in res) {

          if (res[i].ethToTokenPrice && res[i].tokenToEthPrice) {
            if (!(res[i].ethToTokenPrice == null || res[i].tokenToEthPrice == null)) { 

            //sushiSchema = new PairInfo();
            
            var lowestAsk = 1 / res[i].ethToTokenPrice;
            var highestBid = 1 / res[i].tokenToEthPrice;
            sushiSchema = {};
            sushiSchema._id = uuid.v1();  
            sushiSchema.parity = res[i].symbol.toUpperCase()  + "ETH";
            sushiSchema.buy = toFixed(lowestAsk); 
            sushiSchema.sell = toFixed(highestBid); 
            sushiSchema.hambuy = 0;
            sushiSchema.hamsell = 0;
            sushiSchema.caprazbuy = 0;
            sushiSchema.caprazsell = 0;
            sushiSchema.base = "";
            sushiSchema.contractaddress = res[i].address;
            sushiSchema.market = "Sushiswap";

            sushiSchemas.push(sushiSchema);
            }
          }
        }      
        resolve(sushiSchemas);
        
      })
      .catch((error) => {
        logger.log('info', `${guid} | ${new Date().toISOString()} | SUSHISWAP error | + ${error}`);
        reject("XXXXX sushiswap err: " + error);
      });
  });
      
  } catch (error) {
    logger.log('info', `${guid} | ${new Date().toISOString()} | SUSHISWAP error | + ${error}`);
  }
};
module.exports = getSushiswapData;
