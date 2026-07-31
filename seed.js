const mongoose = require("mongoose");
const Room = require("./model/Room.model");
const dotenv = require("dotenv");

dotenv.config();

const rooms = [
  {
    title: "Standard Room",
    description: "Our elegantly appointed rooms and suites are designed to offer the utmost in comfort and style. Each room features modern amenities, plush furnishings, and thoughtful touches to ensure a relaxing stay. Whether you are here for business or leisure, our Standard Room provides the perfect sanctuary.",
    maxGuests: 3,
    price: 3500,
    size: "130 sq.ft (12 sq.mt)",
    images: ["/hotel/DSC_0253.JPG", "/hotel/DSC_0254.JPG", "/hotel/DSC_0272.JPG"],
    amenities: ["Free Wifi", "Shower", "Airport transport", "Balcony", "Refrigerator", "24/7 Support", "Work Desk", "Fitness Center", "Swimming Pool"],
    features: ["Children and extra beds", "Climate Control", "Art and Decor", "Coffee/Tea Maker", "High-End Bedding", "Smart Technology"],
    roomType: "Deluxe",
  },
  {
    title: "Executive Room",
    description: "Our elegantly appointed rooms and suites are designed to offer the utmost in comfort and style. Each room features modern amenities, plush furnishings, and thoughtful touches to ensure a relaxing stay. Whether you are here for business or leisure, our Executive Room provides the perfect sanctuary.",
    maxGuests: 3,
    price: 4500,
    size: "200 sq.ft (19 sq.mt)",
    images: ["/hotel/DSC_0273.JPG", "/hotel/DSC_0283.JPG", "/hotel/DSC_0279.JPG"],
    amenities: ["Free Wifi", "Shower", "Airport transport", "Balcony", "Refrigerator", "24/7 Support", "Work Desk", "Fitness Center", "Swimming Pool"],
    features: ["1 King Bed", "Max 3 Guests"],
    roomType: "Premium Balcony",
  },
  {
    title: "Royal Suite Room",
    description: "Experience true comfort in our Royal Suite Room, designed for guests who want a special and relaxing stay. This spacious suite combines a clean modern look with elegant details. It includes comfortable furniture, beautiful interiors, and premium amenities to make your stay enjoyable.",
    maxGuests: 3,
    price: 5500,
    size: "282 sq.ft (26 sq.mt)",
    images: ["/hotel/DSC_0246.JPG", "/hotel/DSC_0248.JPG", "/hotel/DSC_0221.JPG"],
    amenities: ["Free Wifi", "Shower", "Airport transport", "Balcony", "Refrigerator", "24/7 Support", "Work Desk", "Fitness Center", "Swimming Pool"],
    features: ["Children and extra beds", "Climate Control", "Art and Decor", "Coffee/Tea Maker", "High-End Bedding", "Smart Technology"],
    roomType: "Family Suite",
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected for seeding...");
    
    await Room.deleteMany();
    await Room.insertMany(rooms);
    
    console.log("Rooms seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();
