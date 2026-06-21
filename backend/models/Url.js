const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: true,
      maxlength: 2048, // Max URL length
      trim: true,
      lowercase: false, // URLs are case-sensitive
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      index: true, // Index for faster lookups
      maxlength: 10,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(+new Date() + 365 * 24 * 60 * 60 * 1000), // 1 year expiry
    },
    clicks: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// TTL index - automatically delete expired URLs after 1 year
urlSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Prevent duplicate URLs within short time period
urlSchema.index({ originalUrl: 1, createdAt: 1 });

module.exports = mongoose.model("Url", urlSchema);