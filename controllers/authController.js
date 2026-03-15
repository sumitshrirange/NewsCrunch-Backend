const authService = require("../services/authService");
const tokenService = require("../services/tokenService");
const { asyncHandler } = require("../middleware/errorMiddleware");

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.register(
    req.body,
  );
  tokenService.setTokenCookies(res, accessToken, refreshToken);
  res.status(201).json({ success: true, accessToken, user });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  tokenService.setTokenCookies(res, accessToken, refreshToken);
  res.json({ success: true, accessToken, user });
});

// POST /api/auth/google
const googleLogin = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.googleLogin(
    req.body.credential,
  );
  tokenService.setTokenCookies(res, accessToken, refreshToken);
  res.json({ success: true, accessToken, user });
});

// POST /api/auth/refresh
const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  const { accessToken, refreshToken: newRefresh } =
    await authService.refresh(token);
  tokenService.setTokenCookies(res, accessToken, newRefresh);
  res.json({ success: true, accessToken });
});

// POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user);
  tokenService.clearTokenCookies(res);
  res.json({ success: true, message: "Logged out" });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = { register, login, googleLogin, refreshToken, logout, getMe };
