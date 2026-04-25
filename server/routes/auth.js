const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// POST: /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // 2. Create new user (Password hashing is handled automatically by the Model)
    user = new User({ email, password });
    await user.save();

    // 3. Generate JWT Token
    // We'll use a placeholder secret if you haven't set up a .env file yet
    const payload = { userId: user._id };
    const token = jwt.sign(
      payload, 
      process.env.JWT_SECRET || 'super_secret_fallback_key', 
      { expiresIn: '7d' } // Token lasts for 7 days
    );

    // 4. Send response
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user._id, email: user.email, isPro: user.isPro }
    });

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

module.exports = router;