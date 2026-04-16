const express = require("express");
const router = express.Router();
const { pool } = require("../../config/db");
const redisClient = require("../../config/redis");
const auth = require("../../middleware/auth.middleware");

router.get("/", auth, async (req, res) => {
  const tenantId = req.tenantId;

  const cacheKey = `dashboard_${tenantId}`;

  //  1. Check cache
  const cachedData = await redisClient.get(cacheKey);

  if (cachedData) {
    console.log(" From Redis");
    return res.json(JSON.parse(cachedData));
  }

  //  2. Fetch from DB
  const conn = await pool;

  const result = await conn.request()
    .input("tenantId", tenantId)
    .query(`
      SELECT 
        COUNT(*) as totalLeads,
        SUM(CASE WHEN Status='New' THEN 1 ELSE 0 END) as newLeads,
        SUM(CASE WHEN Status='Won' THEN 1 ELSE 0 END) as wonLeads,
        SUM(CASE WHEN Status='Lost' THEN 1 ELSE 0 END) as lostLeads
      FROM Leads
      WHERE TenantId = @tenantId
    `);

  const data = result.recordset[0];

  //  3. Store in Redis (expire in 60 sec)
  await redisClient.setEx(cacheKey, 60, JSON.stringify(data));

  console.log("From DB");

  res.json(data);

  if (!redisClient.isOpen) {
  console.log("Redis not connected, using DB");
}
});

module.exports = router;