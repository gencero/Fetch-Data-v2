const axios = require("axios");
var uuid = require("node-uuid");
const toFixed = require("../Util/toFixed");
const ftxNameFormat = require("../Util/marketNameFormat").ftxNameFormat;
const logger = require("../logger");

const url = "https://ftx.com/api/markets";

const getFtxNewData = (guid) => {
  logger.log('info', `${guid} | ${new Date().toISOString()} | FTX started`);
  return new Promise((resolve, reject) => {
    axios
      .get(url, { timeout: 900 })
      .then((response) => {
        var res = response.data.result.map(({ name, bid, ask, tokenizedEquity }) => ({
          name,
          bid,
          ask,
          tokenizedEquity
        }));
        
        logger.log('info', `${guid} | ${new Date().toISOString()} | FTX response | data.length: ${response.data.result.length}`);

        //console.log("RES:"+ JSON.stringify(res))

        var ftxSchema,ftxSchemas = [];

        /**********************************************************************/
        //USDT çevrim faktörüne göre
        /**********************************************************************/
        const res_usdt_eth = res.filter((item) => {
          if (item.name == "ETH/USD" ){
            return item.name.includes("ETH/USD");
          }
        });

        for (i in res_usdt_eth) {
          var usdt_eth_capraz_ask = Number(parseFloat(res_usdt_eth[i].ask).toFixed(13));
          var usdt_eth_capraz_bid = Number(parseFloat(res_usdt_eth[i].bid).toFixed(13));
        }

        const res_usdt = res.filter((item) => {
            if (item.name.substr(item.name.length - 3) === "USD") {
                //console.log("i: " + JSON.stringify(item));
                if (item.tokenizedEquity != true){
                    return item.name.includes("USD");
                }
            }
        });

        for (i in res_usdt) {
          if (res_usdt[i].ask && res_usdt[i].bid) {
            ftxSchema = {};
            ftxSchema._id = uuid.v1();   
            ftxSchema.parity = ftxNameFormat(res_usdt[i].name);
            ftxSchema.buy = toFixed(res_usdt[i].ask / usdt_eth_capraz_bid); //Number(parseFloat(res_usdt[i].Ask / usdt_eth_capraz_bid).toFixed(10));
            ftxSchema.sell = toFixed(res_usdt[i].bid / usdt_eth_capraz_ask); //Number(parseFloat(res_usdt[i].Bid / usdt_eth_capraz_ask).toFixed(10));
            ftxSchema.hambuy = toFixed(res_usdt[i].ask); //Number(parseFloat(res_usdt[i].Ask).toFixed(10));
            ftxSchema.hamsell = toFixed(res_usdt[i].bid); //Number(parseFloat(res_usdt[i].Bid).toFixed(10));
            ftxSchema.caprazbuy = usdt_eth_capraz_ask;
            ftxSchema.caprazsell = usdt_eth_capraz_bid;
            ftxSchema.base = "USDT";
            ftxSchema.market = "Ftx";
            ftxSchema.contractaddress = "";
            
            ftxSchemas.push(ftxSchema);
          }
        }

        resolve(ftxSchemas);
      })
      .catch((error) => {
        logger.log('info', `${guid} | ${new Date().toISOString()} | FTX error | + ${error}`);
        reject("ftx err: " + error);
      });
  });
};

module.exports = getFtxNewData;
