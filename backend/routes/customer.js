const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, isCustomer } = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const PromoCode = require('../models/PromoCode');
const { sendOrderCancellationEmail } = require('../utils/emailService');

const router = express.Router();

// Helper function to get loyalty details
const getLoyaltyDetails = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    const nextTierInfo = user.getNextLoyaltyTier();
    
    return {
      points: user.loyaltyPoints,
      evolvPoints: user.evolvPoints,
      tier: user.loyaltyTier,
      nextTier: nextTierInfo.nextTier,
      nextTierPoints: nextTierInfo.pointsNeeded,
      progressToNextTier: nextTierInfo.progress,
      history: user.loyaltyHistory || []
    };
  } catch (error) {
    console.error('Error getting loyalty details:', error);
    return null;
  }
};

// Apply customer protection to all routes
router.use(protect, isCustomer);

router.get('/loyalty', async (req, res) => {
  try {
    const loyaltyDetails = await getLoyaltyDetails(req.user._id);

    if (!loyaltyDetails) {
      return res.status(404).json({
        success: false,
        message: 'Loyalty account not found'
      });
    }

    res.status(200).json({
      success: true,
      data: loyaltyDetails
    });
  } catch (error) {
    console.error('Get loyalty details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching loyalty details'
    });
  }
});
router.get('/dashboard', async (req, res) => {
  try {
    // Get order statistics
    const orderStats = await Order.aggregate([
      { $match: { customer: req.user._id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          totalSpent: { $sum: '$total' },
          pending: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
            }
          },
          delivered: {
            $sum: {
              $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0]
            }
          },
          cancelled: {
            $sum: {
              $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0]
            }
          }
        }
      }
    ]);

    // Get user and recalculate tier
    const user = await User.findById(req.user._id);
    if (user) {
      user.recalculateTier();
      await user.save();
    }

    // Get loyalty details
    const loyaltyDetails = await getLoyaltyDetails(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        orderStats: orderStats[0] || { 
          total: 0, 
          totalSpent: 0,
          pending: 0, 
          delivered: 0, 
          cancelled: 0 
        },
        loyalty: loyaltyDetails
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data'
    });
  }
});
// @desc    Get customer profile
// @route   GET /api/customer/profile
// @access  Customer only
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    // Recalculate tier based on current points
    user.recalculateTier();
    await user.save();
    
    // Get loyalty details
    const loyaltyDetails = await getLoyaltyDetails(req.user._id);
    
    // Combine user data with loyalty details
    const profileData = {
      ...user.toObject(),
      loyalty: loyaltyDetails
    };

    res.status(200).json({
      success: true,
      data: profileData
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
});

// @desc    Update customer profile
// @route   PUT /api/customer/profile
// @access  Customer only
router.put('/profile', [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { firstName, lastName, phone, address } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (address) user.address = address;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
});

// @desc    Get customer orders
// @route   GET /api/customer/orders
// @access  Customer only
router.get('/orders', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || '';

    const skip = (page - 1) * limit;

    // Build query
    let query = { customer: req.user._id };

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
});

// @desc    Get customer order by ID
// @route   GET /api/customer/orders/:id
// @access  Customer only
router.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      customer: req.user._id
    }).populate('items.product', 'name price images description');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order'
    });
  }
});

