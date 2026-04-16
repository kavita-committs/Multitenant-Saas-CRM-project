const { sql, pool } = require("../config/db");

exports.createLead = async (data) => {
  const conn = await pool;
  return conn.request()
    .input("name", sql.VarChar, data.name)
    .input("status", sql.VarChar, data.status)
    .input("tenantId", sql.Int, data.tenantId)
    .query("INSERT INTO Leads (Name, Status, TenantId) VALUES (@name,@status,@tenantId)");
};
