const express = require("express");
const { protect } = require("../middleware/auth");
const Order = require("../models/Order");
const User = require("../models/User");
const PromoCode = require("../models/PromoCode");
const {
  createRazorpayOrder,
  verifyPaymentSignature,
  getPaymentDetails,
} = require("../services/paymentService");
const {
  sendOrderPlacedEmail,
  sendOrderStatusUpdateEmail,
} = require("../utils/emailService");

const router = express.Router();

// Apply authentication to all routes
router.use(protect);
router.post("/create-order", async (req, res) => {
  let savedOrder = null;

  try {
    const orderData = req.body;
    const {
      items,
      shippingAddress,
      billingAddress,
      promoCode,
      evolvPointsToRedeem,
    } = orderData;

    // Server-side tax and total calculation (override client values)
    // Tax Calculation per requirement:
    // product selling price / 1.05 = Base amt (a)
    // Tax = base amt * 0.05 (b)
    // Shipping (c) = 100 INR (flat)
    // Total = a + b + c
    const SHIPPING_FLAT = Number(process.env.SHIPPING_FLAT || 100);
    const FREE_SHIPPING_THRESHOLD = Number(
      process.env.FREE_SHIPPING_THRESHOLD || 3000
    );

    let subtotalCalculated = 0; // base amounts (price / 1.05 per item)
    let cgstCalculated = 0;
    let sgstCalculated = 0;
    let igstCalculated = 0;

    // Determine whether shipping is intra-state (Gujrat) or inter-state
    const shippingStateRaw = (shippingAddress && shippingAddress.state) || "";
    const shippingState = String(shippingStateRaw).trim().toLowerCase();
    const isIntraState = shippingState === "gujrat" || shippingState === "gujarat";

    // Tax rate allocation
    const TOTAL_TAX_RATE = 0.05; // 5% total
    const CGST_RATE = isIntraState ? 0.025 : 0; // 2.5% only for intra-state
    const SGST_RATE = isIntraState ? 0.025 : 0; // 2.5% only for intra-state
    const IGST_RATE = isIntraState ? 0 : 0.05; // 5% for inter-state

    // items expected to have { price, quantity }
    for (const item of items || []) {
      const qty = Number(item.quantity || 1);
      const price = Number(item.price || 0);
      // base amount per unit (tax-exclusive base) using existing approach
      const basePerUnit = price / (1 + TOTAL_TAX_RATE);
      subtotalCalculated += basePerUnit * qty;

      // tax portions per unit
      const cgstPerUnit = basePerUnit * CGST_RATE;
      const sgstPerUnit = basePerUnit * SGST_RATE;
      const igstPerUnit = basePerUnit * IGST_RATE;

      cgstCalculated += cgstPerUnit * qty;
      sgstCalculated += sgstPerUnit * qty;
      igstCalculated += igstPerUnit * qty;
    }

    // Round to 2 decimals
    subtotalCalculated = Math.round((subtotalCalculated + Number.EPSILON) * 100) / 100;
    cgstCalculated = Math.round((cgstCalculated + Number.EPSILON) * 100) / 100;
    sgstCalculated = Math.round((sgstCalculated + Number.EPSILON) * 100) / 100;
    igstCalculated = Math.round((igstCalculated + Number.EPSILON) * 100) / 100;

    const taxCalculated = Math.round(((cgstCalculated + sgstCalculated + igstCalculated) + Number.EPSILON) * 100) / 100;

    const shippingCostCalculated = subtotalCalculated >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
    let totalBeforeDiscount = Math.round((subtotalCalculated + taxCalculated + shippingCostCalculated + Number.EPSILON) * 100) / 100;

    // Validate promo code and calculate discount (server-side security)
    let promoCodeDoc = null;
    let promoDiscountAmount = 0;
    
    if (promoCode) {
      try {
        // Find and validate promo code
        promoCodeDoc = await PromoCode.findValidCode(promoCode);
        
        if (!promoCodeDoc) {
          return res.status(400).json({
            success: false,
            message: "Invalid or expired promo code",
          });
        }

        // Check user restrictions
        if (promoCodeDoc.userRestrictions.newUsersOnly) {
          const userOrderCount = await Order.countDocuments({ customer: req.user._id, status: { $ne: "cancelled" } });
          if (userOrderCount > 0) {
            return res.status(400).json({
              success: false,
              message: "This promo code is only valid for new users",
            });
          }
        }

        // Validate promo code against order value
        const validation = promoCodeDoc.isValid(req.user._id, totalBeforeDiscount);
        if (!validation.valid) {
          return res.status(400).json({
            success: false,
            message: validation.reason,
          });
        }

        // Calculate discount amount
        promoDiscountAmount = promoCodeDoc.calculateDiscount(totalBeforeDiscount, items);
        promoDiscountAmount = Math.round((promoDiscountAmount + Number.EPSILON) * 100) / 100;
        
        console.log(`Promo code ${promoCode} applied: -₹${promoDiscountAmount}`);
      } catch (promoError) {
        console.error("Promo code validation error:", promoError);
        return res.status(400).json({
          success: false,
          message: "Error validating promo code",
        });
      }
    }

    // Calculate Evolv points discount
    let evolvDiscountAmount = 0;
    if (evolvPointsToRedeem && evolvPointsToRedeem > 0) {
      const user = await User.findById(req.user._id);
      if (!user || !user.evolvPoints || user.evolvPoints < evolvPointsToRedeem) {
        return res.status(400).json({
          success: false,
          message: "Insufficient Evolv points",
        });
      }
      
      // 1 Evolv point = ₹1 discount
      evolvDiscountAmount = Math.round((evolvPointsToRedeem + Number.EPSILON) * 100) / 100;
      console.log(`Evolv points ${evolvPointsToRedeem} applied: -₹${evolvDiscountAmount}`);
    }

    // Apply discounts to total
    const totalDiscountAmount = promoDiscountAmount + evolvDiscountAmount;
    const totalCalculated = Math.max(0, Math.round((totalBeforeDiscount - totalDiscountAmount + Number.EPSILON) * 100) / 100);

    // Validate required fields (use server-calculated total)
    if (!totalCalculated || totalCalculated <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order total after discounts",
      });
    }

    // Create the order first
    const newOrder = new Order({
      customer: req.user._id,
      items: items.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        size: (item.size || "").toString().trim(),
        color: (item.color || "").toString().trim(),
        total: item.itemTotal,
      })),
      shippingAddress,
      billingAddress,
      // Use server-calculated amounts
      subtotal: subtotalCalculated,
      tax: taxCalculated,
      cgst: cgstCalculated,
      sgst: sgstCalculated,
      igst: igstCalculated,
      taxTotal: (cgstCalculated + sgstCalculated + igstCalculated),
      shipping: { cost: shippingCostCalculated },
      discount: totalDiscountAmount,
      total: totalCalculated,
      payment: {
        method: "razorpay",
        amount: totalCalculated,
        status: "pending",
        gateway: "razorpay",
        currency: "INR",
        razorpay: {},
      },
      status: "pending",
      ...(promoCode && { promoCode }),
      evolvPointsToRedeem: evolvPointsToRedeem || 0,
    });

    // Save the initial order
    savedOrder = await newOrder.save();

    // Send order placed confirmation email to customer (non-blocking)
    try {
      const customer = await User.findById(req.user._id).select(
        "email firstName"
      );
      if (customer && customer.email) {
        sendOrderPlacedEmail(
          customer.email,
          customer.firstName || "",
          savedOrder
        ).catch((e) => console.error("Error sending order placed email:", e));
      }
    } catch (mailErr) {
      console.error("Failed to send order placed email:", mailErr);
    }

    try {
      // Create Razorpay order using server-calculated total
      const razorpayOrderResponse = await createRazorpayOrder(
        totalCalculated,
        "INR",
        `order_${savedOrder.orderNumber}`
      );

      if (
        !razorpayOrderResponse ||
        !razorpayOrderResponse.data ||
        !razorpayOrderResponse.data.id
      ) {
        throw new Error("Invalid response from payment gateway");
      }

      // Update the order with Razorpay details
      savedOrder.payment.razorpay = {
        orderId: razorpayOrderResponse.data.id,
        amount: razorpayOrderResponse.data.amount,
        currency: razorpayOrderResponse.data.currency,
      };
      await savedOrder.save();
      // Return success response
      return res.status(200).json({
        success: true,
        data: {
          id: razorpayOrderResponse.data.id,
          amount: razorpayOrderResponse.data.amount,
          currency: razorpayOrderResponse.data.currency,
          razorpay_key_id: process.env.RAZORPAY_KEY_ID,
          order_id: savedOrder._id,
          orderNumber: savedOrder.orderNumber,
          total: savedOrder.total,
        },
      });
    } catch (paymentError) {
      // If Razorpay order creation fails, delete the saved order
      if (savedOrder) {
        await Order.findByIdAndDelete(savedOrder._id);
      }
      throw new Error(`Payment gateway error: ${paymentError.message}`);
    }
  } catch (error) {
    console.error("Create payment order error:", error);
    // If the saved order exists but we reached an error, clean it up
    if (savedOrder && savedOrder._id) {
      await Order.findByIdAndDelete(savedOrder._id).catch(console.error);
    }
    res.status(500).json({
      success: false,
      message: "Failed to create payment order",
      error: error.message,
    });
  }
});