// @desc    Cancel customer order
// @route   PUT /api/customer/orders/:id/cancel
// @access  Customer only
router.put('/orders/:id/cancel', [
  body('reason')
    .optional()
    .isString()
    .withMessage('Reason must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { reason } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      customer: req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order can be cancelled
    // Only allow cancellation when the order is still in 'pending' (order placed) state.
    // If payment has been confirmed or order progressed, cancellation is not applicable here.
    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    // Update order status
    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancelledBy = req.user._id;
    order.cancellationReason = reason || 'Cancelled by customer';

    // Add timeline entry
    order.timeline.push({
      status: 'cancelled',
      message: reason || 'Cancelled by customer',
      updatedBy: req.user._id
    });

    await order.save();

    // Send cancellation email to customer (do not block on email failures)
    (async () => {
      try {
        const customer = await User.findById(req.user._id);
        if (customer && customer.email) {
          await sendOrderCancellationEmail(customer.email, customer.firstName || '', order.toObject ? order.toObject() : order);
        }
      } catch (emailErr) {
        console.error('Failed to send cancellation email:', emailErr);
      }
    })();

    // Restore product stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      
      if (product && Array.isArray(product.colors) && product.colors.length > 0) {
        // Clothing product - restore specific color/size stock
        await Product.findOneAndUpdate(
          { _id: item.product },
          { $inc: { 'colors.$[c].sizes.$[s].stock': item.quantity } },
          {
            arrayFilters: [ { 'c.name': item.color }, { 's.size': item.size } ]
          }
        );
      } else if (product && product.stock && product.stock.trackStock) {
        // Legacy product - restore general stock
        await Product.findByIdAndUpdate(item.product, {
          $inc: { 'stock.quantity': item.quantity }
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling order'
    });
  }
});

// @desc    Update order status (for delivery confirmation)
// @route   PUT /api/customer/orders/:id/status
// @access  Customer only
router.put('/orders/:id/status', [
  body('status')
    .isIn(['delivered'])
    .withMessage('Status can only be updated to delivered'),
  body('deliveryConfirmation')
    .isBoolean()
    .withMessage('Delivery confirmation is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status, deliveryConfirmation } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      customer: req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Only allow status update to delivered
    if (status === 'delivered' && deliveryConfirmation) {
      // Update order status
      order.status = 'delivered';
      order.deliveredAt = new Date();

      // Add timeline entry
      order.timeline.push({
        status: 'delivered',
        message: 'Order delivered and confirmed by customer',
        updatedBy: req.user._id
      });

      await order.save();

      // Add bonus loyalty points for delivery confirmation
      const loyalty = await User.findOne({ user: req.user._id });
      if (loyalty && order.payment.status === 'paid') {
        const bonusPoints = Math.floor(order.total / 50); // 2 points per ₹100 for delivery bonus
        loyalty.points += bonusPoints;
        loyalty.lifetimePoints += bonusPoints;

        loyalty.history.push({
          type: 'earned',
          points: bonusPoints,
          order: order._id,
          description: `Earned ${bonusPoints} bonus points for delivery confirmation of order #${order.orderNumber}`
        });

        // Check for tier upgrade
        const { newTier, nextTierPoints } = loyalty.checkTierUpgrade();
        if (newTier !== loyalty.tier) {
          loyalty.history.push({
            type: 'tier_upgrade',
            points: 0,
            description: `Upgraded from ${loyalty.tier} to ${newTier} tier`
          });
          loyalty.tier = newTier;
          loyalty.nextTierPoints = nextTierPoints;
        }

        await loyalty.save();

        // Update user document
        await User.findByIdAndUpdate(req.user._id, {
          loyaltyPoints: loyalty.points,
          loyaltyTier: loyalty.tier,
          $push: {
            loyaltyHistory: {
              date: new Date(),
              action: 'delivery_bonus',
              points: bonusPoints,
              order: order._id
            }
          }
        });

        return res.status(200).json({
          success: true,
          message: 'Order status updated successfully',
          data: {
            order,
            bonusPointsEarned: bonusPoints,
            newLoyaltyPoints: loyalty.points,
            newTier: loyalty.tier
          }
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        data: order
      });
    }

    res.status(400).json({
      success: false,
      message: 'Invalid status update'
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status'
    });
  }
});

// @desc    Get customer order details with loyalty info
// @route   GET /api/customer/orders/:id/details
// @access  Customer only
router.get('/orders/:id/details', async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      customer: req.user._id
    }).populate('items.product', 'name price images description');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Get user loyalty information
    const user = await User.findById(req.user._id);
    if (user) {
      // Recalculate tier based on current points
      user.recalculateTier();
      await user.save();
    }

    const loyaltyInfo = user ? {
      currentPoints: user.loyaltyPoints || 0,
      currentTier: user.loyaltyTier || 'bronze',
      nextTierPoints: user.loyaltyTier === 'bronze' ? 5000 : user.loyaltyTier === 'silver' ? 10000 : 0,
      progressToNextTier: user.loyaltyTier === 'gold' ? 100 : 
        user.loyaltyTier === 'bronze' ? Math.min(100, Math.floor((user.loyaltyPoints || 0) / 5000 * 100)) :
        Math.min(100, Math.floor((user.loyaltyPoints || 0) / 10000 * 100))
    } : null;

    // Calculate points earned from this order
    const pointsEarned = Math.floor(order.total);
    const deliveryBonusPoints = order.status === 'delivered' ? Math.floor(order.total * 0.1) : 0;

    res.status(200).json({
      success: true,
      data: {
        order,
        loyaltyInfo,
        pointsEarned,
        deliveryBonusPoints,
        totalPointsFromOrder: pointsEarned + deliveryBonusPoints
      }
    });
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order details'
    });
  }
});

