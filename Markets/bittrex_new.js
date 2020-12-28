const axios = require("axios");
var uuid = require("node-uuid");
const toFixed = require("../Util/toFixed");
const bittrexNameFormat = require("../Util/marketNameFormat").bittrexNameFormat;
const logger = require("../logger");

const url = "https://api.bittrex.com/api/v1.1/public/getmarketsummaries";

const getBittrexNewData = (guid) => {
  logger.log('info', `${guid} | ${new Date().toISOString()} | BITTREX started`);
  return new Promise((resolve, reject) => {
    axios
      .get(url, { timeout: 900 })
      .then((response) => {
        var res = response.data.result.map(({ MarketName, Bid, Ask }) => ({
          MarketName,
          Bid,
          Ask,
        }));
        
        logger.log('info', `${guid} | ${new Date().toISOString()} | BITTREX response | data.length: ${response.data.result.length}`);
        /**********************************************************************/
        //ETH paritelerini aldık.
        /**********************************************************************/
        const res_eth = res.filter((item) => {
          return item.MarketName.includes("ETH-");
        });

        var bittrexSchema,
          bittrexSchemas = [];
        for (i in res_eth) {
          if (res_eth[i].Ask && res_eth[i].Bid) {
            //bittrexSchema = new PairInfo();
            bittrexSchema = {};
            bittrexSchema._id = uuid.v1();    
            bittrexSchema.parity = bittrexNameFormat(res_eth[i].MarketName);
            bittrexSchema.buy = toFixed(res_eth[i].Ask); //Number(parseFloat(res_eth[i].Ask).toFixed(10));
            bittrexSchema.sell = toFixed(res_eth[i].Bid); //Number(parseFloat(res_eth[i].Bid).toFixed(10));
            bittrexSchema.hambuy = 0;
            bittrexSchema.hamsell = 0;
            bittrexSchema.caprazbuy = 0;
            bittrexSchema.caprazsell = 0;
            bittrexSchema.base = "";
            bittrexSchema.market = "Bittrex";
            bittrexSchema.contractaddress = "";

            bittrexSchemas.push(bittrexSchema);
          }
        }

        /**********************************************************************/
        //BTC Çevrim faktörüne göre
        /**********************************************************************/
        const res_btc_eth = res.filter((item) => {
          return item.MarketName.includes("BTC-ETH");
        });

        for (i in res_btc_eth) {
          var btc_eth_capraz_ask = Number(parseFloat(res_btc_eth[i].Ask).toFixed(13));
          var btc_eth_capraz_bid = Number(parseFloat(res_btc_eth[i].Bid).toFixed(13));
        }

        const res_btc = res.filter((item) => {
          return item.MarketName.includes("BTC-");
        });

        for (i in res_btc) {
          if (res_btc[i].Ask && res_btc[i].Bid) {
            //bittrexSchema = new PairInfo();
            bittrexSchema = {};
            bittrexSchema._id = uuid.v1();   
            bittrexSchema.parity = bittrexNameFormat(res_btc[i].MarketName);
            bittrexSchema.buy = toFixed(res_btc[i].Ask / btc_eth_capraz_bid); //Number(parseFloat(res_btc[i].Ask / btc_eth_capraz_bid).toFixed(10));
            bittrexSchema.sell = toFixed(res_btc[i].Bid / btc_eth_capraz_ask); //Number(parseFloat(res_btc[i].Bid / btc_eth_capraz_ask).toFixed(10));
            bittrexSchema.hambuy = toFixed(res_btc[i].Ask); //Number(parseFloat(res_btc[i].Ask).toFixed(10));
            bittrexSchema.hamsell = toFixed(res_btc[i].Bid); //Number(parseFloat(res_btc[i].Bid).toFixed(10));
            bittrexSchema.caprazbuy = btc_eth_capraz_ask;
            bittrexSchema.caprazsell = btc_eth_capraz_bid;
            bittrexSchema.base = "BTC";
            bittrexSchema.market = "Bittrex";
            bittrexSchema.contractaddress = "";

            bittrexSchemas.push(bittrexSchema);
          }
        }

        /**********************************************************************/
        //USDT çevrim faktörüne göre
        /**********************************************************************/
        const res_usdt_eth = res.filter((item) => {
          if (item.MarketName == "USDT-ETH" ){
            return item.MarketName.includes("USDT-ETH");
          }
        });

        for (i in res_usdt_eth) {
          var usdt_eth_capraz_ask = Number(parseFloat(res_usdt_eth[i].Ask).toFixed(13));
          var usdt_eth_capraz_bid = Number(parseFloat(res_usdt_eth[i].Bid).toFixed(13));
        }

        const res_usdt = res.filter((item) => {
          return item.MarketName.includes("USDT-");
        });

        for (i in res_usdt) {
          if (res_usdt[i].Ask && res_usdt[i].Bid) {
            //ittrexSchema = new PairInfo();
            bittrexSchema = {};
            bittrexSchema._id = uuid.v1();   
            bittrexSchema.parity = bittrexNameFormat(res_usdt[i].MarketName);
            bittrexSchema.buy = toFixed(res_usdt[i].Ask / usdt_eth_capraz_bid); //Number(parseFloat(res_usdt[i].Ask / usdt_eth_capraz_bid).toFixed(10));
            bittrexSchema.sell = toFixed(res_usdt[i].Bid / usdt_eth_capraz_ask); //Number(parseFloat(res_usdt[i].Bid / usdt_eth_capraz_ask).toFixed(10));
            bittrexSchema.hambuy = toFixed(res_usdt[i].Ask); //Number(parseFloat(res_usdt[i].Ask).toFixed(10));
            bittrexSchema.hamsell = toFixed(res_usdt[i].Bid); //Number(parseFloat(res_usdt[i].Bid).toFixed(10));
            bittrexSchema.caprazbuy = usdt_eth_capraz_ask;
            bittrexSchema.caprazsell = usdt_eth_capraz_bid;
            bittrexSchema.base = "USDT";
            bittrexSchema.market = "Bittrex";
            bittrexSchema.contractaddress = "";
            
            bittrexSchemas.push(bittrexSchema);
          }
        }

        resolve(bittrexSchemas);
      })
      .catch((error) => {
        logger.log('info', `${guid} | ${new Date().toISOString()} | BITTREX error | + ${error}`);
        reject("bittrex err: " + error);
      });
  });
};

module.exports = getBittrexNewData;
