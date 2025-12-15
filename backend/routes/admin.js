const express = require("express");
const { body, validationResult } = require("express-validator");
const { protect, isAdmin } = require("../middleware/auth");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const PromoCode = require("../models/PromoCode");
const Category = require("../models/Category");
const Newsletter = require("../models/Newsletter");
const {
  createTransporter,
  sendOrderStatusUpdateEmail,
  sendOrderCancellationEmail,
} = require("../utils/emailService");
const mongoose = require("mongoose");

const router = express.Router();

// Apply admin protection to all routes
router.use(protect, isAdmin);

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Admin only
router.get("/dashboard", async (req, res) => {
  try {
    // Get total counts
    const totalUsers = await User.countDocuments({ role: "customer" });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Get recent orders (populate customer and ordered product details so
    // frontend can show product name and image without extra requests)
    const recentOrders = await Order.find()
      .populate("customer", "firstName lastName email")
      .populate({ path: "items.product", select: "name images slug price" })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get location counts (group by shipping or billing country where available)
    const locAgg = await Order.aggregate([
      {
        $project: {
          country: {
            $trim: {
              input: {
                $ifNull: [
                  "$shippingAddress.country",
                  { $ifNull: ["$billingAddress.country", null] },
                ],
              },
            },
          },
        },
      },
      { $match: { country: { $ne: null } } },
      {
        $group: {
          _id: "$country",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const locationCounts = {};
    locAgg.forEach((it) => {
      if (!it._id) return;
      const key = String(it._id).trim();
      locationCounts[key] = it.count || 0;
    });

    // Get low stock products
    const lowStockProducts = await Product.find({
      "stock.quantity": { $lte: 10 },
      "stock.trackStock": true,
    }).limit(10);

    // Get total revenue from all orders
    const totalRevenueResult = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    const totalRevenue = totalRevenueResult[0]?.totalRevenue || 0;

    // Get revenue stats (last 30 days) for recent orders
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentOrdersRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    const recentRevenueStats = recentOrdersRevenue[0] || {
      totalRevenue: 0,
      orderCount: 0,
    };

    // Get order status counts
    const orderStatusCounts = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalProducts,
          totalOrders,
          totalRevenue: totalRevenue,
          recentOrderCount: recentRevenueStats.orderCount,
        },
        recentOrders,
        lowStockProducts,
        orderStatusCounts,
        locationCounts,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard data",
    });
  }
});

// @desc    Get user activity analytics (page counts and time series)
// @route   GET /api/admin/analytics/user-activity
// @access  Admin only
router.get("/analytics/user-activity", async (req, res) => {
  try {
    const days = Math.max(0, Number(req.query.days || 30));
    const since = new Date();
    if (days > 0) {
      since.setDate(since.getDate() - days);
    } else {
      // if days=0 or invalid, return all time
      since.setTime(0);
    }

    const match = { createdAt: { $gte: since } };

    // Total counts per page
    const perPage = await require("../models/AnalyticsEvent").aggregate([
      { $match: match },
      { $group: { _id: "$page", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Total counts per event
    const perEvent = await require("../models/AnalyticsEvent").aggregate([
      { $match: match },
      { $group: { _id: "$event", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Time series (group by day)
    const timeSeries = await require("../models/AnalyticsEvent").aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            page: "$page",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.day": 1 } },
    ]);

    res.json({ success: true, data: { perPage, perEvent, timeSeries } });
  } catch (err) {
    console.error("User activity analytics error", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch analytics" });
  }
});

// @desc    Get all categories
// @route   GET /api/admin/categories
// @access  Admin only
router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .select("_id name slug description")
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
    });
  }
});

// @desc    Get product by ID
// @route   GET /api/admin/products/:id
// @access  Admin only
router.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name"
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching product",
    });
  }
});

// @desc    Get all users (customers)
// @route   GET /api/admin/users
// @access  Admin only
router.get("/users", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const status = req.query.status || "";

    const skip = (page - 1) * limit;

    // Build query
    let query = { role: "customer" };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      query.isActive = status === "active";
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
    });
  }
});

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Admin only
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get user's orders
    const orders = await Order.find({ customer: user._id })
      .populate("items.product", "name price images")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        user,
        orders,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user",
    });
  }
});

// @desc    Get customer details with stats
// @route   GET /api/admin/users/:id/details
// @access  Admin only
router.get("/users/:id/details", async (req, res) => {
  try {
    const customer = await User.findById(req.params.id).select("-password");

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Get customer order statistics
    const orderStats = await Order.aggregate([
      { $match: { customer: customer._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$total" },
          averageOrderValue: { $avg: "$total" },
        },
      },
    ]);

    const stats = orderStats[0] || {
      totalOrders: 0,
      totalSpent: 0,
      averageOrderValue: 0,
    };

    res.status(200).json({
      success: true,
      data: {
        customer,
        stats,
      },
    });
  } catch (error) {
    console.error("Get customer details error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching customer details",
    });
  }
});

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Admin only
router.put(
  "/users/:id/status",
  [body("isActive").isBoolean().withMessage("isActive must be a boolean")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { isActive } = req.body;

      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      user.isActive = isActive;
      await user.save();

      res.status(200).json({
        success: true,
        message: `User ${isActive ? "activated" : "deactivated"} successfully`,
        user: user.getPublicProfile(),
      });
    } catch (error) {
      console.error("Update user status error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating user status",
      });
    }
  }
);

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Admin only
router.get("/orders", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || "";
    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    // Build query
    let query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "shippingAddress.email": { $regex: search, $options: "i" } },
      ];
    }

    const orders = await Order.find(query)
      .populate("customer", "firstName lastName email")
      .populate("items.product", "name price images")
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
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
    });
  }
});

