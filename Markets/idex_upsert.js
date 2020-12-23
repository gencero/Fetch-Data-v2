const pool = require("../DB/Connection2");
const logger = require("../logger");

async function idex_upsert(guid, idexSchemas) {
//const idex_upsert = (guid, idexSchemas) => {
  logger.log('info', `${guid} | ${new Date().toISOString()} | IDEX Upsert started`);

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
      logger.log('info', `${guid} | ${new Date().toISOString()} | IDEX Upsert ERROR: ${err}` );
    }
  });
  client.release();  
  logger.log('info', `${guid} | ${new Date().toISOString()} | IDEX Upsert ended`);
  
};

module.exports = idex_upsert;
