const mongoose = require("mongoose");

const restaurantInquirySchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    message: { type: String, required: true },
    name: { type: String },
    status: { type: String, default: "pending", enum: ["pending", "responded", "closed"] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RestaurantInquiry", restaurantInquirySchema);
