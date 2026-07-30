const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../model/User.model");
const redisClient = require("./redisClient.middleware");
require("dotenv").config();

// Token blacklist cache (in production, use Redis)
const tokenBlacklist = new Set();

/**
 * Extract token from multiple sources
 * @param {Object} req - Express request object
 * @returns {string|null} Token or null
 */
const extractToken = (req) => {
    return (
        req.cookies?.token ||
        req.body?.token ||
        req.header("Authorization")?.replace("Bearer ", "") ||
        req.header("authorization")?.replace("Bearer ", "")
    );
};

/**
 * Check if token is blacklisted
 * @param {string} token - JWT token
 * @returns {Promise<boolean>} True if blacklisted
 */
const isTokenBlacklisted = async (token) => {
    try {
        const isBlacklisted = await redisClient.get(`blacklist:${token}`);
        return !!isBlacklisted;
    } catch (error) {
        // Fallback to memory cache if Redis fails
        return tokenBlacklist.has(token);
    }
};

/**
 * Blacklist a token (for logout)
 * @param {string} token - JWT token
 * @param {number} expiresIn - Time until token expires (seconds)
 */
const blacklistToken = async (token, expiresIn) => {
    try {
        await redisClient.setEx(`blacklist:${token}`, expiresIn, "1");
    } catch (error) {
        // Fallback to memory cache
        tokenBlacklist.add(token);
        setTimeout(() => tokenBlacklist.delete(token), expiresIn * 1000);
    }
};

/**
 * Middleware to check if user is authenticated
 * Validates access token, checks blacklist, and attaches user to request
 */
exports.isAuthenticated = asyncHandler(async (req, res, next) => {
    const token = extractToken(req);

    if (!token) {
        return res.error("Authentication required. Please login.", 401);
    }

    try {
        // Check if token is blacklisted
        const blacklisted = await isTokenBlacklisted(token);
        if (blacklisted) {
            return res.error("Session expired. Please login again.", 401);
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check token expiration
        if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
            return res.error("Token expired. Please login again.", 401);
        }

        // Fetch user with single query
        const user = await User.findById(decoded?._id).select(
            "-password -refreshToken"
        );

        if (!user) {
            return res.error("User not found. Please login again.", 401);
        }

        // Check if user account is active
        if (!user.isActive) {
            return res.error("Account is deactivated. Please contact support.", 403);
        }

        // Check if email is verified
        if (!user.isEmailVerified && process.env.REQUIRE_EMAIL_VERIFICATION === "true") {
            return res.error("Please verify your email address.", 403);
        }

        // Attach user and token to request
        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error.message);

        // Clear invalid tokens
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            res.clearCookie("token");
            res.clearCookie("refreshToken");
        }

        const message = error.name === "TokenExpiredError" 
            ? "Session expired. Please login again." 
            : "Invalid authentication. Please login again.";
        
        return res.error(message, 401);
    }
});

/**
 * Middleware to check if user has specific role
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {Function} Express middleware
 */
exports.hasRole = (allowedRoles = []) => {
    return asyncHandler(async (req, res, next) => {
        if (!req.user) {
            return res.error("Authentication required", 401);
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.error(
                `Access denied. Required roles: ${allowedRoles.join(", ")}`,
                403
            );
        }

        next();
    });
};

/**
 * Middleware to check if user has specific permissions
 * @param {string[]} requiredPermissions - Array of required permissions
 * @returns {Function} Express middleware
 */
exports.hasPermission = (requiredPermissions = []) => {
    return asyncHandler(async (req, res, next) => {
        if (!req.user) {
            return res.error("Authentication required", 401);
        }

        const userPermissions = req.user.permissions || [];
        const hasAllPermissions = requiredPermissions.every(permission =>
            userPermissions.includes(permission)
        );

        if (!hasAllPermissions) {
            return res.error(
                `Access denied. Required permissions: ${requiredPermissions.join(", ")}`,
                403
            );
        }

        next();
    });
};

/**
 * Legacy middleware for admin check (deprecated - use hasRole instead)
 * @deprecated Use hasRole(['admin', 'super_admin']) instead
 */
exports.isAdmin = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        return res.error("Unauthorized access. User not authenticated.", 401);
    }

    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
        return res.error("Access denied. Admins only.", 403);
    }

    next();
});

/**
 * Legacy middleware for user check (deprecated - use hasRole instead)
 * @deprecated Use hasRole(['user']) instead
 */
exports.isUser = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        return res.error("Unauthorized access. User not authenticated.", 401);
    }

    if (req.user.role !== "user") {
        return res.error("Access denied. Users only.", 403);
    }

    next();
});

/**
 * Middleware to validate refresh token
 */
exports.validateRefreshToken = asyncHandler(async (req, res, next) => {
    const refreshToken = 
        req.cookies?.refreshToken ||
        req.body?.refreshToken;

    if (!refreshToken) {
        return res.error("Refresh token required", 401);
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded?._id).select("-password");

        if (!user || user.refreshToken !== refreshToken) {
            return res.error("Invalid refresh token", 401);
        }

        req.user = user;
        req.refreshToken = refreshToken;
        next();
    } catch (error) {
        console.error('Refresh Token Error:', error.message);
        return res.error("Invalid refresh token. Please login again.", 401);
    }
});

/**
 * Middleware to optional authentication (doesn't fail if no token)
 */
exports.optionalAuth = asyncHandler(async (req, res, next) => {
    const token = extractToken(req);

    if (!token) {
        return next();
    }

    try {
        const blacklisted = await isTokenBlacklisted(token);
        if (blacklisted) {
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded?._id).select(
            "-password -refreshToken"
        );

        if (user && user.isActive) {
            req.user = user;
            req.token = token;
        }
    } catch (error) {
        // Ignore errors for optional auth
    }

    next();
});

// Export token management functions
exports.blacklistToken = blacklistToken;
exports.isTokenBlacklisted = isTokenBlacklisted;
