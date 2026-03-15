const jwt = require("jsonwebtoken");
const blacklistModel = require("../models/blacklist.model");

/**
 * @name authUser
 * @description Middleware to authenticate the user by verifying the jwt token in the request header and checking if the token is blacklisted in the database, if the token is valid then it adds the user details to the request object and calls the next middleware
 * @access Private
 */

async function authUser(req, res, next) {
  let token;

  if (req.cookies?.token) {
    token = req.cookies.token;
  } else if (req.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized, token is missing",
    });
  }

  const isBlacklisted = await blacklistModel.findOne({ token });

  if (isBlacklisted) {
    return res.status(401).json({
      success: false,
      message: "token is invalid, please login again",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = { id: decoded.userId };
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized, invalid token",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = {
  authUser,
};
