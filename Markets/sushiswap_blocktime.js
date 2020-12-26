const Web3 = require('web3');
const getSushiSwapData = require("./sushiswap.js");
const sushiswap_upsert = require("./sushiswap_upsert.js");
const logger = require("../logger");
var uuid = require("node-uuid");
const pool = require("../DB/Connection2");

async function getSushiswap_Block(){
  let wssUrl = "";
    var query = `SELECT CASE
                          WHEN linkselect='1' THEN wsslink_1
                          ELSE wsslink_2
                        END AS wssurl
                  FROM runningexchanges WHERE market = 'Sushiswap' `;
    
    //const client = await pool.connect();
    const response = await pool.query(query, async (err, result) => {
      if (err){
        console.log(err);
        logger.log('info', `${guid} | ${new Date().toISOString()} | SUSHISWAP Upsert ERROR: ${err}` );
      }
      this.wssUrl = result.rows[0].wssurl;

      const web3 = await new Web3(this.wssUrl);
      web3.eth.subscribe('newBlockHeaders')
      .on("connected", ()=> logger.log('info', `${new Date().toISOString()} | SUSHISWAP Connected to eth node, waiting for block`))
      .on("data", fetchData)
      .on("error", console.error);

    });

    //client.release();   
  
    async function fetch(guid, urlSushiswap) {
        var result = await getSushiSwapData(guid, urlSushiswap);
        var upsert = await sushiswap_upsert(result, guid);
    }

    async function fetchData(block) {
      var query = `SELECT CASE
                            WHEN linkselect='1' THEN link_1
                            ELSE link_2
                          END AS exchangeurl,
                          active
                     FROM runningexchanges 
                    WHERE market = 'Sushiswap' `;

      //const client = await pool.connect();
      const response = await pool.query(query, async (err, result) => {
        if (err){
          console.log(err);
          logger.log('info', `${guid} | ${new Date().toISOString()} | SUSHISWAP Upsert ERROR: ${err}` );
        }else{
          var exchangeUrl = result.rows[0].exchangeurl;
          var active = result.rows[0].active;

          if (active == true) {
            var guid = await uuid.v1();  
            logger.log('info', `${guid} | ${new Date().toISOString()} | SUSHISWAP Block ${block.number} recieved, loading new data`);
            await fetch(guid, exchangeUrl);
          }else{
            logger.log('info', `${new Date().toISOString()} | SUSHISWAP deactivated`);
          }
        }
      });
      //client.release();   
    }
}

module.exports = getSushiswap_Block;