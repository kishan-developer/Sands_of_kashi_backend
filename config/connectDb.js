require("dotenv").config();
const mongoose = require("mongoose");
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URL;
// console.log("Mongodb_URL",MONGODB_URI);
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGODB_URI);
        // console.log(`MongoDB Connected: ${conn.connection.host}`);
         console.log(`MongoDB Connected `);
    } catch (error) {
        console.error("Error While Connecting Database --->", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
