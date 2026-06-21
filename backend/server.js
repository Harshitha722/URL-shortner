
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();

// Security Middleware
app.use(helmet()); // Set security HTTP headers

// CORS Configuration - Restrict to specific origins
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST"],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Rate limiting - Prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parser with size limit
app.use(express.json({ limit: "1kb" })); // Limit request body size

// Routes
app.use("/", require("./routes/urlRoutes"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

// Debugging
console.log("MONGO_URI:", process.env.MONGO_URI ? "✅ Configured" : "❌ Missing");
console.log("PORT:", process.env.PORT || 5000);
console.log("FRONTEND_URL:", process.env.FRONTEND_URL || "Not configured");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed");
    console.error(err);
  });