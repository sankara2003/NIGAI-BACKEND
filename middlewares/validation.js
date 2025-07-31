const validator = require('validator');

// Middleware to validate registration inputs
const validateRegistration = (req, res, next) => {
  const { name, mobile, email } = req.body;

  // Check if name is provided and not empty
  if (!name || name.trim() === "") {
    return res.status(400).json({ message: "Name is required" });
  }

  // Validate mobile number (should be exactly 10 digits)
  if (!mobile || !/^\d{10}$/.test(mobile)) {
    return res.status(400).json({ message: "Mobile number should be exactly 10 digits" });
  }

  // Validate email format
  if (!email || !validator.isEmail(email)) {
    return res.status(400).json({ message: "Invalid email address" });
  }

  next(); // Proceed to the next middleware or route handler
};

// Middleware to validate login inputs
const validateLogin = (req, res, next) => {
  const { mobile } = req.body;

  // Validate mobile number (should be exactly 10 digits)
  if (!mobile || !/^\d{10}$/.test(mobile)) {
    return res.status(400).json({ message: "Mobile number should be exactly 10 digits" });
  }

  next(); // Proceed to the next middleware or route handler
};

module.exports = { validateRegistration, validateLogin };
