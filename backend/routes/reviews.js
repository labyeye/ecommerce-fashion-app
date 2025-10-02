const express = require('express');
const Review = require('../models/Review');

const router = express.Router();

// @route GET /api/reviews
// @desc  Get recent approved reviews
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const reviews = await Review.find({ approved: true }).sort({ createdAt: -1 }).limit(limit);
    res.status(200).json({ success: true, data: reviews });
  } catch (err) {
    console.error('Get reviews error:', err);
    res.status(500).json({ success: false, message: 'Error fetching reviews' });
  }
});

// @route POST /api/reviews
// @desc  Submit a new review
router.post('/', async (req, res) => {
  try {
    const { name, email, rating, message } = req.body;
    if (!name || !email || !rating || !message) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const review = new Review({ name, email, rating, message, approved: true });
    await review.save();

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    console.error('Create review error:', err);
    res.status(500).json({ success: false, message: 'Error creating review' });
  }
});

module.exports = router;
