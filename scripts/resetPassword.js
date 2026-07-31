/**
 * Password Reset Utility
 * Run this script to reset a user's password
 * Usage: node scripts/resetPassword.js <email> <newPassword>
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../model/User.model');
require('dotenv').config();

async function resetPassword(email, newPassword) {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel_apr';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      console.error(`User not found with email: ${email}`);
      process.exit(1);
    }

    console.log(`User found: ${user.email}`);
    console.log(`Current password hash exists: ${!!user.password}`);

    // Handle migration from firstName/lastName to fullName
    if (!user.fullName) {
      if (user.firstName || user.lastName) {
        user.fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        console.log(`Migrated fullName from firstName/lastName: ${user.fullName}`);
      } else {
        user.fullName = 'User'; // Default fallback
        console.log(`Set default fullName: ${user.fullName}`);
      }
    }

    // Hash the new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password
    user.password = newPassword; // Will be hashed by pre-save hook
    await user.save({ validateBeforeSave: false });

    console.log('Password reset successfully!');
    console.log(`Email: ${user.email}`);
    console.log(`New password: ${newPassword}`);
    console.log('You can now login with these credentials.');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error resetting password:', error);
    process.exit(1);
  }
}

// Get command line arguments
const args = process.argv.slice(2);
const email = args[0];
const newPassword = args[1];

if (!email || !newPassword) {
  console.log('Usage: node scripts/resetPassword.js <email> <newPassword>');
  console.log('Example: node scripts/resetPassword.js gunnikij1665@gmail.com NewPassword123!');
  process.exit(1);
}

// Validate password strength
const passwordValidation = (password) => {
  const errors = [];
  if (password.length < 8) errors.push("Password must be at least 8 characters");
  if (!/[A-Z]/.test(password)) errors.push("Password must contain at least one uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("Password must contain at least one lowercase letter");
  if (!/[0-9]/.test(password)) errors.push("Password must contain at least one number");
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push("Password must contain at least one special character");
  return errors;
};

const validationErrors = passwordValidation(newPassword);
if (validationErrors.length > 0) {
  console.error('Password validation failed:');
  validationErrors.forEach(error => console.error(`  - ${error}`));
  process.exit(1);
}

resetPassword(email, newPassword);
