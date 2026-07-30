const RestaurantOrder = require("../../model/RestaurantOrder.model");

/* -------------------------------------------------------
   ADMIN — GET ALL ORDERS
-------------------------------------------------------- */
const getOrders = async (req, res) => {
  try {
    const orders = await RestaurantOrder.find().populate("userId", "name email");
    return res.success("Orders fetched successfully", orders);
  } catch (error) {
    return res.error(error.message, 500);
  }
};

/* -------------------------------------------------------
   ADMIN — GET SINGLE ORDER
-------------------------------------------------------- */
const getOrderById = async (req, res) => {
  try {
    const order = await RestaurantOrder.findById(req.params.id).populate("userId", "name email");
    if (!order) return res.error("Order not found", 404);

    return res.success("Order details fetched", order);
  } catch (error) {
    return res.error(error.message, 500);
  }
};

/* -------------------------------------------------------
   ADMIN — UPDATE ORDER STATUS
-------------------------------------------------------- */
const updateOrderStatus = async (req, res) => {
  try {
    const order = await RestaurantOrder.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!order) return res.error("Order not found", 404);

    return res.success("Order status updated", order);
  } catch (error) {
    return res.error(error.message, 500);
  }
};

/* -------------------------------------------------------
   ADMIN — UPDATE DELIVERY RECEIPT (Delhivery Service)
-------------------------------------------------------- */
const updateDelhiveryReceipt = async (req, res) => {
  try {
    const { orderId, receiptUrl } = req.body;
    const order = await RestaurantOrder.findByIdAndUpdate(
      orderId,
      { delhiveryReceipt: receiptUrl },
      { new: true }
    );

    if (!order) return res.error("Order not found", 404);

    return res.success("Delhivery receipt updated successfully", order);
  } catch (error) {
    return res.error(error.message, 500);
  }
};

module.exports = {
  getOrders,
  getOrderById,
  updateOrderStatus,
  updateDelhiveryReceipt,
};