// @desc    Verify Razorpay payment
// @route   POST /api/payments/verify
// @access  Private (Customer)
router.post("/verify", async (req, res) => {
  try {
    const {
      order_id,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = req.body;

    // Also accept orderId for backward compatibility
    const orderId = order_id || req.body.orderId;

    if (
      !orderId ||
      !razorpay_payment_id ||
      !razorpay_order_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment verification data",
      });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order belongs to the current user
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Verify payment signature
    const isValidSignature = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValidSignature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // Get payment details from Razorpay
    const paymentDetails = await getPaymentDetails(razorpay_payment_id);

    if (!paymentDetails.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch payment details",
      });
    }

    // Atomically update order with payment details and mark as confirmed (payment success)
    const rp = paymentDetails.data || {};
    const paymentUpdate = {
      $set: {
        "payment.status": "paid",
        "payment.transactionId": razorpay_payment_id,
        "payment.razorpay.paymentId": razorpay_payment_id,
        "payment.razorpay.signature": razorpay_signature,
        "payment.paidAt": new Date(),
        // Keep gateway/method as razorpay but store the specific instrument used
        "payment.gateway": "razorpay",
        "payment.provider": "Razorpay",
        "payment.method": "razorpay",
        status: "confirmed",
      },
    };

    // Store method/instrument information if available from Razorpay
    try {
      if (rp.method) {
        paymentUpdate.$set["payment.payment_method"] = rp.method; // e.g. 'card', 'upi', 'netbanking'
        paymentUpdate.$set["payment.razorpay.method"] = rp.method;
      }
      // Card info
      if (rp.card) {
        paymentUpdate.$set["payment.razorpay.card"] = {
          last4: rp.card.last4 || rp.card.last_4 || null,
          network: rp.card.network || null,
          issuer: rp.card.issuer || null,
          type: rp.card.type || null
        };
      }
      // UPI vpa
      if (rp.vpa) {
        paymentUpdate.$set["payment.razorpay.vpa"] = rp.vpa;
      }
      // Bank / netbanking details
      if (rp.bank) {
        paymentUpdate.$set["payment.razorpay.bank"] = rp.bank;
      }
    } catch (e) {
      console.error('Error while extracting razorpay instrument details:', e);
    }

    const updatedOrderAfterPayment = await Order.findByIdAndUpdate(
      order._id,
      paymentUpdate,
      { new: true }
    );

    // Record promo code usage if promo code was applied
    if (updatedOrderAfterPayment.promoCode) {
      try {
        const promoCodeDoc = await PromoCode.findValidCode(updatedOrderAfterPayment.promoCode);
        if (promoCodeDoc) {
          await promoCodeDoc.applyToOrder(
            updatedOrderAfterPayment.customer,
            updatedOrderAfterPayment._id,
            updatedOrderAfterPayment.discount || 0
          );
          console.log(`Promo code ${updatedOrderAfterPayment.promoCode} usage recorded for order ${updatedOrderAfterPayment.orderNumber}`);
        }
      } catch (promoErr) {
        console.error("Error recording promo code usage:", promoErr);
        // Don't fail payment if promo recording fails
      }
    }

    // Deduct Evolv points if they were redeemed
    if (updatedOrderAfterPayment.evolvPointsToRedeem && updatedOrderAfterPayment.evolvPointsToRedeem > 0) {
      try {
        const user = await User.findById(updatedOrderAfterPayment.customer);
        if (user && user.evolvPoints >= updatedOrderAfterPayment.evolvPointsToRedeem) {
          user.evolvPoints -= updatedOrderAfterPayment.evolvPointsToRedeem;
          await user.save();
          console.log(`Deducted ${updatedOrderAfterPayment.evolvPointsToRedeem} Evolv points from user ${user._id}`);
        }
      } catch (evolvErr) {
        console.error("Error deducting Evolv points:", evolvErr);
        // Don't fail payment if Evolv points deduction fails
      }
    }

    // Decrement product stock now that payment is confirmed
    try {
      const Product = require("../models/Product");
      for (const it of updatedOrderAfterPayment.items || []) {
        try {
          // Try atomic decrement for color + size using arrayFilters
          if (it.color && it.size) {
            const updateRes = await Product.findOneAndUpdate(
              { _id: it.product, "colors.name": it.color },
              { $inc: { "colors.$[c].sizes.$[s].stock": -(it.quantity || 0) } },
              {
                arrayFilters: [{ "c.name": it.color }, { "s.size": it.size }],
                new: true,
              }
            );

            // If updated, ensure stock doesn't go negative (clamp)
            if (updateRes) {
              // Post-process to clamp negatives where some drivers may not support multi-positional updates
              await Product.updateOne(
                { _id: it.product, "colors.sizes.stock": { $lt: 0 } },
                { $set: { "colors.$[].sizes.$[s].stock": 0 } },
                { arrayFilters: [{ "s.stock": { $lt: 0 } }], multi: true }
              ).catch(() => {});
              continue;
            }
          }

          // Try atomic decrement for size-only products
          if (it.size) {
            const updateRes2 = await Product.findOneAndUpdate(
              { _id: it.product, "sizes.size": it.size },
              { $inc: { "sizes.$[s].stock": -(it.quantity || 0) } },
              { arrayFilters: [{ "s.size": it.size }], new: true }
            );

            if (updateRes2) {
              await Product.updateOne(
                { _id: it.product, "sizes.stock": { $lt: 0 } },
                { $set: { "sizes.$[s].stock": 0 } },
                { arrayFilters: [{ "s.stock": { $lt: 0 } }] }
              ).catch(() => {});
              continue;
            }
          }

          // Fallback: decrement top-level stock.quantity if present
          const fallback = await Product.findOneAndUpdate(
            { _id: it.product, "stock.quantity": { $exists: true } },
            { $inc: { "stock.quantity": -(it.quantity || 0) } },
            { new: true }
          );
          if (fallback && fallback.stock && fallback.stock.quantity < 0) {
            await Product.findByIdAndUpdate(it.product, {
              $set: { "stock.quantity": 0 },
            });
          }
        } catch (decrErr) {
          console.error("Failed to decrement stock for item", it, decrErr);
        }
      }
    } catch (stockErr) {
      console.error("Error while reducing stock after payment:", stockErr);
    }

    // After confirming payment, attempt to create Delhivery shipment but do NOT throw on failure
    try {
      const {
        createShipmentForOrder,
      } = require("../services/delhiveryService");
      const createRes = await createShipmentForOrder(updatedOrderAfterPayment);

      if (!createRes.success) {
        // Shipment creation failed - log and persist a timeline entry, but DO NOT fail payment
        console.error(
          "Delhivery shipment creation failed for order",
          order._id,
          createRes.error || createRes.raw
        );

        // Ensure shipment.status is set to 'failed' on the order (createShipmentForOrder may have already set it)
        await Order.findByIdAndUpdate(order._id, {
          $set: { "shipment.status": "failed" },
        }).catch((e) =>
          console.error("Failed to set shipment.status to failed:", e)
        );

        // Push timeline entry describing the failure
        await Order.findByIdAndUpdate(order._id, {
          $push: {
            timeline: {
              status: "shipment_creation_failed",
              message: `Delhivery error: ${JSON.stringify(
                createRes.error || createRes.raw || "unknown"
              )}`,
              updatedBy: req.user._id,
              timestamp: new Date(),
            },
          },
        }).catch((e) => console.error("Failed to push timeline entry:", e));

        // Return structured JSON indicating payment success but shipment failure
        return res
          .status(200)
          .json({
            success: true,
            paymentStatus: "success",
            shipmentStatus: "failed",
            shipmentError: createRes.error || createRes.raw,
          });
      }

      // Shipment created successfully
      const updatedOrder = createRes.order || (await Order.findById(order._id));
      await updatedOrder.addTimelineEntry(
        "shipment_created",
        `Shipment created with AWB ${
          updatedOrder.shipment &&
          (updatedOrder.shipment.waybill || updatedOrder.shipment.awb)
        }`
      );

      // Send payment confirmation email to customer
      try {
        const customer = await User.findById(order.customer).select(
          "email firstName"
        );
        if (customer && customer.email) {
          await sendOrderStatusUpdateEmail(
            customer.email,
            customer.firstName || "",
            updatedOrderAfterPayment,
            "Payment Confirmed"
          );
        }
      } catch (mailErr) {
        console.error("Error sending payment confirmation email:", mailErr);
      }

      // Return success with AWB
      return res
        .status(200)
        .json({
          success: true,
          paymentStatus: "success",
          shipmentStatus: "created",
          awb: createRes.data && createRes.data.awb,
          order: updatedOrder,
        });
    } catch (delErr) {
      console.error(
        "Unexpected error while creating Delhivery shipment:",
        delErr
      );
      // Push timeline entry but still do not fail payment
      await Order.findByIdAndUpdate(order._id, {
        $push: {
          timeline: {
            status: "shipment_creation_failed",
            message: `Delhivery error: ${
              delErr && delErr.message ? delErr.message : JSON.stringify(delErr)
            }`,
            updatedBy: req.user._id,
            timestamp: new Date(),
          },
        },
      }).catch((e) =>
        console.error("Failed to push timeline entry after exception:", e)
      );
      return res
        .status(200)
        .json({
          success: true,
          paymentStatus: "success",
          shipmentStatus: "failed",
          shipmentError: delErr && delErr.message ? delErr.message : delErr,
        });
    }

    // Award loyalty points on payment success (idempotent)
    try {
      if (!order.payment || !order.payment.loyaltyAwarded) {
        const customer = await User.findById(order.customer);
        if (customer) {
          // Use the instance method to compute and update points
          const result = await customer.addLoyaltyPoints(
            order.total,
            order,
            false
          );

          // Push to loyalty history (record tier points and evolv points info)
          customer.loyaltyHistory = customer.loyaltyHistory || [];
          customer.loyaltyHistory.push({
            date: new Date(),
            action: "order_payment",
            points: result.tierPoints,
            order: order._id,
            description: `Order ${order.orderNumber} paid - ${result.tierPoints} loyalty points, ${result.evolvPoints} evolv points`,
          });

          // Recalculate tier and persist customer
          customer.recalculateTier();
          await customer.save();

          // Mark order as having awarded loyalty to avoid double-award
          order.payment = order.payment || {};
          order.payment.loyaltyAwarded = true;
          await order.save();
        }
      }
    } catch (awardErr) {
      console.error("Error awarding loyalty points on payment:", awardErr);
      // proceed without failing the payment verification response
    }

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: {
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          total: order.total,
          status: order.status,
        },
        orderId: order._id,
        orderNumber: order.orderNumber,
        paymentStatus: order.payment.status,
        orderStatus: order.status,
        transactionId: razorpay_payment_id,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while verifying payment",
    });
  }
});