// @desc    Create and send newsletter to all customers
// @route   POST /api/admin/newsletters
// @access  Admin only
router.post(
  "/newsletters",
  [
    body("title").isString().notEmpty(),
    body("subject").isString().notEmpty(),
    body("message").isString().notEmpty(),
    body("bannerUrl").optional().isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { title, subject, message, bannerUrl } = req.body;

      // Create newsletter record (sent status will be updated after sending)
      const newsletter = new Newsletter({
        title,
        subject,
        message,
        bannerUrl,
        createdBy: req.user._id,
      });
      await newsletter.save();

      // Fetch all active customers
      const customers = await User.find({
        role: "customer",
        isActive: true,
      }).select("firstName email");

      const transporter = createTransporter();

      let sent = 0;
      for (const customer of customers) {
        try {
          const mailOptions = {
            from: `"Flaunt By Nishi" <${
              process.env.EMAIL_FROM || "noreply@flauntbynishi.com"
            }>`,
            to: customer.email,
            subject: subject,
            html: `
            <div style="font-family:Arial, sans-serif; max-width:600px; margin:0 auto; padding:20px;">
              <div style="text-align:center;">
                ${
                  bannerUrl
                    ? `<img src="${bannerUrl}" alt="${title}" style="max-width:100%; border-radius:8px;"/>`
                    : ""
                }
                <h2 style="color:#2B463C">${title}</h2>
              </div>
              <div style="background:#fff; padding:16px; border-radius:8px; margin-top:12px;">
                ${message}
              </div>
            </div>
          `,
          };

          await transporter.sendMail(mailOptions);
          sent++;
        } catch (e) {
          console.error(
            "Newsletter send error to",
            customer.email,
            e.message || e
          );
        }
      }

      newsletter.sentAt = new Date();
      newsletter.recipientsCount = sent;
      await newsletter.save();

      res.status(200).json({
        success: true,
        message: `Newsletter sent to ${sent} recipients`,
        data: newsletter,
      });
    } catch (error) {
      console.error("Create newsletter error:", error);
      res
        .status(500)
        .json({ success: false, message: "Error creating newsletter" });
    }
  }
);

// @desc    List newsletters
// @route   GET /api/admin/newsletters
// @access  Admin only
router.get("/newsletters", async (req, res) => {
  try {
    const newsletters = await Newsletter.find()
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json({ success: true, data: newsletters });
  } catch (error) {
    console.error("Get newsletters error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching newsletters" });
  }
});

// @desc    Get order details with loyalty info
// @route   GET /api/admin/orders/:id/details
// @access  Admin only
router.get("/orders/:id/details", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      // .populate(
      //   "customer",
      //   "firstName lastName email phone loyaltyPoints loyaltyTier evolvPoints"
      // )
      .populate("items.product", "name price images description");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Calculate loyalty points earned from this order using per-₹50 rules
    // Bronze: 1 point per ₹50, Silver: 3 points per ₹50, Gold: 5 points per ₹50
    // const customerTier = order.customer.loyaltyTier || "bronze";
    // const pointsPer50 =
    //   customerTier === "gold" ? 5 : customerTier === "silver" ? 3 : 1;
    // const pointsEarned = Math.floor(order.total / 50) * pointsPer50;
    // const deliveryBonusPoints =
    //   order.status === "delivered" ? Math.floor(order.total * 0.1) : 0;
    // const totalPointsFromOrder = pointsEarned + deliveryBonusPoints;

    // Get loyalty information
    // const loyaltyInfo = {
    //   pointsEarned,
    //   deliveryBonusPoints,
    //   totalPointsFromOrder,
    //   customerTier: order.customer.loyaltyTier || "bronze",
    //   customerPoints: order.customer.loyaltyPoints || 0,
    // };

    res.status(200).json({
      success: true,
      data: {
        order,
        // loyaltyInfo,
      },
    });
  } catch (error) {
    console.error("Get order details error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order details",
    });
  }
});

// @desc    Update invoice number for an order
// @route   PUT /api/admin/orders/:id/invoice
// @access  Admin only
router.put("/orders/:id/invoice", async (req, res) => {
  try {
    const { invoiceNo } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    order.invoiceNo = invoiceNo || "";
    await order.save();

    res
      .status(200)
      .json({ success: true, message: "Invoice number updated", data: order });
  } catch (error) {
    console.error("Update invoice number error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error updating invoice number" });
  }
});

