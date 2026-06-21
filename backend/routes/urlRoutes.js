const express = require("express");
const { nanoid } = require("nanoid");
const Url = require("../models/Url");

const router = express.Router();

// Validate URL format
const isValidUrl = (urlString) => {
  try {
    // Check URL length (max 2048 characters - standard for most browsers)
    if (!urlString || urlString.length > 2048) {
      return false;
    }

    const url = new URL(urlString);
    
    // Check for valid protocol
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return false;
    }
    
    // Check if hostname exists and is valid
    if (!url.hostname || url.hostname.length === 0 || url.hostname.length > 253) {
      return false;
    }
    
    // Check for valid domain format
    const hostname = url.hostname;
    
    // Check if hostname has at least one dot (domain.com format)
    if (!hostname.includes(".")) {
      return false;
    }
    
    // Check if hostname has valid characters
    if (!/^[a-z0-9.-]+$/i.test(hostname)) {
      return false;
    }
    
    // Check if it ends with a valid TLD (at least 2 characters after last dot)
    const parts = hostname.split(".");
    const tld = parts[parts.length - 1];
    if (tld.length < 2 || /[0-9]/.test(tld)) {
      return false;
    }

    // Block suspicious URLs
    const suspiciousPatterns = [
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /about:/i,
    ];
    if (suspiciousPatterns.some(pattern => pattern.test(urlString))) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

// Create short URL
router.post("/shorten", async (req, res) => {
  try {
    const { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({
        message: "URL is required",
      });
    }

    // Validate URL format
    if (!isValidUrl(originalUrl)) {
      return res.status(400).json({
        message: "Please enter a valid URL (e.g., https://example.com)",
      });
    }

    // Check if URL already exists
    const existingUrl = await Url.findOne({ originalUrl });
    if (existingUrl) {
      return res.status(200).json({
        shortUrl: `${process.env.BASE_URL}/${existingUrl.shortCode}`,
        message: "This URL was already shortened",
      });
    }

    const shortCode = nanoid(6);

    const newUrl = new Url({
      originalUrl,
      shortCode,
    });

    await newUrl.save();

    res.status(201).json({
      shortUrl: `${process.env.BASE_URL}/${shortCode}`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server Error",
    });
  }
});

// Redirect to original URL
router.get("/:code", async (req, res) => {
  try {
    const url = await Url.findOne({
      shortCode: req.params.code,
    });

    if (!url) {
      return res.status(404).send("URL not found");
    }

    res.redirect(url.originalUrl);
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;