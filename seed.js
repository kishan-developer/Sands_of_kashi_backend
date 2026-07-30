const mongoose = require("mongoose");
const Room = require("./model/Room.model");
const dotenv = require("dotenv");

dotenv.config();

const rooms = [
  {
    title: "Standard Room",
    description: "A cozy standard room with essential amenities.",
    maxGuests: 3,
    price: 3500,
    images: ["/DSC_0262.JPG"],
    amenities: ["1 King Bed", "1 Bathroom", "130 sq.ft"],
    roomType: "Deluxe",
  },
  {
    title: "Executive Room",
    description: "Spacious executive room for a comfortable stay.",
    maxGuests: 3,
    price: 4500,
    images: ["/DSC_0282.JPG"],
    amenities: ["1 King Bed", "1 Bathroom", "200 sq.ft"],
    roomType: "Premium Balcony",
  },
  {
    title: "Royal Suite Room",
    description: "Luxury at its finest with our Royal Suite.",
    maxGuests: 3,
    price: 5500,
    images: ["/DSC_0222.JPG"],
    amenities: ["1 King Bed", "1 Bathroom", "282 sq.ft"],
    roomType: "Family Suite",
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
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
