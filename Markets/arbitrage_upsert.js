
const logger = require("../logger");
const pool = require("../DB/Connection2");

async function arbitrage_upsert(arbitrages, guid) {
  const query = `
    insert into pairpercentages
    select _id, askbase, bidbase, buy, buycontractaddress, pair, sell, sellcontractaddress, ask, bid, buydate, buymultiple, caprazbuy, caprazsell, hambuy, hamsell, percentage, selldate, sellmultiple, to_timestamp('${Date.now()/1000}') as updatedate 
    from json_populate_recordset(
      null::pairpercentages,
      '${JSON.stringify(arbitrages)}'
    )
    ON CONFLICT (buy,sell,pair,bidbase,askbase,buycontractaddress,sellcontractaddress) 
    DO 
       UPDATE SET percentage = EXCLUDED.percentage, 
                  ask = EXCLUDED.ask,
                  bid = EXCLUDED.bid,
                  hambuy = EXCLUDED.hambuy,
                  hamsell = EXCLUDED.hamsell,
                  caprazbuy = EXCLUDED.caprazbuy,
                  caprazsell = EXCLUDED.caprazsell,
                  buydate = EXCLUDED.buydate,
                  selldate = EXCLUDED.selldate, 
                  buymultiple = EXCLUDED.buymultiple,
                  sellmultiple = EXCLUDED.sellmultiple,
                  buycontractaddress = EXCLUDED.buycontractaddress,
                  sellcontractaddress = EXCLUDED.sellcontractaddress,
                  updatedate = to_timestamp('${Date.now()/1000}') ;`;

    //const client = await pool.connect();
    const response = await pool.query(query, (err, res) => {
      if (err){
        console.log(err);
        logger.log('info', `${guid} | ${new Date().toISOString()} | ARBITRAGE ERROR: ${err}` );
      }
    });
    //client.release();
    logger.log('info', `${guid} | ${new Date().toISOString()} | ARBITRAGE ended`);
};

module.exports = arbitrage_upsert;


