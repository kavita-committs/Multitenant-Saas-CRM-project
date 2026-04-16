
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  //  Extract token
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  try {
    const decoded = jwt.verify(token, "access_secret");

    req.user = decoded;
    req.tenantId = decoded.tenantId;

    next();
  } catch (err) {
    console.log("JWT Error:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};












// const jwt = require("jsonwebtoken");

// module.exports = (req, res, next) => {
//   const token = req.headers.authorization;

//   if (!token) return res.status(401).json({ message: "No token" });

//   try {
//     const decoded = jwt.verify(token, "secret");

//     //  VERY IMPORTANT
//     req.user = decoded;
//     req.tenantId = decoded.tenantId;

//     next();
//   } catch {
//     return res.status(403).json({ message: "Invalid token" });
//   }
// };