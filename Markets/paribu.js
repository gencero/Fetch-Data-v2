const axios = require("axios");
const toFixed = require("../Util/toFixed");
var uuid = require("node-uuid");
const logger = require("../logger");

const url = "https://www.paribu.com/ticker";

const getParibuData = (guid) => {
  logger.log("info", `${guid} | ${new Date().toISOString()} | PARIBU started`);
  return new Promise((resolve, reject) => {
    axios
      .get(url, { timeout: 1200 })
      .then((response) => {

        var obj = response.data;

        var i = 0;
        for (const prop in obj){

            if (prop === "USDT_TL"){
                 var usdt_tl_capraz_ask = Number(parseFloat(obj[prop].lowestAsk).toFixed(13));
                 var usdt_tl_capraz_bid = Number(parseFloat(obj[prop].highestBid).toFixed(13));
            }  

            i = i + 1;
        }
        
        logger.log(
          "info",
          `${guid} | ${new Date().toISOString()} | PARIBU response | data.length: ${
            i
          }`
        );

        var paribuSchema, paribuSchemas = [];
        for (const prop in obj) {  

            //  console.log("prop: " + prop + " - " + prop.substr(prop.length -3) )
            if (prop.substr(prop.length - 3) == "_TL") {
                if (obj[prop].lowestAsk && obj[prop].highestBid) {
                    
                    paribuSchema = {};
                    paribuSchema._id = uuid.v1(); 
                    paribuSchema.parity = prop.slice(0, -3);
                    paribuSchema.sell = toFixed(obj[prop].lowestAsk / usdt_tl_capraz_bid);
                    paribuSchema.buy = toFixed(obj[prop].highestBid / usdt_tl_capraz_ask);
                    paribuSchema.hamsell = toFixed(obj[prop].lowestAsk);
                    paribuSchema.hambuy = toFixed(obj[prop].highestBid);
                    paribuSchema.caprazbuy = usdt_tl_capraz_ask;
                    paribuSchema.caprazsell = usdt_tl_capraz_bid;
                    paribuSchema.base = "TL";
                    paribuSchema.market = "Paribu";
                    paribuSchema.contractaddress = "";
    
                    paribuSchemas.push(paribuSchema);
                }
              }

            if (prop.substr(prop.length-5) == "_USDT") {    
                if (obj[prop].lowestAsk && obj[prop].highestBid) {

                    paribuSchema = {};
                    paribuSchema._id = uuid.v1(); 
                    paribuSchema.parity = prop.slice(0, -5);
                    paribuSchema.sell = toFixed(obj[prop].lowestAsk);
                    paribuSchema.buy = toFixed(obj[prop].highestBid);
                    paribuSchema.hamsell = 0;
                    paribuSchema.hambuy = 0;
                    paribuSchema.caprazbuy = 0;
                    paribuSchema.caprazsell = 0;
                    paribuSchema.base = "USDT";
                    paribuSchema.market = "Paribu";
                    paribuSchema.contractaddress = "";

                    paribuSchemas.push(paribuSchema);
                }
            }
        }

        resolve(paribuSchemas);
      })
      .catch((error) => {
        logger.log(
          "info",
          `${guid} | ${new Date().toISOString()} | PARIBU error | + ${error}`
        );
        reject("paribu err: " + error);
      });
  });
};

module.exports = getParibuData;
