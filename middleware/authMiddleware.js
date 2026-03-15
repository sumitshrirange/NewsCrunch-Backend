const User = require("../models/User");
const tokenService = require("../services/tokenService");

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith("Bearer "))
      token = req.headers.authorization.split(" ")[1];
    else if (req.cookies?.accessToken) token = req.cookies.accessToken;

    if (!token)
      return res
        .status(401)
        .json({ success: false, error: "Not authenticated" });

    const decoded = tokenService.verifyAccessToken(token);
    const user = await User.findById(decoded.id).select(
      "-password -refreshToken",
    );
    if (!user)
      return res.status(401).json({ success: false, error: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError")
      return res.status(401).json({
        success: false,
        error: "Token expired",
        code: "TOKEN_EXPIRED",
      });
    return res.status(401).json({ success: false, error: "Invalid token" });
  }
};

module.exports = { protect };
