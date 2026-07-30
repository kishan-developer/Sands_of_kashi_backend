const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender.utils");
const otpTemplate = require("../email/template/otpTemplate");

const otpSchema = new mongoose.Schema({
    otp: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    },
    purpose: {
        type: String,
        enum: ['registration', 'password_reset', 'email_verification', 'login'],
        default: 'registration',
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300, // 5 minutes
    },
});

async function sendVerificationEmail(email, otp) {
    try {
        const body = otpTemplate(otp);
        await mailSender(email, "Verification Email", body);
    } catch (error) {
        console.log("Error occurred while sending mail: ", error);
        throw error;
    }
}

otpSchema.pre("save", async function (next) {
    // Only send an email when a new document is created
    if (this.isNew) {
        await sendVerificationEmail(this.email, this.otp);
    }
    next();
});

const OTP = mongoose.model("OTP", otpSchema);
module.exports = OTP;
