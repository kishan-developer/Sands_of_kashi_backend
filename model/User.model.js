const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Ensure JWT_SECRET is set - use fallback if not properly configured
const JWT_SECRET = process.env.JWT_SECRET || 'your_default_jwt_secret_for_development_change_in_production';
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your_jwt_secret_key_here') {
    console.warn("WARNING: JWT_SECRET not properly set in environment variables. Using default for development.");
    process.env.JWT_SECRET = JWT_SECRET;
}

// Ensure JWT_REFRESH_SECRET is set - use fallback if not properly configured
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_default_refresh_secret_for_development_change_in_production';
if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET === 'your_jwt_refresh_secret_key_here') {
    console.warn("WARNING: JWT_REFRESH_SECRET not properly set in environment variables. Using default for development.");
    process.env.JWT_REFRESH_SECRET = JWT_REFRESH_SECRET;
}

/**
 * Cart Schema for user shopping cart
 */
const cartSchema = new mongoose.Schema({
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                default: 1,
                min: 1,
            },
            finalPrice: {
                type: Number,
                required: true,
                default: 0,
                min: 0,
            },
            addons: {
                withFallPico: {
                    type: Boolean,
                    default: false,
                },
                withTassels: {
                    type: Boolean,
                    default: false,
                },
            },
            totalPrice: {
                type: Number,
                required: true,
                default: 0,
                min: 0,
            },
        },
    ],
    totalPrice: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
});

/**
 * User Schema with comprehensive validation and security features
 */
const userSchema = new mongoose.Schema(
    {
        avatar: {
            type: String,
            default: null,
        },
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
            lowercase: true,
            minlength: [2, "Full name must be at least 2 characters"],
            maxlength: [100, "Full name cannot exceed 100 characters"],
        },
        dob: {
            type: String,
            default: null,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
                "Please enter a valid email address",
            ],
        },
        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
            unique: true,
            match: [
                /^\+[1-9]\d{1,14}$/,
                "Please enter a valid international phone number with country code (e.g., +911234567890)",
            ],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            trim: true,
            minlength: [8, "Password must be at least 8 characters"],
            select: false, // Don't return password by default
        },
        role: {
            type: String,
            enum: {
                values: [
                    "super_admin",
                    "hotel_admin", 
                    "manager",
                    "receptionist",
                    "reservation_staff",
                    "housekeeping",
                    "restaurant_manager",
                    "chef",
                    "waiter",
                    "accounts",
                    "support",
                    "guest"
                ],
                message: "{VALUE} is not a valid role",
            },
            default: "guest",
        },
         // Legacy field - deprecated, use role instead
        isAdmin: {
            type: Boolean,
            default: true,
        },

        hotelId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hotel",
            default: null,
        },
        permissions: [{
            type: String,
            trim: true,
        }],
        // Account status
        isActive: {
            type: Boolean,
            default: true,
        },
        // 2FA fields
        twoFactorEnabled: {
            type: Boolean,
            default: false,
        },
        twoFactorSecret: {
            type: String,
            select: false, // Don't return secret by default
        },
        twoFactorBackupCodes: [{
            type: String,
            select: false, // Don't return backup codes by default
        }],
        // Session management
        sessions: [{
            token: String,
            device: String,
            browser: String,
            ip: String,
            location: String,
            lastActive: Date,
            createdAt: Date,
        }],
        // Email verification
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        emailVerificationToken: {
            value: String,
            expiresAt: Date,
        },
        // Account lockout
        loginAttempts: {
            type: Number,
            default: 0,
        },
        lockUntil: {
            type: Date,
            default: null,
        },
        // Address management
        shippingAddress: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Address",
            },
        ],
        defaultAddress: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Address",
            default: null,
        },
        // Shopping cart
        cart: {
            type: cartSchema,
            default: () => ({ items: [], totalPrice: 0 }),
        },
        // Wishlist
        wishList: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
        ],
        // Personal information
        gender: {
            type: String,
            enum: {
                values: ['male', 'female', 'other'],
                message: "{VALUE} is not a valid gender",
            },
            lowercase: true,
            default: null,
        },
       
        // Password reset
        forgotPasswordToken: {
            value: { type: String },
            expiresAt: { type: Date },
        },
        // Refresh token
        refreshToken: {
            type: String,
            select: false, // Don't return refresh token by default
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes for frequently queried fields
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ hotelId: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Virtual field for first name (backward compatibility)
userSchema.virtual("firstName").get(function () {
    return this.fullName ? this.fullName.split(' ')[0] : '';
});

// Virtual field for last name (backward compatibility)
userSchema.virtual("lastName").get(function () {
    return this.fullName ? this.fullName.split(' ').slice(1).join(' ') : '';
});

// Virtual field to check if account is locked
userSchema.virtual("isLocked").get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

/**
 * Pre-save middleware to hash password
 */
userSchema.pre("save", async function (next) {
    // Only hash the password if it has been modified or is new
    if (!this.isModified("password")) {
        return next();
    }

    try {
        // Use 12 rounds for stronger hashing
        const saltRounds = 12;
        this.password = await bcrypt.hash(this.password, saltRounds);
        next();
    } catch (error) {
        next(error);
    }
});

/**
 * Method to compare password
 * @param {string} candidatePassword - Plain text password
 * @returns {Promise<boolean>} Match result
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error("Password comparison failed");
    }
};

/**
 * Method to generate access token
 * @returns {string} JWT token
 */
userSchema.methods.generateToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            role: this.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "2d" }
    );
};

/**
 * Method to generate refresh token
 * @returns {string} JWT refresh token
 */
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            role: this.role,
        },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" }
    );
};

/**
 * Method to increment login attempts
 * @returns {Promise<void>}
 */
userSchema.methods.incrementLoginAttempts = async function () {
    // If already locked and lock has expired, reset
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $unset: { loginAttempts: 1, lockUntil: 1 },
        });
    }

    const updates = { $inc: { loginAttempts: 1 } };

    // Lock the account if max attempts reached
    if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
        updates.$set = {
            lockUntil: Date.now() + 2 * 60 * 60 * 1000, // Lock for 2 hours
        };
    }

    return this.updateOne(updates);
};

/**
 * Method to reset login attempts
 * @returns {Promise<void>}
 */
userSchema.methods.resetLoginAttempts = async function () {
    return this.updateOne({
        $unset: { loginAttempts: 1, lockUntil: 1 },
    });
};

/**
 * Static method to find by credentials
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object|null>} User object or null
 */
userSchema.statics.findByCredentials = async function (email, password) {
    const user = await this.findOne({ email }).select("+password");

    if (!user) {
        return null;
    }

    // Check if account is locked
    if (user.isLocked) {
        throw new Error("Account is temporarily locked. Please try again later.");
    }

    // Check if account is active
    if (!user.isActive) {
        throw new Error("Account is deactivated. Please contact support.");
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        await user.incrementLoginAttempts();
        return null;
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    return user;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
