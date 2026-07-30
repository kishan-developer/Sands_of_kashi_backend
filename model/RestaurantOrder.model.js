const mongoose = require("mongoose");

const restaurantOrderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "Preparing", "Out for Delivery", "Delivered", "Cancelled"],
      default: "Pending",
    },
    orderType: { type: String, enum: ["Room Service", "Dine-in", "Takeaway"], default: "Room Service" },
    roomNumber: { type: String }, // Optional, for room service
    delhiveryReceipt: { type: String }, // Optional, for delivery tracking
  },
  { timestamps: true }
);

module.exports = mongoose.model("RestaurantOrder", restaurantOrderSchema);
