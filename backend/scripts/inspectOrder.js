#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vitals';

async function main() {
  const orderNumber = process.argv[2];
  if (!orderNumber) {
    console.error('Usage: node inspectOrder.js <ORDER_NUMBER>');
    process.exit(2);
  }

  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Load the model
  const Order = require(path.join(__dirname, '..', 'models', 'Order'));

  const order = await Order.findOne({ orderNumber }).lean();
  if (!order) {
    console.error('Order not found:', orderNumber);
    process.exit(3);
  }

  console.log('Order summary for', orderNumber);
  console.log('  status:', order.status);
  console.log('  createdAt:', order.createdAt);
  console.log('  shipment.awb:', order.shipment && order.shipment.awb);
  console.log('  shipment.shipmentId:', order.shipment && order.shipment.shipmentId);
  console.log('  shipment.trackingUrl:', order.shipment && order.shipment.trackingUrl);
  console.log('  shipment.status:', order.shipment && order.shipment.status);

  console.log('\nTimeline entries (last 10):');
  if (Array.isArray(order.timeline) && order.timeline.length) {
    const last = order.timeline.slice(-10);
    last.forEach(t => {
      console.log(` - ${t.timestamp} | ${t.status} | ${t.message || ''}`);
    });
  } else {
    console.log('  (no timeline entries)');
  }

  console.log('\nShipment rawResponse (pretty JSON):');
  if (order.shipment && order.shipment.rawResponse) {
    try {
      console.log(JSON.stringify(order.shipment.rawResponse, null, 2));
    } catch (e) {
      console.log(String(order.shipment.rawResponse));
    }
  } else {
    console.log('  (no rawResponse stored on order.shipment)');
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('inspectOrder failed:', err && err.message ? err.message : err);
  process.exit(1);
});
