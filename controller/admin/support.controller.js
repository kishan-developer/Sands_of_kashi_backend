const Support = require("../../model/Support.model");

const createSupport = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.error("Name, email, subject and message are required", 400);
        }

        const support = await Support.create({
            name,
            email,
            phone,
            subject,
            message,
        });

        return res.success("Support request submitted", support);
    } catch (error) {
        return res.error(error.message, 500);
    }
};

const getAllSupport = async (req, res) => {
    try {
        const supports = await Support.find().sort({ createdAt: -1 });
        return res.success("Support tickets fetched successfully", { total: supports.length, supports });
    } catch (error) {
        return res.error(error.message, 500);
    }
};

const getSingleSupport = async (req, res) => {
    try {
        const support = await Support.findById(req.params.id);

        if (!support) {
            return res.error("Ticket not found", 404);
        }

        return res.success("Support ticket fetched", support);
    } catch (error) {
        return res.error(error.message, 500);
    }
};

const updateSupportStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const support = await Support.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!support) return res.error("Ticket not found", 404);

        return res.success("Status updated", support);
    } catch (error) {
        return res.error(error.message, 500);
    }
};


const replySupport = async (req, res) => {
    try {
        const { adminReply } = req.body;

        const support = await Support.findByIdAndUpdate(
            req.params.id,
            { adminReply, status: "resolved" },
            { new: true }
        );

        if (!support) return res.error("Ticket not found", 404);

        return res.success("Reply sent", support);
    } catch (error) {
        return res.error(error.message, 500);
    }
};

const deleteSupport = async (req, res) => {
  try {
    const support = await Support.findByIdAndDelete(req.params.id);

    if (!support) return res.error("Ticket not found", 404);

    return res.success("Support ticket deleted");
  } catch (error) {
    return res.error(error.message, 500);
  }
};

module.exports = {
    createSupport,
    getAllSupport,
    getSingleSupport,
    updateSupportStatus,
    replySupport,
    deleteSupport,
    
};