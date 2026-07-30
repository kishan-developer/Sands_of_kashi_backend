const express = require("express");
const { createFoodOrder, bookTable, getUserRestaurantHistory, getAllRestaurantDetails } = require("../controller/restaurant.controller");
const { isAuthenticated, isAdmin, isUser } = require("../middleware/auth.middleware");

const router = express.Router();

// User routes (needs to be authenticated)
router.post("/order-food", isAuthenticated, isUser, createFoodOrder);
router.post("/book-table", isAuthenticated, isUser, bookTable);
router.get("/user-history", isAuthenticated, isUser, getUserRestaurantHistory);

// Admin/Manager routes
router.get("/all-details", isAuthenticated, isAdmin, getAllRestaurantDetails);

// Food Menu Management (Admin Only)
const { createMenuItem, getAllMenuItems, updateMenuItem, deleteMenuItem } = require("../controller/restaurant.controller");

router.get("/menu", getAllMenuItems); // Publicly accessible menu
router.post("/menu/create", isAuthenticated, isAdmin, createMenuItem);
router.put("/menu/update/:id", isAuthenticated, isAdmin, updateMenuItem);
router.delete("/menu/delete/:id", isAuthenticated, isAdmin, deleteMenuItem);

module.exports = router;
