const User = require("../model/User.model");
const redisClient = require("./redisClient.middleware");

/**
 * Cache key generator for user permissions
 * @param {string} userId - User ID
 * @returns {string} Cache key
 */
const getPermissionCacheKey = (userId) => `permissions:${userId}`;

/**
 * Cache key generator for user roles
 * @param {string} userId - User ID
 * @returns {string} Cache key
 */
const getRoleCacheKey = (userId) => `role:${userId}`;

/**
 * Get user permissions from cache or database
 * @param {string} userId - User ID
 * @param {Object} user - User object (optional, to avoid DB query)
 * @returns {Promise<Object>} User with permissions
 */
const getUserWithPermissions = async (userId, user = null) => {
    try {
        // Try to get from cache first
        const cached = await redisClient.get(getPermissionCacheKey(userId));
        if (cached) {
            return JSON.parse(cached);
        }

        // If not cached and no user provided, fetch from DB
        if (!user) {
            user = await User.findById(userId).select("-password");
        }

        if (!user) {
            return null;
        }

        // Cache for 5 minutes (300 seconds)
        await redisClient.setEx(
            getPermissionCacheKey(userId),
            300,
            JSON.stringify(user)
        );

        return user;
    } catch (error) {
        console.error("Error getting user permissions:", error);
        // Fallback to DB query if cache fails
        if (!user) {
            return await User.findById(userId).select("-password");
        }
        return user;
    }
};

/**
 * Clear user permission cache
 * @param {string} userId - User ID
 */
const clearPermissionCache = async (userId) => {
    try {
        await redisClient.del(getPermissionCacheKey(userId));
        await redisClient.del(getRoleCacheKey(userId));
    } catch (error) {
        console.error("Error clearing permission cache:", error);
    }
};

/**
 * Log authorization attempt for audit purposes
 * @param {Object} req - Express request
 * @param {string} action - Action being attempted
 * @param {boolean} success - Whether authorization succeeded
 * @param {string} reason - Reason for failure (if any)
 */
const logAuthorization = async (req, action, success, reason = null) => {
    try {
        const logEntry = {
            timestamp: new Date().toISOString(),
            userId: req.user?._id,
            role: req.user?.role,
            action,
            success,
            reason,
            ip: req.ip,
            userAgent: req.get("user-agent"),
            path: req.path,
            method: req.method,
        };

        // In production, send to logging service or database
        console.log("Authorization Log:", JSON.stringify(logEntry));
    } catch (error) {
        console.error("Error logging authorization:", error);
    }
};

/**
 * Role-based access control
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {Function} Express middleware
 */
const roleAuth = (allowedRoles = []) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                await logAuthorization(req, "roleAuth", false, "Not authenticated");
                return res.error("Authentication required", 401);
            }

            // Get user with permissions (cached)
            const user = await getUserWithPermissions(req.user._id, req.user);

            if (!user) {
                await logAuthorization(req, "roleAuth", false, "User not found");
                return res.error("User not found", 404);
            }

            // Check if user's role is in the allowed roles
            if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
                await logAuthorization(
                    req,
                    "roleAuth",
                    false,
                    `Role ${user.role} not in allowed roles: ${allowedRoles.join(", ")}`
                );
                return res.error(
                    `Access denied. Required roles: ${allowedRoles.join(", ")}`,
                    403
                );
            }

            // Attach user with permissions to request
            req.userWithPermissions = user;
            await logAuthorization(req, "roleAuth", true);
            next();
        } catch (error) {
            console.error("Role auth middleware error:", error);
            await logAuthorization(req, "roleAuth", false, error.message);
            return res.error("Authorization failed", 500);
        }
    };
};

/**
 * Permission-based access control
 * @param {string[]} requiredPermissions - Array of required permissions
 * @param {string} mode - Permission mode: 'all' (default) or 'any'
 * @returns {Function} Express middleware
 */
const permissionAuth = (requiredPermissions = [], mode = "all") => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                await logAuthorization(req, "permissionAuth", false, "Not authenticated");
                return res.error("Authentication required", 401);
            }

            // Get user with permissions (cached)
            const user = await getUserWithPermissions(req.user._id, req.user);

            if (!user) {
                await logAuthorization(req, "permissionAuth", false, "User not found");
                return res.error("User not found", 404);
            }

            // Check if user has required permissions
            if (requiredPermissions.length > 0) {
                const userPermissions = user.permissions || [];

                let hasPermission;
                if (mode === "any") {
                    hasPermission = requiredPermissions.some((permission) =>
                        userPermissions.includes(permission)
                    );
                } else {
                    // Default: all permissions required
                    hasPermission = requiredPermissions.every((permission) =>
                        userPermissions.includes(permission)
                    );
                }

                if (!hasPermission) {
                    await logAuthorization(
                        req,
                        "permissionAuth",
                        false,
                        `Missing permissions: ${requiredPermissions.join(", ")}`
                    );
                    return res.error(
                        `Access denied. Required permissions: ${requiredPermissions.join(", ")}`,
                        403
                    );
                }
            }

            req.userWithPermissions = user;
            await logAuthorization(req, "permissionAuth", true);
            next();
        } catch (error) {
            console.error("Permission auth middleware error:", error);
            await logAuthorization(req, "permissionAuth", false, error.message);
            return res.error("Authorization failed", 500);
        }
    };
};

/**
 * Hotel-based access control (for managers and support staff)
 * @param {Object} options - Configuration options
 * @param {boolean} options.allowSuperAdmin - Allow super admins to bypass (default: true)
 * @param {boolean} options.allowAdmin - Allow admins to bypass (default: true)
 * @returns {Function} Express middleware
 */
