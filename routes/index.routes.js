const express = require("express");

// routes
const authRoutes = require("../routes/auth.routes");
const adminRoutes = require("../routes/admin/index.routes");
const hotelRoutes = require("../routes/hotel/index.routes")
const guestRoutes = require("./guest/index.routes");
const paymentRoutes = require("./payment.routes");
const bookingRoutes = require("./booking.routes");
const restaurantRoutes = require("./restaurant.routes");

// models
const Room = require("../model/Room.model");
const Newsletter = require("../model/Newsletter.model");
const Contact = require("../model/Contact.model");

// utils
const imageUploader = require("../utils/imageUploader.utils");
const mailSender = require("../utils/mailSender.utils");

// email templates
const contactEmailTemplate = require("../email/template/contactEmailTemplate");
const { handleChatRequest } = require("../controller/chat.controller");

const router = express.Router();

// route define
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/hotel", hotelRoutes)
router.use("/guest", guestRoutes);
router.use("/payment", paymentRoutes);
router.use("/bookings", bookingRoutes);
router.use("/restaurant", restaurantRoutes);
router.post("/chat", handleChatRequest);

const rooms = [
  {
    _id: "room_1",
    title: "Standard Room",
    description: "Our elegantly appointed rooms and suites are designed to offer the utmost in comfort and style. Each room features modern amenities, plush furnishings, and thoughtful touches to ensure a relaxing stay. Whether you are here for business or leisure, our Standard Room provides the perfect sanctuary.",
    maxGuests: 3,
    price: 3500,
    size: "130 sq.ft (12 sq.mt)",
    images: [
      "https://res.cloudinary.com/drmpv5vne/image/upload/v1785485224/DSC_0253_c9jkuq.jpg",
      "https://res.cloudinary.com/drmpv5vne/image/upload/v1785485217/DSC_0254_nvdmsq.jpg",
      "https://res.cloudinary.com/drmpv5vne/image/upload/v1785485215/DSC_0272_v7m6xq.jpg"
    ],
    amenities: ["Free Wifi", "Free Parking", "Airport transport", "Breakfast Free", "24/7 Support", "Work Desk", "Air conditioning"],
    features: ["Children and extra beds", "Climate Control", "Art and Decor", "Coffee/Tea Maker", "High-End Bedding", "Smart Technology"],
    roomType: "Deluxe",
  },
  {
    _id: "room_2",
    title: "Executive Room",
    description: "Our elegantly appointed rooms and suites are designed to offer the utmost in comfort and style. Each room features modern amenities, plush furnishings, and thoughtful touches to ensure a relaxing stay. Whether you are here for business or leisure, our Executive Room provides the perfect sanctuary.",
    maxGuests: 3,
    price: 4500,
    size: "200 sq.ft (19 sq.mt)",
    images: [
      "https://res.cloudinary.com/drmpv5vne/image/upload/v1785485505/DSC_0273_rntxb7.jpg",
      "https://res.cloudinary.com/drmpv5vne/image/upload/v1785485499/DSC_0279_iqh4d2.jpg"
    ],
    amenities: ["Free Wifi", "Free Parking", "Airport transport", "Breakfast Free", "24/7 Support", "Work Desk", "Air conditioning"],
    features: ["1 King Bed", "Max 3 Guests"],
    roomType: "Premium Balcony",
  },
  {
    _id: "room_3",
    title: "Royal Suite Room",
    description: "Experience true comfort in our Royal Suite Room, designed for guests who want a special and relaxing stay. This spacious suite combines a clean modern look with elegant details. It includes comfortable furniture, beautiful interiors, and premium amenities to make your stay enjoyable.",
    maxGuests: 3,
    price: 5500,
    size: "282 sq.ft (26 sq.mt)",
    images: [
      "https://res.cloudinary.com/drmpv5vne/image/upload/v1785485636/DSC_0221_nyzxox.jpg"
    ],
    amenities: ["Free Wifi", "Free Parking", "Airport transport", "Breakfast Free", "24/7 Support", "Work Desk", "Air conditioning"],
    features: ["Children and extra beds", "Climate Control", "Art and Decor", "Coffee/Tea Maker", "High-End Bedding", "Smart Technology"],
    roomType: "Family Suite",
  }
];
// public room routes 
/* -------------------------------------------------------
   PUBLIC — GET ALL ROOM
-------------------------------------------------------- */
router.get("/rooms", async (req, res) => {
  try {
    let roomsData = await Room.find().lean();

    if (!roomsData || roomsData.length === 0) {
      roomsData = rooms;
    }

    return res.success("Rooms fetched successfully", roomsData);
  } catch (error) {
    return res.error(error.message, 500);
  }
});

