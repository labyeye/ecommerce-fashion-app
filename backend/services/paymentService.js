const Razorpay = require("razorpay");
const crypto = require("crypto");

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order
const createRazorpayOrder = async (
  amount,
  currency = "INR",
  receipt = null
) => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay credentials are not configured");
  }

  try {
    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit (paise for INR)
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1, // Auto capture payment
      notes: {
        purpose: "E-commerce Purchase",
        environment: process.env.NODE_ENV || "development",
      },
    };

    console.log("Creating Razorpay order with options:", options);

    // Create order and wait for response
    const order = await razorpay.orders.create(options);

    if (!order || !order.id) {
      throw new Error("Invalid response from Razorpay");
    }

    console.log("Razorpay order created successfully:", order);

    return {
      success: true,
      data: order,
    };
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    // In development, also log full error object (including non-enumerable props) to help debugging
    if ((process.env.NODE_ENV || "development") === "development") {
      try {
        // Print non-enumerable props and nested error details
        console.error(
          "Razorpay error full dump:",
          JSON.stringify(error, Object.getOwnPropertyNames(error))
        );
      } catch (dumpErr) {
        console.error(
          "Failed to stringify Razorpay error for debugging:",
          dumpErr
        );
      }
    }

    // Throw error to be handled by the route
    throw new Error(error.message || "Failed to create Razorpay order");
  }
};

// Verify Razorpay payment signature
const verifyPaymentSignature = (
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature
) => {
  try {
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    return expectedSignature === razorpaySignature;
  } catch (error) {
    console.error("Payment signature verification error:", error);
    return false;
  }
};

