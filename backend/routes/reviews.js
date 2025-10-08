const express = require('express');
const Review = require('../models/Review');

const router = express.Router();
const { protect } = require('../middleware/auth');
const Order = require('../models/Order');

// @route GET /api/reviews
// @desc  Get recent approved reviews
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const productId = req.query.productId;

    const filter = { approved: true };
    if (productId) {
      // Only return reviews for the specified product
      filter.product = productId;
    }

    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'firstName lastName email');

    res.status(200).json({ success: true, data: reviews });
  } catch (err) {
    console.error('Get reviews error:', err);
    res.status(500).json({ success: false, message: 'Error fetching reviews' });
  }
});

// @route POST /api/reviews
// @desc  Submit a new review
// Product reviews: only authenticated customers who bought the product may post
router.post('/', protect, async (req, res) => {
  try {
    const { productId, rating, message } = req.body;

    if (!productId || !rating || !message) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Verify user has at least one paid order containing the product
    const userId = req.user._id;

    const matchingOrder = await Order.findOne({
      customer: userId,
      'items.product': productId,
      'payment.status': 'paid'
    }).lean();

    if (!matchingOrder) {
      // Try a looser check: any order status that indicates fulfillment
      const altOrder = await Order.findOne({
        customer: userId,
        'items.product': productId,
        status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] }
      }).lean();

      if (!altOrder) {
        return res.status(403).json({ success: false, message: 'You can only review products you have purchased.' });
      }
    }

    const review = new Review({ user: userId, product: productId, rating, message, approved: true });
    await review.save();

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    console.error('Create review error:', err);
    res.status(500).json({ success: false, message: 'Error creating review' });
  }
});

module.exports = router;
