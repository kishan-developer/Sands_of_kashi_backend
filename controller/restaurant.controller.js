const RestaurantOrder = require("../model/RestaurantOrder.model");
const TableBooking = require("../model/TableBooking.model");
const FoodMenu = require("../model/FoodMenu.model"); // Import the FoodMenu model
const RestaurantReservation = require("../model/RestaurantReservation.model");
const RestaurantInquiry = require("../model/RestaurantInquiry.model");
const asyncHandler = require("express-async-handler");
const mailSender = require("../utils/mailSender.utils");
const { getPremiumEmailTemplate } = require("../email/template/premiumEmailTemplate");

// Admin/Manager: Get all orders and bookings
exports.getAllRestaurantDetails = asyncHandler(async (req, res) => {
  const orders = await RestaurantOrder.find({}).populate("userId", "fullName email phone");
  const bookings = await TableBooking.find({}).populate("userId", "fullName email phone");

  return res.success("Restaurant data fetched", { orders, bookings });
});

// Create menu item (Admin Only)
exports.createMenuItem = asyncHandler(async (req, res) => {
    const item = await FoodMenu.create(req.body);
    return res.success("Menu item created", item);
});

// Update menu item (Admin Only)
exports.updateMenuItem = asyncHandler(async (req, res) => {
    const item = await FoodMenu.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.error("Item not found", 404);
    return res.success("Item updated", item);
});

// Delete menu item (Admin Only)
exports.deleteMenuItem = asyncHandler(async (req, res) => {
    const item = await FoodMenu.findByIdAndDelete(req.params.id);
    if (!item) return res.error("Item not found", 404);
    return res.success("Item deleted");
});

// Get all menu items
exports.getAllMenuItems = asyncHandler(async (req, res) => {
  const menu = await FoodMenu.find({});
  return res.success("Menu fetched", menu);
});

// Other controllers...
exports.createFoodOrder = asyncHandler(async (req, res) => {
  const { items, totalAmount, orderType, roomNumber } = req.body;
  const userId = req.user._id;

  const order = await RestaurantOrder.create({
    userId,
    items,
    totalAmount,
    orderType,
    roomNumber,
  });

  return res.success("Food order placed successfully", order);
});

exports.bookTable = asyncHandler(async (req, res) => {
  const { bookingDate, bookingTime, guests, specialRequests } = req.body;
  const userId = req.user._id;

  const booking = await TableBooking.create({
    userId,
    bookingDate,
    bookingTime,
    guests,
    specialRequests,
  });

  return res.success("Table booked successfully", booking);
});

exports.getUserRestaurantHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const orders = await RestaurantOrder.find({ userId }).sort({ createdAt: -1 });
  const bookings = await TableBooking.find({ userId }).sort({ createdAt: -1 });

  return res.success("User restaurant history fetched", { orders, bookings });
});

