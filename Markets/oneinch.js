const axios = require("axios");
const toFixed = require("../Util/toFixed");
var uuid = require("node-uuid");
const logger = require("../logger");

//const url = "http://het.freemyip.com:3005/oneinch";
//const url = "http://138.201.32.165:3005/oneinch";

async function getOneinchData(guid, url) {
  try {
  logger.log('info', `${guid} | ${new Date().toISOString()} | 1INCH started`);
  return new Promise((resolve, reject) => {
    axios
      .get(url, {timeout: 10000})
      .then((response) => {
        var res = response.data.map(({ symbol, address, ethToTokenPrice, tokenToEthPrice }) => ({
          symbol,
          address,
          ethToTokenPrice,
          tokenToEthPrice
        }));
        logger.log('info', `${guid} | ${new Date().toISOString()} | 1INCH response | data.length: ${response.data.length}`);
        /**********************************************************************/
        //ETH olanları aldık.
        /**********************************************************************/
        var oneinchSchema,oneinchSchemas = [];
        for (i in res) {

          if (res[i].ethToTokenPrice && res[i].tokenToEthPrice) {
            if (!(res[i].ethToTokenPrice == null || res[i].tokenToEthPrice == null)) { 
            //oneinchSchema = new PairInfo();
            
            var lowestAsk = 1 / res[i].ethToTokenPrice;
            var highestBid = 1 / res[i].tokenToEthPrice;
            oneinchSchema = {};
            oneinchSchema._id = uuid.v1();  
            oneinchSchema.parity = res[i].symbol.toUpperCase()  + "ETH";
            oneinchSchema.buy = toFixed(lowestAsk); 
            oneinchSchema.sell = toFixed(highestBid); 
            oneinchSchema.hambuy = 0;
            oneinchSchema.hamsell = 0;
            oneinchSchema.caprazbuy = 0;
            oneinchSchema.caprazsell = 0;
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
        logger.log('info', `${guid} | ${new Date().toISOString()} | 1INCH error | + ${error}`);
        reject("XXXXX oneinch err: " + error);
      });
  });
      
  } catch (error) {
    logger.log('info', `${guid} | ${new Date().toISOString()} | 1INCH error | + ${error}`);
  }
};
module.exports = getOneinchData;
