const express = require("express");

const {
    sendOtp,
    login,
    registerUser,
    changePassword,
    forgotPassword,
    forgotPasswordToken,
    logoutUser,
    regenerateToken,
    getUserDetails,
    resetPassValidateToken,
    setupTwoFactor,
    verifyTwoFactorSetup,
    verifyTwoFactorLogin,
    disableTwoFactor,
    sendEmailVerification,
    verifyEmail,
    getActiveSessions,
    revokeSession,
    revokeAllSessions,
} = require("../controller/auth.controller");
const { isAuthenticated } = require("../middleware/auth.middleware");

const router = express.Router();

// {domain}/api/v1/auth/send-otp
router.post("/send-otp", sendOtp);

// {domain}/api/v1/auth/register
router.post("/register", registerUser);

// {domain}/api/v1/auth/login
router.post("/login", login);

// {domain}/api/v1/auth/verify-2fa-login
router.post("/verify-2fa-login", verifyTwoFactorLogin);

// {domain}/api/v1/auth/forgot-password-token
router.post("/forgot-password-token", forgotPasswordToken);

// {domain}/api/v1/auth/change-password
router.put("/change-password", isAuthenticated, changePassword);

// {domain}/api/v1/auth/forgot-password/:token <- dynamic
router.put("/forgot-password/:token", forgotPassword);

router.post("/validate-forgot-password-token/:token", resetPassValidateToken);

router.post("/logout",  logoutUser);

router.post("/regenerate-token", regenerateToken);

router.get("/user", isAuthenticated, getUserDetails);

// 2FA Routes
router.post("/setup-2fa", isAuthenticated, setupTwoFactor);
router.post("/verify-2fa-setup", isAuthenticated, verifyTwoFactorSetup);
router.post("/disable-2fa", isAuthenticated, disableTwoFactor);

// Email Verification Routes
router.post("/send-email-verification", isAuthenticated, sendEmailVerification);
router.get("/verify-email/:token", verifyEmail);

// Session Management Routes
router.get("/sessions", isAuthenticated, getActiveSessions);
router.delete("/sessions/:sessionId", isAuthenticated, revokeSession);
router.post("/revoke-all-sessions", isAuthenticated, revokeAllSessions);

module.exports = router;