// Get payment details
const getPaymentDetails = async (paymentId) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return {
      success: true,
      data: payment,
    };
  } catch (error) {
    console.error("Get payment details error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Refund payment
const refundPayment = async (paymentId, amount = null) => {
  try {
    const refundData = {
      payment_id: paymentId,
    };

    if (amount) {
      refundData.amount = amount * 100; // amount in paise
    }

    const refund = await razorpay.payments.refund(paymentId, refundData);
    return {
      success: true,
      data: refund,
    };
  } catch (error) {
    console.error("Payment refund error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Process refund for an order with idempotency and comprehensive tracking
 * @param {Object} order - Order document with payment details
 * @param {Object} options - Refund options
 * @param {Number} options.amount - Custom refund amount (default: full order total)
 * @param {String} options.reason - Refund reason
 * @param {Boolean} options.deductShipping - Whether to deduct shipping charges
 * @param {String} options.initiatedBy - Who initiated the refund (admin/system/webhook)
 * @returns {Object} - Result with success status and refund details
 */
const processOrderRefund = async (order, options = {}) => {
  const {
    amount = null,
    reason = "Order cancellation",
    deductShipping = false,
    initiatedBy = "system",
  } = options;

  try {
    // Validate order exists
    if (!order) {
      return {
        success: false,
        error: "Order not found",
        code: "ORDER_NOT_FOUND",
      };
    }

    // Check if payment method is COD - no refund needed
    if (
      order.payment &&
      (order.payment.method === "cod" || order.payment.gateway === "cod")
    ) {
      console.log(`Order ${order.orderNumber} is COD - no refund needed`);
      return {
        success: true,
        isCOD: true,
        message: "COD order - no refund required",
        order: order,
      };
    }

    // Check if payment was actually made
    if (!order.payment || order.payment.status !== "paid") {
      console.log(
        `Order ${order.orderNumber} payment not completed - no refund needed`
      );
      return {
        success: true,
        notPaid: true,
        message: "Payment not completed - no refund needed",
        order: order,
      };
    }

    // Get Razorpay payment ID
    const paymentId = order.payment.razorpay?.paymentId;
    if (!paymentId) {
      return {
        success: false,
        error: "Razorpay payment ID not found",
        code: "PAYMENT_ID_MISSING",
      };
    }

    // Check for existing refund (idempotency)
    if (order.payment.refund) {
      const existingRefundStatus = order.payment.refund.status;

      // If refund already completed, return success
      if (existingRefundStatus === "completed") {
        console.log(`Order ${order.orderNumber} already refunded`);
        return {
          success: true,
          alreadyRefunded: true,
          message: "Refund already completed",
          refundId: order.payment.refund.refundId,
          order: order,
        };
      }

      // If refund is in progress, check status from Razorpay
      if (
        existingRefundStatus === "initiated" ||
        existingRefundStatus === "processing"
      ) {
        const refundId = order.payment.refund.refundId;
        if (refundId) {
          try {
            const refundStatus = await razorpay.refunds.fetch(refundId);

            if (refundStatus.status === "processed") {
              // Update order with completed refund
              order.payment.refund.status = "completed";
              order.payment.refund.completedAt = new Date();
              order.payment.status = "refunded";
              await order.save();

              return {
                success: true,
                message: "Refund already processed",
                refundId: refundId,
                order: order,
              };
            }
          } catch (fetchError) {
            console.error("Error fetching existing refund status:", fetchError);
          }
        }
      }

      // If previous refund failed, allow retry
      if (existingRefundStatus === "failed") {
        const hoursSinceLastAttempt = order.payment.refund.lastAttemptAt
          ? (Date.now() -
              new Date(order.payment.refund.lastAttemptAt).getTime()) /
            (1000 * 60 * 60)
          : 999;

        // Rate limiting: allow retry after 1 hour
        if (hoursSinceLastAttempt < 1) {
          return {
            success: false,
            error: "Refund retry too soon - wait at least 1 hour",
            code: "RETRY_TOO_SOON",
            lastAttempt: order.payment.refund.lastAttemptAt,
          };
        }
      }
    }

    // Calculate refund amount
    let refundAmount = amount;
    if (!refundAmount) {
      refundAmount = order.total;

      // Optionally deduct shipping charges
      if (deductShipping && order.shipping && order.shipping.cost) {
        refundAmount -= order.shipping.cost;
      }
    }

    // Validate refund amount
    if (refundAmount <= 0) {
      return {
        success: false,
        error: "Refund amount must be greater than zero",
        code: "INVALID_AMOUNT",
      };
    }

    if (refundAmount > order.total) {
      return {
        success: false,
        error: "Refund amount cannot exceed order total",
        code: "AMOUNT_EXCEEDS_TOTAL",
      };
    }

    // Initialize or update refund tracking
    if (!order.payment.refund) {
      order.payment.refund = {
        status: "initiated",
        amount: refundAmount,
        reason: reason,
        initiatedAt: new Date(),
        attempts: 1,
        lastAttemptAt: new Date(),
      };
    } else {
      order.payment.refund.status = "initiated";
      order.payment.refund.amount = refundAmount;
      order.payment.refund.reason = reason;
      order.payment.refund.attempts = (order.payment.refund.attempts || 0) + 1;
      order.payment.refund.lastAttemptAt = new Date();
      order.payment.refund.errorMessage = undefined; // Clear previous errors
    }

    await order.save();

    // Initiate Razorpay refund
    console.log(
      `Initiating refund for order ${order.orderNumber}: ₹${refundAmount} (Payment ID: ${paymentId})`
    );

    const refundResult = await refundPayment(paymentId, refundAmount);

    if (!refundResult.success) {
      // Update refund as failed
      order.payment.refund.status = "failed";
      order.payment.refund.failedAt = new Date();
      order.payment.refund.errorMessage = refundResult.error || "Unknown error";
      await order.save();

      return {
        success: false,
        error: refundResult.error || "Refund failed",
        code: "REFUND_FAILED",
        order: order,
      };
    }

    // Update order with successful refund
    const refundData = refundResult.data;
    order.payment.refund.status =
      refundData.status === "processed" ? "completed" : "processing";
    order.payment.refund.refundId = refundData.id;

    if (refundData.status === "processed") {
      order.payment.refund.completedAt = new Date();
      order.payment.status = "refunded";
    }

    // Add timeline entry
    await order.addTimelineEntry(
      "refunded",
      `Refund ${refundData.status}: ₹${refundAmount} - ${reason} (Initiated by: ${initiatedBy})`,
      null
    );

    await order.save();

    console.log(
      `Refund successful for order ${order.orderNumber}: Refund ID ${refundData.id}, Status: ${refundData.status}`
    );

    return {
      success: true,
      refundId: refundData.id,
      status: refundData.status,
      amount: refundAmount,
      message: "Refund initiated successfully",
      order: order,
    };
  } catch (error) {
    console.error("Process order refund error:", error);

    // Update order with error
    if (order && order.payment) {
      order.payment.refund = order.payment.refund || {};
      order.payment.refund.status = "failed";
      order.payment.refund.failedAt = new Date();
      order.payment.refund.errorMessage = error.message;
      order.payment.refund.attempts = (order.payment.refund.attempts || 0) + 1;
      order.payment.refund.lastAttemptAt = new Date();

      try {
        await order.save();
      } catch (saveError) {
        console.error("Error saving refund failure to order:", saveError);
      }
    }

    return {
      success: false,
      error: error.message || "Refund processing failed",
      code: "REFUND_EXCEPTION",
    };
  }
};

/**
 * Check refund status from Razorpay
 * @param {String} refundId - Razorpay refund ID
 * @returns {Object} - Refund status details
 */
const checkRefundStatus = async (refundId) => {
  try {
    const refund = await razorpay.refunds.fetch(refundId);
    return {
      success: true,
      data: refund,
    };
  } catch (error) {
    console.error("Check refund status error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPaymentSignature,
  getPaymentDetails,
  refundPayment,
  processOrderRefund,
  checkRefundStatus,
  razorpay,
};
