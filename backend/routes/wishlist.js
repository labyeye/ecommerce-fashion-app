const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const {protect} = require('../middleware/auth');

// Get user's wishlist
router.get('/', protect, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
    res.json({ success: true, wishlist: wishlist ? wishlist.products : [] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching wishlist' });
  }
});

// Add product to wishlist
router.post('/add', protect, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: 'Product ID required' });
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) wishlist = new Wishlist({ user: req.user._id, products: [] });
    if (!wishlist.products.includes(productId)) wishlist.products.push(productId);
    await wishlist.save();
    res.json({ success: true, message: 'Product added to wishlist' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error adding to wishlist' });
  }
});

// Remove product from wishlist
router.post('/remove', protect, async (req, res) => {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) return res.status(404).json({ success: false, message: 'Wishlist not found' });
    wishlist.products = wishlist.products.filter(p => p.toString() !== productId);
    await wishlist.save();
    res.json({ success: true, message: 'Product removed from wishlist' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error removing from wishlist' });
  }
});

module.exports = router;