// @desc    Get order by ID
// @route   GET /api/admin/orders/:id
// @access  Admin only
router.get("/orders/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer", "firstName lastName email phone")
      .populate("items.product", "name price images sku");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order",
    });
  }
});

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Admin only
router.put(
  "/orders/:id/status",
  [
    body("status")
      .isIn([
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ])
      .withMessage("Invalid order status"),
    body("notes").optional().isString().withMessage("Notes must be a string"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { status, notes } = req.body;

      const order = await Order.findById(req.params.id).populate("customer");
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      // Update order status
      await order.updateStatus(status, notes, req.user._id);

      // If status changed to confirmed, attempt to create Delhivery shipment
      if (status === "confirmed") {
        try {
          const {
            createShipmentForOrder,
          } = require("../services/delhiveryService");
          const createRes = await createShipmentForOrder(order);
          if (!createRes.success) {
            // revert status and inform admin
            await order.updateStatus(
              "pending",
              `Delhivery creation failed: ${JSON.stringify(
                createRes.error || createRes.raw
              )}`,
              req.user._id
            );
            return res.status(500).json({
              success: false,
              message: "Shipment creation failed",
              error: createRes.error || createRes.raw,
            });
          }
        } catch (e) {
          console.error("Delhivery create error (admin):", e);
          await order.updateStatus(
            "pending",
            `Delhivery creation error: ${e.message}`,
            req.user._id
          );
          return res
            .status(500)
            .json({ success: false, message: "Shipment creation error" });
        }
      }

      // Update loyalty points if order is delivered (only if not already awarded on payment)
      if (status === "delivered" && order.customer) {
        try {
          // // Only award on delivery if loyalty wasn't already awarded during payment
          // if (!order.payment || !order.payment.loyaltyAwarded) {
          const customer = await User.findById(order.customer._id);
          // const tier =
          //   customer && customer.loyaltyTier
          //     ? customer.loyaltyTier
          //     : "bronze";
          const per50 = tier === "gold" ? 5 : tier === "silver" ? 3 : 1;
          const pointsEarnedOnDelivery = Math.floor(order.total / 50) * per50;
          const deliveryBonusPoints = Math.floor(order.total * 0.1);
          const totalPoints = pointsEarnedOnDelivery + deliveryBonusPoints;

          // // Update customer's loyalty points (increment)
          // await User.findByIdAndUpdate(order.customer._id, {
          //   $inc: {
          //     loyaltyPoints: totalPoints,
          //     evolvPoints: pointsEarnedOnDelivery,
          //   },
          // });

          // // Add to loyalty history
          // await User.findByIdAndUpdate(order.customer._id, {
          //   $push: {
          //     loyaltyHistory: {
          //       date: new Date(),
          //       action: "order_completion",
          //       points: totalPoints,
          //       order: order._id,
          //       orderNumber: order.orderNumber,
          //       description: `Order ${order.orderNumber} completed - ${pointsEarnedOnDelivery} points + ${deliveryBonusPoints} bonus`,
          //     },
          //   },
          // });

          // Recalculate tier on the customer document
          if (customer) {
            customer.recalculateTier();
            await customer.save();
          }

          // // Mark order as loyaltyAwarded to prevent duplication
          // order.payment = order.payment || {};
          // order.payment.loyaltyAwarded = true;
          // await order.save();
          // }
        } catch (e) {
          // console.error("Error awarding loyalty on delivery:", e);
        }
      }

      // Handle cancellation with refund processing
      if (status === "cancelled" && order.status !== "cancelled") {
        try {
          const { processOrderRefund } = require("../services/paymentService");

          // Determine if shipment was picked up
          const hasShipment = order.shipment && order.shipment.awb;
          const shipmentStatus = order.shipment?.status || "";
          const cancelledBeforePickup =
            !hasShipment ||
            (!shipmentStatus.toLowerCase().includes("picked") &&
              !shipmentStatus.toLowerCase().includes("dispatched") &&
              !shipmentStatus.toLowerCase().includes("in transit"));

          // Process refund
          await processOrderRefund(order, {
            reason: notes || "Cancelled by admin via status update",
            deductShipping: cancelledBeforePickup ? false : true,
            initiatedBy: "admin_status_update",
          });

          console.log(
            `Refund processed for order ${order.orderNumber} via status update`
          );
        } catch (refundError) {
          console.error(
            "Error processing refund during status update:",
            refundError
          );
          // Continue with status update even if refund fails
        }
      }

      // Update product stock if order is cancelled or refunded
      if (status === "cancelled" || status === "refunded") {
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { "stock.quantity": item.quantity },
          });
        }
      }

      // Send email notification to customer about the status change
      try {
        if (order.customer && order.customer.email) {
          const email = order.customer.email;
          const firstName = order.customer.firstName || "";

          if (status === "cancelled") {
            // Use cancellation-specific template
            sendOrderCancellationEmail(email, firstName, order).catch((e) =>
              console.error("Order cancellation email error:", e)
            );
          } else {
            // Generic status update email (includes tracking info when available)
            const trackingInfo = order.shipment
              ? {
                  awb: order.shipment.awb,
                  courier: order.shipment.courier,
                  trackingUrl: order.shipment.trackingUrl,
                }
              : null;
            sendOrderStatusUpdateEmail(
              email,
              firstName,
              order,
              status,
              trackingInfo
            ).catch((e) =>
              console.error("Order status update email error:", e)
            );
          }
        }
      } catch (e) {
        console.error("Error while attempting to send order status email:", e);
      }

      // Get updated order with populated data
      const updatedOrder = await Order.findById(req.params.id)
        // .populate(
        //   "customer",
        //   "firstName lastName email phone loyaltyPoints loyaltyTier evolvPoints"
        // )
        .populate("items.product", "name price images description");

      res.status(200).json({
        success: true,
        message: "Order status updated successfully",
        data: updatedOrder,
      });
    } catch (error) {
      console.error("Update order status error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating order status",
      });
    }
  }
);

