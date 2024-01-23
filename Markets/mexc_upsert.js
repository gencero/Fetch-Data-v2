const logger = require("../logger");
const pool = require("../DB/Connection2");

async function mexc_upsert(guid, marketsSchemas) {
  logger.log(
    "info",
    `${guid} | ${new Date().toISOString()} | MEXC Upsert started`
  );

  const query = `
  insert into pairinfos
  select _id, base, contractaddress, market, parity, buy, caprazbuy, caprazsell, hambuy, hamsell, sell, to_timestamp('${
    Date.now() / 1000
  }') as updatedate
  from json_populate_recordset(
    null::pairinfos,
    '${JSON.stringify(marketsSchemas)}'
  )
  order by _id FOR UPDATE SKIP LOCKED
  ON CONFLICT (market,parity,base,contractaddress)
  DO 
     UPDATE SET buy = EXCLUDED.buy,
                sell= EXCLUDED.sell,
                hambuy= EXCLUDED.hambuy,
                hamsell= EXCLUDED.hamsell,
                caprazbuy = EXCLUDED.caprazbuy,
                caprazsell= EXCLUDED.caprazsell,
                contractaddress= EXCLUDED.contractaddress,
                updatedate = to_timestamp('${Date.now() / 1000}');`;

  //const client = await pool.connect();
  const response = await pool.query(query, (err, result) => {
    if (err) {
      console.log(err);
      logger.log(
        "info",
        `${guid} | ${new Date().toISOString()} | MEXC Upsert ERROR: ${err}`
      );
    }
  });
  //client.release();
  logger.log(
    "info",
    `${guid} | ${new Date().toISOString()} | MEXC Upsert ended`
  );
}

module.exports = mexc_upsert;
