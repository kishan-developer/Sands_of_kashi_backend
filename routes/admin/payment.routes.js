const express = require("express");
const { getAllPayments, updatePaymentStatus } = require("../../controller/payment.controller");
const paymentRouter = express.Router();

paymentRouter.get("/all", getAllPayments);
paymentRouter.put("/status/:id", updatePaymentStatus);

module.exports = paymentRouter;
