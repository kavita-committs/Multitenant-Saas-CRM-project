const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, "secret");

    //  VERY IMPORTANT
    req.user = decoded;
    req.tenantId = decoded.tenantId;

    next();
  } catch {
    return res.status(403).json({ message: "Invalid token" });
  }
};