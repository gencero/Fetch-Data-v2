const logger = require("../logger");
const pool = require("../DB/Connection2");

const delete_arbitrage = async () => {
  var query1 = "Delete from pairpercentages where updatedate < now() - interval '30 seconds'";

  const client = await pool.connect();
  const response1 = await client.query(query1, (err1, result1) => {
    if (err1){
      console.log(err1);
      logger.log("info", 'ERROR - POSTGRE removed PairPercentage data: ' + err1);
    }  
  });
  logger.log("info", 'POSTGRE removed PairPercentage data');

  var query2 = "Delete from pairinfos where updatedate < now() - interval '30 seconds'";
  const response2 = await client.query(query2, (err2, result2) => {
    if (err2){
      console.log(err2);
      logger.log("info", 'ERROR - POSTGRE removed PairInfos data: ' + err2);
    }
  });
  client.release();
  logger.log("info", 'POSTGRE removed PairInfos data');

};

module.exports = delete_arbitrage;