/* -------------------------------------------------------
   PUBLIC — SEED DEFAULT ROOMS
-------------------------------------------------------- */
router.post("/rooms/seed", async (req, res) => {
  try {
    await Room.deleteMany({});
    const seeded = await Room.insertMany(rooms);
    return res.success("Rooms seeded successfully", seeded);
  } catch (error) {
    return res.error(error.message, 500);
  }
});

/* -------------------------------------------------------
   PUBLIC — GET SINGLE ROOM
-------------------------------------------------------- */
router.get("/rooms/:_id", async (req, res) => {
  try {
    const room = await Room.findById(req.params._id);
    if (!room) return res.error("Room not found", 404);
    
    return res.success("Successfully get rooms details", room);
  } catch (error) {
    return res.error(error.message, 500);
  }
})

router.post("/upload", async (req, res) => {
    try {
        const images = req.files?.files;

        if (!images) {
            return res.status(400).json({
                success: false,
                message: "Please upload at least one image",
            });
        }

        // Normalize to array
        const imageList = Array.isArray(images) ? images : [images];

        // File size check
        // for (const image of imageList) {
        //     if (image.size > 100 * 1024 * 1024) {
        //         return res.status(400).json({
        //             success: false,
        //             message: `Image "${image.name}" should not be larger than 100MB`,
        //         });
        //     }
        // }

        // Use first file's name for slug creation
        const firstFileName = imageList[0].name;
        const slugFileName = firstFileName
            .trim()
            .replace(/\s+/g, "-")
            .replace(/\.[^/.]+$/, ""); // remove extension

        // Upload images to S3 and get URLs
        const uploadedUrls = await imageUploader(imageList, slugFileName);

        // uploadedUrls is now an array of URLs like [url1, url2]
        return res.success("Images uploaded successfully", uploadedUrls);
    } catch (err) {
        console.error("Upload error:", err);
        return res.error(err.message, 500);
    }
});

router.post("/bookVideoCall", async (req, res) => {
    const { email, body } = req.body;

    if (!body) {
        // Use res.status() and res.json() for error responses
        return res.status(400).json({
            success: false,
            message: "All fields are required.",
        });
    }

    try {
        const usertemplate = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd;">
                <h2 style="color: #333;">Video Call Booking Confirmed</h2>
                <p>Hi ${body?.fullName || 'User'},</p>
                <p>Your video call has been scheduled for:</p>
                <p><strong>Date:</strong> ${body?.date || 'N/A'}</p>
                <p><strong>Time:</strong> ${body?.time || 'N/A'}</p>
                <p>We look forward to speaking with you!</p>
                <p>Regards,<br/>Sands Of Kashi Team</p>
            </div>
        `;
        
        const admintemplate = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd;">
                <h2 style="color: #333;">New Video Call Booking</h2>
                <p>A new video call has been booked:</p>
                <p><strong>Name:</strong> ${body?.fullName || 'N/A'}</p>
                <p><strong>Email:</strong> ${body?.email || 'N/A'}</p>
                <p><strong>Phone:</strong> ${body?.phone || 'N/A'}</p>
                <p><strong>Date:</strong> ${body?.date || 'N/A'}</p>
                <p><strong>Time:</strong> ${body?.time || 'N/A'}</p>
                <p>Please review and confirm the booking.</p>
            </div>
        `;

        // Renamed 'res' variable to avoid conflict with the Express 'res' object
        const userMailResponse = await mailSender(
            email,
            "Video Call Book, Confirmation",
            usertemplate
        ); // send to user

        const adminMailResponse = await mailSender(
            process.env.ADMIN_EMAIL || "info@sandsofkashi.com",
            "New Video Call Book",
            admintemplate
        ); // send to Admin

        // Use res.status() and res.json() for success responses
        return res.status(200).json({
            success: true,
            message: "Video Call Booked Successfully",
            data: { userMailResponse, adminMailResponse },
        });
    } catch (error) {
        console.log(error);
        // Use res.status() and res.json() for error responses
        return res.status(500).json({
            success: false,
            message: "Failed to book video call",
        });
    }
});

router.post("/newsletter", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.error("Please enter a valid email address", 400);
    }

    try {
        const exists = await Newsletter.findOne({ email });

        if (exists) {
            return res.error(
                "You are already subscribed to the newsletter.",
                409
            );
        }

        await Newsletter.create({ email });

        return res.success("Successfully subscribed to the newsletter!");
    } catch (err) {
        console.error("Newsletter Error:", err);
        return res.error("Something went wrong. Please try again later.", 500);
    }
});

