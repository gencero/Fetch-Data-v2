const axios = require("axios");
const toFixed = require("../Util/toFixed");
var uuid = require("node-uuid");
const logger = require("../logger");

const url = "https://api-pub.bitfinex.com/v2/tickers?symbols=ALL";

const getBitfinexData = (guid) => {
  logger.log('info', `${guid} | ${new Date().toISOString()} | BITFINEX started`);
  return new Promise((resolve, reject) => {
    axios
      .get(url, { timeout: 900 })
      .then((response) => {
        var res = response.data.map(function (item) {
          return item;
        });
        
        logger.log('info', `${guid} | ${new Date().toISOString()} | BITFINEX response | data.length: ${response.data.length}`);

        for (i in res){
          if (res[i][0] === "tETHBTC"){
            var btc_eth_capraz_ask = Number(parseFloat(res[i][3]).toFixed(13));
            var btc_eth_capraz_bid = Number(parseFloat(res[i][1]).toFixed(13));
          }

          if  (res[i][0] === "tETHUSD"){
            var usdt_eth_capraz_ask = Number(res[i][3].toFixed(13));
            var usdt_eth_capraz_bid = Number(res[i][1].toFixed(13));
          }
        }

        var bitfinexSchema,bitfinexSchemas = [];
        for (i in res){

            if (res[i][0].substr(res[i][0].length - 3) === "ETH" && res[i][0].length > 4/*&& res[i][0].substr(0,1)==="t"*/){
              if (res[i][1]>=0 && res[i][3]>=0){
                //bitfinexSchema = new PairInfo();
                bitfinexSchema = {};
                bitfinexSchema._id = uuid.v1();
                bitfinexSchema.parity = res[i][0].substr(1);
                bitfinexSchema.buy = toFixed(res[i][3]); 
                bitfinexSchema.sell = toFixed(res[i][1]);
                bitfinexSchema.hambuy = 0;
                bitfinexSchema.hamsell = 0;
                bitfinexSchema.caprazbuy = 0;
                bitfinexSchema.caprazsell = 0;
                bitfinexSchema.base = "";
                bitfinexSchema.market = "Bitfinex";
                bitfinexSchema.contractaddress = "";

                bitfinexSchemas.push(bitfinexSchema); 
              }
            }else if (res[i][0].substr(res[i][0].length - 3) === "BTC" && res[i][0].length > 4 /*&& res[i][0].substr(0,1)==="t"*/){
              if (res[i][1]>=0 && res[i][3]>=0){
                //bitfinexSchema = new PairInfo();
                bitfinexSchema = {};
                bitfinexSchema._id = uuid.v1();
                bitfinexSchema.parity = res[i][0].substr(1).replace(new RegExp("BTC" + '$'), 'ETH');
                bitfinexSchema.buy = toFixed(res[i][3] / btc_eth_capraz_bid); 
                bitfinexSchema.sell = toFixed(res[i][1] / btc_eth_capraz_ask); 
                bitfinexSchema.hambuy = toFixed(res[i][3]); 
                bitfinexSchema.hamsell = toFixed(res[i][1]);
                bitfinexSchema.caprazbuy = btc_eth_capraz_ask;
                bitfinexSchema.caprazsell = btc_eth_capraz_bid;
                bitfinexSchema.base = "BTC";
                bitfinexSchema.market = "Bitfinex";
                bitfinexSchema.contractaddress = "";

                bitfinexSchemas.push(bitfinexSchema);
              }  
            }else if (res[i][0].substr(res[i][0].length - 3) === "USD" && res[i][0].length > 4 /*&& res[i][0].substr(0,1)==="t"*/){
              if (res[i][1]>=0 && res[i][3]>=0){
                //bitfinexSchema = new PairInfo();
                bitfinexSchema = {};
                bitfinexSchema._id = uuid.v1();                    
                bitfinexSchema.parity = res[i][0].substr(1).replace(new RegExp("USD" + '$'), 'ETH');
                bitfinexSchema.buy = toFixed(res[i][3] / usdt_eth_capraz_bid); 
                bitfinexSchema.sell = toFixed(res[i][1] / usdt_eth_capraz_ask);
                bitfinexSchema.hambuy = toFixed(res[i][3]); 
                bitfinexSchema.hamsell = toFixed(res[i][1]);
                bitfinexSchema.caprazbuy = usdt_eth_capraz_ask;
                bitfinexSchema.caprazsell = usdt_eth_capraz_bid;
                bitfinexSchema.base = "USDT";
                bitfinexSchema.market = "Bitfinex";
                bitfinexSchema.contractaddress = "";

                bitfinexSchemas.push(bitfinexSchema);
              }
            }
        }

        
        resolve(bitfinexSchemas);
      })
      .catch((error) => {
        logger.log('info', `${guid} | ${new Date().toISOString()} | BITFINEX error | + ${error}`);
        reject("bitfinex err: " + error);
      });
  });
};

module.exports = getBitfinexData;
