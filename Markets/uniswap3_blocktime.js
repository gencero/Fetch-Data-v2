const Web3 = require('web3');
const getUniswap3Data = require("./uniswap3.js");
const uniswap3_upsert = require("./uniswap3_upsert.js");
const logger = require("../logger");
var uuid = require("node-uuid");
const pool = require("../DB/Connection2");

async function getUniswap3_Block(){
    let wssUrl = "";
    var query = `SELECT CASE
                          WHEN linkselect='1' THEN wsslink_1
                          ELSE wsslink_2
                        END AS wssurl
                  FROM runningexchanges WHERE market = 'Uniswap-3' `;
    
    const client = await pool.connect();
    const response = await client.query(query, async (err, result) => {
      if (err){
        console.log(err);
        logger.log('info', `${guid} | ${new Date().toISOString()} | UNISWAP-3 Upsert ERROR: ${err}` );
      }
      this.wssUrl = result.rows[0].wssurl;

      const web3 = await new Web3(this.wssUrl);
      web3.eth.subscribe('newBlockHeaders')
      .on("connected", ()=> logger.log('info', `${new Date().toISOString()} | UNISWAP-3 Connected to eth node, waiting for block`))
      .on("data", fetchData)
      .on("error", console.error);

    });

    client.release();   
  
    async function fetch(guid, urlUniswap3) {
        var result = await getUniswap3Data(guid, urlUniswap3);
        var upsert = await uniswap3_upsert(result, guid);
    }

    async function fetchData(block) {
      var query = `SELECT CASE
                            WHEN linkselect='1' THEN link_1
                            ELSE link_2
                          END AS exchangeurl,
                          active
                      FROM runningexchanges 
                     WHERE market = 'Uniswap-3' `;

        const client = await pool.connect();
        const response = await client.query(query, async (err, result) => {
          if (err){
            console.log(err);
            logger.log('info', `${guid} | ${new Date().toISOString()} | UNISWAP-3 Upsert ERROR: ${err}` );
          }else{
            var exchangeUrl = result.rows[0].exchangeurl;
            var active = result.rows[0].active;

            if (active == true) {
              var guid = await uuid.v1();  
              logger.log('info', `${guid} | ${new Date().toISOString()} | UNISWAP-3 Block ${block.number} recieved, loading new data`);
              await fetch(guid, exchangeUrl);
            }else{
              logger.log('info', `${new Date().toISOString()} | UNISWAP-3 deactivated`);
            }
          }
        });
        client.release();   
    }
}

module.exports = getUniswap3_Block;