// @desc    Get available products for customer
// @route   GET /api/customer/products
// @access  Customer only
router.get('/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const sort = req.query.sort || 'createdAt';
    const order = req.query.order || 'desc';

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

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    const products = await Product.find(query)
      .populate('category', 'name')
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);

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
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products'
    });
  }
});

// @desc    Get product by ID for customer
// @route   GET /api/customer/products/:id
// @access  Customer only
router.get('/products/:id', async (req, res) => {
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

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product'
    });
  }
});

// @desc    Validate promo code
// @route   POST /api/customer/validate-promo
// @access  Customer only
router.post('/validate-promo', [
  body('code')
    .notEmpty()
    .withMessage('Promo code is required'),
  body('orderValue')
    .isNumeric()
    .withMessage('Order value must be a number'),
  body('items')
    .optional()
    .isArray()
    .withMessage('Items must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { code, orderValue, items = [] } = req.body;

    // Find the promo code
    const promoCode = await PromoCode.findValidCode(code);
    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired promo code'
      });
    }

    // Check if user meets requirements
    const user = await User.findById(req.user._id);
    
    // Check new user restriction
    if (promoCode.userRestrictions.newUsersOnly) {
      const userOrderCount = await Order.countDocuments({ customer: req.user._id });
      if (userOrderCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'This promo code is only valid for new users'
        });
      }
    }

    // Check loyalty tier requirement
    if (promoCode.userRestrictions.loyaltyTierRequired) {
      if (!user.loyaltyTier || user.loyaltyTier !== promoCode.userRestrictions.loyaltyTierRequired) {
        return res.status(400).json({
          success: false,
          message: `This promo code requires ${promoCode.userRestrictions.loyaltyTierRequired} loyalty tier`
        });
      }
    }

    // Validate promo code
    const validation = promoCode.isValid(req.user._id, orderValue);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.reason
      });
    }

    // Calculate discount
    const discountAmount = promoCode.calculateDiscount(orderValue, items);

    res.status(200).json({
      success: true,
      message: 'Promo code is valid',
      data: {
        code: promoCode.code,
        description: promoCode.description,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue,
        discountAmount,
        finalTotal: Math.max(0, orderValue - discountAmount)
      }
    });
  } catch (error) {
    console.error('Validate promo code error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating promo code'
    });
  }
});

// @desc    Validate Evolv points redemption
// @route   POST /api/customer/validate-evolv-points
// @access  Customer only
router.post('/validate-evolv-points', [
  body('pointsToRedeem')
    .isInt({ min: 1 })
    .withMessage('Points to redeem must be a positive integer'),
  body('orderValue')
    .isNumeric()
    .withMessage('Order value must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { pointsToRedeem, orderValue } = req.body;

    // Get user with current Evolv points
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user can redeem the requested points
    if (!user.canRedeemEvolvPoints(pointsToRedeem)) {
      return res.status(400).json({
        success: false,
        message: `Insufficient Evolv points. Available: ${user.evolvPoints}, Requested: ${pointsToRedeem}`
      });
    }

    // Calculate discount (1 Evolv point = ₹1 discount)
    const discountAmount = Math.min(pointsToRedeem, orderValue);
    const actualPointsUsed = discountAmount;

    res.status(200).json({
      success: true,
      message: 'Evolv points validation successful',
      data: {
        pointsToRedeem: actualPointsUsed,
        discountAmount,
        availablePoints: user.evolvPoints,
        finalTotal: Math.max(0, orderValue - discountAmount)
      }
    });
  } catch (error) {
    console.error('Validate Evolv points error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating Evolv points'
    });
  }
});

