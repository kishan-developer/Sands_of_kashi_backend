const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true }, // Can be a Room ObjectId or static room name
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Optional for guests

    guestName: { type: String },
    guestEmail: { type: String },
    guestPhone: { type: String },

    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },

    totalAmount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },

    guests: { type: Number, required: true },

    // Reception panel
    status: {
      type: String,
      enum: ["Booked", "CheckedIn", "CheckedOut", "Cancelled"],
      default: "Booked",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);