// @desc    Create Delhivery shipment for an order (admin)
// @route   POST /api/admin/orders/:id/create-shipment
// @access  Admin only
router.post("/orders/:id/create-shipment", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("customer");
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    // Prevent double-creation
    if (order.shipment && order.shipment.awb) {
      return res.status(400).json({
        success: false,
        message: "Shipment already exists for this order",
        data: order.shipment,
      });
    }

    const { createShipmentForOrder } = require("../services/delhiveryService");
    const result = await createShipmentForOrder(order);

    // If service returned error object, include it and add timeline entry
    if (!result.success) {
      await Order.findByIdAndUpdate(order._id, {
        $push: {
          timeline: {
            status: "shipment_creation_failed",
            message: `Delhivery error: ${JSON.stringify(
              result.error || result.raw || {}
            )}`,
            updatedBy: req.user._id,
          },
        },
      });
      return res.status(500).json({
        success: false,
        message: "Shipment creation failed",
        error: result.error || result.raw,
      });
    }

    // Add successful timeline entry
    await Order.findByIdAndUpdate(order._id, {
      $push: {
        timeline: {
          status: "shipment_created",
          message: `Shipment created ${
            result.data && (result.data.awb || result.data.shipmentId)
          }`,
          updatedBy: req.user._id,
        },
      },
    });

    const updated = await Order.findById(order._id);
    return res.status(200).json({
      success: true,
      message: "Shipment created",
      data: { shipment: updated.shipment, raw: result.raw },
    });
  } catch (err) {
    console.error("Admin create-shipment error:", err);
    res
      .status(500)
      .json({ success: false, message: "Error creating shipment" });
  }
});

// @desc    Cancel order with automatic refund
// @route   POST /api/admin/orders/:id/cancel
// @access  Admin only
router.post("/orders/:id/cancel", async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id).populate("customer");
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if already cancelled
    if (order.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Order is already cancelled",
      });
    }

    const {
      handleShipmentCancellation,
    } = require("../services/shipmentCancellationService");

    // Determine if shipment was picked up
    const hasShipment = order.shipment && order.shipment.awb;
    const shipmentStatus = order.shipment?.status || "";
    const cancelledBeforePickup =
      !hasShipment ||
      (!shipmentStatus.toLowerCase().includes("picked") &&
        !shipmentStatus.toLowerCase().includes("dispatched") &&
        !shipmentStatus.toLowerCase().includes("in transit"));

    // Handle cancellation with automatic refund (always initiate refund for manual dashboard cancellations)
    const result = await handleShipmentCancellation(order, {
      reason: reason || "Cancelled by admin",
      source: "admin",
      cancelledBeforePickup: cancelledBeforePickup,
      carrierData: {
        timestamp: new Date(),
      },
      skipRefund: false, // Always process refund for manual cancellations
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: "Error processing cancellation",
        error: result.error,
      });
    }

    // Reload order to get updated data
    const updatedOrder = await Order.findById(req.params.id)
      .populate("customer", "firstName lastName email")
      .populate("items.product", "name price images");

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: {
        order: updatedOrder,
        refundProcessed: result.refundProcessed,
        refundDetails: result.refundResult,
      },
    });
  } catch (error) {
    console.error("Admin cancel order error:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling order",
      error: error.message,
    });
  }
});

// @desc    Process refund for an order
// @route   POST /api/admin/orders/:id/refund
// @access  Admin only
router.post("/orders/:id/refund", async (req, res) => {
  try {
    const { amount, reason, deductShipping } = req.body;

    const order = await Order.findById(req.params.id).populate("customer");
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const { processOrderRefund } = require("../services/paymentService");

    const result = await processOrderRefund(order, {
      amount: amount ? parseFloat(amount) : null,
      reason: reason || "Manual refund by admin",
      deductShipping: deductShipping === true,
      initiatedBy: "admin",
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: "Refund processing failed",
        error: result.error,
        code: result.code,
      });
    }

    // Reload order to get updated data
    const updatedOrder = await Order.findById(req.params.id)
      .populate("customer", "firstName lastName email")
      .populate("items.product", "name price images");

    res.status(200).json({
      success: true,
      message: result.message || "Refund processed successfully",
      data: {
        order: updatedOrder,
        refund: {
          refundId: result.refundId,
          amount: result.amount,
          status: result.status,
          isCOD: result.isCOD,
          notPaid: result.notPaid,
          alreadyRefunded: result.alreadyRefunded,
        },
      },
    });
  } catch (error) {
    console.error("Admin refund order error:", error);
    res.status(500).json({
      success: false,
      message: "Error processing refund",
      error: error.message,
    });
  }
});

