const { getPremiumEmailTemplate } = require('./premiumEmailTemplate');

function bookingAdminNotificationTemplate({ name, email, phone, roomType, checkIn, checkOut, message }) {
  const checkInDate = new Date(checkIn).toLocaleDateString('en-US', { 
    weekday: 'short', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
  const checkOutDate = new Date(checkOut).toLocaleDateString('en-US', { 
    weekday: 'short', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });

  const content = `
    <h2>🏨 New Booking Request</h2>
    <p>A new booking request has been received. Please review the details below and contact the guest to confirm availability and payment details.</p>
    
    <div class="info-box">
      <h3>👤 Guest Information</h3>
      <table>
        <tr><td>Name:</td><td>${name}</td></tr>
        <tr><td>Email:</td><td>${email}</td></tr>
        <tr><td>Phone:</td><td>${phone}</td></tr>
      </table>
    </div>
    
    <div class="info-box">
      <h3>📋 Booking Details</h3>
      <table>
        <tr><td>Room Type:</td><td>${roomType}</td></tr>
        <tr><td>Check-in:</td><td>${checkInDate}</td></tr>
        <tr><td>Check-out:</td><td>${checkOutDate}</td></tr>
      </table>
    </div>
    
    ${message ? `
    <div class="info-box">
      <h3>📝 Special Request</h3>
      <p><em>"${message}"</em></p>
    </div>
    ` : ''}
    
    <p><strong>Action Required:</strong></p>
    <ul>
      <li>Verify room availability for the requested dates</li>
      <li>Contact the guest to confirm booking</li>
      <li>Collect payment details or arrange payment method</li>
      <li>Update booking status in the system</li>
    </ul>
    
    <p>For immediate assistance, contact the guest directly:</p>
    <p>📞 <a href="tel:${phone}">${phone}</a></p>
    <p>✉️ <a href="mailto:${email}">${email}</a></p>
  `;

  return getPremiumEmailTemplate(content, "New Booking Request");
}

module.exports = bookingAdminNotificationTemplate;
