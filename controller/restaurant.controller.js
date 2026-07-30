const RestaurantOrder = require("../model/RestaurantOrder.model");
const TableBooking = require("../model/TableBooking.model");
const FoodMenu = require("../model/FoodMenu.model"); // Import the FoodMenu model
const asyncHandler = require("express-async-handler");

// Admin/Manager: Get all orders and bookings
exports.getAllRestaurantDetails = asyncHandler(async (req, res) => {
  const orders = await RestaurantOrder.find({}).populate("userId", "fullName email phone");
  const bookings = await TableBooking.find({}).populate("userId", "fullName email phone");

  return res.success("Restaurant data fetched", { orders, bookings });
});

// Create menu item (Admin Only)
exports.createMenuItem = asyncHandler(async (req, res) => {
    const item = await FoodMenu.create(req.body);
    return res.success("Menu item created", item);
});

// Update menu item (Admin Only)
exports.updateMenuItem = asyncHandler(async (req, res) => {
    const item = await FoodMenu.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.error("Item not found", 404);
    return res.success("Item updated", item);
});

// Delete menu item (Admin Only)
exports.deleteMenuItem = asyncHandler(async (req, res) => {
    const item = await FoodMenu.findByIdAndDelete(req.params.id);
    if (!item) return res.error("Item not found", 404);
    return res.success("Item deleted");
});

// Get all menu items
exports.getAllMenuItems = asyncHandler(async (req, res) => {
  const menu = await FoodMenu.find({});
  return res.success("Menu fetched", menu);
});

// Other controllers...
exports.createFoodOrder = asyncHandler(async (req, res) => {
  const { items, totalAmount, orderType, roomNumber } = req.body;
  const userId = req.user._id;

  const order = await RestaurantOrder.create({
    userId,
    items,
    totalAmount,
    orderType,
    roomNumber,
  });

  return res.success("Food order placed successfully", order);
});

exports.bookTable = asyncHandler(async (req, res) => {
  const { bookingDate, bookingTime, guests, specialRequests } = req.body;
  const userId = req.user._id;

  const booking = await TableBooking.create({
    userId,
    bookingDate,
    bookingTime,
    guests,
    specialRequests,
  });

  return res.success("Table booked successfully", booking);
});

exports.getUserRestaurantHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const orders = await RestaurantOrder.find({ userId }).sort({ createdAt: -1 });
  const bookings = await TableBooking.find({ userId }).sort({ createdAt: -1 });

  return res.success("User restaurant history fetched", { orders, bookings });
});

