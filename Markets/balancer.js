const axios = require("axios");
const toFixed = require("../Util/toFixed");
var uuid = require("node-uuid");
const logger = require("../logger");

//const url = "http://het.freemyip.com:3005/balancer";
//const url = "http://138.201.32.165:3005/balancer";

async function getBalancerData(guid, url) {
  try {
  logger.log('info', `${guid} | ${new Date().toISOString()} | BALANCER started`);
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
        logger.log('info', `${guid} | ${new Date().toISOString()} | BALANCER response | data.length: ${response.data.length}`);
        /**********************************************************************/
        //ETH olanları aldık.
        /**********************************************************************/
        var balancerSchema,balancerSchemas = [];
        var ethToTokenPrice, tokenToEthPrice;
        for (i in res) {
          if (res[i].ethToTokenPrice && res[i].tokenToEthPrice) {
            if (!(res[i].ethToTokenPrice == null || res[i].tokenToEthPrice == null)) { 
              
              if (res[i].ethToTokenPrice <= 0 ){
                ethToTokenPrice = 0;//-1 * res[i].ethToTokenPrice;   
                var lowestAsk = 0; 
              }else{
                ethToTokenPrice = res[i].ethToTokenPrice;  
                var lowestAsk = 1 / ethToTokenPrice;
              }
    
              if (res[i].tokenToEthPrice <= 0 ){
                tokenToEthPrice = 0;//-1 * res[i].tokenToEthPrice;  
                var highestBid = 0;  
              }else{
                tokenToEthPrice = res[i].tokenToEthPrice; 
                var highestBid = 1 / tokenToEthPrice;
              }

              //balancerSchema = new PairInfo();
              balancerSchema = {};
              balancerSchema._id = uuid.v1();
              balancerSchema.parity = res[i].symbol.toUpperCase()  + "ETH";
              balancerSchema.buy = toFixed(lowestAsk); 
              balancerSchema.sell = toFixed(highestBid); 
              balancerSchema.hambuy = 0;
              balancerSchema.hamsell = 0;
              balancerSchema.caprazbuy = 0;
              balancerSchema.caprazsell = 0;
              balancerSchema.base = "";
              balancerSchema.contractaddress = res[i].address;
              balancerSchema.market = "Balancer";

              balancerSchemas.push(balancerSchema);
            }
          }
        }
        resolve(balancerSchemas);
        
      })
      .catch((error) => {
        logger.log('info', `${guid} | ${new Date().toISOString()} | BALANCER error | + ${error}`);
        reject("XXXXX BALANCER ERR: " + error);
        
      });
  });
      
  } catch (error) {
    logger.log('info', `${guid} | ${new Date().toISOString()} | BALANCER error | + ${error}`);  
  }
};

module.exports = getBalancerData;
