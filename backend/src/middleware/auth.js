const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET || "change_this_secret";

module.exports = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader)
    return res.status(401).json({ message: "No token, authorization denied" });

  const parts = authHeader.split(" ");
  if (parts.length !== 2)
    return res.status(401).json({ message: "Token error" });

  const token = parts[1];
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = { id: decoded.id };
    next();
  } catch {
    return res.status(401).json({ message: "Token is not valid" });
  }
};
