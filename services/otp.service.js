const OTP = require("../model/Otp.model");
const generateOtp = require("../utils/otpGenerator.utils");
const { ValidationError, ConflictError } = require("../middleware/globalErrorHandler.middleware");
const mailSender = require("../utils/mailSender.utils");

/**
 * Generate and send OTP to email
 * @param {string} email - User email
 * @returns {Promise<Object>} OTP details
 */
const sendOtp = async (email, purpose = 'registration') => {
    if (!email) {
        throw new ValidationError("Email is required");
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists (only for registration)
    if (purpose === 'registration') {
        const User = require("../model/User.model");
        const isUserAlreadyExists = await User.findOne({ email: normalizedEmail });
        
        if (isUserAlreadyExists) {
            throw new ConflictError("User already exists. Please login instead.");
        }
    }

    // Generate OTP
    const otp = await generateOtp();
    console.log("Generated OTP for", normalizedEmail, ":", otp);

    // Delete existing OTP records for this email
    await OTP.deleteMany({ email: normalizedEmail });

    // Create new OTP record
    await OTP.create({ email: normalizedEmail, otp, purpose });

    // Send OTP email
    try {
        const emailBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #94cb3d;">Your Verification Code</h2>
                <p>Dear User,</p>
                <p>Your verification code for ${process.env.APP_NAME || 'Sands of Kashi'} is:</p>
                <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                    ${otp}
                </div>
                <p>This code will expire in 5 minutes.</p>
                <p>If you didn't request this code, please ignore this email.</p>
                <p>Best regards,<br>${process.env.APP_NAME || 'Sands of Kashi'} Team</p>
            </div>
        `;
        
        await mailSender(normalizedEmail, "Your Verification Code", emailBody);
        console.log("✅ OTP email sent to:", normalizedEmail);
    } catch (emailError) {
        console.log("⚠️ Failed to send OTP email:", emailError.message);
        // Continue with the process even if email fails
    }

    // Return OTP in development mode for testing
    const isDevelopment = process.env.NODE_ENV !== 'production';
    return { 
        email: normalizedEmail,
        ...(isDevelopment && { otp, message: "Development mode: OTP included in response" })
    };
};

/**
 * Verify OTP
 * @param {string} email - User email
 * @param {string} otp - OTP to verify
 * @returns {Promise<boolean>} Verification result
 */
const verifyOtp = async (email, otp) => {
    if (!email || !otp) {
        throw new ValidationError("Email and OTP are required");
    }

    const normalizedEmail = email.trim().toLowerCase();

    const otpRecord = await OTP.findOne({ email: normalizedEmail });

    if (!otpRecord) {
        console.log("OTP record not found for email:", normalizedEmail);
        throw new ValidationError("OTP record not found (expired or never generated)");
    }

    console.log("Verifying OTP - Email:", normalizedEmail);
    console.log("Expected OTP:", otpRecord.otp);
    console.log("Received OTP:", otp);

    if (otpRecord.otp !== otp) {
        throw new ValidationError("Invalid OTP");
    }

    // Delete OTP record after successful verification
    await OTP.deleteOne({ email: normalizedEmail });

    return true;
};

module.exports = {
    sendOtp,
    verifyOtp,
};
