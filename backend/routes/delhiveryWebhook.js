const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const User = require("../models/User");
const { sendOrderCancellationEmail } = require("../utils/emailService");
const {
  handleShipmentCancellation,
} = require("../services/shipmentCancellationService");

// Simple mapping helper targeted at cancellation detection
function isCarrierStatusCancelled(status) {
  if (!status) return false;
  const s = String(status).toLowerCase();
  // common carrier cancellation indicators
  return (
    s.includes("cancel") ||
    s.includes("cancelled") ||
    s.includes("rto") ||
    s.includes("rejected") ||
    s.includes("rts") ||
    s.includes("returned")
  );
}

// Determine if cancellation happened before pickup
function isCancelledBeforePickup(status) {
  if (!status) return false;
  const s = String(status).toLowerCase();
  return (
    s.includes("pending") ||
    s.includes("scheduled") ||
    s.includes("not picked") ||
    (!s.includes("picked") && !s.includes("dispatched"))
  );
}

// Protect webhook with a simple secret header if configured
function verifySecret(req) {
  const secret = process.env.DELHIVERY_WEBHOOK_SECRET;
  if (!secret) return true; // no secret configured => accept
  const header =
    req.headers["x-delhivery-secret"] ||
    req.headers["x-webhook-secret"] ||
    req.headers["x-signature"];
  return header && String(header) === String(secret);
}

// POST /api/shipping/delhivery/webhook
router.post("/webhook", async (req, res) => {
  try {
    if (!verifySecret(req)) {
      console.warn("Delhivery webhook rejected due to missing/invalid secret");
      return res
        .status(401)
        .json({ success: false, message: "Invalid webhook secret" });
    }

    const payload = req.body || {};

    // Attempt to extract AWB and status from common shapes
    let awb = null;
    let status = null;

    if (payload.awb) awb = payload.awb;
    else if (payload.data && payload.data.awb) awb = payload.data.awb;
    else if (payload.package && payload.package.awb) awb = payload.package.awb;
    else if (
      Array.isArray(payload.packages) &&
      payload.packages[0] &&
      payload.packages[0].awb
    )
      awb = payload.packages[0].awb;

    if (payload.status) status = payload.status;
    else if (payload.current_status) status = payload.current_status;
    else if (payload.data && payload.data.current_status)
      status = payload.data.current_status;
    else if (
      Array.isArray(payload.packages) &&
      payload.packages[0] &&
      payload.packages[0].current_status
    )
      status = payload.packages[0].current_status;

    if (!awb) {
      console.warn("Delhivery webhook received without AWB", payload);
      return res.status(400).json({ success: false, message: "Missing AWB" });
    }

    const order = await Order.findOne({ "shipment.awb": String(awb) }).populate(
      "customer"
    );
    if (!order) {
      console.warn("Delhivery webhook AWB not found in orders:", awb);
      return res
        .status(404)
        .json({ success: false, message: "Order not found for AWB" });
    }

    // store raw response and last sync
    order.shipment = order.shipment || {};
    order.shipment.status = status || order.shipment.status;
    order.shipment.rawResponse = payload;
    order.shipment.lastSyncedAt = new Date();

    // If carrier indicates cancellation, handle with automatic refund
    if (isCarrierStatusCancelled(status)) {
      if (String(order.status) !== "cancelled") {
        console.log(
          `Delhivery webhook: Cancellation detected for order ${order.orderNumber} with status: ${status}`
        );

        // Determine if cancelled before pickup
        const cancelledBeforePickup = isCancelledBeforePickup(status);

        // Use comprehensive cancellation handler with automatic refund
        try {
          const cancellationResult = await handleShipmentCancellation(order, {
            reason: `Delhivery webhook: ${status}`,
            source: "delhivery_webhook",
            cancelledBeforePickup: cancelledBeforePickup,
            carrierData: {
              status: status,
              timestamp: new Date(),
              rawPayload: payload,
            },
          });

          if (cancellationResult.success) {
            console.log(
              `Order ${order.orderNumber} cancellation processed successfully via webhook`
            );

            // Log refund details
            if (cancellationResult.refundProcessed) {
              console.log(`Refund processed for order ${order.orderNumber}`);
            } else if (
              cancellationResult.refundResult &&
              cancellationResult.refundResult.isCOD
            ) {
              console.log(
                `Order ${order.orderNumber} is COD - no refund needed`
              );
            } else if (
              cancellationResult.refundResult &&
              cancellationResult.refundResult.notPaid
            ) {
              console.log(
                `Order ${order.orderNumber} payment not completed - no refund needed`
              );
            } else if (
              cancellationResult.refundResult &&
              !cancellationResult.refundResult.success
            ) {
              console.error(
                `Refund failed for order ${order.orderNumber}:`,
                cancellationResult.refundResult.error
              );
            }
          } else {
            console.error(
              `Cancellation processing failed for order ${order.orderNumber}:`,
              cancellationResult.error
            );
          }
        } catch (cancellationError) {
          console.error(
            "Error in shipment cancellation handler (webhook):",
            cancellationError
          );

          // Fallback: still cancel the order but log the error
          try {
            await order.updateStatus(
              "cancelled",
              `Shipment cancelled from Delhivery - ${status} (Refund processing failed: ${cancellationError.message})`
            );
            await order.addTimelineEntry(
              "cancelled",
              `Webhook cancellation processed with errors. Manual refund may be required.`
            );
          } catch (fallbackError) {
            console.error(
              "Error in fallback cancellation (webhook):",
              fallbackError
            );
          }
        }
      } else {
        // already cancelled - just log
        await order.addTimelineEntry(
          order.status,
          `Delhivery webhook: Order already cancelled, status received: ${status}`
        );
        console.log(
          `Delhivery webhook: Order ${order.orderNumber} already cancelled`
        );
      }
    } else {
      // For non-cancel events, add a carrier timeline entry
      await order.addTimelineEntry(
        order.status,
        `Delhivery webhook event: ${status || JSON.stringify(payload)}`
      );
      console.log(
        `Delhivery webhook: Status update for order ${order.orderNumber}: ${status}`
      );
    }

    await order.save();

    return res.json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (err) {
    console.error("Delhivery webhook error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal webhook error" });
  }
});

module.exports = router;
