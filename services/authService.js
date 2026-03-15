const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const env = require("../config/env");
const tokenService = require("./tokenService");

const googleClient = new OAuth2Client(env.googleClientId);

/**
 * Issue access + refresh tokens, persist refresh token, return both.
 */
const issueTokens = async (user) => {
  const accessToken = tokenService.generateAccessToken(user._id);
  const refreshToken = tokenService.generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
};

const register = async ({ name, email, password }) => {
  if (!name || !email || !password)
    throw Object.assign(new Error("All fields are required"), { status: 400 });
  if (password.length < 6)
    throw Object.assign(new Error("Password must be at least 6 characters"), {
      status: 400,
    });

  const existing = await User.findOne({ email });
  if (existing)
    throw Object.assign(new Error("Email already in use"), { status: 409 });

  const user = await User.create({
    name,
    email,
    password,
    authProvider: "local",
  });
  const tokens = await issueTokens(user);
  return { user: user.toJSON(), ...tokens };
};

const login = async ({ email, password }) => {
  if (!email || !password)
    throw Object.assign(new Error("Email and password are required"), {
      status: 400,
    });

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password)))
    throw Object.assign(new Error("Invalid email or password"), {
      status: 401,
    });

  const tokens = await issueTokens(user);
  return { user: user.toJSON(), ...tokens };
};

const googleLogin = async (credential) => {
  if (!credential)
    throw Object.assign(new Error("Google credential required"), {
      status: 400,
    });

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: env.googleClientId,
  });
  const { sub: googleId, email, name, picture } = ticket.getPayload();

  let user = await User.findOne({ $or: [{ googleId }, { email }] });
  if (user) {
    if (!user.googleId) {
      user.googleId = googleId;
      user.authProvider = "google";
    }
    if (picture && !user.avatar) user.avatar = picture;
  } else {
    user = new User({
      name,
      email,
      googleId,
      avatar: picture,
      authProvider: "google",
    });
  }

  const tokens = await issueTokens(user);
  return { user: user.toJSON(), ...tokens };
};

const refresh = async (token) => {
  if (!token)
    throw Object.assign(new Error("No refresh token"), { status: 401 });

  const decoded = tokenService.verifyRefreshToken(token);
  const user = await User.findById(decoded.id);
  if (!user || user.refreshToken !== token)
    throw Object.assign(new Error("Invalid refresh token"), { status: 401 });

  const accessToken = tokenService.generateAccessToken(user._id);
  const refreshToken = tokenService.generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
};

const logout = async (user) => {
  user.refreshToken = null;
  await user.save({ validateBeforeSave: false });
};

module.exports = { register, login, googleLogin, refresh, logout };
