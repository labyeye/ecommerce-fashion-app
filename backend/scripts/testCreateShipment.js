#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI;

async function main() {
  const orderNumber = process.argv[2];
  if (!orderNumber) {
    console.error('Usage: node testCreateShipment.js <ORDER_NUMBER>');
    process.exit(2);
  }

  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const Order = require(path.join(__dirname, '..', 'models', 'Order'));
  const delhivery = require(path.join(__dirname, '..', 'services', 'delhiveryService'));

  const order = await Order.findOne({ orderNumber });
  if (!order) {
    console.error('Order not found:', orderNumber);
    process.exit(3);
  }

  console.log('Running createShipmentForOrder for', orderNumber);
  const result = await delhivery.createShipmentForOrder(order);

  console.log('\nResult:');
  console.log(JSON.stringify(result, null, 2));

  // Reload order to show saved shipment fields
  const fresh = await Order.findOne({ orderNumber }).lean();
  console.log('\nOrder.shipment after create attempt:');
  console.log(JSON.stringify(fresh.shipment || {}, null, 2));

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('testCreateShipment failed:', err && err.message ? err.message : err);
  process.exit(1);
});
