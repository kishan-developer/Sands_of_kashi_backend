const asyncHandler = require("express-async-handler");
const User = require("../model/User.model");
const { globalErrorHandler, ValidationError, ConflictError } = require("../middleware/globalErrorHandler.middleware");
const auth_service = require("../services/auth.service");
const otp_service = require("../services/otp.service");
const twoFactor_service = require("../services/twoFactor.service");
const email_service = require("../services/email.service");
const getSessionDetails = require("../utils/getSessionDetails");
require("dotenv").config();

/**
 * Send OTP to email for registration
 */
exports.sendOtp = asyncHandler(async (req, res) => {
    const { email, purpose } = req.body;
    const result = await otp_service.sendOtp(email, purpose || 'registration');
    return res.success("OTP sent successfully", result);
});

/**
 * Register new user
 */
exports.registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, phone, password, otp } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone || !password || !otp) {
        throw new ValidationError("All fields are required");
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new ValidationError("Invalid email format");
    }

    // Validate phone number (should be international format with country code)
    if (!phone || phone.length < 10) {
        throw new ValidationError("Invalid phone number");
    }

    // Validate password strength
    const passwordValidation = auth_service.validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
        throw new ValidationError(passwordValidation.errors.join(", "));
    }

    // Verify OTP
    await otp_service.verifyOtp(email, otp);

    // Check if user already exists
    const isUserAlreadyExist = await User.findOne({ email: email.trim().toLowerCase() });
    if (isUserAlreadyExist) {
        throw new ConflictError("User already exists");
    }

    // Split fullName for email purposes (backward compatibility)
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Create user (password will be hashed by model pre-save hook)
    const userPayload = {
        fullName: fullName.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        phone, // Store phone with country code as sent from frontend
        password, // Plain password - will be hashed by model pre-save hook
    };

    const newUser = await User.create(userPayload);

    // Send registration email
    await email_service.sendRegistrationEmail(email, firstName, lastName);

    return res.success("User created successfully", auth_service.sanitizeUser(newUser));
});


/**
 * User Login Handler
 */
exports.login = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const email = req.body?.email?.trim().toLowerCase();

    // Validate required fields
    if (!email || !password) {
        throw new ValidationError("Email and password are required");
    }

    // Validate credentials
    const user = await auth_service.validateCredentials(email, password);

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
        // Return user info for 2FA verification
        return res.success("2FA verification required", {
            requiresTwoFactor: true,
            email: user.email,
        });
    }

    // Generate tokens with session details
    let session;
    try {
        session = getSessionDetails(req);
    } catch (error) {
        console.error('Error getting session details:', error);
        session = {
            ip: 'Unknown',
            location: 'Unknown',
            device: 'Unknown',
            browser: 'Unknown',
            os: 'Unknown'
        };
    }
    
    const { token, refreshToken } = await auth_service.generateTokens(user._id, session);

    // Send login alert email
    try {
        await email_service.sendLoginAlertEmail(
            user.email,
            user.fullName || `${user.firstName || ''} ${user.lastName || ''}`,
            session
        );
    } catch (error) {
        console.error('Error sending login alert email:', error);
        // Continue with login even if email fails
    }

    // Set cookies
    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "None" : "Lax",
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    res.cookie("refreshToken", refreshToken, cookieOptions);
    res.cookie("token", token, cookieOptions);

    return res.success(`Welcome ${user.firstName}`, {
        user: auth_service.sanitizeUser(user),
        token,
        refreshToken,
    });
});


/**
 * Change user password
 */
exports.changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, password, confirmPassword } = req.body;

    // Validate required fields
    if (!password || !confirmPassword || !oldPassword) {
        throw new ValidationError("All fields are required");
    }

    // Validate password match
    if (password !== confirmPassword) {
        throw new ValidationError("New password and confirm password do not match");
    }

    // Validate password strength
    const passwordValidation = auth_service.validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
        throw new ValidationError(passwordValidation.errors.join(", "));
    }

    // Change password using service
    const user = await auth_service.changePassword(req.user._id, oldPassword, password);

    // Send password change email
    await email_service.sendPasswordChangeEmail(user.email, user.firstName);

    return res.success("Password changed successfully", auth_service.sanitizeUser(user));
});


/**
 * Generate password reset token
 */
exports.forgotPasswordToken = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ValidationError("Email is required");
    }

    // Generate reset token using service
    const { token, email: userEmail, firstName } = await auth_service.generatePasswordResetToken(email);

    // Send password reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    await email_service.sendPasswordResetEmail(userEmail, resetUrl);

    return res.success("Reset link sent! Check your email.");
});


/**
 * Reset password with token
 */
exports.forgotPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!token) {
        throw new ValidationError("Reset token is missing");
    }

    if (!password || !confirmPassword) {
        throw new ValidationError("All fields are required");
    }

    if (password !== confirmPassword) {
        throw new ValidationError("Password and confirm password do not match");
    }

    // Validate password strength
    const passwordValidation = auth_service.validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
        throw new ValidationError(passwordValidation.errors.join(", "));
    }

    // Reset password using service
    const user = await auth_service.resetPassword(token, password);

    // Send password change email
    await email_service.sendPasswordChangeEmail(user.email, user.firstName);

    return res.success("Password changed successfully");
});

