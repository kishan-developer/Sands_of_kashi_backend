const mongoose = require("mongoose");

const tableBookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bookingDate: { type: Date, required: true },
    bookingTime: { type: String, required: true },
    guests: { type: Number, required: true, min: 1 },
    specialRequests: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Confirmed", "Cancelled", "Completed"],
      default: "Confirmed",
    },
    tableNumber: { type: String }, // Optional, can be assigned later
  },
  { timestamps: true }
);

module.exports = mongoose.model("TableBooking", tableBookingSchema);
