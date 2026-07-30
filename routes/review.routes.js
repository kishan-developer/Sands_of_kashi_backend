const express = require("express");
const {
    getHotelReviews,
    getRoomReviews,
} = require("../controllers/admin/review.controller");

const reviewrouter = express.Router();

/* -------------------- PUBLIC -------------------- */
reviewrouter.get("/hotel", getHotelReviews);
reviewrouter.get("/room/:roomId", getRoomReviews);

module.exports = reviewrouter;