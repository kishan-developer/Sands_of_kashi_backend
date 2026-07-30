/**
 * Custom Error Classes
 */

class AppError extends Error {
    constructor(message, statusCode, errorCode = null) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message, errors = []) {
        super(message, 400, "VALIDATION_ERROR");
        this.errors = errors;
    }
}

class NotFoundError extends AppError {
    constructor(message = "Resource not found") {
        super(message, 404, "NOT_FOUND");
    }
}

class UnauthorizedError extends AppError {
    constructor(message = "Unauthorized access") {
        super(message, 401, "UNAUTHORIZED");
    }
}

class ForbiddenError extends AppError {
    constructor(message = "Access forbidden") {
        super(message, 403, "FORBIDDEN");
    }
}

class ConflictError extends AppError {
    constructor(message = "Resource conflict") {
        super(message, 409, "CONFLICT");
    }
}

class RateLimitError extends AppError {
    constructor(message = "Too many requests") {
        super(message, 429, "RATE_LIMIT_EXCEEDED");
    }
}

/**
 * Log error with context
 * @param {Error} err - Error object
 * @param {Object} req - Express request
 */
const logError = (err, req) => {
    const errorLog = {
        timestamp: new Date().toISOString(),
        requestId: req.id || req.headers["x-request-id"],
        userId: req.user?._id,
        userRole: req.user?.role,
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get("user-agent"),
        error: {
            name: err.name,
            message: err.message,
            code: err.code,
            statusCode: err.statusCode,
            errorCode: err.errorCode,
            stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
        },
    };

    console.error("Error Log:", JSON.stringify(errorLog, null, 2));

    // In production, send to error monitoring service (Sentry, DataDog, etc.)
    // Example: Sentry.captureException(err, { extra: errorLog });
};

/**
 * Handle Mongoose Validation Error
 */
const handleValidationError = (err) => {
    const errors = Object.values(err.errors).map((val) => ({
        field: val.path,
        message: val.message,
    }));

    const message = errors.length > 0 ? errors[0].message : "Validation failed";
    return new ValidationError(message, errors);
};

/**
 * Handle Mongoose Duplicate Key Error
 */
const handleDuplicateKeyError = (err) => {
    const field = Object.keys(err.keyPattern)[0];
    const value = err.keyValue[field];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`;
    return new ConflictError(message);
};

/**
 * Handle Mongoose Cast Error (invalid ObjectId)
 */
const handleCastError = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new ValidationError(message);
};

/**
 * Handle JWT Errors
 */
const handleJWTError = () => {
    return new UnauthorizedError("Invalid token. Please login again.");
};

const handleJWTExpiredError = () => {
    return new UnauthorizedError("Token expired. Please login again.");
};

/**
 * Handle Rate Limit Error
 */
const handleRateLimitError = (err) => {
    return new RateLimitError(err.message || "Too many requests. Please try again later.");
};

/**
 * Send error response
 * @param {Error} err - Error object
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const sendErrorResponse = (err, req, res) => {
    const isDevelopment = process.env.NODE_ENV === "development";

    const response = {
        success: false,
        message: err.message || "Internal server error",
        errorCode: err.errorCode || "INTERNAL_ERROR",
        requestId: req.id || req.headers["x-request-id"],
    };

    // Include errors for validation errors
    if (err.errors) {
        response.errors = err.errors;
    }

    // Include stack trace only in development
    if (isDevelopment) {
        response.stack = err.stack;
        response.details = {
            name: err.name,
            code: err.code,
            statusCode: err.statusCode,
        };
    }

    res.status(err.statusCode || 500).json(response);
};

/**
 * Global Error Handler Middleware
 */
exports.globalErrorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    error.statusCode = err.statusCode;

    // Log error with context
    logError(err, req);

    // Handle specific error types
    if (err.name === "ValidationError") {
        error = handleValidationError(err);
    } else if (err.code === 11000) {
        error = handleDuplicateKeyError(err);
    } else if (err.name === "CastError") {
        error = handleValidationError(err);
    } else if (err.name === "JsonWebTokenError") {
        error = handleJWTError();
    } else if (err.name === "TokenExpiredError") {
        error = handleJWTExpiredError();
    } else if (err.type === "entity.parse.failed") {
        error = new ValidationError("Invalid JSON payload");
    } else if (err.status === 429 || err.statusCode === 429) {
        error = handleRateLimitError(err);
    }

    // Handle operational errors (custom AppError instances)
    if (err.isOperational) {
        return sendErrorResponse(err, req, res);
    }

    // Handle unknown errors
    const isDevelopment = process.env.NODE_ENV === "development";
    const message = isDevelopment ? err.message : "Internal server error";
    const statusCode = err.statusCode || 500;

    sendErrorResponse(
        {
            message,
            statusCode,
            errorCode: "INTERNAL_ERROR",
        },
        req,
        res
    );
};

/**
 * 404 Not Found Handler
 */
exports.notFoundHandler = (req, res, next) => {
    const error = new NotFoundError(`Route ${req.originalUrl} not found`);
    next(error);
};

/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors
 */
exports.asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Export custom error classes
exports.AppError = AppError;
exports.ValidationError = ValidationError;
exports.NotFoundError = NotFoundError;
exports.UnauthorizedError = UnauthorizedError;
exports.ForbiddenError = ForbiddenError;
exports.ConflictError = ConflictError;
exports.RateLimitError = RateLimitError;
