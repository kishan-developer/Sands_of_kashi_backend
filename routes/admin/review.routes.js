const express = require("express");
const {
  addReview,
  getHotelReviews,
  getRoomReviews,
  getMyReviews,
  getAllReviews,
  deleteReview,
} = require("../controllers/admin/review.controller");

const {
    isAuthenticated,
    isAdmin,
} = require("../../middleware/auth.middleware");

const reviewrouter = express.Router();

/* -------------------- USER -------------------- */
reviewrouter.post("/", auth, isRole("guest"), addReview);
reviewrouter.get("/my", auth, isRole("guest"), getMyReviews);

/* -------------------- PUBLIC -------------------- */
reviewrouter.get("/hotel", getHotelReviews);
reviewrouter.get("/room/:roomId", getRoomReviews);

/* -------------------- ADMIN -------------------- */
reviewrouter.get("/all", auth, isRole("admin"), getAllReviews);
reviewrouter.delete("/:id", auth, isRole("admin"), deleteReview);

module.exports = reviewrouter;