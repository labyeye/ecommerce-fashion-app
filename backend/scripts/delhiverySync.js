require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const { fetchTrackingForAwb } = require('../services/delhiveryService');

const MONGODB_URI = process.env.MONGODB_URI;

async function connectDb() {
  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
}

function mapCarrierStatusToOrderStatus(carrierStatus) {
  if (!carrierStatus) return null;
  const s = carrierStatus.toString().toLowerCase();
  if (s.includes('deliv') || s.includes('delivered')) return 'delivered';
  if (s.includes('out for') || s.includes('out_for') || s.includes('out_for_delivery')) return 'out for delivery';
  if (s.includes('rto') || s.includes('return')) return 'rto';
  if (s.includes('cancel') || s.includes('rejected')) return 'cancelled';
  return 'in transit';
}

async function sync() {
  try {
    await connectDb();
    console.log('Connected to DB for Delhivery sync');

    // Find orders with a shipment AWB set
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
    const orders = await Order.find({ 'shipment.awb': { $exists: true, $ne: '' }, $or: [ { 'shipment.lastSyncedAt': { $exists: false } }, { 'shipment.lastSyncedAt': { $lt: thirtyMinsAgo } } ] });

    console.log(`Found ${orders.length} orders to sync`);
    for (const order of orders) {
      try {
        const awb = order.shipment.awb;
        const res = await fetchTrackingForAwb(awb);
        if (!res.success) {
          console.warn('Failed to fetch tracking for', awb, res.error);
          continue;
        }

        const data = res.data || {};
        // try a few common response shapes
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

        // Update order shipment and possibly order.status
        order.shipment.status = latestStatus || order.shipment.status;
        order.shipment.rawResponse = data;
        order.shipment.lastSyncedAt = new Date();

        if (mapped && mapped !== order.status) {
          // Update order status and timeline
          order.status = mapped;
          order.addTimelineEntry(mapped, `Status updated from Delhivery: ${latestStatus || 'unknown'}`);
        } else if (lastEvent) {
          order.addTimelineEntry(order.status, `Carrier event: ${JSON.stringify(lastEvent)}`);
        }

        await order.save();
        console.log(`Synced order ${order.orderNumber} (awb=${awb}) -> ${mapped || order.status}`);
      } catch (innerErr) {
        console.error('Error syncing order', order._id, innerErr);
      }
    }

    console.log('Delhivery sync complete');
    process.exit(0);
  } catch (err) {
    console.error('Delhivery sync fatal error:', err);
    process.exit(1);
  }
}

sync();
