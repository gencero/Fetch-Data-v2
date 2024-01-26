const axios = require("axios");
const toFixed = require("../Util/toFixed");
var uuid = require("node-uuid");
const logger = require("../logger");

const url = "https://api.kraken.com/0/public/Ticker";

const getKrakenData = (guid) => {
  logger.log("info", `${guid} | ${new Date().toISOString()} | KRAKEN started`);
  return new Promise((resolve, reject) => {
    axios
      .get(url, { timeout: 1200 })
      .then((response) => {

        var obj = response.data.result;

        var i = 0;
        for (const prop in obj){

            if (prop === "XBTUSDT"){
                 var btc_usdt_capraz_ask = Number(parseFloat(obj[prop].a[0]).toFixed(13));
                 var btc_usdt_capraz_bid = Number(parseFloat(obj[prop].b[0]).toFixed(13));
            }   

            if (prop === "ETHUSDT"){
                var eth_usdt_capraz_ask = Number(parseFloat(obj[prop].a[0]).toFixed(13));
                var eth_usdt_capraz_bid = Number(parseFloat(obj[prop].b[0]).toFixed(13));
            }

            i = i + 1;
        }
        
        logger.log(
          "info",
          `${guid} | ${new Date().toISOString()} | KRAKEN response | data.length: ${
            i
          }`
        );

        var krakenSchema, krakenSchemas = [];
        for (const prop in obj) {  

            //  console.log("prop: " + prop + " - " + prop.substr(prop.length -3) )
            if (prop.substr(prop.length - 3) == "ETH") {
                if (obj[prop].a[0] && obj[prop].b[0]) {
                    
                    krakenSchema = {};
                    krakenSchema._id = uuid.v1(); 
                    krakenSchema.parity = prop.slice(0, -3);
                    krakenSchema.sell = toFixed(obj[prop].a[0] * eth_usdt_capraz_ask);
                    krakenSchema.buy = toFixed(obj[prop].b[0] * eth_usdt_capraz_bid);
                    krakenSchema.hamsell = toFixed(obj[prop].a[0]);;
                    krakenSchema.hambuy = toFixed(obj[prop].b[0]);
                    krakenSchema.caprazbuy = eth_usdt_capraz_ask;
                    krakenSchema.caprazsell = eth_usdt_capraz_bid;
                    krakenSchema.base = "";
                    krakenSchema.market = "Kraken";
                    krakenSchema.contractaddress = "";
    
                    krakenSchemas.push(krakenSchema);
                }
              }

            if (prop.substr(prop.length-3) == "XBT") {    
                if (obj[prop].a[0] && obj[prop].b[0]) {

                    krakenSchema = {};
                    krakenSchema._id = uuid.v1(); 
                    krakenSchema.parity = prop.slice(0, -3);
                    krakenSchema.sell = toFixed(obj[prop].a[0] * btc_usdt_capraz_ask);
                    krakenSchema.buy = toFixed(obj[prop].b[0] * btc_usdt_capraz_bid);
                    krakenSchema.hamsell = toFixed(obj[prop].a[0]);
                    krakenSchema.hambuy = toFixed(obj[prop].b[0]);
                    krakenSchema.caprazbuy = btc_usdt_capraz_ask;
                    krakenSchema.caprazsell = btc_usdt_capraz_bid;
                    krakenSchema.base = "BTC";
                    krakenSchema.market = "Kraken";
                    krakenSchema.contractaddress = "";

                    krakenSchemas.push(krakenSchema);
                }
            }

            if (prop.substr(prop.length-3) == "USD") {    
                if (obj[prop].a[0] && obj[prop].b[0]) {

                    krakenSchema = {};
                    krakenSchema._id = uuid.v1(); 
                    krakenSchema.parity = prop.slice(0, -3);
                    krakenSchema.sell = toFixed(obj[prop].a[0]);
                    krakenSchema.buy = toFixed(obj[prop].b[0]);
                    krakenSchema.hamsell = 0;
                    krakenSchema.hambuy = 0;
                    krakenSchema.caprazbuy = 0;
                    krakenSchema.caprazsell = 0;
                    krakenSchema.base = "USDT";
                    krakenSchema.market = "Kraken";
                    krakenSchema.contractaddress = "";

                    krakenSchemas.push(krakenSchema);
                }
            }
        }

        resolve(krakenSchemas);
      })
      .catch((error) => {
        logger.log(
          "info",
          `${guid} | ${new Date().toISOString()} | KRAKEN error | + ${error}`
        );
        reject("kraken err: " + error);
      });
  });
};

module.exports = getKrakenData;
