function bookingConfirmationTemplate({ name, email, phone, roomType, checkIn, checkOut, message }) {
  const checkInStr = checkIn ? new Date(checkIn).toLocaleDateString() : "N/A";
  const checkOutStr = checkOut ? new Date(checkOut).toLocaleDateString() : "N/A";

  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
      <div style="background-color: #1a1a1a; color: #c5a37f; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px;">THANK YOU</h1>
        <p style="margin: 5px 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Your Booking is under review</p>
      </div>
      <div style="padding: 40px; background-color: #ffffff;">
        <p style="color: #666; font-size: 16px;">Dear <strong>${name || 'Guest'}</strong>,</p>
        <p style="color: #666; line-height: 1.6;">Thank you for choosing <strong>Sands of Kashi</strong>. We have received your booking request for a <strong>${roomType || 'Room'}</strong> and our team will get in touch with you shortly to confirm the details.</p>
        
        <div style="margin: 20px 0; padding: 20px; border: 1px dashed #c5a37f; border-radius: 8px;">
          <p style="margin: 0; font-size: 14px;"><strong>Your Dates:</strong></p>
          <p style="margin: 5px 0; font-size: 18px; color: #1a1a1a;">${checkInStr} — ${checkOutStr}</p>
        </div>
        
        <p style="color: #666; font-size: 14px;">If you have any urgent questions, please feel free to call us at <a href="tel:+917522801564" style="color: #c5a37f; text-decoration: none;">+91-7522801564</a>.</p>
      </div>
      <div style="background-color: #f8f7f5; padding: 20px; text-align: center; color: #888; font-size: 12px;">
        <p style="margin: 0;">Sands Of Kashi By Coral Group, Varanasi</p>
        <p style="margin: 5px 0;">Looking forward to welcoming you!</p>
      </div>
    </div>
  `;
}

module.exports = bookingConfirmationTemplate;
