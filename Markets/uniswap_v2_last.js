const axios = require("axios");
const toFixed = require("../Util/toFixed");
var uuid = require("node-uuid");
const logger = require("../logger");
const pg = require("pg");

//const url = "http://het.freemyip.com:3005/uniswap2";
//const url = "http://138.201.32.165:3005/uniswap2";

const getBinanceNewData = (guid) => {
  const url = "https://api.binance.com/api/v3/ticker/bookTicker";

  return new Promise((resolve, reject) => {
    axios
      .get(url, { timeout: 1200 })
      .then((response) => {
        var res = response.data.map(({ symbol, askPrice, bidPrice }) => ({
          symbol,
          askPrice,
          bidPrice,
        }));

        const res_eth = res.filter((item) => {
          if (item.symbol.substr(item.symbol.length - 3) === "ETH") {
            return item.symbol.includes("ETH");
          }
        });
        
        const res_eth_usdt = res.filter((item) => { 
          if (item.symbol === "ETHUSDT") {
            return item.symbol.includes("ETHUSDT");
          }
        });

        var binanceSchema,
          binanceSchemas = [];
        for (i in res_eth_usdt) {
          var eth_usdt_capraz_ask = Number(
            parseFloat(res_eth_usdt[i].askPrice).toFixed(13)
          );

          var eth_usdt_capraz_bid = Number(
            parseFloat(res_eth_usdt[i].bidPrice).toFixed(13)
          );

          binanceSchema = {};
          binanceSchema._id = uuid.v1();
          binanceSchema.caprazbuy = eth_usdt_capraz_ask;
          binanceSchema.caprazsell = eth_usdt_capraz_bid;

          binanceSchemas.push(binanceSchema);
        }

        resolve(binanceSchemas);
      })
      .catch((error) => {logger.log("info",`${guid} | ${new Date().toISOString()} | Uniswap2-Binance error | + ${error}`);
        reject("Uniswap2-Binance err: " + error);
      });
  });
};

async function getUniswap2DataLast(guid, url) {
  try {
    logger.log("info",`${guid} | ${new Date().toISOString()} | UNISWAP-V2 started`);
    console.log("url: " + url);

    var result = await getBinanceNewData(guid);

    return new Promise((resolve, reject) => {
      axios
        .get(url, { timeout: 8000 })
        .then((response) => {

            const data = response.data;
           
            var maxAmountsValueBuy; 
            var maxAmountsValueSell;

            try {
                const usdtRecords = data['WETH'].filter(record => record.symbol === 'USDT');

                // Amounts listelerinin ilk elemanlarını alalım
                const firstAmounts = usdtRecords.map(record => record.amounts[0]);

                // İlk elemanı en büyük olan amount
                maxAmountsValueBuy = Math.max(...firstAmounts);

                // En büyük olan amount'a ait diğer amount
                maxAmountsValueSell = usdtRecords.find(record => record.amounts[0] === maxAmountsValueBuy).amounts[1];
                 
            } catch (error) {
                console.log("catch");  
                maxAmountsValueBuy = 0;
                maxAmountsValueSell = 0;
            }

            // Sonuçları yazdıralım
            console.log("maxAmountsValueBuy:" + maxAmountsValueBuy + " - maxAmountsValueSell: " + maxAmountsValueSell);

            // USDC ve DAI için amounts değerlerini hesaplayalım
            const usdcData = data["USDC"].map(item => ({
                symbol: item.symbol,
                name: item.name,
                decimals: item.decimals,
                id: item.id,
                feeTier: item.feeTier,
                amounts: [maxAmountsValueBuy * (item.amounts[0] / 2500), maxAmountsValueSell * (item.amounts[1] / 2500)]
            }));

            const daiData = data["DAI"].map(item => ({
                symbol: item.symbol,
                name: item.name,
                decimals: item.decimals,
                id: item.id,
                feeTier: item.feeTier,
                amounts: [maxAmountsValueBuy * (item.amounts[0] / 2500), maxAmountsValueSell * (item.amounts[1] / 2500)]
            }));

            const usdtData = data["USDT"].map(item => ({
                symbol: item.symbol,
                name: item.name,
                decimals: item.decimals,
                id: item.id,
                feeTier: item.feeTier,
                amounts: [maxAmountsValueBuy * (item.amounts[0] / 2500), maxAmountsValueSell * (item.amounts[1] / 2500)]
            }));

            const groupedData = {};
            [...data["WETH"], ...usdtData, ...usdcData, ...daiData].forEach(item => {
                if (!groupedData[item.id] || groupedData[item.id].amounts[0] < item.amounts[0]) {
                    groupedData[item.id] = item;
                }
            });

            //console.log(groupedData)
            // Sonuçları yazdırma
            //console.log(JSON.stringify(Object.values(groupedData), null, 4));
                  
            var uniswap2Schema,
                uniswap2Schemas = [];
            var ethToTokenPrice, tokenToEthPrice;
            for (i in groupedData) {
                if (
                    groupedData[i].amounts[0] &&
                    groupedData[i].amounts[1] &&
                    !groupedData[i].symbol.includes("'")
                ) {
                    if (
                        !(
                            groupedData[i].amounts[0] == null ||
                            groupedData[i].amounts[1] == null
                        )) {
                        if (groupedData[i].amounts[0] < 0) {
                            ethToTokenPrice = 0;
                            var lowestAsk = 0;
                        } else {
                            ethToTokenPrice = groupedData[i].amounts[0];
                            var lowestAsk = 1 / ethToTokenPrice;
                        }

                        // ethusdt fiyatını bulup 1/tokenToEthPrice yerine ethusdt/tokenToEthPrice yapabiliriz.
                        // ya da yine highestBid bu şekilde buluruz. bunu ethusdt fiyatı ile çarparız.
                        if (groupedData[i].amounts[1] < 0) {
                            tokenToEthPrice = 0; 
                            var highestBid = 0;
                        } else {
                            tokenToEthPrice = groupedData[i].amounts[1];
                            var highestBid = 1 / tokenToEthPrice;
                        }

                        uniswap2Schema = {};
                        uniswap2Schema._id = uuid.v1();
                        uniswap2Schema.parity = groupedData[i].symbol.toUpperCase();
                        uniswap2Schema.buy = toFixed(lowestAsk * result[0]["caprazbuy"]);
                        uniswap2Schema.sell = toFixed(highestBid * result[0]["caprazsell"]);
                        uniswap2Schema.hambuy = toFixed(lowestAsk);
                        uniswap2Schema.hamsell = toFixed(highestBid);
                        uniswap2Schema.caprazbuy = result[0]["caprazbuy"];
                        uniswap2Schema.caprazsell = result[0]["caprazsell"];
                        uniswap2Schema.base = "";
                        uniswap2Schema.contractaddress = groupedData[i].id;
                        uniswap2Schema.market = "Uniswap-2";

                        uniswap2Schemas.push(uniswap2Schema);  
                    }
                }
            }
            resolve(uniswap2Schemas);
        })
        .catch((error) => {logger.log("info",`${guid} | ${new Date().toISOString()} | UNISWAP-V2 error | + ${error}`);
            reject("XXX UNISWAP-V2 ERR: " + error);
        });
    });
  } catch (error) {
    logger.log("info",`${guid} | ${new Date().toISOString()} | UNISWAP-V2 error | + ${error}`);
  }
}

module.exports = getUniswap2DataLast;
