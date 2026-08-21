function bookingAdminNotificationTemplate({ name, email, phone, roomType, checkIn, checkOut, message }) {
  const checkInStr = checkIn ? new Date(checkIn).toLocaleDateString() : "N/A";
  const checkOutStr = checkOut ? new Date(checkOut).toLocaleDateString() : "N/A";

  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
      <div style="background-color: #1a1a1a; color: #c5a37f; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px;">SANDS OF KASHI</h1>
        <p style="margin: 5px 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Admin Notification - New Booking</p>
      </div>
      <div style="padding: 40px; background-color: #ffffff;">
        <h2 style="color: #1a1a1a; font-size: 20px; border-bottom: 2px solid #f8f7f5; padding-bottom: 10px; margin-top: 0;">New Booking Details</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr><td style="padding: 10px 0; font-weight: bold; width: 140px;">Guest Name:</td><td style="padding: 10px 0;">${name || 'N/A'}</td></tr>
          <tr><td style="padding: 10px 0; font-weight: bold;">Email:</td><td style="padding: 10px 0;">${email || 'N/A'}</td></tr>
          <tr><td style="padding: 10px 0; font-weight: bold;">Phone:</td><td style="padding: 10px 0;">${phone || 'N/A'}</td></tr>
          <tr><td style="padding: 10px 0; font-weight: bold;">Room Type:</td><td style="padding: 10px 0; color: #c5a37f; font-weight: bold;">${roomType || 'N/A'}</td></tr>
          <tr><td style="padding: 10px 0; font-weight: bold;">Check-In:</td><td style="padding: 10px 0;">${checkInStr}</td></tr>
          <tr><td style="padding: 10px 0; font-weight: bold;">Check-Out:</td><td style="padding: 10px 0;">${checkOutStr}</td></tr>
        </table>
        <div style="margin-top: 30px; padding: 20px; background-color: #f8f7f5; border-radius: 8px;">
          <h3 style="margin-top: 0; font-size: 14px; text-transform: uppercase;">Message:</h3>
          <p style="margin-bottom: 0; font-style: italic;">"${message || 'No special requests.'}"</p>
        </div>
      </div>
    </div>
  `;
}

module.exports = bookingAdminNotificationTemplate;