// @desc    Handle payment failure
// @route   POST /api/payments/failure
// @access  Private (Customer)
router.post("/failure", async (req, res) => {
  try {
    const { orderId, error } = req.body;

    if (!orderId) {
      return res.status(200).json({ success: false });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(200).json({ success: false });
    }

    // Check if order belongs to the current user
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(200).json({ success: false });
    }

    // Update order payment status to failed
    order.payment.status = "failed";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Payment failure recorded",
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        paymentStatus: order.payment.status,
      },
    });
  } catch (error) {
    console.error("Payment failure handler error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while handling payment failure",
    });
  }
});

// @desc    Get payment status
// @route   GET /api/payments/status/:orderId
// @access  Private (Customer)
router.get("/status/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order belongs to the current user
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        paymentStatus: order.payment.status,
        orderStatus: order.status,
        transactionId: order.payment.transactionId,
        paidAt: order.payment.paidAt,
        total: order.total,
      },
    });
  } catch (error) {
    console.error("Get payment status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching payment status",
    });
  }
});

// @desc    Retry payment for a pending order
// @route   POST /api/payments/retry-payment
// @access  Private (Customer)
router.post("/retry-payment", async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order belongs to the current user
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Check if order is pending
    if (order.status !== "pending" || order.payment.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Order is not pending payment",
      });
    }

    // Check if order is within 12 hours
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    if (order.createdAt < twelveHoursAgo) {
      return res.status(400).json({
        success: false,
        message: "Payment window has expired",
      });
    }

    // Create new Razorpay order using the existing order amount (pass amount in INR)
    // Note: `createRazorpayOrder` expects amount in rupees (it converts to paise internally)
    const razorpayOrder = await createRazorpayOrder(
      Number(order.total) || 0,
      "INR",
      `receipt_${order.orderNumber}`
    );

    if (!razorpayOrder.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to create Razorpay order for retry",
        error: razorpayOrder.error,
      });
    }

    // Update order with new Razorpay order ID
    order.payment.razorpay.orderId = razorpayOrder.data.id;
    await order.save();

    res.json({
      success: true,
      data: {
        id: razorpayOrder.data.id,
        amount: razorpayOrder.data.amount,
        currency: razorpayOrder.data.currency,
        razorpay_key_id: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error("Error retrying payment:", error);
    res.status(500).json({
      success: false,
      message: "Server error while retrying payment",
      error: error.message,
    });
  }
});

module.exports = router;
