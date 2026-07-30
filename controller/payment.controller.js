const razorpayInstance = require("../utils/razorpayInstance");
const Payment = require("../model/Payment.model");
const Booking = require("../model/Booking.model");
const User = require("../model/User.model");
const crypto = require("crypto");
const mailSender = require("../utils/mailSender.utils");
const asyncHandler = require("express-async-handler");

// checkout handler 
exports.checkoutHandler = asyncHandler(async (req, res) => {
    const { bookingId } = req.body;

    if (!bookingId) {
        return res.error("Booking ID is required", 400);
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
        return res.error("Booking not found", 404);
    }

    const amount = booking.totalAmount;

    try {
        const razorpayOrder = await razorpayInstance.orders.create({
            amount: Math.round(amount * 100),
            currency: "INR",
            receipt: `receipt_${bookingId}`,
        });

        return res.success("Razorpay order created", razorpayOrder);
    } catch (error) {
        console.error("Razorpay Order Error:", error);
        return res.error("Failed to create Razorpay order", 500);
    }
});

// payment Verification Handler 
exports.paymentVerificationHandler = asyncHandler(async (req, res) => {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, bookingId } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !bookingId) {
        return res.error("Missing payment details", 400);
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
        .update(body.toString())
        .digest("hex");

    const isAuthentic = razorpay_signature === expectedSignature;

    if (!isAuthentic) {
        return res.error("Payment verification failed", 400);
    }

    // 1. Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
        return res.error("Booking not found", 404);
    }

    // 2. Update booking status
    booking.paymentStatus = "paid";
    await booking.save();

    // 3. Create payment record
    const payment = await Payment.create({
        userId: booking.userId,
        bookingId: booking._id,
        amount: booking.totalAmount,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        status: "paid",
    });

    // 4. Send confirmation email
    const user = await User.findById(booking.userId);
    if (user) {
        try {
            await mailSender(
                user.email,
                "Booking Confirmation - Sands Of Kashi",
                `<h2>Booking Confirmed!</h2>
                 <p>Dear ${user.firstName},</p>
                 <p>Your booking for ${booking.totalAmount} INR has been successfully paid.</p>
                 <p>Booking ID: ${booking._id}</p>`
            );
        } catch (emailError) {
            console.error("Email Error:", emailError);
        }
    }

    return res.success("Payment verified and booking updated", payment);
});

// Update Payment Status 
exports.updatePaymentStatus = asyncHandler(async (req, res) => {
    const { id } = req.params; // booking id
    const { paymentStatus } = req.body;

    if (!["pending", "paid", "failed"].includes(paymentStatus)) {
        return res.error("Invalid payment status", 400);
    }

    const booking = await Booking.findById(id);
    if (!booking) {
        return res.error("Booking not found", 404);
    }

    booking.paymentStatus = paymentStatus;
    await booking.save();

    return res.success("Payment status updated successfully", booking);
});

// Admin: Get all payment records
exports.getAllPayments = asyncHandler(async (req, res) => {
    const payments = await Payment.find({})
        .populate("userId", "firstName lastName email phone")
        .sort({ createdAt: -1 });

    return res.success("All payments fetched successfully", payments);
});