// @desc    Sync order status from Delhivery
// @route   POST /api/admin/orders/:id/sync-delhivery
// @access  Admin only
router.post("/orders/:id/sync-delhivery", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!order.shipment || !order.shipment.awb) {
      return res.status(400).json({
        success: false,
        message: "Order does not have a shipment AWB",
      });
    }

    const {
      syncOrderStatusFromDelhivery,
    } = require("../services/shipmentCancellationService");

    const result = await syncOrderStatusFromDelhivery(order.shipment.awb);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: "Status sync failed",
        error: result.error,
      });
    }

    // Reload order to get updated data
    const updatedOrder = await Order.findById(req.params.id)
      .populate("customer", "firstName lastName email")
      .populate("items.product", "name price images");

    res.status(200).json({
      success: true,
      message: "Status synced successfully",
      data: {
        order: updatedOrder,
        status: result.status,
        cancellationDetected: result.cancellationDetected,
        cancellationResult: result.cancellationResult,
      },
    });
  } catch (error) {
    console.error("Admin sync Delhivery error:", error);
    res.status(500).json({
      success: false,
      message: "Error syncing order status",
      error: error.message,
    });
  }
});

// @desc    Trigger bulk sync of all orders from Delhivery
// @route   POST /api/admin/orders/bulk-sync-delhivery
// @access  Admin only
router.post("/orders/bulk-sync-delhivery", async (req, res) => {
  try {
    const { limit } = req.body;

    const { triggerManualSync } = require("../jobs/delhiveryStatusSync");

    const result = await triggerManualSync({
      limit: limit || 100,
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: "Bulk sync failed",
        error: result.error,
      });
    }

    res.status(200).json({
      success: true,
      message: "Bulk sync completed successfully",
      data: result.results,
    });
  } catch (error) {
    console.error("Admin bulk sync Delhivery error:", error);
    res.status(500).json({
      success: false,
      message: "Error performing bulk sync",
      error: error.message,
    });
  }
});

// @desc    Get all products
// @route   GET /api/admin/products
// @access  Admin only
router.get("/products", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || "";
    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    // Build query
    let query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(query)
      .populate("category", "name")
      .sort({ createdAt: -1 })
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
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products",
    });
  }
});

// @desc    Create product
// @route   POST /api/admin/products
// @access  Admin only
router.post(
  "/products",
  [
    body("name")
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage(
        "Product name is required and must be less than 100 characters"
      ),
    body("description")
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage(
        "Product description is required and must be less than 1000 characters"
      ),
    body("price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
    body("category").notEmpty().withMessage("Category is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const productData = {
        ...req.body,
        createdBy: req.user._id,
      };

      const product = await Product.create(productData);

      res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: product,
      });
    } catch (error) {
      console.error("Create product error:", error);
      res.status(500).json({
        success: false,
        message: "Error creating product",
      });
    }
  }
);

