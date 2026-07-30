const User = require("../model/User.model");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const { ValidationError, NotFoundError, UnauthorizedError } = require("../middleware/globalErrorHandler.middleware");

/**
 * Setup 2FA for user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Secret and QR code
 */
const setupTwoFactor = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new NotFoundError("User not found");
    }

    if (user.twoFactorEnabled) {
        throw new ValidationError("2FA is already enabled");
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
        name: `Hotel Dashboard (${user.email})`,
        issuer: "Hotel Dashboard",
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Store secret temporarily (not enabled yet)
    user.twoFactorSecret = secret.base32;
    await user.save({ validateBeforeSave: false });

    return {
        secret: secret.base32,
        qrCode: qrCodeUrl,
    };
};

/**
 * Verify 2FA setup and enable it
 * @param {string} userId - User ID
 * @param {string} token - TOTP token
 * @returns {Promise<Object>} Backup codes
 */
const verifyTwoFactorSetup = async (userId, token) => {
    if (!token) {
        throw new ValidationError("Verification token is required");
    }

    const user = await User.findById(userId);

    if (!user) {
        throw new NotFoundError("User not found");
    }

    if (!user.twoFactorSecret) {
        throw new ValidationError("2FA setup not initiated");
    }

    // Verify token
    const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: token,
    });

    if (!verified) {
        throw new ValidationError("Invalid verification token");
    }

    // Generate backup codes
    const backupCodes = [];
    for (let i = 0; i < 10; i++) {
        backupCodes.push(speakeasy.generateSecret({ length: 20 }).base32);
    }

    // Enable 2FA
    user.twoFactorEnabled = true;
    user.twoFactorBackupCodes = backupCodes;
    await user.save({ validateBeforeSave: false });

    return {
        backupCodes,
        message: "Save these backup codes securely. They won't be shown again.",
    };
};

/**
 * Verify 2FA during login
 * @param {string} email - User email
 * @param {string} token - TOTP token (optional)
 * @param {string} backupCode - Backup code (optional)
 * @returns {Promise<Object>} Verification result
 */
const verifyTwoFactorLogin = async (email, token = null, backupCode = null) => {
    if (!token && !backupCode) {
        throw new ValidationError("Verification token or backup code is required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new NotFoundError("User not found");
    }

    if (!user.twoFactorEnabled) {
        throw new ValidationError("2FA is not enabled for this account");
    }

    // Check backup code first
    if (backupCode) {
        const backupCodeIndex = user.twoFactorBackupCodes.indexOf(backupCode);
        if (backupCodeIndex === -1) {
            throw new ValidationError("Invalid backup code");
        }

        // Remove used backup code
        user.twoFactorBackupCodes.splice(backupCodeIndex, 1);
        await user.save({ validateBeforeSave: false });

        return { user, method: 'backup_code' };
    }

    // Verify TOTP token
    const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: token,
    });

    if (!verified) {
        throw new ValidationError("Invalid verification token");
    }

    return { user, method: 'totp' };
};

/**
 * Disable 2FA for user
 * @param {string} userId - User ID
 * @param {string} password - User password for verification
 * @returns {Promise<void>}
 */
const disableTwoFactor = async (userId, password) => {
    if (!password) {
        throw new ValidationError("Password is required to disable 2FA");
    }

    const user = await User.findById(userId);

    if (!user) {
        throw new NotFoundError("User not found");
    }

    const bcrypt = require("bcryptjs");
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
        throw new UnauthorizedError("Invalid password");
    }

    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.twoFactorBackupCodes = [];
    await user.save({ validateBeforeSave: false });
};

module.exports = {
    setupTwoFactor,
    verifyTwoFactorSetup,
    verifyTwoFactorLogin,
    disableTwoFactor,
};
