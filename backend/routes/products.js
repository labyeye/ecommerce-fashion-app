const express = require('express');
const { optionalAuth } = require('../middleware/auth');
const Product = require('../models/Product');
const Category = require('../models/Category');
const mongoose = require('mongoose');

const router = express.Router();

// Apply optional authentication to all routes
router.use(optionalAuth);

// @desc    Get all active products (public)
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const minPrice = parseFloat(req.query.minPrice) || 0;
    const maxPrice = parseFloat(req.query.maxPrice) || 999999;
    const sort = req.query.sort || 'createdAt';
    const order = req.query.order || 'desc';
    const featured = req.query.featured === 'true';
    const isNewArrival = req.query.isNewArrival === 'true';
    const isBestSeller = req.query.isBestSeller === 'true';
    const isComingSoon = req.query.isComingSoon === 'true';

    const skip = (page - 1) * limit;

    // Build query - only active products
    let query = { status: 'active' };

    if (featured) {
      query.isFeatured = true;
    }
    if (isNewArrival) {
      query.isNewArrival = true;
    }
    if (isBestSeller) {
      query.isBestSeller = true;
    }
    if (isComingSoon) {
      query.isComingSoon = true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.category = category;
      } else {
        const categoryDoc = await Category.findOne({ slug: category });
        if (categoryDoc) {
          query.category = categoryDoc._id;
        }
      }
    }

    query.price = { $gte: minPrice, $lte: maxPrice };

    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    const products = await Product.find(query)
      .populate('category', 'name isNewArrival')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    // Transform products to include prices
    const transformedProducts = products.map(product => {
      const prices = {};
      if (product.sizes && product.sizes.length > 0) {
        product.sizes.forEach(size => {
          prices[size.size] = size.price || product.price;
        });
      } else {
        prices.default = product.price;
      }
      return {
        ...product.toObject(),
        prices
      };
    });

    res.status(200).json({
      success: true,
      data: transformedProducts
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products'
    });
  }
});

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    // First check if the ID is a special route
    if (req.params.id === 'new-arrivals') {
      const products = await Product.find({
        status: 'active',
        isNewArrival: true
      })
      .populate('category', 'name isNewArrival')
      .sort({ createdAt: -1 })
      .limit(10);

      return res.status(200).json({
        success: true,
        data: products
      });
    }

    if (req.params.id === 'best-sellers') {
      const products = await Product.find({
        status: 'active',
        isBestSeller: true
      })
      .populate('category', 'name isNewArrival')
      .sort({ createdAt: -1 })
      .limit(10);

      return res.status(200).json({
        success: true,
        data: products
      });
    }

    if (req.params.id === 'coming-soon') {
      const products = await Product.find({
        status: 'active',
        isComingSoon: true
      })
      .populate('category', 'name isNewArrival')
      .sort({ createdAt: -1 })
      .limit(10);

      return res.status(200).json({
        success: true,
        data: products
      });
    }

    // If not a special route, validate the ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }

    const product = await Product.findOne({
      _id: req.params.id,
      status: 'active'
    }).populate('category', 'name isNewArrival');


    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Transform product to include prices
    const prices = {};
    if (product.sizes && product.sizes.length > 0) {
      product.sizes.forEach(size => {
        prices[size.size] = size.price || product.price;
      });
    } else {
      prices.default = product.price;
    }

    const transformedProduct = {
      ...product.toObject(),
      prices
    };

    res.status(200).json({
      success: true,
      data: transformedProduct
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product'
    });
  }
});

module.exports = router;