// @desc    Place new order
// @route   POST /api/customer/orders
// @access  Customer only
router.post('/orders', [
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('items.*.product')
    .isMongoId()
    .withMessage('Valid product ID is required'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('items.*.price')
    .isNumeric()
    .withMessage('Price must be a number'),
  body('shippingAddress')
    .isObject()
    .withMessage('Shipping address is required'),
  body('billingAddress')
    .optional()
    .isObject()
    .withMessage('Billing address must be an object if provided'),
  body('payment.method')
    .isIn(['credit_card', 'debit_card', 'paypal', 'stripe', 'razorpay'])
    .withMessage('Valid payment method is required'),
  body('subtotal')
    .isNumeric()
    .withMessage('Subtotal must be a number'),
  body('shippingCost')
    .isNumeric()
    .withMessage('Shipping cost must be a number'),
  body('tax')
    .isNumeric()
    .withMessage('Tax must be a number'),
  body('total')
    .isNumeric()
    .withMessage('Total must be a number'),
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string'),
  body('promoCode')
    .optional()
    .isString()
    .withMessage('Promo code must be a string'),
  body('evolvPointsToRedeem')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Evolv points to redeem must be a non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      items,
      shippingAddress,
      billingAddress = shippingAddress, // Default to shipping address if not provided
      payment,
      notes,
      subtotal,
      shippingCost,
      tax,
      total,
      promoCode,
      evolvPointsToRedeem
    } = req.body;

    // Validate mutual exclusivity of promo code and Evolv points
    if (promoCode && evolvPointsToRedeem && evolvPointsToRedeem > 0) {
      return res.status(400).json({
        success: false,
        message: 'You cannot use both promo code and Evolv points redemption on the same order'
      });
    }

    // Validate products and check stock
    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product with ID ${item.product} not found`
        });
      }

      if (product.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: `Product ${product.name} is not available for purchase`
        });
      }

      // Check stock based on product type
      if (Array.isArray(product.colors) && product.colors.length > 0) {
        // Clothing product with colors and sizes - find the color then the size
        const color = product.colors.find(c => c.name === item.color);
        if (!color) {
          return res.status(400).json({ success: false, message: `Color ${item.color} not available for ${product.name}` });
        }
        if (!Array.isArray(color.sizes) || color.sizes.length === 0) {
          return res.status(400).json({ success: false, message: `No sizes available for color ${item.color} of ${product.name}` });
        }
        const selectedSize = color.sizes.find(s => s.size === item.size);
        if (!selectedSize) {
          return res.status(400).json({ success: false, message: `Size ${item.size} not available for ${product.name} in color ${item.color}` });
        }
        if (selectedSize.stock < item.quantity) {
          return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name} in ${item.color} / ${item.size} (available: ${selectedSize.stock})` });
        }
      } else if (product.stock && product.stock.trackStock) {
        // Legacy product - check general stock
        if (product.stock.quantity < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name} (available: ${product.stock.quantity})`
          });
        }
      }
    }

    // Handle promo code validation if provided
    let appliedPromoCode = null;
    let discountAmount = 0;
    let evolvPointsUsed = 0;
    let discountType = 'fixed';
    
    if (promoCode) {
      appliedPromoCode = await PromoCode.findValidCode(promoCode);
      if (!appliedPromoCode) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired promo code'
        });
      }

      // Validate promo code for this user and order
      const validation = appliedPromoCode.isValid(req.user._id, subtotal);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.reason
        });
      }

      // Calculate discount
      discountAmount = appliedPromoCode.calculateDiscount(subtotal, items);
      discountType = appliedPromoCode.discountType;
      
      // Verify the total matches expected calculation
      const expectedTotal = subtotal + tax + shippingCost - discountAmount;
      if (Math.abs(total - expectedTotal) > 0.01) { // Allow for small rounding differences
        return res.status(400).json({
          success: false,
          message: 'Order total does not match calculated total with discount'
        });
      }
    } else if (evolvPointsToRedeem && evolvPointsToRedeem > 0) {
      // Handle Evolv points redemption
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!user.canRedeemEvolvPoints(evolvPointsToRedeem)) {
        return res.status(400).json({
          success: false,
          message: `Insufficient Evolv points. Available: ${user.evolvPoints}, Requested: ${evolvPointsToRedeem}`
        });
      }

      // Calculate Evolv points discount
      discountAmount = Math.min(evolvPointsToRedeem, subtotal);
      evolvPointsUsed = discountAmount;
      discountType = 'evolv_points';

      // Verify the total matches expected calculation
      const expectedTotal = subtotal + tax + shippingCost - discountAmount;
      if (Math.abs(total - expectedTotal) > 0.01) {
        return res.status(400).json({
          success: false,
          message: 'Order total does not match calculated total with Evolv points discount'
        });
      }
    }

    // Create the order
    const order = new Order({
      customer: req.user._id,
      items: items.map(item => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        color: item.color,
        total: item.price * item.quantity
      })),
      subtotal,
      tax,
      shipping: {
        cost: shippingCost,
        method: 'standard' // or get from request if you have shipping options
      },
      discount: {
        amount: discountAmount,
        code: appliedPromoCode ? appliedPromoCode.code : (evolvPointsUsed > 0 ? 'EVOLV_POINTS' : null),
        type: discountType,
        promoCode: appliedPromoCode ? appliedPromoCode._id : null,
        evolvPointsUsed: evolvPointsUsed
      },
      total,
      payment: {
        method: payment.method,
        status: 'pending',
        transactionId: payment.transactionId || null
      },
      shippingAddress,
      billingAddress,
      notes: {
        customer: notes || ''
      },
      status: 'pending'
    });

    // Save the order
    await order.save();

    // Update product stock quantities
    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (Array.isArray(product.colors) && product.colors.length > 0) {
        // Decrement stock for specific color/size using arrayFilters
        await Product.findOneAndUpdate(
          { _id: item.product },
          { $inc: { 'colors.$[c].sizes.$[s].stock': -item.quantity } },
          {
            arrayFilters: [ { 'c.name': item.color }, { 's.size': item.size } ]
          }
        );
      } else if (product.stock && product.stock.trackStock) {
        // Legacy product - update general stock
        await Product.findByIdAndUpdate(item.product, {
          $inc: { 'stock.quantity': -item.quantity }
        });
      }
    }

    // Add timeline entry
    order.timeline.push({
      status: 'pending',
      message: 'Order placed successfully',
      updatedBy: req.user._id,
      updatedAt: new Date()
    });
    await order.save();

    // Apply promo code usage if used
    if (appliedPromoCode && discountAmount > 0) {
      await appliedPromoCode.applyToOrder(req.user._id, order._id, discountAmount);
    }

    // Apply Evolv points redemption if used
    if (evolvPointsUsed > 0) {
      const user = await User.findById(req.user._id);
      const redemptionResult = user.redeemEvolvPoints(evolvPointsUsed, subtotal);
      await user.save();
      
      // Add redemption info to order notes
      order.notes.admin = `Evolv points redeemed: ${redemptionResult.pointsUsed} points for ₹${redemptionResult.discountAmount} discount`;
      await order.save();
    }

    // Process loyalty points
const user = await User.findById(req.user._id);
let loyaltyResponse = null;

if (user) {
  // Don't award Evolv points if user used promo code or redeemed Evolv points
  const skipEvolvPoints = (appliedPromoCode && discountAmount > 0) || (evolvPointsUsed > 0);
  
  const loyaltyResult = await user.addLoyaltyPoints(total, order, skipEvolvPoints); // Pass skipEvolvPoints flag
  
  await user.save();
  
  // Add to loyalty history
  const historyDescription = skipEvolvPoints 
    ? `Earned ${loyaltyResult.tierPoints} tier points from order (no Evolv points due to discount applied)`
    : `Earned ${loyaltyResult.tierPoints} tier points and ${loyaltyResult.evolvPoints} evolv points from order`;
    
  user.loyaltyHistory.push({
    date: new Date(),
    action: 'order_points',
    points: loyaltyResult.tierPoints,
    order: order._id,
    description: historyDescription
  });

  await user.save();

  loyaltyResponse = {
    pointsEarned: loyaltyResult.tierPoints,
    evolvPointsEarned: loyaltyResult.evolvPoints,
    newBalance: user.loyaltyPoints,
    newTier: user.loyaltyTier,
    nextTierInfo: user.getNextLoyaltyTier()
  };
}

    // Prepare response
    const response = {
      success: true,
      message: 'Order placed successfully',
      data: {
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          total: order.total,
          createdAt: order.createdAt
        },
        loyalty: loyaltyResponse
      }
    };

    res.status(201).json(response);

  } catch (error) {
    console.error('Place order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error placing order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get customer address book
// @route   GET /api/customer/addresses
// @access  Customer only
router.get('/addresses', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // For now, return the user's address
    // In a real app, you might have a separate Address model
    const addresses = user.address ? [user.address] : [];

    res.status(200).json({
      success: true,
      data: addresses
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching addresses'
    });
  }
});

// Configure multer for profile picture uploads
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/profile-pictures');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Upload and update profile picture
router.post('/profile-picture', protect, isCustomer, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Generate unique filename
    const fileName = `profile-${req.user._id}-${Date.now()}.webp`;
    const filePath = path.join(uploadsDir, fileName);

    // Process image with sharp (resize and optimize)
    await sharp(req.file.buffer)
      .resize(300, 300, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 85 })
      .toFile(filePath);

    // Delete old profile picture if exists
    const user = await User.findById(req.user._id);
    if (user.profileImage) {
      const oldImagePath = path.join(__dirname, '../uploads/profile-pictures', path.basename(user.profileImage));
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update user profile image in database
    const imageUrl = `/uploads/profile-pictures/${fileName}`;
    await User.findByIdAndUpdate(req.user._id, { profileImage: imageUrl });

    res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully',
      data: {
        profileImage: imageUrl
      }
    });
  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading profile picture'
    });
  }
});

// Get user profile
router.get('/profile', protect, isCustomer, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -emailVerificationToken -passwordResetToken');
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
});

// Update user profile
router.put('/profile', protect, isCustomer, [
  body('firstName').optional().trim().isLength({ min: 1, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 1, max: 50 }),
  body('phone').optional().matches(/^[\+]?[1-9][\d]{0,15}$/),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const allowedUpdates = ['firstName', 'lastName', 'phone', 'address'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password -emailVerificationToken -passwordResetToken');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
});

// Delete profile picture
router.delete('/profile-picture', protect, isCustomer, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (user.profileImage) {
      // Delete file from filesystem
      const imagePath = path.join(__dirname, '../uploads/profile-pictures', path.basename(user.profileImage));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
      
      // Remove from database
      await User.findByIdAndUpdate(req.user._id, { profileImage: null });
    }

    res.status(200).json({
      success: true,
      message: 'Profile picture deleted successfully'
    });
  } catch (error) {
    console.error('Delete profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting profile picture'
    });
  }
});

module.exports = router; 

// DELETE account (remove user and related data)
// @route   DELETE /api/customer/account
// @access  Customer only
router.delete('/account', async (req, res) => {
  try {
    const userId = req.user._id;

    // Find user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Delete orders
    await Order.deleteMany({ customer: userId });

    // Delete wishlist
    const Wishlist = require('../models/Wishlist');
    await Wishlist.deleteOne({ user: userId });

    // Delete reviews submitted by this user's email (best-effort)
    const Review = require('../models/Review');
    if (user.email) {
      await Review.deleteMany({ email: user.email });
    }

    // Delete newsletter subscriptions if stored
    const Newsletter = require('../models/Newsletter');
    await Newsletter.deleteMany({ email: user.email });

    // Remove profile picture file if exists and stored in uploads/profile-pictures
    if (user.profileImage && typeof user.profileImage === 'string') {
      try {
        const imgPath = path.join(__dirname, '..', 'uploads', 'profile-pictures', path.basename(user.profileImage));
        if (fs.existsSync(imgPath)) {
          fs.unlinkSync(imgPath);
        }
      } catch (fileErr) {
        console.error('Error deleting profile image:', fileErr);
      }
    }

    // Finally delete the user
    await User.findByIdAndDelete(userId);

    res.status(200).json({ success: true, message: 'Account and related data deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ success: false, message: 'Error deleting account' });
  }
});