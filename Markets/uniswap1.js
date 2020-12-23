const axios = require("axios");
const toFixed = require("../Util/toFixed");
var uuid = require("node-uuid");
const logger = require("../logger");

//const url = "http://het.freemyip.com:3005/uniswap1";
//const url = "http://138.201.32.165:3005/uniswap1";

async function getUniswap1Data(guid, url) {
  try {
  logger.log('info', `${guid} | ${new Date().toISOString()} | UNISWAP-1 started`);
  return new Promise((resolve, reject) => {
    axios
      .get(url, {timeout: 8000})
      .then((response) => {
        var res = response.data.map(({ symbol, address, ethToTokenPrice, tokenToEthPrice }) => ({
          symbol,
          address,
          ethToTokenPrice,
          tokenToEthPrice
        }));
        logger.log('info', `${guid} | ${new Date().toISOString()} | UNISWAP-1 response | data.length: ${response.data.length}`);
        /**********************************************************************/
        //ETH olanları aldık.
        /**********************************************************************/
        var uniswap1Schema,uniswap1Schemas = [];
        var ethToTokenPrice, tokenToEthPrice;
        for (i in res) {
          if (res[i].ethToTokenPrice && res[i].tokenToEthPrice) {
            if (!(res[i].ethToTokenPrice == null || res[i].tokenToEthPrice == null)) { 
              
              if (res[i].ethToTokenPrice < 0 ){
                ethToTokenPrice = 0;//-1 * res[i].ethToTokenPrice;   
                var lowestAsk = 0; 
              }else{
                ethToTokenPrice = res[i].ethToTokenPrice;  
                var lowestAsk = 1 / ethToTokenPrice;
              }
    
              if (res[i].tokenToEthPrice < 0 ){
                tokenToEthPrice = 0;//-1 * res[i].tokenToEthPrice;  
                var highestBid = 0;  
              }else{
                tokenToEthPrice = res[i].tokenToEthPrice; 
                var highestBid = 1 / tokenToEthPrice;
              }

              //uniswap1Schema = new PairInfo();
              uniswap1Schema = {};
              uniswap1Schema._id = uuid.v1(); 
              uniswap1Schema.parity = res[i].symbol.toUpperCase()  + "ETH";
              uniswap1Schema.buy = toFixed(lowestAsk); 
              uniswap1Schema.sell = toFixed(highestBid); 
              uniswap1Schema.hambuy = 0;
              uniswap1Schema.hamsell = 0;
              uniswap1Schema.caprazbuy = 0;
              uniswap1Schema.caprazsell = 0;
              uniswap1Schema.base = "";
              uniswap1Schema.contractaddress = res[i].address;
              uniswap1Schema.market = "Uniswap-1";

              uniswap1Schemas.push(uniswap1Schema);
            }
          }
        }
        resolve(uniswap1Schemas);
        
      })
      .catch((error) => {
        logger.log('info', `${guid} | ${new Date().toISOString()} | UNISWAP-1 error | + ${error}`);
        reject("XXXXX UNISWAP1 ERR: " + error);
        
      });
  });
      
  } catch (error) {
    logger.log('info', `${guid} | ${new Date().toISOString()} | UNISWAP-1 error | + ${error}`);  
  }
};

module.exports = getUniswap1Data;
