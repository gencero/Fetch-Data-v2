const axios = require("axios");
const toFixed = require("../Util/toFixed");
var uuid = require("node-uuid");
const logger = require("../logger");

const url = "https://api.chiliz.net/openapi/quote/v1/ticker/bookTicker";

const getChilizData = (guid) => {
  logger.log("info", `${guid} | ${new Date().toISOString()} | CHILIZ started`);
  return new Promise((resolve, reject) => {
    axios
      .get(url, { timeout: 1200 })
      .then((response) => {
        var res = response.data.map(({ symbol, askPrice, bidPrice }) => ({
          symbol,
          askPrice,
          bidPrice,
        }));
        logger.log(
          "info",
          `${guid} | ${new Date().toISOString()} | CHILIZ response | data.length: ${
            response.data.length
          }`
        );
        /**********************************************************************/
        //CHZ olanları aldık.
        /**********************************************************************/
        const res_chz = res.filter((item) => {
          if (item.symbol.substr(item.symbol.length - 3) === "CHZ") {
            return item.symbol.includes("CHZ");
          }
        });
        
        const res_chz_usdt = res.filter((item) => { 
          if (item.symbol === "CHZUSDT") {
            return item.symbol.includes("CHZUSDT");
          }
        });

        for (i in res_chz_usdt) {
          var chz_usdt_capraz_ask = Number(
            parseFloat(res_chz_usdt[i].askPrice).toFixed(13)
          );

          var chz_usdt_capraz_bid = Number(
            parseFloat(res_chz_usdt[i].bidPrice).toFixed(13)
          );
        }

        var chilizSchema,
            chilizSchemas = [];
        for (i in res_chz) {
          if (
            res_chz[i].askPrice &&
            res_chz[i].bidPrice &&
            res_chz[i].askPrice > 0 &&
            res_chz[i].bidPrice > 0
          ) {
            chilizSchema = {};
            chilizSchema._id = uuid.v1();
            chilizSchema.parity = res_chz[i].symbol.slice(0, -3);
            chilizSchema.buy = toFixed(res_chz[i].askPrice * chz_usdt_capraz_ask); 
            chilizSchema.sell = toFixed(res_chz[i].bidPrice * chz_usdt_capraz_bid); 
            chilizSchema.hambuy = toFixed(res_chz[i].askPrice);
            chilizSchema.hamsell = toFixed(res_chz[i].bidPrice);
            chilizSchema.caprazbuy = chz_usdt_capraz_ask;
            chilizSchema.caprazsell = chz_usdt_capraz_bid;
            chilizSchema.base = "CHZ";
            chilizSchema.market = "Chiliz";
            chilizSchema.contractaddress = "";

            chilizSchemas.push(chilizSchema);
          }
        }

        /**********************************************************************/
        //USDT Çevrim faktörüne göre
        /**********************************************************************/
        const res_usdt = res.filter((item) => {
          if (item.symbol.substr(item.symbol.length - 4) === "USDT") {
            return item.symbol.includes("USDT");
          }
        });

        for (i in res_usdt) {
          if (
            res_usdt[i].askPrice &&
            res_usdt[i].bidPrice &&
            res_usdt[i].askPrice > 0 &&
            res_usdt[i].bidPrice > 0
          ) {
            chilizSchema = {};
            chilizSchema._id = uuid.v1();
            chilizSchema.parity = res_usdt[i].symbol.replace(new RegExp("USDT" + "$"),"");
            chilizSchema.buy = toFixed(res_usdt[i].askPrice); 
            chilizSchema.sell = toFixed(res_usdt[i].bidPrice); 
            chilizSchema.hambuy = 0; 
            chilizSchema.hamsell = 0; 
            chilizSchema.caprazbuy = 0;
            chilizSchema.caprazsell = 0;
            chilizSchema.base = "USDT";
            chilizSchema.market = "Chiliz";
            chilizSchema.contractaddress = "";

            chilizSchemas.push(chilizSchema);
          }
        }
        /**********************************************************************/

        resolve(chilizSchemas);
      })
      .catch((error) => {
        logger.log(
          "info",
          `${guid} | ${new Date().toISOString()} | CHILIZ error | + ${error}`
        );
        reject("chiliz err: " + error);
      });
  });
};

module.exports = getChilizData;
