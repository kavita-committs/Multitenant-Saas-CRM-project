const sql = require("mssql");

const config = {
  user: "sa",
  password: "admin1234",
  server: "localhost",
  database: "crm_db",
  port : 1440,
  options: { trustServerCertificate: true }
};

const pool = new sql.ConnectionPool(config).connect();
module.exports = { sql, pool };
