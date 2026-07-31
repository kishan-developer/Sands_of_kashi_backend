const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    maxGuests: { type: Number, default: 2 },
    price: { type: Number, required: true },
    size: { type: String },
    discountPrice: { type: Number },
    images: [String],
    amenities: [String],
    features: [String],
    roomType: {
      type: String,
      enum: ["Superior", "Deluxe", "Family Suite", "Premium Balcony"],
      required: true,
    },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);