const hotelAuth = ({ allowSuperAdmin = true, allowAdmin = true } = {}) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                await logAuthorization(req, "hotelAuth", false, "Not authenticated");
                return res.error("Authentication required", 401);
            }

            // Get user with permissions (cached)
            const user = await getUserWithPermissions(req.user._id, req.user);

            if (!user) {
                await logAuthorization(req, "hotelAuth", false, "User not found");
                return res.error("User not found", 404);
            }

            // Super admins can access all hotels
            if (allowSuperAdmin && user.role === "super_admin") {
                req.userWithPermissions = user;
                await logAuthorization(req, "hotelAuth", true, "Super admin bypass");
                return next();
            }

            // Admins can access all hotels if allowed
            if (allowAdmin && user.role === "admin") {
                req.userWithPermissions = user;
                await logAuthorization(req, "hotelAuth", true, "Admin bypass");
                return next();
            }

            // Managers and support staff must have a hotel assignment
            if (!user.hotelId) {
                await logAuthorization(req, "hotelAuth", false, "No hotel assigned");
                return res.error(
                    "You must be assigned to a hotel to access this resource",
                    403
                );
            }

            // Check if the requested hotel matches the user's hotel
            const requestedHotelId = req.params.hotelId || req.body.hotelId || req.query.hotelId;
            if (requestedHotelId && requestedHotelId !== user.hotelId.toString()) {
                await logAuthorization(
                    req,
                    "hotelAuth",
                    false,
                    `Hotel mismatch: ${requestedHotelId} vs ${user.hotelId}`
                );
                return res.error(
                    "You can only access resources for your assigned hotel",
                    403
                );
            }

            req.userWithPermissions = user;
            await logAuthorization(req, "hotelAuth", true);
            next();
        } catch (error) {
            console.error("Hotel auth middleware error:", error);
            await logAuthorization(req, "hotelAuth", false, error.message);
            return res.error("Authorization failed", 500);
        }
    };
};

/**
 * Combined role and permission check
 * @param {Object} options - Configuration options
 * @param {string[]} options.roles - Allowed roles
 * @param {string[]} options.permissions - Required permissions
 * @param {string} options.permissionMode - Permission mode: 'all' or 'any'
 * @returns {Function} Express middleware
 */
const authorize = ({ roles = [], permissions = [], permissionMode = "all" } = {}) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                await logAuthorization(req, "authorize", false, "Not authenticated");
                return res.error("Authentication required", 401);
            }

            // Get user with permissions (cached)
            const user = await getUserWithPermissions(req.user._id, req.user);

            if (!user) {
                await logAuthorization(req, "authorize", false, "User not found");
                return res.error("User not found", 404);
            }

            // Check role
            if (roles.length > 0 && !roles.includes(user.role)) {
                await logAuthorization(
                    req,
                    "authorize",
                    false,
                    `Role ${user.role} not in allowed roles: ${roles.join(", ")}`
                );
                return res.error(
                    `Access denied. Required roles: ${roles.join(", ")}`,
                    403
                );
            }

            // Check permissions
            if (permissions.length > 0) {
                const userPermissions = user.permissions || [];

                let hasPermission;
                if (permissionMode === "any") {
                    hasPermission = permissions.some((permission) =>
                        userPermissions.includes(permission)
                    );
                } else {
                    hasPermission = permissions.every((permission) =>
                        userPermissions.includes(permission)
                    );
                }

                if (!hasPermission) {
                    await logAuthorization(
                        req,
                        "authorize",
                        false,
                        `Missing permissions: ${permissions.join(", ")}`
                    );
                    return res.error(
                        `Access denied. Required permissions: ${permissions.join(", ")}`,
                        403
                    );
                }
            }

            req.userWithPermissions = user;
            await logAuthorization(req, "authorize", true);
            next();
        } catch (error) {
            console.error("Authorize middleware error:", error);
            await logAuthorization(req, "authorize", false, error.message);
            return res.error("Authorization failed", 500);
        }
    };
};

/**
 * Resource ownership check
 * @param {Function} getResourceOwnerId - Function to get resource owner ID from request
 * @returns {Function} Express middleware
 */
const resourceOwnerAuth = (getResourceOwnerId) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                await logAuthorization(req, "resourceOwnerAuth", false, "Not authenticated");
                return res.error("Authentication required", 401);
            }

            const resourceOwnerId = await getResourceOwnerId(req);

            if (!resourceOwnerId) {
                await logAuthorization(req, "resourceOwnerAuth", false, "Resource not found");
                return res.error("Resource not found", 404);
            }

            // Admins and super admins can access any resource
            if (req.user.role === "admin" || req.user.role === "super_admin") {
                await logAuthorization(req, "resourceOwnerAuth", true, "Admin bypass");
                return next();
            }

            // Check if user owns the resource
            if (resourceOwnerId.toString() !== req.user._id.toString()) {
                await logAuthorization(
                    req,
                    "resourceOwnerAuth",
                    false,
                    "Not resource owner"
                );
                return res.error(
                    "Access denied. You can only access your own resources",
                    403
                );
            }

            await logAuthorization(req, "resourceOwnerAuth", true);
            next();
        } catch (error) {
            console.error("Resource owner auth middleware error:", error);
            await logAuthorization(req, "resourceOwnerAuth", false, error.message);
            return res.error("Authorization failed", 500);
        }
    };
};

module.exports = {
    roleAuth,
    permissionAuth,
    hotelAuth,
    authorize,
    resourceOwnerAuth,
    clearPermissionCache,
    getUserWithPermissions,
};
