const User = require("../model/User.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { ValidationError, UnauthorizedError, NotFoundError, ConflictError } = require("../middleware/globalErrorHandler.middleware");
const redisClient = require("../middleware/redisClient.middleware");
require("dotenv").config();

/**
 * Generate access and refresh tokens
 * @param {string} userId - User ID
 * @param {Object} sessionDetails - Session information
 * @returns {Promise<Object>} Token pair
 */
const generateTokens = async (userId, sessionDetails = null) => {
    const user = await User.findById(userId);
    
    if (!user) {
        throw new NotFoundError("User not found");
    }

    const token = user.generateToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;

    // Add session management
    if (sessionDetails) {
        user.sessions.push({
            token: refreshToken,
            device: sessionDetails.device || 'Unknown',
            browser: sessionDetails.browser || 'Unknown',
            ip: sessionDetails.ip || 'Unknown',
            location: sessionDetails.location || 'Unknown',
            lastActive: new Date(),
            createdAt: new Date(),
        });

        // Limit sessions to 10 active sessions
        if (user.sessions.length > 10) {
            user.sessions = user.sessions.slice(-10);
        }
    }

    await user.save({ validateBeforeSave: false });

    return { token, refreshToken };
};

/**
 * Validate user credentials
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User object
 */
const validateCredentials = async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    console.log("Login attempt for email:", normalizedEmail);
    
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
        console.log("User not found with email:", normalizedEmail);
        throw new UnauthorizedError("Invalid credentials");
    }

    if (!user.isActive) {
        throw new UnauthorizedError("Account is deactivated. Please contact support.");
    }

    console.log("User found, checking password. Password exists:", !!user.password);
    console.log("Password type:", typeof user.password);
    console.log("Input password type:", typeof password);
    console.log("Input password length:", password?.length);
    console.log("Input password trimmed:", password?.trim());
    console.log("Database password hash length:", user.password?.length);

    if (!user.password) {
        console.error("User password is undefined in database");
        throw new UnauthorizedError("Invalid credentials");
    }

    if (!password) {
        console.error("Input password is undefined");
        throw new UnauthorizedError("Invalid credentials");
    }

    // Trim input password to handle any whitespace
    const trimmedPassword = password.trim();
    console.log("Comparing passwords - Input length:", trimmedPassword.length, "Hash length:", user.password.length);

    const isPasswordMatch = await bcrypt.compare(trimmedPassword, user.password);
    console.log("Password comparison result:", isPasswordMatch);

    if (!isPasswordMatch) {
        console.log("Password mismatch for email:", normalizedEmail);
        console.log("Please ensure you're using the correct password: Admin@1234");
        throw new UnauthorizedError("Invalid credentials");
    }

    console.log("Login successful for email:", normalizedEmail);
    return user;
};

/**
 * Hash password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (password) => {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password
 * @returns {Promise<boolean>} Match result
 */
const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result
 */
const validatePasswordStrength = (password) => {
    const errors = [];

    if (password.length < 8) {
        errors.push("Password must be at least 8 characters long");
    }

    if (!/[A-Z]/.test(password)) {
        errors.push("Password must contain at least one uppercase letter");
    }

    if (!/[a-z]/.test(password)) {
        errors.push("Password must contain at least one lowercase letter");
    }

    if (!/[0-9]/.test(password)) {
        errors.push("Password must contain at least one number");
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push("Password must contain at least one special character");
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

/**
 * Sanitize user data for response
 * @param {Object} user - User object
 * @returns {Object} Sanitized user object
 */
const sanitizeUser = (user) => {
    const userData = user.toObject ? user.toObject() : { ...user };
    
    const fieldsToRemove = [
        'password',
        'refreshToken',
        '__v',
        'twoFactorSecret',
        'twoFactorBackupCodes',
        'forgotPasswordToken',
        'emailVerificationToken',
    ];

    fieldsToRemove.forEach(field => delete userData[field]);

    return userData;
};

/**
 * Generate password reset token
 * @param {string} email - User email
 * @returns {Promise<Object>} Token and expiry
 */
const generatePasswordResetToken = async (email) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new NotFoundError("User not found");
    }

    const token = crypto.randomUUID();
    user.forgotPasswordToken = {
        value: token,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    };

    await user.save({ validateBeforeSave: false });

    return { token, email: user.email, firstName: user.fullName ? user.fullName.split(' ')[0] : '' };
};

/**
 * Validate password reset token
 * @param {string} token - Reset token
 * @returns {Promise<Object>} User object
 */
const validatePasswordResetToken = async (token) => {
    const user = await User.findOne({ "forgotPasswordToken.value": token });

    if (!user) {
        throw new ValidationError("Invalid reset token");
    }

    if (user.forgotPasswordToken.expiresAt < new Date()) {
        throw new ValidationError("Reset token has expired");
    }

    return user;
};

/**
 * Reset password with token
 * @param {string} token - Reset token
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Updated user
 */
