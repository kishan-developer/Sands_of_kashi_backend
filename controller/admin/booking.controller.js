const Booking = require("../../model/Booking.model");
const Room = require("../../model/Room.model");

/* -------------------------------------------------------
    USER — CREATE BOOKING
-------------------------------------------------------- */
const createBooking = async (req, res) => {
  try {
    const { roomId, checkIn, checkOut, guests, totalAmount } = req.body;
    const userId = req.user._id;

    // create new booking
    const booking = await Booking.create({
      roomId,
      userId,
      checkIn,
      checkOut,
      guests,
      totalAmount,
      paymentStatus: "pending",
      status: "Booked",
    });

    // Mark room unavailable (only for DB-tracked rooms)
    try {
      if (roomId.match(/^[0-9a-fA-F]{24}$/)) {
        await Room.findByIdAndUpdate(roomId, { isAvailable: false });
      }
    } catch (e) { /* Static room name, skip */ }

    // send the create response in backend api server
    return res.success("Booking Created Successfully", booking);
  } catch (error) {
    return res.error(error.message, 500);
  }
};


/* -------------------------------------------------------
    USER — GET MY BOOKINGS
-------------------------------------------------------- */
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    return res.success("Bookings fetched successfully", bookings);
  } catch (error) {
    return res.error(error.message, 500);
  }
};


/* -------------------------------------------------------
    MANAGER / ADMIN — GET ALL BOOKINGS
-------------------------------------------------------- */
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId")
      .sort({ createdAt: -1 });

    return res.success("All bookings fetched successfully", bookings);
  } catch (error) {
    return res.error(error.message, 500);
  }
};


/* -------------------------------------------------------
    MANAGER — CHECK-IN GUEST
-------------------------------------------------------- */
const checkInBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: "CheckedIn" },
      { new: true }
    );

    // update room availability if it's a DB-tracked room
    try {
      if (booking.roomId?.match?.(/^[0-9a-fA-F]{24}$/)) {
        await Room.findByIdAndUpdate(booking.roomId, { isAvailable: false });
      }
    } catch (e) { /* Static room name, skip */ }

    return res.success("Guest Checked-In Successfully", booking);
  } catch (error) {
    return res.error(error.message, 500);
  }
};


/* -------------------------------------------------------
    MANAGER — CHECK-OUT GUEST
-------------------------------------------------------- */
const checkOutBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: "CheckedOut" },
      { new: true }
    );

    // Room becomes available again
    try {
      if (booking.roomId?.match?.(/^[0-9a-fA-F]{24}$/)) {
        await Room.findByIdAndUpdate(booking.roomId, { isAvailable: true });
      }
    } catch (e) { /* Static room name, skip */ }

    return res.success("Guest Checked-Out Successfully", booking);
  } catch (error) {
    return res.error(error.message, 500);
  }
};


/* -------------------------------------------------------
    MANAGER — CANCEL BOOKING
-------------------------------------------------------- */
const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: "Cancelled" },
      { new: true }
    );

    // Room becomes available again
    try {
      if (booking.roomId?.match?.(/^[0-9a-fA-F]{24}$/)) {
        await Room.findByIdAndUpdate(booking.roomId, { isAvailable: true });
      }
    } catch (e) { /* Static room name, skip */ }

    return res.success("Booking Cancelled Successfully", booking);
  } catch (error) {
    return res.error(error.message, 500);
  }
};


/* -------------------------------------------------------
    ADMIN — UPDATE PAYMENT STATUS
-------------------------------------------------------- */
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const bookingId = req.params.id;

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { paymentStatus },
      { new: true }
    );

    return res.success("Payment Status Updated", booking);
  } catch (error) {
    return res.error(error.message, 500);
  }
};


/* -------------------------------------------------------
    ADMIN — DELETE BOOKING
-------------------------------------------------------- */
const deleteBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId);

    // Make room available again
    try {
      if (booking.roomId?.match?.(/^[0-9a-fA-F]{24}$/)) {
        await Room.findByIdAndUpdate(booking.roomId, { isAvailable: true });
      }
    } catch (e) { /* Static room name, skip */ }

    await Booking.findByIdAndDelete(bookingId);

    return res.success("Booking Deleted Successfully");
  } catch (error) {
    return res.error(error.message, 500);
  }
};

const createGuestBooking = async (req, res) => {
  try {
    const { roomId, roomType, name, email, phone, checkIn, checkOut, guests, totalAmount, message } = req.body;

    // Determine the actual roomId (handling if the frontend sends a title in 'roomType' or 'roomId')
    let actualRoomId = roomId;
    const identifier = roomId || roomType;

    if (identifier && !identifier.match(/^[0-9a-fA-F]{24}$/)) {
        // It's a title, try to find the room
        const foundRoom = await Room.findOne({ title: identifier });
        if (foundRoom) {
            actualRoomId = foundRoom._id;
        }
    }

    const booking = await Booking.create({
      roomId: actualRoomId || "Manual / " + identifier,
      guestName: name,
      guestEmail: email,
      guestPhone: phone,
      checkIn,
      checkOut,
      guests: guests || 1,
      totalAmount: totalAmount || 0,
      paymentStatus: "pending",
      status: "Booked",
    });

    return res.success("Booking Request Saved to Database", booking);
  } catch (error) {
    return res.error(error.message, 500);
  }
};

module.exports= {
  createBooking,
  createGuestBooking,
  getMyBookings,
  getAllBookings,
  checkInBooking,
  checkOutBooking,
  cancelBooking,
  updatePaymentStatus,
  deleteBooking
}