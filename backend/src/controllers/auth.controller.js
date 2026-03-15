const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const blacklistModel = require("../models/blacklist.model");

/**
 * @name registerUserController
 * @description Controller to handle user registration , expects username , email and password in the request body
 * @access Public
 */
async function registerUserController(req, res, next) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide username,email,password",
    });
  }

  const isUserAlreadyExists = await userModel.findOne({
    $or: [{ username }, { email }],
  });

  if (isUserAlreadyExists?.username === username) {
    return res.status(400).json({
      success: false,
      message: "Username already taken.",
    });
  }

  if (isUserAlreadyExists?.email === email) {
    return res.status(400).json({
      success: false,
      message: "Account already exists with this email address.",
    });
  }

  const hash = await bcrypt.hash(password, 10);

  const user = await userModel.create({
    username,
    email,
    password: hash,
  });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.cookie("token", token);

  return res.status(201).json({
    success: true,
    message: "User registered successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}

/**
 * @name loginUserController
 * @description Controller to handle user login , expects email and password in the request body and returns a jwt token if the credentials are valid
 * @access Public
 */
async function loginUserController(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide email and password",
    });
  }

  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(400).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.cookie("token", token);

  return res.status(200).json({
    success: true,
    message: "User logged in successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}

/**
 * @name logoutUserController
 * @description Controller to handle user logout , expects a valid jwt token in the request header and blacklists the token to prevent further use
 * @access Private
 */
async function logoutUserController(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Token is required for logout",
    });
  }

  if (token) {
    await blacklistModel.create({ token });
  }

  res.clearCookie("token");

  return res.status(200).json({
    success: true,
    message: "User logged out successfully",
  });
}

/**
 * @name getMeController
 * @description Controller to get the details of the logged in user , expects a valid jwt token in the request header and returns the user details if the token is valid
 * @private Private
 */
async function getMeController(req, res, next) {
  if (!req.user?.id) {
    return res.status(400).json({
      success: false,
      message: "User id is missing in the request",
    });
  }

  const user = await userModel.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "User details fetched successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}

module.exports = {
  registerUserController,
  loginUserController,
  logoutUserController,
  getMeController,
};
