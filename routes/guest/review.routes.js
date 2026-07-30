const express = require("express");
const {
  addReview,
  getMyReviews,
} = require("../../controller/admin/review.controller");

const reviewrouter = express.Router();

/* -------------------- USER -------------------- */
reviewrouter.post("/",  addReview);
reviewrouter.get("/my", getMyReviews);

module.exports = reviewrouter;