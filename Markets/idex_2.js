const axios = require("axios");
var uuid = require("node-uuid");
const idexNameFormat = require("../Util/marketNameFormat").idexNameFormat;
const logger = require("../logger");

const url = "https://api.idex.io/v1/tickers";

const getIdex2Data = (guid) => {
  logger.log('info', `${guid} | ${new Date().toISOString()} | IDEX started`);
  return new Promise((resolve, reject) => {
    axios
      .get(url, { timeout: 900 })
      .then((response) => {
        var res = response.data.map(({ market, ask, bid }) => ({
            market,
            ask,
            bid,
        }));

        logger.log('info', `${guid} | ${new Date().toISOString()} | IDEX response | data.length: ${response.data.length}`);

        const res_eth = res.filter((item) => {
            return item.market.includes("-ETH");
        });

        var idexSchema, idexSchemas = [];

        for (i in res_eth) {
          if (res_eth[i].ask && res_eth[i].bid && res_eth[i].ask != null && res_eth[i].bid != null) {
            //idexSchema = new PairInfo();
            idexSchema = {};
            idexSchema._id = uuid.v1();  
            idexSchema.parity = idexNameFormat(res_eth[i].market);
            idexSchema.buy = res_eth[i].ask; //Number(parseFloat(res_eth[i].askPrice).toFixed(10));
            idexSchema.sell = res_eth[i].bid; //Number(parseFloat(res_eth[i].bidPrice).toFixed(10));
            idexSchema.hambuy = 0;
            idexSchema.hamsell = 0;
            idexSchema.caprazbuy = 0;
            idexSchema.caprazsell = 0;
            idexSchema.base = "";
            idexSchema.market = "Idex";
            idexSchema.contractaddress = "";
  
            idexSchemas.push(idexSchema);
          }
        }

        resolve(idexSchemas);
      })
      .catch((error) => {
        logger.log('info', `${guid} | ${new Date().toISOString()} | IDEX error | + ${error}`);
        reject("idex err: " + error);
      });
  });
};

module.exports = getIdex2Data;