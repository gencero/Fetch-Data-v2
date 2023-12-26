const Pool = require("pg").Pool;

/*
const pool = new Pool({
  host: "18.197.97.239", //"18.198.16.101",
  database: "dev", //'prod',
  password: "Contavolta_5666", //'12UCdort5*',
  port: 5432,
  user: "postgres", //"prod",
  max: 40,
  idleTimeoutMillis: 20000,
  connectionTimeoutMillis: 20000,
});
*/
const pool = new Pool({
  //host: "37.27.60.120",
  host: "localhost",
  database: "oetrader_test",
  password: "Taylan1Okan2Orhan3Emre4?",
  port: 5432,
  user: "postgres",
  max: 40,
  idleTimeoutMillis: 20000,
  connectionTimeoutMillis: 20000,
});

pool.on("error", (err, client) => {
  console.error("Error:", err);
});

module.exports = pool;
