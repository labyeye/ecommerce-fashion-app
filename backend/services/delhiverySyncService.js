const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
const { fetchTrackingForAwb } = require('./delhiveryService');
const { sendOrderPickedEmail } = require('../utils/emailService');

function mapCarrierStatusToOrderStatus(carrierStatus) {
  if (!carrierStatus) return null;
  const s = carrierStatus.toString().toLowerCase();
  if (s.includes('deliv') || s.includes('delivered')) return 'delivered';
  if (s.includes('out for') || s.includes('out_for') || s.includes('out_for_delivery') || s.includes('out for delivery')) return 'out_for_delivery';
  if (s.includes('picked') || s.includes('picked up') || s.includes('picked_up') || s.includes('handed over') || s.includes('awarded to rider') || s.includes('handed')) return 'picked';
  if (s.includes('packed') || s.includes('packed at') || s.includes('bagged')) return 'packed';
  if (s.includes('rto') || s.includes('return')) return 'cancelled';
  if (s.includes('cancel') || s.includes('rejected')) return 'cancelled';
  if (s.includes('in transit') || s.includes('transit') || s.includes('in_transit')) return 'in_transit';
  return 'in_transit';
}

async function syncOnce() {
  try {
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
    const orders = await Order.find({ 'shipment.awb': { $exists: true, $ne: '' }, status: { $nin: ['delivered', 'cancelled'] }, $or: [ { 'shipment.lastSyncedAt': { $exists: false } }, { 'shipment.lastSyncedAt': { $lt: thirtyMinsAgo } } ] });

    for (const order of orders) {
      try {
        const awb = order.shipment && order.shipment.awb;
        if (!awb) continue;
        const res = await fetchTrackingForAwb(awb);
        if (!res.success) continue;

        const data = res.data || {};
        let latestStatus = null;
        let lastEvent = null;
        if (data && data.packages && Array.isArray(data.packages) && data.packages[0]) {
          const pkg = data.packages[0];
          latestStatus = pkg.current_status || pkg.status || pkg.last_status;
          if (pkg.events && pkg.events.length) lastEvent = pkg.events[pkg.events.length - 1];
        } else if (data && data[awb]) {
          const pkg = data[awb];
          latestStatus = pkg.current_status || pkg.status;
          if (pkg.events && pkg.events.length) lastEvent = pkg.events[pkg.events.length - 1];
        } else if (data && data.data && Array.isArray(data.data) && data.data[0]) {
          const pkg = data.data[0];
          latestStatus = pkg.current_status || pkg.status || pkg.last_status || pkg.tracking_status;
        }

        const mapped = mapCarrierStatusToOrderStatus(latestStatus);

        // Update shipment raw and lastSyncedAt
        order.shipment.status = latestStatus || order.shipment.status;
        order.shipment.rawResponse = data;
        order.shipment.lastSyncedAt = new Date();

        const previousStatus = order.status;
        if (mapped && mapped !== order.status) {
          order.status = mapped;
          await order.addTimelineEntry(mapped, `Status updated from Delhivery: ${latestStatus || 'unknown'}`);

          // If newly marked as 'picked', send email to customer
          if (mapped === 'picked') {
            try {
              const customer = await User.findById(order.customer).select('email firstName');
              if (customer && customer.email) {
                await sendOrderPickedEmail(customer.email, customer.firstName || '', order);
              }
            } catch (emailErr) {
              console.error('Error sending picked email for order', order._id, emailErr);
            }
          }
        } else if (lastEvent) {
          await order.addTimelineEntry(order.status, `Carrier event: ${lastEvent.description || JSON.stringify(lastEvent)}`);
        }

        await order.save();
      } catch (inner) {
        console.error('Error syncing order', order._id, inner);
      }
    }

    return { success: true };
  } catch (err) {
    console.error('delhiverySyncService syncOnce error:', err);
    return { success: false, error: err };
  }
}

module.exports = { syncOnce };