// @desc    Update product
// @route   PUT /api/admin/products/:id
// @access  Admin only
router.put("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Update product with boolean field handling
    const updatedFields = { ...req.body };
    // Sanitize category: ignore empty or invalid category values to avoid ObjectId cast errors
    if (updatedFields.hasOwnProperty("category")) {
      const cat = updatedFields.category;
      if (
        cat === "" ||
        cat === null ||
        cat === "null" ||
        (typeof cat === "string" && !mongoose.Types.ObjectId.isValid(cat))
      ) {
        delete updatedFields.category;
      }
    }

    // Ensure boolean fields are properly set
    ["isFeatured", "isNewArrival", "isBestSeller", "isComingSoon"].forEach(
      (field) => {
        if (updatedFields.hasOwnProperty(field)) {
          updatedFields[field] = Boolean(updatedFields[field]);
        }
      }
    );

    Object.assign(product, updatedFields);
    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating product",
    });
  }
});

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Admin only
router.delete("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting product",
    });
  }
});

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Admin only
router.get("/analytics", async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - days);

    // Get current period data
    const currentPeriodData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    // Get previous period data for comparison
    const previousPeriodData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: previousStartDate, $lt: startDate },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const currentRevenue = currentPeriodData[0]?.totalRevenue || 0;
    const currentOrders = currentPeriodData[0]?.totalOrders || 0;
    const previousRevenue = previousPeriodData[0]?.totalRevenue || 0;
    const previousOrders = previousPeriodData[0]?.totalOrders || 0;

    // Calculate growth percentages
    const revenueGrowth =
      previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : 0;
    const orderGrowth =
      previousOrders > 0
        ? ((currentOrders - previousOrders) / previousOrders) * 100
        : 0;

    // Get order status counts
    const orderStatusCounts = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalOrders = await Order.countDocuments();
    const pendingOrders =
      orderStatusCounts.find((s) => s._id === "pending")?.count || 0;
    const deliveredOrders =
      orderStatusCounts.find((s) => s._id === "delivered")?.count || 0;
    const cancelledOrders =
      orderStatusCounts.find((s) => s._id === "cancelled")?.count || 0;

    // Get customer data
    const totalCustomers = await User.countDocuments({ role: "customer" });
    const newCustomers = await User.countDocuments({
      role: "customer",
      createdAt: { $gte: startDate },
    });
    const activeCustomers = await Order.distinct("customer", {
      createdAt: { $gte: startDate },
    });
    const customerGrowth =
      totalCustomers > 0 ? (newCustomers / totalCustomers) * 100 : 0;

    // Get product data
    const totalProducts = await Product.countDocuments();
    const lowStockProducts = await Product.countDocuments({
      "stock.quantity": { $lte: 10 },
      "stock.trackStock": true,
    });
    const outOfStockProducts = await Product.countDocuments({
      "stock.quantity": { $eq: 0 },
      "stock.trackStock": true,
    });

    // Get top products by revenue
    const topProducts = await Order.aggregate([
      {
        $unwind: "$items",
      },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $group: {
          _id: "$items.product",
          name: { $first: "$product.name" },
          sales: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      {
        $sort: { revenue: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    // Get top customers by spending
    const topCustomers = await Order.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "customer",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: "$customer",
      },
      {
        $group: {
          _id: "$customer",
          firstName: { $first: "$customer.firstName" },
          lastName: { $first: "$customer.lastName" },
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$total" },
        },
      },
      {
        $sort: { totalSpent: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    // Get monthly revenue data
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
      {
        $limit: 12,
      },
    ]);

    // Format monthly revenue data
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const formattedMonthlyRevenue = monthlyRevenue.map((item) => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      revenue: item.revenue,
      orders: item.orders,
    }));

    // Calculate order status distribution percentages
    const orderStatusDistribution = orderStatusCounts.map((status) => ({
      status: status._id,
      count: status.count,
      percentage:
        totalOrders > 0 ? Math.round((status.count / totalOrders) * 100) : 0,
    }));

    // Calculate daily, weekly, monthly revenue
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    // Build a time-series `series` for charting based on the requested `days` range.
    // For small ranges (<= 60 days) return daily buckets; for larger ranges return monthly buckets.
    let series = [];
    try {
      const start = startDate;
      const end = new Date();

      if ((days || 0) <= 60) {
        // daily aggregation
        const dailyAgg = await Order.aggregate([
          { $match: { createdAt: { $gte: start } } },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
                day: { $dayOfMonth: "$createdAt" },
              },
              revenue: { $sum: "$total" },
              orders: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
        ]);

        const map = {};
        dailyAgg.forEach((it) => {
          const dt = new Date(it._id.year, it._id.month - 1, it._id.day);
          const key = dt.toISOString().slice(0, 10);
          const label = dt.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
          });
          map[key] = {
            date: label,
            revenue: it.revenue || 0,
            orders: it.orders || 0,
          };
        });

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const key = d.toISOString().slice(0, 10);
          const label = d.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
          });
          const val = map[key] || { revenue: 0, orders: 0 };
          series.push({
            date: label,
            revenue: val.revenue,
            orders: val.orders,
          });
        }
      } else {
        // monthly aggregation
        const monthlyAggForRange = await Order.aggregate([
          { $match: { createdAt: { $gte: start } } },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
              },
              revenue: { $sum: "$total" },
              orders: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]);

        const map = {};
        monthlyAggForRange.forEach((it) => {
          const key = `${it._id.year}-${String(it._id.month).padStart(2, "0")}`;
          const label = `${monthNames[it._id.month - 1]} ${it._id.year}`;
          map[key] = {
            revenue: it.revenue || 0,
            orders: it.orders || 0,
            label,
          };
        });

        // iterate months from start to end (inclusive)
        let cur = new Date(start.getFullYear(), start.getMonth(), 1);
        const last = new Date(end.getFullYear(), end.getMonth(), 1);
        while (cur <= last) {
          const key = `${cur.getFullYear()}-${String(
            cur.getMonth() + 1
          ).padStart(2, "0")}`;
          const label = `${monthNames[cur.getMonth()]} ${cur.getFullYear()}`;
          const val = map[key] || { revenue: 0, orders: 0 };
          series.push({
            date: label,
            revenue: val.revenue,
            orders: val.orders,
          });
          cur.setMonth(cur.getMonth() + 1);
        }
      }
    } catch (err) {
      console.error("Error building analytics series:", err);
      series = [];
    }

    const dailyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: oneDayAgo },
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$total" },
        },
      },
    ]);

    const weeklyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: oneWeekAgo },
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$total" },
        },
      },
    ]);

    const monthlyRevenueCurrent = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: oneMonthAgo },
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$total" },
        },
      },
    ]);

    const analyticsData = {
      revenue: {
        total: currentRevenue,
        monthly: monthlyRevenueCurrent[0]?.revenue || 0,
        weekly: weeklyRevenue[0]?.revenue || 0,
        daily: dailyRevenue[0]?.revenue || 0,
        growth: revenueGrowth,
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
        growth: orderGrowth,
      },
      customers: {
        total: totalCustomers,
        new: newCustomers,
        active: activeCustomers.length,
        growth: customerGrowth,
      },
      products: {
        total: totalProducts,
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts,
      },
      topProducts,
      topCustomers,
      monthlyRevenue: formattedMonthlyRevenue,
      series,
      orderStatusDistribution,
    };

    res.status(200).json({
      success: true,
      data: analyticsData,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching analytics data",
    });
  }
});

