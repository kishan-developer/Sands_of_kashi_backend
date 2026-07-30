const User = require("../model/User.model");

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

const accountLockout = async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next();
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return next();
        }

        // Check if account is locked
        if (user.lockUntil && user.lockUntil > Date.now()) {
            const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
            return res.error(
                `Account is locked. Try again in ${remainingTime} minutes.`,
                423
            );
        }

        // Reset lock if time has passed
        if (user.lockUntil && user.lockUntil < Date.now()) {
            user.loginAttempts = 0;
            user.lockUntil = undefined;
            await user.save({ validateBeforeSave: false });
        }

        // Store user in request for later use
        req.userForLockout = user;
        next();
    } catch (error) {
        console.error("Account lockout middleware error:", error);
        next();
    }
};

const incrementLoginAttempts = async (req, res, next) => {
    const { email } = req.body;
    const user = req.userForLockout;

    if (!user) {
        return next();
    }

    try {
        user.loginAttempts += 1;

        // Lock account if max attempts reached
        if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
            user.lockUntil = Date.now() + LOCK_TIME;
            await user.save({ validateBeforeSave: false });
            
            return res.error(
                `Too many failed login attempts. Account locked for ${LOCK_TIME / 60000} minutes.`,
                423
            );
        }

        await user.save({ validateBeforeSave: false });
        next();
    } catch (error) {
        console.error("Increment login attempts error:", error);
        next();
    }
};

const resetLoginAttempts = async (req, res, next) => {
    const user = req.user;

    if (!user) {
        return next();
    }

    try {
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        await user.save({ validateBeforeSave: false });
        next();
    } catch (error) {
        console.error("Reset login attempts error:", error);
        next();
    }
};

module.exports = {
    accountLockout,
    incrementLoginAttempts,
    resetLoginAttempts,
};
