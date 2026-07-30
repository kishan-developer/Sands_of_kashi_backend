const express = require("express");
const { 
    createBooking, 
    getMyBookings 
} = require("../controller/admin/booking.controller");
const { isAuthenticated } = require("../middleware/auth.middleware");

const router = express.Router();

// {domain}/api/v1/bookings/create
router.post("/create", isAuthenticated, createBooking);

const { createGuestBooking } = require("../controller/admin/booking.controller");
// {domain}/api/v1/bookings/public/create
router.post("/public/create", createGuestBooking);

// {domain}/api/v1/bookings/my
router.get("/my", isAuthenticated, getMyBookings);

module.exports = router;
