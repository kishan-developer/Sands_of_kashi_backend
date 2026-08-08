const express = require("express");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const path = require("path");
const dotenv = require("dotenv");
const ratelimit = require("./middleware/rateLimit.middleware");
const notFound = require("./middleware/notFound.middleware");
const sendCustomResponse = require("./middleware/customResponse.middleware");
const connectDB = require("./config/connectDb");
const { globalErrorHandler } = require("./middleware/globalErrorHandler.middleware");
const router = require("./routes/index.routes");

dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize app
const app = express();

/* -------------------- CORS FIX (Express 5 Compatible) -------------------- */
const allowedOrigins = [
  "https://www.sandsofkashi.com"
];


app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Preflight Request is handled by the cors() middleware above.

/* -------------------- Other Middlewares -------------------- */

app.use(compression());
app.use(cookieParser());
app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// File upload
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// Custom response handler
app.use(sendCustomResponse);

// API routes
app.use("/api/v1", router);

// Default route
app.get("/", (req, res) => {
  res.send("Sands Of Kashi APIs Live ");
});

// Dymmy Users data 

app.get("/users", (req, res) => {
  res.json([
    {
    "name":"User 1",
    "role": "FrontEnd Developer"
  },{
    "name":"User 2",
    "role": "BackEnd Developer"
  },
  {
    "name":"User 3",
    "role": "Site Incharge"
  },
  {
    "name":"User 3",
    "role": "Social Media Manager"
  }
  ])
})

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 404 handler
app.use(notFound);

// Global error handler
app.use(globalErrorHandler);

/* -------------------- Server Start -------------------- */

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});







