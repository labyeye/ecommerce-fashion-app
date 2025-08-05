const express = require('express');
const { optionalAuth } = require('../middleware/auth');
const Product = require('../models/Product');

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

    const skip = (page - 1) * limit;

    // Build query - only active products
    let query = { status: 'active' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (minPrice > 0 || maxPrice < 999999) {
      query.price = { $gte: minPrice, $lte: maxPrice };
    }

    if (featured) {
      query.isFeatured = true;
    }

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    const products = await Product.find(query)
      .populate('category', 'name')
      .sort(sortObj)
      .skip(skip)
      .limit(limit);
      const transformedProducts = products.map(product => {
        const prices = {};
        // Get prices from variants if they exist
        if (product.variants && product.variants.length > 0 && product.variants[0].prices) {
          product.variants[0].prices.forEach(priceObj => {
            prices[priceObj.size] = priceObj.price;
          });
        } else {
          // Fallback to single price if no variants
          prices[1] = product.price;
        }
      
        return {
          ...product.toObject(),
          prices
        };
      });
    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        products: transformedProducts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products'
    });
  }
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;

    const products = await Product.find({
      status: 'active',
      isFeatured: true
    })
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured products'
    });
  }
});

// @desc    Get best sellers
// @route   GET /api/products/bestsellers
// @access  Public
router.get('/bestsellers', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;

    const products = await Product.find({
      status: 'active',
      isBestSeller: true
    })
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Get best sellers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching best sellers'
    });
  }
});

// @desc    Get product by ID (public)
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      status: 'active'
    }).populate('category', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const prices = {};
    if (product.variants && product.variants.length > 0 && product.variants[0].prices) {
      product.variants[0].prices.forEach(priceObj => {
        prices[priceObj.size] = priceObj.price;
      });
    } else {
      prices[1] = product.price;
    }
    const transformedProduct = {
      ...product.toObject(),
      prices
    }; const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      status: 'active'
    })
      .populate('category', 'name')
      .limit(4); const transformedRelated = relatedProducts.map(p => {
        const relPrices = {};
        if (p.variants && p.variants.length > 0 && p.variants[0].prices) {
          p.variants[0].prices.forEach(priceObj => {
            relPrices[priceObj.size] = priceObj.price;
          });
        } else {
          relPrices[1] = p.price;
        }
        return {
          ...p.toObject(),
          prices: relPrices
        };
      });

    res.status(200).json({
      success: true,
      data: {
        product: transformedProduct,
        relatedProducts: transformedRelated
      }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product'
    });
  }
});

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q: query, limit = 10 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const products = await Product.find({
      status: 'active',
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    })
      .populate('category', 'name')
      .limit(parseInt(limit))
      .select('name price images category');

    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching products'
    });
  }
});

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    // For now, return a static list of categories
    // In a real app, you would have a Category model
    const categories = [
      { _id: '1', name: 'Electronics', slug: 'electronics' },
      { _id: '2', name: 'Clothing', slug: 'clothing' },
      { _id: '3', name: 'Home & Garden', slug: 'home-garden' },
      { _id: '4', name: 'Sports', slug: 'sports' },
      { _id: '5', name: 'Books', slug: 'books' },
      { _id: '6', name: 'Health & Beauty', slug: 'health-beauty' }
    ];

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
});

// @desc    Get products by category
// @route   GET /api/products/category/:categoryId
// @access  Public
router.get('/category/:categoryId', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const sort = req.query.sort || 'createdAt';
    const order = req.query.order || 'desc';

    const skip = (page - 1) * limit;

    const products = await Product.find({
      category: req.params.categoryId,
      status: 'active'
    })
      .populate('category', 'name')
      .sort({ [sort]: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments({
      category: req.params.categoryId,
      status: 'active'
    });

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products by category'
    });
  }
});

module.exports = router; 