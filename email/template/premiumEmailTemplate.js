/**
 * Premium Email Template Generator for Sands of Kashi
 * Creates professional, branded email templates with logo and modern design
 */

const getPremiumEmailTemplate = (content, title) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          padding: 40px 30px;
          text-align: center;
          border-bottom: 4px solid #c5a059;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          letter-spacing: 3px;
          color: #c5a059;
          margin-bottom: 8px;
          text-transform: uppercase;
        }
        .tagline {
          font-size: 12px;
          color: #ffffff;
          letter-spacing: 2px;
          text-transform: uppercase;
          opacity: 0.9;
        }
        .content {
          padding: 40px 30px;
          color: #333333;
          line-height: 1.6;
        }
        .content h2 {
          color: #1a1a1a;
          font-size: 24px;
          margin-top: 0;
          margin-bottom: 20px;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 15px;
        }
        .content h3 {
          color: #c5a059;
          font-size: 18px;
          margin-top: 25px;
          margin-bottom: 15px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .info-box {
          background-color: #f8f7f5;
          border-left: 4px solid #c5a059;
          padding: 20px;
          margin: 25px 0;
          border-radius: 4px;
        }
        .info-box table {
          width: 100%;
          border-collapse: collapse;
        }
        .info-box td {
          padding: 8px 0;
          border-bottom: 1px solid #e8e8e8;
        }
        .info-box td:last-child {
          border-bottom: none;
        }
        .info-box td:first-child {
          font-weight: bold;
          color: #1a1a1a;
          width: 140px;
        }
        .button {
          display: inline-block;
          background-color: #c5a059;
          color: #ffffff;
          padding: 14px 32px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 20px;
          transition: background-color 0.3s;
        }
        .button:hover {
          background-color: #b08d4a;
        }
        .footer {
          background-color: #1a1a1a;
          padding: 30px;
          text-align: center;
          color: #888888;
          font-size: 12px;
        }
        .footer p {
          margin: 5px 0;
        }
        .footer a {
          color: #c5a059;
          text-decoration: none;
        }
        .social-links {
          margin-top: 15px;
        }
        .social-links a {
          display: inline-block;
          margin: 0 8px;
          color: #c5a059;
          text-decoration: none;
        }
        @media only screen and (max-width: 600px) {
          .email-container {
            width: 100%;
            border-radius: 0;
          }
          .header {
            padding: 30px 20px;
          }
          .content {
            padding: 30px 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo">Sands of Kashi</div>
          <div class="tagline">By Coral Group • Varanasi</div>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>Sands Of Kashi By Coral Group</p>
          <p>P.S, Gulab Bhag Colony, Hotel Sands, opp. Sigra, Varanasi, Uttar Pradesh 221002</p>
          <p>Phone: <a href="tel:+917522801563">+91-7522801563</a></p>
          <p>Email: <a href="mailto:info@sandsofkashi.in">info@sandsofkashi.in</a></p>
          <div class="social-links">
            <a href="#">Instagram</a> • <a href="#">Facebook</a> • <a href="#">Website</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = { getPremiumEmailTemplate };
