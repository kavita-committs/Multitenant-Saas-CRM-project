require("dotenv").config();
const sql = require("mssql");

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  port : 1440,
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

//module.exports = config;

// const config = {
//   user: "sa",
//   password: "admin1234",
//   server: "localhost",
//   database: "crm_db",
//   port : 1440,
//   options: { trustServerCertificate: true }
// };

const pool = new sql.ConnectionPool(config).connect();
module.exports = { sql, pool };
