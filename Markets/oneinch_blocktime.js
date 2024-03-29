const Web3 = require('web3');
const getOneinchData = require("./oneinch.js");
const oneinch_upsert = require("./oneinch_upsert.js");
const logger = require("../logger");
var uuid = require("node-uuid");
const pool = require("../DB/Connection2");

async function getOneinch_Block(){
  let wssUrl = "";
  var query = `SELECT CASE
                        WHEN linkselect='1' THEN wsslink_1
                        WHEN linkselect='2' THEN wsslink_2
                        ELSE wsslink_3
                      END AS wssurl
                FROM runningexchanges WHERE market = '1inch' `;
  
  //const client = await pool.connect();
  const response = await pool.query(query, async (err, result) => {
    if (err){
      console.log(err);
      logger.log('info', `${guid} | ${new Date().toISOString()} | 1INCH Upsert ERROR: ${err}` );
    }
    this.wssUrl = result.rows[0].wssurl;

    const web3 = await new Web3(this.wssUrl);
    web3.eth.subscribe('newBlockHeaders')
    .on("connected", ()=> logger.log('info', `${new Date().toISOString()} | 1INCH Connected to eth node, waiting for block`))
    .on("data", fetchData)
    .on("error", console.error);

  });

  //client.release();   

  async function fetch(guid, url1inch) {
      var result = await getOneinchData(guid, url1inch);
      var upsert = await oneinch_upsert(result, guid);
  }

  async function fetchData(block) {
    var query = `SELECT CASE
                          WHEN linkselect='1' THEN link_1
                          WHEN linkselect='2' THEN link_2
                          ELSE link_3
                        END AS exchangeurl,
                        active
                   FROM runningexchanges 
                  WHERE market = '1inch' `;

    //const client = await pool.connect();
    const response = await pool.query(query, async (err, result) => {
      if (err){
        console.log(err);
        logger.log('info', `${guid} | ${new Date().toISOString()} | 1INCH Upsert ERROR: ${err}` );
      }else{
        var exchangeUrl = result.rows[0].exchangeurl;
        var active = result.rows[0].active;

        if (active == true) {
          var guid = await uuid.v1();  
          logger.log('info', `${guid} | ${new Date().toISOString()} | 1INCH Block ${block.number} recieved, loading new data`);
          await fetch(guid, exchangeUrl);
        }else{
          logger.log('info', `${new Date().toISOString()} | 1INCH deactivated`);
        }
      }
    });
    //client.release();   
  }
}

module.exports = getOneinch_Block;