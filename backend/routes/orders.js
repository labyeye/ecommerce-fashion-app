const express = require('express');
const { optionalAuth } = require('../middleware/auth');
const Order = require('../models/Order');

const router = express.Router();

// Apply optional authentication to all routes
router.use(optionalAuth);

// @desc    Track order by order number (public)
// @route   GET /api/orders/track/:orderNumber
// @access  Public
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;

    const order = await Order.findOne({ orderNumber })
      .populate('customer', 'firstName lastName email')
      .populate('items.product', 'name price images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Return limited information for public tracking
    const trackingInfo = {
      orderNumber: order.orderNumber,
      status: order.status,
      timeline: order.timeline,
      estimatedDelivery: order.estimatedDelivery,
      shipping: {
        method: order.shipping.method,
        trackingNumber: order.shipping.trackingNumber,
        carrier: order.shipping.carrier
      },
      items: order.items.map(item => ({
        product: {
          name: item.product.name,
          images: item.product.images
        },
        quantity: item.quantity,
        price: item.price,
        total: item.total
      }))
    };

    res.status(200).json({
      success: true,
      data: trackingInfo
    });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking order'
    });
  }
});

// @desc    Get order by ID (if authenticated and owner)
// @route   GET /api/orders/:id
// @access  Private (if authenticated)
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'firstName lastName email')
      .populate('items.product', 'name price images description');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // If user is authenticated, check if they own the order
    if (req.user) {
      if (req.user.role === 'admin' || order.customer.toString() === req.user._id.toString()) {
        return res.status(200).json({
          success: true,
          data: order
        });
      }
    }

    // For unauthenticated users, return limited information
    const publicOrderInfo = {
      orderNumber: order.orderNumber,
      status: order.status,
      timeline: order.timeline,
      estimatedDelivery: order.estimatedDelivery,
      items: order.items.map(item => ({
        product: {
          name: item.product.name,
          images: item.product.images
        },
        quantity: item.quantity,
        price: item.price,
        total: item.total
      }))
    };

    res.status(200).json({
      success: true,
      data: publicOrderInfo
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order'
    });
  }
});

module.exports = router; 