const pool = require("../DB/Connection2");
const logger = require("../logger");

async function balancer_upsert(marketsSchemas, guid) {
  logger.log('info', `${guid} | ${new Date().toISOString()} | BALANCER Upsert started`);

  const query1 = `
  insert into pairinfos
  select y._id, y.base, y.contractaddress, y.market, y.parity, y.buy, y.caprazbuy, y.caprazsell, y.hambuy, y.hamsell, y.sell, to_timestamp('${Date.now()/1000}') as updatedate  from (
    select x.* from (
      select *, row_number() over(partition by market, parity, base, contractaddress, buy, sell, hambuy, hamsell, caprazbuy, caprazsell order by 1) as rownum
      from json_populate_recordset(
        null::pairinfos,
        '${JSON.stringify(marketsSchemas)}'
      )
    )x where x.rownum = 1
  )y
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

  var query2 = `UPDATE pairinfos 
                SET multiple = true
              WHERE parity IN (SELECT parity 
                                 FROM pairinfos 
                                WHERE market = 'Balancer' 
                                GROUP by parity 
                               HAVING count(*)>1)
                AND market = 'Balancer'`;

  const client = await pool.connect();
  const response = await client.query(query1, async(err, result) => {
    if (err){
      client.release();  
      console.log(err);
      logger.log('info', `${guid} | ${new Date().toISOString()} | BALANCER Upsert 1 ERROR: ${err}` );
    }else{
      const response2 = await client.query(query2, async(err, result2) => {
        if (err){
          client.release();  
          console.log(err);
          logger.log('info', `${guid} | ${new Date().toISOString()} | BALANCER Upsert 2 ERROR: ${err}` );
        }
      });
    }
  });

  client.release();  
  logger.log('info', `${guid} | ${new Date().toISOString()} | BALANCER ended`);
};

module.exports = balancer_upsert;
