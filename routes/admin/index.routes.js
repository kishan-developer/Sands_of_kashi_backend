const express = require("express");
const adminRouter = express.Router();
const {
    isAuthenticated,
    isAdmin,
} = require("../../middleware/auth.middleware");

// Routers
const userRouter = require("./user.routes");
const couponRouter = require("./coupon.routes");
const adminOfferRouter = require("./offer.routes");
const bookingRouter = require("./booking.routes");
const roomrouter = require("./room.routes");
const pageRouter = require("./page.routes");
const supportrouter = require("./support.routes");
const orderRouter = require("./order.routes");
const employeeRouter = require("./employee.routes");
// const channelRouter = require("./channel.routes");
// const systemSettingsRouter = require("./systemSettings.routes");
const uploadRouter = require("./upload.routes");
// const reviewRouter = require("./review.routes");
const paymentRouter = require("./payment.routes");

const Newsletter = require("../../model/Newsletter.model");

// Private Routes For Admin
adminRouter.use(isAuthenticated, isAdmin);

// Module Assignment
adminRouter.use("/user", userRouter);
adminRouter.use("/coupon", couponRouter);
adminRouter.use("/offer", adminOfferRouter);
adminRouter.use("/booking", bookingRouter);
adminRouter.use("/room", roomrouter);
adminRouter.use("/page", pageRouter);
adminRouter.use("/support", supportrouter);
adminRouter.use("/order", orderRouter);
adminRouter.use("/employee", employeeRouter);
// adminRouter.use("/channel", channelRouter);
// adminRouter.use("/system-settings", systemSettingsRouter);
adminRouter.use("/upload", uploadRouter);
// adminRouter.use("/review", reviewRouter);
adminRouter.use("/payment", paymentRouter);

// Newsletter
adminRouter.get('/newsletters', async(req, res)=>{
    try {
        const emails = await Newsletter.find({});
        return res.success("Newsletters fetched successfully", emails);
    } catch (error) {
       return res.error("Error while fetching emails", 500);
    }
});

module.exports = adminRouter;