// ==================== PROMO CODE ROUTES ====================

// @desc    Get all promo codes
// @route   GET /api/admin/promo-codes
// @access  Admin only
router.get("/promo-codes", async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};

    // Filter by status
    if (status) {
      if (status === "active") {
        const now = new Date();
        query = {
          isActive: true,
          validFrom: { $lte: now },
          validUntil: { $gte: now },
        };
      } else if (status === "inactive") {
        query.isActive = false;
      } else if (status === "expired") {
        query.validUntil = { $lt: new Date() };
      }
    }

    // Search by code or description
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const promoCodes = await PromoCode.find(query)
      .populate("createdBy", "firstName lastName email")
      .populate("applicableProducts", "name")
      .populate("applicableCategories", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await PromoCode.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        promoCodes,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
        },
      },
    });
  } catch (error) {
    console.error("Get promo codes error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching promo codes",
    });
  }
});

// @desc    Get single promo code
// @route   GET /api/admin/promo-codes/:id
// @access  Admin only
router.get("/promo-codes/:id", async (req, res) => {
  try {
    const promoCode = await PromoCode.findById(req.params.id)
      .populate("createdBy", "firstName lastName email")
      .populate("applicableProducts", "name price")
      .populate("applicableCategories", "name")
      .populate("excludedProducts", "name")
      .populate("usageHistory.user", "firstName lastName email")
      .populate("usageHistory.order", "orderNumber total");

    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: "Promo code not found",
      });
    }

    res.status(200).json({
      success: true,
      data: promoCode,
    });
  } catch (error) {
    console.error("Get promo code error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching promo code",
    });
  }
});

// @desc    Create new promo code
// @route   POST /api/admin/promo-codes
// @access  Admin only
router.post(
  "/promo-codes",
  [
    body("code")
      .isLength({ min: 3, max: 20 })
      .withMessage("Code must be between 3 and 20 characters")
      .matches(/^[A-Z0-9]+$/)
      .withMessage("Code must contain only uppercase letters and numbers"),
    body("description")
      .isLength({ min: 5, max: 200 })
      .withMessage("Description must be between 5 and 200 characters"),
    body("discountType")
      .isIn(["percentage", "fixed"])
      .withMessage("Discount type must be percentage or fixed"),
    body("discountValue")
      .isFloat({ min: 0 })
      .withMessage("Discount value must be a positive number"),
    body("minimumOrderValue")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Minimum order value must be a positive number"),
    body("maximumDiscount")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Maximum discount must be a positive number"),
    body("usageLimit")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Usage limit must be at least 1"),
    body("userUsageLimit")
      .optional()
      .isInt({ min: 1 })
      .withMessage("User usage limit must be at least 1"),
    body("validFrom")
      .isISO8601()
      .withMessage("Valid from must be a valid date"),
    body("validUntil")
      .isISO8601()
      .withMessage("Valid until must be a valid date"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const {
        code,
        description,
        discountType,
        discountValue,
        minimumOrderValue,
        maximumDiscount,
        usageLimit,
        userUsageLimit,
        validFrom,
        validUntil,
        applicableProducts,
        applicableCategories,
        excludedProducts,
        userRestrictions,
      } = req.body;

      // Check if code already exists
      const existingCode = await PromoCode.findOne({
        code: code.toUpperCase(),
      });
      if (existingCode) {
        return res.status(400).json({
          success: false,
          message: "Promo code already exists",
        });
      }

      // Validate percentage discount
      if (discountType === "percentage" && discountValue > 100) {
        return res.status(400).json({
          success: false,
          message: "Percentage discount cannot exceed 100%",
        });
      }

      // Validate date range
      if (new Date(validFrom) >= new Date(validUntil)) {
        return res.status(400).json({
          success: false,
          message: "Valid from date must be before valid until date",
        });
      }

      const promoCode = new PromoCode({
        code: code.toUpperCase(),
        description,
        discountType,
        discountValue,
        minimumOrderValue: minimumOrderValue || 0,
        maximumDiscount,
        usageLimit,
        userUsageLimit: userUsageLimit || 1,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        applicableProducts: applicableProducts || [],
        applicableCategories: applicableCategories || [],
        excludedProducts: excludedProducts || [],
        userRestrictions: userRestrictions || {},
        createdBy: req.user._id,
      });

      await promoCode.save();

      // Populate the response
      await promoCode.populate("createdBy", "firstName lastName email");

      res.status(201).json({
        success: true,
        message: "Promo code created successfully",
        data: promoCode,
      });
    } catch (error) {
      console.error("Create promo code error:", error);
      res.status(500).json({
        success: false,
        message: "Error creating promo code",
      });
    }
  }
);