// Public: Create restaurant reservation (no authentication)
exports.createPublicReservation = asyncHandler(async (req, res) => {
  const { name, guests, date, time, email, phone } = req.body;

  const reservation = await RestaurantReservation.create({
    name,
    guests,
    date,
    time,
    email,
    phone,
  });

  // Send confirmation email to user
  if (email) {
    const userSubject = "✨ Table Reservation Confirmed - Sands of Kashi";
    const userContent = `
      <h2>Reservation Confirmed</h2>
      <p>Dear <strong>${name}</strong>,</p>
      <p>Thank you for choosing Sands of Kashi! Your table reservation has been successfully confirmed. We are excited to welcome you and provide an exceptional dining experience.</p>
      
      <div class="info-box">
        <h3>📅 Reservation Details</h3>
        <table>
          <tr><td>Date:</td><td>${date}</td></tr>
          <tr><td>Time:</td><td>${time}</td></tr>
          <tr><td>Guests:</td><td>${guests}</td></tr>
          <tr><td>Phone:</td><td>${phone || 'Not provided'}</td></tr>
        </table>
      </div>
      
      <p><strong>Important Information:</strong></p>
      <ul>
        <li>Please arrive 10 minutes before your reservation time</li>
        <li>For parties of 6+ guests, please call us in advance</li>
        <li>Cancellations should be made at least 2 hours before your reservation</li>
      </ul>
      
      <p>If you need to modify or cancel your reservation, please contact us:</p>
      <p>📞 <a href="tel:+917522801563">+91-7522801563</a></p>
      <p>✉️ <a href="mailto:info@sandsofkashi.in">info@sandsofkashi.in</a></p>
      
      <p>We look forward to serving you!</p>
      <p><em>Warm regards,<br>The Sands of Kashi Team</em></p>
    `;
    
    await mailSender(email, userSubject, getPremiumEmailTemplate(userContent, "Reservation Confirmed"));
  }

  // Send notification email to admin
  const adminEmail = process.env.ADMIN_EMAIL || "gunnikij1665@gmail.com";
  const adminSubject = `🍽️ New Table Reservation - ${name}`;
  const adminContent = `
    <h2>🆕 New Table Reservation</h2>
    <p>A new table reservation has been received. Please review the details below:</p>
    
    <div class="info-box">
      <h3>👤 Customer Information</h3>
      <table>
        <tr><td>Name:</td><td>${name}</td></tr>
        <tr><td>Email:</td><td>${email || 'Not provided'}</td></tr>
        <tr><td>Phone:</td><td>${phone || 'Not provided'}</td></tr>
      </table>
    </div>
    
    <div class="info-box">
      <h3>📅 Reservation Details</h3>
      <table>
        <tr><td>Date:</td><td>${date}</td></tr>
        <tr><td>Time:</td><td>${time}</td></tr>
        <tr><td>Guests:</td><td>${guests}</td></tr>
      </table>
    </div>
    
    <p>Please confirm availability and contact the customer if needed.</p>
  `;
  
  await mailSender(adminEmail, adminSubject, getPremiumEmailTemplate(adminContent, "New Reservation"));

  return res.success("Reservation created successfully", reservation);
});

// Public: Create restaurant inquiry (no authentication)
exports.createPublicInquiry = asyncHandler(async (req, res) => {
  const { email, message, name } = req.body;

  const inquiry = await RestaurantInquiry.create({
    email,
    message,
    name,
  });

  // Send acknowledgment email to user
  const userSubject = "✉️ Inquiry Received - Sands of Kashi";
  const userContent = `
    <h2>Inquiry Received</h2>
    <p>Dear ${name || 'Guest'},</p>
    <p>Thank you for reaching out to Sands of Kashi! We have received your inquiry and our team will review it carefully.</p>
    
    <div class="info-box">
      <h3>📋 Your Inquiry</h3>
      <p><em>"${message}"</em></p>
    </div>
    
    <p><strong>What happens next:</strong></p>
    <ul>
      <li>Our team will review your inquiry within 24 hours</li>
      <li>You will receive a detailed response via email</li>
      <li>For urgent matters, please call us directly</li>
    </ul>
    
    <p>If you need an immediate response, please contact us:</p>
    <p>📞 <a href="tel:+917522801563">+91-7522801563</a></p>
    <p>✉️ <a href="mailto:info@sandsofkashi.in">info@sandsofkashi.in</a></p>
    
    <p>We appreciate your interest in Sands of Kashi and look forward to assisting you!</p>
    <p><em>Best regards,<br>The Sands of Kashi Team</em></p>
  `;
  
  await mailSender(email, userSubject, getPremiumEmailTemplate(userContent, "Inquiry Received"));

  // Send notification email to admin
  const adminEmail = process.env.ADMIN_EMAIL || "gunnikij1665@gmail.com";
  const adminSubject = `📨 New Restaurant Inquiry - ${email}`;
  const adminContent = `
    <h2>🆕 New Restaurant Inquiry</h2>
    <p>A new inquiry has been received. Please review the details below:</p>
    
    <div class="info-box">
      <h3>👤 Customer Information</h3>
      <table>
        <tr><td>Name:</td><td>${name || 'Not provided'}</td></tr>
        <tr><td>Email:</td><td>${email}</td></tr>
      </table>
    </div>
    
    <div class="info-box">
      <h3>💬 Inquiry Message</h3>
      <p><em>"${message}"</em></p>
    </div>
    
    <p>Please respond to this inquiry within 24 hours to provide excellent customer service.</p>
  `;
  
  await mailSender(adminEmail, adminSubject, getPremiumEmailTemplate(adminContent, "New Inquiry"));

  return res.success("Inquiry created successfully", inquiry);
});

