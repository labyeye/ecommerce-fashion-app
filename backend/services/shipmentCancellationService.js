const Order = require("../models/Order");
const { processOrderRefund } = require("./paymentService");
const {
  sendOrderCancellationEmail,
  sendRefundNotificationEmail,
} = require("../utils/emailService");

/**
 * Handle shipment cancellation with automatic refund processing
 * @param {Object} order - Order document
 * @param {Object} options - Cancellation options
 * @param {String} options.reason - Cancellation reason
 * @param {String} options.source - Cancellation source (delhivery_webhook, delhivery_sync, admin, etc.)
 * @param {Boolean} options.cancelledBeforePickup - Whether shipment was cancelled before pickup
 * @param {Object} options.carrierData - Additional carrier data (status, timestamp, etc.)
 * @param {Boolean} options.skipRefund - Skip refund processing (for testing or special cases)
 * @returns {Object} - Result with success status and details
 */
async function handleShipmentCancellation(order, options = {}) {
  const {
    reason = "Shipment cancelled by carrier",
    source = "delhivery_webhook",
    cancelledBeforePickup = false,
    carrierData = {},
    skipRefund = false,
  } = options;

  try {
    console.log(
      `Processing shipment cancellation for order ${order.orderNumber}`
    );

    // Check if order is already cancelled
    if (order.status === "cancelled") {
      console.log(`Order ${order.orderNumber} is already cancelled`);

      // Still process refund if not done yet
      if (
        !skipRefund &&
        order.payment &&
        order.payment.status === "paid" &&
        (!order.payment.refund ||
          order.payment.refund.status === "none" ||
          order.payment.refund.status === "failed")
      ) {
        const refundResult = await processOrderRefund(order, {
          reason: reason,
          deductShipping: cancelledBeforePickup ? false : true,
          initiatedBy: source,
        });

        return {
          success: true,
          alreadyCancelled: true,
          refundProcessed: refundResult.success,
          refundResult: refundResult,
          order: order,
        };
      }

      return {
        success: true,
        alreadyCancelled: true,
        message: "Order already cancelled",
        order: order,
      };
    }

    // Update shipment details
    order.shipment = order.shipment || {};
    order.shipment.cancelledAt = carrierData.timestamp || new Date();
    order.shipment.cancellationReason = reason;
    order.shipment.cancelledBeforePickup = cancelledBeforePickup;

    if (carrierData.status) {
      order.shipment.status = carrierData.status;
    }

    // Update order cancellation details
    order.cancelledAt = new Date();
    order.cancellationReason = reason;
    order.cancellationSource = source;

    // Update order status to cancelled
    await order.updateStatus(
      "cancelled",
      `Shipment cancelled: ${reason}`,
      null
    );

    // Add detailed timeline entry
    await order.addTimelineEntry(
      "cancelled",
      `Shipment cancelled via ${source}. Reason: ${reason}. ${
        cancelledBeforePickup
          ? "Cancelled before pickup."
          : "Cancelled after pickup."
      }`,
      null
    );

    // Restore product inventory
    for (const item of order.items) {
      try {
        const Product = require("../models/Product");
        await Product.findByIdAndUpdate(item.product, {
          $inc: { "stock.quantity": item.quantity },
        });
        console.log(
          `Restored ${item.quantity} units of product ${item.product} to inventory`
        );
      } catch (stockError) {
        console.error(
          `Error restoring stock for product ${item.product}:`,
          stockError
        );
      }
    }

    await order.save();

    // Send cancellation email to customer
    try {
      const User = require("../models/User");
      const customer = await User.findById(order.customer).select(
        "email firstName"
      );
      if (customer && customer.email) {
        await sendOrderCancellationEmail(
          customer.email,
          customer.firstName || "",
          order
        );
        console.log(`Cancellation email sent to ${customer.email}`);
      }
    } catch (emailError) {
      console.error("Error sending cancellation email:", emailError);
    }

    // Process refund if applicable
    let refundResult = null;
    if (!skipRefund) {
      refundResult = await processOrderRefund(order, {
        reason: reason,
        deductShipping: cancelledBeforePickup ? false : true, // Don't deduct shipping if cancelled before pickup
        initiatedBy: source,
      });

      if (
        refundResult.success &&
        !refundResult.isCOD &&
        !refundResult.notPaid
      ) {
        console.log(
          `Refund processed successfully for order ${order.orderNumber}`
        );

        // Send refund notification email
        try {
          const User = require("../models/User");
          const customer = await User.findById(order.customer).select(
            "email firstName"
          );
          if (customer && customer.email) {
            await sendRefundNotificationEmail(
              customer.email,
              customer.firstName || "",
              order,
              refundResult
            );
            console.log(`Refund notification email sent to ${customer.email}`);
          }
        } catch (emailError) {
          console.error("Error sending refund notification email:", emailError);
        }
      } else if (!refundResult.success) {
        console.error(
          `Refund processing failed for order ${order.orderNumber}:`,
          refundResult.error
        );

        // Add timeline entry for refund failure
        await order.addTimelineEntry(
          "cancelled",
          `Refund failed: ${refundResult.error}. Manual intervention may be required.`,
          null
        );
      }
    }

    return {
      success: true,
      message: "Shipment cancellation processed successfully",
      orderCancelled: true,
      refundProcessed: refundResult ? refundResult.success : false,
      refundResult: refundResult,
      order: order,
    };
  } catch (error) {
    console.error("Handle shipment cancellation error:", error);

    // Try to log error to order timeline
    try {
      await order.addTimelineEntry(
        order.status,
        `Cancellation processing error: ${error.message}`,
        null
      );
      await order.save();
    } catch (logError) {
      console.error("Error logging cancellation error to timeline:", logError);
    }

    return {
      success: false,
      error: error.message || "Cancellation processing failed",
      code: "CANCELLATION_EXCEPTION",
    };
  }
}

