const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
    console.log("📨 Sending Email to:", email);
    console.log("📌 Title:", title);
    console.log("📧 Email User:", process.env.MAIL_USER);
    
    try {
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // Verify connection configuration
        await transporter.verify();
        console.log("✅ SMTP Server connection verified");

        // send mail by using transporter
        let info = await transporter.sendMail({
            from: `"${process.env.APP_NAME || 'Sands of Kashi'}" <${process.env.MAIL_USER}>`,
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`,
        });
        
        console.log("✅ Email sent successfully:", info.messageId);
        return info;
    } catch (error) {
        console.log("❌ Error From Mail Sender - >", error.message);
        console.log("❌ Full Error:", error);
        throw new Error(`Failed to send verification email: ${error.message}`);
    }
};

module.exports = mailSender;