// Public: Create food order (no authentication)
exports.createPublicFoodOrder = asyncHandler(async (req, res) => {
  const { items, totalAmount, orderType, name, phone, email, address } = req.body;

  const order = await RestaurantOrder.create({
    customerName: name,
    customerPhone: phone,
    customerEmail: email,
    customerAddress: address,
    items: items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: parseInt(item.price.replace('₹', '').replace(',', '')),
      category: item.category
    })),
    totalAmount,
    orderType: orderType === 'pickup' ? 'Pickup' : 'Delivery',
    status: 'Pending'
  });

  // Send confirmation email to user
  if (email) {
    const userSubject = "🍽️ Food Order Confirmed - Sands of Kashi";
    const userContent = `
      <h2>Order Confirmed</h2>
      <p>Dear <strong>${name}</strong>,</p>
      <p>Thank you for your order! We have received your food order and our team is preparing it with care.</p>
      
      <div class="info-box">
        <h3>📋 Order Details</h3>
        <table>
          <tr><td>Order Type:</td><td>${orderType === 'pickup' ? 'Pickup' : 'Delivery'}</td></tr>
          <tr><td>Total Amount:</td><td>₹${totalAmount}</td></tr>
          <tr><td>Phone:</td><td>${phone}</td></tr>
          ${address ? `<tr><td>Address:</td><td>${address}</td></tr>` : ''}
        </table>
      </div>
      
      <div class="info-box">
        <h3>🍴 Items Ordered</h3>
        <table>
          ${items.map(item => `
            <tr>
              <td>${item.name} x${item.quantity}</td>
              <td>${item.price}</td>
            </tr>
          `).join('')}
        </table>
      </div>
      
      <p><strong>Estimated Time:</strong> 30-45 minutes</p>
      <p><strong>Payment:</strong> Pay on delivery/pickup</p>
      
      <p>For any changes to your order, please contact us:</p>
      <p>📞 <a href="tel:+917522801563">+91-7522801563</a></p>
      <p>✉️ <a href="mailto:info@sandsofkashi.in">info@sandsofkashi.in</a></p>
      
      <p>We appreciate your order and look forward to serving you delicious food!</p>
      <p><em>Bon appétit,<br>The Sands of Kashi Team</em></p>
    `;
    
    await mailSender(email, userSubject, getPremiumEmailTemplate(userContent, "Order Confirmed"));
  }

  // Send notification email to admin
  const adminEmail = process.env.ADMIN_EMAIL || "gunnikij1665@gmail.com";
  const adminSubject = `🆕 New Food Order - ${name}`;
  const adminContent = `
    <h2>🆕 New Food Order</h2>
    <p>A new food order has been received. Please review the details below:</p>
    
    <div class="info-box">
      <h3>👤 Customer Information</h3>
      <table>
        <tr><td>Name:</td><td>${name}</td></tr>
        <tr><td>Email:</td><td>${email || 'Not provided'}</td></tr>
        <tr><td>Phone:</td><td>${phone}</td></tr>
        <tr><td>Order Type:</td><td>${orderType === 'pickup' ? 'Pickup' : 'Delivery'}</td></tr>
        ${address ? `<tr><td>Address:</td><td>${address}</td></tr>` : ''}
      </table>
    </div>
    
    <div class="info-box">
      <h3>🍴 Order Items</h3>
      <table>
        ${items.map(item => `
          <tr>
            <td>${item.name} x${item.quantity}</td>
            <td>${item.price}</td>
          </tr>
        `).join('')}
        <tr><td><strong>Total:</strong></td><td><strong>₹${totalAmount}</strong></td></tr>
      </table>
    </div>
    
    <p><strong>Action Required:</strong></p>
    <ul>
      <li>Confirm order availability</li>
      <li>Prepare food items</li>
      <li>Contact customer if any issues</li>
      <li>Arrange delivery or prepare for pickup</li>
    </ul>
    
    <p>Contact customer directly: 📞 <a href="tel:${phone}">${phone}</a></p>
  `;
  
  await mailSender(adminEmail, adminSubject, getPremiumEmailTemplate(adminContent, "New Food Order"));

  return res.success("Order created successfully", order);
});
