const logger = require("../logger");
const pool = require("../DB/Connection2");

async function binance_upsert(guid, marketsSchemas) {
  //const binance_upsert = async (guid, marketsSchemas) => {
  logger.log('info', `${guid} | ${new Date().toISOString()} | BINANCE Upsert started`);

  const query = `
  insert into pairinfos
  select *
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
      logger.log('info', `${guid} | ${new Date().toISOString()} | BINANCE Upsert ERROR: ${err}` );
    }
  });
  client.release();  
  logger.log('info', `${guid} | ${new Date().toISOString()} | BINANCE Upsert ended`);
};

module.exports = binance_upsert;
