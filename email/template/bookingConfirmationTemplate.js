const { getPremiumEmailTemplate } = require('./premiumEmailTemplate');

function bookingConfirmationTemplate({ name, email, phone, roomType, checkIn, checkOut, message }) {
  const checkInDate = new Date(checkIn).toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const checkOutDate = new Date(checkOut).toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const content = `
    <h2>🏨 Booking Confirmation</h2>
    <p>Dear <strong>${name}</strong>,</p>
    <p>Thank you for choosing <strong>Sands of Kashi</strong>! We have received your booking request and are delighted to welcome you to our hotel in the spiritual city of Varanasi.</p>
    
    <div class="info-box">
      <h3>📋 Booking Details</h3>
      <table>
        <tr><td>Room Type:</td><td>${roomType}</td></tr>
        <tr><td>Check-in:</td><td>${checkInDate}</td></tr>
        <tr><td>Check-out:</td><td>${checkOutDate}</td></tr>
        <tr><td>Email:</td><td>${email}</td></tr>
        <tr><td>Phone:</td><td>${phone}</td></tr>
      </table>
    </div>
    
    ${message ? `
    <div class="info-box">
      <h3>📝 Special Request</h3>
      <p><em>"${message}"</em></p>
    </div>
    ` : ''}
    
    <p><strong>Important Information:</strong></p>
    <ul>
      <li>Check-in time: 12:00 PM | Check-out time: 11:00 AM</li>
      <li>Please carry a valid ID proof at check-in</li>
      <li>Early check-in is subject to availability</li>
      <li>For any changes, please contact us 24 hours before arrival</li>
    </ul>
    
    <p>For any queries or modifications, please contact us:</p>
    <p>📞 <a href="tel:+917522801563">+91-7522801563</a></p>
    <p>✉️ <a href="mailto:info@sandsofkashi.in">info@sandsofkashi.in</a></p>
    
    <p>We look forward to providing you with a memorable stay!</p>
    <p><em>Warm regards,<br>The Sands of Kashi Team</em></p>
  `;

  return getPremiumEmailTemplate(content, "Booking Confirmation");
}

module.exports = bookingConfirmationTemplate;