// POST /api/contact
router.post("/contact", async (req, res) => {
    const { name, email, phone, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        // Store contact form data in database
        const contact = await Contact.create({
            name,
            email,
            phone,
            subject,
            message,
            status: "pending",
        });

        const htmlBody = contactEmailTemplate({
            name,
            email,
            phone,
            subject,
            message,
        });

        // Send mail to admin
        await mailSender(
            process.env.ADMIN_EMAIL || "info@sandsofkashi.in",
            `Contact Us: ${subject}`,
            htmlBody
        );

        // Send a confirmation to user
        const userBody = `
      Hi ${name},<br/><br/>
      Thanks for reaching out! We've received your message and will get back to you shortly.<br/><br/>
      Regards,<br/>Sands Of Kashi Team
    `;
        await mailSender(email, "We received your message!", userBody);

        return res.json({
            success: true,
            message: "Message sent successfully.",
            data: contact,
        });
    } catch (err) {
        console.error("Contact POST error:", err);
        return res.status(500).json({ error: "Failed to send message." });
    }
});


router.post("/custom-rug-request", async (req, res) => {
    // Destructure all expected fields from the form data
    const {
        name,
        email,
        phone,
        sizePreference,
        customWidth,
        customLength,
        material, // This will be an array of selected materials
        colorPalette,
        shape,
        designStyle,
        designDescription,
    } = req.body;

    // --- Basic Validation ---
    // Validate required fields that were set in MakeYourOwnRugsPage
    if (!name || !email || !sizePreference || !colorPalette || !designStyle || !designDescription || !shape) {
        return res.status(400).json({ error: "Missing required client or customization fields." });
    }

    // Validate material array is not empty
    if (!material || material.length === 0) {
        return res.status(400).json({ error: "Please select at least one material preference." });
    }

    // Conditional validation for custom dimensions
    if (sizePreference === 'custom') {
        if (!customWidth || !customLength) {
            return res.status(400).json({ error: "Custom width and length are required for custom size preference." });
        }
    }

    try {
        // --- Send mail to Admin ---
        const adminHtmlBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd;">
                <h2 style="color: #333;">New Custom Rug Request</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Size Preference:</strong> ${sizePreference}</p>
                ${sizePreference === 'custom' ? `<p><strong>Custom Dimensions:</strong> ${customWidth} x ${customLength}</p>` : ''}
                <p><strong>Material:</strong> ${Array.isArray(material) ? material.join(', ') : material}</p>
                <p><strong>Color Palette:</strong> ${colorPalette}</p>
                <p><strong>Shape:</strong> ${shape}</p>
                <p><strong>Design Style:</strong> ${designStyle}</p>
                <p><strong>Design Description:</strong> ${designDescription}</p>
                <p>Please review this custom rug request and contact the customer.</p>
            </div>
        `;

        await mailSender(
            process.env.ADMIN_EMAIL || "info@sandsofkashi.com",
            `New Custom Rug Request from ${name}`,
            adminHtmlBody
        );

        // --- Send a confirmation to the User ---
        const userConfirmationBody = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Custom Rug Request Confirmation</title>
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                    h2 { color: #850E4B; font-size: 24px; margin-bottom: 20px; text-align: center; }
                    p { color: #333; line-height: 1.6; margin-bottom: 15px; }
                    strong { color: #850E4B; }
                    .footer { font-size: 12px; color: #777; margin-top: 30px; text-align: center; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Thank You For Your Custom Rug Request!</h2>
                    <p>Hi <strong>${name}</strong>,</p>
                    <p>We've successfully received your custom rug design request. Our team is excited to review your ideas and will get back to you shortly to discuss the next steps.</p>
                    <p>We appreciate your patience as we meticulously craft bespoke solutions tailored just for you.</p>
                    <p>Regards,<br/>The Sands Of Kashi Team</p>
                    <div class="footer">
                        This is an automated message from Sands Of Kashi.
                    </div>
                </div>
            </body>
            </html>
        `;
        await mailSender(
            email, // User's email address
            "Sands Of Kashi: Your Custom Rug Request Confirmation",
            userConfirmationBody
        );

        return res.json({
            success: true,
            message: "Custom rug request submitted successfully. We've sent a confirmation email.",
        });
    } catch (err) {
        console.error("Custom Rug Request API Error:", err);
        return res.status(500).json({ error: "Failed to submit custom rug request. Please try again." });
    }
});

module.exports = router;

