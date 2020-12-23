const pool = require("../DB/Connection2");
const logger = require("../logger");

async function uniswap1_upsert(marketsSchemas, guid) {
  logger.log('info', `${guid} | ${new Date().toISOString()} | UNISWAP-1 Upsert started`);

  const query1 = `
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
  const response = await client.query(query1, (err, result) => {
    if (err){
      console.log(err);
      logger.log('info', `${guid} | ${new Date().toISOString()} | UNISWAP-1 Upsert 1 ERROR: ${err}` );
    }
  });

  var query2 = `UPDATE pairinfos 
                   SET multiple = true
                 WHERE parity IN (SELECT parity 
                                    FROM pairinfos 
                                   WHERE market = 'Uniswap-1' 
                                   GROUP by parity 
                                  HAVING count(*)>1)
                   AND market = 'Uniswap-1'`;
  
  const response2 = await client.query(query2, (err, result2) => {
    if (err){
      console.log(err);
      logger.log('info', `${guid} | ${new Date().toISOString()} | UNISWAP-1 Upsert 2 ERROR: ${err}` );
    }
  });
  client.release();  
  logger.log('info', `${guid} | ${new Date().toISOString()} | UNISWAP-1 ended`);
};

module.exports = uniswap1_upsert;
