const Pool = require("pg").Pool;

const pool = new Pool({
    host: '3.122.228.235',
    database: 'dev',
    password: '12UCdort5*dev',
    port: 5432,
    user: "dev",
    max: 30,
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 2000,
});

pool.on('error', (err, client) => {
  console.error('Error:', err);
});

module.exports = pool;