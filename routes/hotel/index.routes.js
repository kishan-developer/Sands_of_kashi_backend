const express = require("express");
const managerRoutes = express.Router();
const Newsletter = require("../../model/Newsletter.model");

// Hotel
// const bookingRouter = require("./booking.routes");
// const roomrouter = require("./room.routes");

// Private Routes For Admin - For Hotel
// managerRoutes.use(isAuthenticated, isAdmin);

// managerRoutes.use("/booking", bookingRouter);

// managerRoutes.use("/room", roomrouter)

// managerRoutes.use("/user", userRouter);

// managerRoutes.use("/coupon", couponRouter);

// managerRoutes.use("/offer", adminOfferRouter);

managerRoutes.get('/newsletters', async(req, res)=>{
    try {
        const emails = await Newsletter.find({});
        return res.success("Newsletters fetched successfully", emails);
    } catch (error) {
       return res.error("Error while fetching emails", 500);
    }
})

module.exports = managerRoutes;