/**
 * Logout user
 */
exports.logoutUser = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    const userId = req.user?._id;

    // Logout using service
    await auth_service.logoutUser(userId, refreshToken);

    // Clear cookies
    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "None" : "Lax",
    };

    res.clearCookie("token", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    return res.success("User logged out successfully");
});


/**
 * Refresh access token with rotation
 */
exports.regenerateToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req?.cookies?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ValidationError("Refresh token is required");
    }

    // Refresh token using service
    const { token, refreshToken } = await auth_service.refreshAccessToken(incomingRefreshToken);

    // Set cookies
    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "None" : "Lax",
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    res.cookie("token", token, cookieOptions);
    res.cookie("refreshToken", refreshToken, cookieOptions);

    return res.success("Access token refreshed", { token, refreshToken });
});

/**
 * Get active user sessions
 */
exports.getActiveSessions = asyncHandler(async (req, res) => {
    const activeSessions = await auth_service.getActiveSessions(req.user._id);
    return res.success("Active sessions retrieved", activeSessions);
});

/**
 * Revoke specific session
 */
exports.revokeSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    await auth_service.revokeSession(req.user._id, sessionId);
    return res.success("Session revoked successfully");
});

/**
 * Revoke all sessions except current
 */
exports.revokeAllSessions = asyncHandler(async (req, res) => {
    const currentRefreshToken = req?.cookies?.refreshToken;
    await auth_service.revokeAllSessions(req.user._id, currentRefreshToken);
    return res.success("All other sessions revoked successfully");
});


/**
 * Get user details
 */
exports.getUserDetails = asyncHandler(async (req, res) => {
    const userId = req?.user?._id || req.body.userId;
    
    if (!userId) {
        throw new ValidationError("User ID is required");
    }

    const userDetails = await User.findById(userId).select("-password -refreshToken");

    if (!userDetails) {
        throw new NotFoundError("User not found");
    }

    return res.success("User fetched successfully", auth_service.sanitizeUser(userDetails));
});


/**
 * Validate password reset token
 */
exports.resetPassValidateToken = asyncHandler(async (req, res) => {
    const { token } = req.params;

    if (!token) {
        throw new ValidationError("Reset token is missing");
    }

    await auth_service.validatePasswordResetToken(token);
    return res.success("Reset token is valid");
});

/**
 * Setup 2FA - Generate secret and QR code
 */
exports.setupTwoFactor = asyncHandler(async (req, res) => {
    const result = await twoFactor_service.setupTwoFactor(req.user._id);
    return res.success("2FA setup initiated", result);
});

/**
 * Verify 2FA setup and enable it
 */
exports.verifyTwoFactorSetup = asyncHandler(async (req, res) => {
    const { token } = req.body;
    const result = await twoFactor_service.verifyTwoFactorSetup(req.user._id, token);
    return res.success("2FA enabled successfully", result);
});

/**
 * Verify 2FA during login
 */
exports.verifyTwoFactorLogin = asyncHandler(async (req, res) => {
    const { token, backupCode, email } = req.body;

    if (!token && !backupCode) {
        throw new ValidationError("Verification token or backup code is required");
    }

    // Verify 2FA using service
    const { user, method } = await twoFactor_service.verifyTwoFactorLogin(email, token, backupCode);

    // Generate tokens
    let session;
    try {
        session = getSessionDetails(req);
    } catch (error) {
        console.error('Error getting session details:', error);
        session = {
            ip: 'Unknown',
            location: 'Unknown',
            device: 'Unknown',
            browser: 'Unknown',
            os: 'Unknown'
        };
    }
    const { accessToken, refreshToken } = await auth_service.generateTokens(user._id, session);

    // Set cookies
    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "None" : "Lax",
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    res.cookie("token", accessToken, cookieOptions);
    res.cookie("refreshToken", refreshToken, cookieOptions);

    return res.success(`Login successful with ${method}`, {
        user: auth_service.sanitizeUser(user),
        token: accessToken,
        refreshToken,
    });
});

/**
 * Disable 2FA
 */
exports.disableTwoFactor = asyncHandler(async (req, res) => {
    const { password } = req.body;
    await twoFactor_service.disableTwoFactor(req.user._id, password);
    return res.success("2FA disabled successfully");
});

/**
 * Send email verification
 */
exports.sendEmailVerification = asyncHandler(async (req, res) => {
    const { token, email } = await auth_service.generateEmailVerificationToken(req.user._id);
    
    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
    await email_service.sendEmailVerificationEmail(email, verificationUrl);

    return res.success("Verification email sent");
});

/**
 * Verify email with token
 */
exports.verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.params;

    if (!token) {
        throw new ValidationError("Verification token is missing");
    }

    await auth_service.verifyEmail(token);
    return res.success("Email verified successfully");
});