// @desc    Update promo code
// @route   PUT /api/admin/promo-codes/:id
// @access  Admin only
router.put(
  "/promo-codes/:id",
  [
    body("description")
      .optional()
      .isLength({ min: 5, max: 200 })
      .withMessage("Description must be between 5 and 200 characters"),
    body("discountValue")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Discount value must be a positive number"),
    body("minimumOrderValue")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Minimum order value must be a positive number"),
    body("maximumDiscount")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Maximum discount must be a positive number"),
    body("usageLimit")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Usage limit must be at least 1"),
    body("userUsageLimit")
      .optional()
      .isInt({ min: 1 })
      .withMessage("User usage limit must be at least 1"),
    body("validUntil")
      .optional()
      .isISO8601()
      .withMessage("Valid until must be a valid date"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const promoCode = await PromoCode.findById(req.params.id);
      if (!promoCode) {
        return res.status(404).json({
          success: false,
          message: "Promo code not found",
        });
      }

      const {
        description,
        discountValue,
        minimumOrderValue,
        maximumDiscount,
        usageLimit,
        userUsageLimit,
        validUntil,
        applicableProducts,
        applicableCategories,
        excludedProducts,
        userRestrictions,
        isActive,
      } = req.body;

      // Update fields
      if (description !== undefined) promoCode.description = description;
      if (discountValue !== undefined) {
        if (promoCode.discountType === "percentage" && discountValue > 100) {
          return res.status(400).json({
            success: false,
            message: "Percentage discount cannot exceed 100%",
          });
        }
        promoCode.discountValue = discountValue;
      }
      if (minimumOrderValue !== undefined)
        promoCode.minimumOrderValue = minimumOrderValue;
      if (maximumDiscount !== undefined)
        promoCode.maximumDiscount = maximumDiscount;
      if (usageLimit !== undefined) promoCode.usageLimit = usageLimit;
      if (userUsageLimit !== undefined)
        promoCode.userUsageLimit = userUsageLimit;
      if (validUntil !== undefined) {
        const newValidUntil = new Date(validUntil);
        if (promoCode.validFrom >= newValidUntil) {
          return res.status(400).json({
            success: false,
            message: "Valid until date must be after valid from date",
          });
        }
        promoCode.validUntil = newValidUntil;
      }
      if (applicableProducts !== undefined)
        promoCode.applicableProducts = applicableProducts;
      if (applicableCategories !== undefined)
        promoCode.applicableCategories = applicableCategories;
      if (excludedProducts !== undefined)
        promoCode.excludedProducts = excludedProducts;
      if (userRestrictions !== undefined)
        promoCode.userRestrictions = userRestrictions;
      if (isActive !== undefined) promoCode.isActive = isActive;

      await promoCode.save();
      await promoCode.populate("createdBy", "firstName lastName email");

      res.status(200).json({
        success: true,
        message: "Promo code updated successfully",
        data: promoCode,
      });
    } catch (error) {
      console.error("Update promo code error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating promo code",
      });
    }
  }
);

// @desc    Delete promo code
// @route   DELETE /api/admin/promo-codes/:id
// @access  Admin only
router.delete("/promo-codes/:id", async (req, res) => {
  try {
    const promoCode = await PromoCode.findById(req.params.id);

    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: "Promo code not found",
      });
    }

    // Check if promo code has been used
    if (promoCode.usageCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete promo code that has been used. Consider deactivating it instead.",
      });
    }

    await PromoCode.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Promo code deleted successfully",
    });
  } catch (error) {
    console.error("Delete promo code error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting promo code",
    });
  }
});

// @desc    Get promo code usage statistics
// @route   GET /api/admin/promo-codes/:id/stats
// @access  Admin only
router.get("/promo-codes/:id/stats", async (req, res) => {
  try {
    const promoCode = await PromoCode.findById(req.params.id)
      .populate("usageHistory.user", "firstName lastName email")
      .populate("usageHistory.order", "orderNumber total createdAt");

    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: "Promo code not found",
      });
    }

    const stats = {
      totalUsage: promoCode.usageCount,
      totalDiscount: promoCode.usageHistory.reduce(
        (sum, usage) => sum + usage.discountApplied,
        0
      ),
      averageDiscount:
        promoCode.usageCount > 0
          ? promoCode.usageHistory.reduce(
              (sum, usage) => sum + usage.discountApplied,
              0
            ) / promoCode.usageCount
          : 0,
      uniqueUsers: [
        ...new Set(
          promoCode.usageHistory.map((usage) => usage.user._id.toString())
        ),
      ].length,
      recentUsage: promoCode.usageHistory.slice(-10),
      remainingUsage: promoCode.usageLimit
        ? promoCode.usageLimit - promoCode.usageCount
        : "Unlimited",
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get promo code stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching promo code statistics",
    });
  }
});

module.exports = router;
