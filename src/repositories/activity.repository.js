const { pool, sql } = require("../config/db");

exports.createActivity = async (data) => {
  const conn = await pool;

  return conn.request()
    .input("action", sql.VarChar, data.action)
    .input("description", sql.VarChar, data.description)
    .input("userId", sql.Int, data.userId)
    .input("tenantId", sql.Int, data.tenantId)
    .query(`
      INSERT INTO Activities (Action, Description, UserId, TenantId)
      VALUES (@action, @description, @userId, @tenantId)
    `);
};