/**
 * Sync order status from Delhivery and handle cancellations
 * @param {String} awb - AWB/tracking number
 * @returns {Object} - Result with status sync details
 */
async function syncOrderStatusFromDelhivery(awb) {
  try {
    const axios = require("axios");
    const API_KEY =
      process.env.DELHIVERY_API_KEY ||
      "8976acf224d7787aed465acb1a436ff778c96b23";
    const TRACK_URL = "https://track.delhivery.com/api/v1/packages/json/";

    // Fetch tracking data from Delhivery
    const response = await axios.get(TRACK_URL, {
      headers: {
        Authorization: `Token ${API_KEY}`,
        Accept: "application/json",
      },
      params: {
        waybill: awb,
      },
    });

    if (
      !response.data ||
      !response.data.ShipmentData ||
      response.data.ShipmentData.length === 0
    ) {
      return {
        success: false,
        error: "No shipment data found",
        code: "NO_DATA",
      };
    }

    const shipmentData = response.data.ShipmentData[0];
    const shipment = shipmentData.Shipment || {};
    const status = shipment.Status?.Status || "";

    // Find order by AWB
    const order = await Order.findOne({ "shipment.awb": awb }).populate(
      "customer"
    );
    if (!order) {
      return {
        success: false,
        error: "Order not found for AWB",
        code: "ORDER_NOT_FOUND",
      };
    }

    // Update shipment details
    order.shipment = order.shipment || {};
    order.shipment.status = status;
    order.shipment.rawResponse = shipmentData;
    order.shipment.lastSyncedAt = new Date();
    await order.save();

    // Check if status indicates cancellation
    const statusLower = String(status).toLowerCase();
    const isCancelled =
      statusLower.includes("cancel") ||
      statusLower.includes("rto") ||
      statusLower.includes("returned") ||
      statusLower.includes("rejected") ||
      statusLower.includes("rts");

    if (isCancelled && order.status !== "cancelled") {
      console.log(
        `Order ${order.orderNumber} detected as cancelled from Delhivery sync`
      );

      // Determine if cancelled before pickup
      const cancelledBeforePickup =
        statusLower.includes("pending") ||
        statusLower.includes("scheduled") ||
        !statusLower.includes("picked") ||
        !statusLower.includes("dispatched");

      const result = await handleShipmentCancellation(order, {
        reason: `Delhivery status: ${status}`,
        source: "delhivery_sync",
        cancelledBeforePickup: cancelledBeforePickup,
        carrierData: {
          status: status,
          timestamp: new Date(),
        },
      });

      return {
        success: true,
        cancellationDetected: true,
        cancellationResult: result,
        order: order,
      };
    }

    return {
      success: true,
      message: "Status synced successfully",
      status: status,
      cancellationDetected: false,
      order: order,
    };
  } catch (error) {
    console.error("Sync order status from Delhivery error:", error);
    return {
      success: false,
      error: error.message || "Status sync failed",
      code: "SYNC_EXCEPTION",
    };
  }
}

/**
 * Bulk sync all pending/in-transit orders from Delhivery
 * @param {Object} options - Sync options
 * @param {Number} options.limit - Maximum orders to sync
 * @returns {Object} - Sync results summary
 */
async function bulkSyncOrdersFromDelhivery(options = {}) {
  const { limit = 100 } = options;

  try {
    // Find orders that are not delivered/cancelled and have AWB
    const orders = await Order.find({
      "shipment.awb": { $exists: true, $ne: null, $ne: "" },
      status: {
        $in: [
          "confirmed",
          "processing",
          "packed",
          "picked",
          "in_transit",
          "out_for_delivery",
          "shipped",
        ],
      },
    }).limit(limit);

    console.log(`Bulk syncing ${orders.length} orders from Delhivery`);

    const results = {
      total: orders.length,
      synced: 0,
      cancelled: 0,
      errors: 0,
      details: [],
    };

    for (const order of orders) {
      try {
        const syncResult = await syncOrderStatusFromDelhivery(
          order.shipment.awb
        );

        if (syncResult.success) {
          results.synced++;
          if (syncResult.cancellationDetected) {
            results.cancelled++;
          }
        } else {
          results.errors++;
        }

        results.details.push({
          orderNumber: order.orderNumber,
          awb: order.shipment.awb,
          result: syncResult,
        });

        // Rate limiting - wait 500ms between requests
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error syncing order ${order.orderNumber}:`, error);
        results.errors++;
        results.details.push({
          orderNumber: order.orderNumber,
          awb: order.shipment.awb,
          error: error.message,
        });
      }
    }

    console.log(
      `Bulk sync completed: ${results.synced}/${results.total} synced, ${results.cancelled} cancelled, ${results.errors} errors`
    );

    return {
      success: true,
      results: results,
    };
  } catch (error) {
    console.error("Bulk sync orders error:", error);
    return {
      success: false,
      error: error.message || "Bulk sync failed",
    };
  }
}

module.exports = {
  handleShipmentCancellation,
  syncOrderStatusFromDelhivery,
  bulkSyncOrdersFromDelhivery,
};
