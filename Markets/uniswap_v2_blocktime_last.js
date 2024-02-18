const Web3 = require("web3");
const getUniswapV2DataLast = require("./uniswap_v2_last.js");
const uniswap_v2_upsert_last = require("./uniswap_v2_upsert_last.js");
const logger = require("../logger.js");
var uuid = require("node-uuid");
const pool = require("../DB/Connection2.js");

async function getUniswapV2_Block_Last() {
  var guid = await uuid.v1();
  let wssUrl = "";
  var query = `SELECT CASE
                          WHEN linkselect='1' THEN wsslink_1
                          WHEN linkselect='2' THEN wsslink_2
                          ELSE wsslink_3
                        END AS wssurl
                  FROM runningexchanges WHERE market = 'Uniswap-2' `;

  //const client = await pool.connect();
  const response = await pool.query(query, async (err, result) => {
    if (err) {
      console.log(err);
      logger.log("info",`${guid} | ${new Date().toISOString()} | UNISWAP-V2 Upsert ERROR: ${err}`);
    }
    this.wssUrl = result.rows[0].wssurl;

    //this.wssUrl = "wss://37.27.60.120/node/vZNgaINtag2JoFBe/eth";
    //this.wssUrl = "wss://ws-nd-535-904-514.p2pify.com/cc144966af677fa9db648b85a21563ea";
    //const ws = new WebSocket(this.wssUrl, { rejectUnauthorized: false });

    const web3 = new Web3(new Web3.providers.WebsocketProvider(this.wssUrl));

    web3.eth
      .subscribe("newBlockHeaders")
      .on("connected", () =>
        logger.log("info",`${new Date().toISOString()} | UNISWAP-V2 Connected to eth node, waiting for block`)
      )
      .on("data", fetchData)
      .on("error", console.error);
  });

  //client.release();

  async function fetch(guid, urlUniswap2) {
    var result = await getUniswapV2DataLast(guid, urlUniswap2);
    if (result.length > 0){
        var upsert = await uniswap_v2_upsert_last(result, guid);
    }
  }

  async function fetchData(block) {
    var query = `SELECT CASE
                            WHEN linkselect='1' THEN link_1
                            WHEN linkselect='2' THEN link_2
                            ELSE link_3
                          END AS exchangeurl,
                          active
                      FROM runningexchanges 
                     WHERE market = 'Uniswap-2' `;

    //const client = await pool.connect();
    const response = await pool.query(query, async (err, result) => {
      if (err) {
        console.log(err);
        logger.log("info",`${guid} | ${new Date().toISOString()} | UNISWAP-V2 Upsert ERROR: ${err}`);
      } else {
        var exchangeUrl = result.rows[0].exchangeurl;
        var active = result.rows[0].active;

        //console.log("exchangeUrl: " + exchangeUrl);

        if (active == true) {
          var guid = await uuid.v1();
          logger.log("info",`${guid} | ${new Date().toISOString()} | UNISWAP-V2 Block ${block.number} recieved, loading new data`);
          await fetch(guid, exchangeUrl);
        } else {
          logger.log("info",`${new Date().toISOString()} | UNISWAP-V2 deactivated`);
        }
      }
    });
    //client.release();
  }
}

module.exports = getUniswapV2_Block_Last;
