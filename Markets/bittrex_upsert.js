const pool = require("../DB/Connection2");
const logger = require("../logger");

async function bittrex_upsert(guid, marketsSchemas) {
//const bittrex_upsert = (guid, marketsSchemas) => {
  logger.log('info', `${guid} | ${new Date().toISOString()} | BITTREX Upsert started`);

  const query = `
  insert into pairinfos
  select _id, base, contractaddress, market, parity, buy, caprazbuy, caprazsell, hambuy, hamsell, sell, to_timestamp('${Date.now()/1000}') as updatedate
  from json_populate_recordset(
    null::pairinfos,
    '${JSON.stringify(marketsSchemas)}'
  )
  ON CONFLICT (market,parity,base,contractaddress)
  DO 
     UPDATE SET buy = EXCLUDED.buy,
                sell= EXCLUDED.sell,
                hambuy= EXCLUDED.hambuy,
                hamsell= EXCLUDED.hamsell,
                caprazbuy = EXCLUDED.caprazbuy,
                caprazsell= EXCLUDED.caprazsell,
                contractaddress= EXCLUDED.contractaddress,
                updatedate = to_timestamp('${Date.now()/1000}');`;

  const client = await pool.connect();
  const response = await client.query(query, (err, result) => {
    if (err){
      console.log(err);
      logger.log('info', `${guid} | ${new Date().toISOString()} | BITTREX Upsert ERROR: ${err}` );
    }
  });
  client.release();  
  logger.log('info', `${guid} | ${new Date().toISOString()} | BITTREX Upsert ended`);
};

module.exports = bittrex_upsert;