const resetPassword = async (token, newPassword) => {
    const user = await validatePasswordResetToken(token);

    // Check if new password is same as old password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
        throw new ValidationError("New password cannot be the same as old password");
    }

    user.password = newPassword;
    user.forgotPasswordToken = {
        value: null,
        expiresAt: null,
    };

    await user.save();

    return user;
};

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {string} oldPassword - Old password
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Updated user
 */
const changePassword = async (userId, oldPassword, newPassword) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new NotFoundError("User not found");
    }

    const isOldPasswordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordMatch) {
        throw new UnauthorizedError("Old password is incorrect");
    }

    const isNewPasswordSame = await bcrypt.compare(newPassword, user.password);
    if (isNewPasswordSame) {
        throw new ValidationError("New password cannot be the same as old password");
    }

    user.password = newPassword;
    await user.save();

    return user;
};

/**
 * Logout user and invalidate tokens
 * @param {string} userId - User ID
 * @param {string} refreshToken - Refresh token to invalidate
 * @returns {Promise<void>}
 */
const logoutUser = async (userId, refreshToken) => {
    if (refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            await User.findByIdAndUpdate(decoded._id, {
                $unset: { refreshToken: 1 },
            });
        } catch (error) {
            // Token verification failed, continue with logout
            console.log("Token verification failed during logout:", error.message);
        }
    }
};

/**
 * Refresh access token with rotation
 * @param {string} refreshToken - Current refresh token
 * @returns {Promise<Object>} New token pair
 */
const refreshAccessToken = async (refreshToken) => {
    if (!refreshToken) {
        throw new UnauthorizedError("Refresh token is required");
    }

    const decodedToken = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decodedToken?._id);

    if (!user) {
        throw new UnauthorizedError("Invalid refresh token");
    }

    // Check if refresh token matches user's current token (token rotation)
    if (refreshToken !== user?.refreshToken) {
        // Possible token reuse attack - invalidate all sessions
        user.refreshToken = undefined;
        user.sessions = [];
        await user.save({ validateBeforeSave: false });
        throw new UnauthorizedError("Refresh token has been used. Please login again.");
    }

    // Update session activity
    const sessionIndex = user.sessions.findIndex(
        session => session.token === refreshToken
    );
    if (sessionIndex !== -1) {
        user.sessions[sessionIndex].lastActive = new Date();
    }

    // Generate new tokens (rotation)
    const tokens = await generateTokens(user._id);

    return tokens;
};

/**
 * Get active user sessions
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Active sessions
 */
const getActiveSessions = async (userId) => {
    const user = await User.findById(userId).select("sessions");

    if (!user) {
        throw new NotFoundError("User not found");
    }

    // Filter out expired sessions (older than 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeSessions = user.sessions.filter(
        session => session.lastActive > thirtyDaysAgo
    );

    return activeSessions;
};

/**
 * Revoke specific session
 * @param {string} userId - User ID
 * @param {string} sessionId - Session ID to revoke
 * @returns {Promise<void>}
 */
const revokeSession = async (userId, sessionId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new NotFoundError("User not found");
    }

    user.sessions = user.sessions.filter(
        session => session._id.toString() !== sessionId
    );

    await user.save({ validateBeforeSave: false });
};

/**
 * Revoke all sessions except current
 * @param {string} userId - User ID
 * @param {string} currentRefreshToken - Current refresh token to keep
 * @returns {Promise<void>}
 */
const revokeAllSessions = async (userId, currentRefreshToken) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new NotFoundError("User not found");
    }

    // Keep only current session
    user.sessions = user.sessions.filter(
        session => session.token === currentRefreshToken
    );

    await user.save({ validateBeforeSave: false });
};

/**
 * Generate email verification token
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Token and user info
 */
const generateEmailVerificationToken = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new NotFoundError("User not found");
    }

    if (user.isEmailVerified) {
        throw new ConflictError("Email is already verified");
    }

    const token = crypto.randomUUID();
    user.emailVerificationToken = {
        value: token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };

    await user.save({ validateBeforeSave: false });

    return { token, email: user.email, firstName: user.fullName ? user.fullName.split(' ')[0] : '' };
};

/**
 * Verify email with token
 * @param {string} token - Verification token
 * @returns {Promise<Object>} Updated user
 */
const verifyEmail = async (token) => {
    const user = await User.findOne({ "emailVerificationToken.value": token });

    if (!user) {
        throw new ValidationError("Invalid verification token");
    }

    if (user.emailVerificationToken.expiresAt < new Date()) {
        throw new ValidationError("Verification token has expired");
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = {
        value: null,
        expiresAt: null,
    };

    await user.save({ validateBeforeSave: false });

    return user;
};

module.exports = {
    generateTokens,
    validateCredentials,
    hashPassword,
    comparePassword,
    validatePasswordStrength,
    sanitizeUser,
    generatePasswordResetToken,
    validatePasswordResetToken,
    resetPassword,
    changePassword,
    logoutUser,
    refreshAccessToken,
    getActiveSessions,
    revokeSession,
    revokeAllSessions,
    generateEmailVerificationToken,
    verifyEmail,
};
