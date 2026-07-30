const mailSender = require("../utils/mailSender.utils");
const registrationSuccessTemplate = require("../email/template/registrationSuccessTemplate");
const loginAlertTemplate = require("../email/template/loginAlertTemplate");
const forgotPasswordTemplate = require("../email/template/fogotPasswordTemplate");
const passwordChangeSuccessTemplate = require("../email/template/passwordChangeSuccessTemplate");
const getCurrentDateTime = require("../utils/getCurrentDateTime");

/**
 * Send registration success email
 * @param {string} email - User email
 * @param {string} firstName - User first name
 * @param {string} lastName - User last name
 * @returns {Promise<void>}
 */
const sendRegistrationEmail = async (email, firstName, lastName) => {
    try {
        const fullName = firstName && lastName ? `${firstName} ${lastName}` : firstName || '';
        const emailBody = registrationSuccessTemplate(fullName);
        await mailSender(email, "Welcome to Sands of Kashi", emailBody);
        console.log("✅ Registration email sent to:", email);
    } catch (error) {
        console.log("⚠️ Failed to send registration email:", error.message);
        // Don't throw error - registration should succeed even if email fails
    }
};

/**
 * Send login alert email
 * @param {string} email - User email
 * @param {string} fullName - User full name
 * @param {Object} sessionDetails - Session information
 * @returns {Promise<void>}
 */
const sendLoginAlertEmail = async (email, fullName, sessionDetails) => {
    try {
        const emailBody = loginAlertTemplate(
            fullName,
            sessionDetails.device,
            sessionDetails.location,
            sessionDetails.ip,
            getCurrentDateTime()
        );
        await mailSender(
            email,
            "Alert: A New Login Was Detected on Your Account",
            emailBody
        );
        console.log("✅ Login alert email sent to:", email);
    } catch (error) {
        console.log("⚠️ Failed to send login alert email:", error.message);
        // Don't throw error - login should succeed even if email fails
    }
};

/**
 * Send password reset email
 * @param {string} email - User email
 * @param {string} resetUrl - Password reset URL
 * @returns {Promise<void>}
 */
const sendPasswordResetEmail = async (email, resetUrl) => {
    try {
        const emailBody = forgotPasswordTemplate(resetUrl);
        await mailSender(
            email,
            "Reset Password Link - Sands of Kashi",
            emailBody
        );
        console.log("✅ Password reset email sent to:", email);
    } catch (error) {
        console.log("⚠️ Failed to send password reset email:", error.message);
        throw error; // This is critical - user needs the reset link
    }
};

/**
 * Send password change success email
 * @param {string} email - User email
 * @param {string} firstName - User first name
 * @returns {Promise<void>}
 */
const sendPasswordChangeEmail = async (email, firstName) => {
    try {
        const emailBody = passwordChangeSuccessTemplate(firstName);
        await mailSender(
            email,
            "Sands Of Kashi | Password Changed Successfully",
            emailBody
        );
        console.log("✅ Password change email sent to:", email);
    } catch (error) {
        console.log("⚠️ Failed to send password change email:", error.message);
        // Don't throw error - password change should succeed even if email fails
    }
};

/**
 * Send email verification email
 * @param {string} email - User email
 * @param {string} verificationUrl - Email verification URL
 * @returns {Promise<void>}
 */
const sendEmailVerificationEmail = async (email, verificationUrl) => {
    try {
        const emailBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #94cb3d;">Verify Your Email Address</h2>
                <p>Dear User,</p>
                <p>Please verify your email address by clicking the button below:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}" style="background-color: #94cb3d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Verify Email
                    </a>
                </div>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
                <p>This link will expire in 24 hours.</p>
                <p>If you didn't create an account, please ignore this email.</p>
                <p>Best regards,<br>${process.env.APP_NAME || 'Sands of Kashi'} Team</p>
            </div>
        `;
        await mailSender(
            email,
            "Verify Your Email - Hotel Dashboard",
            emailBody
        );
        console.log("✅ Email verification sent to:", email);
    } catch (error) {
        console.log("⚠️ Failed to send email verification:", error.message);
        throw error; // This is critical - user needs the verification link
    }
};

module.exports = {
    sendRegistrationEmail,
    sendLoginAlertEmail,
    sendPasswordResetEmail,
    sendPasswordChangeEmail,
    sendEmailVerificationEmail,
};
