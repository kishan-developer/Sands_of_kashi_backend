const mongoose = require("mongoose");

const restaurantReservationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    guests: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    status: { type: String, default: "pending", enum: ["pending", "confirmed", "cancelled"] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RestaurantReservation", restaurantReservationSchema);
