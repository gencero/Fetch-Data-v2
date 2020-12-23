const toFixed = require("../Util/toFixed");
var uuid = require("node-uuid");
const pool = require("../DB/Connection2");
const logger = require("../logger");

async function arbitrage_new(guid) {
  try {
    var result2 = [];
    const client = await pool.connect();
    return new Promise(async(resolve, reject) => {
      logger.log('info', `${guid} | ${new Date().toISOString()} | ARBITRAGE Started`);

      var query = `select json_agg(tb)::jsonb as result
                     from (select parity as _id, json_agg(obj) as details
                             from (select parity,
                                          json_build_object('_id', _id,
                                                            'base', base,
                                                            'market', market,
                                                            'parity', parity,
                                                            'buy', buy,
                                                            'caprazbuy', caprazbuy,
                                                            'caprazsell', caprazsell,
                                                            'contractaddress', contractaddress,
                                                            'hambuy', hambuy,
                                                            'hamsell', hamsell,
                                                            'sell', sell,
                                                            'updatedate',updatedate
                                                            ) as obj
                                     from pairinfos
                                   ) tmp
                            group by parity) as tb`; 
                            
    //const client = await pool.connect();
    const response = await client.query(query, (err, agg) => {
      if (err){
        console.log(err);
        logger.log('info', `${guid} | ${new Date().toISOString()} | ARBITRAGE ERROR: ${err}` );
      }else{
        for (var groupedByPair of agg.rows[0].result) {
          for (var i = 0; i < groupedByPair.details.length; i++) {
            for (var j = 0; j < groupedByPair.details.length; j++) {
              if (
                !(
                  (
                    isNaN(groupedByPair.details[i].sell) ||
                    isNaN(groupedByPair.details[i].buy) ||
                    toFixed(groupedByPair.details[i].buy) == 0 ||
                    toFixed(groupedByPair.details[j].sell) == 0
                  )
                )
              ) {
                var percentage =(100 * (toFixed(groupedByPair.details[j].sell) - toFixed(groupedByPair.details[i].buy))) / toFixed(groupedByPair.details[i].buy);

                if (percentage > 0) {
                  //perc_pair = new PairPercentage();
                  var perc_pair = {};
                  perc_pair._id=uuid.v1();
                  perc_pair.percentage = Number(parseFloat(percentage).toFixed(2));
                  perc_pair.buy = groupedByPair.details[i].market;
                  perc_pair.sell = groupedByPair.details[j].market;
                  perc_pair.pair = groupedByPair.details[i].parity;
                  perc_pair.ask = toFixed(groupedByPair.details[i].buy); 
                  perc_pair.bid = toFixed(groupedByPair.details[j].sell); 
                  perc_pair.hambuy = toFixed(groupedByPair.details[i].hambuy); 
                  perc_pair.hamsell = toFixed(groupedByPair.details[j].hamsell); 
                  perc_pair.caprazbuy = Number(parseFloat(groupedByPair.details[i].caprazbuy).toFixed(10));
                  perc_pair.caprazsell = Number(parseFloat(groupedByPair.details[j].caprazsell).toFixed(10));
                  perc_pair.askbase = groupedByPair.details[i].base; //bidbbase ve askbase yanlış set edilmiş, değiştirdik. i'ler ask
                  perc_pair.bidbase = groupedByPair.details[j].base;
                  perc_pair.buydate = groupedByPair.details[i].updatedate;
                  perc_pair.selldate = groupedByPair.details[j].updatedate;
                  perc_pair.buymultiple = groupedByPair.details[i].multiple;
                  perc_pair.sellmultiple = groupedByPair.details[j].multiple;
                  perc_pair.buycontractaddress = groupedByPair.details[i].contractaddress;
                  perc_pair.sellcontractaddress = groupedByPair.details[j].contractaddress;
                  //perc_pair.updatedate = Date.now;
                  result2.push(perc_pair);
                }
              }
            }
          }
        }
        logger.log('info', `${guid} | ${new Date().toISOString()} | ARBITRAGE result | data.length: ${result2.length}`);
        resolve(result2);
      }
    });
    client.release();
    });
  } catch (error) {
    logger.log('info', `${guid} | ${new Date().toISOString()} | ARBITRAGE error | + ${error}`);
  }
}

module.exports = arbitrage_new;
