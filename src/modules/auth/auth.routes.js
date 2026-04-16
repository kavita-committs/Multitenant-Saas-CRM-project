const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { pool, sql } = require("../../config/db");


router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, companyName } = req.body;

    const conn = await pool;

    // 1. Check if user already exists
    const existingUser = await conn.request()
      .input("email", sql.VarChar, email)
      .query("SELECT * FROM Users WHERE Email = @email");

    if (existingUser.recordset.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    //  2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //  3. Create Tenant (IMPORTANT)
    const tenantResult = await conn.request()
      .input("name", sql.VarChar, companyName)
      .input("plan", sql.VarChar, "Free")
      .query(`
        INSERT INTO Tenants (Name, SubscriptionPlan)
        OUTPUT INSERTED.Id
        VALUES (@name, @plan)
      `);

    const tenantId = tenantResult.recordset[0].Id;

    //  4. Create User (Admin of that tenant)
    await conn.request()
      .input("name", sql.VarChar, name)
      .input("email", sql.VarChar, email)
      .input("password", sql.VarChar, hashedPassword)
      .input("role", sql.VarChar, "admin")
      .input("tenantId", sql.Int, tenantId)
      .query(`
        INSERT INTO Users (Name, Email, Password, Role, TenantId)
        VALUES (@name, @email, @password, @role, @tenantId)
      `);

    //  5. Generate Token
    const token = jwt.sign({
      email,
      role: "admin",
      tenantId
    }, "secret");

    res.status(201).json({
      message: "Signup successful",
      tenantId,
      token
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

//-------------------Login api---------------------------------------------------------------------------------

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const conn = await pool;

  const result = await conn.request()
    .input("email", email)
    .query("SELECT * FROM Users WHERE Email = @email");

  const user = result.recordset[0];

  // User not found
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.Password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid password" });
  }

  //  Generate token
//   const token = jwt.sign({
//     id: user.Id,
//     tenantId: user.TenantId,
//     role: user.Role
//   }, "secret");

//   res.json({ token });
// });


  const payload = {
    id: user.Id,
    tenantId: user.TenantId,
    role: user.Role
  };

  const accessToken = jwt.sign(payload, "access_secret", {
    expiresIn: "15m"
  });

  const refreshToken = jwt.sign(payload, "refresh_secret", {
    expiresIn: "7d"
  });

  //const conn = await pool;

  // 🔥 Save refresh token in DB
  await conn.request()
    .input("userId", sql.Int, user.Id)
    .input("token", sql.VarChar, refreshToken)
    .query(`
      INSERT INTO RefreshTokens (UserId, Token)
      VALUES (@userId, @token)
    `);

  res.json({ accessToken, refreshToken });
});


//-------------------refresh token api-------------------------------------------
router.post("/refresh-token", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token" });
  }

  const conn = await pool;

  //  Check token in DB
  const result = await conn.request()
    .input("token", refreshToken)
    .query("SELECT * FROM RefreshTokens WHERE Token = @token");

  if (result.recordset.length === 0) {
    return res.status(403).json({ message: "Token invalid or logged out" });
  }

  try {
    const decoded = jwt.verify(refreshToken, "refresh_secret");

    const newAccessToken = jwt.sign({
      id: decoded.id,
      tenantId: decoded.tenantId,
      role: decoded.role
    }, "access_secret", { expiresIn: "15m" });

    res.json({ accessToken: newAccessToken });

  } catch {
    return res.status(403).json({ message: "Invalid token" });
  }
});

//-----------------Logout api --------------------------------

router.post("/logout", async (req, res) => {
  const { refreshToken } = req.body;

  const conn = await pool;

  await conn.request()
    .input("token", refreshToken)
    .query("DELETE FROM RefreshTokens WHERE Token = @token");

  res.json({ message: "Logged out successfully" });
});

module.exports = router;